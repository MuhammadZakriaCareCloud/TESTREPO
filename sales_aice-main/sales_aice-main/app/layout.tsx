import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
// import { Navbar } from "@/components/Nav

import Navbar from "@/components/Nav"
import BottomBanner from "@/components/BottomBanner";
import Footer from "@/components/Footer"
import { cn } from "@/utils";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/context/auth-context";
export const metadata: Metadata = {
  title: "SaleAice",
  description: "SaleAice Sale Service Company",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          GeistSans.variable,
          GeistMono.variable,
          "flex flex-col min-h-screen"
        )}
      >
        <AuthProvider>

          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            <BottomBanner />
            {children}
            <Toaster position="top-center" richColors={true} />
            <Footer />
          </ThemeProvider>
        </AuthProvider>

      </body>
    </html>
  );
}
