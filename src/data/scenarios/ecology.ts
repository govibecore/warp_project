import { blueprint, o, variant, type ItemBlueprint } from './builder';

/** Mission: Conservation & Biology */
export const ecologyBlueprints: readonly ItemBlueprint[] = [
  blueprint(
    'eco-0',
    'stem-ecology',
    'Conservation & Biology',
    ['NGSS SEP4: Analysing & interpreting data', 'PISA 2025 C2: Enquiry & data'],
    { dataPoints: 100 },
    {
      '3-4': variant(
        'The class counted birds at the feeder every Monday for ten weeks. How can we see the pattern in our counts?',
        'The counts are written on ten slips of paper: 3, 8, 5, 12, 9, 7, 15, 11, 6, 10.',
        'A picture of the numbers is easier to read than the numbers alone.',
        [
          o('eco-0-a', 'Make a bar graph of the counts, week by week, and look for the rise and fall.', 'computationalThinking', 'scientificInquiry', 10),
          o('eco-0-b', 'Add all the counts into one big total.', 'computationalThinking', 'scientificInquiry', 3, 'a total shows how values change over time'),
          o('eco-0-c', 'Keep only the biggest count; it tells the most.', 'computationalThinking', 'scientificInquiry', 1, 'the extreme value represents the whole'),
          o('eco-0-d', 'Read the slips again until we remember them by heart.', 'computationalThinking', 'scientificInquiry', 0, 'memory beats records'),
        ],
      ),
      '5-6': variant(
        'A turtle wears a tag that drops one dot on a map each day. How do we turn 90 dots into its migration story?',
        'The dots cover three months and hundreds of kilometres of ocean.',
        'Order matters: which dot came first, and where do dots crowd together?',
        [
          o('eco-0-a', 'Plot the dots in date order and mark where they cluster - the path and the resting spots appear.', 'computationalThinking', 'scientificInquiry', 10),
          o('eco-0-b', 'Draw one straight line from the first dot to the last.', 'computationalThinking', 'scientificInquiry', 2, 'the shortest path summary is the true path'),
          o('eco-0-c', 'Average all the positions to find where the turtle lived.', 'computationalThinking', 'scientificInquiry', 4, 'an average position represents a journey'),
          o('eco-0-d', 'Count the dots; ninety dots means ninety kilometres.', 'computationalThinking', 'scientificInquiry', 1, 'count of measurements equals distance'),
        ],
      ),
      '7-8': variant(
        'GPS collars record a deer\'s position every 4 hours. Which analysis turns the fixes into a reliable migration route?',
        'Some fixes are faulty - a few land in the sea or inside towns.',
        'Clean first, then look for structure: stopovers and travel legs.',
        [
          o('eco-0-a', 'Filter impossible fixes, then cluster daily positions to separate stopover sites from travel legs.', 'computationalThinking', 'scientificInquiry', 10),
          o('eco-0-b', 'Connect every fix in time order and trust the line, faults included.', 'computationalThinking', 'scientificInquiry', 4, 'more data points means cleaner data'),
          o('eco-0-c', 'Average the latitude and longitude of each month.', 'computationalThinking', 'scientificInquiry', 3, 'an average position represents a journey'),
          o('eco-0-d', 'Keep only the first and last fix; migration is start and end.', 'computationalThinking', 'scientificInquiry', 1, 'endpoints tell the whole story'),
        ],
      ),
      '9-10': variant(
        'Tracking the migration pattern of a keystone species. What data analysis method yields the best predictive model?',
        'GPS collars provide coordinates every 4 hours, with measurement error and gaps.',
        'You want structure (stopovers, corridors) that generalises to next season.',
        [
          o('eco-0-a', 'Use a machine learning clustering algorithm to identify geographic hotspots over time.', 'computationalThinking', 'scientificInquiry', 10),
          o('eco-0-b', 'Draw a straight line from the start to the end point.', 'computationalThinking', 'scientificInquiry', 2, 'the shortest path summary is the true path'),
          o('eco-0-c', 'Calculate the average latitude and longitude for the month.', 'computationalThinking', 'scientificInquiry', 4, 'an average position represents a journey'),
          o('eco-0-d', 'Plot the points on a map and estimate the path visually.', 'computationalThinking', 'scientificInquiry', 6),
        ],
      ),
      '11-12': variant(
        'Build a predictive movement model from 4-hour GPS fixes. What must the method respect?',
        'Consecutive fixes are autocorrelated; the goal is a model that predicts held-out seasons, not one that retraces this one.',
        'Beware treating correlated samples as independent evidence.',
        [
          o('eco-0-a', 'Segment the trajectory with a state-space or clustering model, and validate on a held-out season - consecutive fixes are not independent samples.', 'computationalThinking', 'scientificInquiry', 10),
          o('eco-0-b', 'Fit the tightest curve through every fix; lowest error on this track is best.', 'computationalThinking', 'scientificInquiry', 3, 'fitting the past perfectly predicts the future'),
          o('eco-0-c', 'Regress position on time using all fixes as independent points.', 'computationalThinking', 'scientificInquiry', 5, 'more data points means cleaner data'),
          o('eco-0-d', 'Extrapolate the first-to-last bearing as a great-circle route.', 'computationalThinking', 'scientificInquiry', 2, 'the shortest path summary is the true path'),
        ],
      ),
    },
  ),
  blueprint(
    'eco-1',
    'stem-ecology',
    'Conservation & Biology',
    ['NGSS SEP3: Planning investigations', 'PISA 2025 C2: Enquiry & data'],
    { algae: 'high' },
    {
      '3-4': variant(
        'The pond water turned green and slimy. Two places might be the cause: a farm field and a car wash. How can we find out which one?',
        'Rain washes water from both places into the pond.',
        'Test the water before and after each place, and compare.',
        [
          o('eco-1-a', 'Collect water above and below each place and compare what is in it.', 'scientificInquiry', 'systemsThinking', 10),
          o('eco-1-b', 'Blame the bigger building - bigger places cause bigger problems.', 'scientificInquiry', 'systemsThinking', 1, 'the bigger source is always the guilty one'),
          o('eco-1-c', 'Take one scoop from the greenest spot in the pond.', 'scientificInquiry', 'systemsThinking', 4, 'one sample from the middle explains the cause'),
          o('eco-1-d', 'Taste a drop of the water to check.', 'scientificInquiry', 'systemsThinking', 0, 'tasting unknown water is a safe test'),
        ],
      ),
      '5-6': variant(
        'Algae is smothering the lake. Fertiliser from farms and soap from a car wash are both suspects. What test is fairest?',
        'Both fertiliser and soap can feed algae with nutrients like nitrogen and phosphorus.',
        'A fair test measures the same thing at the same times for both suspects.',
        [
          o('eco-1-a', 'Measure nutrient levels upstream and downstream of both places on several different days.', 'scientificInquiry', 'systemsThinking', 10),
          o('eco-1-b', 'Test the lake once, right at the greenest patch.', 'scientificInquiry', 'systemsThinking', 3, 'one sample from the middle explains the cause'),
          o('eco-1-c', 'Blame the farm, because chemicals from fields sound worse.', 'scientificInquiry', 'systemsThinking', 1, 'the scariest-sounding source is the guilty one'),
          o('eco-1-d', 'Wait for the algae to die, then weigh the dead algae.', 'scientificInquiry', 'systemsThinking', 2, 'the dead residue identifies the living cause'),
        ],
      ),
      '7-8': variant(
        'A river ecosystem is experiencing frequent algal blooms. What is the most rigorous way to determine the cause?',
        'Agricultural runoff and a nearby factory are both suspects.',
        'Design for comparison: sources, locations, and time.',
        [
          o('eco-1-a', 'Sample nitrogen and phosphorus levels upstream and downstream of both sources over a month.', 'scientificInquiry', 'systemsThinking', 10),
          o('eco-1-b', 'Assume the factory is the cause due to chemical pollution.', 'scientificInquiry', 'systemsThinking', 2, 'the industrial source always outranks the agricultural one'),
          o('eco-1-c', 'Wait until the bloom dies off and measure the dead biomass.', 'scientificInquiry', 'systemsThinking', 4),
          o('eco-1-d', 'Test a single water sample from the center of the algal bloom.', 'scientificInquiry', 'systemsThinking', 5, 'one sample from the middle explains the cause'),
        ],
      ),
      '9-10': variant(
        'Design the sampling study that could actually attribute a bloom to farm runoff rather than factory discharge.',
        'Both sources add nitrogen and phosphorus; rainfall confounds both by washing nutrients in.',
        'You need replication, a control, and the same method at every site.',
        [
          o('eco-1-a', 'Paired upstream/downstream N and P sampling at both sources across several weeks, plus a control tributary with neither source.', 'scientificInquiry', 'systemsThinking', 10),
          o('eco-1-b', 'One well-timed sample after heavy rain - if levels spike, the cause is proven.', 'scientificInquiry', 'systemsThinking', 3, 'a single measurement establishes cause'),
          o('eco-1-c', 'Weekly samples at the bloom centre, where the effect is largest.', 'scientificInquiry', 'systemsThinking', 4, 'measuring the effect locates the cause'),
          o('eco-1-d', 'Compare this year\'s bloom map with last year\'s rainfall map.', 'scientificInquiry', 'systemsThinking', 5, 'correlation establishes causation'),
        ],
      ),
      '11-12': variant(
        'Which design gives defensible evidence of causation for a nutrient-driven bloom?',
        'Farm runoff is diffuse; factory discharge is a point source. Regulators need attribution that survives challenge.',
        'Think BACI: Before/After, Control/Impact.',
        [
          o('eco-1-a', 'A BACI design with replicated N:P ratios at impact and control sites, before and after discharge events - timing correlation alone is not causation.', 'scientificInquiry', 'systemsThinking', 10),
          o('eco-1-b', 'Show bloom timing correlates with factory shift schedules.', 'scientificInquiry', 'systemsThinking', 4, 'correlation establishes causation'),
          o('eco-1-c', 'Demonstrate high nutrients downstream of both sources once each.', 'scientificInquiry', 'systemsThinking', 5, 'a single measurement establishes cause'),
          o('eco-1-d', 'Survey residents on which source they believe is responsible.', 'scientificInquiry', 'systemsThinking', 1, 'consensus of opinion locates the cause'),
        ],
      ),
    },
  ),
  blueprint(
    'eco-2',
    'stem-ecology',
    'Conservation & Biology',
    ['NGSS SEP2: Developing & using models', 'PISA 2025 C1: Explain phenomena'],
    { canopy: 0 },
    {
      '3-4': variant(
        'After a fire burned the grassland, which plants will come back first?',
        'The ground is open and sunny, covered in ash.',
        'Which plants love open sun and grow the fastest?',
        [
          o('eco-2-a', 'Fast-growing grasses and weeds whose seeds love sun and ash-rich soil.', 'systemsThinking', 'scientificInquiry', 10),
          o('eco-2-b', 'Big shady trees first - the biggest plants always win.', 'systemsThinking', 'scientificInquiry', 2, 'the biggest plants always win'),
          o('eco-2-c', 'Nothing, until people come and plant new seeds.', 'systemsThinking', 'scientificInquiry', 1, 'nature needs humans to recover'),
          o('eco-2-d', 'Cactuses, because fires make deserts.', 'systemsThinking', 'scientificInquiry', 0, 'fires turn land into desert'),
        ],
      ),
      '5-6': variant(
        'A fire cleared a forest patch. Which plants will dominate the first few years, and why?',
        'The soil is rich in ash but there is no shade anywhere yet.',
        'Some plants are built to race into open, sunny gaps.',
        [
          o('eco-2-a', 'Pioneer species - fast weeds and grasses that love full sun and ash nutrients.', 'systemsThinking', 'scientificInquiry', 10),
          o('eco-2-b', 'Climax hardwood trees - the ash gives them deep food immediately.', 'systemsThinking', 'scientificInquiry', 3, 'succession starts with the final community'),
          o('eco-2-c', 'Nothing until rangers reseed the area by hand.', 'systemsThinking', 'scientificInquiry', 1, 'nature needs humans to recover'),
          o('eco-2-d', 'Mushrooms only, since they do not need sunlight.', 'systemsThinking', 'scientificInquiry', 4),
        ],
      ),
      '7-8': variant(
        'A forest fire recently cleared a large area. Which species type will dominate first, and why?',
        'The soil is rich in ash but lacks canopy cover.',
        'Think life-history strategy: who wins when light is free and competition is gone?',
        [
          o('eco-2-a', 'Pioneer species (fast-growing weeds/grasses) that thrive in direct sunlight.', 'systemsThinking', 'scientificInquiry', 10),
          o('eco-2-b', 'Climax species (hardwood trees) because the ash provides deep nutrients.', 'systemsThinking', 'scientificInquiry', 3, 'succession starts with the final community'),
          o('eco-2-c', 'Fungi, because they don\'t need sunlight to grow.', 'systemsThinking', 'scientificInquiry', 5),
          o('eco-2-d', 'No species will grow until humans reseed the area.', 'systemsThinking', 'scientificInquiry', 1, 'nature needs humans to recover'),
        ],
      ),
      '9-10': variant(
        'Predict the first stage of secondary succession after a severe fire, and its effect on later stages.',
        'Ash raises available nutrients; the seed bank partly survives; there is no canopy.',
        'The first colonists change the soil the next colonists will meet.',
        [
          o('eco-2-a', 'Ruderal pioneers first - full sun and ash nutrients - and their litter rebuilds soil organic matter for the shrubs that follow.', 'systemsThinking', 'scientificInquiry', 10),
          o('eco-2-b', 'Shade-tolerant climax trees first, because their seeds have the largest food stores.', 'systemsThinking', 'scientificInquiry', 3, 'succession starts with the final community'),
          o('eco-2-c', 'A fungal mat that keeps plants out for decades.', 'systemsThinking', 'scientificInquiry', 2, 'decomposers block plant growth'),
          o('eco-2-d', 'Bare ground for many years until birds carry in every seed.', 'systemsThinking', 'scientificInquiry', 4, 'no seed bank survives fire'),
        ],
      ),
      '11-12': variant(
        'Two burnt plots, same valley: one becomes grassland, one resprouts shrubland. What does this tell a restoration ecologist about succession?',
        'Fire severity differed between plots; in one, the soil seed bank and root crowns survived.',
        'Succession is not a fixed ladder - the starting state steers the path.',
        [
          o('eco-2-a', 'Trajectory depends on the surviving propagules and fire severity - model state-dependent pathways rather than one inevitable climax.', 'systemsThinking', 'scientificInquiry', 10),
          o('eco-2-b', 'The grassland plot is simply younger; both will converge on the same forest.', 'systemsThinking', 'scientificInquiry', 3, 'succession always climbs to one climax'),
          o('eco-2-c', 'The shrub plot must have been replanted by people.', 'systemsThinking', 'scientificInquiry', 1, 'nature needs humans to recover'),
          o('eco-2-d', 'Ash chemistry fully determines which plants return.', 'systemsThinking', 'scientificInquiry', 4, 'one factor determines a community'),
        ],
      ),
    },
  ),
  blueprint(
    'eco-3',
    'stem-ecology',
    'Conservation & Biology',
    ['NGSS SEP5: Mathematics & computational thinking', 'PISA 2025 C2: Enquiry & data'],
    { tags: 50 },
    {
      '3-4': variant(
        'How can we guess how many marbles are in a big jar without counting every one?',
        'The jar is too full to count by eye, and spilling it everywhere is not allowed.',
        'A small scoop can stand in for the whole jar.',
        [
          o('eco-3-a', 'Scoop out one small cup, count it, and use the scoop to estimate the whole jar.', 'mathematicalReasoning', 'computationalThinking', 10),
          o('eco-3-b', 'Count only the marbles touching the glass and call that the total.', 'mathematicalReasoning', 'computationalThinking', 1, 'the visible part is the whole'),
          o('eco-3-c', 'Shake the jar and guess by the sound.', 'mathematicalReasoning', 'computationalThinking', 0, 'sound reveals quantity'),
          o('eco-3-d', 'Guess any big number - one guess is as good as another.', 'mathematicalReasoning', 'computationalThinking', 0, 'any guess is as good as a method'),
        ],
      ),
      '5-6': variant(
        'Rangers want to know how many fish live in a pond without draining it. What is their trick?',
        'They can catch fish gently, mark them with a harmless tag, and let them go.',
        'Catch, mark, release - then catch again and see what fraction is already marked.',
        [
          o('eco-3-a', 'Mark some fish, release them, then catch a second sample - the fraction of marked fish tells you the total.', 'mathematicalReasoning', 'computationalThinking', 10),
          o('eco-3-b', 'Count the fish near the shore and multiply by the pond\'s size.', 'mathematicalReasoning', 'computationalThinking', 4, 'fish spread perfectly evenly'),
          o('eco-3-c', 'Count fish trails in the mud and divide by two.', 'mathematicalReasoning', 'computationalThinking', 1, 'every animal leaves a fixed number of countable traces'),
          o('eco-3-d', 'Watch one spot for an hour and count what swims past.', 'mathematicalReasoning', 'computationalThinking', 3, 'one spot represents the whole pond'),
        ],
      ),
      '7-8': variant(
        'You want to estimate a deer population without counting every individual. Which mathematical method is standard?',
        'You have cameras and tagging equipment.',
        'Mark, remix, recapture - the recapture fraction scales the estimate.',
        [
          o('eco-3-a', 'The Lincoln-Petersen mark-recapture estimator (N = (M*C)/R).', 'mathematicalReasoning', 'computationalThinking', 10),
          o('eco-3-b', 'Count the deer in a 1-acre square and multiply by total acres.', 'mathematicalReasoning', 'computationalThinking', 6, 'animals spread perfectly evenly'),
          o('eco-3-c', 'Count the number of tracks and divide by four.', 'mathematicalReasoning', 'computationalThinking', 2, 'every animal leaves a fixed number of countable traces'),
          o('eco-3-d', 'Set up a camera trap and count every deer that walks past in 24 hours.', 'mathematicalReasoning', 'computationalThinking', 4),
        ],
      ),
      '9-10': variant(
        'A team marks 50 deer (M), later samples 80 (C) and finds 10 marked (R). Estimate N - and name one assumption the estimate rests on.',
        'Lincoln–Petersen: N = (M × C) / R.',
        'What must be true about births, deaths, and mixing between the two samples?',
        [
          o('eco-3-a', 'N ≈ (50 × 80) / 10 = 400, assuming a closed, well-mixed population between samples.', 'mathematicalReasoning', 'computationalThinking', 10),
          o('eco-3-b', 'N ≈ 50 + 80 − 10 = 120 unique deer seen.', 'mathematicalReasoning', 'computationalThinking', 3, 'the sample is the population'),
          o('eco-3-c', 'N ≈ 80 × 10 = 800.', 'mathematicalReasoning', 'computationalThinking', 4),
          o('eco-3-d', 'N ≈ (50 × 10) / 80 ≈ 6.', 'mathematicalReasoning', 'computationalThinking', 1, 'inverting the fraction changes nothing'),
        ],
      ),
      '11-12': variant(
        'Mark-recapture estimates N at 400, but camera data suggest some deer avoid traps. How should the estimate be qualified?',
        'Lincoln–Petersen assumes equal catchability; trap-shy individuals violate it.',
        'Ask how unequal catchability affects the estimate depending on the capture mechanism.',
        [
          o('eco-3-a', 'Report N with the Chapman correction and flag potential bias - differential catchability can skew the estimate, with its direction depending on the capture mechanism.', 'mathematicalReasoning', 'computationalThinking', 10),
          o('eco-3-b', 'Report 400 exactly; the formula handles behaviour automatically.', 'mathematicalReasoning', 'computationalThinking', 2, 'a formula absorbs its own violated assumptions'),
          o('eco-3-c', 'Double the estimate, since every unseen deer has a partner.', 'mathematicalReasoning', 'computationalThinking', 1, 'guessing a correction factor is rigorous'),
          o('eco-3-d', 'Switch to counting tracks and dividing by four, which avoids traps entirely.', 'mathematicalReasoning', 'computationalThinking', 3, 'every animal leaves a fixed number of countable traces'),
        ],
      ),
    },
  ),
  blueprint(
    'eco-4',
    'stem-ecology',
    'Conservation & Biology',
    ['NGSS SEP6: Constructing explanations', 'PISA 2025 C1: Explain phenomena'],
    { ph: 7.9 },
    {
      '3-4': variant(
        'In class, a seashell left in sour water (like vinegar) gets weaker and chalky. Coral animals build shell-like skeletons. What will more sour ocean water do to coral?',
        'The ocean is slowly getting more sour as it takes in extra carbon dioxide.',
        'Remember what the sour water did to the seashell.',
        [
          o('eco-4-a', 'It makes it harder for coral to build its skeleton.', 'scientificInquiry', 'systemsThinking', 10),
          o('eco-4-b', 'It burns the coral\'s skin off, like juice stinging a cut.', 'scientificInquiry', 'systemsThinking', 3, 'acid always burns living things on contact'),
          o('eco-4-c', 'It makes coral grow faster, like fertiliser.', 'scientificInquiry', 'systemsThinking', 1, 'more of a chemical always helps growth'),
          o('eco-4-d', 'It makes the water too cold for coral.', 'scientificInquiry', 'systemsThinking', 2, 'acid makes water colder'),
        ],
      ),
      '5-6': variant(
        'Chalk fizzes and crumbles in vinegar. Coral skeletons are made of a similar material. What does extra carbon dioxide in seawater threaten?',
        'CO₂ dissolving in water makes it slightly more acidic year by year.',
        'If vinegar weakens chalk, what does a more acidic ocean do to a skeleton?',
        [
          o('eco-4-a', 'The coral\'s skeleton-building: more acidic water makes the building material harder to make and easier to dissolve.', 'scientificInquiry', 'systemsThinking', 10),
          o('eco-4-b', 'The coral\'s colour only - acid bleaches it like a stain.', 'scientificInquiry', 'systemsThinking', 3, 'acidification and bleaching are the same process'),
          o('eco-4-c', 'Nothing - the ocean is so big it cannot change.', 'scientificInquiry', 'systemsThinking', 1, 'big systems cannot be changed by people'),
          o('eco-4-d', 'The fish, which forget how to swim in sour water.', 'scientificInquiry', 'systemsThinking', 0, 'sour water makes fish forget how to swim'),
        ],
      ),
      '7-8': variant(
        'A coral reef is dying due to ocean acidification. How does lower pH affect the coral?',
        'Corals build their skeletons from calcium carbonate.',
        'Carbonate ions are the bricks; acid removes bricks.',
        [
          o('eco-4-a', 'Acidic water reduces available carbonate ions, hindering calcification.', 'scientificInquiry', 'systemsThinking', 10),
          o('eco-4-b', 'The acid directly burns the soft tissue of the coral polyps.', 'scientificInquiry', 'systemsThinking', 4, 'acid always burns living things on contact'),
          o('eco-4-c', 'It causes the water to become too warm for the algae to survive.', 'scientificInquiry', 'systemsThinking', 2, 'acidification and warming are the same process'),
          o('eco-4-d', 'It makes the coral grow too fast, resulting in brittle structures.', 'scientificInquiry', 'systemsThinking', 1, 'more of a chemical always helps growth'),
        ],
      ),
      '9-10': variant(
        'Explain the carbonate-chemistry pathway from dissolved CO₂ to slower reef growth.',
        'CO₂ + H₂O ⇌ carbonic acid; H⁺ shifts CO₃²⁻ toward HCO₃⁻; corals precipitate aragonite (CaCO₃).',
        'Follow the ions: which one do corals actually spend, and what happens to its concentration?',
        [
          o('eco-4-a', 'Added H⁺ converts carbonate ions to bicarbonate, lowering the aragonite saturation state, so calcification costs more energy and slows.', 'scientificInquiry', 'systemsThinking', 10),
          o('eco-4-b', 'Acid molecules physically melt finished skeleton on contact like hot water on sugar.', 'scientificInquiry', 'systemsThinking', 3, 'acid always burns living things on contact'),
          o('eco-4-c', 'Dissolved CO₂ feeds the zooxanthellae, so the reef actually benefits until it overheats.', 'scientificInquiry', 'systemsThinking', 2, 'a fertiliser effect cancels a chemistry effect'),
          o('eco-4-d', 'Lower pH bleaches coral directly by stripping its pigments.', 'scientificInquiry', 'systemsThinking', 4, 'acidification and bleaching are the same process'),
        ],
      ),
      '11-12': variant(
        'A council asks whether "the ocean is naturally buffered, so acidification is exaggerated". What is the scientifically correct reply?',
        'Buffers resist pH change but do not prevent it; reefs sit near the aragonite saturation threshold already.',
        'Distinguish slowing a change from stopping it - and check where coral calcification sits relative to the threshold.',
        [
          o('eco-4-a', 'Buffering slows but does not stop the shift: measured pH and aragonite saturation are already falling, and calcification responds to saturation state, not to the word "buffered".', 'scientificInquiry', 'systemsThinking', 10),
          o('eco-4-b', 'Agree - a buffered system cannot change pH at all.', 'scientificInquiry', 'systemsThinking', 1, 'buffers make chemical change impossible'),
          o('eco-4-c', 'Disagree only because acid burns polyps on contact.', 'scientificInquiry', 'systemsThinking', 3, 'acid always burns living things on contact'),
          o('eco-4-d', 'Agree - but only because warming, not chemistry, matters for reefs.', 'scientificInquiry', 'systemsThinking', 2, 'acidification and warming are the same process'),
        ],
      ),
    },
  ),
];
