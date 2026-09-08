import {
  InspectionLevel,
  AQLCalculationResult,
  InspectionResult,
} from '@/types/quality';

/**
 * ISO 2859-1 / ANSI/ASQ Z1.4 Lot Size Code Letter Table
 */
interface LotSizeRange {
  min: number;
  max: number;
  letters: Record<InspectionLevel, string>;
}

const LOT_SIZE_TABLE: LotSizeRange[] = [
  { min: 2, max: 8, letters: { GI: 'A', GII: 'A', GIII: 'B', S1: 'A', S2: 'A', S3: 'A', S4: 'A' } },
  { min: 9, max: 15, letters: { GI: 'A', GII: 'B', GIII: 'C', S1: 'A', S2: 'A', S3: 'A', S4: 'A' } },
  { min: 16, max: 25, letters: { GI: 'B', GII: 'C', GIII: 'D', S1: 'A', S2: 'A', S3: 'B', S4: 'B' } },
  { min: 26, max: 50, letters: { GI: 'C', GII: 'D', GIII: 'E', S1: 'A', S2: 'B', S3: 'B', S4: 'C' } },
  { min: 51, max: 90, letters: { GI: 'C', GII: 'E', GIII: 'F', S1: 'B', S2: 'B', S3: 'C', S4: 'C' } },
  { min: 91, max: 150, letters: { GI: 'D', GII: 'F', GIII: 'G', S1: 'B', S2: 'B', S3: 'C', S4: 'D' } },
  { min: 151, max: 280, letters: { GI: 'E', GII: 'G', GIII: 'H', S1: 'B', S2: 'C', S3: 'D', S4: 'E' } },
  { min: 281, max: 500, letters: { GI: 'F', GII: 'H', GIII: 'J', S1: 'B', S2: 'C', S3: 'D', S4: 'E' } },
  { min: 501, max: 1200, letters: { GI: 'G', GII: 'J', GIII: 'K', S1: 'C', S2: 'C', S3: 'E', S4: 'F' } },
  { min: 1201, max: 3200, letters: { GI: 'H', GII: 'K', GIII: 'L', S1: 'C', S2: 'D', S3: 'E', S4: 'G' } },
  { min: 3201, max: 10000, letters: { GI: 'J', GII: 'L', GIII: 'M', S1: 'C', S2: 'D', S3: 'F', S4: 'H' } },
  { min: 10001, max: 35000, letters: { GI: 'K', GII: 'M', GIII: 'N', S1: 'C', S2: 'D', S3: 'F', S4: 'J' } },
  { min: 35001, max: 150000, letters: { GI: 'L', GII: 'N', GIII: 'P', S1: 'D', S2: 'E', S3: 'G', S4: 'J' } },
  { min: 150001, max: 500000, letters: { GI: 'M', GII: 'P', GIII: 'Q', S1: 'D', S2: 'E', S3: 'G', S4: 'K' } },
  { min: 500001, max: Infinity, letters: { GI: 'N', GII: 'Q', GIII: 'R', S1: 'D', S2: 'E', S3: 'H', S4: 'K' } },
];

/**
 * Code Letter to Sample Size Mapping
 */
export const CODE_LETTER_SAMPLE_SIZES: Record<string, number> = {
  A: 2,
  B: 3,
  C: 5,
  D: 8,
  E: 13,
  F: 20,
  G: 32,
  H: 50,
  J: 80,
  K: 125,
  L: 200,
  M: 315,
  N: 500,
  P: 800,
  Q: 1250,
  R: 2000,
};

/**
 * Standard Normal Inspection Single Sampling Plan Table
 * Format: [sampleSizeCode]: Record<AQL, maxAllowedDefects (Ac)>
 */
