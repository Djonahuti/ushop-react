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
      <div className="hidden md:block"><Navbar /></div>

      <section>
        <Outlet />
        <Toaster />
      </section>

      <Bottombar />
    </div>
    </>
  );
};

export default RootLayout;