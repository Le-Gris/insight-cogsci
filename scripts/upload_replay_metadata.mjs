#!/usr/bin/env node
/* eslint-disable import/no-extraneous-dependencies */

import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';
// import shell from 'shelljs'
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
} from 'firebase/firestore';
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
      name: 'FILENAME',
      message: 'What is the name of the file without extension?',
      default: 'train_set_metadata',
    },
  ];
  return inquirer.prompt(questions);
};

const addData = async (data, c) => {
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
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  data.forEach(async (d) => {
    try {
      const docRef = await addDoc(collection(db, c), d);
      console.log('Document written with ID: ', docRef.id);
      count += 1;
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  });
};

const success = (count, c) => {
  console.log(
    chalk.green(`${count} new documents have been created in ${c}}.`)
  );
};

const run = async () => {
  init();
  const env = dotenv.config({ path: 'env/.env.git.local' });
  const c = 'replayDataInfo';

  // ask questions
  const { FILENAME } = await askQuestions();

  // read json file
  const path = `data/${FILENAME}.json`;
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));

  // for each data, create document in collection and add data
  await addData(data, c);

  // show success message
  success(count, c);
};

run();
