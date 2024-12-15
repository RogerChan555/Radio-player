"use client";

import Image from "next/image";
import Link from "next/link";
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import AutoHeight from "embla-carousel-auto-height";
import { DotFilledIcon, DotIcon } from "@radix-ui/react-icons";
import AdBanner from "./ad-banner";
import { set } from "zod";

const { StationContext } = require("@/context/station");
const { useContext, useEffect, useState, Fragment, useRef } = require("react");

const Advertisements = () => {
  const { station } = useContext(StationContext);
  const [advertisements, setAdvertisements] = useState([]);
  const [advertisementList, setAdvertisementList] = useState(null);
  const carouselContentRef = useRef(null);
  const [api, setApi] = useState(null);
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api || !station) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
      api.reInit();
    });
  }, [api, station]);

  useEffect(() => {
    if (!advertisementList) {
      fetch(`/api/advertisement`)
        .then((res) => res.json())
        .then((data) => {
          setAdvertisementList(data);
        });
    }
  }, [advertisementList]);

  useEffect(() => {
    if (station && station.advertisements && advertisementList) {
      let stationAdvertisements = JSON.parse(station.advertisements);
      setAdvertisements(
        stationAdvertisements?.map((advertisementId) =>
          advertisementList.find(
            (advertisement) => advertisement.id === advertisementId
          )
        ) || []
      );
      setCount(stationAdvertisements.length);
      setCurrent(1);
    }
  }, [station, advertisementList]);

  const SlideDots = ({ count }) => {
    // Create an array of numbers from 1 to count
    const numbers = Array.from({ length: count }, (_, i) => i + 1);

    return (
      <div className="flex justify-center mt-4">
        {numbers.map((number) =>
          number === current ? (
            <DotFilledIcon key={number} className="w-6 h-6 text-white" />
          ) : (
            <DotIcon key={number} className="w-6 h-6 text-white" />
          )
        )}
      </div>
    );
  };

  return (
    <Fragment>
      {advertisements && advertisements.length && (
        <section className="mx-auto w-full my-4 max-w-screen-2xl px-4 md:mt-16 lg:px-8">
          <h3 className="text-lg font-bold text-white mb-2 md:mb-4 md:text-2xl">
            Advertisements
          </h3>
          <Carousel
            className="w-full"
            opts={{
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 10000,
              }),
              AutoHeight(),
            ]}
            setApi={setApi}
          >
            <CarouselContent
              className="embla__container"
              ref={carouselContentRef}
            >
              {advertisements.map((advertisement) => {
                if (advertisement.thumbnail) {
                  return (
                    <CarouselItem key={advertisement.id}>
                      <Link href={advertisement.refUrl || "#"} target="_blank">
                        <Image
                          src={advertisement.thumbnail}
                          alt={advertisement.name}
                          width={1920}
                          height={1080}
                          className="max-w-full h-auto w-auto max-h-[250px] md:max-h-[400px] rounded-md mx-auto"
                          onLoad={(img) => {
                            setTimeout(() => {
                              carouselContentRef.current.style.height = `${img.target.height}px`;
                            }, 1000);
                          }}
                        />
                      </Link>
                    </CarouselItem>
                  );
                }
                if (advertisement.imageUrl) {
                  return (
                    <CarouselItem key={advertisement.id}>
                      <Link href={advertisement.refUrl || "#"} target="_blank">
                        <Image
                          src={advertisement.imageUrl}
                          alt={advertisement.name}
                          width={1920}
                          height={1080}
                          className="w-full h-auto rounded-md"
                          onLoad={(img) => {
                            setTimeout(() => {
                              carouselContentRef.current.style.height = `${img.target.height}px`;
                            }, 1000);
                          }}
                        />
                      </Link>
                    </CarouselItem>
                  );
                }
                if (advertisement.iFrameUrl) {
                  return (
                    <CarouselItem key={advertisement.id}>
                      <Link href={advertisement.refUrl || "#"} target="_blank">
                        <iframe
                          src={advertisement.iFrameUrl}
                          className="w-full h-[300px] rounded-md"
                          height={300}
                          width="100%"
                        />
                      </Link>
                    </CarouselItem>
                  );
                }
                if (advertisement.googleSlotId) {
                  return (
                    <CarouselItem key={advertisement.id}>
                      <Link href={advertisement.refUrl || "#"} target="_blank">
                        <AdBanner
                          data-ad-slot={advertisement.googleSlotId}
                          data-ad-format="auto"
                          data-full-width-responsive="true"
                        />
                      </Link>
                    </CarouselItem>
                  );
                }
              })}
            </CarouselContent>
            {/* <CarouselPrevious />
            <CarouselNext /> */}
          </Carousel>

          <SlideDots count={count} />
        </section>
      )}
    </Fragment>
  );
};

export default Advertisements;
