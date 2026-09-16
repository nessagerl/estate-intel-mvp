"use client";

import { useState } from "react";

export default function ScanPage() {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [additionalPhotos, setAdditionalPhotos] = useState<string[]>([]);
  const [pendingPhoto, setPendingPhoto] = useState<string | null>(null);
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [followUpAnalysis, setFollowUpAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePhoto(file: File | undefined) {
    if (!file) return;

    try {
      setIsLoadingPhoto(true);
      setAnalysis(null);
      setError(null);

      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === "string") {
          setPhotoUrl(reader.result);
        }

        setIsLoadingPhoto(false);
      };

      reader.onerror = () => {
        setError("We couldn't load that photo. Please try another one.");
        setIsLoadingPhoto(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setError("We couldn't load that photo. Please try another one.");
      setIsLoadingPhoto(false);
    }
  }

function handleAdditionalPhoto(file: File | undefined) {
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    if (typeof reader.result === "string") {
      setPendingPhoto(reader.result);
    }
  };

  reader.onerror = () => {
    setError("We couldn't load that additional photo. Please try again.");
  };

  reader.readAsDataURL(file);
}

  async function analyzePhoto() {
    if (!photoUrl) return;

    try {
      setIsAnalyzing(true);
      setAnalysis(null);
      setError(null);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
        image: photoUrl,
        additionalImages: additionalPhotos,
      }),
      });

      const data = await response.json();

      console.log("AI DEBUG:", data.debug);

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Analysis failed.");
      }

      setAnalysis(data.analysis);
    } catch (err) {
      console.error(err);
      setError("We couldn't analyze this item. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }

async function investigateFurther() {
  if (!photoUrl || !pendingPhoto) return;

  try {
    setIsAnalyzing(true);
    setError(null);

    const photosForInvestigation = [
      ...additionalPhotos,
      pendingPhoto,
    ];

    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: photoUrl,
        additionalImages: photosForInvestigation,
        previousAnalysis: followUpAnalysis || analysis,
        mode: "followup",
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Follow-up investigation failed.");
    }

    setFollowUpAnalysis(data.analysis);

    // The new photo has now been successfully investigated,
    // so move it into the permanent evidence log.
    setAdditionalPhotos(photosForInvestigation);

    // Clear the waiting slot so it is ready for the next photo.
    setPendingPhoto(null);
  } catch (err) {
    console.error(err);
    setError("We couldn't investigate the new evidence. Please try again.");
  } finally {
    setIsAnalyzing(false);
  }
}

  function chooseDifferentPhoto() {
    setPhotoUrl(null);
    setAnalysis(null);
    setError(null);
  }

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-10 text-stone-900">
      <div className="mx-auto max-w-md">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
          Estate Intelligence
        </p>

        <h1 className="mt-4 text-4xl font-bold tracking-tight">
          What are you curious about?
        </h1>

        <p className="mt-5 text-lg leading-8 text-stone-600">
          Take a clear photo of something you own. We&apos;ll help you
          understand what may be interesting about it.
        </p>

        {!photoUrl && (
          <div className="mt-10 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-lg font-semibold">
              Start with one photo
            </p>

            <p className="mt-2 text-sm leading-6 text-stone-500">
              You can take a new photo or choose one you already have.
            </p>

            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                handlePhoto(event.currentTarget.files?.[0]);
              }}
              className="mt-6 block w-full text-sm text-stone-600"
            />

            {isLoadingPhoto && (
              <p className="mt-4 text-sm text-stone-500">
                Loading your photo...
              </p>
            )}
          </div>
        )}

        {photoUrl && (
          <div className="mt-8">
            <p className="mb-3 text-sm font-semibold text-stone-600">
              Your photo
            </p>

            <img
              src={photoUrl}
              alt="Item you selected"
              className="w-full rounded-2xl object-cover shadow-sm"
            />

            {additionalPhotos.length > 0 && (
  <div className="mt-6">
    <p className="mb-3 text-sm font-semibold text-stone-600">
      Investigation evidence
    </p>

    <div className="grid grid-cols-2 gap-3">
      {additionalPhotos.map((photo, index) => (
        <div key={index}>
          <img
            src={photo}
            alt={`Evidence photo ${index + 2}`}
            className="aspect-square w-full rounded-xl object-cover shadow-sm"
          />

          <p className="mt-2 text-xs font-semibold text-stone-500">
            Evidence photo {index + 2}
          </p>
        </div>
      ))}
    </div>
  </div>
)}

            {!analysis && (
              <button
                type="button"
                onClick={analyzePhoto}
                disabled={isAnalyzing}
                className="mt-6 w-full rounded-2xl bg-stone-900 px-5 py-4 text-lg font-semibold text-white disabled:opacity-50"
              >
                {isAnalyzing
                  ? "Looking closely..."
                  : "Help me understand this"}
              </button>
            )}

            {!isAnalyzing && (
              <button
                type="button"
                onClick={chooseDifferentPhoto}
                className="mt-3 w-full px-5 py-3 text-sm font-semibold text-stone-500"
              >
                Choose a different photo
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl bg-red-50 p-5 text-sm leading-6 text-red-700">
            {error}
          </div>
        )}

        {analysis && (
          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-stone-500">
              What we found
            </p>

            <div className="mt-4 whitespace-pre-wrap text-base leading-7 text-stone-700">
              {analysis}
            </div>
          </div>
        )}
        {followUpAnalysis && (
  <div className="mt-6 rounded-2xl border-2 border-stone-900 bg-white p-6 shadow-sm">
    <p className="text-sm font-semibold uppercase tracking-[0.15em] text-stone-500">
      Investigation update
    </p>

    <div className="mt-4 whitespace-pre-wrap text-base leading-7 text-stone-700">
      {followUpAnalysis}
    </div>
  </div>
)}
        {analysis && (
  <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
    <p className="text-lg font-semibold">
      Add a photo to investigate further
    </p>

    <p className="mt-2 text-sm leading-6 text-stone-500">
      Photograph a label, mark, signature, underside, tag, or other detail
      Estate Intelligence asked to see.
    </p>

    <input
      type="file"
      accept="image/*"
      onChange={(event) => {
        handleAdditionalPhoto(event.currentTarget.files?.[0]);
        event.currentTarget.value = "";
      }}
      className="mt-5 block w-full text-sm text-stone-600"
    />

    {additionalPhotos.length > 0 && (
      <p className="mt-4 text-sm font-semibold text-stone-600">
        {additionalPhotos.length} follow-up photo
        {additionalPhotos.length === 1 ? "" : "s"} added
      </p>
    )}

   {pendingPhoto && (
  <div className="mt-5">
    <p className="mb-2 text-sm font-semibold text-stone-600">
      New evidence ready
    </p>

    <img
      src={pendingPhoto}
      alt="New evidence waiting to be investigated"
      className="aspect-square w-full rounded-xl object-cover shadow-sm"
    />
  </div>
)}

    {pendingPhoto && (
  <button
    type="button"
    onClick={investigateFurther}
    disabled={isAnalyzing}
    className="mt-5 w-full rounded-2xl bg-stone-900 px-5 py-4 text-lg font-semibold text-white disabled:opacity-50"
  >
    {isAnalyzing
      ? "Investigating..."
      : "Investigate with new photos"}
  </button>
)}
  </div>
)}
      </div>
    </main>
  );
}