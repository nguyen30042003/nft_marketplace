"use client"

import { useEffect, useState } from "react"
import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
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

// Hàm gọi API
const fetchCountUserAndCopyrightByWeek = async (): Promise<{
  user: Record<string, number>;
  order: Record<string, number>;
}> => {
  const apiUrl = `http://localhost:8081/api/v1/statistic/count-by-week`;
  console.log("Fetching data from:", apiUrl);

  try {
    const response = await fetch(apiUrl, { method: "GET" });
    const data = await response.json();
    console.log("API Response:", data);

    return {
      user: data.user || {},
      order: data.order || {},
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

const chartConfig = {
  user: {
    label: "Users",
    color: "hsl(var(--chart-1))",
  },
  order: {
    label: "Orders",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function ComponentAreaChart() {
  const [chartData, setChartData] = useState<
    { week: string; user: number; order: number }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchCountUserAndCopyrightByWeek();

        // Sắp xếp theo đúng thứ tự week1 -> week4
        const sortedWeeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
        const formattedData = sortedWeeks.map((week) => ({
          week,
          user: data.user[`${week} Users`] || 0,
          order: data.order[`${week} Orders`] || 0,
        }));

        setChartData(formattedData);
      } catch (error) {
        console.error("Failed to fetch chart data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Statistics</CardTitle>
        <CardDescription>
          Showing users and copyrights registered over the last 4 weeks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="user"
              type="natural"
              fill="var(--color-user)"
              fillOpacity={0.4}
              stroke="var(--color-user)"
              stackId="a"
            />
            <Area
              dataKey="order"
              type="natural"
              fill="var(--color-order)"
              fillOpacity={0.4}
              stroke="var(--color-order)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
