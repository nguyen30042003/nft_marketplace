/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/router";
import useSWR, { mutate } from "swr";
import { useEffect, useState } from "react";
import BaseLayout from "@ui/layout/BaseLayout";
import { fetch_copyright_by_id, send_email_api, update_status_copyright_by_id } from "components/fectData/fetch_copyright";
import { useWeb3 } from "@providers/web3";
import Link from "next/link";
import { fetch_transfer_copyright_by_id, update_status_transfer_copyright_by_id } from "components/fectData/transfer_copyright";
import { useFetchUserByAddress } from "components/fectData/fetch_user";
import { useTransaction, useTransactionPaymentTransfer } from "components/service/transaction";

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
        if (transactionSuccess) {
            setShowDialogTrue(true);
        }
    }, [transactionSuccess]);

    if (isLoading) return <p style={{ textAlign: "center" }}>Loading user data...</p>;
    if (error) return <p style={{ textAlign: "center", color: "red" }}>Error fetching user data</p>;

    return (
        <BaseLayout>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
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
                    <h1 style={{ textAlign: "center", marginBottom: "20px", fontSize: "24px", fontWeight: "bold" }}>User Details</h1>

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
                            {transferCopyright?.status == "PAYMENT_REQUIRED" && (
                                <>
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
                                        onClick={() => dialog()}
                                    >
                                        Payment
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <p style={{ textAlign: "center", fontWeight: "bold", color: "red" }}>User not found</p>
                    )}

                    {showDialog && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full text-center transform scale-105 transition-all">
                                <h2 className="text-2xl font-bold text-gray-800">Payment Confirmation</h2>
                                <p className="mt-2 text-gray-600">Are you sure you want to proceed with the payment?</p>
                                <div className="mt-6 flex justify-center space-x-5">
                                    <button
                                        className="px-6 py-3 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                                        onClick={() => setShowDialog(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                        onClick={() => handlePayment(transferCopyright?.price || 0)}
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
                                        window.location.reload(); // Reload the page
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </BaseLayout>

    );
}
