import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { API_PATHS } from "@/lib/config";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  CalendarIcon, 
  Clock, 
  Home, 
  Phone, 
  Mail, 
  Calendar as CalendarIcon2, 
  FileText, 
  DollarSign, 
  Clock3,
  CheckCircle,
  ArrowRight,
  MessageSquare,
  Briefcase
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

const formSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string()
    .email("Invalid email address")
    .max(100, "Email must be less than 100 characters"),
  phone: z.string()
    .min(10, "Please enter a valid phone number")
    .max(20, "Phone number must be less than 20 characters")
    .regex(/^[0-9+\-\s()]*$/, "Please enter a valid phone number"),
  date: z.date({
    required_error: "Please select a date",
  }).refine((date) => date >= new Date(), {
    message: "Date must be in the future",
  }),
  projectType: z.string().min(1, "Please select a project type"),
  requirements: z.string()
    .min(10, "Please provide more details about your project")
    .max(1000, "Requirements must be less than 1000 characters"),
  address: z.string()
    .min(5, "Please enter your address")
    .max(200, "Address must be less than 200 characters")
    .optional(),
  budget: z.string()
    .min(1, "Please select your budget range")
    .optional(),
  preferredContactTime: z.string()
    .min(1, "Please select your preferred contact time")
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

const projectTypes = [
  "Residential Interior",
  "Commercial Space",
  "Kitchen Remodeling",
  "Bathroom Renovation",
  "Office Design",
  "Color Consultation",
];

const budgetRanges = [
  "Under $5,000",
  "$5,000 - $10,000",
  "$10,000 - $20,000",
  "$20,000 - $50,000",
  "Over $50,000"
];

const contactTimes = [
  "Morning (9 AM - 12 PM)",
  "Afternoon (12 PM - 5 PM)",
  "Evening (5 PM - 8 PM)"
];

