"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Fragment, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { UserContext } from "@/context/user";
import { z } from "zod";

const profileFormSchema = z
  .object({
    name: z.string().min(2, {
      message: "Full name must be at least 2 characters.",
    }),
    username: z.string().min(2, {
      message: "Username must be at least 2 characters.",
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  });

const passwordFormSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Be at least 8 characters long" })
      .regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
      .regex(/[0-9]/, { message: "Contain at least one number." })
      .regex(/[^a-zA-Z0-9]/, {
        message: "Contain at least one special character.",
      })
      .trim(),
    confirm_password: z
      .string()
      .min(8, { message: "Be at least 8 characters long" })
      .regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
      .regex(/[0-9]/, { message: "Contain at least one number." })
      .regex(/[^a-zA-Z0-9]/, {
        message: "Contain at least one special character.",
      })
      .trim(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  });

export default function ProfileForm() {
  const { user } = useContext(UserContext);
  const [isProfileLoaded, setIsProfileLoaded] = useState(true);
  const [isPasswordLoaded, setIsPasswordLoaded] = useState(true);
  const [profileErrors, setProfileErrors] = useState(null);
  const [passwordErrors, setPasswordErrors] = useState(null);
  const { toast } = useToast();
  const router = useRouter();

  const profileForm = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      username: user?.username || "",
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      password: "",
      confirm_password: "",
    },
  });

  async function onProfileSubmit(data) {
    data.id = user.id;
    setIsProfileLoaded(false);
    try {
      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      setIsProfileLoaded(true);

      if (!response.ok) {
        console.log("response.error", result.error);
        toast({
          variant: "destructive",
          title: "Error!",
          description: result.error || "Something went wrong!",
          timeout: 10000,
        });
        return;
      }

      if (result.errors) {
        setProfileErrors(result.errors);
        return;
      }

      toast({
        variant: "success",
        title: "Success!",
        description: "Profile updated successfully!",
        timeout: 10000,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      setIsProfileLoaded(true);
      toast({
        variant: "destructive",
        title: "Error!",
        description: error.message || "Something went wrong!",
        timeout: 10000,
      });
    }
  }

  async function onPasswordSubmit(data) {
    data.id = user.id;
    setIsPasswordLoaded(false);
    try {
      const response = await fetch("/api/user/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      setIsPasswordLoaded(true);

      if (!response.ok) {
        console.log("response.error", result.error);
        toast({
          variant: "destructive",
          title: "Error!",
          description: result.error || "Something went wrong!",
          timeout: 10000,
        });
        return;
      }

      if (result.errors) {
        setPasswordErrors(result.errors);
        return;
      }

      toast({
        variant: "success",
        title: "Success!",
        description: "Password updated successfully!",
        timeout: 10000,
      });
    } catch (error) {
      setIsPasswordLoaded(true);
      toast({
        variant: "destructive",
        title: "Error!",
        description: error.message || "Something went wrong!",
        timeout: 10000,
      });
    }
  }

  return (
    <Fragment>
      <Form {...profileForm}>
        <form
          onSubmit={profileForm.handleSubmit(onProfileSubmit)}
          className="space-y-6"
        >
          <FormField
            control={profileForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
                {profileErrors && profileErrors.name && (
                  <FormMessage>{profileErrors.name}</FormMessage>
                )}
              </FormItem>
            )}
          />
          <FormField
            control={profileForm.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
                {profileErrors && profileErrors.username && (
                  <FormMessage>{profileErrors.username}</FormMessage>
                )}
              </FormItem>
            )}
          />
          <div className="w-full text-right">
            <Button type="submit" disabled={!isProfileLoaded}>
              {!isProfileLoaded ? "Submitting..." : "Update Profile"}
            </Button>
          </div>
        </form>
      </Form>

      <Separator className="my-5" />

      <Form {...passwordForm}>
        <form
          onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
          className="space-y-6"
        >
          <FormField
            control={passwordForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
                {passwordErrors && passwordErrors.password && (
                  <FormMessage>{passwordErrors.username.password}</FormMessage>
                )}
              </FormItem>
            )}
          />
          <FormField
            control={passwordForm.control}
            name="confirm_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
                {passwordErrors && passwordErrors.confirm_password && (
                  <FormMessage>
                    {passwordErrors.username.confirm_password}
                  </FormMessage>
                )}
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={!isPasswordLoaded}
            className="float-end"
          >
            {!isPasswordLoaded ? "Submitting..." : "Reset Password"}
          </Button>
        </form>
      </Form>
    </Fragment>
  );
}
