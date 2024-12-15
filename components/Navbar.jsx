import Image from "next/image";

const Navbar = ({ station }) => {
  return (
    <nav className="mx-auto w-full max-w-screen-2xl">
      <div className="flex flex-row items-center justify-between h-[100px] px-4 pt-1 md:px-8 md:h-[140px]">
        <a
          target="_blank"
          href="/"
          className="relative h-full content-center flex-1"
        >
          {station && station.logo && (
            <Image
              alt="station logo"
              loading="lazy"
              width="300"
              height="100"
              className="max-h-[80%] w-[100px] md:w-[150px]"
              src={station.logo}
            />
          )}
        </a>
        <div className="flex-1 hidden lg:block">
          <a
            target="_blank"
            className="rounded-full px-4 py-1 font-bold text-white transition-all duration-300 hover:bg-white hover:text-black hover:shadow-lg md:px-7 md:py-2 md:text-lg"
            href="#"
          >
            {station?.name || ""}
          </a>
        </div>
        <div className="flex gap-3 md:gap-4">
          <a
            target="_blank"
            className="rounded-full bg-white px-3 py-1 text-sm font-bold text-black shadow-lg transition-all duration-300 md:px-7 md:py-2 md:text-lg"
            href={station?.donateLink || "#"}
          >
            Give Now
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
