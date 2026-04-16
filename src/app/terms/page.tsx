
"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useTranslations } from "@/contexts/LanguageContext"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
  const { translations } = useTranslations()

  if (!translations) return null;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl min-h-screen">
      <Card className="shadow-lg border-primary/20 bg-card/50 backdrop-blur-sm">
        <CardHeader className="border-b pb-6 mb-6">
          <CardTitle className="text-3xl font-bold text-primary">
            {translations.termsAndConditions || "Términos y Condiciones"}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {translations.termsLastUpdated?.replace("{date}", "15/04/2026") || "Última actualización: 15/04/2026"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 text-muted-foreground leading-relaxed pb-10">
          <section className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground">
              {translations.termsAcceptance}
            </h3>
            <p>{translations.termsAcceptanceText}</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground">
              {translations.termsServiceDescription}
            </h3>
            <p>{translations.termsServiceDescriptionText}</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground">
              {translations.termsPrivacyAndData}
            </h3>
            <p>{translations.termsPrivacyAndDataText}</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground">
              {translations.termsLimitationOfLiability}
            </h3>
            <p>{translations.termsLimitationOfLiabilityText}</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground">
              {translations.termsIntellectualProperty}
            </h3>
            <p>{translations.termsIntellectualPropertyText}</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground">
              {translations.termsChangesAndTermination}
            </h3>
            <p>{translations.termsChangesAndTerminationText}</p>
          </section>

          <div className="pt-6 border-t">
            <Link href="/" passHref>
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                {translations.back || "Volver"}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
