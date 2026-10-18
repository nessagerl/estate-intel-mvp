import type { Metadata } from "next";
import Nav from "@/app/components/nav";
import "./globals.css";
export const metadata:Metadata={title:"Estate Intelligence",description:"Understand what you have. Find what you love."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body className="min-h-screen bg-stone-50 text-stone-900"><Nav/>{children}</body></html>}
