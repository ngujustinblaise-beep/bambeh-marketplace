// BAMBEH_DEPLOY_TOKEN__FARMTEXT_FIX863_CLEAN
// FILE LOCATION: src/features/farm/farmText.ts
//
// FIX863 - the words of the Farm Fresh pages (FIX866 list, FIX867 product page), in the five app languages.
// Short labels on the screens where people act; the longer words are folded away (25 Oct 2026).
// One place for them, so the list, the product page and the tests can never disagree. Prices and categories come
// from the database; the category FILTER values stay the English words the seller page writes.
// Every non-English character is a \u escape.
// (c) 2026 BAMBEH SARL. All rights reserved.

export type FarmLang = 'en' | 'fr' | 'pidgin' | 'ar' | 'ff';

export function farmLang(raw: unknown): FarmLang {
  const v = String(raw ?? 'en').toLowerCase();
  if (v === 'fr' || v.indexOf('fr-') === 0) return 'fr';
  if (v === 'pidgin' || v === 'pcm') return 'pidgin';
  if (v === 'ar' || v.indexOf('ar-') === 0) return 'ar';
  if (v === 'ff' || v === 'ful' || v === 'fulfulde') return 'ff';
  return 'en';
}

export type FarmKey =
  | 'title' | 'sell' | 'search' | 'clearSearch' | 'oneProduct' | 'manyProducts' | 'organic' | 'soldOut' | 'left'
  | 'verified' | 'cart' | 'emptyTitle' | 'emptyBody' | 'noMatch' | 'showAll' | 'loadErr' | 'retry' | 'loading' | 'back'
  | 'share' | 'copied' | 'shareText' | 'shareWhatsApp' | 'copyLink' | 'close' | 'harvested' | 'about' | 'farmer'
  | 'message' | 'protectTitle' | 'protect1' | 'protect2' | 'protect3' | 'moreFarmer' | 'similar' | 'qty' | 'total'
  | 'feesNote' | 'buyNow' | 'addCart' | 'inCart' | 'viewCart' | 'notFound' | 'notFoundBody' | 'seeAll' | 'deliveryYes'
  | 'deliveryNo' | 'yours' | 'less' | 'more' | 'photo' | 'ctaTitle' | 'ctaBody' | 'rateFarmer' | 'noRatings'
  | 'trustLine';

