import type { Metadata } from "next";
import { Archivo } from 'next/font/google'
import "./globals.css";
import { MobileMenuProvider } from "@/components/MobileMenuContext";
import Nav from "@/components/Nav";

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-archivo',
})

export const metadata: Metadata = {
  title: "Exstasia Studio | Anastasia Jorgusheska | Photography",
  description: "Photography Portfolio for Anastasia Jorgusheska (Exstasia Studio) featuring Portrait, Editorial, Campaign, and Events photography.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
          className={`${archivo.variable} font-sans`}
      >
        <MobileMenuProvider>
          <Nav />
          {children}
        </MobileMenuProvider>
      </body>
    </html>
  );
}
