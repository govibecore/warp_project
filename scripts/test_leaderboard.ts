import { connectToDatabase } from '../server/db.js';
import { getGlobalLeaderboard } from '../server/services/analytics.js';

async function run() {
  await connectToDatabase();
  const res = await getGlobalLeaderboard();
  console.log('Leaderboard:', res);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
