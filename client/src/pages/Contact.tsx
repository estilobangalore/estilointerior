import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import ContactForm from "@/components/ContactForm";
import { MapPin, Phone, Mail, ArrowRight, MessageSquare, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const socialLinks = [
  { name: "Instagram", url: "https://instagram.com", icon: "ri-instagram-line" },
  { name: "Facebook", url: "https://facebook.com", icon: "ri-facebook-fill" },
  { name: "Pinterest", url: "https://pinterest.com", icon: "ri-pinterest-fill" },
  { name: "LinkedIn", url: "https://linkedin.com", icon: "ri-linkedin-fill" },
];

export default function Contact() {
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // High-quality modern interior design image
  const contactBgImage = "https://images.unsplash.com/photo-1618219944342-824e40a13285?q=80&w=2070&auto=format&fit=crop";

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
                    <p className="text-gray-600 mt-1">CD 89, Biderahall Hobli, Byrathi, Kothnur Post Bangalore - 560077</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-white p-3 rounded-full shadow-sm">
                    <Phone className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Phone</h3>
                    <a href="tel:+919880652548" className="text-gray-600 hover:text-amber-600 transition-colors mt-1 block">
                      +91 98806 52548
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-white p-3 rounded-full shadow-sm">
                    <Mail className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Email</h3>
                    <a href="mailto:info@estilo.com" className="text-gray-600 hover:text-amber-600 transition-colors mt-1 block">
                      info@estilo.com
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
                  {socialLinks.map((social) => (
                    <a 
                      key={social.name}
                      href={social.url}
                      className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-amber-50 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visit our ${social.name} page`}
                    >
                      <i className={`${social.icon} text-amber-600`}></i>
                    </a>
                  ))}
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
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.2147242521876!2d-73.98826292441978!3d40.758996971245356!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c258fbd5ec7547%3A0x7137cc3e35983b!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sus!4v1652389000000!5m2!1sen!2sus"
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
