import type { Metadata } from "next";
import Nav from "@/app/components/nav";
import AuthGate from "@/app/components/auth-gate";
import "./globals.css";
export const metadata:Metadata={title:"Estate Intelligence",description:"Understand what you have. Find what you love."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body className="min-h-screen bg-[#f8f6f0] text-[#172c42]"><Nav/><AuthGate>{children}</AuthGate></body></html>}
