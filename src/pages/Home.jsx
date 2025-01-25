import Lottie from "lottie-react";
import animationData from "./animationData.json";
import { motion } from "framer-motion";
import Features from "../components/Features";


export default function Home() {

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  }
  return (
    <div className="flex flex-col min-h-dvh">
      <main className="flex-1">
        <section className="w-full py-4 md:py-6 lg:py-12 border-y">
          <div className="px-4 md:px-6 space-y-10 xl:space-y-16">
            <div className="flex md:flex-row flex-col max-w-[1300px] mx-auto gap-4 px-4 sm:px-6 md:px-10 md:grid-cols-2 md:gap-16">
              <div className="md:w-1/2 w-full md:text-left text-center ">
              <motion.h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.span className="block mb-2 md:mb-4" variants={itemVariants}>
                  Discover
                </motion.span>
                <motion.span className="block mb-2 md:mb-4 text-[#4169e1]" variants={itemVariants}>
                  share
                </motion.span>
                <motion.span className="block mb-2 md:mb-4" variants={itemVariants}>
                  and <span className="text-[#4169e1]">collaborate on</span>
                </motion.span>
                <motion.span className="block mb-2 md:mb-4" variants={itemVariants}>
                  university resources
                </motion.span>
                <motion.span
                  className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-400"
                  variants={itemVariants}
                >
                  with ease.
                </motion.span>
              </motion.h1>
              </div>
              <div className="md:w-1/2 w-full ">
              <Lottie
                animationData={animationData}
                className="flex justify-center items-center w-full h-full"  
                loop={true}
              />
              </div>
            </div>
          </div>
        </section>
        <Features />
      </main>
    </div>
  )
}
