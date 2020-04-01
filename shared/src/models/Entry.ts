import { Schema, model, Document } from 'mongoose';

/**
 * A data entry.
 */
export interface Entry {
  lat: number;
  long: number;
  country: string;
  state: string;
}

type EntryDocument = Entry & Document;

/**
 * MongoDB object schema.
 */
const EntrySchema = new Schema(
  {
    lat: Number,
    long: Number,
    country: String,
    state: String,
  },
  { versionKey: false }
);

export const EntryModel = model<EntryDocument>('Entry', EntrySchema);
