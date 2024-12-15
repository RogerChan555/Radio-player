import Image from "next/image";
import { Fragment, useEffect, useState } from "react";

const MobileBanner = () => {
  const [bannerClosed, setBannerClosed] = useState(false);
  const [device, setDevice] = useState(null);

  useEffect(() => {
    // check if android or ios
    const isAndroid = /Android/i.test(navigator.userAgent);
    if (isAndroid) {
      setDevice("android");
    }
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isIOS) {
      setDevice("ios");
    }
  }, []);

  return (
    <Fragment>
      {!bannerClosed && device && (
        <div className="w-full flex items-center justify-between border-b border-white/10 bg-black/40 p-2 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setBannerClosed(true);
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-white fw-bold"
              >
                <path
                  d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                  fill="currentColor"
                  stroke="white"
                ></path>
              </svg>
            </button>
            <div className="flex">
              <Image
                alt="K-LOVE app icon"
                width="40"
                height="40"
                className="ml-2 mr-1 rounded-lg"
                src="/logo-square.png"
                style={{ color: "transparent" }}
              />
              <div>
                <p className="whitespace-nowrap px-2 text-sm font-bold text-white">
                  Eternity Ready App
                </p>
                <p className="px-2 text-sm text-white/60">
                  On the {device == "android" ? "Google Play" : "App Store"}
                </p>
              </div>
            </div>
          </div>
          <a
            target="_blank"
            className="rounded-full bg-white px-3 py-1 text-sm font-bold text-black"
            href={
              device == "android"
                ? "https://play.google.com/store/apps/details?id=com.wRaptureReadyEndTimesNewsProphecyDoctrineofPreTribRapture"
                : "https://apps.apple.com/us/app/rapture-ready/id6504677632"
            }
          >
            Visit
          </a>
        </div>
      )}
    </Fragment>
  );
};

export default MobileBanner;
