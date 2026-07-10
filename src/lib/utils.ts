import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getActiveIntake(intakes: string[]): string | null {
  if (!intakes || intakes.length === 0) return null;
  
  const currentMonthIndex = new Date().getMonth(); // 0-11
  const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  
  const parsedIntakes = intakes.map(intake => {
    const lowerIntake = intake.toLowerCase();
    const monthIndex = monthNames.findIndex(m => lowerIntake.includes(m));
    return { original: intake, monthIndex };
  }).filter(item => item.monthIndex !== -1).sort((a, b) => a.monthIndex - b.monthIndex);

  if (parsedIntakes.length === 0) return intakes[0];

  const activeIntake = parsedIntakes.find(item => item.monthIndex > currentMonthIndex);
  return activeIntake ? activeIntake.original : parsedIntakes[0].original;
}

export function generateSlug(text: string | undefined | null): string {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Remove characters that are not alphanumeric, spaces, or hyphens
    .replace(/[^\w\s-]/g, '')
    // Replace spaces and multiple hyphens with a single hyphen
    .replace(/[\s_-]+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '');
}
