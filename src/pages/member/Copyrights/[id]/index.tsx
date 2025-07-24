/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/router";
import useSWR, { mutate } from "swr";
import { useEffect, useState } from "react";
import BaseLayout from "@ui/layout/BaseLayout";
import { fetch_copyright_by_id, send_email_api, update_gas_fee_order, update_status_copyright_by_id } from "components/fectData/fetch_copyright";
import { useWeb3 } from "@providers/web3";
import { data } from "framer-motion/client";
import { BrandResponse, CopyRight, MostSimilar, Status } from "@_types/nft";
import { emailRequest } from "@_types/emailRequest";
import { toast } from "react-toastify";
import Link from "next/link";
import { fetchCheckName, fetchCheckSamples } from "components/fectData/fetch_check_copyrights";
import { ethers } from "ethers";

export default function UserDetailPage() {
    const router = useRouter();
    const { id } = router.query;
    const idString = Array.isArray(id) ? id[0] : id;

    const { data: copyrights, error, isLoading } = useSWR(
        idString ? ["fetch_copyright_by_id", idString] : null,
        () => fetch_copyright_by_id(idString as string)
    );

    const [checkResult, setCheckResult] = useState<BrandResponse | null>(null);

    // Bản quyền tương đồng (nếu có)
    const [similarCopyright, setSimilarCopyright] = useState<CopyRight | null>(null);

    // Gọi API kiểm tra tên bản quyền tương đồng
    useEffect(() => {
        const runCheck = async () => {
            const name = copyrights?.id;
            if (!name) return;

            try {
                const result = await fetchCheckName(name);
                console.log("Tên tương đồng:", result);
                setCheckResult(result);
            } catch (err) {
                console.error("Lỗi khi kiểm tra tên tương đồng:", err);
            }
        };

        runCheck();
    }, [copyrights?.id]);

    // Gọi chi tiết bản quyền từ kết quả tương đồng
    useEffect(() => {
        const fetchSimilarDetail = async () => {
            const similarId = checkResult?.id;
            if (!similarId) return;

            try {
                const detail = await fetch_copyright_by_id(similarId.toString());
                setSimilarCopyright(detail);
            } catch (err) {
                console.error("Lỗi khi lấy chi tiết bản quyền tương đồng:", err);
            }
        };

        fetchSimilarDetail();
    }, [checkResult?.id]);




    // Kết quả từ kiểm tra logo
    const [similarLogoResult, setSimilarLogoResult] = useState<MostSimilar | null>(null);
    // Bản quyền tương đồng (nếu có)
    const [similarLogoCopyright, setSimilarLogoCopyright] = useState<CopyRight | null>(null);
    // Gọi API kiểm tra logo tương đồng
    useEffect(() => {
        const runCheckSamples = async () => {
            if (!idString) return;

            try {
                const result = await fetchCheckSamples(idString);
                console.log("Logo tương đồng:", result);
                setSimilarLogoResult(result);
            } catch (err) {
                console.error("Lỗi khi kiểm tra logo tương đồng:", err);
            }
        };

        runCheckSamples();
    }, [idString]);

    // Gọi chi tiết bản quyền từ kết quả tương đồng
    useEffect(() => {
        const fetchSimilarLogo = async () => {
            const similarId = similarLogoResult?.id;
            if (!similarId) return;

            try {
                const detail = await fetch_copyright_by_id(similarId.toString());
                setSimilarLogoCopyright(detail);
            } catch (err) {
                console.error("Lỗi khi lấy chi tiết bản quyền tương đồng:", err);
            }
        };

        fetchSimilarLogo();
    }, [similarLogoResult?.id]);






    const [newStatus, setNewStatus] = useState("");
    const [reason, setReason] = useState("");
    const [emailContent, setEmailContent] = useState("");
    const { ethereum, copyrightContract } = useWeb3();



    // const transferNft = async () => {
    //     if (!copyrights?.tokenId || !copyrights?.user?.address) {
    //         console.error("Missing tokenId or user address");
    //         return;
    //     }

    //     const tokenId = BigInt(copyrights.tokenId); // Ép kiểu về BigNumberish
    //     const tx = await copyrightContract?.transferTo(tokenId, copyrights.user.address);
    //     await toast.promise(
    //         tx!.wait(), {
    //         pending: "Transfer NFT",
    //         success: "Transfer successfully",
    //         error: "Transfer error"
    //     }
    //     );
    // }

    const { provider } = useWeb3();

const getGasPrice = async () => {
    try {
        const gasPrice = await provider!.getGasPrice(); // Lấy giá gas hiện tại
        console.log("Current gas price (in wei):", gasPrice.toString());

        // Chuyển đổi giá gas từ wei sang ether
        const gasPriceInEther = ethers.utils.formatEther(gasPrice);
        console.log("Gas price in ether:", gasPriceInEther);
    } catch (err) {
        console.error("Failed to fetch gas price:", err);
    }
};



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

        let statusCode: number;
        let tx: any;

        switch (newStatus) {
            case "PENDING":
                statusCode = 2;
                tx = await copyrightContract?.updateStatus(copyrights?.tokenId, statusCode);
                break;
            case "INCOMPLETE":
                statusCode = 3;
                tx = await copyrightContract?.updateStatus(copyrights?.tokenId, statusCode);
                break;
            case "PUBLISHED":
                statusCode = 4;
                tx = await copyrightContract?.updateStatus(copyrights?.tokenId, statusCode);
                //await transferNft();
                break;
            case "APPROVED":
                statusCode = 5;
                tx = await copyrightContract?.updateStatus(copyrights?.tokenId, statusCode);
                break;
            case "REJECTED":
                statusCode = 6;
                tx = await copyrightContract?.updateStatus(copyrights?.tokenId, statusCode);
                break;
            default:
                return alert("Unknown status!");
        }

        if (!tx) {
            alert("Transaction failed!");
            return;
        }

        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed;

        // Handle event NftItemUpdated with explicit type
        const event = receipt.events?.find((e: { event: string, args?: any }) => e.event === "NftItemUpdated");
        if (event) {
            console.log("🔥 Event NftItemUpdated emitted for token:", event.args?.tokenId.toString());
        }

        console.log("⛽ Gas used:", gasUsed.toString());

        // Calculate gas cost in ETH
        const gasPriceInWei = await provider!.getGasPrice(); // Gas price in wei
        const gasCostInWei = gasUsed.mul(gasPriceInWei); // Gas cost in wei
        const gasCostInETH = ethers.utils.formatEther(gasCostInWei); // Convert to ETH
        await update_gas_fee_order(idString, parseFloat(gasCostInETH));
        console.log("Gas cost in ETH:", gasCostInETH);

        toast.success(`Updated status with gas used: ${gasUsed.toString()}`);
        
        // Update status in the backend
        await update_status_copyright_by_id(Number(idString), newStatus);
        alert("Status updated successfully!");

        // Mutate cache
        mutate(["fetch_copyright_by_id", idString]);
    } catch (err) {
        console.error("❌ Error:", err);
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

    const [showCheckCopyright, setShowCheckCopyright] = useState(false);

    const [showCheckLogoCopyright, setShowCheckLogoCopyright] = useState(false);




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

                    <div style={{ marginBottom: "20px", fontSize: "24px", fontWeight: "bold" }}>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <h1>Copyright Details</h1>
                
                        </div>
                    </div>

                    {showCheckCopyright && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                            <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 relative w-full max-w-xl mx-4">
                                <button
                                    className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl font-bold"
                                    onClick={() => setShowCheckCopyright(false)}
                                >
                                    ×
                                </button>
                                <h2 className="text-xl font-bold mb-4">
                                    Similar name copyright Information</h2>
                                {checkResult && similarCopyright ? (
                                    <>
                                        <div className="mb-2"><strong>Name Brand:</strong> {checkResult.brand}</div>
                                        <div className="mb-2">
                                            <strong>Score:</strong> {typeof checkResult.score === 'number' ? (checkResult.score * 100).toFixed(2) + "%" : "N/A"}
                                        </div>


                                        <div className="mb-2"><strong>Owner address:</strong> {similarCopyright.user.address}</div>
                                        <div className="mb-2"><strong>Sample:</strong><div className="block w-40 aspect-w-10 aspect-h-7 rounded-lg overflow-hidden">
                                            <img src={similarCopyright.metaData.samples} alt="" className="object-cover" />
                                        </div> </div>
                                        <div className="mb-2"><strong>Application form:</strong><Link href={similarCopyright.metaData.applicationForm} legacyBehavior>
                                            <a className="underline text-indigo-600" target="_blank" rel="noopener noreferrer">
                                                {similarCopyright.metaData.applicationForm}
                                            </a>
                                        </Link> </div>
                                        <div className="mb-2"><strong>Status:</strong> {similarCopyright.status}</div>
                                    </>
                                ) : (
                                    <p className="text-gray-500 italic">Not similar copyright.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {showCheckLogoCopyright && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                            <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 relative w-full max-w-xl mx-4">
                                <button
                                    className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl font-bold"
                                    onClick={() => setShowCheckLogoCopyright(false)}
                                >
                                    ×
                                </button>
                                <h2 className="text-xl font-bold mb-4">
                                    Similar logo copyright Information</h2>
                                {similarLogoResult && similarLogoCopyright ? (
                                    <>
                                        <div className="mb-2"><strong>Name Brand:</strong> {similarLogoCopyright.metaData.name}</div>
                                        <div className="mb-2">
                                            <strong>Score:</strong> {typeof similarLogoResult.rate === 'number' ? (similarLogoResult.rate * 100).toFixed(2) + "%" : "N/A"}
                                        </div>


                                        <div className="mb-2"><strong>Owner address:</strong> {similarLogoCopyright.user.address}</div>
                                        <div className="mb-2"><strong>Sample:</strong><div className="block w-40 aspect-w-10 aspect-h-7 rounded-lg overflow-hidden">
                                            <img src={similarLogoCopyright.metaData.samples} alt="" className="object-cover" />
                                        </div> </div>
                                        <div className="mb-2"><strong>Application form:</strong><Link href={similarLogoCopyright.metaData.applicationForm} legacyBehavior>
                                            <a className="underline text-indigo-600" target="_blank" rel="noopener noreferrer">
                                                {similarLogoCopyright.metaData.applicationForm}
                                            </a>
                                        </Link> </div>
                                        <div className="mb-2"><strong>Status:</strong> {similarLogoCopyright.status}</div>
                                    </>
                                ) : (
                                    <p className="text-gray-500 italic">Not similar copyright.</p>
                                )}
                            </div>
                        </div>
                    )}



                    {copyrights ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <p><strong>Address:</strong> {copyrights.user.address}</p>
                            <p><strong>Username:</strong> {copyrights.user.username}</p>
                            <p><strong>Email:</strong> {copyrights.user.email}</p>
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <p><strong>Title:</strong> {copyrights.metaData.name}</p>
                                    <button
                                        onClick={() => setShowCheckCopyright(true)}
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        Check name copyright
                                    </button>
                                </div>
                            </div>
                            
                            <p>
                                <strong>Form: </strong>
                                <Link href={copyrights.metaData.applicationForm} legacyBehavior>
                                    <a className="underline text-indigo-600" target="_blank" rel="noopener noreferrer">
                                        {copyrights.metaData.applicationForm}
                                    </a>
                                </Link>
                            </p>
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <p>
                                        <strong>Samples:</strong>
                                        <div className="block w-40 aspect-w-10 aspect-h-7 rounded-lg overflow-hidden">
                                            <img src={copyrights.metaData.samples} alt="" className="object-cover" />
                                        </div>
                                    </p>
                                    <button
                                        onClick={() => setShowCheckLogoCopyright(true)}
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        Check logo copyright
                                    </button>

                                </div>
                            </div>

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

                            {/* Conditionally render the dropdown and update button based on status */}
                            {copyrights.status !== "PUBLISHED" && copyrights.status !== "REJECTED" && (
                                <>
                                    {/* Dropdown to select status */}
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
                                    {/* Nếu trạng thái là "INCOMPLETE", hiển thị nút "Update Metadata" */}
                                    {copyrights.status === "INCOMPLETE" && (
                                        <button
                                            style={{
                                                marginTop: "10px",
                                                padding: "10px 16px",
                                                background: "#ffc107", // Màu vàng
                                                color: "#000",
                                                border: "none",
                                                borderRadius: "5px",
                                                cursor: "pointer",
                                                fontWeight: "bold",
                                                textTransform: "uppercase",
                                            }}
                                            onClick={handleUpdateMetadata} // Hàm xử lý cập nhật metadata
                                        >
                                            Update Metadata
                                        </button>
                                    )}

                                    {/* If "Rejected" or "Incomplete" is selected, show form for email */}
                                    <>
                                        {(newStatus === "REJECTED" || newStatus === "INCOMPLETE") && (
                                            <div>
                                                <p><strong>Email to send:</strong> {copyrights.user.email}</p>
                                                <p><strong>Subject:</strong> {newStatus === "REJECTED" ? "Rejection Notice" : "Information Missing"}</p>



                                                {/* Textarea nhập nội dung */}
                                                <textarea
                                                    id="reasonTextarea"
                                                    placeholder={newStatus === "REJECTED" ? "Enter reason for rejection..." : "Enter details for missing information..."}
                                                    value={reason}
                                                    onChange={(e) => setReason(e.target.value)}
                                                    style={{ padding: "10px", fontSize: "16px", width: "100%", height: "100px", marginTop: "10px" }}
                                                />

                                                {/* Nút gửi email */}
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
                                                    onClick={() => handleSendEmail()}
                                                >
                                                    Send Email
                                                </button>
                                            </div>
                                        )}
                                    </>

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
                            )}

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
