import BreadCrumb from "@/components/Breadcrumb";
import { columns } from "@/components/tables/station-columns";
import { getStations } from "@/app/actions/station";
import { CustomSortableTable } from "@/components/tables/sortable-table";

const breadcrumbItems = [{ title: "Station", link: "/admin/station" }];

export default async function page({ searchParams }) {
  const page = Number(searchParams.page) || 1;
  const pageLimit = Number(searchParams.limit) || 10;
  const search = searchParams.search || null;
  const offset = (page - 1) * pageLimit;

  const stationRes = await getStations(search, offset, pageLimit);
  const totalStations = stationRes.totalStations; //1000
  const pageCount = Math.ceil(totalStations / pageLimit);
  const station = stationRes.stations;

  return (
    <div className="flex-1 space-y-4  p-4 pt-6 md:p-8">
      <BreadCrumb items={breadcrumbItems} />

      <CustomSortableTable
        searchKey="name"
        pageNo={page}
        columns={columns}
        station={station}
        totalStations={totalStations}
        pageCount={pageCount}
      />
    </div>
  );
}
