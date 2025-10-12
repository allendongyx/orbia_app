import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import DefaultLayout from "@/components/layout/default-layout";
import { AuthProvider } from "@/contexts/auth-context";
import { GlobalLoading } from "@/components/layout/global-loading";
import Intercom from "@intercom/messenger-js-sdk";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Orbia - Web3 Marketing Platform",
  description: "Decentralized marketing platform for Web3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  Intercom({
    app_id: "txdg4m0a",
  });
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <GlobalLoading />
          <DefaultLayout>{children}</DefaultLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
