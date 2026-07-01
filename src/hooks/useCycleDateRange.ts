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

import { useMemo } from 'react';
import { endOfMonth } from 'date-fns';
import type { BillingCycle } from '@/types';

const ALL_CYCLES_ID = "all";

interface CycleDateRange {
    start: Date;
    end: Date;
}

export const useCycleDateRange = (selectedCycle: BillingCycle | null): CycleDateRange | null => {
    return useMemo(() => {
        if (!selectedCycle || selectedCycle.id === ALL_CYCLES_ID) return null;
        return {
            start: new Date(selectedCycle.startDate),
            end: selectedCycle.endDate ? new Date(selectedCycle.endDate) : new Date(),
        };
    }, [selectedCycle]);
};
