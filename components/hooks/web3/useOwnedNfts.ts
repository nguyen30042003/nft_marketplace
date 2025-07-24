import { CryptoHookFactory } from "@_types/hooks";
import { Nft } from "@_types/nft";
import { Contract, ethers } from "ethers";
import useSWR from "swr";
import { useCallback } from "react";
import { toast } from "react-toastify";
type UseOwnedNftsResponse = {
  listNft: (tokenId: number, price: number) => Promise<void>,
  getStatusHistory: (tokenId: number) => Promise<any[]>; // 👈 thêm dòng này
}
type OwnedNftsHookFactory = CryptoHookFactory<Nft[], UseOwnedNftsResponse>

export type UseOwnedNftsHook = ReturnType<OwnedNftsHookFactory>

export const hookFactory: OwnedNftsHookFactory = ({copyrightContract}) => () => {
  const {data, ...swr} = useSWR(
    copyrightContract ? "web3/useOwnedNfts" : null,
    async () => {
      const nfts = [] as Nft[];
      const coreNfts = await copyrightContract!.getOwnedNfts();
      console.log("coreNfts", coreNfts.length, coreNfts);
      for (let i = 0; i < coreNfts.length; i++) {
        const item = coreNfts[i];
        console.log("meta", i, item);
        const tokenURI = await copyrightContract!.tokenURI(item.tokenId);
        console.log("tokenURI", tokenURI);
        const metaRes = await fetch(tokenURI);
        const meta = await metaRes.json();
        console.log("meta", meta);
        nfts.push({
          tokenId: item.tokenId.toNumber(),
          creator: item.creator,
          isListed: item.isListed,
          meta,
          copyrightType: 0,
          activeAt: 0,
          expiredAt: 0
        })
      }

      return nfts;
    }
  )

  const _contract = copyrightContract;
  const listNft = useCallback(async (tokenId: number, price: number) => {
    try {
      const result = await _contract!.placeNftOnSale(
        tokenId,  
        {
          value: ethers.utils.parseEther(0.025.toString())
        }
      )

      await toast.promise(
        result!.wait(), {
          pending: "Processing transaction",
          success: "Item has been listed",
          error: "Processing error"
        }
      );

    } catch (e: any) {
      console.error(e.message);
    }
  }, [_contract])

  const getStatusHistory = useCallback(async (tokenId: number) => {
    console.log("logs", tokenId);
    if (!_contract) return [];
    console.log("logs", "logs");
    try {
      const contract = _contract as unknown as Contract; // 👈 ép kiểu ở đây
      const filter = contract.filters.NftItemUpdated(tokenId); 
      const logs = await contract.queryFilter(filter, 0, "latest");
      console.log("logs", logs);
      return logs.map(log => ({
        tokenId: log.args?.tokenId.toString(),
        status: log.args?.status,
        updater: log.args?.updater,
        blockNumber: log.blockNumber,
        txHash: log.transactionHash
      }));
    } catch (e: any) {
      console.error("Error fetching status history:", e.message);
      return [];
    }
  }, [_contract]);


  return {
    ...swr,
    listNft,
    getStatusHistory,
    data: data || [],
  };
}