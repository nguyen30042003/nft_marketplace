/* eslint-disable react/jsx-no-undef */

import { FunctionComponent, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../navbar";
import { Props } from "@_types/interface";
import Footer from "@ui/footer";
import { useAccount, useNetwork } from "@hooks/web3";
import Link from "next/link";
import Menu from "@ui/menu";
import Menu_Verifier from "@ui/menu/verifier/index";
const BaseLayout: FunctionComponent<Props> = ({ children }) => {


    const { account } = useAccount();

  

    if (account.isAdmin) {
        return (
            <div className="h-screen flex">
              {/* Sidebar */}
              <div className="w-[14%] p-4 bg-white">
                <Link href="/" className="flex items-center justify-center gap-2">
                  <span className="hidden lg:block font-bold">SchooLama</span>
                </Link>
                <Menu/>
              </div>
              {/* Main content */}
              <div className="flex-1 bg-[#F7F8FA] overflow-y-auto">{children}</div>
            </div>
        );
    }

    else if(account.isVerifier){
        return (
            <div className="h-screen flex">
              {/* Sidebar */}
              <div className="w-[14%] p-4 bg-white">
                <Link href="/" className="flex items-center justify-center gap-2">
                  <span className="hidden lg:block font-bold">SchooLama</span>
                </Link>
                <Menu_Verifier />
              </div>
              {/* Main content */}
              <div className="flex-1 bg-[#F7F8FA] overflow-y-auto">{children}</div>
            </div>
        );
    }

    else{
        return (
            <>
                <Navbar />
                <div className="py-16 bg-gray-50 overflow-hidden min-h-screen">
                    <div className="max-x-7xl mx-auto px-4 space-y-8 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </div>
                <Footer />
            </>
        );
    }
};

export default BaseLayout;
