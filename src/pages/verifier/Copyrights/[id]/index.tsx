import { useRouter } from "next/router";
import useSWR, { mutate } from "swr";
import { useState } from "react";
import BaseLayout from "@ui/layout/BaseLayout";
import { fetch_copyright_by_id, update_copyright_status } from "components/fectData/fetch_copyright";

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

    const handleUpdateStatus = async () => {
        if (!newStatus) return alert("Please select a status!");

        try {
            await update_copyright_status(idString, newStatus);
            alert("Status updated successfully!");
            mutate(["fetch_copyright_by_id", idString]);
        } catch (err) {
            alert("Failed to update status!");
        }
    };

    const handleSendEmail = () => {
        if (!emailContent) return alert("Please enter the reason for the rejection or lack of information.");
        // Implement sending email logic here (you can leave this part empty for now)
        alert("Email has been sent successfully!");
    };

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
                            <p><strong>Form:</strong> {copyrights.metaData.applicationForm}</p>
                            <p>
                                <strong>Created At:</strong>
                                {new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "2-digit" }).format(new Date(copyrights.metaData.createAt))}
                            </p>
                            <p><strong>Status:</strong> {copyrights.status}</p>

                            {/* Dropdown to select status */}
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                style={{ padding: "10px", borderRadius: "5px", fontSize: "16px" }}
                            >
                                <option value="">Select Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Lack Information">Lack Information</option>
                            </select>

                            {/* If "Rejected" or "Lack Information" is selected, show form for email */}
                            {(newStatus === "Rejected" || newStatus === "Lack Information") && (
                                <div>
                                    <p><strong>Email to send:</strong> {copyrights.user.email}</p>
                                    <p><strong>Subject:</strong> {newStatus === "Rejected" ? "Rejection Notice " : "Information Missing"}</p>

                                    <textarea
                                        placeholder={newStatus === "Rejected" ? "Enter reason for rejection..." : "Enter details for missing information..."}
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        style={{ padding: "10px", fontSize: "16px", width: "100%", height: "100px", marginTop: "10px" }}
                                    />

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
                                        onClick={handleSendEmail}
                                    >
                                        Send Email
                                    </button>
                                </div>
                            )}

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

                            {/* Back button */}
                            <button
                                style={{
                                    marginTop: "15px",
                                    padding: "10px 16px",
                                    background: "#0070f3",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    textTransform: "uppercase",
                                }}
                                onClick={() => router.push("/verifier/Copyrights")}
                            >
                                Back
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
