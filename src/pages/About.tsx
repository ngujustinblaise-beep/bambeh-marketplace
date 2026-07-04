/**
 * ABOUT US PAGE - COMPLETE & BEAUTIFUL
 * The Bambeh Chronicle with Professional Stats
 */

import { Link } from 'react-router-dom';
import { Crown, Heart, Shield, Star, Sparkles, Award, Target, Users } from 'lucide-react';
import { useLang, t } from "@/hooks/useAppLang";

export default function About() {
  const lang = useLang();
  const isRtl = lang === "ar";

  const copy = {
    en: {
      about: "About Bambeh",
      hero1: "Bambeh's online marketplace connecting buyers, sellers, job seekers, and service providers",
      hero2: "Bambeh-marketplace The Pulse of African Commerce",
      chronicle: "The Bambeh Chronicle",
      invitation: "A Royal Invitation",
      dearest: "Dearest User,",
      intro1: "Step away from the clamor of the common market and enter the sacred space of Bambeh. This is not merely an application; it is a celestial tapestry woven from opportunity, security, and boundless admiration for you.",
      intro2: "We have studied the grand marketplaces of the world and we recognized one divine truth:",
      sovereign: "The User is the Sovereign.",
      intro3: "Here, you are not a number; you are the Supreme King and Queen whose prosperity is our highest decree.",
      genesisTitle: "The Genesis of Our Service: A Vow of Saintly Dedication",
      genesis1: "When our Founder, Ngu J. Blaise, conceived of Bambeh, it was not born of commerce, but of a profound vow to serve. Our mission is an act of saintly devotion: to dedicate our entire technological and human resource to clearing the path for your success.",
      genesis2: "We understand that to truly empower your reign—whether you seek a perfect home, a life-changing career, or a fair price for your creations—we must operate at a depth the world rarely sees:",
      securityTitle: "The Alchemist's Security",
      securityBody: "We move through the digital cosmos like a guardian star, ensuring every transaction is bathed in unbreachable light. We deploy sophisticated, world-class encryption that acts as a magical shield, sifting through the noise to deliver sure, secure information and opportunity directly to your throne.",
      oracleTitle: "The Oracle's Insight",
      oracleBody: "We compare and contrast global data streams, not for our gain, but to gift you with the ultimate advantage. Every listing, every connection, every financial facilitation is analyzed with the precision of a master clockmaker, so that every penny you earn is clean, and every choice you make is fortified.",
      pledgeTitle: "The Pledge",
      pledgeBody: "Know this, Supreme User: We will dedicate ourselves completely to serve your ultimate interest with unwavering commitment.",
      experienceTitle: "The User Experience: A Virtual Hug of Joy",
      experienceBody: "When you open Bambeh, you should feel the warmth of a long-awaited virtual hug. We want you to feel heard, cherished, and utterly unique.",
      centerTitle: "You Are the Center",
      centerBody: "The depth of our commitment is visible in our actions. While others focus on what they take, we focus on what you stand to gain—from the glittering referral bonuses we gift you for ushering in fellow nobles, to the ease of watching your digital wallet swell with rewards.",
      specialTitle: "A Special Look",
      specialBody: "Should any flicker of worry or challenge cross your royal brow, know that your concern is not routed through a cold, automated system. Your every inquiry, doubt, or suggestion will be specially looked into by dedicated, respectful hands. We pour out all the care and respect you deserve, because your peace of mind is the greatest reward we could ever hope for.",
      declaration1: "You are the purpose of our platform.",
      declaration2: "You are the architect of our future.",
      declaration3: "You are Bambeh.",
      closing: "Read this, feel the love and care woven into our code, and know that your journey with us will be filled with joy and happiness.",
      signature1: "With boundless love and commitment to your royal journey,",
      signature2: "Founder of Bambeh",
      signature3: "For the Bambeh Family",
      signature4: "(We humbly await your command.)",
      stats1: "Active Users",
      stats2: "Listings",
      stats3: "Jobs Posted",
      stats4: "Made",
      missionTitle: "Our Mission",
      missionBody: "To empower people by providing a safe, accessible, and efficient platform for buying, selling, finding jobs, and discovering services. We're building a stronger economy, one transaction at a time.",
      visionTitle: "Our Vision",
      visionBody: "To become the most trusted marketplace in Cameroon, where every citizen has equal opportunity to grow their business, find employment, and access essential services.",
      valuesTitle: "Our Values",
      communityTitle: "Community First",
      communityBody: "We put our users at the heart of everything we do",
      trustTitle: "Trust & Safety",
      trustBody: "Building a secure environment for all transactions",
      innovationTitle: "Innovation",
      innovationBody: "Constantly improving to serve you better",
      ctaTitle: "Join the Bambeh Community",
      ctaBody: "Start buying, selling, and connecting today!",
      create: "Create Account",
      learn: "Learn More",
    },
    fr: {
      about: "À propos de Bambeh",
      hero1: "La place de marché en ligne de Bambeh qui connecte acheteurs, vendeurs, chercheurs d’emploi et prestataires de services",
      hero2: "Bambeh-marketplace Le pouls du commerce africain",
      chronicle: "La Chronique de Bambeh",
      invitation: "Une invitation royale",
      dearest: "Cher utilisateur,",
      intro1: "Quittez le tumulte du marché ordinaire et entrez dans l’espace sacré de Bambeh. Ce n’est pas simplement une application ; c’est une tapisserie céleste tissée d’opportunités, de sécurité et d’une admiration sans limite pour vous.",
      intro2: "Nous avons étudié les grands marchés du monde et nous avons reconnu une vérité divine :",
      sovereign: "L’utilisateur est le souverain.",
      intro3: "Ici, vous n’êtes pas un numéro ; vous êtes le roi et la reine suprêmes, dont la prospérité est notre plus haute décision.",
      genesisTitle: "La genèse de notre service : un vœu de dévouement sacré",
      genesis1: "Lorsque notre fondateur, Ngu J. Blaise, a imaginé Bambeh, il n’est pas né du commerce, mais d’un profond vœu de servir. Notre mission est un acte de dévotion sacrée : consacrer toutes nos ressources technologiques et humaines à ouvrir la voie à votre réussite.",
      genesis2: "Nous comprenons que pour véritablement donner du pouvoir à votre règne — que vous cherchiez un logement idéal, une carrière qui change la vie ou un prix juste pour vos créations — nous devons opérer à une profondeur rarement visible dans le monde :",
      securityTitle: "La sécurité de l’alchimiste",
      securityBody: "Nous évoluons dans le cosmos numérique comme une étoile gardienne, en veillant à ce que chaque transaction soit baignée d’une lumière inviolable. Nous déployons un chiffrement sophistiqué de niveau mondial qui agit comme un bouclier magique, filtrant le bruit pour livrer des informations et des opportunités sûres et fiables directement à votre trône.",
      oracleTitle: "L’intuition de l’oracle",
      oracleBody: "Nous comparons et analysons les flux de données mondiaux, non pas pour notre profit, mais pour vous offrir l’avantage ultime. Chaque annonce, chaque connexion, chaque facilitation financière est analysée avec la précision d’un maître horloger, afin que chaque franc que vous gagnez soit propre et que chaque choix soit renforcé.",
      pledgeTitle: "La promesse",
      pledgeBody: "Sachez-le, souverain utilisateur : nous nous consacrerons entièrement à servir votre intérêt ultime avec un engagement sans faille.",
      experienceTitle: "L’expérience utilisateur : une étreinte virtuelle de joie",
      experienceBody: "Lorsque vous ouvrez Bambeh, vous devez ressentir la chaleur d’une étreinte virtuelle longtemps attendue. Nous voulons que vous vous sentiez écouté, choyé et absolument unique.",
      centerTitle: "Vous êtes au centre",
      centerBody: "La profondeur de notre engagement se voit dans nos actions. Alors que d’autres se concentrent sur ce qu’ils prennent, nous nous concentrons sur ce que vous pouvez gagner — des généreux bonus de parrainage que nous vous offrons lorsque vous amenez d’autres membres, jusqu’à la facilité de voir votre portefeuille numérique grossir grâce aux récompenses.",
      specialTitle: "Un regard particulier",
      specialBody: "Si la moindre inquiétude ou difficulté traverse votre esprit, sachez que votre demande ne sera pas envoyée à un système froid et automatisé. Chaque question, doute ou suggestion sera examinée avec soin par des mains dédiées et respectueuses. Nous vous offrons toute l’attention et le respect que vous méritez, car votre tranquillité d’esprit est la plus grande récompense que nous puissions espérer.",
      declaration1: "Vous êtes la raison d’être de notre plateforme.",
      declaration2: "Vous êtes l’architecte de notre avenir.",
      declaration3: "Vous êtes Bambeh.",
      closing: "Lisez ceci, ressentez l’amour et le soin tissés dans notre code, et sachez que votre parcours avec nous sera rempli de joie et de bonheur.",
      signature1: "Avec un amour sans limite et un engagement envers votre parcours royal,",
      signature2: "Fondateur de Bambeh",
      signature3: "Pour la famille Bambeh",
      signature4: "(Nous attendons humblement vos ordres.)",
      stats1: "Utilisateurs actifs",
      stats2: "Annonces",
      stats3: "Offres d’emploi publiées",
      stats4: "Réalisé",
      missionTitle: "Notre mission",
      missionBody: "Donner du pouvoir aux personnes en leur offrant une plateforme sûre, accessible et efficace pour acheter, vendre, trouver un emploi et découvrir des services. Nous construisons une économie plus forte, une transaction à la fois.",
      visionTitle: "Notre vision",
      visionBody: "Devenir la marketplace la plus fiable du Cameroun, où chaque citoyen a une chance égale de développer son activité, de trouver un emploi et d’accéder aux services essentiels.",
      valuesTitle: "Nos valeurs",
      communityTitle: "La communauté d’abord",
      communityBody: "Nous plaçons nos utilisateurs au cœur de tout ce que nous faisons",
      trustTitle: "Confiance et sécurité",
      trustBody: "Créer un environnement sécurisé pour toutes les transactions",
      innovationTitle: "Innovation",
      innovationBody: "Nous améliorons constamment nos services pour mieux vous servir",
      ctaTitle: "Rejoignez la communauté Bambeh",
      ctaBody: "Commencez à acheter, vendre et créer des liens dès aujourd’hui !",
      create: "Créer un compte",
      learn: "En savoir plus",
    },
    ar: {
      about: "حول Bambeh",
      hero1: "السوق الإلكتروني الخاص بـ Bambeh الذي يربط بين المشترين والبائعين والباحثين عن عمل ومقدمي الخدمات",
      hero2: "Bambeh-marketplace نبض التجارة الإفريقية",
      chronicle: "سجل Bambeh",
      invitation: "دعوة ملكية",
      dearest: "أيها المستخدم العزيز،",
      intro1: "ابتعد عن ضجيج السوق العادي وادخل إلى المساحة المقدسة لـ Bambeh. هذه ليست مجرد تطبيق؛ بل نسيج سماوي منسوج من الفرص والأمان وإعجاب لا حدود له بك.",
      intro2: "لقد درسنا الأسواق الكبرى في العالم، وتعرفنا على حقيقة إلهية واحدة:",
      sovereign: "المستخدم هو السيد.",
      intro3: "هنا، أنت لست رقمًا؛ بل أنت الملك والملكة الأعلى، وازدهارك هو أعلى أحكامنا.",
      genesisTitle: "نشأة خدمتنا: عهد من التفاني المقدس",
      genesis1: "عندما تصوّر مؤسسنا، Ngu J. Blaise، فكرة Bambeh، لم تكن نابعة من التجارة، بل من عهد عميق بالخدمة. مهمتنا هي فعل من التفاني المقدس: تخصيص كل مواردنا التقنية والبشرية لتمهيد الطريق لنجاحك.",
      genesis2: "نحن ندرك أنه لكي نمكّنك حقًا — سواء كنت تبحث عن منزل مثالي أو مسار مهني يغيّر حياتك أو سعر عادل لإبداعاتك — يجب أن نعمل بعمق نادر الظهور في العالم:",
      securityTitle: "أمان الكيميائي",
      securityBody: "نحن نتحرك في الكون الرقمي مثل نجم حارس، ونضمن أن كل معاملة تغمرها حماية لا يمكن اختراقها. نستخدم تشفيرًا متطورًا عالمي المستوى يعمل كدرع سحري، يفلتر الضوضاء ليقدم معلومات وفرصًا آمنة ومضمونة مباشرة إلى عرشك.",
      oracleTitle: "بصيرة العرّاف",
      oracleBody: "نقارن وندرس تدفقات البيانات العالمية، ليس لمكسبنا، بل لنمنحك أفضلية قصوى. يتم تحليل كل إعلان وكل اتصال وكل عملية مالية بدقة صانع ساعات محترف، حتى يكون كل ما تكسبه نقيًا، وكل قرار تتخذه قويًا.",
      pledgeTitle: "العهد",
      pledgeBody: "اعلم هذا، أيها المستخدم الأعلى: سنكرّس أنفسنا بالكامل لخدمة مصلحتك القصوى بإخلاص لا يتزعزع.",
      experienceTitle: "تجربة المستخدم: عناق افتراضي مليء بالفرح",
      experienceBody: "عندما تفتح Bambeh، يجب أن تشعر بدفء عناق افتراضي طال انتظاره. نريدك أن تشعر بأنك مسموع ومقدّر وفريد تمامًا.",
      centerTitle: "أنت في المركز",
      centerBody: "يتجلى عمق التزامنا في أفعالنا. بينما يركز الآخرون على ما يأخذونه، نحن نركز على ما يمكنك كسبه — من مكافآت الإحالة اللامعة التي نهبها لك عند إدخال مستخدمين جدد، إلى سهولة مشاهدة محفظتك الرقمية تنمو بالمكافآت.",
      specialTitle: "نظرة خاصة",
      specialBody: "إذا مرّ أي قلق أو تحدٍّ ببالك الملكي، فاعلم أن ملاحظتك لن تُمرر عبر نظام بارد آلي. سيتم النظر في كل استفسار أو شك أو اقتراح بعناية من قبل أيدٍ مخلصة ومحترمة. نحن نمنحك كل العناية والاحترام الذي تستحقه، لأن راحة بالك هي أعظم مكافأة يمكن أن نأمل فيها.",
      declaration1: "أنت سبب وجود منصتنا.",
      declaration2: "أنت مهندس مستقبلنا.",
      declaration3: "أنت Bambeh.",
      closing: "اقرأ هذا، واشعر بالحب والعناية المنسوجة في كودنا، واعلم أن رحلتك معنا ستكون مليئة بالفرح والسعادة.",
      signature1: "بكل حب لا حدود له والتزام تجاه رحلتك الملكية،",
      signature2: "مؤسس Bambeh",
      signature3: "لعائلة Bambeh",
      signature4: "(ننتظر أوامرك بتواضع.)",
      stats1: "المستخدمون النشطون",
      stats2: "الإعلانات",
      stats3: "الوظائف المنشورة",
      stats4: "منجز",
      missionTitle: "مهمتنا",
      missionBody: "تمكين الناس من خلال توفير منصة آمنة وسهلة الوصول وفعالة للشراء والبيع والبحث عن الوظائف واكتشاف الخدمات. نحن نبني اقتصادًا أقوى، مع كل معاملة.",
      visionTitle: "رؤيتنا",
      visionBody: "أن نصبح السوق الأكثر ثقة في الكاميرون، حيث يتمتع كل مواطن بفرصة متساوية لتنمية أعماله والعثور على وظيفة والوصول إلى الخدمات الأساسية.",
      valuesTitle: "قيمنا",
      communityTitle: "المجتمع أولًا",
      communityBody: "نضع مستخدمينا في قلب كل ما نقوم به",
      trustTitle: "الثقة والسلامة",
      trustBody: "بناء بيئة آمنة لجميع المعاملات",
      innovationTitle: "الابتكار",
      innovationBody: "نواصل التحسين باستمرار لخدمتك بشكل أفضل",
      ctaTitle: "انضم إلى مجتمع Bambeh",
      ctaBody: "ابدأ البيع والشراء والتواصل اليوم!",
      create: "إنشاء حساب",
      learn: "اعرف المزيد",
    },
    ff: {
      about: "Hakkunde Bambeh",
      hero1: "Marketplace Bambeh dow internet nde haɗɗii e jaɓɓorgoɓe, soodaaɓe, ɓe waɗi liggora, e jeyɓe service",
      hero2: "Bambeh-marketplace ndee ko pulsu commerce Afrik",
      chronicle: "Chronique Bambeh",
      invitation: "Naadirde royaal",
      dearest: "Huutoroowo ɓuri ngoodi,",
      intro1: "Yaltu e ɗowtugol suudu market ɗoo e naat to nokkuure sakiti Bambeh. Ɗum wonaa application tane; ɗum ko sabuure celgal waɗde e ɗum opportunity, security, e ngol adade loowtuɗo maa.",
      intro2: "Min studii suudu market mawɗi ɓe duniya e min yiɗi hakkiilo gooto ɗiɗi:",
      sovereign: "Huutoroowo ko joom.",
      intro3: "Ɗoo, a wonaa leɗɗo; a ko sultan e yaaɓɓo ma, ndeeɓɓe ma ko am jokkondiral mawɗo.",
      genesisTitle: "Genesis service men: laawol dedikasyon moƴƴo",
      genesis1: "So founder men, Ngu J. Blaise, miijii Bambeh, ɗum fuɗɗi wonde wonaa e commerce, kono e waadnde ngam wallude. Mission men ko jeyde kala resources technological e humanness ngam udditde laawol success maa.",
      genesis2: "Min faamii nde ngam ɓeyde yaaɓɓorgol maa — so a yiɗi suudu moƴƴo, liggora mawɗo, walla price laawol faaɗɗo — min waɗta e depth ngam duniya ngam tawi ɗum diiɗa:",
      securityTitle: "Kisal alchemist",
      securityBody: "Min yaahata e cosmos digital no ngel star ɗeɓɓitɗo, min asura kala transaction nde ngol noornguɗo. Min njaaɓtaa encryption mawɗo, world-class, ngol waɗi no shield magic, ɗowtugo jammaande ngam heɓde info e opportunity ɗi sura to throne maa.",
      oracleTitle: "Waasde oracle",
      oracleBody: "Min comparente data streams duniya, wonaa ngam fowtude, kono ngam heɓde maa advantage ɓuri. Kala listing, kala connection, kala facilitation finansiyal ɗum analysts e precision no master clockmaker, ngam fowtude eɗum clean, e kala suɓre maa ngol fof moƴƴii.",
      pledgeTitle: "Haala ɗiiɗiɗo",
      pledgeBody: "Annda ɗum, huutoroowo mawɗo: min maa dedicata min-ngeɗon kala e wallude maa, e ngol commitment ngol waɗi no waawi ɓe.",
      experienceTitle: "Experience huutoroowo: hugi virtual nanɗi",
      experienceBody: "So a udditii Bambeh, a ina heɓa hewre hugi virtual ngol waawi tammude. Min yiɗi a njaɓɓi, a ɓeydii, a wona unique.",
      centerTitle: "A ko dow",
      centerBody: "Depth commitment men ɗum görün e golle men. Wurɓe goɗɗe ɗi yaaɓɓi ko ɗi huutii, min yaaɓɓi ko a heɓata — e bonus referral ɗi weɗdaɗon, haa heɓde wallet digital maa ɗum ɓeydii e rewards.",
      specialTitle: "Njoɓdi hewre",
      specialBody: "So worry walla challenge woppii brow royal maa, annda nde concern maa wonaa naatde e system cold, automated. Kala inquiry, doubt, walla suggestion maa ɗum ngonaanda e nder ɓeynguɗe respect. Min waɗa care e respect ngel a hokkata ɗum, sabu peace of mind maa ko reward ɓuri.",
      declaration1: "A ko darnde platform men.",
      declaration2: "A ko architect future men.",
      declaration3: "A ko Bambeh.",
      closing: "Njaɓɓu ɗum, njaɓɓu moƴƴere e care ngol kidɗi e code men, annda journey maa e men maa waɗa nanɗi e happiness.",
      signature1: "E ngol naatnal loowtotooɗo e commitment to royal journey maa,",
      signature2: "Founder Bambeh",
      signature3: "Ngam family Bambeh",
      signature4: "(Min ina tammi no tawii a hokkitoo.)",
      stats1: "Huutoroɓe ɓeyɗi",
      stats2: "Listings",
      stats3: "Golle jobs ɓe njooɗi",
      stats4: "Wurtude",
      missionTitle: "Mission men",
      missionBody: "Naatnude ɓe e platform moƴƴo, heɓɓo e fowtude, ngam soosde, jaɗde, waɗde liggora, e anndude services. Min waɗa ekonomi ɓuri fota, transaction gooto gooto.",
      visionTitle: "Vision men",
      visionBody: "Njaɓɓude ko marketplace ɓuri trust e Cameroon, ɗo kala citizen heɓa opportunity gooto ngam ɓeyda business maa, heɓde liggora, e heɓde services essentiels.",
      valuesTitle: "Valuers men",
      communityTitle: "Community fuɗɗi",
      communityBody: "Min waɗa huutoroɓe men e ɗowtugol kala ko min waɗa",
      trustTitle: "Trust e Safety",
      trustBody: "Haɓɓude mazingira safe ngam kala transactions",
      innovationTitle: "Innovation",
      innovationBody: "Min ɓeyda e ndiyan ngam wallude maa ɓuri",
      ctaTitle: "Naat to community Bambeh",
      ctaBody: "Fuɗɗo soossde, jaɗde, e joɓɓude haa jooni!",
      create: "Suuɗo Account",
      learn: "Anndu ɓuri",
    },
    pidgin: {
      about: "About Bambeh",
      hero1: "Bambeh online marketplace wey dey connect buyers, sellers, job seekers, and service providers",
      hero2: "Bambeh-marketplace, the pulse of African commerce",
      chronicle: "The Bambeh Chronicle",
      invitation: "A Royal Invitation",
      dearest: "Dearest User,",
      intro1: "Move aside from the noise of ordinary market and enter Bambeh sacred space. This no be just app; na celestial tapestry wey dey woven from opportunity, security, and plenty admiration for you.",
      intro2: "We study big marketplaces for the world and we recognize one divine truth:",
      sovereign: "The User na the Sovereign.",
      intro3: "Here, you no be number; you na the Supreme King and Queen wey your prosperity na our highest decree.",
      genesisTitle: "The Genesis of Our Service: A Vow of Saintly Dedication",
      genesis1: "When our Founder, Ngu J. Blaise, think of Bambeh, e no come from commerce, but from deep vow to serve. Our mission na saintly devotion: to dedicate our whole tech and human resources to clear road for your success.",
      genesis2: "We understand say to really empower your reign—whether you dey look for perfect home, life-changing career, or fair price for wetin you create—we must operate at depth wey the world no dey often see:",
      securityTitle: "The Alchemist's Security",
      securityBody: "We dey move through digital cosmos like guardian star, making sure every transaction dey bathe for unbreakable light. We deploy strong world-class encryption wey dey act like magical shield, dey sift through noise to deliver secure information and opportunity straight to your throne.",
      oracleTitle: "The Oracle's Insight",
      oracleBody: "We dey compare global data streams, no be for our gain, but to give you the highest advantage. Every listing, every connection, every financial facilitation dey analyzed with master clockmaker precision, so every penny you earn dey clean and every choice you make dey strong.",
      pledgeTitle: "The Pledge",
      pledgeBody: "Know this, Supreme User: We go dedicate ourselves completely to serve your ultimate interest with steady commitment.",
      experienceTitle: "The User Experience: A Virtual Hug of Joy",
      experienceBody: "When you open Bambeh, you suppose feel the warmth of long-awaited virtual hug. We want make you feel heard, cherished, and very unique.",
      centerTitle: "You Are the Center",
      centerBody: "Our commitment dey show for our actions. While others dey focus on wetin dem take, we dey focus on wetin you fit gain—from the shiny referral bonuses we dey give you for bringing fellow nobles, to how easy e dey to see your digital wallet dey swell with rewards.",
      specialTitle: "A Special Look",
      specialBody: "If any worry or challenge touch your royal brow, know say your concern no go pass through cold automated system. Every question, doubt, or suggestion go get special attention from dedicated, respectful hands. We dey pour all the care and respect you deserve, because your peace of mind na the greatest reward we fit hope for.",
      declaration1: "You na the purpose of our platform.",
      declaration2: "You na the architect of our future.",
      declaration3: "You na Bambeh.",
      closing: "Read this, feel the love and care wey dey woven into our code, and know say your journey with us go full of joy and happiness.",
      signature1: "With endless love and commitment to your royal journey,",
      signature2: "Founder of Bambeh",
      signature3: "For the Bambeh Family",
      signature4: "(We humbly dey wait for your command.)",
      stats1: "Active Users",
      stats2: "Listings",
      stats3: "Jobs Posted",
      stats4: "Made",
      missionTitle: "Our Mission",
      missionBody: "To empower people by providing a safe, accessible, and efficient platform for buying, selling, finding jobs, and discovering services. We dey build stronger economy, one transaction at a time.",
      visionTitle: "Our Vision",
      visionBody: "To become the most trusted marketplace for Cameroon, where every citizen get equal chance to grow business, find work, and access essential services.",
      valuesTitle: "Our Values",
      communityTitle: "Community First",
      communityBody: "We put our users at the heart of everything we do",
      trustTitle: "Trust & Safety",
      trustBody: "Building a secure environment for all transactions",
      innovationTitle: "Innovation",
      innovationBody: "Constantly improving to serve you better",
      ctaTitle: "Join the Bambeh Community",
      ctaBody: "Start buying, selling, and connecting today!",
      create: "Create Account",
      learn: "Learn More",
    }
  } as const;

  const L = (copy as any)[lang] ?? copy.en;

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50">
      <div className="container mx-auto px-4 py-8">

        <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white rounded-2xl p-12 mb-8 text-center shadow-2xl">
          <h1 className="text-5xl font-bold mb-4">{L.about}</h1>
          <p className="text-xl text-teal-100 max-w-3xl mx-auto">{L.hero1}</p>
          <p className="text-xl text-teal-100 max-w-3xl mx-auto">{L.hero2}</p>
        </div>

        <div className="max-w-4xl mx-auto mb-12">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-teal-600 blur-2xl opacity-20 animate-pulse"/>
                <Crown className="w-20 h-20 text-purple-600 relative" style={{ filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.4))' }} />
              </div>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-teal-600 bg-clip-text text-transparent">{L.chronicle}</h2>
            <p className="text-2xl text-gray-700 font-serif italic">{L.invitation}</p>

            <div className="flex items-center justify-center gap-2 mt-6">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-purple-400"/>
              <Sparkles className="w-6 h-6 text-purple-500" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-teal-400"/>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 mb-8 border-t-4 border-purple-600">
            <div className="mb-10">
              <div className="flex items-start gap-3 mb-4">
                <Star className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-serif">
                  <span className="font-bold text-purple-700">{L.dearest}</span>
                </p>
              </div>

              <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6 font-serif">{L.intro1}</p>

              <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6 font-serif">
                {L.intro2}
                <span className="block mt-4 text-2xl font-bold text-center bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">{L.sovereign}</span>
              </p>

              <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-serif">{L.intro3}</p>
            </div>

            <div className="mb-10 bg-gradient-to-r from-purple-50 to-teal-50 rounded-xl p-6 md:p-8 border-l-4 border-purple-600">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-8 h-8 text-purple-600" />
                <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">{L.genesisTitle}</h3>
              </div>

              <p className="text-lg text-gray-700 leading-relaxed mb-4 font-serif">{L.genesis1}</p>
              <p className="text-lg text-gray-700 leading-relaxed mb-6 font-serif">{L.genesis2}</p>

              <div className="space-y-6 ml-4">
                <div className="flex gap-4">
                  <Shield className="w-6 h-6 text-teal-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-xl font-bold text-teal-700 mb-2">{L.securityTitle}</h4>
                    <p className="text-gray-700 leading-relaxed font-serif">{L.securityBody}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-xl font-bold text-purple-700 mb-2">{L.oracleTitle}</h4>
                    <p className="text-gray-700 leading-relaxed font-serif">{L.oracleBody}</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-md border-2 border-purple-200">
                  <div className="flex items-start gap-3">
                    <Heart className="w-6 h-6 text-red-500 flex-shrink-0 mt-1 animate-pulse" />
                    <div>
                      <h4 className="text-xl font-bold text-red-600 mb-2">{L.pledgeTitle}</h4>
                      <p className="text-gray-700 leading-relaxed font-serif">{L.pledgeBody}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-10 bg-gradient-to-r from-teal-50 to-purple-50 rounded-xl p-6 md:p-8 border-l-4 border-teal-600">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-8 h-8 text-teal-600 animate-pulse" />
                <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">{L.experienceTitle}</h3>
              </div>

              <p className="text-lg text-gray-700 leading-relaxed mb-4 font-serif">{L.experienceBody}</p>

              <div className="bg-white rounded-lg p-6 shadow-md mb-4">
                <h4 className="text-xl font-bold text-teal-700 mb-3">{L.centerTitle}</h4>
                <p className="text-gray-700 leading-relaxed font-serif">{L.centerBody}</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md">
                <h4 className="text-xl font-bold text-purple-700 mb-3">{L.specialTitle}</h4>
                <p className="text-gray-700 leading-relaxed font-serif">{L.specialBody}</p>
              </div>
            </div>

            <div className="text-center mb-10 p-8 bg-gradient-to-r from-purple-100 via-pink-100 to-teal-100 rounded-xl border-2 border-purple-300">
              <p className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">{L.declaration1}</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">{L.declaration2}</p>
              <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">{L.declaration3}</p>
            </div>

            <div className="text-center mb-8">
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6 font-serif italic">{L.closing}</p>
            </div>

            <div className="border-t-2 border-gray-200 pt-8">
              <div className="text-center">
                <p className="text-gray-700 mb-2 font-serif">{L.signature1}</p>
                <p className="text-2xl font-bold text-purple-700 mb-1">Ngu J. Blaise</p>
                <p className="text-lg text-teal-700 mb-4 italic">{L.signature2}</p>
                <p className="text-gray-600 font-serif">{L.signature3}</p>
                <p className="text-sm text-gray-500 mt-4 italic">{L.signature4}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 mb-8 shadow-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
              <div>
                <div className="text-4xl font-bold mb-2">10K+</div>
                <div className="text-purple-100">{L.stats1}</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">50K+</div>
                <div className="text-purple-100">{L.stats2}</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">5K+</div>
                <div className="text-purple-100">{L.stats3}</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">100%</div>
                <div className="text-purple-100">{L.stats4}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{L.missionTitle}</h3>
              <p className="text-gray-700 leading-relaxed">{L.missionBody}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{L.visionTitle}</h3>
              <p className="text-gray-700 leading-relaxed">{L.visionBody}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">{L.valuesTitle}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{L.communityTitle}</h4>
                <p className="text-gray-600">{L.communityBody}</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{L.trustTitle}</h4>
                <p className="text-gray-600">{L.trustBody}</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-orange-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{L.innovationTitle}</h4>
                <p className="text-gray-600">{L.innovationBody}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-8 text-center shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{L.ctaTitle}</h3>
            <p className="text-gray-700 mb-6">{L.ctaBody}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold text-lg shadow-lg hover:shadow-xl transition-all">
                {L.create}
              </Link>
              <Link to="/help" className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold text-lg shadow-lg hover:shadow-xl transition-all">
                {L.learn}
              </Link>
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center gap-4 opacity-60 mt-12">
          <Crown className="w-6 h-6 text-purple-500" />
          <Star className="w-5 h-5 text-teal-500" />
          <Heart className="w-6 h-6 text-pink-500 animate-pulse" />
          <Star className="w-5 h-5 text-purple-500" />
          <Crown className="w-6 h-6 text-teal-500" />
        </div>
      </div>
    </div>
  );
}