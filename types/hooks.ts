import { MetaMaskInpageProvider } from "@metamask/providers";
import { Contract, providers } from "ethers"
import { SWRResponse } from "swr";
import { NftMarketContract } from "./nftMarketContract";
import { AccessManageContract } from "./AccessManageContract";

export type Web3Dependencies = {
  provider: providers.Web3Provider;
  copyrightContract: NftMarketContract;
  accessContract: AccessManageContract,
  ethereum: MetaMaskInpageProvider,
  isLoading: boolean;
  
}

export type CryptoHookFactory<D = any, R = any, P = any> = {
  (d: Partial<Web3Dependencies>): CryptoHandlerHook<D, R, P>
  }
  

  export type CryptoHandlerHook<D = any, R = any, P = any> = (params?: P) => CryptoSWRResponse<D, R>
  
  export type CryptoSWRResponse<D = any, R = any> = SWRResponse<D> & R;
