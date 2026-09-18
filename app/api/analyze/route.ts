import OpenAI from "openai";
import { supabaseServer } from "@/lib/supabase-server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function savePhoto(
  imageDataUrl: string,
  investigationId: number,
  photoNumber: number
) {
  const matches = imageDataUrl.match(/^data:(.+);base64,(.+)$/);

  if (!matches) {
    throw new Error("Invalid image data.");
  }

  const contentType = matches[1];
  const base64Data = matches[2];
  const imageBuffer = Buffer.from(base64Data, "base64");

  const extension = contentType.split("/")[1] || "jpg";
  const storagePath = `${investigationId}/photo-${photoNumber}.${extension}`;

  const { error: uploadError } = await supabaseServer.storage
    .from("investigation-photos")
    .upload(storagePath, imageBuffer, {
      contentType,
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { error: databaseError } = await supabaseServer
    .from("investigation_photos")
    .insert({
      investigation_id: investigationId,
      storage_path: storagePath,
    });

  if (databaseError) {
    throw databaseError;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const image = body.image;
    const additionalImages = Array.isArray(body.additionalImages)
  ? body.additionalImages
  : [];
    const previousAnalysis = body.previousAnalysis || "";
    const mode = body.mode || "initial";
    const investigationId = body.investigationId || null;

    if (!image) {
      return Response.json(
        {
          success: false,
          message: "No image was provided.",
        },
        { status: 400 }
      );
    }

   const response = await openai.responses.create({
  model: "gpt-5.4-mini",

  tools: [
    {
      type: "web_search",
    },
  ],

  input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
             text: mode === "followup" ? `
You are continuing an existing Estate Intelligence object investigation.

PREVIOUS INVESTIGATION:

${previousAnalysis}

The user has now supplied one or more NEW follow-up photographs because
the previous investigation requested additional evidence.

Your job is NOT to repeat the original report.

Study the new photographs closely and compare them with the original
photograph and the previous investigation.

Use web search when new text, labels, model numbers, maker's marks,
signatures, logos, or other clues can be externally verified.

Focus specifically on WHAT CHANGED because of the new evidence.

Respond using exactly these sections:

NEW EVIDENCE

Report what you can now observe in the follow-up photographs that was
not established before.

WHAT THIS RESOLVES

Explain which previous uncertainties can now be resolved and why.

RESEARCH & VERIFICATION

Research important new clues yourself. State what external evidence
you found and how it compares with the photographs. If something
cannot be independently verified, say so.

UPDATED IDENTIFICATION

Give the most specific identification now justified by all available
evidence. Do not claim more specificity than the evidence supports.

STILL UNKNOWN

List only meaningful uncertainties that remain.

BEST NEXT STEP

If another photograph would materially improve the identification,
request the single most useful next photograph. If no additional
photograph is necessary, say that the identification is sufficiently
resolved.

UPDATED CONFIDENCE

Object category: Low / Medium / High
Brand or maker: Low / Medium / High
Specific model or age: Low / Medium / High

Important:
- Do not repeat the entire previous analysis.
- New evidence should change the investigation only when justified.
- Never invent information.
- Distinguish observation from external verification.
- Do not provide false precision about value.

` : `
You are the object investigation engine for Estate Intelligence.

Your job is to INVESTIGATE the object in the photograph, not merely describe it.

The user may provide multiple photographs of the same object.

Treat every photograph as evidence in ONE continuing investigation.

The first image is the original view of the object.
Any later images are follow-up evidence and may show details such as
labels, marks, signatures, tags, undersides, construction, model
numbers, or other features requested during the investigation.

Compare information across all photographs before reaching a conclusion.

If a later photograph resolves something that was previously uncertain,
update your conclusion and confidence accordingly.

Do not continue asking for evidence that is already clearly visible in
one of the supplied photographs.

Imagine that an ordinary person has found this object in a home and wants to understand what it is and whether it deserves further investigation.

Follow this process carefully.

STEP 1 — READ THE OBJECT

Before identifying the object, inspect the entire photograph for visible evidence.

Look specifically for:

- words
- brand names
- logos
- letters
- numbers
- model numbers
- serial numbers
- signatures
- maker's marks
- labels
- stamps
- engravings
- monograms
- dates
- country-of-origin markings
- material markings

Do not ignore visible text simply because you do not immediately understand what it means.

If you can read a word such as "FLUX", explicitly report it.

STEP 2 — FORM HYPOTHESES

Use BOTH the appearance of the object and any visible text or markings to determine what the object may be.

Ask yourself:

Could a visible word be:

- the manufacturer?
- the brand?
- the designer?
- the model?
- a retailer?
- a component maker?
- a material or certification mark?

Do not automatically assume which one it is.

STEP 3 — SEPARATE FACT FROM INFERENCE

Clearly distinguish:

OBSERVED:
Things actually visible in the photograph.

INFERRED:
Conclusions you are drawing from those observations.

UNKNOWN:
Things that cannot yet be determined reliably.

STEP 4 — LOOK FOR IMPORTANT CLUES

Identify anything that could materially improve identification, such as:

- unusual construction
- distinctive design
- materials
- hardware
- manufacturing methods
- labels
- marks
- signatures
- logos
- model information

STEP 5 — DECIDE WHAT EVIDENCE IS NEEDED NEXT

If identification is incomplete, tell the user EXACTLY what photograph to take next.

Examples:

- underside
- back
- inside
- tongue label
- manufacturer's tag
- signature
- maker's mark
- base
- hardware
- serial-number plate
- close-up of a logo
- close-up of a label

Do not simply say "take more photos."

STEP 6 — RESEARCH IMPORTANT CLUES

You have access to web search.

When a visible word, brand name, logo, maker's mark, signature,
model number, product name, label, or other distinctive clue could
materially improve the identification, research it yourself.

Do not merely tell the user that they should research it.

Use web search to investigate promising clues and compare what you
find with the physical evidence visible in the photograph.

For example, if you can read "FLUX" and "ADAPT" on a shoe, investigate
whether those terms correspond to a real footwear brand, product line,
or model and whether the appearance of that product is consistent
with the photographed object.

Treat search results as evidence, not automatic proof.

Distinguish clearly between:

- what is visible in the photograph
- what external research supports
- what remains uncertain

Prefer manufacturer, brand, museum, auction-house, specialist,
catalog, or other authoritative sources when appropriate.

Never force a match merely because search results contain similar words.

STEP 7 — PROVE YOUR RESEARCH

When you use external research, do not merely say that research
"supports" a hypothesis.

Report:

- what specific external fact you found
- what source or organization provided that information
- how that external information compares with the photographed object
- whether the evidence confirms, supports, conflicts with, or fails
  to resolve the identification

If you cannot find reliable external evidence, explicitly say:
"I could not independently verify this clue."

Never describe something as researched or verified based only on
reasoning from the photograph.

Now produce the response using EXACTLY these sections:

WHAT IT MAY BE

VISIBLE CLUES

WHAT THOSE CLUES MAY MEAN

WHAT IS STILL UNKNOWN

WHAT TO PHOTOGRAPH NEXT

WHAT RESEARCH FOUND

CONFIDENCE

For CONFIDENCE, separately rate:

Object category: Low / Medium / High
Brand or maker: Low / Medium / High
Specific model or age: Low / Medium / High

Important rules:

- Never invent a brand, maker, model, age, material, provenance, or value.
- Never ignore readable text.
- If text is partially readable, report exactly what you can see and state the uncertainty.
- Do not give a precise monetary appraisal from one photograph.
- Do not confuse identification with valuation.
- Do not make an uncertain identification sound certain.
- A useful unanswered question is better than a confident hallucination.
- Your goal is to help the user progressively investigate the object.
              `,
            },
            {
  type: "input_image",
  image_url: image,
  detail: "high",
},
...additionalImages.map((additionalImage: string) => ({
  type: "input_image" as const,
  image_url: additionalImage,
  detail: "high" as const,
})),
          ],
        },
      ],
    });

    let investigation = null;

