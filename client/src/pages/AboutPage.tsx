import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Compass, Target, ShieldCheck, Award, Clock, Users } from "lucide-react";
import SEOMetaTags from "@/components/SEOMetaTags";

const TEAM_IMAGES = [
  "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=800",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800",
];

const VALUES = [
  {
    icon: <ShieldCheck className="h-8 w-8 text-amber-500" />,
    title: "Unmatched Quality",
    desc: "Premium materials sourced from authentic, certified suppliers.",
  },
  {
    icon: <Award className="h-8 w-8 text-amber-500" />,
    title: "Bespoke Designs",
    desc: "Every design custom-crafted to reflect your unique personality and lifestyle.",
  },
  {
    icon: <Clock className="h-8 w-8 text-amber-500" />,
    title: "On-Time Delivery",
    desc: "We respect your schedule. Projects delivered on-time, every time.",
  },
  {
    icon: <Users className="h-8 w-8 text-amber-500" />,
    title: "Seamless Execution",
    desc: "Turnkey solutions with dedicated project management from start to finish.",
  },
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

  const aboutImage =
    settings?.about_image_url ||
    "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=2000";
  const aboutContent =
    settings?.about_content ||
    "Luxury residential and commercial interior design studio based in Bangalore. We create beautiful, functional spaces customized to your lifestyle.";
  const aboutVision =
    settings?.about_vision ||
    "To be the leading luxury interior design firm known for timeless elegance and bespoke spaces.";
  const aboutMission =
    settings?.about_mission ||
    "To transform our clients' visions into custom realities through exceptional design, premium craftsmanship, and seamless execution.";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0f]">
        <div className="w-12 h-12 rounded-full border-2 border-t-amber-500 border-white/10 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <SEOMetaTags
        title="About Us – Estilo Interior Design Studio Bangalore"
        description="Learn more about Estilo Interior, our luxury design philosophy, and our mission to craft bespoke spaces in Bangalore."
      />

      <div className="relative overflow-hidden bg-[#0d0d0f]">

        {/* ── HERO ────────────────────────────────── */}
        <section ref={heroRef} className="relative h-[80svh] flex items-center justify-center overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-cover bg-center will-change-transform"
            style={{ backgroundImage: `url(${aboutImage})`, y: bgY }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-[#0d0d0f]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />

          <motion.div
            style={{ y: contentY, opacity }}
            className="container relative z-10 mx-auto px-4"
          >
            <div className="max-w-3xl">
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="inline-block bg-amber-500/15 backdrop-blur-md text-amber-300 px-5 py-2 rounded-full text-xs font-semibold mb-8 border border-amber-500/25 tracking-widest uppercase"
              >
                Crafting Dreams Since 2015
              </motion.span>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-5 font-serif leading-[0.95]">
                <motion.span
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.45 }}
                  className="block"
                >
                  Our
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="block text-amber-400"
                >
                  Story
                </motion.span>
              </h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.75 }}
                className="text-lg md:text-xl text-white/65 max-w-lg leading-relaxed"
              >
                A passion for beautiful, functional spaces has guided every project we've undertaken since day one.
              </motion.p>
            </div>
          </motion.div>
        </section>

        {/* ── ABOUT CONTENT ────────────────────────── */}
        <section className="py-24 lg:py-32">
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
                <span className="inline-block bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full">
                  Established Excellence
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white font-serif leading-tight">
                  A Passion For Designing Extraordinary Spaces
                </h2>
                <div className="w-12 h-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" />
                <p className="text-white/60 leading-relaxed text-lg whitespace-pre-line">
                  {aboutContent}
                </p>

                {/* Quick stats row */}
                <div className="grid grid-cols-3 gap-4 pt-4">
                  {[
                    { num: "8+", label: "Years" },
                    { num: "250+", label: "Projects" },
                    { num: "98%", label: "Satisfaction" },
                  ].map((s) => (
                    <div key={s.label} className="text-center p-4 rounded-2xl bg-white/5 border border-white/8">
                      <p className="text-2xl font-bold text-amber-400 mb-1">{s.num}</p>
                      <p className="text-white/50 text-sm">{s.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Right: Image Stack */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.15 }}
                className="relative"
              >
                {/* Main image */}
                <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl aspect-[4/3]">
                  <img src={aboutImage} alt="Estilo interior design studio" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                {/* Floating badge */}
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
                {/* Decorative element */}
                <div className="absolute -top-4 -right-4 w-24 h-24 rounded-2xl bg-amber-500/10 border border-amber-500/20 -z-10" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── VISION & MISSION ─────────────────────── */}
        <section className="py-20 lg:py-24 border-t border-white/5">
          <div className="container mx-auto px-4 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest block mb-3">Our Direction</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-white font-serif">Vision & Mission</h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vision */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative rounded-2xl overflow-hidden bg-white/5 border border-white/8 p-8 md:p-10 hover:bg-white/8 hover:border-amber-500/20 transition-all duration-300"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600" />
                <div className="bg-amber-500/10 border border-amber-500/15 p-4 rounded-xl inline-block mb-6">
                  <Compass className="h-7 w-7 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-white font-serif mb-4">Our Vision</h3>
                <p className="text-white/60 leading-relaxed">{aboutVision}</p>
              </motion.div>

              {/* Mission */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="relative rounded-2xl overflow-hidden bg-white/5 border border-white/8 p-8 md:p-10 hover:bg-white/8 hover:border-amber-500/20 transition-all duration-300"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-300" />
                <div className="bg-amber-500/10 border border-amber-500/15 p-4 rounded-xl inline-block mb-6">
                  <Target className="h-7 w-7 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-white font-serif mb-4">Our Mission</h3>
                <p className="text-white/60 leading-relaxed">{aboutMission}</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── CORE VALUES ──────────────────────────── */}
        <section className="py-20 lg:py-24 border-t border-white/5">
          <div className="container mx-auto px-4 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest block mb-3">Our Principles</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-white font-serif">Why Clients Trust Estilo</h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {VALUES.map((val, i) => (
                <motion.div
                  key={val.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group text-center p-7 rounded-2xl bg-white/5 border border-white/8 hover:bg-white/8 hover:border-amber-500/20 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center group-hover:bg-amber-500/15 transition-colors">
                    {val.icon}
                  </div>
                  <h4 className="font-bold text-white mb-2">{val.title}</h4>
                  <p className="text-white/50 text-sm leading-relaxed">{val.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────── */}
        <section className="py-20 border-t border-white/5">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white font-serif mb-4">
                Ready to Work With Us?
              </h2>
              <p className="text-white/50 max-w-lg mx-auto mb-8">
                Let's create something extraordinary together. Schedule your consultation today.
              </p>
              <a href="/booking">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-10 py-4 rounded-full font-semibold shadow-xl shadow-amber-500/20 transition-colors cursor-pointer"
                >
                  Book a Consultation →
                </motion.div>
              </a>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}
