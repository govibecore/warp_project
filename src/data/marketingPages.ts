export interface MarketingSection {
  heading: string;
  body: string[];
}

export interface MarketingPageData {
  slug: string;
  title: string;
  subtitle: string;
  sections: MarketingSection[];
}

export const MARKETING_PAGES: Record<string, MarketingPageData> = {
  'stem-benchmark': {
    slug: 'stem-benchmark',
    title: 'STEM Benchmark',
    subtitle: 'Global precision mapping for science, technology, engineering, and mathematics.',
    sections: [
      {
        heading: 'The Global Standard',
        body: [
          "WARP's STEM Benchmark is calibrated against the most rigorous international frameworks, including the Next Generation Science Standards (NGSS) and PISA 2025.",
          "Unlike traditional localized testing, WARP evaluates cognitive agility, spatial reasoning, and computational thinking - the exact vectors required for modern engineering and scientific discovery."
        ]
      },
      {
        heading: 'Adaptive Precision',
        body: [
          "Our Computerized Adaptive Testing (CAT) engine utilizes Item Response Theory (IRT) to recalibrate difficulty in real-time. This eliminates ceiling effects found in standard grade-level exams.",
          "If a student demonstrates mastery, the engine accelerates into advanced conceptual territory, mapping their exact upper boundary of competence across 5 unique STEM districts."
        ]
      }
    ]
  },
  'english-assessment': {
    slug: 'english-assessment',
    title: 'English Assessment',
    subtitle: 'Advanced rhetorical, syntactic, and structural language analysis.',
    sections: [
      {
        heading: 'Beyond Vocabulary',
        body: [
          "True linguistic competence extends far beyond simple vocabulary recall. The WARP English Assessment evaluates high-level reading comprehension, rhetorical analysis, and logical structuring.",
          "Aligned with elite international standards, the assessment measures a student's ability to synthesize arguments, identify bias, and parse complex informational texts."
        ]
      },
      {
        heading: 'Diagnostic Output',
        body: [
          "Results are mapped into specific actionable domains, providing clear visibility into syntactic weaknesses or reading stamina drops. This allows for highly targeted intervention rather than broad, unfocused tutoring."
        ]
      }
    ]
  },
  'ai-reports': {
    slug: 'ai-reports',
    title: 'AI Reports',
    subtitle: 'Algorithmic synthesis of psychometric data into actionable roadmaps.',
    sections: [
      {
        heading: 'Real-Time Synthesis',
        body: [
          "WARP replaces static scorecards with dynamic AI-generated reporting. By analyzing response latency, item difficulty curves, and misconception patterns, our engine constructs a multi-dimensional profile of the student's cognitive approach."
        ]
      },
      {
        heading: 'Predictive Modeling',
        body: [
          "The AI does not just report past performance; it projects future trajectories. It identifies specific 'chokepoints' in understanding that, if resolved, will yield the highest mathematical or scientific return on investment."
        ]
      }
    ]
  },
  'global-rankings': {
    slug: 'global-rankings',
    title: 'Global Rankings',
    subtitle: 'Contextualizing local performance on the world stage.',
    sections: [
      {
        heading: 'The True Baseline',
        body: [
          "Local school grades often suffer from severe grade inflation. A straight-A student in one district may be years behind the curve in an elite international cohort.",
          "WARP strips away local bias. By normalizing scores across a diverse, massive global dataset, we provide parents with the unvarnished truth regarding where their child stands on the global curve."
        ]
      }
    ]
  },
  'parent-reports': {
    slug: 'parent-reports',
    title: 'Parent Reports',
    subtitle: 'Clear, unvarnished truth for the home architect.',
    sections: [
      {
        heading: 'Radical Transparency',
        body: [
          "We believe parents are the ultimate architects of their child's future. WARP Parent Reports bypass educational jargon and deliver crisp, actionable intelligence.",
          "You will see exactly where your child ranks, exactly which concepts they misunderstand, and exactly what resources or interventions are required to course-correct."
        ]
      }
    ]
  },
  'pricing': {
    slug: 'pricing',
    title: 'Pricing',
    subtitle: 'Democratic access to elite psychometric intelligence.',
    sections: [
      {
        heading: 'WARP Vanguard (Pro)',
        body: [
          "For families requiring deep longitudinal tracking, predictive AI modeling, and persistent dashboards, WARP Vanguard is available for $12/month.",
          "This includes unlimited adaptive assessments, historical trend analysis, and secure cloud synchronization."
        ]
      }
    ]
  },
  'about': {
    slug: 'about',
    title: 'About WARP',
    subtitle: 'Forging the next generation of global leaders.',
    sections: [
      {
        heading: 'The Mission',
        body: [
          "The future belongs to those who can build it. We created WARP because the traditional educational assessment model is fundamentally broken - too slow, too localized, and too opaque.",
          "Our mission is to arm parents and students with military-grade psychometric intelligence, allowing them to bypass failing local standards and compete directly on the global stage."
        ]
      }
    ]
  },
  'research': {
    slug: 'research',
    title: 'Research & Validity',
    subtitle: 'The mathematical foundation of the WARP engine.',
    sections: [
      {
        heading: 'Psychometric Calibration',
        body: [
          "WARP utilizes a highly modified 3-Parameter Logistic (3PL) Item Response Theory model. Every question in our vault is continuously calibrated for difficulty (b), discrimination (a), and pseudo-guessing (c) against live global data."
        ]
      },
      {
        heading: 'Standards Alignment',
        body: [
          "Construct validity is maintained through strict alignment with the Next Generation Science Standards (NGSS) frameworks and the mathematical progression models outlined in international benchmarks (PISA, TIMSS)."
        ]
      }
    ]
  },
  'privacy-policy': {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    subtitle: 'Zero-compromise data sovereignty.',
    sections: [
      {
        heading: 'Data Minimization',
        body: [
          "We collect only what is mathematically necessary to generate a valid benchmark. We do not sell data. We do not run advertisements. We do not share student profiles with third-party brokers."
        ]
      },
      {
        heading: 'Cryptographic Security',
        body: [
          "Registered accounts are protected by strict Row-Level Security (RLS) policies at the database level. A user's data is mathematically inaccessible to anyone without their cryptographic authorization token."
        ]
      }
    ]
  },
  'terms-of-use': {
    slug: 'terms-of-use',
    title: 'Terms of Use',
    subtitle: 'The rules of engagement.',
    sections: [
      {
        heading: 'Acceptable Use',
        body: [
          "WARP is an educational diagnostic instrument. Any attempt to reverse-engineer the item bank, manipulate the adaptive algorithm via automated scraping, or exploit the API endpoints will result in immediate, permanent termination of access."
        ]
      },
      {
        heading: 'Service Availability',
        body: [
          "While we strive for 99.99% uptime, WARP is provided 'as is'. We are not liable for interruptions in service or data loss resulting from user-side network failures or cryptographic key loss."
        ]
      }
    ]
  }
};
