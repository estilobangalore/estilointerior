import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import ProjectCard from "@/components/ProjectCard";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowDownCircle, Loader2 } from "lucide-react";

interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
}

// Fallback sample data in case the API fails
const samplePortfolioItems: PortfolioItem[] = [
  {
    id: 1,
    title: "Modern Living Room Design",
    description: "A minimalist approach with comfortable furniture and natural lighting to create a welcoming atmosphere.",
    imageUrl: "https://images.unsplash.com/photo-1615529328331-f8917597711f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    category: "Living Room"
  },
  {
    id: 2,
    title: "Contemporary Kitchen Renovation",
    description: "A sleek kitchen with state-of-the-art appliances and an efficient layout for the passionate home chef.",
    imageUrl: "https://images.unsplash.com/photo-1556912998-c57cc6b63cd7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    category: "Kitchen"
  },
  {
    id: 3,
    title: "Serene Bedroom Retreat",
    description: "A calming space designed for optimal rest and relaxation with soft textures and a soothing color palette.",
    imageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    category: "Bedroom"
  },
  {
    id: 4,
    title: "Elegant Dining Room",
    description: "A sophisticated dining area perfect for entertaining guests and enjoying family meals in style.",
    imageUrl: "https://images.unsplash.com/photo-1617806118233-18e1de247200?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    category: "Dining Room"
  },
  {
    id: 5,
    title: "Spa-like Bathroom",
    description: "A luxurious bathroom designed to provide a spa-like experience with premium fixtures and finishes.",
    imageUrl: "https://images.unsplash.com/photo-1620626011761-996317b8d101?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    category: "Bathroom"
  },
  {
    id: 6,
    title: "Home Office Setup",
    description: "A productive workspace that combines functionality with aesthetic appeal for the modern professional.",
    imageUrl: "https://images.unsplash.com/photo-1593476550610-87baa860004a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    category: "Office"
  }
];

export default function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  
  const { data: portfolioItems = [], isLoading, isError } = useQuery<PortfolioItem[]>({
    queryKey: ["/api/portfolio"],
  });

  // Use sample data if API fails or returns no items
  const displayItems: PortfolioItem[] = (portfolioItems?.length && !isError) 
    ? portfolioItems 
    : samplePortfolioItems;
  
  // Get unique categories from portfolio items
  const categories = Array.from(
    new Set(displayItems.map((item: PortfolioItem) => item.category))
  );

  // Filter portfolio items by selected category
  const filteredItems = selectedCategory
    ? displayItems.filter((item: PortfolioItem) => item.category === selectedCategory)
    : displayItems;

  // Use window scroll listener for parallax effect
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero Section with Parallax Effect */}
      <div className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-gradient-to-r from-gray-900 to-gray-800" 
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(55, 65, 81, 0.9), rgba(17, 24, 39, 0.9))',
            transform: `translateY(${scrollY * 0.3}px)`,
          }}
        >
          {/* Abstract pattern overlay */}
          <div className="absolute inset-0 opacity-20" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
              backgroundSize: '150px 150px'
            }}
          />
        </div>
        
        <div className="container mx-auto px-4 z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Our Portfolio</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-12">
              Discover the transformative power of thoughtful design through our curated collection of interior projects.
            </p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="mt-12"
            >
              <ArrowDownCircle 
                className="w-12 h-12 text-white/70 mx-auto cursor-pointer animate-bounce" 
                onClick={() => window.scrollTo({
                  top: window.innerHeight * 0.8,
                  behavior: 'smooth'
                })}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-2">Explore Our Work</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              We transform spaces into environments that inspire, comfort, and elevate everyday living.
            </p>
            
            <Separator className="max-w-md mx-auto my-8" />
            
            {/* Enhanced Category filters */}
            <div className="inline-flex flex-wrap justify-center gap-3 mb-12 p-2 rounded-lg bg-gray-50">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge
                  variant={selectedCategory === null ? "default" : "outline"}
                  className={`cursor-pointer px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                    selectedCategory === null ? "shadow-md" : "hover:border-primary"
                  }`}
                  onClick={() => setSelectedCategory(null)}
                >
                  All Projects
                </Badge>
              </motion.div>
              
              {categories.map((category) => (
                <motion.div
                  key={category as string}
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onMouseEnter={() => setHoveredCategory(category as string)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <Badge
                    variant={selectedCategory === category ? "default" : "outline"}
                    className={`cursor-pointer px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                      selectedCategory === category ? "shadow-md" : "hover:border-primary"
                    }`}
                    onClick={() => setSelectedCategory(category as string)}
                  >
                    {category as string}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <span className="ml-3 text-lg text-gray-600">Loading projects...</span>
            </div>
          )}

          {/* Masonry-style grid with animations */}
          {!isLoading && (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCategory || 'all'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 auto-rows-max"
              >
                {filteredItems.map((project, index) => {
                  // Calculate staggered offsets based on column position
                  const columnPosition = index % 3;
                  let offsetClass = '';
                  
                  if (columnPosition === 0) offsetClass = 'md:mt-0';
                  else if (columnPosition === 1) offsetClass = 'md:mt-16';
                  else if (columnPosition === 2) offsetClass = 'md:mt-8';
                  
                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.6, 
                        delay: index * 0.1,
                        ease: "easeOut"
                      }}
                      className={offsetClass}
                    >
                      <ProjectCard 
                        image={project.imageUrl} 
                        title={project.title} 
                        description={project.description} 
                        category={project.category}
                      />
                    </motion.div>
                  );
                })}
                
                {filteredItems.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-24"
                  >
                    <h3 className="text-2xl font-medium text-gray-500 mb-4">No projects found</h3>
                    <p className="text-gray-400">
                      {selectedCategory 
                        ? `We don't have any ${selectedCategory} projects yet. Try selecting a different category.` 
                        : 'Unable to load projects. Please try again later.'}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
