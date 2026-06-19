/**
 * src/pages/PostJobPage.tsx
 * Bambeh Marketplace â€” Post a Job
 * Â© 2026 Bambeh Marketplace. All rights reserved.
 *
 * âœ… Full i18n â€” EN / FR / HA / AR / PCM / FUL
 * âœ… Auth-gated â€” redirects to /login if not signed in
 * âœ… Apply methods: WhatsApp, Phone call, Email, In-app platform
 * âœ… Writes to listings table (type='job') via jobs.service
 * âœ… After posting, redirects to the new job's detail page
 * âœ… Zero external dependencies beyond what Bambeh already uses
 */

import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Briefcase, Loader2, CheckCircle } from "lucide-react";
import { createJob } from "@/services/jobs.service";
import { useLang } from "@/hooks/useAppLang";

// â”€â”€â”€ i18n â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const STR: Record<string, Record<string, string>> = {
  pageTitle:       { en:"Post a Job", fr:"Publier une offre", ha:"Wallafa Aiki", ar:"Ù†Ø´Ø± ÙˆØ¸ÙŠÙØ©", pcm:"Post Work", ful:"Fewtu Golle" },
  back:            { en:"Back", fr:"Retour", ha:"Koma", ar:"Ø±Ø¬ÙˆØ¹", pcm:"Go back", ful:"Yahru" },
  subtitle:        { en:"Find the right talent across Cameroon", fr:"Trouvez les meilleurs talents au Cameroun", ha:"Samu gwanin ma'aikata a Kamaru", ar:"Ø§Ø¹Ø«Ø± Ø¹Ù„Ù‰ Ø§Ù„Ù…ÙˆØ§Ù‡Ø¨ ÙÙŠ Ø§Ù„ÙƒØ§Ù…ÙŠØ±ÙˆÙ†", pcm:"Find correct person for Cameroon", ful:"Yiydaa É—oo e Kameruun" },
  jobTitle:        { en:"Job Title *", fr:"IntitulÃ© du poste *", ha:"Sunan Aiki *", ar:"Ø§Ù„Ù…Ø³Ù…Ù‰ Ø§Ù„ÙˆØ¸ÙŠÙÙŠ *", pcm:"Work Name *", ful:"Innde Golle *" },
  jobTitlePh:      { en:"e.g. Senior Software Engineer", fr:"ex. IngÃ©nieur logiciel senior", ha:"mis. Babban Injiniya", ar:"Ù…Ø«Ù„: Ù…Ù‡Ù†Ø¯Ø³ Ø¨Ø±Ù…Ø¬ÙŠØ§Øª Ø£ÙˆÙ„", pcm:"e.g. Big software engineer", ful:"taa. Injiniir É“aleejo" },
  company:         { en:"Company / Organisation", fr:"Entreprise / Organisation", ha:"Kamfani / Æ˜ungiya", ar:"Ø§Ù„Ø´Ø±ÙƒØ© / Ø§Ù„Ù…Ø¤Ø³Ø³Ø©", pcm:"Company / Organisation", ful:"Liggey / Æ˜ulle" },
  companyPh:       { en:"Name of your company", fr:"Nom de votre entreprise", ha:"Sunan kamfaninka", ar:"Ø§Ø³Ù… Ø´Ø±ÙƒØªÙƒ", pcm:"Your company name", ful:"Innde liggey maa" },
  category:        { en:"Job Category *", fr:"CatÃ©gorie *", ha:"Nau'in Aiki *", ar:"Ø§Ù„ÙØ¦Ø© *", pcm:"Work type *", ful:"Suudu Golle *" },
  jobType:         { en:"Employment Type *", fr:"Type de contrat *", ha:"Nau'in kwantiragi *", ar:"Ù†ÙˆØ¹ Ø§Ù„ØªÙˆØ¸ÙŠÙ *", pcm:"Work arrangement *", ful:"Suudu Kontoraaji *" },
  experienceLevel: { en:"Experience Level *", fr:"Niveau d'expÃ©rience *", ha:"Matakin Æ™warewa *", ar:"Ù…Ø³ØªÙˆÙ‰ Ø§Ù„Ø®Ø¨Ø±Ø© *", pcm:"Experience level *", ful:"Karallaagal *" },
  location:        { en:"City / Location *", fr:"Ville / Lieu *", ha:"Gari / Wuri *", ar:"Ø§Ù„Ù…Ø¯ÙŠÙ†Ø© / Ø§Ù„Ù…ÙˆÙ‚Ø¹ *", pcm:"Town / Place *", ful:"Wuro / Æoggol *" },
  locationPh:      { en:"e.g. Douala, YaoundÃ©â€¦", fr:"ex. Douala, YaoundÃ©â€¦", ha:"mis. Douala, YaoundÃ©â€¦", ar:"Ù…Ø«Ù„: Ø¯ÙˆØ§Ù„Ø§ØŒ ÙŠØ§ÙˆÙ†Ø¯ÙŠâ€¦", pcm:"e.g. Douala, YaoundÃ©â€¦", ful:"taa. Douala, YaoundÃ©â€¦" },
  region:          { en:"Region", fr:"RÃ©gion", ha:"Yanki", ar:"Ø§Ù„Ù…Ù†Ø·Ù‚Ø©", pcm:"Region", ful:"Leydi" },
  isRemote:        { en:"Remote work available", fr:"TÃ©lÃ©travail possible", ha:"Ana iya aiki daga nesa", ar:"ÙŠØªÙˆÙØ± Ø¹Ù…Ù„ Ø¹Ù† Ø¨ÙØ¹Ø¯", pcm:"Online work dey", ful:"E Æanndu É—on" },
  salaryMin:       { en:"Min Salary (FCFA/month)", fr:"Salaire min (FCFA/mois)", ha:"Æ˜aramin albashi (FCFA/wata)", ar:"Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ø¯Ù†Ù‰ Ù„Ù„Ø±Ø§ØªØ¨ (ÙØ±Ù†Ùƒ/Ø´Ù‡Ø±)", pcm:"Small salary (FCFA/month)", ful:"Njobdi bilahi (FCFA/koorka)" },
  salaryMax:       { en:"Max Salary (FCFA/month)", fr:"Salaire max (FCFA/mois)", ha:"Babban albashi (FCFA/wata)", ar:"Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ù‚ØµÙ‰ Ù„Ù„Ø±Ø§ØªØ¨", pcm:"Big salary (FCFA/month)", ful:"Njobdi heeli (FCFA/koorka)" },
  salaryPh:        { en:"e.g. 150000", fr:"ex. 150000", ha:"mis. 150000", ar:"Ù…Ø«Ù„: 150000", pcm:"e.g. 150000", ful:"taa. 150000" },
  negotiable:      { en:"Salary is negotiable", fr:"Salaire nÃ©gociable", ha:"Albashin ana tattaunawa", ar:"Ø§Ù„Ø±Ø§ØªØ¨ Ù‚Ø§Ø¨Ù„ Ù„Ù„ØªÙØ§ÙˆØ¶", pcm:"Salary e fit talk", ful:"Njobdi naggi" },
  deadline:        { en:"Application Deadline", fr:"Date limite de candidature", ha:"Æ˜arshen lokacin nema", ar:"Ø¢Ø®Ø± Ù…ÙˆØ¹Ø¯ Ù„Ù„ØªÙ‚Ø¯ÙŠÙ…", pcm:"Last date to apply", ful:"BalÉ—e É“ennoo" },
  description:     { en:"Job Description *", fr:"Description du poste *", ha:"Bayanin aiki *", ar:"ÙˆØµÙ Ø§Ù„ÙˆØ¸ÙŠÙØ© *", pcm:"Work description *", ful:"JaÅ‹tugol Golle *" },
  descPh:          { en:"Describe the role, responsibilities, and what a typical day looks likeâ€¦", fr:"DÃ©crivez le poste, les responsabilitÃ©s, et le quotidien du rÃ´leâ€¦", ha:"Bayyana aikin, ayyuka, da abin da rana ta yau da kullun take kama daâ€¦", ar:"Ø§ÙˆØµÙ Ø§Ù„Ø¯ÙˆØ± ÙˆØ§Ù„Ù…Ø³Ø¤ÙˆÙ„ÙŠØ§Øª ÙˆÙŠÙˆÙ… Ø§Ù„Ø¹Ù…Ù„ Ø§Ù„Ù…Ø¹ØªØ§Ø¯â€¦", pcm:"Tell us wetin the work be, wetin dem go do everydayâ€¦", ful:"JaÅ‹tu golle ndee, ko waÉ—É—ataake, ko haaletee kala ndarÉ—oâ€¦" },
  requirements:    { en:"Requirements & Skills", fr:"Exigences & CompÃ©tences", ha:"BuÆ™atun & Æ˜warewa", ar:"Ø§Ù„Ù…ØªØ·Ù„Ø¨Ø§Øª ÙˆØ§Ù„Ù…Ù‡Ø§Ø±Ø§Øª", pcm:"Wetin dem need", ful:"Ko heÉ“etee" },
  requirePh:       { en:"List qualifications, skills, and experience requiredâ€¦", fr:"Listez les qualifications, compÃ©tences et expÃ©riences requisesâ€¦", ha:"Jera cancanta, Æ™warewa, da kwarewa da ake buÆ™ataâ€¦", ar:"Ø§Ø°ÙƒØ± Ø§Ù„Ù…Ø¤Ù‡Ù„Ø§Øª ÙˆØ§Ù„Ù…Ù‡Ø§Ø±Ø§Øª ÙˆØ§Ù„Ø®Ø¨Ø±Ø© Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø©â€¦", pcm:"List all the things dem needâ€¦", ful:"JaÅ‹tu ko heÉ“etee, É—emÉ—e, karallaagalâ€¦" },
  benefits:        { en:"Benefits & Perks", fr:"Avantages et avantages", ha:"Fa'idoji", ar:"Ø§Ù„Ù…Ø²Ø§ÙŠØ§ ÙˆØ§Ù„Ù…ÙƒØ§ÙØ¢Øª", pcm:"Bonus things", ful:"Nafaaji" },
  benefitsPh:      { en:"Health insurance, transport allowance, bonusesâ€¦", fr:"Assurance maladie, indemnitÃ© de transport, primesâ€¦", ha:"Inshorar lafiya, taimako na sufuri, bonusâ€¦", ar:"ØªØ£Ù…ÙŠÙ† ØµØ­ÙŠØŒ Ø¨Ø¯Ù„ Ù†Ù‚Ù„ØŒ Ù…ÙƒØ§ÙØ¢Øªâ€¦", pcm:"Health, transport, bonus thingsâ€¦", ful:"Laamu cellal, njuÉ“É“udi, nafaajiâ€¦" },
  tags:            { en:"Skills / Tags (comma separated)", fr:"CompÃ©tences / Tags (sÃ©parÃ©s par virgules)", ha:"Æ˜warewa / Alamomi", ar:"Ø§Ù„Ù…Ù‡Ø§Ø±Ø§Øª / Ø§Ù„ÙˆØ³ÙˆÙ…", pcm:"Skills (separate with comma)", ful:"ÆŠemÉ—e (tippuÉ—e e tiindol)" },
  tagsPh:          { en:"React, Node.js, Marketing, Excelâ€¦", fr:"React, Node.js, Marketing, Excelâ€¦", ha:"React, Node.js, Marketing, Excelâ€¦", ar:"React, Node.js, ØªØ³ÙˆÙŠÙ‚â€¦", pcm:"React, Node.js, Marketingâ€¦", ful:"React, Node.jsâ€¦" },
  applyMethod:     { en:"How should candidates apply?", fr:"Comment les candidats doivent-ils postuler ?", ha:"Ta yaya masu nema za su yi nema?", ar:"ÙƒÙŠÙ ÙŠØªÙ‚Ø¯Ù… Ø§Ù„Ù…Ø±Ø´Ø­ÙˆÙ†ØŸ", pcm:"How dem go apply?", ful:"No jokkorÉ—e poti jokkude?" },
  inApp:           { en:"ðŸ“± Through Bambeh Platform", fr:"ðŸ“± Via la plateforme Bambeh", ha:"ðŸ“± Ta hanyar Bambeh", ar:"ðŸ“± Ø¹Ø¨Ø± Ù…Ù†ØµØ© Ø¨Ø§Ù…Ø¨ÙŠÙ‡", pcm:"ðŸ“± Through Bambeh", ful:"ðŸ“± E Bambeh" },
  whatsapp:        { en:"ðŸ’¬ WhatsApp", fr:"ðŸ’¬ WhatsApp", ha:"ðŸ’¬ WhatsApp", ar:"ðŸ’¬ ÙˆØ§ØªØ³Ø§Ø¨", pcm:"ðŸ’¬ WhatsApp", ful:"ðŸ’¬ WhatsApp" },
  phoneCall:       { en:"ðŸ“ž Phone Call", fr:"ðŸ“ž Appel tÃ©lÃ©phonique", ha:"ðŸ“ž Kiran Waya", ar:"ðŸ“ž Ù…ÙƒØ§Ù„Ù…Ø© Ù‡Ø§ØªÙÙŠØ©", pcm:"ðŸ“ž Phone call", ful:"ðŸ“ž Noddaare" },
  email:           { en:"ðŸ“§ Email", fr:"ðŸ“§ Email", ha:"ðŸ“§ Imel", ar:"ðŸ“§ Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ", pcm:"ðŸ“§ Email", ful:"ðŸ“§ Imeel" },
  contactPh:       { en:"Enter phone number or email for applications", fr:"Entrez le numÃ©ro ou email pour les candidatures", ha:"Shigar da lamba ko imel don nema", ar:"Ø£Ø¯Ø®Ù„ Ø§Ù„Ø±Ù‚Ù… Ø£Ùˆ Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ", pcm:"Enter number or email", ful:"Naatnu numeerol maa imeel" },
  posting:         { en:"Publishing your jobâ€¦", fr:"Publication en coursâ€¦", ha:"Ana wallafa aikinâ€¦", ar:"Ø¬Ø§Ø±Ù Ø§Ù„Ù†Ø´Ø±â€¦", pcm:"Dey post your workâ€¦", ful:"Fewtinaamaâ€¦" },
  posted:          { en:"Job posted successfully!", fr:"Offre publiÃ©e avec succÃ¨s!", ha:"An wallafa aiki cikin nasara!", ar:"ØªÙ… Ù†Ø´Ø± Ø§Ù„ÙˆØ¸ÙŠÙØ© Ø¨Ù†Ø¬Ø§Ø­!", pcm:"Your work don post!", ful:"Golle fewtiima!" },
  postBtn:         { en:"Publish Job", fr:"Publier l'offre", ha:"Wallafa Aiki", ar:"Ù†Ø´Ø± Ø§Ù„ÙˆØ¸ÙŠÙØ©", pcm:"Post the work", ful:"Fewtu Golle" },
  requiredFields:  { en:"Please fill all required fields (*)", fr:"Veuillez remplir tous les champs obligatoires (*)", ha:"Da fatan a cika duk filayen da ake buÆ™ata (*)", ar:"ÙŠØ±Ø¬Ù‰ Ù…Ù„Ø¡ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø­Ù‚ÙˆÙ„ Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø© (*)", pcm:"Fill all * fields abeg", ful:"HeÉ“tu goÉ—É—e fof peewnaaÉ—e (*)" },
  loginRequired:   { en:"You must be logged in to post a job", fr:"Vous devez Ãªtre connectÃ© pour publier une offre", ha:"Dole ne ku shiga don wallafa aiki", ar:"ÙŠØ¬Ø¨ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù„Ù†Ø´Ø± ÙˆØ¸ÙŠÙØ©", pcm:"You need login first", ful:"Naatir ngam fewtoyde golle" },
};

