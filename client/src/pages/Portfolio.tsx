import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import ProjectCard from "@/components/ProjectCard";
import { Badge } from "@/components/ui/badge";

interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
}

export default function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { data: portfolioItems = [] } = useQuery<PortfolioItem[]>({
    queryKey: ["/api/portfolio"],
  });

  // Get unique categories from portfolio items
  const categories = Array.from(
    new Set(portfolioItems.map((item) => item.category))
  );

  // Filter portfolio items by selected category
  const filteredItems = selectedCategory
    ? portfolioItems.filter((item) => item.category === selectedCategory)
    : portfolioItems;

  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold mb-4">Our Portfolio</h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Explore our collection of thoughtfully designed spaces that showcase our expertise in interior design.
          </p>
          
          {/* Category filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Badge
              className={`cursor-pointer px-4 py-2 ${
                selectedCategory === null ? "bg-primary" : "bg-secondary hover:bg-primary/80"
              }`}
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Badge>
            {categories.map((category) => (
              <Badge
                key={category}
                className={`cursor-pointer px-4 py-2 ${
                  selectedCategory === category ? "bg-primary" : "bg-secondary hover:bg-primary/80"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <ProjectCard 
                image={project.imageUrl} 
                title={project.title} 
                description={project.description} 
              />
            </motion.div>
          ))}
          
          {filteredItems.length === 0 && (
            <div className="col-span-3 text-center py-12">
              <p className="text-gray-500">No portfolio items found. {selectedCategory ? `Try selecting a different category.` : ''}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
