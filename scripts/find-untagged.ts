import { getCalibrationItems, getMissionItems, MISSION_IDS } from '../src/data/scenarios/index';

for (const cls of [4, 6, 8, 10, 12]) {
  const items = [...getCalibrationItems(cls), ...MISSION_IDS.flatMap((m) => getMissionItems(m, cls))];
  for (const item of items) {
    for (const opt of item.options) {
      const primary = opt.evidence[0]!;
      if (primary.earnedWeight <= 2 && !opt.misconception) {
        console.log('UNTAGGED class=' + cls + ' ' + item.id + '/' + opt.id + ' earned=' + primary.earnedWeight + ' :: ' + opt.label.slice(0, 70));
      }
    }
  }
}
console.log('scan complete');
