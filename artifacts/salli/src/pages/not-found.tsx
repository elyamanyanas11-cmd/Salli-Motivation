import { Compass } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] w-full flex flex-col items-center justify-center p-4 text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 animate-pulse">
        <Compass className="w-10 h-10" />
      </div>
      <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
        Page Not Found
      </h1>
      <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">
        The path you are looking for seems to have been lost. Let's guide you back to familiar grounds.
      </p>
      <Link href="/">
        <button className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-all shadow-md active:scale-95" data-testid="button-return-home">
          Return Home
        </button>
      </Link>
    </div>
  );
}
