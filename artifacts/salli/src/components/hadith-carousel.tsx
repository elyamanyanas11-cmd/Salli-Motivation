import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";

interface Dhikr {
  arabic: string;
  transliteration: string;
  translation: string;
  translation_ar: string;
  benefit_en: string;
  benefit_ar: string;
  count?: number;
  source: string;
}

const ADHKAR: Dhikr[] = [
  {
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    transliteration: "Subhānallāhi wa biḥamdih",
    translation: "Glory be to Allah and His is the praise.",
    translation_ar: "سبحان الله وبحمده",
    count: 100,
    benefit_en: "Whoever says this 100 times a day will have his sins forgiven even if they were like the foam of the sea.",
    benefit_ar: "من قالها مائة مرة في اليوم حُطَّت خطاياه وإن كانت مثل زبد البحر.",
    source: "Bukhari & Muslim",
  },
  {
    arabic: "سُبْحَانَ اللَّهِ الْعَظِيمِ",
    transliteration: "Subhānallāhil-'aẓīm",
    translation: "Glory be to Allah, the Magnificent.",
    translation_ar: "سبحان الله العظيم",
    benefit_en: "Two phrases light on the tongue, heavy on the scales, and beloved to the Most Merciful: Subhanallah wa bihamdih, Subhanallahil-'azim.",
    benefit_ar: "كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن: سبحان الله وبحمده، سبحان الله العظيم.",
    source: "Bukhari & Muslim",
  },
  {
    arabic: "لَا إِلَهَ إِلَّا اللَّهُ",
    transliteration: "Lā ilāha illallāh",
    translation: "There is no deity worthy of worship except Allah.",
    translation_ar: "لا إله إلا الله",
    benefit_en: "The best dhikr is 'La ilaha illallah' — it is the most virtuous of all remembrances and outweighs all creation in the scales.",
    benefit_ar: "أفضل الذكر لا إله إلا الله، وهو أفضل ما قاله النبيون، ويرجح بكل شيء في الميزان.",
    source: "Tirmidhi",
  },
  {
    arabic: "أَسْتَغْفِرُ اللَّهَ",
    transliteration: "Astaghfirullāh",
    translation: "I seek forgiveness from Allah.",
    translation_ar: "أستغفر الله",
    count: 100,
    benefit_en: "Whoever makes istighfar regularly, Allah will provide relief from every worry, a way out of every difficulty, and provision from where he does not expect.",
    benefit_ar: "من لزم الاستغفار جعل الله له من كل هم فرجًا، ومن كل ضيق مخرجًا، ورزقه من حيث لا يحتسب.",
    source: "Abu Dawud",
  },
  {
    arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    transliteration: "Lā ḥawla wa lā quwwata illā billāh",
    translation: "There is no power or might except with Allah.",
    translation_ar: "لا حول ولا قوة إلا بالله",
    benefit_en: "This phrase is a treasure from Paradise. It is a cure for 99 ailments, the least of which is grief.",
    benefit_ar: "هذه الكلمة كنز من كنوز الجنة، وهي دواء لتسعة وتسعين داءً، أيسرها الهم.",
    source: "Bukhari & Muslim",
  },
  {
    arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ",
    transliteration: "Allāhumma ṣalli 'alā Muḥammad",
    translation: "O Allah, send blessings upon Muhammad.",
    translation_ar: "اللهم صل على محمد",
    benefit_en: "Whoever sends one blessing upon the Prophet ﷺ, Allah sends ten blessings upon him, erases ten sins, and raises him ten ranks.",
    benefit_ar: "من صلى عليّ صلاة واحدة صلى الله عليه بها عشرًا، وحُطَّ عنه عشر خطايا، ورُفع له عشر درجات.",
    source: "Muslim",
  },
  {
    arabic: "سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ",
    transliteration: "Subhānallāh, walḥamdu lillāh, wa lā ilāha illallāh, wallāhu akbar",
    translation: "Glory be to Allah, Praise be to Allah, There is no god but Allah, and Allah is the Greatest.",
    translation_ar: "سبحان الله، والحمد لله، ولا إله إلا الله، والله أكبر",
    benefit_en: "These four words are the most beloved speech to Allah. They are better for you than everything the sun rises over.",
    benefit_ar: "هؤلاء الكلمات أحب إلى الله من الدنيا وما فيها، وهي خير لك مما طلعت عليه الشمس.",
    source: "Muslim",
  },
  {
    arabic: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
    transliteration: "Ḥasbiyallāhu lā ilāha illā huwa 'alayhi tawakkaltu wa huwa rabbul-'arshil-'aẓīm",
    translation: "Allah is sufficient for me; there is no deity but Him. On Him I have relied, and He is the Lord of the Great Throne.",
    translation_ar: "حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم",
    benefit_en: "Whoever recites this seven times morning and evening, Allah will suffice him in whatever concerns him of this world and the next.",
    benefit_ar: "من قالها سبع مرات صباحًا ومساءً كفاه الله ما أهمه من أمر الدنيا والآخرة.",
    source: "Abu Dawud",
  },
];

