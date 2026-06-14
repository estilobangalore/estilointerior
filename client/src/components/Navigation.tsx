import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Menu, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

import desktopLogo from "@/assets/logo-desktop.svg";
import mobileLogo from "@/assets/logo-mobile.svg";

export default function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });

  const phoneNumber = settings?.contact_phone || "+91 98806 52548";

  const links = [
    { href: "/", label: "Home" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/about", label: "About" },
    { href: "/calculator", label: "Calculator" },
    { href: "/booking", label: "Book Consultation" },
    { href: "/contact", label: "Contact" },
  ];

  const NavLinks = ({ mobile = false }) => (
    <>
      {links.map((link) => (
        <div key={link.href} className={cn("nav-link", mobile && "w-full")}>
          <Link href={link.href}>
            <span
              className={cn(
                "transition-colors duration-200 block font-medium text-sm",
                mobile
                  ? "py-3 px-4 hover:bg-amber-50 rounded-lg w-full text-gray-700 hover:text-amber-700"
                  : "text-gray-600 hover:text-gray-900",
                !mobile && location === link.href && "text-amber-600 font-semibold",
                mobile && location === link.href && "text-amber-600 bg-amber-50 rounded-lg"
              )}
              onClick={() => mobile && setIsOpen(false)}
            >
              {link.label}
            </span>
          </Link>
        </div>
      ))}
    </>
  );

  const CallButton = () => (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <motion.span
        className="absolute inset-0 rounded-full bg-amber-400 opacity-70"
        animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.2, 0.6] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}
      />
      <motion.a
        href={`tel:${phoneNumber}`}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white relative z-10 text-sm font-semibold transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "loop", repeatDelay: 2 }}
        >
          <Phone className="h-4 w-4" />
        </motion.div>
        <span className="hidden sm:inline">Call Now</span>
      </motion.a>
    </motion.div>
  );

  const Logo = ({ className = "" }: { className?: string }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn("flex items-center gap-2", className)}
    >
      <picture>
        <source media="(min-width: 768px)" srcSet={desktopLogo} />
        <source media="(max-width: 767px)" srcSet={mobileLogo} />
        <img src={desktopLogo} alt="Estilo Interior Logo" className="h-8 md:h-10 w-auto" loading="eager" />
      </picture>
      <span className="sr-only">Estilo Interior</span>
    </motion.div>
  );

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 transition-all duration-300 bg-white",
        scrolled ? "shadow-md border-b border-gray-100" : "shadow-sm border-b border-gray-100"
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center space-x-6">
          <NavLinks />
          <CallButton />
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <CallButton />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-gray-100 transition-colors">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] p-0 border-l bg-white/95 backdrop-blur-lg">
              <SheetHeader className="p-4 border-b border-gray-100">
                <SheetTitle className="flex items-center justify-between">
                  <Logo className="scale-90" />
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-gray-100 rounded-full">
                      <X className="h-5 w-5" />
                      <span className="sr-only">Close menu</span>
                    </Button>
                  </SheetClose>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col py-4 px-2">
                <NavLinks mobile />
              </div>
              <div className="px-4 py-4 border-t border-gray-100">
                <a
                  href={`tel:${phoneNumber}`}
                  className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white w-full py-3 rounded-xl font-semibold transition-colors"
                >
                  <Phone className="h-4 w-4" /> {phoneNumber}
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}