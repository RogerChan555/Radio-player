"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import BreadCrumb from "@/components/Breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Edit, MoreHorizontal, Plus, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { TrackForm } from "@/components/forms/track-form";
import { Badge } from "@/components/ui/badge";
import { AlertModal } from "@/components/modal/alert-modal";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { set } from "date-fns";

const breadcrumbItems = [
  { title: "Station", link: "/admin/station" },
  { title: "Schedule", link: "" },
];

export default function SchedulePage() {
  const params = useParams();
  let stationID = params.stationId;

  const [loading, setLoading] = useState(false);
  const [deleteTrack, setDeleteTrack] = useState(null);
  const [station, setStation] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tracks, setTracks] = useState([]);
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStation = async () => {
      try {
        const response = await fetch(`/api/station/${stationID}`, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        let currentStation = data;
        setStation(currentStation);
      } catch (error) {
        console.error("Failed to fetch stations", error);
      }
    };

    fetchStation();
  }, [stationID]);

  useEffect(() => {
    const fetchTracks = async () => {
      let formattedDate = new Date(selectedDate);
      formattedDate = `${formattedDate.getFullYear()}-${
        formattedDate.getMonth() + 1
      }-${formattedDate.getDate()}`;
      try {
        const response = await fetch(
          `/api/station/${stationID}/schedule/${formattedDate}`,
          {
            method: "GET",
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        let currentTracks = data;
        setTracks(currentTracks);
      } catch (error) {
        console.error("Failed to fetch tracks", error);
      }
    };

    fetchTracks();
  }, [stationID, selectedDate]);

  const handleDateClick = (arg) => {
    const selectedCalendarDate = new Date(arg.dateStr);
    setSelectedDate(selectedCalendarDate);
  };

  // called when the calendar's data are initially set, or when they change
  const handleMonthChange = async (arg) => {
    let startMonth = new Date(arg.start).getMonth();
    let endMonth = new Date(arg.end).getMonth();
    let selectedMonth = Math.floor((startMonth + endMonth) / 2);
    let selectedYear = new Date(arg.start).getFullYear();
    try {
      const response = await fetch(
        `/api/station/${stationID}/schedule?month=${
          selectedMonth + 1
        }&year=${selectedYear}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Failed to fetch tracks", error);
    }
  };

  const calendarRef = useRef(null);

  const onConfirm = async () => {
    setLoading(true);
    try {
      let formData = new FormData();
      formData.append("_method", "DELETE");
      formData.append("trackId", deleteTrack);
      const response = await fetch(`/api/station/${station.id}/schedule`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const res = await response.json();
        throw new Error(res.error || `Error deleting track`);
      }
      setLoading(false);
      setDeleteTrack(null);

      let updatedTracks = tracks.filter((track) => track.id !== deleteTrack);
      setTracks(updatedTracks);

      handleMonthChange({
        start: calendarRef.current.getApi().view.activeStart,
        end: calendarRef.current.getApi().view.activeEnd,
      });

      toast({
        variant: "success",
        title: "Success!",
        description: `Track deleted successfully.`,
        timeout: 10000,
      });
    } catch (error) {
      console.error(`Error deleting track:`, error);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
        timeout: 10000,
      });
    }
  };

  return (
    station && (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <AlertModal
          isOpen={deleteTrack}
          onClose={() => setDeleteTrack(null)}
          onConfirm={onConfirm}
          loading={loading}
        />
        <BreadCrumb items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading
            title={`${station.name} Schedule`}
            description="Manage station schedule."
          />
        </div>
        <Separator />
        <div className="flex flex-col-reverse md:flex-row gap-10">
          <div className="max-w-[800px] md:w-[40%]">
            <div className="flex items-start justify-between">
              <div className="flex flex-col mb-8 mt-1">
                <h2 className="text-2xl font-semibold">Station Schedule</h2>
                <span className="text-sm text-gray-500">
                  {selectedDate ? selectedDate.toDateString() : ""}
                </span>
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button
                    className={`${cn(buttonVariants({ variant: "default" }))}`}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Add track</DialogTitle>
                    <DialogDescription>
                      Add a track to the station schedule.
                    </DialogDescription>
                  </DialogHeader>
                  <TrackForm
                    track={currentTrack}
                    setCurrentTrack={setCurrentTrack}
                    station={station}
                    selectedDate={selectedDate}
                    setOpen={setOpen}
                    setTracks={setTracks}
                    setEvents={setEvents}
                  />
                </DialogContent>
              </Dialog>
            </div>
            <div className="tracks_container">
              {tracks &&
                tracks.map((track, index) => (
                  <div key={`track-${index}`}>
                    <div className="w-full my-2 flex w-full flex-1 items-center">
                      <Image
                        alt={track?.trackName || "Last Played"}
                        loading="lazy"
                        width="100"
                        height="100"
                        className="flex aspect-square h-[50px] w-[50px] items-center justify-center md:h-[75px] md:w-[75px]"
                        src={track.artworkURL}
                      />
                      <div className="mx-4 w-full max-w-full">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-green-700">
                            {formatTrackTime(track.dateScheduled)}
                          </Badge>
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => {
                                  setOpen(true);
                                  setCurrentTrack(track);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" /> Update
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-500"
                                onClick={() => setDeleteTrack(track.id)}
                              >
                                <Trash className="mr-2 h-4 w-4 text-red-500" />{" "}
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="text-sm font-bold truncate line-clamp-2 whitespace-normal md:text-base">
                          {track.trackName}
                        </p>
                        <p className="text-sm opacity-60 truncate line-clamp-2 whitespace-normal md:text-base">
                          {track.artistName}
                        </p>
                      </div>
                    </div>
                    <Separator />
                  </div>
                ))}
              {tracks && tracks.length === 0 && (
                <div className="flex items-center justify-center h-40">
                  <p className="text-sm text-gray-500">No tracks scheduled</p>
                </div>
              )}
            </div>
          </div>
          <div className="md:w-[60%]">
            <FullCalendar
              ref={calendarRef}
              // timeZone="UTC"
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              dateClick={handleDateClick}
              nowIndicator={true}
              selectable={true}
              datesSet={handleMonthChange}
              events={events}
            />
          </div>
        </div>
      </div>
    )
  );
}

const formatTrackTime = (dateString) => {
  let time = dateString.split(" ")[1];
  if (!time) {
    time = "00:00:00";
  }
  let timeArray = time.split(":");

  // Get hours, minutes, and seconds
  let hours = timeArray[0];
  let minutes = timeArray[1];
  let seconds = timeArray[2];

  // Determine AM or PM
  const ampm = hours >= 12 ? "PM" : "AM";

  // Convert hours from 24-hour format to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // The hour '0' should be '12'

  // Format minutes and seconds to always be two digits
  const minutesStr = minutes.length < 2 ? "0" + minutes : minutes;
  const secondsStr = seconds.length < 2 ? "0" + seconds : seconds;

  // Combine into the final formatted time
  const formattedTime =
    hours + ":" + minutesStr + ":" + secondsStr + " " + ampm;

  return formattedTime;
};
