// BAMBEH_DEPLOY_TOKEN__FARMFRESHSELLER_FIX603_CLEAN
/**
 * src/pages/FarmFreshSellerPage.tsx — Bambeh Marketplace
 *
 * FIXES:
 *  ✅ BOM character removed from file start
 *  ✅ validateImg no longer calls useLang() (hooks can't be called outside components)
 *  ✅ farmer_id + seller_id BOTH inserted (DB has farmer_id NOT NULL)
 *  ✅ Storage RLS graceful fallback: if image upload fails RLS, listing
 *     is saved WITHOUT photos and user gets a clear warning (not a crash)
 *  ✅ Full i18n: English, French, Pidgin, Arabic, Fulfulde — live-reactive
 *  ✅ 3-step wizard: Produce Details → Location & Description → Photos & Review
 *  ✅ Draft save/restore
 */

import { prepImage } from "@/utils/bambehImagePrep";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { AlertCircle } from "lucide-react";
import { useLang, t } from "@/hooks/useAppLang";

/* ===================================================================== *
 * FIX603 - this page was printing its own key names on screen:
 *   listYourProducePage, step1Label, produceName, saveDraft, nextStep...
 * t() from useAppLang returns the KEY when it cannot find a string, and the
 * shared dictionary has never carried these. So the page shipped unreadable
 * in every language, Arabic included.
 *
 * The 65 strings this page needs now live HERE, in all five languages. tt()
 * reads them first and only falls through to the shared t() for anything not
 * listed - so this page cannot be broken again by a gap in a file it does not
 * own. Every non-ASCII character is a \uXXXX escape, which is why the Arabic
 * here cannot be destroyed by a non-UTF-8 write the way the rentals and
 * vehicles pages were.
 * ===================================================================== */
