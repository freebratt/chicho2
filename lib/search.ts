import { VyrobnyNavod } from './types';

interface SearchResult {
  navod: VyrobnyNavod;
  score: number;
  matchDetails: {
    tagMatch: boolean;
    titleMatch: number;
    tagContentMatch: number;
    stepsMatch: number;
    otherMatch: number;
    totalMatches: number;
  };
}

export function advancedSearch(navody: VyrobnyNavod[], searchTerm: string): VyrobnyNavod[] {
  if (!searchTerm.trim()) {
    return navody;
  }

  const term = searchTerm.toLowerCase().trim();
  console.log('🔍 Advanced search for:', term);

  const results: SearchResult[] = navody.map(navod => {
    const result = calculateSearchScore(navod, term);
    console.log(`📊 Score for "${navod.nazov}":`, result.score, result.matchDetails);
    return result;
  }).filter(result => result.score > 0);

  // Sort by score (descending)
  results.sort((a, b) => b.score - a.score);

  console.log('🏆 Search results order:', results.map(r => ({ name: r.navod.nazov, score: r.score })));

  return results.map(result => result.navod);
}

function calculateSearchScore(navod: VyrobnyNavod, searchTerm: string): SearchResult {
  const matchDetails = {
    tagMatch: false,
    titleMatch: 0,
    tagContentMatch: 0,
    stepsMatch: 0,
    otherMatch: 0,
    totalMatches: 0
  };

  let score = 0;

  // 1. Check for exact tag matches (highest priority)
  const allTags = [...navod.typPrace, ...navod.produkt];
  for (const tag of allTags) {
    if (tag.toLowerCase().includes(searchTerm)) {
      matchDetails.tagMatch = true;
      score += 1000; // Very high priority for tag matches
      console.log(`🏷️ Tag match found: "${tag}" for term "${searchTerm}"`);
      break;
    }
  }

  // 2. Title matching (high priority)
  const titleMatches = countMatches(navod.nazov, searchTerm);
  if (titleMatches > 0) {
    matchDetails.titleMatch = titleMatches;
    score += titleMatches * 100; // High weight for title
  }

  // 3. Tag content matching (medium-high priority)
  const tagContent = allTags.join(' ');
  const tagContentMatches = countMatches(tagContent, searchTerm);
  if (tagContentMatches > 0) {
    matchDetails.tagContentMatch = tagContentMatches;
    score += tagContentMatches * 50;
  }

  // 4. Steps matching (medium priority)
  const stepsContent = navod.postupPrace.map(krok => krok.popis).join(' ');
  const stepsMatches = countMatches(stepsContent, searchTerm);
  if (stepsMatches > 0) {
    matchDetails.stepsMatch = stepsMatches;
    score += stepsMatches * 30;
  }

  // 5. Other sections matching (lower priority)
  const otherContent = [
    ...navod.potrebneNaradie.map(n => n.popis),
    ...navod.naCoSiDatPozor.map(p => p.popis),
    ...navod.casteChyby.map(c => c.popis),
    ...(navod.obrazky?.map(o => o.popis) || [])
  ].join(' ');
  
  const otherMatches = countMatches(otherContent, searchTerm);
  if (otherMatches > 0) {
    matchDetails.otherMatch = otherMatches;
    score += otherMatches * 10;
  }

  matchDetails.totalMatches = titleMatches + tagContentMatches + stepsMatches + otherMatches;

  return {
    navod,
    score,
    matchDetails
  };
}

function countMatches(text: string, searchTerm: string): number {
  if (!text || !searchTerm) return 0;
  
  const normalizedText = text.toLowerCase();
  const normalizedTerm = searchTerm.toLowerCase();
  
  // Count both exact matches and partial matches
  let count = 0;
  
  // Exact phrase matches (higher weight)
  const exactMatches = (normalizedText.match(new RegExp(normalizedTerm, 'g')) || []).length;
  count += exactMatches * 2;
  
  // Individual word matches
  const words = normalizedTerm.split(' ').filter(w => w.length > 2);
  for (const word of words) {
    const wordMatches = (normalizedText.match(new RegExp(word, 'g')) || []).length;
    count += wordMatches;
  }
  
  return count;
}

export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
}