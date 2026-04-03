import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import { Check, Copy, Moon, Sun, Heart, Shield, Star, Repeat2, BedDouble } from "lucide-react";

interface Dhikr {
  id: string;
  arabic: string;
  transliteration: string;
  translation_en: string;
  translation_ar: string;
  benefit_en: string;
  benefit_ar: string;
  count?: number;
  source: string;
  category: string;
}

const ADHKAR: Dhikr[] = [
  // ---- أذكار الصباح ----
  {
    id: "morning-1",
    category: "morning",
    arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "Aṣbaḥnā wa-aṣbaḥal-mulku lillāh, walḥamdu lillāh, lā ilāha illallāhu waḥdahu lā sharīka lah, lahul-mulku wa lahul-ḥamdu wa huwa 'alā kulli shay'in qadīr",
    translation_en: "We have reached the morning and the whole kingdom belongs to Allah. Praise be to Allah. None has the right to be worshipped but Allah, alone, with no partner. His is the dominion, His is all praise and He is over all things Omnipotent.",
    translation_ar: "أصبحنا وأصبح الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير.",
    benefit_en: "Starting your day with the declaration of Allah's sovereignty fills the heart with contentment and gratitude, warding off anxiety and establishing trust in Allah.",
    benefit_ar: "الابتداء بالإقرار بملك الله يملأ القلب رضا وشكرًا، ويدفع الهم والقلق، ويُرسّخ التوكل على الله.",
    source: "Abu Dawud",
  },
  {
    id: "morning-2",
    category: "morning",
    arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ",
    transliteration: "Allāhumma bika aṣbaḥnā, wa bika amsaynā, wa bika naḥyā, wa bika namūtu, wa ilayka an-nushūr",
    translation_en: "O Allah, by You we enter the morning, by You we enter the evening, by You we live, by You we die, and to You is the resurrection.",
    translation_ar: "اللهم بك أصبحنا، وبك أمسينا، وبك نحيا، وبك نموت، وإليك النشور.",
    benefit_en: "This supplication renews one's complete reliance on Allah at the start of every day, reminding the believer that all their affairs — life, death, and resurrection — are in His hands alone.",
    benefit_ar: "هذا الدعاء يجدد الاتكال الكامل على الله في بداية كل يوم، ويذكر المؤمن بأن أمره كله بيد الله.",
    source: "Abu Dawud & Tirmidhi",
  },
  {
    id: "morning-3",
    category: "morning",
    arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    transliteration: "Bismillāhil-ladhī lā yaḍurru ma'as-mihi shay'un fil-arḍi wa lā fis-samā'i wa huwas-samī'ul-'alīm",
    translation_en: "In the name of Allah, with Whose name nothing on earth or in heaven can cause harm, and He is the All-Hearing, All-Knowing.",
    translation_ar: "بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء وهو السميع العليم.",
    count: 3,
    benefit_en: "Whoever says this three times in the morning, nothing will harm him until the evening. It is a complete shield against every worldly harm.",
    benefit_ar: "من قالها ثلاث مرات حين يصبح لم يضره شيء حتى يمسي، وهي درع شامل من كل أذى دنيوي.",
    source: "Abu Dawud & Tirmidhi",
  },
  {
    id: "morning-4",
    category: "morning",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ",
    transliteration: "Allāhumma innī as'alukal-'āfiyata fid-dunyā wal-ākhirah",
    translation_en: "O Allah, I ask You for wellbeing in this world and the Hereafter.",
    translation_ar: "اللهم إني أسألك العافية في الدنيا والآخرة.",
    benefit_en: "The Prophet ﷺ said: 'No one has been given a gift better than wellbeing.' This supplication seeks Allah's protection in both worlds.",
    benefit_ar: "قال النبي ﷺ: «ما أُعطي أحد عطاءً أفضل من العافية»، وهذا الدعاء يطلب من الله الحماية في الدنيا والآخرة.",
    source: "Ibn Majah",
  },
  // ---- أذكار المساء ----
  {
    id: "evening-1",
    category: "evening",
    arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
    transliteration: "Amsaynā wa-amsal-mulku lillāh, walḥamdu lillāh, lā ilāha illallāhu waḥdahu lā sharīka lah",
    translation_en: "We have reached the evening and the whole kingdom belongs to Allah. Praise be to Allah. None has the right to be worshipped but Allah, alone, with no partner.",
    translation_ar: "أمسينا وأمسى الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له.",
    benefit_en: "Mirrors the morning dhikr, sealing the day with gratitude and acknowledgement of Allah's absolute dominion, bringing the day full circle in worship.",
    benefit_ar: "يعكس ذكر الصباح، ويختم اليوم بالشكر والإقرار بملك الله المطلق، مما يجعل اليوم كله في دائرة العبادة.",
    source: "Abu Dawud",
  },
  {
    id: "evening-2",
    category: "evening",
    arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي، فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    transliteration: "Allāhumma anta rabbī lā ilāha illā ant, khalaqtanī wa anā 'abduk, wa anā 'alā 'ahdika wa wa'dika mastata't, a'ūdhu bika min sharri mā ṣana't, abū'u laka bini'matika 'alayya wa abū'u bi-dhanbī, faghfirlī fa'innahu lā yaghfirudh-dhunūba illā ant",
    translation_en: "O Allah, You are my Lord, none has the right to be worshipped except You, You created me and I am Your servant. I abide by Your covenant and Your promise as best I can, I seek refuge in You from the evil of what I have done, I acknowledge Your blessings upon me and I acknowledge my sins, so forgive me, for none forgives sins but You.",
    translation_ar: "اللهم أنت ربي لا إله إلا أنت، خلقتني وأنا عبدك، وأنا على عهدك ووعدك ما استطعت، أعوذ بك من شر ما صنعت، أبوء لك بنعمتك علي وأبوء بذنبي، فاغفر لي فإنه لا يغفر الذنوب إلا أنت.",
    benefit_en: "This is 'Sayyid al-Istighfar' — the master of all forgiveness supplications. The Prophet ﷺ said: Whoever says it with conviction in the evening and dies that night will enter Paradise.",
    benefit_ar: "هذا هو سيد الاستغفار. قال النبي ﷺ: «من قالها موقنًا بها حين يمسي فمات من ليلته دخل الجنة».",
    source: "Bukhari (Sayyid al-Istighfar)",
  },
  {
    id: "evening-3",
    category: "evening",
    arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    transliteration: "A'ūdhu bikalimatillāhit-tāmmāti min sharri mā khalaq",
    translation_en: "I seek refuge in the perfect words of Allah from the evil of what He has created.",
    translation_ar: "أعوذ بكلمات الله التامات من شر ما خلق.",
    count: 3,
    benefit_en: "Whoever says this three times in the evening, no harm — whether from insects, snakes or scorpions — will afflict him that night.",
    benefit_ar: "من قالها ثلاث مرات حين يمسي لم تضره حمة تلك الليلة.",
    source: "Muslim",
  },
  // ---- أذكار بعد الصلاة ----
  {
    id: "prayer-1",
    category: "afterprayer",
    arabic: "سُبْحَانَ اللَّهِ",
    transliteration: "Subḥānallāh",
    translation_en: "Glory be to Allah.",
    translation_ar: "سبحان الله",
    count: 33,
    benefit_en: "Reciting Subhanallah (33×), Alhamdulillah (33×) and Allahu Akbar (34×) after every prayer erases sins even if they are as many as the foam of the sea.",
    benefit_ar: "قول سبحان الله ثلاثًا وثلاثين بعد كل صلاة يُكفِّر الذنوب وإن كانت مثل زبد البحر.",
    source: "Muslim",
  },
  {
    id: "prayer-2",
    category: "afterprayer",
    arabic: "الْحَمْدُ لِلَّهِ",
    transliteration: "Alḥamdu lillāh",
    translation_en: "Praise be to Allah.",
    translation_ar: "الحمد لله",
    count: 33,
    benefit_en: "'Alhamdulillah' fills the scales on the Day of Judgment. Repeating it after prayer is among the greatest acts of gratitude to Allah.",
    benefit_ar: "الحمد لله تملأ الميزان يوم القيامة. وترديدها بعد الصلاة من أعظم مواطن شكر الله.",
    source: "Muslim",
  },
  {
    id: "prayer-3",
    category: "afterprayer",
    arabic: "اللَّهُ أَكْبَرُ",
    transliteration: "Allāhu akbar",
    translation_en: "Allah is the Greatest.",
    translation_ar: "الله أكبر",
    count: 34,
    benefit_en: "Completing the post-prayer tasbih with Allahu Akbar 34 times crowns the glorification of Allah with acknowledgement of His ultimate greatness.",
    benefit_ar: "ختم التسبيح بالله أكبر أربعًا وثلاثين يُتوِّج تسبيح الله بالإقرار بعظمته المطلقة.",
    source: "Muslim",
  },
  {
    id: "prayer-4",
    category: "afterprayer",
    arabic: "آيَةُ الْكُرْسِيِّ — اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ",
    transliteration: "Āyatul-Kursī — Allāhu lā ilāha illā huwal-ḥayyul-qayyūm, lā ta'khudhuhū sinatun wa lā nawm...",
    translation_en: "Ayat al-Kursi — Allah! There is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep... (Quran 2:255)",
    translation_ar: "آية الكرسي — الله لا إله إلا هو الحي القيوم، لا تأخذه سنة ولا نوم... (البقرة: 255)",
    benefit_en: "Whoever recites Ayat al-Kursi after every obligatory prayer, nothing will prevent him from entering Paradise except death. It is the greatest verse in the Quran.",
    benefit_ar: "من قرأ آية الكرسي في دبر كل صلاة مكتوبة لم يمنعه من دخول الجنة إلا أن يموت. وهي أعظم آية في القرآن الكريم.",
    source: "Al-Nasa'i (Sahih)",
  },
  // ---- التسبيح ----
  {
    id: "tasbih-1",
    category: "tasbih",
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    transliteration: "Subḥānallāhi wa biḥamdih",
    translation_en: "Glory be to Allah and His is the praise.",
    translation_ar: "سبحان الله وبحمده",
    count: 100,
    benefit_en: "Whoever says this 100 times a day will have all his sins forgiven, even if they are like the foam of the sea. Two great virtues: forgiveness and they are the most beloved words to Allah.",
    benefit_ar: "من قالها مائة مرة في اليوم حُطَّت خطاياه وإن كانت مثل زبد البحر. فضلان عظيمان: المغفرة وأنها أحب الكلام إلى الله.",
    source: "Bukhari & Muslim",
  },
  {
    id: "tasbih-2",
    category: "tasbih",
    arabic: "سُبْحَانَ اللَّهِ الْعَظِيمِ",
    transliteration: "Subḥānallāhil-'aẓīm",
    translation_en: "Glory be to Allah, the Magnificent.",
    translation_ar: "سبحان الله العظيم",
    benefit_en: "Two short phrases, light on the tongue yet extraordinarily heavy on the scales of good deeds on the Day of Judgment, and beloved to the Most Merciful.",
    benefit_ar: "كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن: سبحان الله وبحمده، سبحان الله العظيم.",
    source: "Bukhari & Muslim",
  },
  {
    id: "tasbih-3",
    category: "tasbih",
    arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "Lā ilāha illallāhu waḥdahū lā sharīka lah, lahul-mulku wa lahul-ḥamdu wa huwa 'alā kulli shay'in qadīr",
    translation_en: "There is no deity worthy of worship except Allah, alone, with no partner. His is the dominion, His is all praise and He is over all things Omnipotent.",
    translation_ar: "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير.",
    count: 100,
    benefit_en: "Whoever says this 100 times a day: it is equivalent to freeing 10 slaves, 100 good deeds are written, 100 sins are wiped away, and it is a protection from Shaytan for that day.",
    benefit_ar: "من قالها مائة مرة في يوم كانت له كعدل عشر رقاب، وكُتبت له مائة حسنة، ومُحيت عنه مائة سيئة، وكانت له حرزًا من الشيطان يومه ذلك.",
    source: "Bukhari & Muslim",
  },
  {
    id: "tasbih-4",
    category: "tasbih",
    arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    transliteration: "Lā ḥawla wa lā quwwata illā billāh",
    translation_en: "There is no power or might except with Allah.",
    translation_ar: "لا حول ولا قوة إلا بالله",
    benefit_en: "This is a treasure from the treasures of Paradise. It is a cure for 99 ailments, the least of which is grief. It is the declaration of complete helplessness before Allah and total reliance on Him.",
    benefit_ar: "هي كنز من كنوز الجنة. وفيها شفاء من تسعة وتسعين داءً أيسرها الهم. وهي إقرار بالعجز التام أمام الله والتوكل عليه.",
    source: "Bukhari & Muslim",
  },
  {
    id: "tasbih-5",
    category: "tasbih",
    arabic: "أَسْتَغْفِرُ اللَّهَ",
    transliteration: "Astaghfirullāh",
    translation_en: "I seek forgiveness from Allah.",
    translation_ar: "أستغفر الله",
    count: 100,
    benefit_en: "Whoever makes istighfar regularly, Allah will provide relief from every worry, a way out of every difficulty, and provision from where he does not expect. It also causes rain and increases wealth.",
    benefit_ar: "من لزم الاستغفار جعل الله له من كل هم فرجًا، ومن كل ضيق مخرجًا، ورزقه من حيث لا يحتسب. والاستغفار سبب للمطر وزيادة الرزق.",
    source: "Abu Dawud",
  },
  // ---- أذكار النوم والاستيقاظ ----
  {
    id: "sleep-1",
    category: "sleep",
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    transliteration: "Bismika Allāhumma amūtu wa aḥyā",
    translation_en: "O Allah, in Your name I die and I live.",
    translation_ar: "باسمك اللهم أموت وأحيا.",
    benefit_en: "Sleep is a minor death. This supplication before sleeping places that 'death' and awakening entirely in Allah's hands, building a profound sense of tawakkul (reliance on Allah).",
    benefit_ar: "النوم موتة صغرى. هذا الدعاء قبل النوم يجعل تلك الموتة والإفاقة بيد الله كليًا، ويبني توكلًا عميقًا على الله.",
    source: "Bukhari",
  },
  {
    id: "sleep-2",
    category: "sleep",
    arabic: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ",
    transliteration: "Allāhumma qinī 'adhābaka yawma tab'athu 'ibādak",
    translation_en: "O Allah, protect me from Your punishment on the Day You resurrect Your servants.",
    translation_ar: "اللهم قني عذابك يوم تبعث عبادك.",
    count: 3,
    benefit_en: "The Prophet ﷺ would say this three times before sleeping. It is a reminder of the Hereafter at the moment of 'small death,' keeping the believer mindful of accountability.",
    benefit_ar: "كان النبي ﷺ يقولها ثلاث مرات قبل النوم. وهي تذكير بالآخرة لحظة الموتة الصغرى، وتُبقي المؤمن يقظًا أمام الحساب.",
    source: "Abu Dawud & Tirmidhi",
  },
  {
    id: "sleep-3",
    category: "sleep",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    transliteration: "Alḥamdu lillāhil-ladhī aḥyānā ba'da mā amātanā wa ilayhin-nushūr",
    translation_en: "Praise be to Allah who gave us life after having taken it from us, and to Him is the resurrection.",
    translation_ar: "الحمد لله الذي أحيانا بعد ما أماتنا وإليه النشور.",
    benefit_en: "The first words upon waking, recognising that every new day is a gift — a fresh chance to worship Allah. It transforms waking up into an act of gratitude.",
    benefit_ar: "أول الكلام عند الاستيقاظ، إقرارًا بأن كل يوم جديد هو هبة وفرصة جديدة للعبادة. يحوّل الاستيقاظ إلى عمل شكر.",
    source: "Bukhari",
  },
  // ---- الحماية ----
  {
    id: "protection-1",
    category: "protection",
    arabic: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
    transliteration: "Ḥasbiyallāhu lā ilāha illā huwa 'alayhi tawakkaltu wa huwa rabbul-'arshil-'aẓīm",
    translation_en: "Allah is sufficient for me; there is no deity but Him. On Him I have relied, and He is the Lord of the Great Throne.",
    translation_ar: "حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم.",
    count: 7,
    benefit_en: "Whoever recites this seven times in the morning and seven times in the evening, Allah will take care of whatever concerns him of this world and the Hereafter.",
    benefit_ar: "من قالها سبع مرات صباحًا وسبع مرات مساءً كفاه الله ما أهمه من أمر الدنيا والآخرة.",
    source: "Abu Dawud",
  },
  {
    id: "protection-2",
    category: "protection",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ",
    transliteration: "Allāhumma innī a'ūdhu bika minal-hammi wal-ḥazan, wal-'ajzi wal-kasal, wal-bukhli wal-jubn, wa ḍala'id-dayni wa ghalabatir-rijāl",
    translation_en: "O Allah, I seek refuge in You from worry and grief, from weakness and laziness, from miserliness and cowardice, from the burden of debt and from being overpowered by men.",
    translation_ar: "اللهم إني أعوذ بك من الهم والحزن، والعجز والكسل، والبخل والجبن، وضلع الدين وغلبة الرجال.",
    benefit_en: "A comprehensive supplication for protection from all the internal and external obstacles that prevent a believer from fulfilling their potential in worship and in life.",
    benefit_ar: "دعاء شامل للحماية من كل العوائق الداخلية والخارجية التي تمنع المؤمن من بلوغ طاقته في العبادة والحياة.",
    source: "Bukhari",
  },
  {
    id: "protection-3",
    category: "protection",
    arabic: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ",
    transliteration: "Allāhumma 'āfinī fī badanī, Allāhumma 'āfinī fī sam'ī, Allāhumma 'āfinī fī baṣarī, lā ilāha illā ant",
    translation_en: "O Allah, grant me health in my body. O Allah, grant me health in my hearing. O Allah, grant me health in my sight. There is no deity but You.",
    translation_ar: "اللهم عافني في بدني، اللهم عافني في سمعي، اللهم عافني في بصري، لا إله إلا أنت.",
    count: 3,
    benefit_en: "Asking Allah for wellbeing in body, hearing and sight — the most precious gifts — is among the greatest du'as. The Prophet ﷺ said no one has been given a gift better than wellbeing.",
    benefit_ar: "سؤال الله العافية في البدن والسمع والبصر — أثمن النعم — من أجلّ الأدعية. قال النبي ﷺ: ما أُعطي أحد عطاءً خيرًا من العافية.",
    source: "Abu Dawud",
  },
];

