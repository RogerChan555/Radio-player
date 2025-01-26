"use client";

import * as z from "zod";
import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import { DialogFooter } from "../ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";
import { FaPencil } from "react-icons/fa6";
import * as Switch from "@radix-ui/react-switch";
import * as RadioGroup from "@radix-ui/react-radio-group";
import * as Checkbox from "@radix-ui/react-checkbox";
import classNames from "classnames";
import { AlertModal } from "@/components/modal/alert-modal";
import { formatTrackTime, formatDateToMySQL } from '@/utils/dateUtils';

const daysWeek = [
  {
    value: 'Sunday',
  },
  {
    value: 'Monday',
  },
  {
    value: 'Tuesday',
  },
  {
    value: 'Wednesday',
  },
  {
    value: 'Thursday',
  },
  {
    value: 'Friday',
  },
  {
    value: 'Saturday',
  },
];
const period = [
  {
    value: 'daily'
  },
  {
    value: 'monthly'
  },
];
const formSchema = z.object({
  ...Array.from({ length: 31 }, (_, i) => i + 1).reduce(
    (acc, day) => {
      acc[day] = z.boolean().default(false); // Validate as boolean
      return acc;
    },
    { "Last Day": z.boolean().default(false) } // Add "Last Day"
  ),
  trackName: z.string().min(1, { message: "Track name is required" }),
  artistName: z.string().min(1, { message: "Artist name is required" }),
  dateScheduled: z.date(),
  dateScheduledEnd: z.date(),
  repeat: z.boolean(),
  period: z.string(),
  Sunday: z.boolean().default(false),
  Monday: z.boolean().default(false),
  Tuesday: z.boolean().default(false),
  Wednesday: z.boolean().default(false),
  Thursday: z.boolean().default(false),
  Friday: z.boolean().default(false),
  Saturday: z.boolean().default(false),
});

export const DaysItem = ({ value, control }) => {
  return (
    <FormField
      control={control}
      name={value?.value}
      render={({ field }) => (
        <div className="flex items-center p-1">
          <Checkbox.Root
            // Make sure the UI reflects the current boolean
            checked={!!field.value}
            // This updates the form state when checked/unchecked
            onCheckedChange={(checked) => field.onChange(checked)}
            className="size-4 appearance-none items-center justify-center rounded bg-white shadow-[0_2px_10px]"
          >
            <Checkbox.Indicator className="relative flex size-full items-center justify-center after:block after:size-[11px] after:rounded-full after:bg-primary" />
          </Checkbox.Root>

          <label className="pl-4 text-sm leading-none">
            {value?.value}
          </label>
        </div>
      )}
    />
  );
};

export const DaysGroup = ({ control, setValue }) => {
  const checkDays = (days) => {
    days.forEach((day) => {
      setValue(day, true); // Set selected days to true
    });
  };

  const uncheckAllDays = () => {
    daysWeek.forEach((day) => {
      setValue(day.value, false); // Uncheck all days
    });
  };

  return (
    <div>
      {/* Weekly Button */}
      <div className="flex gap-2 mb-4">
        <Button
          type="button"
          onClick={() => {
            uncheckAllDays();
            checkDays(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
          }}
        >
          Weekly (Mon-Fri)
        </Button>

        {/* Weekends Button */}
        <Button
          type="button"
          onClick={() => {
            uncheckAllDays();
            checkDays(["Saturday", "Sunday"]);
          }}
        >
          Weekends (Sat-Sun)
        </Button>
      </div>

      {/* Days of the Week */}
      <div className="grid grid-cols-3 gap-2.5 py-6">
        {daysWeek.map((e, i) => (
          <DaysItem key={i} value={e} control={control} />
        ))}
      </div>
    </div>
  );
};


export const DaysOfMonthItem = ({ value, control }) => {
  return (
    <FormField
      control={control}
      name={`${value}`} // Use the value directly as the field name
      render={({ field }) => (
        <div className="flex items-center p-1">
          <Checkbox.Root
            checked={field.value || false} // Default to `false` if undefined
            className="size-4 appearance-none items-center justify-center rounded bg-white shadow-[0_2px_10px] shadow-blackA4 outline-none hover:bg-violet3 focus:shadow-[0_0_0_2px_black]"
            onCheckedChange={field.onChange}
          >
            <Checkbox.Indicator
              className="relative flex size-full items-center justify-center after:block after:size-[11px] after:rounded-full after:bg-primary"
            />
          </Checkbox.Root>

          <label className="pl-4 text-sm leading-none" htmlFor={value}>
            {value}
          </label>
        </div>
      )}
    />
  );
};


export const DaysOfMonthGroup = ({ control }) => {
  return (
    <div className="grid grid-cols-5 gap-2.5 py-6">
      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
        <DaysOfMonthItem key={day} value={day} control={control} />
      ))}
      <DaysOfMonthItem key="Last Day" value="Last Day" control={control} />
    </div>
  );
};


