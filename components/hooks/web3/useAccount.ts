import useSWR from "swr";
import { CryptoHookFactory } from "@_types/hooks";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import apiClient from "components/service/apiClient";


type UseAccountResponse = {
  connect: () => void;
  isLoading: boolean;
  isInstalled: boolean;
  isAdmin: boolean;
  isUser: boolean;
  isVerifier: boolean;
  isRegistered: boolean;
  isConnected: boolean;
  isCheck: boolean;
};
type AccountHookFactory = CryptoHookFactory<string, UseAccountResponse>

export type UseAccountHook = ReturnType<AccountHookFactory>

export const hookFactory: AccountHookFactory = ({ provider, copyrightContract, ethereum, isLoading }) => () => {
  const { data, mutate, isValidating, ...swr } = useSWR(
    provider ? "web3/useAccount" : null,
    async () => {
      const accounts = await provider!.listAccounts();
      const account = accounts[0];
      if (!account) {
        throw "Cannot retreive account! Please, connect to web3 wallet."
      }
      return account;
    }, {
    revalidateOnFocus: false,
    shouldRetryOnError: false
  }
  );
  useEffect(() => {
    ethereum?.on("accountsChanged", handleAccountsChanged);
    return () => {
      ethereum?.removeListener("accountsChanged", handleAccountsChanged);
    }
  })

  const handleAccountsChanged = (...args: unknown[]) => {
    const accounts = args[0] as string[];
    if (accounts.length === 0) {
      console.error("Please, connect to Web3 wallet");
    } else if (accounts[0] !== data) {
      mutate(accounts[0]);
    }
  }


  const connect = async () => {
    try {
      ethereum?.request({ method: "eth_requestAccounts" });
      console.log("Ethereum provider:");
      window.addEventListener('load', function () {
        if (window.ethereum) {
          console.log('Ethereum support is available')
          if (window.ethereum.isMetaMask) {
            console.log('MetaMask is active')
          } else {
            console.log('MetaMask is not available')
          }
        } else {
          console.log('Ethereum support is not found')
        }
      })
    } catch (e) {
      console.error(e);
    }
  }


  // const createAccount = async (account: string, name: string, email: string, tokenURI: string) => {
  //   try {
  //     const result = await copyrightContract!.addUser(account, name, email, tokenURI);
  //     await toast.promise(
  //       result!.wait(), {
  //       pending: "Processing transaction",
  //       success: "Nft is yours! Go to Profile page",
  //       error: "Processing error"
  //     }
  //     );
  //   } catch (e: any) {
  //     console.error(e.message);
  //   }
  // };

  let [isAdmin, setIsAdmin] = useState(false);
  let [isUser, setIsUser] = useState(false);
  let [isVerifier, setIsVerifier] = useState(false);
  let [isRegistered, setIsRegistered] = useState(false);
  let [isCheck, setIsCheck] = useState(false);
  const checkAccount = async () => {
    let responseIsAdmin = false;
    if (!data) {
      return responseIsAdmin;
    }
    const apiUrl = `http://localhost:8081/api/v1/users/checkAddressExists?address=${data}`;

    // Gửi request bằng apiClient
    const existed = await apiClient(apiUrl, {
      method: "GET",
      body: JSON.stringify({}), // Chuyển payload thành JSON
    });


    if (existed) {
      const apiUrl = `http://localhost:8081/api/v1/users/${data}/is-approved`;

      // Gửi request bằng apiClient
      const response = await apiClient(apiUrl, {
        method: "GET",
        body: JSON.stringify({}), // Chuyển payload thành JSON
      });

      if (response) {
        const apiUrl = `http://localhost:8081/api/v1/users/${data}/role`;

        // Gửi request bằng apiClient
        const role = await apiClient(apiUrl, {
          method: "GET",
          body: JSON.stringify({}), // Chuyển payload thành JSON
        });

        if (role == "ADMIN") {
          setIsAdmin(true);
        }
        else if (role == "VERIFIER") {
          setIsVerifier(true);
        }
        else  {
          setIsUser(true);
        }
      }
      else {
        setIsRegistered(true)
      }

    }
    else{
      setIsAdmin(false);
      setIsVerifier(false);
      setIsUser(false);
      setIsRegistered(false)
    }


    await setIsCheck(true);
  }


  checkAccount();
  

  const isConnected = !!data;

  return {
    ...swr,
    data,
    isValidating,
    isLoading: isLoading as boolean,
    isInstalled: ethereum?.isMetaMask || false,
    isAdmin: isAdmin as boolean,
    isUser: isUser as boolean,
    isVerifier: isVerifier as boolean,
    isRegistered: isRegistered as boolean,
    isConnected: isConnected as boolean,
    isCheck: isCheck as boolean,
    mutate,
    connect
  };
}

