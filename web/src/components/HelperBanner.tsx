"use client";
import { useEffect, useState } from "react";

export default function HelperBanner() {
	const [show, setShow] = useState(true);
	const needWalletConnect = !process.env.NEXT_PUBLIC_WALLETCONNECT_ID || process.env.NEXT_PUBLIC_WALLETCONNECT_ID === "demo";
	useEffect(() => {
		// Only show if helpful
		if (!needWalletConnect) setShow(false);
	}, [needWalletConnect]);
	if (!show) return null;
	return (
		<div className="w-full bg-yellow-100 text-yellow-900 text-sm px-4 py-2">
			<b>Tip:</b> Use Polygon Amoy testnet and set a real WalletConnect Project ID in <code>web/.env</code> for best experience.
		</div>
	);
}


