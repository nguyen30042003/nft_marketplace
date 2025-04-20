import React from 'react';
import { IconType } from 'react-icons';

type DashboardCardProps = {
  title: string;
  description?: string;
  value: number | string;
  icon: IconType;
};

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  value,
  icon: Icon,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md flex justify-between items-start w-full">
      {/* Left section: Icon and text */}
      <div className="flex space-x-4">
        <div className="text-3xl text-blue-500">
          <Icon />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{title}</p>
          {description && (
            <p className="text-xs font-light italic text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Right-aligned value */}
      <div className="text-right self-end">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
};

export default DashboardCard;
