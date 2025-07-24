/* eslint-disable react-hooks/exhaustive-deps */
import { BaseLayout } from "@ui";
import Table from "@ui/table";
import { get_copyright_by_address, get_copyright_number_by_address, get_number_copyright_verifier } from "components/fectData/fetch_copyright";
import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { ethers } from "ethers";
import router from "next/router";
import { CopyrightType } from "@_types/nft";
import { useWeb3 } from "@providers/web3";
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
import { u } from "framer-motion/client";
import { DataTableMyCopyright } from "@ui/table/table_my_copyright";



enum Statuses {
    ALL = "ALL",
    UPLOADED = "UPLOADED",
    PENDING = "PENDING",
    INCOMPLETE = "INCOMPLETE",
    REJECTED = "REJECTED",
    APPROVED = "APPROVED",
    PUBLISHED = "PUBLISHED",
    PAID = "PAID",
    EXPIRED = "EXPIRED",
    REQUEST_RENEW = "REQUEST_RENEW"
}


const MyNfts: NextPage = () => {
    const [userAddress, setUserAddress] = useState<string | null>(null);

    useEffect(() => {
        const connectWallet = async () => {
            if (window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) as string[];
                    if (accounts && accounts.length > 0) {
                        setUserAddress(accounts[0]);
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



    const [startDate, setStartDate] = useState<Date | undefined>(new Date("2025-04-01T00:00:00"));
    const [endDate, setEndDate] = useState<Date | undefined>(new Date());
    const [searchText, setSearchText] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(0); // Khởi tạo currentPage là 0
    const itemsPerPage = 10; // bạn có thể thay đổi số item mỗi trang

    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [selectedStatus, setSelectedStatus] = React.useState<Statuses>(Statuses.ALL);
    const [filter, setFilter] = useState({
        startDate: startDate,
        endDate: endDate,
        searchText: "",
        selectedStatus: Statuses.ALL
    });


    useEffect(() => {
        if (shouldFetch()) {
            setIsInitialLoad(true);  // Lần đầu tiên sau khi thay đổi filter
            setCurrentPage(0);       // Reset về page 0
        }
    }, [startDate, endDate]);
    const { data: copyrightPagination, error, isLoading } = useSWR(
        startDate && endDate && userAddress && selectedStatus
            ? [filter.startDate, filter.endDate, currentPage, filter.searchText, filter.selectedStatus, userAddress]
            : null,
        () => {
            return get_copyright_by_address(
                userAddress!,
                filter.searchText,
                selectedStatus,
                new Date(filter.startDate!),
                new Date(filter.endDate!),
                currentPage,
                itemsPerPage
            
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
        startDate && endDate && userAddress && selectedStatus
            ? [filter.startDate, filter.endDate, filter.searchText, filter.selectedStatus, userAddress]
            : null,
        () => get_copyright_number_by_address(
                userAddress!,
                filter.searchText,
                selectedStatus,
                new Date(filter.startDate!),
                new Date(filter.endDate!),
        ),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );


    const totalPages = copyightLength ? Math.ceil(copyightLength / itemsPerPage) : 1;


    function shouldFetch(): boolean {
        return startDate !== undefined && endDate !== undefined;
    }

    useEffect(() => {
        if (shouldFetch()) {
            setCurrentPage(1);
        } else {
            setCurrentPage(0);
        }
    }, [startDate, endDate]);




    const handlePreview = (copyright: any) => {
        router.push(`/my_nfts/${copyright.id}`);
    };


    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error loading data.</p>;

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
                                onValueChange={(value) => setSelectedStatus(value as Statuses)}
                                className="flex flex-col gap-2 max-h-60 overflow-y-auto"
                            >
                                {Object.values(Statuses).map((status) => (
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
                        <DataTableMyCopyright
                            data={copyrightPagination?.content || []}
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
                                {currentPage < totalPages - 1 && (
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

export default MyNfts;



