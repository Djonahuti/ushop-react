import { DesktopEdit } from "@/components/shared/Customer/DesktopEdit";
import { MobileEdit } from "@/components/shared/Customer/MobileEdit";


const CustomerProfile: React.FC = () => {

  return (
    <>
    <div className="hidden md:block"><DesktopEdit /></div>
    <div className="md:hidden"><MobileEdit /></div>    
    </>

  );
};

export default CustomerProfile;