export const AQL_ACCEPTANCE_TABLE: Record<string, Record<string, number>> = {
  A: { '1.0': 0, '1.5': 0, '2.5': 0, '4.0': 0, '6.5': 0 },
  B: { '1.0': 0, '1.5': 0, '2.5': 0, '4.0': 0, '6.5': 0 },
  C: { '1.0': 0, '1.5': 0, '2.5': 0, '4.0': 0, '6.5': 1 },
  D: { '1.0': 0, '1.5': 0, '2.5': 0, '4.0': 1, '6.5': 1 },
  E: { '1.0': 0, '1.5': 0, '2.5': 1, '4.0': 1, '6.5': 2 },
  F: { '1.0': 0, '1.5': 0, '2.5': 1, '4.0': 2, '6.5': 3 },
  G: { '1.0': 0, '1.5': 1, '2.5': 2, '4.0': 3, '6.5': 5 },
  H: { '1.0': 1, '1.5': 2, '2.5': 3, '4.0': 5, '6.5': 7 },
  J: { '1.0': 2, '1.5': 3, '2.5': 5, '4.0': 7, '6.5': 10 },
  K: { '1.0': 3, '1.5': 5, '2.5': 7, '4.0': 10, '6.5': 14 },
  L: { '1.0': 5, '1.5': 7, '2.5': 10, '4.0': 14, '6.5': 21 },
  M: { '1.0': 7, '1.5': 10, '2.5': 14, '4.0': 21, '6.5': 21 },
  N: { '1.0': 10, '1.5': 14, '2.5': 21, '4.0': 21, '6.5': 21 },
  P: { '1.0': 14, '1.5': 21, '2.5': 21, '4.0': 21, '6.5': 21 },
  Q: { '1.0': 21, '1.5': 21, '2.5': 21, '4.0': 21, '6.5': 21 },
  R: { '1.0': 21, '1.5': 21, '2.5': 21, '4.0': 21, '6.5': 21 },
};

/**
 * Determines the standard Code Letter for a given lot size and inspection level.
 */
export function getCodeLetter(lotSize: number, level: InspectionLevel = 'GII'): string {
  if (lotSize <= 0) {
    throw new Error('Lot size must be greater than 0');
  }

  const range = LOT_SIZE_TABLE.find((r) => lotSize >= r.min && lotSize <= r.max);
  if (!range) {
    return 'Q';
  }

  return range.letters[level] || 'J';
}

/**
 * Determines the required sample size for a given lot size and inspection level.
 */
export function getSampleSize(lotSize: number, level: InspectionLevel = 'GII'): number {
  if (lotSize <= 0) {
    throw new Error('Lot size must be greater than 0');
  }

  // If lot size is less than 2, sample size is lot size
  if (lotSize === 1) {
    return 1;
  }

  const codeLetter = getCodeLetter(lotSize, level);
  const calculatedSampleSize = CODE_LETTER_SAMPLE_SIZES[codeLetter] || 80;

  // Sample size cannot exceed lot size
  return Math.min(calculatedSampleSize, lotSize);
}

/**
 * Determines the maximum allowed defects (Ac) for a given code letter and AQL threshold.
 */
export function getMaxAllowedDefects(codeLetterOrSampleSize: string | number, aql: number): number {
  const codeLetter =
    typeof codeLetterOrSampleSize === 'number'
      ? Object.entries(CODE_LETTER_SAMPLE_SIZES).find(([, size]) => size === codeLetterOrSampleSize)?.[0] || 'L'
      : codeLetterOrSampleSize;

  const codeTable = AQL_ACCEPTANCE_TABLE[codeLetter];
  if (codeTable) {
    const aqlKey = aql.toFixed(1);
    if (aqlKey in codeTable) {
      return codeTable[aqlKey];
    }
  }

  const sampleSize = CODE_LETTER_SAMPLE_SIZES[codeLetter] || 80;
  return Math.max(0, Math.floor(sampleSize * (aql / 100)));
}

export interface CalculateAQLParams {
  lotSize: number;
  inspectedQuantity?: number;
  sampleSize?: number;
  level?: InspectionLevel;
  majorAQL?: number;
  minorAQL?: number;
  criticalAQL?: number;
  defects: {
    critical?: number;
    major?: number;
    minor?: number;
  };
}

/**
 * Pure deterministic AQL Evaluation Engine.
 * Independently evaluates inspection results from verified counts and standard thresholds.
 */
