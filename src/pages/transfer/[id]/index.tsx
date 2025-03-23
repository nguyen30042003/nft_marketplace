/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @next/next/no-img-element */
import { emailRequest } from "@_types/emailRequest";
import { NftMeta, PinataRes, Status, TransactionStatus, TransferCopyRightRequest } from "@_types/nft";
import { useWeb3 } from "@providers/web3";
import { BaseLayout } from "@ui";
import axios from "axios";
import { fetch_copyright_by_id, fetch_copyright_by_tokenId, send_email_api, update_copyright_by_id, update_is_transfer_copyright, update_status_copyright_by_id } from "components/fectData/fetch_copyright";
import { useFetchUserByAddress } from "components/fectData/fetch_user";
import { create_transfer_copyright } from "components/fectData/transfer_copyright";
import { useTransaction } from "components/service/transaction";
import { data, div } from "framer-motion/client";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChangeEvent, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import useSWR, { mutate } from "swr";

export default function MyNftPage() {
    const router = useRouter();
    const { id } = router.query;
    const idString = Array.isArray(id) ? id[0] : id ?? "";

    const { data: copyright, error: copyrightError, isLoading: isCopyrightLoading } = useSWR(
        idString ? ["fetch_copyright_by_tokenId", idString] : null,
        () => fetch_copyright_by_tokenId(idString as string)
    );

    const [address, setAddress] = useState("");
    const [amount, setAmount] = useState<number>(0);
    const [userInfo, setUserInfo] = useState<User | null>(null);
    const [verifyError, setVerifyError] = useState("");
    const [inputAddress, setInputAddress] = useState("");
    const [inputAmount, setInputAmount] = useState<number>(0);
    const { data: userInfoSWR, isError, isLoading } = useFetchUserByAddress(address);

    const [isVerified, setIsVerified] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setInputAddress(e.target.value);
    };

    const handleAmountChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setInputAmount(Number(e.target.value) || 0); // Chuyển thành số, nếu không hợp lệ thì gán 0
    };

    const verifyAmount = () => {
        setAmount(inputAmount);
    };

    const verifyAddress = () => {
        setIsVerified(true);
        if (!inputAddress.trim()) {
            setUserInfo(null);
            return;
        }

        setAddress(inputAddress);
    };

    useEffect(() => {
        if (!address) return; // Nếu address rỗng, không gọi API

        if (isLoading) {
            setVerifyError("Loading user data, please wait...");
            return;
        }

        if (isError || !userInfoSWR) {
            setVerifyError("Invalid address or no data found.");
            setUserInfo(null);
            return;
        }

        setUserInfo(userInfoSWR);
    }, [address, userInfoSWR, isLoading, isError]);



    const transfer_copyright = async () => {
        setShowDialog(false);
        const transferCopyrightData: TransferCopyRightRequest = {
            fromUserId: Number(copyright?.user.id),
            toUserId: userInfo?.id as number,
            orderId: Number(copyright?.id),
            verifyAddress: copyright?.verifierAddress ?? "",
            price: amount,
            status: TransactionStatus.PENDING,
        };

        console.log(transferCopyrightData)
        await sendTransaction(copyright?.verifierAddress ?? "", 0.000005, "0", false)
        await create_transfer_copyright(transferCopyrightData);
        await update_is_transfer_copyright(Number(copyright?.id), true);
    };



    const { ethereum, copyrightContract } = useWeb3();
    const [nftURI, setNftURI] = useState("");
    const [nftMeta, setNftMeta] = useState<NftMeta>({
        name: "",
        description: "",
        samples: "",
        applicationForm: "",
    });

    useEffect(() => {
        if (copyright) {
            setNftMeta(prevMeta => ({
                ...prevMeta,
                name: copyright.metaData.name || "",
                description: "ffff",
            }));
        }
    }, [copyright]);




    const { sendTransaction, transactionSuccess, setTransactionSuccess } = useTransaction();

    const [showDialog, setShowDialog] = useState(false); // Trạng thái hiển thị dialog

    const [showDialogTrue, setShowDialogTrue] = useState(false);



    useEffect(() => {
        if (transactionSuccess) {
            setShowDialogTrue(true);
        }
    }, [transactionSuccess]);

    return (
        <BaseLayout>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    gap: "20px",
                    maxWidth: "90vw",
                    margin: "auto",
                }}
            >
                <div
                    style={{
                        textAlign: "left",
                        padding: "20px",
                        border: "1px solid #ccc",
                        borderRadius: "10px",
                        boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
                        maxWidth: "90vw",
                        width: "30%",
                        background: "#fff",
                        wordWrap: "break-word",
                    }}
                >
                    <h1 style={{ textAlign: "center", marginBottom: "20px", fontSize: "24px", fontWeight: "bold" }}>My Nft Details</h1>

                    {copyright ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <p><strong>Address:</strong> {copyright.user.address}</p>
                            <p><strong>Username:</strong> {copyright.user.username}</p>
                            <p><strong>Email:</strong> {copyright.user.email}</p>
                            <p><strong>Title:</strong> {copyright.metaData.name}</p>
                            <p>
                                <strong>Form: </strong>
                                <Link href={copyright.metaData.applicationForm} legacyBehavior>
                                    <a className="underline text-indigo-600" target="_blank" rel="noopener noreferrer">
                                        Link
                                    </a>
                                </Link>
                            </p>
                            <p>
                                <strong>Samples:</strong>
                                <div className="block w-40 aspect-w-10 aspect-h-7 rounded-lg overflow-hidden">
                                    <img src={copyright.metaData.samples} alt="" className="object-cover" />
                                </div>
                            </p>

                            <p>
                                <strong>Created At:</strong>
                                {new Intl.DateTimeFormat("vi-VN", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit"
                                }).format(new Date(copyright.metaData.createAt))}
                            </p>
                            <p>
                                <strong>Update At:</strong>
                                {new Intl.DateTimeFormat("vi-VN", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit"
                                }).format(new Date(copyright.metaData.updateAt))}
                            </p>
                            <p><strong>Status:</strong> {copyright.status}</p>
                        </div>


                    ) : (
                        <p style={{ textAlign: "center", fontWeight: "bold", color: "red" }}>Nft not found</p>
                    )}
                </div>


                <div
                    style={{
                        flex: "0 0 70%",
                        padding: "20px",
                        border: "1px solid #ccc",
                        borderRadius: "10px",
                        boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
                        maxWidth: "90vw",
                        width: "30%",
                        background: "#fff",
                        wordWrap: "break-word",
                    }}
                >
                    <h1 style={{ textAlign: "center", marginBottom: "20px", fontSize: "24px", fontWeight: "bold" }}>
                        Transfer copyright
                    </h1>
                    <div>
                        <div className="flex items-end space-x-4">
                            <div className="flex-1">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Address
                                </label>
                                <input
                                    onChange={handleChange}
                                    type="text"
                                    name="name"
                                    id="name"
                                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-md sm:text-sm border-gray-300 px-3 py-2"
                                    placeholder=""
                                />
                            </div>
                            <button
                                onClick={verifyAddress}
                                type="button"
                                className="h-10 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Verify Address
                            </button>
                        </div>

                        {/* Hiển thị thông tin người dùng dưới input và button */}
                        {/* Thông tin người dùng */}
                        {isVerified && (
                            userInfo ? (
                                <div className="mt-4 p-4 border rounded-lg bg-gray-50 shadow-md">
                                    <h2 className="text-lg font-bold text-gray-800">User Information</h2>
                                    <div className="mt-2 space-y-1 text-sm text-gray-700">
                                        <p><strong>ID:</strong> {userInfo.id}</p>
                                        <p><strong>Username:</strong> {userInfo.username}</p>
                                        <p><strong>Email:</strong> {userInfo.email}</p>
                                        <p><strong>Role:</strong> {userInfo.role}</p>
                                        <p><strong>Approved:</strong> {userInfo.isApprove ? "Yes" : "No"}</p>
                                        <p><strong>Active:</strong> {userInfo.active ? "Yes" : "No"}</p>
                                        <p><strong>Created At:</strong> {new Date(userInfo.createAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 border rounded-lg bg-red-50 text-red-600 shadow-md">
                                    <h2 className="text-lg font-bold">Not Found</h2>
                                    <p>User information could not be found.</p>
                                </div>
                            )
                        )}

                        {/* Nút Transfer Copyright chỉ hiển thị khi có userInfo */}
                        {userInfo && (
                            <div>
                                <div className="mt-2 flex items-end space-x-4">
                                    <div className="flex-1">
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                            Amount (ETH)
                                        </label>
                                        <input
                                            onChange={handleAmountChange}
                                            type="number"
                                            step="any"
                                            name="name"
                                            id="name"
                                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-md sm:text-sm border-gray-300 px-3 py-2"
                                            placeholder="Amount to be advanced"
                                        />
                                    </div>
                                    <button
                                        onClick={verifyAmount}
                                        type="button"
                                        className="h-10 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Accept
                                    </button>
                                </div>
                                <div className="flex justify-center mt-4">

                                    <button
                                       onClick={() => setShowDialog(true)}
                                        type="button"
                                        className="h-10 px-5 rounded-md text-white bg-green-600 hover:bg-green-700 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        Transfer Copyright
                                    </button>
                                </div>
                            </div>
                        )}

                        {showDialog && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                                <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full text-center transform scale-105 transition-all">
                                    <h2 className="text-2xl font-bold text-gray-800">Transfer Confirmation</h2>
                                    <p className="mt-2 text-gray-600">Are you sure you want to transfer copyright?</p>
                                    <div className="mt-6 flex justify-center space-x-5">
                                        <button
                                            className="px-6 py-3 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                                            onClick={() => setShowDialog(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                            onClick={transfer_copyright}
                                        >
                                            Confirm
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

{showDialogTrue && (
                        <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50">
                            <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-lg w-full transform scale-105 transition-all">
                                <h2 className="text-2xl font-bold text-green-600">🎉 Payment Successful!</h2>
                                <p className="mt-2 text-gray-700">
                                    Thank you for your payment. Please wait for the verifier response.
                                </p>
                                <button
                                    className="mt-6 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
                                    onClick={() => {
                                        setTransactionSuccess(false);
                                        window.location.reload(); 
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}


                    </div>



                </div>
            </div>
        </BaseLayout>
    );
}


export interface User {
    id: number;
    username: string;
    address: string;
    email: string;
    role: string;
    isApprove: boolean;
    createAt: string;
    orders: any[];
    active: boolean;
    enabled: boolean;
    password: string;
    authorities: {
        authority: string;
    }[];
    accountNonLocked: boolean;
    accountNonExpired: boolean;
    credentialsNonExpired: boolean;
}