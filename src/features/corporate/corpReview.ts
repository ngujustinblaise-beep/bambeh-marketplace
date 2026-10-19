// BAMBEH_DEPLOY_TOKEN__CORP_REVIEW_FIX833_CLEAN
/**
 * src/features/corporate/corpReview.ts - FIX833 (new)
 *
 * BAMBEH'S CHECK OF A BUSINESS, FROM THE BUSINESS'S SIDE. Big, 18 Oct 2026: "let registered corporate bodies be sent to
 * admin section for treatment and prompt upload. register your enterprise and my corporate dashboard and how it
 * functions and is linked to the admin dashboard".
 *
 *   register      -> bambeh_corp_register (FIX832): checked, saved "waiting for Bambeh", staff told
 *   documents     -> the PRIVATE folder "corporate-docs" (<user>/<business>/...), then bambeh_corp_doc_add
 *                    (photos are made smaller first, but stay readable; PDFs go as they are)
 *   the dashboard -> bambeh_corp_my: waiting / documents asked / approved / not approved / suspended, Bambeh's note,
 *                    the documents, what happened and when
 *   staff         -> Command Center > Businesses (FIX836) decides; the business is told in its language
 * Product pictures for the dashboard go to the shop pictures folder (the listings folder if that one refuses).
 * If FIX832 has not run yet, registering still works the old way (and says nothing more).
 * Five languages; every word the business reads is here or in ./lib (CORP_STR).
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { supabase } from '@/lib/supabase';
import { prepImage } from '@/utils/bambehImagePrep';

export type DocKind = 'rccm' | 'niu' | 'licence' | 'other';
export const DOC_KINDS: DocKind[] = ['rccm', 'niu', 'licence', 'other'];
export type CorpState = 'waiting' | 'documents' | 'approved' | 'refused' | 'suspended';

export interface CorpDoc {
  id: string; kind: DocKind; path: string; name: string | null; mime: string | null; size: number | null; at: string; by?: string;
}
export interface CorpEvent { at: string; action: string; bambeh?: boolean; who?: string | null; note: string | null; docs: string[] }
export interface MyBusiness {
  id: string; registered_name: string; trading_name: string | null; slug: string | null; status: string; verified: boolean;
  state: CorpState; docs_requested: DocKind[]; note: string | null; reviewed_at: string | null; submitted_at: string | null;
  created_at: string; docs: CorpDoc[]; history: CorpEvent[];
}
export type Fail = { ok: false; reason: string; detail?: string };
export type Res<T> = ({ ok: true } & T) | Fail;
export type Done = { ok: true } | Fail;

export interface RegisterForm {
  registered_name: string; trading_name: string; category: string; rep_name: string; rep_email: string; rep_phone: string;
  rccm_number: string; niu_number: string; city: string; address: string; about: string; audience: string; moq_text: string;
  min_order_value_xaf: string; price_mode: string;
}

/* ------------------------------------------------------------------ words (5 languages) */
export const REVIEW_STR = {
  en: {
    st_waiting: "Waiting for Bambeh's check", st_documents: 'Bambeh needs documents', st_approved: 'Verified Corporate',
    st_refused: 'Not approved', st_suspended: 'Suspended',
    ex_waiting: 'Bambeh checks your registration and documents within 3 to 14 business days. You are told in the app.',
    ex_documents: 'Upload what Bambeh asks for below. The check continues as soon as it arrives.',
    ex_approved: 'Your business shows in the Corporate directory and your products can appear in the Corporate adverts.',
    ex_refused: 'Correct your details or documents, then send your registration to Bambeh again.',
    ex_suspended: 'Your business is hidden from the public for now. Write to Bambeh to sort it out.',
    sentOn: 'Sent to Bambeh', decidedOn: 'Decided', bambehSays: 'Bambeh says',
    docsTitle: 'Your documents', docsNone: 'No document yet. Bambeh needs at least your RCCM certificate and your taxpayer card (NIU).',
    docsPrivate: 'Only you and Bambeh can open these files.',
    addDoc: 'Add a document', whichDoc: 'Which document?', chooseFile: 'Choose a photo or a PDF', takePhoto: 'Take a photo',
    uploading: 'Uploading...', uploaded: 'Document sent to Bambeh.', open: 'Open', remove: 'Remove', removed: 'Document removed.',
    confirmRemove: 'Remove this document?', askedTitle: 'Bambeh asks for', upload: 'Upload', sendAgain: 'Send it to Bambeh again',
    sentAgain: 'Sent again. Bambeh will check it.', fixDetails: 'Correct my details', writeBambeh: 'Write to Bambeh',
    history: 'What happened', showHistory: 'Show what happened', hideHistory: 'Hide', you: 'You', bambeh: 'Bambeh',
    doc_rccm: 'RCCM certificate (trade register)', doc_niu: 'Taxpayer card (NIU)', doc_licence: 'Licence or permit for your activity',
    doc_other: 'Another document',
    ev_submitted: 'Registration sent', ev_docs_sent: 'Document sent', ev_doc_removed: 'Document removed', ev_resubmitted: 'Sent again',
    ev_approve: 'Approved by Bambeh', ev_ask_docs: 'Bambeh asked for documents', ev_reject: 'Not approved by Bambeh',
    ev_suspend: 'Suspended by Bambeh', ev_reactivate: 'Active again', ev_note: 'Message from Bambeh',
    // register page
    docsStep: 'Your documents', docsStepNote: 'A clear photo or a PDF of each. They go to a private folder: only you and Bambeh can open them.',
    docsLater: 'No document at hand? You can add them later from your Corporate dashboard - Bambeh starts the check once they are in.',
    chosen: 'Chosen', change: 'Change', none: 'Not added', nextSteps: 'What happens next',
    next1: 'Bambeh checks your details and documents (3 to 14 business days).',
    next2: 'You are told in the app - approved, or what is missing.',
    next3: 'Once approved: the "Verified Corporate" badge, the Corporate directory and the Corporate adverts on Home.',
    sending: 'Sending your registration...', sendingDocs: 'Sending your documents...',
    doneTitle: 'Registration sent to Bambeh', doneDocs: 'documents sent', docFailed: 'did not upload - add it from your dashboard',
    already: 'You already have a business on Bambeh Corporate.', openDash: 'Open my Corporate dashboard',
    phoneNote: 'For Bambeh only - never shown to the public. Buyers reach you in the Bambeh chat.',
    // dashboard
    qa_bulk: 'Bulk upload', qa_analytics: 'Analytics', qa_settings: 'Store settings', qa_support: 'Priority support', qa_trash: 'Trash',
    storefront: 'My storefront', picture: 'Picture', uploadPicture: 'Upload a picture', pictureLink: 'or paste a picture link (https://...)',
    pictureDone: 'Picture added.', productsWait: 'Your products show to buyers once Bambeh has approved your business.',
    // reasons
    r_sign_in: 'Sign in again, then try once more.', r_not_ready: 'This part is being switched on. Try again in a few minutes.',
    r_bad_type: 'Choose a photo (JPG, PNG, WEBP) or a PDF.', r_too_big: 'The file is too big (10 MB at most).',
    r_no_folder: "Bambeh's documents folder is not ready yet. Try again later.",
    r_upload_failed: 'The file did not upload. Check your connection and try again.',
    r_not_yours: 'This business is not yours.', r_checked_already: 'Bambeh already checked this document - it cannot be removed now.',
    r_too_many: 'Too many documents (20 at most).', r_not_refused: 'Only a registration Bambeh did not approve can be sent again.',
    r_already: 'You already have a business on Bambeh Corporate.', r_bad_name: 'The company name needs 2 to 120 characters.',
    r_bad_category: 'Choose a category.', r_bad_rep: 'Write the name of the person who represents the company.',
    r_bad_email: 'That email address does not look right.', r_bad_phone: 'Write a phone number with 8 to 15 digits.',
    r_too_long: 'One of the fields is too long.',
    r_contact_in_text: 'No phone number, WhatsApp or email in the name, address or description - buyers reach you in the Bambeh chat.',
    r_db: 'Bambeh could not save this', r_network: 'No connection. Check your internet and try again.',
    r_other: 'Something went wrong. Try again.',
  },
  fr: {
    st_waiting: 'En attente de la v\u00e9rification Bambeh', st_documents: 'Bambeh a besoin de documents', st_approved: 'Corporate v\u00e9rifi\u00e9',
    st_refused: 'Non approuv\u00e9e', st_suspended: 'Suspendue',
    ex_waiting: 'Bambeh v\u00e9rifie votre inscription et vos documents sous 3 \u00e0 14 jours ouvrables. Vous \u00eates pr\u00e9venu dans l\u2019application.',
    ex_documents: 'T\u00e9l\u00e9versez ci-dessous ce que Bambeh demande. La v\u00e9rification reprend d\u00e8s r\u00e9ception.',
    ex_approved: 'Votre entreprise appara\u00eet dans l\u2019annuaire Corporate et vos produits peuvent passer dans les annonces des entreprises.',
    ex_refused: 'Corrigez vos informations ou vos documents, puis renvoyez votre inscription \u00e0 Bambeh.',
    ex_suspended: 'Votre entreprise est cach\u00e9e au public pour le moment. \u00c9crivez \u00e0 Bambeh pour r\u00e9gler la situation.',
    sentOn: 'Envoy\u00e9e \u00e0 Bambeh', decidedOn: 'D\u00e9cision', bambehSays: 'Bambeh pr\u00e9cise',
    docsTitle: 'Vos documents', docsNone: 'Aucun document pour l\u2019instant. Bambeh a besoin au minimum de votre certificat RCCM et de votre carte de contribuable (NIU).',
    docsPrivate: 'Seuls vous et Bambeh pouvez ouvrir ces fichiers.',
    addDoc: 'Ajouter un document', whichDoc: 'Quel document ?', chooseFile: 'Choisir une photo ou un PDF', takePhoto: 'Prendre une photo',
    uploading: 'Envoi...', uploaded: 'Document envoy\u00e9 \u00e0 Bambeh.', open: 'Ouvrir', remove: 'Retirer', removed: 'Document retir\u00e9.',
    confirmRemove: 'Retirer ce document ?', askedTitle: 'Bambeh demande', upload: 'Envoyer', sendAgain: 'Renvoyer \u00e0 Bambeh',
    sentAgain: 'Renvoy\u00e9e. Bambeh va la v\u00e9rifier.', fixDetails: 'Corriger mes informations', writeBambeh: '\u00c9crire \u00e0 Bambeh',
    history: 'Historique', showHistory: 'Voir l\u2019historique', hideHistory: 'Masquer', you: 'Vous', bambeh: 'Bambeh',
    doc_rccm: 'Certificat RCCM (registre du commerce)', doc_niu: 'Carte de contribuable (NIU)', doc_licence: 'Licence ou autorisation d\u2019exercer',
    doc_other: 'Autre document',
    ev_submitted: 'Inscription envoy\u00e9e', ev_docs_sent: 'Document envoy\u00e9', ev_doc_removed: 'Document retir\u00e9', ev_resubmitted: 'Renvoy\u00e9e',
    ev_approve: 'Approuv\u00e9e par Bambeh', ev_ask_docs: 'Bambeh a demand\u00e9 des documents', ev_reject: 'Non approuv\u00e9e par Bambeh',
    ev_suspend: 'Suspendue par Bambeh', ev_reactivate: 'De nouveau active', ev_note: 'Message de Bambeh',
    docsStep: 'Vos documents', docsStepNote: 'Une photo nette ou un PDF de chacun. Ils vont dans un dossier priv\u00e9 : seuls vous et Bambeh pouvez les ouvrir.',
    docsLater: 'Pas de document sous la main ? Ajoutez-les plus tard depuis votre tableau de bord Corporate - Bambeh commence la v\u00e9rification d\u00e8s qu\u2019ils sont l\u00e0.',
    chosen: 'Choisi', change: 'Changer', none: 'Non ajout\u00e9', nextSteps: 'La suite',
    next1: 'Bambeh v\u00e9rifie vos informations et vos documents (3 \u00e0 14 jours ouvrables).',
    next2: 'Vous \u00eates pr\u00e9venu dans l\u2019application - approuv\u00e9e, ou ce qui manque.',
    next3: 'Une fois approuv\u00e9e : le badge \u00ab Corporate v\u00e9rifi\u00e9 \u00bb, l\u2019annuaire Corporate et les annonces des entreprises sur l\u2019accueil.',
    sending: 'Envoi de votre inscription...', sendingDocs: 'Envoi de vos documents...',
    doneTitle: 'Inscription envoy\u00e9e \u00e0 Bambeh', doneDocs: 'documents envoy\u00e9s', docFailed: 'n\u2019a pas \u00e9t\u00e9 envoy\u00e9 - ajoutez-le depuis votre tableau de bord',
    already: 'Vous avez d\u00e9j\u00e0 une entreprise sur Bambeh Corporate.', openDash: 'Ouvrir mon tableau de bord Corporate',
    phoneNote: 'Pour Bambeh uniquement - jamais montr\u00e9 au public. Les acheteurs vous contactent dans la messagerie Bambeh.',
    qa_bulk: 'Import en masse', qa_analytics: 'Statistiques', qa_settings: 'R\u00e9glages de la boutique', qa_support: 'Support prioritaire', qa_trash: 'Corbeille',
    storefront: 'Ma vitrine', picture: 'Photo', uploadPicture: 'Ajouter une photo', pictureLink: 'ou coller le lien d\u2019une photo (https://...)',
    pictureDone: 'Photo ajout\u00e9e.', productsWait: 'Vos produits sont visibles par les acheteurs d\u00e8s que Bambeh a approuv\u00e9 votre entreprise.',
    r_sign_in: 'Reconnectez-vous, puis r\u00e9essayez.', r_not_ready: 'Cette partie est en cours d\u2019activation. R\u00e9essayez dans quelques minutes.',
    r_bad_type: 'Choisissez une photo (JPG, PNG, WEBP) ou un PDF.', r_too_big: 'Le fichier est trop lourd (10 Mo maximum).',
    r_no_folder: 'Le dossier des documents de Bambeh n\u2019est pas encore pr\u00eat. R\u00e9essayez plus tard.',
    r_upload_failed: 'Le fichier n\u2019est pas parti. V\u00e9rifiez votre connexion et r\u00e9essayez.',
    r_not_yours: 'Cette entreprise n\u2019est pas la v\u00f4tre.', r_checked_already: 'Bambeh a d\u00e9j\u00e0 v\u00e9rifi\u00e9 ce document - il ne peut plus \u00eatre retir\u00e9.',
    r_too_many: 'Trop de documents (20 maximum).', r_not_refused: 'Seule une inscription non approuv\u00e9e peut \u00eatre renvoy\u00e9e.',
    r_already: 'Vous avez d\u00e9j\u00e0 une entreprise sur Bambeh Corporate.', r_bad_name: 'Le nom de l\u2019entreprise doit faire 2 \u00e0 120 caract\u00e8res.',
    r_bad_category: 'Choisissez une cat\u00e9gorie.', r_bad_rep: '\u00c9crivez le nom de la personne qui repr\u00e9sente l\u2019entreprise.',
    r_bad_email: 'Cette adresse e-mail semble incorrecte.', r_bad_phone: '\u00c9crivez un num\u00e9ro de t\u00e9l\u00e9phone de 8 \u00e0 15 chiffres.',
    r_too_long: 'Un des champs est trop long.',
    r_contact_in_text: 'Pas de num\u00e9ro de t\u00e9l\u00e9phone, de WhatsApp ni d\u2019e-mail dans le nom, l\u2019adresse ou la description - les acheteurs vous contactent dans la messagerie Bambeh.',
    r_db: 'Bambeh n\u2019a pas pu enregistrer', r_network: 'Pas de connexion. V\u00e9rifiez internet et r\u00e9essayez.',
    r_other: 'Un probl\u00e8me est survenu. R\u00e9essayez.',
  },
  pidgin: {
    st_waiting: 'Bambeh never check am finish', st_documents: 'Bambeh need some papers', st_approved: 'Verified Corporate',
    st_refused: 'E no pass', st_suspended: 'Dem don stop am for now',
    ex_waiting: 'Bambeh dey check your registration and your papers for 3 to 14 working days. Dem go tell you for the app.',
    ex_documents: 'Upload wetin Bambeh ask for down here. The check go continue as e reach.',
    ex_approved: 'Your company dey show for the Corporate list and your products fit show for the Corporate adverts.',
    ex_refused: 'Correct your details or your papers, then send your registration give Bambeh again.',
    ex_suspended: 'People no dey see your company for now. Write Bambeh make una settle am.',
    sentOn: 'Send give Bambeh', decidedOn: 'Decision', bambehSays: 'Bambeh talk say',
    docsTitle: 'Your papers', docsNone: 'No paper yet. Bambeh need at least your RCCM paper and your tax card (NIU).',
    docsPrivate: 'Na only you and Bambeh fit open these files.',
    addDoc: 'Add paper', whichDoc: 'Which paper?', chooseFile: 'Choose photo or PDF', takePhoto: 'Snap photo',
    uploading: 'E dey upload...', uploaded: 'Paper don reach Bambeh.', open: 'Open', remove: 'Comot am', removed: 'Paper don comot.',
    confirmRemove: 'Comot this paper?', askedTitle: 'Bambeh dey ask for', upload: 'Upload', sendAgain: 'Send am give Bambeh again',
    sentAgain: 'E don go again. Bambeh go check am.', fixDetails: 'Correct my details', writeBambeh: 'Write Bambeh',
    history: 'Wetin happen', showHistory: 'Show wetin happen', hideHistory: 'Hide', you: 'You', bambeh: 'Bambeh',
    doc_rccm: 'RCCM paper (trade register)', doc_niu: 'Tax card (NIU)', doc_licence: 'Licence or permit for your work',
    doc_other: 'Another paper',
    ev_submitted: 'Registration don go', ev_docs_sent: 'Paper don go', ev_doc_removed: 'Paper don comot', ev_resubmitted: 'Send am again',
    ev_approve: 'Bambeh don approve am', ev_ask_docs: 'Bambeh ask for papers', ev_reject: 'Bambeh no approve am',
    ev_suspend: 'Bambeh stop am for now', ev_reactivate: 'E don open again', ev_note: 'Message from Bambeh',
    docsStep: 'Your papers', docsStepNote: 'Clear photo or PDF of each one. Dem dey go private folder: na only you and Bambeh fit open dem.',
    docsLater: 'No paper for hand? You fit add dem later from your Corporate dashboard - Bambeh go start the check when dem reach.',
    chosen: 'Don choose', change: 'Change', none: 'No add yet', nextSteps: 'Wetin go happen next',
    next1: 'Bambeh go check your details and your papers (3 to 14 working days).',
    next2: 'Dem go tell you for the app - e pass, or wetin remain.',
    next3: 'When e pass: the "Verified Corporate" badge, the Corporate list and the Corporate adverts for Home.',
    sending: 'E dey send your registration...', sendingDocs: 'E dey send your papers...',
    doneTitle: 'Registration don reach Bambeh', doneDocs: 'papers don go', docFailed: 'no upload - add am from your dashboard',
    already: 'You don already get company for Bambeh Corporate.', openDash: 'Open my Corporate dashboard',
    phoneNote: 'Na for Bambeh only - people no go see am. Buyers go reach you for Bambeh chat.',
    qa_bulk: 'Bulk upload', qa_analytics: 'Analytics', qa_settings: 'Store settings', qa_support: 'Priority support', qa_trash: 'Trash',
    storefront: 'My storefront', picture: 'Picture', uploadPicture: 'Upload picture', pictureLink: 'or paste picture link (https://...)',
    pictureDone: 'Picture don enter.', productsWait: 'Buyers go see your products when Bambeh don approve your company.',
    r_sign_in: 'Login again, then try again.', r_not_ready: 'Dem dey open this part now. Try again small time.',
    r_bad_type: 'Choose photo (JPG, PNG, WEBP) or PDF.', r_too_big: 'The file too big (10 MB maximum).',
    r_no_folder: 'Bambeh paper folder never ready. Try again later.',
    r_upload_failed: 'The file no upload. Check your network and try again.',
    r_not_yours: 'This company no be your own.', r_checked_already: 'Bambeh don check this paper already - you no fit comot am now.',
    r_too_many: 'Papers too plenty (20 maximum).', r_not_refused: 'Na only registration wey no pass you fit send again.',
    r_already: 'You don already get company for Bambeh Corporate.', r_bad_name: 'Company name need 2 to 120 letters.',
    r_bad_category: 'Choose category.', r_bad_rep: 'Write the name of the person wey represent the company.',
    r_bad_email: 'That email no correct.', r_bad_phone: 'Write phone number wey get 8 to 15 numbers.',
    r_too_long: 'One field too long.',
    r_contact_in_text: 'No phone number, WhatsApp or email for the name, address or description - buyers go reach you for Bambeh chat.',
    r_db: 'Bambeh no fit save am', r_network: 'No network. Check your internet and try again.',
    r_other: 'Something no work. Try again.',
  },
  ar: {
    st_waiting: '\u0628\u0627\u0646\u062a\u0638\u0627\u0631 \u062a\u062d\u0642\u0642 Bambeh', st_documents: 'Bambeh \u062a\u062d\u062a\u0627\u062c \u0625\u0644\u0649 \u0645\u0633\u062a\u0646\u062f\u0627\u062a', st_approved: '\u0634\u0631\u0643\u0629 \u0645\u0648\u062b\u0651\u0642\u0629',
    st_refused: '\u0644\u0645 \u062a\u062a\u0645 \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629', st_suspended: '\u0645\u0648\u0642\u0648\u0641\u0629 \u0645\u0624\u0642\u062a\u064b\u0627',
    ex_waiting: '\u062a\u062a\u062d\u0642\u0642 Bambeh \u0645\u0646 \u062a\u0633\u062c\u064a\u0644\u0643 \u0648\u0645\u0633\u062a\u0646\u062f\u0627\u062a\u0643 \u062e\u0644\u0627\u0644 3 \u0625\u0644\u0649 14 \u064a\u0648\u0645 \u0639\u0645\u0644. \u0633\u062a\u064f\u0628\u0644\u0651\u063a \u062f\u0627\u062e\u0644 \u0627\u0644\u062a\u0637\u0628\u064a\u0642.',
    ex_documents: '\u0627\u0631\u0641\u0639 \u0645\u0627 \u062a\u0637\u0644\u0628\u0647 Bambeh \u0623\u062f\u0646\u0627\u0647. \u064a\u0633\u062a\u0645\u0631 \u0627\u0644\u062a\u062d\u0642\u0642 \u0641\u0648\u0631 \u0648\u0635\u0648\u0644\u0647.',
    ex_approved: '\u062a\u0638\u0647\u0631 \u0634\u0631\u0643\u062a\u0643 \u0641\u064a \u062f\u0644\u064a\u0644 \u0627\u0644\u0634\u0631\u0643\u0627\u062a \u0648\u064a\u0645\u0643\u0646 \u0623\u0646 \u062a\u0638\u0647\u0631 \u0645\u0646\u062a\u062c\u0627\u062a\u0643 \u0641\u064a \u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0627\u0644\u0634\u0631\u0643\u0627\u062a.',
    ex_refused: '\u0635\u062d\u0651\u062d \u0628\u064a\u0627\u0646\u0627\u062a\u0643 \u0623\u0648 \u0645\u0633\u062a\u0646\u062f\u0627\u062a\u0643\u060c \u062b\u0645 \u0623\u0631\u0633\u0644 \u062a\u0633\u062c\u064a\u0644\u0643 \u0625\u0644\u0649 Bambeh \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.',
    ex_suspended: '\u0634\u0631\u0643\u062a\u0643 \u0645\u062e\u0641\u064a\u0629 \u0639\u0646 \u0627\u0644\u062c\u0645\u0647\u0648\u0631 \u062d\u0627\u0644\u064a\u064b\u0627. \u0631\u0627\u0633\u0644 Bambeh \u0644\u062d\u0644 \u0627\u0644\u0623\u0645\u0631.',
    sentOn: '\u0623\u064f\u0631\u0633\u0644 \u0625\u0644\u0649 Bambeh', decidedOn: '\u0627\u0644\u0642\u0631\u0627\u0631', bambehSays: '\u0645\u0644\u0627\u062d\u0638\u0629 Bambeh',
    docsTitle: '\u0645\u0633\u062a\u0646\u062f\u0627\u062a\u0643', docsNone: '\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0633\u062a\u0646\u062f\u0627\u062a \u0628\u0639\u062f. \u062a\u062d\u062a\u0627\u062c Bambeh \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644 \u0625\u0644\u0649 \u0634\u0647\u0627\u062f\u0629 \u0627\u0644\u0633\u062c\u0644 \u0627\u0644\u062a\u062c\u0627\u0631\u064a \u0648\u0627\u0644\u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u0636\u0631\u064a\u0628\u064a\u0629 (NIU).',
    docsPrivate: '\u0623\u0646\u062a \u0648Bambeh \u0641\u0642\u0637 \u064a\u0645\u0643\u0646\u0643\u0645\u0627 \u0641\u062a\u062d \u0647\u0630\u0647 \u0627\u0644\u0645\u0644\u0641\u0627\u062a.',
    addDoc: '\u0625\u0636\u0627\u0641\u0629 \u0645\u0633\u062a\u0646\u062f', whichDoc: '\u0623\u064a \u0645\u0633\u062a\u0646\u062f\u061f', chooseFile: '\u0627\u062e\u062a\u0631 \u0635\u0648\u0631\u0629 \u0623\u0648 \u0645\u0644\u0641 PDF', takePhoto: '\u0627\u0644\u062a\u0642\u0637 \u0635\u0648\u0631\u0629',
    uploading: '\u062c\u0627\u0631\u064d \u0627\u0644\u0631\u0641\u0639...', uploaded: '\u0623\u064f\u0631\u0633\u0644 \u0627\u0644\u0645\u0633\u062a\u0646\u062f \u0625\u0644\u0649 Bambeh.', open: '\u0641\u062a\u062d', remove: '\u0625\u0632\u0627\u0644\u0629', removed: '\u0623\u064f\u0632\u064a\u0644 \u0627\u0644\u0645\u0633\u062a\u0646\u062f.',
    confirmRemove: '\u0647\u0644 \u062a\u0631\u064a\u062f \u0625\u0632\u0627\u0644\u0629 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062a\u0646\u062f\u061f', askedTitle: '\u062a\u0637\u0644\u0628 Bambeh', upload: '\u0631\u0641\u0639', sendAgain: '\u0623\u0631\u0633\u0644\u0647 \u0625\u0644\u0649 Bambeh \u0645\u0631\u0629 \u0623\u062e\u0631\u0649',
    sentAgain: '\u0623\u064f\u0631\u0633\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649. \u0633\u062a\u062a\u062d\u0642\u0642 \u0645\u0646\u0647 Bambeh.', fixDetails: '\u062a\u0635\u062d\u064a\u062d \u0628\u064a\u0627\u0646\u0627\u062a\u064a', writeBambeh: '\u0631\u0627\u0633\u0644 Bambeh',
    history: '\u0645\u0627 \u062d\u062f\u062b', showHistory: '\u0639\u0631\u0636 \u0645\u0627 \u062d\u062f\u062b', hideHistory: '\u0625\u062e\u0641\u0627\u0621', you: '\u0623\u0646\u062a', bambeh: 'Bambeh',
    doc_rccm: '\u0634\u0647\u0627\u062f\u0629 \u0627\u0644\u0633\u062c\u0644 \u0627\u0644\u062a\u062c\u0627\u0631\u064a (RCCM)', doc_niu: '\u0627\u0644\u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u0636\u0631\u064a\u0628\u064a\u0629 (NIU)', doc_licence: '\u0631\u062e\u0635\u0629 \u0645\u0632\u0627\u0648\u0644\u0629 \u0627\u0644\u0646\u0634\u0627\u0637',
    doc_other: '\u0645\u0633\u062a\u0646\u062f \u0622\u062e\u0631',
    ev_submitted: '\u0623\u064f\u0631\u0633\u0644 \u0627\u0644\u062a\u0633\u062c\u064a\u0644', ev_docs_sent: '\u0623\u064f\u0631\u0633\u0644 \u0645\u0633\u062a\u0646\u062f', ev_doc_removed: '\u0623\u064f\u0632\u064a\u0644 \u0645\u0633\u062a\u0646\u062f', ev_resubmitted: '\u0623\u064f\u0631\u0633\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649',
    ev_approve: '\u0648\u0627\u0641\u0642\u062a \u0639\u0644\u064a\u0647 Bambeh', ev_ask_docs: '\u0637\u0644\u0628\u062a Bambeh \u0645\u0633\u062a\u0646\u062f\u0627\u062a', ev_reject: '\u0644\u0645 \u062a\u0648\u0627\u0641\u0642 \u0639\u0644\u064a\u0647 Bambeh',
    ev_suspend: '\u0623\u0648\u0642\u0641\u062a\u0647 Bambeh', ev_reactivate: '\u0646\u0634\u0637\u0629 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649', ev_note: '\u0631\u0633\u0627\u0644\u0629 \u0645\u0646 Bambeh',
    docsStep: '\u0645\u0633\u062a\u0646\u062f\u0627\u062a\u0643', docsStepNote: '\u0635\u0648\u0631\u0629 \u0648\u0627\u0636\u062d\u0629 \u0623\u0648 \u0645\u0644\u0641 PDF \u0644\u0643\u0644 \u0645\u0633\u062a\u0646\u062f. \u062a\u064f\u062d\u0641\u0638 \u0641\u064a \u0645\u062c\u0644\u062f \u062e\u0627\u0635: \u0623\u0646\u062a \u0648Bambeh \u0641\u0642\u0637 \u064a\u0645\u0643\u0646\u0643\u0645\u0627 \u0641\u062a\u062d\u0647\u0627.',
    docsLater: '\u0644\u064a\u0633\u062a \u0627\u0644\u0645\u0633\u062a\u0646\u062f\u0627\u062a \u0645\u0639\u0643\u061f \u064a\u0645\u0643\u0646\u0643 \u0625\u0636\u0627\u0641\u062a\u0647\u0627 \u0644\u0627\u062d\u0642\u064b\u0627 \u0645\u0646 \u0644\u0648\u062d\u0629 \u062a\u062d\u0643\u0645 \u0627\u0644\u0634\u0631\u0643\u0629 - \u062a\u0628\u062f\u0623 Bambeh \u0627\u0644\u062a\u062d\u0642\u0642 \u0641\u0648\u0631 \u0648\u0635\u0648\u0644\u0647\u0627.',
    chosen: '\u062a\u0645 \u0627\u0644\u0627\u062e\u062a\u064a\u0627\u0631', change: '\u062a\u063a\u064a\u064a\u0631', none: '\u0644\u0645 \u062a\u064f\u0636\u0641', nextSteps: '\u0645\u0627\u0630\u0627 \u0628\u0639\u062f',
    next1: '\u062a\u062a\u062d\u0642\u0642 Bambeh \u0645\u0646 \u0628\u064a\u0627\u0646\u0627\u062a\u0643 \u0648\u0645\u0633\u062a\u0646\u062f\u0627\u062a\u0643 (3 \u0625\u0644\u0649 14 \u064a\u0648\u0645 \u0639\u0645\u0644).',
    next2: '\u0633\u062a\u064f\u0628\u0644\u0651\u063a \u062f\u0627\u062e\u0644 \u0627\u0644\u062a\u0637\u0628\u064a\u0642 - \u0628\u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0623\u0648 \u0628\u0645\u0627 \u064a\u0646\u0642\u0635.',
    next3: '\u0628\u0639\u062f \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629: \u0634\u0627\u0631\u0629 \u00ab\u0634\u0631\u0643\u0629 \u0645\u0648\u062b\u0651\u0642\u0629\u00bb \u0648\u062f\u0644\u064a\u0644 \u0627\u0644\u0634\u0631\u0643\u0627\u062a \u0648\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0627\u0644\u0634\u0631\u0643\u0627\u062a \u0641\u064a \u0627\u0644\u0635\u0641\u062d\u0629 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629.',
    sending: '\u062c\u0627\u0631\u064d \u0625\u0631\u0633\u0627\u0644 \u062a\u0633\u062c\u064a\u0644\u0643...', sendingDocs: '\u062c\u0627\u0631\u064d \u0625\u0631\u0633\u0627\u0644 \u0645\u0633\u062a\u0646\u062f\u0627\u062a\u0643...',
    doneTitle: '\u0623\u064f\u0631\u0633\u0644 \u0627\u0644\u062a\u0633\u062c\u064a\u0644 \u0625\u0644\u0649 Bambeh', doneDocs: '\u0645\u0633\u062a\u0646\u062f\u0627\u062a \u0623\u064f\u0631\u0633\u0644\u062a', docFailed: '\u0644\u0645 \u064a\u064f\u0631\u0641\u0639 - \u0623\u0636\u0641\u0647 \u0645\u0646 \u0644\u0648\u062d\u0629 \u0627\u0644\u062a\u062d\u0643\u0645',
    already: '\u0644\u062f\u064a\u0643 \u0634\u0631\u0643\u0629 \u0628\u0627\u0644\u0641\u0639\u0644 \u0639\u0644\u0649 Bambeh Corporate.', openDash: '\u0627\u0641\u062a\u062d \u0644\u0648\u062d\u0629 \u062a\u062d\u0643\u0645 \u0634\u0631\u0643\u062a\u064a',
    phoneNote: '\u0644\u0640Bambeh \u0641\u0642\u0637 - \u0644\u0627 \u064a\u0638\u0647\u0631 \u0644\u0644\u062c\u0645\u0647\u0648\u0631 \u0623\u0628\u062f\u064b\u0627. \u064a\u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0643 \u0627\u0644\u0645\u0634\u062a\u0631\u0648\u0646 \u0639\u0628\u0631 \u0645\u062d\u0627\u062f\u062b\u0629 Bambeh.',
    qa_bulk: '\u0631\u0641\u0639 \u062c\u0645\u0627\u0639\u064a', qa_analytics: '\u0627\u0644\u0625\u062d\u0635\u0627\u0626\u064a\u0627\u062a', qa_settings: '\u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0627\u0644\u0645\u062a\u062c\u0631', qa_support: '\u062f\u0639\u0645 \u0630\u0648 \u0623\u0648\u0644\u0648\u064a\u0629', qa_trash: '\u0633\u0644\u0629 \u0627\u0644\u0645\u062d\u0630\u0648\u0641\u0627\u062a',
    storefront: '\u0648\u0627\u062c\u0647\u0629 \u0645\u062a\u062c\u0631\u064a', picture: '\u0635\u0648\u0631\u0629', uploadPicture: '\u0631\u0641\u0639 \u0635\u0648\u0631\u0629', pictureLink: '\u0623\u0648 \u0627\u0644\u0635\u0642 \u0631\u0627\u0628\u0637 \u0635\u0648\u0631\u0629 (https://...)',
    pictureDone: '\u0623\u064f\u0636\u064a\u0641\u062a \u0627\u0644\u0635\u0648\u0631\u0629.', productsWait: '\u062a\u0638\u0647\u0631 \u0645\u0646\u062a\u062c\u0627\u062a\u0643 \u0644\u0644\u0645\u0634\u062a\u0631\u064a\u0646 \u0628\u0639\u062f \u0645\u0648\u0627\u0641\u0642\u0629 Bambeh \u0639\u0644\u0649 \u0634\u0631\u0643\u062a\u0643.',
    r_sign_in: '\u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649 \u062b\u0645 \u062d\u0627\u0648\u0644.', r_not_ready: '\u064a\u062c\u0631\u064a \u062a\u0634\u063a\u064a\u0644 \u0647\u0630\u0627 \u0627\u0644\u062c\u0632\u0621. \u062d\u0627\u0648\u0644 \u0628\u0639\u062f \u062f\u0642\u0627\u0626\u0642.',
    r_bad_type: '\u0627\u062e\u062a\u0631 \u0635\u0648\u0631\u0629 (JPG \u0623\u0648 PNG \u0623\u0648 WEBP) \u0623\u0648 \u0645\u0644\u0641 PDF.', r_too_big: '\u0627\u0644\u0645\u0644\u0641 \u0643\u0628\u064a\u0631 \u062c\u062f\u064b\u0627 (10 \u0645\u064a\u063a\u0627\u0628\u0627\u064a\u062a \u0643\u062d\u062f \u0623\u0642\u0635\u0649).',
    r_no_folder: '\u0645\u062c\u0644\u062f \u0645\u0633\u062a\u0646\u062f\u0627\u062a Bambeh \u063a\u064a\u0631 \u062c\u0627\u0647\u0632 \u0628\u0639\u062f. \u062d\u0627\u0648\u0644 \u0644\u0627\u062d\u0642\u064b\u0627.',
    r_upload_failed: '\u0644\u0645 \u064a\u064f\u0631\u0641\u0639 \u0627\u0644\u0645\u0644\u0641. \u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u062a\u0635\u0627\u0644\u0643 \u0648\u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.',
    r_not_yours: '\u0647\u0630\u0647 \u0627\u0644\u0634\u0631\u0643\u0629 \u0644\u064a\u0633\u062a \u0644\u0643.', r_checked_already: '\u062a\u062d\u0642\u0642\u062a Bambeh \u0645\u0646 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062a\u0646\u062f - \u0644\u0627 \u064a\u0645\u0643\u0646 \u0625\u0632\u0627\u0644\u062a\u0647 \u0627\u0644\u0622\u0646.',
    r_too_many: '\u0645\u0633\u062a\u0646\u062f\u0627\u062a \u0643\u062b\u064a\u0631\u0629 (20 \u0643\u062d\u062f \u0623\u0642\u0635\u0649).', r_not_refused: '\u064a\u0645\u0643\u0646 \u0625\u0639\u0627\u062f\u0629 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u062a\u0633\u062c\u064a\u0644 \u063a\u064a\u0631 \u0627\u0644\u0645\u0648\u0627\u0641\u064e\u0642 \u0639\u0644\u064a\u0647 \u0641\u0642\u0637.',
    r_already: '\u0644\u062f\u064a\u0643 \u0634\u0631\u0643\u0629 \u0628\u0627\u0644\u0641\u0639\u0644 \u0639\u0644\u0649 Bambeh Corporate.', r_bad_name: '\u0627\u0633\u0645 \u0627\u0644\u0634\u0631\u0643\u0629 \u0645\u0646 2 \u0625\u0644\u0649 120 \u062d\u0631\u0641\u064b\u0627.',
    r_bad_category: '\u0627\u062e\u062a\u0631 \u0641\u0626\u0629.', r_bad_rep: '\u0627\u0643\u062a\u0628 \u0627\u0633\u0645 \u0645\u0645\u062b\u0644 \u0627\u0644\u0634\u0631\u0643\u0629.',
    r_bad_email: '\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u063a\u064a\u0631 \u0635\u062d\u064a\u062d.', r_bad_phone: '\u0627\u0643\u062a\u0628 \u0631\u0642\u0645 \u0647\u0627\u062a\u0641 \u0645\u0646 8 \u0625\u0644\u0649 15 \u0631\u0642\u0645\u064b\u0627.',
    r_too_long: '\u0623\u062d\u062f \u0627\u0644\u062d\u0642\u0648\u0644 \u0637\u0648\u064a\u0644 \u062c\u062f\u064b\u0627.',
    r_contact_in_text: '\u0644\u0627 \u0623\u0631\u0642\u0627\u0645 \u0647\u0627\u062a\u0641 \u0648\u0644\u0627 \u0648\u0627\u062a\u0633\u0627\u0628 \u0648\u0644\u0627 \u0628\u0631\u064a\u062f \u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0641\u064a \u0627\u0644\u0627\u0633\u0645 \u0623\u0648 \u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0623\u0648 \u0627\u0644\u0648\u0635\u0641 - \u064a\u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0643 \u0627\u0644\u0645\u0634\u062a\u0631\u0648\u0646 \u0639\u0628\u0631 \u0645\u062d\u0627\u062f\u062b\u0629 Bambeh.',
    r_db: '\u062a\u0639\u0630\u0651\u0631 \u0639\u0644\u0649 Bambeh \u0627\u0644\u062d\u0641\u0638', r_network: '\u0644\u0627 \u064a\u0648\u062c\u062f \u0627\u062a\u0635\u0627\u0644. \u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u0644\u0625\u0646\u062a\u0631\u0646\u062a \u0648\u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.',
    r_other: '\u062d\u062f\u062b \u062e\u0637\u0623. \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.',
  },
  ff: {
    st_waiting: 'Ina habbii tabitingol Bambeh', st_documents: 'Bambeh ina haaji dereeji', st_approved: 'Kawtal Tabitinaango',
    st_refused: 'Ja\u0253aaka', st_suspended: 'Darnaama',
    ex_waiting: 'Bambeh ina tabitina winnditinki maa e dereeji maa nder bal\u0257e golle 3 haa 14. Maa a anndine e nder jaa\u0253nirgal ngal.',
    ex_documents: 'Neldu ko Bambeh naamni ko les \u0257oo. Tabitingol ina jokkoo so \u0257um hewtii.',
    ex_approved: 'Kawtal maa ina yiyee e dosol Corporate, kuuje maa ina mbaawi yiyeede e jeeyanteeji Corporate.',
    ex_refused: 'Feewnit humpitooji maa walla dereeji maa, refti neldaa winnditinki maa Bambeh.',
    ex_suspended: 'Kawtal maa suuraama yim\u0253e jooni. Winndan Bambeh ngam feewnitde \u0257um.',
    sentOn: 'Neldaama Bambeh', decidedOn: '\u00d1aawoore', bambehSays: 'Bambeh wi\u2019i',
    docsTitle: 'Dereeji maa', docsNone: 'Alaa dereewol tawo. Bambeh ina haaji sertifika RCCM maa e karte lampoo maa (NIU) tan.',
    docsPrivate: 'Aan e Bambeh tan mbaawi uddittude \u0257i.',
    addDoc: '\u018aeydu dereewol', whichDoc: 'Dereewol hol?', chooseFile: 'Su\u0253o natal walla PDF', takePhoto: 'Natu natal',
    uploading: 'Ina neldee...', uploaded: 'Dereewol ngol hewtii Bambeh.', open: 'Uddit', remove: 'Ittu', removed: 'Dereewol ngol ittaama.',
    confirmRemove: 'Ittu dereewol ngol?', askedTitle: 'Bambeh ina naamnoo', upload: 'Neldu', sendAgain: 'Neldu Bambeh kadi',
    sentAgain: 'Neldaama kadi. Bambeh maa tabitin \u0257um.', fixDetails: 'Feewnit humpitooji am', writeBambeh: 'Winndan Bambeh',
    history: 'Ko wa\u0253i', showHistory: 'Hollu ko wa\u0253i', hideHistory: 'Suuru', you: 'Aan', bambeh: 'Bambeh',
    doc_rccm: 'Sertifika RCCM', doc_niu: 'Karte lampoo (NIU)', doc_licence: 'Lisaas golle maa', doc_other: 'Dereewol goo',
    ev_submitted: 'Winnditinki neldaama', ev_docs_sent: 'Dereewol neldaama', ev_doc_removed: 'Dereewol ittaama', ev_resubmitted: 'Neldaama kadi',
    ev_approve: 'Bambeh ja\u0253ii', ev_ask_docs: 'Bambeh naamnii dereeji', ev_reject: 'Bambeh ja\u0253aani',
    ev_suspend: 'Bambeh darnii', ev_reactivate: 'Ina golla kadi', ev_note: 'Batakuru Bambeh',
    docsStep: 'Dereeji maa', docsStepNote: 'Natal laa\u0253\u0257o walla PDF kala gooto. Ina ndenaa e nder dosol suu\u0257ii\u0257o: aan e Bambeh tan mbaawi uddittude \u0257i.',
    docsLater: 'Alaa dereeji e juu\u0257e maa? A waawii \u0253eydude \u0257i caggal e Dashboard Kawtal maa - Bambeh fu\u0257\u0257ina tabitingol so \u0257i hewtii.',
    chosen: 'Su\u0253aama', change: 'Waylu', none: '\u0181eydaaka', nextSteps: 'Ko wa\u0257ata caggal',
    next1: 'Bambeh maa tabitin humpitooji maa e dereeji maa (bal\u0257e golle 3 haa 14).',
    next2: 'Maa a anndine e nder jaa\u0253nirgal ngal - ja\u0253aama, walla ko \u0257uu\u0257i.',
    next3: 'So ja\u0253aama: mballu "Kawtal Tabitinaango", dosol Corporate e jeeyanteeji Corporate e hello arano.',
    sending: 'Winnditinki maa ina neldee...', sendingDocs: 'Dereeji maa ina neldee...',
    doneTitle: 'Winnditinki hewtii Bambeh', doneDocs: 'dereeji neldaama', docFailed: 'neldaaka - \u0253eydu \u0257um e Dashboard maa',
    already: 'A jogii kawtal e Bambeh Corporate kadi.', openDash: 'Uddit Dashboard Kawtal am',
    phoneNote: 'Ngam Bambeh tan - yim\u0253e yiyataa \u0257um. Soodoo\u0253e hewtoto ma e yeewtere Bambeh.',
    qa_bulk: 'Neldu keew\u0257i', qa_analytics: 'Limngal', qa_settings: 'Teelte butik', qa_support: 'Ballal adanngal', qa_trash: 'Ittaaje',
    storefront: 'Butik am', picture: 'Natal', uploadPicture: 'Neldu natal', pictureLink: 'walla tabbin jokkol natal (https://...)',
    pictureDone: 'Natal \u0253eydaama.', productsWait: 'Soodoo\u0253e yiyay kuuje maa so Bambeh ja\u0253ii kawtal maa.',
    r_sign_in: 'Naat kadi, refti eto.', r_not_ready: 'Ndee feccere ina udditee. Eto kadi caggal minnte see\u0257a.',
    r_bad_type: 'Su\u0253o natal (JPG, PNG, WEBP) walla PDF.', r_too_big: 'Fiile oo mawni no feewi (10 MB tan).',
    r_no_folder: 'Dosol dereeji Bambeh mo\u01b4\u01b4aani tawo. Eto caggal.',
    r_upload_failed: 'Fiile oo neldaaka. \u01b3eew ce\u0257eele maa refti eto.',
    r_not_yours: 'Ngal kawtal wonaa maa.', r_checked_already: 'Bambeh tabitinii ngol dereewol - waawaa ittude ngol jooni.',
    r_too_many: 'Dereeji keewii (20 tan).', r_not_refused: 'Winnditinki mo Bambeh ja\u0253aani tan waawi neldeede kadi.',
    r_already: 'A jogii kawtal e Bambeh Corporate kadi.', r_bad_name: 'Innde kawtal ina foti alkulal 2 haa 120.',
    r_bad_category: 'Su\u0253o feccere.', r_bad_rep: 'Winndu innde lomtii\u0257o kawtal.',
    r_bad_email: 'Ndee iimeel mo\u01b4\u01b4aani.', r_bad_phone: 'Winndu limoore telefol jogiinde limle 8 haa 15.',
    r_too_long: 'Nokku gooto juuti no feewi.',
    r_contact_in_text: 'Alaa limoore telefol, WhatsApp walla iimeel e innde, \u00f1ii\u0253irde walla sifaa - soodoo\u0253e hewtoto ma e yeewtere Bambeh.',
    r_db: 'Bambeh waawaa danndude \u0257um', r_network: 'Alaa ce\u0257eele. \u01b3eew internet maa refti eto.',
    r_other: 'Huunde mo\u01b4\u01b4aani. Eto kadi.',
  },
};
export type ReviewStrings = (typeof REVIEW_STR)['en'];