export const FARM_STR: Record<FarmLang, Record<FarmKey, string>> = {
  en: {
    title: 'Farm Fresh',
    sell: 'Sell your harvest',
    search: 'Search tomatoes, plantain, a town...',
    clearSearch: 'Clear the search',
    oneProduct: '1 product', manyProducts: '{n} products',
    organic: 'Organic', soldOut: 'Sold out', left: '{n} {unit} left', verified: 'Verified farmer',
    cart: 'Cart ({n})',
    emptyTitle: 'No produce here yet',
    emptyBody: 'Farmers put their harvest here. Be the first in your area.',
    noMatch: 'Nothing matches \u201c{q}\u201d.', showAll: 'Show everything',
    loadErr: 'Farm Fresh could not load. Check your connection and try again.', retry: 'Try again',
    loading: 'Loading the harvest...',
    back: 'Back', share: 'Share', copied: 'Link copied',
    shareText: 'Fresh on Bambeh Farm Fresh: {title}, {price} / {unit}.',
    shareWhatsApp: 'Share on WhatsApp', copyLink: 'Copy the link', close: 'Close',
    harvested: 'Harvested {date}',
    about: 'About this produce', farmer: 'The farmer', message: 'Message the farmer',
    protectTitle: 'How Bambeh protects you',
    protect1: 'You pay with Bambeh Secured Pay. The money is held - the farmer is not paid yet.',
    protect2: 'The farmer delivers, or you collect. Check the produce.',
    protect3: 'Confirm you received it and the farmer is paid. A problem? Open a claim in My orders before you confirm, within 48 hours. If Bambeh accepts it, the price of the produce comes back to you.',
    moreFarmer: 'More from {farmer}', similar: 'Similar produce',
    qty: 'Quantity', total: '{n} {unit}', feesNote: 'Bambeh\u2019s 1% commission and the payment charge are added at checkout.',
    buyNow: 'Buy now', addCart: 'Add to cart', inCart: 'Added to your cart', viewCart: 'View cart',
    notFound: 'This produce is no longer for sale', notFoundBody: 'The farmer may have sold it or taken it down.',
    seeAll: 'See all Farm Fresh',
    deliveryYes: 'The farmer can deliver', deliveryNo: 'Collect it from the farmer',
    yours: 'This is your own produce. Buyers see it like this.',
    less: 'One less', more: 'One more', photo: 'Photo {n} of {total}',
    ctaTitle: 'Do you farm?',
    ctaBody: 'Put your harvest on Bambeh and sell straight to buyers. Bambeh Secured Pay pays you once the buyer confirms they received it.',
    rateFarmer: 'Rate this farmer',
    noRatings: 'No ratings yet',
    trustLine: 'User Protection: the farmer is paid only after you confirm you received it.',
  },
  fr: {
    title: 'Produits de la ferme',
    sell: 'Vendre votre r\u00e9colte',
    search: 'Tomates, plantain, une ville...',
    clearSearch: 'Effacer la recherche',
    oneProduct: '1 produit', manyProducts: '{n} produits',
    organic: 'Bio', soldOut: '\u00c9puis\u00e9', left: 'Reste {n} {unit}', verified: 'Agriculteur v\u00e9rifi\u00e9',
    cart: 'Panier ({n})',
    emptyTitle: 'Pas encore de produits ici',
    emptyBody: 'Les agriculteurs publient leur r\u00e9colte ici. Soyez le premier de votre r\u00e9gion.',
    noMatch: 'Rien ne correspond \u00e0 \u00ab {q} \u00bb.', showAll: 'Tout afficher',
    loadErr: 'Impossible de charger les produits. V\u00e9rifiez votre connexion et r\u00e9essayez.', retry: 'R\u00e9essayer',
    loading: 'Chargement de la r\u00e9colte...',
    back: 'Retour', share: 'Partager', copied: 'Lien copi\u00e9',
    shareText: 'Frais sur Bambeh Farm Fresh : {title}, {price} / {unit}.',
    shareWhatsApp: 'Partager sur WhatsApp', copyLink: 'Copier le lien', close: 'Fermer',
    harvested: 'R\u00e9colt\u00e9 le {date}',
    about: '\u00c0 propos de ce produit', farmer: 'L\u2019agriculteur', message: '\u00c9crire \u00e0 l\u2019agriculteur',
    protectTitle: 'Comment Bambeh vous prot\u00e8ge',
    protect1: 'Vous payez avec Bambeh Secured Pay. L\u2019argent est gard\u00e9 : l\u2019agriculteur n\u2019est pas encore pay\u00e9.',
    protect2: 'L\u2019agriculteur livre, ou vous r\u00e9cup\u00e9rez. V\u00e9rifiez le produit.',
    protect3: 'Confirmez la r\u00e9ception et l\u2019agriculteur est pay\u00e9. Un probl\u00e8me ? Ouvrez une r\u00e9clamation dans Mes commandes avant de confirmer, dans les 48 heures. Si Bambeh l\u2019accepte, le prix du produit vous revient.',
    moreFarmer: 'Autres produits de {farmer}', similar: 'Produits semblables',
    qty: 'Quantit\u00e9', total: '{n} {unit}', feesNote: 'La commission de 1 % de Bambeh et les frais de paiement s\u2019ajoutent au paiement.',
    buyNow: 'Acheter', addCart: 'Ajouter au panier', inCart: 'Ajout\u00e9 au panier', viewCart: 'Voir le panier',
    notFound: 'Ce produit n\u2019est plus en vente', notFoundBody: 'L\u2019agriculteur l\u2019a peut-\u00eatre vendu ou retir\u00e9.',
    seeAll: 'Voir tous les produits',
    deliveryYes: 'L\u2019agriculteur peut livrer', deliveryNo: '\u00c0 r\u00e9cup\u00e9rer chez l\u2019agriculteur',
    yours: 'C\u2019est votre propre produit. Les acheteurs le voient ainsi.',
    less: 'Un de moins', more: 'Un de plus', photo: 'Photo {n} sur {total}',
    ctaTitle: 'Vous cultivez ?',
    ctaBody: 'Publiez votre r\u00e9colte sur Bambeh et vendez directement aux acheteurs. Bambeh Secured Pay vous paie d\u00e8s que l\u2019acheteur confirme la r\u00e9ception.',
    rateFarmer: 'Noter cet agriculteur',
    noRatings: 'Pas encore de note',
    trustLine: 'Protection des utilisateurs : l\u2019agriculteur n\u2019est pay\u00e9 qu\u2019apr\u00e8s votre confirmation de r\u00e9ception.',
  },
  pidgin: {
    title: 'Farm Fresh',
    sell: 'Sell your harvest',
    search: 'Find tomato, plantain, one town...',
    clearSearch: 'Clear the search',
    oneProduct: '1 thing', manyProducts: '{n} things',
    organic: 'Organic', soldOut: 'E don finish', left: '{n} {unit} remain', verified: 'Farmer wey Bambeh check',
    cart: 'Cart ({n})',
    emptyTitle: 'Nothing dey here yet',
    emptyBody: 'Farmer dem dey put their harvest here. Be the first for your area.',
    noMatch: 'Nothing match \u201c{q}\u201d.', showAll: 'Show everything',
    loadErr: 'Farm Fresh no fit load. Check your network make you try again.', retry: 'Try again',
    loading: 'The harvest dey load...',
    back: 'Go back', share: 'Share', copied: 'Link don copy',
    shareText: 'Fresh for Bambeh Farm Fresh: {title}, {price} / {unit}.',
    shareWhatsApp: 'Share for WhatsApp', copyLink: 'Copy the link', close: 'Close',
    harvested: 'Dem harvest am {date}',
    about: 'About this food', farmer: 'The farmer', message: 'Message the farmer',
    protectTitle: 'How Bambeh dey protect you',
    protect1: 'You pay with Bambeh Secured Pay. The money dey hold - farmer never collect am yet.',
    protect2: 'Farmer go deliver, or you go collect. Check the food.',
    protect3: 'Confirm say you don collect am and the farmer go get him money. Wahala dey? Open claim for My orders before you confirm, inside 48 hours. If Bambeh accept am, the price of the food go come back to you.',
    moreFarmer: 'More from {farmer}', similar: 'Food wey resemble am',
    qty: 'How many', total: '{n} {unit}', feesNote: 'Bambeh 1% commission and the payment charge go join when you dey pay.',
    buyNow: 'Buy now', addCart: 'Put for cart', inCart: 'E don enter your cart', viewCart: 'See the cart',
    notFound: 'This food no dey for sale again', notFoundBody: 'Maybe the farmer don sell am or remove am.',
    seeAll: 'See all Farm Fresh',
    deliveryYes: 'Farmer fit deliver', deliveryNo: 'Collect am from the farmer',
    yours: 'Na your own food be this. Na so buyers dey see am.',
    less: 'Remove one', more: 'Add one', photo: 'Photo {n} for {total}',
    ctaTitle: 'You be farmer?',
    ctaBody: 'Put your harvest for Bambeh and sell straight to buyer dem. Bambeh Secured Pay go pay you when the buyer confirm say e don collect.',
    rateFarmer: 'Rate this farmer',
    noRatings: 'No rating yet',
    trustLine: 'User Protection: farmer go collect money only after you confirm say you don receive am.',
  },
  ar: {
    title: '\u0645\u0646\u062a\u062c\u0627\u062a \u0627\u0644\u0645\u0632\u0631\u0639\u0629',
    sell: '\u0628\u0650\u0639 \u0645\u062d\u0635\u0648\u0644\u0643',
    search: '\u0627\u0628\u062d\u062b: \u0637\u0645\u0627\u0637\u0645\u060c \u0645\u0648\u0632 \u0627\u0644\u0637\u0628\u062e\u060c \u0645\u062f\u064a\u0646\u0629...',
    clearSearch: '\u0627\u0645\u0633\u062d \u0627\u0644\u0628\u062d\u062b',
    oneProduct: '\u0645\u0646\u062a\u062c \u0648\u0627\u062d\u062f', manyProducts: '{n} \u0645\u0646\u062a\u062c\u0627\u062a',
    organic: '\u0639\u0636\u0648\u064a', soldOut: '\u0646\u0641\u062f',
    left: '\u0628\u0642\u064a {n} {unit}', verified: '\u0645\u0632\u0627\u0631\u0639 \u0645\u0648\u062b\u0651\u0642',
    cart: '\u0627\u0644\u0633\u0644\u0629 ({n})',
    emptyTitle: '\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0646\u062a\u062c\u0627\u062a \u0647\u0646\u0627 \u0628\u0639\u062f',
    emptyBody: '\u064a\u0636\u0639 \u0627\u0644\u0645\u0632\u0627\u0631\u0639\u0648\u0646 \u0645\u062d\u0635\u0648\u0644\u0647\u0645 \u0647\u0646\u0627. \u0643\u0646 \u0627\u0644\u0623\u0648\u0644 \u0641\u064a \u0645\u0646\u0637\u0642\u062a\u0643.',
    noMatch: '\u0644\u0627 \u0634\u064a\u0621 \u064a\u0637\u0627\u0628\u0642 \u00ab{q}\u00bb.', showAll: '\u0627\u0639\u0631\u0636 \u0627\u0644\u0643\u0644',
    loadErr: '\u062a\u0639\u0630\u0651\u0631 \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a. \u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u062a\u0635\u0627\u0644\u0643 \u0648\u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.',
    retry: '\u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649',
    loading: '\u062c\u0627\u0631\u064d \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0645\u062d\u0635\u0648\u0644...',
    back: '\u0631\u062c\u0648\u0639', share: '\u0645\u0634\u0627\u0631\u0643\u0629', copied: '\u062a\u0645 \u0646\u0633\u062e \u0627\u0644\u0631\u0627\u0628\u0637',
    shareText: '\u0637\u0627\u0632\u062c \u0639\u0644\u0649 Bambeh Farm Fresh: {title}\u060c {price} / {unit}.',
    shareWhatsApp: '\u0645\u0634\u0627\u0631\u0643\u0629 \u0639\u0644\u0649 \u0648\u0627\u062a\u0633\u0627\u0628', copyLink: '\u0627\u0646\u0633\u062e \u0627\u0644\u0631\u0627\u0628\u0637', close: '\u0625\u063a\u0644\u0627\u0642',
    harvested: '\u062d\u064f\u0635\u062f \u0641\u064a {date}',
    about: '\u0639\u0646 \u0647\u0630\u0627 \u0627\u0644\u0645\u0646\u062a\u062c', farmer: '\u0627\u0644\u0645\u0632\u0627\u0631\u0639',
    message: '\u0631\u0627\u0633\u0644 \u0627\u0644\u0645\u0632\u0627\u0631\u0639',
    protectTitle: '\u0643\u064a\u0641 \u062a\u062d\u0645\u064a\u0643 Bambeh',
    protect1: '\u062a\u062f\u0641\u0639 \u0639\u0628\u0631 Bambeh Secured Pay. \u064a\u064f\u062d\u062a\u0641\u0638 \u0628\u0627\u0644\u0645\u0627\u0644 \u0648\u0644\u0627 \u064a\u064f\u062f\u0641\u0639 \u0644\u0644\u0645\u0632\u0627\u0631\u0639 \u0628\u0639\u062f.',
    protect2: '\u064a\u0648\u0635\u0651\u0644 \u0627\u0644\u0645\u0632\u0627\u0631\u0639 \u0627\u0644\u0645\u0646\u062a\u062c \u0623\u0648 \u062a\u0633\u062a\u0644\u0645\u0647 \u0628\u0646\u0641\u0633\u0643. \u062a\u062d\u0642\u0651\u0642 \u0645\u0646\u0647.',
    protect3: '\u0623\u0643\u0651\u062f \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645 \u0641\u064a\u064f\u062f\u0641\u0639 \u0644\u0644\u0645\u0632\u0627\u0631\u0639. \u0647\u0644 \u0647\u0646\u0627\u0643 \u0645\u0634\u0643\u0644\u0629\u061f \u0627\u0641\u062a\u062d \u0634\u0643\u0648\u0649 \u0641\u064a \u0637\u0644\u0628\u0627\u062a\u064a \u0642\u0628\u0644 \u0627\u0644\u062a\u0623\u0643\u064a\u062f\u060c \u062e\u0644\u0627\u0644 48 \u0633\u0627\u0639\u0629. \u0625\u0630\u0627 \u0642\u0628\u0644\u062a\u0647\u0627 Bambeh \u064a\u0639\u0648\u062f \u0625\u0644\u064a\u0643 \u0633\u0639\u0631 \u0627\u0644\u0645\u0646\u062a\u062c.',
    moreFarmer: '\u0627\u0644\u0645\u0632\u064a\u062f \u0645\u0646 {farmer}', similar: '\u0645\u0646\u062a\u062c\u0627\u062a \u0645\u0634\u0627\u0628\u0647\u0629',
    qty: '\u0627\u0644\u0643\u0645\u064a\u0629', total: '{n} {unit}',
    feesNote: '\u062a\u064f\u0636\u0627\u0641 \u0639\u0645\u0648\u0644\u0629 Bambeh \u0628\u0646\u0633\u0628\u0629 1% \u0648\u0631\u0633\u0648\u0645 \u0627\u0644\u062f\u0641\u0639 \u0639\u0646\u062f \u0627\u0644\u062f\u0641\u0639.',
    buyNow: '\u0627\u0634\u062a\u0631 \u0627\u0644\u0622\u0646', addCart: '\u0623\u0636\u0641 \u0625\u0644\u0649 \u0627\u0644\u0633\u0644\u0629',
    inCart: '\u0623\u064f\u0636\u064a\u0641 \u0625\u0644\u0649 \u0633\u0644\u062a\u0643', viewCart: '\u0627\u0639\u0631\u0636 \u0627\u0644\u0633\u0644\u0629',
    notFound: '\u0647\u0630\u0627 \u0627\u0644\u0645\u0646\u062a\u062c \u0644\u0645 \u064a\u0639\u062f \u0644\u0644\u0628\u064a\u0639',
    notFoundBody: '\u0631\u0628\u0645\u0627 \u0628\u0627\u0639\u0647 \u0627\u0644\u0645\u0632\u0627\u0631\u0639 \u0623\u0648 \u0623\u0632\u0627\u0644\u0647.',
    seeAll: '\u0643\u0644 \u0645\u0646\u062a\u062c\u0627\u062a \u0627\u0644\u0645\u0632\u0631\u0639\u0629',
    deliveryYes: '\u064a\u0645\u0643\u0646 \u0644\u0644\u0645\u0632\u0627\u0631\u0639 \u0627\u0644\u062a\u0648\u0635\u064a\u0644',
    deliveryNo: '\u062a\u0633\u062a\u0644\u0645\u0647 \u0645\u0646 \u0627\u0644\u0645\u0632\u0627\u0631\u0639',
    yours: '\u0647\u0630\u0627 \u0645\u0646\u062a\u062c\u0643. \u0647\u0643\u0630\u0627 \u064a\u0631\u0627\u0647 \u0627\u0644\u0645\u0634\u062a\u0631\u0648\u0646.',
    less: '\u0648\u0627\u062d\u062f \u0623\u0642\u0644', more: '\u0648\u0627\u062d\u062f \u0623\u0643\u062b\u0631', photo: '\u0627\u0644\u0635\u0648\u0631\u0629 {n} \u0645\u0646 {total}',
    ctaTitle: '\u0647\u0644 \u0623\u0646\u062a \u0645\u0632\u0627\u0631\u0639\u061f',
    ctaBody: '\u0636\u0639 \u0645\u062d\u0635\u0648\u0644\u0643 \u0639\u0644\u0649 Bambeh \u0648\u0628\u0650\u0639 \u0645\u0628\u0627\u0634\u0631\u0629 \u0644\u0644\u0645\u0634\u062a\u0631\u064a\u0646. \u064a\u062f\u0641\u0639 \u0644\u0643 Bambeh Secured Pay \u0628\u0639\u062f \u0623\u0646 \u064a\u0624\u0643\u062f \u0627\u0644\u0645\u0634\u062a\u0631\u064a \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645.',
    rateFarmer: '\u0642\u064a\u0651\u0645 \u0647\u0630\u0627 \u0627\u0644\u0645\u0632\u0627\u0631\u0639',
    noRatings: '\u0644\u0627 \u062a\u0648\u062c\u062f \u062a\u0642\u064a\u064a\u0645\u0627\u062a \u0628\u0639\u062f',
    trustLine: '\u062d\u0645\u0627\u064a\u0629 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645: \u0644\u0627 \u064a\u064f\u062f\u0641\u0639 \u0644\u0644\u0645\u0632\u0627\u0631\u0639 \u0625\u0644\u0627 \u0628\u0639\u062f \u0623\u0646 \u062a\u0624\u0643\u062f \u0623\u0646\u0643 \u0627\u0633\u062a\u0644\u0645\u062a.',
  },
  ff: {
    title: 'Ndema Kesa',
    sell: 'Yeeyu ko so\u00f1-\u0257aa',
    search: 'Yiylo tomaat, banaana, wuro...',
    clearSearch: 'Momtu yiylo',
    oneProduct: 'Huunde 1', manyProducts: 'Kuuje {n}',
    organic: 'Ndema laa\u0253ndam', soldOut: 'Gasii', left: '{n} {unit} heddii', verified: 'Demoowo \u01b4eewaa\u0257o',
    cart: 'Panyee ({n})',
    emptyTitle: 'Huunde alaa \u0257oo tawo',
    emptyBody: 'Demoo\u0253e ina mbayyina so\u00f1ngo ma\u0253\u0253e \u0257oo. Wonu gadano e nokku maa.',
    noMatch: 'Alaa ko nanndi e \u201c{q}\u201d.', showAll: 'Hollu fof',
    loadErr: 'Min mbaawaa loowde ge\u0257e. \u01b3eewto seede maa ndeen eto kadi.', retry: 'Eto kadi',
    loading: 'So\u00f1ngo ina loowee...',
    back: 'Rutto', share: 'Rokku', copied: 'Jokkol ngol nattaama',
    shareText: 'Kesum e Bambeh Farm Fresh: {title}, {price} / {unit}.',
    shareWhatsApp: 'Rokku e WhatsApp', copyLink: 'Natto jokkol ngol', close: 'Uddu',
    harvested: 'So\u00f1aama {date}',
    about: 'Fii huunde nde', farmer: 'Demoowo on', message: 'Winndan demoowo on',
    protectTitle: 'No Bambeh reentorta ma',
    protect1: 'A yo\u0253ata e Bambeh Secured Pay. Kaalis on jogaama - demoowo on yo\u0253aaka tawo.',
    protect2: 'Demoowo on nelda, walla a ho\u0253\u0253a. \u01b3eewto huunde nde.',
    protect3: 'Tee\u014btin a he\u0253ii ndeen demoowo on yo\u0253ee. Ca\u0257eele? Uddit \u0257a\u0253\u0253itannde e Yamiroore am hade maa tee\u014btinde, e nder waktuuji 48. So Bambeh ja\u0253ii, coggu huunde nde artoo e maa.',
    moreFarmer: 'Kuuje goo\u0257\u0257e e {farmer}', similar: 'Kuuje nanndu\u0257e',
    qty: 'No foti', total: '{n} {unit}', feesNote: 'Komisiyo\u014b Bambeh 1% e njo\u0253di yo\u0253gol ina \u0253eydoo nde njo\u0253ataa.',
    buyNow: 'Soodu jooni', addCart: 'Naatnu e panyee', inCart: 'Naatii e panyee maa', viewCart: 'Ndaar panyee',
    notFound: 'Huunde nde yeeyetaake kadi', notFoundBody: 'Ma demoowo on yeeyii nde walla itti nde.',
    seeAll: 'Ndaar Ndema Kesa fof',
    deliveryYes: 'Demoowo on ina waawi neldude', deliveryNo: 'Ho\u0253\u0253u nde to demoowo on',
    yours: 'Ko huunde maa nde. Ko non soodoo\u0253e njiyata nde.',
    less: 'Ustu gooto', more: '\u0181eydu gooto', photo: 'Nate {n} e {total}',
    ctaTitle: 'Ada demoowo?',
    ctaBody: 'Bayyin so\u00f1ngo maa e Bambeh, yeeyu e juu\u0257e soodoo\u0253e. Bambeh Secured Pay yo\u0253ete ma so soodoowo on te\u014btinii o he\u0253ii.',
    rateFarmer: 'Hokku njeeygu demoowo on',
    noRatings: 'Haala alaa tawo',
    trustLine: 'Ndeenka huutoroo\u0253e: demoowo on yo\u0253etee tan so a tee\u014btinii a he\u0253ii.',
  },
};/** The category chips: the label in the reader's language; the value is the English word the seller page stores. */
export const FARM_CATEGORIES: { value: string; label: Record<FarmLang, string> }[] = [
  { value: 'All', label: { en: 'All', fr: 'Tout', pidgin: 'All', ar: '\u0627\u0644\u0643\u0644', ff: 'Fof' } },
  { value: 'Vegetables', label: { en: 'Vegetables', fr: 'L\u00e9gumes', pidgin: 'Vegetable', ar: '\u062e\u0636\u0631\u0648\u0627\u062a', ff: 'Ledde \u00f1aametee' } },
  { value: 'Fruits', label: { en: 'Fruits', fr: 'Fruits', pidgin: 'Fruit', ar: '\u0641\u0648\u0627\u0643\u0647', ff: '\u0181i\u0253\u0253e le\u0257\u0257e' } },
  { value: 'Tubers', label: { en: 'Tubers', fr: 'Tubercules', pidgin: 'Tuber', ar: '\u062f\u0631\u0646\u0627\u062a', ff: '\u018aakkeeje' } },
  { value: 'Grains', label: { en: 'Grains', fr: 'C\u00e9r\u00e9ales', pidgin: 'Grain', ar: '\u062d\u0628\u0648\u0628', ff: 'Gawri' } },
  { value: 'Legumes', label: { en: 'Beans and peas', fr: 'L\u00e9gumineuses', pidgin: 'Beans', ar: '\u0628\u0642\u0648\u0644\u064a\u0627\u062a', ff: '\u00d1ebbe' } },
  { value: 'Herbs', label: { en: 'Herbs and spices', fr: 'Herbes et \u00e9pices', pidgin: 'Herb and spice', ar: '\u0623\u0639\u0634\u0627\u0628 \u0648\u062a\u0648\u0627\u0628\u0644', ff: 'Hu\u0257o e kaafaaji' } },
  { value: 'Dairy', label: { en: 'Milk and eggs', fr: 'Lait et \u0153ufs', pidgin: 'Milk and egg', ar: '\u062d\u0644\u064a\u0628 \u0648\u0628\u064a\u0636', ff: 'Kosam e boccoo\u0257e' } },
  { value: 'Other', label: { en: 'Other', fr: 'Autres', pidgin: 'Other ones', ar: '\u0623\u062e\u0631\u0649', ff: 'Goo\u0257\u0257e' } },
];