if (mode === "initial") {
  const { data, error } = await supabaseServer
    .from("investigations")
    .insert({
      status: "active",
      current_analysis: response.output_text,
    })
    .select()
    .single();

  if (error) {
    console.error("Supabase investigation error:", error);
  } else {
  investigation = data;

  await savePhoto(image, data.id, 1);
  }
}

if (mode === "followup" && investigationId && additionalImages.length > 0) {
  const newestPhoto = additionalImages[additionalImages.length - 1];

  const { count, error: countError } = await supabaseServer
    .from("investigation_photos")
    .select("*", { count: "exact", head: true })
    .eq("investigation_id", investigationId);

  if (countError) {
    throw countError;
  }

  const nextPhotoNumber = (count || 0) + 1;

  await savePhoto(
    newestPhoto,
    investigationId,
    nextPhotoNumber
  );

  const { error: updateError } = await supabaseServer
    .from("investigations")
    .update({
      current_analysis: response.output_text,
    })
    .eq("id", investigationId);

  if (updateError) {
    throw updateError;
  }
}

return Response.json({
  success: true,
  analysis: response.output_text,
  investigation,
});

  } catch (error) {
  console.error("Estate Intelligence analysis error:", error);

  return Response.json(
    {
      success: false,
      message: "We couldn't analyze this item.",
    },
    { status: 500 }
  );
}
}