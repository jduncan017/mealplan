import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { Masthead } from "@/components/Masthead";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["SOFT", "opsz"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "May Meal Plan",
    template: "%s · May Meal Plan",
  },
  description: "Pregnancy meal planner for Josh and Emily. Dinners, soups, breakfasts, lunches, snacks, shopping lists, and Sunday prep.",
  openGraph: {
    title: "May Meal Plan",
    description:
      "Pregnancy meal planner for Josh and Emily. Dinners, soups, breakfasts, lunches, snacks, shopping lists, and Sunday prep.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "May Meal Plan",
    description:
      "Pregnancy meal planner for Josh and Emily.",
  },
  applicationName: "Meal Plan",
  appleWebApp: {
    capable: true,
    title: "Meal Plan",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf5ec" },
    { media: "(prefers-color-scheme: dark)", color: "#1a120a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased min-h-screen bg-background bg-grain text-foreground">
        <Masthead />
        <main className="mx-auto max-w-3xl px-4 pt-4 safe-bottom">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
