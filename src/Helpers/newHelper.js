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
import { db } from '../config-firebase/firebase.js';
import * as XLSX from 'xlsx';
