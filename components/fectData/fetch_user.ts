import { CopyrightType, Member, UserPaginationResponse } from "@_types/nft";
import apiClient from "components/service/apiClient";
import { json } from "stream/consumers";
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
  verifierId: string;
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

const formatDateToString = (dateInput: string | Date): string => {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  const seconds = `${date.getSeconds()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

// Hàm fetch danh sách user chưa được duyệt
export const fetch_user_notApprove = async (
  search: string,
  role: string,
  startDate: Date,
  endDate: Date,
  page: number,
  size: number,
): Promise<UserPaginationResponse> => {
  const formattedEnd = formatDateToString(endDate);
  const formattedStart = formatDateToString(startDate);
 
  const roleParam = role === 'ALL' ? '' : role;
  const apiUrl = `http://localhost:8081/api/v1/users/pending-approvals?search=${search}&&role=${roleParam}&&startDate=${formattedStart}&&endDate=${formattedEnd}&&page=${page}&&size=${size}`;
  console.log("API URL:", apiUrl);
  try {
    const response = await apiClient(apiUrl, { method: "GET" });
    console.log(response)
    return response;
  } catch (error) {
    console.error("Error in fetch_user_notApprove:", error);
    throw error;
  }
};

export const get_users_by_member = async (
  search: string,
  role: string,
  startDate: Date,
  endDate: Date
): Promise<number> => {
  try {
    const formattedEnd = formatDateToString(endDate);
    const formattedStart = formatDateToString(startDate);
    console.log("formattedStart:", formattedStart);
    console.log("formattedEnd:", formattedEnd);
    const roleParam = role === 'ALL' ? '' : role;
    const apiUrl = `http://localhost:8081/api/v1/users/pending-approvals-number?search=${search}&role=${roleParam}&startDate=${formattedStart}&endDate=${formattedEnd}`;
    console.log("API URL:", apiUrl);
    const response = await apiClient(apiUrl, { method: "GET" });
    console.log("Response:", response);
    return response;
  } catch (error) {
    console.error("Error in get_copyrights:", error);
    throw error;
  }
};




// Hàm fetch danh sách user chưa được duyệt
export const fetch_user_Approve = async (
  search: string,
  role: string,
  startDate: Date,
  endDate: Date,
  page: number,
  size: number,
): Promise<UserPaginationResponse> => {
  const formattedStart = formatDateToString(startDate);
  const formattedEnd = formatDateToString(endDate);
  const roleParam = role === 'ALL' ? '' : role;
  const apiUrl = `http://localhost:8081/api/v1/users/approvals?search=${search}&role=${roleParam}&startDate=${formattedStart}&&endDate=${formattedEnd}&&page=${page}&&size=${size}`;
  console.log("API URL:", apiUrl);
  try {
    const response = await apiClient(apiUrl, { method: "GET" });
    console.log(response)
    return response;
  } catch (error) {
    console.error("Error in fetch_user_notApprove:", error);
    throw error;
  }
};