export function reviewStrings(rawLang: string): { r: ReviewStrings; isRtl: boolean; lang: keyof typeof REVIEW_STR } {
  const key = (rawLang === 'fulfulde' || rawLang === 'ful' ? 'ff' : rawLang === 'pcm' ? 'pidgin' : rawLang) as keyof typeof REVIEW_STR;
  const r = REVIEW_STR[key] || REVIEW_STR.en;
  return { r, isRtl: key === 'ar', lang: REVIEW_STR[key] ? key : 'en' };
}

export function docLabel(r: ReviewStrings, kind: string): string {
  return (r as Record<string, string>)['doc_' + kind] || kind;
}
export function eventLabel(r: ReviewStrings, action: string): string {
  return (r as Record<string, string>)['ev_' + action] || action;
}
export function stateTitle(r: ReviewStrings, state: string): string {
  return (r as Record<string, string>)['st_' + state] || state;
}
export function stateText(r: ReviewStrings, state: string): string {
  return (r as Record<string, string>)['ex_' + state] || '';
}
/** The sentence for a refusal from the database (or from the phone itself). */
export function failText(r: ReviewStrings, f: Fail | { reason?: string; detail?: string } | null | undefined): string {
  const reason = (f && f.reason) || 'other';
  const t = (r as Record<string, string>)['r_' + reason];
  if (reason === 'db') return r.r_db + (f && f.detail ? ': ' + f.detail : '.');
  return t || r.r_other;
}

