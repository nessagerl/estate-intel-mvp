-- Release 4.2: Safe home and collection removal.
-- Run once before deploying Release 4.2. All mutations are atomic.
-- Existing assets, investigations and valuations are retained unless an explicit
-- "trash" choice soft-deletes the assets. Investigations are never deleted here.
CREATE OR REPLACE FUNCTION public.manage_inventory_container(
  p_user_id uuid, p_kind text, p_id bigint, p_action text, p_destination_id bigint DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n_assets integer; n_rooms integer; n_explorations integer; n_memberships integer;
BEGIN
  IF p_user_id IS NULL OR p_id IS NULL OR p_kind NOT IN ('home','collection')
     OR p_action NOT IN ('transfer','unassign','trash') THEN
    RAISE EXCEPTION 'Invalid operation';
  END IF;
  IF p_kind = 'home' THEN
    PERFORM 1 FROM public.homes WHERE id=p_id AND user_id=p_user_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Home not found'; END IF;
    IF p_action='transfer' THEN
      IF p_destination_id IS NULL OR p_destination_id=p_id OR NOT EXISTS
        (SELECT 1 FROM public.homes WHERE id=p_destination_id AND user_id=p_user_id)
      THEN RAISE EXCEPTION 'Choose another home you own'; END IF;
    END IF;
    SELECT count(*) INTO n_rooms FROM public.rooms WHERE home_id=p_id;
    SELECT count(*) INTO n_assets FROM public.assets WHERE user_id=p_user_id AND home_id=p_id AND deleted_at IS NULL;
    SELECT count(*) INTO n_explorations FROM public.investigations WHERE user_id=p_user_id AND home_id=p_id AND deleted_at IS NULL;
    IF p_action='trash' THEN
      UPDATE public.assets SET deleted_at=now(),home_id=NULL,room_id=NULL
      WHERE user_id=p_user_id AND home_id=p_id AND deleted_at IS NULL;
    ELSE
      UPDATE public.assets SET home_id=(CASE WHEN p_action='transfer' THEN p_destination_id ELSE NULL END),room_id=NULL
      WHERE user_id=p_user_id AND home_id=p_id;
    END IF;
    -- Explorations remain accessible; room links are removed when source rooms disappear.
    UPDATE public.investigations SET home_id=(CASE WHEN p_action='transfer' THEN p_destination_id ELSE NULL END),room_id=NULL
      WHERE user_id=p_user_id AND home_id=p_id;
    -- Also clear references to rooms in this home where home_id was unset.
    UPDATE public.assets SET room_id=NULL WHERE user_id=p_user_id AND room_id IN
      (SELECT id FROM public.rooms WHERE home_id=p_id);
    UPDATE public.investigations SET room_id=NULL WHERE user_id=p_user_id AND room_id IN
      (SELECT id FROM public.rooms WHERE home_id=p_id);
    UPDATE public.locations SET home_id=NULL WHERE user_id=p_user_id AND home_id=p_id;
    DELETE FROM public.homes WHERE id=p_id AND user_id=p_user_id;
    RETURN jsonb_build_object('success',true,'assets',n_assets,'rooms',n_rooms,'explorations',n_explorations);
  ELSE
    PERFORM 1 FROM public.collections WHERE id=p_id AND user_id=p_user_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Collection not found'; END IF;
    IF p_action='transfer' THEN
      IF p_destination_id IS NULL OR p_destination_id=p_id OR NOT EXISTS
        (SELECT 1 FROM public.collections WHERE id=p_destination_id AND user_id=p_user_id)
      THEN RAISE EXCEPTION 'Choose another collection you own'; END IF;
    END IF;
    SELECT count(*) INTO n_memberships FROM public.collection_assets WHERE collection_id=p_id;
    SELECT count(*) INTO n_assets FROM public.assets a JOIN public.collection_assets ca ON ca.asset_id=a.id
      WHERE ca.collection_id=p_id AND a.user_id=p_user_id AND a.deleted_at IS NULL;
    IF p_action='transfer' THEN
      INSERT INTO public.collection_assets(collection_id,asset_id)
      SELECT p_destination_id,ca.asset_id FROM public.collection_assets ca
      JOIN public.assets a ON a.id=ca.asset_id AND a.user_id=p_user_id
      WHERE ca.collection_id=p_id ON CONFLICT DO NOTHING;
    ELSIF p_action='trash' THEN
      -- Trash only assets exclusive to this collection. Shared items stay active.
      UPDATE public.assets a SET deleted_at=now()
      WHERE a.user_id=p_user_id AND a.deleted_at IS NULL
      AND a.id IN (SELECT asset_id FROM public.collection_assets WHERE collection_id=p_id)
      AND NOT EXISTS (SELECT 1 FROM public.collection_assets other
                      WHERE other.asset_id=a.id AND other.collection_id<>p_id);
    END IF;
    DELETE FROM public.collections WHERE id=p_id AND user_id=p_user_id;
    RETURN jsonb_build_object('success',true,'assets',n_assets,'memberships',n_memberships);
  END IF;
END; $$;
REVOKE ALL ON FUNCTION public.manage_inventory_container(uuid,text,bigint,text,bigint) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.manage_inventory_container(uuid,text,bigint,text,bigint) TO service_role;
NOTIFY pgrst, 'reload schema';
