import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowDownCircle, Loader2, X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

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

const ProjectCard = ({ item, onClick }: { item: PortfolioItem; onClick: () => void }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="group relative overflow-hidden rounded-xl"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="h-full w-full object-cover transition-all duration-300 group-hover:scale-110"
          loading="lazy"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="text-lg font-semibold">{item.title}</h3>
          <p className="mt-1 text-sm text-white/80 line-clamp-2">{item.description}</p>
        </div>
        <button
          onClick={onClick}
          className="absolute right-4 top-4 rounded-full bg-white/20 p-2 backdrop-blur-sm transition-transform duration-300 hover:bg-white/30"
        >
          <ZoomIn className="h-5 w-5 text-white" />
        </button>
      </div>
    </motion.div>
  );
};

export default function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [scrollY, setScrollY] = useState(0);
  
  const { data: portfolioItems = [], isLoading, isError } = useQuery<PortfolioItem[]>({
    queryKey: ["/api/portfolio"],
  });

  const displayItems = (portfolioItems?.length && !isError) 
    ? portfolioItems 
    : samplePortfolioItems;
  
  const categories = Array.from(
    new Set(displayItems.map((item: PortfolioItem) => item.category))
  );

  const filteredItems = selectedCategory
    ? displayItems.filter((item: PortfolioItem) => item.category === selectedCategory)
    : displayItems;
  
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero Section with Parallax */}
      <div className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(55, 65, 81, 0.9), rgba(17, 24, 39, 0.9))',
            y: scrollY * 0.3
          }}
        >
          <div className="absolute inset-0 opacity-20" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
              backgroundSize: '150px 150px'
            }}
          />
        </motion.div>
        
        <div className="container mx-auto px-4 z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              Our Portfolio
            </h1>
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
            
            {/* Category filters */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge
                  variant={selectedCategory === null ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer px-6 py-2.5 text-sm font-medium transition-all duration-200",
                    selectedCategory === null ? "shadow-md" : "hover:border-primary"
                  )}
                  onClick={() => setSelectedCategory(null)}
                >
                  All Projects
                </Badge>
              </motion.div>
              
              {categories.map((category) => (
                <motion.div
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Badge
                    variant={selectedCategory === category ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer px-6 py-2.5 text-sm font-medium transition-all duration-200",
                      selectedCategory === category ? "shadow-md" : "hover:border-primary"
                    )}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Badge>
                </motion.div>
              ))}
            </div>

            {/* Portfolio Grid */}
                    <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
              <AnimatePresence>
                {filteredItems.map((item) => (
                      <ProjectCard 
                    key={item.id}
                    item={item}
                    onClick={() => setSelectedItem(item)}
                      />
                ))}
              </AnimatePresence>
                    </motion.div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
                )}
              </motion.div>
        </div>
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95">
          <button
            onClick={() => setSelectedItem(null)}
            className="absolute right-4 top-4 z-50 rounded-full bg-black/20 p-2 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/40"
          >
            <X className="h-5 w-5" />
          </button>
          {selectedItem && (
            <div className="relative">
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.title}
                className="w-full object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                <h3 className="text-2xl font-semibold mb-2">{selectedItem.title}</h3>
                <p className="text-white/80">{selectedItem.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
