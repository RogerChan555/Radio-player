"use client";

import BreadCrumb from "@/components/Breadcrumb";
import { StationForm } from "@/components/forms/station-form";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function Page() {
  const [station, setStation] = useState(null);
  const params = useParams();
  let stationID = params.stationId;

  const breadcrumbItems = [
    { title: "Station", link: "/admin/station" },
    { title: stationID ? "Update" : "Create", link: "/admin/station/create" },
  ];

  useEffect(() => {
    const fetchStation = async () => {
      if (stationID != "new") {
        try {
          const response = await fetch(`/api/station/${stationID}`, {
            method: "GET",
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          let currentStation = data;
          const timeStamp = new Date().getTime();

          currentStation.metaPreset = currentStation.metaPreset || "";
          currentStation.refUrl =
            process.env.NEXT_PUBLIC_APP_URL + "/" + currentStation.refUrl;
          currentStation.gtm = currentStation.gtm || "";
          currentStation.analytics = currentStation.analytics || "";
          currentStation.stationLogoOld = currentStation.logo + "?" + timeStamp;
          currentStation.logo = new File([], "");
          currentStation.stationThumbnailOld =
            currentStation.thumbnail + "?" + timeStamp;
          currentStation.thumbnail = new File([], "");
          currentStation.stationBackgroundImageOld =
            currentStation.backgroundImage + "?" + timeStamp;
          currentStation.backgroundImage = new File([], "");
          currentStation.isDefault = currentStation.isDefault === 1;
          currentStation.isActive = currentStation.isActive === 1;
          setStation(currentStation);
        } catch (error) {
          console.error("Failed to fetch stations", error);
        }
      } else {
        setStation({
          metaPreset: "",
          isDefault: false,
          isActive: true,
          name: "",
          refUrl: "",
          url: "",
          donateLink: "",
          gtm: "",
          analytics: "",
          advertisements: null,
          logo: "",
          thumbnail: "",
          backgroundImage: "",
        });
      }
    };

    fetchStation();
  }, [stationID]);

  return (
    <div className="flex-1 space-y-4 p-8">
      <BreadCrumb items={breadcrumbItems} />
      {station && <StationForm initialData={station} />}
    </div>
  );
}
