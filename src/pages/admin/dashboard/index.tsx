import { ComponentPieChart } from "@ui/chart/admin/PieChart ";
import { ComponentPieUserChart } from "@ui/chart/admin/PieUserChart";
import { ComponentAreaChart } from "@ui/chart/AreaChart";
import { ComponentBarChartMultiple } from "@ui/chart/BarChartMultiple";
import { ComponentLineChart } from "@ui/chart/LineChart";
import BaseLayout from "@ui/layout/BaseLayout";
import { div } from "framer-motion/client";


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
            <ComponentLineChart />

          </div>
          <div className="col-span">
          <ComponentAreaChart />
          </div>
          <div className="col-span-1">
            <ComponentPieUserChart />

          </div>
          <div className="col-span-1">
          <ComponentPieChart />

          </div>

        </div>


      </div>
    </BaseLayout>
  );
};



export default DashboardPage;
