import React, { useState } from "react";
import BaseLayout from "@ui/layout/BaseLayout";
import Table from "@ui/table";

const ListUser = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const columns = [
    { header: "Product Name", accessor: "name", className: "text-left" },
    { header: "Category", accessor: "category", className: "text-left" },
    { header: "Price", accessor: "price", className: "text-right" },
    { header: "Actions", accessor: "actions", className: "text-center" },
  ];

  const data = [
    { id: 1, name: "Apple MacBook Pro 17", category: "Laptop", price: "$2999" },
    { id: 2, name: "Microsoft Surface Pro", category: "Laptop PC", price: "$1999" },
    { id: 3, name: "Magic Mouse 2", category: "Accessories", price: "$99" },
    { id: 4, name: "Dell XPS 13", category: "Laptop", price: "$1499" },
    { id: 5, name: "Logitech Keyboard", category: "Accessories", price: "$49" },
  ];

  const handleEdit = (id) => {
    console.log(`Edit item with ID: ${id}`);
  };

  const handleDelete = (id) => {
    console.log(`Delete item with ID: ${id}`);
  };

  // Lọc dữ liệu dựa trên searchTerm
  const filteredData = data.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <BaseLayout>
      <div className="p-4">
        <h1 className="text-lg font-bold mb-4">Product Table</h1>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <Table
          columns={columns}
          data={filteredData}
          renderRow={(item) => (
            <>
              <td className="px-4 py-2">{item.name}</td>
              <td className="px-4 py-2">{item.category}</td>
              <td className="px-4 py-2 text-right">{item.price}</td>
              <td className="px-4 py-2 text-center">
                <button
                  className="text-blue-500 hover:underline mr-2"
                  onClick={() => handleEdit(item.id)}
                >
                  Edit
                </button>
                <button
                  className="text-red-500 hover:underline"
                  onClick={() => handleDelete(item.id)}
                >
                  Delete
                </button>
              </td>
            </>
          )}
        />
      </div>
    </BaseLayout>
  );
};

export default ListUser;
