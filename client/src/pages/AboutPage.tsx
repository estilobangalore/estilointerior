import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Compass, Target, ShieldCheck } from "lucide-react";
import SEOMetaTags from "@/components/SEOMetaTags";

export default function AboutPage() {
  const { data: settings, isLoading } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });

  const aboutImage = settings?.about_image_url || "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=2000";
  const aboutContent = settings?.about_content || "Luxury residential and commercial interior design studio based in Bangalore. We create beautiful, functional spaces customized to your lifestyle.";
  const aboutVision = settings?.about_vision || "To be the leading luxury interior design firm known for timeless elegance and bespoke spaces.";
  const aboutMission = settings?.about_mission || "To transform our clients' visions into custom realities through exceptional design, premium craftsmanship, and seamless execution.";

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
        title="About Us - Estilo Interior" 
        description="Learn more about Estilo Interior, our luxury design philosophy, and our mission to craft bespoke spaces in Bangalore."
      />

      <div className="relative overflow-hidden bg-white">
        {/* Luxury Hero Banner */}
        <div className="relative h-[40vh] md:h-[50vh] flex items-center justify-center bg-gray-900 text-white">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40" 
            style={{ backgroundImage: `url(${aboutImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
          
          <div className="container relative z-10 mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <span className="text-amber-400 font-medium text-sm uppercase tracking-widest mb-3 inline-block">Crafting Dreams</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif mb-4 tracking-tight">Our Story</h1>
              <div className="w-20 h-1 bg-amber-500 mx-auto"></div>
            </motion.div>
          </div>
        </div>

        {/* Content Details Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Column: Text Content */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="inline-block bg-amber-50 text-amber-800 px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                  Established Excellence
                </div>
                <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-800 leading-tight">
                  A Passion For Designing Extraordinary Spaces
                </h2>
                <div className="w-12 h-1 bg-amber-500"></div>
                <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
                  {aboutContent}
                </p>
              </motion.div>

              {/* Right Column: Dynamic Image Frame */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="absolute -inset-4 bg-amber-500/10 rounded-2xl transform rotate-2 z-0"></div>
                <div className="relative border-4 border-white shadow-2xl rounded-xl overflow-hidden z-10 aspect-[4/3]">
                  <img 
                    src={aboutImage} 
                    alt="Estilo interior design studio" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Vision & Mission Cards */}
        <section className="py-20 bg-gray-50 border-t border-gray-100">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Vision Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-white p-8 md:p-10 rounded-2xl shadow-md border-t-4 border-amber-500 flex flex-col justify-between"
              >
                <div>
                  <div className="bg-amber-50 p-4 rounded-xl inline-block mb-6">
                    <Compass className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="text-2xl font-bold font-serif text-gray-800 mb-4">Our Vision</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {aboutVision}
                  </p>
                </div>
              </motion.div>

              {/* Mission Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white p-8 md:p-10 rounded-2xl shadow-md border-t-4 border-amber-600 flex flex-col justify-between"
              >
                <div>
                  <div className="bg-amber-50 p-4 rounded-xl inline-block mb-6">
                    <Target className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="text-2xl font-bold font-serif text-gray-800 mb-4">Our Mission</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {aboutMission}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Core Values banner */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-5xl text-center">
            <h3 className="text-3xl font-bold font-serif text-gray-800 mb-12">Why Clients Trust Estilo</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="space-y-3">
                <ShieldCheck className="h-10 w-10 text-amber-500 mx-auto" />
                <h4 className="font-bold text-lg text-gray-800">Unmatched Quality</h4>
                <p className="text-sm text-gray-500">Premium materials sourced from authentic suppliers.</p>
              </div>
              <div className="space-y-3">
                <ShieldCheck className="h-10 w-10 text-amber-500 mx-auto" />
                <h4 className="font-bold text-lg text-gray-800">Bespoke Designs</h4>
                <p className="text-sm text-gray-500">Every design is custom-crafted to reflect your personality.</p>
              </div>
              <div className="space-y-3">
                <ShieldCheck className="h-10 w-10 text-amber-500 mx-auto" />
                <h4 className="font-bold text-lg text-gray-800">Seamless Execution</h4>
                <p className="text-sm text-gray-500">Turnkey solutions with project management from start to finish.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
