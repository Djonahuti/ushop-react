import { ChartAreaInteractive } from "@/components/shared/chart-area-interactive"
import { SectionCards } from "@/components/shared/SectionCards"
import { DataFetch } from "./DataFetch"
import { PendingOrdersChart } from "@/components/shared/PendingOrdersChart"

const DashboardContent = () => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          <div className="px-4 lg:px-6">
            <PendingOrdersChart />
          </div>
          <DataFetch />
        </div>
      </div>
    </div>
  )
}

export default DashboardContent