function s(key: string, lang: string): string {
  return STR[key]?.[lang] ?? STR[key]?.["en"] ?? key;
}

// â”€â”€â”€ Category / type / region data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CATEGORIES = [
  { value:"Technology",  label:{ en:"Technology",  fr:"Technologie", ha:"Fasaha", ar:"ØªÙƒÙ†ÙˆÙ„ÙˆØ¬ÙŠØ§", pcm:"Tech", ful:"Tekinoloji" }},
  { value:"Marketing",   label:{ en:"Marketing",   fr:"Marketing", ha:"Tallatawa", ar:"ØªØ³ÙˆÙŠÙ‚", pcm:"Marketing", ful:"Marketing" }},
  { value:"Finance",     label:{ en:"Finance",     fr:"Finance", ha:"Kudi", ar:"Ù…Ø§Ù„ÙŠØ©", pcm:"Money work", ful:"Mbappu" }},
  { value:"Engineering", label:{ en:"Engineering", fr:"IngÃ©nierie", ha:"Injiniya", ar:"Ù‡Ù†Ø¯Ø³Ø©", pcm:"Engineering", ful:"Engineering" }},
  { value:"Education",   label:{ en:"Education",   fr:"Ã‰ducation", ha:"Ilimi", ar:"Ø§Ù„ØªØ¹Ù„ÙŠÙ…", pcm:"School work", ful:"Janngugol" }},
  { value:"Agriculture", label:{ en:"Agriculture", fr:"Agriculture", ha:"Noma", ar:"Ø²Ø±Ø§Ø¹Ø©", pcm:"Farm work", ful:"Ndemndi" }},
  { value:"Healthcare",  label:{ en:"Healthcare",  fr:"SantÃ©", ha:"Kiwon lafiya", ar:"ØµØ­Ø©", pcm:"Hospital work", ful:"Cellal" }},
  { value:"Logistics",   label:{ en:"Logistics",   fr:"Logistique", ha:"Sufuri", ar:"Ù„ÙˆØ¬Ø³ØªÙŠØ§Øª", pcm:"Transport work", ful:"Heftugol" }},
  { value:"Sales",       label:{ en:"Sales",       fr:"Ventes", ha:"Sayarwa", ar:"Ù…Ø¨ÙŠØ¹Ø§Øª", pcm:"Sell sell", ful:"Jaral" }},
  { value:"Legal",       label:{ en:"Legal",       fr:"Juridique", ha:"Shari'a", ar:"Ù‚Ø§Ù†ÙˆÙ†ÙŠ", pcm:"Law work", ful:"Laawol" }},
  { value:"Other",       label:{ en:"Other",       fr:"Autre", ha:"Wani", ar:"Ø£Ø®Ø±Ù‰", pcm:"Other", ful:"WoÉ—É—um" }},
];