const FF_STR: Record<string, Record<string, string>> = {
  en: {
    addPhotos: 'Add photos',
    category: 'Category',
    charCount: 'characters',
    delivAvail: 'You deliver',
    deliveryKey: 'Delivery',
    deliveryToggleDesc: 'Turn this off if buyers must come to you.',
    deliveryToggleLabel: 'Can you deliver',
    descPlaceholder: 'How fresh, how it was grown, when you harvested',
    descPreview: 'How buyers will see it',
    description: 'Tell buyers about it',
    draftSaved: 'Saved. Come back any time.',
    errorDescription: 'Please write a little about it',
    errorLocation: 'Please say where the produce is',
    errorPrice: 'Please put a price',
    errorProduceName: 'Please say what you are selling',
    goBack: 'Back',
    imageUploadSkipped: 'A photo did not upload. Your listing was saved without it.',
    listAnother: 'List something else',
    listWorldwide: 'Show this outside Cameroon',
    listYourProducePage: 'List your produce',
    listingSummary: 'Check this before you post',
    locationKey: 'Where',
    locationPlaceholder: 'Your quarter, then your town',
    logInSignUp: 'Sign in or create an account',
    loginRequired: 'Sign in first',
    loginRequiredSub: 'You need an account to sell on Farm Fresh.',
    loginRequiredSub2: 'It takes a minute and it is free.',
    maxPhotos: 'Six photos is the most',
    minChars: 'A bit more detail please',
    nextStep: 'Next',
    no: 'No',
    noPhotosWarn: 'You can post without a photo, but far fewer people will look.',
    notSpecified: 'Not given',
    organicDesc: 'Tick this only if it is true. Buyers ask.',
    organicKey: 'No chemicals',
    organicLabel: 'Grown without chemicals',
    photoHeader: 'Add photos',
    photoSecure: 'Your photos stay on Bambeh. We never sell them.',
    photoSub: 'A clear photo sells faster than a good price.',
    photosKey: 'photos',
    photosTip: 'Getting a good photo',
    photosTipBody: 'Daylight, plain background, no flash. Show the real size next to your hand.',
    photosTipSub: 'This matters more than anything else on this page.',
    pickupOnly: 'Buyer collects',
    posting: 'Posting...',
    priceKey: 'Price',
    priceLabel: 'Price per unit',
    produceKey: 'Produce',
    produceListed: 'Your produce is live',
    produceListedSub: 'Buyers in your town can see it now.',
    produceListedSub2: 'Answer fast when somebody asks. The first reply usually gets the sale.',
    produceName: 'What are you selling',
    produceNamePlaceholder: 'e.g. Tomatoes, Plantain, Eggs',
    saveDraft: 'Save for later',
    step1Label: 'About your produce',
    step2Label: 'Photos',
    step3Label: 'Where and how',
    stockKey: 'Quantity',
    stockQty: 'How much do you have',
    tapUpload: 'Tap to add a photo',
    unit: 'Sold by',
    viewFarmFresh: 'See Farm Fresh',
    worldwideVis: 'Anywhere',
    yesOrganic: 'Yes',
    yourLocation: 'Where is it',
  },
  fr: {
    addPhotos: 'Ajouter des photos',
    category: 'Categorie',
    charCount: 'caracteres',
    delivAvail: 'Vous livrez',
    deliveryKey: 'Livraison',
    deliveryToggleDesc: 'Desactivez si l acheteur doit venir vous voir.',
    deliveryToggleLabel: 'Pouvez-vous livrer',
    descPlaceholder: 'Fraicheur, culture, date de recolte',
    descPreview: 'Ce que verront les acheteurs',
    description: 'Parlez-en aux acheteurs',
    draftSaved: 'Enregistre. Revenez quand vous voulez.',
    errorDescription: 'Ecrivez quelques mots',
    errorLocation: 'Indiquez ou se trouve le produit',
    errorPrice: 'Mettez un prix',
    errorProduceName: 'Dites ce que vous vendez',
    goBack: 'Retour',
    imageUploadSkipped: 'Une photo n a pas ete envoyee. Votre annonce a ete enregistree sans elle.',
    listAnother: 'Proposer autre chose',
    listWorldwide: 'Montrer hors du Cameroun',
    listYourProducePage: 'Proposez vos produits',
    listingSummary: 'Verifiez avant de publier',
    locationKey: 'Ou',
    locationPlaceholder: 'Votre quartier, puis votre ville',
    logInSignUp: 'Se connecter ou creer un compte',
    loginRequired: 'Connectez-vous d abord',
    loginRequiredSub: 'Il faut un compte pour vendre sur Farm Fresh.',
    loginRequiredSub2: 'Cela prend une minute et c est gratuit.',
    maxPhotos: 'Six photos au maximum',
    minChars: 'Un peu plus de details',
    nextStep: 'Suivant',
    no: 'Non',
    noPhotosWarn: 'Vous pouvez publier sans photo, mais bien moins de gens regarderont.',
    notSpecified: 'Non indique',
    organicDesc: 'Ne cochez que si c est vrai. Les acheteurs demandent.',
    organicKey: 'Sans produits chimiques',
    organicLabel: 'Cultive sans produits chimiques',
    photoHeader: 'Ajouter des photos',
    photoSecure: 'Vos photos restent sur Bambeh. Nous ne les vendons jamais.',
    photoSub: 'Une photo claire vend plus vite qu un bon prix.',
    photosKey: 'photos',
    photosTip: 'Reussir la photo',
    photosTipBody: 'Lumiere du jour, fond simple, pas de flash. Montrez la taille reelle a cote de votre main.',
    photosTipSub: 'Cela compte plus que tout le reste sur cette page.',
    pickupOnly: 'L acheteur vient chercher',
    posting: 'Publication...',
    priceKey: 'Prix',
    priceLabel: 'Prix par unite',
    produceKey: 'Produit',
    produceListed: 'Votre produit est en ligne',
    produceListedSub: 'Les acheteurs de votre ville le voient deja.',
    produceListedSub2: 'Repondez vite. Le premier a repondre fait souvent la vente.',
    produceName: 'Que vendez-vous',
    produceNamePlaceholder: 'ex. Tomates, Plantain, Oeufs',
    saveDraft: 'Garder pour plus tard',
    step1Label: 'Votre produit',
    step2Label: 'Photos',
    step3Label: 'Ou et comment',
    stockKey: 'Quantite',
    stockQty: 'Quelle quantite avez-vous',
    tapUpload: 'Touchez pour ajouter une photo',
    unit: 'Vendu par',
    viewFarmFresh: 'Voir Farm Fresh',
    worldwideVis: 'Partout',
    yesOrganic: 'Oui',
    yourLocation: 'Ou est-ce',
  },
  pcm: {
    addPhotos: 'Add photo',
    category: 'Category',
    charCount: 'letters',
    delivAvail: 'You dey carry am',
    deliveryKey: 'Delivery',
    deliveryToggleDesc: 'Off am if buyer must come meet you.',
    deliveryToggleLabel: 'You go carry am go',
    descPlaceholder: 'How fresh, how you grow am, when you harvest',
    descPreview: 'How buyer go see am',
    description: 'Tell buyer about am',
    draftSaved: 'We keep am. Come back any time.',
    errorDescription: 'Write small something',
    errorLocation: 'Tell us where the thing dey',
    errorPrice: 'Put price',
    errorProduceName: 'Talk wetin you dey sell',
    goBack: 'Go back',
    imageUploadSkipped: 'One photo no enter. We save your post without am.',
    listAnother: 'Put another thing',
    listWorldwide: 'Show am outside Cameroon',
    listYourProducePage: 'Put your farm things for sale',
    listingSummary: 'Check am well before you post',
    locationKey: 'Where',
    locationPlaceholder: 'Your quarter, then your town',
    logInSignUp: 'Enter or open account',
    loginRequired: 'Enter your account first',
    loginRequiredSub: 'You need account before you sell for Farm Fresh.',
    loginRequiredSub2: 'E take one minute and e free.',
    maxPhotos: 'Six photo na the max',
    minChars: 'Add small more talk',
    nextStep: 'Next',
    no: 'No',
    noPhotosWarn: 'You can post without photo, but small people go look am.',
    notSpecified: 'You no talk',
    organicDesc: 'Tick am only if e true. Buyer dey ask.',
    organicKey: 'No chemical',
    organicLabel: 'You no put chemical',
    photoHeader: 'Add photo',
    photoSecure: 'Your photo go stay for Bambeh. We no dey sell am.',
    photoSub: 'Clear photo dey sell pass good price.',
    photosKey: 'photo',
    photosTip: 'How to snap good photo',
    photosTipBody: 'Day light, plain background, no flash. Put your hand near am so dem see the size.',
    photosTipSub: 'This one important pass everything for this page.',
    pickupOnly: 'Buyer go come take am',
    posting: 'E dey go...',
    priceKey: 'Price',
    priceLabel: 'Price for one',
    produceKey: 'Thing',
    produceListed: 'Your thing dey live now',
    produceListedSub: 'People for your town dey see am.',
    produceListedSub2: 'Answer quick when person ask. First answer dey get the sale.',
    produceName: 'Wetin you dey sell',
    produceNamePlaceholder: 'like Tomato, Plantain, Egg',
    saveDraft: 'Keep am for later',
    step1Label: 'Talk about your thing',
    step2Label: 'Photo',
    step3Label: 'Where and how',
    stockKey: 'Quantity',
    stockQty: 'How much you get',
    tapUpload: 'Touch here to add photo',
    unit: 'You dey sell am by',
    viewFarmFresh: 'See Farm Fresh',
    worldwideVis: 'Anywhere',
    yesOrganic: 'Yes',
    yourLocation: 'Where e dey',
  },
  ar: {
    addPhotos: '\u0623\u0636\u0641 \u0635\u0648\u0631\u0627\u064B',
    category: '\u0627\u0644\u0641\u0626\u0629',
    charCount: '\u062D\u0631\u0641\u0627\u064B',
    delivAvail: '\u0623\u0646\u062A \u062A\u0648\u0635\u0651\u0644',
    deliveryKey: '\u0627\u0644\u062A\u0648\u0635\u064A\u0644',
    deliveryToggleDesc: '\u0623\u0648\u0642\u0641 \u0647\u0630\u0627 \u0625\u0646 \u0643\u0627\u0646 \u0639\u0644\u0649 \u0627\u0644\u0645\u0634\u062A\u0631\u064A \u0627\u0644\u0642\u062F\u0648\u0645 \u0625\u0644\u064A\u0643.',
    deliveryToggleLabel: '\u0647\u0644 \u062A\u0648\u0635\u0651\u0644',
    descPlaceholder: '\u0645\u062F\u0649 \u0627\u0644\u0637\u0632\u0627\u062C\u0629\u060C \u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u0632\u0631\u0627\u0639\u0629\u060C \u0648\u0642\u062A \u0627\u0644\u062D\u0635\u0627\u062F',
    descPreview: '\u0643\u064A\u0641 \u0633\u064A\u0631\u0627\u0647 \u0627\u0644\u0645\u0634\u062A\u0631\u0648\u0646',
    description: '\u0623\u062E\u0628\u0631 \u0627\u0644\u0645\u0634\u062A\u0631\u064A\u0646 \u0639\u0646\u0647',
    draftSaved: '\u062A\u0645 \u0627\u0644\u062D\u0641\u0638. \u0639\u062F \u0641\u064A \u0623\u064A \u0648\u0642\u062A.',
    errorDescription: '\u0627\u0643\u062A\u0628 \u0648\u0635\u0641\u0627\u064B \u0642\u0635\u064A\u0631\u0627\u064B',
    errorLocation: '\u062D\u062F\u062F \u0645\u0643\u0627\u0646 \u0627\u0644\u0645\u062D\u0635\u0648\u0644',
    errorPrice: '\u0636\u0639 \u0633\u0639\u0631\u0627\u064B',
    errorProduceName: '\u0627\u0630\u0643\u0631 \u0645\u0627 \u062A\u0628\u064A\u0639\u0647',
    goBack: '\u0631\u062C\u0648\u0639',
    imageUploadSkipped: '\u0644\u0645 \u062A\u064F\u0631\u0641\u0639 \u0625\u062D\u062F\u0649 \u0627\u0644\u0635\u0648\u0631. \u062A\u0645 \u062D\u0641\u0638 \u0625\u0639\u0644\u0627\u0646\u0643 \u0628\u062F\u0648\u0646\u0647\u0627.',
    listAnother: '\u0627\u0639\u0631\u0636 \u0634\u064A\u0626\u0627\u064B \u0622\u062E\u0631',
    listWorldwide: '\u0627\u0639\u0631\u0636\u0647 \u062E\u0627\u0631\u062C \u0627\u0644\u0643\u0627\u0645\u064A\u0631\u0648\u0646',
    listYourProducePage: '\u0627\u0639\u0631\u0636 \u0645\u062D\u0635\u0648\u0644\u0643',
    listingSummary: '\u0631\u0627\u062C\u0639 \u0642\u0628\u0644 \u0627\u0644\u0646\u0634\u0631',
    locationKey: '\u0627\u0644\u0645\u0643\u0627\u0646',
    locationPlaceholder: '\u062D\u064A\u0651\u0643\u060C \u062B\u0645 \u0645\u062F\u064A\u0646\u062A\u0643',
    logInSignUp: '\u0633\u062C\u0651\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648 \u0623\u0646\u0634\u0626 \u062D\u0633\u0627\u0628\u0627\u064B',
    loginRequired: '\u0633\u062C\u0651\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B',
    loginRequiredSub: '\u062A\u062D\u062A\u0627\u062C \u062D\u0633\u0627\u0628\u0627\u064B \u0644\u0644\u0628\u064A\u0639 \u0641\u064A Farm Fresh.',
    loginRequiredSub2: '\u064A\u0633\u062A\u063A\u0631\u0642 \u062F\u0642\u064A\u0642\u0629 \u0648\u0647\u0648 \u0645\u062C\u0627\u0646\u064A.',
    maxPhotos: '\u0633\u062A \u0635\u0648\u0631 \u0643\u062D\u062F \u0623\u0642\u0635\u0649',
    minChars: '\u0623\u0636\u0641 \u062A\u0641\u0627\u0635\u064A\u0644 \u0623\u0643\u062B\u0631 \u0642\u0644\u064A\u0644\u0627\u064B',
    nextStep: '\u0627\u0644\u062A\u0627\u0644\u064A',
    no: '\u0644\u0627',
    noPhotosWarn: '\u064A\u0645\u0643\u0646\u0643 \u0627\u0644\u0646\u0634\u0631 \u0628\u062F\u0648\u0646 \u0635\u0648\u0631\u0629\u060C \u0644\u0643\u0646 \u0639\u062F\u062F\u0627\u064B \u0623\u0642\u0644 \u0628\u0643\u062B\u064A\u0631 \u0633\u064A\u0646\u0638\u0631 \u0625\u0644\u064A\u0647.',
    notSpecified: '\u063A\u064A\u0631 \u0645\u062D\u062F\u062F',
    organicDesc: '\u0627\u062E\u062A\u0631 \u0647\u0630\u0627 \u0641\u0642\u0637 \u0625\u0646 \u0643\u0627\u0646 \u0635\u062D\u064A\u062D\u0627\u064B. \u0627\u0644\u0645\u0634\u062A\u0631\u0648\u0646 \u064A\u0633\u0623\u0644\u0648\u0646.',
    organicKey: '\u0628\u062F\u0648\u0646 \u0643\u064A\u0645\u0627\u0648\u064A\u0627\u062A',
    organicLabel: '\u0628\u062F\u0648\u0646 \u0645\u0648\u0627\u062F \u0643\u064A\u0645\u064A\u0627\u0626\u064A\u0629',
    photoHeader: '\u0623\u0636\u0641 \u0635\u0648\u0631\u0627\u064B',
    photoSecure: '\u0635\u0648\u0631\u0643 \u062A\u0628\u0642\u0649 \u0641\u064A \u0628\u0627\u0645\u0628\u064A\u0647. \u0644\u0627 \u0646\u0628\u064A\u0639\u0647\u0627 \u0623\u0628\u062F\u0627\u064B.',
    photoSub: '\u0635\u0648\u0631\u0629 \u0648\u0627\u0636\u062D\u0629 \u062A\u0628\u064A\u0639 \u0623\u0633\u0631\u0639 \u0645\u0646 \u0633\u0639\u0631 \u062C\u064A\u062F.',
    photosKey: '\u0635\u0648\u0631',
    photosTip: '\u0643\u064A\u0641 \u062A\u0635\u0648\u0651\u0631 \u062C\u064A\u062F\u0627\u064B',
    photosTipBody: '\u0636\u0648\u0621 \u0627\u0644\u0646\u0647\u0627\u0631\u060C \u062E\u0644\u0641\u064A\u0629 \u0628\u0633\u064A\u0637\u0629\u060C \u0628\u062F\u0648\u0646 \u0641\u0644\u0627\u0634. \u0623\u0638\u0647\u0631 \u0627\u0644\u062D\u062C\u0645 \u0627\u0644\u062D\u0642\u064A\u0642\u064A \u0628\u062C\u0627\u0646\u0628 \u064A\u062F\u0643.',
    photosTipSub: '\u0647\u0630\u0627 \u0623\u0647\u0645 \u0645\u0646 \u0623\u064A \u0634\u064A\u0621 \u0622\u062E\u0631 \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062D\u0629.',
    pickupOnly: '\u0627\u0644\u0645\u0634\u062A\u0631\u064A \u064A\u0623\u062A\u064A',
    posting: '\u062C\u0627\u0631\u064D \u0627\u0644\u0646\u0634\u0631...',
    priceKey: '\u0627\u0644\u0633\u0639\u0631',
    priceLabel: '\u0627\u0644\u0633\u0639\u0631 \u0644\u0644\u0648\u062D\u062F\u0629',
    produceKey: '\u0627\u0644\u0645\u062D\u0635\u0648\u0644',
    produceListed: '\u0645\u062D\u0635\u0648\u0644\u0643 \u0645\u0646\u0634\u0648\u0631 \u0627\u0644\u0622\u0646',
    produceListedSub: '\u0627\u0644\u0645\u0634\u062A\u0631\u0648\u0646 \u0641\u064A \u0645\u062F\u064A\u0646\u062A\u0643 \u064A\u0631\u0648\u0646\u0647 \u0627\u0644\u0622\u0646.',
    produceListedSub2: '\u0623\u062C\u0628 \u0628\u0633\u0631\u0639\u0629 \u0639\u0646\u062F \u0627\u0644\u0633\u0624\u0627\u0644. \u0623\u0648\u0644 \u0645\u0646 \u064A\u062C\u064A\u0628 \u064A\u0628\u064A\u0639 \u0639\u0627\u062F\u0629\u064B.',
    produceName: '\u0645\u0627\u0630\u0627 \u062A\u0628\u064A\u0639',
    produceNamePlaceholder: '\u0645\u062B\u0627\u0644: \u0637\u0645\u0627\u0637\u0645\u060C \u0645\u0648\u0632\u060C \u0628\u064A\u0636',
    saveDraft: '\u0627\u062D\u0641\u0638 \u0644\u0648\u0642\u062A \u0644\u0627\u062D\u0642',
    step1Label: '\u0639\u0646 \u0645\u062D\u0635\u0648\u0644\u0643',
    step2Label: '\u0627\u0644\u0635\u0648\u0631',
    step3Label: '\u0627\u0644\u0645\u0643\u0627\u0646 \u0648\u0627\u0644\u062A\u0648\u0635\u064A\u0644',
    stockKey: '\u0627\u0644\u0643\u0645\u064A\u0629',
    stockQty: '\u0627\u0644\u0643\u0645\u064A\u0629 \u0627\u0644\u0645\u062A\u0648\u0641\u0631\u0629',
    tapUpload: '\u0627\u0636\u063A\u0637 \u0644\u0625\u0636\u0627\u0641\u0629 \u0635\u0648\u0631\u0629',
    unit: '\u064A\u064F\u0628\u0627\u0639 \u0628\u0640',
    viewFarmFresh: '\u0634\u0627\u0647\u062F Farm Fresh',
    worldwideVis: '\u0623\u064A \u0645\u0643\u0627\u0646',
    yesOrganic: '\u0646\u0639\u0645',
    yourLocation: '\u0623\u064A\u0646 \u064A\u0648\u062C\u062F',
  },
  ff: {
    addPhotos: '\u0181eydu nate',
    category: 'Ngal',
    charCount: 'alkule',
    delivAvail: 'A roonday',
    deliveryKey: 'Roondugol',
    deliveryToggleDesc: 'Uddu \u0257um so soodoowo foti garde e maa.',
    deliveryToggleLabel: 'A waawi roondude',
    descPlaceholder: 'No keso, no remaa, ndeen soppaa',
    descPreview: 'No soodoowo yi\u2019ata',
    description: 'Haalan soodoowo',
    draftSaved: 'Danndaama. Artu nde wela.',
    errorDescription: 'Winndu baaba se\u0257\u0257a',
    errorLocation: 'Hollu to remuru wo\u0257i',
    errorPrice: 'Wa\u2019u coggu',
    errorProduceName: 'Haal ko soodataa',
    goBack: 'Rutto',
    imageUploadSkipped: 'Nate wootere naatii. Hollirde maa danndaama tawo nde.',
    listAnother: 'Hollu ko\u0257\u0257um',
    listWorldwide: 'Hollu \u0257um caggal Kamaruun',
    listYourProducePage: 'Hollu remuruuji maa',
    listingSummary: 'Yi\u2019u \u0257um haa a hollita',
    locationKey: 'Nokku',
    locationPlaceholder: 'Leydi maa, refti saare maa',
    logInSignUp: 'Naatu walla sos konte',
    loginRequired: 'Naatu law',
    loginRequiredSub: 'A foti konte ngam soodde e Farm Fresh.',
    loginRequiredSub2: 'Nde na\u0257ata hojom gooto, e meere.',
    maxPhotos: 'Nate jeego\u0253 tan',
    minChars: '\u0181eydu baaba se\u0257\u0257a',
    nextStep: 'Yeeso',
    no: 'Alaa',
    noPhotosWarn: 'A waawi hollude tawo nate, kono yim\u0253e se\u0257\u0257a njiyata.',
    notSpecified: 'Hollaaka',
    organicDesc: 'Su\u0253o \u0257um tan so goonga. Soodoowo ana lamndoo.',
    organicKey: 'Alaa kimiya',
    organicLabel: 'Alaa kimiya',
    photoHeader: '\u0181eydu nate',
    photoSecure: 'Nate maa hettoo e Bambeh. Min soodataa \u0257e.',
    photoSub: 'Nate laa\u0253ndu soodata haa \u0253uri coggu moolanaa\u0257o.',
    photosKey: 'nate',
    photosTip: 'No na\u0257ata nate moolanaa\u0257o',
    photosTipBody: 'Nalaawma, \u0253aawo laa\u0253\u0257o, alaa flash. Hollu njuu\u0257eendi haa junngo maa.',
    photosTipSub: '\u0181um \u0253uri hay huunde e hello \u0257oo teeddude.',
    pickupOnly: 'Soodoowo ara jogo',
    posting: 'Ena neldee...',
    priceKey: 'Coggu',
    priceLabel: 'Coggu gootel',
    produceKey: 'Remuru',
    produceListed: 'Remuru maa hollii',
    produceListedSub: 'Soodooji saare maa ana njiya \u0257um jooni.',
    produceListedSub2: 'Jaabo law so go\u0257\u0257o lamndii. Arano jaaboowo soodata.',
    produceName: 'Ko soodataa',
    produceNamePlaceholder: 'misal: Tomaati, Banaana, Boofte',
    saveDraft: 'Danndu haa refti',
    step1Label: 'Baaba remuru maa',
    step2Label: 'Nate',
    step3Label: 'Nokku e roondugol',
    stockKey: '\u00D1iiwre',
    stockQty: 'No foti hebi\u0257aa',
    tapUpload: 'Me\u0253\u0253u ngam \u0253eydude nate',
    unit: 'Soodee e',
    viewFarmFresh: 'Yi\u2019u Farm Fresh',
    worldwideVis: 'Kala nokku',
    yesOrganic: 'Eey',
    yourLocation: 'Hol to wo\u0257i',
  },
};

