export interface IRTResponse {
  a: number; // discrimination
  b: number; // difficulty
  c: number; // guessing
  correct: boolean;
}

export interface EAPResult {
  theta: number;
  sem: number;
}

export function estimateThetaEAP(responses: IRTResponse[]): EAPResult {
  if (responses.length === 0) return { theta: 0, sem: 1 }; // Default prior

  const nodes: number[] = [];
  const weights: number[] = [];
  
  // 41 nodes from -4 to 4 (step 0.2)
  for (let i = -20; i <= 20; i++) {
    const x = i * 0.2;
    nodes.push(x);
    // Standard normal prior weight (unnormalized)
    weights.push(Math.exp(-0.5 * x * x));
  }

  let numer = 0;
  let denom = 0;
  const likelihoods: number[] = [];

  nodes.forEach((theta, i) => {
    let likelihood = 1;
    for (const r of responses) {
      // 3PL probability: P(theta) = c + (1-c) / (1 + exp(-a * (theta - b)))
      const p = r.c + (1 - r.c) / (1 + Math.exp(-r.a * (theta - r.b)));
      likelihood *= r.correct ? p : (1 - p);
    }
    likelihoods.push(likelihood);
    numer += theta * likelihood * weights[i];
    denom += likelihood * weights[i];
  });

  const thetaEAP = denom === 0 ? 0 : numer / denom;

  let varNumer = 0;
  nodes.forEach((theta, i) => {
    varNumer += Math.pow(theta - thetaEAP, 2) * likelihoods[i] * weights[i];
  });
  
  const sem = denom === 0 ? 1 : Math.sqrt(varNumer / denom);

  return { theta: thetaEAP, sem };
}
