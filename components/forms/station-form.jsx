"use client";
import * as z from "zod";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import { MultiSelect } from "../multi-select";
import { minifyScript } from "@/lib/utils";

const MAX_FILE_SIZE = 1024 * 1024 * 5;
const ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const formSchema = z
  .object({
    isDefault: z.boolean().optional(),
    isActive: z.boolean().optional(),
    name: z
      .string()
      .min(3, { message: "Station Name must be at least 3 characters" }),
    metaPreset: z.string().optional(),
    refUrl: z.string().url({ message: "Please provide a valid URL" }),
    url: z.string().url({ message: "Please provide a valid URL" }),
    donateLink: z.string().optional(),
    gtm: z.string().optional(),
    analytics: z.string().optional(),
    logo: z
      .any()
      .refine((files) => files?.length >= 1, { message: "Image is required." })
      .refine(
        (files) => files[0]?.size <= MAX_FILE_SIZE,
        `Max image size is 5MB.`
      )
      .refine(
        (files) => ACCEPTED_MIME_TYPES.includes(files[0]?.type),
        "Only .jpg, .jpeg, .png and .webp formats are supported."
      )
      .or(z.any().optional()),
    logoOld: z.string().optional(),
    thumbnail: z
      .any()
      .refine((files) => files?.length >= 1, { message: "Image is required." })
      .refine(
        (files) => files[0]?.size <= MAX_FILE_SIZE,
        `Max image size is 5MB.`
      )
      .refine(
        (files) => ACCEPTED_MIME_TYPES.includes(files[0]?.type),
        "Only .jpg, .jpeg, .png and .webp formats are supported."
      )
      .or(z.any().optional()),
    thumbnailOld: z.string().optional(),
    backgroundImage: z
      .any()
      .refine((files) => files?.length >= 1, { message: "Image is required." })
      .refine(
        (files) => files[0]?.size <= MAX_FILE_SIZE,
        `Max image size is 5MB.`
      )
      .refine(
        (files) => ACCEPTED_MIME_TYPES.includes(files[0]?.type),
        "Only .jpg, .jpeg, .png and .webp formats are supported."
      )
      .or(z.any().optional()),
    backgroundImageOld: z.string().optional(),
  })
  // Perform conditional validation to ensure either a valid email or phone number is provided.
  .superRefine(
    (
      {
        logo,
        logoOld,
        thumbnail,
        thumbnailOld,
        backgroundImage,
        backgroundImageOld,
      },
      refinementContext
    ) => {
      let issues = [];

      if (logo.length === 0 && !logoOld) {
        issues.push(
          refinementContext.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Image is required",
            path: ["logo"],
          })
        );
      }

      if (thumbnail.length === 0 && !thumbnailOld) {
        issues.push(
          refinementContext.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Image is required",
            path: ["thumbnail"],
          })
        );
      }

      if (backgroundImage.length === 0 && !backgroundImageOld) {
        issues.push(
          refinementContext.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Image is required",
            path: ["backgroundImage"],
          })
        );
      }

      return issues;
    }
  );

