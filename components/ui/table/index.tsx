import React from "react";

const Table = ({
  columns,
  renderRow,
  data,
}: {
  columns: { header: string; accessor: string; className?: string }[];
  renderRow: (item: any) => React.ReactNode;
  data: any[];
}) => {
  return (
    <table className="w-full mt-4 border-collapse border border-gray-300">
      <thead>
        <tr className="text-left text-gray-500 text-sm bg-gray-100">
          {columns.map((col) => (
            <th
              key={col.accessor}
              className={`px-4 py-2 border-b border-gray-300 ${col.className || ""}`}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index} className="border-b border-gray-300 hover:bg-gray-50">
            {renderRow(item)}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