const FF_ALIAS: Record<string, string> = { pidgin: 'pcm', pid: 'pcm', ful: 'ff' };

/** This page's own strings first; the shared dictionary only as a fallback. */
function tt(key: string, lang: unknown): string {
  const code = FF_ALIAS[String(lang)] || String(lang);
  const table = FF_STR[code] || FF_STR.en;
  const hit = table[key] ?? FF_STR.en[key];
  if (hit) return hit;
  const shared = t(key, lang as never);
  return typeof shared === 'string' && shared !== key ? shared : key;
}

// FIX358 - the same guard the other six post forms already use.
import { scanForContacts, scanFields, contactWarning } from "@/lib/contactGuard";

const CATEGORIES = ["Vegetables", "Fruits", "Tubers", "Grains", "Legumes", "Herbs", "Dairy", "Other"];
const UNITS      = ["kg", "g", "bunch", "cob", "litre", "bag", "crate", "piece"];

const MAX_IMG   = 5 * 1024 * 1024;
const IMG_TYPES = ["image/jpeg", "image/png", "image/webp"];

// ✅ FIX: validateImg is a plain function — no hooks inside it
function validateImg(f: File): string | null {
  if (!IMG_TYPES.includes(f.type)) return "Only JPG, PNG or WebP images allowed.";
  if (f.size > MAX_IMG) return `File too large (max 5 MB). Got ${(f.size / 1024 / 1024).toFixed(1)} MB.`;
  return null;
}

