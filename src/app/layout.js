import Navbar from "@/components/Navbar";
import "./globals.css";
import MusicPlayer from "@/components/MusicPlayer";
import Providers from "@/redux/Providers";
import TopProgressBar from "@/components/topProgressBar/TopProgressBar";
import SongsHistory from "@/components/SongsHistory";
import { Toaster } from "react-hot-toast";
import AuthProvider from "./AuthProvider";
import Script from "next/script";
import AppContent from "@/components/AppContent";

const brandTitle = "Zorofy – Your Music, Your Vibe";
export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")),
  title: brandTitle,
  description: "Discover and play Indian and international music on Zorofy.",
  applicationName: "Zorofy",
  icons: { icon: "/favicon.ico", shortcut: "/favicon.ico", apple: "/logo.png" },
  manifest: "/manifest.json",
  openGraph: {
    title: brandTitle,
    description: "Discover and play Indian and international music on Zorofy.",
    siteName: "Zorofy",
    type: "website",
    images: [{ url: "/logo.png", width: 1254, height: 1254, alt: "Zorofy" }],
  },
  twitter: { card: "summary_large_image", title: brandTitle, description: "Discover and play Indian and international music on Zorofy.", images: ["/logo.png"] },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-Z4FJ5T627Q"
      ></Script>
      <Script>
        {`
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-Z4FJ5T627Q');
  `}
      </Script>
      <body className="overflow-hidden">
        <Providers>
          <AuthProvider>
            <TopProgressBar />
            <SongsHistory />
            <Toaster />
            <AppContent>
              <Navbar />
              {children}
            </AppContent>
            <div className="fixed bottom-0 left-0 right-0 z-50 flex rounded-t-3 backdrop-blur-lg">
              <MusicPlayer />
            </div>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
