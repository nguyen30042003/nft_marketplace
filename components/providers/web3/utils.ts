import { MetaMaskInpageProvider } from "@metamask/providers";
import { Contract, ethers, providers } from "ethers";
import { setupHooks, Web3Hooks } from "@hooks/web3/setupHooks";
import { Web3Dependencies } from "@_types/hooks";
import { get_copyright_by_uri, update_token_copyright } from "components/fectData/fetch_copyright";

declare global {
    interface Window {
      ethereum: MetaMaskInpageProvider;
    }
  }

type Nullable<T> = {
  [P in keyof T]: T[P] | null;
}
export type Web3State = {
  isLoading: boolean; // true while loading web3State
  hooks: Web3Hooks;
} & Nullable<Web3Dependencies>

export const createDefaultState = () => {
  return {
    ethereum: null,
    provider: null,
    copyrightContract: null,
    accessContract: null,
    isLoading: true,
    hooks: setupHooks({isLoading: true} as any) 
  }
}

const NETWORK_ID = process.env.NEXT_PUBLIC_NETWORK_ID;

export const loadContract = async (
  name: string,  // NftMarket
  provider: providers.Web3Provider
): Promise<Contract> => {

  if (!NETWORK_ID) {
    return Promise.reject("Network ID is not defined!");
  }

  const res = await fetch(`/contracts/${name}.json`);
  const Artifact = await res.json();

  if (Artifact.networks[NETWORK_ID].address) {
    const contract = new ethers.Contract(
      Artifact.networks[NETWORK_ID].address,
      Artifact.abi,
      provider
    )
    if(name == "NftMarket"){
        contract?.on( "NftItemCreated", async (tokenId: number, uri: string, price: number, creator: string, isListed: boolean) => {
        const copyright = await get_copyright_by_uri(uri);
        if (copyright && copyright.id) {
          const response = await update_token_copyright(copyright.id, tokenId.toString());
          console.log(`📢 NFT Created! ${tokenId}`);
        }
        
      }
    );
    }
    
    return contract;
  } else {
    return Promise.reject(`Contract: [${name}] cannot be loaded!`);
  }
}

export const createWeb3State = ({
  ethereum, provider, copyrightContract, accessContract, isLoading
}: Web3Dependencies) => {
  return {
    ethereum,
    provider,
    copyrightContract,
    accessContract,
    isLoading,
    hooks: setupHooks({ethereum, provider, copyrightContract, accessContract, isLoading})
  }
}