export function calculateAQLResult(params: CalculateAQLParams): AQLCalculationResult {
  const {
    lotSize,
    level = 'GII',
    majorAQL = 2.5,
    minorAQL = 4.0,
    criticalAQL = 0,
    defects,
  } = params;

  // Validation guards
  if (typeof lotSize !== 'number' || isNaN(lotSize) || lotSize <= 0) {
    throw new Error('Lot size (order quantity) must be a positive number greater than 0');
  }

  if (
    (defects.critical !== undefined && defects.critical < 0) ||
    (defects.major !== undefined && defects.major < 0) ||
    (defects.minor !== undefined && defects.minor < 0)
  ) {
    throw new Error('Defect counts cannot be negative');
  }

  const actualCritical = defects.critical || 0;
  const actualMajor = defects.major || 0;
  const actualMinor = defects.minor || 0;

  const codeLetter = getCodeLetter(lotSize, level);
  const standardSampleSize = getSampleSize(lotSize, level);
  const inspectedQuantity = params.inspectedQuantity || params.sampleSize || standardSampleSize;

  if (inspectedQuantity <= 0) {
    throw new Error('Inspected quantity / sample size must be greater than 0');
  }

  const totalDefects = actualCritical + actualMajor + actualMinor;

  if (totalDefects > inspectedQuantity) {
    throw new Error(`Total defects (${totalDefects}) cannot exceed inspected quantity (${inspectedQuantity})`);
  }

  const maxAllowedCritical = criticalAQL === 0 ? 0 : getMaxAllowedDefects(codeLetter, criticalAQL);
  const maxAllowedMajor = getMaxAllowedDefects(codeLetter, majorAQL);
  const maxAllowedMinor = getMaxAllowedDefects(codeLetter, minorAQL);

  const failureReasons: string[] = [];
  let result: InspectionResult = 'PASS';

  // 1. Critical Defect Rule: Zero Tolerance
  if (actualCritical > maxAllowedCritical) {
    failureReasons.push(
      `Critical defects (${actualCritical}) exceeded maximum allowed limit (${maxAllowedCritical}). Zero tolerance policy applies.`
    );
    result = 'FAIL';
  }

  // 2. Major Defect Rule
  if (actualMajor > maxAllowedMajor) {
    failureReasons.push(
      `Major defects (${actualMajor}) exceeded AQL ${majorAQL} acceptance limit (${maxAllowedMajor}).`
    );
    result = 'FAIL';
  }

  // 3. Minor Defect Rule
  if (actualMinor > maxAllowedMinor) {
    if (result !== 'FAIL') {
      // If only minor defects exceeded and within +1 tolerance with 0 major defects, mark as CONDITIONAL
      if (actualMinor <= maxAllowedMinor + 2 && actualMajor === 0 && actualCritical === 0) {
        failureReasons.push(
          `Minor defects (${actualMinor}) slightly exceeded AQL ${minorAQL} limit (${maxAllowedMinor}), but zero major/critical defects detected. Conditional approval recommended.`
        );
        result = 'CONDITIONAL';
      } else {
        failureReasons.push(
          `Minor defects (${actualMinor}) exceeded AQL ${minorAQL} acceptance limit (${maxAllowedMinor}).`
        );
        result = 'FAIL';
      }
    } else {
      failureReasons.push(
        `Minor defects (${actualMinor}) exceeded AQL ${minorAQL} acceptance limit (${maxAllowedMinor}).`
      );
    }
  }

  const criticalDefectsPass = actualCritical <= maxAllowedCritical;
  const majorDefectsPass = actualMajor <= maxAllowedMajor;
  const minorDefectsPass = actualMinor <= maxAllowedMinor;

  return {
    codeLetter,
    sampleSize: standardSampleSize,
    inspectedQuantity,
    lotSize,
    majorAQL,
    minorAQL,
    criticalAQL,
    maxAllowedCritical,
    maxAllowedMajor,
    maxAllowedMinor,
    majorMaxAllowed: maxAllowedMajor,
    minorMaxAllowed: maxAllowedMinor,
    criticalMaxAllowed: maxAllowedCritical,
    actualCritical,
    actualMajor,
    actualMinor,
    criticalCount: actualCritical,
    majorCount: actualMajor,
    minorCount: actualMinor,
    criticalDefectsPass,
    majorDefectsPass,
    minorDefectsPass,
    totalDefects,
    result,
    failureReasons,
  };
}
