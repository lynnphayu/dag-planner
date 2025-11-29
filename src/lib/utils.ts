import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { adjectives, animals, uniqueNamesGenerator } from "unique-names-generator";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateName() {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: " ",
    style: "capital",
  });
} 