const JOB_TYPES = [
  { value:"full_time",  label:{ en:"Full-time",  fr:"Temps plein", ha:"Cikakken lokaci", ar:"Ø¯ÙˆØ§Ù… ÙƒØ§Ù…Ù„", pcm:"Full time", ful:"Waktu fof" }},
  { value:"part_time",  label:{ en:"Part-time",  fr:"Temps partiel", ha:"Rabin lokaci", ar:"Ø¯ÙˆØ§Ù… Ø¬Ø²Ø¦ÙŠ", pcm:"Half time", ful:"Waktu didi" }},
  { value:"contract",   label:{ en:"Contract",   fr:"Contrat", ha:"Kwantiragi", ar:"Ø¹Ù‚Ø¯", pcm:"Contract", ful:"Kontoraaji" }},
  { value:"internship", label:{ en:"Internship", fr:"Stage", ha:"Horarwa", ar:"ØªØ¯Ø±ÙŠØ¨", pcm:"Training", ful:"Jannginagol" }},
  { value:"freelance",  label:{ en:"Freelance",  fr:"Freelance", ha:"Yanci", ar:"Ø­Ø±", pcm:"Freelance", ful:"Freelance" }},
  { value:"temporary",  label:{ en:"Temporary",  fr:"Temporaire", ha:"Wucin gadi", ar:"Ù…Ø¤Ù‚Øª", pcm:"Small time", ful:"SeeÉ—a" }},
];

