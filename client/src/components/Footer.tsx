import { Link } from "wouter";
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone, ArrowRight, Youtube } from "lucide-react";

export default function Footer() {
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
              <a href="https://www.instagram.com/estilo.bangalore/" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-amber-500 p-2 rounded-full transition-colors duration-300">
                <Instagram size={18} />
              </a>
              <a href="https://www.facebook.com/estilo.banlgalore/" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-amber-500 p-2 rounded-full transition-colors duration-300">
                <Facebook size={18} />
              </a>
              <a href="https://x.com/estilo_interior" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-amber-500 p-2 rounded-full transition-colors duration-300">
                <Twitter size={18} />
              </a>
              <a href="https://www.youtube.com/@Estilo.interior" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-amber-500 p-2 rounded-full transition-colors duration-300">
                <Youtube size={18} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold tracking-wider mb-6 relative inline-block">
              Quick Links
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-amber-400"></span>
            </h3>
            <div className="flex flex-col space-y-3">
              <Link href="/">
                <a className="text-gray-300 hover:text-amber-400 transition-colors duration-300 flex items-center">
                  <ArrowRight size={16} className="mr-2" />
                  Home
                </a>
              </Link>
              <Link href="/portfolio">
                <a className="text-gray-300 hover:text-amber-400 transition-colors duration-300 flex items-center">
                  <ArrowRight size={16} className="mr-2" />
                  Portfolio
                </a>
              </Link>
              <Link href="/contact">
                <a className="text-gray-300 hover:text-amber-400 transition-colors duration-300 flex items-center">
                  <ArrowRight size={16} className="mr-2" />
                  Contact
                </a>
              </Link>
              <Link href="/booking">
                <a className="text-gray-300 hover:text-amber-400 transition-colors duration-300 flex items-center">
                  <ArrowRight size={16} className="mr-2" />
                  Book Consultation
                </a>
              </Link>
              <Link href="/calculator">
                <a className="text-gray-300 hover:text-amber-400 transition-colors duration-300 flex items-center">
                  <ArrowRight size={16} className="mr-2" />
                  Cost Calculator
                </a>
              </Link>
            </div>
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
                <p>CD 89, Biderahall Hobli, Byrathi, Kothnur Post Bangalore - 560077</p>
              </div>
              <div className="flex items-center">
                <Phone className="mr-3 text-amber-400" size={18} />
                <p>+91 9880652548</p>
              </div>
              <div className="flex items-center">
                <Mail className="mr-3 text-amber-400" size={18} />
                <p>info@estilointerior.com</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Estilo Interior. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a href="#" className="hover:text-amber-400 transition-colors duration-300">Privacy Policy</a>
            <a href="#" className="hover:text-amber-400 transition-colors duration-300">Terms of Service</a>
            <a href="#" className="hover:text-amber-400 transition-colors duration-300">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
