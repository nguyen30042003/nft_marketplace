import apiClient from "components/service/apiClient";
import useSWR from "swr";

// Định nghĩa interface User dựa trên dữ liệu từ API
export interface User {
  id: number;
  username: string;
  address: string;
  email: string;
  role: string;
  isApprove: boolean;
  createAt: string;
  orders: any[];
  active: boolean;
  enabled: boolean;
  password: string;
  authorities: {
    authority: string;
  }[];
  accountNonLocked: boolean;
  accountNonExpired: boolean;
  credentialsNonExpired: boolean;
}

// Hàm fetch danh sách user đã được duyệt
const fetch_user_registed = async (): Promise<User[]> => {
  const apiUrl = `http://localhost:8081/api/v1/users/approvals`;

  try {
    const response = await apiClient(apiUrl, { method: "GET" });
    console.log(response)
    return response;
  } catch (error) {
    console.error("Error in fetch_user_registed:", error);
    throw error;
  }
};
// Hook sử dụng SWR để lấy danh sách user đã được duyệt
export const useRegisteredUsers = () => {
  const { data, error, isLoading } = useSWR<User[]>("registered_users", fetch_user_registed);

  return {
    users: data,
    isLoading,
    isError: !!error,
  };
};

// Hàm fetch danh sách user chưa được duyệt
const fetch_user_notApprove = async (): Promise<User[]> => {
  const apiUrl = `http://localhost:8081/api/v1/users/pending-approvals`;

  try {
    const response = await apiClient(apiUrl, { method: "GET" });
    console.log(response)
    return response;
  } catch (error) {
    console.error("Error in fetch_user_notApprove:", error);
    throw error;
  }
};

// Hook sử dụng SWR để lấy danh sách user chưa được duyệt
export const useNotApprovedUsers = () => {
  const { data, error, isLoading } = useSWR<User[]>("not_approved_users", fetch_user_notApprove);

  return {
    users: data,
    isLoading,
    isError: !!error,
  };
};


// Hàm fetch để phê duyệt user theo address
const approveUserFetch = async (address: string): Promise<void> => {
  const apiUrl = `http://localhost:8081/api/v1/users/${address}/approved`;

  try {
    await apiClient(apiUrl, { method: "POST" });
    console.log(`User with address ${address} approved successfully.`);
  } catch (error) {
    console.error(`Error approving user with address ${address}:`, error);
    throw error;
  }
};
// Hook sử dụng SWR để phê duyệt user
export const useApproveUser = (address: string) => {
  const { data, error, isLoading } = useSWR(
    address ? `approve_user_${address}` : null, // Chỉ fetch nếu có address
    () => approveUserFetch(address)
  );

  return {
    isApproved: !!data, // Trạng thái đã phê duyệt
    isLoading,
    isError: !!error,
  };
};

// Hàm fetch danh sách user đã được duyệt
const fetch_user_by_role = async (role: string): Promise<User[]> => {
  const apiUrl = `http://localhost:8081/api/v1/users/by-role?role=${role}`;

  try {
    const response = await apiClient(apiUrl, { method: "GET" });
    console.log(response)
    return response;
  } catch (error) {
    console.error("Error in fetch_user_registed:", error);
    throw error;
  }
};
export const useFetchUserByRole = (role: string) => {
  const { data, error, isLoading } = useSWR<User[]>(
    role ? `fetch_user_by_role_${role}` : null, // Chỉ fetch nếu có role
    () => fetch_user_by_role(role) // Truyền callback thay vì gọi trực tiếp
  );

  return {
    data: data ?? [], // Đảm bảo luôn là một mảng
    isLoading,
    isError: !!error,
  };
};


// Hàm fetch danh sách user đã được duyệt
const fetch_user_by_address = async (address: string): Promise<User> => {
  const apiUrl = `http://localhost:8081/api/v1/users?address=${address}`;

  try {
    const response = await apiClient(apiUrl, { method: "GET" });
    console.log(response)
    return response;
  } catch (error) {
    console.error("Error in fetch_user_registed:", error);
    throw error;
  }
};
export const useFetchUserByAddress = (address: string) => {
  const { data, error, isLoading } = useSWR<User>(
    address ? `fetch_user_by_address_${address}` : null, 
    () => fetch_user_by_address(address) // Truyền callback thay vì gọi trực tiếp
  );

  return {
    data: data ?? null,
    isLoading,
    isError: !!error,
  };
};


// Hàm fetch để phê duyệt user theo address
const get_user_by_address = async (address: string): Promise<void> => {
  const apiUrl = `http://localhost:8081/api/v1/users/${address}`;

  try {
    await apiClient(apiUrl, { method: "GET" });
    console.log(`User with address ${address} approved successfully.`);
  } catch (error) {
    console.error(`Error approving user with address ${address}:`, error);
    throw error;
  }
};





