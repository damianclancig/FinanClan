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

import { useEffect, useRef } from 'react';

export const useScrollToTransaction = (isLoading: boolean) => {
    const wasLoadingRef = useRef(true);

    useEffect(() => {
        if (wasLoadingRef.current && !isLoading) {
            setTimeout(() => {
                const editedTransactionId = sessionStorage.getItem('editedTransactionId');
                if (editedTransactionId) {
                    const element = document.getElementById(`transaction-${editedTransactionId}`);
                    if (element) {
                        element.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                    }
                    sessionStorage.removeItem('editedTransactionId');
                    sessionStorage.removeItem('editedTransactionPage');
                }
            }, 0);
        }
        wasLoadingRef.current = isLoading;
    }, [isLoading]);
};
