import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calculator as CalculatorIcon, Ruler, Home, Palette, Coins, Briefcase, Sofa } from "lucide-react";

type RoomType = "living" | "bedroom" | "kitchen" | "bathroom";
type Style = "minimalist" | "luxury" | "modern" | "traditional";

const ROOM_TYPES = {
  living: { name: "Living Room", baseRate: 100 },
  bedroom: { name: "Bedroom", baseRate: 80 },
  kitchen: { name: "Kitchen", baseRate: 150 },
  bathroom: { name: "Bathroom", baseRate: 120 }
};

const STYLE_MULTIPLIERS = {
  minimalist: { name: "Minimalist", rate: 1 },
  modern: { name: "Modern", rate: 1.2 },
  traditional: { name: "Traditional", rate: 1.3 },
  luxury: { name: "Luxury", rate: 1.5 }
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

  // Background image URL
  const calculatorBgImage = "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop";

  const calculateEstimate = () => {
    if (!size || size <= 0) return;
    
    setIsCalculating(true);
    
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
    }, 800);
  };

  const getStyleDescription = () => {
    switch(style) {
      case "minimalist":
        return "Clean lines, neutral colors, and functional spaces with minimal decoration.";
      case "modern":
        return "Contemporary design with bold colors, innovative materials, and sleek furnishings.";
      case "traditional":
        return "Classic design elements with rich colors, detailed woodwork, and elegant furnishings.";
      case "luxury":
        return "High-end finishes, premium materials, and sophisticated design elements.";
      default:
        return "";
    }
  };

  const getRoomTypeIcon = () => {
    switch(roomType) {
      case "living":
        return <Sofa className="h-6 w-6" />;
      case "bedroom":
        return <Home className="h-6 w-6" />;
      case "kitchen":
        return <Briefcase className="h-6 w-6" />;
      case "bathroom":
        return <Home className="h-6 w-6" />;
      default:
        return <Home className="h-6 w-6" />;
    }
  };

  return (
    <div 
      className="py-20 min-h-screen bg-cover bg-center bg-fixed" 
      style={{ 
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url(${calculatorBgImage})` 
      }}
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gray-100 p-3 rounded-full">
              <CalculatorIcon className="h-8 w-8 text-gray-700" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Interior Design Calculator</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Estimate the cost of your interior design project based on your room size and preferences.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="shadow-lg border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b">
                <h2 className="text-xl font-semibold flex items-center">
                  <Ruler className="mr-2 h-5 w-5" />
                  Project Details
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Enter your room details to get a cost estimate
                </p>
              </div>
              
              <CardContent className="p-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label htmlFor="size" className="text-gray-700 flex items-center">
                      <Ruler className="mr-2 h-4 w-4" />
                      Room Size (sq ft)
                    </Label>
                    <div className="relative">
                      <Input
                        id="size"
                        type="number"
                        placeholder="Enter room size"
                        value={size || ""}
                        onChange={(e) => setSize(Number(e.target.value))}
                        className="pl-10 border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Ruler className="h-4 w-4" />
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Enter the total square footage of your room</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-700 flex items-center">
                      <Home className="mr-2 h-4 w-4" />
                      Room Type
                    </Label>
                    <Select value={roomType} onValueChange={(value) => setRoomType(value as RoomType)}>
                      <SelectTrigger className="border-gray-300 focus:border-gray-500 focus:ring-gray-500">
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
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 flex items-center">
                    <Palette className="mr-2 h-4 w-4" />
                    Design Style
                  </Label>
                  <Select value={style} onValueChange={(value) => setStyle(value as Style)}>
                    <SelectTrigger className="border-gray-300 focus:border-gray-500 focus:ring-gray-500">
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

                <div className="pt-4">
                  <Button 
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white py-6 transition-all duration-200"
                    onClick={calculateEstimate}
                    disabled={!size || size <= 0 || isCalculating}
                  >
                    {isCalculating ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Calculating...
                      </div>
                    ) : (
                      <>
                        <CalculatorIcon className="mr-2 h-5 w-5" />
                        Calculate Estimate
                      </>
                    )}
                  </Button>
                </div>

                {estimate && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 space-y-4"
                  >
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                      <div className="flex items-center mb-4">
                        <div className="bg-gray-200 p-2 rounded-full mr-3">
                          <Coins className="h-5 w-5 text-gray-700" />
                        </div>
                        <h3 className="text-xl font-semibold">Cost Breakdown</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-600 flex items-center">
                                <Palette className="h-4 w-4 mr-1 text-gray-400" />
                                Materials
                              </span>
                              <span className="text-lg font-medium">₹{estimate.materials.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div 
                                className="bg-blue-500 h-1.5 rounded-full" 
                                style={{ width: `${(estimate.materials / estimate.total) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-600 flex items-center">
                                <Briefcase className="h-4 w-4 mr-1 text-gray-400" />
                                Labor
                              </span>
                              <span className="text-lg font-medium">₹{estimate.labor.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div 
                                className="bg-green-500 h-1.5 rounded-full" 
                                style={{ width: `${(estimate.labor / estimate.total) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-600 flex items-center">
                                <Sofa className="h-4 w-4 mr-1 text-gray-400" />
                                Furniture
                              </span>
                              <span className="text-lg font-medium">₹{estimate.furniture.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div 
                                className="bg-amber-500 h-1.5 rounded-full" 
                                style={{ width: `${(estimate.furniture / estimate.total) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-800 text-white p-5 rounded-lg mt-4 flex justify-between items-center">
                          <span className="font-medium">Total Estimate:</span>
                          <span className="text-2xl font-bold">₹{estimate.total.toLocaleString()}</span>
                        </div>
                        
                        <p className="text-sm text-gray-500 text-center mt-4">
                          This is an approximate estimate. Contact us for a detailed quote.
                        </p>
                        
                        <div className="flex justify-center mt-4">
                          <Button className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                            Book a Consultation
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
