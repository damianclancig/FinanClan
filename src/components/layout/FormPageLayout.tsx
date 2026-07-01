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

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "@/contexts/LanguageContext";
import { Separator } from "@/components/ui/separator";

interface FormPageLayoutProps {
  title: string;
  backHref: string;
  children: React.ReactNode;
}

export function FormPageLayout({ title, backHref, children }: FormPageLayoutProps) {
  const { translations } = useTranslations();
  const router = useRouter();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-end mb-4">
        <Button variant="ghost" className="text-base" onClick={() => router.push(backHref)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {translations.back}
        </Button>
      </div>
      <Card className="shadow-xl border-2 border-primary">
        <CardHeader className="p-4 pb-2">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="p-4">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
