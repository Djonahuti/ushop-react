import DesktopView from "@/components/shared/Seller/DesktopView";
import { MobileView } from "@/components/shared/Seller/MobileView";


const Personalize: React.FC = () => {

  return (
    <>
    <div className="hidden md:block"><DesktopView /></div>
    <div className="md:hidden"><MobileView /></div>    
    </>
  )
}

export default Personalize;