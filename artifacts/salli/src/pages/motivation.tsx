import { useState } from "react";
import { Share2, BookOpen, Quote } from "lucide-react";
import { getDailyMotivation, getPreviousMotivations } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

export default function Motivation() {
  const { toast } = useToast();
  const daily = getDailyMotivation();
  const previous = getPreviousMotivations(6);

  const handleShare = async () => {
    const text = `"${daily.content}"\n— ${daily.source}\n\nVia Salli`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Daily Inspiration',
          text: text,
        });
      } else {
        await navigator.clipboard.writeText(text);
        toast({
          title: "Copied to clipboard",
          description: "You can now share this quote with friends.",
        });
      }
    } catch (error) {
      toast({
        title: "Error sharing",
        description: "Failed to copy text.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-12 pb-12 relative">
      {/* Background container */}
      <div className="fixed inset-0 -z-10 pointer-events-none opacity-40">
        <img 
          src="/motivation-bg.png" 
          alt="" 
          className="w-full h-full object-cover mix-blend-soft-light"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background to-background" />
      </div>

      <header className="text-center pt-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10 text-secondary mb-4">
          <BookOpen className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Daily Inspiration</h1>
      </header>

      {/* Featured Quote */}
      <section className="relative max-w-4xl mx-auto glass rounded-[2.5rem] p-8 md:p-12 text-center shadow-lg border-secondary/20">
        <Quote className="w-12 h-12 text-secondary/30 mx-auto mb-6" />
        
        <blockquote className="text-2xl md:text-4xl font-serif leading-tight text-foreground mb-8">
          "{daily.content}"
        </blockquote>
        
        <cite className="block text-lg text-muted-foreground font-medium mb-8">
          — {daily.source}
        </cite>
        
        <button 
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-secondary text-secondary-foreground font-medium hover:bg-secondary/90 transition-transform active:scale-95 shadow-md shadow-secondary/20"
          data-testid="button-share-quote"
        >
          <Share2 className="w-4 h-4" />
          Share Today's Quote
        </button>
      </section>

      {/* Previous Quotes Grid */}
      <section className="max-w-5xl mx-auto">
        <h2 className="text-xl font-serif font-bold text-foreground mb-6 pl-2 border-l-4 border-primary">
          Previous Reflections
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {previous.map((quote, i) => (
            <div 
              key={i} 
              className="glass rounded-3xl p-6 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300"
            >
              <Quote className="w-6 h-6 text-primary/20 mb-4" />
              <blockquote className="text-foreground font-serif text-lg mb-4 flex-grow">
                "{quote.content}"
              </blockquote>
              <cite className="text-sm text-muted-foreground mt-auto pt-4 border-t border-border">
                {quote.source}
              </cite>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
