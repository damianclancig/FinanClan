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

import { useState, useCallback } from 'react';
import type { TransactionType, DateRange } from '@/types';

export interface DashboardFilters {
    searchTerm: string;
    selectedType: TransactionType | "all" | "savings";
    selectedCategory: string[] | "all";
    dateRange: DateRange | undefined;
}

const initialFilters: DashboardFilters = {
    searchTerm: "",
    selectedType: "all",
    selectedCategory: "all",
    dateRange: undefined,
};

export const useDashboardFilters = () => {
    const [filters, setFilters] = useState<DashboardFilters>(initialFilters);

    const updateSearchTerm = useCallback((searchTerm: string) => {
        setFilters(prev => ({ ...prev, searchTerm }));
    }, []);

    const updateSelectedType = useCallback((selectedType: TransactionType | "all" | "savings") => {
        setFilters(prev => ({ ...prev, selectedType }));
    }, []);

    const updateSelectedCategory = useCallback((selectedCategory: string[] | "all") => {
        setFilters(prev => ({ ...prev, selectedCategory }));
    }, []);

    const updateDateRange = useCallback((dateRange: DateRange | undefined) => {
        setFilters(prev => ({ ...prev, dateRange }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters(initialFilters);
    }, []);

    const isAnyFilterActive =
        filters.searchTerm !== "" ||
        filters.selectedType !== "all" ||
        (Array.isArray(filters.selectedCategory) && filters.selectedCategory.length > 0) ||
        filters.dateRange?.from !== undefined;

    return {
        filters,
        updateSearchTerm,
        updateSelectedType,
        updateSelectedCategory,
        updateDateRange,
        clearFilters,
        isAnyFilterActive,
    };
};
