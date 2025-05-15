import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calculator as CalculatorIcon, Ruler, Home, Palette, Coins, Briefcase, Sofa, ArrowRight, CheckCircle, DollarSign, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type RoomType = "living" | "bedroom" | "kitchen" | "bathroom";
type Style = "minimalist" | "luxury" | "modern" | "traditional";

const ROOM_TYPES = {
  living: { name: "Living Room", baseRate: 100, icon: Sofa },
  bedroom: { name: "Bedroom", baseRate: 80, icon: Home },
  kitchen: { name: "Kitchen", baseRate: 150, icon: Briefcase },
  bathroom: { name: "Bathroom", baseRate: 120, icon: Home }
};

const STYLE_MULTIPLIERS = {
  minimalist: { name: "Minimalist", rate: 1, description: "Clean lines, neutral colors, and functional spaces with minimal decoration." },
  modern: { name: "Modern", rate: 1.2, description: "Contemporary design with bold colors, innovative materials, and sleek furnishings." },
  traditional: { name: "Traditional", rate: 1.3, description: "Classic design elements with rich colors, detailed woodwork, and elegant furnishings." },
  luxury: { name: "Luxury", rate: 1.5, description: "High-end finishes, premium materials, and sophisticated design elements." }
};

export default function Calculator() {
  const [size, setSize] = useState<number>(0);
  const [roomType, setRoomType] = useState<RoomType>("living");
  const [style, setStyle] = useState<Style>("minimalist");
  const [estimate, setEstimate] = useState<{
    furniture: number;
    labor: number;
    materials: number;
    total: number;
  } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showInfo, setShowInfo] = useState<"materials" | "labor" | "furniture" | null>(null);
  const [scrollY, setScrollY] = useState(0);

  // Background image URL - high quality modern interior design image
  const calculatorBgImage = "https://images.unsplash.com/photo-1600210492493-0946911123ea?q=80&w=2874&auto=format&fit=crop";

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const calculateEstimate = () => {
    if (!size || size <= 0) return;
    
    setIsCalculating(true);
    setEstimate(null);
    
    // Simulate calculation time for better UX
    setTimeout(() => {
      const baseRate = ROOM_TYPES[roomType].baseRate;
      const multiplier = STYLE_MULTIPLIERS[style].rate;
      const sqft = size || 0;

      const materials = baseRate * sqft * 0.4 * multiplier;
      const labor = baseRate * sqft * 0.3 * multiplier;
      const furniture = baseRate * sqft * 0.3 * multiplier;
      const total = materials + labor + furniture;

      setEstimate({
        materials: Math.round(materials),
        labor: Math.round(labor),
        furniture: Math.round(furniture),
        total: Math.round(total)
      });
      
      setIsCalculating(false);
    }, 1200);
  };

  const getStyleDescription = () => {
    return STYLE_MULTIPLIERS[style].description;
  };

  const getRoomTypeIcon = () => {
    const IconComponent = ROOM_TYPES[roomType].icon;
    return <IconComponent className="h-6 w-6" />;
  };

  return (
    <div className="relative overflow-hidden">
      {/* Hero section with parallax effect */}
      <div className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{
            backgroundImage: `url(${calculatorBgImage})`,
            transform: `translateY(${scrollY * 0.3}px)`,
            filter: 'brightness(0.7)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex bg-white/10 backdrop-blur-sm p-3 rounded-full mb-6">
              <CalculatorIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Design Cost Calculator</h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto mb-6">
              Get an instant estimate for your interior design project based on your requirements
            </p>
          </motion.div>
        </div>
      </div>
      
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12 text-center"
            >
              <h2 className="text-3xl font-bold mb-4 text-gray-800">Calculate Your Project Cost</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our calculator provides an estimate based on your room size, type, and design preferences. 
                Actual costs may vary based on specific requirements and materials.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Calculator Input Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="shadow-lg border-0 overflow-hidden h-full">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b">
                    <h2 className="text-xl font-semibold flex items-center">
                      <Ruler className="mr-2 h-5 w-5 text-amber-600" />
                      Project Details
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      Enter your room details to get a cost estimate
                    </p>
                  </div>
                  
                  <CardContent className="p-6 space-y-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="size" className="text-gray-700 flex items-center">
                          <Ruler className="mr-2 h-4 w-4 text-amber-600" />
                          Room Size (sq ft)
                        </Label>
                        <div className="relative">
                          <Input
                            id="size"
                            type="number"
                            placeholder="Enter room size"
                            value={size || ""}
                            onChange={(e) => setSize(Number(e.target.value))}
                            className="pl-10 border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Ruler className="h-4 w-4" />
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Enter the total square footage of your room</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-700 flex items-center">
                          <Home className="mr-2 h-4 w-4 text-amber-600" />
                          Room Type
                        </Label>
                        <Select value={roomType} onValueChange={(value) => setRoomType(value as RoomType)}>
                          <SelectTrigger className="border-gray-300 focus:border-amber-500 focus:ring-amber-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(ROOM_TYPES).map(([key, { name }]) => (
                              <SelectItem key={key} value={key}>
                                {name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500 mt-1">Base rate: ₹{ROOM_TYPES[roomType].baseRate} per sq ft</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-gray-700 flex items-center">
                          <Palette className="mr-2 h-4 w-4 text-amber-600" />
                          Design Style
                        </Label>
                        <Select value={style} onValueChange={(value) => setStyle(value as Style)}>
                          <SelectTrigger className="border-gray-300 focus:border-amber-500 focus:ring-amber-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(STYLE_MULTIPLIERS).map(([key, { name }]) => (
                              <SelectItem key={key} value={key}>
                                {name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500 mt-1">{getStyleDescription()}</p>
                      </div>
                      
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          onClick={calculateEstimate} 
                          disabled={!size || size <= 0 || isCalculating}
                          className="w-full py-6 mt-4 bg-amber-500 hover:bg-amber-600 text-white"
                        >
                          {isCalculating ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                              Calculating...
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              Calculate Estimate <ArrowRight className="ml-2 h-5 w-5" />
                            </div>
                          )}
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              {/* Results Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <AnimatePresence mode="wait">
                  {estimate ? (
                    <motion.div
                      key="estimate"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Card className="shadow-lg border-0 overflow-hidden h-full">
                        <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-6 border-b">
                          <h2 className="text-xl font-semibold flex items-center">
                            <Coins className="mr-2 h-5 w-5 text-amber-600" />
                            Cost Estimate
                          </h2>
                          <p className="text-gray-500 text-sm mt-1">
                            Based on {size} sq ft {ROOM_TYPES[roomType].name.toLowerCase()} with {STYLE_MULTIPLIERS[style].name.toLowerCase()} style
                          </p>
                        </div>
                        
                        <CardContent className="p-6">
                          <div className="mb-12 text-center py-6">
                            <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">Estimated Total Cost</p>
                            <div className="text-5xl font-bold text-amber-600 mb-2">₹{estimate.total.toLocaleString()}</div>
                            <p className="text-gray-500 text-sm">This is an approximate estimate and may vary</p>
                          </div>
                          
                          <Separator className="my-6" />
                          
                          <div className="space-y-6">
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center">
                                  <span className="text-gray-700 font-medium">Materials</span>
                                  <button 
                                    onClick={() => setShowInfo(showInfo === "materials" ? null : "materials")}
                                    className="ml-1 text-gray-400 hover:text-amber-500"
                                  >
                                    <Info size={16} />
                                  </button>
                                </div>
                                <span className="text-gray-900 font-semibold">₹{estimate.materials.toLocaleString()}</span>
                              </div>
                              {showInfo === "materials" && (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="bg-gray-50 p-3 rounded-md text-sm text-gray-600 mb-2"
                                >
                                  Includes all physical materials needed for your project: paint, wallpaper, flooring, tiles, fixtures, and more.
                                </motion.div>
                              )}
                              <Progress value={Math.round((estimate.materials / estimate.total) * 100)} className="h-2 bg-gray-100" indicatorClassName="bg-amber-500" />
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center">
                                  <span className="text-gray-700 font-medium">Labor</span>
                                  <button 
                                    onClick={() => setShowInfo(showInfo === "labor" ? null : "labor")}
                                    className="ml-1 text-gray-400 hover:text-amber-500"
                                  >
                                    <Info size={16} />
                                  </button>
                                </div>
                                <span className="text-gray-900 font-semibold">₹{estimate.labor.toLocaleString()}</span>
                              </div>
                              {showInfo === "labor" && (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="bg-gray-50 p-3 rounded-md text-sm text-gray-600 mb-2"
                                >
                                  Covers design services, project management, and installation work by professionals.
                                </motion.div>
                              )}
                              <Progress value={Math.round((estimate.labor / estimate.total) * 100)} className="h-2 bg-gray-100" indicatorClassName="bg-amber-500" />
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center">
                                  <span className="text-gray-700 font-medium">Furniture</span>
                                  <button 
                                    onClick={() => setShowInfo(showInfo === "furniture" ? null : "furniture")}
                                    className="ml-1 text-gray-400 hover:text-amber-500"
                                  >
                                    <Info size={16} />
                                  </button>
                                </div>
                                <span className="text-gray-900 font-semibold">₹{estimate.furniture.toLocaleString()}</span>
                              </div>
                              {showInfo === "furniture" && (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="bg-gray-50 p-3 rounded-md text-sm text-gray-600 mb-2"
                                >
                                  Includes all furniture pieces, decorative items, lighting fixtures, and accessories.
                                </motion.div>
                              )}
                              <Progress value={Math.round((estimate.furniture / estimate.total) * 100)} className="h-2 bg-gray-100" indicatorClassName="bg-amber-500" />
                            </div>
                          </div>
                          
                          <div className="mt-10">
                            <motion.div 
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button 
                                className="w-full py-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                                onClick={() => window.location.href = "/booking"}
                              >
                                <div className="flex items-center justify-center">
                                  Book a Consultation <CheckCircle className="ml-2 h-5 w-5" />
                                </div>
                              </Button>
                            </motion.div>
                            <p className="text-center text-gray-500 text-sm mt-4">
                              Get a detailed quote tailored to your specific requirements
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="preEstimate"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="h-full"
                    >
                      <Card className="shadow-lg border-0 overflow-hidden h-full flex flex-col bg-gray-50/50">
                        <div className="flex-grow flex flex-col items-center justify-center text-center p-12">
                          {isCalculating ? (
                            <div className="space-y-6">
                              <div className="w-16 h-16 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin mx-auto"></div>
                              <div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">Calculating Your Estimate</h3>
                                <p className="text-gray-500">Please wait while we process your information...</p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              <div className="bg-amber-100/50 p-6 rounded-full inline-block">
                                <CalculatorIcon className="h-12 w-12 text-amber-500" />
                              </div>
                              <div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready to Get Started?</h3>
                                <p className="text-gray-500 mb-4">
                                  Fill in your project details on the left to generate a cost estimate for your interior design project.
                                </p>
                                <div className="flex justify-center">
                                  <div className="inline-flex items-center gap-2 text-amber-600 text-sm font-medium">
                                    <ArrowRight size={16} className="animate-pulse" /> 
                                    Enter details and click Calculate
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-6 bg-gray-50">
                          <div className="grid grid-cols-3 gap-4 border-t border-gray-200 pt-6">
                            <div className="text-center">
                              <div className="text-amber-600 font-bold">40%</div>
                              <div className="text-xs text-gray-500">Materials</div>
                            </div>
                            <div className="text-center">
                              <div className="text-amber-600 font-bold">30%</div>
                              <div className="text-xs text-gray-500">Labor</div>
                            </div>
                            <div className="text-center">
                              <div className="text-amber-600 font-bold">30%</div>
                              <div className="text-xs text-gray-500">Furniture</div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-20 bg-gray-50"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-10 text-center text-gray-800">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">How accurate is this estimate?</h3>
                <p className="text-gray-600">
                  This calculator provides a general estimate based on average costs. Actual prices may vary depending on specific materials, labor rates in your area, and the complexity of your project.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">What's included in the materials cost?</h3>
                <p className="text-gray-600">
                  Materials include all physical items needed for your project such as paint, wallpaper, flooring materials, tiles, fixtures, hardware, and other decorative elements.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">How can I get a more detailed quote?</h3>
                <p className="text-gray-600">
                  For a personalized quote tailored to your specific requirements, we recommend booking a consultation with our design team. We'll assess your space, discuss your vision, and provide a comprehensive estimate.
                </p>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-6">Ready to transform your space?</p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <Button className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-6 rounded-md">
                  <div className="flex items-center">
                    Book a Free Consultation <ArrowRight className="ml-2 h-5 w-5" />
                  </div>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