const CATEGORY_ICONS = {
  morning: Sun,
  evening: Moon,
  afterprayer: Star,
  tasbih: Repeat2,
  sleep: BedDouble,
  protection: Shield,
};

const CATEGORY_LABELS_EN: Record<string, string> = {
  morning: "Morning Adhkar",
  evening: "Evening Adhkar",
  afterprayer: "After Prayer",
  tasbih: "Tasbih",
  sleep: "Sleep & Waking",
  protection: "Protection",
};

const CATEGORY_LABELS_AR: Record<string, string> = {
  morning: "أذكار الصباح",
  evening: "أذكار المساء",
  afterprayer: "أذكار بعد الصلاة",
  tasbih: "التسبيح",
  sleep: "أذكار النوم والاستيقاظ",
  protection: "أذكار الحماية",
};

export default function Doaas() {
  const { language, isRTL } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>("morning");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = ADHKAR.filter((d) => d.category === activeCategory);
  const categories = Object.keys(CATEGORY_ICONS);

  const handleCopy = async (dhikr: Dhikr) => {
    const text = `${dhikr.arabic}\n\n${language === "ar" ? dhikr.translation_ar : dhikr.translation_en}\n\n${language === "ar" ? "الفضل: " : "Benefit: "}${language === "ar" ? dhikr.benefit_ar : dhikr.benefit_en}\n\n${language === "ar" ? "المصدر: " : "Source: "}${dhikr.source}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(dhikr.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="text-center space-y-2 pt-4">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
          {language === "ar" ? "الأذكار والتسبيح" : "Adhkar & Dhikr"}
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
          {language === "ar"
            ? "أذكار من السنة النبوية مع فضل كل ذكر وأثره"
            : "Remembrances from the Sunnah with the virtue and benefit of each"}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((key) => {
          const Icon = CATEGORY_ICONS[key as keyof typeof CATEGORY_ICONS];
          const label = language === "ar" ? CATEGORY_LABELS_AR[key] : CATEGORY_LABELS_EN[key];
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
        {filtered.map((dhikr) => (
          <div
            key={dhikr.id}
            className="glass rounded-2xl border border-primary/10 p-6 space-y-4 hover:border-primary/30 transition-colors"
          >
            {dhikr.count && (
              <div className={cn("flex", isRTL ? "justify-start" : "justify-end")}>
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  <Repeat2 className="w-3 h-3" />
                  × {dhikr.count}
                </span>
              </div>
            )}

            <div className="text-right leading-loose" dir="rtl">
              <p className="text-xl md:text-2xl font-arabic text-foreground leading-relaxed">
                {dhikr.arabic}
              </p>
            </div>

            <div className={cn("text-xs text-muted-foreground italic border-t border-border/50 pt-3", isRTL ? "text-right" : "text-left")}>
              <p>{dhikr.transliteration}</p>
            </div>

            <div className={cn("space-y-1 border-t border-border/50 pt-3", isRTL ? "text-right" : "text-left")}>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {language === "ar" ? "الترجمة" : "Translation"}
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                {language === "ar" ? dhikr.translation_ar : dhikr.translation_en}
              </p>
            </div>

            <div className={cn("rounded-xl bg-primary/5 border border-primary/15 p-4 space-y-1", isRTL ? "text-right" : "text-left")}>
              <p className="text-xs font-semibold text-primary uppercase tracking-wide flex items-center gap-1.5" dir="ltr">
                <Heart className="w-3.5 h-3.5" />
                {language === "ar" ? "الفضل والأثر" : "Virtue & Benefit"}
              </p>
              <p className="text-sm text-foreground/80 leading-relaxed" dir={isRTL ? "rtl" : "ltr"}>
                {language === "ar" ? dhikr.benefit_ar : dhikr.benefit_en}
              </p>
            </div>

            <div className={cn("flex items-center justify-between pt-1", isRTL && "flex-row-reverse")}>
              <span className="text-xs text-primary/70 font-medium">
                {language === "ar" ? "المصدر: " : "Source: "}{dhikr.source}
              </span>
              <button
                onClick={() => handleCopy(dhikr)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-muted/50"
              >
                {copiedId === dhikr.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-green-500">{language === "ar" ? "تم النسخ!" : "Copied!"}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    {language === "ar" ? "نسخ" : "Copy"}
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
