import { motion } from "framer-motion";
import { Home, PaintBucket, Sofa, Ruler, Lightbulb, Palette, ArrowRight } from "lucide-react";
import { useState, useRef } from "react";
import { Link } from "wouter";

const services = [
  {
    icon: <Home className="w-8 h-8" />,
    title: "Interior Planning",
    description: "Transform your space with our expert interior planning services. We analyze your space, understand your needs, and create functional layouts that maximize every square foot while maintaining aesthetic appeal.",
    color: "bg-amber-50 text-amber-600",
    hoverColor: "group-hover:bg-amber-600 group-hover:text-white",
    accent: "amber",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop"
  },
  {
    icon: <PaintBucket className="w-8 h-8" />,
    title: "Design Consultation",
    description: "Get personalized design advice from our experienced interior designers. We'll help you choose the perfect color schemes, materials, and finishes that reflect your personality and create the atmosphere you desire.",
    color: "bg-amber-50 text-amber-600",
    hoverColor: "group-hover:bg-amber-600 group-hover:text-white",
    accent: "amber",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=2000&auto=format&fit=crop"
  },
  {
    icon: <Sofa className="w-8 h-8" />,
    title: "Furniture Selection",
    description: "Discover our curated collection of furniture pieces that combine style, comfort, and quality. We work with trusted manufacturers to bring you pieces that perfectly match your space and lifestyle.",
    color: "bg-amber-50 text-amber-600",
    hoverColor: "group-hover:bg-amber-600 group-hover:text-white",
    accent: "amber",
    image: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=2000&auto=format&fit=crop"
  },
  {
    icon: <Ruler className="w-8 h-8" />,
    title: "Space Optimization",
    description: "Make the most of your space with our smart storage solutions and space-saving designs. We'll help you create a clutter-free environment that feels spacious and organized.",
    color: "bg-amber-50 text-amber-600",
    hoverColor: "group-hover:bg-amber-600 group-hover:text-white",
    accent: "amber",
    image: "https://images.unsplash.com/photo-1600210492493-0946911123ea?q=80&w=2000&auto=format&fit=crop"
  },
  {
    icon: <Lightbulb className="w-8 h-8" />,
    title: "Lighting Design",
    description: "Create the perfect ambiance with our custom lighting solutions. From natural light optimization to statement fixtures, we'll help you achieve the right balance of functionality and atmosphere.",
    color: "bg-amber-50 text-amber-600",
    hoverColor: "group-hover:bg-amber-600 group-hover:text-white",
    accent: "amber",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2000&auto=format&fit=crop"
  },
  {
    icon: <Palette className="w-8 h-8" />,
    title: "Color Consultation",
    description: "Let our color experts guide you in creating harmonious color schemes that enhance your space. We'll help you choose colors that reflect your style while creating the desired mood and atmosphere.",
    color: "bg-amber-50 text-amber-600",
    hoverColor: "group-hover:bg-amber-600 group-hover:text-white",
    accent: "amber",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2000&auto=format&fit=crop"
  }
];

const accentRingMap: Record<string, string> = {
  amber: "ring-amber-500",
};

const accentTextMap: Record<string, string> = {
  amber: "text-amber-600 hover:text-amber-700",
};

interface ServiceCardProps {
  service: typeof services[0];
  index: number;
  activeService: number | null;
  setActiveService: (idx: number | null) => void;
}

