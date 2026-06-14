import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Menu, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

// Import your logo SVGs
import desktopLogo from "@/assets/logo-desktop.svg";
import mobileLogo from "@/assets/logo-mobile.svg";

// Pages that use a dark hero — nav starts transparent and becomes solid on scroll
const DARK_HERO_ROUTES = ["/", "/portfolio", "/about", "/booking", "/contact", "/calculator"];

export default function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();

  const isDarkHero = DARK_HERO_ROUTES.includes(location);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // run once
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

  // Visual state
  const isTransparent = isDarkHero && !scrolled;

  const NavLinks = ({ mobile = false }) => (
    <>
      {links.map((link) => (
        <div key={link.href} className={cn("nav-link", mobile && "w-full")}>
          <Link href={link.href}>
            <span
              className={cn(
                "transition-colors duration-200 block font-medium text-sm",
                mobile
                  ? "py-3 px-4 hover:bg-white/5 rounded-lg w-full text-white/80 hover:text-white"
                  : isTransparent
                  ? "text-white/80 hover:text-white"
                  : "text-gray-600 hover:text-gray-900",
                !mobile && location === link.href && (isTransparent ? "text-amber-400" : "text-amber-600 font-semibold"),
                mobile && location === link.href && "text-amber-400"
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

  const CallButton = ({ dark = false }: { dark?: boolean }) => (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <motion.span
        className="absolute inset-0 rounded-full bg-amber-400 opacity-70"
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.6, 0.2, 0.6],
        }}
        transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}
      />
      <motion.a
        href={`tel:${phoneNumber}`}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full relative z-10 text-sm font-semibold transition-colors",
          dark
            ? "bg-amber-500 hover:bg-amber-400 text-white"
            : isTransparent
            ? "bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-sm"
            : "bg-amber-500 hover:bg-amber-600 text-white"
        )}
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
        <img
          src={desktopLogo}
          alt="Estilo Interior Logo"
          className={cn("h-8 md:h-10 w-auto transition-all duration-300", isTransparent && "brightness-200")}
          loading="eager"
        />
      </picture>
      <span className="sr-only">Estilo Interior</span>
    </motion.div>
  );

  return (
    <motion.nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isTransparent
          ? "bg-transparent border-b border-transparent"
          : "bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100"
      )}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <NavLinks />
          <CallButton />
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-2 md:hidden">
          <CallButton />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "hover:bg-white/10 transition-colors rounded-full",
                  isTransparent ? "text-white" : "text-gray-700"
                )}
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[300px] p-0 border-l bg-[#0d0d0f]/95 backdrop-blur-xl border-white/10"
            >
              <SheetHeader className="p-4 border-b border-white/10">
                <SheetTitle className="flex items-center justify-between">
                  <Logo className="scale-90 brightness-200" />
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-white/10 transition-colors rounded-full text-white"
                    >
                      <X className="h-5 w-5" />
                      <span className="sr-only">Close menu</span>
                    </Button>
                  </SheetClose>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col py-4">
                <NavLinks mobile />
              </div>

              {/* Mobile call CTA */}
              <div className="px-4 py-4 border-t border-white/10">
                <a
                  href={`tel:${phoneNumber}`}
                  className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white w-full py-3 rounded-xl font-semibold transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  {phoneNumber}
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.nav>
  );
}