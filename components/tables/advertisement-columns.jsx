"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { AdvertisementCellAction } from "./advertisement-cell-action";

export const columns = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "NAME",
  },
  {
    accessorKey: "refUrl",
    header: "URL",
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <AdvertisementCellAction data={row.original} module={"advertisement"} />
    ),
  },
];
