import { motion, useScroll, useTransform } from "framer-motion";
import { Home, PaintBucket, Sofa, Ruler, Lightbulb, Palette, ArrowRight, CheckCircle } from "lucide-react";
import { useState, useRef } from "react";
import { Link } from "wouter";

const services = [
  {
    icon: <Home className="w-7 h-7" />,
    title: "Interior Planning",
    short: "Smart layouts that maximize every sq. ft.",
    description: "Transform your space with expert interior planning. We analyze your needs and create functional layouts that balance beauty with practicality.",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop",
    highlights: ["Space analysis", "3D visualization", "Functional layouts"],
  },
  {
    icon: <PaintBucket className="w-7 h-7" />,
    title: "Design Consultation",
    short: "Personalized design advice from experts.",
    description: "Get one-on-one sessions with our experienced designers to choose the perfect color schemes, materials, and finishes that reflect your personality.",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=800&auto=format&fit=crop",
    highlights: ["Color psychology", "Material sourcing", "Mood boards"],
  },
  {
    icon: <Sofa className="w-7 h-7" />,
    title: "Furniture Selection",
    short: "Curated pieces that define your space.",
    description: "Discover our curated furniture collection combining style, comfort, and quality — sourced from trusted manufacturers perfectly matching your lifestyle.",
    image: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=800&auto=format&fit=crop",
    highlights: ["Modular & custom", "Premium brands", "Installation included"],
  },
  {
    icon: <Ruler className="w-7 h-7" />,
    title: "Space Optimization",
    short: "Smarter storage. More breathing room.",
    description: "Make the most of every inch with our smart storage solutions. We eliminate clutter and create organized, spacious environments that breathe.",
    image: "https://images.unsplash.com/photo-1600210492493-0946911123ea?q=80&w=800&auto=format&fit=crop",
    highlights: ["Custom storage", "Modular units", "Space-saving design"],
  },
  {
    icon: <Lightbulb className="w-7 h-7" />,
    title: "Lighting Design",
    short: "Ambiance that sets the perfect mood.",
    description: "Create the perfect atmosphere with custom lighting. From natural optimization to statement fixtures — we balance function with mood effortlessly.",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop",
    highlights: ["LED integration", "Layered lighting", "Smart controls"],
  },
  {
    icon: <Palette className="w-7 h-7" />,
    title: "Color Consultation",
    short: "Harmonious palettes for every room.",
    description: "Let our color experts guide you in creating harmonious schemes that enhance your space, reflecting your style while setting the desired mood.",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800&auto=format&fit=crop",
    highlights: ["Palette creation", "Sample testing", "Room-by-room plan"],
  },
];

/* ── Service Card ─────────────────────────────────── */
function ServiceCard({ service, index }: { service: typeof services[0]; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 cursor-pointer flex flex-col"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <motion.img
          src={service.image}
          alt={service.title}
          className="w-full h-full object-cover"
          animate={{ scale: hovered ? 1.08 : 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Icon badge floating on image */}
        <div className="absolute bottom-4 left-4">
          <motion.div
            animate={{ scale: hovered ? 1.1 : 1 }}
            transition={{ duration: 0.3 }}
            className="w-12 h-12 rounded-2xl bg-amber-500 shadow-lg shadow-amber-500/30 flex items-center justify-center text-white"
          >
            {service.icon}
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6">
        <h3 className="text-gray-900 text-xl font-bold font-serif mb-1.5 group-hover:text-amber-600 transition-colors duration-300">
          {service.title}
        </h3>
        <p className="text-amber-600 text-xs font-semibold mb-3">{service.short}</p>
        <p className="text-gray-500 text-sm leading-relaxed mb-5 flex-1">{service.description}</p>

        {/* Highlights */}
        <ul className="space-y-1.5 mb-6">
          {service.highlights.map((h) => (
            <li key={h} className="flex items-center gap-2 text-gray-500 text-sm">
              <CheckCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
              {h}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link href="/contact">
          <motion.div
            className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 text-sm font-semibold group/btn"
            animate={{ x: hovered ? 4 : 0 }}
            transition={{ duration: 0.2 }}
          >
            Learn More
            <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </motion.div>
        </Link>
      </div>

      {/* Bottom border accent */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: hovered ? 1 : 0 }}
        style={{ transformOrigin: "left" }}
        transition={{ duration: 0.4 }}
      />
    </motion.div>
  );
}

export default function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const shape1Y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const shape2Y = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);

  return (
    <section ref={sectionRef} className="py-20 lg:py-28 relative overflow-hidden bg-gray-50">
      {/* Subtle background shapes (parallax) */}
      <motion.div
        style={{ y: shape1Y }}
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-amber-100/50 blur-3xl pointer-events-none"
      />
      <motion.div
        style={{ y: shape2Y }}
        className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-amber-50/80 blur-3xl pointer-events-none"
      />

      <div className="container mx-auto px-4 relative z-10">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
            What We Offer
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 font-serif mb-4">
            Our Services
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto mb-6 rounded-full" />
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Comprehensive interior design services tailored to your unique needs — from concept to completion.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <ServiceCard key={index} service={service} index={index} />
          ))}
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-20 relative overflow-hidden rounded-3xl"
        >
          {/* Dark bg with image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url(https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=2000&auto=format&fit=crop)",
              filter: "brightness(0.25)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 to-amber-900/40" />

          {/* Decorative circles */}
          <div className="absolute top-0 left-0 w-40 h-40 bg-amber-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-amber-500/10 rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none" />

          <div className="relative z-10 py-14 px-8 md:px-16 text-center">
            <span className="inline-block bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold uppercase tracking-widest px-5 py-2 rounded-full mb-6">
              Begin Your Journey
            </span>
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-serif">
              Ready to Transform Your Space?
            </h3>
            <p className="text-gray-300 max-w-2xl mx-auto text-base md:text-lg mb-10">
              Contact us today for a free consultation and let's bring your vision to life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/booking">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                  <span className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-10 py-4 rounded-full font-semibold shadow-xl shadow-amber-500/20 transition-colors cursor-pointer">
                    Book a Consultation <ArrowRight className="h-4 w-4" />
                  </span>
                </motion.div>
              </Link>
              <Link href="/portfolio">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                  <span className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/25 text-white px-10 py-4 rounded-full font-semibold backdrop-blur-sm transition-colors cursor-pointer">
                    View Portfolio
                  </span>
                </motion.div>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
