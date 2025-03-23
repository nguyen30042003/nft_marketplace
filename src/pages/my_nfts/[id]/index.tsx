/* eslint-disable @next/next/no-img-element */
import { emailRequest } from "@_types/emailRequest";
import { NftMeta, PinataRes, Status } from "@_types/nft";
import { useWeb3 } from "@providers/web3";
import { BaseLayout } from "@ui";
import axios from "axios";
import { fetch_copyright_by_id, send_email_api, update_copyright_by_id, update_status_copyright_by_id } from "components/fectData/fetch_copyright";
import { useTransaction } from "components/service/transaction";
import { data } from "framer-motion/client";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import useSWR, { mutate } from "swr";

export default function MyNftPage() {
    const router = useRouter();
    const { id } = router.query;
    const idString = Array.isArray(id) ? id[0] : id ?? "";


    const { data: copyright, error, isLoading } = useSWR(
        idString ? ["fetch_copyright_by_id", idString] : null,
        () => fetch_copyright_by_id(idString as string)
    );


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

    const cancleTransfer = async () => {
        const messageToSign = await axios.get("/api/verify");
        const accounts = await ethereum?.request({ method: "eth_requestAccounts" }) as string[];
        const account = accounts[0];

        const signedData = await ethereum?.request({
            method: "personal_sign",
            params: [JSON.stringify(messageToSign.data), account, messageToSign.data.id]
        })

        return { signedData, account };
    }

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

        if (!copyright) {
            console.error("Copyright data is not available yet!");
            return;
        }

        try {
            sendTransaction(copyright.verifierAddress, 0.000005, idString, true);
        } catch (e: any) {
            console.error(e.message);
        }
    };


    const [showDialogTrue, setShowDialogTrue] = useState(false);



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
                    <h1 style={{ textAlign: "center", marginBottom: "20px", fontSize: "24px", fontWeight: "bold" }}>My Nft Details</h1>

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

                            <p><strong>Transfer:</strong> {copyright.isTransfer ? "✔️" : "❌"}</p>

                            {copyright?.status === Status.APPROVED && (
                                <>
                                    <div className="mt-5 flex justify-center">
                                        <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setShowDialog(true)} >Payment</button>
                                    </div>
                                </>
                            )}
                            {showDialog && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                                    <div className="bg-white p-6 rounded-lg shadow-lg">
                                        <h2 className="text-lg font-semibold">Xác nhận thanh toán</h2>
                                        <p>Bạn có chắc chắn muốn thanh toán không?</p>
                                        <div className="mt-4 flex justify-end space-x-3">
                                            <button
                                                className="px-4 py-2 bg-gray-300 rounded"
                                                onClick={() => setShowDialog(false)}
                                            >
                                                Hủy
                                            </button>
                                            <button
                                                className="px-4 py-2 bg-green-500 text-white rounded"
                                                onClick={handleConfirmPayment}
                                            >
                                                Xác nhận
                                            </button>
                                        </div>
                                    </div>
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
                                        <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setShowDialog(true)} >Cancel transfer</button>
                                    </div>
                                </>
                            )}

                        </div>


                    ) : (
                        <p style={{ textAlign: "center", fontWeight: "bold", color: "red" }}>Nft not found</p>
                    )}
                </div>
            </div>
        </BaseLayout>
    );
}