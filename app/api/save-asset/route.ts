import { supabaseServer } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const investigationId = body.investigationId;

    if (!investigationId) {
      return Response.json(
        {
          success: false,
          message: "No investigation ID was provided.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("assets")
      .insert({
        investigation_id: investigationId,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return Response.json({
      success: true,
      asset: data,
    });
  } catch (error) {
    console.error("Save asset error:", error);

    return Response.json(
      {
        success: false,
        message: "We couldn't save this item.",
      },
      { status: 500 }
    );
  }
}