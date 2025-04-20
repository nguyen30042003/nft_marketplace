import { BrandResponse, MostSimilar } from "@_types/nft";
import apiClient from "components/service/apiClient";

export const fetchCheckName = async (id: string): Promise<BrandResponse> => {
    const apiUrl = `http://localhost:8081/api/v1/brand/mostSimilar?id=${id}`;
    try {
        const response = await apiClient(apiUrl, { method: "GET" });
        console.log(response);
        return response;
    } catch (error) {
        console.error("Error in fetchCheckName:", error);
        throw error;
    }
};

export const fetchCheckSamples = async (id: string): Promise<MostSimilar> => {
    const apiUrl = `http://localhost:8081/api/v1/brand/mostSimilarLogo?id=${id}`;
    try {
        const response = await apiClient(apiUrl, { method: "GET" });
        console.log(response);
        return response;
    } catch (error) {
        console.error("Error in fetchCheckName:", error);
        throw error;
    }
};
