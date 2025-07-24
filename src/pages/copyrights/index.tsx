/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
'use client'
/* eslint-disable react/jsx-no-undef */
/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import BaseLayout from "@ui/layout/BaseLayout";
import { NextPage } from "next";
import { Calendar } from "@/components/ui/calendar";

import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarIcon, ChevronDown, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { get_copyrights, get_number_copyright } from "components/fectData/fetch_copyright";
import useSWR from "swr";
import { Nft, Status } from "@_types/nft";
import { useWeb3 } from "@providers/web3";
import { useListedNfts } from "@hooks/web3";
import { BigNumber } from "ethers";
import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CopyrightItem {
    id: number;
    title: string;
    image: string;
    createdAt: Date;
}

interface MetaData {
    name: string;
    samples: string;
    createAt: string;
}

interface CopyrightPagination {
    content: CopyrightItem[];
    totalPages: number;
    totalElements: number;
    currentPage: number;
    pageSize: number;
}


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
type StatusHistory = {
    status: number;
    timestamp: number;
};
type TransferHistory = {
    fromAddress: string;
    toAddress: string;
    timestamp: number;
};

const statusLabels: Record<number, string> = {
    1: "Uploaded",
    2: "Pending",
    3: "Incomplete",
    4: "Publish",
    5: "Approved",
    6: "Rejected",
};

