// components/LoadingDialog.tsx
import React from 'react';

export const LoadingDialog = ({ isOpen }: { isOpen: boolean }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
        <div className="loader mb-4 animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <p className="text-gray-700">Waiting for transaction confirmation...</p>
      </div>
    </div>
  );
};
