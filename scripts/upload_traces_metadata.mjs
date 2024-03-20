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

const listData = async (tracedir) => {
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
  const listRef = storageRef(
    storage,
    'traces/aligned_first_static_won_insight/level10'
  );
  const list = await listAll(listRef);
  const paths = list.items;
  //   list.items.forEach((itemRef) => {
  //     paths.push(itemRef);
  //   });
  paths.sort(
    (a, b) =>
      parseInt(a.name.split('_')[1]) - parseInt(b.name.split('_')[1])
  );
  paths.forEach((path) => {
    console.log(path.fullPath);
  });
};

const success = (count) => {
  console.log(
    chalk.green(`${count} new files have been added to storage.`)
  );
};

const run = async () => {
  init();

  await listData();

  // show success message
  success(count);
};

run();