export const get_users_approved_by_member = async (
  search: string,
  role: string,
  startDate: Date,
  endDate: Date
): Promise<number> => {
  try {
    const formattedStart = formatDateToString(startDate);
    const formattedEnd = formatDateToString(endDate);
    console.log("formattedStart:", formattedStart);
    console.log("formattedEnd:", formattedEnd);
    const roleParam = role === 'ALL' ? '' : role;
    const apiUrl = `http://localhost:8081/api/v1/users/approvals-number?search=${search}&role=${roleParam}&startDate=${formattedStart}&endDate=${formattedEnd}`;
    console.log("API URL:", apiUrl);
    const response = await apiClient(apiUrl, { method: "GET" });
    console.log("Response:", response);
    return response;
  } catch (error) {
    console.error("Error in get_copyrights:", error);
    throw error;
  }
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
export const get_user_by_address = async (address: string) : Promise<User> => {
  const apiUrl = `http://localhost:8081/api/v1/users?address=${address}`;
  console.log(apiUrl)
  try {
    const response = await apiClient(apiUrl, { method: "GET" });
    console.log(response)
    return response;
  } catch (error) {
    console.error(`Error approving user with address ${address}:`, error);
    throw error;
  }
};


export const get_user_by_verifer_address = async (address: string, name: string, status: string,  startDate: Date, endDate: Date, page: number, size: number): Promise<UserPaginationResponse> => {
  const formattedStart = formatDateToString(startDate);
  const formattedEnd = formatDateToString(endDate);
  const isApprove = status === 'APPROVED' ? true : false;


  const apiUrl = `http://localhost:8081/api/v1/users/members?address=${address}&isApprove=${isApprove}&name=${name}&startDate=${formattedStart}&endDate=${formattedEnd}&page=${page}&size=${size}`;
  console.log(apiUrl)
  try {
    const response = await apiClient(apiUrl, { method: "GET" });
    return response;
  } catch (error) {
    console.error(`Error fetching users with address ${address}:`, error);
    throw error;
  } 
};

export const get_user_member_by_verifer_address = async (address: string, name: string, status: string,  startDate: Date, endDate: Date): Promise<number> => {
  const formattedStart = formatDateToString(startDate);
  const formattedEnd = formatDateToString(endDate);
  const isApprove = status === 'APPROVED' ? true : false;
  const apiUrl = `http://localhost:8081/api/v1/users/member?address=${address}&isApprove=${isApprove}&name=${name}&startDate=${formattedStart}&endDate=${formattedEnd}`;
  try {
    const response = await apiClient(apiUrl, { method: "GET" });
    return response;
  } catch (error) {
    console.error(`Error fetching users with address ${address}:`, error);
    throw error;
  }
};



export const create_member_by_verifier = async (member: Member): Promise<void> => {
  const apiUrl = `http://localhost:8081/auth/signup`;

  try {
    const response = await apiClient(apiUrl, { method: "POST", body: JSON.stringify(member) });
    console.log(response)
    return response;
  } catch (error) {
    console.error("Error in fetch_user_registed:", error);
    throw error;
  }
};


export const fetch_user_by_id = async (id: string): Promise<User> => {
  const apiUrl = `http://localhost:8081/api/v1/users/${id}`;
  console.log(apiUrl)
  try {
    const response = await apiClient(apiUrl, { method: "GET" });
    console.log(response)
    return response;
  } catch (error) {
    console.error("Error in fetch_user_registed:", error);
    throw error;
  }
};
export const useFetchUserById = (id: string) => {
  const { data, error, isLoading } = useSWR<User>(
    id ? `fetch_user_by_id${id}` : null, 
    () => fetch_user_by_id(id) // Truyền callback thay vì gọi trực tiếp
  );

  return {
    data: data ?? null,
    isLoading,
    isError: !!error,
  };
};

export const deleteUser = async (id: string): Promise<void> => {
  const apiUrl = `http://localhost:8081/api/v1/users/delete/${id}`;

  try {
    const response = await apiClient(apiUrl, { method: "POST" });
    console.log(response)
  } catch (error) {
    console.error("Error in deleteUser:", error);
    throw error;
  }
};

export const fetchVerifierByType = async (type: CopyrightType | null, search: string, page: number, size: number): Promise<UserPaginationResponse> => {
    const apiUrl = `http://localhost:8081/api/v1/users/verifiers?type=${type}&search=${search}&page=${page}&size=${size}`;
  console.log(apiUrl)
  try {
    const response = await apiClient(apiUrl, { method: "GET" });
    console.log(response)
    return response;
  } catch (error) {
    console.error("Error in deleteUser:", error);
    throw error;
  }
};

export const fetchVerifierNumerByType = async (type: CopyrightType | null, search: string): Promise<number> => {
    const apiUrl = `http://localhost:8081/api/v1/users/verifiers-number?type=${type}&search=${search}`;
  console.log(apiUrl)
  try {
    const response = await apiClient(apiUrl, { method: "GET" });
    console.log(response)
    return response;
  } catch (error) {
    console.error("Error in deleteUser:", error);
    throw error;
  }
};