import { useRouter } from "next/router";
import useSWR, { mutate } from "swr";
import { useState } from "react";
import BaseLayout from "@ui/layout/BaseLayout";
import { fetch_copyright_by_id, send_email_api, update_status_copyright_by_id } from "components/fectData/fetch_copyright";
import { useWeb3 } from "@providers/web3";
import { data } from "framer-motion/client";
import { Status } from "@_types/nft";
import { emailRequest } from "@_types/emailRequest";
import { toast } from "react-toastify";
import Link from "next/link";

export default function UserDetailPage() {
    const router = useRouter();
    const { id } = router.query;
    const idString = Array.isArray(id) ? id[0] : id;

    const { data: copyrights, error, isLoading } = useSWR(
        idString ? ["fetch_copyright_by_id", idString] : null,
        () => fetch_copyright_by_id(idString as string)
    );

    const [newStatus, setNewStatus] = useState("");
    const [reason, setReason] = useState("");
    const [emailContent, setEmailContent] = useState("");
    const { ethereum, copyrightContract } = useWeb3();

    const transferNft = async () => {
        if (!copyrights?.tokenId || !copyrights?.user?.address) {
            console.error("Missing tokenId or user address");
            return;
        }

        const tokenId = BigInt(copyrights.tokenId); // Ép kiểu về BigNumberish
        const tx = await copyrightContract?.transferTo(tokenId, copyrights.user.address);
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
            if (!idString) {
                alert("Invalid ID");
                return;
            }
            if (!copyrights?.tokenId) {
                alert("Token ID is invalid!");
                return;
            }

            if (newStatus == "PENDING") {
                const tx = await copyrightContract?.updateStatus(copyrights?.tokenId, 2)
                if (tx) {
                    await update_status_copyright_by_id(Number(idString), newStatus);
                }
            }
            else if (newStatus == "INCOMPLETE") {
                const tx = await copyrightContract?.updateStatus(copyrights?.tokenId, 3)
                if (tx) {
                    await update_status_copyright_by_id(Number(idString), newStatus);
                }
            }
            else if (newStatus == "PUBLISHED") {
                const tx = await copyrightContract?.updateStatus(copyrights?.tokenId, 4)
                await transferNft()
                if (tx) {
                    await update_status_copyright_by_id(Number(idString), newStatus);
                }
            }
            else if (newStatus == "APPROVED") {
                const tx = await copyrightContract?.updateStatus(copyrights?.tokenId, 5)
                if (tx) {
                    await update_status_copyright_by_id(Number(idString), newStatus);
                }
            }
            else if (newStatus == "REJECTED") {
                const tx = await copyrightContract?.updateStatus(copyrights?.tokenId, 6)
                if (tx) {
                    await update_status_copyright_by_id(Number(idString), newStatus);
                }

            }
            alert("Status updated successfully!");
            mutate(["fetch_copyright_by_id", idString]);
        } catch (err) {
            alert("Failed to update status!");
        }
    };

    const handleSendEmail = async () => {
        if (!reason) {
            alert("Please enter the reason for the rejection or lack of information.");
            return;
        }

        try {
            const emailData: emailRequest = {
                to: {
                    name: copyrights!.user.username,
                    email: copyrights!.user.email
                },
                subject: newStatus === "REJECTED" ? "Rejection Notice" : "Information Missing",
                htmlContent: reason
            };

            console.log("Sending email with data:", JSON.stringify(emailData, null, 2)); // 🛠 Debug JSON gửi đi

            await send_email_api(emailData);
            alert("Email has been sent successfully!");
        } catch (error) {
            console.error("Failed to send email:", error);
            alert("Failed to send email!");
        }
    };

    const handleUpdateMetadata = async () => {
        const tx = await copyrightContract?.updateUri(copyrights?.tokenId || 0, copyrights?.metaData.uri || " ")
        await toast.promise(
            tx!.wait(), {
            pending: "Update NFT",
            success: "Update successfully",
            error: "Update error"
        }
        );
    }

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
                    <h1 style={{ textAlign: "center", marginBottom: "20px", fontSize: "24px", fontWeight: "bold" }}>User Details</h1>

                    {copyrights ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <p><strong>Address:</strong> {copyrights.user.address}</p>
                            <p><strong>Username:</strong> {copyrights.user.username}</p>
                            <p><strong>Email:</strong> {copyrights.user.email}</p>
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
                                <Link href={copyrights.metaData.samples} legacyBehavior>
                                    <a className="underline text-indigo-600" target="_blank" rel="noopener noreferrer">
                                        {copyrights.metaData.samples}
                                    </a>
                                </Link>
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
                                }).format(new Date(copyrights.metaData.createAt))}
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
                                }).format(new Date(copyrights.metaData.updateAt))}
                            </p>

                            <p><strong>Status:</strong> {copyrights.status}</p>
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                style={{ padding: "10px", borderRadius: "5px", fontSize: "16px" }}
                            >
                                <option value="">Select Status</option>
                                <option value="Uploaded">Uploaded</option>
                                <option value="PENDING">PENDING</option>
                                <option value="INCOMPLETE">INCOMPLETE</option>
                                <option value="PUBLISHED">PUBLISHED</option>
                                <option value="APPROVED">APPROVED</option>
                                <option value="REJECTED">REJECTED</option>
                            </select>
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
                        </div>
                    ) : (
                        <p style={{ textAlign: "center", fontWeight: "bold", color: "red" }}>User not found</p>
                    )}
                </div>
            </div>
        </BaseLayout>

    );
}
