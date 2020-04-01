import {
  cloneRepository,
  updateRepository,
  readRepository,
  updateDatabase,
} from './tasks';

const START = Date.now();

(async (): Promise<void> => {
  await cloneRepository();

  let shouldUpdate = false;

  if (!process.argv.includes('-o')) {
    shouldUpdate = await updateRepository();
  }

  if (!shouldUpdate && !process.argv.includes('-f')) {
    return console.log('info: Not updating database - repo is fine.');
  }

  const entries = await readRepository();
  await updateDatabase(entries);

  console.log(`✨ Done in ${Math.floor((Date.now() - START) / 10) / 100}s.`);
})();
