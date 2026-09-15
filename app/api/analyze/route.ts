import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST() {
  try {
    const response = await openai.responses.create({
      model: "gpt-5.4-mini",
      input: "Reply with exactly: Estate Intelligence AI is connected.",
    });

    return Response.json({
      success: true,
      message: response.output_text,
    });
  } catch (error) {
    console.error("OpenAI error:", error);

    return Response.json(
      {
        success: false,
        message: "The AI connection failed.",
      },
      { status: 500 }
    );
  }
}