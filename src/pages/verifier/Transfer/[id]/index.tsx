/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/router";
import useSWR, { mutate } from "swr";
import { useEffect, useState } from "react";
import BaseLayout from "@ui/layout/BaseLayout";
import { fetch_copyright_by_id, send_email_api, update_is_transfer_copyright, update_status_copyright_by_id, update_userId_copyright } from "components/fectData/fetch_copyright";
import { useWeb3 } from "@providers/web3";
import { data } from "framer-motion/client";
import { Status } from "@_types/nft";
import { emailRequest } from "@_types/emailRequest";
import { toast } from "react-toastify";
import Link from "next/link";
import { detele_transfer_copyright, fetch_transfer_copyright_by_id, update_status_transfer_copyright_by_id } from "components/fectData/transfer_copyright";
import { useFetchUserByAddress } from "components/fectData/fetch_user";
import { useTransactionPaymentTransfer } from "components/service/transaction";

export default function UserDetailPage() {
    const router = useRouter();
    const { id } = router.query;
    const idString = Array.isArray(id) ? id[0] : id;

    const { data: transferCopyright, error, isLoading } = useSWR(
        idString ? ["fetch_copyright_by_id", idString] : null,
        () => fetch_transfer_copyright_by_id(idString as string)
    );
    const { data: ownerInfoSWR, isError: error1, isLoading: load1 } = useFetchUserByAddress(transferCopyright?.fromUserAddress || "");
    const { data: toUserInfoSWR, isError: error2, isLoading: load2 } = useFetchUserByAddress(transferCopyright?.toUserAddress || "");
    const { data: copyrights, error: error3, isLoading: load3 } = useSWR(
        transferCopyright?.orderId ? ["fetch_copyright_by_id", transferCopyright?.orderId] : null,
        () => fetch_copyright_by_id(String(transferCopyright?.orderId))
    );


    const [newStatus, setNewStatus] = useState("");
    const [reason, setReason] = useState("");
    const [emailContent, setEmailContent] = useState("");
    const { ethereum, copyrightContract } = useWeb3();

    const { sendTransaction, transactionSuccess, setTransactionSuccess } = useTransactionPaymentTransfer();
    const handlePayment = async (price: number) => {

        setShowDialog(false);
        try {
            await sendTransaction(copyrights?.verifierAddress || "", price, String(transferCopyright?.id) || "0", true)
            mutate(["fetch_copyright_by_id", idString]);
        } catch (err) {
            alert("Failed to update status!");
        }
    };
    const dialog = async () => {
        setShowDialog(true);
    }

    const [showDialogTrue, setShowDialogTrue] = useState(false);

    const [showDialog, setShowDialog] = useState(false);

    useEffect(() => {
        if (newStatus == "CANCELLED") {
            setShowDialogTrue(true);
        }
    }, [newStatus]);

    const transferNft = async () => {
        if (!copyrights?.tokenId || !toUserInfoSWR?.address) {
            console.error("Missing tokenId or user address");
            return;
        }

        const tokenId = BigInt(copyrights.tokenId); 
        const tx = await copyrightContract?.transferTo(tokenId, toUserInfoSWR?.address);
        await toast.promise(
            tx!.wait(), {
            pending: "Transfer NFT",
            success: "Transfer successfully",
            error: "Transfer error"
        }
        );
    }


    const handleUpdateStatus = async () => {
        if (!newStatus) return alert("Please select a status!");

        try {
            console.log(newStatus)
            await update_status_transfer_copyright_by_id(Number(transferCopyright?.id), newStatus);
            if(newStatus === "CANCELLED"){
                await detele_transfer_copyright(Number(transferCopyright?.id))
            }
            else if (newStatus === "COMPLETED") {
                try {
                    const promises = [
                        transferNft(),
                        update_userId_copyright(Number(copyrights?.id), Number(toUserInfoSWR?.id)),
                        detele_transfer_copyright(Number(transferCopyright?.id))
                    ];
            
                    // Nếu `price` > 0 thì thêm `sendTransaction` vào danh sách promise
                    if (Number(transferCopyright?.price) > 0) {
                        promises.push(
                            sendTransaction(String(ownerInfoSWR?.address), Number(transferCopyright?.price), "0", false)
                        );
                    }
            
                    await Promise.all(promises);
                    
                    // Chuyển hướng sau khi hoàn tất
                    // window.location.href = "/verifier/Transfer"; 
            
                } catch (error) {
                    console.error("Error during transfer process:", error);
                }
            }
                    await update_is_transfer_copyright(Number(copyrights?.id), false);
            
            alert("Status updated successfully!");
            mutate(["fetch_copyright_by_id", idString]);
        } catch (err) {
            alert("Failed to update status!");
        }
    };

    // const handleSendEmail = async () => {
    //     if (!reason) {
    //         alert("Please enter the reason for the rejection or lack of information.");
    //         return;
    //     }

    //     try {
    //         const emailData: emailRequest = {
    //             to: {
    //                 name: copyrights!.user.username,
    //                 email: copyrights!.user.email
    //             },
    //             subject: newStatus === "REJECTED" ? "Rejection Notice" : "Information Missing",
    //             htmlContent: reason
    //         };

    //         console.log("Sending email with data:", JSON.stringify(emailData, null, 2)); // 🛠 Debug JSON gửi đi

    //         await send_email_api(emailData);
    //         alert("Email has been sent successfully!");
    //     } catch (error) {
    //         console.error("Failed to send email:", error);
    //         alert("Failed to send email!");
    //     }
    // };

    if (isLoading) return <p style={{ textAlign: "center" }}>Loading user data...</p>;
    if (error) return <p style={{ textAlign: "center", color: "red" }}>Error fetching user data</p>;

    return (
        <BaseLayout>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh",
                    padding: "20px",
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
                        width: "100%",
                        background: "#fff",
                        wordWrap: "break-word",
                    }}
                >
                    <h1 style={{ textAlign: "center", marginBottom: "20px", fontSize: "24px", fontWeight: "bold" }}>Transfer Copyright Details</h1>

                    {copyrights ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <p><strong>Address Owner:</strong> {copyrights.user.address}</p>
                            <p><strong>Username Owner:</strong> {copyrights.user.username}</p>
                            <p><strong>Title:</strong> {copyrights.metaData.name}</p>
                            <p>
                                <strong>Form:</strong>
                                <Link href={copyrights.metaData.applicationForm} legacyBehavior>
                                    <a className="underline text-indigo-600" target="_blank" rel="noopener noreferrer">
                                        {copyrights.metaData.applicationForm}
                                    </a>
                                </Link>
                            </p>
                            <p>
                                <strong>Samples:</strong>
                                <div className="block w-40 aspect-w-10 aspect-h-7 rounded-lg overflow-hidden">
                                    <img src={copyrights.metaData.samples} alt="" className="object-cover" />
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
                                }).format(new Date(transferCopyright?.createAt || ""))}
                            </p>
                            {
                                transferCopyright?.updateAt ? (
                                    <p>
                                        <strong>Update At:</strong>
                                        {new Intl.DateTimeFormat("vi-VN", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit"
                                        }).format(new Date(transferCopyright?.updateAt || ""))}
                                    </p>
                                ) : (
                                    <p>
                                        <strong>Update At:</strong>
                                        {new Intl.DateTimeFormat("vi-VN", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit"
                                        }).format(new Date(transferCopyright?.createAt || ""))}
                                    </p>

                                )
                            }
                            <p><strong>Proxy Payment:</strong> {transferCopyright?.price} ETH</p>
                            <p><strong>Status:</strong> {transferCopyright?.status}</p>

                            <p><strong>Address Of Receiver:</strong> {toUserInfoSWR?.address}</p>
                            <p><strong>Username Of Receiver:</strong> {toUserInfoSWR?.username}</p>
                            {/* Conditionally render the dropdown and update button based on status */}
                                <>
                                    {/* Dropdown to select status */}
                                    <select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        style={{ padding: "10px", borderRadius: "5px", fontSize: "16px" }}
                                    >
                                        <option value="">Select Status</option>
                                        <option value="PENDING">PENDING</option>
                                        <option value="PAYMENT_REQUIRED">PAYMENT_REQUIRED</option>
                                        <option value="PAYMENT_COMPLETED">PAYMENT_COMPLETED</option>
                                        <option value="COMPLETED">COMPLETED</option>
                                        <option value="CANCELLED">CANCELLED</option>
                                    </select>
                                    {/* Update Status button */}
                                    <button
                                        style={{
                                            marginTop: "10px",
                                            padding: "10px 16px",
                                            background: "#28a745",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "5px",
                                            cursor: "pointer",
                                            fontWeight: "bold",
                                            textTransform: "uppercase",
                                        }}
                                        onClick={handleUpdateStatus}
                                        
                                    >
                                        Update Status
                                    </button>
                                </>

                            {showDialogTrue && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                                    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full text-center transform scale-105 transition-all">
                                        <h2 className="text-2xl font-bold text-gray-800">Cancel Confirmation</h2>
                                        <p className="mt-2 text-gray-600">Are you sure you want to cancel proceed to tranfer copyright?</p>
                                        <div className="mt-6 flex justify-center space-x-5">
                                            <button
                                                className="px-6 py-3 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                                                onClick={() => setShowDialogTrue(false)}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                                onClick={handleUpdateStatus }
                                            >
                                                Confirm
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            
                        </div>
                    ) : (
                        <p style={{ textAlign: "center", fontWeight: "bold", color: "blue" }}>Done process transfer copyright</p>
                    )}
                </div>
            </div>
        </BaseLayout>

    );
}
