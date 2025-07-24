/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @next/next/no-img-element */

import type { NextPage } from 'next'
import { ChangeEvent, useEffect, useState } from 'react';
import { BaseLayout } from '../../../components/ui'
import { Switch } from '@headlessui/react'
import Link from 'next/link'
import axios from 'axios';
import { useWeb3 } from '@providers/web3';
import { CopyRightRequest, CopyrightType, NftMeta, PinataRes, Status, UserPaginationResponse } from '@_types/nft';
import { ethers } from 'ethers';
import { toast } from "react-toastify";
import { create_copyright } from 'components/fectData/fetch_copyright';
import { useTransaction } from 'components/service/transaction';
import { fetchVerifierByType, fetchVerifierNumerByType, useFetchUserByRole, User } from 'components/fectData/fetch_user';
import Table from '@ui/table';
import useSWR from 'swr';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { DataTableVerifier } from '@ui/table/table_verifier';
import { set } from 'date-fns';
import { LoadingDialog } from '@/components/ui/LoadingDialog';


const ALLOWED_FIELDS = ["name", "description", "samples", "application_form"];

const NftCreate: NextPage = () => {
  const { ethereum, copyrightContract } = useWeb3();
  const [nftURI, setNftURI] = useState("");
  const [hasURI, setHasURI] = useState(false);
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


  const [searchText, setSearchText] = useState<string>("");
  const [fileName, setFileName] = useState<string | null>(null);
  const { sendTransaction, transactionSuccess, setTransactionSuccess, isWaiting } = useTransaction();
  const { data, isLoading, isError } = useFetchUserByRole("VERIFIER");
  const [step, setStep] = useState(1);
  const durations = [
    { years: 3, price: "$30", popular: false },
    { years: 5, price: "$45", popular: true },
    { years: 10, price: "$80", popular: false },
  ];

  const [selected, setSelected] = useState<number | null>(null);
  const [userLength, setUserLength] = useState<number>(0);
  const handleSelect = (years: number) => {
    setSelected(years);
    setTimeout(() => {
      setStep(3); // chuyển sang nội dung 3
    }, 300); // thêm delay nhẹ để cho UX mượt hơn
  };

  const [currentPage, setCurrentPage] = useState(1); // Khởi tạo currentPage là 0
  const itemsPerPage = 10;


  const handleSearch = () => {
    setCurrentPage(1); // reset về trang đầu
    console.log("Search text:", searchText);
    handleFetchUsers();
  };

  const [selectedType, setSelectedType] = useState<CopyrightType | ''>(CopyrightType.BUSINESS);
  const [selectedVerifier, setSelectedVerifier] = useState<string | null>(null);
  const [verifierPagination, setVerifierPagination] = useState<UserPaginationResponse | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleFetchUsers = async () => {
    if (!selectedType) return;

    try {
      const result = await fetchVerifierByType(selectedType, searchText, currentPage, itemsPerPage);
      const number = await fetchVerifierNumerByType(selectedType, searchText);
      setVerifierPagination(result);
      setUserLength(number);
      setFlag(true);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handlePreview = (user: User) => {
    setSelectedUser(user); // Lưu user được chọn để hiển thị form preview
  };
  const handleClosePreview = () => {
    setSelectedUser(null); // Đóng form preview
  };
  const handleApprove = async (address: string, name: string, email: string, role: string) => {
    setSelectedVerifier(address);
    setSelectedUser(null);
    setShowDialog(true); // Hiện dialog xác nhận
  };

  const [flag, setFlag] = useState<boolean>(false);

  const totalPages = userLength ? Math.ceil(userLength / itemsPerPage) : 1;

  const handleImage = async (e: ChangeEvent<HTMLInputElement>) => {
    console.log("Select file");
    if (!e.target.files || e.target.files.length === 0) {
      console.error("Select a file");
      return;
    }

    const file = e.target.files[0];
    console.log(file);
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    try {
      const { signedData, account } = await getSignedData();
      console.log(signedData)
      const promise = axios.post("/api/verify-image", {
        address: account,
        signature: signedData,
        bytes,
        contentType: file.type,
        fileName: file.name.replace(/\.[^/.]+$/, "")
      });
      console.log(promise)
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
        pending: "Uploading File  ",
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
    console.log(messageToSign.data);
    const accounts = await ethereum?.request({ method: "eth_requestAccounts" }) as string[];
    const account = accounts[0];
    console.log(account);
    const signedData = await ethereum?.request({
      method: "personal_sign",
      params: [JSON.stringify(messageToSign.data), account, messageToSign.data.id]
    })
    console.log(signedData)

    return { signedData, account };
  }

  const uploadMetadata = async () => {
    try {
      if (!nftMeta.name || !nftMeta.description || !nftMeta.samples || !nftMeta.applicationForm) {
        toast.error("Please fill in all required fields and upload files.");
        return;
      }
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
      setStep(2);
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

      // Lấy ngày hiện tại
      const now = new Date();
      const activeAt = now.toISOString().slice(0, 10); // format yyyy-MM-dd

      // Tính ngày hết hạn bằng cách cộng thêm số năm
      const expiredDate = new Date(now);
      if (selected !== null) {
        expiredDate.setFullYear(expiredDate.getFullYear() + selected);
      }
      const expiredAt = expiredDate.toISOString().slice(0, 10);
      console.log("Active at:", activeAt);
      console.log("Expired at:", expiredAt);
      const copyrightData: CopyRightRequest = {
        status: Status.UPLOADED,
        userAddress: userAddress,
        metaData: {
          uri: nftURI,
          name: nftMeta.name,
          description: nftMeta.description,
          samples: nftMeta.samples,
          applicationForm: nftMeta.applicationForm,
          createAt: '',
          updateAt: '',
          activeAt,
          expiredAt
        },
        tokenId: "",
        verifierAddress: selectedVerifier || "",
        copyrightType: selectedType || CopyrightType.BUSINESS,
      };

      console.log(copyrightData);

      try {
        const txResult = await sendTransaction(
          selectedVerifier || "",
          0.000005,
          "0",
          false,
          Status.UPLOADED
        );


        if (txResult) {
          await handleAccept(
            selectedType || CopyrightType.BUSINESS,
            nftURI,
            Math.floor(new Date(activeAt).getTime() / 1000),
            Math.floor(new Date(expiredAt).getTime() / 1000)
          );


          const response = await create_copyright(copyrightData);


          window.location.reload();
        } else {
          toast.error("Transaction failed or was rejected");
        }
      } catch (error) {
        console.error("Error in creating copyright:", error);
        toast.error("An error occurred while processing your request.");
      }

    } catch (e: any) {
      console.error(e.message);
    }
  };

  const handleAccept = async (copyrightType: CopyrightType, nftURI: string, startDate: number, endDate: number) => {
    try {
      const typeMapping: Record<CopyrightType, number> = {
        [CopyrightType.BUSINESS]: 1,
        [CopyrightType.SOFTWARE]: 2,
        [CopyrightType.ART]: 3,
        [CopyrightType.MUSIC]: 4,
        [CopyrightType.VIDEO]: 5,
      };
      const numericType = typeMapping[copyrightType];

      const tx = await copyrightContract?.mintToken(
        nftURI,
        numericType,
        startDate,
        endDate
      );
      if(tx) {
        setShowDialogTrue(true);
      }

      await toast.promise(
        tx!.wait(), {
        pending: "Creating request to verify copyright...",
        success: "Request created successfully",
        error: "Failed to create request"
      }
      );

    } catch (error) {
      console.error("Error accepting copyright:", error);
      alert("Failed to accept copyright.");
    }
  };

  const [showDialogTrue, setShowDialogTrue] = useState(false);

  const [showDialog, setShowDialog] = useState(false);



  return (
    <BaseLayout>
      <div>


        {step === 1 && (
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <div className="px-4 sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Copyright Information</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Please enter the brand copyright metadata, including the name, description, and related files. This information helps identify and protect your intellectual property rights on the blockchain.
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
                          required
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
        )}

        {step === 2 && (
          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">
              Choose license expiration duration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {durations.map((option, index) => (
                <div
                  key={index}
                  onClick={() => handleSelect(option.years)}
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
          </div>

        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Cột bên trái - 1/4 */}
              <div className="md:basis-1/4">
                <div className="p-4 bg-white shadow rounded-lg">
                  {/* Copyright Type + Fetch Button */}
                  <div className="p-4 bg-white shadow rounded-lg">
                    <label htmlFor="copyrightType" className="block text-sm font-medium text-gray-700 mb-2">
                      Select Copyright Type
                    </label>
                    <select
                      id="copyrightType"
                      name="copyrightType"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value as CopyrightType)}
                    >
                      <option value="">-- Select a Type --</option>
                      <option value="BUSINESS">Business</option>
                      <option value="SOFTWARE">Software</option>
                      <option value="ART">Art</option>
                      <option value="MUSIC">Music</option>
                      <option value="VIDEO">Video</option>
                    </select>

                    <button
                      onClick={handleFetchUsers}
                      className="mt-4 w-full px-4 py-2 to-blue-600 text-white font-semibold rounded hover:bg-blue-700 bg-blue-500"
                    >
                      Load
                    </button>
                  </div>
                  <div>

                    <p className="text-sm text-gray-500 mb-4">
                      {selectedType && (
                        <div className="mt-4 text-sm text-gray-700 p-4 bg-gray-100 rounded-md">
                          {selectedType === "BUSINESS" && (
                            <p>
                              <strong>Business:</strong> Register trademarks, logos, brand names for commercial purposes.
                            </p>
                          )}
                          {selectedType === "SOFTWARE" && (
                            <p>
                              <strong>Software:</strong> Protect source code, algorithms, and software designs from unauthorized use.
                            </p>
                          )}
                          {selectedType === "ART" && (
                            <p>
                              <strong>Art:</strong> Protect paintings, illustrations, designs, and other creative artworks.
                            </p>
                          )}
                          {selectedType === "MUSIC" && (
                            <p>
                              <strong>Music:</strong> Copyright musical compositions, recordings, and lyrics.
                            </p>
                          )}
                          {selectedType === "VIDEO" && (
                            <p>
                              <strong>Video:</strong> Copyright video content, animations, or films you produce.
                            </p>
                          )}
                        </div>
                      )}

                    </p>
                  </div>
                </div>
              </div>

              {/* Cột bên phải - 3/4 */}
              <div className="md:basis-3/4">
                <div className="p-4 bg-white shadow rounded-lg">
                  {/* Filter & Search */}
                  {flag && (
                    <div className="p-4 bg-white shadow rounded-lg space-y-4">

                      <div className="flex flex-col md:flex-row items-start gap-4">


                        {/* Search Box */}
                        <div className="relative flex-grow">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                          <Input
                            type="text"
                            placeholder="Search verifier..."
                            className="pl-10 pr-4 py-2 w-full"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSearch();
                              }
                            }}
                          />

                        </div>

                        <button
                          onClick={handleSearch}
                          className="bg-black text-white font-semibold px-5 py-2 rounded hover:bg-gray-900"
                        >
                          Search
                        </button>

                      </div>
                    </div>
                  )}

                  {/* Verifier List */}
                  <div className="p-4 bg-white rounded-lg shadow space-y-2">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">Verifier List</h2>

                    {isLoading ? (
                      <p className="text-gray-500">Loading verifiers...</p>
                    ) : (
                      <DataTableVerifier
                        data={verifierPagination?.content || []}
                        onPreview={handlePreview}
                      />
                    )}
                  </div>
                  {/* Pagination */}
                  {totalPages > 0 && (
                    <div className="flex justify-center mt-4">
                      <Pagination>
                        <PaginationContent>
                          {currentPage > 1 && (
                            <PaginationItem>
                              <PaginationPrevious onClick={() => setCurrentPage(currentPage - 1)} />
                            </PaginationItem>
                          )}
                          {Array.from({ length: totalPages }, (_, i) => (
                            <PaginationItem key={i}>
                              <PaginationLink
                                href="#"
                                isActive={i + 1 === currentPage}
                                onClick={() => setCurrentPage(i + 1)}
                              >
                                {i + 1}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          {currentPage < totalPages && (
                            <PaginationItem>
                              <PaginationNext onClick={() => setCurrentPage(currentPage + 1)} />
                            </PaginationItem>
                          )}
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </div>
              </div>
            </div>




            {selectedUser && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
                <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">👤 Preview User</h2>
                  <div className="space-y-4 text-base text-gray-700">
                    <p><strong>Username:</strong> {selectedUser.username}</p>
                    <p><strong>Email:</strong> {selectedUser.email}</p>
                    <p><strong>Address:</strong> {selectedUser.address}</p>
                    <p><strong>Role:</strong> {selectedUser.role}</p>
                    {selectedUser.role == "MEMBER" && (
                      <>
                        <p><strong>Verifier address:</strong> {selectedUser?.address || "N/A"}</p>
                        <p><strong>Verifier name:</strong> {selectedUser?.username || "N/A"}</p>
                      </>
                    )}

                  </div>
                  <div className="flex justify-end mt-8 space-x-3">
                    <Button variant="outline" onClick={handleClosePreview} className="px-6 py-2 text-base">Close</Button>
                    <Button
                      color="blue"
                      onClick={() => handleApprove(selectedUser.address, selectedUser.username, selectedUser.email, selectedUser.role)}
                      className="px-6 py-2 text-base"
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            )}



            {showDialog && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
                <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg text-center">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">💳 Payment Confirmation</h2>
                  <p className="text-gray-700 text-base">
                    Are you sure you want to proceed with the payment?
                  </p>
                  <div className="mt-6 flex justify-end space-x-4">
                    <button
                      className="px-6 py-2 text-base bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                      onClick={() => setShowDialog(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-6 py-2 text-base bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                      onClick={createNft}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}

            

            {showDialogTrue && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
                <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg text-center">
                  <h2 className="text-2xl font-semibold text-green-600 mb-4 border-b pb-2">🎉 Payment Successful!</h2>
                  <p className="text-gray-700 text-base">
                    Thank you for your payment. Please wait for the verifier’s response.
                  </p>
                  <div className="mt-6 flex justify-center">
                    <button
                      className="bg-blue-500 text-white px-6 py-2 text-base rounded-lg hover:bg-blue-600 transition"
                      onClick={() => {
                        setTransactionSuccess(false);
                        window.location.reload();
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
            {
              isWaiting && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
                  <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg text-center">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">⏳ Processing Transaction...</h2>
                    <p className="text-gray-700 text-base">Please wait while we process your transaction.</p>
                    
                  </div>
                </div>
              )
            }


          </div>
        )}

      </div>
    </BaseLayout>
  )
}

export default NftCreate;