const UNITS: Record<string, Partial<Record<FarmLang, string>>> = {
  kg: { ar: '\u0643\u063a' }, g: { ar: '\u063a' },
  bunch: { fr: 'botte', ar: '\u062d\u0632\u0645\u0629' }, cob: { fr: '\u00e9pi', ar: '\u0643\u0648\u0632' },
  litre: { ar: '\u0644\u062a\u0631' }, bag: { fr: 'sac', ar: '\u0643\u064a\u0633' },
  crate: { fr: 'cageot', ar: '\u0635\u0646\u062f\u0648\u0642' }, piece: { fr: 'pi\u00e8ce', ar: '\u0642\u0637\u0639\u0629' },
  unit: { fr: 'unit\u00e9', ar: '\u0648\u062d\u062f\u0629' }, basket: { fr: 'panier', ar: '\u0633\u0644\u0629' },
};

/** A unit (kg, bunch, bag...) in the reader's language; one the app does not know is shown as the farmer typed it. */
export function unitLabel(unit: unknown, lang: FarmLang): string {
  const u = String(unit ?? '').trim() || 'unit';
  const m = UNITS[u.toLowerCase()];
  return (m && m[lang]) || u;
}

export function categoryLabel(value: unknown, lang: FarmLang): string {
  const v = String(value ?? '');
  const hit = FARM_CATEGORIES.find((c) => c.value.toLowerCase() === v.toLowerCase());
  return hit ? hit.label[lang] : v;
}

export function farmFill(s: string, vals: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in vals ? String(vals[k]) : m));
}

/** 1500 -> "1 500 F" (the way prices are written in Cameroon). */
export function fcfa(n: unknown): string {
  const v = Math.round(Number(n) || 0);
  return v.toLocaleString('fr-FR').replace(/\u202f|\u00a0/g, ' ') + ' F';
}
// BAMBEH_END_TOKEN__FARMTEXT_FIX863__COMPLETE
