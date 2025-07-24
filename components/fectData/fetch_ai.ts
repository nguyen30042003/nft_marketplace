import { CheckBranchResponse, LogoBranchResponse } from "@_types/nft";
import apiClient from "components/service/apiClient";
import { a } from "framer-motion/client";

export const fetchCheckBranchByAi = async (brandName: string): Promise<CheckBranchResponse> => {
    const apiUrl = `http://localhost:8081/api/deepseek/check`;
    try {
        console.log(apiUrl);
        console.log(brandName);
        const response = await apiClient(apiUrl, { method: "POST",  body: JSON.stringify({ brandName }) });
        console.log(response);
        return response;
    } catch (error) {       
        console.error("Error in fetchOrderStatisticsByVerifier:", error);
        throw error;
    }
};

export const fetchLogoBranchByAi = async (logoType: string, companyName: string, primaryColor: string, 
    accentColors: string, suggestedSymbols: string): Promise<LogoBranchResponse> => {

    const apiUrl = `http://localhost:8081/api/deepseek/logo`;
    try {
        const response = await apiClient(apiUrl, { method: "POST",  body: JSON.stringify({ logoType, companyName, primaryColor, accentColors, suggestedSymbols }) });
        console.log(response);
        return response;
    } catch (error) {       
        console.error("Error in fetchOrderStatisticsByVerifier:", error);
        throw error;
    }
};
