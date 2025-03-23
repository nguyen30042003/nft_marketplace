import { TransferCopyRight, TransferCopyRightRequest, TransferCopyRightResponse } from "@_types/nft";
import apiClient from "components/service/apiClient";


export const create_transfer_copyright = async (transferCopyrightData: TransferCopyRightRequest): Promise<TransferCopyRightRequest> => {
    const apiUrl = `http://localhost:8081/api/v1/transactions`;
  
    try {
      const response = await apiClient(apiUrl, {
        method: "POST",
        body: JSON.stringify(transferCopyrightData),
      });
      console.log(response);
      return response;
    } catch (error) {
      console.error("Error in create_copyright:", error);
      throw error;
    }
  };

  export const fetch_all_transfer_copyright_by_verifier = async (address: string): Promise<TransferCopyRightResponse[]> => {
    const apiUrl = `http://localhost:8081/api/v1/transactions?address=${address}`;
    console.log(apiUrl);
    try {
      const response = await apiClient(apiUrl, { method: "GET" });
      console.log(response);
      return response;
    } catch (error) {
      console.error("Error in fetch_all_copyright:", error);
      throw error;
    }
  };
  

  export const fetch_transfer_copyright_by_id = async (id: string): Promise<TransferCopyRightResponse> => {
    const apiUrl = `http://localhost:8081/api/v1/transactions/${id}`;
    console.log(apiUrl);
    try {
      const response = await apiClient(apiUrl, { method: "GET" });
      console.log(response);
      return response;
    } catch (error) {
      console.error("Error in fetch_all_copyright:", error);
      throw error;
    }
  };


  // Hàm fetch bản quyền theo ID
export const update_status_transfer_copyright_by_id = async (id: number, status: string): Promise<TransferCopyRight> => {
  const apiUrl = `http://localhost:8081/api/v1/transactions`;
  try {
    const response = await apiClient(apiUrl, { method: "PATCH", body: JSON.stringify({ status, id }), });
    return response;
  } catch (error) {
    console.error("Error in fetch_copyright_by_id:", error);
    throw error;
  }
};

export const fetch_all_transfer_copyright_by_toUser = async (address: string): Promise<TransferCopyRightResponse[]> => {
  const apiUrl = `http://localhost:8081/api/v1/transactions?address=${address}&isVerify=false`;
  console.log(apiUrl);
  try {
    const response = await apiClient(apiUrl, { method: "GET" });
    console.log(response);
    return response;
  } catch (error) {
    console.error("Error in fetch_all_copyright:", error);
    throw error;
  }
};


export const detele_transfer_copyright = async (id: number): Promise<TransferCopyRightResponse[]> => {
  const apiUrl = `http://localhost:8081/api/v1/transactions?id=${id}`;
  try {
    const response = await apiClient(apiUrl, { method: "DELETE" });
    console.log(response);
    return response;
  } catch (error) {
    console.error("Error in fetch_all_copyright:", error);
    throw error;
  }
};

