import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import SEOMetaTags from "@/components/SEOMetaTags";

export default function TermsOfService() {
  const { data: settings, isLoading } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });

  const content = settings?.terms_of_service_content || "Terms of Service Content. By using our website, you agree to these terms.";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <>
      <SEOMetaTags 
        title="Terms of Service - Estilo Interior" 
        description="Read the terms of service agreement for using the Estilo Interior design website."
      />

      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100"
          >
            <span className="text-amber-600 font-medium text-sm uppercase tracking-widest mb-2 inline-block">Policies</span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-gray-800 mb-6">Terms of Service</h1>
            <div className="w-16 h-1 bg-amber-500 mb-10"></div>

            <div className="prose prose-amber max-w-none text-gray-600 leading-relaxed space-y-6 whitespace-pre-line text-base md:text-lg">
              {content}
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100 text-sm text-gray-400">
              Last Updated: {settings?.updatedAt ? new Date(settings.updatedAt).toLocaleDateString() : new Date().toLocaleDateString()}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
