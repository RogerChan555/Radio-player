"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Fragment, useContext } from "react";
import { StationContext } from "@/context/station";
import TracksPlaceholder from "./tracks-placeholder";

const LastPlayed = () => {
  const { tracks, loadingTracks } = useContext(StationContext);

  return (
    <section className="mx-auto w-full my-4 max-w-screen-2xl px-4 md:mt-16 lg:px-8">
      <h3 className="mb-2 text-lg font-bold text-white md:mb-4 md:text-2xl">
        Last Played
      </h3>
      <Carousel
        opts={{
          dragFree: true,
        }}
      >
        <CarouselContent className="-ml-2">
          {!loadingTracks &&
            tracks.map((track, index) => {
              if (index === 0) {
                return;
              }
              return (
                <CarouselItem
                  key={`carousel-track-slide-${index}`}
                  className="p-0 mx-2 basis-1/4 min-w-[300px] max-h-[75px] md:max-h-[100px] overflow-hidden rounded-lg bg-white/5 border border-white/10 shadow-md shadow-black/[.1] transition-all duration-200 hover:bg-white/[.15] hover:shadow-lg"
                >
                  <a
                    target="_blank"
                    className="mb-4 flex w-full flex-1 items-center"
                    href={track.trackViewUrl || "#"}
                  >
                    <Image
                      alt={track?.trackName || "Last Played"}
                      loading="lazy"
                      width="100"
                      height="100"
                      className="flex aspect-square h-[75px] w-[75px] items-center justify-center rounded-l-sm md:h-[100px] md:w-[100px] md:rounded-l-lg"
                      src={track.artworkURL || track.artistImage}
                    />
                    <div className="mx-4 max-w-full">
                      <p className="text-sm font-bold text-white truncate line-clamp-2 whitespace-normal md:text-base">
                        {track.trackName}
                      </p>
                      <p className="text-sm text-white opacity-60 truncate line-clamp-2 whitespace-normal md:text-base">
                        {track.artistName}
                      </p>
                    </div>
                  </a>
                </CarouselItem>
              );
            })}
          {loadingTracks && (
            // Fallback for when no tracks are available
            <Fragment>
              <TracksPlaceholder />
              <TracksPlaceholder />
              <TracksPlaceholder />
              <TracksPlaceholder />
            </Fragment>
          )}
        </CarouselContent>
      </Carousel>
    </section>
  );
};

export default LastPlayed;
