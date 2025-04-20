"use client"

import { useEffect, useState } from "react"
import { TrendingUp } from "lucide-react"
import { CartesianGrid, LabelList, Line, LineChart, XAxis } from "recharts"

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
import { fetchLast7DaysOrderStatisticsByVerifier } from "components/fectData/fetch_chart"


const chartConfig = {
  orders: {
    label: "Orders",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function ComponentLineChart() {
  const [chartData, setChartData] = useState<{ date: string; orders: number }[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const verifyAddress = "0x507B235549bf388a88E316560b2BCd37D0428B34"
        const response = await fetchLast7DaysOrderStatisticsByVerifier(verifyAddress)

        const formattedData = Object.entries(response).map(([date, count]) => ({
          date: date.slice(5), // Lấy MM-DD thay vì YYYY-MM-DD
          orders: count as number,
        }))

        setChartData(formattedData)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Copyrights Statistics - Last 7 Days</CardTitle>
        <CardDescription>Data from {chartData[0]?.date} to {chartData[chartData.length - 1]?.date}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 20, left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Line
              dataKey="orders"
              type="monotone"
              stroke="var(--color-orders)"
              strokeWidth={2}
              dot={{ fill: "var(--color-orders)" }}
              activeDot={{ r: 6 }}
            >
              <LabelList position="top" offset={12} className="fill-foreground" fontSize={12} />
            </Line>
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing copyrights statistics for the last 7 days
        </div>
      </CardFooter>
    </Card>
  )
}
