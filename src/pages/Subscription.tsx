import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default function Subscription() {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{t("Subscription")}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
