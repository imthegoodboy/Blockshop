"use client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Signing in...");
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      if (res.ok) {
        setStatus("Success! Redirecting...");
        window.location.href = "/";
      } else {
        const t = await res.text();
        setStatus(t || "Login failed");
      }
    } catch (e: any) {
      setStatus(e?.message || "Login failed");
    }
  }

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Sign in</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {status && <div className="text-sm text-muted-foreground">{status}</div>}
        <button type="submit" className="w-full bg-black text-white rounded px-4 py-2">Sign in</button>
      </form>
      <div className="text-sm mt-3">No account? <a href="/auth/signup" className="underline">Create one</a></div>
    </div>
  );
}
