/**
 * src/components/TermsAndConditions.tsx
 * Bambeh Marketplace â€” Terms & Conditions Display Component
 * Â© 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useState } from "react";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";

interface Section {
  title: string;
  content: string;
}

const SECTIONS: Section[] = [
  {
    title: "1. Acceptation des conditions",
    content:
      "En utilisant Bambeh Marketplace, vous acceptez d'Ãªtre liÃ© par les prÃ©sentes Conditions GÃ©nÃ©rales d'Utilisation. Si vous n'acceptez pas ces conditions, vous ne pouvez pas utiliser nos services.",
  },
  {
    title: "2. Description du service",
    content:
      "Bambeh Marketplace est une plateforme de mise en relation entre acheteurs et vendeurs au Cameroun. Nous facilitons les transactions via Mobile Money (MTN MoMo, Orange Money) et notre systÃ¨me de paiement sÃ©curisÃ© NotchPay.",
  },
  {
    title: "3. Inscription et compte",
    content:
      "Vous devez avoir au moins 18 ans pour crÃ©er un compte. Vous Ãªtes responsable de maintenir la confidentialitÃ© de vos identifiants et de toutes les activitÃ©s sur votre compte.",
  },
  {
    title: "4. Politique de paiement",
    content:
      "Bambeh prÃ©lÃ¨ve une commission de 1% sur chaque transaction. Les paiements sont traitÃ©s de maniÃ¨re sÃ©curisÃ©e via NotchPay. En cas de litige, notre systÃ¨me d'escrow protÃ¨ge les fonds jusqu'Ã  la rÃ©solution.",
  },
  {
    title: "5. RÃ¨gles des annonces",
    content:
      "Toutes les annonces doivent Ãªtre vÃ©ridiques et lÃ©gales. Il est interdit de publier des produits contrefaits, illicites, ou trompeurs. Bambeh se rÃ©serve le droit de supprimer toute annonce non conforme.",
  },
  {
    title: "6. PropriÃ©tÃ© intellectuelle",
    content:
      "Tout contenu publiÃ© sur Bambeh reste la propriÃ©tÃ© de son crÃ©ateur. En publiant du contenu, vous accordez Ã  Bambeh une licence non exclusive pour l'afficher et le promouvoir sur la plateforme.",
  },
  {
    title: "7. ConfidentialitÃ©",
    content:
      "Nous collectons uniquement les donnÃ©es nÃ©cessaires au fonctionnement du service. Nous ne vendons jamais vos donnÃ©es Ã  des tiers. Voir notre Politique de ConfidentialitÃ© complÃ¨te pour plus de dÃ©tails.",
  },
  {
    title: "8. Limitation de responsabilitÃ©",
    content:
      "Bambeh agit comme intermÃ©diaire. Nous ne sommes pas responsables des transactions entre utilisateurs. Cependant, notre Ã©quipe de rÃ©solution des litiges est disponible pour aider en cas de problÃ¨me.",
  },
  {
    title: "9. Modifications",
    content:
      "Bambeh peut modifier ces conditions Ã  tout moment. Les utilisateurs seront notifiÃ©s par e-mail et via l'application. L'utilisation continue du service aprÃ¨s notification vaut acceptation des nouvelles conditions.",
  },
  {
    title: "10. Droit applicable",
    content:
      "Ces conditions sont rÃ©gies par le droit camerounais. Tout litige sera soumis Ã  la juridiction des tribunaux compÃ©tents de YaoundÃ©, Cameroun.",
  },
];

interface TermsAndConditionsProps {
  compact?: boolean;
  showAcceptButton?: boolean;
  onAccept?: () => void;
  className?: string;
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({
  compact = false,
  showAcceptButton = false,
  onAccept,
  className = "",
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(compact ? null : 0);

  const toggleSection = (idx: number) => {
    setExpandedIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {!compact && (
        <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
          <FileText className="w-5 h-5 text-teal-600" />
          <h2 className="text-lg font-bold text-gray-900">
            Conditions GÃ©nÃ©rales d'Utilisation
          </h2>
        </div>
      )}

      <div className="space-y-2">
        {SECTIONS.map((section, idx) => (
          <div
            key={idx}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <button
              type="button"
              onClick={() => toggleSection(idx)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors text-left"
            >
              <span className="text-sm font-medium text-gray-800">{section.title}</span>
              {expandedIndex === idx ? (
                <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
              )}
            </button>

            {expandedIndex === idx && (
              <div className="px-4 pb-4 pt-1 bg-gray-50">
                <p className="text-sm text-gray-600 leading-relaxed">{section.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {showAcceptButton && onAccept && (
        <button
          type="button"
          onClick={onAccept}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors mt-4"
        >
          J'accepte les conditions
        </button>
      )}
    </div>
  );
};

export default TermsAndConditions;
