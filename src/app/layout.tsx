import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "FomoTrade Journal", template: "%s · FomoTrade" },
  description: "A premium, AI-powered trading performance journal.",
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="id" suppressHydrationWarning><body>{children}</body></html>;
}