/** A local date and time, in the reader's language. */
export function fmtWhen(iso: string | null | undefined, lang: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const loc = lang === 'fr' ? 'fr-FR' : lang === 'ar' ? 'ar' : 'en-GB';
  try {
    return d.toLocaleString(loc, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return d.toISOString().slice(0, 16).replace('T', ' ');
  }
}

/* ------------------------------------------------------------------ talking to the database */
function missingFn(error: unknown): boolean {
  const e = error as { code?: string; message?: string } | null;
  const m = String((e && (e.message || '')) || '');
  return !!e && (e.code === 'PGRST202' || e.code === '42883' || /could not find the function|does not exist|schema cache/i.test(m));
}
function offline(error: unknown): boolean {
  const m = String((error as { message?: string } | null)?.message || error || '');
  return /failed to fetch|network|load failed|timeout/i.test(m);
}
async function myId(): Promise<string> {
  try {
    const { data } = await supabase.auth.getSession();
    return (data && data.session && data.session.user && data.session.user.id) || '';
  } catch {
    return '';
  }
}
function rand(): string {
  return Math.random().toString(36).slice(2, 8);
}

/** The businesses this member owns or works for, with Bambeh's check. */
export async function fetchMyBusinesses(): Promise<Res<{ stores: MyBusiness[] }>> {
  try {
    const { data, error } = await supabase.rpc('bambeh_corp_my');
    if (error) return { ok: false, reason: missingFn(error) ? 'not_ready' : offline(error) ? 'network' : 'other', detail: error.message };
    const d = (data || {}) as { ok?: boolean; reason?: string; stores?: MyBusiness[] };
    if (!d.ok) return { ok: false, reason: d.reason || 'other' };
    const stores = (Array.isArray(d.stores) ? d.stores : []).map((s) => ({
      ...s,
      docs_requested: (Array.isArray(s.docs_requested) ? s.docs_requested : []) as DocKind[],
      docs: Array.isArray(s.docs) ? s.docs : [],
      history: Array.isArray(s.history) ? s.history : [],
    }));
    return { ok: true, stores };
  } catch (e) {
    return { ok: false, reason: offline(e) ? 'network' : 'other' };
  }
}

/** Register a business: checked by the database (FIX832); the old direct way only while FIX832 has not run. */
export async function registerBusiness(form: RegisterForm): Promise<Res<{ id: string; slug: string | null; legacy?: boolean }>> {
  try {
    const { data, error } = await supabase.rpc('bambeh_corp_register', { p: form });
    if (!error) {
      const d = (data || {}) as { ok?: boolean; reason?: string; detail?: string; id?: string; slug?: string };
      if (d.ok && d.id) return { ok: true, id: d.id, slug: d.slug || null };
      return { ok: false, reason: d.reason || 'other', detail: d.detail, ...(d.id ? { id: d.id } : {}) } as Fail;
    }
    if (!missingFn(error)) return { ok: false, reason: offline(error) ? 'network' : 'other', detail: error.message };
  } catch (e) {
    return { ok: false, reason: offline(e) ? 'network' : 'other' };
  }
  // FIX832 not run yet: the way FIX119 saved it (status "pending"; the database adds the owner as a member)
  const uid = await myId();
  if (!uid) return { ok: false, reason: 'sign_in' };
  const base = (form.trading_name.trim() || form.registered_name.trim()).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) || 'business';
  const slug = base + '-' + rand().slice(0, 4);
  const digits = form.min_order_value_xaf.replace(/[^\d]/g, '');
  const { data, error } = await supabase.from('corporate_stores').insert({
    owner_id: uid, registered_name: form.registered_name.trim(), trading_name: form.trading_name.trim() || null, slug,
    category: form.category, rep_name: form.rep_name.trim() || null, rep_email: form.rep_email.trim() || null,
    rep_phone: form.rep_phone.trim() || null, rccm_number: form.rccm_number.trim() || null, niu_number: form.niu_number.trim() || null,
    city: form.city.trim() || null, address: form.address.trim() || null, about: form.about.trim() || null, audience: form.audience,
    moq_text: form.moq_text.trim() || null, min_order_value_xaf: digits ? Number(digits) : null, price_mode: form.price_mode,
    status: 'pending', verified: false,
  }).select('id, slug').single();
  if (error || !data) return { ok: false, reason: 'db', detail: error ? error.message : '' };
  return { ok: true, id: (data as { id: string }).id, slug: (data as { slug: string | null }).slug, legacy: true };
}

