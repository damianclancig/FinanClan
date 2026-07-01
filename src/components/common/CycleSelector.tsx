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


"use client";

import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/contexts/LanguageContext";
import type { BillingCycle } from "@/types";
import { format, isSameDay } from "date-fns";
import { es, pt, enUS } from 'date-fns/locale';

interface CycleSelectorProps {
  cycles: BillingCycle[];
  selectedCycle: BillingCycle | null;
  onSelectCycle: (cycle: BillingCycle | null) => void;
}

const ALL_CYCLES_ID = "all";

export function CycleSelector({ cycles, selectedCycle, onSelectCycle }: CycleSelectorProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { translations, language } = useTranslations();
  const [showGradient, setShowGradient] = useState(false);
  const cycleRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());

  const locales = {
    en: enUS,
    es: es,
    pt: pt,
  };
  const currentLocale = locales[language] || enUS;

  const getCycleLabel = (cycle: BillingCycle) => {
    if (cycle.id === ALL_CYCLES_ID) {
      return translations.allCycles || "All Cycles";
    }

    const startDate = new Date(cycle.startDate);
    const startDateLabel = format(startDate, "dd MMM ''yy", { locale: currentLocale });

    if (!cycle.endDate) {
      return startDateLabel;
    }

    const endDate = new Date(cycle.endDate);
    if (isSameDay(startDate, endDate)) {
      return startDateLabel;
    }

    const endDateLabel = format(endDate, "dd MMM ''yy", { locale: currentLocale });
    return `${startDateLabel} - ${endDateLabel}`;
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const handleScroll = () => {
        const isAtStart = container.scrollLeft === 0;
        setShowGradient(!isAtStart);
      };

      container.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();

      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    if (selectedCycle) {
      const selectedCycleKey = selectedCycle.id;
      const cycleButton = cycleRefs.current.get(selectedCycleKey);
      if (cycleButton) {
        cycleButton.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    } else if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: 0,
        behavior: "smooth",
      })
    }
  }, [selectedCycle]);

  return (
    <div className="relative">
      {showGradient && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-linear-to-r from-background to-transparent pointer-events-none z-10" />
      )}
      <div
        ref={scrollContainerRef}
        className="flex space-x-2 overflow-x-auto pb-2 -mb-2 scrollbar-hide"
      >
        {cycles.map((cycle) => {
          const cycleKey = cycle.id;
          return (
            <Button
              key={cycleKey}
              ref={(el) => {
                cycleRefs.current.set(cycleKey, el);
              }}
              variant={selectedCycle?.id === cycle.id ? "default" : "outline"}
              onClick={() => onSelectCycle(cycle)}
              className="capitalize shrink-0"
            >
              {getCycleLabel(cycle)}
            </Button>
          )
        })}
      </div>
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
