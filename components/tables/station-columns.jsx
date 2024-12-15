"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { StationCellAction } from "./station-cell-action";
import { Badge } from "@/components/ui/badge";
import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import { SortableDragHandle } from "@/components/ui/sortable";

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
    cell: ({ row }) => (
      <span>
        <span
          className={`font-semibold block ${
            !row.original.isActive ? "text-red-500" : ""
          }`}
        >
          {row.original.name}
        </span>
        {!row.original.isActive && (
          <Badge variant="destructive" className="rounded-md mt-2">
            Disabled
          </Badge>
        )}
      </span>
    ),
  },
  {
    accessorKey: "url",
    header: "URL",
  },
  {
    accessorKey: "isDefault",
    header: "DEFAULT",
    cell: ({ row }) => (row.original.isDefault ? "Yes" : "No"),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <StationCellAction data={row.original} module={"station"} />
    ),
  },
  {
    id: "drag",
    cell: () => (
      <div className="flex justify-end">
        <SortableDragHandle variant="ghost" size="icon" className="size-8">
          <DragHandleDots2Icon className="size-4" aria-hidden="true" />
        </SortableDragHandle>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
];
