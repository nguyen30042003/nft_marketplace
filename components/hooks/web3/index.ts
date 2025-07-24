import { useHooks } from "@providers/web3"
import { console } from "inspector";



export const useAccount = () => {
  const hooks = useHooks();
  const swrRes = hooks.useAccount();
  return {
    account: swrRes
  }
}

export const useNetwork = () => {
  const hooks = useHooks();
  const swrRes = hooks.useNetwork();

  return {
    network: swrRes
  }
}

export const useListedNfts = () => {
  const hooks = useHooks();
  const {getNftDetail, getStatusHistory, ...swrRes} = hooks.useListedNfts();

  return {
    nfts: swrRes,
    getNftDetail,
    getStatusHistory
  }
}

export const useOwnedNfts = () => {
  const hooks = useHooks();
  const { getStatusHistory, ...swrRes } = hooks.useOwnedNfts();
  return {
    nfts: swrRes,
    getStatusHistory
  }
}
