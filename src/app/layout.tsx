import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import Sidebar from "@/components/Sidebar";

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StreamingPro Devices",
  description: "Panel de control de dispositivos StreamingPro",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={geist.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar />
            <main className="flex-1 ml-64">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
