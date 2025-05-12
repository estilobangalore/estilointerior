import { useState, useEffect, useRef } from "react";
import { Users, Heart, CheckCircle } from "lucide-react";

interface CounterProps {
  end: number;
  duration: number;
  label: string;
  icon: React.ReactNode;
  suffix?: string;
}

const Counter = ({ end, duration, label, icon, suffix = "" }: CounterProps) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);
  
  useEffect(() => {
    if (!isInView) return;
    
    let startTime: number;
    let animationFrame: number;
    
    const startAnimation = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      setCount(Math.floor(percentage * end));
      
      if (percentage < 1) {
        animationFrame = requestAnimationFrame(startAnimation);
      }
    };
    
    animationFrame = requestAnimationFrame(startAnimation);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, isInView]);
  
  return (
    <div ref={ref} className="text-center relative">
      <div className="inline-flex justify-center items-center w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-amber-50 to-amber-100 mb-4 sm:mb-6 shadow-md">
        <div className="text-amber-600">
          {icon}
        </div>
      </div>
      <h3 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2 sm:mb-3 flex justify-center items-center text-gray-800">
        <span>{isInView ? count : 0}</span>
        <span className="text-amber-500 ml-1">{suffix}</span>
      </h3>
      <p className="text-base sm:text-lg md:text-xl text-gray-600">
        {label}
      </p>
    </div>
  );
};

export default function StatsCounter() {
  return (
    <section className="py-16 sm:py-20 md:py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-800">Our Impact By Numbers</h2>
          <div className="w-16 sm:w-20 md:w-24 h-1 bg-amber-500 mx-auto mb-4 sm:mb-6"></div>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            We take pride in our track record of delivering exceptional interior design services to our valued clients.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-white rounded-xl -z-10 shadow-lg opacity-50"></div>
            <div className="p-6 sm:p-8 md:p-10">
              <Counter 
                end={250} 
                duration={2000} 
                label="Clients Served" 
                icon={<Users className="w-10 h-10 sm:w-12 sm:h-12" />}
                suffix="+"
              />
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-white rounded-xl -z-10 shadow-lg opacity-50"></div>
            <div className="p-6 sm:p-8 md:p-10">
              <Counter 
                end={98} 
                duration={2000} 
                label="Happy Customers" 
                icon={<Heart className="w-10 h-10 sm:w-12 sm:h-12" />}
                suffix="%"
              />
            </div>
          </div>
          
          <div className="relative sm:col-span-2 md:col-span-1">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-white rounded-xl -z-10 shadow-lg opacity-50"></div>
            <div className="p-6 sm:p-8 md:p-10">
              <Counter 
                end={500} 
                duration={2000} 
                label="Projects Completed" 
                icon={<CheckCircle className="w-10 h-10 sm:w-12 sm:h-12" />}
                suffix="+"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 