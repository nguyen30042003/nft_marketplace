import axios, { AxiosRequestConfig } from "axios";

export interface ApiOptions {
  method: string;
  body?: any;
  token?: string; // Thêm token vào tùy chọn
}

const apiClient = async (url: string, options: ApiOptions) => {
  const { method, body, token } = options;
  const config: AxiosRequestConfig = {
    method: method as any,
    url: url,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }), // Thêm Authorization nếu có token
    },
    data: body,
  };
  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error("API error:", error);
  }
};

export default apiClient;
