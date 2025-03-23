
import { emailRequest } from "@_types/emailRequest";
import { CopyRight, CopyRightRequest, Status } from "@_types/nft";
import apiClient from "components/service/apiClient";
import { i } from "framer-motion/client";
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
      isTransfer: data.isTransfer as Boolean
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
      isTransfer: data.isTransfer
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
    console.log( JSON.stringify({ tokenId, id }))
    const response = await apiClient(apiUrl, { method: "PATCH", body: JSON.stringify({ tokenId, id }),});
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

export const get_copyright_by_address = async (address: string): Promise<CopyRight[]> => {
  try {
    const apiUrl = `http://localhost:8081/api/v1/users/${address}/orders`;
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
export const update_order = async (order: CopyRight): Promise<CopyRight> => {
  const apiUrl = `http://localhost:8081/api/v1/orders`;
  try {
    const response = await apiClient(apiUrl, { method: "PATCH", body: JSON.stringify({ order }), });

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