"use client";

import { Calendar } from "@/components/ui/calendar";
import { ComponentAreaChart } from "@ui/chart/AreaChart";
import { ComponentAreaChartInteractive } from "@ui/chart/AreaChartInteractive";
import { ComponentBarChartMultiple } from "@ui/chart/BarChartMultiple";
import { ComponentLineChart } from "@ui/chart/LineChart";
import { ComponentPieChart } from "@ui/chart/PieChart ";
import BaseLayout from "@ui/layout/BaseLayout";

const DashboardPage = () => {
  return (
    <BaseLayout>
      <div className="h-screen p-6 flex flex-col mb-20">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div className="grid grid-cols-3 grid-rows-2 gap-6 flex-1 ">
          {/* Row 1 */}
          <div className="col-span">
            <ComponentBarChartMultiple />
          </div>
          <div className="col-span-1">
          <ComponentPieChart verifyAddress="0x507B235549bf388a88E316560b2BCd37D0428B34" />

          </div>

          {/* Row 2 */}
          <div className="col-span-1 row-span-1">
          <ComponentLineChart />
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default DashboardPage;
