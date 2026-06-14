import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ContactForm from "@/components/ContactForm";
import { MapPin, Phone, Mail, MessageSquare, Clock, Instagram, Facebook } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";

export default function Contact() {
  const [scrollY, setScrollY] = useState(0);
  
  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // High-quality modern interior design image
  const contactBgImage = "https://images.unsplash.com/photo-1618219944342-824e40a13285?q=80&w=2070&auto=format&fit=crop";

  const instagramUrl = settings?.contact_instagram || "https://www.instagram.com/estilo.bangalore/";
  const facebookUrl = settings?.contact_facebook || "https://www.facebook.com/estilo.banlgalore/";
  const pinterestUrl = settings?.contact_pinterest || "https://pinterest.com";
  const whatsappNumber = settings?.contact_whatsapp || "+919880652548";
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`;

  const socialLinks = [
    { 
      name: "Instagram", 
      url: instagramUrl, 
      icon: <Instagram className="h-5 w-5 text-amber-600" /> 
    },
    { 
      name: "Facebook", 
      url: facebookUrl, 
      icon: <Facebook className="h-5 w-5 text-amber-600" /> 
    },
    { 
      name: "Pinterest", 
      url: pinterestUrl, 
      icon: (
        <svg className="h-5 w-5 text-amber-600 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.965 1.406-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.162 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.621 0 11.988-5.367 11.988-11.987C24 5.367 18.633 0 12.017 0z"/>
        </svg>
      ) 
    },
    { 
      name: "WhatsApp", 
      url: whatsappUrl, 
      icon: <MessageSquare className="h-5 w-5 text-amber-600" /> 
    }
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Hero section with parallax effect */}
      <div className="relative h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{
            backgroundImage: `url(${contactBgImage})`,
            transform: `translateY(${scrollY * 0.3}px)`,
            filter: 'brightness(0.7)'
          }}
        />
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">Get in Touch</h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              We'd love to hear about your project and help bring your vision to life.
            </p>
          </motion.div>
        </div>
      </div>
      
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 lg:gap-12 max-w-6xl mx-auto">
            {/* Contact info sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2 bg-gray-50 p-8 lg:p-10 rounded-t-lg lg:rounded-lg shadow-sm mb-8 lg:mb-0"
            >
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Contact Information</h2>
              <p className="text-gray-600 mb-8">
                Feel free to reach out to us with any questions about your interior design needs. We're here to help transform your space.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-white p-3 rounded-full shadow-sm">
                    <MapPin className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Address</h3>
                    <p className="text-gray-600 mt-1">{settings?.contact_address || "CD 89, Biderahall Hobli, Byrathi, Kothnur Post Bangalore - 560077"}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-white p-3 rounded-full shadow-sm">
                    <Phone className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Phone</h3>
                    <a href={`tel:${(settings?.contact_phone || "+91 9880652548").replace(/\s+/g, '')}`} className="text-gray-600 hover:text-amber-600 transition-colors mt-1 block">
                      {settings?.contact_phone || "+91 9880652548"}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-white p-3 rounded-full shadow-sm">
                    <Mail className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Email</h3>
                    <a href={`mailto:${settings?.contact_email || "info@estilointerior.com"}`} className="text-gray-600 hover:text-amber-600 transition-colors mt-1 block">
                      {settings?.contact_email || "info@estilointerior.com"}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-white p-3 rounded-full shadow-sm">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Business Hours</h3>
                    <p className="text-gray-600 mt-1">Mon - Fri: 9AM - 6PM<br />Sat: 10AM - 4PM</p>
                  </div>
                </div>
              </div>
              
              <Separator className="my-8" />
              
              <div>
                <h3 className="font-medium text-gray-800 mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  {socialLinks.map((social) => {
                    return (
                    <a 
                      key={social.name}
                      href={social.url}
                      className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-amber-50 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visit our ${social.name} page`}
                    >
                        {social.icon}
                    </a>
                    );
                  })}
                </div>
              </div>
            </motion.div>
            
            {/* Contact form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-3 bg-white p-8 lg:p-10 rounded-b-lg lg:rounded-lg shadow-lg"
            >
              <div className="flex items-center mb-6">
                <div className="bg-amber-100 p-3 rounded-full mr-4">
                  <MessageSquare className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">Send us a Message</h2>
                  <p className="text-gray-600 text-sm">We'll get back to you as soon as possible</p>
                </div>
              </div>
              
              <ContactForm />
              
              <p className="text-gray-500 text-sm mt-6 text-center">
                By submitting this form, you agree to our privacy policy and terms of service.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Map embed section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-12 bg-gray-50"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold text-center mb-10 text-gray-800">Find Our Studio</h2>
          <div className="rounded-lg overflow-hidden shadow-lg h-[400px]">
            <iframe
              title="Studio Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.9288192398847!2d77.64023267618813!3d13.066021587281595!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDAzJzU3LjciTiA3N8KwMzgnMzIuOCJF!5e0!3m2!1sen!2sin!4v1621429013412!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
