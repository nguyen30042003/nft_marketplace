/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @next/next/no-img-element */

import type { NextPage } from 'next'
import { ChangeEvent, useEffect, useState } from 'react';
import { BaseLayout } from '../../../components/ui'
import { Switch } from '@headlessui/react'
import Link from 'next/link'
import axios from 'axios';
import { useWeb3 } from '@providers/web3';
import { CopyRightRequest, NftMeta, PinataRes, Status } from '@_types/nft';
import { ethers } from 'ethers';
import { toast } from "react-toastify";
import { create_copyright } from 'components/fectData/fetch_copyright';
import { useTransaction } from 'components/service/transaction';
import { useFetchUserByRole } from 'components/fectData/fetch_user';
import Table from '@ui/table';
import useSWR from 'swr';

const ALLOWED_FIELDS = ["name", "description", "samples", "application_form"];

const NftCreate: NextPage = () => {
  const { ethereum, copyrightContract } = useWeb3();
  const [nftURI, setNftURI] = useState("");
  const [price, setPrice] = useState("");
  const [hasURI, setHasURI] = useState(false);
  const [nftMeta, setNftMeta] = useState<NftMeta>({
    name: "",
    description: "",
    samples: "",
    applicationForm: "",
  });

  const [fileName, setFileName] = useState<string | null>(null);
  const { sendTransaction, transactionSuccess, setTransactionSuccess } = useTransaction();
  const { data, isLoading, isError } = useFetchUserByRole("VERIFIER");

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



  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNftMeta({ ...nftMeta, [name]: value });
  }

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

  const uploadMetadata = async () => {
    try {
      const { signedData, account } = await getSignedData();

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
    } catch (e: any) {
      console.error(e.message);
    }
  }





  const createNft = async () => {
    try {
      setShowDialog(false); // Ẩn dialog khi xác nhận
      const nftRes = await axios.get(nftURI);
      const content = nftRes.data;

      const accounts = await ethereum?.request({ method: "eth_requestAccounts" }) as string[];
      const userAddress = accounts[0];

      const copyrightData: CopyRightRequest = {
        status: Status.UPLOADED, // Or any other appropriate status based on your flow
        userAddress: userAddress,
        metaData: {
          uri: nftURI,
          name: nftMeta.name,
          description: nftMeta.description,
          samples: nftMeta.samples,
          applicationForm: nftMeta.applicationForm,
          createAt: '',
          updateAt: ''
        },
        tokenId: "",
        verifierAddress: selectedVerifier || ""
      };

      console.log(copyrightData)
      await sendTransaction(selectedVerifier || "", 0.000005, "0", false)
      const response = await create_copyright(copyrightData);

    } catch (e: any) {
      console.error(e.message);
    }
  }

  const [showDialogTrue, setShowDialogTrue] = useState(false);

  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (transactionSuccess) {
      setShowDialogTrue(true);
    }
  }, [transactionSuccess]);


  const columns = [
    { header: "Address", accessor: "address", className: "text-left" },
    { header: "Name", accessor: "username", className: "text-left" },
    { header: "Email", accessor: "email", className: "text-left" },
    { header: "Actions", accessor: "actions", className: "text-center" },
  ];

  const [selectedVerifier, setSelectedVerifier] = useState<string | null>(null);

  // Hàm xử lý chọn checkbox
  const handleCheckboxChange = (address: string) => {
    setSelectedVerifier((prev) => (prev === address ? null : address));
  };

  return (
    <BaseLayout>
      <div>
        {(nftURI || hasURI) ?
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <div className="px-4 sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-gray-900">List NFT</h3>
                <p className="mt-1 text-sm text-gray-600">
                  This information will be displayed publicly so be careful what you share.
                </p>
              </div>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <form>
                <div className="shadow sm:rounded-md sm:overflow-hidden">
                  {hasURI && (
                    <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                      <div>
                        <label htmlFor="uri" className="block text-sm font-medium text-gray-700">
                          URI Link
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                          <input
                            onChange={(e) => setNftURI(e.target.value)}
                            type="text"
                            name="uri"
                            id="uri"
                            className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                            placeholder="http://link.com/data.json"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {nftURI && (
                    <div className='mb-4 p-4'>
                      <div className="font-bold">Your metadata: </div>
                      <div>
                        <Link href={nftURI} legacyBehavior>
                          <a className="underline text-indigo-600">{nftURI}</a>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Table hiển thị danh sách Verifier */}
                  <div className="mb-4 p-4">
                    <div className="font-bold text-lg">Verifier List</div>
                    {isLoading ? (
                      <p>Loading verifiers...</p>
                    ) : (
                      <Table
                        columns={columns}
                        data={data ?? []} // Đảm bảo luôn truyền một mảng
                        renderRow={(verifier) => (
                          <>
                            <td className="px-4 py-2 ">{verifier.address}</td>
                            <td className="px-4 py-2 ">{verifier.username}</td>
                            <td className="px-4 py-2  ">{verifier.email}</td>
                            <td className="px-4 py-2 text-center">
                              <input
                                type="checkbox"
                                className="w-5 h-5 cursor-pointer"
                                onChange={() => handleCheckboxChange(verifier.address)}

                              />
                            </td>
                          </>
                        )}
                      />
                    )}
                  </div>
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
                            onClick={createNft}
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



                  <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                    <button
                      onClick={() => setShowDialog(true)}
                      type="button"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      List
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          :
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <div className="px-4 sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Create NFT Metadata</h3>
                <p className="mt-1 text-sm text-gray-600">
                  This information will be displayed publicly so be careful what you share.
                </p>
              </div>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="py-4 text-right">
                <a
                  href="https://apricot-additional-sheep-711.mypinata.cloud/ipfs/bafkreicuhsm2u43nj7m4cbwc7g7qzvblhdl6vr4mxeysls7yy5gkro3xru"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Download PDF
                </a>
              </div>
              <form>
                <div className="shadow sm:rounded-md sm:overflow-hidden">
                  <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Name copyright
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <input
                          value={nftMeta.name}
                          onChange={handleChange}
                          type="text"
                          name="name"
                          id="name"
                          className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                          placeholder="Name of copyright"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <div className="mt-1">
                        <textarea
                          value={nftMeta.description}
                          onChange={handleChange}
                          id="description"
                          name="description"
                          rows={3}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                          placeholder="Some copyright description..."
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Brief description of copyright
                      </p>
                    </div>
                    {/* Has Image? */}
                    {nftMeta.samples ?
                      <img src={nftMeta.samples} alt="" className="h-40" /> :
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Samples</label>
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
                                strokeLinejoin="round"
                              />
                            </svg>
                            <div className="flex text-sm text-gray-600">
                              <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                              >
                                <span>Upload a file</span>
                                <input
                                  onChange={handleImage}
                                  id="file-upload"
                                  name="file-upload"
                                  type="file"
                                  className="sr-only"
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>

                          </div>
                        </div>
                      </div>
                    }
                    {
                      nftMeta.applicationForm ? (
                        <div className="mt-2 text-sm text-gray-500">
                          <span>Register application form: </span>
                          <span className="font-medium">{fileName}</span>
                        </div>
                      ) : <div>
                        <label className="block text-sm font-medium text-gray-700">Register application form</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                          <div className="space-y-1 text-center">
                            <div className="flex text-sm text-gray-600">
                              <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                              >
                                <span>Upload a file</span>
                                <input
                                  onChange={handleFile}
                                  id="file-upload"
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

                    }


                  </div>
                  <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                    <button
                      onClick={uploadMetadata}
                      type="button"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Upload
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        }
      </div>
    </BaseLayout>
  )
}

export default NftCreate; 