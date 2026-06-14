import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Calculator as CalculatorIcon, Ruler, Home, Palette, Coins, Briefcase, Sofa, 
  ArrowRight, CheckCircle, Info, ChevronRight, RefreshCw, IndianRupee, Sparkles 
} from "lucide-react";
import SEOMetaTags from "@/components/SEOMetaTags";

type BHKType = "1bhk" | "2bhk" | "3bhk" | "4bhk" | "kitchen_only" | "wardrobe_only";
type PackageTier = "essential" | "premium" | "luxury";

const BHK_CONFIGS = {
  "1bhk": { name: "1 BHK Apartment", baseSize: 600 },
  "2bhk": { name: "2 BHK Apartment", baseSize: 950 },
  "3bhk": { name: "3 BHK Apartment", baseSize: 1400 },
  "4bhk": { name: "4 BHK Apartment", baseSize: 2000 },
  "kitchen_only": { name: "Modular Kitchen Only", baseSize: 120 },
  "wardrobe_only": { name: "Wardrobes Only", baseSize: 0 }
};

const PACKAGES = {
  essential: {
    name: "Essential / Basic",
    description: "Budget-friendly functional designs",
    materials: [
      "Commercial MDF & Particle Board structure",
      "Standard matte laminates (0.8mm)",
      "Standard steel handles & wire baskets",
      "Standard painting (emulsion)",
      "Generic soft-close cabinet hinges"
    ]
  },
  premium: {
    name: "Premium / Standard",
    description: "Durable, high-finish quality for homes",
    materials: [
      "Commercial MR Plywood (moisture resistant)",
      "High-gloss laminates or acrylic finishes (1.0mm)",
      "Hettich / Hafele soft-close channels & hinges",
      "Branded modular accessories & tandem drawers",
      "Premium plastic emulsion paint (Asian Paints / Berger)",
      "Premium false ceiling (Gypsum board with LED spot lights)"
    ]
  },
  luxury: {
    name: "Luxury / Elite",
    description: "Exquisite finishes and custom smart units",
    materials: [
      "Boiling Water Resistant (BWR) Plywood / HDHMR",
      "Premium PU Paint, Acrylic, or Natural Veneer finishes",
      "Hafele / Blum premium Blumotion runners & hinges",
      "Italian quartz or premium granite countertop for kitchen",
      "Smart pull-outs, tall units & profile lighting",
      "Designer false ceiling with ambient cove lighting",
      "Royal luxury emulsion & customized wallpaper options"
    ]
  }
};

