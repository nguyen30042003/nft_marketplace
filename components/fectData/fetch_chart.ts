import { CopyRight } from "@_types/nft";
import apiClient from "components/service/apiClient";

export const fetchOrderStatisticsByVerifier = async (verifyAddress: string, year: number): Promise<number[]> => {
    const apiUrl = `http://localhost:8081/api/v1/statistic/count-by-month?verifyAddress=${verifyAddress}&year=${year}`;
    console.log(apiUrl);
    try {
        const response = await apiClient(apiUrl, { method: "GET" });
        console.log(response);
        return response;
    } catch (error) {
        console.error("Error in fetchOrderStatisticsByVerifier:", error);
        throw error;
    }
};


export const fetchLast7DaysOrderStatisticsByVerifier = async (verifyAddress: string): Promise<Record<string, number>> => {
    const apiUrl = `http://localhost:8081/api/v1/statistic/count-last-7-days?verifyAddress=${verifyAddress}`;
    console.log(apiUrl);
    try {
        const response = await apiClient(apiUrl, { method: "GET" });
        console.log(response);
        return response;
    } catch (error) {
        console.error("Error in fetchLast7DaysOrderStatisticsByVerifier:", error);
        throw error;
    }
};

export const fetchCountTransferByVerifier = async (verifyAddress: string): Promise<number> => {
    const apiUrl = `http://localhost:8081/api/v1/statistic/count-transferred?verifyAddress=${verifyAddress}`;
    console.log(apiUrl);
    try {
        const response = await apiClient(apiUrl, { method: "GET" });
        console.log(response);
        return response;
    } catch (error) {
        console.error("Error in fetchLast7DaysOrderStatisticsByVerifier:", error);
        throw error;
    }
};
export const fetchCountNonTransferByVerifier = async (verifyAddress: string): Promise<number> => {
    const apiUrl = `http://localhost:8081/api/v1/statistic/count-non-transferred?verifyAddress=${verifyAddress}`;
    console.log(apiUrl);
    try {
        const response = await apiClient(apiUrl, { method: "GET" });
        console.log(response);
        return response;
    } catch (error) {
        console.error("Error in fetchLast7DaysOrderStatisticsByVerifier:", error);
        throw error;
    }
};



export const fetchCountPatentUserTransactionCurrent = async (): Promise<{
    sumOfUsers: number;
    sumOfOrders: number;
    sumOfTransactions: number;
  }> => {
    const apiUrl = `http://localhost:8081/api/v1/statistic`;
    console.log("Fetching data from:", apiUrl);
  
    try {
      const response = await apiClient(apiUrl, { method: "GET" });
      console.log("API Response:", response);
  
      return response; // ✅ Trả về dữ liệu đúng định dạng
    } catch (error) {
      console.error("Error in fetchCountPatentUserTransactionCurrent:", error);
      throw error;
    }
  };
  
  export const fetchCountUserCurrent = async (): Promise<{
    sumOfUser: number;
    sumOfVerifier: number;
    sumOfAdmin: number;
  }> => {
    const apiUrl = `http://localhost:8081/api/v1/statistic/count-by-role`;
    console.log("Fetching data from:", apiUrl);
  
    try {
      const response = await apiClient(apiUrl, { method: "GET" });
      console.log("API Response:", response);
  
      return {
        sumOfUser: (response.VERIFIER || 0),
        sumOfVerifier: (response.ADMIN || 0), 
        sumOfAdmin: (response.USER || 0), 
      };
    } catch (error) {
      console.error("Error in fetchCountUserCurrent:", error);
      throw error;
    }
  };
  

  export const fetchCountUserAndCopyrightByWeek = async (): Promise<{
    user: Record<string, number>;
    order: Record<string, number>;
  }> => {
    const apiUrl = `http://localhost:8081/api/v1/statistic/count-by-week`;
    console.log("Fetching data from:", apiUrl);
  
    try {
      const response = await apiClient(apiUrl, { method: "GET" });
      console.log("API Response:", response);
  
      return {
        user: response.user || {},
        order: response.order || {},
      };
    } catch (error) {
      console.error("Error in fetchCountUserAndCopyrightByWeek:", error);
      throw error;
    }
  };
  

  export const fetchCountMemberByVerifier = async (verifyAddress: string): Promise<number> => {
    const apiUrl = `http://localhost:8081/api/v1/statistic/count-member?verifyAddress=${verifyAddress}`;
    console.log(apiUrl);
    try {
        const response = await apiClient(apiUrl, { method: "GET" });
        console.log(response);
        return response;
    } catch (error) {
        console.error("Error in fetchLast7DaysOrderStatisticsByVerifier:", error);
        throw error;
    }
  };

  export const fetchCountCopyrightPublishedByVerifier = async (verifyAddress: string): Promise<number> => {
    const apiUrl = `http://localhost:8081/api/v1/statistic/count-copyright-published?verifyAddress=${verifyAddress}`;
    console.log(apiUrl);
    try {
        const response = await apiClient(apiUrl, { method: "GET" });
        console.log(response);
        return response;
    } catch (error) {
        console.error("Error in fetchLast7DaysOrderStatisticsByVerifier:", error);
        throw error;
    }
  };

  export const fetchTopFiveNewestCopyrigtByVerifier = async (verifyAddress: string): Promise<CopyRight[]> => {
    const apiUrl = `http://localhost:8081/api/v1/statistic/top-five-newest-copyright?verifyAddress=${verifyAddress}`;
    console.log(apiUrl);
    try {
        const response = await apiClient(apiUrl, { method: "GET" });
        console.log(response);
        return response;
    } catch (error) {
        console.error("Error in fetchLast7DaysOrderStatisticsByVerifier:", error);
        throw error;
    }
  };

  export const fetchCountCopyrightByVerifier = async (verifyAddress: string): Promise<number> => {
    const apiUrl = `http://localhost:8081/api/v1/statistic/count-copyright?verifyAddress=${verifyAddress}`;
    console.log(apiUrl);
    try {
        const response = await apiClient(apiUrl, { method: "GET" });
        console.log(response);
        return response;
    } catch (error) {
        console.error("Error in fetchLast7DaysOrderStatisticsByVerifier:", error);
        throw error;
    }
  };