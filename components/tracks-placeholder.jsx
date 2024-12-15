import Image from "next/image";
import { CarouselItem } from "./ui/carousel";

const TracksPlaceholder = () => {
  return (
    <CarouselItem className="p-0 mx-2 basis-1/4 min-w-[300px] max-h-[75px] md:max-h-[100px] overflow-hidden rounded-lg bg-white/5 border border-white/10 shadow-md shadow-black/[.1] transition-all duration-200 hover:bg-white/[.15] hover:shadow-lg">
      <div className="mb-4 flex w-full flex-1 items-center">
        <Image
          alt={"Last Played"}
          loading="lazy"
          width="100"
          height="100"
          className="flex aspect-square h-[75px] w-[75px] items-center justify-center rounded-l-sm md:h-[100px] md:w-[100px] md:rounded-l-lg"
          src="/logo-square.png"
        />
        <div className="mx-4 max-w-full">
          <p className="text-sm font-bold text-white truncate line-clamp-2 whitespace-normal md:text-base">
            Loading
          </p>
          <p className="text-sm text-white opacity-60 truncate line-clamp-2 whitespace-normal md:text-base">
            Song data...
          </p>
        </div>
      </div>
    </CarouselItem>
  );
};

export default TracksPlaceholder;
