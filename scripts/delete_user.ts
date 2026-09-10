import { connectToDatabase } from '../server/db.js';
import { Student } from '../server/models/Student.js';

async function run() {
  await connectToDatabase();
  const res = await Student.deleteOne({ email: 'littletommy211@gmail.com' });
  console.log('Deleted count:', res.deletedCount);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
