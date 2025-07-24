
import { emailRequest } from "@_types/emailRequest";
import { CopyRight, CopyRightPaginationResponse, CopyRightRequest, CopyRightTransferPaginationResponse, Status, TransactionStatus } from "@_types/nft";
import apiClient from "components/service/apiClient";
import { i } from "framer-motion/client";
import useSWR from "swr";
import { fetch_user_by_id, get_user_by_address } from "./fetch_user";
import { stat } from "fs";


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


// Hàm fetch tất cả bản quyền
export const fetch_all_copyright_by_verifier = async (address: string): Promise<CopyRight[]> => {
  const apiUrl = `http://localhost:8081/api/v1/orders?search=verifyAddress:${address}`;

  try {
    const response = await apiClient(apiUrl, { method: "GET" });
    console.log(response);
    return response;
  } catch (error) {
    console.error("Error in fetch_all_copyright:", error);
    throw error;
  }
};

// Hàm fetch tất cả bản quyền
export const fetch_all_copyright_by_member = async (address: string): Promise<CopyRight[]> => {
  const verifier = await get_user_by_address(address);
  const verifierAddress = await fetch_user_by_id(verifier!.verifierId);
  const apiUrl = `http://localhost:8081/api/v1/orders?search=verifyAddress:${verifierAddress!.address}`;

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

export const fetch_copyright_by_id = async (id: string): Promise<CopyRight> => {
  const apiUrl = `http://localhost:8081/api/v1/orders?search=id:${id}`;
  try {
    const response = await apiClient(apiUrl, { method: "GET" });

    if (!Array.isArray(response) || response.length === 0) {
      throw new Error("Invalid response: Expected an array with at least one element");
    }

    const data = response[0];

    return {
      id: data.id.toString(),
      status: data.status as Status,
      user: data.user,
      metaData: data.metaData,
      tokenId: data.tokenId.toString(),
      verifierAddress: data.verifyAddress,
      isTransfer: data.isTransfer as Boolean,
      gasFee: data.gasFee as number,
      copyrightType: data.copyrightType,
    };
  } catch (error) {
    console.error("Error in fetch_copyright_by_id:", error);
    throw error;
  }
};

export const fetch_copyright_by_tokenId = async (id: string): Promise<CopyRight> => {
  const apiUrl = `http://localhost:8081/api/v1/orders?search=tokenId:${id}`;
  try {
    const response = await apiClient(apiUrl, { method: "GET" });

    if (!Array.isArray(response) || response.length === 0) {
      throw new Error("Invalid response: Expected an array with at least one element");
    }

    const data = response[0];
    console.log(data)
    return {
      id: data.id.toString(),
      status: data.status as Status,
      user: data.user,
      metaData: data.metaData,
      tokenId: data.tokenId.toString(),
      verifierAddress: data.verifyAddress,
      isTransfer: data.isTransfer,
      gasFee: data.gasFee as number,
      copyrightType: data.copyrightType,
    };
  } catch (error) {
    console.error("Error in fetch_copyright_by_id:", error);
    throw error;
  }
};


export const create_copyright = async (copyrightData: CopyRightRequest): Promise<CopyRightRequest> => {
  const apiUrl = `http://localhost:8081/api/v1/orders`;
  console.log(copyrightData);
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
export const update_status_copyright_by_id = async (id: number, status: string): Promise<CopyRight> => {
  const apiUrl = `http://localhost:8081/api/v1/orders`;
  try {
    console.log(id, status)
    const response = await apiClient(apiUrl, { method: "PATCH", body: JSON.stringify({ status, id }), });
    return response;
  } catch (error) {
    console.error("Error in fetch_copyright_by_id:", error);
    throw error;
  }
};

export const update_token_copyright = async (id: string, tokenId: string): Promise<CopyRight> => {
  const apiUrl = `http://localhost:8081/api/v1/orders`;
  try {
    console.log(JSON.stringify({ tokenId, id }))
    const response = await apiClient(apiUrl, { method: "PATCH", body: JSON.stringify({ tokenId, id }), });
    return response;
  } catch (error) {
    console.error("Error in fetch_copyright_by_id:", error);
    throw error;
  }
};

export const get_copyright_by_uri = async (uri: string): Promise<CopyRight> => {
  try {
    const apiUrl = `http://localhost:8081/api/v1/orders/getOrderByUri?uri=${encodeURIComponent(uri)}`;
    const response = await apiClient(apiUrl, { method: "GET" });
    return response;
  } catch (error) {
    console.error("Error in fetch_copyright_by_id:", error);
    throw error;
  }
};

export const send_email_api = async (emailRequest: emailRequest): Promise<CopyRight> => {
  try {
    const apiUrl = `http://localhost:8081/api/v1/notification/email/send`;
    const response = await apiClient(apiUrl, { method: "POST", body: JSON.stringify(emailRequest, null, 2) });
    return response;
  } catch (error) {
    console.error("Error in fetch_copyright_by_id:", error);
    throw error;
  }
};

export const get_copyright_by_address = async (address: string, search: string, status: string, startDate: Date, endDate: Date, page: number, size: number): Promise<CopyRightPaginationResponse> => {
  try {
    const formattedStart = formatDateToString(startDate);
    const formattedEnd = formatDateToString(endDate);
    console.log(formattedStart, formattedEnd);
    const statusParam = status == 'ALL' ? '' : status;
    const apiUrl = `http://localhost:8081/api/v1/users/${address}/orders?search=${search}&status=${statusParam}&startDate=${formattedStart}&endDate=${formattedEnd}&page=${page}&size=${size}`;
    console.log("API URL:", apiUrl);
    const response = await apiClient(apiUrl, { method: "GET" });
    return response;
  } catch (error) {
    console.error("Error in fetch_copyright_by_id:", error);
    throw error;
  }
};
export const get_copyright_number_by_address = async (address: string, search: string, status: string, startDate: Date, endDate: Date): Promise<number> => {
  try {
    const formattedStart = formatDateToString(startDate);
    const formattedEnd = formatDateToString(endDate);
    console.log(formattedStart, formattedEnd);
    const statusParam = status === 'ALL' ? '' : status;
    const apiUrl = `http://localhost:8081/api/v1/users/${address}/orders-number?search=${search}&status=${statusParam}&startDate=${formattedStart}&endDate=${formattedEnd}`;
    console.log("API URL:", apiUrl);
    const response = await apiClient(apiUrl, { method: "GET" });
    return response;
  } catch (error) {
    console.error("Error in fetch_copyright_by_id:", error);
    throw error;
  }
};


export const update_copyright_by_id = async (samples: string, applicationForm: string, uri: string, id: string): Promise<CopyRight> => {
  try {
    console.log(uri)
    const apiUrl = `http://localhost:8081/api/v1/orders/updateMetaData/${id}`;
    const response = await apiClient(apiUrl, {
      method: "PUT", body: JSON.stringify({
        samples: samples,
        applicationForm: applicationForm,
        uri: uri
      }),
    });
    return response;
  } catch (error) {
    console.error("Error in fetch_copyright_by_id:", error);
    throw error;
  }
};

// Hàm fetch bản quyền theo ID
export const update_gas_fee_order = async (id: string, gasFee: number): Promise<CopyRight> => {
  const apiUrl = `http://localhost:8081/api/v1/orders`;
  try {
    const response = await apiClient(apiUrl, {
      method: "PATCH",
      body: JSON.stringify({
        id,
        gasFee,
      }),
    });

    return response;
  } catch (error) {
    console.error("Error in fetch_copyright_by_id:", error);
    throw error;
  }
};

export const update_userId_copyright = async (id: number, userId: number): Promise<CopyRight> => {
  const apiUrl = `http://localhost:8081/api/v1/orders`;
  try {
    const response = await apiClient(apiUrl, { method: "PATCH", body: JSON.stringify({ user: { id: userId }, id }), });
    return response;
  } catch (error) {
    console.error("Error in fetch_copyright_by_id:", error);
    throw error;
  }
};

export const update_is_transfer_copyright = async (id: number, isTransfer: Boolean): Promise<CopyRight> => {
  const apiUrl = `http://localhost:8081/api/v1/orders`;
  try {
    const response = await apiClient(apiUrl, { method: "PATCH", body: JSON.stringify({ isTransfer, id }), });
    return response;
  } catch (error) {
    console.error("Error in fetch_copyright_by_id:", error);
    throw error;
  }
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


export const get_copyrights = async (
  startDate: Date,
  endDate: Date,
  page: number,
  size: number,
  search: string
): Promise<CopyRightPaginationResponse> => {
  try {
    const formattedStart = formatDateToString(startDate);
    const formattedEnd = formatDateToString(endDate);
    console.log(formattedStart, formattedEnd)
    const apiUrl = `http://localhost:8081/api/v1/orders/getCopyrights?search=${search}&status=PUBLISHED&startDate=${formattedStart}&endDate=${formattedEnd}&page=${page}&size=${size}`;

    console.log("API URL:", apiUrl);
    const response = await apiClient(apiUrl, { method: "GET" });
    console.log("API :", response);
    return response;
  } catch (error) {
    console.error("Error in get_copyrights:", error);
    throw error;
  }
};



export const get_number_copyright = async (
  status: Status,
  startDate: Date,
  endDate: Date,
  search: string): Promise<number> => {
  try {
    const formattedStart = formatDateToString(startDate);
    const formattedEnd = formatDateToString(endDate);
    const apiUrl = `http://localhost:8081/api/v1/orders/copyright-publish?search=${search}&startDate=${formattedStart}&endDate=${formattedEnd}&status=${status}`;
    console.log("API URL:", apiUrl);
    const response = await apiClient(apiUrl, { method: "GET" });
    console.log(response)
    return response;
  } catch (error) {
    console.error("Error in get_copyrights:", error);
    throw error;
  }
};



export const get_copyrights_by_member = async (
  startDate: Date,
  endDate: Date,
  page: number,
  size: number,
  search: string,
  status: string,
  address: string
): Promise<CopyRightPaginationResponse> => {
  try {
    const formattedStart = formatDateToString(startDate);
    const formattedEnd = formatDateToString(endDate);
    console.log(formattedStart, formattedEnd);
    const statusParam = status === 'ALL' ? '' : status;
    const apiUrl = `http://localhost:8081/api/v1/orders/getCopyrights?status=${statusParam}&search=${search}&startDate=${formattedStart}&endDate=${formattedEnd}&page=${page}&size=${size}&verifierAddress=${address}`;

    console.log("API URL:", apiUrl);
    const response = await apiClient(apiUrl, { method: "GET" });
    console.log("API :", response);
    return response;
  } catch (error) {
    console.error("Error in get_copyrights:", error);
    throw error;
  }
};



export const get_number_copyright_verifier = async (
  status: string,
  startDate: Date,
  endDate: Date,
  search: string,
  address: string): Promise<number> => {
  try {
    const formattedStart = formatDateToString(startDate);
    const formattedEnd = formatDateToString(endDate);
    const statusParam = status === 'ALL' ? '' : status;
    const apiUrl = `http://localhost:8081/api/v1/orders/copyright-publish?search=${search}&startDate=${formattedStart}&endDate=${formattedEnd}&status=${statusParam}&verifierAddress=${address}`;
    console.log("API UR1L:", apiUrl);
    const response = await apiClient(apiUrl, { method: "GET" });
    console.log(response)
    return response;
  } catch (error) {
    console.error("Error in get_copyrights:", error);
    throw error;
  }
};






export const get_transactions_by_verifier = async (
  startDate: Date,
  endDate: Date,
  page: number,
  size: number,
  search: string,
  status: string,
  address: string
): Promise<CopyRightTransferPaginationResponse> => {
  try {
    const formattedStart = formatDateToString(startDate);
    const formattedEnd = formatDateToString(endDate);
    console.log(formattedStart, formattedEnd);
    const statusParam = status === 'ALL' ? '' : status;
    const apiUrl = `http://localhost:8081/api/v1/transactions/getCopyrightTransfers?transactionStatus=${statusParam}&search=${search}&startDate=${formattedStart}&endDate=${formattedEnd}&page=${page}&size=${size}&verifierAddress=${address}`;

    console.log("API URL:", apiUrl);
    const response = await apiClient(apiUrl, { method: "GET" });
    console.log("API :", response);
    return response;
  } catch (error) {
    console.error("Error in get_copyrights:", error);
    throw error;
  }
};



export const get_number_copyright_transfer_by_verifier = async (
  status: string,
  startDate: Date,
  endDate: Date,
  search: string,
  address: string): Promise<number> => {
  try {
    const formattedStart = formatDateToString(startDate);
    const formattedEnd = formatDateToString(endDate);
    const statusParam = status === 'ALL' ? '' : status;
    const apiUrl = `http://localhost:8081/api/v1/transactions/getSizeCopyrightTransfer?search=${search}&startDate=${formattedStart}&endDate=${formattedEnd}&transactionStatus=${statusParam}&verifierAddress=${address}`;
    console.log("API UR1L:", apiUrl);
    const response = await apiClient(apiUrl, { method: "GET" });
    console.log(response)
    return response;
  } catch (error) {
    console.error("Error in get_copyrights:", error);
    throw error;
  }
};



// Hàm fetch bản quyền theo ID
export const update_expired_copyright_by_id = async (id: number, expiredAt: string): Promise<CopyRight> => {
  const apiUrl = `http://localhost:8081/api/v1/orders`;
  try {
    const payload = {
      id,
      metaData: {
        expiredAt
      }
    };
    const response = await apiClient(apiUrl, { method: "PATCH", body: JSON.stringify(payload), });
    return response;
  } catch (error) {
    console.error("Error in fetch_copyright_by_id:", error);
    throw error;
  }
};