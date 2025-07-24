import { useState } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "@providers/web3";
import { update_expired_copyright_by_id, update_status_copyright_by_id } from "components/fectData/fetch_copyright";
import { update_status_transfer_copyright_by_id } from "components/fectData/transfer_copyright";
import { Status } from "@_types/nft";
import { s } from "framer-motion/client";

export const useTransaction = () => {
  const { ethereum } = useWeb3();
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  const sendTransaction = async (toAddress: string, price: number, id: string, action: boolean, status: Status,  expiredAt: string | null = null): Promise<boolean> => {
    if (!ethereum) {
      console.error("Bạn cần kết nối MetaMask trước!");
        return false;
    }

    const accounts = (await ethereum.request({ method: "eth_requestAccounts" })) as string[];
    if (!accounts.length) {
      console.error("Không có tài khoản nào được kết nối!");
        return false;
    }

    try {
      setIsWaiting(true); 
      console.log(isWaiting)
      const senderAddress = accounts[0];
      const valueInWei = ethers.utils.parseUnits(price.toString(), "ether");
      const txHash = await ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: senderAddress,
            to: toAddress,
            value: valueInWei.toHexString(), // ✅ convert thành hex string
          },
        ],
      });
      

      if (!txHash || typeof txHash !== "string") {
        console.error("Giao dịch không thành công, txHash không hợp lệ!");
          return false;
      }

      console.log("Giao dịch đã gửi, hash:", txHash);
       const result = await checkTransactionStatus(txHash, action, id,status, expiredAt);
      return result;
    } catch (error) {
      console.error("Giao dịch bị lỗi:", error);
      return false;
    } finally {
      setIsWaiting(false); // Hide loading dialog
    }
  };

const checkTransactionStatus = async (
  txHash: string,
  action: boolean,
  id: string,
  status: Status,
  expiredAt: string | null = null
): Promise<boolean> => {
  // Sử dụng URL Sepolia từ biến môi trường
  const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_INFURA_SEPOLIA_URL || "https://sepolia.infura.io/v3/2999b17860714e409d58e4d77bab67df");

  let receipt = null;
  console.log("Đang kiểm tra giao dịch...");

  while (!receipt) {
    receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt) {
      console.log("Giao dịch chưa được xác nhận. Đang chờ...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  if (receipt.status === 1 && action === true) {
    console.log("✅ Giao dịch thành công!", receipt);
    await update_status_copyright_by_id(Number(id), status);
    if (status === "REQUEST_RENEW") {
      console.log("Hạn mới:", expiredAt);
      await update_expired_copyright_by_id(Number(id), expiredAt || "");
    }
    setTransactionSuccess(true);
    return true;
  } else if (receipt.status === 1 && action === false) {
    console.log("✅ Giao dịch thành công!", receipt);
    setTransactionSuccess(true);
    return true;
  } else {
    console.log("❌ Giao dịch thất bại!", receipt);
    return false;
  }
};

  return { sendTransaction, transactionSuccess, setTransactionSuccess, isWaiting };
} 




export const useTransactionPaymentTransfer = () => {
  const { ethereum } = useWeb3();
  const [transactionSuccess, setTransactionSuccess] = useState(false);

  const sendTransaction = async (toAddress: string, price: number, id: string, action: boolean) => {
    if (!ethereum) {
      console.error("Bạn cần kết nối MetaMask trước!");
      return;
    }

    const accounts = (await ethereum.request({ method: "eth_requestAccounts" })) as string[];
    if (!accounts.length) {
      console.error("Không có tài khoản nào được kết nối!");
      return;
    }

    try {
      const senderAddress = accounts[0];
      const valueInWei = ethers.utils.parseUnits(price.toString(), "ether").toString();

      const txHash = await ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: senderAddress,
            to: toAddress,
            value: valueInWei,
          },
        ],
      });

      if (!txHash || typeof txHash !== "string") {
        console.error("Giao dịch không thành công, txHash không hợp lệ!");
        return;
      }

      console.log("Giao dịch đã gửi, hash:", txHash);
      await checkTransactionStatus(txHash, action, id);
    } catch (error) {
      console.error("Giao dịch bị lỗi:", error);
    }
  };

  const checkTransactionStatus = async (txHash: string, action: boolean, id: string) => {
    const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_INFURA_SEPOLIA_URL || "https://sepolia.infura.io/v3/2999b17860714e409d58e4d77bab67df");
    let receipt = null;
    console.log("Đang kiểm tra giao dịch...");

    while (!receipt) {
      receipt = await provider.getTransactionReceipt(txHash);
      if (!receipt) {
        console.log("Giao dịch chưa được xác nhận. Đang chờ...");
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    if (receipt.status === 1 && action == true) {
      console.log("✅ Giao dịch thành công!", receipt);
      await update_status_transfer_copyright_by_id(Number(id), "PAYMENT_COMPLETED");
      setTransactionSuccess(true); // Cập nhật state
    } else if (receipt.status === 1 && action == false) {
      console.log("✅ Giao dịch thành công!", receipt);
      setTransactionSuccess(true); // Cập nhật state
    } else {
      console.log("❌ Giao dịch thất bại!", receipt);
    }
  };

  return { sendTransaction, transactionSuccess, setTransactionSuccess };
};
