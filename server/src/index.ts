import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cors from 'cors';

import { log, EntryModel } from '@snepalysis/shared';

(async (): Promise<void> => {
  try {
    await mongoose.connect('mongodb://localhost:27017/snepalysis', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: true,
    });
  } catch (err) {
    log.error(err);
    process.exit(1);
  }

  log.success('Connected to Mongo.');

  // Create express app
  const app = express()
    .use(
      morgan('dev', {
        stream: {
          write: (d): void => log.verbose(d.replace('\n', '')),
        },
      })
    )
    .use(cors());

  // Status endpoint
  app.get('/status', (req, res) => {
    res.json({
      uptime: Math.floor(process.uptime()),
    });
  });

  app.get('/data', async (req, res) => {
    const page = req.query.page;

    if (!page) {
      const count = await EntryModel.find({}).countDocuments();
      return res.json({ pages: Math.ceil(count / 500), count });
    }

    if (page < 1 || Math.floor(page) != page) {
      return res.status(400).json({ code: 1, msg: 'Bad request.' });
    }

    const docs = await EntryModel.find({})
      .skip((page - 1) * 500)
      .limit(500);

    return res.json(
      docs.map((v) => {
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [v.long, v.lat],
          },
        };
      })
    );
  });

  // Send 404 on endpoints that don't exist.
  app.use('*', (req, res) =>
    res.status(404).json({ code: 0, msg: 'Not found.' })
  );

  app.listen(8080);
  log.done('Listening on port 8080.');
})();
