import { AssessmentMark, AcademicModule } from '../types';

/**
 * Calculates a module's average mark.
 * If assessment weighting is provided for assessments, uses weighted average.
 * If no weighting is configured (or sum of weights is 0), falls back to arithmetic mean.
 */
export function calculateModuleAverage(assessments: AssessmentMark[]): number {
  if (!assessments || assessments.length === 0) return 0;

  const validMarks = assessments.filter(
    (a) => typeof a.percentage === 'number' && !isNaN(a.percentage)
  );
  if (validMarks.length === 0) return 0;

  // Check if assessments have explicit weights
  const weightedAssessments = validMarks.filter(
    (a) => typeof a.weighting === 'number' && a.weighting > 0
  );

  if (weightedAssessments.length > 0) {
    const totalWeight = weightedAssessments.reduce((sum, a) => sum + (a.weighting || 0), 0);
    const weightedSum = weightedAssessments.reduce(
      (sum, a) => sum + a.percentage * ((a.weighting || 0) / 100),
      0
    );

    // If total weight is <= 100%, scale it to current accounted percentage
    if (totalWeight > 0) {
      return (weightedSum / (totalWeight / 100));
    }
  }

  // Arithmetic mean fallback
  const sum = validMarks.reduce((acc, curr) => acc + curr.percentage, 0);
  return sum / validMarks.length;
}

/**
 * Calculates the overall academic average across all modules.
 * Can weight by module credit hours / module weights.
 */
export function calculateOverallAverage(
  modules: AcademicModule[],
  assessments: AssessmentMark[]
): number {
  const activeModules = modules.filter((m) => !m.isArchived);
  if (activeModules.length === 0) return 0;

  let totalWeight = 0;
  let weightedSum = 0;
  let hasAnyGrades = false;

  for (const mod of activeModules) {
    const modAssessments = assessments.filter((a) => a.moduleId === mod.id);
    if (modAssessments.length > 0) {
      const avg = calculateModuleAverage(modAssessments);
      const weight = mod.moduleWeight || mod.creditHours || 1.0;
      weightedSum += avg * weight;
      totalWeight += weight;
      hasAnyGrades = true;
    }
  }

  if (!hasAnyGrades || totalWeight === 0) return 0;
  return weightedSum / totalWeight;
}

/**
 * Converts a percentage to a standard 4.0 GPA scale.
 */
export function percentageToGpa(percentage: number): number {
  if (percentage >= 93) return 4.0;
  if (percentage >= 90) return 3.7;
  if (percentage >= 87) return 3.3;
  if (percentage >= 83) return 3.0;
  if (percentage >= 80) return 2.7;
  if (percentage >= 77) return 2.3;
  if (percentage >= 73) return 2.0;
  if (percentage >= 70) return 1.7;
  if (percentage >= 67) return 1.3;
  if (percentage >= 65) return 1.0;
  return 0.0;
}

/**
 * Converts percentage to letter grade.
 */
export function percentageToLetter(percentage: number): string {
  if (percentage >= 93) return 'A';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 67) return 'D+';
  if (percentage >= 65) return 'D';
  return 'F';
}

/**
 * Simulates target mark required on remaining weighted percentage.
 */
export function calculateRequiredMark(
  currentAverage: number,
  completedWeight: number,
  targetAverage: number
): { requiredPercentage: number; achievable: boolean } {
  const remainingWeight = 100 - completedWeight;
  if (remainingWeight <= 0) {
    return {
      requiredPercentage: currentAverage,
      achievable: currentAverage >= targetAverage,
    };
  }

  // target = (current * completedWeight + needed * remainingWeight) / 100
  // needed = (target * 100 - current * completedWeight) / remainingWeight
  const needed = (targetAverage * 100 - currentAverage * completedWeight) / remainingWeight;
  return {
    requiredPercentage: Math.max(0, Math.round(needed * 10) / 10),
    achievable: needed <= 100,
  };
}
