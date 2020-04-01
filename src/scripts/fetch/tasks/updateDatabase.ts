import { EntryModel, Entry } from '../../../models/Entry';
import { COUNTRY, STATE } from '../env';
import mongoose from 'mongoose';

/**
 * Read entries from the database, find the difference between entries.
 * @param entries
 */
export const updateDatabase = async (entries: Entry[]): Promise<void> => {
  try {
    await mongoose.connect('mongodb://localhost:27017/snepalysis', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (err) {
    console.error('error: Failed to connect to MongoDB -', err.message);
    return;
  }

  const oldEntryMap = new Map<string, Entry>();
  const oldEntries = await EntryModel.find({ country: COUNTRY, state: STATE });

  oldEntries.forEach((v) =>
    oldEntryMap.set(`${v.country}:${v.lat}:${v.long}:${v.state}`, v)
  );

  const newEntries = [];

  for (const v of entries) {
    if (!oldEntryMap.has(`${v.country}:${v.lat}:${v.long}:${v.state}`)) {
      newEntries.push(v);
    }
  }
  if (newEntries.length === 0) {
    console.log('info: No database entries to update.');
  } else {
    await EntryModel.insertMany(newEntries);
    console.log(`info: Created ${newEntries.length} new entries.`);
  }

  await mongoose.disconnect();
};
