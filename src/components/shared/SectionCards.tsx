"use client"

import * as React from "react"
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import supabase from "@/lib/supabaseClient"

export function SectionCards() {
  const [expectedRevenue, setExpectedRevenue] = React.useState(0)
  const [netWorth, setNetWorth] = React.useState(0)
  const [totalRevenue, setTotalRevenue] = React.useState(0)
  const [completedOrders, setCompletedOrders] = React.useState(0)

  React.useEffect(() => {
    const fetchStats = async () => {
      // Expected Revenue (All due_amount)
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("due_amount, order_status")

      if (!ordersError && orders) {
        const dueTotal = orders.reduce((acc, o) => acc + (o.due_amount || 0), 0)
        setExpectedRevenue(dueTotal)

        const completedTotal = orders
          .filter((o) => o.order_status === "COMPLETED")
          .reduce((acc, o) => acc + (o.due_amount || 0), 0)
        setCompletedOrders(completedTotal)
      }

      // Net Worth (product_price * 10)
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("product_price")

      if (!productsError && products) {
        const worth = products.reduce((acc, p) => acc + (p.product_price || 0) * 10, 0)
        setNetWorth(worth)
      }

      // Total Revenue (from payments)
      const { data: payments, error: paymentsError } = await supabase
        .from("payments")
        .select("amount")

      if (!paymentsError && payments) {
        const revenue = payments.reduce((acc, p) => acc + (p.amount || 0), 0)
        setTotalRevenue(revenue)
      }
    }

    fetchStats()
  }, [])

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(value)

    const toPercentOf = (value: number, base: number) => {
      if (base === 0) return "0%"
      return `${((value / base) * 100).toFixed(1)}%`
    }

    const expectedRef = 1000000
    const netWorthRef = 1000000
    const revenueRef = 1000000
    const completedRef = 1000000
    
    

  return (
    <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
      {/* Expected Revenue */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Expected Revenue</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {formatCurrency(expectedRevenue)}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingUpIcon className="size-3" />
              {toPercentOf(expectedRevenue, expectedRef)}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Expected Revenue from orders placed <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Yet to be completed
          </div>
        </CardFooter>
      </Card>

      {/* Net Worth */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Net Worth</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
          {formatCurrency(netWorth)}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingUpIcon className="size-3" />
              {toPercentOf(netWorth, netWorthRef)}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total Sum of the products <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            We can do more
          </div>
        </CardFooter>
      </Card>

      {/* Total Revenue */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {formatCurrency(totalRevenue)}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingUpIcon className="size-3" />
              {toPercentOf(totalRevenue, revenueRef)}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total Revenue made so far <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">All Payment Made</div>
        </CardFooter>
      </Card>

      {/* Completed Orders */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Completed Orders</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {formatCurrency(completedOrders)}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingDownIcon className="size-3" />
              {toPercentOf(completedOrders, completedRef)}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Completed Orders Sum <TrendingDownIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Happy Customers</div>
        </CardFooter>
      </Card>
    </div>
  )
}
