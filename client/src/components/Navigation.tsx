import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Menu, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";

// Import your logo SVGs
import desktopLogo from "@/assets/logo-desktop.svg";
import mobileLogo from "@/assets/logo-mobile.svg";

export default function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  
  const phoneNumber = "+91 98806 52548";

  const links = [
    { href: "/", label: "Home" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/calculator", label: "Calculator" },
    { href: "/booking", label: "Book Consultation" },
    { href: "/contact", label: "Contact" }
  ];

  const NavLinks = ({ mobile = false }) => (
    <>
      {links.map((link) => (
        <div key={link.href} className={cn("nav-link", mobile && "w-full")}>
          <Link href={link.href}>
            <span
              className={cn(
                "text-gray-600 hover:text-gray-900 transition-colors block",
                mobile && "py-3 px-4 hover:bg-gray-50/80 active:bg-gray-100/80 rounded-lg w-full",
                location === link.href && "text-gray-900 font-medium bg-gray-50/50"
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
        className="absolute inset-0 rounded-md bg-amber-400 opacity-75"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.7, 0.3, 0.7]
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity,
          repeatType: "loop"
        }}
      />
      <motion.a 
        href={`tel:${phoneNumber}`}
        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md relative z-10"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ 
            duration: 0.5, 
            repeat: Infinity, 
            repeatType: "loop", 
            repeatDelay: 2 
          }}
        >
          <Phone className="h-4 w-4" />
        </motion.div>
        <span className="hidden sm:inline">Call Now</span>
      </motion.a>
    </motion.div>
  );

  const Logo = ({ className = "" }) => {
    const isMobile = window.innerWidth < 768;

    return (
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
            className="h-8 md:h-10 w-auto"
            loading="eager"
          />
        </picture>
        <span className="sr-only">Estilo Interior</span>
    </motion.div>
  );
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <NavLinks />
          <CallButton />
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-2 md:hidden">
          <CallButton />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-gray-100/80 transition-colors">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              className="w-[300px] p-0 border-l bg-white/95 backdrop-blur-lg"
            >
              <SheetHeader className="p-4 border-b bg-white">
                <SheetTitle className="flex items-center justify-between">
                  <Logo className="scale-90" />
                  <SheetClose asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="hover:bg-gray-100/80 transition-colors rounded-full"
                    >
                      <X className="h-5 w-5" />
                      <span className="sr-only">Close menu</span>
                    </Button>
                  </SheetClose>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col py-4 bg-white">
                <NavLinks mobile />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}