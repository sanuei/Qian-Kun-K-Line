import { CandleData, UserInput } from '../types';
import { CELESTIAL_STEMS, EARTHLY_BRANCHES, stringToSeed } from '../constants';

// Pseudo-random number generator seeded by user data
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  // Returns 0 to 1
  next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  // Returns min to max
  range(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

export const generateLifeKLine = (input: UserInput): CandleData[] => {
  const seedStr = `${input.name}-${input.birthDate}-${input.birthTime}-${input.birthPlace}`;
  const seed = stringToSeed(seedStr);
  const rng = new SeededRandom(seed);
  
  const birthYear = parseInt(input.birthDate.split('-')[0]);
  const data: CandleData[] = [];
  
  // Base score starts around 50 (neutral)
  let currentScore = 50; 
  // Trend momentum
  let momentum = 0;

  // Calculate stem/branch offset based on year
  let stemIndex = (birthYear - 4) % 10; 
  let branchIndex = (birthYear - 4) % 12;

  // Generate 80 years of data (approx lifetime)
  for (let i = 0; i <= 80; i++) {
    const year = birthYear + i;
    const age = i;

    // Cycle update
    const stem = CELESTIAL_STEMS[(stemIndex + i) % 10];
    const branch = EARTHLY_BRANCHES[(branchIndex + i) % 12];
    const ganZhi = `${stem}${branch}`;

    // Volatility changes by age (youth is volatile, middle age stable, etc.)
    let volatility = 10;
    if (age < 20) volatility = 15;
    else if (age > 50) volatility = 8;

    // Random walk logic with "Fate" momentum
    // Every 10 years (Da Yun), shift the momentum significantly
    if (age % 10 === 0) {
      momentum = rng.range(-3, 4); // -3 to +4 trend
    }

    const open = currentScore;
    
    // Daily movement (Annual movement in this metaphor)
    const change = momentum + rng.range(-volatility, volatility);
    let close = open + change;

    // Constrain 0-100
    close = Math.max(5, Math.min(95, close));

    // Wicks
    const high = Math.max(open, close) + rng.range(0, volatility / 2);
    const low = Math.min(open, close) - rng.range(0, volatility / 2);

    data.push({
      year,
      age,
      open,
      close,
      high: Math.min(100, high),
      low: Math.max(0, low),
      score: close,
      isTurningPoint: Math.abs(open - close) > 15 || age % 10 === 0,
      ganZhi
    });

    currentScore = close;
  }

  return data;
};
