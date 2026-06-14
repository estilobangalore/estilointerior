import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import ContactForm from "@/components/ContactForm";
import { MapPin, Phone, Mail, MessageSquare, Clock, Instagram, Facebook, ArrowRight, Sparkles, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import SEOMetaTags from "@/components/SEOMetaTags";

const contactBgImage = "https://images.unsplash.com/photo-1618219944342-824e40a13285?q=80&w=2070&auto=format&fit=crop";

/* ── Info Card (light) ───────────────────────────── */
function InfoCard({ icon, title, children, delay = 0 }: { icon: React.ReactNode; title: string; children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-amber-50 transition-colors duration-300"
    >
      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center group-hover:bg-amber-500 group-hover:border-amber-500 transition-colors duration-300">
        <div className="group-hover:[&_svg]:text-white transition-colors">{icon}</div>
      </div>
      <div>
        <p className="text-amber-600 text-xs font-semibold uppercase tracking-widest mb-0.5">{title}</p>
        <div className="text-gray-600 text-sm leading-relaxed">{children}</div>
      </div>
    </motion.div>
  );
}

/* ── Social Pill ──────────────────────────────────── */
function SocialPill({ name, url, icon, delay = 0 }: { name: string; url: string; icon: React.ReactNode; delay?: number }) {
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
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 hover:bg-amber-50 border border-gray-200 hover:border-amber-300 text-gray-600 hover:text-amber-700 text-sm font-medium transition-all duration-300"
    >
      {icon} {name}
    </motion.a>
  );
}

