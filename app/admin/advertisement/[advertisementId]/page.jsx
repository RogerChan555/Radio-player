"use client";

import BreadCrumb from "@/components/Breadcrumb";
import { AdvertisementForm } from "@/components/forms/advertisement-form";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function Page() {
  const [advertisement, setAdvertisement] = useState(null);
  const params = useParams();
  let advertisementID = params.advertisementId;

  const breadcrumbItems = [
    { title: "Advertisement", link: "/admin/advertisement" },
    {
      title: advertisementID ? "Update" : "Create",
      link: "/admin/advertisement/create",
    },
  ];

  useEffect(() => {
    const fetchAdvertisement = async () => {
      if (advertisementID != "new") {
        try {
          const response = await fetch(
            `/api/advertisement/${advertisementID}`,
            {
              method: "GET",
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          let currentAdvertisement = data;
          console.log(currentAdvertisement);
          const timeStamp = new Date().getTime();
          if (currentAdvertisement.refUrl) {
            currentAdvertisement.refUrl =
              process.env.NEXT_PUBLIC_APP_URL +
              "/" +
              currentAdvertisement.refUrl;
          }
          currentAdvertisement.advertisementThumbnailOld =
            currentAdvertisement.thumbnail + "?" + timeStamp;
          currentAdvertisement.thumbnail = new File([], "");
          setAdvertisement(currentAdvertisement);
        } catch (error) {
          console.error("Failed to fetch advertisements", error);
        }
      } else {
        setAdvertisement({
          name: "",
          refUrl: "",
          url: "",
          iFrameUrl: "",
          imageUrl: "",
          thumbnail: "",
          googleSlotId: "",
        });
      }
    };

    fetchAdvertisement();
  }, [advertisementID]);

  return (
    <div className="flex-1 space-y-4 p-8">
      <BreadCrumb items={breadcrumbItems} />
      {advertisement && <AdvertisementForm initialData={advertisement} />}
    </div>
  );
}
