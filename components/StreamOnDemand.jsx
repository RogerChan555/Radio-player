"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const STREAM_ON_DEMAND = [
  {
    title: "Watch and Stream Christian Music from the past and today",
    link: "https://www.eternityready.com/music/",
    image: "/musicvideo.jpg",
    category: "Watch Now",
  },
  {
    title: "Hundreds of free Podcasts to encourage your faith",
    link: "https://podcasts.eternityready.com",
    image: "/podcasts-2.jpeg",
    category: "Listen Here",
  },
];

const StreamOnDemand = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1280); // Assuming 'md' is 1280px
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <section className="mx-auto w-full my-4 max-w-screen-2xl px-4 pb-8 md:mt-12 lg:px-8">
      <h3 className="mb-2 text-lg font-bold text-white md:mb-4 md:text-2xl">
        Stream On - Demand
      </h3>
      {isMobile ? (
        <Carousel
          opts={{
            dragFree: true,
          }}
        >
          <CarouselContent className="-ml-2">
            {STREAM_ON_DEMAND.map((item, index) => (
              <CarouselItem
                key={`carousel-new-this-week-slide-${index}`}
                className="p-0 ml-3 basis-1/4 min-h-full min-w-[300px] overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-lg transition-all duration-300 hover:bg-white/[.15] hover:shadow-2xl"
              >
                <a target="_blank" href={item.link} className="w-full">
                  <Image
                    alt={item.title}
                    loading="lazy"
                    width="356"
                    height="238"
                    className="w-full"
                    src={item.image}
                  />
                  <div className="p-5">
                    <h5 className="mb-2 font-bold text-white md:text-lg">
                      {item.title}
                    </h5>
                    <p className="text-sm leading-normal text-orange-400">
                      {item.category}
                    </p>
                  </div>
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {STREAM_ON_DEMAND.map((item, index) => (
            <a
              key={`new-this-week-item-${index}`}
              target="_blank"
              className="min-h-full w-full overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-lg transition-all duration-300 hover:bg-white/[.15] hover:shadow-2xl"
              href={item.link}
            >
              <Image
                alt={item.title}
                loading="lazy"
                width="356"
                height="238"
                className="w-full"
                src={item.image}
              />
              <div className="p-5">
                <h5 className="mb-2 font-bold text-white md:text-lg">
                  {item.title}
                </h5>
                <p className="text-sm leading-normal text-orange-400">
                  {item.category}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
};

export default StreamOnDemand;
