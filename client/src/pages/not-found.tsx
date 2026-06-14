import { motion } from "framer-motion";
import { Link } from "wouter";
import { Compass, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          <div className="bg-amber-50 p-6 rounded-full inline-block mb-6 shadow-sm">
            <Compass className="h-16 w-16 text-amber-500 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          
          <h1 className="text-6xl font-extrabold font-serif text-gray-900 tracking-tight">404</h1>
          <h2 className="text-2xl font-bold font-serif text-gray-800 mt-2">Space Not Found</h2>
          <div className="w-12 h-1 bg-amber-500 mx-auto my-4"></div>
          
          <p className="text-gray-500 mt-2 max-w-sm">
            We couldn't find the page or space you are looking for. It might have been moved, renamed, or doesn't exist.
          </p>

          <div className="mt-8">
            <Link href="/">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-8 py-3 rounded-md transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm">
                Back to Home <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
