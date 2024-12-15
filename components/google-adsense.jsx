"use client";

import Script from "next/script";

const GoogleAdsense = ({ pId }) => {
  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${pId}`}
      strategy="lazyOnload"
      crossOrigin="anonymous"
    />
  );
};

export default GoogleAdsense;
