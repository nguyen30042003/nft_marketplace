import { createContext, FunctionComponent, useContext, useEffect, useState } from "react"
import { createDefaultState, createWeb3State, loadContract, Web3State } from "./utils";
import { ethers } from "ethers";
import { setupHooks } from "@hooks/web3/setupHooks";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { NftMarketContract } from "@_types/nftMarketContract";
import { Props } from "@_types/interface";
import { AccessManageContract } from "@_types/AccessManageContract";

const pageReload = () => { window.location.href = "http://localhost:3000/"; }

const handleAccount = (ethereum: MetaMaskInpageProvider) => async () => {
  const isLocked =  !(await ethereum._metamask.isUnlocked());
  if (isLocked) { pageReload(); }
  pageReload();
}

const setGlobalListeners = (ethereum: MetaMaskInpageProvider) => {
  ethereum.on("chainChanged", pageReload);
  ethereum.on("accountsChanged", handleAccount(ethereum));
}

const removeGlobalListeners = (ethereum: MetaMaskInpageProvider) => {
  ethereum?.removeListener("chainChanged", pageReload);
  ethereum?.removeListener("accountsChanged", handleAccount);
}

const Web3Context = createContext<Web3State>(createDefaultState());

const Web3Provider: FunctionComponent<Props> = ({children}) => {
  const [web3Api, setWeb3Api] = useState<Web3State>(createDefaultState());
  useEffect(() => {
    async function initWeb3() {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum as any);
        const accessManageContract = await loadContract("AccessManage", provider);
        const nftCopyrightContract = await loadContract("NftMarket", provider);
        const signer = provider.getSigner();
        const signedAccessManageContract = accessManageContract.connect(signer);
        const signedNftCopyrightContract = nftCopyrightContract.connect(signer);
        setTimeout(() => setGlobalListeners(window.ethereum), 500);
        setWeb3Api(createWeb3State({
          ethereum: window.ethereum,
          provider,
          copyrightContract: signedNftCopyrightContract as unknown as NftMarketContract,
          accessContract: signedAccessManageContract as unknown as AccessManageContract,
          isLoading: false
        }))

      } catch(e: any) {
        console.error("Please, install web3 wallet");
        setWeb3Api((api) => createWeb3State({
          ...api as any,
          isLoading: false,
        }))
      }
    }
  
    initWeb3();
    return () => removeGlobalListeners(window.ethereum);
  }, []);

  return (
    <Web3Context.Provider value={web3Api}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  return useContext(Web3Context);
}

export function useHooks() {
  const { hooks } = useWeb3();
  return hooks;
}

export default Web3Provider;
