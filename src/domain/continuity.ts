import type { ScenarioMutation, ScenarioState } from './types';

export function applyScenarioMutation(state: ScenarioState, allowedKeys: readonly string[], mutation?: ScenarioMutation): ScenarioState {
  if (!mutation) {
    return { ...state };
  }

  for (const key of Object.keys(mutation)) {
    if (!(key in state) || !allowedKeys.includes(key)) {
      throw new Error(`Scenario mutation is not allowed for state key: ${key}.`);
    }
  }

  return { ...state, ...mutation };
}
