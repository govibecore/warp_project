import { blueprint, o, variant, type ItemBlueprint } from './builder';

/** Mission: Renewable Energy Systems */
export const energyBlueprints: readonly ItemBlueprint[] = [
  blueprint(
    'nrg-0',
    'stem-energy',
    'Renewable Energy Systems',
    ['NGSS SEP6: Designing solutions', 'PISA 2025 C1: Explain phenomena'],
    { wind: 15 },
    {
      '3-4': variant(
        'A toy windmill spins too fast in strong wind and its blades bend. What should the young engineer do?',
        'The wind changes from gentle to strong during the day.',
        'How could the blades catch less wind when the wind is strong?',
        [
          o('nrg-0-a', 'Turn the blades a little so they catch less wind when the wind is strong.', 'engineeringDesign', 'scientificInquiry', 10),
          o('nrg-0-b', 'Glue the blades so they can never move again.', 'engineeringDesign', 'scientificInquiry', 2, 'locking a moving part fixes every problem'),
          o('nrg-0-c', 'Make the blades from much heavier wood.', 'engineeringDesign', 'scientificInquiry', 4, 'heavier parts are always stronger parts'),
          o('nrg-0-d', 'Bring the windmill inside and wait for calm days.', 'engineeringDesign', 'scientificInquiry', 1, 'avoiding the condition solves the condition'),
        ],
      ),
      '5-6': variant(
        'A model wind turbine works well in a gentle fan breeze but rattles in front of a strong fan. What is the best fix?',
        'The fan has low and high speed settings for the class experiment.',
        'Real turbines change their blades for light and strong winds.',
        [
          o('nrg-0-a', 'Adjust the blade angle: flat to catch light wind, twisted to spill strong wind.', 'engineeringDesign', 'scientificInquiry', 10),
          o('nrg-0-b', 'Fix one blade angle forever — the best angle is the same in every wind.', 'engineeringDesign', 'scientificInquiry', 2, 'one setting fits all conditions'),
          o('nrg-0-c', 'Fit much bigger blades to catch even more wind.', 'engineeringDesign', 'scientificInquiry', 3, 'catching more wind is always better'),
          o('nrg-0-d', 'Switch the turbine off whenever the wind changes.', 'engineeringDesign', 'scientificInquiry', 4),
        ],
      ),
      '7-8': variant(
        'Optimizing power output for a wind turbine array. How do you adjust the blade pitch for current conditions?',
        'Wind speeds are fluctuating rapidly between 10 and 25 m/s.',
        'Blade angle controls how much lift — and stress — the wind creates.',
        [
          o('nrg-0-a', 'Implement an active pitch control loop using real-time anemometer data.', 'engineeringDesign', 'scientificInquiry', 10),
          o('nrg-0-b', 'Lock the blades at a 45-degree angle permanently.', 'engineeringDesign', 'scientificInquiry', 2, 'one setting fits all conditions'),
          o('nrg-0-c', 'Shut down the turbines to prevent damage.', 'engineeringDesign', 'scientificInquiry', 4),
          o('nrg-0-d', 'Use a mechanical governor to stall the blades at high speeds.', 'engineeringDesign', 'scientificInquiry', 7),
        ],
      ),
      '9-10': variant(
        'A turbine is rated at 15 m/s but today\'s wind swings between 10 and 25 m/s. Which control strategy protects output and hardware?',
        'Above the rated wind speed, aerodynamic torque rises sharply with wind speed.',
        'Past the rating, the goal stops being "more power".',
        [
          o('nrg-0-a', 'Pitch to feather above rated wind to hold rotor speed constant; pitch to catch below it — an active loop driven by anemometer data.', 'engineeringDesign', 'scientificInquiry', 10),
          o('nrg-0-b', 'Hold the most aerodynamic angle at all times to maximise capture.', 'engineeringDesign', 'scientificInquiry', 2, 'more wind always means more power'),
          o('nrg-0-c', 'Rely on passive stall of fixed blades in gusts.', 'engineeringDesign', 'scientificInquiry', 6),
          o('nrg-0-d', 'Cut the turbine out entirely above 15 m/s.', 'engineeringDesign', 'scientificInquiry', 4),
        ],
      ),
      '11-12': variant(
        'Gust spectra show strong 0.1–1 Hz content around a 3 MW turbine\'s rated wind speed. What does the pitch controller need to balance?',
        'Fatigue loads grow with cyclic thrust; capture falls if blades feather too eagerly.',
        'Every degree of pitch trades energy capture against structural load.',
        [
          o('nrg-0-a', 'Tune collective pitch gains against measured wind spectra so fatigue load and capture losses are jointly minimised, with supervisory derating in extremes.', 'engineeringDesign', 'scientificInquiry', 10),
          o('nrg-0-b', 'Maximise capture at all times; the gearbox is rated with margin.', 'engineeringDesign', 'scientificInquiry', 2, 'nameplate ratings absorb unlimited fatigue'),
          o('nrg-0-c', 'Fix pitch at the rated optimum; active control adds failure modes.', 'engineeringDesign', 'scientificInquiry', 4, 'removing control removes risk'),
          o('nrg-0-d', 'Feather fully in every gust above rated speed.', 'engineeringDesign', 'scientificInquiry', 5),
        ],
      ),
    },
  ),
  blueprint(
    'nrg-1',
    'stem-energy',
    'Renewable Energy Systems',
    ['NGSS SEP2: Developing & using models', 'PISA 2025 C1: Explain phenomena'],
    { temp: 45 },
    {
      '3-4': variant(
        'On a very hot afternoon, Anaya\'s solar toy car runs slower than in the cool morning, though the sun is just as bright. Why?',
        'The solar panel feels hot to touch in the afternoon.',
        'Many materials carry electricity worse when they get hot.',
        [
          o('nrg-1-a', 'The panel gets too hot, and hot panels make less electricity.', 'systemsThinking', 'scientificInquiry', 10),
          o('nrg-1-b', 'The afternoon sun is too bright for the panel to handle.', 'systemsThinking', 'scientificInquiry', 1, 'brighter light always means more power'),
          o('nrg-1-c', 'The car\'s wheels get tired by the afternoon.', 'systemsThinking', 'scientificInquiry', 0, 'objects tire like living things'),
          o('nrg-1-d', 'The morning air is thicker and pushes the car better.', 'systemsThinking', 'scientificInquiry', 2, 'thick air pushes objects along'),
        ],
      ),
      '5-6': variant(
        'During a heatwave, the school\'s solar garden lights charge slower even though the days are cloudless. What is the best explanation?',
        'The little panels on top of the lights get very hot at midday.',
        'Solar cells are made of a special material called a semiconductor.',
        [
          o('nrg-1-a', 'Heat makes it harder for electricity to flow in the solar cell, so a hot cell makes less power.', 'systemsThinking', 'scientificInquiry', 10),
          o('nrg-1-b', 'Strong sunlight fills the cell up so it cannot take more.', 'systemsThinking', 'scientificInquiry', 1, 'brighter light always means more power'),
          o('nrg-1-c', 'Hot air blocks the sunlight before it reaches the cell.', 'systemsThinking', 'scientificInquiry', 3, 'warm air is less transparent'),
          o('nrg-1-d', 'The batteries drain faster in summer nights.', 'systemsThinking', 'scientificInquiry', 4),
        ],
      ),
      '7-8': variant(
        'A solar farm experiences a 20% drop in efficiency during peak summer. What is the most likely thermodynamic cause?',
        'Panels are clean and in direct sunlight.',
        'Check what heat does to a semiconductor junction.',
        [
          o('nrg-1-a', 'Increased temperature increases semiconductor resistance, lowering voltage.', 'systemsThinking', 'scientificInquiry', 10),
          o('nrg-1-b', 'The sun is too bright, oversaturating the solar cells.', 'systemsThinking', 'scientificInquiry', 1, 'brighter light always means more power'),
          o('nrg-1-c', 'Summer humidity blocks UV rays.', 'systemsThinking', 'scientificInquiry', 4),
          o('nrg-1-d', 'The batteries are discharging faster due to the heat.', 'systemsThinking', 'scientificInquiry', 6),
        ],
      ),
      '9-10': variant(
        'A rooftop array loses about 8% of output on a 35 °C day. The panel\'s temperature coefficient is −0.4%/°C. Is the loss anomalous?',
        'Panel datasheets rate output at a cell temperature of 25 °C; cells in full sun run well above air temperature.',
        'Estimate the cell temperature, then apply the coefficient.',
        [
          o('nrg-1-a', 'No — cells near 45 °C are 20 °C above rating; 20 × 0.4% ≈ 8% loss matches the observation.', 'systemsThinking', 'scientificInquiry', 10),
          o('nrg-1-b', 'Yes — a 35 °C day should improve output, so the array is faulty.', 'systemsThinking', 'scientificInquiry', 1, 'warmer conditions always help energy devices'),
          o('nrg-1-c', 'Yes — an 8% loss must mean panel degradation and warranty replacement.', 'systemsThinking', 'scientificInquiry', 3, 'any unexpected loss means broken equipment'),
          o('nrg-1-d', 'No — summer air is thinner and lets less light through.', 'systemsThinking', 'scientificInquiry', 4, 'warm air is less transparent'),
        ],
      ),
      '11-12': variant(
        'Before blaming soiling for a summer output dip, which mechanism should the performance model include first?',
        'I–V curves show current rising slightly and voltage falling sharply as cells heat; the site also has inverter clipping at noon.',
        'Separate the temperature term from the soiling term in the energy model.',
        [
          o('nrg-1-a', 'The negative voltage temperature coefficient: band-gap narrowing trades a little current for a lot of voltage — model cell temperature (NOCT) and inverter clipping before soiling.', 'systemsThinking', 'scientificInquiry', 10),
          o('nrg-1-b', 'Photon oversaturation of the junction at high irradiance.', 'systemsThinking', 'scientificInquiry', 1, 'brighter light always means more power'),
          o('nrg-1-c', 'Summer humidity scattering of the UV band.', 'systemsThinking', 'scientificInquiry', 4),
          o('nrg-1-d', 'Accelerated battery self-discharge raising the apparent load.', 'systemsThinking', 'scientificInquiry', 5),
        ],
      ),
    },
  ),
  blueprint(
    'nrg-2',
    'stem-energy',
    'Renewable Energy Systems',
    ['NGSS SEP5: Mathematics & computational thinking', 'PISA 2025 C1: Explain phenomena'],
    { mass: 1000 },
    {
      '3-4': variant(
        'A lift carries 100 kg of water up 10 metres. Using energy = mass × 10 × height, how much energy is stored?',
        'Use 10 for the pull of gravity to keep the numbers friendly.',
        'Multiply all three numbers together.',
        [
          o('nrg-2-a', '100 × 10 × 10 = 10,000 joules.', 'mathematicalReasoning', 'engineeringDesign', 10),
          o('nrg-2-b', '100 + 10 + 10 = 120 joules.', 'mathematicalReasoning', 'engineeringDesign', 1, 'adding the quantities gives the energy'),
          o('nrg-2-c', '100 × 10 = 1000 joules.', 'mathematicalReasoning', 'engineeringDesign', 4, 'height does not matter for stored energy'),
          o('nrg-2-d', '10 × 10 = 100 joules.', 'mathematicalReasoning', 'engineeringDesign', 2, 'mass does not matter for stored energy'),
        ],
      ),
      '5-6': variant(
        'A tank of 500 kg of water is pumped 20 metres up a hill. Using E = m × g × h with g ≈ 10, how much energy is stored?',
        'This is how some towns store extra solar power for the night.',
        'Energy grows with every kilogram and every metre of height.',
        [
          o('nrg-2-a', '500 × 10 × 20 = 100,000 joules.', 'mathematicalReasoning', 'engineeringDesign', 10),
          o('nrg-2-b', '500 × 20 = 10,000 joules.', 'mathematicalReasoning', 'engineeringDesign', 4, 'gravity can be dropped from the formula'),
          o('nrg-2-c', '500 + 20 + 10 = 530 joules.', 'mathematicalReasoning', 'engineeringDesign', 1, 'adding the quantities gives the energy'),
          o('nrg-2-d', '20 × 10 = 200 joules.', 'mathematicalReasoning', 'engineeringDesign', 2, 'mass does not matter for stored energy'),
        ],
      ),
      '7-8': variant(
        'To store excess daytime energy, a town pumps water up to a reservoir. How much potential energy is stored if 1000kg of water is lifted 50m?',
        'Assume g = 9.8 m/s².',
        'E = mgh.',
        [
          o('nrg-2-a', '490,000 Joules (E = mgh).', 'mathematicalReasoning', 'engineeringDesign', 10),
          o('nrg-2-b', '50,000 Joules (E = m * h).', 'mathematicalReasoning', 'engineeringDesign', 2, 'gravity can be dropped from the formula'),
          o('nrg-2-c', '98,000 Joules.', 'mathematicalReasoning', 'engineeringDesign', 4),
          o('nrg-2-d', '4.9 Megajoules.', 'mathematicalReasoning', 'engineeringDesign', 6, 'sliding the decimal point keeps the value equal'),
        ],
      ),
      '9-10': variant(
        'A pumped-hydro site lifts 1000 kg of water by 50 m. If the round-trip efficiency is 80%, how much energy can be delivered back?',
        'Losses apply to the stored energy, on the way out as well as in.',
        'Compute the stored energy first, then apply the round-trip factor.',
        [
          o('nrg-2-a', 'About 392 kJ: 1000 × 9.8 × 50 = 490 kJ stored, × 0.8 returned.', 'mathematicalReasoning', 'engineeringDesign', 10),
          o('nrg-2-b', '490 kJ — storage does not lose energy.', 'mathematicalReasoning', 'engineeringDesign', 4, 'storage and conversion are lossless'),
          o('nrg-2-c', 'About 613 kJ — efficiency above 100% when water flows down.', 'mathematicalReasoning', 'engineeringDesign', 1, 'going downhill adds extra energy for free'),
          o('nrg-2-d', '98 kJ: 1000 × 9.8 × 50 × 0.2, counting only the losses.', 'mathematicalReasoning', 'engineeringDesign', 2, 'the lost fraction is the delivered fraction'),
        ],
      ),
      '11-12': variant(
        'Two reservoir designs store the same water volume: one doubles the head height, the other doubles the surface area. Which stores more energy, and what else changes?',
        'E = ρVgh; both designs hold identical volume V.',
        'Check which variable the energy actually scales with — and what the structure must then withstand.',
        [
          o('nrg-2-a', 'The doubled head doubles stored energy at the same volume — but dam pressure and penstock design must scale with it.', 'mathematicalReasoning', 'engineeringDesign', 10),
          o('nrg-2-b', 'The doubled area doubles energy — more water surface means more push.', 'mathematicalReasoning', 'engineeringDesign', 2, 'spreading the same volume wider raises stored energy'),
          o('nrg-2-c', 'Both double the energy equally; only cost differs.', 'mathematicalReasoning', 'engineeringDesign', 4),
          o('nrg-2-d', 'Neither changes energy; volume alone sets capacity.', 'mathematicalReasoning', 'engineeringDesign', 3, 'height does not matter for stored energy'),
        ],
      ),
    },
  ),
  blueprint(
    'nrg-3',
    'stem-energy',
    'Renewable Energy Systems',
    ['NGSS SEP6: Designing solutions', 'PISA 2025 C3: Decide with evidence'],
    { ph: 4 },
    {
      '3-4': variant(
        'A metal straw left in lemon juice comes out rough and pitted. Which straw should the class test for sour drinks?',
        'Lemon juice is sour (acidic), and acid eats into some materials faster than others.',
        'Some materials barely react with sour juice at all.',
        [
          o('nrg-3-a', 'A material that does not react with sour juice — test a few candidates in juice for a week and compare.', 'engineeringDesign', 'systemsThinking', 10),
          o('nrg-3-b', 'The cheapest metal, replaced with a new straw every day.', 'engineeringDesign', 'systemsThinking', 2, 'replacing is always cheaper than choosing well'),
          o('nrg-3-c', 'The same metal, but painted a bright colour.', 'engineeringDesign', 'systemsThinking', 5),
          o('nrg-3-d', 'A wooden straw, because wood comes from nature.', 'engineeringDesign', 'systemsThinking', 1, 'natural materials resist every chemical'),
        ],
      ),
      '5-6': variant(
        'Water pipes near the sea rust much faster than pipes inland. What should the town try first?',
        'Salty, slightly acidic air and water attack ordinary steel.',
        'You can protect a material, or pick one that needs no protection.',
        [
          o('nrg-3-a', 'Test corrosion-resistant pipes or a tough inner coating on a short section before refitting the whole town.', 'engineeringDesign', 'systemsThinking', 10),
          o('nrg-3-b', 'Replace the rusty pipes with identical ones every year.', 'engineeringDesign', 'systemsThinking', 2, 'replacing is always cheaper than choosing well'),
          o('nrg-3-c', 'Paint the outside of the pipes and hope the inside stays dry.', 'engineeringDesign', 'systemsThinking', 4, 'protecting one face protects the whole pipe'),
          o('nrg-3-d', 'Use thicker steel so the rust takes longer to eat through.', 'engineeringDesign', 'systemsThinking', 5, 'more of the same material stops the chemistry'),
        ],
      ),
      '7-8': variant(
        'A geothermal plant\'s heat exchanger is corroding. Which material engineering solution is most sustainable?',
        'The local water is highly acidic and sulfur-rich.',
        'Weigh durability against cost, waste, and downtime.',
        [
          o('nrg-3-a', 'Upgrade to a titanium-alloy heat exchanger for high corrosion resistance.', 'engineeringDesign', 'systemsThinking', 10),
          o('nrg-3-b', 'Flush the pipes daily with a basic chemical neutralizer.', 'engineeringDesign', 'systemsThinking', 3),
          o('nrg-3-c', 'Replace the steel pipes every 6 months.', 'engineeringDesign', 'systemsThinking', 1, 'replacing is always cheaper than choosing well'),
          o('nrg-3-d', 'Coat the inside of the existing pipes with a thermal polymer.', 'engineeringDesign', 'systemsThinking', 7),
        ],
      ),
      '9-10': variant(
        'Which exchanger option has the best life-cycle profile in acidic, sulfur-rich brine?',
        'Options differ in upfront cost, service life, and downtime. Strength and chemical resistance are different properties.',
        'Compare cost per year of service, not cost per purchase.',
        [
          o('nrg-3-a', 'Titanium or high-nickel alloy: high upfront cost, but the longest service life and least downtime per year of operation.', 'engineeringDesign', 'systemsThinking', 10),
          o('nrg-3-b', 'High-strength carbon steel: a stronger metal must resist corrosion better.', 'engineeringDesign', 'systemsThinking', 2, 'stronger means more corrosion-resistant'),
          o('nrg-3-c', 'Plain steel with a generous corrosion allowance of extra wall thickness.', 'engineeringDesign', 'systemsThinking', 5, 'more of the same material stops the chemistry'),
          o('nrg-3-d', 'Plain steel replaced on a fixed 6-month schedule.', 'engineeringDesign', 'systemsThinking', 3, 'replacing is always cheaper than choosing well'),
        ],
      ),
      '11-12': variant(
        'Specify the corrosion strategy for a brine exchanger (pH 4, H₂S present). What is the defensible basis for selection?',
        'Candidate alloys carry datasheet claims; the failure mode here is sour-service cracking and under-deposit attack.',
        'Match the alloy to the specific corrosion mechanism, then verify by test.',
        [
          o('nrg-3-a', 'Select high-nickel alloy or titanium for sour service, add isolation joints against galvanic pairs, and verify with immersion tests to the actual brine chemistry.', 'engineeringDesign', 'systemsThinking', 10),
          o('nrg-3-b', 'Choose the alloy with the highest tensile strength on the datasheet.', 'engineeringDesign', 'systemsThinking', 2, 'stronger means more corrosion-resistant'),
          o('nrg-3-c', 'Keep carbon steel and size the wall so corrosion takes five years to penetrate.', 'engineeringDesign', 'systemsThinking', 4, 'more of the same material stops the chemistry'),
          o('nrg-3-d', 'Rely on a corrosion inhibitor dosed by calendar schedule.', 'engineeringDesign', 'systemsThinking', 5),
        ],
      ),
    },
  ),
  blueprint(
    'nrg-4',
    'stem-energy',
    'Renewable Energy Systems',
    ['NGSS SEP3: Planning investigations', 'PISA 2025 C2: Enquiry & data'],
    { depth: 20 },
    {
      '3-4': variant(
        'Where does a stream push a waterwheel hardest — where the stream is squeezed narrow, or where it spreads wide?',
        'The same amount of water passes both places every second.',
        'When the same water must fit through a smaller gap, what happens to its speed?',
        [
          o('nrg-4-a', 'Where it is narrow — the same water must hurry through the smaller gap.', 'scientificInquiry', 'mathematicalReasoning', 10),
          o('nrg-4-b', 'Where it is wide — more water means more push.', 'scientificInquiry', 'mathematicalReasoning', 2, 'more space for water means more push'),
          o('nrg-4-c', 'Where it is deepest — deep water is heavier.', 'scientificInquiry', 'mathematicalReasoning', 4),
          o('nrg-4-d', 'Where it is stillest — calm water saves up its strength.', 'scientificInquiry', 'mathematicalReasoning', 1, 'still water stores more push than moving water'),
        ],
      ),
      '5-6': variant(
        'A village wants the best spot for a small waterwheel on its river. Which stretch should they choose?',
        'Stretch A is narrow and fast; Stretch B is wide and slow; Stretch C is a quiet pond.',
        'The wheel is turned by moving water, not by deep or wide water.',
        [
          o('nrg-4-a', 'The narrow, fast stretch — the river squeezes through and flows quickest there.', 'scientificInquiry', 'mathematicalReasoning', 10),
          o('nrg-4-b', 'The wide, slow stretch — there is more water to push the wheel.', 'scientificInquiry', 'mathematicalReasoning', 2, 'more space for water means more push'),
          o('nrg-4-c', 'The quiet pond — its stored water is full of energy.', 'scientificInquiry', 'mathematicalReasoning', 1, 'still water stores more push than moving water'),
          o('nrg-4-d', 'The deepest point — deep water presses down hardest.', 'scientificInquiry', 'mathematicalReasoning', 4),
        ],
      ),
      '7-8': variant(
        'You are tasked with placing tidal generators. Which coastal topography yields the highest energy potential?',
        'You have access to detailed bathymetric maps.',
        'Kinetic energy in moving water grows fast with speed.',
        [
          o('nrg-4-a', 'A narrow, shallow strait that creates a natural bottleneck.', 'scientificInquiry', 'mathematicalReasoning', 10),
          o('nrg-4-b', 'A wide open bay with deep waters.', 'scientificInquiry', 'mathematicalReasoning', 2, 'more water means more energy'),
          o('nrg-4-c', 'A steep drop-off directly off a cliff face.', 'scientificInquiry', 'mathematicalReasoning', 4),
          o('nrg-4-d', 'A meandering, slow-moving river delta.', 'scientificInquiry', 'mathematicalReasoning', 1, 'still water stores more push than moving water'),
        ],
      ),
      '9-10': variant(
        'Rank these tidal sites for a kinetic turbine array using Q = Av and P ∝ v³.',
        'Site surveys: (A) narrow shallow strait, (B) deep open bay, (C) cliff drop-off, (D) slow delta.',
        'For the same tidal flow Q, what does shrinking the cross-section A do to v — and what does v then do to P?',
        [
          o('nrg-4-a', 'The narrow strait: continuity raises velocity, and power grows with the cube of velocity.', 'scientificInquiry', 'mathematicalReasoning', 10),
          o('nrg-4-b', 'The deep open bay: the largest water mass must carry the most energy.', 'scientificInquiry', 'mathematicalReasoning', 2, 'more water means more energy'),
          o('nrg-4-c', 'The cliff drop-off: tidal range there promises strong currents.', 'scientificInquiry', 'mathematicalReasoning', 4),
          o('nrg-4-d', 'The delta: gentle flow is easier to build in, so net energy is highest.', 'scientificInquiry', 'mathematicalReasoning', 1, 'easier construction outweighs weaker resource'),
        ],
      ),
      '11-12': variant(
        'Two candidate tidal sites remain: a high-range estuary and a high-velocity strait. Which data decide the investment?',
        'Kinetic-stream power scales with v³; barrage schemes scale with range² and basin area. Capital cost dominates both.',
        'Match the technology to the resource, then demand measurements, not maps.',
        [
          o('nrg-4-a', 'ADCP current surveys in the strait: if mean v³ is high, kinetic turbines win — decide on measured velocity distributions, not bathymetry alone.', 'scientificInquiry', 'mathematicalReasoning', 10),
          o('nrg-4-b', 'The estuary automatically: the biggest tidal range always gives the most energy.', 'scientificInquiry', 'mathematicalReasoning', 4, 'one resource number settles a design choice'),
          o('nrg-4-c', 'Whichever site is deeper — depth sets the pressure that drives turbines.', 'scientificInquiry', 'mathematicalReasoning', 2, 'depth drives kinetic turbines'),
          o('nrg-4-d', 'Whichever is nearer the city — cable length beats resource quality every time.', 'scientificInquiry', 'mathematicalReasoning', 3, 'transmission distance outweighs the resource'),
        ],
      ),
    },
  ),
];
