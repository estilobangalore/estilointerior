import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2 } from "lucide-react";

// This schema matches the requirements in shared/schema.ts
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").max(100),
  phone: z.string().min(10, "Phone number must be at least 10 characters").max(20),
  requirements: z.string().min(10, "Message must be at least 10 characters").max(1000),
  address: z.string().optional(),
  projectType: z.string().default("Contact Form Inquiry"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ContactForm() {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      requirements: "",
      address: "",
      projectType: "Contact Form Inquiry",
    },
  });

  const mutation = useMutation({
    mutationFn: async (formData: FormValues) => {
      try {
        console.log('Submitting contact form data:', formData);
        
        // Format the data for the contact endpoint
        const contactData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.requirements, // Contact endpoint expects 'message' field
          address: formData.address
        };
        
        console.log('Formatted contact data:', contactData);
        
        // Log the URL we're sending to for debugging
        const fullUrl = `/api/contact`;
        console.log('Sending request to:', fullUrl);
        
        // Use the contact endpoint instead of consultations
        return await apiRequest("POST", "/api/contact", contactData);
      } catch (error: any) {
        // Log all available properties of the error
        console.error('Submission error details:');
        console.error('- Message:', error.message || 'No message');
        console.error('- Name:', error.name || 'No name');
        console.error('- Stack:', error.stack || 'No stack');
        console.error('- Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        
        // Make sure the error message is a string
        let errorMessage: string;
        if (error === null || error === undefined) {
          errorMessage = 'Unknown error occurred';
        } else if (typeof error.message === 'string') {
          errorMessage = error.message;
        } else if (typeof error === 'object') {
          errorMessage = JSON.stringify(error);
        } else {
          errorMessage = String(error);
        }
        
        throw new Error(errorMessage || 'Failed to submit contact form');
      }
    },
    onSuccess: () => {
      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible.",
      });
      form.reset();
    },
    onError: (error: any) => {
      // Log additional details about the error for debugging
      console.error('Form submission error details:');
      
      // Try to get all properties from the error object
      if (typeof error === 'object' && error !== null) {
        console.error('Error properties:');
        for (const prop in error) {
          console.error(`- ${prop}:`, error[prop]);
        }
      }
      
      // Extract a more user-friendly error message
      let errorMessage = "Something went wrong. Please try again.";
      
      if (error && typeof error === 'object') {
        if (error.message) {
          errorMessage = error.message;
        } else if (error.status) {
          errorMessage = `Server error (${error.status})`;
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Show the error message to the user
      toast({
        variant: "destructive",
        title: "Error Sending Message",
        description: errorMessage,
      });
    },
  });

  const onSubmit = (formData: FormValues) => {
    mutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-6">Send Us a Message</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Your name" 
                      {...field} 
                      className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                    />
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
                  <FormLabel className="text-gray-700">Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="your@email.com" 
                      type="email" 
                      {...field}
                      className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                    />
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
                  <FormLabel className="text-gray-700">Phone</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Your phone number" 
                      {...field}
                      className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Address (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Your address" 
                      {...field}
                      className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                    />
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
                <FormLabel className="text-gray-700">Message</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about your project"
                    className="min-h-[120px] border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full bg-gray-800 hover:bg-gray-700 text-white transition-all duration-200"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
