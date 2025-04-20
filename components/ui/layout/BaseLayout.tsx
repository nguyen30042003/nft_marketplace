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
import NavbarVerifier from "@ui/navbar/navbar_verifier";
import Image from "next/image";

const BaseLayout: FunctionComponent<Props> = ({ children }) => {


  const { account } = useAccount();

  if (account.isAdmin == true && account.isCheck == true) {
    return (
      <div className="h-screen flex">
        {/* Sidebar */}
        <div className="w-[14%] p-4 bg-white">
          <Link href="/" className="flex items-center justify-center gap-2">
            <span className="hidden lg:block font-bold">SchooLama</span>
          </Link>
          <Menu />
        </div>
        {/* Main content */}
        <div className="flex-1 bg-[#F7F8FA] overflow-y-auto">{children}</div>
      </div>
    );
  }

  else if (account.isVerifier == true && account.isCheck == true) {
    return (
      <div className="h-screen flex">
        {/* Sidebar */}
        <div className="w-[14%] p-4 bg-black">
          <Link href="/" className="flex flex-col items-center justify-center gap-2 mb-6">
            <Image src="/images/icon/lg.jpg" alt="Verifier Logo" width={62} height={62} />
            <span className="text-white font-bold text-lg">VERIFIER</span>
          </Link>



          <Menu_Verifier />
        </div>
        {/* Main content */}
        <div className="flex-1 bg-[#F7F8FA] overflow-y-auto">
          <NavbarVerifier /> {children}</div>
      </div>
    );
  }

  else if (account.isMember == true && account.isCheck == true) {
    return (
      <div className="h-screen flex">
        {/* Sidebar */}
        <div className="w-[14%] p-4 bg-white">
          <Link href="/" className="flex items-center justify-center gap-2">
            <span className="hidden lg:block font-bold">MEMBER</span>
          </Link>
          <Menu_Verifier />
        </div>
        {/* Main content */}
        <div className="flex-1 bg-[#F7F8FA] overflow-y-auto">{children}</div>
      </div>
    );
  }

  else {
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