const fmtXAF = (n: string) =>
  n && !isNaN(Number(n)) && Number(n) > 0
    ? new Intl.NumberFormat("fr-CM").format(Number(n)) + " FCFA"
    : "";

// ── Sub-components ────────────────────────────────────────────────────────────

function StepBar({ step, labels }: { step: number; labels: string[] }) {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center gap-0.5 mb-2">
        {labels.map((_, i) => (
          <React.Fragment key={i}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-200
              ${step > i + 1 ? "bg-green-500 text-white"
                : step === i + 1 ? "bg-green-600 text-white ring-4 ring-green-100 dark:ring-green-900"
                : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}>
              {step > i + 1
                ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><polyline points="20 6 9 17 4 12" /></svg>
                : i + 1}
            </div>
            {i < labels.length - 1 && (
              <div className={`flex-1 h-1 rounded-full transition-colors ${step > i + 1 ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"}`} />
            )}
          </React.Fragment>
        ))}
      </div>
      <p className="text-xs font-semibold text-green-600 dark:text-green-400">
        Step {step} of {labels.length}: {labels[step - 1]}
      </p>
    </div>
  );
}

function NavRow({ onDraft, onBack, onNext, nextLabel, saveDraftLabel, disabled = false }: {
  onDraft: () => void; onBack?: () => void;
  onNext: () => void; nextLabel: string; saveDraftLabel: string; disabled?: boolean;
}) {
  return (
    <div className="flex gap-2 pt-4 pb-6">
      <button type="button" onClick={onDraft}
        className="flex-shrink-0 px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 active:scale-95">
        {saveDraftLabel}
      </button>
      {onBack && (
        <button type="button" onClick={onBack}
          className="flex-shrink-0 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 active:scale-95">
          \u2190
        </button>
      )}
      <button type="button" onClick={onNext} disabled={disabled}
        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98]
          ${disabled
            ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-green-500 to-green-700 text-white shadow-lg shadow-green-500/30"}`}>
        {nextLabel}
      </button>
    </div>
  );
}

