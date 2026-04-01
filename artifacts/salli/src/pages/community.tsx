import { Link } from "wouter";
import { Flame, Compass, Users, Award } from "lucide-react";
import { useGetLeaderboard } from "@workspace/api-client-react";
import type { LeaderboardEntry } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold border-2 border-amber-400 shadow-sm shrink-0">
        1
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold border-2 border-slate-300 shadow-sm shrink-0">
        2
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-700 flex items-center justify-center font-bold border-2 border-orange-300 shadow-sm shrink-0">
        3
      </div>
    );
  }
  
  return (
    <div className="w-10 h-10 rounded-full bg-muted/50 text-muted-foreground flex items-center justify-center font-medium shrink-0">
      {rank}
    </div>
  );
}

export default function Community() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  
  const { data: leaderboard, isLoading: isLeaderboardLoading } = useGetLeaderboard({
    query: {
      enabled: isAuthenticated,
    }
  });

  const isLoading = isAuthLoading || isLeaderboardLoading;

  if (!isAuthenticated && !isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
          <Users className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-foreground mb-4">Community Progress</h1>
        <p className="text-muted-foreground text-lg max-w-md mb-8">
          Join Salli to see community progress and get inspired by others.
        </p>
        <Link href="/login">
          <Button className="rounded-full px-8 py-6 text-lg shadow-lg" data-testid="button-login-prompt-community">
            Log in
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 max-w-3xl mx-auto">
      <header className="mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2 flex items-center justify-center sm:justify-start gap-3">
            <Users className="w-8 h-8 text-primary" />
            Community
          </h1>
          <p className="text-muted-foreground">See how the community is doing this week</p>
        </div>
      </header>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="border-border/50 shadow-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="hidden sm:block flex-1">
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
                <div className="shrink-0 w-24 space-y-2 flex flex-col items-end">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : leaderboard?.length === 0 ? (
        <Card className="border-dashed bg-muted/30">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif font-bold text-foreground mb-2">No data yet</h3>
            <p className="text-muted-foreground max-w-md">
              Be the first to log your prayers this week and inspire the community!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {leaderboard?.map((entry: LeaderboardEntry) => {
            const isCurrentUser = entry.isCurrentUser;
            
            return (
              <Card 
                key={entry.userId} 
                className={cn(
                  "transition-all overflow-hidden",
                  isCurrentUser 
                    ? "bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900 shadow-sm" 
                    : "glass border-border/50 shadow-sm hover:shadow-md"
                )}
              >
                <CardContent className="p-4 sm:p-5 flex items-center gap-4">
                  <RankBadge rank={entry.rank} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <h3 className={cn(
                        "font-bold truncate text-base sm:text-lg",
                        isCurrentUser ? "text-amber-900 dark:text-amber-100" : "text-foreground"
                      )}>
                        {entry.displayName}
                        {isCurrentUser && <span className="ml-2 text-xs font-normal text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-full">You</span>}
                      </h3>
                    </div>
                    {entry.city && (
                      <p className="text-xs text-muted-foreground truncate">{entry.city}</p>
                    )}
                    
                    {/* Mobile Progress */}
                    <div className="sm:hidden mt-3 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-medium">{entry.weeklyTotal}/35 prayers</span>
                        {entry.currentStreak > 0 && (
                          <span className="flex items-center gap-1 text-orange-500 font-medium">
                            <Flame className="w-3 h-3" />
                            {entry.currentStreak}-day streak
                          </span>
                        )}
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${entry.weeklyPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Desktop Progress */}
                  <div className="hidden sm:block flex-1 max-w-[200px] lg:max-w-[300px] mx-4">
                    <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden mb-1.5">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${entry.weeklyPercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground font-medium text-right">{entry.weeklyTotal} / 35 prayers</p>
                  </div>
                  
                  {/* Desktop Streak */}
                  <div className="hidden sm:flex shrink-0 w-28 flex-col items-end justify-center">
                    {entry.currentStreak > 0 ? (
                      <div className="flex items-center gap-1.5 text-sm font-medium text-orange-500 bg-orange-500/10 px-2.5 py-1 rounded-full">
                        <Flame className="w-4 h-4" />
                        {entry.currentStreak} day{entry.currentStreak !== 1 && 's'}
                      </div>
                    ) : (
                      <div className="text-sm font-medium text-muted-foreground/50">
                        Just started
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
