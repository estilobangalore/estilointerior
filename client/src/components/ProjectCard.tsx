import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ImageModal } from "@/components/ui/image-modal";

interface ProjectCardProps {
  image: string;
  title: string;
  description: string;
}

export default function ProjectCard({ image, title, description }: ProjectCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="overflow-hidden">
          <div 
            className="aspect-video relative overflow-hidden cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <img
              src={image}
              alt={title}
              className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-500"
            />
          </div>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
          </CardContent>
        </Card>
      </motion.div>
      
      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageUrl={image}
        imageAlt={title}
      />
    </>
  );
}
