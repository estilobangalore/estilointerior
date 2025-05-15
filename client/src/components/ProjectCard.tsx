import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ImageModal } from "@/components/ui/image-modal";
import { Badge } from "@/components/ui/badge";
import { ZoomIn, ExternalLink } from "lucide-react";

interface ProjectCardProps {
  image: string;
  title: string;
  description: string;
  category?: string;
}

export default function ProjectCard({ image, title, description, category }: ProjectCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
        className="h-full"
      >
        <Card className="overflow-hidden h-full shadow-sm hover:shadow-lg transition-shadow duration-300">
          <div 
            className="aspect-video relative overflow-hidden" 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <img
              src={image}
              alt={title}
              className={`object-cover w-full h-full transition-all duration-700 ${
                isHovered ? 'scale-110 blur-sm' : 'scale-100'
              }`}
            />
            
            {/* Overlay on hover */}
            <motion.div 
              className="absolute inset-0 bg-black/60 flex items-center justify-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.button
                onClick={() => setIsModalOpen(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center"
                aria-label="View larger image"
              >
                <ZoomIn size={20} />
              </motion.button>
              
              <motion.a 
                href="#" 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center"
                aria-label="View project details"
              >
                <ExternalLink size={20} />
              </motion.a>
            </motion.div>
            
            {/* Category badge */}
            {category && (
              <div className="absolute top-4 left-4 z-10">
                <Badge variant="secondary" className="bg-white/90 text-black text-xs font-medium px-3 py-1 shadow-sm">
                  {category}
                </Badge>
              </div>
            )}
          </div>
          
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-600 line-clamp-2">{description}</p>
            
            <motion.button
              className="mt-4 text-sm font-medium text-primary flex items-center"
              whileHover={{ x: 5 }}
              onClick={() => setIsModalOpen(true)}
            >
              View Project <ExternalLink size={14} className="ml-1" />
            </motion.button>
          </CardContent>
        </Card>
      </motion.div>
      
      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageUrl={image}
        imageAlt={title}
        title={title}
        description={description}
      />
    </>
  );
}
