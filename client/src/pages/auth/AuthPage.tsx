import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const authSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof authSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation } = useAuth();
  const { toast } = useToast();

  const [isResetMode, setIsResetMode] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1 = request, 2 = verify
  const [resetUsername, setResetUsername] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isResetPending, setIsResetPending] = useState(false);

  useEffect(() => {
    if (user) {
      setLocation("/admin");
    }
  }, [user, setLocation]);

  const form = useForm<FormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });



  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUsername) {
      toast({
        title: "Error",
        description: "Username is required",
        variant: "destructive",
      });
      return;
    }
    
    setIsResetPending(true);
    try {
      const data = await apiRequest<{ message: string }>("POST", "/api/auth/request-reset", { username: resetUsername });
      toast({
        title: "OTP Sent",
        description: data.message || "An OTP code has been sent to the registered email.",
      });
      setResetStep(2);
    } catch (err: any) {
      toast({
        title: "Request Failed",
        description: err.message || "Failed to request password reset",
        variant: "destructive",
      });
    } finally {
      setIsResetPending(false);
    }
  };

  const handleVerifyReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetOtp || !newPassword) {
      toast({
        title: "Error",
        description: "OTP and new password are required",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Invalid Password",
        description: "New password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsResetPending(true);
    try {
      const data = await apiRequest<{ message: string }>("POST", "/api/auth/verify-reset", {
        username: resetUsername,
        otp: resetOtp,
        password: newPassword,
      });
      toast({
        title: "Success",
        description: data.message || "Password has been reset successfully.",
      });
      // Go back to login
      setIsResetMode(false);
      setResetStep(1);
      setResetUsername("");
      setResetOtp("");
      setNewPassword("");
    } catch (err: any) {
      toast({
        title: "Reset Failed",
        description: err.message || "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setIsResetPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-4xl w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl font-bold font-serif mb-2 text-gray-800">Admin Portal</h1>
            <p className="text-gray-600 mb-8">
              Access the admin dashboard to manage all site settings, portfolio items, and testimonials.
            </p>
            
            <Card className="border-0 shadow-md">
              {isResetMode ? (
                <>
                  <CardHeader>
                    <CardTitle className="font-serif text-xl">Reset Password</CardTitle>
                    <CardDescription>
                      {resetStep === 1 
                        ? "Enter your admin username to request a verification OTP."
                        : "Enter the 6-digit OTP code sent to your email and choose a new password."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {resetStep === 1 ? (
                      <form onSubmit={handleRequestOtp} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Username</label>
                          <Input 
                            placeholder="Enter your username" 
                            value={resetUsername} 
                            onChange={e => setResetUsername(e.target.value)}
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-2 pt-2">
                          <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={isResetPending}>
                            {isResetPending ? "Requesting..." : "Send Reset OTP"}
                          </Button>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            className="w-full" 
                            onClick={() => setIsResetMode(false)}
                          >
                            Back to Login
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifyReset} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Username</label>
                          <Input 
                            value={resetUsername} 
                            disabled 
                            className="bg-gray-100"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">One-Time Password (OTP)</label>
                          <Input 
                            placeholder="Enter 6-digit OTP" 
                            value={resetOtp} 
                            onChange={e => setResetOtp(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">New Password</label>
                          <Input 
                            type="password" 
                            placeholder="Enter new password" 
                            value={newPassword} 
                            onChange={e => setNewPassword(e.target.value)}
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-2 pt-2">
                          <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={isResetPending}>
                            {isResetPending ? "Resetting..." : "Reset Password"}
                          </Button>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            className="w-full" 
                            onClick={() => {
                              setResetStep(1);
                            }}
                          >
                            Go Back
                          </Button>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </>
              ) : (
                <>
                  <CardHeader>
                    <CardTitle className="font-serif text-xl">Login</CardTitle>
                    <CardDescription>
                      Sign in to your administrator account.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit((data) => loginMutation.mutate(data))} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Enter password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end">
                          <button 
                            type="button"
                            onClick={() => {
                              setIsResetMode(true);
                              setResetStep(1);
                            }}
                            className="text-sm text-amber-600 hover:underline hover:text-amber-700 font-medium"
                          >
                            Forgot Password?
                          </button>
                        </div>

                        <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={loginMutation.isPending}>
                          {loginMutation.isPending ? "Logging in..." : "Login"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </>
              )}
            </Card>
          </div>

          <div className="hidden md:block">
            <div className="h-full bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl p-8 text-white flex flex-col justify-center shadow-lg">
              <h2 className="text-2xl font-bold font-serif mb-4">Interior Design Management</h2>
              <ul className="space-y-4 text-white/95">
                <li className="flex items-center gap-2">
                  <span className="bg-white/20 p-1.5 rounded-full text-xs">✓</span> Manage site settings & texts
                </li>
                <li className="flex items-center gap-2">
                  <span className="bg-white/20 p-1.5 rounded-full text-xs">✓</span> Upload & edit portfolio projects
                </li>
                <li className="flex items-center gap-2">
                  <span className="bg-white/20 p-1.5 rounded-full text-xs">✓</span> Manage client testimonials
                </li>
                <li className="flex items-center gap-2">
                  <span className="bg-white/20 p-1.5 rounded-full text-xs">✓</span> Review consultation bookings
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
