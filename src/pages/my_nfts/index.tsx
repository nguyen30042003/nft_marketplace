import { BaseLayout } from "@ui";
import Table from "@ui/table";
import { get_copyright_by_address } from "components/fectData/fetch_copyright";
import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { ethers } from "ethers";
import router from "next/router";

const MyNfts: NextPage = () => {
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

    const { data: copyrights, error, isLoading } = useSWR(
        userAddress ? ["get_copyright_by_address", userAddress] : null, 
        () => get_copyright_by_address(userAddress!)
    );

    const columns = [
        { header: "Name NFT", accessor: "title", className: "text-left" },
        { header: "Status", accessor: "status", className: "text-left" },
        { header: "CreateAt", accessor: "createdAt", className: "text-left" },
        { header: "UpdateAt", accessor: "updateAt", className: "text-left" },
        { header: "Action", accessor: "action", className: "text-center" },
    ];

    const transformedData = copyrights?.map((item) => ({
        id: item.id,
        title: item.metaData.name,
        owner: item.user.address,
        status: item.status,
        createdAt: item.metaData.createAt ? new Date(item.metaData.createAt) : "N/A",
        updateAt: item.metaData.updateAt ? new Date(item.metaData.updateAt) : "N/A",
        uri: item.metaData.uri
    })) || [];

    const renderRow = (item: any) => (
        <>
            <td className="border border-gray-300 px-4 py-2">{item.title}</td>
            <td className="border border-gray-300 px-4 py-2">{item.status}</td>
            <td className="border border-gray-300 px-4 py-2">{item.createdAt instanceof Date ? item.createdAt.toLocaleDateString() : item.createdAt}</td>
            <td className="border border-gray-300 px-4 py-2">{item.updateAt instanceof Date ? item.updateAt.toLocaleDateString() : item.updateAt}</td>
            <td className="border border-gray-300 px-4 py-2 text-center">
                <button className="text-blue-500 hover:underline" onClick={() => handlePreview(item)}>Preview</button>
            </td>
        </>
    );


    const handlePreview = (copyright: any) => {
        router.push(`/my_nfts/${copyright.id}`);
      };

      
    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error loading data.</p>;

    return (
        <BaseLayout>
            <div className="p-4">
                <h1 className="text-lg font-bold mb-4">My NFTs</h1>
                {!userAddress ? (
                    <button 
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                        onClick={() => window.ethereum?.request({ method: "eth_requestAccounts" })}
                    >
                        Connect MetaMask
                    </button>
                ) : (
                    <p className="mb-4">Connected Wallet: {userAddress}</p>
                )}
                <Table columns={columns} data={transformedData} renderRow={renderRow} />
            </div>
        </BaseLayout>
    );
};

export default MyNfts;



