import { Link } from "wouter";
import { Instagram, Facebook, Mail, MapPin, Phone, ArrowRight, Youtube } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Footer() {
  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });

  const instagramUrl = settings?.contact_instagram || "https://www.instagram.com/estilo.bangalore/";
  const facebookUrl = settings?.contact_facebook || "https://www.facebook.com/estilo.banlgalore/";
  const pinterestUrl = settings?.contact_pinterest || "https://pinterest.com";
  const whatsappNumber = settings?.contact_whatsapp || "+919880652548";
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`;

  return (
    <footer className="bg-gray-900 text-white">
      {/* Top wave separator */}
      <div className="bg-white">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 48" className="w-full h-12 -mb-1 text-gray-900 fill-current">
          <path d="M0,0 C480,48 960,48 1440,0 L1440,48 L0,48 Z"></path>
        </svg>
      </div>
      
      <div className="container mx-auto px-4 py-16">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company info */}
          <div className="space-y-4">
            {/* Logo */}
            <div className="mb-6">
              <div className="flex flex-col mb-4">
                <span className="text-2xl font-bold leading-none text-white">Estilo Interior</span>
              </div>
            </div>
            <p className="text-gray-300 pr-4">
              Creating beautiful spaces that inspire and delight. Our team of expert designers transforms your vision into reality.
            </p>
            <div className="flex space-x-4">
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-amber-500 p-2 rounded-full transition-colors duration-300" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-amber-500 p-2 rounded-full transition-colors duration-300" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href={pinterestUrl} target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-amber-500 p-2 rounded-full transition-colors duration-300" aria-label="Pinterest">
                <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.965 1.406-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.162 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.621 0 11.988-5.367 11.988-11.987C24 5.367 18.633 0 12.017 0z"/>
                </svg>
              </a>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-amber-500 p-2 rounded-full transition-colors duration-300" aria-label="WhatsApp">
                <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.59 1.977 14.113.953 11.487.953c-5.442 0-9.866 4.372-9.87 9.802 0 1.83.504 3.618 1.46 5.181L2.094 22l6.094-1.597c.026.015.052.029.078.043-.162-.092.366.242-.525-.3z"/>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold tracking-wider mb-6 relative inline-block">
              Quick Links
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-amber-400"></span>
            </h3>
              <Link href="/" className="text-gray-300 hover:text-amber-400 transition-colors duration-300 flex items-center">
                <ArrowRight size={16} className="mr-2" />
                Home
              </Link>
              <Link href="/about" className="text-gray-300 hover:text-amber-400 transition-colors duration-300 flex items-center">
                <ArrowRight size={16} className="mr-2" />
                About Us
              </Link>
              <Link href="/portfolio" className="text-gray-300 hover:text-amber-400 transition-colors duration-300 flex items-center">
                <ArrowRight size={16} className="mr-2" />
                Portfolio
              </Link>
              <Link href="/contact" className="text-gray-300 hover:text-amber-400 transition-colors duration-300 flex items-center">
                <ArrowRight size={16} className="mr-2" />
                Contact
              </Link>
              <Link href="/booking" className="text-gray-300 hover:text-amber-400 transition-colors duration-300 flex items-center">
                <ArrowRight size={16} className="mr-2" />
                Book Consultation
              </Link>
              <Link href="/calculator" className="text-gray-300 hover:text-amber-400 transition-colors duration-300 flex items-center">
                <ArrowRight size={16} className="mr-2" />
                Cost Calculator
              </Link>
          </div>
          
          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold tracking-wider mb-6 relative inline-block">
              Our Services
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-amber-400"></span>
            </h3>
            <div className="flex flex-col space-y-3">
              <span className="text-gray-300">Residential Design</span>
              <span className="text-gray-300">Commercial Spaces</span>
              <span className="text-gray-300">Kitchen Remodeling</span>
              <span className="text-gray-300">Bathroom Renovation</span>
              <span className="text-gray-300">Office Design</span>
            </div>
          </div>
          
          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold tracking-wider mb-6 relative inline-block">
              Contact Us
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-amber-400"></span>
            </h3>
            <div className="space-y-4 text-gray-300">
              <div className="flex items-start">
                <MapPin className="mr-3 mt-1 text-amber-400" size={18} />
                <p>{settings?.contact_address || "CD 89, Biderahall Hobli, Byrathi, Kothnur Post Bangalore - 560077"}</p>
              </div>
              <div className="flex items-center">
                <Phone className="mr-3 text-amber-400" size={18} />
                <p>{settings?.contact_phone || "+91 9880652548"}</p>
              </div>
              <div className="flex items-center">
                <Mail className="mr-3 text-amber-400" size={18} />
                <p>{settings?.contact_email || "info@estilointerior.com"}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Estilo Interior. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link href="/privacy" className="hover:text-amber-400 transition-colors duration-300">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-amber-400 transition-colors duration-300">
              Terms of Service
            </Link>
            <a href="#" className="hover:text-amber-400 transition-colors duration-300">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
