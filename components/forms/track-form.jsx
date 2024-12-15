"use client";

import * as z from "zod";
import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import { DialogFooter } from "../ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";
import { FaPencil } from "react-icons/fa6";

const formSchema = z.object({
  trackName: z.string().min(1, { message: "Track name is required" }),
  artistName: z.string().min(1, { message: "Artist name is required" }),
  dateScheduled: z.date(),
});

export const TrackForm = ({
  track,
  setCurrentTrack,
  station,
  selectedDate,
  setOpen,
  setTracks,
  setEvents,
}) => {
  const { toast } = useToast();
  const trackArtworkRef = useRef();
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [metadata, setMetadata] = useState(track ? track : null);

  const fileInputRef = useRef(null);

  const toastMessage = track
    ? "Track updated successfully."
    : "Track added successfully.";
  const action = track ? "Update track" : "Add to schedule";

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trackName: track?.trackName || "",
      artistName: track?.artistName || "",
      dateScheduled: track ? new Date(track.dateScheduled) : selectedDate,
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      let formData = new FormData();
      formData.append("trackName", data.trackName);
      formData.append("artistName", data.artistName);
      formData.append("dateScheduled", formatDateToMySQL(data.dateScheduled));
      formData.append("stationId", station.id);

      if (metadata) {
        formData.append("trackId", metadata.trackId);
        formData.append("artistId", metadata.artistId);
        formData.append("trackViewUrl", metadata.trackViewUrl);
        formData.append(
          "artworkURL",
          metadata.artworkUrl100?.replace("100x100", "600x600") ||
            metadata.artworkURL
        );
      } else {
        formData.append("artworkURL", "/api/public" + station.thumbnail);
      }

      if (fileInputRef.current.files[0]) {
        let uploadFormData = new FormData();
        uploadFormData.append("thumbnail", fileInputRef.current.files[0]);
        uploadFormData.append("stationId", station.id);
        const response = await fetch(
          `/api/station/${station.id}/schedule/upload`,
          {
            method: "POST",
            body: uploadFormData,
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Error processing request");
        }

        formData.set("artworkURL", result.thumbnail);
      }

      if (track?.id) {
        formData.append("_method", "PUT");
        formData.append("id", track.id);
      }

      let endpoint = `/api/station/${station.id}/schedule`;
      let method = "POST";

      const response = await fetch(endpoint, {
        method: method,
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error processing request");
      }

      setOpen(false);
      setCurrentTrack(null);

      setTracks((tracks) => {
        result.artworkURL =
          process.env.NODE_ENV === "production" &&
          result.artworkURL.startsWith("/schedule/")
            ? `/api/public${result.artworkURL}`
            : result.artworkURL;
        let filteredTracks = track
          ? tracks.filter((track) => track.id !== result.id)
          : tracks;
        let updatedTracks = filteredTracks;
        if (track) {
          let formattedDate = result.dateScheduled.split(" ")[0];
          let formattedTrackDate = track.dateScheduled.split(" ")[0];
          if (formattedDate === formattedTrackDate) {
            updatedTracks = [...filteredTracks, result];
          }
        } else {
          updatedTracks = [...filteredTracks, result];
        }

        // Sort the tracks by dateScheduled
        updatedTracks.sort(
          (a, b) => new Date(a.dateScheduled) - new Date(b.dateScheduled)
        );
        return updatedTracks;
      });

      setEvents((events) => {
        let eventFound = false;
        // format the date in YYYY-MM-DD
        const formattedDate = result.dateScheduled.split(" ")[0];
        const updatedEvents = events.map((event) => {
          const formattedEvent = { ...event };

          if (track) {
            const formattedTrackDate = track.dateScheduled.split(" ")[0];
            if (formattedTrackDate === event.date) {
              const totalTracks = +event.title.split(" - ")[0] - 1;
              formattedEvent.title = `${totalTracks} - Track${
                totalTracks > 1 ? "s" : ""
              }`;
            }
          }
          if (event.date === formattedDate) {
            eventFound = true;
            const totalTracks = +event.title.split(" - ")[0] + 1;
            formattedEvent.title = `${totalTracks} - Track${
              totalTracks > 1 ? "s" : ""
            }`;
          }
          return formattedEvent;
        });

        if (!eventFound) {
          updatedEvents.push({
            title: "1 - Track",
            date: formattedDate,
          });
        }
        return updatedEvents;
      });

      toast({
        variant: "success",
        title: "Success!",
        description: toastMessage,
        timeout: 10000,
      });
    } catch (error) {
      console.error("Error creating/updating track:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
        timeout: 10000,
      });
    } finally {
      setLoading(false);
    }
  };

  function formatDateToMySQL(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based in JS
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  const searchMetadata = async () => {
    setSearchLoading(true);
    const searchText =
      form.getValues("artistName") + " - " + form.getValues("trackName");
    const encodedSearchText = encodeURIComponent(searchText);
    const iTunesSearchURL = `/itunes-api/search?term=${encodedSearchText}&limit=1`;
    const response = await fetch(iTunesSearchURL);
    const json = await response.json();
    const trackData = json.results[0];
    if (trackData) {
      form.setValue("trackName", trackData.trackName);
      form.setValue("artistName", trackData.artistName);

      trackArtworkRef.current.src = trackData.artworkUrl100.replace(
        "100x100",
        "600x600"
      );

      setMetadata(trackData);
      fileInputRef.current.value = null;
    } else {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "No metadata found for this track.",
        timeout: 10000,
      });
    }
    setSearchLoading(false);
  };

  return (
    <>
      <div className="grid gap-4 py-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-8"
          >
            <div className="gap-8 md:grid md:grid-cols-2">
              <FormField
                name="dateScheduled"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Scheduled DateTime:
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <Popover
                      open={calendarOpen}
                      onOpenChange={(open) => setCalendarOpen(open)}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              `${field.value.toLocaleString([], {
                                year: "numeric",
                                month: "numeric",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })}`
                            ) : (
                              <span>Select Date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent>
                        <Calendar
                          className="p-0"
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                        <Input
                          type="time"
                          step="1" // This allows selecting seconds in the time input
                          className="mt-2"
                          // take locale date time string in format that the input expects (24hr time)
                          value={field.value?.toLocaleTimeString([], {
                            hourCycle: "h23",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                          // take hours, minutes, and seconds and update our Date object then change date object to our new value
                          onChange={(selectedTime) => {
                            const currentTime = field.value;
                            const [hours, minutes, seconds] =
                              selectedTime.target.value.split(":");
                            currentTime.setHours(
                              parseInt(hours),
                              parseInt(minutes),
                              parseInt(seconds)
                            );
                            field.onChange(currentTime);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="relative w-[100px] md:w-[150px]">
              <Image
                alt="Track Artwork"
                loading="lazy"
                width="100"
                height="100"
                className="flex aspect-square h-[100px] w-[100px] items-center justify-center md:h-[150px] md:w-[150px] mb-4 rounded"
                src={track ? track.artworkURL : station.thumbnail}
                ref={trackArtworkRef}
              />
              <Button
                disabled={searchLoading}
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="absolute top-0 right-0 bg-transparent"
              >
                <FaPencil />
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files[0];
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    trackArtworkRef.current.src = e.target.result;
                  };
                  reader.readAsDataURL(file);
                }}
                className="hidden"
                accept="image/*"
              />
            </div>

            <div className="gap-8 md:grid md:grid-cols-1">
              <FormField
                control={form.control}
                name="trackName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Track Name
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="Enter track name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="gap-8 md:grid md:grid-cols-1">
              <FormField
                control={form.control}
                name="artistName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Artist Name
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="Enter artist name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="pt-8">
              {form.getValues("trackName") && form.getValues("artistName") && (
                <Button
                  disabled={searchLoading}
                  type="button"
                  onClick={searchMetadata}
                >
                  Search metadata
                </Button>
              )}
              <Button disabled={loading} className="ml-auto" type="submit">
                {action}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </div>
    </>
  );
};
