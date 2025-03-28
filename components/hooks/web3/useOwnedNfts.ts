import { CryptoHookFactory } from "@_types/hooks";
import { Nft } from "@_types/nft";
import { ethers } from "ethers";
import useSWR from "swr";
import { useCallback } from "react";
import { toast } from "react-toastify";
type UseOwnedNftsResponse = {
  listNft: (tokenId: number, price: number) => Promise<void>
}
type OwnedNftsHookFactory = CryptoHookFactory<Nft[], UseOwnedNftsResponse>

export type UseOwnedNftsHook = ReturnType<OwnedNftsHookFactory>

export const hookFactory: OwnedNftsHookFactory = ({copyrightContract}) => () => {
  const {data, ...swr} = useSWR(
    copyrightContract ? "web3/useOwnedNfts" : null,
    async () => {
      const nfts = [] as Nft[];
      const coreNfts = await copyrightContract!.getOwnedNfts();

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

      return nfts;
    }
  )

  const _contract = copyrightContract;
  const listNft = useCallback(async (tokenId: number, price: number) => {
    try {
      const result = await _contract!.placeNftOnSale(
        tokenId,  
        ethers.utils.parseEther(price.toString()),
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


  return {
    ...swr,
    listNft,
    data: data || [],
  };
}