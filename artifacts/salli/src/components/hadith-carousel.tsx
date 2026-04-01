import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";

interface Hadith {
  arabic: string;
  transliteration: string;
  translation: string;
  translation_ar: string;
  source: string;
  narrator: string;
  authenticity: "صحيح" | "حسن" | "ضعيف";
  authenticityEn: "Sahih (Authentic)" | "Hasan (Good)" | "Da'if (Weak)";
  authenticityColor: string;
}

const HADITHS: Hadith[] = [
  {
    arabic: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    transliteration: "Innamā al-aʿmālu bin-niyyāt, wa innamā li-kulli imri'in mā nawā",
    translation: "Actions are only by intentions, and every person shall have what they intended.",
    translation_ar: "إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى",
    source: "صحيح البخاري، كتاب بدء الوحي — رقم 1",
    narrator: "عمر بن الخطاب رضي الله عنه",
    authenticity: "صحيح",
    authenticityEn: "Sahih (Authentic)",
    authenticityColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  {
    arabic: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ",
    transliteration: "Al-Muslimu man salima al-Muslimūna min lisānihi wa yadihi",
    translation: "A Muslim is the one from whose tongue and hand other Muslims are safe.",
    translation_ar: "المسلم من سلم المسلمون من لسانه ويده",
    source: "صحيح البخاري — رقم 10",
    narrator: "عبدالله بن عمرو رضي الله عنهما",
    authenticity: "صحيح",
    authenticityEn: "Sahih (Authentic)",
    authenticityColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  {
    arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    transliteration: "Man kāna yu'minu billāhi wal-yawmil-ākhiri fal-yaqul khayran aw li-yaṣmut",
    translation: "Whoever believes in Allah and the Last Day should speak good or remain silent.",
    translation_ar: "من كان يؤمن بالله واليوم الآخر فليقل خيرًا أو ليصمت",
    source: "صحيح البخاري — رقم 6018",
    narrator: "أبو هريرة رضي الله عنه",
    authenticity: "صحيح",
    authenticityEn: "Sahih (Authentic)",
    authenticityColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  {
    arabic: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    transliteration: "Lā yu'minu aḥadukum ḥattā yuḥibba li-akhīhi mā yuḥibbu li-nafsihi",
    translation: "None of you truly believes until he loves for his brother what he loves for himself.",
    translation_ar: "لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه",
    source: "صحيح البخاري — رقم 13 | صحيح مسلم — رقم 45",
    narrator: "أنس بن مالك رضي الله عنه",
    authenticity: "صحيح",
    authenticityEn: "Sahih (Authentic)",
    authenticityColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  {
    arabic: "الطَّهُورُ شَطْرُ الْإِيمَانِ، وَالْحَمْدُ لِلَّهِ تَمْلَأُ الْمِيزَانَ",
    transliteration: "Aṭ-ṭahūru shaṭrul-īmān, wal-ḥamdu lillāhi tamla'ul-mīzān",
    translation: "Purity is half of faith, and 'Alhamdulillah' fills the scale.",
    translation_ar: "الطهور شطر الإيمان، والحمد لله تملأ الميزان",
    source: "صحيح مسلم — رقم 223",
    narrator: "أبو مالك الأشعري رضي الله عنه",
    authenticity: "صحيح",
    authenticityEn: "Sahih (Authentic)",
    authenticityColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  {
    arabic: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ صَدَقَةٌ",
    transliteration: "Tabassmuka fī wajhi akhīka ṣadaqah",
    translation: "Your smile in the face of your brother is an act of charity.",
    translation_ar: "تبسمك في وجه أخيك صدقة",
    source: "سنن الترمذي — رقم 1956",
    narrator: "أبو ذر الغفاري رضي الله عنه",
    authenticity: "حسن",
    authenticityEn: "Hasan (Good)",
    authenticityColor: "text-amber-600 bg-amber-50 border-amber-200",
  },
  {
    arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    transliteration: "Khayrakum man ta'allama al-Qur'āna wa 'allamahu",
    translation: "The best among you are those who learn the Quran and teach it.",
    translation_ar: "خيركم من تعلم القرآن وعلمه",
    source: "صحيح البخاري — رقم 5027",
    narrator: "عثمان بن عفان رضي الله عنه",
    authenticity: "صحيح",
    authenticityEn: "Sahih (Authentic)",
    authenticityColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  {
    arabic: "مَنْ صَلَّى عَلَيَّ صَلَاةً صَلَّى اللَّهُ عَلَيْهِ بِهَا عَشْرًا",
    transliteration: "Man ṣallā 'alayya ṣalātan ṣallā Allāhu 'alayhi bihā 'ashran",
    translation: "Whoever sends one blessing upon me, Allah will send ten blessings upon him.",
    translation_ar: "من صلى عليّ صلاة صلى الله عليه بها عشرًا",
    source: "صحيح مسلم — رقم 408",
    narrator: "أبو هريرة رضي الله عنه",
    authenticity: "صحيح",
    authenticityEn: "Sahih (Authentic)",
    authenticityColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  {
    arabic: "اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا",
    transliteration: "Ittaqillāha ḥaythumā kunta, wa atbi'is-sayyi'ata al-ḥasanata tamḥuhā",
    translation: "Fear Allah wherever you are; follow a bad deed with a good deed to erase it.",
    translation_ar: "اتق الله حيثما كنت، وأتبع السيئة الحسنة تمحها",
    source: "سنن الترمذي — رقم 1987",
    narrator: "أبو ذر وأبو هريرة رضي الله عنهما",
    authenticity: "حسن",
    authenticityEn: "Hasan (Good)",
    authenticityColor: "text-amber-600 bg-amber-50 border-amber-200",
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

  const goNext = () => goTo((current + 1) % HADITHS.length);
  const goPrev = () => goTo((current - 1 + HADITHS.length) % HADITHS.length);

  const hadith = HADITHS[current];

  return (
    <section
      className="glass rounded-3xl p-6 md:p-8 border border-primary/15 relative overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-secondary/5 rounded-full blur-3xl translate-x-1/4 translate-y-1/4 pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {language === "ar" ? "من الأحاديث النبوية" : "Hadith of the Day"}
            </h2>
          </div>
          <span
            className={cn(
              "text-xs font-medium px-3 py-1 rounded-full border",
              hadith.authenticityColor
            )}
          >
            {language === "ar" ? hadith.authenticity : hadith.authenticityEn}
          </span>
        </div>

        {/* Hadith Content */}
        <div
          className={cn(
            "transition-all duration-300",
            isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
          )}
        >
          {/* Arabic Text */}
          <blockquote
            className="text-xl md:text-2xl font-serif text-foreground leading-relaxed text-right mb-4 font-medium"
            dir="rtl"
            style={{ fontFamily: "'Amiri', serif" }}
          >
            «{hadith.arabic}»
          </blockquote>

          {/* Transliteration */}
          <p className="text-sm text-muted-foreground italic mb-3 leading-relaxed">
            {hadith.transliteration}
          </p>

          {/* Translation */}
          <p className="text-base text-foreground/80 mb-4 leading-relaxed">
            {language === "ar" ? `"${hadith.translation_ar}"` : `"${hadith.translation}"`}
          </p>

          {/* Source & Narrator */}
          <div className="flex flex-col gap-1 text-sm text-muted-foreground border-t border-border/40 pt-4">
            <span className="font-medium text-foreground/70">
              {language === "ar" ? "المصدر: " : "Source: "}
              <span className="font-normal">{hadith.source}</span>
            </span>
            <span>
              {language === "ar" ? "رواه: " : "Narrated by: "}
              {hadith.narrator}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={goPrev}
            className="w-9 h-9 rounded-full border border-border hover:border-primary/40 hover:bg-primary/5 flex items-center justify-center transition-all text-muted-foreground hover:text-primary"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {HADITHS.map((_, i) => (
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
