import { useState, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useReducedMotion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowDownCircle, Loader2, X, ZoomIn, ExternalLink, Grid, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import SEOMetaTags from "@/components/SEOMetaTags";

interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
}

const samplePortfolioItems: PortfolioItem[] = [
  {
    id: 1,
    title: "Modern Living Room Design",
    description: "A minimalist approach with comfortable furniture and natural lighting.",
    imageUrl: "https://images.unsplash.com/photo-1615529328331-f8917597711f?auto=format&fit=crop&w=800&q=80",
    category: "Living Room",
  },
  {
    id: 2,
    title: "Contemporary Kitchen Renovation",
    description: "Sleek kitchen with state-of-the-art appliances and efficient layout.",
    imageUrl: "https://images.unsplash.com/photo-1556912998-c57cc6b63cd7?auto=format&fit=crop&w=800&q=80",
    category: "Kitchen",
  },
  {
    id: 3,
    title: "Serene Bedroom Retreat",
    description: "Calming space designed for optimal rest with soft textures.",
    imageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80",
    category: "Bedroom",
  },
  {
    id: 4,
    title: "Elegant Dining Room",
    description: "Sophisticated dining area for entertaining guests in style.",
    imageUrl: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80",
    category: "Dining Room",
  },
  {
    id: 5,
    title: "Spa-like Bathroom",
    description: "Luxurious bathroom providing a spa-like experience with premium fixtures.",
    imageUrl: "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=800&q=80",
    category: "Bathroom",
  },
  {
    id: 6,
    title: "Home Office Setup",
    description: "Productive workspace combining functionality with aesthetic appeal.",
    imageUrl: "https://images.unsplash.com/photo-1593476550610-87baa860004a?auto=format&fit=crop&w=800&q=80",
    category: "Office",
  },
];

/* ── Portfolio Card ──────────────────────────────────── */
function PortfolioCard({
  item,
  onClick,
  index,
}: {
  item: PortfolioItem;
  onClick: () => void;
  index: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      layout
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 40 }}
      whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55, delay: shouldReduceMotion ? 0 : index * 0.06 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      className="group relative rounded-2xl overflow-hidden cursor-pointer bg-white/5 border border-white/8 hover:border-amber-500/25 transition-all duration-500 shadow-xl hover:shadow-amber-500/10"
      aria-label={`View ${item.title}`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <motion.img
          src={item.imageUrl}
          alt={item.title}
          className="h-full w-full object-cover"
          animate={{ scale: hovered ? 1.08 : 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          loading="lazy"
        />

        {/* Category chip */}
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-amber-500/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
            {item.category}
          </span>
        </div>

        {/* Hover overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: hovered ? 1 : 0.8, opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
              <ZoomIn className="h-6 w-6 text-white" />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-white font-bold text-base mb-1.5 group-hover:text-amber-400 transition-colors duration-300 line-clamp-1">
          {item.title}
        </h3>
        <p className="text-white/50 text-sm leading-relaxed line-clamp-2">{item.description}</p>
        <motion.div
          className="mt-3 flex items-center gap-1.5 text-amber-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          animate={{ x: hovered ? 4 : 0 }}
        >
          View Details <ExternalLink className="h-3.5 w-3.5" />
        </motion.div>
      </div>

      {/* Bottom accent */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: hovered ? 1 : 0 }}
        style={{ transformOrigin: "left" }}
        transition={{ duration: 0.35 }}
      />
    </motion.article>
  );
}

/* ── Category Filter Button ─────────────────────────── */
function FilterBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-300",
        active
          ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20"
          : "bg-white/5 border-white/15 text-white/60 hover:bg-white/10 hover:border-white/30 hover:text-white/90"
      )}
    >
      {children}
    </motion.button>
  );
}

