"use client";
import React, { useState, useEffect, useContext } from "react";
import { StationContext } from "./station";
import IcecastMetadataStats from "icecast-metadata-stats";
import { getTrack, processSongInfo } from "@/lib/utils";

const DEFUALT_TRACK = {
    stationId: null,
    trackId: null,
    artistId: null,
    StreamTitle: "",
    trackName: "",
    artistName: "",
    artworkURL: "/track-bg-default.webp",
    artistImage: "/artist-bg-default.webp",
    trackViewUrl: "#",
    loaded: false,
    processed: false,
    metaDataFound: false,
};

// Create a context for Player authentication and session information
export const PlayerContext = React.createContext();

// Player provider component to manage Player authentication and session
export const PlayerProvider = ({ children }) => {
    const { station, currentPlaying, addTrack } = useContext(StationContext);
    const [player, setPlayer] = useState({
        play: () => {},
        stop: () => {},
        setVolume: () => {},
        switchEndpoint: () => {},
    });
    const [playerInitialized, setPlayerInitialized] = useState(false);
    const [playerIsLoaded, setPlayerIsLoaded] = useState(false);
    const [playerState, setPlayerState] = useState("stopped");
    const [playerVolume, setPlayerVolume] = useState(1);
    const [currentTrack, setCurrentTrack] = useState(DEFUALT_TRACK);
    const [statsInterval, setStatsInterval] = useState(null);
    const [initalTrackLoaded, setInitalTrackLoaded] = useState(false);
    const [icecastState, setIcecastState] = useState(null);
    const [icecastPlayer, setIcecastPlayer] = useState(null);
    const changeVolume = (volume) => {
        setPlayerVolume(volume);
        player.setVolume(volume);
    };

    useEffect(() => {
        if (currentPlaying.title && !initalTrackLoaded) {
            console.log("Current Playing", currentPlaying);
            setInitalTrackLoaded(true);
            setCurrentTrack({
                ...DEFUALT_TRACK,
                StreamTitle: currentPlaying.title,
                stationId: currentPlaying.stationId,
                artworkURL: currentPlaying.artworkURL || station.thumbnail,
                trackName: currentPlaying.trackName,
                artistName: currentPlaying.artistName,
                artistImage:
                    currentPlaying?.artistImage || DEFUALT_TRACK.artistImage,
                loaded: true,
                processed: false,
                metaDataFound: true,
            });
        } else if (!currentPlaying.title && !initalTrackLoaded && station) {
            setCurrentTrack({
                ...DEFUALT_TRACK,
                trackName: station.metaPreset,
                artworkURL: station.thumbnail,
                artistImage: DEFUALT_TRACK.artistImage,
                loaded: true,
                processed: false,
                metaDataFound: false,
            });
        }
    }, [currentPlaying, initalTrackLoaded, station]);

    useEffect(() => {
        if (station && !playerInitialized) {
            console.log("Player initialized", station.url);
            setPlayerInitialized(true);
            async function initializePlayer() {
                const { default: IcecastMetadataPlayer } = await import(
                    "icecast-metadata-player"
                );

                let options = {
                    lastPlayedMetadata: true,
                    metadataTypes: ["icy", "ogg"],
                    onMetadata: (metadata) => {
                        setCurrentTrack((prevState) => {
                            if (
                                metadata.StreamTitle === prevState.StreamTitle
                            ) {
                                return prevState;
                            }
                            return {
                                ...DEFUALT_TRACK,
                                StreamTitle: metadata.StreamTitle,
                                stationId: station.id,
                                artworkURL: station.thumbnail,
                            };
                        });
                    },
                    onError: (error) => {
                        console.error("ERROR", error);
                    },
                };

                const playerLisner = new IcecastMetadataPlayer(station.url, {
                    ...options,
                });
                setIcecastPlayer(playerLisner);
                setPlayer({
                    play: async () => {
                        setPlayerState("loading");
                        await playerLisner.play();
                        setPlayerState("playing");
                    },
                    stop: async () => {
                        await playerLisner.stop();
                        setPlayerState("stopped");
                    },
                    setVolume: (volume) => {
                        playerLisner.audioElement.volume = volume;
                    },
                    switchEndpoint: async () => {
                        await playerLisner.stop();
                        await playerLisner.detachAudioElement();
                        setPlayerInitialized(false);
                        setPlayerIsLoaded(true);
                        setPlayerState("stopped");
                    },
                });
                if (playerIsLoaded) {
                    setPlayerState("loading");
                    await playerLisner.play();
                    playerLisner.audioElement.volume = playerVolume;
                    setPlayerState("playing");
                }
            }

            initializePlayer();
        }
        return () => {
            icecastPlayer && icecastPlayer.stop();
        };
    }, [station, playerInitialized, playerIsLoaded]);
    useEffect(() => {
        if (icecastPlayer) {
            player.setVolume(playerVolume);
        }
    }, [playerVolume]);
    useEffect(() => {
        if (currentTrack.stationId !== null && !currentTrack.loaded) {
            async function fetchMetadata() {
                await getAdditionalMetadata(currentTrack);
            }
            fetchMetadata();
        }
    }, [currentTrack]);

    useEffect(() => {
        if (currentTrack.processed) {
            console.log("Current Track", currentTrack);
            addTrack(currentTrack);
        }
    }, [currentTrack]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const statsListener = new IcecastMetadataStats(station.url, {
                    onStats: async (stats) => {
                        if (stats && stats.icy && stats.icy.StreamTitle) {
                            setCurrentTrack((prevState) => {
                                if (
                                    stats.icy.StreamTitle ===
                                        prevState.StreamTitle ||
                                    (prevState.stationId !== station.id &&
                                        prevState.stationId !== null)
                                ) {
                                    return prevState;
                                }
                                return {
                                    ...DEFUALT_TRACK,
                                    StreamTitle: stats.icy.StreamTitle,
                                    stationId: station.id,
                                    artworkURL: station.thumbnail,
                                };
                            });
                        }
                        // statsListener.stop();
                    },
                    onError: (error) => {
                        console.error("Error fetching stats:", error);
                    },
                    interval: 5,
                    sources: ["icy", "ogg"],
                });
                setIcecastState(statsListener);
                statsListener.start();
            } catch (error) {
                console.error("Error fetching stations:", error);
            }
        };
        if (station) {
            if (playerState == "playing") {
                if (icecastState) {
                    // clearInterval(statsInterval);
                    // setStatsInterval(null);
                    icecastState.stop();
                    console.log("Stats loader cleared");
                }
            } else {
                if (icecastState) {
                    icecastState.stop();
                }
                fetchStats();

                // fetchStats();
                // let interval = setInterval(async () => {
                //     fetchStats();
                // }, 5000);
                // console.log("Stats loader Initialized");
                // setStatsInterval(interval);
            }
        }
        return () => {
            icecastState && icecastState.stop();
        };
    }, [station, playerState]);

    const getAdditionalMetadata = async (track) => {
        console.log("Fetching metadata:", track.StreamTitle);
        setCurrentTrack((prevState) => ({
            ...prevState,
            loaded: true,
        }));
        if (track.StreamTitle) {
            let searchText = track.StreamTitle;
            let trackData = null;

            if (searchText.trim().toLowerCase() === "unknown") {
                searchText = "";
                track.StreamTitle = station.metaPreset;
            } else {
                const processText = processSongInfo(searchText);
                const encodedSearchText = encodeURIComponent(processText);
                const iTunesSearchURL = `/itunes-api/search?term=${encodedSearchText}&limit=10`;
                const response = await fetch(iTunesSearchURL);
                const json = await response.json();
                trackData = getTrack(json.results, processText);
            }

            if (trackData) {
                let artworkURL = trackData.artworkUrl100;
                artworkURL = artworkURL.replace("100x100", "600x600");
                const trackId = trackData.trackId;
                const artistId = trackData.artistId;
                const trackName = trackData.trackName;
                const artistName = trackData.artistName;
                const trackViewUrl = trackData.trackViewUrl;

                setCurrentTrack((prevState) => ({
                    ...prevState,
                    trackId,
                    artistId,
                    artworkURL,
                    trackName,
                    artistName,
                    trackViewUrl,
                    metaDataFound: true,
                }));

                let artistViewUrl = trackData.artistViewUrl;
                let artistImage = DEFUALT_TRACK.artistImage;

                if (artistViewUrl) {
                    try {
                        let searchedArtistImage = null;

                        const response = await fetch("/api/artist", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                artistId: trackData.artistId,
                                url: artistViewUrl,
                            }),
                        });
                        const data = await response.json();

                        if (response.ok) {
                            searchedArtistImage = data.artistImage;
                            artistImage = searchedArtistImage;
                        } else {
                            // Fallback to fetch artist image from Apple Music
                            try {
                                const response = await fetch(
                                    artistViewUrl.replace(
                                        "https://music.apple.com/us/artist/",
                                        "/apple-music/"
                                    )
                                );
                                const html = await response.text();
                                const parser = new DOMParser();
                                const doc = parser.parseFromString(
                                    html,
                                    "text/html"
                                );
                                const artistImageElement = doc.querySelector(
                                    "main picture source"
                                );
                                if (artistImageElement) {
                                    artistImage = artistImageElement
                                        .getAttribute("srcset")
                                        .split(" ")[0]
                                        .replace(
                                            /\d{1,4}x\d{1,4}/,
                                            "1280x1280"
                                        );
                                }
                            } catch (error) {
                                console.log(
                                    "There was a problem fetching the data:",
                                    error
                                );
                            }
                        }
                    } catch (error) {
                        console.error(
                            "There was a problem fetching the data:",
                            error
                        );
                    }
                }

                setCurrentTrack((prevState) => ({
                    ...prevState,
                    artistImage,
                    processed: true,
                }));
            } else {
                const metaArray = track.StreamTitle.split(" - ");
                setCurrentTrack((prevState) => ({
                    ...prevState,
                    artistId: null,
                    trackId: null,
                    trackName:
                        metaArray.length > 1 ? metaArray[1] : track.StreamTitle,
                    artistName: metaArray.length > 0 ? metaArray[0] : "",
                    processed: true,
                    metaDataFound: false,
                }));
            }
        }
    };

    return (
        <PlayerContext.Provider
            value={{
                player,
                playerState,
                playerVolume,
                setPlayerIsLoaded,
                changeVolume,
                currentTrack,
            }}
        >
            {children}
        </PlayerContext.Provider>
    );
};