const DOC_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

/** A document (photo or PDF) into the business's private folder, then recorded for Bambeh's check. */
export async function uploadBusinessDoc(storeId: string, kind: DocKind, file: File): Promise<Res<{ id: string; still_asked: DocKind[] }>> {
  if (!file) return { ok: false, reason: 'bad_type' };
  let f: File = file;
  const t = String(file.type || '').toLowerCase();
  if (t.startsWith('image/')) {
    // made smaller to save data, but kept large and sharp enough to read a stamp and a number
    try { f = await prepImage(file, { maxSide: 2200, quality: 0.85, targetBytes: 1500000, minQuality: 0.6 }); } catch { f = file; }
  } else if (t !== 'application/pdf' && !/\.pdf$/i.test(file.name || '')) {
    return { ok: false, reason: 'bad_type' };
  }
  const mime = String(f.type || '').toLowerCase() || (/\.pdf$/i.test(file.name || '') ? 'application/pdf' : '');
  if (DOC_TYPES.indexOf(mime) < 0) return { ok: false, reason: 'bad_type' };
  if (f.size > 10 * 1024 * 1024) return { ok: false, reason: 'too_big' };
  const uid = await myId();
  if (!uid) return { ok: false, reason: 'sign_in' };
  const ext = mime === 'application/pdf' ? 'pdf' : mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
  const path = uid + '/' + storeId + '/' + kind + '-' + Date.now() + '-' + rand() + '.' + ext;
  try {
    const { error } = await supabase.storage.from('corporate-docs').upload(path, f, { contentType: mime, upsert: false });
    if (error) {
      const m = String((error as { message?: string }).message || error);
      return { ok: false, reason: /bucket|not found/i.test(m) ? 'no_folder' : offline(error) ? 'network' : 'upload_failed', detail: m };
    }
  } catch (e) {
    return { ok: false, reason: offline(e) ? 'network' : 'upload_failed' };
  }
  try {
    const { data, error } = await supabase.rpc('bambeh_corp_doc_add', {
      p_store: storeId, p_kind: kind, p_path: path, p_name: String(file.name || '').slice(0, 120) || null, p_mime: mime, p_size: f.size,
    });
    const d = (data || {}) as { ok?: boolean; reason?: string; id?: string; still_asked?: DocKind[] };
    if (!error && d.ok && d.id) return { ok: true, id: d.id, still_asked: Array.isArray(d.still_asked) ? d.still_asked : [] };
    // not recorded: take the file back so nothing lies there unread
    try { await supabase.storage.from('corporate-docs').remove([path]); } catch { /* best effort */ }
    if (error) return { ok: false, reason: missingFn(error) ? 'not_ready' : offline(error) ? 'network' : 'other', detail: error.message };
    return { ok: false, reason: d.reason || 'other' };
  } catch (e) {
    return { ok: false, reason: offline(e) ? 'network' : 'other' };
  }
}

