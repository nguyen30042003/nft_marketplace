import React, { useState } from "react";
import BaseLayout from "@ui/layout/BaseLayout";
import Table from "@ui/table";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNotApprovedUsers, useApproveUser } from "components/fectData/fetch_user";
import { create_copyright } from 'components/fectData/fetch_copyright';
import { useWeb3 } from "@providers/web3";


const ListUser: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [approvedAddress, setApprovedAddress] = useState<string | null>(null);

  const { users, isLoading, isError } = useNotApprovedUsers();
  const { isLoading: approving, isError: approveError } = useApproveUser(approvedAddress || "");

  const { ethereum, copyrightContract } = useWeb3();
  const columns = [
    { header: "Username", accessor: "username", className: "text-left" },
    { header: "Email", accessor: "email", className: "text-left" },
    { header: "Address", accessor: "address", className: "text-left" },
    { header: "Role", accessor: "role", className: "text-left" },
    { header: "Created At", accessor: "createdAt", className: "text-left" },
    { header: "Actions", accessor: "actions", className: "text-center" },
  ];

  const transformedData =
    users?.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      address: user.address,
      role: user.role,
      createdAt: new Date(user.createAt),
    })) || [];

  const filteredData = transformedData.filter((item) => {
    const matchesSearchTerm =
      item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      selectedRole === "all" || item.role.toLowerCase() === selectedRole;

    const matchesDateRange =
      (!startDate || item.createdAt >= startDate) &&
      (!endDate || item.createdAt <= endDate);

    return matchesSearchTerm && matchesRole && matchesDateRange;
  });

  const handlePreview = (user: any) => {
    setSelectedUser(user); // Lưu user được chọn để hiển thị form preview
  };

  const handleApprove = async (address: string, name: string, email: string, role: string) => {
    try {

      console.log(address, name, email, role)
      const tx = await copyrightContract?.addUser(address, name, email, "", role);
      console.log(address, name, email, role)
      
      // const txx = await copyrightContract?.isUser(address);
      // console.log(txx)
      setApprovedAddress(address);
      await window.location.reload();
    } catch (error) {
      console.error(`Error approving user with address: ${address}`, error);
    }
  };

  const handleClosePreview = () => {
    setSelectedUser(null); // Đóng form preview
  };

  if (isLoading) {
    return (
      <BaseLayout>
        <p>Loading...</p>
      </BaseLayout>
    );
  }

  if (isError) {
    return (
      <BaseLayout>
        <p>Error loading data...</p>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <div className="p-4">
        <h1 className="text-lg font-bold mb-4">User Table</h1>
        <div className="mb-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="verifier">Verifier</option>
          </select>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            placeholderText="Start Date"
            className="p-2 border border-gray-300 rounded"
          />
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            placeholderText="End Date"
            className="p-2 border border-gray-300 rounded"
          />
        </div>

        <Table
          columns={columns}
          data={filteredData}
          renderRow={(item) => (
            <>
              <td className="px-4 py-2">{item.username}</td>
              <td className="px-4 py-2">{item.email}</td>
              <td className="px-4 py-2">{item.address}</td>
              <td className="px-4 py-2">{item.role}</td>
              <td className="px-4 py-2">{item.createdAt.toLocaleDateString()}</td>
              <td className="px-4 py-2 text-center">
                <button
                  className="text-blue-500 hover:underline"
                  onClick={() => handlePreview(item)}
                >
                  Preview
                </button>
              </td>
            </>
          )}
        />

        {/* Form hiển thị Preview */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="bg-white p-6 rounded shadow-lg">
              <h2 className="text-xl font-bold mb-4">User Details</h2>
              <p>
                <strong>Username:</strong> {selectedUser.username}
              </p>
              <p>
                <strong>Email:</strong> {selectedUser.email}
              </p>
              <p>
                <strong>Address:</strong> {selectedUser.address}
              </p>
              <p>
                <strong>Role:</strong> {selectedUser.role}
              </p>
              <p>
                <strong>Created At:</strong> {selectedUser.createdAt.toLocaleDateString()}
              </p>
              <div className="mt-4">
                <button
                  className={`${
                    approving && approvedAddress === selectedUser.address
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600"
                  } text-white px-4 py-2 rounded`}
                  disabled={approving && approvedAddress === selectedUser.address}
                  onClick={() => handleApprove(selectedUser.address, selectedUser.username, selectedUser.email, selectedUser.role)}
                >
                  {approving && approvedAddress === selectedUser.address
                    ? "Approving..."
                    : "Approve"}
                </button>
                <button
                  className="ml-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  onClick={handleClosePreview}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseLayout>
  );
};

export default ListUser;

