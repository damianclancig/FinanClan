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

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const protectedRoutes = [
    '/dashboard',
    '/add-transaction', '/edit-transaction',
    '/taxes', '/add-tax', '/edit-tax',
    '/installments', '/edit-installment-purchase',
    '/savings-funds', '/savings-funds/add', '/savings-funds/edit',
    '/settings',
    '/card-summaries'
];

const unmanagedRoutes = ['/', '/login', '/goodbye', '/welcome', '/terms', '/privacy'];

export const useProtectedRoute = () => {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (unmanagedRoutes.includes(pathname) || pathname.startsWith('/settings/account')) {
        return;
    }

    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    if (!user && isProtectedRoute) {
      router.push('/');
    } else if (user && pathname === '/') {
      router.push('/dashboard');
    }
  }, [user, loading, pathname, router]);
};