export default function Booking() {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Background image URL - high quality modern interior design image
  const bookingBgImage = "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      projectType: "",
      requirements: "",
      address: "",
      budget: "",
      preferredContactTime: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      try {
        console.log('Submitting form data:', data);
        const formattedData = {
          ...data,
          date: data.date.toISOString(),
          address: data.address || undefined,
          budget: data.budget || undefined,
          preferredContactTime: data.preferredContactTime || undefined,
        };
        
        console.log('Formatted data:', formattedData);
        console.log('Sending to endpoint:', API_PATHS.CONSULTATIONS);
        
        // Use the consultations endpoint from config
        const response = await apiRequest("POST", API_PATHS.CONSULTATIONS, formattedData);
        console.log('Consultation form submission response:', response);
        return response;
      } catch (error: any) {
        console.error('Submission error:', error);
        
        // Provide more helpful error messages
        if (error.message && typeof error.message === 'string') {
          if (error.message.includes('Unable to connect to the server')) {
            throw new Error('Unable to connect to the server. Please check if the server is running.');
          } else if (error.message.includes('Failed to fetch')) {
            throw new Error('Network error. Please check your internet connection and try again.');
          } else if (error.status === 400) {
            throw new Error(error.message || 'Invalid form data. Please check your inputs and try again.');
          }
        }
        
        throw new Error(error.message || 'Failed to submit consultation request');
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your consultation request has been submitted. We'll contact you soon to confirm.",
      });
      form.reset();
    },
    onError: (error: any) => {
      console.error('Form submission error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit consultation request. Please try again.",
      });
    },
  });

  return (
    <div className="relative overflow-hidden">
      {/* Hero section with parallax effect */}
      <div className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{
            backgroundImage: `url(${bookingBgImage})`,
            transform: `translateY(${scrollY * 0.3}px)`,
            filter: 'brightness(0.7)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex bg-white/10 backdrop-blur-sm p-3 rounded-full mb-6">
              <CalendarIcon2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Book Your Design Consultation</h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto mb-6">
              Take the first step towards transforming your space. Our expert designers are ready to bring your vision to life.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Rest of the page content */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16 text-center"
            >
              <h2 className="text-3xl font-bold mb-4 text-gray-800">How It Works</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Schedule a consultation with our interior design experts to discuss your project, share your vision, and start the journey to your dream space.
              </p>
            </motion.div>
            
            {/* Process steps */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-center"
              >
                <div className="relative mb-6 mx-auto">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                    <CalendarIcon2 className="h-8 w-8 text-amber-600" />
                  </div>
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-amber-200 -z-10 transform -translate-x-4"></div>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">1. Book</h3>
                <p className="text-gray-600">Schedule a consultation at your convenience</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center"
              >
                <div className="relative mb-6 mx-auto">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                    <MessageSquare className="h-8 w-8 text-amber-600" />
                  </div>
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-amber-200 -z-10 transform -translate-x-4"></div>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">2. Consult</h3>
                <p className="text-gray-600">Discuss your vision and requirements</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-center"
              >
                <div className="relative mb-6 mx-auto">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                    <Briefcase className="h-8 w-8 text-amber-600" />
                  </div>
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-amber-200 -z-10 transform -translate-x-4"></div>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">3. Plan</h3>
                <p className="text-gray-600">Receive a customized design plan</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-center"
              >
                <div className="mb-6 mx-auto">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                    <Home className="h-8 w-8 text-amber-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">4. Transform</h3>
                <p className="text-gray-600">See your space beautifully transformed</p>
              </motion.div>
            </div>
            
            {/* Testimonial */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-gray-50 p-8 rounded-lg shadow-sm mb-16"
            >
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-amber-100 flex-shrink-0">
                  <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1000" alt="Client" className="w-full h-full object-cover" />
                </div>
                <div>
                  <svg className="h-8 w-8 text-amber-400 mb-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  <p className="text-gray-700 mb-4 italic">
                    "Working with Estilo Interior was an absolute pleasure. From the initial consultation to the final reveal, their team was professional, creative, and attentive to every detail. My home has been completely transformed!"
                  </p>
                  <div>
                    <h4 className="font-semibold text-gray-900">Sarah Johnson</h4>
                    <p className="text-gray-500 text-sm">Residential Client</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Booking form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-6 text-center"
            >
              <div className="inline-flex bg-amber-100 p-3 rounded-full mb-6">
                <CalendarIcon2 className="h-6 w-6 text-amber-600" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-gray-800">Book Your Consultation</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Fill out the form below to schedule your consultation. Our team will get back to you within 24 hours to confirm your appointment.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="shadow-lg border-0 overflow-hidden bg-white">
                <CardContent className="p-8 md:p-10">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium">Full Name</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    placeholder="Your name" 
                                    className="pl-10 border-gray-300 focus:border-amber-500 focus:ring-amber-500" 
                                    {...field} 
                                  />
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Mail className="h-4 w-4" />
                                  </span>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium">Email Address</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    type="email" 
                                    placeholder="your@email.com" 
                                    className="pl-10 border-gray-300 focus:border-amber-500 focus:ring-amber-500" 
                                    {...field} 
                                  />
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Mail className="h-4 w-4" />
                                  </span>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium">Phone Number</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    placeholder="Your phone number" 
                                    className="pl-10 border-gray-300 focus:border-amber-500 focus:ring-amber-500" 
                                    {...field} 
                                  />
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Phone className="h-4 w-4" />
                                  </span>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="text-gray-700 font-medium">Preferred Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full pl-10 text-left font-normal border-gray-300 focus:border-amber-500 focus:ring-amber-500",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date < new Date() || date > new Date(new Date().setMonth(new Date().getMonth() + 2))
                                    }
                                    initialFocus
                                    className="rounded-md border border-gray-200"
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator className="my-6" />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="projectType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium">Project Type</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <select
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus:border-amber-500 focus:ring-amber-500"
                                    {...field}
                                  >
                                    <option value="">Select a project type</option>
                                    {projectTypes.map((type) => (
                                      <option key={type} value={type}>
                                        {type}
                                      </option>
                                    ))}
                                  </select>
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Home className="h-4 w-4" />
                                  </span>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="budget"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium">Budget Range</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <select
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus:border-amber-500 focus:ring-amber-500"
                                    {...field}
                                  >
                                    <option value="">Select your budget range</option>
                                    {budgetRanges.map((range) => (
                                      <option key={range} value={range}>
                                        {range}
                                      </option>
                                    ))}
                                  </select>
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <DollarSign className="h-4 w-4" />
                                  </span>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="requirements"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">Project Requirements</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell us about your project and requirements"
                                className="min-h-[120px] border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium">Project Address</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    placeholder="Enter your project address" 
                                    className="pl-10 border-gray-300 focus:border-amber-500 focus:ring-amber-500" 
                                    {...field} 
                                  />
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Home className="h-4 w-4" />
                                  </span>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="preferredContactTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium">Preferred Contact Time</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <select
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus:border-amber-500 focus:ring-amber-500"
                                    {...field}
                                  >
                                    <option value="">Select preferred contact time</option>
                                    {contactTimes.map((time) => (
                                      <option key={time} value={time}>
                                        {time}
                                      </option>
                                    ))}
                                  </select>
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Clock className="h-4 w-4" />
                                  </span>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="pt-6">
                        <motion.div 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button 
                            type="submit" 
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-6 transition-all duration-200"
                            disabled={mutation.isPending}
                          >
                            {mutation.isPending ? (
                              <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting...
                              </div>
                            ) : (
                              <div className="flex items-center justify-center">
                                Book Your Consultation <ArrowRight className="ml-2 h-5 w-5" />
                              </div>
                            )}
                          </Button>
                        </motion.div>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mt-20 py-16 bg-gray-50 rounded-lg"
            >
              <div className="max-w-4xl mx-auto px-6">
                <h2 className="text-2xl font-bold mb-10 text-center text-gray-800">Frequently Asked Questions</h2>
                
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">What happens during the consultation?</h3>
                    <p className="text-gray-600">
                      During your consultation, our designer will discuss your project in detail, understand your style preferences, take measurements if needed, and explore potential design directions. This is your opportunity to share your vision and ask any questions you may have.
                    </p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">How long does a consultation typically last?</h3>
                    <p className="text-gray-600">
                      Initial consultations typically last 60-90 minutes, allowing enough time to discuss your project thoroughly and establish a good understanding of your needs and preferences.
                    </p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Is there a fee for the initial consultation?</h3>
                    <p className="text-gray-600">
                      Yes, there is a consultation fee which will be credited toward your project if you decide to proceed with our services. This helps ensure we can provide our full attention and expertise to clients who are serious about their projects.
                    </p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">What should I prepare before the consultation?</h3>
                    <p className="text-gray-600">
                      It's helpful to gather inspiration images, create a Pinterest board, note specific requirements or challenges, and have a rough budget in mind. Also, any existing floor plans or measurements can be useful.
                    </p>
                  </div>
                </div>
                
                <div className="mt-12 text-center">
                  <p className="text-gray-600 mb-6">Still have questions about our process?</p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-block"
                  >
                    <Link href="/contact">
                      <Button className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-md">
                        <div className="flex items-center">
                          Contact Us <ArrowRight className="ml-2 h-5 w-5" />
                        </div>
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
