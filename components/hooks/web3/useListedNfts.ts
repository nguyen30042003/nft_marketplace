import { CryptoHookFactory } from "@_types/hooks";
import { Nft } from "@_types/nft";
import useSWR from "swr";
import { Contract, ethers } from "ethers";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";

type UseListedNftsResponse = {
  buyNft: (token: number, value: number) => Promise<void>,
  getStatusHistory: (tokenId: number) => Promise<any[]>,
  getNftDetail: (tokenId: number) => Promise<{Nft: Nft} | null>;
}
type ListedNftsHookFactory = CryptoHookFactory<Nft[], UseListedNftsResponse>

export type UseListedNftsHook = ReturnType<ListedNftsHookFactory>

export const hookFactory: ListedNftsHookFactory = ({copyrightContract}) => () => {
  const {data, ...swr} = useSWR(
    copyrightContract ? "web3/useListedNfts" : null,
    async () => {
      const nfts = [] as Nft[];
      const coreNfts = await copyrightContract!.getAllNftsOnSale();
      console.log(coreNfts.length);
      for (let i = 0; i < coreNfts.length; i++) {
        const item = coreNfts[i];
        const tokenURI = await copyrightContract!.tokenURI(item.tokenId);
        const metaRes = await fetch(tokenURI);
        const meta = await metaRes.json();
        nfts.push({
          tokenId: item.tokenId.toNumber(),
          creator: item.creator,
          isListed: item.isListed,
          activeAt: item.startTime.toNumber(),
          expiredAt: item.endTime.toNumber(),
          copyrightType: item.copyrightType.toNumber(),
          meta
        })
      }

      console.log("nfts", nfts);

      return nfts;
    }
  )


  const _contract = copyrightContract;
  const buyNft = useCallback(async (tokenId: number, value: number) => {
    try {
      // const result = await copyrightContract!.buyNft(
      //   tokenId, {
      //     value: ethers.utils.parseEther(value.toString())
      //   }
      // )
      // await toast.promise(
      //   result!.wait(), {
      //     pending: "Processing transaction",
      //     success: "Nft is yours! Go to Profile page",
      //     error: "Processing error"
      //   }
      // );
    } catch (e: any) {
      console.error(e.message);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_contract])


const getNftDetail = useCallback(async (tokenId: number): Promise<{ Nft: Nft } | null> => {
  if (!_contract) return null;

  try {
    const item = await _contract.getNftItem(tokenId);
    const tokenURI = await _contract.tokenURI(item.tokenId);
    const metaRes = await fetch(tokenURI);
    const meta = await metaRes.json();

    const nft: Nft = {
      tokenId: item.tokenId.toNumber(),
      creator: item.creator,
      isListed: item.isListed,
      activeAt: item.startTime.toNumber(),
      expiredAt: item.endTime.toNumber(),
      copyrightType: item.copyrightType.toNumber(),
      meta,
    };

    return { Nft: nft }; // ✅ Đúng với kiểu { Nft: Nft } | null
  } catch (e: any) {
    console.error("Error fetching NFT detail:", e.message);
    return null;
  }
}, [_contract]);





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
    buyNft,
    getNftDetail,
    getStatusHistory,
    data: data || [],
  };
}