export const PeriodRadioItem = ({ value, label }) => {
  return (
    <div className="flex items-center p-1">
      <RadioGroup.Item
        className="size-4 cursor-default rounded-full bg-white shadow-[0_2px_10px] shadow-blackA4 outline-none hover:bg-violet3 focus:shadow-[0_0_0_2px] focus:shadow-black"
        value={value}
        id={label}
      >
        <RadioGroup.Indicator
          className="relative flex size-full items-center justify-center after:block after:size-[11px] after:rounded-full after:bg-primary" />
      </RadioGroup.Item>
      <label
        className="pl-4 text-sm leading-none"
        htmlFor={label}
      >
        {label}
      </label>
    </div>
  )
}
export const PeriodRadioGroup = ({ field }) => {
  return (
    <RadioGroup.Root
      name='period'
      className="grid grid-cols-3 gap-2.5 py-6"
      defaultValue={period[0].value}
      onValueChange={(e) => {
        field.onChange(e)
      }}
      aria-label="View density"
    >
      {
        period.map((e, i) =>
          <PeriodRadioItem key={i} value={e.value} label={e.value} />
        )
      }
    </RadioGroup.Root>
  )
}

export const TrackForm = ({
  track,
  setCurrentTrack,
  station,
  selectedDate,
  setOpen,
  setTracks,
  setEvents,
  handleMonthChange,
  calendarRef,
  fetchAllTracks,
  tracks,
}) => {
  const { toast } = useToast();
  const trackArtworkRef = useRef();
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarOpenEnd, setCalendarOpenEnd] = useState(false);
  const [metadata, setMetadata] = useState(track ? track : null);
  const [repeat, setRepeat] = useState(false);
  const fileInputRef = useRef(null);

  const toastMessage = track
    ? "Track updated successfully."
    : "Track added successfully.";
  const action = track ? "Update track" : "Add to schedule";

  const daysDefaultValues = daysWeek.reduce((acc, e) => {
    acc[e.value] = false; // Default unchecked
    return acc;
  }, {});
  const dayOfSelectedDate = new Date(selectedDate).getDate(); // Extract the day of the month

  const daysOfMonthDefaultValues = Array.from({ length: 31 }, (_, i) => i + 1).reduce(
    (acc, day) => {
      acc[day] = day === dayOfSelectedDate; // Set true for the selected day
      return acc;
    },
    { "Last Day": false } // Add "Last Day" with default unchecked
  );
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...daysDefaultValues,
      ...daysOfMonthDefaultValues,
      trackName: track?.trackName || "",
      artistName: track?.artistName || "",
      dateScheduled: track ? new Date(track.dateScheduled.replace(" ", "T") + "Z") : selectedDate,
      dateScheduledEnd: track ? new Date(track.dateScheduled) : selectedDate,
      repeat: false,
      period: period[0].value,
    },
  });

  useEffect(() => {
    let formData = form.getValues();
    if (formData.repeat !== repeat) {
      setRepeat(formData.repeat);
    }
  }, [form.getValues()]);


  const onSubmit = async (data) => {
    try {
      setLoading(true);
      let formData = new FormData();
      formData.append("trackName", data.trackName);
      formData.append("artistName", data.artistName);
      formData.append("dateScheduled", formatDateToMySQL(data.dateScheduled));
      formData.append("dateScheduledEnd", data.dateScheduledEnd && formatDateToMySQL(data.dateScheduledEnd));
      formData.append("stationId", station.id);
      formData.append("repeat", data.repeat);
      formData.append("period", data.period);
      daysWeek.map((e) => {
        formData.append([e.value], data[e.value])
      });
      Array.from({ length: 31 }, (_, i) => `${i + 1}`).forEach((day) => {
        formData.append(day, data[day]);
      });

      // Append "Last Day"
      formData.append("Last Day", data["Last Day"]);
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
        const artworkURL = station.thumbnail;

        formData.append("artworkURL", artworkURL);

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
        const formattedDate = result?.dateScheduled.split(" ")[0];
        const updatedEvents = events.map((event) => {
          const formattedEvent = { ...event };

          if (track) {
            const formattedTrackDate = track.dateScheduled.split(" ")[0];
            if (formattedTrackDate === event.date) {
              const totalTracks = +event.title.split(" - ")[0] - 1;
              formattedEvent.title = `${totalTracks} - Track${totalTracks > 1 ? "s" : ""
                }`;
            }
          }
          if (event.date === formattedDate) {
            eventFound = true;
            const totalTracks = +event.title.split(" - ")[0] + 1;
            formattedEvent.title = `${totalTracks} - Track${totalTracks > 1 ? "s" : ""
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
      handleMonthChange({
        start: calendarRef.current.getApi().view.activeStart,
        end: calendarRef.current.getApi().view.activeEnd,
      });
      fetchAllTracks();
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
  const [deleteTrack, setDeleteTrack] = useState(null);
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
      console.log('delete')
      if (!response.ok) {
        const res = await response.json();
        throw new Error(res.error || `Error deleting track`);
      }
      setLoading(false);
      setDeleteTrack(null);
      fetchAllTracks();

      let updatedTracks = tracks.filter((track) => track.id !== deleteTrack);
      setTracks(updatedTracks);
      setOpen(false);
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
  return (
    <>

      <AlertModal
        isOpen={deleteTrack}
        onClose={() => setDeleteTrack(null)}
        onConfirm={onConfirm}
        loading={loading}
        title="Are you absolutely sure?"
        description="This action cannot be undone. This will permanently delete the track."
      />
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
                render={({ field }) => {
                  const [tempTime, setTempTime] = useState(
                    field.value
                      ? field.value.toLocaleTimeString([], {
                        hourCycle: "h23",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      : ""
                  );

                  return (
                    <FormItem>
                      <FormLabel>
                        Scheduled DateTime Start:
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
                            onSelect={(date) => {
                              const updatedDate = new Date(date);
                              if (field.value) {
                                updatedDate.setHours(
                                  field.value.getHours(),
                                  field.value.getMinutes()
                                );
                              }
                              field.onChange(updatedDate);
                              setTempTime(
                                updatedDate.toLocaleTimeString([], {
                                  hourCycle: "h23",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              );
                            }}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                          <Input
                            type="time"
                            className="mt-2"
                            value={tempTime}
                            onChange={(selectedTime) => {
                              const inputTime = selectedTime.target.value;
                              setTempTime(inputTime); // Update temporary time state

                              // Validate and apply the time only if it's complete and valid
                              if (/^\d{2}:\d{2}$/.test(inputTime)) {
                                const [hours, minutes] = inputTime.split(":");
                                const updatedDate = new Date(field.value || new Date());
                                updatedDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
                                field.onChange(updatedDate); // Update the field value
                              }
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              {!track && (
                <div className={'pt-9 flex items-center '}>
                  <FormField
                    control={form.control}
                    name="repeat"
                    render={({ field }) => (
                      <>
                        <Switch.Root
                          className="relative h-[25px] w-[42px] cursor-default rounded-full bg-blackA6 shadow-[0_2px_10px] shadow-blackA4 outline-none focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-black"
                          style={{ "WebkitTapHighlightColor": "rgba(0, 0, 0, 0)" }}
                          checked={field.value}
                          onCheckedChange={(e) => {
                            field.onChange(e)
                          }}
                        >
                          <Switch.Thumb
                            className="block size-[21px] translate-x-0.5 rounded-full bg-white shadow-[0_2px_2px] shadow-blackA4 transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[19px]" />
                        </Switch.Root>
                        <label
                          className="pl-4 leading-none"
                          htmlFor="airplane-mode"
                        >
                          Repeat
                        </label>
                      </>
                    )}
                  />
                </div>
              )}
            </div>
            <div className={classNames((!repeat) ? "invisible w-0 h-0" : "visible w-full h-auto")}>
              <div className={"gap-8 md:grid md:grid-cols-2"}>
                <FormField
                  name="dateScheduledEnd"
                  control={form.control}
                  render={({ field }) => {
                    const [tempTime, setTempTime] = useState(
                      field.value
                        ? field.value.toLocaleTimeString([], {
                          hourCycle: "h23",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                        : ""
                    );

                    return (
                      <FormItem>
                        <FormLabel>
                          Scheduled DateTime End:
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <Popover
                          open={calendarOpenEnd}
                          onOpenChange={(open) => setCalendarOpenEnd(open)}
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
                              onSelect={(date) => {
                                const updatedDate = new Date(date);
                                if (field.value) {
                                  updatedDate.setHours(
                                    field.value.getHours(),
                                    field.value.getMinutes()
                                  );
                                }
                                field.onChange(updatedDate);
                                setTempTime(
                                  updatedDate.toLocaleTimeString([], {
                                    hourCycle: "h23",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                );
                              }}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                            <Input
                              type="time"
                              className="mt-2"
                              value={tempTime}
                              onChange={(selectedTime) => {
                                const inputTime = selectedTime.target.value;
                                setTempTime(inputTime); // Update temporary time state

                                // Validate and apply the time only if it's complete and valid
                                if (/^\d{2}:\d{2}$/.test(inputTime)) {
                                  const [hours, minutes] = inputTime.split(":");
                                  const updatedDate = new Date(field.value || new Date());
                                  updatedDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
                                  field.onChange(updatedDate); // Update with the new time
                                }
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

              </div>
              <div>
                <FormField
                  control={form.control}
                  name="period"
                  render={({ field }) => (
                    <PeriodRadioGroup
                      field={{
                        ...field,
                        onChange: (value) => {
                          field.onChange(value);
                          form.setValue("period", value); // Update the form state
                        },
                      }}
                    />
                  )}
                />

                {form.watch("period") !== "monthly" && (
                  <DaysGroup control={form.control} setValue={form.setValue} />
                )}
                {form.watch("period") === "monthly" && (
                  <DaysOfMonthGroup control={form.control} />
                )}
              </div>
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
            <DialogFooter className="pt-8 flex flex-start justify-between">
              {/* {form.getValues("trackName") && form.getValues("artistName") && ( */}
              <Button
                className={`${cn(buttonVariants({ variant: "destructive" }))}`}
                disabled={searchLoading}
                type="button"
                onClick={() => setDeleteTrack(track.id)}
              >
                Delete Track
              </Button>
              <div className="flex gap-2">
                <Button
                  disabled={searchLoading}
                  type="button"
                  onClick={searchMetadata}
                >
                  Search metadata
                </Button>
                {/* )} */}
                <Button disabled={loading} className="ml-auto" type="submit">
                  {action}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </div>
    </>
  );
};
