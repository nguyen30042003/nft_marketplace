import React, { useState } from "react";
import BaseLayout from "@ui/layout/BaseLayout";
import Table from "@ui/table";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import useSWR from "swr";
import { fetch_all_copyright } from "components/fectData/fetch_copyright";
import { it } from "node:test";

const ListCopyright: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCopyright, setSelectedCopyright] = useState<any | null>(null);

  // Lấy dữ liệu bản quyền từ API
  const { data: copyrights, error, isLoading } = useSWR("fetch_all_copyright", fetch_all_copyright);

  const columns = [
    { header: "ID", accessor: "id", className: "text-left" },
    { header: "Title", accessor: "title", className: "text-left" },
    { header: "Owner", accessor: "owner", className: "text-left" },
    { header: "Status", accessor: "status", className: "text-left" },
    { header: "Created At", accessor: "createdAt", className: "text-left" },
    { header: "Actions", accessor: "actions", className: "text-center" },
  ];

  // Chuyển đổi dữ liệu API thành dữ liệu phù hợp với UI
  const transformedData =
    copyrights?.map((item) => ({
      id: item.id,
      title: item.metaData.name,
      owner: item.user.address,
      status: item.status,
      createdAt: new Date(item.metaData.createAt),
      samples: item.metaData.samples,
      application_form: item.metaData.applicationForm
    })) || [];

  const filteredData = transformedData.filter((item) => {
    const matchesSearchTerm =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.owner.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || item.status.toLowerCase() === selectedStatus;

    const matchesDateRange =
      (!startDate || item.createdAt >= startDate) &&
      (!endDate || item.createdAt <= endDate);

    return matchesSearchTerm && matchesStatus && matchesDateRange;
  });

  const handlePreview = (copyright: any) => {
    setSelectedCopyright(copyright);
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
        <h1 className="text-lg font-bold mb-4">Copyright Table</h1>
        <div className="mb-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search copyright..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          />

          {/* Filter by Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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
              <td className="px-4 py-2">{item.id}</td>
              <td className="px-4 py-2">{item.title}</td>
              <td className="px-4 py-2">{item.owner}</td>
              <td className="px-4 py-2">{item.status}</td>
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

{selectedCopyright && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full relative">
      {/* Close button */}
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        onClick={() => setSelectedCopyright(null)}
      >
        &times;
      </button>

      <h2 className="text-lg font-bold mb-4">Copyright Details</h2>

      <div className="grid grid-cols-1 gap-2 text-sm">
        <div>
          <strong>ID:</strong> {selectedCopyright.id}
        </div>
        <div>
          <strong>Title:</strong> {selectedCopyright.title}
        </div>
        <div>
          <strong>Owner:</strong> {selectedCopyright.owner}
        </div>
        <div>
          <strong>Status:</strong> {selectedCopyright.status}
        </div>
        <div>
          <strong>Created At:</strong> {selectedCopyright.createdAt.toLocaleDateString()}
        </div>
        <div>
          <strong>Samples:</strong>{" "}
          <a
            href={selectedCopyright.samples}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Link
          </a>
        </div>
        <div>
          <strong>Application Form:</strong>{" "}
          <a
            href={selectedCopyright.application_form}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Link
          </a>
        </div>
      </div>
    </div>
  </div>
)}


      </div>
    </BaseLayout>
  );
};

export default ListCopyright;
