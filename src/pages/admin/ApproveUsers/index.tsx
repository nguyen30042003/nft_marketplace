/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import BaseLayout from "@ui/layout/BaseLayout";
import Table from "@ui/table";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fetch_user_notApprove, get_users_by_member, useApproveUser, useFetchUserById, User } from "components/fectData/fetch_user";
import { create_copyright } from 'components/fectData/fetch_copyright';
import { useWeb3 } from "@providers/web3";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "react-toastify";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { DataTable } from "@ui/table/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarIcon, ChevronDown, Search } from "lucide-react";
import { DataTableUser } from "@ui/table/table_user";
import useSWR from "swr";



type Role = "USER" | "VERIFIER" | "ADMIN" | "MEMBER" | "ALL";
enum Roles {
  USER = "USER",
  VERIFIER = "VERIFIER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
  ALL = "ALL",
}
const ListUser: React.FC = () => {


   const [searchText, setSearchText] = useState<string>("");
  const [selectedRole, setSelectedRole] = React.useState<Roles>(Roles.ALL);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date("2025-04-01T00:00:00"));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [approvedAddress, setApprovedAddress] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [filter, setFilter] = useState({
    startDate: startDate,
    endDate: endDate,
    searchText: "",
    selectedRole: Roles.ALL
  });
    const [currentPage, setCurrentPage] = useState(0); // Khởi tạo currentPage là 0
    const itemsPerPage = 10;


  const { isLoading: approving, isError: approveError } = useApproveUser(approvedAddress || "");

  const { ethereum, copyrightContract } = useWeb3();


  const handlePreview = (user: User) => {
    setSelectedUser(user); // Lưu user được chọn để hiển thị form preview
  };

  const handleApprove = async (user: User, verifierAddress: string) => {
    try {
      console.log(user.address, user.username, user.email, user.role);
      
      // Nếu role là MEMBER thì thêm vào staff
      if (user.role === "MEMBER") {
        console.log(user.role);
        const txx = await copyrightContract?.addMember(user.address, verifierAddress,  user.username, user.email, "");
        console.log(txx);
      }
      else {
        // Thêm user vào hệ thống
        const tx = await copyrightContract?.addUser(user.address, user.username, user.email, "", user.role);
        console.log(tx);
      }
      setApprovedAddress(user.address);
      await window.location.reload();
    } catch (error) {
      console.error(`Error approving user with address: `, error);
    }
  };


  const handleClosePreview = () => {
    setSelectedUser(null); // Đóng form preview
  };

  const handleSearch = () => {
    setFilter({
      startDate,
      endDate,
      searchText,
      selectedRole
    });
    setCurrentPage(1);
  };


    useEffect(() => {
    if (shouldFetch()) {
      setIsInitialLoad(true);  // Lần đầu tiên sau khi thay đổi filter
      setCurrentPage(0);       // Reset về page 0
    }
  }, [startDate, endDate]);
  const { data: userPagination, error, isLoading } = useSWR(
    startDate && endDate && selectedRole
      ? [filter.startDate, filter.endDate, currentPage, filter.searchText, filter.selectedRole]
      : null,
    () => {
      return fetch_user_notApprove(
        filter.searchText,
        filter.selectedRole,
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




    const { data: userLength } = useSWR(
    startDate && endDate 
      ? [filter.startDate, filter.endDate, filter.searchText, filter.selectedRole]
      : null,
    () => get_users_by_member(
      filter.searchText,
      selectedRole,
      new Date(filter.startDate!),
      new Date(filter.endDate!)
    ),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );


  const totalPages = userLength ? Math.ceil(userLength / itemsPerPage) : 1;

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





  const verifierId = selectedUser?.verifierId?.toString();
  const { data: verifierData, isLoading: loadingVerifier } = useFetchUserById(verifierId || "");

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
        <h1 className="text-lg font-bold mb-4">Users Request</h1>
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
                  {selectedRole || "Select role"}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[250px] p-2">
              <RadioGroup
                value={selectedRole}
                onValueChange={(value) => setSelectedRole(value as Roles)}
                className="flex flex-col gap-2 max-h-60 overflow-y-auto"
              >
                {Object.values(Roles).map((role) => (
                  <label key={role} className="flex items-center gap-2 cursor-pointer">
                    <RadioGroupItem value={role} id={role} />
                    <span>{role}</span>
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
          {isLoading && !userPagination?.content ? (
            <p>Loading initial copyrights...</p>
          ) : error ? (
            <p>Error loading copyrights.</p>
          ) : (
            <DataTableUser
              data={userPagination?.content || []}
              onPreview={handlePreview}
            />

          )}

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
            <p><strong>Verifier address:</strong> {verifierData?.address || "N/A"}</p>
            <p><strong>Verifier name:</strong> {verifierData?.username || "N/A"}</p>
          </>
        )}

      </div>
      <div className="flex justify-end mt-8 space-x-3">
        <Button variant="outline" onClick={handleClosePreview} className="px-6 py-2 text-base">Close</Button>
        <Button
          color="blue"
          onClick={() => handleApprove(selectedUser, verifierData?.address || "")}
          className="px-6 py-2 text-base"
        >
          Approve
        </Button>
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

export default ListUser;



