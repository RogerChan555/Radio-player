"use client";
import * as z from "zod";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
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
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

const MAX_FILE_SIZE = 1024 * 1024 * 5;
const ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const formSchema = z
  .object({
    name: z
      .string()
      .min(3, { message: "Advertisement Name must be at least 3 characters" }),
    refUrl: z.string().optional(),
    advertisementType: z.enum(["image", "iframe", "google"]),
    imageUrl: z.any().optional(),
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
    iFrameUrl: z.string().optional(),
    googleSlotId: z.string().optional(),
  })
  // Perform conditional validation to ensure either a valid email or phone number is provided.
  .superRefine(
    (
      {
        imageUrl,
        thumbnail,
        thumbnailOld,
        iFrameUrl,
        googleSlotId,
        advertisementType,
      },
      refinementContext
    ) => {
      let issues = [];
      if (advertisementType === "image") {
        if (thumbnail.length === 0 && !thumbnailOld && !imageUrl) {
          issues.push(
            refinementContext.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Image is required",
              path: ["thumbnail"],
            })
          );
        }
      } else if (advertisementType === "iframe" && !iFrameUrl) {
        issues.push(
          refinementContext.addIssue({
            code: z.ZodIssueCode.custom,
            message: "IFrame URL is required",
            path: ["iFrameUrl"],
          })
        );
      } else if (advertisementType === "google" && !googleSlotId) {
        issues.push(
          refinementContext.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Google Ads slot ID is required",
            path: ["googleSlotId"],
          })
        );
      }

      return issues;
    }
  );

export const AdvertisementForm = ({ initialData }) => {
  const advertisementID = initialData?.id;
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isIFrameLoaded, setIsIFrameLoaded] = useState(false);

  const title = advertisementID ? "Edit advertisement" : "Create advertisement";
  const description = advertisementID
    ? "Edit a advertisement."
    : "Add a new advertisement";
  const toastMessage = advertisementID
    ? "Advertisement created successfully."
    : "Advertisement updated successfully.";
  const action = advertisementID ? "Save changes" : "Create";

  const [advertisementThumbnail, setAdvertisementThumbnail] = useState(null);
  const [advertisementThumbnailOld, setAdvertisementThumbnailOld] = useState(
    initialData?.advertisementThumbnailOld
  );
  const defaultValues = { ...initialData, advertisementType: "image" };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const nameRef = form.register("name");
  const thumbnailRef = form.register("thumbnail");
  const thumbnailOldRef = form.register("thumbnailOld");

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      let formData = new FormData();
      formData.append("name", data.name);
      formData.append("refUrl", data.refUrl);
      formData.append("iFrameUrl", data.iFrameUrl);
      formData.append("imageUrl", data.imageUrl);
      formData.append("thumbnail", data.thumbnail[0]);
      formData.append("googleSlotId", data.googleSlotId);

      let endpoint = "/api/advertisement";
      let method = "POST";
      if (advertisementID) {
        formData.append("id", advertisementID);
        endpoint = `/api/advertisement/${advertisementID}`;
      }

      const response = await fetch(endpoint, {
        method: method,
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error processing request");
      }

      router.push(`/admin/advertisement`);
      router.refresh();

      toast({
        variant: "success",
        title: "Success!",
        description: toastMessage,
        timeout: 10000,
      });
    } catch (error) {
      console.error("Error creating/updating advertisement:", error);
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

  const handleIframeLoad = (event) => {
    console.log("IFrame loaded");
    setIsIFrameLoaded(true);
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
                      placeholder="Advertisement name"
                      {...nameRef}
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
                  <FormLabel>Advertisement URL</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Advertisement URL"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="gap-2 space-y-2 md:space-y-0">
            <FormField
              control={form.control}
              name="advertisementType"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} type="hidden" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormLabel>
              Advertisement Type
              <span className="text-red-500">*</span>
            </FormLabel>
            <Tabs
              defaultValue={
                advertisementThumbnailOld?.split("?")[0] != "null" ||
                initialData?.imageUrl
                  ? "image"
                  : initialData?.iFrameUrl
                  ? "iframe"
                  : "google"
              }
              className="w-[49%]"
              onValueChange={(value) => {
                form.setValue("advertisementType", value);
              }}
            >
              <TabsList className="grid w-full grid-cols-3 mt-2">
                <TabsTrigger value="image">Image</TabsTrigger>
                <TabsTrigger value="iframe">IFrame</TabsTrigger>
                <TabsTrigger value="google">Google Ads</TabsTrigger>
              </TabsList>
              <TabsContent value="image">
                <Card>
                  <CardHeader>
                    <CardTitle>Image</CardTitle>
                    <CardDescription>
                      Upload an image for the advertisement.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
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
                              placeholder="Advertisement thumbnail image"
                              type="file"
                              accept="image/*"
                              {...thumbnailRef}
                              onChange={(event) => {
                                if (event.target.files[0]) {
                                  let objectURL = URL.createObjectURL(
                                    event.target.files[0]
                                  );
                                  setAdvertisementThumbnail(objectURL);
                                } else {
                                  setAdvertisementThumbnail(null);
                                }
                              }}
                              onClick={(event) => {
                                setAdvertisementThumbnail(null);
                                setAdvertisementThumbnailOld(null);
                                event.target.value = null;
                                form.setValue("thumbnailOld", "");
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                          {(advertisementThumbnail ||
                            (advertisementThumbnailOld &&
                              advertisementThumbnailOld?.split("?")[0] !=
                                "null" &&
                              advertisementThumbnailOld?.split("?")[0] !=
                                "undefined")) && (
                            <div>
                              <Image
                                src={
                                  advertisementThumbnail ||
                                  advertisementThumbnailOld
                                }
                                alt="Advertisement thumbnail"
                                width={200}
                                height={200}
                                className="w-full h-auto shadow-md rounded-md"
                              />
                            </div>
                          )}
                          <input
                            name="thumbnailOld"
                            type="hidden"
                            value={advertisementThumbnailOld || ""}
                            {...thumbnailOldRef}
                          />
                        </FormItem>
                      )}
                    />
                    <span className="block text-sm text-gray-500 pt-4 font-bold">
                      OR
                    </span>
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Image URL
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              disabled={loading}
                              placeholder="Advertisement Image URL"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                          {form.getValues("imageUrl") && (
                            <div>
                              <Image
                                src={form.getValues("imageUrl")}
                                alt="Advertisement Image thumbnail"
                                width={200}
                                height={200}
                                className="w-full h-auto shadow-md rounded-md"
                              />
                            </div>
                          )}
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="iframe">
                <Card>
                  <CardHeader>
                    <CardTitle>IFrame</CardTitle>
                    <CardDescription>
                      Provide an IFrame URL for the advertisement.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <FormField
                      control={form.control}
                      name="iFrameUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            IFrame URL
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              disabled={loading}
                              placeholder="Advertisement IFrame URL"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <span className="block text-sm text-gray-500 pt-4">
                      Preview
                    </span>
                    <iframe
                      src={form.getValues("iFrameUrl")}
                      width="100%"
                      height="400"
                      className="rounded-md bg-gray-100"
                      onLoad={handleIframeLoad}
                    ></iframe>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="google">
                <Card>
                  <CardHeader>
                    <CardTitle>Ad Slot ID</CardTitle>
                    <CardDescription>
                      Provide Google Ads slot ID.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <FormField
                      control={form.control}
                      name="googleSlotId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Slot ID
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              disabled={loading}
                              placeholder="Google Ads slot ID"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
