import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/ui/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RealCo OS | Market Intelligence",
  description: "Enterprise operating system for real estate intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-[#fcfcfc]`}>
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-64 min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
