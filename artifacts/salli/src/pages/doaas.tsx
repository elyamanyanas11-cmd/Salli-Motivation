import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import { Check, Copy, BookOpen, Moon, Sun, Heart, Shield, Star } from "lucide-react";

interface Doaa {
  id: string;
  arabic: string;
  transliteration: string;
  translation_en: string;
  translation_ar: string;
  source: string;
  category: string;
}

const DOAAS: Doaa[] = [
  {
    id: "morning-1",
    category: "morning",
    arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
    transliteration: "Asbahna wa-asbahal-mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la sharika lah",
    translation_en: "We have reached the morning and the whole kingdom belongs to Allah. Praise be to Allah, none has the right to be worshipped but Allah alone, Who has no partner.",
    translation_ar: "أصبحنا وأصبح الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له.",
    source: "Abu Dawud",
  },
  {
    id: "morning-2",
    category: "morning",
    arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ",
    transliteration: "Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namutu, wa ilayka an-nushur",
    translation_en: "O Allah, by You we enter the morning, by You we enter the evening, by You we live, by You we die, and to You is the resurrection.",
    translation_ar: "اللهم بك أصبحنا، وبك أمسينا، وبك نحيا، وبك نموت، وإليك النشور.",
    source: "Abu Dawud & Tirmidhi",
  },
  {
    id: "morning-3",
    category: "morning",
    arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ — اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
    transliteration: "A'udhu billahi minash-shaytanir-rajim — Allahu la ilaha illa huwal-hayyul-qayyum",
    translation_en: "I seek refuge in Allah from Satan the outcast — Allah, there is no deity except Him, the Ever-Living, the Sustainer of existence. (Ayat al-Kursi)",
    translation_ar: "أعوذ بالله من الشيطان الرجيم — الله لا إله إلا هو الحي القيوم. (آية الكرسي)",
    source: "Quran 2:255",
  },
  {
    id: "morning-4",
    category: "morning",
    arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    transliteration: "Bismillahil-ladhi la yadurru ma'as-mihi shay'un fil-ardi wa la fis-sama'i wa huwas-sami'ul-'alim",
    translation_en: "In the name of Allah with Whose name nothing can harm in the earth or the heavens, and He is the All-Hearing, All-Knowing.",
    translation_ar: "بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء وهو السميع العليم.",
    source: "Abu Dawud & Tirmidhi",
  },
  {
    id: "evening-1",
    category: "evening",
    arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
    transliteration: "Amsayna wa-amsal-mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la sharika lah",
    translation_en: "We have reached the evening and the whole kingdom belongs to Allah. Praise be to Allah, none has the right to be worshipped but Allah alone, Who has no partner.",
    translation_ar: "أمسينا وأمسى الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له.",
    source: "Abu Dawud",
  },
  {
    id: "evening-2",
    category: "evening",
    arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ",
    transliteration: "Allahumma anta rabbi la ilaha illa ant, khalaqtani wa ana 'abduk, wa ana 'ala 'ahdika wa wa'dika mastata't",
    translation_en: "O Allah, You are my Lord, none has the right to be worshipped but You. You created me and I am Your servant, and I am faithful to my covenant and my promise to You as much as I can.",
    translation_ar: "اللهم أنت ربي لا إله إلا أنت، خلقتني وأنا عبدك، وأنا على عهدك ووعدك ما استطعت.",
    source: "Bukhari (Sayyid al-Istighfar)",
  },
  {
    id: "prayer-1",
    category: "prayer",
    arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    transliteration: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhabannar",
    translation_en: "Our Lord, give us in this world that which is good and in the Hereafter that which is good, and protect us from the punishment of the Fire.",
    translation_ar: "ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار.",
    source: "Quran 2:201",
  },
  {
    id: "prayer-2",
    category: "prayer",
    arabic: "اللَّهُمَّ إِنِّي ظَلَمْتُ نَفْسِي ظُلْمًا كَثِيرًا، وَلَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ، فَاغْفِرْ لِي مَغْفِرَةً مِنْ عِنْدِكَ وَارْحَمْنِي، إِنَّكَ أَنْتَ الْغَفُورُ الرَّحِيمُ",
    transliteration: "Allahumma inni zalamtu nafsi zulman kathiran, wa la yaghfirudh-dhunuba illa ant, faghfirli maghfiratan min 'indik warhamni, innaka antal-ghafurur-rahim",
    translation_en: "O Allah, I have greatly wronged myself and no one forgives sins but You. So, grant me forgiveness and have mercy on me. Surely, You are the Forgiver, the Merciful.",
    translation_ar: "اللهم إني ظلمت نفسي ظلماً كثيراً، ولا يغفر الذنوب إلا أنت، فاغفر لي مغفرة من عندك وارحمني، إنك أنت الغفور الرحيم.",
    source: "Bukhari & Muslim",
  },
  {
    id: "prayer-3",
    category: "prayer",
    arabic: "اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ، وَعَافِنِي فِيمَنْ عَافَيْتَ، وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ",
    transliteration: "Allahumma ihdini fiman hadayt, wa 'afini fiman 'afayt, wa tawallani fiman tawallayt",
    translation_en: "O Allah, guide me among those You have guided, pardon me among those You have pardoned, and befriend me among those You have befriended.",
    translation_ar: "اللهم اهدني فيمن هديت، وعافني فيمن عافيت، وتولني فيمن توليت.",
    source: "Abu Dawud & Tirmidhi",
  },
  {
    id: "daily-1",
    category: "daily",
    arabic: "بِسْمِ اللَّهِ",
    transliteration: "Bismillah",
    translation_en: "In the name of Allah. (Said before eating, drinking, or starting any task)",
    translation_ar: "بسم الله. (تُقال قبل الأكل والشرب وبدء أي عمل)",
    source: "Bukhari & Muslim",
  },
  {
    id: "daily-2",
    category: "daily",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
    transliteration: "Alhamdu lillahil-ladhi at'amani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah",
    translation_en: "Praise be to Allah who has fed me this and provided it for me without any strength or power on my part. (Said after eating)",
    translation_ar: "الحمد لله الذي أطعمني هذا ورزقنيه من غير حول مني ولا قوة. (تُقال بعد الأكل)",
    source: "Abu Dawud & Tirmidhi",
  },
  {
    id: "daily-3",
    category: "daily",
    arabic: "اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا",
    transliteration: "Allahumma bismika amutu wa ahya",
    translation_en: "O Allah, in Your name I die and I live. (Said before sleeping)",
    translation_ar: "اللهم باسمك أموت وأحيا. (تُقال عند النوم)",
    source: "Bukhari",
  },
  {
    id: "daily-4",
    category: "daily",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    transliteration: "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur",
    translation_en: "Praise be to Allah who gave us life after having taken it from us, and unto Him is the resurrection. (Said upon waking up)",
    translation_ar: "الحمد لله الذي أحيانا بعد ما أماتنا وإليه النشور. (تُقال عند الاستيقاظ)",
    source: "Bukhari",
  },
  {
    id: "istighfar-1",
    category: "istighfar",
    arabic: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ",
    transliteration: "Astaghfirullaha al-'azimal-ladhi la ilaha illa huwal-hayyul-qayyumu wa atubu ilayh",
    translation_en: "I seek forgiveness from Allah the Magnificent, besides Whom there is no God, the Ever-Living, the Sustainer, and I repent to Him.",
    translation_ar: "أستغفر الله العظيم الذي لا إله إلا هو الحي القيوم وأتوب إليه.",
    source: "Abu Dawud & Tirmidhi",
  },
  {
    id: "istighfar-2",
    category: "istighfar",
    arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ",
    transliteration: "Subhanakallahumma wa bihamdika ashhadu an la ilaha illa anta astaghfiruka wa atubu ilayk",
    translation_en: "Glory be to You, O Allah, and praise be to You. I testify that there is no deity but You, I seek Your forgiveness and I repent to You.",
    translation_ar: "سبحانك اللهم وبحمدك أشهد أن لا إله إلا أنت أستغفرك وأتوب إليك.",
    source: "Tirmidhi, Abu Dawud",
  },
  {
    id: "protection-1",
    category: "protection",
    arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    transliteration: "Bismillahil-ladhi la yadurru ma'as-mihi shay'un fil-ardi wa la fis-sama'i wa huwas-sami'ul-'alim",
    translation_en: "In the name of Allah with Whose name nothing can harm in the earth or the heavens, and He is the All-Hearing, All-Knowing.",
    translation_ar: "بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء وهو السميع العليم.",
    source: "Abu Dawud & Tirmidhi",
  },
  {
    id: "protection-2",
    category: "protection",
    arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    transliteration: "A'udhu bikalimatil-lahit-tammati min sharri ma khalaq",
    translation_en: "I seek refuge in the perfect words of Allah from the evil of what He has created.",
    translation_ar: "أعوذ بكلمات الله التامات من شر ما خلق.",
    source: "Muslim",
  },
  {
    id: "protection-3",
    category: "protection",
    arabic: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
    transliteration: "Hasbiyallahu la ilaha illa huwa 'alayhi tawakkaltu wa huwa rabbul-'arshil-'azim",
    translation_en: "Allah is sufficient for me; there is no deity except Him. On Him I have relied, and He is the Lord of the Great Throne.",
    translation_ar: "حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم.",
    source: "Quran 9:129",
  },
];

