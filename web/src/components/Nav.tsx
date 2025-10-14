"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "./ui";

const WalletButtons = dynamic(() => import('./WalletButtons'), {
    ssr: false,
    loading: () => <div className="w-64 h-10"></div>
});

export default function Nav() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    
    return (
        <header className="w-full backdrop-blur-sm sticky top-0 z-50" style={{ background: 'rgba(255, 255, 255, 0.95)', borderBottom: '2px solid var(--border)' }}>
            <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between gap-8">
                <Link href="/" className="flex items-center gap-3 flex-shrink-0">
                    <img src="/logo.png" alt="BlockShopy" className="h-12 w-auto" />
                </Link>
                
                <div className="flex-1 max-w-2xl mx-8">
                    <div className="relative">
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search for digital products..."
                            className="input-field pr-12"
                            onKeyDown={(e) => { if (e.key === "Enter" && query.trim()) router.push(`/explore?q=${encodeURIComponent(query)}`); }}
                        />
                        <button 
                            onClick={() => { if (query.trim()) router.push(`/explore?q=${encodeURIComponent(query)}`); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xl"
                        >
                            🔍
                        </button>
                    </div>
                </div>
                
                <WalletButtons />
            </div>
        </header>
    );
}