/** Take a wrong document back (while Bambeh is still checking). */
export async function removeBusinessDoc(doc: CorpDoc): Promise<Done> {
  try {
    const { data, error } = await supabase.rpc('bambeh_corp_doc_remove', { p_doc: doc.id });
    if (error) return { ok: false, reason: offline(error) ? 'network' : 'other', detail: error.message };
    const d = (data || {}) as { ok?: boolean; reason?: string };
    if (!d.ok) return { ok: false, reason: d.reason || 'other' };
    try { await supabase.storage.from('corporate-docs').remove([doc.path]); } catch { /* the record is gone; the file may stay */ }
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: offline(e) ? 'network' : 'other' };
  }
}

/** A short-lived private link to open a document (the business, or Bambeh staff). */
export async function openBusinessDoc(path: string): Promise<Res<{ url: string }>> {
  try {
    const { data, error } = await supabase.storage.from('corporate-docs').createSignedUrl(path, 600);
    if (error || !data || !data.signedUrl) return { ok: false, reason: error && offline(error) ? 'network' : 'other', detail: error ? error.message : '' };
    return { ok: true, url: data.signedUrl };
  } catch (e) {
    return { ok: false, reason: offline(e) ? 'network' : 'other' };
  }
}

/** Not approved, corrected: send it to Bambeh again. */
export async function resubmitBusiness(storeId: string): Promise<Done> {
  try {
    const { data, error } = await supabase.rpc('bambeh_corp_resubmit', { p_store: storeId });
    if (error) return { ok: false, reason: missingFn(error) ? 'not_ready' : offline(error) ? 'network' : 'other', detail: error.message };
    const d = (data || {}) as { ok?: boolean; reason?: string };
    return d.ok ? { ok: true } : { ok: false, reason: d.reason || 'other' };
  } catch (e) {
    return { ok: false, reason: offline(e) ? 'network' : 'other' };
  }
}

