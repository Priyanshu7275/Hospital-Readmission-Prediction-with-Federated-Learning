import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function tierColor(tier: "Low" | "Medium" | "High") {
  switch (tier) {
    case "Low":
      return { text: "text-tier-low", bg: "bg-tier-lowBg", dot: "bg-tier-low", ring: "#10B981" };
    case "Medium":
      return { text: "text-tier-med", bg: "bg-tier-medBg", dot: "bg-tier-med", ring: "#F59E0B" };
    case "High":
      return { text: "text-tier-high", bg: "bg-tier-highBg", dot: "bg-tier-high", ring: "#F43F5E" };
  }
}