export default function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "masonry">("grid");
  const heroRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const { data: portfolioItems = [], isLoading, isError } = useQuery<PortfolioItem[]>({
    queryKey: ["/api/portfolio"],
  });

  const displayItems =
    portfolioItems?.length && !isError ? portfolioItems : samplePortfolioItems;

  const categories = Array.from(new Set(displayItems.map((item) => item.category)));

  const filteredItems = selectedCategory
    ? displayItems.filter((item) => item.category === selectedCategory)
    : displayItems;

  return (
    <>
      <SEOMetaTags
        title="Portfolio – Estilo Interior Design Projects Bangalore"
        description="Browse Estilo Interior's portfolio of luxury residential and commercial interior design projects in Bangalore."
      />

      <div className="relative overflow-hidden bg-[#0d0d0f]">

        {/* ── HERO ────────────────────────────────── */}
        <section ref={heroRef} className="relative h-[75svh] flex items-center justify-center overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-cover bg-center will-change-transform"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=2070&auto=format&fit=crop)",
              y: shouldReduceMotion ? 0 : bgY,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-[#0d0d0f]" />

          <motion.div
            style={{ y: shouldReduceMotion ? 0 : contentY, opacity: shouldReduceMotion ? 1 : opacity }}
            className="container relative z-10 mx-auto px-4 text-center"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-amber-500/15 backdrop-blur-md text-amber-300 px-5 py-2 rounded-full text-xs font-semibold mb-8 border border-amber-500/25 tracking-widest uppercase"
            >
              Our Work
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-5 font-serif leading-[0.95]"
            >
              Our <span className="text-amber-400">Portfolio</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Discover the transformative power of thoughtful design through our curated collection of interior projects.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="cursor-pointer"
              onClick={() => window.scrollTo({ top: window.innerHeight * 0.7, behavior: "smooth" })}
            >
              <ArrowDownCircle className="w-10 h-10 text-white/40 mx-auto animate-bounce" />
            </motion.div>
          </motion.div>
        </section>

        {/* ── GALLERY ─────────────────────────────── */}
        <section className="py-20 lg:py-28">
          <div className="container mx-auto px-4">

            {/* Filter Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              {/* Title */}
              <div className="text-center mb-8">
                <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest block mb-3">Explore</span>
                <h2 className="text-3xl lg:text-4xl font-bold text-white font-serif">Our Design Projects</h2>
              </div>

              {/* Filters + View toggle row */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap justify-center gap-2">
                  <FilterBtn active={selectedCategory === null} onClick={() => setSelectedCategory(null)}>
                    All Projects
                  </FilterBtn>
                  {categories.map((cat) => (
                    <FilterBtn key={cat} active={selectedCategory === cat} onClick={() => setSelectedCategory(cat)}>
                      {cat}
                    </FilterBtn>
                  ))}
                </div>

                {/* View mode toggle */}
                <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      viewMode === "grid" ? "bg-amber-500 text-white" : "text-white/40 hover:text-white/70"
                    )}
                    aria-label="Grid view"
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("masonry")}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      viewMode === "masonry" ? "bg-amber-500 text-white" : "text-white/40 hover:text-white/70"
                    )}
                    aria-label="Masonry view"
                  >
                    <Layers className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Results count */}
              <p className="text-white/30 text-sm mt-4 text-center">
                Showing {filteredItems.length} project{filteredItems.length !== 1 ? "s" : ""}
                {selectedCategory ? ` in ${selectedCategory}` : ""}
              </p>
            </motion.div>

            {/* Loading */}
            {isLoading && (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              </div>
            )}

            {/* Grid */}
            <AnimatePresence>
              <motion.div
                layout
                className={cn(
                  "gap-6",
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "columns-1 sm:columns-2 lg:columns-3 space-y-6"
                )}
              >
                {filteredItems.map((item, index) => (
                  <div key={item.id} className={viewMode === "masonry" ? "break-inside-avoid" : ""}>
                    <PortfolioCard
                      item={item}
                      index={index}
                      onClick={() => setSelectedItem(item)}
                    />
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>

            {filteredItems.length === 0 && !isLoading && (
              <div className="text-center py-20">
                <p className="text-white/40 text-lg">No projects found in this category.</p>
              </div>
            )}
          </div>
        </section>

        {/* ── IMAGE PREVIEW DIALOG ─────────────────── */}
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-5xl p-0 overflow-hidden bg-black/97 border border-white/10 rounded-2xl">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute right-4 top-4 z-50 rounded-full bg-white/10 p-2.5 text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20 border border-white/10"
              aria-label="Close preview"
            >
              <X className="h-5 w-5" />
            </button>

            {selectedItem && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.title}
                  className="w-full max-h-[75vh] object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-8">
                  <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest block mb-2">
                    {selectedItem.category}
                  </span>
                  <h3 className="text-2xl font-bold text-white mb-2 font-serif">{selectedItem.title}</h3>
                  <p className="text-white/70 text-sm max-w-xl">{selectedItem.description}</p>
                </div>
              </motion.div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
