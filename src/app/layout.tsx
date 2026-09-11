import type { Metadata } from "next";
import { Syne, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const brand = Syne({
  subsets: ["latin"],
  variable: "--font-brand",
  weight: ["600", "700", "800"],
});

const body = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ChatImage — edição automática no ChatGPT Go",
  description:
    "Envie uma foto, escolha os efeitos e aplique no ChatGPT Go com um clique via extensão.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${brand.variable} ${body.variable}`}
      style={{ colorScheme: "dark" }}
    >
      <body suppressHydrationWarning className="font-body antialiased">
        {children}
      </body>
    </html>
  );
}
