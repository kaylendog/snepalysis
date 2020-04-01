import parse from 'csv-parse';
import {
  createReadStream,
  existsSync,
  readdirSync,
  rmdirSync,
  mkdirSync,
} from 'fs';
import * as path from 'path';
import gitP, { SimpleGit } from 'simple-git/promise';

import { RecordType } from '../utils/csv';
import { Entry, EntryModel } from '../models/Entry';
import mongoose from 'mongoose';

/**
 * The directory in which data will be stored and downloaded to.
 */
const DIRECTORY = path.resolve(process.cwd(), './.cache');

/**
 * The path to the data directory of the repository.
 */
const DATA_PATH = path.resolve(
  DIRECTORY,
  'csse_covid_19_data/csse_covid_19_daily_reports'
);

if (process.argv.includes('-f')) {
  console.log('warn: -f argument specified - will update database');
}

if (process.argv.includes('-o')) {
  console.log('warn: -o argument specified - will not attempt to pull updates');
}

if (existsSync(DIRECTORY) && !existsSync(path.resolve(DIRECTORY, '.git'))) {
  /**
   * Git doesn't allow cloning if the path you're trying to clone to already exists. This check below,
   * and the next one, determine whether:
   *  a) The repository is alreay cloned locally
   *  b) The directory exists, but is empty.
   */

  rmdirSync(DIRECTORY);
} else if (!existsSync(DIRECTORY)) {
  mkdirSync(DIRECTORY);
}

/**
 * THe URL of the data repository.
 */
const REPOSITORY_URL = 'https://github.com/CSSEGISandData/COVID-19.git';

/**
 * git wrapper
 */
const git: SimpleGit = gitP(DIRECTORY).outputHandler(
  (command, stdout, stderr) => {
    stdout.pipe(process.stdout);
    stderr.pipe(process.stderr);
  }
);

/**
 * Command-line argument parsing
 */

const DEFAULT_COUNTRY = 'any';
const DEFAULT_STATE = 'any';

let country = DEFAULT_COUNTRY;
let state = DEFAULT_STATE;

const countryIndex = process.argv.indexOf('-c');
const stateIndex = process.argv.indexOf('-s');

if (countryIndex != -1) {
  country = process.argv[countryIndex + 1];
}

if (stateIndex != -1) {
  state = process.argv[stateIndex + 1];
}

/**
 * Valid record types currently used.
 */
const RECORD_TYPES = [
  // Old header types
  RecordType.from(
    'Province/State, Country/Region, Last Update, Confirmed, Deaths, Recovered, Latitude, Longitude'
  )
    .columns({
      country: 'Country/Region',
      lat: 'Latitude',
      long: 'Longitude',
      state: 'Province/State',
    })
    .filter('country', (v) => (country === 'any' ? true : v === country))
    .filter('state', (v) => (state === 'any' ? true : v === state)),
  // New header types
  RecordType.from(
    'FIPS, Admin2, Province_State, Country_Region, Last_Update, Lat, Long_, Confirmed, Deaths, Recovered, Active, Combined_Key'
  )
    .columns({
      country: 'Country_Region',
      lat: 'Lat',
      long: 'Long_',
      state: 'Province_State',
    })
    .filter('country', (v) => (country === 'any' ? true : v === country))
    .filter('state', (v) => (state === 'any' ? true : v === state)),
];

/**
 * Clone the remote repository.
 */
const cloneRepository = async (): Promise<void> => {
  if (existsSync(path.resolve(DIRECTORY, './.git'))) {
    // Don't try and reclone the repo if it already exists locally.
    return;
  }

  console.log('info: Cloning repository...');

  await git.clone(REPOSITORY_URL, DIRECTORY);
  await git.status();
};

/**
 * Pulls any updates made to the repository on the remote to the local.
 */
const updateRepository = async (): Promise<boolean> => {
  console.log('info: Checking for updates...');
  const stats = await git.pull('origin', 'master', ['-f']);
  if (stats.summary.changes == 0) {
    return false;
  }
  return true;
};

/**
 * Read the .csv files in the repository.
 */
const readRepository = async (): Promise<Entry[]> => {
  const files = readdirSync(DATA_PATH);
  const entries: Entry[] = [];

  let skippedFiles = 0;

  // Iterate over each file, reading it and converting it to something JS can work with
  const workers = files.map(async (file, i) => {
    // Skip non-csv files
    if (!file.endsWith('.csv')) {
      console.log(`info: Skipping file '${file}' (${i + 1}/${files.length})`);
      return;
    }

    // The CSV parsers
    const parser = createReadStream(path.resolve(DATA_PATH, file)).pipe(
      parse()
    );

    /**
     * Current row number.
     */
    let row = 0;

    /**
     * The column information for the current file.
     */
    let type: RecordType;

    for await (const record of parser) {
      if (row === 0) {
        // Find the column names of this file, and thus the record type
        const header = record.join(', ').replace(/[^\x00-\x7F]/g, '');
        type = RECORD_TYPES.find((v) => v.header == header);

        if (!type) {
          return skippedFiles++;
        }
      }

      const entry = type.parse(record);

      if (entry) {
        entries.push(entry);
      }
      row++;
    }
  });

  await Promise.all(workers);

  console.log(`warn: Skipped ${skippedFiles} files with invalid column names.`);
  console.log(`info: Done - repository has ${entries.length} records.`);

  return entries;
};

/**
 * Read entries from the database, find the difference between entries.
 * @param entries
 */
const updateDatabase = async (entries: Entry[]): Promise<void> => {
  try {
    await mongoose.connect('mongodb://localhost:27017/snepalysis', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (err) {
    console.error('error: Failed to connect to MongoDB -', err.message);
    return;
  }

  console.log('info: Fetching existing records...');

  const oldEntryMap = new Map<string, Entry>();
  const oldEntries = await EntryModel.find({ country, state });

  oldEntries.forEach((v) =>
    oldEntryMap.set(`${v.country}:${v.lat}:${v.long}:${v.state}`, v)
  );

  const newEntries = [];

  for (const v of entries) {
    if (!oldEntryMap.has(`${v.country}:${v.lat}:${v.long}:${v.state}`)) {
      newEntries.push(v);
    }
  }

  console.log(`info: Found ${newEntries.length} new entries.`);
};

(async (): Promise<void> => {
  await cloneRepository();

  let shouldUpdate = false;

  if (!process.argv.includes('-f')) {
    shouldUpdate = await updateRepository();
  }

  if (!shouldUpdate && !process.argv.includes('-f')) {
    return console.log('info: Not updating database - repo is fine.');
  }

  const entries = await readRepository();
  await updateDatabase(entries);
})();
