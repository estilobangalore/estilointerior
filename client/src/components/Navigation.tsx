import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Phone, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";

export default function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  
  const phoneNumber = "+919794513786";
  // Set the path to your custom logo
  const logoPath = "/images/logo.png";

  const links = [
    { href: "/", label: "Home" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/calculator", label: "Calculator" },
    { href: "/booking", label: "Book Consultation" },
    { href: "/contact", label: "Contact" }
  ];

  const NavLinks = () => (
    <>
      {links.map((link) => (
        <div key={link.href} className="nav-link">
          <Link href={link.href}>
            <span
              className={cn(
                "text-gray-600 hover:text-gray-900 transition-colors",
                location === link.href && "text-gray-900 font-medium"
              )}
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

  const Logo = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex items-center gap-2"
    >
      <div className="relative h-12 w-auto">
        <img 
          src={logoPath} 
          alt="Estilo Interior Logo" 
          className="h-full w-auto object-contain"
          onError={(e) => {
            // Fallback if the logo image fails to load
            e.currentTarget.style.display = 'none';
            document.getElementById('fallback-logo-text')?.classList.remove('hidden');
          }}
        />
        <div id="fallback-logo-text" className="hidden flex flex-col">
          <span className="text-lg md:text-xl font-bold leading-none text-gray-900">Beautiful</span>
          <span className="text-sm md:text-base font-medium text-amber-600 leading-none">Interiors</span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b">
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
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[300px]">
              <div className="flex flex-col space-y-4 mt-8">
                <NavLinks />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}