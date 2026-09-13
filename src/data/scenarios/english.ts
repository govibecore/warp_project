import type { AssessmentItem, Difficulty } from '../../domain/types';

export const ENGLISH_MISSION_IDS = [
  'eng-reading-comp-1',
  'eng-synthesis-1',
] as const;

export function getEnglishCalibrationItems(classLevel: number, difficulty: Difficulty): AssessmentItem[] {
  // Mock calibration item
  return [
    {
      id: `eng-calib-${classLevel}-${difficulty.toLowerCase()}`,
      missionId: 'eng-calibration',
      missionTitle: 'English Calibration',
      developmentalBand: classLevel <= 4 ? '3-4' : classLevel <= 6 ? '5-6' : classLevel <= 8 ? '7-8' : classLevel <= 10 ? '9-10' : '11-12',
      prompt: 'Identify the main idea of the following passage.',
      context: 'The quick brown fox jumps over the lazy dog.',
      scenarioState: {},
      mutableStateKeys: [],
      options: [
        { id: 'opt1', label: 'The fox is quick.', evidence: [{ competency: 'understanding', earnedWeight: 1, availableWeight: 1 }] },
        { id: 'opt2', label: 'The dog is fast.', evidence: [{ competency: 'understanding', earnedWeight: 0, availableWeight: 1 }], misconception: 'misread subject' },
        { id: 'opt3', label: 'The animals are sleeping.', evidence: [{ competency: 'understanding', earnedWeight: 0, availableWeight: 1 }] },
        { id: 'opt4', label: 'The fox is brown.', evidence: [{ competency: 'understanding', earnedWeight: 0.5, availableWeight: 1 }] },
      ],
    }
  ];
}

export function getEnglishMissionItems(missionId: string, classLevel: number, _difficulty: Difficulty): AssessmentItem[] {
  // Mock mission items
  return [
    {
      id: `${missionId}-item-1-${classLevel}`,
      missionId,
      missionTitle: 'Reading Comprehension',
      developmentalBand: classLevel <= 4 ? '3-4' : classLevel <= 6 ? '5-6' : classLevel <= 8 ? '7-8' : classLevel <= 10 ? '9-10' : '11-12',
      prompt: 'According to the poster, what time does the event start?',
      context: 'Summer Fair! Join us this Saturday at 10:00 AM.',
      scenarioState: {},
      mutableStateKeys: [],
      options: [
        { id: 'opt1', label: '10:00 AM', evidence: [{ competency: 'locatingInformation', earnedWeight: 1, availableWeight: 1 }] },
        { id: 'opt2', label: '11:00 AM', evidence: [{ competency: 'locatingInformation', earnedWeight: 0, availableWeight: 1 }] },
        { id: 'opt3', label: 'Saturday', evidence: [{ competency: 'locatingInformation', earnedWeight: 0, availableWeight: 1 }] },
        { id: 'opt4', label: 'Summer', evidence: [{ competency: 'locatingInformation', earnedWeight: 0, availableWeight: 1 }] },
      ],
    }
  ];
}
