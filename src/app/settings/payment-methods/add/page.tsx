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

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { addPaymentMethod } from "@/app/actions/paymentMethodActions";
import { PaymentMethodForm } from "@/components/settings/PaymentMethodForm";
import type { PaymentMethodFormValues } from "@/types";
import { FormPageLayout } from "@/components/layout/FormPageLayout";
import { useTranslations } from "@/contexts/LanguageContext";
import React from "react";

export default function AddPaymentMethodPage() {
  const router = useRouter();
  const { user, dbUser } = useAuth();
  const { toast } = useToast();
  const { translations } = useTranslations();

  const handleFormSubmit = async (values: PaymentMethodFormValues) => {
    if (!dbUser) {
      toast({ title: translations.errorTitle, description: "You must be logged in to perform this action.", variant: "destructive" });
      return;
    }

    const result = await addPaymentMethod(values);

    if (result && 'error' in result) {
      toast({ title: translations.errorTitle, description: result.error, variant: "destructive" });
    } else {
      toast({ title: translations.paymentMethodAddedSuccess });
      router.push("/settings/payment-methods");
    }
  };

  return (
    <FormPageLayout title={translations.newPaymentMethod} backHref="/settings/payment-methods">
      <PaymentMethodForm
        onSubmit={handleFormSubmit}
        onClose={() => router.push("/settings/payment-methods")}
      />
    </FormPageLayout>
  );
}