const CATEGORY_ICONS = {
  morning: Sun,
  evening: Moon,
  prayer: Star,
  daily: Heart,
  istighfar: BookOpen,
  protection: Shield,
};

export default function Doaas() {
  const { t, language, isRTL } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>("morning");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = Object.entries(t.doaas.categories);
  const filtered = DOAAS.filter((d) => d.category === activeCategory);

  const handleCopy = async (doaa: Doaa) => {
    const text = `${doaa.arabic}\n\n${language === "ar" ? doaa.translation_ar : doaa.translation_en}\n\n${t.doaas.source}: ${doaa.source}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(doaa.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="text-center space-y-2 pt-4">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
          {t.doaas.title}
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
          {t.doaas.subtitle}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map(([key, label]) => {
          const Icon = CATEGORY_ICONS[key as keyof typeof CATEGORY_ICONS];
          return (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                activeCategory === key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4">
        {filtered.map((doaa) => (
          <div
            key={doaa.id}
            className="glass rounded-2xl border border-primary/10 p-6 space-y-4 hover:border-primary/30 transition-colors"
          >
            <div
              className="text-right leading-loose"
              dir="rtl"
            >
              <p className="text-xl md:text-2xl font-arabic text-foreground leading-relaxed">
                {doaa.arabic}
              </p>
            </div>

            <div className={cn("text-xs text-muted-foreground italic border-t border-border/50 pt-3", isRTL ? "text-right" : "text-left")}>
              <p className="mb-1">{doaa.transliteration}</p>
            </div>

            <div className={cn("space-y-1 border-t border-border/50 pt-3", isRTL ? "text-right" : "text-left")}>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t.doaas.translation}
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                {language === "ar" ? doaa.translation_ar : doaa.translation_en}
              </p>
            </div>

            <div className={cn("flex items-center justify-between pt-1", isRTL && "flex-row-reverse")}>
              <span className="text-xs text-primary/70 font-medium">
                {t.doaas.source}: {doaa.source}
              </span>
              <button
                onClick={() => handleCopy(doaa)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-muted/50"
              >
                {copiedId === doaa.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-green-500">{t.doaas.copied}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    {t.doaas.copyText}
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
