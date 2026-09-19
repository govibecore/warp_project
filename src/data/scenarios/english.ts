import type { AssessmentItem, Difficulty } from '../../domain/types';

export const ENGLISH_MISSION_IDS = [
  'eng-reading-comp-1',
  'eng-synthesis-1',
  'eng-grammar-1',
  'eng-error-spotting-1',
  'eng-cloze-1',
  'eng-grammar-reading-1',
] as const;

export function getEnglishCalibrationItems(classLevel: number, difficulty: Difficulty): AssessmentItem[] {
  const band = classLevel <= 4 ? '3-4' : classLevel <= 6 ? '5-6' : classLevel <= 8 ? '7-8' : classLevel <= 10 ? '9-10' : '11-12';
  const diffStr = difficulty.toLowerCase();

  return [
    {
      id: `eng-calib-1-${classLevel}-${diffStr}`,
      missionId: 'eng-calibration',
      missionTitle: 'English Calibration',
      developmentalBand: band,
      prompt: 'Identify the central theme and authorial intent in the passage.',
      context: 'The ancient stone aqueduct, once the pride of the provincial capital, now stands draped in wild ivy. Sheep graze peacefully beneath arches that once channeled fresh alpine springs to hundreds of thousands of citizens.',
      scenarioState: {},
      mutableStateKeys: [],
      options: [
        { id: 'opt1', label: 'The impermanence of human civil engineering against natural time', evidence: [{ competency: 'understanding', earnedWeight: 1, availableWeight: 1 }] },
        { id: 'opt2', label: 'The economic value of sheep farming in dry valleys', evidence: [{ competency: 'understanding', earnedWeight: 0, availableWeight: 1 }], misconception: 'surface detail focus' },
        { id: 'opt3', label: 'A critique of water rationing policies in ancient times', evidence: [{ competency: 'understanding', earnedWeight: 0, availableWeight: 1 }] },
        { id: 'opt4', label: 'The superior durability of concrete over stone masonry', evidence: [{ competency: 'understanding', earnedWeight: 0, availableWeight: 1 }] },
      ],
    },
    {
      id: `eng-calib-2-${classLevel}-${diffStr}`,
      missionId: 'eng-calibration',
      missionTitle: 'English Calibration',
      developmentalBand: band,
      prompt: 'According to the archaeological report, when was the secondary cistern decommissioned?',
      context: 'Excavation Log: Sector 4 cistern was constructed in 120 CE, expanded in 185 CE, and formally decommissioned in 340 CE following seismic tremors along the fault line.',
      scenarioState: {},
      mutableStateKeys: [],
      options: [
        { id: 'opt1', label: '340 CE', evidence: [{ competency: 'locatingInformation', earnedWeight: 1, availableWeight: 1 }] },
        { id: 'opt2', label: '120 CE', evidence: [{ competency: 'locatingInformation', earnedWeight: 0, availableWeight: 1 }], misconception: 'selected initial construction' },
        { id: 'opt3', label: '185 CE', evidence: [{ competency: 'locatingInformation', earnedWeight: 0, availableWeight: 1 }] },
        { id: 'opt4', label: '450 CE', evidence: [{ competency: 'locatingInformation', earnedWeight: 0, availableWeight: 1 }] },
      ],
    },
  ];
}

