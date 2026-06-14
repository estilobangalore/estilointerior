import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  
  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });
  
  useEffect(() => {
    if (shouldReduceMotion) return;
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [shouldReduceMotion]);

  const slides = [
    {
      image: settings?.hero_image_url || "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000",
      title: settings?.hero_title || "Estilo Interior",
      subtitle: settings?.hero_subtitle || "Luxury Interior Design in Bangalore",
    },
    {
      image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2000",
      title: "Bespoke Modern Living",
      subtitle: "Crafted with elegance, precision, and functional design solutions tailored to your lifestyle.",
    },
    {
      image: "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?q=80&w=2000",
      title: "Premium Modular Kitchens",
      subtitle: "High-quality BWR plywood structures, custom pull-outs, and sleek aesthetic finishes.",
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Parallax calculations
  const bgTransform = shouldReduceMotion ? "none" : `translateY(${scrollY * 0.4}px)`;
  const contentTransform = shouldReduceMotion ? "none" : `translateY(${scrollY * -0.15}px)`;
  const contentOpacity = shouldReduceMotion ? 1 : Math.max(0, 1 - scrollY / 600);

  return (
    <div className="relative h-[95vh] overflow-hidden bg-black">
      {/* Slides */}
      {slides.map((slide, index) => {
        const isActive = index === activeIdx;
        return (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* Parallax and Ken Burns Wrapper */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                transform: bgTransform,
              }}
            >
              <motion.div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: `url(${slide.image})`,
                }}
                animate={isActive ? { scale: 1.08 } : { scale: 1.0 }}
                transition={{ duration: 6, ease: "easeOut" }}
              />
            </div>
            
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            
            {/* Slide Content */}
            <div 
              className="relative container mx-auto px-4 h-full flex flex-col justify-center"
              style={{
                transform: contentTransform,
                opacity: contentOpacity,
              }}
            >
              {isActive && (
                <div className="max-w-3xl">
                  <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="inline-block bg-amber-500/20 backdrop-blur-md text-amber-300 px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold mb-6 border border-amber-500/30 tracking-wider uppercase"
                  >
                    Award Winning Interior Design Studio
                  </motion.span>
                  
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight font-serif">
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="block text-amber-400"
                    >
                      {slide.title}
                    </motion.span>
                  </h1>
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="text-xl text-gray-200 mb-10 max-w-2xl leading-relaxed"
                  >
                    {slide.subtitle}
                  </motion.p>
                  
                  <div className="flex flex-wrap gap-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                    >
                      <Link href="/booking">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-8 py-3.5 rounded-md font-medium transition-colors cursor-pointer shadow-lg shadow-amber-500/20"
                        >
                          Book Consultation <ArrowRight size={16} />
                        </motion.div>
                      </Link>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.9 }}
                    >
                      <Link href="/portfolio">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-3.5 rounded-md font-medium transition-colors cursor-pointer backdrop-blur-sm"
                        >
                          View Our Work
                        </motion.div>
                      </Link>
                    </motion.div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Dots Navigation */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIdx(idx)}
            className={`w-3 h-3 rounded-full transition-all duration-300 border-2 ${
              activeIdx === idx 
                ? "bg-amber-500 border-amber-500 scale-125 shadow-md shadow-amber-500/50" 
                : "bg-transparent border-white/50 hover:border-white"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
      >
        <ChevronDown 
          className="w-10 h-10 text-white/70 animate-bounce cursor-pointer" 
          onClick={() => window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
          })}
        />
      </motion.div>
    </div>
  );
}