function Err({ msg }: { msg?: string }) {
  return msg ? <p className="text-xs text-red-500 mt-1 font-medium">\u26A0 {msg}</p> : null;
}

function Lbl({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
      {children}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

function BigCheck({ checked, onChange, label, desc }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string;
}) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all
        ${checked ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"}`}>
      <div className={`flex-shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all
        ${checked ? "border-green-500 bg-green-500" : "border-gray-300 dark:border-gray-500"}`}>
        {checked && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><polyline points="20 6 9 17 4 12" /></svg>}
      </div>
      <div>
        <p className="font-semibold text-sm text-gray-900 dark:text-white">{label}</p>
        {desc && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>}
      </div>
    </button>
  );
}

interface Draft {
  title: string; category: string; unit: string;
  price: string; quantity: string; is_organic: boolean;
  location: string; description: string; available_for_delivery: boolean;
  payoutPhone: string;
}

/* FIX322 - the payout number. Written as \u escapes on purpose, so no
   future edit can eat the Arabic or the Fulfulde. */
const PAYOUT_COPY: Record<string, Record<string, string>> = {
  en: { label: "Phone number for your payment", ph: "6XX XXX XXX", hint: "This is where your money is sent when somebody buys from you.", required: "Add the phone number where you want to be paid. Without it we cannot send you your money.", saveFailed: "We could not save your payment number. Please try again." },
  fr: { label: "Num\u00e9ro de t\u00e9l\u00e9phone pour votre paiement", ph: "6XX XXX XXX", hint: "C'est l\u00e0 que votre argent sera envoy\u00e9 quand quelqu'un ach\u00e8te chez vous.", required: "Ajoutez le num\u00e9ro o\u00f9 vous voulez \u00eatre pay\u00e9. Sans lui, nous ne pouvons pas vous envoyer votre argent.", saveFailed: "Nous n'avons pas pu enregistrer votre num\u00e9ro. R\u00e9essayez." },
  pidgin: { label: "Phone number wey we go pay you", ph: "6XX XXX XXX", hint: "Na here your money go enter when person buy from you.", required: "Put the phone number wey you want make we pay you. Without am, we no fit send your money.", saveFailed: "We no fit save your number. Abeg try again." },
  ar: { label: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641 \u0644\u0627\u0633\u062a\u0644\u0627\u0645 \u0623\u0645\u0648\u0627\u0644\u0643", ph: "6XX XXX XXX", hint: "\u0625\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0631\u0642\u0645 \u062a\u064f\u0631\u0633\u0644 \u0623\u0645\u0648\u0627\u0644\u0643 \u0639\u0646\u062f \u0627\u0644\u0634\u0631\u0627\u0621 \u0645\u0646\u0643.", required: "\u0623\u0636\u0641 \u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641 \u0627\u0644\u0630\u064a \u062a\u0631\u064a\u062f \u0623\u0646 \u062a\u064f\u062f\u0641\u0639 \u0639\u0644\u064a\u0647. \u0628\u062f\u0648\u0646\u0647 \u0644\u0627 \u064a\u0645\u0643\u0646\u0646\u0627 \u0625\u0631\u0633\u0627\u0644 \u0623\u0645\u0648\u0627\u0644\u0643.", saveFailed: "\u062a\u0639\u0630\u0631 \u062d\u0641\u0638 \u0631\u0642\u0645\u0643. \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u0627\u064b." },
  ff: { label: "Limce noone ngam yo\u0253eede", ph: "6XX XXX XXX", hint: "Ko \u0257oo kaalis maa neldetee si go\u0257\u0257o soodii to ma.", required: "\u0181eydu limce nokku \u0257o nji\u0257\u0257aa yo\u0253eede. Si alaa, min mbaawaa neldude ma kaalis maa.", saveFailed: "Min mbaawaa danndude limce maa. Artu jeer." },
};

const BLANK: Draft = {
  title: "", category: "Vegetables", unit: "kg",
  price: "", quantity: "", is_organic: false,
  location: "", description: "", available_for_delivery: false,
  payoutPhone: "",
};

const DRAFT_KEY = "bambeh_draft_farm_produce";

/**
 * Upload one image to Supabase Storage.
 * Returns the public URL on success, or null if the upload fails
 * (e.g. RLS policy not yet configured) — caller handles null gracefully.
 */
async function tryUploadImage(dataUrl: string, fileName: string): Promise<string | null> {
  try {
    const res  = await fetch(dataUrl);
    const blob = await prepImage(await res.blob());   // FIX296
    const ext  = blob.type === "image/png" ? "png" : blob.type === "image/webp" ? "webp" : "jpg";
    const path = `farm-fresh/${Date.now()}-${fileName.replace(/\s/g, "-")}.${ext}`;

    const { error } = await supabase.storage
      .from("farm-images")
      .upload(path, blob, { contentType: blob.type, upsert: false });

    if (error) {
      console.warn("Image upload error (listing will proceed without photo):", error.message);
      return null;
    }

    const { data: urlData } = supabase.storage.from("farm-images").getPublicUrl(path);
    return urlData.publicUrl;
  } catch (e) {
    console.warn("Image upload exception:", e);
    return null;
  }
}

export default function FarmFreshSellerPage() {
  const navigate = useNavigate();
  const fileRef  = useRef<HTMLInputElement>(null);
  const lang     = useLang();
  const pc       = PAYOUT_COPY[lang as string] ?? PAYOUT_COPY.en;

  const [step,           setStep]           = useState(1);
  const [d,              setD]              = useState<Draft>(BLANK);
  const [errs,           setErrs]           = useState<Record<string, string>>({});
  const [imagePreviews,  setImagePreviews]  = useState<string[]>([]);
  const [imageFiles,     setImageFiles]     = useState<File[]>([]);
  const [imgErrors,      setImgErrors]      = useState<string[]>([]);
  const [submitting,     setSubmitting]     = useState(false);
  const [posted,         setPosted]         = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [loginRequired,  setLoginRequired]  = useState(false);
  const [uploadWarning,  setUploadWarning]  = useState("");

  const stepLabels = [
    tt("step1Label", lang) as string,
    tt("step2Label", lang) as string,
    tt("step3Label", lang) as string,
  ];

  useEffect(() => {
    try {
      const s = localStorage.getItem(DRAFT_KEY);
      if (s) setD(prev => ({ ...prev, ...JSON.parse(s) }));
    } catch {}
  }, []);

  function upd(patch: Partial<Draft>) { setD(prev => ({ ...prev, ...patch })); }

  function saveDraft() {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
    alert(tt("draftSaved", lang));
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const errors: string[] = [];
    const previews: string[] = [];
    const validFiles: File[] = [];
    const remaining = 6 - imagePreviews.length;

    for (const f of Array.from(files).slice(0, remaining)) {
      const err = validateImg(f); // ✅ plain function call — no hook
      if (err) { errors.push(err); continue; }
      validFiles.push(f);
      await new Promise<void>(res => {
        const r = new FileReader();
        r.onload = e => { previews.push(e.target?.result as string); res(); };
        r.readAsDataURL(f);
      });
    }

    setImgErrors(errors);
    setImagePreviews(prev => [...prev, ...previews].slice(0, 6));
    setImageFiles(prev => [...prev, ...validFiles].slice(0, 6));
  }

  function validate(s: number): Record<string, string> {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!d.title.trim()) e.title = tt("errorProduceName", lang) as string || "Produce name is required";
      if (!d.price || isNaN(Number(d.price)) || Number(d.price) <= 0) e.price = tt("errorPrice", lang) as string || "Valid price is required";
      // FIX358 - flag the offending field itself, not a generic banner.
      const titleScan = scanForContacts(d.title);
      if (!titleScan.clean) e.title = contactWarning(titleScan, lang);
    }
    if (s === 2) {
      if (!d.location.trim()) e.location = tt("errorLocation", lang) as string || "Location is required";
      // FIX322 - a farmer with no payout number cannot be paid.
      if (d.payoutPhone.replace(/\D/g, "").length < 9) e.payoutPhone = pc.required;
      if (!d.description.trim() || d.description.trim().length < 20)
        e.description = tt("errorDescription", lang) as string || "Description must be at least 20 characters";
      // FIX358
      const descScan = scanForContacts(d.description);
      if (!descScan.clean) e.description = contactWarning(descScan, lang);
    }
    return e;
  }

  function next() {
    const e = validate(step); setErrs(e);
    if (Object.keys(e).length > 0) return;
    setStep(s => s + 1); window.scrollTo(0, 0);
  }
  function back() { setErrs({}); setStep(s => s - 1); window.scrollTo(0, 0); }

  async function handleSubmit() {
    setSubmitting(true);
    setErrs({});
    setUploadWarning("");

    // FIX358 - the last gate. validate() only runs from next(), so a field
    // edited AFTER passing step 2 would otherwise reach the database
    // unchecked. This runs before any upload or insert.
    const contacts = scanFields(d.title, d.description);
    if (!contacts.clean) {
      setErrs({ description: contactWarning(contacts, lang) });
      setSubmitting(false);
      setStep(2);
      window.scrollTo(0, 0);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        setLoginRequired(true);
        setSubmitting(false);
        return;
      }

      // FIX322 - the FarmFresh trigger fills farm_products.seller_phone from
      // the PROFILE, not from this form. Writing the number to the profile is
      // what actually makes this farmer payable, so it happens FIRST - before
      // any photo upload, and before the listing exists.
      const payoutPhone = d.payoutPhone.trim();
      const { error: profErr } = await supabase
        .from("profiles")
        .update({ payout_phone: payoutPhone })
        .eq("id", session.user.id);
      if (profErr) {
        setErrs({ payoutPhone: pc.saveFailed });
        setSubmitting(false);
        return;
      }

      // ── 1. Try uploading images (graceful — never blocks the listing) ──────
      const uploadedUrls: string[] = [];
      for (let i = 0; i < imageFiles.length; i++) {
        setUploadProgress(`Uploading photo ${i + 1} of ${imageFiles.length}\u2026`);
        const url = await tryUploadImage(imagePreviews[i], imageFiles[i].name);
        if (url) uploadedUrls.push(url);
      }

      const photosFailed = imageFiles.length > 0 && uploadedUrls.length === 0;

      setUploadProgress("Saving listing\u2026");

      // ── 2. Insert with BOTH farmer_id AND seller_id ───────────────────────
      const { error: dbErr } = await supabase.from("farm_products").insert({
        farmer_id:              session.user.id,
        seller_id:              session.user.id,
        title:                  d.title.trim(),
        description:            d.description.trim(),
        price_per_unit_xaf:     Number(d.price),
        unit:                   d.unit,
        category:               d.category,
        location:               d.location.trim(),
        seller_phone:           payoutPhone,
        stock_quantity:         d.quantity ? Number(d.quantity) : null,
        is_organic:             d.is_organic,
        available_for_delivery: d.available_for_delivery,
        is_available:           true,
        images:                 uploadedUrls.length > 0 ? uploadedUrls : null,
        image_url:              uploadedUrls[0] ?? null,
      });

      if (dbErr) throw dbErr;

      localStorage.removeItem(DRAFT_KEY);

      if (photosFailed) {
        setUploadWarning(tt("imageUploadSkipped", lang) as string);
      }

      setPosted(true);
    } catch (e: any) {
      setErrs({ submit: e.message || "Failed to post. Please try again." });
    } finally {
      setSubmitting(false);
      setUploadProgress("");
    }
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (posted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4 text-center">
        <p className="text-7xl mb-4">\uD83C\uDF3F</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{tt("produceListed", lang)}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{tt("produceListedSub", lang)}</p>
        <p className="text-xs text-gray-400 mb-4">{tt("produceListedSub2", lang)}</p>
        {uploadWarning && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 max-w-xs">
            <p className="text-xs text-amber-700">{uploadWarning}</p>
          </div>
        )}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button onClick={() => navigate("/farm-fresh")} className="py-3 bg-green-600 text-white rounded-xl font-bold">
            {tt("viewFarmFresh", lang)}
          </button>
          <button
            onClick={() => { setPosted(false); setStep(1); setD(BLANK); setImagePreviews([]); setImageFiles([]); setUploadWarning(""); }}
            className="py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300">
            {tt("listAnother", lang)}
          </button>
        </div>
      </div>
    );
  }

  // ── Login required screen ─────────────────────────────────────────────────
  if (loginRequired) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <AlertCircle className="w-14 h-14 text-orange-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">{tt("loginRequired", lang)}</h2>
        <p className="text-sm text-gray-500 mb-2">{tt("loginRequiredSub", lang)}</p>
        <p className="text-xs text-gray-400 mb-8">{tt("loginRequiredSub2", lang)}</p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button onClick={() => navigate("/login")} className="py-3 bg-green-600 text-white rounded-xl font-bold">
            {tt("logInSignUp", lang)}
          </button>
          <button onClick={() => setLoginRequired(false)} className="py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-600">
            {tt("goBack", lang)}
          </button>
        </div>
      </div>
    );
  }

  // ── Wizard ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="sticky top-0 z-10 bg-green-600 text-white px-4 py-4 flex items-center gap-3 shadow">
        <button onClick={() => step === 1 ? navigate(-1) : back()}
          className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
          \u2190
        </button>
        <h1 className="font-bold text-lg">{tt("listYourProducePage", lang)}</h1>
      </div>

      <StepBar step={step} labels={stepLabels} />

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-gray-900 dark:text-white">{tt("step1Label", lang)}</h2>

            <div>
              <Lbl required>{tt("produceName", lang)}</Lbl>
              <input value={d.title} onChange={e => upd({ title: e.target.value })}
                placeholder={tt("produceNamePlaceholder", lang) as string}
                className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-colors
                  ${errs.title ? "border-red-400 bg-red-50" : "border-gray-200 dark:border-gray-600 focus:border-green-500"}`} />
              <Err msg={errs.title} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Lbl>{tt("category", lang)}</Lbl>
                <select value={d.category} onChange={e => upd({ category: e.target.value })}
                  className="w-full border-2 border-gray-200 dark:border-gray-600 focus:border-green-500 rounded-xl px-4 py-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none appearance-none">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Lbl>{tt("unit", lang)}</Lbl>
                <select value={d.unit} onChange={e => upd({ unit: e.target.value })}
                  className="w-full border-2 border-gray-200 dark:border-gray-600 focus:border-green-500 rounded-xl px-4 py-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none appearance-none">
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Lbl required>{tt("priceLabel", lang)}</Lbl>
                <input type="number" min="0" value={d.price} onChange={e => upd({ price: e.target.value })}
                  placeholder="e.g. 500"
                  className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-colors
                    ${errs.price ? "border-red-400 bg-red-50" : "border-gray-200 dark:border-gray-600 focus:border-green-500"}`} />
                {fmtXAF(d.price) && <p className="text-xs text-green-600 font-semibold mt-1">= {fmtXAF(d.price)}</p>}
                <Err msg={errs.price} />
              </div>
              <div>
                <Lbl>{tt("stockQty", lang)}</Lbl>
                <input type="number" min="0" value={d.quantity} onChange={e => upd({ quantity: e.target.value })}
                  placeholder="e.g. 50"
                  className="w-full border-2 border-gray-200 dark:border-gray-600 focus:border-green-500 rounded-xl px-4 py-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none" />
              </div>
            </div>

            <BigCheck checked={d.is_organic} onChange={v => upd({ is_organic: v })}
              label={tt("organicLabel", lang) as string} desc={tt("organicDesc", lang) as string} />

            <NavRow onDraft={saveDraft} onNext={next}
              nextLabel={tt("nextStep", lang) as string} saveDraftLabel={tt("saveDraft", lang) as string} />
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-gray-900 dark:text-white">{tt("step2Label", lang)}</h2>

            <div>
              <Lbl required>{tt("yourLocation", lang)}</Lbl>
              <input value={d.location} onChange={e => upd({ location: e.target.value })}
                placeholder={tt("locationPlaceholder", lang) as string}
                className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-colors
                  ${errs.location ? "border-red-400 bg-red-50" : "border-gray-200 dark:border-gray-600 focus:border-green-500"}`} />
              <Err msg={errs.location} />
            </div>

            <div>
              <Lbl required>{pc.label}</Lbl>
              <input value={d.payoutPhone} onChange={e => upd({ payoutPhone: e.target.value })}
                inputMode="tel" placeholder={pc.ph}
                className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none transition-colors
                  ${errs.payoutPhone ? "border-red-400 bg-red-50" : "border-gray-200 dark:border-gray-600 focus:border-green-500"}`} />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{pc.hint}</p>
              <Err msg={errs.payoutPhone} />
            </div>

            <BigCheck checked={d.available_for_delivery} onChange={v => upd({ available_for_delivery: v })}
              label={tt("deliveryToggleLabel", lang) as string} desc={tt("deliveryToggleDesc", lang) as string} />

            <div>
              <Lbl required>{tt("description", lang)}</Lbl>
              <textarea rows={5} value={d.description} onChange={e => upd({ description: e.target.value })}
                placeholder={tt("descPlaceholder", lang) as string}
                className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none resize-none transition-colors
                  ${errs.description ? "border-red-400 bg-red-50" : "border-gray-200 dark:border-gray-600 focus:border-green-500"}`} />
              <div className="flex justify-between text-xs mt-1 text-gray-400">
                <span>{d.description.length < 20 ? tt("minChars", lang) : "\u2713 Good"}</span>
                <span>{t("charCount")}</span>
              </div>
              <Err msg={errs.description} />
            </div>

            <NavRow onDraft={saveDraft} onBack={back} onNext={next}
              nextLabel={tt("addPhotos", lang) as string} saveDraftLabel={tt("saveDraft", lang) as string} />
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h2 className="font-bold text-base text-gray-900 dark:text-white">{tt("photoHeader", lang)}</h2>
              <p className="text-xs text-gray-400">{tt("photoSub", lang)}</p>
              <p className="text-xs text-green-700 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2">{tt("photoSecure", lang)}</p>

              {imgErrors.map((e, i) => <p key={i} className="text-xs text-red-500 font-medium">\u26A0 {e}</p>)}

              <div onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors
                  ${imagePreviews.length >= 6 ? "opacity-40 pointer-events-none" : "border-gray-200 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"}`}>
                <p className="text-3xl mb-2">\uD83D\uDCF8</p>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                  {imagePreviews.length >= 6 ? tt("maxPhotos", lang) : tt("tapUpload", lang)}
                </p>
                <p className="text-xs text-gray-400 mt-1">{imagePreviews.length}/6 {tt("photosKey", lang)}</p>
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
                multiple className="hidden" onChange={e => handleFiles(e.target.files)} />

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-100">
                      <img src={src} alt={`Photo ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
                      <button type="button"
                        onClick={() => { setImagePreviews(p => p.filter((_, idx) => idx !== i)); setImageFiles(p => p.filter((_, idx) => idx !== i)); }}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow">\u00D7</button>
                      {i === 0 && <span className="absolute bottom-1 left-1 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">Main</span>}
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1.5">
                <p className="text-xs text-amber-800 font-semibold">{tt("photosTip", lang)}</p>
                <p className="text-xs text-amber-700">{tt("photosTipBody", lang)}</p>
                <p className="text-xs text-amber-600">{tt("photosTipSub", lang)}</p>
              </div>
            </div>

            {/* Review summary */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-base text-gray-900 dark:text-white mb-4">{tt("listingSummary", lang)}</h3>
              {([
                [tt("produceKey", lang), d.title],
                [tt("category", lang), d.category],
                [tt("priceKey", lang), fmtXAF(d.price) ? `${fmtXAF(d.price)} / ${d.unit}` : "—"],
                [tt("stockKey", lang), d.quantity ? `${d.quantity} ${d.unit}` : tt("notSpecified", lang)],
                [tt("organicKey", lang), d.is_organic ? tt("yesOrganic", lang) : tt("no", lang)],
                [tt("deliveryKey", lang), d.available_for_delivery ? tt("delivAvail", lang) : tt("pickupOnly", lang)],
                [tt("locationKey", lang), d.location || "—"],
                [tt("photosKey", lang), imagePreviews.length === 0 ? tt("noPhotosWarn", lang) : `${imagePreviews.length} photo${imagePreviews.length !== 1 ? "s" : ""}`],
              ] as [string, string][]).map(([k, v]) => (
                <div key={String(k)} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0 text-sm">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-semibold text-gray-900 dark:text-white text-right max-w-[60%]">{v}</span>
                </div>
              ))}
              {d.description && (
                <div className="pt-3">
                  <p className="text-xs text-gray-500 mb-1">{tt("descPreview", lang)}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">{d.description}</p>
                </div>
              )}
            </div>

            {uploadProgress && (
              <div className="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <span className="animate-spin inline-block">\u27F3</span> {uploadProgress}
              </div>
            )}
            {errs.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">\u26A0 {errs.submit}</div>
            )}

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <p className="text-xs text-blue-700">{tt("worldwideVis", lang)}</p>
            </div>

            <NavRow onDraft={saveDraft} onBack={back} onNext={handleSubmit}
              nextLabel={submitting ? tt("posting", lang) as string : tt("listWorldwide", lang) as string}
              saveDraftLabel={tt("saveDraft", lang) as string}
              disabled={submitting} />
          </>
        )}
      </div>
    </div>
  );
}





// BAMBEH_END_TOKEN__FARMFRESHSELLER_FIX358__COMPLETE
// BAMBEH_END_TOKEN__FARMFRESHSELLER_FIX603__COMPLETE
