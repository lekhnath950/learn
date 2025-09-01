// import "./globals.css";
import "../styles/globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Script from "next/script"; // <-- Import the Script component

export const metadata = {
  metadataBase: new URL("https://learn.khelira.com"),
  title: {
    default: "Learn @ Khelira — Courses & Tutorials",
    template: "%s | Learn Khelira",
  },
  description:
    "Learn @ Khelira — a platform to explore web development, programming, and other tech courses.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Learn @ Khelira — Courses & Tutorials",
    description:
      "Explore modern web development, programming, and tech courses at Learn Khelira.",
    url: "https://learn.khelira.com",
    siteName: "Learn Khelira",
    images: [{ url: "/logo.svg", width: 256, height: 256 }],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main id="main" className="container">{children}</main>
        <Footer />
      
        <Script
          async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8017840986434846"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}