import { useState, useMemo } from "react";
import { usePrayers } from "@/hooks/use-prayers";
import { startOfWeek, format } from "date-fns";
import { Trophy, Flame, Star, Award, Medal, Crown, Shield, Activity, Users, Sunrise, Moon, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { PRAYER_NAMES, getPrayerDisplayName } from "@/lib/prayer-times";

export default function Dashboard() {
  const { getStreak, getTotalPrayers, getWeeklyStats } = usePrayers();
  const [currentDate] = useState(new Date());
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
  const weeklyStats = getWeeklyStats(weekStart);
  const streak = getStreak();
  const totalPrayers = getTotalPrayers();

  const BADGES = [
    { id: "first", title: "First Step", desc: "Log your first prayer", icon: Star, condition: totalPrayers >= 1, color: "text-amber-500", bg: "bg-amber-500/10" },
    { id: "streak-3", title: "3-Day Streak", desc: "Complete all prayers for 3 days", icon: Flame, condition: streak >= 3, color: "text-orange-500", bg: "bg-orange-500/10" },
    { id: "streak-7", title: "Full Week", desc: "Perfect week of prayers", icon: Award, condition: streak >= 7, color: "text-primary", bg: "bg-primary/10" },
    { id: "total-50", title: "Consistent", desc: "Log 50 total prayers", icon: Activity, condition: totalPrayers >= 50, color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "streak-30", title: "Month Warrior", desc: "30-day perfect streak", icon: Crown, condition: streak >= 30, color: "text-purple-500", bg: "bg-purple-500/10" },
    { id: "total-150", title: "Diamond Devotee", desc: "Log 150 total prayers", icon: Trophy, condition: totalPrayers >= 150, color: "text-teal-400", bg: "bg-teal-400/10" },
    { id: "fajr-bird", title: "Early Bird", desc: "Never miss Fajr (symbolic)", icon: Sunrise, condition: totalPrayers >= 20, color: "text-yellow-500", bg: "bg-yellow-500/10" }, // Mock condition
    { id: "isha-owl", title: "Night Owl", desc: "Never miss Isha (symbolic)", icon: Moon, condition: totalPrayers >= 20, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  ];

  // For Early Bird and Night Owl, we'll just use simple imports if we need them, or fallback to generic icons
  // Replacing custom missing icons with generic lucide ones since we didn't import Sunrise/Moon at top
  const badgesWithIcons = BADGES.map(b => {
    if (b.id === 'fajr-bird') return { ...b, icon: Star };
    if (b.id === 'isha-owl') return { ...b, icon: Moon };
    return b;
  });

  const getMotivationalMessage = () => {
    if (streak === 0) return "Every day is a fresh start. Bismillah.";
    if (streak < 3) return "You're off to a great start. Keep the momentum going!";
    if (streak < 7) return "Masha'Allah, beautiful consistency. Keep it up!";
    if (streak < 30) return "Incredible dedication. Allah loves consistent deeds.";
    return "Outstanding! You are a true inspiration.";
  };

  const MOCK_FRIENDS = [
    { name: "Ahmed", percent: 92, avatar: "A" },
    { name: "Fatima", percent: 85, avatar: "F" },
    { name: "Omar", percent: 60, avatar: "O" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <header className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Your Progress</h1>
        <p className="text-muted-foreground">{getMotivationalMessage()}</p>
      </header>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <div className="glass rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center mb-3">
            <Flame className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Current Streak</p>
          <h3 className="text-3xl font-serif font-bold text-foreground">{streak} <span className="text-lg font-sans font-normal text-muted-foreground">days</span></h3>
        </div>
        
        <div className="glass rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
            <Activity className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Total Prayers</p>
          <h3 className="text-3xl font-serif font-bold text-foreground">{totalPrayers}</h3>
        </div>
        
        <div className="glass rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm col-span-2 md:col-span-1">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">Weekly Goal</span>
            <span className="text-sm font-bold text-primary">{weeklyStats.percentage}%</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${weeklyStats.percentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground w-full text-right">{weeklyStats.completed} / {weeklyStats.total}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Weekly Tracker Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-serif font-bold text-foreground mb-6">Weekly Tracker</h2>
            
            <div className="overflow-x-auto">
              <div className="min-w-[500px]">
                {/* Header Row */}
                <div className="grid grid-cols-6 gap-2 mb-4">
                  <div className="text-sm font-medium text-muted-foreground">Day</div>
                  {PRAYER_NAMES.map(prayer => (
                    <div key={prayer} className="text-sm font-medium text-muted-foreground text-center capitalize">
                      {prayer}
                    </div>
                  ))}
                </div>
                
                {/* Days Rows */}
                <div className="space-y-3">
                  {weeklyStats.weekDays.map((day) => {
                    const isToday = day.dateStr === format(new Date(), 'yyyy-MM-dd');
                    return (
                      <div key={day.dateStr} className={cn(
                        "grid grid-cols-6 gap-2 p-2 rounded-xl items-center",
                        isToday ? "bg-primary/5" : ""
                      )}>
                        <div className="text-sm font-medium">
                          <span className="block">{format(day.date, 'EEE')}</span>
                          <span className="text-xs text-muted-foreground">{format(day.date, 'MMM d')}</span>
                        </div>
                        
                        {PRAYER_NAMES.map(prayer => {
                          const isCompleted = day.data[prayer];
                          return (
                            <div key={`${day.dateStr}-${prayer}`} className="flex justify-center">
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                                isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-transparent"
                              )}>
                                <Check className="w-4 h-4" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Friends Section */}
          <div className="glass rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-serif font-bold text-foreground">Community</h2>
            </div>
            
            <div className="space-y-4">
              {MOCK_FRIENDS.map((friend, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 text-secondary-foreground flex items-center justify-center font-bold">
                    {friend.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{friend.name}</span>
                      <span className="text-xs font-bold text-muted-foreground">{friend.percent}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-secondary transition-all"
                        style={{ width: `${friend.percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <div className="glass rounded-3xl p-6 shadow-sm self-start">
          <h2 className="text-xl font-serif font-bold text-foreground mb-6">Achievements</h2>
          
          <div className="grid grid-cols-2 gap-4">
            {badgesWithIcons.map((badge) => {
              const Icon = badge.icon;
              return (
                <div 
                  key={badge.id} 
                  className={cn(
                    "flex flex-col items-center text-center p-4 rounded-2xl transition-all duration-300",
                    badge.condition 
                      ? "bg-background border border-border shadow-sm" 
                      : "bg-muted/50 border border-transparent opacity-60 grayscale"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mb-3",
                    badge.condition ? badge.bg : "bg-muted",
                    badge.condition ? badge.color : "text-muted-foreground"
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-medium text-sm mb-1">{badge.title}</h4>
                  <p className="text-[10px] text-muted-foreground leading-tight">{badge.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
