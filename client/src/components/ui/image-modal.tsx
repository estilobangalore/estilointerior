import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageAlt: string;
}

export function ImageModal({ isOpen, onClose, imageUrl, imageAlt }: ImageModalProps) {
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
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden bg-transparent border-none">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
          aria-label="Close"
        >
          <X size={24} />
        </button>
        <div className="relative w-full h-full flex items-center justify-center">
          <img 
            src={imageUrl} 
            alt={imageAlt} 
            className="max-w-full max-h-[85vh] object-contain" 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
} 