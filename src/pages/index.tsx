import type { NextPage } from "next";
import { BaseLayout, NftList } from "@ui";
import Hero from "@ui/homepage/hero";
import FeaturesSection from "@ui/homepage/features";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useAccount, useNetwork } from "@hooks/web3";
import { useEffect, useState } from "react";

const Home: NextPage = () => {
  const router = useRouter();
  const { account } = useAccount();
  const { network } = useNetwork();

  if(account.isAdmin == true && account.isCheck == true){
    console.log("admin")
    router.push(`/admin/dashboard`);
    return null;
  }
  if(account.isVerifier == true && account.isCheck == true){
    console.log("verfier")
    router.push(`/verifier/dashboard`);
    return null;
  }
  return (
    <BaseLayout>
      <div className="scroll-smooth scroll-snap-y h-screen w-screen overflow-y-scroll">
        {/* Hero Section */}
        <section
          id="hero"
          className="h-screen flex items-center justify-center bg-gray-50 snap-start"
        >
          <Hero />
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="h-screen flex items-center justify-center bg-blue-50 snap-start"
        >
          <motion.div
            className="container mx-auto p-4 my-6 space-y-2 text-center"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <FeaturesSection />
          </motion.div>
        </section>
      </div>
    </BaseLayout>
  );
  
};

export default Home;