/** A product picture: the shop pictures folder (like the logo), the listings folder if that one refuses. */
export async function uploadProductPicture(storeId: string, file: File): Promise<Res<{ url: string }>> {
  if (!file || !String(file.type || '').startsWith('image/')) return { ok: false, reason: 'bad_type' };
  let f: File = file;
  try { f = await prepImage(file, { maxSide: 1280, quality: 0.8 }); } catch { f = file; }
  if (f.size > 5 * 1024 * 1024) return { ok: false, reason: 'too_big' };
  const uid = await myId();
  if (!uid) return { ok: false, reason: 'sign_in' };
  const ct = String(f.type || '').startsWith('image/') ? f.type : 'image/jpeg';
  const ext = ct === 'image/png' ? 'png' : ct === 'image/webp' ? 'webp' : 'jpg';
  const name = Date.now() + '-' + rand() + '.' + ext;
  const tries: Array<[string, string]> = [['shop-assets', storeId + '/product_' + name], ['listings', 'marketplace/' + uid + '/corp-' + name]];
  let last = '';
  for (const [bucket, path] of tries) {
    try {
      const { error } = await supabase.storage.from(bucket).upload(path, f, { contentType: ct, upsert: false, cacheControl: '31536000' });
      if (error) { last = String((error as { message?: string }).message || error); continue; }
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      if (data && data.publicUrl) return { ok: true, url: data.publicUrl };
    } catch (e) {
      last = String((e as Error)?.message || e);
    }
  }
  return { ok: false, reason: /failed to fetch|network/i.test(last) ? 'network' : 'upload_failed', detail: last };
}
// BAMBEH_END_TOKEN__CORP_REVIEW_FIX833__COMPLETE
