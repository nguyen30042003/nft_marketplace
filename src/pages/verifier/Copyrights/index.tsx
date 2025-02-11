/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import BaseLayout from "@ui/layout/BaseLayout";
import Table from "@ui/table";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import useSWR, { mutate } from "swr";
import { fetch_all_copyright, update_status_copyright_by_id, update_token_copyright } from "components/fectData/fetch_copyright";
import router from "next/router";
import { Status } from "@_types/nft";
import { useWeb3 } from "@providers/web3";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import Long from "long";




const ListCopyright: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const { ethereum, copyrightContract } = useWeb3();


  // Lấy dữ liệu bản quyền từ API
  const { data: copyrights, error, isLoading } = useSWR("fetch_all_copyright", fetch_all_copyright);

  const columns = [
    { header: "ID", accessor: "id", className: "text-left" },
    { header: "Title", accessor: "title", className: "text-left" },
    { header: "Owner", accessor: "owner", className: "text-left" },
    { header: "Status", accessor: "status", className: "text-left" },
    { header: "Created At", accessor: "createdAt", className: "text-left" },
    { header: "Actions", accessor: "actions", className: "text-center" },
  ];

  // Chuyển đổi dữ liệu API thành dữ liệu phù hợp với UI
  const transformedData =
    copyrights?.map((item) => ({
      id: item.id,
      title: item.metaData.name,
      owner: item.user.address,
      status: item.status,
      createdAt: new Date(item.metaData.createAt),
      uri: item.metaData.uri
    })) || [];

  const filteredData = transformedData.filter((item) => {
    const matchesSearchTerm =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.owner.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || item.status.toLowerCase() === selectedStatus;

    const matchesDateRange =
      (!startDate || item.createdAt >= startDate) &&
      (!endDate || item.createdAt <= endDate);

    return matchesSearchTerm && matchesStatus && matchesDateRange;
  });

  const handlePreview = (copyright: any) => {
    router.push(`/verifier/Copyrights/${copyright.id}`);
  };

  const handleAccept = async (id: string, status: string, nftURI: string) => {
    try {
      const tx = await copyrightContract?.mintToken(
        nftURI,
        ethers.utils.parseEther("2"), {
        value: ethers.utils.parseEther(0.025.toString())
      }
      );
        const response = await update_status_copyright_by_id(id, status)


        // const newTokenId = await copyrightContract?.getTokenIdByURI(nftURI);
        // if (!newTokenId) {
        //   console.error("Error: newTokenId is undefined");
        //   return;
        // }
        // console.log(newTokenId)
        // const tokenIdLong = Long.fromString(newTokenId.toString()); // Chuyển đổi BigNumber -> Long
        // const temp = await update_token_copyright(id, tokenIdLong);
      
        // await toast.promise(
        //   tx!.wait(), {
        //   pending: "Uploading blockchain",
        //   success: "Uploaded success",
        //   error: "Upload error"
        // }
      //);
        
    } catch (error) {
      console.error("Error accepting copyright:", error);
      alert("Failed to accept copyright.");
    }
  };


  if (isLoading) {
    return (
      <BaseLayout>
        <p>Loading...</p>
      </BaseLayout>
    );
  }

  if (error) {
    return (
      <BaseLayout>
        <p>Error loading data...</p>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <div className="p-4">
        <h1 className="text-lg font-bold mb-4">Copyright Table</h1>
        <div className="mb-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search copyright..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          >
            <option value="all">All Status</option>
            <option value="Uploaded">Uploaded</option>
            <option value="Pending">Pending</option>
            <option value="Incomplete">Incomplete</option>
            <option value="Published">Published</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            placeholderText="Start Date"
            className="p-2 border border-gray-300 rounded"
          />
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            placeholderText="End Date"
            className="p-2 border border-gray-300 rounded"
          />
        </div>

        <Table
          columns={columns}
          data={filteredData}
          renderRow={(item) => (
            <>
              <td className="px-4 py-2">{item.id}</td>
              <td className="px-4 py-2">{item.title}</td>
              <td className="px-4 py-2">{item.owner}</td>
              <td className="px-4 py-2">{item.status}</td>
              <td className="px-4 py-2">{item.createdAt.toLocaleDateString()}</td>
              <td className="px-4 py-2 text-center">
                {item.status === "UPLOADED" ? (
                  <button
                    className="text-green-500 hover:underline"
                    onClick={() => handleAccept(item.id, Status.PENDING, item.uri)}
                  >
                    Accept
                  </button>
                ) : (
                  <button
                    className="text-blue-500 hover:underline"
                    onClick={() => handlePreview(item)}
                  >
                    Preview
                  </button>
                )}
              </td>
            </>
          )}
        />

      </div>
    </BaseLayout>
  );
};

export default ListCopyright;
