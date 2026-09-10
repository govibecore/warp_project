import { blueprint, o, variant, type ItemBlueprint } from './builder';

/** Mission: Cybersecurity & Data Science */
export const dataBlueprints: readonly ItemBlueprint[] = [
  blueprint(
    'dat-0',
    'stem-data',
    'Cybersecurity & Data Science',
    ['NGSS SEP6: Designing solutions', 'PISA 2025 C3: Decide with evidence'],
    { nodes: 50 },
    {
      '3-4': variant(
        'The class keeps a secret reading log. How should we protect it so only classmates can read it, even if someone finds the notebook?',
        'The notebook sometimes sits on the shelf where visitors walk past.',
        'Think about what a stranger could do if they simply picked it up.',
        [
          o('dat-0-a', 'Write it in a code only classmates know, so finding it is not the same as reading it.', 'computationalThinking', 'systemsThinking', 10),
          o('dat-0-b', 'Hide it under the teacher\'s desk — hiding is the same as protecting.', 'computationalThinking', 'systemsThinking', 3, 'hiding is the same as protecting'),
          o('dat-0-c', 'Leave it open but ask everyone nicely not to peek.', 'computationalThinking', 'systemsThinking', 1, 'rules work without enforcement'),
          o('dat-0-d', 'Use one easy password like "1234" for everything in class.', 'computationalThinking', 'systemsThinking', 2, 'one weak lock protects everything'),
        ],
      ),
      '5-6': variant(
        'A club stores its members\' phone numbers in a shared online document. What is the safest setup?',
        'The link to the document sometimes gets forwarded to people outside the club.',
        'Ask what happens the moment the link leaks — is the content still protected?',
        [
          o('dat-0-a', 'Protect it with a strong password and give access only to members who need it, so a leaked link opens nothing.', 'computationalThinking', 'systemsThinking', 10),
          o('dat-0-b', 'Keep the link secret and hope nobody forwards it.', 'computationalThinking', 'systemsThinking', 3, 'hiding is the same as protecting'),
          o('dat-0-c', 'Write the names in a silly spelling so strangers might not notice.', 'computationalThinking', 'systemsThinking', 4, 'simple tricks are unbreakable'),
          o('dat-0-d', 'Share one easy password for every club tool so nobody forgets it.', 'computationalThinking', 'systemsThinking', 2, 'one weak lock protects everything'),
        ],
      ),
      '7-8': variant(
        'A school app stores students\' medical notes. What does "protecting the data" actually require?',
        'The app sits behind the school firewall. Backups are copied to a second server.',
        'Follow the data everywhere it lives — not just the front door.',
        [
          o('dat-0-a', 'Encrypt the notes in storage and in transit, and limit who can decrypt them — the firewall alone guards only the perimeter.', 'computationalThinking', 'systemsThinking', 10),
          o('dat-0-b', 'Rely on the school firewall; inside it, everything is safe.', 'computationalThinking', 'systemsThinking', 3, 'a perimeter wall protects everything inside'),
          o('dat-0-c', 'Remove student names from the notes, so the data is anonymised.', 'computationalThinking', 'systemsThinking', 5, 'removing names makes data anonymous'),
          o('dat-0-d', 'Set one strong admin password shared by the whole office.', 'computationalThinking', 'systemsThinking', 2, 'one weak lock protects everything'),
        ],
      ),
      '9-10': variant(
        'Securing a decentralized database against unauthorized access. Which cryptographic approach is most resilient?',
        'The database stores sensitive medical records.',
        'Design for the day the perimeter fails.',
        [
          o('dat-0-a', 'Implement end-to-end encryption with zero-knowledge proofs for queries.', 'computationalThinking', 'systemsThinking', 10),
          o('dat-0-b', 'Use a single master password for all nodes.', 'computationalThinking', 'systemsThinking', 0, 'one weak lock protects everything'),
          o('dat-0-c', 'Rely entirely on network firewalls at the perimeter.', 'computationalThinking', 'systemsThinking', 3, 'a perimeter wall protects everything inside'),
          o('dat-0-d', 'Anonymize the data but leave it unencrypted.', 'computationalThinking', 'systemsThinking', 5, 'removing names makes data anonymous'),
        ],
      ),
      '11-12': variant(
        'Threat-model a medical records store: the adversary eventually gets inside. What architecture still protects the records?',
        'Perimeter breaches are a matter of when. Insiders and subpoenas are in scope too.',
        'Make the data useless to whoever holds it without authorisation.',
        [
          o('dat-0-a', 'Field-level encryption with per-record keys, access via tokenisation or zero-knowledge proofs, and audited key custody — defense in depth assumes the breach.', 'computationalThinking', 'systemsThinking', 10),
          o('dat-0-b', 'A hardened perimeter with intrusion detection — keep the adversary out.', 'computationalThinking', 'systemsThinking', 3, 'a perimeter wall protects everything inside'),
          o('dat-0-c', 'Pseudonymised columns with the mapping table on the same server.', 'computationalThinking', 'systemsThinking', 5, 'removing names makes data anonymous'),
          o('dat-0-d', 'Obscure schema and port numbers — attackers cannot attack what they cannot map.', 'computationalThinking', 'systemsThinking', 1, 'hiding is the same as protecting'),
        ],
      ),
    },
  ),
  blueprint(
    'dat-1',
    'stem-data',
    'Cybersecurity & Data Science',
    ['NGSS SEP4: Analysing & interpreting data', 'PISA 2025 C2: Enquiry & data'],
    { fraud: 0.1 },
    {
      '3-4': variant(
        'In the desert it almost never rains. If I guess "no rain tomorrow" every single day, I am right 99 days out of 100. Am I a good weather forecaster?',
        'The one rainy day is the day everyone needed the forecast for.',
        'Being right often is not the same as being useful.',
        [
          o('dat-1-a', 'No — I just say the same thing every day and never catch the rare rainy days.', 'mathematicalReasoning', 'computationalThinking', 10),
          o('dat-1-b', 'Yes — 99 out of 100 is a top score.', 'mathematicalReasoning', 'computationalThinking', 1, 'a high score always means a good method'),
          o('dat-1-c', 'Yes — deserts are easy places to forecast.', 'mathematicalReasoning', 'computationalThinking', 3, 'an easy setting makes any method good'),
          o('dat-1-d', 'No — because 99 is not 100.', 'mathematicalReasoning', 'computationalThinking', 2, 'only a perfect score has any value'),
        ],
      ),
      '5-6': variant(
        'A bag holds 1000 marbles; only 3 are white. A robot guesses "blue" for every marble and scores 99.7%. Is the robot good at finding white marbles?',
        'The robot\'s job was to find the white ones.',
        'How many white marbles did it actually find?',
        [
          o('dat-1-a', 'No — it found zero white marbles; always guessing the common kind just copies the bag.', 'mathematicalReasoning', 'computationalThinking', 10),
          o('dat-1-b', 'Yes — 99.7% is nearly perfect.', 'mathematicalReasoning', 'computationalThinking', 1, 'a high score always means a good method'),
          o('dat-1-c', 'Yes — it is fast, and speed is what matters.', 'mathematicalReasoning', 'computationalThinking', 2, 'speed is the goal of detection'),
          o('dat-1-d', 'No — because 3 white marbles is too few to matter.', 'mathematicalReasoning', 'computationalThinking', 3, 'rare things are not worth finding'),
        ],
      ),
      '7-8': variant(
        'A fraud-detection app boasts 99.9% accuracy, yet misses half of all real fraud. How is that possible?',
        'Only 1 transaction in 1000 is fraudulent.',
        'Accuracy counts the huge pile of honest transactions too.',
        [
          o('dat-1-a', 'Labelling everything "honest" already scores 99.9% — accuracy hides the rare cases the app was built to catch.', 'mathematicalReasoning', 'computationalThinking', 10),
          o('dat-1-b', 'The app is nearly perfect; half the fraud was probably miscounted.', 'mathematicalReasoning', 'computationalThinking', 1, 'a high score always means a good method'),
          o('dat-1-c', 'The app needs a faster computer to reach 100%.', 'mathematicalReasoning', 'computationalThinking', 2, 'more compute fixes the wrong metric'),
          o('dat-1-d', 'Fraud is impossible to detect, so the score is meaningless either way.', 'mathematicalReasoning', 'computationalThinking', 3, 'rare things are not worth finding'),
        ],
      ),
      '9-10': variant(
        'An AI model for detecting fraudulent transactions has a 99% accuracy rate, but misses 50% of actual frauds. Why?',
        'Fraudulent transactions make up 0.1% of the dataset.',
        'Ask what the model is rewarded for, and what the reward ignores.',
        [
          o('dat-1-a', 'The dataset is highly imbalanced; the model predicts "not fraud" almost always to achieve high accuracy.', 'mathematicalReasoning', 'computationalThinking', 10),
          o('dat-1-b', 'The AI is learning too slowly and needs more epochs.', 'mathematicalReasoning', 'computationalThinking', 4, 'more training fixes the wrong objective'),
          o('dat-1-c', 'The hackers are using quantum computers to bypass the AI.', 'mathematicalReasoning', 'computationalThinking', 1, 'an exotic attacker explains a mundane failure'),
          o('dat-1-d', 'The model\'s learning rate is set too high.', 'mathematicalReasoning', 'computationalThinking', 5),
        ],
      ),
      '11-12': variant(
        'Which evaluation setup would have caught the "99% accuracy, 50% recall" fraud model before deployment?',
        'Prevalence is 0.1%. The business cost of a missed fraud is 100× a false alarm.',
        'Choose the metric that prices the mistake the business actually fears.',
        [
          o('dat-1-a', 'Report recall and precision (or PR-AUC) at the operating threshold, and tune the threshold for the asymmetric cost — accuracy at 0.1% prevalence is dominated by true negatives.', 'mathematicalReasoning', 'computationalThinking', 10),
          o('dat-1-b', 'Cross-validate accuracy more carefully with more folds.', 'mathematicalReasoning', 'computationalThinking', 3, 'averaging the wrong metric more carefully fixes it'),
          o('dat-1-c', 'Train longer until accuracy reaches 99.9%.', 'mathematicalReasoning', 'computationalThinking', 4, 'more training fixes the wrong objective'),
          o('dat-1-d', 'Collect only fraudulent examples so the model sees more of them.', 'mathematicalReasoning', 'computationalThinking', 2, 'removing the majority class balances the data'),
        ],
      ),
    },
  ),
  blueprint(
    'dat-2',
    'stem-data',
    'Cybersecurity & Data Science',
    ['NGSS SEP3: Planning investigations', 'PISA 2025 C3: Decide with evidence'],
    { traffic: 'high' },
    {
      '3-4': variant(
        'Pencils keep vanishing from the class box at lunch. What should we do first to find out how?',
        'Nobody has seen the pencils disappear yet.',
        'Before changing anything, watch and record.',
        [
          o('dat-2-a', 'Watch quietly and write down what happens before changing anything.', 'systemsThinking', 'engineeringDesign', 10),
          o('dat-2-b', 'Accuse the tallest kid in class right away.', 'systemsThinking', 'engineeringDesign', 0, 'guessing first is fair'),
          o('dat-2-c', 'Throw the pencil box away so the problem stops.', 'systemsThinking', 'engineeringDesign', 1, 'destroying the scene ends the problem'),
          o('dat-2-d', 'Lock the box forever so nobody can use it.', 'systemsThinking', 'engineeringDesign', 4),
        ],
      ),
      '5-6': variant(
        'The library computer shows strange pop-ups every evening. What should the student tech team do first?',
        'The computer still works, and teachers need it in the morning.',
        'Clues disappear when you wipe or restart a machine.',
        [
          o('dat-2-a', 'Note the times and take photos of the pop-ups, then disconnect it from the network and tell the teacher.', 'systemsThinking', 'engineeringDesign', 10),
          o('dat-2-b', 'Delete every file that looks odd and reinstall everything.', 'systemsThinking', 'engineeringDesign', 2, 'wiping removes the problem and the evidence'),
          o('dat-2-c', 'Click a pop-up to see where it leads.', 'systemsThinking', 'engineeringDesign', 1, 'exploring the threat is safe'),
          o('dat-2-d', 'Ignore it — pop-ups are normal on old computers.', 'systemsThinking', 'engineeringDesign', 3, 'familiar-looking noise is harmless'),
        ],
      ),
      '7-8': variant(
        'You suspect a server is compromised because of unusually high outbound traffic at 3 AM. What is your first forensic step?',
        'The server is currently running critical but non-life-saving tasks.',
        'Evidence is volatile — some of it vanishes when you pull the plug.',
        [
          o('dat-2-a', 'Capture the network traffic (PCAP) and isolate the server from the internet.', 'systemsThinking', 'engineeringDesign', 10),
          o('dat-2-b', 'Immediately format the hard drive and reinstall the OS.', 'systemsThinking', 'engineeringDesign', 2, 'wiping removes the problem and the evidence'),
          o('dat-2-c', 'Log in and confront the hacker in the terminal.', 'systemsThinking', 'engineeringDesign', 1, 'engaging the intruder helps'),
          o('dat-2-d', 'Ignore it; routine backups usually run at night.', 'systemsThinking', 'engineeringDesign', 4, 'familiar-looking noise is harmless'),
        ],
      ),
      '9-10': variant(
        'Order the first moves of an incident responder who finds a server beaconing to an unknown host at 3 AM.',
        'The box runs critical batch jobs; RAM holds the live connections.',
        'Volatile evidence first, containment fast — but never destroy what you must later explain.',
        [
          o('dat-2-a', 'Isolate the host, capture volatile evidence (RAM, connections), then image the disk — preserving the chain of custody.', 'systemsThinking', 'engineeringDesign', 10),
          o('dat-2-b', 'Power it off instantly to stop the leak, whatever is lost.', 'systemsThinking', 'engineeringDesign', 4, 'pulling the plug preserves evidence'),
          o('dat-2-c', 'Reimage from a clean backup before touching anything else.', 'systemsThinking', 'engineeringDesign', 2, 'wiping removes the problem and the evidence'),
          o('dat-2-d', 'Watch it for a month to map the attacker\'s whole network first.', 'systemsThinking', 'engineeringDesign', 3, 'more observation is always worth the exposure'),
        ],
      ),
      '11-12': variant(
        'What does a defensible incident-response runbook optimise for in the first hour of a confirmed breach?',
        'Legal discovery is likely; the business wants servers back; the attacker may still be inside.',
        'Every action trades evidence integrity against service continuity — write down who decides.',
        [
          o('dat-2-a', 'A pre-agreed authority chain: isolate, preserve volatile evidence, snapshot, then analyse — each trade-off between continuity and evidence logged as it is made.', 'systemsThinking', 'engineeringDesign', 10),
          o('dat-2-b', 'Speed of recovery above all; forensics can work from backups later.', 'systemsThinking', 'engineeringDesign', 3, 'recovery speed outranks attribution'),
          o('dat-2-c', 'Immediate public disclosure to warn customers.', 'systemsThinking', 'engineeringDesign', 2, 'disclosure first is always the honest move'),
          o('dat-2-d', 'Counter-attacking the source to deter a second attempt.', 'systemsThinking', 'engineeringDesign', 0, 'striking back is lawful and useful'),
        ],
      ),
    },
  ),
  blueprint(
    'dat-3',
    'stem-data',
    'Cybersecurity & Data Science',
    ['NGSS SEP5: Mathematics & computational thinking', 'PISA 2025 C3: Decide with evidence'],
    { nodes: 1000 },
    {
      '3-4': variant(
        'What is the clever way to solve a maze?',
        'You can mark paths you have already tried with chalk.',
        'Heading toward the exit beats wandering — and chalk stops you repeating yourself.',
        [
          o('dat-3-a', 'Head toward the exit and mark the paths you already tried so you never repeat them.', 'computationalThinking', 'mathematicalReasoning', 10),
          o('dat-3-b', 'Close your eyes and walk; you will get lucky eventually.', 'computationalThinking', 'mathematicalReasoning', 0, 'random wandering is a strategy'),
          o('dat-3-c', 'Try the same wrong turn again and again — it might open next time.', 'computationalThinking', 'mathematicalReasoning', 1, 'repeating a failed try will work'),
          o('dat-3-d', 'Knock down the walls and walk straight.', 'computationalThinking', 'mathematicalReasoning', 0, 'breaking the puzzle solves it'),
        ],
      ),
      '5-6': variant(
        'A delivery robot must cross a grid of streets, avoiding closed roads. Which rule gets it there quickly?',
        'The robot knows the map and can see its goal\'s direction.',
        'Explore the promising streets first — the ones that shrink the remaining distance.',
        [
          o('dat-3-a', 'Always expand the route that looks shortest so far plus straight-line distance to the goal.', 'computationalThinking', 'mathematicalReasoning', 10),
          o('dat-3-b', 'Explore every street one by one until the goal appears.', 'computationalThinking', 'mathematicalReasoning', 3, 'checking everything is thorough and therefore fast'),
          o('dat-3-c', 'Take random turns; the city is small.', 'computationalThinking', 'mathematicalReasoning', 1, 'random wandering is a strategy'),
          o('dat-3-d', 'Sort all the streets by length first, then start driving.', 'computationalThinking', 'mathematicalReasoning', 2, 'sorting the map finds the route'),
        ],
      ),
      '7-8': variant(
        'Design an algorithm to find the fastest route for a delivery drone avoiding no-fly zones. Which algorithm is best?',
        'The city is mapped as a grid of weighted nodes.',
        'Combine the cost so far with an honest estimate of the cost to go.',
        [
          o('dat-3-a', 'A* (A-Star) Search Algorithm using a heuristic distance.', 'computationalThinking', 'mathematicalReasoning', 10),
          o('dat-3-b', 'Depth-First Search (DFS) to explore every possible alleyway.', 'computationalThinking', 'mathematicalReasoning', 2, 'going deep first finds the shortest path'),
          o('dat-3-c', 'Bubble sort to arrange the destinations by distance.', 'computationalThinking', 'mathematicalReasoning', 1, 'sorting the map finds the route'),
          o('dat-3-d', 'Random walk until it hits the destination.', 'computationalThinking', 'mathematicalReasoning', 0, 'random wandering is a strategy'),
        ],
      ),
      '9-10': variant(
        'Why does A* outperform plain Dijkstra on a city grid — and when must you fall back to Dijkstra?',
        'Edge weights are travel times; the straight-line distance to the goal is known.',
        'The heuristic must never overestimate the true remaining cost.',
        [
          o('dat-3-a', 'A* adds an admissible heuristic (straight-line ÷ top speed) that prunes hopeless directions; without a trustworthy heuristic, use Dijkstra.', 'computationalThinking', 'mathematicalReasoning', 10),
          o('dat-3-b', 'A* is just Dijkstra with a better name; either works identically.', 'computationalThinking', 'mathematicalReasoning', 3, 'the heuristic is decorative'),
          o('dat-3-c', 'DFS uses less memory, so it finds shorter routes.', 'computationalThinking', 'mathematicalReasoning', 2, 'going deep first finds the shortest path'),
          o('dat-3-d', 'Greedy best-first is optimal because it is fastest.', 'computationalThinking', 'mathematicalReasoning', 4, 'fastest search means shortest path'),
        ],
      ),
      '11-12': variant(
        'No-fly zones shift with weather, invalidating the drone\'s planned route mid-flight. What does the planner need beyond A*?',
        'Edge costs change online; recomputing A* from scratch each update is too slow.',
        'Reuse the previous search tree and repair only what changed.',
        [
          o('dat-3-a', 'An incremental replanner (D* Lite / LPA*) that repairs the affected branches, on top of a provably admissible heuristic.', 'computationalThinking', 'mathematicalReasoning', 10),
          o('dat-3-b', 'A deeper A* search run once, perfectly, at take-off.', 'computationalThinking', 'mathematicalReasoning', 2, 'a perfect plan survives a changing world'),
          o('dat-3-c', 'A neural network that has seen many city maps.', 'computationalThinking', 'mathematicalReasoning', 4, 'learned guesses come with optimality guarantees'),
          o('dat-3-d', 'Breadth-first search restarted on every weather update.', 'computationalThinking', 'mathematicalReasoning', 3, 'restarting from scratch is the only correct response'),
        ],
      ),
    },
  ),
  blueprint(
    'dat-4',
    'stem-data',
    'Cybersecurity & Data Science',
    ['NGSS SEP6: Designing solutions', 'PISA 2025 C3: Decide with evidence'],
    { security: 'low' },
    {
      '3-4': variant(
        'Why do we use nicknames on the game scoreboard instead of everyone\'s real names?',
        'The scoreboard hangs in the hallway where anyone can read it.',
        'What could a stranger do with a list of real names?',
        [
          o('dat-4-a', 'So strangers who read the board cannot learn who we are — nicknames are our code.', 'engineeringDesign', 'computationalThinking', 10),
          o('dat-4-b', 'Real names are fine — everyone at school is honest.', 'engineeringDesign', 'computationalThinking', 1, 'no one misuses information'),
          o('dat-4-c', 'We write names backwards; nobody could ever undo that.', 'engineeringDesign', 'computationalThinking', 2, 'simple tricks are unbreakable'),
          o('dat-4-d', 'We should never keep score at all.', 'engineeringDesign', 'computationalThinking', 3),
        ],
      ),
      '5-6': variant(
        'A website asks for your password. Its programmer says, "Don\'t worry, we store passwords scrambled." Which scrambling is actually safe?',
        'Some scrambles can be unscrambled; good ones cannot.',
        'If the site can unscramble it, so can a thief who steals their key.',
        [
          o('dat-4-a', 'A one-way scramble (hash) that cannot be undone, with a different random pinch of "salt" mixed in for every user.', 'engineeringDesign', 'computationalThinking', 10),
          o('dat-4-b', 'Writing the passwords backwards in the database.', 'engineeringDesign', 'computationalThinking', 1, 'simple tricks are unbreakable'),
          o('dat-4-c', 'Locking them with the same key the website keeps next to them.', 'engineeringDesign', 'computationalThinking', 4, 'hiding is the same as protecting'),
          o('dat-4-d', 'Asking users to pick short passwords so they are easy to re-type.', 'engineeringDesign', 'computationalThinking', 0, 'short secrets are safer'),
        ],
      ),
      '7-8': variant(
        'A company stores user passwords in plain text. You must upgrade their security. What is the industry standard?',
        'The system must defend against rainbow table attacks.',
        'Store something you can check a password against but cannot turn back into one.',
        [
          o('dat-4-a', 'Salt the passwords and hash them using a slow algorithm like bcrypt or Argon2.', 'engineeringDesign', 'computationalThinking', 10),
          o('dat-4-b', 'Encrypt the passwords using AES-256 and hide the key.', 'engineeringDesign', 'computationalThinking', 6, 'encryption and hashing are interchangeable'),
          o('dat-4-c', 'Hash the passwords using MD5, since it is very fast.', 'engineeringDesign', 'computationalThinking', 3, 'fast hashing is good for passwords'),
          o('dat-4-d', 'Encode the passwords in Base64 so they aren\'t readable.', 'engineeringDesign', 'computationalThinking', 1, 'encoding is encryption'),
        ],
      ),
      '9-10': variant(
        'Why are bcrypt and Argon2 preferred over SHA-256 for password storage — isn\'t SHA-256 a strong hash?',
        'Attackers with the database try billions of guesses per second on GPUs.',
        'Strong and fast are two different properties — which one helps the attacker?',
        [
          o('dat-4-a', 'Password hashing must be slow and memory-hungry to throttle guessing; SHA-256 is cryptographically strong but deliberately fast — the wrong property here.', 'engineeringDesign', 'computationalThinking', 10),
          o('dat-4-b', 'SHA-256 has been broken, so anything else is safer.', 'engineeringDesign', 'computationalThinking', 3, 'a famous hash must be broken'),
          o('dat-4-c', 'bcrypt encrypts the password, and encryption beats hashing.', 'engineeringDesign', 'computationalThinking', 4, 'encryption and hashing are interchangeable'),
          o('dat-4-d', 'Salting is impossible with SHA-256 but built into bcrypt.', 'engineeringDesign', 'computationalThinking', 2, 'salts require special algorithms'),
        ],
      ),
      '11-12': variant(
        'Design password storage for a service that must survive a full database breach. Specify the complete scheme.',
        'Assume the attacker gets the users table and has serious GPU capacity; the server must still verify logins daily.',
        'Slow the attacker per guess, isolate their rainbow tables per user, and keep one secret off the stolen box.',
        [
          o('dat-4-a', 'Argon2id with per-user salt and memory-hard parameters, plus a server-side pepper in an HSM and login rate-limiting.', 'engineeringDesign', 'computationalThinking', 10),
          o('dat-4-b', 'AES-256 encryption with the key in an environment variable on the same host.', 'engineeringDesign', 'computationalThinking', 4, 'encryption and hashing are interchangeable'),
          o('dat-4-c', 'Double SHA-256 — two rounds of a strong hash is slow enough.', 'engineeringDesign', 'computationalThinking', 3, 'fast hashing is good for passwords'),
          o('dat-4-d', 'Base64 with a proprietary prefix, rotated monthly.', 'engineeringDesign', 'computationalThinking', 0, 'encoding is encryption'),
        ],
      ),
    },
  ),
];
