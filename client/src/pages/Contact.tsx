import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import ContactForm from "@/components/ContactForm";
import { MapPin, Phone, Mail, MessageSquare, Clock, Instagram, Facebook, ArrowRight, Sparkles, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import SEOMetaTags from "@/components/SEOMetaTags";

const contactBgImage = "https://images.unsplash.com/photo-1618219944342-824e40a13285?q=80&w=2070&auto=format&fit=crop";

/* ── Floating particles ─────────────────────────── */
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  size: Math.random() * 6 + 2,
  x: Math.random() * 100,
  y: Math.random() * 100,
  duration: Math.random() * 8 + 6,
  delay: Math.random() * 4,
}));

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-amber-400/20"
          style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
          animate={{ y: [-20, 20, -20], x: [-10, 10, -10], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ── Contact Info Card ──────────────────────────── */
interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  delay?: number;
}

function InfoCard({ icon, title, children, delay = 0 }: InfoCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="group flex items-start gap-4 p-5 rounded-2xl hover:bg-white/5 transition-colors duration-300"
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-600/10 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div>
        <p className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-1">{title}</p>
        <div className="text-white/80 text-sm leading-relaxed">{children}</div>
      </div>
    </motion.div>
  );
}

/* ── Social Pill ────────────────────────────────── */
interface SocialPillProps {
  name: string;
  url: string;
  icon: React.ReactNode;
  delay?: number;
}
function SocialPill({ name, url, icon, delay = 0 }: SocialPillProps) {
  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Visit our ${name} page`}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.1, y: -3 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/40 text-white/70 hover:text-amber-300 text-sm font-medium transition-all duration-300 backdrop-blur-sm"
    >
      {icon}
      {name}
    </motion.a>
  );
}

export default function Contact() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [formSent, setFormSent] = useState(false);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });

  const instagramUrl = settings?.contact_instagram || "https://www.instagram.com/estilo.bangalore/";
  const facebookUrl = settings?.contact_facebook || "https://www.facebook.com/estilo.banlgalore/";
  const pinterestUrl = settings?.contact_pinterest || "https://pinterest.com";
  const whatsappNumber = settings?.contact_whatsapp || "+919880652548";
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`;
  const address = settings?.contact_address || "CD 89, Biderahall Hobli, Byrathi, Kothnur Post Bangalore - 560077";
  const phone = settings?.contact_phone || "+91 9880652548";
  const email = settings?.contact_email || "info@estilointerior.com";

  const socialLinks: SocialPillProps[] = [
    { name: "Instagram", url: instagramUrl, icon: <Instagram className="h-4 w-4" /> },
    { name: "Facebook", url: facebookUrl, icon: <Facebook className="h-4 w-4" /> },
    {
      name: "Pinterest", url: pinterestUrl,
      icon: (
        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.965 1.406-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.162 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.621 0 11.988-5.367 11.988-11.987C24 5.367 18.633 0 12.017 0z" />
        </svg>
      )
    },
    { name: "WhatsApp", url: whatsappUrl, icon: <MessageSquare className="h-4 w-4" /> },
  ];

  return (
    <>
      <SEOMetaTags
        title="Contact Us – Estilo Interior Design Bangalore"
        description="Get in touch with Estilo Interior Design Studio. Visit us, call, or email to start your interior design journey in Bangalore."
      />

      <div className="relative overflow-hidden bg-[#0d0d0f]">

        {/* ── HERO PARALLAX ───────────────────────── */}
        <section ref={heroRef} className="relative h-[100svh] flex items-center justify-center overflow-hidden">

          {/* Parallax Background */}
          <motion.div
            className="absolute inset-0 bg-cover bg-center will-change-transform"
            style={{ backgroundImage: `url(${contactBgImage})`, y: bgY }}
          />

          {/* Layered overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0d0d0f]" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: `radial-gradient(ellipse 80% 80% at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(245,158,11,0.15) 0%, transparent 70%)`,
              transition: "background 0.3s ease",
            }}
          />

          <FloatingParticles />

          {/* Hero Content */}
          <motion.div
            style={{ y: contentY, opacity }}
            className="container relative z-10 mx-auto px-4 text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="inline-flex items-center gap-2 bg-amber-500/15 backdrop-blur-md text-amber-300 px-5 py-2 rounded-full text-xs font-semibold mb-8 border border-amber-500/25 tracking-widest uppercase"
              >
                <Sparkles className="h-3.5 w-3.5" />
                We'd Love to Hear From You
              </motion.span>

              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-[0.95] tracking-tight font-serif">
                <motion.span
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="block"
                >
                  Get in
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.65 }}
                  className="block text-amber-400"
                >
                  Touch
                </motion.span>
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="text-lg md:text-xl text-white/70 max-w-xl mx-auto leading-relaxed mb-10"
              >
                Transform your space with Bangalore's premier interior design studio. Let's begin your journey.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="flex flex-wrap items-center justify-center gap-4"
              >
                <a href={`tel:${phone.replace(/\s+/g, "")}`}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-7 py-3.5 rounded-full font-semibold shadow-lg shadow-amber-500/25 transition-colors cursor-pointer"
                  >
                    <Phone className="h-4 w-4" /> Call Now
                  </motion.div>
                </a>
                <a href="#contact-form">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-7 py-3.5 rounded-full font-semibold backdrop-blur-sm transition-colors cursor-pointer"
                  >
                    Send Message <ArrowRight className="h-4 w-4" />
                  </motion.div>
                </a>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
          >
            <span className="text-white/40 text-xs tracking-widest uppercase">Scroll</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-0.5 h-8 bg-gradient-to-b from-amber-500/60 to-transparent rounded-full"
            />
          </motion.div>
        </section>

        {/* ── MAIN CONTENT ──────────────────────── */}
        <section id="contact-form" className="relative py-24 lg:py-32">

          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-16 items-start">

              {/* ── LEFT: Info Panel ──────────────── */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="lg:col-span-2"
              >
                {/* Glassmorphism card */}
                <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl p-8 lg:p-10">
                  {/* Gradient accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />
                  <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

                  <div className="mb-8">
                    <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest block mb-3">Contact Information</span>
                    <h2 className="text-2xl lg:text-3xl font-bold text-white font-serif leading-snug">
                      Let's Start a Conversation
                    </h2>
                    <p className="text-white/50 text-sm mt-3 leading-relaxed">
                      Reach out and our design team will respond within 24 hours to discuss your project.
                    </p>
                  </div>

                  <div className="space-y-1 mb-8">
                    <InfoCard icon={<MapPin className="h-5 w-5 text-amber-400" />} title="Studio Address" delay={0.1}>
                      {address}
                    </InfoCard>
                    <InfoCard icon={<Phone className="h-5 w-5 text-amber-400" />} title="Phone" delay={0.2}>
                      <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:text-amber-400 transition-colors">
                        {phone}
                      </a>
                    </InfoCard>
                    <InfoCard icon={<Mail className="h-5 w-5 text-amber-400" />} title="Email" delay={0.3}>
                      <a href={`mailto:${email}`} className="hover:text-amber-400 transition-colors break-all">
                        {email}
                      </a>
                    </InfoCard>
                    <InfoCard icon={<Clock className="h-5 w-5 text-amber-400" />} title="Business Hours" delay={0.4}>
                      Mon – Fri: 9 AM – 6 PM<br />
                      Sat: 10 AM – 4 PM
                    </InfoCard>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-white/10 mb-6" />

                  <div>
                    <p className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-4">Follow Our Journey</p>
                    <div className="flex flex-wrap gap-2">
                      {socialLinks.map((s, i) => (
                        <SocialPill key={s.name} {...s} delay={0.1 * i} />
                      ))}
                    </div>
                  </div>

                  {/* Rating badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4"
                  >
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">4.9 / 5 Rating</p>
                      <p className="text-white/40 text-xs">Based on 120+ client reviews</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* ── RIGHT: Contact Form ───────────── */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="lg:col-span-3"
              >
                <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl p-8 lg:p-12">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-300" />
                  <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

                  <div className="mb-8">
                    <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest block mb-3">Send Us a Message</span>
                    <h2 className="text-2xl lg:text-3xl font-bold text-white font-serif">
                      Tell Us About Your Project
                    </h2>
                    <p className="text-white/50 text-sm mt-2">
                      Fill in the form below and our design consultant will reach out to you shortly.
                    </p>
                  </div>

                  <AnimatePresence mode="wait">
                    {formSent ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="py-20 text-center"
                      >
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                          <svg className="h-10 w-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Message Sent!</h3>
                        <p className="text-white/60">We'll get back to you within 24 hours.</p>
                      </motion.div>
                    ) : (
                      <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {/* Custom styled form wrapper */}
                        <div className="contact-form-dark">
                          <ContactForm onSuccess={() => setFormSent(true)} />
                        </div>
                        <p className="text-white/30 text-xs mt-6 text-center">
                          By submitting, you agree to our{" "}
                          <a href="/privacy" className="underline hover:text-amber-400 transition-colors">Privacy Policy</a>
                          {" "}and{" "}
                          <a href="/terms" className="underline hover:text-amber-400 transition-colors">Terms of Service</a>.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── MAP SECTION ──────────────────────── */}
        <section className="relative py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-center mb-12"
            >
              <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest block mb-3">Visit Us</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-white font-serif">Find Our Studio</h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
              style={{ height: "420px" }}
            >
              {/* Map top gradient mask */}
              <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#0d0d0f] to-transparent z-10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#0d0d0f] to-transparent z-10 pointer-events-none" />
              <iframe
                title="Estilo Interior Studio Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.9288192398847!2d77.64023267618813!3d13.066021587281595!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDAzJzU3LjciTiA3N8KwMzgnMzIuOCJF!5e0!3m2!1sen!2sin!4v1621429013412!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) saturate(0.4)" }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>
          </div>
        </section>

        {/* ── BOTTOM CTA STRIP ─────────────────── */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 via-amber-500/10 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.08)_0%,transparent_70%)]" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white font-serif mb-4">
                Ready to Transform Your Space?
              </h2>
              <p className="text-white/60 max-w-xl mx-auto mb-8">
                Book a free initial consultation and let our expert designers bring your vision to life.
              </p>
              <a href="/booking">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-10 py-4 rounded-full font-semibold shadow-xl shadow-amber-500/20 transition-colors cursor-pointer text-lg"
                >
                  Book a Consultation <ArrowRight className="h-5 w-5" />
                </motion.div>
              </a>
            </motion.div>
          </div>
        </section>
      </div>

      {/* Dark-theme form override styles */}
      <style>{`
        .contact-form-dark input,
        .contact-form-dark textarea,
        .contact-form-dark select {
          background-color: rgba(255,255,255,0.05) !important;
          border-color: rgba(255,255,255,0.1) !important;
          color: white !important;
        }
        .contact-form-dark input::placeholder,
        .contact-form-dark textarea::placeholder {
          color: rgba(255,255,255,0.3) !important;
        }
        .contact-form-dark input:focus,
        .contact-form-dark textarea:focus {
          border-color: rgba(245,158,11,0.5) !important;
          box-shadow: 0 0 0 2px rgba(245,158,11,0.1) !important;
        }
        .contact-form-dark label {
          color: rgba(255,255,255,0.7) !important;
        }
        .contact-form-dark button[type="submit"] {
          background: linear-gradient(135deg, #f59e0b, #d97706) !important;
          color: white !important;
          border: none !important;
          border-radius: 9999px !important;
          font-weight: 600 !important;
          letter-spacing: 0.02em;
          box-shadow: 0 8px 24px rgba(245,158,11,0.3) !important;
        }
        .contact-form-dark button[type="submit"]:hover {
          opacity: 0.9;
          transform: scale(1.02);
        }
      `}</style>
    </>
  );
}
