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
  isCheck: boolean;
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
  isCheck
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


  console.log(isRegistered, isAdmin, isUser, isVerifier, isConnected, isCheck)

  // Redirect to /register/create if not registered
  if (isRegistered == false && isAdmin == false && isUser == false && isVerifier == false && isConnected == true && isCheck == true) {
    router.push(`/register/create?account=${account}`);
    return null;
  }
  

  if(isRegistered == true && isCheck == true){
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
  if (account && isUser) {
    return (
      <Menu as="div" className="ml-3 relative">
        <div>
          <Menu.Button className="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
            <span className="sr-only">Open user menu</span>
            <img
              className="h-8 w-8 rounded-full"
              src="/images/default_user_image.png"
              alt=""
            />
          </Menu.Button>
        </div>

        <Menu.Items className="z-10 origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
          <Menu.Item>
            {() => (
              <button
                disabled={true}
                className="disabled:text-gray-500 text-xs block px-4 pt-2 text-gray-700">
                {`0x${account[2]}${account[3]}${account[4]}....${account.slice(-4)}`}
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link href="/profile" className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}>
              Profile
            </Link>
            

            )}
          </Menu.Item>
          <Menu.Item>
            {
              ({active}) => (
                <Link href="/my_nfts" className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}>
              My Nfts
            </Link>
              )
            }
          </Menu.Item>
          <Menu.Item>
            {
              ({active}) => (
                <Link href="/transfer_requests" className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}>
              Transfer Requests
            </Link>
              )
            }
          </Menu.Item>
        </Menu.Items>
      </Menu>
    )
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
