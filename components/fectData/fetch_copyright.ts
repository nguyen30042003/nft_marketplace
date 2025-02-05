
import apiClient from "components/service/apiClient";
import useSWR from "swr";


// Hàm fetch tất cả bản quyền
export const fetch_all_copyright = async (): Promise<CopyRight[]> => {
  const apiUrl = `http://localhost:8081/api/v1/orders/getAllCopyright`;

  try {
    const response = await apiClient(apiUrl, { method: "GET" });
    console.log(response);
    return response;
  } catch (error) {
    console.error("Error in fetch_all_copyright:", error);
    throw error;
  }
};

// Hàm fetch bản quyền theo trạng thái
export const fetch_copyright_by_status = async (status: Status): Promise<CopyRight[]> => {
  const apiUrl = `http://localhost:8081/api/v1/orders?status=${status}`;

  try {
    const response = await apiClient(apiUrl, { method: "GET" });
    console.log(response);
    return response;
  } catch (error) {
    console.error("Error in fetch_copyright_by_status:", error);
    throw error;
  }
};

// Hàm fetch bản quyền theo ID
export const fetch_copyright_by_id = async (id: string): Promise<CopyRight> => {
  const apiUrl = `http://localhost:8081/api/v1/orders/${id}`;
  console.log("111")
  try {

    
    const response = await apiClient(apiUrl, { method: "GET" });
    console.log("111",  response);
    return response;
  } catch (error) {
    console.error("Error in fetch_copyright_by_id:", error);
    throw error;
  }
};


export const create_copyright = async (copyrightData: CopyRightRequest): Promise<CopyRightRequest> => {
  const apiUrl = `http://localhost:8081/api/v1/orders`;

  try {
    const response = await apiClient(apiUrl, {
      method: "POST",
      body: JSON.stringify(copyrightData),
    });
    console.log(response);
    return response;
  } catch (error) {
    console.error("Error in create_copyright:", error);
    throw error;
  }
};

// Hàm fetch bản quyền theo ID
export const update_status_copyright_by_id = async (id: string, status: string): Promise<CopyRight> => {
  const apiUrl = `http://localhost:8081/api/v1/orders/updateStatus/${id}`;

  try {
    const response = await apiClient(apiUrl, { method: "PATCH", body: JSON.stringify({ status }),});
    console.log(response);
    return response;
  } catch (error) {
    console.error("Error in fetch_copyright_by_id:", error);
    throw error;
  }
};