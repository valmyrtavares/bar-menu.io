import React from 'react';

import { getBtnData, getStockByProductName } from '../api/Api';
import { cardClasses } from '@mui/material';
import {
  getFirestore,
  collection,
  getDoc,
  addDoc,
  getDocs,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { app } from '../config-firebase/firebase.js';
import * as XLSX from 'xlsx';
const db = getFirestore(app);
