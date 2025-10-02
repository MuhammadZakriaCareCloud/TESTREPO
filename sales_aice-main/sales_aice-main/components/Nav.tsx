"use client";
import Link from 'next/link';
import { usePathname } from "next/navigation";
import '../app/page.css';
import { useAuth } from "@/context/auth-context";
import { CircleUser } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const Navbar = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // helper for active link styling
  const linkClass = (href: string) => {
    const isActive = pathname === href;
    return [
      "transition", // keep smooth transitions
      isActive
        ? "text-[#FFD700] font-semibold border-b-2 border-[#FFD700]" // active
        : "text-white hover:text-[#FFD700]"                         // normal
    ].join(" ");
  };

  return (
    <nav className="fixed top-0 w-full bg-[#1A2639] bg-opacity-95 backdrop-blur-lg z-[1000] py-2 sm:py-3 transition-all duration-300 ease-in-out">
      <div className="max-w-[1200px] mx-auto flex flex-row items-center justify-between px-3 sm:px-4 md:px-8">
        {/* Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink-0">
          <img
            src="aicelogo-final.png"
            alt="Sales AICE Logo"
            className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 object-contain"
          />
          <Link href="/" className="text-sm sm:text-base md:text-xl font-bold no-underline truncate">
            <span className="text-white">Sales</span>
            <span className="text-[#3F8ED0]">Aice</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:block">
          <ul className="flex gap-4 sm:gap-6">
            {user?.role === "user" && (
              <li>
                <Link href="/dashboard" className={linkClass("/dashboard")}>Dashboard</Link>
              </li>
            )}
            {user?.role === "admin" && (
              <li>
                <Link href="/admin/dashboard" className={linkClass("/admin/dashboard")}>Dashboard</Link>
              </li>
            )}
            <li><Link href="/" className={linkClass("/")}>Home</Link></li>
            <li><Link href="/how-it-works" className={linkClass("/how-it-works")}>How It Works</Link></li>
            <li><Link href="/solutions" className={linkClass("/solutions")}>Solutions</Link></li>
            <li><Link href="/about" className={linkClass("/about")}>About</Link></li>
          </ul>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center bg-[#FFD700] w-10 h-10 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:ring-opacity-50">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect y="3" width="20" height="2" rx="1" fill="#1A2639" />
                <rect y="9" width="20" height="2" rx="1" fill="#1A2639" />
                <rect y="15" width="20" height="2" rx="1" fill="#1A2639" />
              </svg>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-56 mt-2 mr-4 rounded-lg shadow-xl bg-[#1A2639] border border-[#2A4B7C] text-white p-1 z-[1001]"
              align="end"
              sideOffset={5}
            >
              <DropdownMenuItem className="focus:bg-[#2A4B7C] rounded-md p-2 cursor-pointer">
                <Link href="/" className="w-full block text-white hover:text-[#FFD700] transition-colors">Home</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-[#2A4B7C] rounded-md p-2 cursor-pointer">
                <Link href="/how-it-works" className="w-full block text-white hover:text-[#FFD700] transition-colors">How It Works</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-[#2A4B7C] rounded-md p-2 cursor-pointer">
                <Link href="/solutions" className="w-full block text-white hover:text-[#FFD700] transition-colors">Solutions</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-[#2A4B7C] rounded-md p-2 cursor-pointer">
                <Link href="/about" className="w-full block text-white hover:text-[#FFD700] transition-colors">About</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#2A4B7C] my-1" />
              {user ? (
                <>
                  {user?.role === "user" && (
                    <DropdownMenuItem className="focus:bg-[#2A4B7C] rounded-md p-2 cursor-pointer">
                      <Link href="/dashboard" className="w-full block text-white hover:text-[#FFD700] transition-colors">Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  {user?.role === "admin" && (
                    <DropdownMenuItem className="focus:bg-[#2A4B7C] rounded-md p-2 cursor-pointer">
                      <Link href="/admin/dashboard" className="w-full block text-white hover:text-[#FFD700] transition-colors">Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="focus:bg-[#2A4B7C] rounded-md p-2 cursor-pointer">
                    <button onClick={logout} className="w-full text-left text-white hover:text-[#FFD700] transition-colors">Logout</button>
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem className="focus:bg-[#2A4B7C] rounded-md p-2 cursor-pointer">
                  <Link href="/login" className="w-full block bg-[#FFD700] text-[#1A2639] px-3 py-2 rounded-md font-semibold text-center hover:bg-[#E6C200] transition-colors">Login</Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* User Section */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center justify-center w-8 h-8">
                <CircleUser className="w-full h-full text-white" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="absolute right-0 top-12 min-w-[120px] rounded-lg shadow-lg bg-[#122037] text-white p-2 z-50">
                <DropdownMenuItem>
                  <button onClick={logout} className="btn1 btn1-primary w-full text-left">Logout</button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login" className="btn1 btn1-primary">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
