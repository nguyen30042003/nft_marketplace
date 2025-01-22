/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @next/next/no-img-element */
import { Menu } from "@headlessui/react";
import Link from "next/link";
import { FunctionComponent, useEffect } from "react";
import { useRouter } from "next/router";

type WalletbarProps = {
  isInstalled: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isUser: boolean;
  isVerifier: boolean;
  isRegistered: boolean;
  isConnected: boolean;
  account: string | undefined;
  connect: () => void;
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const Walletbar: FunctionComponent<WalletbarProps> = ({
  isInstalled,
  isLoading,
  isAdmin,
  isUser,
  isVerifier,
  isRegistered,
  isConnected,
  connect,
  account,
}) => {
  const router = useRouter();
  if (isLoading) {
    return (
      <div>
        <button
          type="button"
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Loading ...
        </button>
      </div>
    );
  }


  // Redirect to /register/create if not registered
  if (isRegistered == false && isAdmin == false && isUser == false && isVerifier == false && isConnected == true) {
    router.push(`/register/create?account=${account}`);
    return null;
  }
  
  

  if(isRegistered){
    return (
      <div>
        <button
          onClick={connect}
          type="button"
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Account is waiting for verification 
        </button>
      </div>
    );
  }

  if (isInstalled) {
    return (
      <div>
        <button
          onClick={connect}
          type="button"
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Connect Wallet
        </button>
      </div>
    );
  } else {
    return (
      <div>
        <button
          onClick={() => {
            window.open("https://metamask.io", "_blank");
          }}
          type="button"
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          No Wallet
        </button>
      </div>
    );
  }
};

export default Walletbar;