const EXP_LEVELS = [
  { value:"no_experience", label:{ en:"No experience", fr:"Sans expÃ©rience", ha:"Ba tare da kwarewa ba", ar:"Ø¨Ø¯ÙˆÙ† Ø®Ø¨Ø±Ø©", pcm:"No experience", ful:"Alaa karallaagal" }},
  { value:"entry",         label:{ en:"Entry level (0â€“2 yrs)", fr:"DÃ©butant (0â€“2 ans)", ha:"Farawa (0â€“2)", ar:"Ù…Ø¨ØªØ¯Ø¦ (0â€“2)", pcm:"Starter (0-2yrs)", ful:"Sappoowo (0-2)" }},
  { value:"mid",           label:{ en:"Mid level (2â€“5 yrs)", fr:"IntermÃ©diaire (2â€“5)", ha:"Matsakaici (2â€“5)", ar:"Ù…ØªÙˆØ³Ø· (2â€“5)", pcm:"Middle (2-5yrs)", ful:"SeeÉ—um (2-5)" }},
  { value:"senior",        label:{ en:"Senior (5+ yrs)", fr:"Senior (5+ ans)", ha:"Babba (5+)", ar:"Ø®Ø¨ÙŠØ± (5+)", pcm:"Big man (5+yrs)", ful:"MawÉ—o (5+)" }},
  { value:"executive",     label:{ en:"Executive", fr:"Cadre dirigeant", ha:"Manajan", ar:"Ù…Ø³Ø¤ÙˆÙ„ ØªÙ†ÙÙŠØ°ÙŠ", pcm:"Big boss", ful:"Jom Laamu" }},
];

