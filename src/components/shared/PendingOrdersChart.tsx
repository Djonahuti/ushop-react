"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { PendingOrder } from "@/types"
import supabase from "@/lib/supabaseClient"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

const ORDER_STATUSES = [
  "Pending",
  "Paid",
  "Payment confirmed",
  "WAITING TO BE SHIPPED",
  "SHIPPED",
  "OUT FOR DELIVERY",
  "RECEIVED",
] as const

type StatusChartData = {
  date: string
} & {
  [K in (typeof ORDER_STATUSES)[number]]: number
}

const chartConfig = {
  Pending: { label: "Pending", color: "#f44336" },
  Paid: { label: "Paid", color: "#e91e63" },
  "Payment confirmed": { label: "Payment confirmed", color: "#9c27b0" },
  "WAITING TO BE SHIPPED": { label: "Waiting", color: "#3f51b5" },
  SHIPPED: { label: "Shipped", color: "#03a9f4" },
  "OUT FOR DELIVERY": { label: "Out for Delivery", color: "#ff9800" },
  RECEIVED: { label: "Received", color: "#4caf50" },
} as const

export function PendingOrdersChart() {
  const [orders, setOrders] = React.useState<PendingOrder[]>([])
  const [chartData, setChartData] = React.useState<StatusChartData[]>([])
  const [timeRange, setTimeRange] = React.useState("30d")

  React.useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (user) {
        const { data, error } = await supabase
          .from("pending_orders")
          .select("*")

        if (error) {
          console.error("Error fetching pending orders:", error.message)
        } else {
          setOrders(data as PendingOrder[])
          setChartData(transformToChartData(data as PendingOrder[]))
        }
      } else if (userError) {
        console.error("Auth error:", userError.message)
      }
    }

    fetchOrders()
  }, [])

  function transformToChartData(data: PendingOrder[]): StatusChartData[] {
    const grouped: Record<string, Record<string, number>> = {}

    for (const order of data) {
      const date = new Date(order.created_at).toISOString().split("T")[0]
      if (!grouped[date]) {
        grouped[date] = Object.fromEntries(ORDER_STATUSES.map(s => [s, 0]))
      }
      if (ORDER_STATUSES.includes(order.order_status as (typeof ORDER_STATUSES)[number])) {
        grouped[date][order.order_status]++
      }
    }

    return Object.entries(grouped)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, statusCount]) => ({ date, ...statusCount } as StatusChartData))
  }

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const reference = new Date()
    let days = 90
    if (timeRange === "30d") days = 30
    else if (timeRange === "7d") days = 7
    const from = new Date(reference)
    from.setDate(reference.getDate() - days)
    return date >= from
  })

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardTitle>Order Status Progression</CardTitle>
        <CardDescription>
          <span className="@[540px]/card:block hidden">
            Visualizing order status transitions over time
          </span>
          <span className="@[540px]/card:hidden">Over Time</span>                      
        </CardDescription>
        <div className="absolute right-4 top-4">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(v) => v && setTimeRange(v)}
            variant="outline"
            className="@[767px]/card:flex hidden"
          >
            <ToggleGroupItem value="90d" className="h-8 px-2.5">90d</ToggleGroupItem>
            <ToggleGroupItem value="30d" className="h-8 px-2.5">30d</ToggleGroupItem>
            <ToggleGroupItem value="7d" className="h-8 px-2.5">7d</ToggleGroupItem>
          </ToggleGroup>

          <Select value={timeRange} onValueChange={(v) => setTimeRange(v)}>
            <SelectTrigger className="@[767px]/card:hidden flex w-32">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d">90 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
              <SelectItem value="7d">7 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              {Object.entries(chartConfig).map(([status, { color }]) => (
                <linearGradient
                  key={status}
                  id={`fill-${status.replace(/\s+/g, "-")}`}
                  x1="0" y1="0" x2="0" y2="1"
                >
                  <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", {
                month: "short", day: "numeric",
              })}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(val) => new Date(val).toLocaleDateString("en-US", {
                    month: "short", day: "numeric"
                  })}
                  indicator="dot"
                />
              }
            />
            {ORDER_STATUSES.map((status) => (
              <Area
                key={status}
                dataKey={status}
                type="monotone"
                stroke={chartConfig[status].color}
                fill={`url(#fill-${status.replace(/\s+/g, "-")})`}
                stackId="a"
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
