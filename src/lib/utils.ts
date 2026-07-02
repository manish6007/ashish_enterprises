import { NumberPattern, VipNumber } from '../types';

// Detect patterns in a phone number
export function detectPatterns(number: string): NumberPattern[] {
  const digits = number.replace(/\D/g, '');
  if (digits.length !== 10) return [];

  const patterns: NumberPattern[] = [];

  // Check for specific lucky numbers
  if (digits.includes('786')) patterns.push('786');
  if (digits.includes('9999')) patterns.push('9999');
  if (digits.includes('5555')) patterns.push('5555');
  if (digits.includes('1234')) patterns.push('1234');
  if (digits.includes('0000')) patterns.push('0000');

  // ABCD pattern: 4 consecutive ascending digits
  const hasABCD = /0123|1234|2345|3456|4567|5678|6789/.test(digits);
  if (hasABCD) patterns.push('ABCD');

  // AABB pattern: two pairs of repeated digits (e.g., 9900, 1122)
  const hasAABB = /(.)\1(.)\2/.test(digits);
  if (hasAABB) patterns.push('AABB');

  // AAAB pattern: three same digits followed by one different (e.g., 9990, 1112)
  const hasAAAB = /(.)\1\1(?!\1)/.test(digits) || /(?<!\1)(.)\1\1/.test(digits);
  if (hasAAAB && !patterns.includes('AAAB')) patterns.push('AAAB');

  // Mirror pattern: first half mirrors second half
  const half = Math.floor(digits.length / 2);
  const firstHalf = digits.slice(0, half);
  const secondHalf = digits.slice(-half).split('').reverse().join('');
  if (firstHalf === secondHalf) patterns.push('Mirror');

  // Fancy: ends in 4+ repeating digits
  const fancyEnd = /(.)\1{3,}$/.test(digits);
  if (fancyEnd) patterns.push('Fancy');

  // Repeating block
  if (/(.{2,})\1+/.test(digits)) patterns.push('Repeating');

  return [...new Set(patterns)];
}

// Format phone number for display
export function formatPhoneNumber(number: string): string {
  const clean = number.replace(/\D/g, '');
  if (clean.length === 10) {
    return `${clean.slice(0, 5)} ${clean.slice(5)}`;
  }
  return number;
}

// Format currency in INR
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Calculate GST amount
export function calculateGST(price: number, gstPercent: number): number {
  return Math.round((price * gstPercent) / 100);
}

// Generate WhatsApp message for booking
export function generateWhatsAppLink(number: VipNumber): string {
  const phone = '917987666232';
  const msg = encodeURIComponent(
    `Hello Ashish Enterprises! 👋\n\nI'm interested in booking this VIP number:\n\n📱 *${formatPhoneNumber(number.number)}*\n🏷️ Category: ${number.category}\n💰 Price: ${formatCurrency(number.sellingPrice)}\n\nPlease confirm availability and booking process.\n\nThank you!`
  );
  return `https://wa.me/${phone}?text=${msg}`;
}

// Generate booking reference ID
export function generateBookingRef(): string {
  const prefix = 'AE';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// Highlight search term in string
export function highlightText(text: string, query: string): string {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// Check if number matches search query
export function matchesSearch(number: VipNumber, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase().replace(/\s/g, '');
  const num = number.number.toLowerCase();
  return (
    num.includes(q) ||
    number.category.toLowerCase().includes(query.toLowerCase()) ||
    number.circle.toLowerCase().includes(query.toLowerCase()) ||
    number.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
    number.patterns.some((p) => p.toLowerCase().includes(query.toLowerCase()))
  );
}

// Sort VIP numbers
export function sortNumbers(
  numbers: VipNumber[],
  sortBy: string
): VipNumber[] {
  switch (sortBy) {
    case 'price_asc':
      return [...numbers].sort((a, b) => a.sellingPrice - b.sellingPrice);
    case 'price_desc':
      return [...numbers].sort((a, b) => b.sellingPrice - a.sellingPrice);
    case 'newest':
      return [...numbers].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case 'popular':
      return [...numbers].sort((a, b) => (b.wishlistCount || 0) - (a.wishlistCount || 0));
    default:
      return numbers;
  }
}

// Indian circles/states
export const INDIAN_CIRCLES = [
  'Andhra Pradesh',
  'Assam',
  'Bihar & Jharkhand',
  'Chennai',
  'Delhi',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu & Kashmir',
  'Karnataka',
  'Kerala',
  'Kolkata',
  'Madhya Pradesh & Chhattisgarh',
  'Maharashtra',
  'Mumbai',
  'North East',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Uttar Pradesh East',
  'Uttar Pradesh West',
  'Uttarakhand',
  'West Bengal',
];

// Pattern display labels
export const PATTERN_LABELS: Record<string, string> = {
  '786': '786 Lucky',
  '9999': 'Quad 9',
  '5555': 'Quad 5',
  '1234': 'Sequential',
  '0000': 'Quad 0',
  ABCD: 'Ascending',
  AABB: 'Double Pair',
  AAAB: 'Triple Same',
  Mirror: 'Mirror',
  Fancy: 'Fancy End',
  Repeating: 'Repeating',
};
