import React, { useEffect, useState } from "react";
import BaseLayout from "@ui/layout/BaseLayout";
import Table from "@ui/table";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { create_member_by_verifier, deleteUser, useApproveUser, useMemberByVerifer } from "components/fectData/fetch_user";
import { useWeb3 } from "@providers/web3";
import { Member } from "@_types/nft";

const ListUser: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [approvedAddress, setApprovedAddress] = useState<string | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  const { isLoading: approving, isError: approveError } = useApproveUser(approvedAddress || "");
  const { ethereum, copyrightContract } = useWeb3();

  useEffect(() => {
    const connectWallet = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          }) as string[];

          if (accounts.length > 0) {
            setUserAddress(accounts[0]);
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

  const { users, isLoading, isError } = useMemberByVerifer(userAddress ?? "");

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
      isApprove: user.isApprove,
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
    setSelectedUser(user);
  };

  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [newMember, setNewMember] = useState({
    address: "",
    name: "",
    email: "",
  });


  const handleDelete = async (id: string) => {
    await deleteUser(id);
  };
  const [showDialog, setShowDialog] = useState(false);


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
        <h1 className="text-lg font-bold mb-4">Members List</h1>
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
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex justify-center py-2 px-4 mb-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Add new member
        </button>
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
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 relative w-full max-w-xl mx-4">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl font-bold"
                onClick={() => setShowCreateForm(false)}
              >
                ×
              </button>
              <h2 className="text-xl font-bold mb-4">Add New Member</h2>

              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-1">Address</label>
                  <input
                    type="text"
                    value={newMember.address}
                    onChange={(e) => setNewMember({ ...newMember, address: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>

              <button
                onClick={async () => {
                  try {
                    if (!newMember.address || !newMember.name || !newMember.email) {
                      alert("Please fill in all fields.");
                      return;
                    }

                    // await copyrightContract?.addUser(
                    //   newMember.address,
                    //   newMember.name,
                    //   newMember.email,
                    //   "", // Giả định chưa cần description
                    //   "user" // hoặc bạn có thể cho chọn role
                    // );

                    const member: Member = {
                      username: newMember.name,
                      address: newMember.address,
                      email: newMember.email,
                      role: "MEMBER",
                      isApprove: false,
                      isStaff: false,
                      idVerifier: 3,
                    };

                    await create_member_by_verifier(member);

                    alert("Member created successfully!");
                    setShowCreateForm(false);
                    window.location.reload();
                  } catch (err) {
                    console.error("Create error:", err);
                    alert("Failed to create member.");
                  }
                }}
                className="mt-6 w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Create
              </button>
            </div>
          </div>
        )}
        {selectedUser && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 relative w-full max-w-xl mx-4">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl font-bold"
        onClick={() => setSelectedUser(null)}
      >
        ×
      </button>
      <h2 className="text-xl font-bold mb-4">User Details</h2>
      <p><strong>Username:</strong> {selectedUser.username}</p>
      <p><strong>Email:</strong> {selectedUser.email}</p>
      <p><strong>Address:</strong> {selectedUser.address}</p>
      <p><strong>Role:</strong> {selectedUser.role}</p>
      <p>
        <strong>Approve:</strong>{" "}
        {selectedUser?.isApprove ? "Approved" : "Not Approved"}
      </p>
      <p><strong>Created At:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
      <div className="mt-4">
        <button
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          onClick={() => setShowDialog(true)}
        >
          Delete
        </button>
      </div>
    </div>

    {/* Dialog should be inside the same wrapper to appear above */}
    {showDialog && (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full text-center transform scale-105 transition-all">
          <h2 className="text-2xl font-bold text-gray-800">Delete Account Member</h2>
          <p className="mt-2 text-gray-600">Are you sure you want to delete this account?</p>
          <div className="mt-6 flex justify-center space-x-5">
            <button
              className="px-6 py-3 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
              onClick={() => setShowDialog(false)}
            >
              Cancel
            </button>
            <button
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              onClick={async () => {
                await handleDelete(selectedUser.id);
                setShowDialog(false);
                setSelectedUser(null); // optionally close details after delete
                window.location.reload();
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
)}


      </div>
    </BaseLayout>
  );
};

export default ListUser;
