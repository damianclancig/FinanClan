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
 * Category Icons Configuration
 * 
 * Catalog of available Lucide icons organized by category type.
 * Used by the IconPicker component to display relevant icons for each category.
 */

export const CATEGORY_ICON_GROUPS = {
  home: {
    label: 'Home & Services',
    icons: ['Home', 'Building', 'Warehouse', 'Lightbulb', 'Droplet', 'Flame', 'Wifi', 'Phone', 'Tv', 'Zap']
  },
  transport: {
    label: 'Transport',
    icons: ['Car', 'CarFront', 'Taxi', 'Fuel', 'Bus', 'BusFront', 'Bike', 'Plane', 'Train', 'TrainFront', 'TramFront', 'Ship', 'Truck', 'MapPin', 'Navigation']
  },
  food: {
    label: 'Food & Drinks',
    icons: [
      'ShoppingCart', 'Utensils', 'Coffee', 'Pizza', 'Cake', 'Wine', 'Beer', 'IceCream', 'Soup', 'Apple',
      'Beef', 'Drumstick', 'Fish', 'Ham', 'Egg', 'Carrot', 'Banana', 'Cherry', 'Grape', 'Citrus', 
      'Salad', 'Sandwich', 'Cookie', 'Candy', 'Lollipop', 'Popcorn', 'CupSoda', 'Martini', 'GlassWater'
    ]
  },
  health: {
    label: 'Health & Wellness',
    icons: ['Heart', 'Pill', 'Activity', 'Stethoscope', 'Dumbbell', 'Weight', 'HeartPulse', 'Syringe', 'Thermometer', 'Trophy', 'Medal', 'Timer', 'Watch', 'Flower', 'Sun']
  },
  entertainment: {
    label: 'Entertainment',
    icons: ['Gamepad2', 'Music', 'Film', 'Tv', 'Book', 'Headphones', 'Camera', 'Palette', 'Guitar', 'Mic']
  },
  shopping: {
    label: 'Shopping',
    icons: ['ShoppingBag', 'Store', 'Gift', 'Shirt', 'Watch', 'Gem', 'Tag', 'Package']
  },
  education: {
    label: 'Education & Work',
    icons: ['GraduationCap', 'Briefcase', 'BookOpen', 'Laptop', 'PenTool', 'FileText', 'Presentation']
  },
  finance: {
    label: 'Finance',
    icons: ['Wallet', 'PiggyBank', 'Receipt', 'CreditCard', 'DollarSign', 'TrendingUp', 'Coins', 'Banknote']
  },
  other: {
    label: 'Other',
    icons: ['Star', 'Heart', 'Sparkles', 'Crown', 'Award', 'Target', 'Flag', 'Bookmark', 'Calendar', 'Clock', 'Cigarette', 'Newspaper']
  },
  pets: {
    label: 'Pets & Animals',
    icons: ['Cat', 'Dog', 'Rabbit', 'Bird', 'Fish', 'PawPrint', 'Bone']
  }
};

// Flatten all icons into a single array for easy access
export const ALL_CATEGORY_ICONS = Object.values(CATEGORY_ICON_GROUPS)
  .flatMap(group => group.icons);

// Default icons for system categories
export const DEFAULT_CATEGORY_ICONS: Record<string, string> = {
  'Taxes': 'Receipt',
  'Savings': 'PiggyBank',
};

// Helper to get icon group label by icon name
export function getIconGroupLabel(iconName: string): string | null {
  for (const [, group] of Object.entries(CATEGORY_ICON_GROUPS)) {
    if (group.icons.includes(iconName)) {
      return group.label;
    }
  }
  return null;
}

// Helper to validate if an icon name is valid
export function isValidCategoryIcon(iconName: string): boolean {
  return ALL_CATEGORY_ICONS.includes(iconName);
}
