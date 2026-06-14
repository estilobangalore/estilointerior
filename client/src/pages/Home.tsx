import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import StatsCounter from "@/components/StatsCounter";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Testimonial, PortfolioItem } from "@shared/schema";
import { ArrowRight, Star, Quote, ExternalLink, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";

/* ── Premium Project Card ───────────────────────────────── */
function ProjectCard({ project, index }: { project: PortfolioItem; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group relative rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-shadow duration-500 cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <motion.img
          src={project.imageUrl}
          alt={project.title}
          className="w-full h-full object-cover"
          animate={{ scale: hovered ? 1.08 : 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          loading="lazy"
        />
        {/* Category badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-amber-500/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
            {project.category}
          </span>
        </div>
        {/* Hover overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute bottom-4 left-4 right-4">
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: hovered ? 0 : 12, opacity: hovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="inline-flex items-center gap-1.5 text-white text-sm font-medium">
                <ZoomIn className="h-4 w-4" /> View Project
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors duration-300 line-clamp-1">
          {project.title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{project.description}</p>
        <motion.div
          className="mt-4 flex items-center gap-1.5 text-amber-600 text-sm font-semibold"
          animate={{ x: hovered ? 4 : 0 }}
          transition={{ duration: 0.2 }}
        >
          View Details <ArrowRight className="h-3.5 w-3.5" />
        </motion.div>
      </div>

      {/* Bottom accent bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: hovered ? 1 : 0 }}
        style={{ transformOrigin: "left" }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}

/* ── Premium Testimonial Card ───────────────────────────── */
function TestimonialCard({ testimonial, active }: { testimonial: Testimonial; active: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: active ? 1 : 0.4, y: 0, scale: active ? 1 : 0.95 }}
      transition={{ duration: 0.5 }}
      className="relative bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-gray-100"
    >
      {/* Big quote mark */}
      <div className="absolute -top-5 left-8">
        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
          <Quote className="h-5 w-5 text-white" />
        </div>
      </div>

      {/* Stars */}
      <div className="flex gap-1 mb-6 pt-2">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
        ))}
      </div>

      {/* Quote */}
      <p className="text-gray-700 text-base md:text-lg leading-relaxed italic mb-8">
        "{testimonial.content}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <img
            src={testimonial.imageUrl}
            alt={testimonial.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-amber-100"
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white" />
        </div>
        <div>
          <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
          <p className="text-sm text-gray-500">{testimonial.role}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Parallax Section Wrapper ───────────────────────────── */
function ParallaxSection({
  children,
  className = "",
  bgColor = "bg-gray-50",
}: {
  children: React.ReactNode;
  className?: string;
  bgColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["5%", "-5%"]);

  return (
    <section ref={ref} className={`relative overflow-hidden ${bgColor} ${className}`}>
      <motion.div style={{ y }} className="relative">
        {children}
      </motion.div>
    </section>
  );
}

export default function Home() {
  const [visibleProjects, setVisibleProjects] = useState(6);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const { data: portfolioItems = [] } = useQuery<PortfolioItem[]>({
    queryKey: ["/api/portfolio"],
  });

  const featuredItems = portfolioItems.filter((item) => item.featured === true);

  const { data: testimonials = [] } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
  });

  const showMoreProjects = () => {
    setVisibleProjects(featuredItems.length);
  };

  const prevTestimonial = () => setTestimonialIdx((i) => (i - 1 + testimonials.length) % testimonials.length);
  const nextTestimonial = () => setTestimonialIdx((i) => (i + 1) % testimonials.length);

  return (
    <>
      {/* Hero */}
      <HeroSection />

      {/* Services */}
      <ServicesSection />

      {/* ── Featured Projects ──────────────────────── */}
      <ParallaxSection bgColor="bg-[#fafaf9]" className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-block bg-amber-50 text-amber-700 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              Our Portfolio
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-serif">Our Latest Projects</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto mb-6 rounded-full" />
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Explore our recent interior design projects showcasing expertise, craftsmanship, and creativity.
            </p>
          </motion.div>

          {featuredItems.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {featuredItems.slice(0, visibleProjects).map((project, index) => (
                  <ProjectCard key={project.id} project={project} index={index} />
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-14">
                {visibleProjects < featuredItems.length && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button
                      onClick={showMoreProjects}
                      variant="outline"
                      size="lg"
                      className="px-10 rounded-full border-gray-300 hover:border-amber-500 hover:text-amber-600 transition-colors"
                    >
                      Load More
                    </Button>
                  </motion.div>
                )}
                <Link href="/portfolio">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="lg"
                      className="px-10 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20"
                    >
                      View All Projects <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No featured projects yet. Check back soon!</p>
            </div>
          )}
        </div>
      </ParallaxSection>

      {/* ── Stats ─────────────────────────────────── */}
      <StatsCounter />

      {/* ── Testimonials ──────────────────────────── */}
      {testimonials.length > 0 && (
        <ParallaxSection bgColor="bg-white" className="py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <span className="inline-block bg-amber-50 text-amber-700 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
                Client Stories
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-serif">Client Testimonials</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto mb-6 rounded-full" />
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                Hear from our clients who've experienced the Estilo difference.
              </p>
            </motion.div>

            <div className="max-w-3xl mx-auto relative">
              {/* Cards */}
              <div className="relative min-h-[300px]">
                {testimonials.map((t, i) =>
                  i === testimonialIdx ? (
                    <TestimonialCard key={t.id} testimonial={t} active />
                  ) : null
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8">
                {/* Dots */}
                <div className="flex gap-2">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setTestimonialIdx(i)}
                      className={`rounded-full transition-all duration-300 ${
                        i === testimonialIdx
                          ? "bg-amber-500 w-8 h-2.5"
                          : "bg-gray-200 hover:bg-amber-200 w-2.5 h-2.5"
                      }`}
                      aria-label={`Go to testimonial ${i + 1}`}
                    />
                  ))}
                </div>
                {/* Arrows */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={prevTestimonial}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-amber-500 hover:text-amber-600 transition-colors"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={nextTestimonial}
                    className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600 transition-colors shadow-md shadow-amber-500/20"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </ParallaxSection>
      )}

      {/* ── CTA Banner ────────────────────────────── */}
      <section className="relative py-24 overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=2000&auto=format&fit=crop)",
            filter: "brightness(0.25)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/40 to-black/60" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold uppercase tracking-widest px-5 py-2 rounded-full mb-6 backdrop-blur-sm">
              Begin Your Journey
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-serif leading-tight">
              Ready to Transform<br />
              <span className="text-amber-400">Your Space?</span>
            </h2>
            <p className="text-white/70 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Book a free consultation with our expert designers and take the first step towards your dream interior.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/booking">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    className="px-10 py-6 rounded-full bg-amber-500 hover:bg-amber-400 text-white text-base font-semibold shadow-xl shadow-amber-500/20"
                  >
                    Book a Consultation <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
              <Link href="/calculator">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-10 py-6 rounded-full border-white/30 text-white hover:bg-white/10 hover:border-white/60 text-base font-semibold backdrop-blur-sm"
                  >
                    Cost Calculator
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}