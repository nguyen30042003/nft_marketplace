import { CryptoHookFactory } from "@_types/hooks";
import { Nft } from "@_types/nft";
import useSWR from "swr";
import { ethers } from "ethers";
import { useCallback } from "react";
import { toast } from "react-toastify";

type UseListedNftsResponse = {
  buyNft: (token: number, value: number) => Promise<void>
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
          price: parseFloat(ethers.utils.formatEther(item.price)),
          tokenId: item.tokenId.toNumber(),
          creator: item.creator,
          isListed: item.isListed,
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
      const result = await copyrightContract!.buyNft(
        tokenId, {
          value: ethers.utils.parseEther(value.toString())
        }
      )
      await toast.promise(
        result!.wait(), {
          pending: "Processing transaction",
          success: "Nft is yours! Go to Profile page",
          error: "Processing error"
        }
      );
    } catch (e: any) {
      console.error(e.message);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_contract])


  
  return {
    ...swr,
    buyNft,
    data: data || [],
  };
}