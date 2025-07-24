/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { emailRequest } from "@_types/emailRequest";
import { NftMeta, PinataRes, Status } from "@_types/nft";
import { useWeb3 } from "@providers/web3";
import { BaseLayout } from "@ui";
import TransactionBill from "@ui/bill/TransactionBill";
import axios from "axios";
import { fetch_copyright_by_id, send_email_api, update_copyright_by_id, update_status_copyright_by_id } from "components/fectData/fetch_copyright";
import { fetch_all_transfer_copyright_by_verifier, fetch_transfer_copyright_by_search, update_status_transfer_copyright_by_id } from "components/fectData/transfer_copyright";
import { useTransaction } from "components/service/transaction";
import { set } from "date-fns";
import { data, u } from "framer-motion/client";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import useSWR, { mutate } from "swr";

type StatusHistory = {
    status: number;
    timestamp: number;
};

const statusLabels: Record<number, string> = {
    1: "Uploaded",
    2: "Pending",
    3: "Incomplete",
    4: "Publish",
    5: "Approved",
    6: "Rejected",
};



export default function MyNftPage() {
    const router = useRouter();
    const { id } = router.query;
    const idString = Array.isArray(id) ? id[0] : id ?? "";
    const { BigNumber } = require("ethers");



    const { data: copyright, error, isLoading } = useSWR(
        idString ? ["fetch_copyright_by_id", idString] : null,
        () => fetch_copyright_by_id(idString as string)
    );


    const { ethereum, copyrightContract } = useWeb3();
    const [nftURI, setNftURI] = useState("");
const [nftMeta, setNftMeta] = useState<NftMeta>({
  uri: "",
  name: "",
  description: "",
  samples: "",
  applicationForm: "",
  createAt: "",
  updateAt: "",
  activeAt: "",
  expiredAt: "",
});


    const [timelineSteps, setTimelineSteps] = useState<{ date: string; label: string }[]>([]);

    const durations = [
        { years: 3, price: "$30", p: 0.003, popular: false },
        { years: 5, price: "$45", p: 0.045, popular: true },
        { years: 10, price: "$80", p: 0.08, popular: false },
    ];

    const [selected, setSelected] = useState<number | null>(3);
    const [selectedPrice, setSelectedPrice] = useState<number | null>(30);
    const [showRenewDialog, setShowRenewDialog] = useState(false);

    const handleSelect = (years: number, price: number) => {
        setSelected(years);
        setSelectedPrice(price);
        setTimeout(() => {
            // xử lý khi chọn xong
        }, 300);
    };
    const now = new Date();
    const expiredDate = new Date(now);
    if (selected !== null) {
        expiredDate.setFullYear(expiredDate.getFullYear() + selected);
    }
    const expiredAt = expiredDate.toISOString().slice(0, 10);

    useEffect(() => {
        if (copyright) {
            setNftMeta(prevMeta => ({
                ...prevMeta,
                name: copyright.metaData.name || "",
                description: "ffff",
            }));
        }

        const fetchHistory = async () => {
            if (!copyrightContract) return;

            console.log("Fetching history...");

            try {
                const history: any = await copyrightContract.getStatusHistory(copyright?.tokenId || 0);
                console.log("Raw history data:", history);

                if (!history || typeof history !== "object") {
                    throw new Error("Invalid data structure returned from getStatusHistory");
                }

                let processedData: StatusHistory[] = [];

                if ("status" in history && "timestamp" in history) {
                    processedData = [{
                        status: BigNumber.from(history.status).toNumber(),
                        timestamp: BigNumber.from(history.timestamp).toNumber(),
                    }];
                } else if (Array.isArray(history)) {
                    processedData = history.map(entry => ({
                        status: BigNumber.from(entry[0]).toNumber(),
                        timestamp: BigNumber.from(entry[1]).toNumber(),
                    }));
                } else {
                    throw new Error("Unexpected data format in getStatusHistory response");
                }

                // Chuyển đổi thành format timelineSteps
                const formattedTimeline = processedData.map(entry => ({
                    date: new Date(entry.timestamp * 1000).toLocaleDateString("en-GB"), // Định dạng ngày
                    label: statusLabels[entry.status] || "Unknown",
                }));

                setTimelineSteps(formattedTimeline);
            } catch (error) {
                console.error("Error fetching status history:", error);
            }
        };

        fetchHistory();
    }, [copyright, copyrightContract]);






    const ID = copyright?.id; // Lấy orderId từ copyright nếu có

    const { data: transferCopyrightData, error: transferError, isLoading: transferLoading } = useSWR(
        ID ? ["fetch_transfer_copyright", ID] : null,
        () => fetch_transfer_copyright_by_search({ orderId: ID })
    );







    const [fileName, setFileName] = useState<string | null>(null);
    const getSignedData = async () => {
        const messageToSign = await axios.get("/api/verify");
        const accounts = await ethereum?.request({ method: "eth_requestAccounts" }) as string[];
        const account = accounts[0];

        const signedData = await ethereum?.request({
            method: "personal_sign",
            params: [JSON.stringify(messageToSign.data), account, messageToSign.data.id]
        })

        return { signedData, account };
    }

    const handleCancelTransfer = async () => {
        if (!transferCopyrightData || transferCopyrightData.length === 0) {
            console.error("No transfer data available");
            return;
        }

        try {
            await update_status_transfer_copyright_by_id(
                Number(transferCopyrightData[0]?.id),
                "CANCELLED_REQUIRED"
            );
            window.location.reload();
        } catch (error) {
            console.error("Failed to cancel transfer:", error);
            toast.error("Failed to cancel transfer. Please try again.");
        }
    };


    const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            console.error("Select a file");
            return;
        }

        const file = e.target.files[0];
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        try {
            const { signedData, account } = await getSignedData();
            const promise = axios.post("/api/verify-file", {
                address: account,
                signature: signedData,
                bytes,
                contentType: file.type,
                fileName: file.name.replace(/\.[^/.]+$/, "")
            });
            const res = await toast.promise(
                promise, {
                pending: "Uploading image",
                success: "File uploaded",
                error: "File upload error"
            }
            )
            const data = res.data as PinataRes;
            console.log(`${process.env.NEXT_PUBLIC_PINATA_DOMAIN}/ipfs/${data.IpfsHash}`)
            setNftMeta({
                ...nftMeta,
                applicationForm: `${process.env.NEXT_PUBLIC_PINATA_DOMAIN}/ipfs/${data.IpfsHash}`
            });

            // Cập nhật tên file vào state
            setFileName(file.name);
        } catch (e: any) {
            console.error(e.message);
        }
    }


    const handleImage = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            console.error("Select a file");
            return;
        }

        const file = e.target.files[0];
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        try {
            const { signedData, account } = await getSignedData();
            const promise = axios.post("/api/verify-image", {
                address: account,
                signature: signedData,
                bytes,
                contentType: file.type,
                fileName: file.name.replace(/\.[^/.]+$/, "")
            });
            const res = await toast.promise(
                promise, {
                pending: "Uploading image",
                success: "Image uploaded",
                error: "Image upload error"
            }
            )
            const data = res.data as PinataRes;
            console.log(`${process.env.NEXT_PUBLIC_PINATA_DOMAIN}/ipfs/${data.IpfsHash}`)
            setNftMeta({
                ...nftMeta,
                samples: `${process.env.NEXT_PUBLIC_PINATA_DOMAIN}/ipfs/${data.IpfsHash}`
            });
        } catch (e: any) {
            console.error(e.message);
        }
    }

    const uploadMetadata = async () => {
        try {
            const { signedData, account } = await getSignedData();
            console.log(nftMeta)
            const promise = axios.post("/api/verify", {
                address: account,
                signature: signedData,
                nft: nftMeta
            })
            const res = await toast.promise(
                promise, {
                pending: "Uploading metadata",
                success: "Metadata uploaded",
                error: "Metadata upload error"
            }
            )
            const data = res.data as PinataRes;
            setNftURI(`${process.env.NEXT_PUBLIC_PINATA_DOMAIN}/ipfs/${data.IpfsHash}`);

            const updatePromise = update_copyright_by_id(nftMeta.samples, nftMeta.applicationForm, `${process.env.NEXT_PUBLIC_PINATA_DOMAIN}/ipfs/${data.IpfsHash}`, copyright?.id || "1");
            alert("Upload nft successfully")
        } catch (e: any) {
            console.error(e.message);
        }
    }

    const { sendTransaction, transactionSuccess, setTransactionSuccess } = useTransaction();

    const [showDialog, setShowDialog] = useState(false); // Trạng thái hiển thị dialog

    const handleConfirmPayment = async () => {
        setShowDialog(false); // Ẩn dialog khi xác nhận
        const verifierFee = 0.0009;
        const tempHoldFee = 0.0005;
        const total = Number((copyright!.gasFee + verifierFee - tempHoldFee).toFixed(6));
        if (!copyright) {
            console.error("Copyright data is not available yet!");
            return;
        }

        try {
            sendTransaction(copyright.verifierAddress, total, idString, true, Status.PAID);
        } catch (e: any) {
            console.error(e.message);
        }
    };


    const handleRenew = async () => {
        setShowRenewDialog(false);

        if (!copyright) {
            console.error("Copyright data is not available yet!");
            return;
        }
        console.log(expiredAt)
        await sendTransaction(copyright.verifierAddress || "", selectedPrice || 0.0002, copyright.id, true, Status.REQUEST_RENEW, expiredAt);
        // await sendTransaction(copyright.verifierAddress || "", selectedPrice || 0, "0", true, Status.REQUEST_RENEW);


    };



    const [showDialogTrue, setShowDialogTrue] = useState(false);

    const [showDialogCancel, setShowDialogCancel] = useState(false);


    useEffect(() => {
        if (transactionSuccess) {
            setShowDialogTrue(true);
        }
    }, [transactionSuccess]);


    if (isLoading) return <p style={{ textAlign: "center" }}>Loading user data...</p>;
    if (error) return <p style={{ textAlign: "center", color: "red" }}>Error fetching user data</p>;
    // const timelineSteps = [
    //     { date: "10/01", label: "Uploaded" },
    //     { date: "12/02", label: "Pending" },
    //     { date: "13/02", label: "Approve" },
    //     { date: "14/02", label: "Publish" },
    // ];

    const handleCheckout = () => {
        handleConfirmPayment(); // Gọi hàm xác nhận thanh toán
        console.log("Checkout button clicked!");
        // xử lý tiếp theo
    };

    const handleCancel = () => {
        setShowDialog(false); // Ẩn dialog khi nhấn nút Cancel
        console.log("Cancel button clicked!");
        // tắt modal, ẩn bill, hoặc điều hướng
    };





    return (
        <BaseLayout>
            <div
            >
                <div
                    style={{
                        textAlign: "left",
                        padding: "20px",
                        border: "1px solid #ccc",
                        borderRadius: "10px",
                        boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
                        width: "90%",
                        background: "#fff",
                        wordWrap: "break-word",
                        margin: "0 auto",  // Căn giữa
                    }}
                >

                    <h1 style={{ textAlign: "center", marginBottom: "20px", fontSize: "24px", fontWeight: "bold" }}>My Copyright Details</h1>

                    {copyright ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <p><strong>Address:</strong> {copyright.user.address}</p>
                            <p><strong>Username:</strong> {copyright.user.username}</p>
                            <p><strong>Email:</strong> {copyright.user.email}</p>
                            <p><strong>Title:</strong> {copyright.metaData.name}</p>
                            <p>
                                <strong>Form:</strong>
                                <Link href={copyright.metaData.applicationForm} legacyBehavior>
                                    <a className="underline text-indigo-600" target="_blank" rel="noopener noreferrer">
                                        {copyright.metaData.applicationForm}
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
                                <strong>Created At: </strong>
                                {new Intl.DateTimeFormat("vi-VN", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit"
                                }).format(new Date(copyright.metaData.createAt))}
                            </p>
                              {copyright?.status !== Status.PUBLISHED && (
                                <>
                                                            <p>
                                <strong>Update At: </strong>
                                {new Intl.DateTimeFormat("vi-VN", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit"
                                }).format(new Date(copyright.metaData.updateAt))}
                            </p>
                                </>)}

                            {copyright?.status === Status.PUBLISHED && (
                                <>
                                    <p>
                                        <strong>Expired At: </strong>
                                        {new Intl.DateTimeFormat("vi-VN", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                        }).format(new Date(copyright.metaData.expiredAt))}
                                    </p>
                                </>)}
                            <p><strong>Status:</strong> {copyright.status}</p>


                            {copyright?.status === Status.EXPIRED && (
                                <>

                                    <div style={{ color: 'red' }}>
                                        <p>Copyright expired on {copyright.metaData.expiredAt}</p>
                                        <p>You have 10 days from the expiration date to renew. Otherwise, the copyright will be permanently deleted.</p>
                                    </div>

                                </>
                            )}

                            {copyright?.status === Status.REQUEST_RENEW && (
                                <div style={{ color: 'red' }}>
                                    <p>Please wait for the verifier to review your renewal request.</p>
                                </div>
                            )}



                            <p><strong>Transfer:</strong> {copyright.isTransfer ? "✔️" : "❌"}</p>

                            {/* {copyright?.isTransfer == true && (
                                <p><strong>Status Transfer:</strong> {transferCopyrightData.status ? "✔️" : "❌"}</p>
                            )} */}
                            {copyright?.isTransfer && transferCopyrightData && (
                                <p><strong>Status Transfer:</strong> {transferCopyrightData[0].status}</p>
                            )}


                            {copyright?.isTransfer && transferCopyrightData && (
                                <p><strong>Transfer To User:</strong> {transferCopyrightData[0].toUserAddress}</p>
                            )}
                            {copyright?.isTransfer && transferCopyrightData && (
                                <p><strong>Verifier Transfer:</strong> {transferCopyrightData[0].verifierAddress}</p>
                            )}


                            {copyright?.status === Status.APPROVED && (
                                <>
                                    <div className="mt-5 flex justify-center">
                                        <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setShowDialog(true)} >Payment</button>
                                    </div>
                                </>
                            )}

                            {copyright?.status === Status.EXPIRED && (
                                <>
                                    <button
                                        onClick={() => setShowRenewDialog(true)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                                    >
                                        Renew
                                    </button>
                                </>
                            )}

                            {copyright?.status === Status.INCOMPLETE && (
                                <>
                                    <div className="mt-5 flex justify-center space-x-6">
                                        {/* Upload Samples */}
                                        {nftMeta.samples ?
                                            <img src={nftMeta.samples} alt="" className="h-40" /> :
                                            <div className="w-1/2">
                                                <label className="block text-sm font-medium text-gray-700">Image</label>
                                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                                    <div className="space-y-1 text-center">
                                                        <svg
                                                            className="mx-auto h-12 w-12 text-gray-400"
                                                            stroke="currentColor"
                                                            fill="none"
                                                            viewBox="0 0 48 48"
                                                            aria-hidden="true"
                                                        >
                                                            <path
                                                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                                strokeWidth={2}
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round" />
                                                        </svg>
                                                        <div className="flex text-sm text-gray-600">
                                                            <label
                                                                htmlFor="file-upload-samples"
                                                                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                                            >
                                                                <span>Upload a sample</span>
                                                                <input
                                                                    onChange={handleImage}
                                                                    id="file-upload-samples"
                                                                    name="file-upload"
                                                                    type="file"
                                                                    className="sr-only" />
                                                            </label>
                                                            <p className="pl-1">or drag and drop</p>
                                                        </div>
                                                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                                    </div>
                                                </div>
                                            </div>
                                        }

                                        {/* Upload File */}
                                        {nftMeta.applicationForm ? (
                                            <div className="mt-2 text-sm text-gray-500">
                                                <span>File uploaded: </span>
                                                <span className="font-medium">{fileName}</span>
                                            </div>
                                        ) : (
                                            <div className="w-1/2">
                                                <label className="block text-sm font-medium text-gray-700">File upload</label>
                                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                                    <div className="space-y-1 text-center">
                                                        <div className="flex text-sm text-gray-600">
                                                            <label
                                                                htmlFor="file-upload-doc"
                                                                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                                            >
                                                                <span>Upload a file</span>
                                                                <input
                                                                    onChange={handleFile}
                                                                    id="file-upload-doc"
                                                                    name="file-upload"
                                                                    type="file"
                                                                    className="sr-only"
                                                                />
                                                            </label>
                                                            <p className="pl-1">or drag and drop</p>
                                                        </div>
                                                        <p className="text-xs text-gray-500">DOC, PDF up to 10MB</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                    <div className="mt-5 flex justify-center">
                                        <button className="w-40 h-10 bg-indigo-600 text-white font-bold" onClick={uploadMetadata}>Submit</button>
                                    </div>
                                </>
                            )}

                            {copyright?.isTransfer == true && (
                                <>
                                    <div className="mt-5 flex justify-center">
                                        <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setShowDialogCancel(true)} >Cancel transfer</button>
                                    </div>
                                </>
                            )}

                            {showRenewDialog && (
                                <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50">
                                    <div className="mt-10 bg-white p-10 rounded-2xl border border-gray-300 shadow-xl w-full max-w-4xl">
                                        <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">
                                            Choose license expiration duration
                                        </h2>

                                        {/* Grid lựa chọn */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                            {durations.map((option, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => handleSelect(option.years, option.p)}
                                                    className={`
              border rounded-2xl p-8 cursor-pointer transition duration-200 flex flex-col items-center justify-center h-64 text-center
              ${selected === option.years ? "border-blue-500 shadow-xl" : "border-gray-300"}
              ${option.popular ? "bg-green-50 border-green-500" : "bg-white"}
              hover:shadow-lg
            `}
                                                >
                                                    {option.popular && (
                                                        <div className="text-xs text-white bg-green-500 px-3 py-1 rounded-full mb-2">
                                                            MOST POPULAR
                                                        </div>
                                                    )}
                                                    <h3 className="text-2xl font-semibold">{option.years} Years</h3>
                                                    <p className="text-gray-600 mt-2">
                                                        Valid license duration: {option.years} years
                                                    </p>
                                                    <p className="text-xl font-bold mt-4">{option.price}</p>
                                                    {selected === option.years && (
                                                        <p className="text-blue-500 font-medium mt-2">✓ Selected</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Các nút action căn giữa */}
                                        <div className="mt-4 flex justify-center space-x-4">
                                            <button
                                                onClick={() => setShowRenewDialog(false)}
                                                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleRenew()
                                                    // TODO: thực hiện thanh toán hoặc điều hướng
                                                    console.log("Proceed to payment with:", selected, "years");
                                                }}
                                                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                                            >
                                                Proceed to Payment
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}


                            {showDialog && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                                    <TransactionBill
                                        transactionId="0x123ABC"
                                        recipientAddress={copyright.verifierAddress}
                                        gasFee={copyright.gasFee}
                                        verifierFee={0.0009}
                                        tempHoldFee={0.0005}
                                        total={copyright.gasFee + 0.0009 - 0.0005}
                                        timestamp={new Date().toISOString()}
                                        paymentDescription="The total amount to verify and register your copyright"
                                        onCheckout={handleCheckout}
                                        onCancel={handleCancel}
                                    />

                                </div>
                            )}

                            {showDialogTrue && (
                                <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50">
                                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                                        <h2 className="text-xl font-semibold text-green-600">Thanh toán thành công! 🎉</h2>
                                        <p>Giao dịch của bạn đã được xác nhận.</p>
                                        <button
                                            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                                            onClick={() => {
                                                setTransactionSuccess(false);
                                                window.location.reload(); // Reload trang
                                            }}
                                        >
                                            Đóng
                                        </button>
                                    </div>
                                </div>
                            )}

                            {showDialogCancel && (
                                <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50">
                                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                                        <h2 className="text-xl font-bold text-gray-800 mb-3">Confirm Cancellation</h2>
                                        <p className="text-gray-600 text-lg">Are you sure you want to cancel the patent transfer?</p>
                                        <div className="mt-6 flex justify-end space-x-4">
                                            <button
                                                className="px-5 py-3 bg-gray-300 text-gray-700 rounded-lg text-lg font-semibold hover:bg-gray-400 transition"
                                                onClick={() => setShowDialogCancel(false)}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                className="px-5 py-3 bg-red-600 text-white rounded-lg text-lg font-semibold hover:bg-red-700 transition"
                                                onClick={handleCancelTransfer}
                                            >
                                                Confirm
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>


                    ) : (
                        <p style={{ textAlign: "center", fontWeight: "bold", color: "red" }}>Nft not found</p>
                    )}
                </div>
                {copyright?.status === Status.PUBLISHED && (
                    <>
                        <h1 style={{ textAlign: "center", marginBottom: "20px", fontSize: "24px", fontWeight: "bold", marginTop: "20px" }}>History copyright register process</h1>
                        <div className="flex justify-center items-center mt-10">
                            <div className="relative flex items-center w-full max-w-4xl">
                                {timelineSteps.map((step, index) => (
                                    <div key={index} className="relative flex flex-col items-center w-1/4">
                                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm z-10">
                                            {index + 1}
                                        </div>

                                        <p className="mt-2 text-sm text-gray-600">{step.date}</p>

                                        <p className="text-md font-semibold">{step.label}</p>

                                        {index < timelineSteps.length - 1 && (
                                            <div
                                                className="absolute top-4 right-1/2 transform translate-x-1/2 w-1/2 h-1 bg-red-500 z-0"
                                                style={{ left: '50%' }}
                                            ></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}


            </div>
        </BaseLayout>
    );
}