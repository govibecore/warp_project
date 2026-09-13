import type { AssessmentItem, Difficulty } from '../../domain/types';

export const ENGLISH_MISSION_IDS = [
  'eng-reading-comp-1',
  'eng-synthesis-1',
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