function ServiceCard({ service, index, activeService, setActiveService }: ServiceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const rY = (mouseX / width - 0.5) * 16;
    const rX = (0.5 - mouseY / height) * 16;

    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setActiveService(null);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setActiveService(index)}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      animate={{
        rotateX: rotateX,
        rotateY: rotateY,
        scale: rotateX !== 0 || rotateY !== 0 ? 1.03 : 1.0,
      }}
      className={`bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 group relative cursor-pointer ${
        activeService === index ? `ring-2 ring-offset-2 ${accentRingMap[service.accent] || ''}` : ''
      }`}
    >
      {/* Service image with 3D Z-index translate */}
      <div 
        className="h-52 overflow-hidden relative" 
        style={{ transform: "translateZ(20px)" }}
      >
        <img 
          src={service.image} 
          alt={service.title} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-75"></div>
      </div>
      
      {/* Service content with 3D pop translate */}
      <div className="p-6 relative" style={{ transform: "translateZ(40px)" }}>
        <div className={`absolute -top-10 left-6 w-16 h-16 rounded-lg flex items-center justify-center transition-all duration-300 ${service.color} ${service.hoverColor} shadow-md`}>
          {service.icon}
        </div>
        
        <h3 className="text-xl font-bold mb-3 mt-6 text-gray-800 font-serif">{service.title}</h3>
        <p className="text-gray-600 leading-relaxed mb-6 text-sm">{service.description}</p>
        
        <Link href="/contact" className={`inline-flex items-center ${accentTextMap[service.accent] || ''} font-medium hover:underline text-sm`}>
          Learn More
          <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1.5 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}

export default function ServicesSection() {
  const [activeService, setActiveService] = useState<number | null>(null);
  
  return (
    <section className="py-20 relative overflow-hidden bg-gray-50/50">
      {/* Background with subtle pattern and floating parallax shapes */}
      <div className="absolute inset-0 opacity-80 z-0">
        <div className="absolute inset-0" style={{ 
          backgroundImage: `radial-gradient(circle at 25px 25px, rgba(0, 0, 0, 0.04) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(0, 0, 0, 0.02) 2%, transparent 0%)`,
          backgroundSize: '100px 100px'
        }}></div>
        
        {/* Floating Shapes */}
        <motion.div 
          animate={{ 
            y: [0, -25, 0],
            rotate: [0, 45, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-10 w-24 h-24 rounded-full border border-amber-500/10 pointer-events-none"
        />
        <motion.div 
          animate={{ 
            y: [0, 35, 0],
            rotate: [0, -30, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-12 w-36 h-36 rounded-xl border border-amber-500/5 pointer-events-none"
        />
        <motion.div 
          animate={{ 
            x: [0, 20, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 right-1/3 w-16 h-16 rounded-full bg-amber-500/5 pointer-events-none blur-sm"
        />
        <motion.div 
          animate={{ 
            x: [0, -30, 0],
            y: [0, 25, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 left-1/4 w-32 h-32 rounded-full bg-amber-500/3 pointer-events-none blur-md"
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-amber-600 font-semibold text-sm uppercase tracking-wider mb-2 inline-block">What We Offer</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-800 font-serif">Our Services</h2>
          <div className="w-16 sm:w-20 md:w-24 h-1 bg-amber-500 mx-auto mb-4 sm:mb-6"></div>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            We offer comprehensive interior design services tailored to your unique needs. 
            Our team of experienced designers combines creativity with functionality to create 
            spaces that not only look beautiful but also enhance your daily life.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              service={service}
              index={index}
              activeService={activeService}
              setActiveService={setActiveService}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-20 bg-gray-900 text-white p-12 rounded-2xl shadow-xl relative overflow-hidden"
        >
          {/* Background decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-0 left-0 w-40 h-40 bg-amber-500 rounded-full opacity-10 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-amber-500 rounded-full opacity-10 translate-x-1/3 translate-y-1/3"></div>
          </div>
          
          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 font-serif">Ready to Transform Your Space?</h3>
            <p className="text-gray-300 max-w-3xl mx-auto text-lg">
              Contact us today for a free consultation and let's discuss how we can bring your vision to life.
              Our team is ready to help you create the space of your dreams.
            </p>
            <motion.div
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <Link href="/booking" className="inline-block bg-amber-500 text-white px-8 py-4 rounded-md font-medium hover:bg-amber-600 transition-colors cursor-pointer text-center">
                  Book a Consultation
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <Link href="/portfolio" className="inline-block bg-transparent border border-white text-white px-8 py-4 rounded-md font-medium hover:bg-white/10 transition-colors cursor-pointer text-center">
                  View Our Portfolio
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
