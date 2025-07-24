import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TransactionBillProps {
    transactionId: string;
    recipientAddress: string;
    gasFee: number;
    verifierFee: number;
    tempHoldFee: number;
    total: number;
    timestamp: string;
    paymentDescription: string; // ✅ thêm dòng này
    onCheckout?: () => void;
    onCancel?: () => void;
  }
  
const TransactionBill: React.FC<TransactionBillProps> = ({
  transactionId,
  recipientAddress,
  gasFee,
  verifierFee,
  tempHoldFee,
  total,
  timestamp,
    paymentDescription,
  onCheckout,
  onCancel,
}) => {
  return (
    <Card className="w-1/3 h-1.9/3 mx-auto mt-6 shadow-xl rounded-2xl border-2 border-gray-300 flex flex-col justify-between">
      <CardContent className="p-6 space-y-4 overflow-y-auto">
        <h2 className="text-2xl font-semibold text-center text-blue-600">
          Transaction Bill
        </h2>

        <div className="text-sm text-gray-500 text-center">
          Transaction ID: <span className="font-medium">{transactionId}</span>
        </div>

        <div className="text-sm text-gray-500 text-center">
          To:{" "}
          <span className="font-medium text-gray-800 break-words">
            {recipientAddress}
          </span>
        </div>

        <div className="border-t-2 border-gray-300 pt-4 space-y-2">
          <div className="flex justify-between">
            <span>Total Gas Fee:</span>
            <span className="font-semibold text-gray-700">
              {gasFee.toFixed(4)} ETH
            </span>
          </div>

          <div className="flex justify-between">
            <span>Verify Fee:</span>
            <span className="font-semibold text-gray-700">
              {verifierFee.toFixed(4)} ETH
            </span>
          </div>

          <div className="flex justify-between">
            <span>Temp Hold Fee:</span>
            <span className="font-semibold text-gray-700">
              {tempHoldFee.toFixed(4)} ETH
            </span>
          </div>

          <div className="flex justify-between border-t-2 border-gray-300 pt-2 mt-2">
            <span className="font-semibold text-gray-800">Total:</span>
            <span className="font-bold text-green-600">
              {total.toFixed(4)} ETH
            </span>
          </div>
        </div>
        <div className="flex justify-between text-gray-700">
  <span className="font-medium">Payment Description:</span>
  <span className="text-right max-w-[60%] break-words">
    {paymentDescription}
  </span>
</div>


        <div className="text-xs text-gray-400 text-right pt-2">
          Time: {new Date(timestamp).toLocaleString()}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button className="bg-blue-600 text-white" onClick={onCheckout}>
            Checkout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionBill;
