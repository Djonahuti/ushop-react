import { Link } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "../ui/breadcrumb";
import { Separator } from "../ui/separator";
import { SidebarTrigger } from "../ui/sidebar";
import { NavPopUp } from "./NavPopUp";

export function CustomerHeader() {
    return (
      <>
      <header className="flex h-14 shrink-0 items-center gap-2">
        <div className="flex flex-1 items-center gap-2 px-3">
          <div className="hidden md:block"><SidebarTrigger /></div>
          <div className="block md:hidden text-sm h-16">
            <Link to="/" className="w-24 h-10 mt-2 p-2">
              <img
                src="/logo/ushop.svg"
                alt="logo"
                width={90}
                height={15}
              />
            </Link>                    
          </div>          
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="line-clamp-1">
                  <h1 className="hidden md:block text-base font-medium">DashBoard</h1>
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto px-3">
          <NavPopUp />
        </div>
      </header>
      </>  
    )
}