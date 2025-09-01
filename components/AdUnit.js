// components/AdUnit.js

"use client";
import { useEffect } from 'react';

const AdUnit = ({ slotId, adFormat = "auto", responsive = true }) => {
  useEffect(() => {
    // Check if the adsbygoogle array exists and push the ad request
    // This is the standard way to trigger ad display after the component mounts
    if (typeof window !== "undefined" && window.adsbygoogle) {
      window.adsbygoogle.push({});
    }
  }, []); // The empty dependency array ensures this effect runs only once after the initial render

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client="ca-pub-8017840986434846" // Replace with your AdSense publisher ID
      data-ad-slot={slotId}
      data-ad-format={adFormat}
      data-full-width-responsive={responsive ? "true" : "false"}
    ></ins>
  );
};

export default AdUnit;