"use client";
import { useState } from "react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Creating account...");
    try {
      const res = await fetch("/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      if (res.ok) {
        setStatus("Success! You can sign in now.");
        window.location.href = "/auth/login";
      } else {
        const t = await res.text();
        setStatus(t || "Signup failed");
      }
    } catch (e: any) {
      setStatus(e?.message || "Signup failed");
    }
  }

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Create account</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {status && <div className="text-sm text-muted-foreground">{status}</div>}
        <button type="submit" className="w-full bg-black text-white rounded px-4 py-2">Sign up</button>
      </form>
      <div className="text-sm mt-3">Already have an account? <a href="/auth/login" className="underline">Sign in</a></div>
    </div>
  );
}
