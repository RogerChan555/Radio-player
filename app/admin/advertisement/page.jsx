import BreadCrumb from "@/components/Breadcrumb";
import { columns } from "@/components/tables/advertisement-columns";
import { CustomTable } from "@/components/tables/table";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getAdvertisements } from "@/app/actions/advertisement";

const breadcrumbItems = [
  { title: "Advertisement", link: "/admin/advertisement" },
];

export default async function page({ searchParams }) {
  const page = Number(searchParams.page) || 1;
  const pageLimit = Number(searchParams.limit) || 10;
  const search = searchParams.search || null;
  const offset = (page - 1) * pageLimit;

  const advertisementRes = await getAdvertisements(search, offset, pageLimit);
  const totalAdvertisements = advertisementRes.totalAdvertisements; //1000
  const pageCount = Math.ceil(totalAdvertisements / pageLimit);
  const advertisement = advertisementRes.advertisements;
  console.log("advertisement", advertisement);
  return (
    <>
      <div className="flex-1 space-y-4  p-4 pt-6 md:p-8">
        <BreadCrumb items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading
            title={`Advertisements (${totalAdvertisements})`}
            description="Manage advertisements (Server side table functionalities.)"
          />

          <Link
            href={"/admin/advertisement/new"}
            className={cn(buttonVariants({ variant: "default" }))}
          >
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Link>
        </div>
        <Separator />

        <CustomTable
          searchKey="name"
          pageNo={page}
          columns={columns}
          data={advertisement}
          pageCount={pageCount}
        />
      </div>
    </>
  );
}
