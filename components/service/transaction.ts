import { useState } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "@providers/web3";
import { update_status_copyright_by_id } from "components/fectData/fetch_copyright";
import { update_status_transfer_copyright_by_id } from "components/fectData/transfer_copyright";

export const useTransaction = () => {
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
    const provider = new ethers.providers.JsonRpcProvider("http://localhost:7545/");
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
      await update_status_copyright_by_id(Number(id), "PAID");
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
    const provider = new ethers.providers.JsonRpcProvider("http://localhost:7545/");
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
