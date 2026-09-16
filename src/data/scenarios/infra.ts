import { blueprint, o, variant, type ItemBlueprint } from './builder';

/** Mission: Urban Planning & Infrastructure */
export const infraBlueprints: readonly ItemBlueprint[] = [
  blueprint(
    'inf-0',
    'stem-infra',
    'Urban Planning & Infrastructure',
    ['NGSS SEP2: Developing & using models', 'PISA 2025 C3: Decide with evidence'],
    { traffic: 'high' },
    {
      '3-4': variant(
        'Two busy paths cross in the playground and children keep bumping into each other. What would help most?',
        'Everyone is in a hurry at break time, and some children run.',
        'What if everyone walked around the crossing in the same direction?',
        [
          o('inf-0-a', 'Paint a small circle so everyone walks around it in the same direction.', 'systemsThinking', 'engineeringDesign', 10),
          o('inf-0-b', 'Tell everyone to run faster so they spend less time crossing.', 'systemsThinking', 'engineeringDesign', 1, 'more speed fixes crowding'),
          o('inf-0-c', 'Close one of the paths forever.', 'systemsThinking', 'engineeringDesign', 3),
          o('inf-0-d', 'Ask a teacher to stand there and shout "stop" all break.', 'systemsThinking', 'engineeringDesign', 4),
        ],
      ),
      '5-6': variant(
        'Every morning, cars and students jam the school gate. What layout change would help most?',
        'Cars stop anywhere to drop students, blocking each other and the crossing.',
        'Think about giving every movement its own space and direction.',
        [
          o('inf-0-a', 'Make a one-way drop-off loop with a marked walking path, so cars and students stop crossing each other.', 'systemsThinking', 'engineeringDesign', 10),
          o('inf-0-b', 'Ask drivers to be more careful and honk less.', 'systemsThinking', 'engineeringDesign', 3, 'asking nicely changes traffic flow'),
          o('inf-0-c', 'Open the gate earlier so the jam lasts longer but slower.', 'systemsThinking', 'engineeringDesign', 4),
          o('inf-0-d', 'Ban students from walking to school.', 'systemsThinking', 'engineeringDesign', 0, 'removing users fixes the crossing'),
        ],
      ),
      '7-8': variant(
        'Redesigning a city intersection to improve traffic flow and pedestrian safety. What is the optimal solution?',
        'Current traffic lights cause 15-minute delays.',
        'Count where paths cross - every crossing point is a crash risk.',
        [
          o('inf-0-a', 'Replace the intersection with a multi-lane roundabout and dedicated pedestrian underpasses.', 'systemsThinking', 'engineeringDesign', 10),
          o('inf-0-b', 'Increase the green light duration for the main avenue.', 'systemsThinking', 'engineeringDesign', 4, 'favouring one direction fixes a network'),
          o('inf-0-c', 'Ban pedestrians from crossing the intersection entirely.', 'systemsThinking', 'engineeringDesign', 1, 'removing users fixes the crossing'),
          o('inf-0-d', 'Add more traffic lights to break up the flow of cars.', 'systemsThinking', 'engineeringDesign', 2, 'more control points means more flow'),
        ],
      ),
      '9-10': variant(
        'Justify a roundabout over a signalised junction for a suburban crossing with injury crashes and peak delays.',
        'A four-way signalised junction has 32 vehicle conflict points; a single-lane roundabout has 8. Crash angles differ too.',
        'Severity comes from the angle and speed of collisions, not just their count.',
        [
          o('inf-0-a', 'The roundabout: fewer conflict points, lower speeds, and glancing angles instead of right-angle impacts - plus continuous flow off-peak.', 'systemsThinking', 'engineeringDesign', 10),
          o('inf-0-b', 'Longer green phases - delay is a timing problem, not a geometry problem.', 'systemsThinking', 'engineeringDesign', 3, 'favouring one direction fixes a network'),
          o('inf-0-c', 'A flyover for through traffic on every arm.', 'systemsThinking', 'engineeringDesign', 5, 'the most expensive option is the most thorough'),
          o('inf-0-d', 'Stop signs on all four approaches.', 'systemsThinking', 'engineeringDesign', 2, 'more control points means more flow'),
        ],
      ),
      '11-12': variant(
        'Two designs remain for a failing junction: a turbo-roundabout and a fully actuated signal. How should the city choose?',
        'Peak-hour turning counts, pedestrian volumes, crash history, land cost, and a 20-year horizon are all available.',
        'Compare on measured outcomes across the whole life of the asset, not on first impressions.',
        [
          o('inf-0-a', 'Microsimulate both against measured turning counts, then weigh delay, conflict-point reduction, pedestrian level-of-service, and life-cycle cost.', 'systemsThinking', 'engineeringDesign', 10),
          o('inf-0-b', 'Pick the roundabout - modern is always safer.', 'systemsThinking', 'engineeringDesign', 4, 'the newer design is always the better design'),
          o('inf-0-c', 'Keep the signal and retime it - any change is riskier than no change.', 'systemsThinking', 'engineeringDesign', 3, 'doing nothing is the safe option'),
          o('inf-0-d', 'Choose by public vote at the next town hall.', 'systemsThinking', 'engineeringDesign', 2, 'popularity selects engineering performance'),
        ],
      ),
    },
  ),
  blueprint(
    'inf-1',
    'stem-infra',
    'Urban Planning & Infrastructure',
    ['NGSS SEP6: Designing solutions', 'PISA 2025 C1: Explain phenomena'],
    { temp: 35 },
    {
      '3-4': variant(
        'The black playground floor is much hotter than the grass in summer. What could cool the playground down?',
        'On sunny afternoons, children avoid the dark areas and crowd onto the grass.',
        'Light colours bounce sunshine away; trees give shade and breathe out water.',
        [
          o('inf-1-a', 'Paint the floor a light colour and plant shady trees.', 'engineeringDesign', 'systemsThinking', 10),
          o('inf-1-b', 'Paint it even blacker so it soaks up all the heat.', 'engineeringDesign', 'systemsThinking', 1, 'absorbing more heat cools things down'),
          o('inf-1-c', 'Put big fans on poles everywhere.', 'engineeringDesign', 'systemsThinking', 4),
          o('inf-1-d', 'Play outside only at night.', 'engineeringDesign', 'systemsThinking', 0, 'avoiding the heat removes the heat'),
        ],
      ),
      '5-6': variant(
        'The city centre is 5 °C hotter than the park next to it. Which changes would cool the centre most?',
        'Roofs and roads are dark; there are few trees downtown.',
        'Dark surfaces store sunshine; trees shade and release cooling water vapour.',
        [
          o('inf-1-a', 'Paint roofs white and plant many more street trees.', 'engineeringDesign', 'systemsThinking', 10),
          o('inf-1-b', 'Install giant outdoor air conditioners on street corners.', 'engineeringDesign', 'systemsThinking', 1, 'moving heat around removes it'),
          o('inf-1-c', 'Knock down tall buildings so wind can pass.', 'engineeringDesign', 'systemsThinking', 2, 'removing buildings removes the heat'),
          o('inf-1-d', 'Hose the streets with water every hour, forever.', 'engineeringDesign', 'systemsThinking', 4),
        ],
      ),
      '7-8': variant(
        'A city wants to reduce the "Urban Heat Island" effect. Which engineering intervention is most cost-effective?',
        'Summer temperatures in the city center are 5°C higher than the suburbs.',
        'Work with sunlight and water, not against them with machines.',
        [
          o('inf-1-a', 'Implement "cool roofs" (white reflective paint) and increase tree canopy coverage.', 'engineeringDesign', 'systemsThinking', 10),
          o('inf-1-b', 'Install giant outdoor air conditioning units on street corners.', 'engineeringDesign', 'systemsThinking', 1, 'moving heat around removes it'),
          o('inf-1-c', 'Demolish all high-rise buildings to let the wind blow through.', 'engineeringDesign', 'systemsThinking', 0, 'removing buildings removes the heat'),
          o('inf-1-d', 'Pave the streets with black asphalt to absorb the heat.', 'engineeringDesign', 'systemsThinking', 2, 'absorbing more heat cools things down'),
        ],
      ),
      '9-10': variant(
        'Explain why cool roofs plus canopy outperform mechanical cooling for heat-island relief, using the surface energy balance.',
        'Incoming shortwave radiation is split among reflection (albedo), heat storage, sensible heat, and evapotranspiration.',
        'Where does absorbed sunlight go on a dark roof versus a tree?',
        [
          o('inf-1-a', 'High albedo reflects shortwave before it becomes heat, and canopy shifts energy into evapotranspiration - both cut the sensible-heat term; outdoor AC just moves heat and adds its own.', 'engineeringDesign', 'systemsThinking', 10),
          o('inf-1-b', 'White paint insulates the roof, trapping cool air inside the building.', 'engineeringDesign', 'systemsThinking', 3, 'colour works by insulating'),
          o('inf-1-c', 'Trees cool mainly by blocking the wind that carries hot air in.', 'engineeringDesign', 'systemsThinking', 4, 'wind is the enemy of cooling'),
          o('inf-1-d', 'Outdoor AC exports heat to the upper atmosphere harmlessly.', 'engineeringDesign', 'systemsThinking', 1, 'moving heat around removes it'),
        ],
      ),
      '11-12': variant(
        'Design the measurement plan for a city\'s heat-island mitigation programme so effects are attributable, not anecdotal.',
        'Budget covers cool roofs on municipal buildings and 10,000 trees; an election is two years away.',
        'Pick the observable, the baseline, and the comparison before the first tree is planted.',
        [
          o('inf-1-a', 'Baseline land-surface temperature from satellite retrievals plus a fixed street-level sensor network, with untreated comparison districts, re-measured each summer.', 'engineeringDesign', 'systemsThinking', 10),
          o('inf-1-b', 'Survey residents each summer on whether the city feels cooler.', 'engineeringDesign', 'systemsThinking', 3, 'perception stands in for measurement'),
          o('inf-1-c', 'Measure once, at the end of the programme, at the shadiest site.', 'engineeringDesign', 'systemsThinking', 2, 'one endpoint measurement shows the trend'),
          o('inf-1-d', 'Count trees planted and roofs painted - outputs equal outcomes.', 'engineeringDesign', 'systemsThinking', 4, 'counting what you spent measures what you achieved'),
        ],
      ),
    },
  ),
  blueprint(
    'inf-2',
    'stem-infra',
    'Urban Planning & Infrastructure',
    ['NGSS SEP6: Designing solutions', 'PISA 2025 C1: Explain phenomena'],
    { soil: 'silt' },
    {
      '3-4': variant(
        'When you dig a hole in wet sand at the beach, the walls keep falling in. What helps?',
        'Dry sand holds a shape better than wet, sloppy sand.',
        'The walls need something to lean on while you dig.',
        [
          o('inf-2-a', 'Hold the walls up with something (like a bucket with no bottom) and dig gently, a little at a time.', 'engineeringDesign', 'scientificInquiry', 10),
          o('inf-2-b', 'Dig much faster so the hole is finished before it falls.', 'engineeringDesign', 'scientificInquiry', 2, 'speed beats collapse'),
          o('inf-2-c', 'Pour in more water to glue the sand together.', 'engineeringDesign', 'scientificInquiry', 1, 'wetter sand holds its shape better'),
          o('inf-2-d', 'Make the hole wider and wider as you go down.', 'engineeringDesign', 'scientificInquiry', 3),
        ],
      ),
      '5-6': variant(
        'A class tunnel dug through a box of wet soil keeps collapsing. What is the best way to keep it open?',
        'The soil is soggy, and pressing on the top makes the walls cave in.',
        'Support the roof while you dig, not after it falls.',
        [
          o('inf-2-a', 'Push a stiff tube (like a pipe) through as you dig, so the soil is always held up.', 'engineeringDesign', 'scientificInquiry', 10),
          o('inf-2-b', 'Dig the whole tunnel first, then hold it up with sticks.', 'engineeringDesign', 'scientificInquiry', 3, 'support can wait until digging is done'),
          o('inf-2-c', 'Add more water so the soil packs like clay.', 'engineeringDesign', 'scientificInquiry', 1, 'wetter soil holds its shape better'),
          o('inf-2-d', 'Dig on a hot day only, so the soil dries as you work.', 'engineeringDesign', 'scientificInquiry', 4),
        ],
      ),
      '7-8': variant(
        'A new subway line needs to cross under a river. Which tunneling technique minimizes risk of collapse in soft mud?',
        'The riverbed consists of saturated silt.',
        'The face of the tunnel must be held back with the same pressure the mud pushes in.',
        [
          o('inf-2-a', 'Use a pressurized Earth Pressure Balance Tunnel Boring Machine (EPB TBM).', 'engineeringDesign', 'scientificInquiry', 10),
          o('inf-2-b', 'Use explosives (drill and blast) to clear the mud quickly.', 'engineeringDesign', 'scientificInquiry', 1, 'force overcomes soft ground'),
          o('inf-2-c', 'Freeze the entire river and dig an open trench.', 'engineeringDesign', 'scientificInquiry', 4),
          o('inf-2-d', 'Dig a tunnel by hand using wooden supports.', 'engineeringDesign', 'scientificInquiry', 2, 'traditional methods are safest in any ground'),
        ],
      ),
      '9-10': variant(
        'Why does an Earth Pressure Balance TBM outperform open digging in saturated silt?',
        'Saturated silt flows like a heavy liquid; water pressure adds to earth pressure at the tunnel face.',
        'What happens to an unsupported face when the ground can flow?',
        [
          o('inf-2-a', 'It presses excavated muck against the face with pressure matched to earth plus water pressure, so the ground never gets a chance to flow in.', 'engineeringDesign', 'scientificInquiry', 10),
          o('inf-2-b', 'It bores so fast that collapse cannot catch up.', 'engineeringDesign', 'scientificInquiry', 2, 'speed beats collapse'),
          o('inf-2-c', 'It freezes the ground ahead with liquid nitrogen.', 'engineeringDesign', 'scientificInquiry', 4),
          o('inf-2-d', 'It drains the whole riverbed first through deep wells.', 'engineeringDesign', 'scientificInquiry', 3, 'saturated ground can simply be dried in place'),
        ],
      ),
      '11-12': variant(
        'Select the tunnelling concept for 1.2 km of saturated silt under a navigable river, with settlement-sensitive buildings above.',
        'Slurry TBMs handle high water pressure and convey hydraulically; EPB TBMs excel in silts with additives; both log face pressure continuously.',
        'Match the machine to the ground mechanics, then instrument the surface you promised to protect.',
        [
          o('inf-2-a', 'EPB or slurry TBM selected by permeability tests, with real-time face-pressure control, conditioned spoil, and a building settlement monitoring array above the alignment.', 'engineeringDesign', 'scientificInquiry', 10),
          o('inf-2-b', 'Sequential excavation (hand mining) with timber sets - flexible and proven.', 'engineeringDesign', 'scientificInquiry', 1, 'traditional methods are safest in any ground'),
          o('inf-2-c', 'Ground freezing along the full 1.2 km, then open-cut.', 'engineeringDesign', 'scientificInquiry', 3),
          o('inf-2-d', 'Immersed tube: prefabricate sections and sink them into a dredged trench.', 'engineeringDesign', 'scientificInquiry', 6),
        ],
      ),
    },
  ),
  blueprint(
    'inf-3',
    'stem-infra',
    'Urban Planning & Infrastructure',
    ['NGSS SEP2: Developing & using models', 'PISA 2025 C3: Decide with evidence'],
    { rain: 'heavy' },
    {
      '3-4': variant(
        'When it rains hard, the school drain fills up and overflows onto the path. Where could the extra water wait safely until the rain stops?',
        'The drain empties slowly even after the rain ends.',
        'Give the water somewhere to sit for a while, like a bath that drains slowly.',
        [
          o('inf-3-a', 'Into a big underground tank or a rain garden that empties slowly.', 'systemsThinking', 'engineeringDesign', 10),
          o('inf-3-b', 'Nowhere - water that overflows simply disappears.', 'systemsThinking', 'engineeringDesign', 0, 'overflowing water vanishes'),
          o('inf-3-c', 'Into the classrooms, where the floor is flat.', 'systemsThinking', 'engineeringDesign', 0, 'indoors is a safe place for floodwater'),
          o('inf-3-d', 'Block the drain so no more water can enter it.', 'systemsThinking', 'engineeringDesign', 1, 'blocking a drain makes the water disappear'),
        ],
      ),
      '5-6': variant(
        'After heavy rain, dirty water from the street drains sometimes flows into the river. How can a town stop this without digging up every pipe?',
        'The treatment plant can only clean water at a certain speed; storms arrive all at once.',
        'The problem is timing: too much water, too fast. What stores water for a few hours?',
        [
          o('inf-3-a', 'Build holding tanks and planted "sponge" areas that keep storm water back until the plant can clean it.', 'systemsThinking', 'engineeringDesign', 10),
          o('inf-3-b', 'Pour cleaning chemicals straight into the river after each storm.', 'systemsThinking', 'engineeringDesign', 2, 'disinfecting pollution removes it'),
          o('inf-3-c', 'Ask everyone not to use water on rainy days.', 'systemsThinking', 'engineeringDesign', 3),
          o('inf-3-d', 'Cap the overflow pipes so nothing can escape.', 'systemsThinking', 'engineeringDesign', 1, 'blocking an overflow makes the water disappear'),
        ],
      ),
      '7-8': variant(
        'During heavy rain, a city\'s combined sewer system overflows raw sewage into the river. How can systems engineering solve this?',
        'Separating the pipes would cost billions and take decades.',
        'Peak flow, not total flow, is the killer. What flattens a peak?',
        [
          o('inf-3-a', 'Build underground retention basins to temporarily hold storm water until the plant can process it.', 'systemsThinking', 'engineeringDesign', 10),
          o('inf-3-b', 'Dump extra chlorine into the river to sanitize the overflow.', 'systemsThinking', 'engineeringDesign', 3, 'disinfecting pollution removes it'),
          o('inf-3-c', 'Fine citizens who flush their toilets during rainstorms.', 'systemsThinking', 'engineeringDesign', 1, 'punishing users shrinks a storm'),
          o('inf-3-d', 'Cap the overflow pipes and let the sewage back up into the streets.', 'systemsThinking', 'engineeringDesign', 0, 'blocking an overflow makes the water disappear'),
        ],
      ),
      '9-10': variant(
        'Design the storage element of a combined-sewer-overflow plan for a 1-in-5-year storm.',
        'The plant treats 2× dry-weather flow; the design storm delivers 8× for three hours.',
        'Size the tank to the volume above the plant\'s capacity, over the storm\'s duration.',
        [
          o('inf-3-a', 'Offline retention sized to the excess volume (the area above the capacity line on the storm hydrograph), plus green infrastructure to shrink the peak upstream.', 'systemsThinking', 'engineeringDesign', 10),
          o('inf-3-b', 'A tank sized to the storm\'s total rainfall - capture every drop.', 'systemsThinking', 'engineeringDesign', 4, 'storage must hold the whole storm, not the excess'),
          o('inf-3-c', 'Higher overflow weirs so the river accepts more before it counts as a spill.', 'systemsThinking', 'engineeringDesign', 1, 'raising the reporting threshold fixes the problem'),
          o('inf-3-d', 'First-flush chlorination at every outfall.', 'systemsThinking', 'engineeringDesign', 3, 'disinfecting pollution removes it'),
        ],
      ),
      '11-12': variant(
        'Evaluate a real-time control (RTC) retrofit versus new tunnels for CSO reduction. What does the honest comparison require?',
        'Existing storage sits idle in some basins while others spill; tunnels are 10× the cost; regulators count overflow events and volumes per year.',
        'A network with spare capacity in the wrong places is a control problem before it is a concrete problem.',
        [
          o('inf-3-a', 'Model the sewer as a storage network: simulate gates shifting flow to empty basins across a decade of storms, and compare overflow-frequency reduction per unit cost against the tunnel.', 'systemsThinking', 'engineeringDesign', 10),
          o('inf-3-b', 'Build the tunnel - permanent infrastructure always beats software.', 'systemsThinking', 'engineeringDesign', 3, 'the concrete option is always the thorough option'),
          o('inf-3-c', 'Install RTC and declare victory; no modelling needed for valves.', 'systemsThinking', 'engineeringDesign', 2, 'control hardware guarantees control outcomes'),
          o('inf-3-d', 'Adopt whichever option the treating plant\'s operator prefers.', 'systemsThinking', 'engineeringDesign', 1, 'the operator\'s preference substitutes for analysis'),
        ],
      ),
    },
  ),
  blueprint(
    'inf-4',
    'stem-infra',
    'Urban Planning & Infrastructure',
    ['NGSS SEP5: Mathematics & computational thinking', 'PISA 2025 C1: Explain phenomena'],
    { load: 'dynamic' },
    {
      '3-4': variant(
        'Five friends stand very still on a plank bridge. Then they start jumping. When does the plank work hardest?',
        'The same friends, the same plank - only the jumping changes.',
        'Standing pushes once; jumping pushes again and again, harder each time.',
        [
          o('inf-4-a', 'When they jump - moving weight pushes harder than standing weight.', 'mathematicalReasoning', 'engineeringDesign', 10),
          o('inf-4-b', 'When they stand still - still weight is heavier.', 'mathematicalReasoning', 'engineeringDesign', 2, 'still weight beats moving weight'),
          o('inf-4-c', 'It is exactly the same both times.', 'mathematicalReasoning', 'engineeringDesign', 3, 'motion does not change force'),
          o('inf-4-d', 'When they all sing loudly.', 'mathematicalReasoning', 'engineeringDesign', 0, 'sound shakes bridges apart'),
        ],
      ),
      '5-6': variant(
        'A rope swing holds you fine when you hang still. Why might it snap when you swing hard?',
        'At the bottom of the swing you are moving fastest, and the rope feels tightest there.',
        'Movement can multiply a force beyond the weight it started with.',
        [
          o('inf-4-a', 'Swinging adds a moving-force on top of your weight - the rope must hold more than your still weight.', 'mathematicalReasoning', 'engineeringDesign', 10),
          o('inf-4-b', 'The rope gets tired of swinging back and forth.', 'mathematicalReasoning', 'engineeringDesign', 2, 'objects tire like living things'),
          o('inf-4-c', 'You get heavier at the bottom of the swing because gravity is stronger there.', 'mathematicalReasoning', 'engineeringDesign', 1, 'gravity is stronger at the bottom of a swing'),
          o('inf-4-d', 'Air pushes the rope sideways and untwists it.', 'mathematicalReasoning', 'engineeringDesign', 3),
        ],
      ),
      '7-8': variant(
        'A footbridge bounces when a crowd crosses in step. Why did the designers\' simple weight calculation miss this?',
        'The bridge was checked for a still crowd heavier than this one.',
        'Rhythmic pushes timed with a structure\'s bounce can grow each other.',
        [
          o('inf-4-a', 'People walking in step push in rhythm with the bridge\'s own bounce, and the pushes add up - a moving, timed load, not just weight.', 'mathematicalReasoning', 'engineeringDesign', 10),
          o('inf-4-b', 'The crowd was simply heavier than the design allowed.', 'mathematicalReasoning', 'engineeringDesign', 3, 'only total weight matters'),
          o('inf-4-c', 'Footsteps magnetise the steel and weaken it.', 'mathematicalReasoning', 'engineeringDesign', 0, 'footsteps magnetise steel'),
          o('inf-4-d', 'Wind must have blown at exactly that moment.', 'mathematicalReasoning', 'engineeringDesign', 4, 'every unexplained failure is the weather'),
        ],
      ),
      '9-10': variant(
        'Calculate the expected load on a suspension bridge cable. Which mathematical model is required?',
        'The bridge supports both static weight and dynamic wind forces.',
        'Wind does not just push - it can pump energy into a structure\'s own rhythm.',
        [
          o('inf-4-a', 'Differential equations modeling both tension and aerodynamic flutter.', 'mathematicalReasoning', 'engineeringDesign', 10),
          o('inf-4-b', 'A simple algebraic sum of all the cars on the bridge.', 'mathematicalReasoning', 'engineeringDesign', 3, 'loads just add up'),
          o('inf-4-c', 'Pythagorean theorem based on the height of the towers.', 'mathematicalReasoning', 'engineeringDesign', 2, 'geometry alone gives forces'),
          o('inf-4-d', 'Geometry to calculate the area of the roadway.', 'mathematicalReasoning', 'engineeringDesign', 4),
        ],
      ),
      '11-12': variant(
        'A reviewer asks why the cable sizing includes an aeroelastic analysis when the static loads already have a 2.0 safety factor. What is the correct answer?',
        'Tacoma Narrows, 1940: moderate wind, growing twist, collapse. Static factor was generous.',
        'A safety factor multiplies a number; flutter changes the physics the number came from.',
        [
          o('inf-4-a', 'Flutter is a self-excited instability - a factor on static load says nothing about oscillation growth; modal damping and aerodynamic derivatives decide that.', 'mathematicalReasoning', 'engineeringDesign', 10),
          o('inf-4-b', 'It is included for legal reasons only; statically the bridge was safe.', 'mathematicalReasoning', 'engineeringDesign', 2, 'a big safety factor covers unknown physics'),
          o('inf-4-c', 'Wind loads double the static weight, so the factor must be 4.0.', 'mathematicalReasoning', 'engineeringDesign', 3, 'dynamic effects are just a bigger static number'),
          o('inf-4-d', 'The analysis replaces wind-tunnel testing, which is too expensive.', 'mathematicalReasoning', 'engineeringDesign', 1, 'simulation makes physical testing optional'),
        ],
      ),
    },
  ),
];
