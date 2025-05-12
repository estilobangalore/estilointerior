import { motion } from "framer-motion";
import { Home, PaintBucket, Sofa, Ruler, Lightbulb, Palette, ArrowRight } from "lucide-react";
import { useState } from "react";
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
    color: "bg-blue-50 text-blue-600",
    hoverColor: "group-hover:bg-blue-600 group-hover:text-white",
    accent: "blue",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=2000&auto=format&fit=crop"
  },
  {
    icon: <Sofa className="w-8 h-8" />,
    title: "Furniture Selection",
    description: "Discover our curated collection of furniture pieces that combine style, comfort, and quality. We work with trusted manufacturers to bring you pieces that perfectly match your space and lifestyle.",
    color: "bg-green-50 text-green-600",
    hoverColor: "group-hover:bg-green-600 group-hover:text-white",
    accent: "green",
    image: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=2000&auto=format&fit=crop"
  },
  {
    icon: <Ruler className="w-8 h-8" />,
    title: "Space Optimization",
    description: "Make the most of your space with our smart storage solutions and space-saving designs. We'll help you create a clutter-free environment that feels spacious and organized.",
    color: "bg-purple-50 text-purple-600",
    hoverColor: "group-hover:bg-purple-600 group-hover:text-white",
    accent: "purple",
    image: "https://images.unsplash.com/photo-1600210492493-0946911123ea?q=80&w=2000&auto=format&fit=crop"
  },
  {
    icon: <Lightbulb className="w-8 h-8" />,
    title: "Lighting Design",
    description: "Create the perfect ambiance with our custom lighting solutions. From natural light optimization to statement fixtures, we'll help you achieve the right balance of functionality and atmosphere.",
    color: "bg-orange-50 text-orange-600",
    hoverColor: "group-hover:bg-orange-600 group-hover:text-white",
    accent: "orange",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2000&auto=format&fit=crop"
  },
  {
    icon: <Palette className="w-8 h-8" />,
    title: "Color Consultation",
    description: "Let our color experts guide you in creating harmonious color schemes that enhance your space. We'll help you choose colors that reflect your style while creating the desired mood and atmosphere.",
    color: "bg-rose-50 text-rose-600",
    hoverColor: "group-hover:bg-rose-600 group-hover:text-white",
    accent: "rose",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2000&auto=format&fit=crop"
  }
];

export default function ServicesSection() {
  const [activeService, setActiveService] = useState<number | null>(null);
  
  return (
    <section className="py-20 relative">
      {/* Background with subtle pattern */}
      <div className="absolute inset-0 bg-gray-50 opacity-80 z-0">
        <div className="absolute inset-0" style={{ 
          backgroundImage: `radial-gradient(circle at 25px 25px, rgba(0, 0, 0, 0.1) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(0, 0, 0, 0.05) 2%, transparent 0%)`,
          backgroundSize: '100px 100px'
        }}></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-amber-600 font-medium text-sm uppercase tracking-wider mb-2 inline-block">What We Offer</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-800">Our Services</h2>
          <div className="w-16 sm:w-20 md:w-24 h-1 bg-amber-500 mx-auto mb-4 sm:mb-6"></div>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            We offer comprehensive interior design services tailored to your unique needs. 
            Our team of experienced designers combines creativity with functionality to create 
            spaces that not only look beautiful but also enhance your daily life.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group relative ${activeService === index ? 'ring-2 ring-offset-2 ring-' + service.accent + '-400' : ''}`}
              onMouseEnter={() => setActiveService(index)}
              onMouseLeave={() => setActiveService(null)}
            >
              {/* Service image */}
              <div className="h-48 overflow-hidden">
                <img 
                  src={service.image} 
                  alt={service.title} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-70"></div>
              </div>
              
              {/* Service content */}
              <div className="p-6 relative">
                <div className={`absolute -top-10 left-6 w-16 h-16 rounded-lg flex items-center justify-center transition-all duration-300 ${service.color} ${service.hoverColor}`}>
                  {service.icon}
                </div>
                
                <h3 className="text-xl font-bold mb-3 mt-6">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">{service.description}</p>
                
                <Link href="/contact">
                  <a className={`inline-flex items-center text-${service.accent}-600 font-medium hover:underline`}>
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-20 bg-gray-900 text-white p-12 rounded-2xl shadow-xl relative overflow-hidden"
        >
          {/* Background decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-0 left-0 w-40 h-40 bg-amber-500 rounded-full opacity-10 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-amber-500 rounded-full opacity-10 translate-x-1/3 translate-y-1/3"></div>
          </div>
          
          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Space?</h3>
            <p className="text-gray-300 max-w-3xl mx-auto text-lg">
              Contact us today for a free consultation and let's discuss how we can bring your vision to life.
              Our team is ready to help you create the space of your dreams.
            </p>
            <motion.div
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/booking">
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block bg-amber-500 text-white px-8 py-4 rounded-md font-medium hover:bg-amber-600 transition-colors"
                >
                  Book a Consultation
                </motion.a>
              </Link>
              <Link href="/portfolio">
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block bg-transparent border border-white text-white px-8 py-4 rounded-md font-medium hover:bg-white/10 transition-colors"
                >
                  View Our Portfolio
                </motion.a>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
