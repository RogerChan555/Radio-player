"use client";
import { AlertModal } from "@/components/modal/alert-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export const AdvertisementCellAction = ({ data, module }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const onConfirm = async () => {
    setLoading(true);
    try {
      let formData = new FormData();
      formData.append("_method", "DELETE");
      const response = await fetch(`/api/${module}/${data.id}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const res = await response.json();
        throw new Error(res.error || `Error deleting ${module}`);
      }
      setLoading(false);
      setOpen(false);
      router.push(window.location.href);
      router.refresh();
      toast({
        variant: "success",
        title: "Success!",
        description: `${module} deleted successfully.`,
        timeout: 10000,
      });
    } catch (error) {
      console.error(`Error deleting ${module}:`, error);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
        timeout: 10000,
      });
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => router.push(`/admin/${module}/${data.id}`)}
          >
            <Edit className="mr-2 h-4 w-4" /> Update
          </DropdownMenuItem>
          {!data.isDefault && (
            <DropdownMenuItem
              className="text-red-500"
              onClick={() => setOpen(true)}
            >
              <Trash className="mr-2 h-4 w-4 text-red-500" /> Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
