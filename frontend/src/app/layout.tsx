import type { Metadata } from "next";
import { Newsreader, Spline_Sans_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
});

const splineMono = Spline_Sans_Mono({
  subsets: ["latin"],
  variable: "--font-spline-mono",
});

export const metadata: Metadata = {
  title: "TaskFlow — Team Task Manager",
  description: "Collaborative task management for teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=switzer@400,500,600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${newsreader.variable} ${splineMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