export default function Contact() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const [formSent, setFormSent] = useState(false);

  const { data: settings } = useQuery<Record<string, string>>({ queryKey: ["/api/settings"] });

  const instagramUrl = settings?.contact_instagram || "https://www.instagram.com/estilo.bangalore/";
  const facebookUrl = settings?.contact_facebook || "https://www.facebook.com/estilo.banlgalore/";
  const pinterestUrl = settings?.contact_pinterest || "https://pinterest.com";
  const whatsappNumber = settings?.contact_whatsapp || "+919880652548";
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`;
  const address = settings?.contact_address || "CD 89, Biderahall Hobli, Byrathi, Kothnur Post Bangalore - 560077";
  const phone = settings?.contact_phone || "+91 9880652548";
  const email = settings?.contact_email || "info@estilointerior.com";

  const socialLinks = [
    { name: "Instagram", url: instagramUrl, icon: <Instagram className="h-4 w-4" /> },
    { name: "Facebook", url: facebookUrl, icon: <Facebook className="h-4 w-4" /> },
    {
      name: "Pinterest", url: pinterestUrl,
      icon: <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.965 1.406-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.162 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.621 0 11.988-5.367 11.988-11.987C24 5.367 18.633 0 12.017 0z" /></svg>
    },
    { name: "WhatsApp", url: whatsappUrl, icon: <MessageSquare className="h-4 w-4" /> },
  ];

  return (
    <>
      <SEOMetaTags
        title="Contact Us – Estilo Interior Design Bangalore"
        description="Get in touch with Estilo Interior Design Studio. Visit us, call, or email to start your interior design journey in Bangalore."
      />

      <div className="relative overflow-hidden bg-white">

        {/* ── HERO with parallax ─────────────────── */}
        <section ref={heroRef} className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-cover bg-center will-change-transform"
            style={{ backgroundImage: `url(${contactBgImage})`, y: bgY }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/70" />

          <motion.div style={{ y: contentY, opacity }} className="container relative z-10 mx-auto px-4 text-center">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-amber-500/20 backdrop-blur-md text-amber-300 px-5 py-2 rounded-full text-xs font-semibold mb-8 border border-amber-500/30 tracking-widest uppercase"
            >
              <Sparkles className="h-3.5 w-3.5" />
              We'd Love to Hear From You
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-4 font-serif"
            >
              Get in <span className="text-amber-400">Touch</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-lg md:text-xl text-white/80 max-w-xl mx-auto mb-8"
            >
              Transform your space with Bangalore's premier interior design studio.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <a href={`tel:${phone.replace(/\s+/g, "")}`}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-7 py-3 rounded-full font-semibold shadow-lg shadow-amber-500/25 transition-colors cursor-pointer">
                  <Phone className="h-4 w-4" /> Call Now
                </motion.div>
              </a>
              <a href="#contact-form">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white border border-white/30 px-7 py-3 rounded-full font-semibold backdrop-blur-sm transition-colors cursor-pointer">
                  Send Message <ArrowRight className="h-4 w-4" />
                </motion.div>
              </a>
            </motion.div>
          </motion.div>
        </section>

        {/* ── MAIN CONTENT ──────────────────────── */}
        <section id="contact-form" className="py-20 lg:py-28 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">

              {/* ── LEFT: Info Panel ──────────────── */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="lg:col-span-2"
              >
                <div className="relative bg-white rounded-3xl border border-gray-100 shadow-lg p-8 lg:p-10 overflow-hidden">
                  {/* Top accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />
                  <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-amber-50 pointer-events-none" />

                  <div className="mb-8">
                    <span className="text-amber-600 text-xs font-semibold uppercase tracking-widest block mb-3">Contact Information</span>
                    <h2 className="text-2xl font-bold text-gray-900 font-serif">Let's Start a Conversation</h2>
                    <p className="text-gray-500 text-sm mt-3 leading-relaxed">
                      Reach out and our design team will respond within 24 hours to discuss your project.
                    </p>
                  </div>

                  <div className="space-y-1 mb-8">
                    <InfoCard icon={<MapPin className="h-5 w-5 text-amber-500" />} title="Studio Address" delay={0.1}>{address}</InfoCard>
                    <InfoCard icon={<Phone className="h-5 w-5 text-amber-500" />} title="Phone" delay={0.2}>
                      <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:text-amber-600 transition-colors">{phone}</a>
                    </InfoCard>
                    <InfoCard icon={<Mail className="h-5 w-5 text-amber-500" />} title="Email" delay={0.3}>
                      <a href={`mailto:${email}`} className="hover:text-amber-600 transition-colors break-all">{email}</a>
                    </InfoCard>
                    <InfoCard icon={<Clock className="h-5 w-5 text-amber-500" />} title="Business Hours" delay={0.4}>
                      Mon – Fri: 9 AM – 6 PM<br />Sat: 10 AM – 4 PM
                    </InfoCard>
                  </div>

                  <div className="h-px bg-gray-100 mb-6" />

                  <div>
                    <p className="text-amber-600 text-xs font-semibold uppercase tracking-widest mb-4">Follow Our Journey</p>
                    <div className="flex flex-wrap gap-2">
                      {socialLinks.map((s, i) => <SocialPill key={s.name} {...s} delay={0.1 * i} />)}
                    </div>
                  </div>

                  {/* Rating badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4"
                  >
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                    </div>
                    <div>
                      <p className="text-gray-900 text-sm font-semibold">4.9 / 5 Rating</p>
                      <p className="text-gray-400 text-xs">Based on 120+ client reviews</p>
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
                <div className="relative bg-white rounded-3xl border border-gray-100 shadow-lg p-8 lg:p-12 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-300" />

                  <div className="mb-8">
                    <span className="text-amber-600 text-xs font-semibold uppercase tracking-widest block mb-3">Send Us a Message</span>
                    <h2 className="text-2xl font-bold text-gray-900 font-serif">Tell Us About Your Project</h2>
                    <p className="text-gray-500 text-sm mt-2">Fill in the form below and our consultant will reach out shortly.</p>
                  </div>

                  <AnimatePresence mode="wait">
                    {formSent ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-20 text-center"
                      >
                        <div className="w-20 h-20 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
                          <svg className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3 font-serif">Message Sent!</h3>
                        <p className="text-gray-500">We'll get back to you within 24 hours.</p>
                      </motion.div>
                    ) : (
                      <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <ContactForm onSuccess={() => setFormSent(true)} />
                        <p className="text-gray-400 text-xs mt-6 text-center">
                          By submitting, you agree to our{" "}
                          <a href="/privacy" className="underline hover:text-amber-600 transition-colors">Privacy Policy</a>
                          {" "}and{" "}
                          <a href="/terms" className="underline hover:text-amber-600 transition-colors">Terms of Service</a>.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── MAP ───────────────────────────────── */}
        <section className="py-16 lg:py-20 bg-white">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
              <span className="text-amber-600 text-xs font-semibold uppercase tracking-widest block mb-3">Visit Us</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 font-serif">Find Our Studio</h2>
              <div className="w-16 h-1 bg-amber-500 mx-auto mt-4 rounded-full" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="rounded-3xl overflow-hidden shadow-xl border border-gray-100"
              style={{ height: "420px" }}
            >
              <iframe
                title="Estilo Interior Studio Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.9288192398847!2d77.64023267618813!3d13.066021587281595!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDAzJzU3LjciTiA3N8KwMzgnMzIuOCJF!5e0!3m2!1sen!2sin!4v1621429013412!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>
          </div>
        </section>

        {/* ── BOTTOM CTA ────────────────────────── */}
        <section className="py-20 bg-gray-900">
          <div className="container mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <h2 className="text-3xl md:text-4xl font-bold text-white font-serif mb-4">
                Ready to Transform Your Space?
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto mb-8">
                Book a free initial consultation and let our expert designers bring your vision to life.
              </p>
              <a href="/booking">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-10 py-4 rounded-full font-semibold shadow-xl shadow-amber-500/20 transition-colors cursor-pointer text-lg">
                  Book a Consultation <ArrowRight className="h-5 w-5" />
                </motion.div>
              </a>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}
