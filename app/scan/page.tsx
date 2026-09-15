"use client";

import { useState } from "react";

export default function ScanPage() {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handlePhoto(file: File | undefined) {
    if (!file) return;

    try {
      setIsLoading(true);

      const buffer = await file.arrayBuffer();

      const safeBlob = new Blob([buffer], {
        type: file.type || "image/jpeg",
      });

      const url = URL.createObjectURL(safeBlob);

      setPhotoUrl(url);
    } catch (error) {
      console.error("Could not read photo:", error);
      alert("We couldn't load that photo. Please try another one.");
    } finally {
      setIsLoading(false);
    }
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

            {isLoading && (
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

            <button
              type="button"
              className="mt-6 w-full rounded-2xl bg-stone-900 px-5 py-4 text-lg font-semibold text-white"
            >
              Help me understand this
            </button>

            <button
              type="button"
              onClick={() => setPhotoUrl(null)}
              className="mt-3 w-full px-5 py-3 text-sm font-semibold text-stone-500"
            >
              Choose a different photo
            </button>

          </div>
        )}

      </div>
    </main>
  );
}