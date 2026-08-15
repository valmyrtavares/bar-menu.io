import React from 'react';

import { getBtnData, getStockByProductName } from '../api/Api';
import { cardClasses } from '@mui/material';
import { getFirestore, collection, getDoc, getDocs, doc } from 'firebase/firestore';
import { addDoc, updateDoc } from '../api/FirestoreInterceptor';
import { db } from '../config-firebase/firebase.js';
import * as XLSX from 'xlsx';
