import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { StationProvider } from "@/context/station";
import { PlayerProvider } from "@/context/player";

import StationContainer from "@/components/station-container";
import Stations from "@/components/Stations";
import LastPlayed from "@/components/LastPlayed";
import StreamOnDemand from "@/components/StreamOnDemand";
import NewThisWeek from "@/components/NewThisWeek";
import Footer from "@/components/Footer";

import "@/styles/globals.css";
import Advertisements from "@/components/advertisements";
import GoogleAdsense from "@/components/google-adsense";
import UpNext from "@/components/up-next";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Eternity Ready Radio Player",
  description: "Eternity Ready Radio Player",
};

export default function RootLayout({ children }) {
  const adminRequestHeaders = headers().get("admin-url");

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={inter.className}>
        {adminRequestHeaders ? (
          [children]
        ) : (
          <main>
            <StationProvider>
              <PlayerProvider>
                <main className="bg-[#121212] flex flex-col items-center">
                  <StationContainer />
                  <Stations />
                  <LastPlayed />
                  <StreamOnDemand />
                  <UpNext />
                  <Advertisements />
                  {/* <NewThisWeek /> */}
                </main>
                <Footer />
              </PlayerProvider>
            </StationProvider>
          </main>
        )}
      </body>
      <GoogleAdsense pId="8022147088754346" />
    </html>
  );
}
