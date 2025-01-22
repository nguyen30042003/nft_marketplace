import React, { useState } from "react";
import BaseLayout from "@ui/layout/BaseLayout";
import Table from "@ui/table";
import DatePicker from "react-datepicker"; // Đừng quên cài `react-datepicker` nếu chưa có
import "react-datepicker/dist/react-datepicker.css";

interface User {
  id: number;
  username: string;
  email: string;
  address: string;
  role: "User" | "Verifier";
  createdAt: Date;
}

const ListUser: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const columns = [
    { header: "Username", accessor: "username", className: "text-left" },
    { header: "Email", accessor: "email", className: "text-left" },
    { header: "Address", accessor: "address", className: "text-left" },
    { header: "Role", accessor: "role", className: "text-left" },
    { header: "Created At", accessor: "createdAt", className: "text-left" },
    { header: "Actions", accessor: "actions", className: "text-center" },
  ];

  const data: User[] = [
    {
      id: 1,
      username: "johndoe",
      email: "john@example.com",
      address: "123 Main St",
      role: "User",
      createdAt: new Date("2023-12-01"),
    },
    {
      id: 2,
      username: "janedoe",
      email: "jane@example.com",
      address: "456 Oak St",
      role: "Verifier",
      createdAt: new Date("2023-11-15"),
    },
    {
      id: 3,
      username: "alicew",
      email: "alice@example.com",
      address: "789 Pine St",
      role: "User",
      createdAt: new Date("2023-12-10"),
    },
    {
      id: 4,
      username: "bobbys",
      email: "bobby@example.com",
      address: "101 Maple Ave",
      role: "Verifier",
      createdAt: new Date("2023-12-05"),
    },
    {
      id: 5,
      username: "charlesk",
      email: "charles@example.com",
      address: "202 Elm St",
      role: "User",
      createdAt: new Date("2023-11-20"),
    },
  ];

  const handlePreview = (user: User) => {
    setSelectedUser(user);
  };

  const handleDelete = (id: number) => {
    console.log(`Delete user with ID: ${id}`);
  };

  const handleApprove = (id: number) => {
    console.log(`Approve user with ID: ${id}`);
  };

  const filteredData = data.filter((item) => {
    const matchesSearchTerm =
      item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      selectedRole === "all" || item.role === selectedRole;

    const matchesDateRange =
      (!startDate || item.createdAt >= startDate) &&
      (!endDate || item.createdAt <= endDate);

    return matchesSearchTerm && matchesRole && matchesDateRange;
  });

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
            <div className="bg-white p-6 rounded shadow-lg w-96 relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedUser(null)}
              >
                &times;
              </button>
              <h2 className="text-lg font-bold mb-4">User Details</h2>
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
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  onClick={() => handleDelete(selectedUser.id)}
                >
                  Delete
                </button>
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  onClick={() => handleApprove(selectedUser.id)}
                >
                  Approve
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
