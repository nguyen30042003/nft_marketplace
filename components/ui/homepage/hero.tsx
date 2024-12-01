import { FunctionComponent } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const Hero: FunctionComponent = () => {
  const { ref: heroRef, inView: isHeroInView } = useInView({
    triggerOnce: true, 
    threshold: 0.5, 
  });
  return (
    <>
      <motion.div
        className="flex items-center justify-center bg-gray-50 h-[700px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHeroInView ? 1 : 0 }}
        transition={{ duration: 1.5 }}
      >
        <div ref={heroRef}>
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 text-center">
            <p className="max-w-4xl mx-auto mb-4 text-4xl font-bold leading-tight text-gray-900 sm:leading-tight sm:text-5xl lg:text-6xl lg:leading-tight">
              Blockchain-Powered Content Ownership Platform
            </p>
            <h1 className="max-w-2xl mx-auto px-6 text-lg text-gray-600 font-inter">
              Our platform leverages blockchain technology to empower users in registering and managing digital content ownership securely, transparently, and efficiently.
            </h1>
            <div className="px-8 sm:items-start sm:justify-center sm:px-0 sm:space-x-5 sm:flex mt-9 relative">
              <motion.a
                href="#"
                className="inline-flex items-center justify-center w-full px-8 py-3 text-lg font-bold text-white transition-all duration-200 bg-gray-900 border-2 border-transparent sm:w-auto rounded-xl hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                initial={{ x: -300, opacity: 1 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                Register Content
              </motion.a>
              <motion.a
                href="#"
                className="inline-flex items-center justify-center w-full px-8 py-3 text-lg font-bold text-gray-900 hover:text-white transition-all duration-200 bg-gray-100 border-2 border-gray-900 sm:w-auto rounded-xl hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                initial={{ x: 300, opacity: 1 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                Learn More
              </motion.a>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Hero;
