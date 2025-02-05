import React, { useState } from "react";
import BaseLayout from "@ui/layout/BaseLayout";
import Table from "@ui/table";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNotApprovedUsers, useRegisteredUsers } from "components/fectData/fetch_user";
import { useWeb3 } from "@providers/web3";

const ListUser: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const { ethereum, copyrightContract } = useWeb3();
  const test = async () => {
    const txx = await copyrightContract?.isUser("0xB9E11a7bF9189205211b9D33A88C81192f76277C");
    console.log(txx)
  }
  test()
  // Lấy dữ liệu từ API
  const { users, isLoading, isError } = useRegisteredUsers();

  const columns = [
    { header: "Username", accessor: "username", className: "text-left" },
    { header: "Email", accessor: "email", className: "text-left" },
    { header: "Address", accessor: "address", className: "text-left" },
    { header: "Role", accessor: "role", className: "text-left" },
    { header: "Created At", accessor: "createdAt", className: "text-left" },
    { header: "Actions", accessor: "actions", className: "text-center" },
  ];

  // Chuyển đổi dữ liệu API thành dữ liệu phù hợp với UI
  const transformedData =
    users?.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      address: user.address,
      role: user.role, // Đảm bảo định dạng role
      createdAt: new Date(user.createAt), // Chuyển chuỗi ngày thành đối tượng Date
    })) || [];

  const filteredData = transformedData.filter((item) => {
    const matchesSearchTerm =
      item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      selectedRole === "all" || item.role.toLowerCase() === selectedRole.toLowerCase(); // Ensure case-insensitive match

    const matchesDateRange =
      (!startDate || item.createdAt >= startDate) &&
      (!endDate || item.createdAt <= endDate);

    return matchesSearchTerm && matchesRole && matchesDateRange;
  });

  const handlePreview = (user: any) => {
    setSelectedUser(user);
  };

  const handleDelete = (id: string) => {
    console.log(`Delete user with ID: ${id}`);
  };

  const handleApprove = (address: string) => {
    console.log("Approve user with address:", address);
    console.log("Selected user:", selectedUser);
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
          {/* Search */}
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          />

          {/* Filter by Role */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="verifier">Verifier</option>
            <option value="admin">Admin</option> {/* Updated to match case consistency */}
          </select>

          {/* Filter by Start Date */}
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            placeholderText="Start Date"
            className="p-2 border border-gray-300 rounded"
          />

          {/* Filter by End Date */}
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

        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedUser(null)}
              >
                &times;
              </button>
              <h2 className="text-lg font-bold mb-4">User Details</h2>
              <div className="space-y-4">
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
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseLayout>
  );
};

export default ListUser;
