"use client"

import { useEffect, useState } from "react"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"



import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { fetchOrderStatisticsByVerifier } from "components/fectData/fetch_chart"

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const chartConfig = {
  orders: {
    label: "Patent register",
    color: "hsl(var(--chart-1))",
  }
} satisfies ChartConfig

export function ComponentBarChartMultiple() {
  const [chartData, setChartData] = useState<{ month: string; orders: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchOrderStatisticsByVerifier(
          "0x507B235549bf388a88E316560b2BCd37D0428B34",
          2025
        )
        // Chuyển đổi dữ liệu API thành dạng phù hợp cho biểu đồ
        const formattedData = response.map((count, index) => ({
          month: months[index],
          orders: count,
        }))
        setChartData(formattedData)
      } catch (error) {
        console.error("Failed to fetch order statistics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Copyrights Statistics</CardTitle>
        <CardDescription>Monthly copyrights count for 2025</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading data...</p>
        ) : (
          <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar dataKey="orders" fill="var(--color-desktop)" radius={4} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing total patent for the last 12 months
        </div>
      </CardFooter>
    </Card>
  )
}