export const StationForm = ({ initialData }) => {
  const stationID = initialData?.id;
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const title = stationID ? "Edit station" : "Create station";
  const description = stationID ? "Edit a station." : "Add a new station";
  const toastMessage = stationID ? "Station updated." : "Station created.";
  const action = stationID ? "Save changes" : "Create";

  const [advertisements, setAdvertisements] = useState(
    initialData?.advertisements ? JSON.parse(initialData?.advertisements) : []
  );
  const [advertisementList, setAdvertisementList] = useState(null);
  const [stationLogo, setStationLogo] = useState(null);
  const [stationThumbnail, setStationThumbnail] = useState(null);
  const [stationBackgroundImage, setStationBackgroundImage] = useState(null);

  const [stationLogoOld, setStationLogoOld] = useState(
    initialData?.stationLogoOld
  );
  const [stationThumbnailOld, setStationThumbnailOld] = useState(
    initialData?.stationThumbnailOld
  );
  const [stationBackgroundImageOld, setStationBackgroundImageOld] = useState(
    initialData?.stationBackgroundImageOld
  );

  const defaultValues = initialData;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const nameRef = form.register("name");

  const logoRef = form.register("logo");
  const thumbnailRef = form.register("thumbnail");
  const backgroundImageRef = form.register("backgroundImage");

  const logoOldRef = form.register("logoOld");
  const thumbnailOldRef = form.register("thumbnailOld");
  const backgroundImageOldRef = form.register("backgroundImageOld");

  useEffect(() => {
    if (initialData && !advertisementList) {
      fetch(`/api/advertisement`)
        .then((response) => response.json())
        .then((data) => {
          setAdvertisementList(
            data.map((item) => ({ value: item.id, label: item.name }))
          );
        });
    }
  }, [initialData, advertisementList]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      let formData = new FormData();
      formData.append("isDefault", data.isDefault);
      formData.append("isActive", data.isActive);
      formData.append("name", data.name);
      formData.append("metaPreset", data.metaPreset);
      formData.append(
        "refUrl",
        data.refUrl.replace(process.env.NEXT_PUBLIC_APP_URL + "/", "").trim()
      );
      formData.append("url", data.url);
      formData.append("donateLink", data.donateLink);
      formData.append("gtm", data.gtm);
      formData.append("analytics", minifyScript(data.analytics));
      formData.append("advertisements", JSON.stringify(advertisements));
      formData.append("logo", data.logo[0]);
      formData.append("thumbnail", data.thumbnail[0]);
      formData.append("backgroundImage", data.backgroundImage[0]);

      let endpoint = "/api/station";
      let method = "POST";
      if (stationID) {
        formData.append("id", stationID);
        endpoint = `/api/station/${stationID}`;
      }

      const response = await fetch(endpoint, {
        method: method,
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error processing request");
      }

      router.push(`/admin/station`);
      router.refresh();

      toast({
        variant: "success",
        title: "Success!",
        description: stationID
          ? "Station created successfully."
          : "Station updated successfully.",
        timeout: 10000,
      });
    } catch (error) {
      console.error("Error creating/updating station:", error);
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

  const convertNameToRefURL = (name) => {
    const isDefault = form.getValues("isDefault");
    let refUrl = process.env.NEXT_PUBLIC_APP_URL + "/";
    refUrl += !isDefault
      ? name
          .toLowerCase()
          .replace(/ /g, "-")
          .replace(/[^\w-]+/g, "")
      : "";
    form.setValue("refUrl", refUrl);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-8 pb-[100px]"
        >
          <div className="gap-8 md:grid md:grid-cols-2">
            <FormField
              control={form.control}
              name="isDefault"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Default Station</FormLabel>
                    <FormDescription>
                      Set this station as the default station.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
          <div className="gap-8 md:grid md:grid-cols-2">
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      Enable or disable this station.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
          <div className="gap-8 md:grid md:grid-cols-2">
            <FormField
              control={form.control}
              name="metaPreset"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Preset</FormLabel>
                  <FormControl>
                    <Input placeholder="Station meta preset" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="gap-8 md:grid md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={() => (
                <FormItem>
                  <FormLabel>
                    Name
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Station name"
                      {...nameRef}
                      onChange={(event) => {
                        convertNameToRefURL(event.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="gap-8 md:grid md:grid-cols-2">
            <FormField
              control={form.control}
              name="refUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Station URL
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input readOnly={1} placeholder="Station URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="gap-8 md:grid md:grid-cols-2">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Stream URL
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Station stream URL"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="gap-8 md:grid md:grid-cols-2">
            <FormField
              control={form.control}
              name="donateLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Donate URL</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Station donation URL"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="gap-8 md:grid md:grid-cols-2">
            <FormField
              control={form.control}
              name="gtm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GTM ID</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Google Tag ID"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="gap-8 md:grid md:grid-cols-2">
            <FormField
              control={form.control}
              name="analytics"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Analytics</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={loading}
                      placeholder="Place any analysis / tracking code here"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="gap-8 md:grid md:grid-cols-2">
            <FormItem>
              <FormLabel>Advertisements</FormLabel>
              <FormControl>
                {advertisementList && (
                  <MultiSelect
                    options={advertisementList}
                    onValueChange={setAdvertisements}
                    defaultValue={advertisements}
                    placeholder="Select advertisements"
                    variant="inverted"
                    animation={0}
                    maxCount={10}
                  />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          </div>
          <div className="gap-8 space-y-8 md:grid md:grid-cols-3 md:space-y-0">
            <FormField
              control={form.control}
              name="logo"
              render={() => (
                <FormItem>
                  <FormLabel>
                    Logo
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Station logo image"
                      type="file"
                      accept="image/*"
                      {...logoRef}
                      onChange={(event) => {
                        if (event.target.files[0]) {
                          let objectURL = URL.createObjectURL(
                            event.target.files[0]
                          );
                          setStationLogo(objectURL);
                        } else {
                          setStationLogo(null);
                        }
                      }}
                      onClick={(event) => {
                        setStationLogo(null);
                        setStationLogoOld(null);
                        event.target.value = null;
                        form.setValue("logoOld", "");
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  {(stationLogo || stationLogoOld) && (
                    <Image
                      src={stationLogo || stationLogoOld}
                      alt="Station logo"
                      width={200}
                      height={200}
                      className="w-full h-auto shadow-md rounded-md"
                    />
                  )}
                  <input
                    name="logoOld"
                    type="hidden"
                    value={stationLogoOld || ""}
                    {...logoOldRef}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="thumbnail"
              render={() => (
                <FormItem>
                  <FormLabel>
                    Thumbnail
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Station thumbnail image"
                      type="file"
                      accept="image/*"
                      {...thumbnailRef}
                      onChange={(event) => {
                        if (event.target.files[0]) {
                          let objectURL = URL.createObjectURL(
                            event.target.files[0]
                          );
                          setStationThumbnail(objectURL);
                        } else {
                          setStationThumbnail(null);
                        }
                      }}
                      onClick={(event) => {
                        setStationThumbnail(null);
                        setStationThumbnailOld(null);
                        event.target.value = null;
                        form.setValue("thumbnailOld", "");
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  {(stationThumbnail || stationThumbnailOld) && (
                    <Image
                      src={stationThumbnail || stationThumbnailOld}
                      alt="Station thumbnail"
                      width={200}
                      height={200}
                      className="w-full h-auto shadow-md rounded-md"
                    />
                  )}
                  <input
                    name="thumbnailOld"
                    type="hidden"
                    value={stationThumbnailOld || ""}
                    {...thumbnailOldRef}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="backgroundImage"
              render={() => (
                <FormItem>
                  <FormLabel>
                    Background
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Station background image"
                      type="file"
                      accept="image/*"
                      {...backgroundImageRef}
                      onChange={(event) => {
                        if (event.target.files[0]) {
                          let objectURL = URL.createObjectURL(
                            event.target.files[0]
                          );
                          setStationBackgroundImage(objectURL);
                        } else {
                          setStationBackgroundImage(null);
                        }
                      }}
                      onClick={(event) => {
                        setStationBackgroundImage(null);
                        setStationBackgroundImageOld(null);
                        event.target.value = null;
                        form.setValue("backgroundImageOld", "");
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  {(stationBackgroundImage || stationBackgroundImageOld) && (
                    <Image
                      src={stationBackgroundImage || stationBackgroundImageOld}
                      alt="Station background"
                      width={200}
                      height={200}
                      className="w-full h-auto shadow-md rounded-md"
                    />
                  )}
                  <input
                    name="backgroundImageOld"
                    type="hidden"
                    value={stationBackgroundImageOld || ""}
                    {...backgroundImageOldRef}
                  />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
