import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Check, ChevronRight, Moon, Sun, Sunrise, Sunset, Compass, MapPin, Bell } from "lucide-react";
import { HadithCarousel } from "@/components/hadith-carousel";
import { format } from "date-fns";
import { useGetPrayerDay, useMarkPrayer, useUnmarkPrayer, getGetPrayerDayQueryKey, getGetWeeklyPrayersQueryKey, getGetPrayerStatsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { PRAYER_NAMES, getPrayerDisplayName, PRAYER_SCHEDULE } from "@/lib/prayer-times";
import { usePrayerTimes } from "@/hooks/use-prayer-times";
import { useNotifications } from "@/hooks/use-notifications";
import { getDailyMotivation } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";

const ICONS = {
  fajr: Sunrise,
  dhuhr: Sun,
  asr: Sun,
  maghrib: Sunset,
  isha: Moon,
};

export default function Home() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { language } = useLanguage();
  const queryClient = useQueryClient();

  const { location, requestLocation, prayerTimes, nextPrayer, countdown, now } = usePrayerTimes();
  const { permission, requestPermission } = useNotifications(prayerTimes);

  const todayStr = format(now, "yyyy-MM-dd");
  
  const { data: todayData, isLoading: isPrayersLoading } = useGetPrayerDay(todayStr, {
    query: { enabled: isAuthenticated }
  });

  const markPrayerMutation = useMarkPrayer();
  const unmarkPrayerMutation = useUnmarkPrayer();

  const togglePrayer = (prayer: keyof typeof ICONS) => {
    if (!todayData) return;
    const isCompleted = todayData[prayer];
    const mutation = isCompleted ? unmarkPrayerMutation : markPrayerMutation;
    mutation.mutate(
      { date: todayStr, prayer },
      {
        onSuccess: (newData) => {
          queryClient.setQueryData(getGetPrayerDayQueryKey(todayStr), newData);
          queryClient.invalidateQueries({ queryKey: getGetPrayerStatsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetWeeklyPrayersQueryKey() });
        }
      }
    );
  };

  const hasLocation = location.status === "granted";
  const activeCountdown = countdown;
  const dailyReason = getDailyMotivation();

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden aspect-[16/9] md:aspect-[21/9] bg-primary/10 border border-primary/20 shadow-lg group">
        <img 
          src="/hero-mosque.png" 
          alt="Peaceful mosque at dawn" 
          className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-overlay transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-end p-6 md:p-12 text-center">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-3 animate-in slide-in-from-bottom-4 duration-700">
            {language === "ar" ? "السلام عليكم" : "As-salamu alaykum"}{user ? `، ${user.displayName}` : ''}
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg max-w-md mx-auto mb-6 animate-in slide-in-from-bottom-5 duration-700 delay-100">
            {language === "ar"
              ? "لا تفوّت صلاةً أبداً. رفيقك الهادئ لعبادتك اليومية."
              : "Never miss a prayer again. A quiet companion for your daily devotion."}
          </p>
          <Link href="/dashboard" className="animate-in slide-in-from-bottom-6 duration-700 delay-200">
            <button className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/25" data-testid="button-start-now">
              {language === "ar" ? "تتبع صلواتك" : "View Your Progress"}
            </button>
          </Link>
        </div>
      </section>

      <div className="grid md:grid-cols-12 gap-6">
        {/* Next Prayer Countdown */}
        <section className="md:col-span-5 relative glass rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-md">
          <div className="flex items-center justify-between w-full mb-6">
            <h2 className="text-lg font-medium text-muted-foreground">
              {language === "ar" ? "الصلاة القادمة" : "Next Prayer"}
            </h2>
            {hasLocation ? (
              <span className="flex items-center gap-1 text-xs text-green-500">
                <MapPin className="w-3 h-3" />
                {language === "ar" ? "بموقعك" : "By location"}
              </span>
            ) : (
              <button
                onClick={requestLocation}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <MapPin className="w-3 h-3" />
                {language === "ar" ? "استخدم موقعك" : "Use location"}
              </button>
            )}
          </div>
          
          {activeCountdown ? (
            <>
              <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted opacity-30" />
                  <circle 
                    cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4"
                    strokeDasharray="289"
                    strokeDashoffset={289 - (289 * activeCountdown.percentage) / 100}
                    className={cn("text-primary transition-all duration-1000 ease-linear", activeCountdown.totalSeconds < 1800 ? "animate-pulse text-secondary" : "")}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="flex flex-col items-center z-10">
                  <span className="text-3xl font-serif font-bold text-foreground">
                    {getPrayerDisplayName(activeCountdown.prayer)}
                  </span>
                  <span className="text-xl font-medium text-muted-foreground mt-1 tracking-widest">
                    {activeCountdown.hours.toString().padStart(2, '0')}:
                    {activeCountdown.minutes.toString().padStart(2, '0')}:
                    {activeCountdown.seconds.toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {activeCountdown.isTomorrow
                  ? (language === "ar" ? "غدًا الساعة " : "Tomorrow at ")
                  : (language === "ar" ? "اليوم الساعة " : "Today at ")}
                {format(activeCountdown.time, "h:mm a")}
              </p>
              {permission !== "granted" && (
                <button
                  onClick={requestPermission}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <Bell className="w-3 h-3" />
                  {language === "ar" ? "تفعيل الإشعارات" : "Enable notifications"}
                </button>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 py-6">
              <MapPin className="w-10 h-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                {language === "ar" ? "شارك موقعك لأوقات الصلاة الدقيقة" : "Share your location for accurate prayer times"}
              </p>
              <button
                onClick={requestLocation}
                className="bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-all"
              >
                {language === "ar" ? "استخدم موقعي" : "Use My Location"}
              </button>
              <Link href="/prayer-times" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                {language === "ar" ? "عرض أوقات الصلاة" : "View prayer times"}
              </Link>
            </div>
          )}
        </section>

        {/* Today's Tracker */}
        <section className="md:col-span-7 glass rounded-3xl p-6 md:p-8 shadow-md">
          {!isAuthenticated && !isAuthLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-8">
              <div className="w-16 h-16 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mb-4">
                <Compass className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-2">Track Your Prayers</h2>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Log in to keep a daily record of your prayers and build consistency in your worship.
              </p>
              <Link href="/login">
                <Button className="rounded-full px-8" data-testid="button-login-prompt">
                  Log in to track
                </Button>
              </Link>
            </div>
          ) : isPrayersLoading ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground">Today's Prayers</h2>
                  <p className="text-sm text-muted-foreground">{format(now, "EEEE, MMMM do")}</p>
                </div>
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  {todayData?.completedCount || 0}/5 Completed
                </div>
              </div>

              <div className="space-y-3">
                {PRAYER_NAMES.map((prayer, index) => {
                  const Icon = ICONS[prayer];
                  const isChecked = todayData?.[prayer] || false;
                  
                  return (
                    <div 
                      key={prayer}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
                        isChecked 
                          ? "bg-primary/5 border-primary/20 shadow-sm" 
                          : "bg-background border-border hover:border-primary/30 hover:shadow-sm"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                          isChecked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground capitalize">{prayer}</h3>
                          <p className="text-xs text-muted-foreground">
                            {prayerTimes ? format(prayerTimes[prayer], "h:mm a") : PRAYER_SCHEDULE[prayer]}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => togglePrayer(prayer)}
                        disabled={markPrayerMutation.isPending || unmarkPrayerMutation.isPending}
                        data-testid={`checkbox-prayer-${prayer}`}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                          isChecked 
                            ? "bg-primary border-primary text-primary-foreground" 
                            : "border-muted-foreground/30 hover:border-primary text-transparent",
                          (markPrayerMutation.isPending || unmarkPrayerMutation.isPending) && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <Check className={cn("w-4 h-4 transition-transform", isChecked ? "scale-100" : "scale-0")} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </div>

      {/* Hadith Carousel */}
      <HadithCarousel />

      {/* Daily Reason */}
      <section className="glass rounded-3xl p-6 md:p-8 border border-secondary/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 group-hover:bg-secondary/20 transition-colors duration-700" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-secondary mb-2 uppercase tracking-wider">Daily Inspiration</h3>
            <blockquote className="text-xl md:text-2xl font-serif text-foreground leading-relaxed mb-4">
              "{dailyReason.content}"
            </blockquote>
            <cite className="text-sm text-muted-foreground">— {dailyReason.source}</cite>
          </div>
          
          <Link href="/motivation">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary/20 text-secondary-foreground hover:bg-secondary/30 transition-colors font-medium text-sm whitespace-nowrap">
              Read More <ChevronRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
