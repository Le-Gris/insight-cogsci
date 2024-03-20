#!/usr/bin/env node
/* eslint-disable import/no-extraneous-dependencies */

import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';
// import shell from 'shelljs'
import { initializeApp } from 'firebase/app';
import { useFirebaseStorage, useStorageFile } from 'vuefire';
import { ref as storageRef, listAll } from 'firebase/storage';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
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
      name: 'TRACEDIR',
      message: 'What is the path to trace images?',
      default: 'data/aggregate_trace_images_real2',
    },
  ];
  return inquirer.prompt(questions);
};

const addData = async (tracedir) => {
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

  // loop over each folder in tracedir
  const tracetypes = fs.readdirSync(tracedir);

  for (const tracetype of tracetypes) {
    if (tracetype === '.DS_Store') {
      continue;
    }
    const levels = fs.readdirSync(`${tracedir}/${tracetype}`);
    for (const level of levels) {
      if (level === '.DS_Store') {
        continue;
      }
      // read filenames in level directory
      const files = fs.readdirSync(
        `${tracedir}/${tracetype}/${level}`,
        { withFileTypes: true }
      );

      // get existing files in storage
      const existingFiles = await listAll(
        storageRef(storage, `traces/${tracetype}/${level}`)
      );
      for (const f in files) {
        const filename = files[f].name;
        if (filename === '.DS_Store') {
          continue;
        } else if (
          existingFiles.items.filter((item) => item.name === filename)
            .length > 0
        ) {
          console.log(chalk.green(`File exists: ${filename}`));
          continue;
        }
        const fileref = storageRef(
          storage,
          `traces/${tracetype}/${level}/${filename}`
        );
        // upload file to storage
        const {
          url,
          // gives you a percentage between 0 and 1 of the upload progress
          uploadProgress,
          uploadError,
          // firebase upload task
          uploadTask,
          upload,
        } = useStorageFile(fileref);
        let file;
        try {
          file = fs.readFileSync(
            `${tracedir}/${tracetype}/${level}/${filename}`
          );
        } catch (e1) {
          try {
            file = fs.readFileSync(
              `${tracedir}/${tracetype}/${level}/${filename}`
            );
          } catch (e2) {
            console.error('Error adding file: ', filename, e1, e2);
          }
        }

        // check if file exists
        if (file) {
          // upload file to storage
          await upload(file, { contentType: 'image/png' });
          console.log(
            chalk.green(
              `Added file to path: traces/${tracetype}/${level}/${filename}`
            )
          );
          count += 1;
        }
      }
    }
  }
};

const success = (count) => {
  console.log(
    chalk.green(`${count} new files have been added to storage.`)
  );
};

const run = async () => {
  init();

  // ask questions
  const { TRACEDIR } = await askQuestions();

  // for each data, create document in collection and add data
  await addData(TRACEDIR);

  // show success message
  success(count);
};

run();
