#!/usr/bin/env node
/* eslint-disable import/no-extraneous-dependencies */

import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';
// import shell from 'shelljs'
import { initializeApp } from 'firebase/app';
import { useFirebaseStorage, useStorageFile } from 'vuefire';
import { ref as storageRef } from 'firebase/storage';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { SingleBar, Presets } from 'cli-progress';
// import appconfig from '../src/config'

let count = 0;

const init = () => {
  console.log(
    chalk.green(
      figlet.textSync('GET META-INSIGHTS.', {
        font: 'big',
        horizontalLayout: 'default',
        verticalLayout: 'default',
      })
    )
  );
  console.log(chalk.green('your data is almost here.'));
};

const askQuestions = () => {
  const questions = [
    {
      type: 'input',
      name: 'REPLAYDIR',
      message: 'What is the path to replay videos?',
      default:
        '/Users/solimlegris/Projects/creative-physical-reasoning-analyses-exp2/data/replayData/real2',
    },
    {
      type: 'input',
      name: 'SETNAME',
      message: 'What is name of the set?',
      default: 'train',
    },
    {
      type: 'input',
      name: 'METADATA',
      message:
        'What is the name of the metadata file without extension?',
      default: 'train_set_metadata',
    },
  ];
  return inquirer.prompt(questions);
};

const addData = async (metadata, replaydir, setname) => {
  const localenv = dotenv.config({ path: 'env/.env.local' });
  const firebaseConfig = {
    apiKey: localenv.parsed.VITE_FIREBASE_APIKEY,
    authDomain: localenv.parsed.VITE_FIREBASE_AUTHDOMAIN,
    projectId: localenv.parsed.VITE_FIREBASE_PROJECTID,
    storageBucket: localenv.parsed.VITE_FIREBASE_STORAGEBUCKET,
    messagingSenderId:
      localenv.parsed.VITE_FIREBASE_MESSAGINGSENDERID,
    appId: localenv.parsed.VITE_FIREBASE_APPID,
  };
  initializeApp(firebaseConfig);
  const storage = useFirebaseStorage();

  for (const m of metadata) {
    try {
      const {
        url,
        // gives you a percentage between 0 and 1 of the upload progress
        uploadProgress,
        uploadError,
        // firebase upload task
        uploadTask,
        upload,
      } = useStorageFile(storageRef(storage, `${m.filename}`));

      // first try in replaydir/complete/setname/doc_id/level/replay.mp4
      let file;
      try {
        file = fs.readFileSync(
          `${replaydir}/complete/${setname}/${m.doc_id}/${m.level}/replay.mp4`
        );
        // add if statement here when running to add incomplete only such that if file exists, skip
        if (file) {
          console.log('File already exists: ', m.filename);
          continue;
        }
      } catch (e1) {
        try {
          file = fs.readFileSync(
            `${replaydir}/incomplete/${setname}/${m.doc_id}/${m.level}/replay.mp4`
          );
        } catch (e2) {
          console.error('Error adding file: ', m.filename, e1, e2);
        }
      }

      // check if file exists
      if (file) {
        // upload file to storage
        await upload(file, { contentType: 'video/mp4' });
        console.log('File written with name: ', m.filename);
        count += 1;
      }
    } catch (e) {
      console.error('Error adding file: ', m.filename, e);
    }
  }

  //   metadata.forEach(async (m) => {});
};

const success = (count) => {
  console.log(
    chalk.green(`${count} new files have been added to storage.`)
  );
};

const run = async () => {
  init();
  const env = dotenv.config({ path: 'env/.env.git.local' });

  // ask questions
  const { REPLAYDIR, SETNAME, METADATA } = await askQuestions();

  // read json file
  const path = `data/${METADATA}.json`;
  const metadata = JSON.parse(fs.readFileSync(path, 'utf8'));

  // for each data, create document in collection and add data
  await addData(metadata, REPLAYDIR, SETNAME);

  // show success message
  success(count);
};

run();
