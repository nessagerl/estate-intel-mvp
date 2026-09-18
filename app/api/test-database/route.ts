import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  const { data, error } = await supabaseServer
    .from("investigations")
    .insert({
      status: "active",
      current_analysis: "Database connection test",
    })
    .select()
    .single();

  if (error) {
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }

  return Response.json({
    success: true,
    investigation: data,
  });
}