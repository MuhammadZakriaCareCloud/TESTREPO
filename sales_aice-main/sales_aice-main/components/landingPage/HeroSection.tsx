// import { Link } from "react-router-dom";
import '../../app/page.css'
import { getHumeAccessToken } from "@/utils/getHumeAccessToken";
import dynamic from "next/dynamic";
import Link from 'next/link';
import { useAuth } from "@/context/auth-context";

const Chat = dynamic(() => import("@/components/Chat"), {
  ssr: false,
});
const HeroSection = async () => {
  // const accessToken = await getHumeAccessToken();
  //   console.log("Access Token:", accessToken);

  //   if (!accessToken) {
  //     throw new Error('Unable to get access token');
  return (
  <section className="hero1 pt-6 sm:pt-8 md:pt-16 pb-12 md:pb-24 flex items-center justify-center min-h-[70vh]">
      <div className="hero1-content w-full max-w-xl px-4 sm:px-8 mx-auto text-center md:text-left">
  <h1 className="text-[1.125rem] sm:text-2xl md:text-4xl font-bold text-white mb-4 leading-tight">
          Your AI Closer, No Scripts.<br className="block md:hidden" /> No Hand-Offs. Just Sales.
        </h1>
        <div className="flex flex-col items-center md:items-start w-full mb-4">
          <div className="w-full max-w-xs sm:max-w-sm md:max-w-full overflow-hidden rounded-lg">
            <Chat />
          </div>
        </div>
        <p className="hero1-subtitle mt-6 text-base sm:text-lg md:text-xl text-white font-medium">
          Meet the first fully autonomous AI sales agent that handles complete sales conversations
          from prospecting to closing, with advanced emotional intelligence and objection handling
          that outperforms top human closers.
        </p>
        <div className="hero1-buttons flex flex-col gap-4 mt-8 items-center justify-center">
          <Link href="/login" className="btn1 btn1-primary w-full max-w-xs text-center">Get Started</Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