export function HadithCarousel() {
  const { language } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      goNext();
    }, 7000);
    return () => clearInterval(interval);
  }, [current, isAutoPlaying]);

  const goTo = (index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setIsAnimating(false);
    }, 300);
  };

  const goNext = () => goTo((current + 1) % ADHKAR.length);
  const goPrev = () => goTo((current - 1 + ADHKAR.length) % ADHKAR.length);

  const dhikr = ADHKAR[current];

  return (
    <section
      className="glass rounded-3xl p-6 md:p-8 border border-primary/15 relative overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-secondary/5 rounded-full blur-3xl translate-x-1/4 translate-y-1/4 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {language === "ar" ? "ذكر اليوم" : "Dhikr of the Day"}
            </h2>
          </div>
          {dhikr.count && (
            <span className="text-xs font-medium px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary">
              {language === "ar" ? `× ${dhikr.count}` : `× ${dhikr.count}`}
            </span>
          )}
        </div>

        <div
          className={cn(
            "transition-all duration-300",
            isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
          )}
        >
          <blockquote
            className="text-xl md:text-2xl font-serif text-foreground leading-relaxed text-right mb-4 font-medium"
            dir="rtl"
            style={{ fontFamily: "'Amiri', serif" }}
          >
            {dhikr.arabic}
          </blockquote>

          <p className="text-sm text-muted-foreground italic mb-3 leading-relaxed">
            {dhikr.transliteration}
          </p>

          <p className="text-base text-foreground/80 mb-4 leading-relaxed">
            {language === "ar" ? dhikr.translation_ar : dhikr.translation}
          </p>

          <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
              {language === "ar" ? "الفضل والأثر" : "Virtue & Benefit"}
            </p>
            <p className={cn("text-sm text-foreground/80 leading-relaxed", language === "ar" && "text-right")} dir={language === "ar" ? "rtl" : "ltr"}>
              {language === "ar" ? dhikr.benefit_ar : dhikr.benefit_en}
            </p>
          </div>

          <div className="flex flex-col gap-1 text-sm text-muted-foreground border-t border-border/40 pt-4">
            <span className="font-medium text-foreground/70">
              {language === "ar" ? "المصدر: " : "Source: "}
              <span className="font-normal">{dhikr.source}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <button
            onClick={goPrev}
            className="w-9 h-9 rounded-full border border-border hover:border-primary/40 hover:bg-primary/5 flex items-center justify-center transition-all text-muted-foreground hover:text-primary"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5">
            {ADHKAR.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={cn(
                  "rounded-full transition-all duration-300",
                  i === current
                    ? "w-6 h-2 bg-primary"
                    : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                )}
              />
            ))}
          </div>

          <button
            onClick={goNext}
            className="w-9 h-9 rounded-full border border-border hover:border-primary/40 hover:bg-primary/5 flex items-center justify-center transition-all text-muted-foreground hover:text-primary"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