const Create: NextPage = () => {
    const { ethereum, copyrightContract } = useWeb3();
    const { nfts, getNftDetail, getStatusHistory } = useListedNfts();
    const [startDate, setStartDate] = useState<Date | undefined>(new Date("2025-04-01T00:00:00"));
    const [endDate, setEndDate] = useState<Date | undefined>(new Date());
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
    const [searchText, setSearchText] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(0); // Khởi tạo currentPage là 0
    const itemsPerPage = 20; // bạn có thể thay đổi số item mỗi trang
    const start = startDate?.toDateString();
    const end = endDate?.toDateString();

    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const [filter, setFilter] = useState({
        startDate: startDate,
        endDate: endDate,
        searchText: "",
    });


    useEffect(() => {
        if (shouldFetch()) {
            setIsInitialLoad(true);  // Lần đầu tiên sau khi thay đổi filter
            setCurrentPage(0);       // Reset về page 0
        }
    }, [startDate, endDate]);
    const { data: copyrightPagination, error, isLoading } = useSWR(
        filter.startDate && filter.endDate
            ? [filter.startDate, filter.endDate, currentPage, filter.searchText]
            : null,
        () => {
            return get_copyrights(
                new Date(filter.startDate!),
                new Date(filter.endDate!),
                currentPage,
                itemsPerPage,
                filter.searchText
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
        });
        setCurrentPage(1);
        setIsInitialLoad(true);
    };



    const { data: copyightLength } = useSWR(
        shouldFetch() ? [filter.startDate, filter.endDate, filter.searchText] : null,
        () => get_number_copyright(
            Status.PUBLISHED,
            new Date(filter.startDate!),
            new Date(filter.endDate!),
            filter.searchText,
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


    const [copytightDetail, setCopytightDetail] = useState<Nft | null>(null);
    const [timelineSteps, setTimelineSteps] = useState<{ date: string; label: string }[]>([]);
    const [transferHistorry, setTransferHistorry] = useState<{ time: string; fromAddress: string; toAddress: string }[]>([]);
    const preview = async (tokenId: string) => {
        const data = await getNftDetail(parseInt(tokenId));
        setCopytightDetail(data?.Nft || null);

        if (!copyrightContract) return;
        try {
            const history: any = await copyrightContract.getStatusHistory(parseInt(tokenId) || 0);
            console.log("Raw history data:", history);
            const historyTransfer: any = await copyrightContract.getStatusHistoryTransfer(parseInt(tokenId) || 0);
            console.log("Raw history transfer data:", historyTransfer);

            if (!history || typeof history !== "object") {
                throw new Error("Invalid data structure returned from getStatusHistory");
            }

            let processedData: StatusHistory[] = [];

            if ("status" in history && "timestamp" in history) {
                processedData = [{
                    status: BigNumber.from(history.status).toNumber(),
                    timestamp: BigNumber.from(history.timestamp).toNumber(),
                }];
            } else if (Array.isArray(history)) {
                processedData = history.map(entry => ({
                    status: BigNumber.from(entry[0]).toNumber(),
                    timestamp: BigNumber.from(entry[1]).toNumber(),
                }));
            } else {
                throw new Error("Unexpected data format in getStatusHistory response");
            }

            // Chuyển đổi thành format timelineSteps
            const formattedTimeline = processedData.map(entry => ({
                date: new Date(entry.timestamp * 1000).toLocaleDateString("en-GB"), // Định dạng ngày
                label: statusLabels[entry.status] || "Unknown",
            }));

            setTimelineSteps(formattedTimeline);


            if (!historyTransfer || typeof historyTransfer !== "object") {
                throw new Error("Invalid data structure returned from getStatusHistory");
            }

            let processedTransferData: TransferHistory[] = [];

            if ("from" in historyTransfer && "to" in historyTransfer && "timestamp" in historyTransfer) {
                processedTransferData = [{
                    fromAddress: historyTransfer.from,
                    toAddress: historyTransfer.to,
                    timestamp: BigNumber.from(historyTransfer.timestamp).toNumber(),
                }];
            } else if (Array.isArray(historyTransfer)) {
                processedTransferData = historyTransfer.map(entry => ({
                    fromAddress: entry[0],
                    toAddress: entry[1],
                    timestamp: BigNumber.from(entry[2]).toNumber(),
                }));
            } else {
                throw new Error("Unexpected data format in getStatusHistory response");
            }

            // Chuyển đổi thành format timelineSteps
            const formattedTransferTimeline = processedTransferData.map(entry => ({
                time: new Date(entry.timestamp * 1000).toLocaleDateString("en-GB"),
                fromAddress: entry.fromAddress,
                toAddress: entry.toAddress,
            }));

            setTransferHistorry(formattedTransferTimeline);
        } catch (error) {
            console.error("Error fetching status history:", error);
        }
    };


    // Lắng nghe thay đổi copytightDetail
    useEffect(() => {
        console.log("Copytight detail:", copytightDetail);
    }, [copytightDetail]);



    return (
        <BaseLayout>
            <div className="px-1">
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
                                    {selectedCategoryIds.length > 0
                                        ? categoryList
                                            .filter((c) => selectedCategoryIds.includes(c.id))
                                            .map((c) => c.name)
                                            .join(", ")
                                        : "Select categories"}
                                </span>
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[250px] p-2">
                            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                                {categoryList.map((category) => (
                                    <label
                                        key={category.id}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <Checkbox
                                            checked={selectedCategoryIds.includes(category.id)}
                                            onCheckedChange={() =>
                                                setSelectedCategoryIds((prev) =>
                                                    prev.includes(category.id)
                                                        ? prev.filter((id) => id !== category.id)
                                                        : [...prev, category.id]
                                                )
                                            }
                                        />
                                        <span>{category.name}</span>
                                    </label>
                                ))}
                            </div>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {isLoading && !copyrightPagination?.content ? (
                        <p>Loading initial copyrights...</p>
                    ) : error ? (
                        <p>Error loading copyrights.</p>
                    ) : (
                        (copyrightPagination?.content || []).map((item) => (
                            <div
                                key={item.id}
                                className="border rounded-xl overflow-hidden shadow hover:shadow-lg transition"
                                onClick={() => preview(item.tokenId || "")}
                            >
                                <img
                                    src={item.metaData.samples}
                                    alt={item.metaData.name}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold">{item.metaData.name}</h3>
                                    <p className="text-sm text-gray-500">
                                        Created:{" "}
                                        {new Intl.DateTimeFormat("vi-VN", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric", // đổi từ "2-digit" sang "numeric"
                                        }).format(new Date(item.metaData.createAt))}
                                    </p>

                                </div>
                            </div>
                        ))
                    )}

                </div>


                {copytightDetail && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">

                            {/* Nút X Close góc trên bên phải */}
                            <button
                                onClick={() => setCopytightDetail(null)}
                                className="absolute top-4 right-4 text-gray-600 hover:text-red-600 transition-colors"
                                aria-label="Close"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>

                            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 text-center">
                                Preview Copyright
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
                                <div className="space-y-3">
                                    <p><strong>Name:</strong> {copytightDetail.meta.name}</p>
                                    <p><strong>Description:</strong> {copytightDetail.meta.description}</p>
                                    <p><strong>Form URL:</strong> <a href={copytightDetail.meta.applicationForm} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">Link</a></p>
                                    
                                    <p><strong>Created At:</strong> {new Date(copytightDetail.activeAt * 1000).toLocaleDateString()}</p>
                                    <p><strong>Expired At:</strong> {new Date(copytightDetail.expiredAt * 1000).toLocaleDateString()}</p>
                                    <p><strong>Original Create Address:</strong> {copytightDetail.creator}</p>
                                    {transferHistorry.length > 0 && (
                                        <p><strong>Current Owner:</strong> {transferHistorry[transferHistorry.length - 1].toAddress}</p>
                                    )}

                                </div>

                                <div className="flex justify-center items-center">
                                    <img
                                        src={copytightDetail.meta.samples}
                                        alt={copytightDetail.meta.name}
                                        className="rounded-lg w-full h-60 object-cover shadow-md"
                                    />
                                </div>
                            </div>

                            <h3 className="text-xl font-semibold mt-10 text-center text-gray-800">
                                History of Copyright Registration Process
                            </h3>

                            <div className="w-full flex justify-center mt-8">
                                <div className="flex items-start gap-16 relative">
                                    {timelineSteps.map((step, index) => (
                                        <div key={index} className="flex flex-col items-center text-center relative">
                                            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold z-10">
                                                {index + 1}
                                            </div>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500">{step.date}</p>
                                                <p className="text-sm font-medium">{step.label}</p>
                                            </div>
                                            {index < timelineSteps.length - 1 && (
                                                <div className="absolute top-5 left-[calc(100%+0.5rem)] w-12 h-1 bg-red-400 z-0"></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="w-full flex flex-col items-center pt-10">
                                <h4 className="text-lg font-semibold text-gray-800 mb-4">Transfer History</h4>
                                <div className="w-full max-w-4xl">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>From</TableHead>
                                                <TableHead>To</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transferHistorry.map((entry, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{entry.time}</TableCell>
                                                    <TableCell>{entry.fromAddress}</TableCell>
                                                    <TableCell>{entry.toAddress}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                        </div>
                    </div>
                )}



                {shouldFetch() && (
                    <div className="flex justify-center mt-28">
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

export default Create;