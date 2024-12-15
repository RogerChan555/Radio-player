"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const NEW_THIS_WEEK = [
  {
    title:
      "Want to Take Your Mom to Meet Anne Wilson at the K-LOVE Fan Awards?",
    link: "https://www.klove.com/k-love-mothers-day-sweepstakes-2024",
    image: "/newThisWeek/1.webp",
    category: "Enter to Win",
  },
  {
    title: "Remembering the Life, Legacy and Impact of Mandisa",
    link: "https://www.klove.com/music/blog/music-news/7-mandisa-moments-we-ll-never-forget-7934",
    image: "/newThisWeek/2.webp",
    category: "Read + Watch",
  },
  {
    title: "“I Pray When People Hear My Story…They See the Hand of God",
    link: "https://www.klove.com/music/blog/behind-the-music/this-is-my-story-with-tasha-layton-7874",
    image: "/newThisWeek/3.webp",
    category: "Read + Watch",
  },
  {
    title: "Lauren Daigle's Tour Delivers Vibrancy, Hospitality, Celebration",
    link: "https://www.klove.com/ministry/spotlight/current-events/tour-spotlight-lauren-daigle-the-kaleidoscope-tour-7865",
    image: "/newThisWeek/4.webp",
    category: "Read + Listen",
  },
  {
    title: "for KING + COUNTRY's Journey From Down Under to Center Stage",
    link: "https://tickets.unsunghero.movie/",
    image: "/newThisWeek/5.webp",
    category: "Find Showings Near You",
  },
  {
    title: "Enjoy Conversations With 'Unsung Hero' Cast and Crew",
    link: "https://accessmore.com/episode/Exclusive-Unsung-Hero-Panel-with-Cast--Crew-",
    image: "/newThisWeek/6.webp",
    category: "Listen to the Podcast",
  },
  {
    title: "We're Heading to Hawaii With TobyMac, Crowder and More!",
    link: "https://www.klove.com/k-love-live-in-honolulu-2024",
    image: "/newThisWeek/7.webp",
    category: "Plan Your Trip",
  },
  {
    title:
      "Fighting Words Devotional - This Four-Part Video Series With Ellie Holcomb Combines Scripture, Personal Stories and Powerful Songs to Refresh Your Soul",
    link: "https://watch.klove.com/pd/Ellie-Holcombs-Fighting-Words",
    image: "/newThisWeek/8.webp",
    category: "Watch for Free!",
  },
];

const NewThisWeek = () => {
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
        New This Week
      </h3>
      {isMobile ? (
        <Carousel
          opts={{
            dragFree: true,
          }}
        >
          <CarouselContent className="-ml-2">
            {NEW_THIS_WEEK.map((item, index) => (
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
          {NEW_THIS_WEEK.map((item, index) => (
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

export default NewThisWeek;
