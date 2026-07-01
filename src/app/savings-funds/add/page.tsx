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
import { addSavingsFund } from "@/app/actions/savingsFundActions";
import { SavingsFundForm } from "@/components/savings-funds/SavingsFundForm";
import { SavingsFundFormSchemaType } from "@/components/savings-funds/form/SavingsFundFormSchema";
import { FormPageLayout } from "@/components/layout/FormPageLayout";
import { useTranslations } from "@/contexts/LanguageContext";

export default function AddSavingsFundPage() {
  const router = useRouter();
  const { user, dbUser } = useAuth();
  const { toast } = useToast();
  const { translations } = useTranslations();

  const handleFormSubmit = async (values: SavingsFundFormSchemaType) => {
    if (!dbUser) {
      toast({ title: translations.errorTitle, description: "You must be logged in to perform this action.", variant: "destructive" });
      return;
    }

    // Convert Date to ISO string for the action
    const formattedValues = {
      name: values.name,
      description: values.description,
      targetAmount: values.targetAmount,
      targetDate: values.targetDate ? values.targetDate.toISOString() : undefined,
    };

    const result = await addSavingsFund(formattedValues as any);

    if (result && 'error' in result) {
      toast({ title: translations.errorTitle, description: result.error, variant: "destructive" });
    } else {
      toast({ title: translations.savingsFundAddedSuccess });
      router.push("/savings-funds");
    }
  };

  return (
    <FormPageLayout title={translations.newSavingsFund} backHref="/savings-funds">
      <SavingsFundForm
        onSubmit={handleFormSubmit}
        onClose={() => router.push("/savings-funds")}
      />
    </FormPageLayout>
  );
}