export function getEnglishMissionItems(missionId: string, classLevel: number, difficulty: Difficulty): AssessmentItem[] {
  const band = classLevel <= 4 ? '3-4' : classLevel <= 6 ? '5-6' : classLevel <= 8 ? '7-8' : classLevel <= 10 ? '9-10' : '11-12';
  const diffStr = difficulty.toLowerCase();

  if (missionId === 'eng-grammar-reading-1') {
    return [
      {
        id: `eng-gram-read-1-${classLevel}-${diffStr}`,
        missionId,
        missionTitle: 'Contextual Grammar',
        developmentalBand: band,
        prompt: 'Read the short email and choose the best word to fill in the blank.',
        context: 'Hi Rohan, Guess what? My family and I _____ to the zoo yesterday! We saw a huge elephant drinking water with its trunk. It was amazing. Let\'s play together soon. Your friend, Aarav',
        scenarioState: {},
        mutableStateKeys: [],
        options: [
          { id: 'opt1', label: 'went', evidence: [{ competency: 'understanding', earnedWeight: 1, availableWeight: 1 }] },
          { id: 'opt2', label: 'go', evidence: [{ competency: 'understanding', earnedWeight: 0, availableWeight: 1 }], misconception: 'present tense' },
          { id: 'opt3', label: 'going', evidence: [{ competency: 'understanding', earnedWeight: 0, availableWeight: 1 }], misconception: 'incomplete continuous tense' },
          { id: 'opt4', label: 'gone', evidence: [{ competency: 'understanding', earnedWeight: 0, availableWeight: 1 }], misconception: 'past participle without auxiliary verb' },
        ],
      },
      {
        id: `eng-gram-read-2-${classLevel}-${diffStr}`,
        missionId,
        missionTitle: 'Contextual Grammar',
        developmentalBand: band,
        prompt: 'Read the story snippet and answer the question.',
        context: 'The little bird sat on the branch. It looked down at the worm wriggling in the dirt. Suddenly, the bird swooped down and caught *it*. What does the word *it* refer to in the last sentence?',
        scenarioState: {},
        mutableStateKeys: [],
        options: [
          { id: 'opt1', label: 'the worm', evidence: [{ competency: 'understanding', earnedWeight: 1, availableWeight: 1 }] },
          { id: 'opt2', label: 'the bird', evidence: [{ competency: 'understanding', earnedWeight: 0, availableWeight: 1 }], misconception: 'confusing the subject with the object' },
          { id: 'opt3', label: 'the dirt', evidence: [{ competency: 'understanding', earnedWeight: 0, availableWeight: 1 }], misconception: 'selecting a nearby noun that makes no logical sense to catch' },
          { id: 'opt4', label: 'the branch', evidence: [{ competency: 'understanding', earnedWeight: 0, availableWeight: 1 }], misconception: 'selecting a noun from the first sentence' },
        ],
      },
    ];
  }

  if (missionId === 'eng-error-spotting-1') {
    return [
      {
        id: `eng-err-1-${classLevel}-${diffStr}`,
        missionId,
        missionTitle: 'Error Identification',
        developmentalBand: band,
        prompt: 'Identify the segment of the sentence that contains a grammatical error. If there is no error, select "No error".',
        context: 'Neither of the students (A) / have submitted their assignments (B) / before the deadline (C).',
        scenarioState: {},
        mutableStateKeys: [],
        options: [
          { id: 'opt1', label: '(B) have submitted their assignments', evidence: [{ competency: 'understanding', earnedWeight: 1, availableWeight: 1 }] },
          { id: 'opt2', label: '(A) Neither of the students', evidence: [{ competency: 'understanding', earnedWeight: 0, availableWeight: 1 }], misconception: 'incorrectly assuming "Neither" is the error' },
          { id: 'opt3', label: '(C) before the deadline', evidence: [{ competency: 'understanding', earnedWeight: 0, availableWeight: 1 }], misconception: 'selecting a prepositional phrase' },
          { id: 'opt4', label: 'No error', evidence: [{ competency: 'understanding', earnedWeight: 0, availableWeight: 1 }], misconception: 'failing to identify the subject-verb disagreement' },
        ],
      },
      {
        id: `eng-err-2-${classLevel}-${diffStr}`,
        missionId,
        missionTitle: 'Contextual Vocabulary',
        developmentalBand: band,
        prompt: 'Choose the word that best replaces the italicized phrase to improve the sentence.',
        context: 'The runner was *so extremely fast* that nobody could catch him.',
        scenarioState: {},
        mutableStateKeys: [],
        options: [
          { id: 'opt1', label: 'so swift', evidence: [{ competency: 'understanding', earnedWeight: 1, availableWeight: 1 }] },
          { id: 'opt2', label: 'quickingly', evidence: [{ competency: 'understanding', earnedWeight: 0, availableWeight: 1 }], misconception: 'invalid word formation' },
          { id: 'opt3', label: 'slowly', evidence: [{ competency: 'understanding', earnedWeight: 0, availableWeight: 1 }], misconception: 'antonym' },
          { id: 'opt4', label: 'more fast', evidence: [{ competency: 'understanding', earnedWeight: 0, availableWeight: 1 }], misconception: 'incorrect comparative form' },
        ],
      }
    ];
  }

  if (missionId === 'eng-cloze-1') {
    return [
      {
        id: `eng-cloze-1-${classLevel}-${diffStr}`,
        missionId,
        missionTitle: 'Contextual Word Usage',
        developmentalBand: band,
        prompt: 'Choose the most appropriate word to fill in the blank.',
        context: 'Despite the overwhelming evidence against him, the defendant maintained a facade of absolute _____, convincing even the most skeptical jurors of his innocence for a time.',
        scenarioState: {},
        mutableStateKeys: [],
        options: [
          { id: 'opt1', label: 'nonchalance', evidence: [{ competency: 'evaluatingReflecting', earnedWeight: 1, availableWeight: 1 }] },
          { id: 'opt2', label: 'guilt', evidence: [{ competency: 'evaluatingReflecting', earnedWeight: 0, availableWeight: 1 }], misconception: 'contradicts the phrase "convincing... of his innocence"' },
          { id: 'opt3', label: 'hesitation', evidence: [{ competency: 'evaluatingReflecting', earnedWeight: 0, availableWeight: 1 }], misconception: 'does not fit "absolute" or project innocence' },
          { id: 'opt4', label: 'despair', evidence: [{ competency: 'evaluatingReflecting', earnedWeight: 0, availableWeight: 1 }], misconception: 'context implies projecting confidence, not sadness' },
        ],
      },
      {
        id: `eng-cloze-2-${classLevel}-${diffStr}`,
        missionId,
        missionTitle: 'Precise Editing',
        developmentalBand: band,
        prompt: 'Which revision most effectively uses parallel structure to emphasize the author\'s point?',
        context: 'The committee\'s goals are to protect the environment, creating new jobs, and the improvement of public transportation.',
        scenarioState: {},
        mutableStateKeys: [],
        options: [
          { id: 'opt1', label: 'The committee\'s goals are to protect the environment, to create new jobs, and to improve public transportation.', evidence: [{ competency: 'evaluatingReflecting', earnedWeight: 1, availableWeight: 1 }] },
          { id: 'opt2', label: 'The committee\'s goals are protecting the environment, to create new jobs, and the improvement of public transportation.', evidence: [{ competency: 'evaluatingReflecting', earnedWeight: 0, availableWeight: 1 }], misconception: 'still not parallel' },
          { id: 'opt3', label: 'The committee\'s goals are to protect the environment, creating new jobs, and improving public transportation.', evidence: [{ competency: 'evaluatingReflecting', earnedWeight: 0, availableWeight: 1 }], misconception: 'mixed forms' },
          { id: 'opt4', label: 'The committee\'s goals are environmental protection, creating new jobs, and to improve public transportation.', evidence: [{ competency: 'evaluatingReflecting', earnedWeight: 0, availableWeight: 1 }], misconception: 'mixed noun and verb phrases' },
        ],
      }
    ];
  }

  if (missionId === 'eng-grammar-1') {
    return [
      {
        id: `eng-gram-1-${classLevel}-${diffStr}`,
        missionId,
        missionTitle: 'Foundational Grammar',
        developmentalBand: band,
        prompt: 'Identify the verb in the following sentence.',
        context: 'The quick brown fox jumps over the lazy dog.',
        scenarioState: {},
        mutableStateKeys: [],
        options: [
          { id: 'opt1', label: 'jumps', evidence: [{ competency: 'understanding', earnedWeight: 1, availableWeight: 1 }] },
          { id: 'opt2', label: 'fox', evidence: [{ competency: 'understanding', earnedWeight: 0, availableWeight: 1 }], misconception: 'selecting the noun/subject' },
          { id: 'opt3', label: 'quick', evidence: [{ competency: 'understanding', earnedWeight: 0, availableWeight: 1 }], misconception: 'selecting the adjective' },
          { id: 'opt4', label: 'over', evidence: [{ competency: 'understanding', earnedWeight: 0, availableWeight: 1 }], misconception: 'selecting the preposition' },
        ],
      },
      {
        id: `eng-gram-2-${classLevel}-${diffStr}`,
        missionId,
        missionTitle: 'Foundational Grammar',
        developmentalBand: band,
        prompt: 'Choose the correct word to complete the sentence.',
        context: 'Yesterday, my friends and I _____ to the park after school.',
        scenarioState: {},
        mutableStateKeys: [],
        options: [
          { id: 'opt1', label: 'went', evidence: [{ competency: 'understanding', earnedWeight: 1, availableWeight: 1 }] },
          { id: 'opt2', label: 'go', evidence: [{ competency: 'understanding', earnedWeight: 0, availableWeight: 1 }], misconception: 'present tense' },
          { id: 'opt3', label: 'going', evidence: [{ competency: 'understanding', earnedWeight: 0, availableWeight: 1 }], misconception: 'incomplete continuous' },
          { id: 'opt4', label: 'gone', evidence: [{ competency: 'understanding', earnedWeight: 0, availableWeight: 1 }], misconception: 'past participle without auxiliary' },
        ],
      },
      {
        id: `eng-gram-3-${classLevel}-${diffStr}`,
        missionId,
        missionTitle: 'Foundational Grammar',
        developmentalBand: band,
        prompt: 'Which of the following is a complete and correct sentence?',
        context: 'Select the best option.',
        scenarioState: {},
        mutableStateKeys: [],
        options: [
          { id: 'opt1', label: 'The bright sun shines in the sky.', evidence: [{ competency: 'understanding', earnedWeight: 1, availableWeight: 1 }] },
          { id: 'opt2', label: 'Shines in the sky bright.', evidence: [{ competency: 'understanding', earnedWeight: 0, availableWeight: 1 }], misconception: 'incorrect word order' },
          { id: 'opt3', label: 'The bright sun.', evidence: [{ competency: 'understanding', earnedWeight: 0, availableWeight: 1 }], misconception: 'sentence fragment, missing verb' },
          { id: 'opt4', label: 'Sun the bright shines.', evidence: [{ competency: 'understanding', earnedWeight: 0, availableWeight: 1 }], misconception: 'jumbled structure' },
        ],
      },
    ];
  }

  if (missionId === 'eng-synthesis-1') {
    return [
      {
        id: `eng-syn-1-${classLevel}-${diffStr}`,
        missionId,
        missionTitle: 'Cross-Text Synthesis',
        developmentalBand: band,
        prompt: 'Synthesize the two viewpoints on algorithmic language generation.',
        context: 'Perspective A argues that natural language processing democratizes technical communication by converting complex data into clear prose. Perspective B cautions that relying on pre-computed syntactic models reduces linguistic nuance and critical reflection.',
        scenarioState: {},
        mutableStateKeys: [],
        options: [
          { id: 'opt1', label: 'Automated synthesis expands operational accessibility but risks diluting depth of personal critique.', evidence: [{ competency: 'synthesis', earnedWeight: 1, availableWeight: 1 }] },
          { id: 'opt2', label: 'Language models should be banned across all professional technical writing.', evidence: [{ competency: 'synthesis', earnedWeight: 0, availableWeight: 1 }] },
          { id: 'opt3', label: 'Linguistic nuance has no functional value in scientific reports.', evidence: [{ competency: 'synthesis', earnedWeight: 0, availableWeight: 1 }] },
          { id: 'opt4', label: 'Both authors agree that algorithmic syntax is superior to human composition in every genre.', evidence: [{ competency: 'synthesis', earnedWeight: 0, availableWeight: 1 }] },
        ],
      },
      {
        id: `eng-syn-2-${classLevel}-${diffStr}`,
        missionId,
        missionTitle: 'Cross-Text Synthesis',
        developmentalBand: band,
        prompt: 'What underlying principle unites both ecological reports?',
        context: 'Report 1: Urban wetlands naturally filter nitrogen runoff before it enters estuaries. Report 2: Coastal mangrove buffers reduce storm surge impact on shoreline settlements by up to 65%.',
        scenarioState: {},
        mutableStateKeys: [],
        options: [
          { id: 'opt1', label: 'Preserved natural ecosystems provide cost-effective infrastructure defense against environmental hazards.', evidence: [{ competency: 'synthesis', earnedWeight: 1, availableWeight: 1 }] },
          { id: 'opt2', label: 'Estuaries require concrete seawalls to resist nitrogen saturation.', evidence: [{ competency: 'synthesis', earnedWeight: 0, availableWeight: 1 }] },
          { id: 'opt3', label: 'Wetlands only thrive in high-latitude geographical zones.', evidence: [{ competency: 'synthesis', earnedWeight: 0, availableWeight: 1 }] },
          { id: 'opt4', label: 'Storm surges are primarily driven by agricultural runoff.', evidence: [{ competency: 'synthesis', earnedWeight: 0, availableWeight: 1 }] },
        ],
      },
      {
        id: `eng-syn-3-${classLevel}-${diffStr}`,
        missionId,
        missionTitle: 'Cross-Text Synthesis',
        developmentalBand: band,
        prompt: 'Evaluate the author’s rhetorical strategy in comparing the human brain to an ancient library.',
        context: 'Excerpt: "Our memories do not reside in orderly digital folders; they are like ancient scrolls in an unlit labyrinth, where each retrieval alters the parchment slightly and cross-links distant corridors."',
        scenarioState: {},
        mutableStateKeys: [],
        options: [
          { id: 'opt1', label: 'The metaphor conveys the dynamic, reconstructive, and imperfect nature of biological recall.', evidence: [{ competency: 'evaluatingReflecting', earnedWeight: 1, availableWeight: 1 }] },
          { id: 'opt2', label: 'It proves that ancient libraries possessed more accurate storage than modern cloud servers.', evidence: [{ competency: 'evaluatingReflecting', earnedWeight: 0, availableWeight: 1 }] },
          { id: 'opt3', label: 'It demonstrates that memory retrieval causes permanent physical brain damage.', evidence: [{ competency: 'evaluatingReflecting', earnedWeight: 0, availableWeight: 1 }] },
          { id: 'opt4', label: 'It serves as literal advice for historians indexing fragile papyrus manuscripts.', evidence: [{ competency: 'evaluatingReflecting', earnedWeight: 0, availableWeight: 1 }] },
        ],
      },
    ];
  }

  // eng-reading-comp-1 (default)
  return [
    {
      id: `eng-read-1-${classLevel}-${diffStr}`,
      missionId,
      missionTitle: 'Reading Comprehension',
      developmentalBand: band,
      prompt: 'What was the primary incentive for constructing the subterranean research observatory?',
      context: 'Deep within the dormant salt mine, two kilometers beneath the surface, physicists built the detector array. The dense rock overhead blocks cosmic rays that would otherwise drown out the faint signatures of rare particle collisions.',
      scenarioState: {},
      mutableStateKeys: [],
      options: [
        { id: 'opt1', label: 'To shield delicate sensors from cosmic radiation using the rock mass above', evidence: [{ competency: 'understanding', earnedWeight: 1, availableWeight: 1 }] },
        { id: 'opt2', label: 'Because mining salt is essential for particle collision reactions', evidence: [{ competency: 'understanding', earnedWeight: 0, availableWeight: 1 }] },
        { id: 'opt3', label: 'To avoid local zoning regulations on surface electrical power', evidence: [{ competency: 'understanding', earnedWeight: 0, availableWeight: 1 }] },
        { id: 'opt4', label: 'Because underground temperatures remain absolute zero year-round', evidence: [{ competency: 'understanding', earnedWeight: 0, availableWeight: 1 }] },
      ],
    },
    {
      id: `eng-read-2-${classLevel}-${diffStr}`,
      missionId,
      missionTitle: 'Reading Comprehension',
      developmentalBand: band,
      prompt: 'According to the schedule, what is the maximum duration allocated for the preliminary calibration sweep?',
      context: 'Observatory Timetable: System Diagnostics: 06:00–07:15. Calibration Sweep: 07:15–08:45. Data Acquisition: 09:00–18:00.',
      scenarioState: {},
      mutableStateKeys: [],
      options: [
        { id: 'opt1', label: '90 minutes (07:15 to 08:45)', evidence: [{ competency: 'locatingInformation', earnedWeight: 1, availableWeight: 1 }] },
        { id: 'opt2', label: '75 minutes', evidence: [{ competency: 'locatingInformation', earnedWeight: 0, availableWeight: 1 }] },
        { id: 'opt3', label: '9 hours', evidence: [{ competency: 'locatingInformation', earnedWeight: 0, availableWeight: 1 }] },
        { id: 'opt4', label: '15 minutes', evidence: [{ competency: 'locatingInformation', earnedWeight: 0, availableWeight: 1 }] },
      ],
    },
    {
      id: `eng-read-3-${classLevel}-${diffStr}`,
      missionId,
      missionTitle: 'Reading Comprehension',
      developmentalBand: band,
      prompt: 'What tone does the narrator maintain in describing the decommissioning of the old telescope?',
      context: 'As the dome slit slid shut for the final time, no speeches were made. Technicians simply labeled the power disconnect switches, unplugged the cryogenic coolers, and stepped into the crisp mountain night without looking back.',
      scenarioState: {},
      mutableStateKeys: [],
      options: [
        { id: 'opt1', label: 'Quiet, understated dignity and pragmatic finality', evidence: [{ competency: 'understanding', earnedWeight: 1, availableWeight: 1 }] },
        { id: 'opt2', label: 'Bitterness and resentment toward laboratory management', evidence: [{ competency: 'understanding', earnedWeight: 0, availableWeight: 1 }] },
        { id: 'opt3', label: 'Festive jubilation and uncritical excitement', evidence: [{ competency: 'understanding', earnedWeight: 0, availableWeight: 1 }] },
        { id: 'opt4', label: 'Panic over impending equipment malfunction', evidence: [{ competency: 'understanding', earnedWeight: 0, availableWeight: 1 }] },
      ],
    },
  ];
}
