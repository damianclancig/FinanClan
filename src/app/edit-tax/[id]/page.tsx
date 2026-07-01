"use client";

/*
 * Copyright 2026 Clancig FullstackWeb
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useRouter, useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getTaxById, updateTax, getUniqueTaxNames } from "@/app/actions/taxActions";
import { isErrorResponse } from "@/lib/error-types";
import { FormPageLayout } from "@/components/layout/FormPageLayout";
import { EditPageLoader } from "@/components/common/EditPageLoader";
import { useTranslations } from "@/contexts/LanguageContext";
import type { Tax } from "@/types";
import { TaxForm } from "@/components/taxes/TaxForm";
import { TaxFormSchemaType } from "@/components/taxes/form/TaxFormSchema";

export default function EditTaxPage() {
  const router = useRouter();
  const params = useParams();
  const { user, dbUser } = useAuth();
  const { toast } = useToast();
  const { translations } = useTranslations();

  const [tax, setTax] = useState<Tax | null>(null);
  const [taxNames, setTaxNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const id = params.id as string;

  useEffect(() => {
    if (!id || !user) return;

    async function fetchData() {
      if (!dbUser) return; // Additional check for TypeScript
      setIsLoading(true);
      try {
        const [taxResult, namesResult] = await Promise.all([
          getTaxById(id, translations),
          getUniqueTaxNames()
        ]);

        if (isErrorResponse(taxResult)) {
          toast({ title: translations.errorTitle, description: taxResult.error, variant: "destructive" });
          router.push("/taxes");
          return;
        }

        if (taxResult.isPaid) {
          toast({ title: translations.errorTitle, description: translations.paidTaxEditError, variant: "destructive" });
          router.push("/taxes");
          return;
        }

        setTax(taxResult);

        if (isErrorResponse(namesResult)) {
          console.error('Error loading tax names:', namesResult.error);
          setTaxNames([]);
        } else {
          setTaxNames(namesResult.filter(name => name !== taxResult.name));
        }
      } catch (error) {
        toast({ title: translations.errorTitle, description: "Failed to load tax data.", variant: "destructive" });
        router.push("/taxes");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id, dbUser, router, toast, translations]);

  const handleFormSubmit = async (values: TaxFormSchemaType) => {
    if (!dbUser || !tax) return;

    const result = await updateTax(tax.id, {
      name: values.name,
      amount: values.amount,
      month: values.month,
      year: values.year,
    }, translations);

    if (isErrorResponse(result)) {
      toast({ title: translations.errorTitle, description: result.error, variant: "destructive" });
    } else {
      toast({ title: translations.taxUpdatedSuccess });
      router.push("/taxes");
    }
  };

  if (isLoading || !tax) {
    return <EditPageLoader />;
  }

  return (
    <FormPageLayout title={translations.editTax} backHref="/taxes">
      <TaxForm
        onSubmit={handleFormSubmit}
        onClose={() => router.push("/taxes")}
        initialData={tax}
        existingTaxNames={taxNames}
      />
    </FormPageLayout>
  );
}
