"use client";

import { useState } from "react";

export default function ScanPage() {
  const [status, setStatus] = useState("Waiting...");

  return (
    <main style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>iPhone File Test</h1>

      <p
        style={{
          padding: "15px",
          background: "#eee",
          marginBottom: "20px",
        }}
      >
        Status: {status}
      </p>

      <input
  type="file"
  accept="image/*"
  onClick={() => {
    setStatus("File button tapped.");
  }}
  onChange={(event) => {
    const file = event.currentTarget.files?.[0];

    if (file) {
      setStatus(`CHANGE fired: ${file.name}`);
    } else {
      setStatus("CHANGE fired, but no file returned.");
    }
  }}
  onInput={(event) => {
    const file = event.currentTarget.files?.[0];

    if (file) {
      setStatus(`INPUT fired: ${file.name}`);
    } else {
      setStatus("INPUT fired, but no file returned.");
    }
  }}
/>
    </main>
  );
}