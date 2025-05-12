import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TestimonialForm from "@/components/admin/TestimonialForm";
import PortfolioForm from "@/components/admin/PortfolioForm";
import { Trash2, Image, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {cn} from "@/lib/utils"
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ImageModal } from "@/components/ui/image-modal";
import type { Consultation } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";

// Define types for testimonials and portfolio items
interface Testimonial {
  id: number;
  name: string;
  content: string;
}

interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  featured: boolean;
}

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isLoading, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("bookings");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  const [notes, setNotes] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editingPortfolioItem, setEditingPortfolioItem] = useState<PortfolioItem | null>(null);

  const { data: testimonials = [] } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
  });

  const { data: portfolioItems = [] } = useQuery<PortfolioItem[]>({
    queryKey: ["/api/portfolio"],
  });

  const deleteTestimonialMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/testimonials/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      toast({
        title: "Success",
        description: "Testimonial deleted successfully",
      });
    },
  });

  const deletePortfolioItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/portfolio/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      toast({
        title: "Success",
        description: "Portfolio item deleted successfully",
      });
    },
  });

  const { data: consultations = [] } = useQuery<Consultation[]>({
    queryKey: ["/api/consultations"],
    queryFn: () => {
      if (!user?.isAdmin) {
        throw new Error("Admin access required");
      }
      return apiRequest("GET", "/api/consultations");
    },
    enabled: !!user?.isAdmin,
  });

  // Separate bookings and contact form submissions
  const bookings = consultations.filter(
    (consultation) => consultation.projectType !== "Contact Form Inquiry"
  );

  const contactSubmissions = consultations.filter(
    (consultation) => consultation.projectType === "Contact Form Inquiry"
  );

  const updateConsultationStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      try {
        await apiRequest("PATCH", `/api/consultations/${id}/status`, { status });
      } catch (error: any) {
        console.error('Status update error:', error);
        throw new Error(error.response?.data?.message || 'Failed to update consultation status');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consultations"] });
      toast({
        title: "Success",
        description: "Consultation status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update consultation status",
      });
    },
  });

  const updateNotesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes: string }) => {
      try {
        await apiRequest("PATCH", `/api/consultations/${id}/notes`, { notes });
      } catch (error: any) {
        console.error('Notes update error:', error);
        throw new Error(error.response?.data?.message || 'Failed to update notes');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consultations"] });
      toast({
        title: "Success",
        description: "Notes updated successfully",
      });
      setSelectedConsultation(null);
      setNotes("");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update notes",
      });
    },
  });

  const updatePortfolioItemMutation = useMutation({
    mutationFn: async (data: { id: number; featured: boolean }) => {
      console.log(`Sending update for portfolio item ${data.id}, featured: ${data.featured}`);
      try {
        const result = await apiRequest("PATCH", `/api/portfolio/${data.id}`, { featured: data.featured });
        console.log("Update response:", result);
        return result;
      } catch (error) {
        console.error("Error updating portfolio item:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      toast({
        title: "Success",
        description: "Portfolio item updated successfully",
      });
    },
    onError: (error: any) => {
      console.error("Portfolio update error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update portfolio item",
      });
    },
  });

  const statusOptions = ["all", "pending", "confirmed", "completed"];
  const dateOptions = ["all", "today", "this-week", "this-month"] as const;

  // Filter function for consultations
  const filterConsultations = (consultations: Consultation[]) => {
    return consultations.filter((consultation) => {
      const matchesSearch = searchQuery
        ? consultation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          consultation.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          consultation.phone.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const matchesStatus = statusFilter === "all" || consultation.status === statusFilter;

      const matchesDate = (() => {
        if (dateFilter === "all") return true;
        const consultationDate = new Date(consultation.date);
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        switch (dateFilter) {
          case "today":
            return consultationDate.toDateString() === new Date().toDateString();
          case "this-week":
            return consultationDate >= startOfWeek;
          case "this-month":
            return consultationDate >= startOfMonth;
          default:
            return true;
        }
      })();

      return matchesSearch && matchesStatus && matchesDate;
    });
  };

  const filteredBookings = filterConsultations(bookings);
  const filteredContactSubmissions = filterConsultations(contactSubmissions);

  // Function to toggle featured status
  const toggleFeatured = (item: PortfolioItem) => {
    console.log(`Toggling featured status for item ${item.id} from ${item.featured} to ${!item.featured}`);
    try {
      updatePortfolioItemMutation.mutate({
        id: item.id,
        featured: !item.featured,
      });
    } catch (error) {
      console.error("Error in toggleFeatured:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update portfolio item. Please try again later.",
      });
    }
  };

  // Redirect non-admin users
  useEffect(() => {
    if (!isLoading && !user?.isAdmin) {
      setLocation("/");
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You must be an admin to access this page.",
      });
    }
  }, [user, isLoading, setLocation, toast]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  // Don't render anything if not admin
  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => logoutMutation.mutate()}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="contact-submissions">Contact Submissions</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Bookings</CardTitle>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Input
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                </select>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="this-week">This Week</option>
                  <option value="this-month">This Month</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredBookings?.map((consultation) => (
                  <div key={consultation.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium">{consultation.name}</h3>
                        <p className="text-sm text-gray-600">{consultation.email}</p>
                        <p className="text-sm text-gray-600">{consultation.phone}</p>
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>Address:</strong> {consultation.address}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Budget:</strong> {consultation.budget}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Preferred Contact Time:</strong> {consultation.preferredContactTime}
                        </p>
                      </div>
                      <Badge
                        className={cn(
                          consultation.status === "pending" && "bg-yellow-500",
                          consultation.status === "confirmed" && "bg-green-500",
                          consultation.status === "completed" && "bg-blue-500"
                        )}
                      >
                        {consultation.status}
                      </Badge>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium">Project Type: {consultation.projectType}</p>
                      <p className="text-sm">Date: {format(new Date(consultation.date), "PPP")}</p>
                      <p className="text-sm mt-2">
                        <strong>Requirements:</strong>
                      </p>
                      <p className="text-sm mt-1">{consultation.requirements}</p>
                      {consultation.notes && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Notes:</p>
                          <p className="text-sm text-gray-600">{consultation.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          updateConsultationStatusMutation.mutate({
                            id: consultation.id,
                            status: "confirmed",
                          })
                        }
                        disabled={consultation.status !== "pending"}
                      >
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          updateConsultationStatusMutation.mutate({
                            id: consultation.id,
                            status: "completed",
                          })
                        }
                        disabled={consultation.status !== "confirmed"}
                      >
                        Complete
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedConsultation(consultation);
                              setNotes(consultation.notes || "");
                            }}
                          >
                            Add Notes
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Notes</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Enter your notes here..."
                              className="min-h-[100px]"
                            />
                            <Button
                              onClick={() =>
                                updateNotesMutation.mutate({
                                  id: selectedConsultation.id,
                                  notes,
                                })
                              }
                            >
                              Save Notes
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
                {(!filteredBookings || filteredBookings.length === 0) && (
                  <div className="text-center py-4 text-gray-500">
                    No bookings found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact-submissions">
          <Card>
            <CardHeader>
              <CardTitle>Contact Submissions</CardTitle>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Input
                  placeholder="Search contact submissions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                </select>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="this-week">This Week</option>
                  <option value="this-month">This Month</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredContactSubmissions?.map((consultation) => (
                  <div key={consultation.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium">{consultation.name}</h3>
                        <p className="text-sm text-gray-600">{consultation.email}</p>
                        <p className="text-sm text-gray-600">{consultation.phone}</p>
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>Address:</strong> {consultation.address}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Budget:</strong> {consultation.budget}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Preferred Contact Time:</strong> {consultation.preferredContactTime}
                        </p>
                      </div>
                      <Badge
                        className={cn(
                          consultation.status === "pending" && "bg-yellow-500",
                          consultation.status === "confirmed" && "bg-green-500",
                          consultation.status === "completed" && "bg-blue-500"
                        )}
                      >
                        {consultation.status}
                      </Badge>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium">Project Type: {consultation.projectType}</p>
                      <p className="text-sm">Date: {format(new Date(consultation.date), "PPP")}</p>
                      <p className="text-sm mt-2">
                        <strong>Requirements:</strong>
                      </p>
                      <p className="text-sm mt-1">{consultation.requirements}</p>
                      {consultation.notes && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Notes:</p>
                          <p className="text-sm text-gray-600">{consultation.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          updateConsultationStatusMutation.mutate({
                            id: consultation.id,
                            status: "confirmed",
                          })
                        }
                        disabled={consultation.status !== "pending"}
                      >
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          updateConsultationStatusMutation.mutate({
                            id: consultation.id,
                            status: "completed",
                          })
                        }
                        disabled={consultation.status !== "confirmed"}
                      >
                        Complete
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedConsultation(consultation);
                              setNotes(consultation.notes || "");
                            }}
                          >
                            Add Notes
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Notes</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Enter your notes here..."
                              className="min-h-[100px]"
                            />
                            <Button
                              onClick={() =>
                                updateNotesMutation.mutate({
                                  id: selectedConsultation.id,
                                  notes,
                                })
                              }
                            >
                              Save Notes
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
                {(!filteredContactSubmissions || filteredContactSubmissions.length === 0) && (
                  <div className="text-center py-4 text-gray-500">
                    No contact submissions found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonials">
          <div className="grid gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Add New Testimonial</CardTitle>
              </CardHeader>
              <CardContent>
                <TestimonialForm />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Testimonials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <h3 className="font-medium">{testimonial.name}</h3>
                        <p className="text-gray-600">{testimonial.content}</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => deleteTestimonialMutation.mutate(testimonial.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {testimonials.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      No testimonials found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="portfolio">
          <div className="grid gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Add New Portfolio Item</CardTitle>
              </CardHeader>
              <CardContent>
                <PortfolioForm />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Portfolio Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {portfolioItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded">
                      <div className="flex items-center gap-4 flex-1">
                        {item.imageUrl && (
                          <div 
                            className="w-16 h-16 relative cursor-pointer"
                            onClick={() => setSelectedImage(item.imageUrl)}
                          >
                            <img 
                              src={item.imageUrl} 
                              alt={item.title} 
                              className="w-full h-full object-cover rounded"
                            />
                            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 flex items-center justify-center transition-colors">
                              <Image className="w-6 h-6 text-white opacity-0 hover:opacity-100" />
                            </div>
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium">{item.title}</h3>
                          <p className="text-gray-600">{item.description}</p>
                          <div className="flex items-center mt-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id={`featured-${item.id}`}
                                checked={item.featured}
                                onCheckedChange={() => toggleFeatured(item)}
                              />
                              <label 
                                htmlFor={`featured-${item.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Featured on Homepage
                              </label>
                            </div>
                            {item.featured && (
                              <Badge className="ml-2 bg-green-500">Featured</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => deletePortfolioItemMutation.mutate(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {portfolioItems.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      No portfolio items found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          imageUrl={selectedImage}
          imageAlt="Portfolio Image"
        />
      )}
    </div>
  );
}