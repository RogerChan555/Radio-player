import BreadCrumb from "@/components/Breadcrumb";
import ProfileForm from "@/components/forms/profile-form";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

const breadcrumbItems = [{ title: "Profile", link: "/admin/profile" }];

const ProfilePage = () => {
  return (
    <div className="flex-1 space-y-4  p-4 pt-6 md:p-8">
      <BreadCrumb items={breadcrumbItems} />

      <div className="flex items-start justify-between">
        <Heading title={`Profile`} description="Manage profile details" />
      </div>
      <Separator />
      <div className="w-full max-w-[600px]">
        <ProfileForm />
      </div>
    </div>
  );
};

export default ProfilePage;
