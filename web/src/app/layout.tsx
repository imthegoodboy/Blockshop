import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Nav from "../components/Nav";
import Chatbot from "../components/Chatbot";

export const metadata: Metadata = {
  title: "BlockShopy - Digital Marketplace",
  description: "Buy and sell digital products securely on the blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <Nav />
          {children}
          <Chatbot />
        </Providers>
      </body>
    </html>
  );
}
