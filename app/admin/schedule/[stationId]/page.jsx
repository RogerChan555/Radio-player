"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import BreadCrumb from "@/components/Breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Edit, MoreHorizontal, Plus, Trash, Trash2 } from "lucide-react";
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
import { useEffect, useRef, useState, useCallback } from "react";
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

const breadcrumbItems = [
  { title: "Station", link: "/admin/station" },
  { title: "Schedule", link: "" },
];

export default function SchedulePage() {
  const params = useParams();
  let stationID = params.stationId;

  const [loading, setLoading] = useState(false);
  const [deleteTrack, setDeleteTrack] = useState(null);
  const [deleteAll, setDeleteAll] = useState(null);
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
        let currentStation = await response.json();
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
      formattedDate = formattedDate.toISOString().split('T')[0];
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
        let currentTracks = await response.json();
        setTracks(currentTracks);
      } catch (error) {
        console.error("Failed to fetch tracks", error);
      }
    };

    fetchTracks();
  }, [stationID, selectedDate]);

  const handleDateClick = (arg) => {
    const selectedCalendarDate = new Date(arg.date);
    setSelectedDate(selectedCalendarDate);
  };

  // called when the calendar's data are initially set, or when they change
  const handleMonthChange = async (arg) => {
    let startMonth = new Date(arg.start).getMonth();
    let endMonth = new Date(arg.end).getMonth();
    let selectedMonth = endMonth//Math.floor((startMonth + endMonth) / 2);
    let date = new Date(arg.start);
    date.setMonth(date.getMonth() + 1); // Add one month
    let selectedYear = date.getUTCFullYear(); // Get the year
    try {
      const response = await fetch(
        `/api/station/${stationID}/schedule?month=${selectedMonth
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
      formData.append("_method", "DELETEGROUP");
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
      fetchAllTracks();

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
        description: error.message || "An unknown error occurred.",
        timeout: 10000,
      });
    }
  };
  const handleDialogClose = () => {
    setCurrentTrack(null); // Reset the current track when dialog closes
    setOpen(false); // Close the dialog
  };
  const handleRemoveAll = async () => {
    setLoading(true);
    try {
      let formData = new FormData();
      formData.append("_method", "DELETEALL");
      formData.append("stationId", deleteAll);
      const response = await fetch(`/api/station/${station.id}/schedule`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const res = await response.json();
        throw new Error(res.error || `Error removing all tracks`);
      }

      setLoading(false);
      setTracks([]); // Clear the tracks list

      handleMonthChange({
        start: calendarRef.current.getApi().view.activeStart,
        end: calendarRef.current.getApi().view.activeEnd,
      });
      setDeleteAll(null)
      toast({
        variant: "success",
        title: "Success!",
        description: `All tracks removed successfully.`,
        timeout: 10000,
      });
    } catch (error) {
      setDeleteAll(null)
      console.log(`Error removing all tracks:`, error);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message || "An unknown error occurred.",
        timeout: 10000,
      });
    }
  };
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const [allTracks, setAllTracks] = useState([]);
  const [loadingAllTracks, setLoadingAllTracks] = useState(false);

  const fetchAllTracks = useCallback(async () => {
    console.log("fetching all tracks")
    try {
      setLoadingAllTracks(true);
      const response = await fetch(`/api/station/${stationID}/schedule?getAll=1`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const tracks = await response.json();
      console.log(tracks)
      setAllTracks(tracks);
    } catch (error) {
      console.error("Error fetching all tracks:", error);
    } finally {
      setLoadingAllTracks(false);
    }
  }, [stationID]); 
  useEffect(() => {
    if (viewAllOpen) {
      fetchAllTracks(); // Fetch tracks only when dialog opens and not fetched yet
    }
  }, [viewAllOpen, fetchAllTracks]);
  return (
    station && (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <AlertModal
          isOpen={deleteTrack}
          onClose={() => setDeleteTrack(null)}
          onConfirm={onConfirm}
          loading={loading}
          title="Are you absolutely sure?"
          description="This action cannot be undone. This will permanently delete the track."
        />

        <AlertModal
          isOpen={deleteAll}
          onClose={() => setDeleteAll(null)}
          onConfirm={handleRemoveAll}
          loading={loading}
          title="Are you absolutely sure?"
          description="This action cannot be undone. This will permanently delete all scheduled tracks for this station."
        />
        <Dialog
          open={viewAllOpen}
          onOpenChange={setViewAllOpen} // Simplify the handler
        >
          <DialogContent className="max-w-[90vw] md:max-w-[800px] p-4 overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-lg md:text-xl font-bold">All Tracks</DialogTitle>
              <DialogDescription className="text-sm md:text-base text-gray-600">
                Below is the list of all tracks scheduled for this station.
              </DialogDescription>
            </DialogHeader>

            <div className="tracks-container max-h-[60vh] overflow-y-auto">
              {allTracks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full table-auto border-collapse border border-gray-300 hidden md:table">
                    {/* Table for medium and larger screens */}
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-4 py-2 text-left">Track</th>
                        <th className="border border-gray-300 px-4 py-2 text-left" style={{ width: "150px" }}>
                          Date Scheduled
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left" style={{ width: "250px" }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {allTracks.map((track, index) => (
                        <tr
                          key={`view-track-${index}`}
                          className={`${index % 2 === 0 ? "bg-gray-50" : ""}`}
                        >
                          <td className="border border-gray-300 px-4 py-2">
                            <div className="flex items-center space-x-4">
                              <Image
                                alt={track?.trackName || "Track Artwork"}
                                src={track.artworkURL.startsWith("/schedule/")
                                  ? `/api/public${track.artworkURL}`
                                  : track.artworkURL || "/default-artwork.png"}
                                width="50"
                                height="50"
                                className="rounded-md flex-shrink-0"
                              />
                              <div>
                                <h3 className="text-sm md:text-base font-bold truncate wrap-words">{track.trackName}</h3>
                                <p className="text-xs md:text-sm text-gray-500 truncate wrap-words">{track.artistName}</p>
                              </div>
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-sm md:text-base">
                          {formatTrackTime(track.dateScheduled).date}<br></br>
                          {formatTrackTime(track.dateScheduled).time}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <div className="flex items-center space-x-2">
                              <button
                                title="Edit"
                                onClick={() => {
                                  setOpen(true);
                                  setCurrentTrack(track);
                                }}
                                className="text-blue-600 hover:underline"
                              >
                                <div className="flex items-center gap-1"><Edit className="mr-1 md:mr-2 h-4 w-4" /> Update</div>
                              </button>
                              <button
                                title="Delete"
                                onClick={() => setDeleteTrack(track.id)}
                                className="text-red-600 hover:underline"
                              >
                                <div className="flex items-center gap-1"><Trash className="h-4 w-4" /> Delete Group</div>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Mobile view */}
                  <div className="block md:hidden space-y-4">
                    {allTracks.map((track, index) => (
                      <div
                        key={`mobile-view-track-${index}`}
                        className={`p-4 border rounded-lg ${index % 2 === 0 ? "bg-gray-50" : ""}`}
                      >
                        <div className="flex items-start space-x-4">
                          <Image
                            alt={track?.trackName || "Track Artwork"}
                            src={track.artworkURL.startsWith("/schedule/")
                              ? `/api/public${track.artworkURL}`
                              : track.artworkURL || "/default-artwork.png"}
                            width="50"
                            height="50"
                            className="rounded-md flex-shrink-0"
                          />
                          <div className="flex-1">
                            <h3 className="text-base font-bold truncate wrap-words">{track.trackName}</h3>
                            <p className="text-sm text-gray-500 truncate wrap-words">{track.artistName}</p>
                            <p className="text-sm mt-1 text-gray-600">Date: {formatTrackTime(track.dateScheduled).date} {formatTrackTime(track.dateScheduled).time}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <button
                                title="Edit"
                                onClick={() => {
                                  setOpen(true);
                                  setCurrentTrack(track);
                                }}
                                className="text-blue-600 hover:underline flex items-center space-x-1"
                              >
                                <Edit className="h-4 w-4" />
                                <span>Edit</span>
                              </button>
                              <button
                                title="Delete"
                                onClick={() => setDeleteTrack(track.id)}
                                className="text-red-600 hover:underline flex items-center space-x-1"
                              >
                                <Trash className="h-4 w-4" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm md:text-base text-gray-500">No tracks available.</p>
              )}
            </div>
          </DialogContent>


        </Dialog>
        <BreadCrumb items={breadcrumbItems} />

        <div className="md:flex items-start justify-between">
          <Heading
            title={`${station.name} Schedule`}
            description="Manage station schedule."
          />
          <div className="flex gap-2 items-center justify-end">
            <Button
              className={`${cn(buttonVariants({ variant: "secondary" }))}`}
              onClick={() => setViewAllOpen(true)}
            >
              View All Tracks
            </Button>
            <Button
              className={`${cn(buttonVariants({ variant: "destructive" }))}`}
              onClick={() => setDeleteAll(stationID)}
            >
              <Trash className="h-4 w-4 mr-2" /> Remove All Tracks
            </Button>
          </div>

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
              <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleDialogClose()}>

                <DialogTrigger asChild>
                  <Button
                    className={`${cn(buttonVariants({ variant: "default" }))}`}
                    onClick={() => setOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[600px] overflow-hidden">
                  <DialogHeader>
                    <DialogTitle>{currentTrack ? "Update track" : "Add Track"}</DialogTitle>
                    {!currentTrack && (
                      <DialogDescription>
                        Add a track to the station schedule.
                      </DialogDescription>
                    )}
                  </DialogHeader>
                  <div className={'w-full max-h-[60vh] overflow-auto'}>
                    <TrackForm
                      track={currentTrack}
                      setCurrentTrack={setCurrentTrack}
                      station={station}
                      selectedDate={selectedDate}
                      setOpen={setOpen}
                      setTracks={setTracks}
                      setEvents={setEvents}
                      handleMonthChange={handleMonthChange}
                      calendarRef={calendarRef}
                      fetchAllTracks={fetchAllTracks}
                      tracks={tracks}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="tracks_container">
              {tracks &&
                tracks.map((track, index) => (
                  <div key={`track-${index}`}>
                    <div className="w-full my-2 flex flex-1 items-center">
                      <Image
                        alt={track?.trackName || "Last Played"}
                        loading="lazy"
                        width="100"
                        height="100"
                        className="flex aspect-square h-[50px] w-[50px] items-center justify-center md:h-[75px] md:w-[75px]"
                        src={track.artworkURL.startsWith("/schedule/")
                          ? `/api/public${track.artworkURL}`
                          : track.artworkURL || "/default-artwork.png"}
                      />
                      <div className="mx-4 w-full max-w-full">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-green-700">
                            {formatTrackTime(track.dateScheduled).time}
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
                                Delete Group
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="text-sm font-bold truncate line-clamp-2 whitespace-normal md:text-base wrap-words" >
                          {track.trackName}
                        </p>
                        <p className="text-sm opacity-60 truncate line-clamp-2 whitespace-normal md:text-base wrap-words">
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
  if (!dateString) {
    return { date: "Invalid date", time: "Invalid time" };
  }

  // Parse the full date and time string, ensuring it's treated as UTC
  const parsedDate = new Date(dateString.replace(" ", "T") + "Z");
  if (isNaN(parsedDate.getTime())) {
    return { date: "Invalid date", time: "Invalid time" };
  }

  // Format the date to the user's locale
  const formattedDate = parsedDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Format the time to the user's locale
  const formattedTime = parsedDate.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true, // 12-hour format with AM/PM
  });

  return { date: formattedDate, time: formattedTime };
};



