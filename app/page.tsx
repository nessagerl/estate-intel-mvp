import Link from "next/link";
export default function Home() {
  return (
    <main className="min-h-screen bg-stone-50 px-5 py-10 text-stone-900">
      <div className="mx-auto max-w-md">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
          Estate Intelligence
        </p>

        <h1 className="mt-4 text-4xl font-bold tracking-tight">
          Understand what you have. Find what you love.
        </h1>

        <p className="mt-5 text-lg leading-8 text-stone-600">
          A simple way to explore household belongings, discover interesting
          items, and get help when you need to handle an entire home.
        </p>

        <div className="mt-10 space-y-4">
          <button className="w-full rounded-2xl border border-stone-300 bg-white p-5 text-left shadow-sm">
            <div className="text-lg font-semibold">
              I need help with a home
            </div>
            <div className="mt-1 text-sm leading-6 text-stone-600">
              I&apos;m settling an estate, downsizing, moving, or clearing a
              household.
            </div>
          </button>

          <button className="w-full rounded-2xl border border-stone-300 bg-white p-5 text-left shadow-sm">
            <div className="text-lg font-semibold">
              I love finding interesting things
            </div>
            <div className="mt-1 text-sm leading-6 text-stone-600">
              Help me discover estate-sale items and categories I care about.
            </div>
          </button>

          <Link
  href="/scan"
  className="block w-full rounded-2xl border border-stone-300 bg-white p-5 text-left shadow-sm"
>
  <div className="text-lg font-semibold">
    I&apos;m curious about something I own
  </div>

  <div className="mt-1 text-sm leading-6 text-stone-600">
    Let me photograph an item and learn more about it.
  </div>
</Link>
        </div>
      </div>
    </main>
  );
}