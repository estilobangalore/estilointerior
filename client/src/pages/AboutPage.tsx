import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Compass, Target, ShieldCheck, Award, Clock, Users, ArrowRight } from "lucide-react";
import SEOMetaTags from "@/components/SEOMetaTags";

const VALUES = [
  { icon: <ShieldCheck className="h-7 w-7 text-amber-500" />, title: "Unmatched Quality", desc: "Premium materials sourced from authentic, certified suppliers." },
  { icon: <Award className="h-7 w-7 text-amber-500" />, title: "Bespoke Designs", desc: "Every design custom-crafted to reflect your unique personality and lifestyle." },
  { icon: <Clock className="h-7 w-7 text-amber-500" />, title: "On-Time Delivery", desc: "We respect your schedule. Projects delivered on-time, every time." },
  { icon: <Users className="h-7 w-7 text-amber-500" />, title: "Seamless Execution", desc: "Turnkey solutions with dedicated project management from start to finish." },
];

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  const { data: settings, isLoading } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });

  const aboutImage = settings?.about_image_url || "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=2000";
  const aboutContent = settings?.about_content || "Luxury residential and commercial interior design studio based in Bangalore. We create beautiful, functional spaces customized to your lifestyle.";
  const aboutVision = settings?.about_vision || "To be the leading luxury interior design firm known for timeless elegance and bespoke spaces.";
  const aboutMission = settings?.about_mission || "To transform our clients' visions into custom realities through exceptional design, premium craftsmanship, and seamless execution.";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 rounded-full border-2 border-t-amber-500 border-gray-200 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <SEOMetaTags
        title="About Us – Estilo Interior Design Studio Bangalore"
        description="Learn more about Estilo Interior, our luxury design philosophy, and our mission to craft bespoke spaces in Bangalore."
      />

      <div className="relative overflow-hidden bg-white">

        {/* ── HERO with parallax ─────────────────── */}
        <section ref={heroRef} className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-cover bg-center will-change-transform"
            style={{ backgroundImage: `url(${aboutImage})`, y: bgY }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/70" />

          <motion.div
            style={{ y: contentY, opacity }}
            className="container relative z-10 mx-auto px-4 text-center"
          >
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-block bg-amber-500/20 backdrop-blur-md text-amber-300 px-5 py-2 rounded-full text-xs font-semibold mb-6 border border-amber-500/30 tracking-widest uppercase"
            >
              Crafting Dreams Since 2015
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-4 font-serif"
            >
              Our <span className="text-amber-400">Story</span>
            </motion.h1>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="w-20 h-1 bg-amber-500 mx-auto rounded-full"
            />
          </motion.div>
        </section>

        {/* ── ABOUT CONTENT ─────────────────────── */}
        <section className="py-20 lg:py-28 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

              {/* Left: Text */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                <span className="inline-block bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full">
                  Established Excellence
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 font-serif leading-tight">
                  A Passion For Designing Extraordinary Spaces
                </h2>
                <div className="w-12 h-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" />
                <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">{aboutContent}</p>

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-4 pt-4">
                  {[
                    { num: "8+", label: "Years" },
                    { num: "250+", label: "Projects" },
                    { num: "98%", label: "Satisfaction" },
                  ].map((s) => (
                    <div key={s.label} className="text-center p-4 rounded-2xl bg-amber-50 border border-amber-100">
                      <p className="text-2xl font-bold text-amber-600 mb-1">{s.num}</p>
                      <p className="text-gray-500 text-sm">{s.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Right: Image */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.15 }}
                className="relative"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100 aspect-[4/3]">
                  <img src={aboutImage} alt="Estilo interior design studio" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="absolute -bottom-6 -left-6 bg-amber-500 text-white rounded-2xl p-5 shadow-xl shadow-amber-500/30"
                >
                  <p className="text-3xl font-bold">8+</p>
                  <p className="text-xs font-medium text-amber-100 mt-0.5">Years of Excellence</p>
                </motion.div>
                <div className="absolute -top-4 -right-4 w-24 h-24 rounded-2xl bg-amber-50 border border-amber-100 -z-10" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── VISION & MISSION ──────────────────── */}
        <section className="py-20 bg-gray-50 border-t border-gray-100">
          <div className="container mx-auto px-4 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <span className="text-amber-600 text-xs font-semibold uppercase tracking-widest block mb-3">Our Direction</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 font-serif">Vision & Mission</h2>
              <div className="w-16 h-1 bg-amber-500 mx-auto mt-4 rounded-full" />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative bg-white rounded-2xl p-8 md:p-10 shadow-md border-t-4 border-amber-500 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="bg-amber-50 p-4 rounded-xl inline-block mb-6">
                  <Compass className="h-7 w-7 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 font-serif mb-4">Our Vision</h3>
                <p className="text-gray-600 leading-relaxed">{aboutVision}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="relative bg-white rounded-2xl p-8 md:p-10 shadow-md border-t-4 border-amber-600 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="bg-amber-50 p-4 rounded-xl inline-block mb-6">
                  <Target className="h-7 w-7 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 font-serif mb-4">Our Mission</h3>
                <p className="text-gray-600 leading-relaxed">{aboutMission}</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── CORE VALUES ───────────────────────── */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <span className="text-amber-600 text-xs font-semibold uppercase tracking-widest block mb-3">Our Principles</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 font-serif">Why Clients Trust Estilo</h2>
              <div className="w-16 h-1 bg-amber-500 mx-auto mt-4 rounded-full" />
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {VALUES.map((val, i) => (
                <motion.div
                  key={val.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group text-center p-7 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-amber-50 hover:border-amber-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm group-hover:bg-amber-500 group-hover:border-amber-500 transition-colors">
                    <div className="group-hover:[&_svg]:text-white transition-colors">{val.icon}</div>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">{val.title}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">{val.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────── */}
        <section className="py-16 bg-gray-50 border-t border-gray-100">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-serif mb-4">
                Ready to Work With Us?
              </h2>
              <p className="text-gray-500 max-w-lg mx-auto mb-8">
                Let's create something extraordinary together. Schedule your consultation today.
              </p>
              <a href="/booking">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-10 py-4 rounded-full font-semibold shadow-lg shadow-amber-500/20 transition-colors cursor-pointer"
                >
                  Book a Consultation <ArrowRight className="h-4 w-4" />
                </motion.div>
              </a>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}
