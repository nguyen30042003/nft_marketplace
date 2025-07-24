/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import BaseLayout from "@ui/layout/BaseLayout";
import Table from "@ui/table";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { create_member_by_verifier, deleteUser, get_user_by_verifer_address, get_user_member_by_verifer_address, useApproveUser, useFetchUserByAddress, User } from "components/fectData/fetch_user";
import { useWeb3 } from "@providers/web3";
import { Member, Status } from "@_types/nft";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronDown, Search } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { DataTransactionTable } from "@ui/table/TransactionTable";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import useSWR from "swr";
import { DataTableMember } from "@ui/table/table_member";
import { tr, u } from "framer-motion/client";
import { useTransaction } from "components/service/transaction";


enum Statuses {
  NOT_APPROVED = "NOT APPROVED",
  APPROVED = "APPROVED",
}

const ListUser: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date("2025-04-01T00:00:00"));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [searchText, setSearchText] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const { ethereum, copyrightContract } = useWeb3();
  const [selectedStatus, setSelectedStatus] = useState<Statuses>(Statuses.APPROVED);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>("");

  const [newMember, setNewMember] = useState({
    address: "",
    name: "",
    email: "",
  });

  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showDialogTrue, setShowDialogTrue] = useState(false);

  const { sendTransaction, transactionSuccess, setTransactionSuccess } = useTransaction();

  useEffect(() => {
    if (transactionSuccess) {
      setShowDialogTrue(true);
    }
  }, [transactionSuccess]);
  // Kết nối ví MetaMask
  useEffect(() => {
    const connectWallet = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) as string[];
          if (accounts.length > 0) {
            setUserAddress(accounts[0]);
            console.log("Connected to MetaMask:", accounts[0]);
          }
        } catch (error) {
          console.error("Error connecting to MetaMask:", error);
        }
      } else {
        alert("Please install MetaMask.");
      }
    };

    connectWallet();
  }, []);

  // Lấy thông tin user từ địa chỉ ví
  const { data: userData, isError: isUserError } = useFetchUserByAddress(userAddress || "");
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    if (userData) {
      setId(userData.id.toString());
    }
  }, [userData]);

  // Filter
  const [filter, setFilter] = useState({
    startDate: startDate,
    endDate: endDate,
    searchText: "",
    selectedStatus: Statuses.APPROVED
  });

  useEffect(() => {
    if (shouldFetch()) {
      setIsInitialLoad(true);
      setCurrentPage(0);
    }
  }, [startDate, endDate]);

  // Lấy tổng số bản ghi
  const { data: copyightLength } = useSWR(
    startDate && endDate && selectedStatus && userAddress
      ? [filter.startDate, filter.endDate, filter.searchText, filter.selectedStatus]
      : null,
    () => get_user_member_by_verifer_address(
      userAddress || "",
      filter.searchText,
      filter.selectedStatus,
      new Date(filter.startDate!),
      new Date(filter.endDate!)
    ),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // Lấy danh sách phân trang
  const { data: userPagination, error, isLoading } = useSWR(
    startDate && endDate && selectedStatus && userAddress
      ? [filter.startDate, filter.endDate, currentPage, filter.searchText, filter.selectedStatus, userAddress]
      : null,
    () => {
      return get_user_by_verifer_address(
        userAddress || "",
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

  const totalPages = copyightLength ? Math.ceil(copyightLength / itemsPerPage) : 1;

  function shouldFetch(): boolean {
    return startDate !== undefined && endDate !== undefined;
  }

  const handleSearch = () => {
    setFilter({
      startDate,
      endDate,
      searchText,
      selectedStatus
    });
    setCurrentPage(1);
  };

  const handlePreview = (user: User) => {
    setSelectedUser(user);
  };

  const handleCreateMember = async () => {
    if (newMember.address && newMember.name && newMember.email && userData) {
      const newMemberData: Member = {
        address: newMember.address,
        username: newMember.name,
        email: newMember.email,
        role: "MEMBER",
        isApprove: false,
        isStaff: true,
        idVerifier: userData.id,
      };
      console.log("Creating new member:", newMemberData);
      await sendTransaction("0x4b3B5a23Ed2F91F7d777237038Da7B8bE4eC9001", 0.000005, "0", false, Status.APPROVED);
      await create_member_by_verifier(newMemberData);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteUser(id);
  };
    if (isLoading) {
    return (
      <BaseLayout>
        <p>Loading...</p>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <div className="p-4">
        <h1 className="text-lg font-bold mb-4">Members</h1>

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
        <div className="mb-4 flex justify-between items-center">
          <Button
            className="bg-black text-white hover:bg-slate-700"
            variant="outline"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            Create Member
          </Button>
        </div>

        <div className="px-5 py-2 bg-white rounded-lg shadow-md overflow-hidden">
          {isLoading && !userPagination?.content ? (
            <p>Loading initial users...</p>
          ) : error ? (
            <p>Error loading users.</p>
          ) : (
            <DataTableMember
              data={userPagination?.content || []}
              onPreview={handlePreview}
            />

          )}

        </div>
        {showCreateForm && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">👤 Create Member</h2>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (newMember.address && newMember.name && newMember.email) {
                    try {
                      setNewMember({ address: newMember.address, name: newMember.name, email: newMember.email });
                      setShowCreateForm(false);
                    } catch (error) {
                      console.error("Create member failed", error);
                    }
                  }
                }}
                className="space-y-4 text-base text-gray-700"
              >
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <Input
                    type="text"
                    value={newMember.address}
                    onChange={(e) => setNewMember({ ...newMember, address: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    type="text"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    required
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    className="bg-slate-300 text-black hover:bg-slate-700"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-black text-white hover:bg-slate-700"
                    onClick={() => setShowDialog(true)}
                  >
                    Create Member
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
        {selectedUser && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">👤 Preview User</h2>
              <div className="space-y-4 text-base text-gray-700">
                <p><strong>Username:</strong> {selectedUser.username}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Address:</strong> {selectedUser.address}</p>
                <p><strong>Role:</strong> {selectedUser.role}</p>
                <p><strong>Active:</strong> {selectedUser.isApprove ? true : false}</p>
                <p><strong>Created At:</strong> {new Date(selectedUser.createAt).toLocaleDateString("vi-VN")}</p>
              </div>
              <div className="flex justify-end mt-8 space-x-3">
                <Button variant="outline" onClick={() => {
                  setSelectedUser(null);
                  setShowCreateForm(false);
                }} className="px-6 py-2 text-base">Close</Button>
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
                      onClick={handleCreateMember}
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

export default ListUser;


