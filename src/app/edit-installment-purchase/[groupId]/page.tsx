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
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getInstallmentPurchaseByGroupId, updateInstallmentPurchase } from "@/app/actions/transactions";
import { getCategories } from "@/app/actions/categoryActions";
import { getPaymentMethods } from "@/app/actions/paymentMethodActions";
import { FormPageLayout } from "@/components/layout/FormPageLayout";
import { EditPageLoader } from "@/components/common/EditPageLoader";
import { useTranslations } from "@/contexts/LanguageContext";
import type { Transaction, Category, PaymentMethod, TransactionFormValues } from "@/types";

export default function EditInstallmentPurchasePage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { translations } = useTranslations();

  const [purchase, setPurchase] = useState<Partial<Transaction> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const groupId = params.groupId as string;

  useEffect(() => {
    if (!groupId || !user) return;

    async function fetchData() {
      if (!user) return; // Additional check for TypeScript
      setIsLoading(true);
      try {
        const [fetchedPurchase, userCategories, userPaymentMethods] = await Promise.all([
          getInstallmentPurchaseByGroupId(groupId),
          getCategories(),
          getPaymentMethods(),
        ]);

        if (fetchedPurchase) {
          setPurchase(fetchedPurchase);
          setCategories(userCategories);
          setPaymentMethods(userPaymentMethods);
        } else {
          toast({ title: translations.errorTitle, description: "Installment purchase not found.", variant: "destructive" });
          router.push('/dashboard');
        }
      } catch (error) {
        toast({ title: translations.errorTitle, description: "Failed to load purchase data.", variant: "destructive" });
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [groupId, user, router, toast, translations]);

  const handleFormSubmit = async (values: TransactionFormValues) => {
    if (!user || !purchase?.groupId) return;

    // Convert date string to Date object for the action
    const formattedValues = {
      ...values,
      date: new Date(values.date),
    };

    const result = await updateInstallmentPurchase(purchase.groupId, formattedValues);

    if (result.success) {
      toast({ title: translations.transactionUpdatedTitle, description: "The installment purchase has been successfully updated." });
      router.push('/dashboard');
    } else {
      toast({ title: translations.errorTitle, description: result.error, variant: "destructive" });
    }
  };

  if (isLoading || !purchase) {
    return <EditPageLoader />;
  }

  return (
    <FormPageLayout title={translations.editTransaction} backHref="/dashboard">
      <TransactionForm
        onSubmit={handleFormSubmit}
        onClose={() => router.back()}
        initialData={purchase as Transaction}
        categories={categories}
        paymentMethods={paymentMethods}
      />
    </FormPageLayout>
  );
}