export default function Calculator() {
  const [bhk, setBhk] = useState<BHKType>("2bhk");
  const [size, setSize] = useState<number>(950);
  const [packageTier, setPackageTier] = useState<PackageTier>("premium");
  const [wardrobeCount, setWardrobeCount] = useState<number>(2);
  
  // Additional Add-ons
  const [addCeiling, setAddCeiling] = useState(true);
  const [addPainting, setAddPainting] = useState(true);
  const [addTVUnit, setAddTVUnit] = useState(true);
  const [addStudyTable, setAddStudyTable] = useState(false);

  const [estimate, setEstimate] = useState<{
    baseInterior: number;
    wardrobes: number;
    falseCeiling: number;
    painting: number;
    tvUnit: number;
    studyUnit: number;
    subtotal: number;
    gst: number;
    designFee: number;
    total: number;
  } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    // Automatically set default base size when BHK type changes
    if (BHK_CONFIGS[bhk].baseSize > 0) {
      setSize(BHK_CONFIGS[bhk].baseSize);
    } else {
      setSize(0);
    }
  }, [bhk]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const calculateEstimate = () => {
    setIsCalculating(true);
    setEstimate(null);

    setTimeout(() => {
      // 1. Base BHK Pricing (includes modular kitchen, modular storage, standard layouts)
      let baseRateMap: Record<BHKType, Record<PackageTier, number>> = {
        "1bhk": { essential: 195000, premium: 320000, luxury: 550000 },
        "2bhk": { essential: 295000, premium: 480000, luxury: 820000 },
        "3bhk": { essential: 420000, premium: 690000, luxury: 1150000 },
        "4bhk": { essential: 580000, premium: 950000, luxury: 1550000 },
        "kitchen_only": { essential: 95000, premium: 175000, luxury: 320000 },
        "wardrobe_only": { essential: 0, premium: 0, luxury: 0 } // Computed strictly by count
      };

      const baseInterior = baseRateMap[bhk][packageTier];

      // 2. Wardrobes (per wardrobe unit, average size 6x7 ft)
      let wardrobeRateMap: Record<PackageTier, number> = {
        essential: 35000,
        premium: 55000,
        luxury: 95000
      };
      const wardrobes = wardrobeCount * wardrobeRateMap[packageTier];

      // 3. False Ceiling & Lighting (per sq ft of property size)
      let ceilingRateMap: Record<PackageTier, number> = {
        essential: 85,
        premium: 125,
        luxury: 195
      };
      // Usually covers Living room and Bedrooms (~60% of total apartment size)
      const falseCeiling = addCeiling ? (size * 0.6) * ceilingRateMap[packageTier] : 0;

      // 4. Painting (estimated at ₹30, ₹50, or ₹90 per sq ft of carpet size)
      let paintRateMap: Record<PackageTier, number> = {
        essential: 30,
        premium: 55,
        luxury: 95
      };
      const painting = addPainting ? (size * paintRateMap[packageTier]) : 0;

      // 5. Branded TV Unit Add-on
      let tvRateMap: Record<PackageTier, number> = {
        essential: 22000,
        premium: 38000,
        luxury: 75000
      };
      const tvUnit = addTVUnit ? tvRateMap[packageTier] : 0;

      // 6. Custom Study Table Add-on
      let studyRateMap: Record<PackageTier, number> = {
        essential: 12000,
        premium: 22000,
        luxury: 45000
      };
      const studyUnit = addStudyTable ? studyRateMap[packageTier] : 0;

      // Subtotals & Taxes
      const subtotal = baseInterior + wardrobes + falseCeiling + painting + tvUnit + studyUnit;
      const gst = subtotal * 0.18; // 18% GST standard in India
      const designFee = subtotal * 0.10; // 10% Design and Project Management fee
      const total = subtotal + gst + designFee;

      setEstimate({
        baseInterior,
        wardrobes,
        falseCeiling,
        painting,
        tvUnit,
        studyUnit,
        subtotal,
        gst,
        designFee,
        total
      });
      setIsCalculating(false);
    }, 1200);
  };

  const calculatorBgImage = "https://images.unsplash.com/photo-1600210492493-0946911123ea?q=80&w=2874";

  return (
    <>
      <SEOMetaTags 
        title="Interior Design Cost Calculator - Estilo Bangalore" 
        description="Estimate your home renovation budget with our localized BHK interior design cost calculator for modular kitchens, wardrobes, and false ceilings in India."
      />

      <div className="relative overflow-hidden bg-white">
        {/* Luxury Hero Banner */}
        <div className="relative h-[45vh] flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{
              backgroundImage: `url(${calculatorBgImage})`,
              transform: `translateY(${scrollY * 0.3}px)`,
              filter: 'brightness(0.65)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/50" />
          
          <div className="container relative z-10 mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex bg-white/10 backdrop-blur-sm p-3 rounded-full mb-4 border border-white/20">
                <CalculatorIcon className="h-7 w-7 text-amber-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-serif text-white mb-3 tracking-tight">Interior Cost Estimator</h1>
              <p className="text-lg text-gray-200 max-w-2xl mx-auto">
                Get a realistic budget estimate based on standard modular materials and interior execution rates in India.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Calculator Body */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              
              {/* Form Configurator: 7 Columns */}
              <div className="lg:col-span-7 space-y-6">
                <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
                  <div className="bg-gray-900 text-white p-6">
                    <h2 className="text-xl font-bold font-serif flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-amber-400" />
                      Configure Your Budget
                    </h2>
                    <p className="text-gray-400 text-xs mt-1">Select your space specifications & choice of modular materials</p>
                  </div>
                  
                  <CardContent className="p-6 space-y-6">
                    {/* BHK / Configuration Selector */}
                    <div className="space-y-2">
                      <Label htmlFor="bhk" className="text-sm font-semibold text-gray-700">Property Configuration</Label>
                      <Select value={bhk} onValueChange={(value) => setBhk(value as BHKType)}>
                        <SelectTrigger className="border-gray-200 focus:ring-amber-500 focus:border-amber-500 h-11">
                          <SelectValue placeholder="Select BHK type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(BHK_CONFIGS).map(([key, config]) => (
                            <SelectItem key={key} value={key}>{config.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Carpet Area */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="size" className="text-sm font-semibold text-gray-700">Approx. Carpet Area (sq ft)</Label>
                        <span className="text-xs bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-full">{size} Sq Ft</span>
                      </div>
                      <div className="relative">
                        <Input
                          id="size"
                          type="number"
                          placeholder="Enter built up area"
                          value={size || ""}
                          onChange={(e) => setSize(Number(e.target.value))}
                          className="pl-10 border-gray-200 focus:ring-amber-500 focus:border-amber-500 h-11"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <Ruler className="h-4 w-4" />
                        </span>
                      </div>
                    </div>

                    {/* Wardrobe count */}
                    {bhk !== "kitchen_only" && (
                      <div className="space-y-2">
                        <Label htmlFor="wardrobe" className="text-sm font-semibold text-gray-700">Number of Wardrobes Needed</Label>
                        <Select value={wardrobeCount.toString()} onValueChange={(val) => setWardrobeCount(Number(val))}>
                          <SelectTrigger className="border-gray-200 focus:ring-amber-500 focus:border-amber-500 h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                              <SelectItem key={num} value={num.toString()}>{num} {num === 1 ? 'Wardrobe' : 'Wardrobes'}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Package Selection */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-700">Materials Quality Package</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(PACKAGES).map(([key, pkg]) => {
                          const active = packageTier === key;
                          return (
                            <div
                              key={key}
                              onClick={() => setPackageTier(key as PackageTier)}
                              className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                                active 
                                  ? "border-amber-500 bg-amber-50/40 shadow-sm" 
                                  : "border-gray-100 hover:border-gray-200 bg-white"
                              }`}
                            >
                              <div>
                                <h3 className="font-bold text-sm text-gray-900">{pkg.name}</h3>
                                <p className="text-xs text-gray-500 mt-1 leading-tight">{pkg.description}</p>
                              </div>
                              <div className="mt-3 flex justify-between items-center">
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                                  key === 'essential' ? 'bg-gray-100 text-gray-700' :
                                  key === 'premium' ? 'bg-amber-100 text-amber-800' :
                                  'bg-purple-100 text-purple-800'
                                }`}>
                                  {key}
                                </span>
                                {active && <CheckCircle className="h-4 w-4 text-amber-500" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Package Detail Box */}
                      <div className="bg-gray-50 rounded-xl p-4 mt-3 border border-gray-100">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Package Specs Include:</h4>
                        <ul className="text-xs text-gray-600 space-y-1.5 grid grid-cols-1 md:grid-cols-2 gap-x-4">
                          {PACKAGES[packageTier].materials.map((m, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="text-amber-500 mt-0.5">▪</span>
                              <span>{m}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <Separator />

                    {/* Add-ons Checkboxes */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-700">Additional Services & Add-ons</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors">
                          <Checkbox 
                            id="addCeiling" 
                            checked={addCeiling} 
                            onCheckedChange={(c) => setAddCeiling(c === true)} 
                            className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                          />
                          <div className="grid gap-0.5 leading-none">
                            <label htmlFor="addCeiling" className="text-sm font-semibold text-gray-800 cursor-pointer">False Ceiling & Lights</label>
                            <span className="text-[10px] text-gray-400">Designer false ceilings for living/bedrooms</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors">
                          <Checkbox 
                            id="addPainting" 
                            checked={addPainting} 
                            onCheckedChange={(c) => setAddPainting(c === true)}
                            className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                          />
                          <div className="grid gap-0.5 leading-none">
                            <label htmlFor="addPainting" className="text-sm font-semibold text-gray-800 cursor-pointer">Wall Painting</label>
                            <span className="text-[10px] text-gray-400">Complete apartment painting & base preparation</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors">
                          <Checkbox 
                            id="addTV" 
                            checked={addTVUnit} 
                            onCheckedChange={(c) => setAddTVUnit(c === true)}
                            className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                          />
                          <div className="grid gap-0.5 leading-none">
                            <label htmlFor="addTV" className="text-sm font-semibold text-gray-800 cursor-pointer">Entertainment TV Unit</label>
                            <span className="text-[10px] text-gray-400">Custom TV cabinet with ledges and backing</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors">
                          <Checkbox 
                            id="addStudy" 
                            checked={addStudyTable} 
                            onCheckedChange={(c) => setAddStudyTable(c === true)}
                            className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                          />
                          <div className="grid gap-0.5 leading-none">
                            <label htmlFor="addStudy" className="text-sm font-semibold text-gray-800 cursor-pointer">Home Office / Study Desk</label>
                            <span className="text-[10px] text-gray-400">Compact study desk with overhead storage</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={calculateEstimate} 
                      disabled={isCalculating}
                      className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white font-medium text-base rounded-xl transition-all shadow-md"
                    >
                      {isCalculating ? (
                        <span className="flex items-center justify-center gap-2">
                          <RefreshCw className="h-5 w-5 animate-spin" /> Calculating Real Estimate...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1.5">
                          Calculate Estimate <ArrowRight className="h-5 w-5" />
                        </span>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Estimate Receipt Sidebar: 5 Columns */}
              <div className="lg:col-span-5 h-full">
                <AnimatePresence mode="wait">
                  {estimate ? (
                    <motion.div
                      key="estimate"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Card className="shadow-2xl border-0 rounded-2xl overflow-hidden bg-gray-50 border-t-8 border-amber-600">
                        {/* Receipt Header */}
                        <div className="bg-white p-6 border-b border-gray-100 text-center">
                          <h3 className="text-xs uppercase tracking-widest text-amber-600 font-bold mb-1">Detailed Estimate</h3>
                          <h2 className="text-2xl font-bold font-serif text-gray-900">Project Budget</h2>
                          <div className="inline-block bg-amber-50 text-amber-800 font-bold px-3 py-1 rounded-full text-xs mt-3">
                            {BHK_CONFIGS[bhk].name} • {PACKAGES[packageTier].name}
                          </div>
                        </div>

                        {/* Bill Items */}
                        <CardContent className="p-6 space-y-4">
                          <div className="space-y-3">
                            {estimate.baseInterior > 0 && (
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Base Interior Works</span>
                                <span className="font-semibold text-gray-800">₹{estimate.baseInterior.toLocaleString('en-IN')}</span>
                              </div>
                            )}
                            {estimate.wardrobes > 0 && (
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">{wardrobeCount} Custom Wardrobes</span>
                                <span className="font-semibold text-gray-800">₹{estimate.wardrobes.toLocaleString('en-IN')}</span>
                              </div>
                            )}
                            {estimate.falseCeiling > 0 && (
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">False Ceiling & Lights</span>
                                <span className="font-semibold text-gray-800">₹{estimate.falseCeiling.toLocaleString('en-IN')}</span>
                              </div>
                            )}
                            {estimate.painting > 0 && (
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Wall Painting & Prep</span>
                                <span className="font-semibold text-gray-800">₹{estimate.painting.toLocaleString('en-IN')}</span>
                              </div>
                            )}
                            {estimate.tvUnit > 0 && (
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Entertainment TV Cabinet</span>
                                <span className="font-semibold text-gray-800">₹{estimate.tvUnit.toLocaleString('en-IN')}</span>
                              </div>
                            )}
                            {estimate.studyUnit > 0 && (
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Custom Study Table Unit</span>
                                <span className="font-semibold text-gray-800">₹{estimate.studyUnit.toLocaleString('en-IN')}</span>
                              </div>
                            )}
                          </div>

                          <Separator className="bg-gray-200" />

                          {/* Subtotal & Taxes */}
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600 font-medium">
                              <span>Materials & Execution Subtotal</span>
                              <span>₹{estimate.subtotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                              <span className="flex items-center gap-1">
                                GST (18%) 
                                <Info className="h-3.5 w-3.5 text-gray-300 hover:text-amber-500 cursor-pointer" />
                              </span>
                              <span>₹{estimate.gst.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                              <span className="flex items-center gap-1">
                                Design & Supervision (10%)
                                <Info className="h-3.5 w-3.5 text-gray-300 hover:text-amber-500 cursor-pointer" />
                              </span>
                              <span>₹{estimate.designFee.toLocaleString('en-IN')}</span>
                            </div>
                          </div>

                          <div className="border-t-2 border-dashed border-gray-200 my-4"></div>

                          {/* Grand Total */}
                          <div className="bg-amber-600/10 p-4 rounded-xl flex justify-between items-center">
                            <div>
                              <span className="text-xs uppercase tracking-wider text-amber-800 font-bold">Estimated Grand Total</span>
                              <p className="text-[10px] text-amber-700/80 leading-none">Inclusive of materials, taxes & supervision</p>
                            </div>
                            <span className="text-3xl font-extrabold text-amber-600 flex items-center font-serif">
                              ₹{estimate.total.toLocaleString('en-IN')}
                            </span>
                          </div>

                          <div className="pt-4 space-y-3">
                            <a href="/booking" className="w-full">
                              <Button className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl flex items-center justify-center gap-2">
                                Book Free Consultation <ChevronRight size={18} />
                              </Button>
                            </a>
                            <p className="text-[10px] text-center text-gray-400">
                              *This is an approximate builder-grade estimate. Actual final costs vary depending on exact site measurement details, selections and custom architectural designs.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ) : (
                    <Card className="shadow-lg border-0 overflow-hidden h-[450px] flex flex-col justify-center items-center text-center p-8 bg-gray-50 border-t-8 border-gray-200">
                      <div className="bg-amber-50 p-6 rounded-full inline-block mb-4">
                        <IndianRupee className="h-10 w-10 text-amber-500" />
                      </div>
                      <h3 className="text-lg font-bold font-serif text-gray-800 mb-2">Estimate Not Generated</h3>
                      <p className="text-sm text-gray-500 max-w-xs mb-6">
                        Configure your home details on the left, then click Calculate to get an itemized budget calculation.
                      </p>
                    </Card>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-20 bg-gray-50 border-t border-gray-100">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold font-serif text-center text-gray-800 mb-10">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-2 font-serif">What materials are recommended for humid zones like kitchens?</h3>
                <p className="text-gray-600 text-sm">
                  In humid regions and damp zones, we recommend using **BWR Plywood (Boiling Water Resistant)** or **HDHMR (High Density High Moisture Resistant)** boards instead of MDF. These are standard in our Premium and Luxury packages.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-2 font-serif">Is GST included in the final bill of interior design?</h3>
                <p className="text-gray-600 text-sm">
                  Yes, in India, interior services and materials attract a standard **18% GST**. Our calculator explicitly details this value on the receipt breakdown so there are no surprise costs.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-2 font-serif">What is standard turnkey execution timeline?</h3>
                <p className="text-gray-600 text-sm">
                  For a 2 BHK apartment, standard turnkey execution takes about **45 to 60 days** from design sign-off. High-end customizations requiring PU coating, veneer polishing, or heavy automation might require 75+ days.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
