/* eslint-disable react/jsx-key */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useState } from "react";
import BaseLayout from "@ui/layout/BaseLayout";
import Table from "@ui/table";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import useSWR, { mutate } from "swr";
import { fetch_all_copyright, fetch_all_copyright_by_member, fetch_all_copyright_by_verifier, get_copyrights, get_copyrights_by_member, get_number_copyright, get_number_copyright_verifier, update_gas_fee_order, update_status_copyright_by_id, update_token_copyright } from "components/fectData/fetch_copyright";
import router from "next/router";
import { CopyrightType, Status } from "@_types/nft";
import { useWeb3 } from "@providers/web3";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarIcon, ChevronDown, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { fetch_user_by_id, get_user_by_address } from "components/fectData/fetch_user";
import { DataTable } from "@ui/table/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";



const ListCopyright: React.FC = () => {
  const { ethereum, copyrightContract } = useWeb3();

  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [verifierAddress, setVerifierAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // trạng thái loading

  useEffect(() => {
    const connectWallet = async () => {
      if (!window.ethereum) {
        console.error("MetaMask is not installed.");
        setLoading(false);
        return;
      }

      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) as string[];
        if (!accounts || accounts.length === 0) {
          console.error("No accounts found.");
          setLoading(false);
          return;
        }

        const address = accounts[0];
        setUserAddress(address);

        try {
          const fetchedVerifier = await get_user_by_address(address);
          if (!fetchedVerifier) {
            console.error("No verifier found for address:", address);
            setLoading(false);
            return;
          }

          const fetchedVerifierAddress = await fetch_user_by_id(fetchedVerifier.verifierId);
          if (!fetchedVerifierAddress) {
            console.error("No verifier address found for verifierId:", fetchedVerifier.verifierId);
            setLoading(false);
            return;
          }

          setVerifierAddress(fetchedVerifierAddress.address);
          console.log("Verifier address:", fetchedVerifierAddress.address);
        } catch (innerError) {
          console.error("Error fetching verifier:", innerError);
        }

      } catch (err) {
        console.error("Error connecting to MetaMask:", err);
      } finally {
        setLoading(false); // Đảm bảo lúc nào cũng tắt loading
      }
    };

    connectWallet();
  }, []);




  const columns = [
    { header: "ID", accessor: "id", className: "text-left" },
    { header: "Title", accessor: "title", className: "text-left" },
    { header: "Owner", accessor: "owner", className: "text-left" },
    { header: "Status", accessor: "status", className: "text-left" },
    { header: "Update At", accessor: "updateAt", className: "text-left" },
    { header: "Created At", accessor: "createdAt", className: "text-left" },
    { header: "Actions", accessor: "actions", className: "text-center" },
  ];


  interface Category {
    id: number;
    name: string;
  }

  const categoryList: Category[] = [
    { id: 1, name: "Art" },
    { id: 2, name: "Music" },
    { id: 3, name: "Design" },
    { id: 4, name: "Literature" },
    { id: 5, name: "Software" },
  ];

  const [startDate, setStartDate] = useState<Date | undefined>(new Date("2025-04-01T00:00:00"));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(0); // Khởi tạo currentPage là 0
  const itemsPerPage = 10; // bạn có thể thay đổi số item mỗi trang

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [selectedStatus, setSelectedStatus] = React.useState<Status>(Status.PENDING);
  const [filter, setFilter] = useState({
    startDate: startDate,
    endDate: endDate,
    searchText: "",
    selectedStatus: Status.PENDING
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
      return get_copyrights_by_member(
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
    () => get_number_copyright_verifier(
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



  const handlePreview = (id: number) => {
    router.push(`/member/Copyrights/${id}`);
  };

  const { provider } = useWeb3();

  const handleAccept = async (tokenId: number, id: number) => {
    try {

    console.log(tokenId, id)
    const tx = await copyrightContract?.updateStatus(
        tokenId, 2
      );
      console.log(tx)
      const response = await update_status_copyright_by_id(id, "PENDING");
      

      const receipt = await tx!.wait();
      const gasUsed = receipt.gasUsed;

      // Handle event NftItemUpdated with explicit type
      const event = receipt.events?.find(
        (e): e is ethers.Event & { event: string, args: any } => e.event === "NftItemUpdated"
      );

      if (event) {
        console.log("🔥 Event NftItemUpdated emitted for token:", event.args?.tokenId.toString());
      }

      console.log("⛽ Gas used:", gasUsed.toString());

      // Calculate gas cost in ETH
      const gasPriceInWei = await provider!.getGasPrice(); // Gas price in wei
      const gasCostInWei = gasUsed.mul(gasPriceInWei); // Gas cost in wei
      const gasCostInETH = ethers.utils.formatEther(gasCostInWei); // Convert to ETH
      await update_gas_fee_order(id.toString(), parseFloat(gasCostInETH));
      console.log("Gas cost in ETH:", gasCostInETH);

      toast.success(`Updated status with gas used: ${gasUsed.toString()}`);
      window.location.reload();



      await toast.promise(
        tx!.wait(), {
        pending: "Uploading metadata",
        success: "Metadata uploaded",
        error: "Metadata upload error"
      }
      );

    } catch (error) {
      console.error("Error accepting copyright:", error);
      alert("Failed to accept copyright.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <BaseLayout>
      <div className="p-4">
        <h1 className="text-lg font-bold mb-4">Copyright Table</h1>
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
          onValueChange={(value) => setSelectedStatus(value as Status)}
          className="flex flex-col gap-2 max-h-60 overflow-y-auto"
        >
          {Object.values(Status).map((status) => (
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
            <DataTable
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
