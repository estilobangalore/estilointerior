import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import ProjectCard from "@/components/ProjectCard";
import StatsCounter from "@/components/StatsCounter";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Testimonial, PortfolioItem } from "@shared/schema";

export default function Home() {
  const [visibleProjects, setVisibleProjects] = useState(6);

  const { data: portfolioItems = [] } = useQuery<PortfolioItem[]>({
    queryKey: ["/api/portfolio"],
  });

  // Filter to only show featured items
  const featuredItems = portfolioItems.filter(item => {
    return item.featured === true;
  });

  // Log for debugging
  console.log("All portfolio items:", portfolioItems);
  console.log("Featured items:", featuredItems);

  const { data: testimonials = [] } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
  });

  const showMoreProjects = () => {
    setVisibleProjects(featuredItems.length);
  };

  return (
    <>
      <HeroSection />
      <ServicesSection />

      {/* Featured Projects Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-800">Our Latest Projects</h2>
            <div className="w-16 sm:w-20 md:w-24 h-1 bg-amber-500 mx-auto mb-4 sm:mb-6"></div>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our recent interior design projects that showcase our expertise and creativity.
            </p>
          </motion.div>

          {featuredItems.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredItems.slice(0, visibleProjects).map((project) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="overflow-hidden">
                      <img 
                        src={project.imageUrl} 
                        alt={project.title}
                        className="w-full h-64 object-cover"
                      />
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                        <p className="text-gray-600">{project.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {visibleProjects < featuredItems.length && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center mt-12"
                >
                  <Button
                    onClick={showMoreProjects}
                    variant="outline"
                    size="lg"
                    className="px-8"
                  >
                    View More Projects
                  </Button>
                </motion.div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No featured projects available.</p>
            </div>
          )}
        </div>
      </section>

      {/* Stats Counter Section */}
      <StatsCounter />

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-800">Client Testimonials</h2>
            <div className="w-16 sm:w-20 md:w-24 h-1 bg-amber-500 mx-auto mb-4 sm:mb-6"></div>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              See what our clients have to say about their experience working with us.
            </p>
          </motion.div>
          {/* this should be a component */}

          <div className="max-w-3xl mx-auto">
            <Carousel opts={{ align: "center" }}>
              <CarouselContent>
                {testimonials.map((testimonial) => (
                  <CarouselItem key={testimonial.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                      className="p-4"
                    >
                      <Card>
                        <CardContent className="p-6 text-center">
                          <Avatar className="w-20 h-20 mx-auto mb-4">
                            <AvatarImage src={testimonial.imageUrl} alt={testimonial.name} />
                            <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                          </Avatar>
                          <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                          <h4 className="font-semibold">{testimonial.name}</h4>
                          <p className="text-sm text-gray-500">{testimonial.role}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center gap-2 mt-4">
                <CarouselPrevious />
                <CarouselNext />
              </div>
            </Carousel>
          </div>
        </div>
      </section>
    </>
  );
}