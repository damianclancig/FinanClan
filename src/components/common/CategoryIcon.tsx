import React from "react";
import { getCategoryIcon } from "@/lib/icon-utils";

interface CategoryIconProps {
  icon?: string;
  size?: number;
  className?: string;
}

export function CategoryIcon({ icon, size = 18, className }: CategoryIconProps) {
  if (!icon) return null;
  const IconComponent = getCategoryIcon(icon);
  return IconComponent ? <IconComponent size={size} className={className} /> : null;
}
