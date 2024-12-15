"use client";

import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";

// Create a context for Station authentication and session information
export const StationContext = React.createContext();

// Station provider component to manage Station authentication and session
export const StationProvider = ({ children }) => {
  const [stationsList, setStationsList] = useState([]);
  const [station, setStation] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [upcomingTracks, setUpcomingTracks] = useState([]);
  const [currentPlaying, setCurrentPlaying] = useState({});
  const [loadingStations, setloadingStations] = useState(true);
  const [loadingTracks, setloadingTracks] = useState(true);
  const [loadingUpcomingTracks, setloadingUpcomingTracks] = useState(true);

  const { stationURL } = useParams();

  useEffect(() => {
    const fetchStations = async () => {
      setloadingStations(true);
      try {
        const response = await fetch("/api/station", {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        let station_result = data;
        station_result.forEach((station) => {
          station.url = station.url.replace("https://", "/stream-proxy/");
        });
        console.log("Stations loaded", station_result);
        setStationsList(station_result);
        setloadingStations(false);
      } catch (error) {
        console.error("Failed to fetch stations", error);
        setloadingStations(false);
      }
    };
    fetchStations();
  }, []);

  const addTrack = (track) => {
    if (track.stationId !== station?.id || !track.metaDataFound) return;
    if (tracks.some((t) => t.trackId == track.trackId)) {
      return;
    }
    setTracks((prevTracks) => {
      let newTracks = [track, ...prevTracks];
      if (newTracks.length > 5) {
        newTracks.pop();
      }
      return newTracks;
    });
  };

  useEffect(() => {
    if (stationsList.length === 0) return;
    let currentStation = null;
    let defaultStation = stationsList.find((station) => station.isDefault);
    if (!defaultStation) {
      defaultStation = stationsList[0];
    }
    let urlStation = stationURL
      ? stationsList.find((station) => station.refUrl === `${stationURL}`)
      : null;
    currentStation = urlStation || defaultStation;
    setStation(currentStation);
  }, [stationsList, stationURL]);

  useEffect(() => {
    if (station && station.id) {
      const fetchTracks = async (stationId) => {
        setloadingTracks(true);
        try {
          const response = await fetch(`/api/station/${stationId}/tracks`);
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Failed to fetch tracks");
          }

          console.log("Last played loaded", data);
          if (data && data.tracks.length > 0) {
            setTracks(data.tracks);
            setloadingTracks(false);
          }

          if (data && data.currentPlaying) {
            setCurrentPlaying(data.currentPlaying);
          }
        } catch (error) {
          console.error("Error fetching tracks:", error);
          setloadingTracks(false);
        }
      };
      fetchTracks(station.id);
    }
  }, [station]);

  useEffect(() => {
    let timeout = null;
    if (station && station.id) {
      const fetchUpcomingTracks = async (stationId) => {
        if (stationId !== station.id) return;
        if (timeout) clearTimeout(timeout);
        try {
          const TIMEOUT_SECONDS = 5 * 60 * 1000;
          const response = await fetch(
            `/api/station/${stationId}/schedule/upnext`
          );
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Failed to fetch tracks");
          }

          console.log("Upcoming tracks loaded", stationId, data);

          if (data && data.length > 0) {
            setUpcomingTracks(data);
            let nextTrackTime = new Date(
              data[0].dateScheduled.replace(" ", "T") + "Z"
            ).toLocaleString();

            let now = new Date().toLocaleString();
            let diff = new Date(nextTrackTime) - new Date(now);

            timeout = setTimeout(() => {
              fetchUpcomingTracks(station.id);
            }, diff);
          }
          setloadingUpcomingTracks(false);

          timeout = setTimeout(() => {
            fetchUpcomingTracks(station.id);
          }, TIMEOUT_SECONDS);
        } catch (error) {
          console.error("Error fetching tracks:", error);
          setloadingUpcomingTracks(false);
        }
      };
      fetchUpcomingTracks(station.id);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [station]);

  return (
    <StationContext.Provider
      value={{
        station,
        setStation,
        stationsList,
        tracks,
        currentPlaying,
        addTrack,
        loadingStations,
        loadingTracks,
        upcomingTracks,
        loadingUpcomingTracks,
      }}
    >
      {children}
    </StationContext.Provider>
  );
};
