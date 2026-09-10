import { blueprint, o, variant, type ItemBlueprint } from './builder';

/**
 * Calibration items — the five scenarios every learner answers first, one per
 * competency. Order matters: `cal-sci` must stay first and `cal-comp` second
 * (locked by the progression tests). Each distractor is tagged with the
 * canonical misconception it diagnoses so reports can name the misunderstanding.
 */
export const calibrationBlueprints: readonly ItemBlueprint[] = [
  blueprint(
    'cal-sci',
    'calibration',
    'STEM Calibration',
    ['NGSS SEP3: Planning investigations', 'PISA 2025 C2: Enquiry & data'],
    { wilting: true },
    {
      '3-4': variant(
        'The school garden tomato plants are drooping even though they are watered every day. What should the class test first?',
        'Last week the garden started using water from a new tap instead of the old one.',
        'A good test changes only one thing and checks the result.',
        [
          o('c1', 'Test whether the new tap water has a higher salt concentration than the old water.', 'scientificInquiry', 'systemsThinking', 10),
          o('c2', 'Give the plants twice as much water every day.', 'scientificInquiry', 'systemsThinking', 2, 'more water always helps plants'),
          o('c3', 'Move all the plants to a sunnier spot right away.', 'scientificInquiry', 'systemsThinking', 4, 'acting before measuring is faster than testing'),
          o('c4', 'Pull out the drooping plants and sow new seeds.', 'scientificInquiry', 'systemsThinking', 1, 'replacing removes the problem instead of explaining it'),
        ],
      ),
      '5-6': variant(
        'A community garden\'s plants are wilting despite regular watering. Which check gives the strongest first clue?',
        'Soil near the taps shows a white crust. The garden recently switched its water source.',
        'Compare what changed with what you can measure.',
        [
          o('c1', 'Test whether the new water source has a higher salt concentration than the old one.', 'scientificInquiry', 'systemsThinking', 10),
          o('c2', 'Water the plants much more often and watch for a week.', 'scientificInquiry', 'systemsThinking', 2, 'more water always helps plants'),
          o('c3', 'Plant a different species to see whether it also wilts.', 'scientificInquiry', 'systemsThinking', 4),
          o('c4', 'Assume the plants get too much sun and shade them all.', 'scientificInquiry', 'systemsThinking', 3, 'assuming a cause without measuring it'),
        ],
      ),
      '7-8': variant(
        'A community garden\'s plants are wilting despite regular watering. Which hypothesis is most testable?',
        'Soil tests show high salinity. The local water source was recently switched.',
        'The most testable hypothesis makes a prediction you can measure.',
        [
          o('c1', 'Test if the new water source has a higher salt concentration than the old one.', 'scientificInquiry', 'systemsThinking', 10),
          o('c2', 'Assume the plants are receiving too much sunlight and move them.', 'scientificInquiry', 'systemsThinking', 2, 'assuming a cause without measuring it'),
          o('c3', 'Stop watering the plants entirely to see if they recover.', 'scientificInquiry', 'systemsThinking', 0, 'removing a need is a valid test of an excess'),
          o('c4', 'Plant different species to see if they also wilt.', 'scientificInquiry', 'systemsThinking', 4),
        ],
      ),
      '9-10': variant(
        'Plants wilt although irrigation is adequate. Which investigation best isolates the cause?',
        'Soil salinity is elevated after the irrigation source was switched. Salty soil lowers the water potential around roots.',
        'Think about osmosis: roots struggle to take up water from salty soil.',
        [
          o('c1', 'Measure whether the new source has a higher salt concentration than the old one; salty soil draws water out of roots by osmosis.', 'scientificInquiry', 'systemsThinking', 10),
          o('c2', 'Increase irrigation volume to flush the roots more often.', 'scientificInquiry', 'systemsThinking', 3, 'more water always helps plants'),
          o('c3', 'Shade the beds, since wilting is usually heat stress.', 'scientificInquiry', 'systemsThinking', 4, 'assuming the most familiar cause without measuring'),
          o('c4', 'Replace the crop with a salt-tolerant species immediately.', 'scientificInquiry', 'systemsThinking', 2, 'treating the symptom before confirming the cause'),
        ],
      ),
      '11-12': variant(
        'A market garden reports wilting despite normal irrigation. Design the decisive first comparison.',
        'Records show the well was switched three weeks ago; soil conductivity is rising. Yield loss must be attributed before remedies are funded.',
        'A decisive comparison changes one candidate cause and holds the rest constant.',
        [
          o('c1', 'Verify the new well has a higher salt concentration, then run matched bed pairs on old vs new water with all else equal.', 'scientificInquiry', 'systemsThinking', 10),
          o('c2', 'Correlate daily wilting scores with temperature to rule in heat stress first.', 'scientificInquiry', 'systemsThinking', 5, 'correlation establishes causation'),
          o('c3', 'Double irrigation across the whole garden and watch the response.', 'scientificInquiry', 'systemsThinking', 2, 'more water always helps plants'),
          o('c4', 'Survey neighbouring farms and adopt whatever fixed their crops.', 'scientificInquiry', 'systemsThinking', 3, 'anecdote substitutes for controlled comparison'),
        ],
      ),
    },
  ),
  blueprint(
    'cal-comp',
    'calibration',
    'STEM Calibration',
    ['NGSS SEP5: Mathematics & computational thinking', 'PISA 2025 C3: Decide with evidence'],
    { dataSize: 10000 },
    {
      '3-4': variant(
        'Riya has 20 game cards in a pile. She wants the card with the number 7. Which way is fastest and always works?',
        'The cards are mixed up, not in order.',
        'Think about checking cards one at a time.',
        [
          o('c5', 'Turn the cards over one by one from the top until she finds the 7.', 'computationalThinking', 'mathematicalReasoning', 10),
          o('c6', 'Close her eyes and pick cards at random until she gets lucky.', 'computationalThinking', 'mathematicalReasoning', 1, 'random guessing is a reliable method'),
          o('c7', 'Sort all 20 cards into order first, then look for the 7.', 'computationalThinking', 'mathematicalReasoning', 4, 'more steps always means a better answer'),
          o('c8', 'Split the pile in half again and again like a guessing game.', 'computationalThinking', 'mathematicalReasoning', 2, 'halving works on any pile, sorted or not'),
        ],
      ),
      '5-6': variant(
        'In a guessing game, Adil thinks of a number from 1 to 100 and answers "higher" or "lower". Which strategy finds it in the fewest guesses?',
        'You may ask as many times as you like, but each guess should tell you as much as possible.',
        'Each guess can rule out half of what remains.',
        [
          o('c5', 'Guess the middle number each time (50, then 25 or 75...), halving what is left.', 'computationalThinking', 'mathematicalReasoning', 10),
          o('c6', 'Guess 1, then 2, then 3, all the way up until you hit it.', 'computationalThinking', 'mathematicalReasoning', 3, 'checking everything in order is fastest'),
          o('c7', 'Guess random numbers so Adil cannot predict your guesses.', 'computationalThinking', 'mathematicalReasoning', 1, 'random guessing is a reliable method'),
          o('c8', 'Start from your favourite number and move one step at a time.', 'computationalThinking', 'mathematicalReasoning', 2, 'starting point does not change the work'),
        ],
      ),
      '7-8': variant(
        'A script must remove duplicate readings from a list of 10,000 sensor values. Which approach is most efficient?',
        'The list is unsorted. Readings may repeat many times.',
        'How much work does each value cause — once, or compared against all others?',
        [
          o('c5', 'Walk the list once, keeping a set of values already seen and skipping repeats.', 'computationalThinking', 'mathematicalReasoning', 10),
          o('c6', 'Compare every value with every other value to find the duplicates.', 'computationalThinking', 'mathematicalReasoning', 2, 'comparing all pairs is necessary for uniqueness'),
          o('c7', 'Sort the list first, then delete neighbours that match.', 'computationalThinking', 'mathematicalReasoning', 6),
          o('c8', 'Print the list and cross out repeats by hand.', 'computationalThinking', 'mathematicalReasoning', 0, 'manual checking scales to any data size'),
        ],
      ),
      '9-10': variant(
        'You are writing a script to filter a list of 10,000 sensor readings. Which algorithmic approach finds the median most efficiently?',
        'The readings are currently unsorted.',
        'You do not need a fully sorted list to find the middle value.',
        [
          o('c5', 'Use a Quickselect algorithm to find the median in O(n) average time.', 'computationalThinking', 'mathematicalReasoning', 10),
          o('c6', 'Sort the entire list using Bubble Sort and pick the middle element.', 'computationalThinking', 'mathematicalReasoning', 2, 'any correct method is equally efficient'),
          o('c7', 'Calculate the mean instead, since it is easier to compute.', 'computationalThinking', 'mathematicalReasoning', 4, 'the mean and median are interchangeable'),
          o('c8', 'Manually check the values using a spreadsheet.', 'computationalThinking', 'mathematicalReasoning', 0, 'manual checking scales to any data size'),
        ],
      ),
      '11-12': variant(
        'A gateway streams 10 million readings and must report the running median, but only 1 MB of memory is free. Which design is sound?',
        'Readings arrive once and cannot all be stored.',
        'Two ordered halves can be maintained without storing every value.',
        [
          o('c5', 'Keep a max-heap for the lower half and a min-heap for the upper half, rebalancing as values stream in.', 'computationalThinking', 'mathematicalReasoning', 10),
          o('c6', 'Buffer all readings, sort, and read the middle value.', 'computationalThinking', 'mathematicalReasoning', 2, 'memory is effectively unlimited'),
          o('c7', 'Keep only the latest reading and report it as a typical value.', 'computationalThinking', 'mathematicalReasoning', 1, 'one sample represents the whole stream'),
          o('c8', 'Report the running mean instead; it needs only two counters.', 'computationalThinking', 'mathematicalReasoning', 5, 'the mean and median are interchangeable'),
        ],
      ),
    },
  ),
  blueprint(
    'cal-eng',
    'calibration',
    'STEM Calibration',
    ['NGSS SEP6: Constructing explanations & designing solutions', 'PISA 2025 C1: Explain phenomena'],
    { load: 5 },
    {
      '3-4': variant(
        'A paper bridge between two books sags when a toy car crosses it. How can you make it stronger using the same paper?',
        'You may fold the paper but not add more sheets.',
        'Flat paper bends easily. What shape does folded paper make?',
        [
          o('c9', 'Fold the paper like a fan (zigzag) so the ridges hold it up.', 'engineeringDesign', 'mathematicalReasoning', 10),
          o('c10', 'Put extra tape on top of the flat paper.', 'engineeringDesign', 'mathematicalReasoning', 3, 'tape on the surface adds strength everywhere'),
          o('c11', 'Wet the paper so it sticks together tightly.', 'engineeringDesign', 'mathematicalReasoning', 0, 'wetting paper makes it stronger'),
          o('c12', 'Push the books closer so the gap is smaller.', 'engineeringDesign', 'mathematicalReasoning', 5),
        ],
      ),
      '5-6': variant(
        'A craft-stick bridge sags in the middle when a small weight is added. What change adds the most strength without much weight?',
        'The bridge is one flat layer of sticks.',
        'Look at real bridges: which shape repeats in the metalwork?',
        [
          o('c9', 'Glue sticks into triangles under the flat road to make a truss.', 'engineeringDesign', 'mathematicalReasoning', 10),
          o('c10', 'Add a second flat layer of sticks on top.', 'engineeringDesign', 'mathematicalReasoning', 5),
          o('c11', 'Wrap the whole bridge in strong tape.', 'engineeringDesign', 'mathematicalReasoning', 2, 'surface wrapping adds structural strength'),
          o('c12', 'Move the weight near one end instead of the middle.', 'engineeringDesign', 'mathematicalReasoning', 4, 'moving the load fixes a weak structure'),
        ],
      ),
      '7-8': variant(
        'A wooden bridge model sags in the middle when a 5kg weight is applied. How can you increase its rigidity without adding massive weight?',
        'The bridge uses a simple flat-beam design.',
        'Which geometry turns bending into pushes and pulls along the members?',
        [
          o('c9', 'Add a truss system (triangles) to distribute the compressive and tensile forces.', 'engineeringDesign', 'mathematicalReasoning', 10),
          o('c10', 'Use thicker wood for the flat beam.', 'engineeringDesign', 'mathematicalReasoning', 4),
          o('c11', 'Paint the wood with a hardening sealant.', 'engineeringDesign', 'mathematicalReasoning', 1, 'surface coatings add structural strength'),
          o('c12', 'Place the weight closer to the edge rather than the middle.', 'engineeringDesign', 'mathematicalReasoning', 2, 'moving the load fixes a weak structure'),
        ],
      ),
      '9-10': variant(
        'A model bridge must carry 5 kg at mid-span with the least added material. Which redesign is most effective?',
        'Current design: a single flat timber beam. Material is limited to 20% extra mass.',
        'Stiffness grows with depth and geometry faster than with solid mass.',
        [
          o('c9', 'Convert the span to a triangulated truss, putting material only along the load paths in tension and compression.', 'engineeringDesign', 'mathematicalReasoning', 10),
          o('c10', 'Use a thicker solid beam of the same timber.', 'engineeringDesign', 'mathematicalReasoning', 5),
          o('c11', 'Apply a structural sealant to stiffen the surface.', 'engineeringDesign', 'mathematicalReasoning', 1, 'surface coatings add structural strength'),
          o('c12', 'Shorten the effective span with extra piers, whatever the site allows.', 'engineeringDesign', 'mathematicalReasoning', 4),
        ],
      ),
      '11-12': variant(
        'A footbridge design fails its stiffness budget but cannot gain mass. What is the most defensible redesign?',
        'Constraints: fixed span, fixed material budget, deflection limit L/360.',
        'Deflection scales with the second moment of area, not with the amount of material.',
        [
          o('c9', 'Rearrange material into a deeper triangulated section — geometry raises the second moment of area without added mass.', 'engineeringDesign', 'mathematicalReasoning', 10),
          o('c10', 'Switch to a denser timber of the same dimensions.', 'engineeringDesign', 'mathematicalReasoning', 3, 'heavier material is always stiffer'),
          o('c11', 'Add a cosmetic deck plate to distribute point loads.', 'engineeringDesign', 'mathematicalReasoning', 4),
          o('c12', 'Relax the deflection criterion and document the deviation.', 'engineeringDesign', 'mathematicalReasoning', 1, 'changing the requirement counts as meeting it'),
        ],
      ),
    },
  ),
  blueprint(
    'cal-math',
    'calibration',
    'STEM Calibration',
    ['NGSS SEP5: Mathematics & computational thinking', 'PISA 2025 C1: Explain phenomena'],
    { panel: 200, battery: 1000 },
    {
      '3-4': variant(
        'A water tank holds 1000 litres. A pump fills 200 litres every hour. How long does a full fill take from empty?',
        'The pump runs at the same speed the whole time.',
        'How many groups of 200 fit into 1000?',
        [
          o('c13', '1000 ÷ 200 = 5 hours.', 'mathematicalReasoning', 'systemsThinking', 10),
          o('c14', '1000 − 200 = 800 hours.', 'mathematicalReasoning', 'systemsThinking', 0, 'subtracting the rate gives the time'),
          o('c15', '1000 × 200 = 200,000 hours.', 'mathematicalReasoning', 'systemsThinking', 0, 'multiplying any two numbers in the problem gives the answer'),
          o('c16', '200 ÷ 1000 = 0.2 hours.', 'mathematicalReasoning', 'systemsThinking', 2, 'dividing the smaller by the larger gives the time'),
        ],
      ),
      '5-6': variant(
        'A pump moves 200 litres per hour into a 1000-litre tank, but leaks waste 20% of the water. How long does a full fill take?',
        'Only 80 out of every 100 litres pumped actually stays in the tank.',
        'First find how much water really stays each hour.',
        [
          o('c13', '1000 ÷ (200 × 0.8) = 1000 ÷ 160 = 6.25 hours.', 'mathematicalReasoning', 'systemsThinking', 10),
          o('c14', '1000 ÷ 200 = 5 hours.', 'mathematicalReasoning', 'systemsThinking', 4, 'ignoring losses gives the true time'),
          o('c15', '1000 ÷ (200 × 1.2) ≈ 4.2 hours.', 'mathematicalReasoning', 'systemsThinking', 1, 'losses speed the process up'),
          o('c16', '(1000 × 0.8) ÷ 200 = 4 hours.', 'mathematicalReasoning', 'systemsThinking', 3, 'the loss applies to the tank size, not the flow'),
        ],
      ),
      '7-8': variant(
        'A solar panel generates 200 W. A battery holds 1000Wh. How long does it take to fully charge from 0% assuming 80% efficiency?',
        'Efficiency losses occur during energy conversion.',
        'Only part of the generated power reaches the battery.',
        [
          o('c13', '1000 / (200 * 0.8) = 6.25 hours.', 'mathematicalReasoning', 'systemsThinking', 10),
          o('c14', '1000 / 200 = 5.0 hours.', 'mathematicalReasoning', 'systemsThinking', 4, 'ignoring losses gives the true time'),
          o('c15', '1000 / (200 * 1.2) = 4.16 hours.', 'mathematicalReasoning', 'systemsThinking', 2, 'losses speed the process up'),
          o('c16', '(1000 * 0.8) / 200 = 4.0 hours.', 'mathematicalReasoning', 'systemsThinking', 1, 'the loss applies to the battery size, not the input'),
        ],
      ),
      '9-10': variant(
        'A 200 W panel charges a 1000 Wh battery at 80% efficiency. After two years the panel delivers 90% of its rated output. What is the new charge time from empty?',
        'Degradation and conversion losses multiply.',
        'Apply both factors to the power that actually reaches the battery.',
        [
          o('c13', '1000 / (200 × 0.9 × 0.8) ≈ 6.94 hours.', 'mathematicalReasoning', 'systemsThinking', 10),
          o('c14', '1000 / (200 × 0.8) = 6.25 hours.', 'mathematicalReasoning', 'systemsThinking', 5, 'nameplate output persists over time'),
          o('c15', '1000 / (200 × 0.9) ≈ 5.56 hours.', 'mathematicalReasoning', 'systemsThinking', 6, 'conversion is lossless'),
          o('c16', '1000 / 200 = 5 hours.', 'mathematicalReasoning', 'systemsThinking', 2, 'ignoring losses gives the true time'),
        ],
      ),
      '11-12': variant(
        'A 200 W panel\'s output follows a half-sine curve peaking at noon across 8 daylight hours. A 1000 Wh battery charges at 80% efficiency. Which estimate method is valid?',
        'Nameplate power is the peak, not the average.',
        'Energy is the area under the power curve, not the peak times the hours.',
        [
          o('c13', 'Integrate the output curve: average of a half-sine is 2/π of peak, so 200 × (2/π) × 8 × 0.8 ≈ 815 Wh — the battery will not quite fill.', 'mathematicalReasoning', 'systemsThinking', 10),
          o('c14', 'Multiply peak power by daylight hours: 200 × 8 × 0.8 = 1280 Wh, so it fills easily.', 'mathematicalReasoning', 'systemsThinking', 3, 'peak output equals average output'),
          o('c15', 'Use rated power over 24 hours: 200 × 24 × 0.8 = 3840 Wh.', 'mathematicalReasoning', 'systemsThinking', 1, 'the sun shines at night'),
          o('c16', 'Average the peak and zero output: (200 + 0)/2 × 8 × 0.8 = 640 Wh.', 'mathematicalReasoning', 'systemsThinking', 6, 'a sine profile averages like a straight ramp'),
        ],
      ),
    },
  ),
  blueprint(
    'cal-sys',
    'calibration',
    'STEM Calibration',
    ['NGSS SEP2: Developing & using models', 'PISA 2025 C3: Decide with evidence'],
    { pest: 'rat' },
    {
      '3-4': variant(
        'To protect the rose bushes, a gardener releases ladybirds to eat the aphids. What might happen next?',
        'Ladybirds eat aphids — and sometimes other small insects. They can also fly away.',
        'Living things do not always do what we plan.',
        [
          o('c17', 'The ladybirds might eat other insects or fly away — nature is connected, not a switch we flip.', 'systemsThinking', 'scientificInquiry', 10),
          o('c18', 'Nothing can go wrong; the ladybirds will do exactly what we want.', 'systemsThinking', 'scientificInquiry', 1, 'animals follow human plans'),
          o('c19', 'The aphids will turn into ladybirds over time.', 'systemsThinking', 'scientificInquiry', 0, 'one species transforms into another'),
          o('c20', 'The roses will eat the ladybirds.', 'systemsThinking', 'scientificInquiry', 2, 'all plants catch and eat animals'),
        ],
      ),
      '5-6': variant(
        'Rabbits were brought to Australia long ago, where they had no natural predators. What does this story warn us about moving species?',
        'Rabbits multiplied into millions and ate the grasses that native animals and sheep needed.',
        'What checks and balances exist in the new home that did not exist for the traveller?',
        [
          o('c17', 'Without predators or competitors, a new species can explode in number and become a pest itself.', 'systemsThinking', 'scientificInquiry', 10),
          o('c18', 'New species always stay rare because they miss their old home.', 'systemsThinking', 'scientificInquiry', 1, 'animals behave by their feelings, not their conditions'),
          o('c19', 'The rabbits will slowly turn into native Australian animals.', 'systemsThinking', 'scientificInquiry', 0, 'one species transforms into another'),
          o('c20', 'Predators appear automatically whenever prey arrives.', 'systemsThinking', 'scientificInquiry', 3, 'ecosystems instantly replace missing balances'),
        ],
      ),
      '7-8': variant(
        'Introducing a new predator to an island to control a pest population often fails. Why is this?',
        'Ecosystems are complex webs of interdependent species.',
        'What else does the predator eat when the pest is hard to catch?',
        [
          o('c17', 'The predator may find native species easier to hunt than the intended pest.', 'systemsThinking', 'scientificInquiry', 10),
          o('c18', 'The predator will always starve once the pest is eliminated.', 'systemsThinking', 'scientificInquiry', 4, 'a predator can only ever eat one prey species'),
          o('c19', 'The pest will rapidly evolve immunity to the predator.', 'systemsThinking', 'scientificInquiry', 2, 'evolution works within a few generations on demand'),
          o('c20', 'The island will sink from the added weight.', 'systemsThinking', 'scientificInquiry', 0, 'added mass makes landmasses sink'),
        ],
      ),
      '9-10': variant(
        'Cane toads were released in Australia to eat beetles attacking sugar cane. The beetle problem barely changed. Which mechanism best explains the failure?',
        'Cane toads now number in the hundreds of millions; native predator populations have fallen where toads spread.',
        'Food webs have many links — a consumer switches to whatever is easiest to catch.',
        [
          o('c17', 'The toads switched to easier native prey and poisoned their own predators — a food-web effect the one-pest plan ignored.', 'systemsThinking', 'scientificInquiry', 10),
          o('c18', 'The beetles evolved armour against toads within a few seasons.', 'systemsThinking', 'scientificInquiry', 2, 'evolution works within a few generations on demand'),
          o('c19', 'The toads ate all the beetles first, then starved before helping.', 'systemsThinking', 'scientificInquiry', 3, 'a consumer can only ever eat one prey species'),
          o('c20', 'Two cane harvests were simply unlucky.', 'systemsThinking', 'scientificInquiry', 1, 'chance explains systematic outcomes'),
        ],
      ),
      '11-12': variant(
        'A district proposes releasing a non-native parasitoid wasp against a crop pest. What does a sound risk assessment require before release?',
        'Biocontrol agents disperse and reproduce; an introduction is effectively irreversible.',
        'Ask what the agent will do after the target pest becomes rare.',
        [
          o('c17', 'Host-specificity trials across native relatives and modelling of non-target effects — because the agent cannot be recalled once released.', 'systemsThinking', 'scientificInquiry', 10),
          o('c18', 'A successful greenhouse trial against the pest alone.', 'systemsThinking', 'scientificInquiry', 4, 'lab success guarantees field safety'),
          o('c19', 'Releasing twice the recommended density to guarantee control.', 'systemsThinking', 'scientificInquiry', 1, 'more intervention guarantees more control'),
          o('c20', 'Approval from the farmers who will benefit most.', 'systemsThinking', 'scientificInquiry', 2, 'those who benefit can judge the ecological risk'),
        ],
      ),
    },
  ),
];
