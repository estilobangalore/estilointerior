import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { motion } from "framer-motion";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageAlt: string;
  title?: string;
  description?: string;
}

export function ImageModal({ 
  isOpen, 
  onClose, 
  imageUrl, 
  imageAlt,
  title,
  description 
}: ImageModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden bg-white border-none rounded-lg">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        
        <div className="flex flex-col md:flex-row h-full">
          {/* Image container */}
          <div className="relative w-full md:w-2/3 h-full bg-black/90 flex items-center justify-center">
            <motion.img 
              src={imageUrl} 
              alt={imageAlt} 
              className="max-w-full max-h-[85vh] md:max-h-[90vh] object-contain" 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          {/* Info panel */}
          {(title || description) && (
            <div className="w-full md:w-1/3 p-6 md:p-8 bg-white">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                {title && (
                  <h3 className="text-2xl font-semibold mb-4">{title}</h3>
                )}
                
                {description && (
                  <p className="text-gray-600">{description}</p>
                )}
              </motion.div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 