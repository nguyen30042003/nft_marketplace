/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useState } from "react";
import BaseLayout from "@ui/layout/BaseLayout";
import Table from "@ui/table";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import useSWR, { mutate } from "swr";
import { fetch_all_copyright, fetch_all_copyright_by_verifier, update_status_copyright_by_id, update_token_copyright } from "components/fectData/fetch_copyright";
import router from "next/router";
import { Status } from "@_types/nft";
import { useWeb3 } from "@providers/web3";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import Long from "long";
import { fetch_all_transfer_copyright_by_verifier } from "components/fectData/transfer_copyright";




const ListCopyright: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const { ethereum, copyrightContract } = useWeb3();

  const [userAddress, setUserAddress] = useState<string | null>(null);

  useEffect(() => {
      const connectWallet = async () => {
          if (window.ethereum) {
              try {
                  // TypeScript expects an array of strings (string[])
                  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) as string[];
                  if (accounts && accounts.length > 0) {
                      setUserAddress(accounts[0]);
                  }
              } catch (error) {
                  console.error("Error connecting to MetaMask:", error);
              }
          } else {
              console.error("MetaMask is not installed.");
          }
      };

      connectWallet();
  }, []);

  const { data: transfers, error, isLoading } = useSWR(
      userAddress ? ["get_copyright_by_verifier", userAddress] : null, 
      () => fetch_all_transfer_copyright_by_verifier(userAddress!)
  );

  const columns = [
    { header: "ID", accessor: "id", className: "text-left" },
    { header: "Title", accessor: "title", className: "text-left" },
    { header: "Owner", accessor: "owner", className: "text-left" },
    { header: "Receiver", accessor: "Receiver", className: "text-left" },
    { header: "Proxy Payment", accessor: "Proxy Payment", className: "text-left" },
    { header: "Status", accessor: "Status", className: "text-left" },
    { header: "Actions", accessor: "actions", className: "text-center" },
  ];

  // Chuyển đổi dữ liệu API thành dữ liệu phù hợp với UI
  const transformedData =
      transfers?.map((item) => ({
      id: item.id,
      fromUserAddress: item.fromUserAddress,
      toUserAddress: item.toUserAddress,
      title: item.title,
      price: item.price,
      status: item.status
    })) || [];

  // const filteredData = transformedData.filter((item) => {
  //   const matchesSearchTerm =
  //     item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     item.owner.toLowerCase().includes(searchTerm.toLowerCase());

  //   const matchesStatus =
  //     selectedStatus === "all" || item.status.toLowerCase() === selectedStatus;

  //   const matchesDateRange =
  //     (!startDate || item.createdAt >= startDate) &&
  //     (!endDate || item.createdAt <= endDate);

  //   return matchesSearchTerm && matchesStatus && matchesDateRange;
  // });

  const handlePreview = (transferCopyright: any) => {
    router.push(`/verifier/Transfer/${transferCopyright.id}`);
  };

  const handleAccept = async (id: number, status: string, nftURI: string) => {
    try {
        var price = 5;
        console.log(id)
        const response = await update_status_copyright_by_id(id, "PENDING");
        const tx = await copyrightContract?.mintToken(
          nftURI,
          ethers.utils.parseEther(price.toString()), {
          value: ethers.utils.parseEther(0.025.toString())
        }
        );

        // copyrightContract?.on(
        //   "NftItemCreated",
        //   (tokenId: ethers.BigNumber, price: ethers.BigNumber, creator: string, isListed: boolean, event: any) => {
        //     console.log(`📢 NFT Created!`);
        //     console.log(`Token ID: ${tokenId.toString()}`);
        //     console.log(`Price: ${ethers.utils.formatEther(price)} ETH`);
        //     console.log(`Creator: ${creator}`);
        //     console.log(`Listed: ${isListed}`);
        //     console.log(`Transaction Hash: ${event.transactionHash}`);
        //   }
        // );
        

        await toast.promise(
          tx!.wait(), {
          pending: "Uploading metadata",
          success: "Metadata uploaded",
          error: "Metadata upload error"
          }
        );
        
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
        <h1 className="text-lg font-bold mb-4">Transfer Copyright Request</h1>
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
          data={transformedData}
          renderRow={(item) => (
            <>
              <td className="px-4 py-2">{item.id}</td>
              <td className="px-4 py-2">{item.title}</td>
              <td className="px-4 py-2">{item.fromUserAddress}</td>
              <td className="px-4 py-2">{item.toUserAddress}</td>
              <td className="px-4 py-2">{item.price}</td>
              <td className="px-4 py-2">{item.status}</td>
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
