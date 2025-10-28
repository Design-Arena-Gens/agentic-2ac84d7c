import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateISRC(): string {
  const countryCode = 'US';
  const registrantCode = 'XXX';
  const year = new Date().getFullYear().toString().slice(-2);
  const designation = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `${countryCode}${registrantCode}${year}${designation}`;
}

export function generateUPC(): string {
  return Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
}

export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['audio/wav', 'audio/x-wav', 'audio/flac', 'audio/mpeg'];
  const maxSize = 200 * 1024 * 1024; // 200MB

  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please upload WAV, FLAC, or MP3 (320kbps).' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 200MB limit.' };
  }

  return { valid: true };
}

export function validateArtwork(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  const maxSize = 50 * 1024 * 1024; // 50MB

  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please upload JPG or PNG.' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 50MB limit.' };
  }

  return { valid: true };
}

export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',')
          ? `"${value}"`
          : value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

export const GENRES = [
  'Pop', 'Rock', 'Hip-Hop', 'R&B', 'Electronic', 'Dance', 'Country',
  'Jazz', 'Classical', 'Metal', 'Folk', 'Reggae', 'Blues', 'Soul',
  'Funk', 'Indie', 'Alternative', 'Latin', 'World', 'Other'
];

export const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Japanese', 'Korean', 'Chinese', 'Hindi', 'Arabic', 'Other'
];

export const TERRITORIES = [
  'Worldwide',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Japan',
  'South Korea',
  'Brazil',
  'Mexico',
  'Custom'
];
