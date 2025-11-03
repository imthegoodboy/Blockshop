"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "@wagmi/connectors";
import { Button } from "./ui";

export default function WalletButtons() {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <div className="flex items-center gap-3 flex-shrink-0 w-64 h-10"></div>;
    }

    return <WalletButtonsInner />;
}

function WalletButtonsInner() {
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const { connect } = useConnect();
    const { disconnect } = useDisconnect();

    return (
        <div className="flex items-center gap-3 flex-shrink-0">
            {isConnected ? (
                <>
                    <Button variant="outline" onClick={() => disconnect()}>
                        {address?.slice(0,6)}...{address?.slice(-4)}
                    </Button>
                    <Button onClick={() => router.push('/dashboard/seller')}>
                        Seller Dashboard
                    </Button>
                </>
            ) : (
                <>
                    <Button variant="outline" onClick={() => connect({ connector: injected() })}>
                        Connect Wallet
                    </Button>
                    <Button onClick={() => connect({ connector: injected() })}>
                        Become a Seller
                    </Button>
                </>
            )}
        </div>
    );
}
