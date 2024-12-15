"use client";
import { UpdateIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

// Create a context for user authentication and session information
export const UserContext = React.createContext();

// User provider component to manage user authentication and session
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = async () => {
    try {
      // Call the /api/auth/logout endpoint to log out the user
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to log out user");
      }
      setUser(null);
      router.push("/auth/signin");
    } catch (error) {
      console.error("Error logging out user:", error);
    }
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        // Call the /api/auth endpoint to get user details
        const response = await fetch("/api/auth");
        if (!response.ok) {
          throw new Error("Failed to fetch user details");
        } else {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        // Handle error accordingly, e.g., redirect to login page
        setUser(null);
        window.location.href = "/auth/signin";
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, [router]); // Add router to dependency array

  // Render a loading indicator until user details are fetched
  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <UpdateIcon className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ user, loading, logout }}>
      {children}
    </UserContext.Provider>
  );
};
