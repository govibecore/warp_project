import { blueprint, o, variant, type ItemBlueprint } from './builder';

/** Mission: Orbital Mechanics */
export const spaceBlueprints: readonly ItemBlueprint[] = [
  blueprint(
    'spc-0',
    'stem-space',
    'Orbital Mechanics',
    ['NGSS SEP5: Mathematics & computational thinking', 'PISA 2025 C1: Explain phenomena'],
    { orbit: 'LEO' },
    {
      '3-4': variant(
        'To throw a ball higher into the air, what matters most?',
        'You try a gentle toss and a strong throw, and watch how high each goes.',
        'Think about what you change with your arm when you want more height.',
        [
          o('spc-0-a', 'How high you want it to go — a higher target needs a harder throw.', 'mathematicalReasoning', 'engineeringDesign', 10),
          o('spc-0-b', 'The colour of the ball.', 'mathematicalReasoning', 'engineeringDesign', 0, 'appearance changes physical behaviour'),
          o('spc-0-c', 'Throwing many small balls one after another.', 'mathematicalReasoning', 'engineeringDesign', 2, 'many weak tries add up to one strong try'),
          o('spc-0-d', 'Waiting for a windy day.', 'mathematicalReasoning', 'engineeringDesign', 3),
        ],
      ),
      '5-6': variant(
        'A spacecraft wants to move from a low circle around Earth to a much higher one. What decides how big a push it needs?',
        'Moving to a higher orbit is like climbing: more height, more energy.',
        'Compare a small step up a hill with a climb up a mountain.',
        [
          o('spc-0-a', 'How much higher the new orbit is — the bigger the climb, the bigger the push.', 'mathematicalReasoning', 'engineeringDesign', 10),
          o('spc-0-b', 'How heavy the spacecraft is — heavier craft always need a bigger push to change orbit.', 'mathematicalReasoning', 'engineeringDesign', 4, 'orbit change depends on vehicle mass'),
          o('spc-0-c', 'How shiny the spacecraft\'s paint is.', 'mathematicalReasoning', 'engineeringDesign', 0, 'appearance changes physical behaviour'),
          o('spc-0-d', 'What day of the year it launches.', 'mathematicalReasoning', 'engineeringDesign', 2, 'the calendar sets the orbit change'),
        ],
      ),
      '7-8': variant(
        'Calculating the delta-v required for a Hohmann transfer orbit. What is the most critical variable?',
        'The spacecraft must move from Low Earth Orbit (LEO) to Geostationary Orbit (GEO).',
        'Which numbers appear inside the orbit-change formula itself?',
        [
          o('spc-0-a', 'The ratio of the initial and final orbital radii.', 'mathematicalReasoning', 'engineeringDesign', 10),
          o('spc-0-b', 'The current mass of the spacecraft\'s communication antenna.', 'mathematicalReasoning', 'engineeringDesign', 2, 'orbit change depends on vehicle mass'),
          o('spc-0-c', 'The color of the spacecraft\'s thermal shielding.', 'mathematicalReasoning', 'engineeringDesign', 0, 'appearance changes physical behaviour'),
          o('spc-0-d', 'The specific impulse (Isp) of the thruster fuel alone.', 'mathematicalReasoning', 'engineeringDesign', 5, 'engine efficiency sets the orbit change'),
        ],
      ),
      '9-10': variant(
        'Which quantities fix the two burn magnitudes of a Hohmann transfer between circular orbits?',
        'Vis-viva: v² = μ(2/r − 1/a). Earth\'s μ is a known constant.',
        'Read the formula: which mission-specific numbers remain once μ is known?',
        [
          o('spc-0-a', 'The initial and final orbital radii — with μ fixed, they set both burn magnitudes through vis-viva.', 'mathematicalReasoning', 'engineeringDesign', 10),
          o('spc-0-b', 'The spacecraft\'s dry mass — heavier craft need more delta-v for the same transfer.', 'mathematicalReasoning', 'engineeringDesign', 3, 'orbit change depends on vehicle mass'),
          o('spc-0-c', 'The engine\'s Isp — a better engine changes the required delta-v.', 'mathematicalReasoning', 'engineeringDesign', 5, 'engine efficiency sets the orbit change'),
          o('spc-0-d', 'The launch site\'s latitude — it tilts the transfer ellipse.', 'mathematicalReasoning', 'engineeringDesign', 2, 'launch latitude tilts the transfer'),
        ],
      ),
      '11-12': variant(
        'For r₂/r₁ ≈ 15, a colleague proposes a bi-elliptic transfer instead of Hohmann. What decides between them?',
        'Both are two-impulse-idealized transfers; the bi-elliptic adds a third burn far from Earth.',
        'Delta-v is mass-free — compare the geometry of the two transfer families.',
        [
          o('spc-0-a', 'Compute both delta-v budgets from the orbital radii: beyond r₂/r₁ ≈ 11.94 the bi-elliptic can win on fuel, at the cost of transfer time.', 'mathematicalReasoning', 'engineeringDesign', 10),
          o('spc-0-b', 'The spacecraft\'s mass — a heavier probe favours the bi-elliptic.', 'mathematicalReasoning', 'engineeringDesign', 2, 'orbit change depends on vehicle mass'),
          o('spc-0-c', 'The Hohmann always wins — the shortest path uses the least energy.', 'mathematicalReasoning', 'engineeringDesign', 4, 'the fastest path is always the cheapest'),
          o('spc-0-d', 'The engine\'s Isp — it determines which transfer geometry is possible.', 'mathematicalReasoning', 'engineeringDesign', 5, 'engine efficiency sets the orbit change'),
        ],
      ),
    },
  ),
  blueprint(
    'spc-1',
    'stem-space',
    'Orbital Mechanics',
    ['NGSS SEP6: Designing solutions', 'PISA 2025 C1: Explain phenomena'],
    { orientation: 'Earth' },
    {
      '3-4': variant(
        'A spinning top keeps pointing the same way while it spins fast. How could a satellite use this trick to keep facing Earth?',
        'The satellite has small wheels inside that can spin faster or slower.',
        'Speeding a spinning wheel up or down gives the body a gentle twist.',
        [
          o('spc-1-a', 'Spin little wheels inside and tilt the satellite by speeding them up or slowing them down.', 'engineeringDesign', 'systemsThinking', 10),
          o('spc-1-b', 'Tie a long string from the satellite down to Earth.', 'engineeringDesign', 'systemsThinking', 0, 'a tether can hang from orbit to the ground'),
          o('spc-1-c', 'Paint one side black so the sun pushes it straight.', 'engineeringDesign', 'systemsThinking', 2, 'dark paint steers satellites'),
          o('spc-1-d', 'Put a heavy weight at the end of a long pole.', 'engineeringDesign', 'systemsThinking', 6),
        ],
      ),
      '5-6': variant(
        'A bicycle wheel spun fast resists being tilted. How can engineers use this to keep a satellite\'s camera pointing at Earth?',
        'Firing little rockets works too, but their fuel runs out quickly.',
        'Wheels can be spun by electric motors — and sunlight is free up there.',
        [
          o('spc-1-a', 'Use spinning wheels powered by solar panels — speed them up or slow them down to nudge the satellite.', 'engineeringDesign', 'systemsThinking', 10),
          o('spc-1-b', 'Fire the small rockets for every tiny correction.', 'engineeringDesign', 'systemsThinking', 3, 'any pointing fix needs rocket fuel'),
          o('spc-1-c', 'Hang a heavy weight below the satellite on a pole.', 'engineeringDesign', 'systemsThinking', 6),
          o('spc-1-d', 'Open a small parachute to steer with the thin air.', 'engineeringDesign', 'systemsThinking', 1, 'parachutes steer in near-vacuum'),
        ],
      ),
      '7-8': variant(
        'A satellite needs to maintain its orientation facing Earth. Which engineering system is best for continuous minor adjustments?',
        'Reaction control thrusters have limited fuel.',
        'Sunlight is unlimited; thruster fuel is not.',
        [
          o('spc-1-a', 'Reaction wheels / Control Moment Gyroscopes using solar power.', 'engineeringDesign', 'systemsThinking', 10),
          o('spc-1-b', 'A heavy counterweight on a long boom.', 'engineeringDesign', 'systemsThinking', 6),
          o('spc-1-c', 'Small bursts from the main chemical engine.', 'engineeringDesign', 'systemsThinking', 1, 'any pointing fix needs rocket fuel'),
          o('spc-1-d', 'Deploying a parachute in the upper atmosphere.', 'engineeringDesign', 'systemsThinking', 0, 'parachutes steer in near-vacuum'),
        ],
      ),
      '9-10': variant(
        'Why do Earth-pointing satellites carry reaction wheels when they already carry thrusters?',
        'Wheels exchange momentum electrically; thrusters expend propellant. External torques slowly load the wheels.',
        'What happens to a wheel after months of absorbing external torque?',
        [
          o('spc-1-a', 'Wheels handle continuous fine pointing for free; thrusters are saved for occasionally dumping the momentum the wheels soak up.', 'engineeringDesign', 'systemsThinking', 10),
          o('spc-1-b', 'Wheels are a backup; thrusters alone are cheaper for all pointing.', 'engineeringDesign', 'systemsThinking', 2, 'any pointing fix needs rocket fuel'),
          o('spc-1-c', 'Wheels cancel gravity, so the satellite stops drifting.', 'engineeringDesign', 'systemsThinking', 1, 'spinning wheels cancel gravity'),
          o('spc-1-d', 'Wheels generate power for the instruments at night.', 'engineeringDesign', 'systemsThinking', 3, 'momentum wheels are power generators'),
        ],
      ),
      '11-12': variant(
        'Size the attitude-control concept for a nadir-pointing satellite in low orbit. What drives the momentum budget?',
        'Disturbance torques: gravity-gradient, solar pressure, residual atmosphere. Wheels saturate without a desaturation path.',
        'Budget the accumulated momentum between dump opportunities.',
        [
          o('spc-1-a', 'A momentum-bias wheel assembly sized to the integrated disturbance torque, with magnetorquers or thrusters for desaturation.', 'engineeringDesign', 'systemsThinking', 10),
          o('spc-1-b', 'Pure thruster control with a large fuel budget — simpler is more reliable.', 'engineeringDesign', 'systemsThinking', 3, 'any pointing fix needs rocket fuel'),
          o('spc-1-c', 'A gravity-gradient boom alone, which needs no power and never saturates.', 'engineeringDesign', 'systemsThinking', 5, 'passive stabilisation gives precise pointing'),
          o('spc-1-d', 'Spin-stabilise the whole spacecraft, camera included.', 'engineeringDesign', 'systemsThinking', 2, 'a spinning camera holds a fixed target'),
        ],
      ),
    },
  ),
  blueprint(
    'spc-2',
    'stem-space',
    'Orbital Mechanics',
    ['NGSS SEP4: Analysing & interpreting data', 'PISA 2025 C1: Explain phenomena'],
    { velocity: 15000 },
    {
      '3-4': variant(
        'When a fire engine drives away, its siren sounds lower. A probe flying away from Earth sends radio waves that look "stretched" (scientists call this redshift). Why?',
        'Sound and radio both travel as waves.',
        'What happens to waves when their source moves away from you?',
        [
          o('spc-2-a', 'The probe is moving away from us, and that stretches the waves out.', 'scientificInquiry', 'mathematicalReasoning', 10),
          o('spc-2-b', 'The waves get tired and slow down on the long trip.', 'scientificInquiry', 'mathematicalReasoning', 2, 'signals tire over distance'),
          o('spc-2-c', 'Space dust paints the waves red.', 'scientificInquiry', 'mathematicalReasoning', 1, 'colour is painted onto signals'),
          o('spc-2-d', 'The probe is moving towards us, squeezing the waves.', 'scientificInquiry', 'mathematicalReasoning', 4, 'stretching means approaching'),
        ],
      ),
      '5-6': variant(
        'A satellite\'s radio signal arrives at a slightly lower frequency than it was transmitted — a redshift. What does that tell ground control?',
        'Just like a siren dropping in pitch as it drives away, waves shift when source and receiver move apart.',
        'Lower frequency = longer wavelength = stretching. What motion stretches?',
        [
          o('spc-2-a', 'The satellite is moving away from the receiver, stretching the wavelength.', 'scientificInquiry', 'mathematicalReasoning', 10),
          o('spc-2-b', 'The satellite is moving toward the receiver, squeezing the wavelength.', 'scientificInquiry', 'mathematicalReasoning', 3, 'stretching means approaching'),
          o('spc-2-c', 'The transmitter battery is running low.', 'scientificInquiry', 'mathematicalReasoning', 4, 'weaker signal means shifted frequency'),
          o('spc-2-d', 'A planet\'s magnetic field tinted the signal red.', 'scientificInquiry', 'mathematicalReasoning', 1, 'colour is painted onto signals'),
        ],
      ),
      '7-8': variant(
        'You are analyzing telemetry data from a probe passing Jupiter. The signal is redshifted. What does this mean?',
        'The probe is communicating via radio waves.',
        'Redshift is about relative motion along the line of sight.',
        [
          o('spc-2-a', 'The probe is moving away from Earth, stretching the wavelength.', 'scientificInquiry', 'mathematicalReasoning', 10),
          o('spc-2-b', 'The probe is moving toward Earth, compressing the wavelength.', 'scientificInquiry', 'mathematicalReasoning', 2, 'stretching means approaching'),
          o('spc-2-c', 'Jupiter\'s magnetic field is tinting the radio waves red.', 'scientificInquiry', 'mathematicalReasoning', 1, 'colour is painted onto signals'),
          o('spc-2-d', 'The probe\'s transmitter is running low on power.', 'scientificInquiry', 'mathematicalReasoning', 3, 'weaker signal means shifted frequency'),
        ],
      ),
      '9-10': variant(
        'Ground stations measure a probe\'s carrier frequency shifted downward. How does this become a velocity measurement?',
        'Δf/f ≈ −vᵣ/c for speeds well below light; the shift is along the line of sight.',
        'Which component of the velocity vector does a frequency shift see?',
        [
          o('spc-2-a', 'The radial velocity: Δf/f gives the line-of-sight speed directly, redshift meaning recession.', 'scientificInquiry', 'mathematicalReasoning', 10),
          o('spc-2-b', 'The total speed — the shift measures motion in every direction at once.', 'scientificInquiry', 'mathematicalReasoning', 3, 'Doppler sees all components of motion'),
          o('spc-2-c', 'The transmitter\'s temperature — heat reddens radio waves.', 'scientificInquiry', 'mathematicalReasoning', 1, 'temperature shifts carrier frequency like motion'),
          o('spc-2-d', 'The signal age — older signals arrive redder.', 'scientificInquiry', 'mathematicalReasoning', 2, 'signals tire over distance'),
        ],
      ),
      '11-12': variant(
        'Before publishing a radial velocity from a Jupiter flyby, which corrections must come out of the raw Doppler shift?',
        'The signal crossed Jupiter\'s gravity well and magnetised plasma; Earth\'s own motion is part of the measurement.',
        'List every non-velocity effect that can move a carrier frequency.',
        [
          o('spc-2-a', 'Gravitational redshift, plasma dispersion, and Earth\'s orbital motion — remove them, and what remains is the probe\'s true radial velocity.', 'scientificInquiry', 'mathematicalReasoning', 10),
          o('spc-2-b', 'Nothing — the Doppler shift reads velocity directly in all conditions.', 'scientificInquiry', 'mathematicalReasoning', 2, 'raw measurements need no correction'),
          o('spc-2-c', 'Only the transmitter\'s battery voltage sag.', 'scientificInquiry', 'mathematicalReasoning', 4, 'weaker signal means shifted frequency'),
          o('spc-2-d', 'Only Jupiter\'s colour, which dyes the carrier red.', 'scientificInquiry', 'mathematicalReasoning', 0, 'colour is painted onto signals'),
        ],
      ),
    },
  ),
  blueprint(
    'spc-3',
    'stem-space',
    'Orbital Mechanics',
    ['NGSS SEP2: Developing & using models', 'PISA 2025 C1: Explain phenomena'],
    { pressure: 0.01 },
    {
      '3-4': variant(
        'A parachute slows a falling toy beautifully in Earth\'s thick air. Mars air is about 100 times thinner. Will the same parachute work as well there?',
        'Parachutes work by pushing against the air.',
        'What does a parachute push against — and how much of it does Mars have?',
        [
          o('spc-3-a', 'No — thin air cannot push back hard enough, so the craft also needs rockets to land softly.', 'systemsThinking', 'engineeringDesign', 10),
          o('spc-3-b', 'Yes — parachutes work the same everywhere.', 'systemsThinking', 'engineeringDesign', 1, 'air is the same everywhere'),
          o('spc-3-c', 'No — because Mars has no gravity to pull the craft down.', 'systemsThinking', 'engineeringDesign', 2, 'Mars has no gravity'),
          o('spc-3-d', 'Yes — if the parachute is painted bright red.', 'systemsThinking', 'engineeringDesign', 0, 'appearance changes physical behaviour'),
        ],
      ),
      '5-6': variant(
        'Why do Mars landers need retro-rockets as well as a big parachute, when Earth capsules manage with parachutes alone?',
        'Mars has an atmosphere, but it is roughly 100 times thinner than Earth\'s.',
        'Drag depends on how much air the parachute can scoop.',
        [
          o('spc-3-a', 'Mars\'s air is too thin to slow the lander enough — the parachute helps, and rockets finish the job.', 'systemsThinking', 'engineeringDesign', 10),
          o('spc-3-b', 'Mars gravity is so strong it tears parachutes.', 'systemsThinking', 'engineeringDesign', 2, 'Mars gravity exceeds Earth\'s'),
          o('spc-3-c', 'Dust storms would blow the lander back into space.', 'systemsThinking', 'engineeringDesign', 3, 'storms can push a lander back to orbit'),
          o('spc-3-d', 'Parachute fabric melts near the Martian surface.', 'systemsThinking', 'engineeringDesign', 1, 'Mars\'s surface is hot enough to melt fabric'),
        ],
      ),
      '7-8': variant(
        'To land safely on Mars, a rover must shed enormous kinetic energy. Why is a parachute insufficient on its own?',
        'Mars has an atmosphere, but it is very different from Earth\'s.',
        'Drag scales with the density of the gas you are moving through.',
        [
          o('spc-3-a', 'Mars\'s atmosphere is too thin (1% of Earth\'s) to provide enough drag.', 'systemsThinking', 'engineeringDesign', 10),
          o('spc-3-b', 'The gravity on Mars is too strong for a parachute to work.', 'systemsThinking', 'engineeringDesign', 2, 'Mars gravity exceeds Earth\'s'),
          o('spc-3-c', 'Parachutes melt due to the extreme heat of the Martian surface.', 'systemsThinking', 'engineeringDesign', 1, 'Mars\'s surface is hot enough to melt fabric'),
          o('spc-3-d', 'The wind storms on Mars will blow the rover back into orbit.', 'systemsThinking', 'engineeringDesign', 4, 'storms can push a lander back to orbit'),
        ],
      ),
      '9-10': variant(
        'Estimate why parachutes alone fail on Mars using drag ∝ ρv².',
        'Mars surface pressure is under 1% of Earth\'s; entry speeds are kilometres per second.',
        'Same shape, same speed — what does 1% density do to drag?',
        [
          o('spc-3-a', 'At ~1% of Earth\'s density, a parachute sheds only a small share of the entry energy — so missions add retropropulsion or a skycrane.', 'systemsThinking', 'engineeringDesign', 10),
          o('spc-3-b', 'Mars\'s stronger gravity outruns any parachute.', 'systemsThinking', 'engineeringDesign', 2, 'Mars gravity exceeds Earth\'s'),
          o('spc-3-c', 'CO₂ cannot fill a parachute canopy the way nitrogen does.', 'systemsThinking', 'engineeringDesign', 3, 'gases differ in whether parachutes can catch them'),
          o('spc-3-d', 'Dust electrostatically glues the canopy shut.', 'systemsThinking', 'engineeringDesign', 1, 'dust glues parachutes shut'),
        ],
      ),
      '11-12': variant(
        'Frame Mars EDL as an engineering budget. What sets the architecture?',
        'Entry mass above a tonne, hypersonic entry, sub-1% Earth density, and no abort once committed.',
        'Follow the energy: where can each megajoule actually go?',
        [
          o('spc-3-a', 'The ballistic coefficient versus available density: heat shield, then supersonic parachute, then powered descent — each sized by the energy the thinner air cannot remove.', 'systemsThinking', 'engineeringDesign', 10),
          o('spc-3-b', 'Bigger parachutes alone — canopy area can always compensate for density.', 'systemsThinking', 'engineeringDesign', 3, 'area can always replace density'),
          o('spc-3-c', 'A wings-and-runway landing, since Mars has some atmosphere.', 'systemsThinking', 'engineeringDesign', 1, 'any atmosphere supports aircraft-style landing'),
          o('spc-3-d', 'Aim for the poles, where thicker air pools.', 'systemsThinking', 'engineeringDesign', 2, 'air pools at the poles like water'),
        ],
      ),
    },
  ),
  blueprint(
    'spc-4',
    'stem-space',
    'Orbital Mechanics',
    ['NGSS SEP5: Mathematics & computational thinking', 'PISA 2025 C2: Enquiry & data'],
    { phase: 45 },
    {
      '3-4': variant(
        'You and a friend walk around a circular track at different speeds. You want to arrive at the gate at the same moment as your friend. What should you figure out?',
        'Your friend walks slower and is already partway around the track.',
        'Think about when to start, not how fast to rush.',
        [
          o('spc-4-a', 'When to start walking so you both reach the gate at the same time.', 'computationalThinking', 'mathematicalReasoning', 10),
          o('spc-4-b', 'Run as fast as you can right now.', 'computationalThinking', 'mathematicalReasoning', 1, 'fastest is always best'),
          o('spc-4-c', 'Wait at the gate every afternoon until your friend shows up.', 'computationalThinking', 'mathematicalReasoning', 4),
          o('spc-4-d', 'Walk backwards so your friend catches up sooner.', 'computationalThinking', 'mathematicalReasoning', 0, 'walking backwards shortens the wait'),
        ],
      ),
      '5-6': variant(
        'Two planets circle the Sun like runners on a track at different speeds. A spacecraft wants to leave one and meet the other. What must the planners calculate?',
        'The trip takes months, and the target planet keeps moving the whole time.',
        'Aim where the planet will be, not where it is now.',
        [
          o('spc-4-a', 'The right head start: launch when the planets are lined up so the target arrives at the meeting point just as the spacecraft does.', 'computationalThinking', 'mathematicalReasoning', 10),
          o('spc-4-b', 'Launch when the planets look closest together in the sky.', 'computationalThinking', 'mathematicalReasoning', 3, 'closest approach is the launch moment'),
          o('spc-4-c', 'Launch any day — space is empty so the route is the same.', 'computationalThinking', 'mathematicalReasoning', 1, 'orbits wait for the traveller'),
          o('spc-4-d', 'Chase the planet from behind at top speed.', 'computationalThinking', 'mathematicalReasoning', 2, 'fastest is always best'),
        ],
      ),
      '7-8': variant(
        'Write an algorithm to calculate the optimal launch window for an intercept mission. What is the core condition to satisfy?',
        'Both planets are in elliptical orbits.',
        'The target must arrive at the meeting point when the spacecraft does.',
        [
          o('spc-4-a', 'Calculate when the phase angle between the two planets matches the transfer orbit duration.', 'computationalThinking', 'mathematicalReasoning', 10),
          o('spc-4-b', 'Wait until the target planet is at its closest point (opposition).', 'computationalThinking', 'mathematicalReasoning', 3, 'closest approach is the launch moment'),
          o('spc-4-c', 'Launch exactly when both planets cross the sun\'s equator.', 'computationalThinking', 'mathematicalReasoning', 2, 'crossing the sun\'s equator aligns the planets'),
          o('spc-4-d', 'Calculate the straight-line distance and divide by maximum velocity.', 'computationalThinking', 'mathematicalReasoning', 1, 'orbits are straight lines at constant speed'),
        ],
      ),
      '9-10': variant(
        'Derive the launch-window condition for a Hohmann-style intercept.',
        'Transfer time t is fixed by the semi-major axis; the target advances along its orbit during t.',
        'Where must the target be at departure so it reaches the rendezvous point at arrival?',
        [
          o('spc-4-a', 'Solve for the departure phase angle that places the target at the intercept point after transfer time t — the window repeats each synodic period.', 'computationalThinking', 'mathematicalReasoning', 10),
          o('spc-4-b', 'Launch at opposition, when the planets are nearest.', 'computationalThinking', 'mathematicalReasoning', 3, 'closest approach is the launch moment'),
          o('spc-4-c', 'Launch when the planets\' orbits geometrically intersect.', 'computationalThinking', 'mathematicalReasoning', 2, 'crossing orbits means meeting planets'),
          o('spc-4-d', 'Divide today\'s interplanetary distance by the cruise speed.', 'computationalThinking', 'mathematicalReasoning', 1, 'orbits are straight lines at constant speed'),
        ],
      ),
      '11-12': variant(
        'Build the tool a mission designer actually uses to pick launch dates. What does it compute?',
        'Requirements: minimum delta-v, bounded time of flight, dates across several years.',
        'Grid the departures and arrivals; propagate both bodies; map the cost.',
        [
          o('spc-4-a', 'A porkchop plot: sweep departure and arrival dates, solve Lambert\'s problem for each pair, and read off the delta-v minima within the synodic cycle.', 'computationalThinking', 'mathematicalReasoning', 10),
          o('spc-4-b', 'A calendar of oppositions — the closest approach each year is the launch day.', 'computationalThinking', 'mathematicalReasoning', 3, 'closest approach is the launch moment'),
          o('spc-4-c', 'A straight-line integrator at constant cruise speed between the planets.', 'computationalThinking', 'mathematicalReasoning', 1, 'orbits are straight lines at constant speed'),
          o('spc-4-d', 'A weather model for the launch site, which sets the interplanetary trajectory.', 'computationalThinking', 'mathematicalReasoning', 1, 'launch weather shapes the interplanetary path'),
        ],
      ),
    },
  ),
];
