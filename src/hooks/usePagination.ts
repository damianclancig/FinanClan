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

import { useState, useCallback, useMemo, useEffect } from 'react';

export const usePagination = (totalItems: number, initialPage: number = 1, initialItemsPerPage: number = 10) => {
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

    const totalPages = useMemo(() =>
        Math.max(1, Math.ceil(totalItems / itemsPerPage)),
        [totalItems, itemsPerPage]
    );

    const startIndex = useMemo(() =>
        (currentPage - 1) * itemsPerPage,
        [currentPage, itemsPerPage]
    );

    const endIndex = useMemo(() =>
        startIndex + itemsPerPage,
        [startIndex, itemsPerPage]
    );

    // Reset to page 1 if current page exceeds total pages
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [currentPage, totalPages]);

    const nextPage = useCallback(() => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    }, [totalPages]);

    const previousPage = useCallback(() => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    }, []);

    const goToPage = useCallback((page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    }, [totalPages]);

    const changeItemsPerPage = useCallback((newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Reset to first page when changing items per page
    }, []);

    return {
        currentPage,
        itemsPerPage,
        totalPages,
        startIndex,
        endIndex,
        setCurrentPage,
        setItemsPerPage: changeItemsPerPage,
        nextPage,
        previousPage,
        goToPage,
    };
};
