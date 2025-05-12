import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
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
import { CalendarIcon, Clock, Home, Phone, Mail, Calendar as CalendarIcon2, FileText, DollarSign, Clock3 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
  
  // Background image URL
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
        const response = await apiRequest("POST", "/api/consultations", formattedData);
        return response;
      } catch (error: any) {
        console.error('Submission error:', error);
        if (error.message.includes('Unable to connect to the server')) {
          throw new Error('Unable to connect to the server. Please check if the server is running.');
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
    <div 
      className="py-20 min-h-screen bg-cover bg-center bg-fixed" 
      style={{ 
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url(${bookingBgImage})` 
      }}
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Book a Consultation</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Schedule a consultation with our interior design experts to discuss your project and bring your vision to life.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white p-8 rounded-lg shadow-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="text-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 mb-4">
                  <CalendarIcon2 className="h-6 w-6 text-gray-700" />
                </div>
                <h3 className="font-medium text-lg mb-2">Schedule</h3>
                <p className="text-gray-600 text-sm">Choose a convenient date for your consultation</p>
              </div>
              <div className="text-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 mb-4">
                  <FileText className="h-6 w-6 text-gray-700" />
                </div>
                <h3 className="font-medium text-lg mb-2">Discuss</h3>
                <p className="text-gray-600 text-sm">Share your project details and requirements</p>
              </div>
              <div className="text-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 mb-4">
                  <Home className="h-6 w-6 text-gray-700" />
                </div>
                <h3 className="font-medium text-lg mb-2">Transform</h3>
                <p className="text-gray-600 text-sm">Begin your journey to a beautiful space</p>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-gray-700">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100">
                            <span className="text-xs font-medium text-gray-700">1</span>
                          </span>
                          Name
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="Your name" 
                              className="pl-10 border-gray-300 focus:border-gray-500 focus:ring-gray-500" 
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
                        <FormLabel className="flex items-center gap-2 text-gray-700">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100">
                            <span className="text-xs font-medium text-gray-700">2</span>
                          </span>
                          Email
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="email" 
                              placeholder="your@email.com" 
                              className="pl-10 border-gray-300 focus:border-gray-500 focus:ring-gray-500" 
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
                        <FormLabel className="flex items-center gap-2 text-gray-700">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100">
                            <span className="text-xs font-medium text-gray-700">3</span>
                          </span>
                          Phone
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="Your phone number" 
                              className="pl-10 border-gray-300 focus:border-gray-500 focus:ring-gray-500" 
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
                        <FormLabel className="flex items-center gap-2 text-gray-700">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100">
                            <span className="text-xs font-medium text-gray-700">4</span>
                          </span>
                          Date
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-10 text-left font-normal border-gray-300 focus:border-gray-500 focus:ring-gray-500",
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

                <FormField
                  control={form.control}
                  name="projectType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-700">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100">
                          <span className="text-xs font-medium text-gray-700">5</span>
                        </span>
                        Project Type
                      </FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background focus:border-gray-500 focus:ring-gray-500"
                          {...field}
                        >
                          <option value="">Select a project type</option>
                          {projectTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-700">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100">
                          <span className="text-xs font-medium text-gray-700">6</span>
                        </span>
                        Project Requirements
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your project and requirements"
                          className="min-h-[120px] border-gray-300 focus:border-gray-500 focus:ring-gray-500"
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
                        <FormLabel className="flex items-center gap-2 text-gray-700">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100">
                            <span className="text-xs font-medium text-gray-700">7</span>
                          </span>
                          Project Address
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="Enter your project address" 
                              className="pl-10 border-gray-300 focus:border-gray-500 focus:ring-gray-500" 
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
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-gray-700">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100">
                            <span className="text-xs font-medium text-gray-700">8</span>
                          </span>
                          Budget Range
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <select
                              className="flex h-10 w-full rounded-md border border-gray-300 bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus:border-gray-500 focus:ring-gray-500"
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
                  name="preferredContactTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-700">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100">
                          <span className="text-xs font-medium text-gray-700">9</span>
                        </span>
                        Preferred Contact Time
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <select
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus:border-gray-500 focus:ring-gray-500"
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

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white py-6 transition-all duration-200"
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
                    ) : "Book Your Consultation"}
                  </Button>
                </div>
              </form>
            </Form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
