import { useHooks } from "@providers/web3"


export const useAccount = () => {
  const hooks = useHooks();
  const swrRes = hooks.useAccount();
  console.log("index" , swrRes)
  return {
    account: swrRes
  }
}