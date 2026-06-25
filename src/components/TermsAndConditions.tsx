/**
 * src/components/TermsAndConditions.tsx
 * Bambeh Marketplace � Terms & Conditions Display Component
 * � 2026 Bambeh Marketplace. All rights reserved.
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
      "En utilisant Bambeh Marketplace, vous acceptez d'�tre li� par les pr�sentes Conditions G�n�rales d'Utilisation. Si vous n'acceptez pas ces conditions, vous ne pouvez pas utiliser nos services.",
  },
  {
    title: "2. Description du service",
    content:
      "Bambeh Marketplace est une plateforme de mise en relation entre acheteurs et vendeurs au Cameroun. Nous facilitons les transactions via Mobile Money (MTN MoMo, Orange Money) et notre syst�me de paiement s�curis� NotchPay.",
  },
  {
    title: "3. Inscription et compte",
    content:
      "Vous devez avoir au moins 18 ans pour cr�er un compte. Vous �tes responsable de maintenir la confidentialit� de vos identifiants et de toutes les activit�s sur votre compte.",
  },
  {
    title: "4. Politique de paiement",
    content:
      "Bambeh pr�l�ve une commission de 1% sur chaque transaction. Les paiements sont trait�s de mani�re s�curis�e via NotchPay. En cas de litige, notre syst�me d'escrow prot�ge les fonds jusqu'� la r�solution.",
  },
  {
    title: "5. R�gles des annonces",
    content:
      "Toutes les annonces doivent �tre v�ridiques et l�gales. Il est interdit de publier des produits contrefaits, illicites, ou trompeurs. Bambeh se r�serve le droit de supprimer toute annonce non conforme.",
  },
  {
    title: "6. Propri�t� intellectuelle",
    content:
      "Tout contenu publi� sur Bambeh reste la propri�t� de son cr�ateur. En publiant du contenu, vous accordez � Bambeh une licence non exclusive pour l'afficher et le promouvoir sur la plateforme.",
  },
  {
    title: "7. Confidentialit�",
    content:
      "Nous collectons uniquement les donn�es n�cessaires au fonctionnement du service. Nous ne vendons jamais vos donn�es � des tiers. Voir notre Politique de Confidentialit� compl�te pour plus de d�tails.",
  },
  {
    title: "8. Limitation de responsabilit�",
    content:
      "Bambeh agit comme interm�diaire. Nous ne sommes pas responsables des transactions entre utilisateurs. Cependant, notre �quipe de r�solution des litiges est disponible pour aider en cas de probl�me.",
  },
  {
    title: "9. Modifications",
    content:
      "Bambeh peut modifier ces conditions � tout moment. Les utilisateurs seront notifi�s par e-mail et via l'application. L'utilisation continue du service apr�s notification vaut acceptation des nouvelles conditions.",
  },
  {
    title: "10. Droit applicable",
    content:
      "Ces conditions sont r�gies par le droit camerounais. Tout litige sera soumis � la juridiction des tribunaux comp�tents de Yaound�, Cameroun.",
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
            Conditions G�n�rales d'Utilisation
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





