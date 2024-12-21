import { useContext, useEffect, useState } from "react";
import { FaPlay, FaSpinner, FaStop } from "react-icons/fa6";
import VolumeControl from "./VolumeControl";
import Image from "next/image";
import { PlayerContext } from "@/context/player";
import { StationContext } from "@/context/station";
import copy from 'clipboard-copy';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
const PLAYER_ICONS = {
  PLAY: <FaPlay className="h-6 w-6" />,
  STOP: <FaStop className="h-6 w-6" />,
  SPINNER: <FaSpinner className="h-6 w-6 animate-spin" />,
};
const axios = require("axios");

import {
  FaFacebookF,
  FaInstagram,
  FaMusic,
  FaCommentSms,
} from "react-icons/fa6";

const Player = () => {
  const { player, playerState, setPlayerIsLoaded, currentTrack } =
    useContext(PlayerContext);
  const { currentPlaying, station } = useContext(StationContext);
  const [playerCurrentIcon, setPlayerCurrentIcon] = useState(PLAYER_ICONS.PLAY);
  const [videoUrl, setVideoUrl] = useState(null);

  const shareUrl = currentPlaying?.trackViewUrl || "";
  const shareText_1 = `I'm listening to station ${
    station?.name || "Unknown Station"
  }, song "${currentPlaying?.trackName || "Unknown Song"}" by ${
    currentPlaying?.artistName || "Unknown Artist"
  }. Check it out here: `+window.location.href;

  useEffect(() => {
    if (playerState === "playing") {
      setPlayerCurrentIcon(PLAYER_ICONS.STOP);
    } else if (playerState === "stopped" || playerState === "ready") {
      setPlayerCurrentIcon(PLAYER_ICONS.PLAY);
    } else {
      setPlayerCurrentIcon(PLAYER_ICONS.SPINNER);
    }
  }, [playerState]);

  function togglePlayer() {
    if (playerState === "playing") {
      player.stop();
    } else {
      setPlayerIsLoaded(true);
      player.play();
    }
  }


  const fetchLinkedInstagramAccount = async (accessToken) => {
    try {
      const response = await axios.get(`https://graph.facebook.com/v21.0/me`, {
        params: {
          access_token: accessToken,
          fields: "id,name,accounts{connected_instagram_account}",
        },
      });

      const pages = response.data.accounts.data;
      console.log("Linked Pages with Instagram Accounts:", pages);

      const pageWithIgAccount = pages.find(
        (page) => page.connected_instagram_account
      );

      if (!pageWithIgAccount) {
        alert(
          "No Instagram Business Account found linked with your Facebook page."
        );
        removeUrl();
        return null;
      }
      const igAccountId = pageWithIgAccount.connected_instagram_account.id;
      return igAccountId;
    } catch (error) {
      console.error("Error fetching linked Instagram account:", error);
    }
  };

  const handleOAuthCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const authorizationCode = urlParams.get("code");

    if (authorizationCode) {
      try {
        const response = await axios.get(
          `https://graph.facebook.com/v17.0/oauth/access_token`,
          {
            params: {
              client_id: "1662988724646705",
              redirect_uri: window.location.origin,
              client_secret: "d55053a3fdaabbf862e11ba3e162eccb",
              code: authorizationCode,
            },
          }
        );

        const accessToken = response.data.access_token;

        console.log("User Access Token:", accessToken);

        return accessToken;
      } catch (error) {
        removeUrl();
        console.error(
          "Error exchanging code for access token:",
          error?.response
        );
      }
    }
  };

  const initiateOAuthFlow = () => {
    const appId = "1662988724646705";
    const redirectUri = window.location.origin;
    const scope =
      "business_management,instagram_content_publish,pages_read_engagement,pages_manage_metadata,instagram_basic,instagram_manage_insights";

    if (shareUrl && currentPlaying?.trackName && currentPlaying?.artistName) {
      localStorage.setItem("current_player", shareText_1);
      const authUrl = `https://www.facebook.com/v17.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&scope=${scope}&response_type=code`;

      window.location.href = authUrl;
    }
  };
  const [isCopied, setIsCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [iframeValue, setiframeValue]=useState("");
  const openModal= ()=>{
    setiframeValue(
      '<div id="Container" style="padding-bottom:56.25%; position:relative; display:block; width: 100%">'+
      '<iframe id="UstreamIframe" src="'+window.location.href+'" width="100%" height="100%" style="position:absolute; top:0; left: 0"'+
      ' allowfullscreen webkitallowfullscreen frameborder="0" referrerpolicy="no-referrer-when-downgrade"></iframe></div>'
    );
    setIsCopied(false);
    setOpen(true);
  }
  const closeModal = () => setOpen(false);
  const iframeShare = async () => {
    try {
      await copy(window.location.href);
      document.querySelector('.copy-input').focus();
      document.querySelector('.copy-input').select();
      setIsCopied(true);
    } catch (error) {
      console.error('Failed to copy text to clipboard', error);
    }
  };

  const removeUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.delete("code");

    const newUrl =
      window.location.origin +
      window.location.pathname +
      "?" +
      urlParams.toString();

    window.history.replaceState(null, "", newUrl);
    localStorage.removeItem("current_player");
  };

  const publishToInstagram = async (
    accessToken,
    instagramAccountId,
    imageUrl,
    caption
  ) => {
    try {
      // Step 1: Upload Media
      const mediaResponse = await axios.post(
        `https://graph.facebook.com/v17.0/${instagramAccountId}/media`,
        {
          caption,
          image_url: imageUrl,
          access_token: accessToken,
        }
      );

      const mediaCreationId = mediaResponse.data.id;
      // alert("mediaCreationId= " + mediaCreationId);
      // Step 2: Publish Media
      const publishResponse = await axios.post(
        `https://graph.facebook.com/v17.0/${instagramAccountId}/media_publish`,
        {
          creation_id: mediaCreationId,
          access_token: accessToken,
        }
      );

      removeUrl();
      alert("Post published successfully:");
      console.log("Post published successfully:", publishResponse.data);
    } catch (error) {
      removeUrl();
      console.error(
        "Error publishing post:",
        error.response?.data || error.message
      );
    }
  };
  const mainFlow = async () => {
    try {
      // Step 2: Handle Redirect and Fetch Access Token
      const accessToken = await handleOAuthCallback();

      // Step 3: Fetch Linked Instagram Account
      const instagramAccountId = await fetchLinkedInstagramAccount(accessToken);

      // Step 4: Publish to Instagram
      const imageUrl =
        "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/7b/ff/0a/7bff0a9e-6501-7fe6-7173-540602911427/886445058963.jpg/600x600bb.jpg";

      const caption = localStorage.getItem("current_player") || shareText_1;

      await publishToInstagram(
        accessToken,
        instagramAccountId,
        imageUrl,
        caption
      );
    } catch (error) {
      console.error("Error in the Instagram publishing flow:", error);
    }
  };


  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const authorizationCode = urlParams.get("code");

    if (authorizationCode) {
      mainFlow();
    }

  }

  return (
    <section className="mx-4 rounded-4xl md:mx-8">
      <div className="bg-img-box relative flex min-h-[205px] items-end rounded-2xl bg-black/25 bg-cover bg-center bg-no-repeat p-4 drop-shadow-2xl sm:min-h-[400px] md:p-8 lg:min-h-[670px] lg:rounded-[35px]">
        <div className="relative flex w-full justify-between z-50">
          <a
            target="_blank"
            className="flex items-center gap-6 group"
            href={currentTrack.trackViewUrl}
          >
            <div className="relative">
            <Image
              alt="Album thumbnail image"
              loading="lazy"
              width="150"
              height="150"
              className="hidden rounded-md shadow-md transition-all duration-200 hover:scale-105 lg:flex"
              src={currentTrack.artworkURL}
            />
              {/* Social sharing icons on hover */}
              <div className="social-icons-desktop-box lg:flex hidden absolute top-0 left-0 w-full h-full flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md">
                <p className="break-words font-semibold text-black drop-shadow-md truncate line-clamp-2 whitespace-normal md:text-2xl md:leading-normal">Share</p>
                <div className="lg:flex w-full flex items-center justify-center gap-2 rounded-md">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    window.location.href
                    )}&quote=${encodeURIComponent(shareText_1)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Share on Facebook"
                    className="text-blue-600 hover:text-blue-600"
                  >
                    <FaFacebookF size={23} />
                  </a>
                  {/*   {videoUrl && (
                    <div className="mt-4">
                      <video controls className="mb-4" width="300">
                        <source src={videoUrl} type="video/mp4" />
                      </video>
                  <a
                        href={`https://www.tiktok.com/upload?video=${encodeURIComponent(
                          videoUrl
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-black bg-pink-500 p-2 rounded-full flex items-center"
                        aria-label="Share to TikTok"
                      >
                        <FaMusic size={18} className="mr-2" />
                        Share to TikTok
                      </a>
                    </div>
                  )} */}
                  <a
                    href={`https://www.tiktok.com/upload?video=${encodeURIComponent(
                      window.location.href
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Visit TikTok Profile"
                    className="text-blue-600  hover:text-blue-600"
                  >

                    {/*<Image src="/public/tiktok.svg" alt="" height={23} width={23}/>*/}
                    <Image src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IS0tIFVwbG9hZGVkIHRvOiBTVkcgUmVwbywgd3d3LnN2Z3JlcG8uY29tLCBHZW5lcmF0b3I6IFNWRyBSZXBvIE1peGVyIFRvb2xzIC0tPgo8c3ZnIGZpbGw9IiMyNTYzRUIiIHdpZHRoPSI4MDBweCIgaGVpZ2h0PSI4MDBweCIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbDpzcGFjZT0icHJlc2VydmUiPjxwYXRoIGQ9Ik0xOS41ODkgNi42ODZhNC43OTMgNC43OTMgMCAwIDEtMy43Ny00LjI0NVYyaC0zLjQ0NXYxMy42NzJhMi44OTYgMi44OTYgMCAwIDEtNS4yMDEgMS43NDNsLS4wMDItLjAwMS4wMDIuMDAxYTIuODk1IDIuODk1IDAgMCAxIDMuMTgzLTQuNTF2LTMuNWE2LjMyOSA2LjMyOSAwIDAgMC01LjM5NCAxMC42OTIgNi4zMyA2LjMzIDAgMCAwIDEwLjg1Ny00LjQyNFY4LjY4N2E4LjE4MiA4LjE4MiAwIDAgMCA0Ljc3MyAxLjUyNlY2Ljc5YTQuODMxIDQuODMxIDAgMCAxLTEuMDAzLS4xMDR6Ii8+PC9zdmc+"
                    alt="" height={23} width={23}/>
                  </a>
                  {/*
                  <a
                    onClick={initiateOAuthFlow}
                    aria-label="Share on Instagram"
                    className="text-blue-600 hover:text-blue-600"
                  >
                    <FaInstagram size={23} />
                  </a>*/}
                  {/* <a
                        href=`instagram://story?background_image=${encodeURIComponent(
                            station.thumbnail
                          )}&content_url=${encodeURIComponent(shareText_1)}`
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Visit Instagram Profile"
                        className="text-blue-600 hover:text-blue-600"
                      >
                        <FaInstagram size={23} />
                      </a> */}
                  {/* SMS */}
                  <a
                    href={`sms:?&body=${encodeURIComponent(
                      `Check out "${shareText_1}"`
                    )}`}
                    aria-label="Share via SMS"
                    className="text-green-600 hover:text-green-600"
                  >
                    <FaCommentSms size={23} />
                  </a>
                  <a
                    href="#"
                    onClick={openModal}
                    aria-label="Share iframe"
                    className="social-icons-desktop text-blue-600 hover:text-blue-600"
                  >
                    <Image src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IS0tIFVwbG9hZGVkIHRvOiBTVkcgUmVwbywgd3d3LnN2Z3JlcG8uY29tLCBHZW5lcmF0b3I6IFNWRyBSZXBvIE1peGVyIFRvb2xzIC0tPgo8c3ZnIGZpbGw9IiMwMDAwMDAiIHdpZHRoPSI4MDBweCIgaGVpZ2h0PSI4MDBweCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIyIDIgMjIgMjIiPgogIDxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgZD0iTTkuNzA3MTA2NzgsMTUuMjkyODkzMiBMOC4yOTI4OTMyMiwxNi43MDcxMDY4IEwzLjU4NTc4NjQ0LDEyIEw4LjI5Mjg5MzIyLDcuMjkyODkzMjIgTDkuNzA3MTA2NzgsOC43MDcxMDY3OCBMNi40MTQyMTM1NiwxMiBMOS43MDcxMDY3OCwxNS4yOTI4OTMyIFogTTE0LjI5Mjg5MzIsOC43MDcxMDY3OCBMMTUuNzA3MTA2OCw3LjI5Mjg5MzIyIEwyMC40MTQyMTM2LDEyIEwxNS43MDcxMDY4LDE2LjcwNzEwNjggTDE0LjI5Mjg5MzIsMTUuMjkyODkzMiBMMTcuNTg1Nzg2NCwxMiBMMTQuMjkyODkzMiw4LjcwNzEwNjc4IFogTTExLjk4NjM5MzksMTguMTY0Mzk5IEwxMC4wMTM2MDYxLDE3LjgzNTYwMSBMMTIuMDEzNjA2MSw1LjgzNTYwMTAxIEwxMy45ODYzOTM5LDYuMTY0Mzk4OTkgTDExLjk4NjM5MzksMTguMTY0Mzk5IFoiLz4KPC9zdmc+"
                      alt="" height={30} width={30} />
                  </a>
                  <Popup open={open} closeOnDocumentClick onClose={closeModal}>
                    <div className="modal flex flex-column">
                      <div className="copy-preview">
                        <iframe className="copy-iframe" src={window.location.href} width="100%" height="100%"
                          allowfullscreen webkitallowfullscreen frameborder="0" referrerpolicy="no-referrer-when-downgrade">
                        </iframe>
                      </div>
                      <div className="flex copy-header">
                        <span className="header">Embed Video</span>
                        <button className="close" onClick={closeModal}>
                          <Image src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDI0IDI0IiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgZm9jdXNhYmxlPSJmYWxzZSIgYXJpYS1oaWRkZW49InRydWUiIHN0eWxlPSJwb2ludGVyLWV2ZW50czogbm9uZTsgZGlzcGxheTogaW5oZXJpdDsgd2lkdGg6IDEwMCU7IGhlaWdodDogMTAwJTsiPgo8cGF0aCBkPSJtMTIuNzEgMTIgOC4xNSA4LjE1LS43MS43MUwxMiAxMi43MWwtOC4xNSA4LjE1LS43MS0uNzFMMTEuMjkgMTIgMy4xNSAzLjg1bC43MS0uNzFMMTIgMTEuMjlsOC4xNS04LjE1LjcxLjcxTDEyLjcxIDEyeiI+CjwvcGF0aD4KPC9zdmc+"
                            alt="" height={30} width={30} />
                        </button>
                      </div>
                      <p className="copy-p">Copy & Paste this code to embed the player into your website.</p>
                      <textarea className="copy-input w-full" type="text" value={iframeValue} >
                        {iframeValue}
                      </textarea>
                      <button className="copy-button actions button text-white" onClick={iframeShare}>
                        {isCopied ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </Popup>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <p className="break-words font-extrabold text-white drop-shadow-md truncate line-clamp-2 whitespace-normal md:mb-2 md:text-4xl md:leading-normal">
                {currentTrack.trackName}
              </p>
              <p className="break-words font-semibold text-white drop-shadow-md truncate line-clamp-2 whitespace-normal md:text-2xl md:leading-normal">
                {currentTrack.artistName}
              </p>
            </div>
          </a>
          <div className="hidden items-center gap-4 self-end lg:flex">
            <div className="container mx-auto">
              <VolumeControl />
            </div>
            <div className="rounded-full bg-gradient-to-br from-[#cd3e5b] to-[#fbbf55] p-[4px]">
              <button
                type="button"
                className="rounded-full bg-white p-6 text-black shadow-xl transition-all duration-300 hover:scale-[1.07] md:p-10"
                aria-label="play music"
                onClick={() => {
                  togglePlayer();
                }}
              >
                {playerCurrentIcon}
              </button>
            </div>
          </div>
        </div>
        <div className="absolute right-0 left-0 bottom-0 h-[50%] bg-gradient-to-b from-[transparent] to-[#000000ba] rounded-2xl lg:rounded-[35px]"></div>
        <div className="group playerBGContainer absolute right-0 left-0 bottom-0 top-0 bg-gradient-to-b from-[transparent] to-[#000000ba] rounded-2xl lg:rounded-[35px] overflow-hidden">
          <Image
            alt="Album artist image"
            priority
            src={currentTrack.artistImage}
            fill
            sizes="100vw"
            onError={(e) => {
              e.target.style.display = "none";
            }}
            onLoad={(e) => {
              e.target.style.display = "block";
            }}
            style={{
              objectFit: "cover",
            }}
          />
              {/* Social sharing icons on hover */}
              <div className="social-icons-mobile-box hidden absolute top-0 left-0 w-full h-full flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md">
                <p className="social-icons-desktop-share break-words font-semibold text-black drop-shadow-md truncate line-clamp-2 whitespace-normal md:text-2xl md:leading-normal">Share</p>
                <div className="lg:flex w-full flex items-center justify-center gap-2 rounded-md">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    window.location.href
                    )}&quote=${encodeURIComponent(shareText_1)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Share on Facebook"
                    className="text-blue-600 hover:text-blue-600"
                  >
                    <FaFacebookF size={23} />
                  </a>
                  {/*   {videoUrl && (
                    <div className="mt-4">
                      <video controls className="mb-4" width="300">
                        <source src={videoUrl} type="video/mp4" />
                      </video>
                  <a
                        href={`https://www.tiktok.com/upload?video=${encodeURIComponent(
                          videoUrl
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-black bg-pink-500 p-2 rounded-full flex items-center"
                        aria-label="Share to TikTok"
                      >
                        <FaMusic size={18} className="mr-2" />
                        Share to TikTok
                      </a>
                    </div>
                  )} */}
                  <a
                    href={`https://www.tiktok.com/upload?video=${encodeURIComponent(
                      window.location.href
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Visit TikTok Profile"
                    className="text-blue-600  hover:text-blue-600"
                  >

                    {/*<Image src="/public/tiktok.svg" alt="" height={23} width={23}/>*/}
                    <Image src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IS0tIFVwbG9hZGVkIHRvOiBTVkcgUmVwbywgd3d3LnN2Z3JlcG8uY29tLCBHZW5lcmF0b3I6IFNWRyBSZXBvIE1peGVyIFRvb2xzIC0tPgo8c3ZnIGZpbGw9IiMyNTYzRUIiIHdpZHRoPSI4MDBweCIgaGVpZ2h0PSI4MDBweCIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbDpzcGFjZT0icHJlc2VydmUiPjxwYXRoIGQ9Ik0xOS41ODkgNi42ODZhNC43OTMgNC43OTMgMCAwIDEtMy43Ny00LjI0NVYyaC0zLjQ0NXYxMy42NzJhMi44OTYgMi44OTYgMCAwIDEtNS4yMDEgMS43NDNsLS4wMDItLjAwMS4wMDIuMDAxYTIuODk1IDIuODk1IDAgMCAxIDMuMTgzLTQuNTF2LTMuNWE2LjMyOSA2LjMyOSAwIDAgMC01LjM5NCAxMC42OTIgNi4zMyA2LjMzIDAgMCAwIDEwLjg1Ny00LjQyNFY4LjY4N2E4LjE4MiA4LjE4MiAwIDAgMCA0Ljc3MyAxLjUyNlY2Ljc5YTQuODMxIDQuODMxIDAgMCAxLTEuMDAzLS4xMDR6Ii8+PC9zdmc+"
                    alt="" height={23} width={23}/>
                  </a>
                  {/*
                  <a
                    onClick={initiateOAuthFlow}
                    aria-label="Share on Instagram"
                    className="text-blue-600 hover:text-blue-600"
                  >
                    <FaInstagram size={23} />
                  </a>*/}
                  {/* <a
                        href=`instagram://story?background_image=${encodeURIComponent(
                            station.thumbnail
                          )}&content_url=${encodeURIComponent(shareText_1)}`
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Visit Instagram Profile"
                        className="text-blue-600 hover:text-blue-600"
                      >
                        <FaInstagram size={23} />
                      </a> */}
                  {/* SMS */}
                  <a
                    href={`sms:?&body=${encodeURIComponent(
                      `Check out "${shareText_1}"`
                    )}`}
                    aria-label="Share via SMS"
                    className="text-green-600 hover:text-green-600"
                  >
                    <FaCommentSms size={23} />
                  </a>
                </div>
              </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-4 lg:hidden">
        <div className="container mx-auto hidden justify-end md:flex">
          <VolumeControl />
        </div>
        <button
          type="button"
          className="rounded-full bg-white p-6 text-black shadow-xl transition-all duration-300 hover:scale-[1.07] md:p-10 z-20 -mt-8 mr-6 border-2 border-kl-primary bg-white"
          aria-label="play music"
          onClick={() => {
            togglePlayer();
          }}
        >
          {playerCurrentIcon}
        </button>
      </div>
    </section>
  );
};

export default Player;
