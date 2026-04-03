import { useState } from "react";
import { format } from "date-fns";
import { MapPin, Bell, BellOff, Clock, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { usePrayerTimes } from "@/hooks/use-prayer-times";
import { useNotifications } from "@/hooks/use-notifications";
import { PRAYER_NAMES, getPrayerDisplayName, IQAMA_OFFSET_MINUTES, type PrayerName } from "@/lib/prayer-times";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

const PRAYER_ARABIC: Record<PrayerName, string> = {
  fajr: "الفجر",
  dhuhr: "الظهر",
  asr: "العصر",
  maghrib: "المغرب",
  isha: "العشاء",
};

const PRAYER_COLORS: Record<PrayerName, string> = {
  fajr: "text-blue-400",
  dhuhr: "text-yellow-500",
  asr: "text-orange-400",
  maghrib: "text-rose-400",
  isha: "text-indigo-400",
};

export default function PrayerTimesPage() {
  const { language, isRTL } = useLanguage();
  const { location, requestLocation, prayerTimes, iqamaTimes, nextPrayer, countdown, now } = usePrayerTimes();
  const { permission, requestPermission, prefs, updatePrefs } = useNotifications(prayerTimes);

  const isGranted = location.status === "granted";
  const isLoading = location.status === "loading";

  return (
    <div className="space-y-6 pb-12">
      <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
        <div>
          <h1 className="text-2xl font-bold">{language === "ar" ? "أوقات الصلاة" : "Prayer Times"}</h1>
          {isGranted && (location as any).city && (
            <p className={cn("text-sm text-muted-foreground flex items-center gap-1 mt-0.5", isRTL && "flex-row-reverse")}>
              <MapPin className="w-3.5 h-3.5" />
              {(location as any).city}
            </p>
          )}
        </div>
        {isGranted && (
          <button
            onClick={requestLocation}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Refresh location"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Location Request */}
      {!isGranted && (
        <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <MapPin className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">
              {language === "ar" ? "تحديد موقعك" : "Set Your Location"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {language === "ar"
                ? "أذن بالوصول إلى موقعك لحساب أوقات الصلاة الدقيقة"
                : "Allow location access to get accurate prayer times for your area"}
            </p>
            {location.status === "denied" && (
              <p className="text-sm text-destructive mt-2">{(location as any).error}</p>
            )}
          </div>
          <button
            onClick={requestLocation}
            disabled={isLoading}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-medium hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
            {isLoading
              ? (language === "ar" ? "جارٍ التحديد..." : "Detecting...")
              : (language === "ar" ? "تحديد الموقع" : "Detect Location")}
          </button>
        </div>
      )}

      {/* Next Prayer Countdown */}
      {isGranted && nextPrayer && countdown && (
        <div className="rounded-2xl bg-primary/10 border border-primary/20 p-5 text-center space-y-2">
          <p className="text-xs uppercase tracking-widest text-primary/70 font-medium">
            {language === "ar" ? "الصلاة القادمة" : "Next Prayer"}
          </p>
          <p className={cn("text-3xl font-bold", PRAYER_COLORS[nextPrayer.prayer])}>
            {language === "ar" ? PRAYER_ARABIC[nextPrayer.prayer] : getPrayerDisplayName(nextPrayer.prayer)}
          </p>
          <p className="text-4xl font-mono font-bold tracking-wider">
            {String(countdown.hours).padStart(2, "0")}:{String(countdown.minutes).padStart(2, "0")}:{String(countdown.seconds).padStart(2, "0")}
          </p>
          <p className="text-xs text-muted-foreground">
            {language === "ar" ? "الأذان الساعة" : "Adhan at"}{" "}
            <span className="font-medium text-foreground">{format(nextPrayer.time, "h:mm a")}</span>
            {" · "}
            {language === "ar" ? "الإقامة الساعة" : "Iqama at"}{" "}
            <span className="font-medium text-foreground">
              {format(
                new Date(nextPrayer.time.getTime() + IQAMA_OFFSET_MINUTES[nextPrayer.prayer] * 60000),
                "h:mm a"
              )}
            </span>
          </p>
        </div>
      )}

      {/* Prayer Times Table */}
      {isGranted && prayerTimes && iqamaTimes && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className={cn("grid grid-cols-3 px-4 py-2 bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider", isRTL && "text-right")}>
            <span>{language === "ar" ? "الصلاة" : "Prayer"}</span>
            <span className="text-center">{language === "ar" ? "الأذان" : "Adhan"}</span>
            <span className="text-center">{language === "ar" ? "الإقامة" : "Iqama"}</span>
          </div>
          <div className="divide-y divide-border/50">
            {PRAYER_NAMES.map((prayer) => {
              const isNext = nextPrayer?.prayer === prayer && !nextPrayer.isTomorrow;
              const isPast = prayerTimes[prayer] < now && !isNext;
              return (
                <div
                  key={prayer}
                  className={cn(
                    "grid grid-cols-3 px-4 py-3.5 items-center transition-colors",
                    isNext && "bg-primary/5 border-l-2 border-primary",
                    isPast && "opacity-50"
                  )}
                >
                  <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                    <div className={cn("w-2 h-2 rounded-full", isNext ? "bg-primary animate-pulse" : "bg-muted-foreground/30")} />
                    <span className={cn("font-semibold text-sm", isNext && PRAYER_COLORS[prayer])}>
                      {language === "ar" ? PRAYER_ARABIC[prayer] : getPrayerDisplayName(prayer)}
                    </span>
                  </div>
                  <p className="text-center font-mono text-sm font-medium">
                    {format(prayerTimes[prayer], "h:mm a")}
                  </p>
                  <p className="text-center font-mono text-sm text-muted-foreground">
                    {format(iqamaTimes[prayer], "h:mm a")}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="px-4 py-2 bg-muted/30 text-xs text-muted-foreground text-center">
            {language === "ar"
              ? `الإقامة بعد الأذان بـ ${IQAMA_OFFSET_MINUTES.dhuhr} دقيقة تقريباً`
              : `Iqama is approx. ${IQAMA_OFFSET_MINUTES.dhuhr} min after Adhan (varies by prayer)`}
          </div>
        </div>
      )}

      {/* Notification Settings */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">{language === "ar" ? "إعدادات الإشعارات" : "Notification Settings"}</h2>
          </div>
          {permission === "granted" ? (
            <span className={cn("flex items-center gap-1 text-xs text-green-500", isRTL && "flex-row-reverse")}>
              <CheckCircle2 className="w-3.5 h-3.5" /> {language === "ar" ? "مفعّل" : "Enabled"}
            </span>
          ) : (
            <span className={cn("flex items-center gap-1 text-xs text-muted-foreground", isRTL && "flex-row-reverse")}>
              <XCircle className="w-3.5 h-3.5" /> {language === "ar" ? "غير مفعّل" : "Disabled"}
            </span>
          )}
        </div>

        {permission !== "granted" && (
          <button
            onClick={requestPermission}
            className="w-full flex items-center justify-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/20 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {language === "ar" ? "تفعيل إشعارات الصلاة" : "Enable Prayer Notifications"}
          </button>
        )}

        {permission === "granted" && (
          <div className="space-y-3">
            <label className={cn("flex items-center justify-between cursor-pointer", isRTL && "flex-row-reverse")}>
              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Bell className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{language === "ar" ? "إشعار وقت الأذان" : "Adhan time notification"}</span>
              </div>
              <button
                onClick={() => updatePrefs({ adhan: !prefs.adhan })}
                className={cn(
                  "relative w-10 h-5 rounded-full transition-colors",
                  prefs.adhan ? "bg-primary" : "bg-muted"
                )}
              >
                <span className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform", prefs.adhan ? (isRTL ? "right-0.5" : "translate-x-5") : (isRTL ? "right-5" : "translate-x-0.5"))} />
              </button>
            </label>

            <label className={cn("flex items-center justify-between cursor-pointer", isRTL && "flex-row-reverse")}>
              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{language === "ar" ? "إشعار وقت الإقامة" : "Iqama time notification"}</span>
              </div>
              <button
                onClick={() => updatePrefs({ iqama: !prefs.iqama })}
                className={cn(
                  "relative w-10 h-5 rounded-full transition-colors",
                  prefs.iqama ? "bg-primary" : "bg-muted"
                )}
              >
                <span className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform", prefs.iqama ? (isRTL ? "right-0.5" : "translate-x-5") : (isRTL ? "right-5" : "translate-x-0.5"))} />
              </button>
            </label>

            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <BellOff className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{language === "ar" ? "تنبيه قبل الصلاة بـ" : "Reminder before prayer"}</span>
              </div>
              <select
                value={prefs.reminderMinutes}
                onChange={(e) => updatePrefs({ reminderMinutes: Number(e.target.value) })}
                className="text-sm bg-muted border border-border rounded-lg px-2 py-1 text-foreground"
              >
                <option value={5}>5 {language === "ar" ? "دقائق" : "min"}</option>
                <option value={10}>10 {language === "ar" ? "دقائق" : "min"}</option>
                <option value={15}>15 {language === "ar" ? "دقائق" : "min"}</option>
                <option value={20}>20 {language === "ar" ? "دقائق" : "min"}</option>
                <option value={30}>30 {language === "ar" ? "دقائق" : "min"}</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
