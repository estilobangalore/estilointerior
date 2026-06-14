import { useState, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { API_PATHS } from "@/lib/config";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  CalendarIcon, Clock, Home, Phone, Mail, Calendar as CalendarIcon2,
  ArrowRight, MessageSquare, Briefcase, CheckCircle, Sparkles, Star,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import SEOMetaTags from "@/components/SEOMetaTags";

/* ── Validation ─────────────────────────────────────── */
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").max(100),
  phone: z.string().min(10, "Please enter a valid phone number").max(20).regex(/^[0-9+\-\s()]*$/, "Please enter a valid phone number"),
  date: z.date({ required_error: "Please select a date" }).refine((d) => d >= new Date(), { message: "Date must be in the future" }),
  projectType: z.string().min(1, "Please select a project type"),
  requirements: z.string().min(10, "Please provide more details about your project").max(1000),
  address: z.string().min(5, "Please enter your address").max(200).optional(),
  budget: z.number().min(0).default(500000),
  preferredContactTime: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const projectTypes = [
  { value: "Residential Interior", label: "🏠 Residential Interior" },
  { value: "Commercial Space", label: "🏢 Commercial Space" },
  { value: "Kitchen Remodeling", label: "🍳 Kitchen Remodeling" },
  { value: "Bathroom Renovation", label: "🚿 Bathroom Renovation" },
  { value: "Office Design", label: "💼 Office Design" },
  { value: "Color Consultation", label: "🎨 Color Consultation" },
];

const contactTimes = [
  { value: "Morning (9 AM - 12 PM)", label: "🌅 Morning (9 AM – 12 PM)" },
  { value: "Afternoon (12 PM - 5 PM)", label: "☀️ Afternoon (12 PM – 5 PM)" },
  { value: "Evening (5 PM - 8 PM)", label: "🌇 Evening (5 PM – 8 PM)" },
];

const PROCESS_STEPS = [
  { icon: <CalendarIcon2 className="h-7 w-7 text-amber-500" />, num: "01", title: "Book", desc: "Schedule at your convenience" },
  { icon: <MessageSquare className="h-7 w-7 text-amber-500" />, num: "02", title: "Consult", desc: "Share your vision with our designers" },
  { icon: <Briefcase className="h-7 w-7 text-amber-500" />, num: "03", title: "Plan", desc: "Get a customised design blueprint" },
  { icon: <Home className="h-7 w-7 text-amber-500" />, num: "04", title: "Transform", desc: "Watch your space come alive" },
];

export default function Booking() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.9], [1, 0]);

  const bookingBgImage = "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", phone: "", projectType: "", requirements: "", address: "", budget: 500000, preferredContactTime: "" },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const formattedData = {
        ...data,
        date: data.date.toISOString(),
        address: data.address || undefined,
        budget: `₹${data.budget.toLocaleString("en-IN")}`,
        preferredContactTime: data.preferredContactTime || undefined,
      };
      return await apiRequest("POST", API_PATHS.CONSULTATIONS, formattedData);
    },
    onSuccess: () => {
      toast({ title: "Booking Confirmed! 🎉", description: "Our design team will contact you within 24 hours to confirm your consultation." });
      form.reset();
      setSubmitted(true);
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Submission Failed", description: error.message || "Failed to submit. Please try again." });
    },
  });

  return (
    <>
      <SEOMetaTags
        title="Book a Design Consultation – Estilo Interior Bangalore"
        description="Schedule your free interior design consultation with Estilo Interior. Expert designers ready to transform your home or office in Bangalore."
      />

      <div className="relative overflow-hidden bg-white">

        {/* ── HERO with parallax ─────────────────── */}
        <section ref={heroRef} className="relative h-[65vh] flex items-center justify-center overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-cover bg-center will-change-transform"
            style={{ backgroundImage: `url(${bookingBgImage})`, y: bgY }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/70" />

          <motion.div style={{ y: contentY, opacity }} className="container relative z-10 mx-auto px-4 text-center">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-amber-500/20 backdrop-blur-md text-amber-300 px-5 py-2 rounded-full text-xs font-semibold mb-8 border border-amber-500/30 tracking-widest uppercase"
            >
              <CalendarIcon2 className="h-3.5 w-3.5" />
              Free Initial Consultation
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-5 font-serif"
            >
              Book Your <span className="text-amber-400">Design Journey</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-lg md:text-xl text-white/80 max-w-xl mx-auto mb-8"
            >
              Take the first step towards transforming your space. Our expert designers are ready to bring your vision to life.
            </motion.p>
            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-wrap items-center justify-center gap-3"
            >
              {[
                { icon: <Star className="h-4 w-4 fill-amber-400 text-amber-400" />, text: "4.9★ Rated Studio" },
                { icon: <CheckCircle className="h-4 w-4 text-green-400" />, text: "250+ Happy Clients" },
                { icon: <Sparkles className="h-4 w-4 text-amber-400" />, text: "Turnkey Solutions" },
              ].map((b) => (
                <div key={b.text} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
                  {b.icon}
                  <span className="text-white/90 text-sm font-medium">{b.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────── */}
        <section className="py-20 bg-gray-50 border-b border-gray-100">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
              <span className="text-amber-600 text-xs font-semibold uppercase tracking-widest block mb-3">Our Process</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 font-serif">How It Works</h2>
              <div className="w-16 h-1 bg-amber-500 mx-auto mt-4 rounded-full" />
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {PROCESS_STEPS.map((step, i) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.12 }}
                  className="relative group"
                >
                  {i < PROCESS_STEPS.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-[calc(100%-12px)] w-full h-px bg-gradient-to-r from-amber-300 to-transparent z-0" />
                  )}
                  <div className="relative z-10 flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-300 group-hover:-translate-y-1">
                    <div className="relative mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center group-hover:bg-amber-500 group-hover:border-amber-500 transition-colors">
                        <div className="group-hover:[&_svg]:text-white transition-colors">{step.icon}</div>
                      </div>
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shadow-md">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="text-gray-900 font-bold text-lg mb-1">{step.title}</h3>
                    <p className="text-gray-500 text-sm leading-snug">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIAL ──────────────────────── */}
        <section className="py-12 bg-white border-b border-gray-100">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row items-center gap-6 bg-amber-50 border border-amber-100 rounded-3xl p-6 md:p-8 max-w-4xl mx-auto"
            >
              <img
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200"
                alt="Satisfied client Dipika Singh"
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-gray-700 italic leading-relaxed mb-3 text-sm md:text-base">
                  "Working with Estilo Interior was an absolute pleasure. From the initial consultation to the final reveal, their team was professional, creative, and attentive to every detail."
                </p>
                <div>
                  <span className="text-gray-900 font-semibold text-sm">Dipika Singh</span>
                  <span className="text-gray-400 text-xs ml-2">Residential Client, Bangalore</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── BOOKING FORM ──────────────────────── */}
        <section className="py-20 lg:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <span className="text-amber-600 text-xs font-semibold uppercase tracking-widest block mb-3">Schedule Now</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 font-serif mb-3">Book Your Consultation</h2>
              <p className="text-gray-500 max-w-xl mx-auto">Fill in the form and our team will confirm your appointment within 24 hours.</p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-24 bg-white rounded-3xl shadow-lg border border-gray-100"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                      className="w-24 h-24 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mx-auto mb-8"
                    >
                      <CheckCircle className="h-12 w-12 text-green-500" />
                    </motion.div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4 font-serif">Booking Received! 🎉</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-8">Our design team will contact you within 24 hours to confirm your slot.</p>
                    <div className="flex flex-wrap justify-center gap-4">
                      <Link href="/"><Button variant="outline" className="rounded-full border-gray-200">Back to Home</Button></Link>
                      <Link href="/portfolio"><Button className="rounded-full bg-amber-500 hover:bg-amber-600 text-white">View Our Work <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Card className="shadow-xl border border-gray-100 overflow-hidden bg-white rounded-3xl">
                      {/* Top accent stripe */}
                      <div className="h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />
                      <CardContent className="p-8 md:p-12">
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-8">

                            {/* Section 1 */}
                            <div>
                              <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-5 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">1</span>
                                Personal Information
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <FormField control={form.control} name="name" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-700 text-sm font-medium">Full Name</FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Input placeholder="Your full name" className="pl-10 h-11 border-gray-200 focus:border-amber-400 rounded-xl" {...field} />
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Mail className="h-4 w-4" /></span>
                                      </div>
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                  </FormItem>
                                )} />
                                <FormField control={form.control} name="email" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-700 text-sm font-medium">Email Address</FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Input type="email" placeholder="your@email.com" className="pl-10 h-11 border-gray-200 focus:border-amber-400 rounded-xl" {...field} />
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Mail className="h-4 w-4" /></span>
                                      </div>
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                  </FormItem>
                                )} />
                                <FormField control={form.control} name="phone" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-700 text-sm font-medium">Phone Number</FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Input placeholder="+91 98806 52548" className="pl-10 h-11 border-gray-200 focus:border-amber-400 rounded-xl" {...field} />
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Phone className="h-4 w-4" /></span>
                                      </div>
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                  </FormItem>
                                )} />
                                <FormField control={form.control} name="date" render={({ field }) => (
                                  <FormItem className="flex flex-col">
                                    <FormLabel className="text-gray-700 text-sm font-medium">Preferred Date</FormLabel>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <FormControl>
                                          <Button variant="outline" className={cn("h-11 text-left font-normal justify-start border-gray-200 rounded-xl", !field.value && "text-gray-400")}>
                                            <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                                            {field.value ? format(field.value, "PPP") : "Pick a date"}
                                          </Button>
                                        </FormControl>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                          mode="single"
                                          selected={field.value}
                                          onSelect={field.onChange}
                                          disabled={(date) => date < new Date() || date > new Date(new Date().setMonth(new Date().getMonth() + 2))}
                                          initialFocus
                                          classNames={{
                                            day_selected: "bg-amber-500 text-white hover:bg-amber-600",
                                            day_today: "bg-amber-100 text-amber-900 font-bold",
                                            day: "hover:bg-amber-50",
                                            head_cell: "text-amber-600 font-medium",
                                            caption: "text-gray-900 font-semibold",
                                          }}
                                        />
                                      </PopoverContent>
                                    </Popover>
                                    <FormMessage className="text-xs" />
                                  </FormItem>
                                )} />
                              </div>
                            </div>

                            <Separator />

                            {/* Section 2 */}
                            <div>
                              <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-5 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">2</span>
                                Project Details
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <FormField control={form.control} name="projectType" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-700 text-sm font-medium">Project Type</FormLabel>
                                    <FormControl>
                                      <select className="flex h-11 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 appearance-none" {...field}>
                                        <option value="">Select project type</option>
                                        {projectTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                      </select>
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                  </FormItem>
                                )} />
                                <FormField control={form.control} name="preferredContactTime" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-700 text-sm font-medium">Preferred Contact Time</FormLabel>
                                    <FormControl>
                                      <select className="flex h-11 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 appearance-none" {...field}>
                                        <option value="">Select time slot</option>
                                        {contactTimes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                      </select>
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                  </FormItem>
                                )} />
                                <FormField control={form.control} name="address" render={({ field }) => (
                                  <FormItem className="md:col-span-2">
                                    <FormLabel className="text-gray-700 text-sm font-medium">Project Address</FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Input placeholder="Enter your project / site address" className="pl-10 h-11 border-gray-200 focus:border-amber-400 rounded-xl" {...field} />
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Home className="h-4 w-4" /></span>
                                      </div>
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                  </FormItem>
                                )} />
                              </div>
                            </div>

                            <Separator />

                            {/* Section 3 */}
                            <div>
                              <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-5 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">3</span>
                                Budget & Requirements
                              </h3>
                              <FormField control={form.control} name="budget" render={({ field: { value, onChange, ...field } }) => (
                                <FormItem className="mb-6">
                                  <div className="flex items-center justify-between mb-3">
                                    <FormLabel className="text-gray-700 text-sm font-medium">Budget Range</FormLabel>
                                    <span className="text-2xl font-bold text-amber-600">₹{value.toLocaleString("en-IN")}</span>
                                  </div>
                                  <FormControl>
                                    <div className="px-1">
                                      <Slider min={50000} max={2000000} step={50000} defaultValue={[value]} onValueChange={(vals) => onChange(vals[0])} className="w-full" {...field} />
                                      <div className="flex justify-between text-xs mt-3">
                                        <span className="text-gray-400">₹50,000</span>
                                        <span className="text-amber-500">₹10,00,000</span>
                                        <span className="text-gray-400">₹20,00,000</span>
                                      </div>
                                    </div>
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )} />
                              <FormField control={form.control} name="requirements" render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-700 text-sm font-medium">Project Requirements</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="Describe your project requirements, style preferences, timeline, and any specific needs..." className="min-h-[130px] border-gray-200 focus:border-amber-400 rounded-xl resize-none p-4" {...field} />
                                  </FormControl>
                                  <div className="flex justify-between">
                                    <FormMessage className="text-xs" />
                                    <span className="text-gray-400 text-xs mt-1">{form.watch("requirements")?.length || 0}/1000</span>
                                  </div>
                                </FormItem>
                              )} />
                            </div>

                            {/* Submit */}
                            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                              <Button
                                type="submit"
                                className="w-full h-14 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-base shadow-lg shadow-amber-500/20 transition-all duration-300"
                                disabled={mutation.isPending}
                              >
                                {mutation.isPending ? (
                                  <div className="flex items-center gap-3">
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Submitting...
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">Book My Consultation <ArrowRight className="h-5 w-5" /></div>
                                )}
                              </Button>
                            </motion.div>
                            <p className="text-gray-400 text-xs text-center">
                              By booking, you agree to our <a href="/privacy" className="underline hover:text-amber-600 transition-colors">Privacy Policy</a>
                            </p>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <span className="text-amber-600 text-xs font-semibold uppercase tracking-widest block mb-3">Got Questions?</span>
              <h2 className="text-3xl font-bold text-gray-900 font-serif">Frequently Asked Questions</h2>
              <div className="w-16 h-1 bg-amber-500 mx-auto mt-4 rounded-full" />
            </motion.div>

            <div className="space-y-4">
              {[
                { q: "What happens during the consultation?", a: "Our designer will discuss your project in detail, understand your style preferences, take measurements if needed, and explore potential design directions." },
                { q: "How long does a consultation typically last?", a: "Initial consultations typically last 60–90 minutes, allowing enough time to discuss your project thoroughly." },
                { q: "Is there a fee for the initial consultation?", a: "Yes, there is a nominal consultation fee that will be credited toward your project if you decide to proceed with our services." },
                { q: "What should I prepare before the consultation?", a: "Gather inspiration images, create a Pinterest board, note specific requirements, and have a rough budget in mind. Existing floor plans or measurements can also be useful." },
              ].map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gray-50 border border-gray-100 rounded-2xl p-6 hover:bg-amber-50 hover:border-amber-100 transition-all duration-300"
                >
                  <h3 className="text-gray-900 font-semibold mb-2">{faq.q}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
                </motion.div>
              ))}
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mt-12">
              <p className="text-gray-500 mb-5">Still have questions?</p>
              <Link href="/contact">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                  <Button className="rounded-full bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 shadow-md shadow-amber-500/20">
                    Contact Us <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}
