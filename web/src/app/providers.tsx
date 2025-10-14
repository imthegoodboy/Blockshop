"use client";
import { ReactNode, useState } from "react";
import { WagmiConfig, createConfig, http } from "wagmi";
import { polygonAmoy } from "wagmi/chains";
import { injected } from "@wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const wagmiConfig = createConfig({
	chains: [polygonAmoy],
	transports: {
		[polygonAmoy.id]: http()
	},
	connectors: [injected()]
});

export default function Providers({ children }: { children: ReactNode }) {
	const [queryClient] = useState(() => new QueryClient());
	return (
		<QueryClientProvider client={queryClient}>
			<WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>
		</QueryClientProvider>
	);
}


