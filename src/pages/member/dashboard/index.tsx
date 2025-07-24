/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";

import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DashboardCard from "@ui/card";
import { ComponentAreaChart } from "@ui/chart/AreaChart";
import { ComponentAreaChartInteractive } from "@ui/chart/AreaChartInteractive";
import { ComponentBarChartMultiple } from "@ui/chart/BarChartMultiple";
import { ComponentLineChart } from "@ui/chart/LineChart";
import { ComponentPieChart } from "@ui/chart/PieChart ";
import BaseLayout from "@ui/layout/BaseLayout";
import { FaUser, FaShoppingCart, FaChartLine } from 'react-icons/fa';
import { fetchCountCopyrightByVerifier, fetchCountCopyrightPublishedByVerifier, fetchCountMemberByVerifier, fetchTopFiveNewestCopyrigtByVerifier } from "components/fectData/fetch_chart";
import { CopyRight } from "@_types/nft";
import { u } from "framer-motion/client";
import { fetch_user_by_id, get_user_by_address } from "components/fectData/fetch_user";

const verifyAddress = "0x507B235549bf388a88E316560b2BCd37D0428B34";

const DashboardPage = () => {
  const [userCount, setUserCount] = useState(0);
  const [publishedCount, setPublishedCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [topFive, setTopFive] = useState<CopyRight[]>([]);

  const [userAddress, setUserAddress] = useState<string | null>(null);
const [verifierAddress, setVerifierAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // trạng thái loading

  useEffect(() => {
    const connectWallet = async () => {
      if (!window.ethereum) {
        console.error("MetaMask is not installed.");
        setLoading(false);
        return;
      }

      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) as string[];
        if (!accounts || accounts.length === 0) {
          console.error("No accounts found.");
          setLoading(false);
          return;
        }

        const address = accounts[0];
        setUserAddress(address);

        try {
          const fetchedVerifier = await get_user_by_address(address);
          if (!fetchedVerifier) {
            console.error("No verifier found for address:", address);
            setLoading(false);
            return;
          }

          const fetchedVerifierAddress = await fetch_user_by_id(fetchedVerifier.verifierId);
          if (!fetchedVerifierAddress) {
            console.error("No verifier address found for verifierId:", fetchedVerifier.verifierId);
            setLoading(false);
            return;
          }

          setVerifierAddress(fetchedVerifierAddress.address);
          console.log("Verifier address:", fetchedVerifierAddress.address);
        } catch (innerError) {
          console.error("Error fetching verifier:", innerError);
        }

      } catch (err) {
        console.error("Error connecting to MetaMask:", err);
      } finally {
        setLoading(false); // Đảm bảo lúc nào cũng tắt loading
      }
    };

    connectWallet();
  }, []);



  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetchCountMemberByVerifier(verifierAddress!);
        const pubRes = await fetchCountCopyrightPublishedByVerifier(verifierAddress!);
        const orderRes = await fetchCountCopyrightByVerifier(verifierAddress!);
        const topFiveRes = await fetchTopFiveNewestCopyrigtByVerifier(verifierAddress!);

        setUserCount(userRes);
        setPublishedCount(pubRes);
        setOrderCount(orderRes - pubRes);
        setTopFive(topFiveRes);
      } catch (err) {
        console.error("Dashboard data error", err);
      }
    };

    fetchData();
  }, [verifierAddress]);



  return (
    <BaseLayout>
      <div className="h-screen p-6 flex flex-col mb-20">
        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 p-6">
          {/* <DashboardCard title="Users" value={userCount} icon={FaUser} description="Number of members in team verifier" /> */}
          <DashboardCard title="Orders published" value={publishedCount} icon={FaShoppingCart} description="Number of copyrights publised" />
          <DashboardCard title="Order is pending" value={orderCount} icon={FaChartLine} description="Number of copyrights is checking" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          <ComponentBarChartMultiple />
          {/* <ComponentPieChart verifyAddress={verifierAddress || "0" } /> */}
          <ComponentLineChart />
        </div>

        {/* Top 5 newest */}
        <div className="col-span-3 row-span-1 pt-8">
          <h3 className="p-4 font-bold">Top 5 Newest Copyrights</h3>
          <Table>
            <TableCaption>A list of recent items.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Sample</TableHead>
                <TableHead className="text-right">Form</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topFive.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.metaData.name}</TableCell>
                  <TableCell>{item.metaData.createAt}</TableCell>
                  <TableCell>{item.user.address}</TableCell>
                  <TableCell>
                    <img
                      src={item.metaData.samples || "/images/sample.png"}
                      alt="sample"
                      className="w-12 h-12 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <a
                      href={item.metaData.applicationForm ||`/form/${item.id}`}
                      className="text-blue-600 hover:underline"
                      target="_blank"
                    >
                      View Form
                    </a>
                  </TableCell>
                  <TableCell className="text-right">{item.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </BaseLayout>
  );
};

export default DashboardPage;


