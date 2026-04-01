import { useState } from "react";
import { ChevronDown, Wind, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { KHUSHOO_TIPS } from "@/lib/data";

export default function Khushoo() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <header className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
          Focus & Presence in Prayer
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Khushu' is the soul of prayer. It is the stillness of the heart and the quietness of the limbs when standing before Allah.
        </p>
      </header>

      <div className="space-y-4 relative">
        {/* Decorative background element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-md bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />
        
        {KHUSHOO_TIPS.map((tip, index) => {
          const isOpen = openIndex === index;
          
          return (
            <div 
              key={index}
              className={cn(
                "glass rounded-2xl overflow-hidden transition-all duration-300",
                isOpen ? "shadow-md border-primary/30" : "hover:border-primary/20 shadow-sm"
              )}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                data-testid={`button-khushoo-tip-${index}`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-primary/50 font-serif text-xl font-bold italic w-6">
                    {index + 1}.
                  </span>
                  <h3 className={cn(
                    "font-medium text-lg transition-colors",
                    isOpen ? "text-primary" : "text-foreground"
                  )}>
                    {tip.title}
                  </h3>
                </div>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                  isOpen ? "bg-primary/10 text-primary" : "text-muted-foreground"
                )}>
                  <ChevronDown className={cn(
                    "w-5 h-5 transition-transform duration-300",
                    isOpen ? "rotate-180" : ""
                  )} />
                </div>
              </button>
              
              <div 
                className={cn(
                  "grid transition-all duration-300 ease-in-out",
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <div className="px-6 pb-6 pt-0 pl-16 text-muted-foreground leading-relaxed relative">
                    <Wind className="absolute top-0 right-6 w-16 h-16 text-primary/5 -rotate-12 pointer-events-none" />
                    <p>{tip.body}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-12 p-8 rounded-3xl bg-primary text-primary-foreground text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white_0%,transparent_100%)] mix-blend-overlay"></div>
        <p className="font-serif text-xl md:text-2xl relative z-10 italic">
          "The success of a believer lies in their prayer."
        </p>
      </div>
    </div>
  );
}
