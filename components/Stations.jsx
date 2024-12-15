"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { PlayerContext } from "@/context/player";
import { StationContext } from "@/context/station";

const Stations = () => {
  const router = useRouter();

  const {
    station: currentStation,
    setStation,
    stationsList,
  } = useContext(StationContext);

  const { player, setPlayerIsLoaded } = useContext(PlayerContext);

  return (
    <section className="mx-auto w-full my-4 max-w-screen-2xl px-4 md:mt-16 lg:px-8">
      <h3 className="text-lg font-bold text-white mb-2 md:mb-4 md:text-2xl">
        Stations
      </h3>
      <Carousel
        opts={{
          dragFree: true,
        }}
      >
        <CarouselContent className="ml-0">
          {stationsList.map((station, index) => (
            <CarouselItem
              key={`carousel-track-slide-${index}`}
              className={`p-1 mx-1 flex-auto aspect-square min-w-16 max-w-16 md:p-2 md:min-w-40 md:max-w-40 md:mx-3 overflow-hidden rounded-xl transition-all duration-200 md:rounded-2xl hover:bg-white/[.15] hover:shadow-2xl ${
                station.id === (currentStation?.id || null)
                  ? "animate-pulse-slow border-2 border-custom-primary"
                  : ""
              }`}
            >
              <div
                className="block h-full w-full flex-none cursor-pointer"
                onClick={async () => {
                  setStation(null);
                  setPlayerIsLoaded(true);
                  await player.switchEndpoint();
                  router.push(`/${station.refUrl}`, undefined, {
                    shallow: true,
                  });
                }}
              >
                <Image
                  alt={station.name}
                  loading="lazy"
                  width="144"
                  height="144"
                  className="flex aspect-square h-full w-full items-center justify-center rounded-md"
                  src={station.thumbnail}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
};

export default Stations;
