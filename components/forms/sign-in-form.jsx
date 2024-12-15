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
import { SignInFormSchema } from "@/lib/definitions";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInForm() {
  const [isLoaded, setIsLoaded] = useState(true);
  const [errors, setErrors] = useState(null);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(SignInFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(data) {
    setIsLoaded(false);
    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      setIsLoaded(true);

      if (!response.ok) {
        toast({
          title: "An error occurred",
          description: result.error || "Something went wrong.",
        });
        return;
      }

      if (result.errors) {
        setErrors(result.errors);
        return;
      }

      router.push("/admin");
    } catch (error) {
      setIsLoaded(true);
      toast({
        title: "An error occurred",
        description: error.message,
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormMessage />
              {errors && errors.username && (
                <FormMessage>{errors.username}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
              {errors && errors.password && (
                <FormMessage>{errors.password}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <Button type="submit" disabled={!isLoaded}>
          {!isLoaded ? "Submitting..." : "Sign in"}
        </Button>
      </form>
    </Form>
  );
}
