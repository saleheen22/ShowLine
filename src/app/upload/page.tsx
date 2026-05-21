"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { db } from "@/lib/db";
import { Wordmark } from "@/components/Wordmark";

export default function UploadPage() {
  const ui = db.ui_strings;
  const router = useRouter();
  const [reading, setReading] = useState(false);
  const [filename, setFilename] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function onFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFilename(file.name);
    setReading(true);
    setTimeout(() => {
      router.push("/confirm");
    }, 5000);
  }

  if (reading) {
    return (
      <main className="min-h-screen bg-stone-50 px-6 py-10">
        <div className="mx-auto max-w-md">
          <Wordmark subtle />
          <div className="mt-10 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="relative mx-auto h-64 w-48 overflow-hidden rounded-md border border-stone-300 bg-stone-100">
              <div className="absolute inset-x-0 top-3 mx-3 space-y-1.5">
                <div className="h-1.5 w-3/4 rounded bg-stone-300" />
                <div className="h-1 w-1/2 rounded bg-stone-300" />
                <div className="mt-4 h-1 w-full rounded bg-stone-200" />
                <div className="h-1 w-5/6 rounded bg-stone-200" />
                <div className="h-1 w-full rounded bg-stone-200" />
                <div className="h-1 w-4/6 rounded bg-stone-200" />
                <div className="mt-3 h-1 w-full rounded bg-stone-200" />
                <div className="h-1 w-3/4 rounded bg-stone-200" />
                <div className="h-1 w-full rounded bg-stone-200" />
                <div className="h-1 w-5/6 rounded bg-stone-200" />
                <div className="mt-3 h-1 w-full rounded bg-stone-200" />
                <div className="h-1 w-2/3 rounded bg-stone-200" />
                <div className="h-1 w-full rounded bg-stone-200" />
              </div>
              <div className="absolute inset-x-0 top-0 h-1 bg-green-600/70 shadow-[0_0_12px_2px_rgba(22,163,74,0.6)] sarah-sweep" />
            </div>
            {filename && (
              <div className="mt-4 truncate text-center font-mono text-[11px] text-stone-500">
                {filename}
              </div>
            )}
            <p className="mt-2 text-center text-sm text-stone-700">
              {ui.sarah_reading}
            </p>
            <div className="mt-3 flex items-center justify-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-700" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-700 [animation-delay:200ms]" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-700 [animation-delay:400ms]" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10">
      <div className="mx-auto max-w-md">
        <header className="mb-8 flex items-center justify-between">
          <Wordmark subtle />
          <Link
            href="/"
            className="text-sm text-stone-500 hover:text-stone-800"
          >
            ← Back
          </Link>
        </header>

        <h2 className="font-serif text-2xl text-stone-900">Upload your quote</h2>
        <p className="mt-2 text-sm text-stone-600">{ui.upload_helper}</p>

        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onFileChosen}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf,.pdf,.jpg,.jpeg,.png,.heic"
          onChange={onFileChosen}
          className="hidden"
        />

        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            className="flex w-full items-center justify-between rounded-lg bg-green-800 px-5 py-5 text-left text-white shadow-sm transition hover:bg-green-900 active:bg-green-950"
          >
            <div>
              <div className="text-base font-semibold">Take a photo</div>
              <div className="text-xs text-green-100/90">
                Snap your MFA or co-op quote
              </div>
            </div>
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center justify-between rounded-lg border border-stone-300 bg-white px-5 py-5 text-left text-stone-800 shadow-sm hover:bg-stone-100"
          >
            <div>
              <div className="text-base font-semibold">Upload a file</div>
              <div className="text-xs text-stone-500">PDF, JPG, or email forward</div>
            </div>
            <svg
              className="h-6 w-6 text-stone-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
          </button>
        </div>

        <div className="mt-10 rounded-md bg-stone-100 p-4 text-xs text-stone-600">
          <strong className="block text-stone-800">Your quote stays private.</strong>
          We never share your line items with suppliers. Peer comparisons are anonymized and grouped (minimum 5 farms).
        </div>
      </div>
    </main>
  );
}