const REGIONS = [
  "Centre","Littoral","West","South West","North West",
  "Adamawa","South","East","North","Far North",
];

// â”€â”€â”€ Form state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface FormState {
  title: string;
  company: string;
  category: string;
  jobType: string;
  experienceLevel: string;
  city: string;
  region: string;
  isRemote: boolean;
  salaryMin: string;
  salaryMax: string;
  isSalaryNegotiable: boolean;
  deadline: string;
  description: string;
  requirements: string;
  benefits: string;
  tags: string;
  applyMethod: string;
  applyContact: string;
}

const INIT: FormState = {
  title: "", company: "", category: "Technology", jobType: "full_time",
  experienceLevel: "entry", city: "", region: "Littoral",
  isRemote: false, salaryMin: "", salaryMax: "", isSalaryNegotiable: false,
  deadline: "", description: "", requirements: "", benefits: "",
  tags: "", applyMethod: "in_app", applyContact: "",
};

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function PostJobPage() {
  const navigate = useNavigate();
  const lang     = useLang();
  const dir      = lang === "ar" ? "rtl" : "ltr";

  const [form,     setForm]     = useState<FormState>(INIT);
  const [posting,  setPosting]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const toggle = (field: keyof FormState) =>
    setForm((prev) => ({ ...prev, [field]: !prev[field as keyof FormState] }));

  const handleSubmit = useCallback(async () => {
    setErrorMsg(null);

    // Validation
    if (!form.title.trim() || !form.city.trim() || !form.description.trim()) {
      setErrorMsg(s("requiredFields", lang));
      return;
    }

    // Auth check
    const { supabase } = await import("@/lib/supabase");
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      navigate("/login");
      return;
    }

    setPosting(true);

    const result = await createJob(session.session.user.id, {
      title:               form.title.trim(),
      company:             form.company.trim() || undefined,
      category:            form.category,
      jobType:             form.jobType as any,
      experienceLevel:     form.experienceLevel as any,
      location: {
        city:    form.city.trim(),
        region:  form.region,
        country: "Cameroon",
      },
      isRemote:            form.isRemote,
      salaryMinXAF:        form.salaryMin ? Number(form.salaryMin) : undefined,
      salaryMaxXAF:        form.salaryMax ? Number(form.salaryMax) : undefined,
      isSalaryNegotiable:  form.isSalaryNegotiable,
      applicationDeadline: form.deadline || undefined,
      description:         form.description.trim(),
      requirements:        form.requirements.trim() || undefined,
      benefits:            form.benefits.trim() || undefined,
      tags:                form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      status:              "active",
      applyMethod:         form.applyMethod as any,
      applyContact:        form.applyContact.trim() || undefined,
    } as any);

    setPosting(false);

    if (result.success && result.id) {
      setSuccess(true);
      setTimeout(() => navigate(`/jobs/${result.id}`), 1500);
    } else {
      setErrorMsg(result.error ?? "Failed to post job");
    }
  }, [form, lang, navigate]);

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8" dir={dir}>
        <CheckCircle className="w-16 h-16 text-green-500" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center">
          {s("posted", lang)}
        </h2>
        <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32" dir={dir}>

      {/* Header */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-800 px-4 pt-5 pb-8">
        <button type="button" onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-teal-200 hover:text-white text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> {s("back", lang)}
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
            ðŸ’¼
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">{s("pageTitle", lang)}</h1>
            <p className="text-teal-200 text-xs">{s("subtitle", lang)}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5 max-w-lg mx-auto">

        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        {/* Job Title */}
        <Field label={s("jobTitle", lang)}>
          <input value={form.title} onChange={set("title")}
            placeholder={s("jobTitlePh", lang)}
            className={inputCls} />
        </Field>

        {/* Company */}
        <Field label={s("company", lang)}>
          <input value={form.company} onChange={set("company")}
            placeholder={s("companyPh", lang)}
            className={inputCls} />
        </Field>

        {/* Category */}
        <Field label={s("category", lang)}>
          <select value={form.category} onChange={set("category")} className={inputCls}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label[lang as keyof typeof c.label] ?? c.label.en}
              </option>
            ))}
          </select>
        </Field>

        {/* Job Type + Experience Level (side by side) */}
        <div className="grid grid-cols-2 gap-3">
          <Field label={s("jobType", lang)}>
            <select value={form.jobType} onChange={set("jobType")} className={inputCls}>
              {JOB_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label[lang as keyof typeof t.label] ?? t.label.en}
                </option>
              ))}
            </select>
          </Field>
          <Field label={s("experienceLevel", lang)}>
            <select value={form.experienceLevel} onChange={set("experienceLevel")} className={inputCls}>
              {EXP_LEVELS.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label[lang as keyof typeof e.label] ?? e.label.en}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {/* Location */}
        <div className="grid grid-cols-2 gap-3">
          <Field label={s("location", lang)}>
            <input value={form.city} onChange={set("city")}
              placeholder={s("locationPh", lang)}
              className={inputCls} />
          </Field>
          <Field label={s("region", lang)}>
            <select value={form.region} onChange={set("region")} className={inputCls}>
              {REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </Field>
        </div>

        {/* Remote toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => toggle("isRemote")}
            className={`w-11 h-6 rounded-full transition-colors ${form.isRemote ? "bg-teal-500" : "bg-gray-300 dark:bg-gray-600"}`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${form.isRemote ? "translate-x-5 ml-0.5" : "translate-x-0.5"}`} />
          </div>
          <span className="text-sm text-gray-700 dark:text-gray-300">{s("isRemote", lang)}</span>
        </label>

        {/* Salary */}
        <div className="grid grid-cols-2 gap-3">
          <Field label={s("salaryMin", lang)}>
            <input type="number" value={form.salaryMin} onChange={set("salaryMin")}
              placeholder={s("salaryPh", lang)} min="0"
              className={inputCls} />
          </Field>
          <Field label={s("salaryMax", lang)}>
            <input type="number" value={form.salaryMax} onChange={set("salaryMax")}
              placeholder={s("salaryPh", lang)} min="0"
              className={inputCls} />
          </Field>
        </div>

        {/* Negotiable toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => toggle("isSalaryNegotiable")}
            className={`w-11 h-6 rounded-full transition-colors ${form.isSalaryNegotiable ? "bg-teal-500" : "bg-gray-300 dark:bg-gray-600"}`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${form.isSalaryNegotiable ? "translate-x-5 ml-0.5" : "translate-x-0.5"}`} />
          </div>
          <span className="text-sm text-gray-700 dark:text-gray-300">{s("negotiable", lang)}</span>
        </label>

        {/* Deadline */}
        <Field label={s("deadline", lang)}>
          <input type="date" value={form.deadline} onChange={set("deadline")}
            min={new Date().toISOString().split("T")[0]}
            className={inputCls} />
        </Field>

        {/* Description */}
        <Field label={s("description", lang)}>
          <textarea value={form.description} onChange={set("description")}
            placeholder={s("descPh", lang)}
            rows={5} className={`${inputCls} resize-none`} />
        </Field>

        {/* Requirements */}
        <Field label={s("requirements", lang)}>
          <textarea value={form.requirements} onChange={set("requirements")}
            placeholder={s("requirePh", lang)}
            rows={4} className={`${inputCls} resize-none`} />
        </Field>

        {/* Benefits */}
        <Field label={s("benefits", lang)}>
          <textarea value={form.benefits} onChange={set("benefits")}
            placeholder={s("benefitsPh", lang)}
            rows={3} className={`${inputCls} resize-none`} />
        </Field>

        {/* Tags */}
        <Field label={s("tags", lang)}>
          <input value={form.tags} onChange={set("tags")}
            placeholder={s("tagsPh", lang)}
            className={inputCls} />
        </Field>

        {/* Apply method */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
            {s("applyMethod", lang)}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value:"in_app",   label: s("inApp", lang) },
              { value:"whatsapp", label: s("whatsapp", lang) },
              { value:"call",     label: s("phoneCall", lang) },
              { value:"email",    label: s("email", lang) },
            ].map((opt) => (
              <button key={opt.value} type="button"
                onClick={() => setForm((p) => ({ ...p, applyMethod: opt.value }))}
                className={`py-2.5 px-3 rounded-xl border-2 text-sm font-semibold transition-all text-left
                  ${form.applyMethod === opt.value
                    ? "border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"}`}>
                {opt.label}
              </button>
            ))}
          </div>

          {form.applyMethod !== "in_app" && (
            <input
              value={form.applyContact}
              onChange={set("applyContact")}
              placeholder={s("contactPh", lang)}
              className={`${inputCls} mt-3`}
            />
          )}
        </div>

      </div>

      {/* Sticky submit button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={posting}
          className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-70
                     text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors max-w-lg mx-auto"
        >
          {posting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> {s("posting", lang)}</>
          ) : (
            <><Briefcase className="w-4 h-4" /> {s("postBtn", lang)}</>
          )}
        </button>
      </div>
    </div>
  );
}

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const inputCls = `w-full border-2 border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5
                  text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none
                  focus:border-teal-500 transition-colors`;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
