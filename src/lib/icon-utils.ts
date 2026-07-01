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

/**
 * Icon Utilities
 * 
 * Helper functions for dynamically rendering Lucide icons
 */

import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';

type LucideIcon = ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;

/**
 * Get a Lucide icon component by name
 * @param iconName - Name of the Lucide icon (e.g., "Home", "Car")
 * @returns The icon component or null if not found
 */
export function getLucideIcon(iconName?: string): LucideIcon | null {
  if (!iconName) return null;
  
  const Icon = (LucideIcons as any)[iconName];
  return Icon || null;
}

/**
 * Get category icon component with fallback
 * @param iconName - Name of the Lucide icon
 * @param fallback - Fallback icon name if primary not found
 * @returns The icon component
 */
export function getCategoryIcon(iconName?: string, fallback: string = 'Circle'): LucideIcon {
  const Icon = getLucideIcon(iconName);
  if (Icon) return Icon;
  
  const FallbackIcon = getLucideIcon(fallback);
  return FallbackIcon || LucideIcons.Circle;
}
