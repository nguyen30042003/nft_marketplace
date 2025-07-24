/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useState } from "react";
import BaseLayout from "@ui/layout/BaseLayout";
import Table from "@ui/table";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import useSWR, { mutate } from "swr";
import { fetch_all_copyright, fetch_all_copyright_by_verifier, get_copyrights_by_member, get_number_copyright_transfer_by_verifier, get_number_copyright_verifier, get_transactions_by_verifier, update_status_copyright_by_id, update_token_copyright } from "components/fectData/fetch_copyright";
import router from "next/router";
import { useWeb3 } from "@providers/web3";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import Long from "long";
import { fetch_all_transfer_copyright_by_verifier } from "components/fectData/transfer_copyright";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, ChevronDown, Search } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { DataTable } from "@ui/table/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { DataTransactionTable } from "@ui/table/TransactionTable";



enum TransactionStatus {
  ALL = "ALL",
  REQUESTED = "REQUESTED",
  PENDING = "PENDING",
  PAYMENT_REQUIRED = "PAYMENT_REQUIRED",
  PAYMENT_COMPLETED = "PAYMENT_COMPLETED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  CANCELLED_REQUIRED = "CANCELLED_REQUIRED",
}

const ListCopyright: React.FC = () => {

  const { ethereum, copyrightContract } = useWeb3();

  const [verifierAddress, setVerifierAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // trạng thái loading
  useEffect(() => {
      const connectWallet = async () => {
          if (window.ethereum) {
              try {
                  // TypeScript expects an array of strings (string[])
                  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) as string[];
                  if (accounts && accounts.length > 0) {
                    setVerifierAddress(accounts[0]);
                  }
              } catch (error) {
                  console.error("Error connecting to MetaMask:", error);
              }
          } else {
              console.error("MetaMask is not installed.");
          }
      };

      connectWallet();
  }, []);

  // const { data: transfers, error, isLoading } = useSWR(
  //     userAddress ? ["get_copyright_by_verifier", userAddress] : null, 
  //     () => fetch_all_transfer_copyright_by_verifier(userAddress!)
  // );

  const [startDate, setStartDate] = useState<Date | undefined>(new Date("2025-04-01T00:00:00"));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(0); // Khởi tạo currentPage là 0
  const itemsPerPage = 10; // bạn có thể thay đổi số item mỗi trang

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [selectedStatus, setSelectedStatus] = React.useState<TransactionStatus>(TransactionStatus.ALL);
  const [filter, setFilter] = useState({
    startDate: startDate,
    endDate: endDate,
    searchText: "",
    selectedStatus: TransactionStatus.PENDING
  });


  useEffect(() => {
    if (shouldFetch()) {
      setIsInitialLoad(true);  // Lần đầu tiên sau khi thay đổi filter
      setCurrentPage(0);       // Reset về page 0
    }
  }, [startDate, endDate]);
  const { data: copyrightPagination, error, isLoading } = useSWR(
    startDate && endDate && verifierAddress && selectedStatus
      ? [filter.startDate, filter.endDate, currentPage, filter.searchText, filter.selectedStatus, verifierAddress]
      : null,
    () => {
      return get_transactions_by_verifier(
        new Date(filter.startDate!),
        new Date(filter.endDate!),
        currentPage,
        itemsPerPage,
        filter.searchText,
        selectedStatus,
        verifierAddress!
      );
    },
    {
      onSuccess: () => setIsInitialLoad(false),
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );




  const handleSearch = () => {
    setFilter({
      startDate,
      endDate,
      searchText,
      selectedStatus
    });
    setCurrentPage(1);
    setIsInitialLoad(true);
  };



  const { data: copyightLength } = useSWR(
    startDate && endDate && verifierAddress
      ? [filter.startDate, filter.endDate, filter.searchText, filter.selectedStatus, verifierAddress]
      : null,
    () => get_number_copyright_transfer_by_verifier(
      selectedStatus,
      new Date(filter.startDate!),
      new Date(filter.endDate!),
      filter.searchText,
      verifierAddress!
    ),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );


  const totalPages = copyightLength ? Math.ceil(copyightLength / itemsPerPage) : 1;

  // Hàm kiểm tra xem có nên fetch data hay không
  function shouldFetch(): boolean {
    return startDate !== undefined && endDate !== undefined;
  }

  // Reset currentPage về 1 khi thay đổi filter (startDate, endDate)
  useEffect(() => {
    if (shouldFetch()) {
      setCurrentPage(1);
    } else {
      setCurrentPage(0); // Reset về 0 khi không có filter
    }
  }, [startDate, endDate]);




  const handlePreview = (transferCopyright: any) => {
    
    router.push(`/verifier/Transfer/${transferCopyright}`);
  };

  const handleAccept = async (id: number, status: string) => {
    try {
        var price = 5;
        console.log(id)
        const response = await update_status_copyright_by_id(id, "PENDING");
        // const tx = await copyrightContract?.mintToken(
        //   nftURI,
        //   ethers.utils.parseEther(price.toString()), {
        //   value: ethers.utils.parseEther(0.025.toString())
        // }
        // );

        // copyrightContract?.on(
        //   "NftItemCreated",
        //   (tokenId: ethers.BigNumber, price: ethers.BigNumber, creator: string, isListed: boolean, event: any) => {
        //     console.log(`📢 NFT Created!`);
        //     console.log(`Token ID: ${tokenId.toString()}`);
        //     console.log(`Price: ${ethers.utils.formatEther(price)} ETH`);
        //     console.log(`Creator: ${creator}`);
        //     console.log(`Listed: ${isListed}`);
        //     console.log(`Transaction Hash: ${event.transactionHash}`);
        //   }
        // );
        

        // await toast.promise(
        //   tx!.wait(), {
        //   pending: "Uploading metadata",
        //   success: "Metadata uploaded",
        //   error: "Metadata upload error"
        //   }
        // );
        
        // const newTokenId = await copyrightContract?.getTokenIdByURI(nftURI);
        // if (!newTokenId) {
        //   console.error("Error: newTokenId is undefined");
        //   return;
        // }
        // console.log(newTokenId)
        // const tokenIdLong = Long.fromString(newTokenId.toString()); // Chuyển đổi BigNumber -> Long
        // const temp = await update_token_copyright(id, tokenIdLong);
      
        // await toast.promise(
        //   tx!.wait(), {
        //   pending: "Uploading blockchain",
        //   success: "Uploaded success",
        //   error: "Upload error"
        // }
      //);
        
    } catch (error) {
      console.error("Error accepting copyright:", error);
      alert("Failed to accept copyright.");
    }
  };


  if (isLoading) {
    return (
      <BaseLayout>
        <p>Loading...</p>
      </BaseLayout>
    );
  }

  if (error) {
    return (
      <BaseLayout>
        <p>Error loading data...</p>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <div className="p-4">
        <h1 className="text-lg font-bold mb-4">Transfer Copyright Request</h1>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start">
          {/* Start Date */}
          <div className="w-full sm:w-auto flex items-center gap-2">
            <span className="text-sm font-medium whitespace-nowrap">Start Date</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[200px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date */}
          <div className="w-full sm:w-auto flex items-center gap-2">
            <span className="text-sm font-medium whitespace-nowrap">End Date</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[200px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[250px] justify-between">
          <span className="truncate">
            {selectedStatus || "Select status"}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[250px] p-2">
        <RadioGroup
          value={selectedStatus}
          onValueChange={(value) => setSelectedStatus(value as TransactionStatus)}
          className="flex flex-col gap-2 max-h-60 overflow-y-auto"
        >
          {Object.values(TransactionStatus).map((status) => (
            <label key={status} className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value={status} id={status} />
              <span>{status}</span>
            </label>
          ))}
        </RadioGroup>
      </PopoverContent>
    </Popover>

          <div className="relative w-full flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-8" />
              <Input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 w-full"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-black text-white px-5 py-2 rounded-md hover:bg-gray-900 focus:outline-none focus:ring focus:border-gray-300"
            >
              Search
            </button>
          </div>
        </div>


        <div className="px-5 py-2 bg-white rounded-lg shadow-md overflow-hidden">
          {isLoading && !copyrightPagination?.content ? (
            <p>Loading initial copyrights...</p>
          ) : error ? (
            <p>Error loading copyrights.</p>
          ) : (
            <DataTransactionTable
              data={copyrightPagination?.content || []}
              onAccept={handleAccept}
              onPreview={handlePreview}
            />

          )}

        </div>

        {shouldFetch() && (
          <div className="flex justify-center mt-4">
            <Pagination>
              <PaginationContent>
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious onClick={() => setCurrentPage((prev) => prev - 1)} />
                  </PaginationItem>
                )}
                {Array.from({ length: totalPages }, (_, i) => (
                  <PaginationItem key={i + 1}>
                    <PaginationLink
                      isActive={i + 1 === currentPage}
                      onClick={() => setCurrentPage(i + 1)}
                      href="#"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                {currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationNext onClick={() => setCurrentPage((prev) => prev + 1)} />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </BaseLayout>
  );
};

export default ListCopyright;
