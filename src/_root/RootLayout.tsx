import Bottombar from "@/components/shared/Bottombar";
import Navbar from "@/components/shared/Navbar";
import Topbar from "@/components/shared/TopBar";
import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";

const RootLayout = () => {
  return (
    <>
    
    <div className="min-h-screen">
      <div className="md:hidden"><Topbar /></div>
      <div className="hidden md:sticky md:top-0 md:z-50 md:block">
        <Navbar />
      </div>


      <section>
        <Outlet />
        <Toaster />
      </section>

      <div className="md:hidden"><Bottombar /></div>
    </div>
    </>
  );
};

export default RootLayout;