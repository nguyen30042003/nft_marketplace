"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { fetchCountNonTransferByVerifier, fetchCountTransferByVerifier } from "components/fectData/fetch_chart";


const chartConfig = {
  transferred: {
    label: "Transferred",
    color: "hsl(var(--chart-1))",
  },
  nonTransferred: {
    label: "Non-Transferred",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function ComponentPieChart({ verifyAddress }: { verifyAddress: string }){
  const [chartData, setChartData] = React.useState([
    { name: "Transferred", value: 0, fill: "hsl(var(--chart-1))" },
    { name: "Non-Transferred", value: 0, fill: "hsl(var(--chart-2))" },
  ]);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const transferred = await fetchCountTransferByVerifier(verifyAddress);
        const nonTransferred = await fetchCountNonTransferByVerifier(verifyAddress);
        setChartData([
          { name: "Transferred", value: transferred, fill: "hsl(var(--chart-1))" },
          { name: "Non-Transferred", value: nonTransferred, fill: "hsl(var(--chart-2))" },
        ]);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    }
    fetchData();
  }, [verifyAddress]);

  const totalOrders = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Pie Chart - Donut with Text</CardTitle>
        <CardDescription>Order Statistics</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                          {totalOrders.toLocaleString()}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                          Patents
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">Showing total patents and transfer number statistics</div>
      </CardFooter>
    </Card>
  );
}
