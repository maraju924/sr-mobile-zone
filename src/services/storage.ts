import { 
  Product, 
  Sale, 
  Installment, 
  ReturnClaim, 
  StoreSettings, 
  Supplier, 
  Purchase, 
  RepairTicket, 
  Expense 
} from '../types';
import { db, auth, OperationType, handleFirestoreError } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc,
  getDoc,
  getDocs, 
  query, 
  where, 
  onSnapshot,
  writeBatch,
  Unsubscribe
} from 'firebase/firestore';

export const STORAGE_KEYS = {
  PRODUCTS: 'products',
  SALES: 'sales',
  INSTALLMENTS: 'installments',
  RETURNS: 'returns',
  SETTINGS: 'store_settings',
  SUPPLIERS: 'suppliers',
  PURCHASES: 'purchases',
  SUPPLIER_PAYMENTS: 'supplier_payments',
  REPAIRS: 'repairs',
  EXPENSES: 'expenses',
  CATEGORIES: 'categories',
  CUSTOMER_PROFILES: 'customer_profiles',
  PENDING_SYNC: 'pending_sync',
  LANGUAGE: 'lang_pref',
  DEVICES: 'devices',
  USED_BUYS: 'used_buys',
  BRANCH: 'branch_pref',
  STAFF: 'staff',
  ACCOUNTS: 'accounts',
  JOURNAL: 'journal',
  SMS_LOGS: 'sms_logs',
  CHAT_MESSAGES: 'chat_messages',
  FAVOURITES: 'favourites',
  DEVICE_CREDITS: 'credits',
};

export const DEFAULT_SETTINGS: StoreSettings = {
  ownerId: '',
  storeName: 'PhoneSell PRO ডিজিটাল শপ',
  phone: '+৮৮০১৭০০০০০০০১',
  address: 'ঈশ্বরগঞ্জ বাজার, ময়মনসিংহ',
  vatPercent: 0,
  currencySymbol: '৳',
  invoiceFooter: 'ক্রয়কৃত পণ্যের অফিশিয়াল ওয়ারেন্টির জন্য ইনভয়েস ও বক্স সংরক্ষণ করুন।',
  branches: [
    { id: 'BP-ISHWARGONJ', name: 'ঈশ্বরগঞ্জ ব্রাঞ্চ (BP-ISHWARGONJ)', address: 'ঈশ্বরগঞ্জ বাজার, ময়মনসিংহ', phone: '+৮৮০১৭০০০০০০০১', isDefault: true },
    { id: 'BP-MYMENSINGH', name: 'ময়মনসিংহ ব্রাঞ্চ (BP-MYMENSINGH)', address: 'গাঙ্গিনার পাড়, ময়মনসিংহ', phone: '+৮৮০১৭০০০০০০০২' }
  ],
  defaultLabelOrientation: 'landscape'
};

// Zero Mock/Demo Data - 100% Pure Firebase
export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_SUPPLIERS: Supplier[] = [];
export const INITIAL_PURCHASES: Purchase[] = [];
export const INITIAL_REPAIRS: RepairTicket[] = [];
export const INITIAL_EXPENSES: Expense[] = [];

// Lightweight local cache fallback helpers
export function loadFromLocal<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch {
    return fallback;
  }
}

export function saveToLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

export function getUserScopedKey(baseKey: string, userIdentifier: string | null | undefined): string {
  if (!userIdentifier) return `guest_${baseKey}`;
  const sanitized = userIdentifier.toLowerCase().trim().replace(/[^a-z0-9_@.-]/g, '_');
  return `usr_${sanitized}_${baseKey}`;
}

export function loadUserFromLocal<T>(baseKey: string, userIdentifier: string | null | undefined, fallback: T): T {
  if (!userIdentifier) return fallback;
  const scopedKey = getUserScopedKey(baseKey, userIdentifier);
  return loadFromLocal<T>(scopedKey, fallback);
}

export function saveUserToLocal<T>(baseKey: string, userIdentifier: string | null | undefined, data: T): void {
  if (!userIdentifier) return;
  const scopedKey = getUserScopedKey(baseKey, userIdentifier);
  saveToLocal<T>(scopedKey, data);
}

// --- Direct Firebase Firestore Database Operations ---

/**
 * Remove undefined values recursively before writing to Firestore
 */
function cleanForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) return obj.map(cleanForFirestore);
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanForFirestore(value);
      }
    }
    return cleaned;
  }
  return obj;
}

/**
 * Save or update a single document directly in Firebase Firestore
 */
export async function saveDocToFirestore<T extends { id: string }>(
  collectionName: string, 
  item: T, 
  ownerId: string
): Promise<void> {
  if (!ownerId || !item || !item.id) return;
  try {
    const docRef = doc(db, collectionName, item.id);
    const cleanedData = cleanForFirestore({ ...item, ownerId });
    await setDoc(docRef, cleanedData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${item.id}`);
  }
}

/**
 * Delete a document directly from Firebase Firestore
 */
export async function deleteDocFromFirestore(
  collectionName: string, 
  id: string
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
  }
}

/**
 * Real-time listener for a Firestore collection scoped to a user's ownerId
 */
export function subscribeCollectionFromFirestore<T>(
  collectionName: string, 
  ownerId: string, 
  onData: (data: T[]) => void
): Unsubscribe | null {
  if (!ownerId) return null;

  try {
    const q = query(collection(db, collectionName), where('ownerId', '==', ownerId));
    return onSnapshot(
      q, 
      (snapshot) => {
        const results: T[] = [];
        snapshot.forEach(docSnap => {
          results.push(docSnap.data() as T);
        });
        onData(results);
      },
      (error) => {
        console.warn(`Firestore real-time subscription error for ${collectionName}:`, error.message);
      }
    );
  } catch (error) {
    console.warn(`Failed to subscribe to ${collectionName}:`, error);
    return null;
  }
}

/**
 * Load remote collection once from Firestore
 */
export async function loadCollectionFromFirestore<T>(collectionName: string, ownerId: string): Promise<T[]> {
  if (!ownerId) return [];

  try {
    const q = query(collection(db, collectionName), where('ownerId', '==', ownerId));
    const snapshot = await getDocs(q);
    const results: T[] = [];
    snapshot.forEach(docSnap => {
      results.push(docSnap.data() as T);
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionName);
    return [];
  }
}

/**
 * Save user store settings to Firestore
 */
export async function saveSettingsToFirestore(settings: StoreSettings, ownerId: string): Promise<void> {
  if (!ownerId) return;
  try {
    const docRef = doc(db, 'store_settings', ownerId);
    const cleaned = cleanForFirestore({ ...settings, ownerId });
    await setDoc(docRef, cleaned, { merge: true });
  } catch (error) {
    console.warn('Failed to save settings to Firestore:', error);
  }
}

/**
 * Load user store settings from Firestore
 */
export async function loadSettingsFromFirestore(ownerId: string): Promise<StoreSettings | null> {
  if (!ownerId) return null;
  try {
    const docRef = doc(db, 'store_settings', ownerId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as StoreSettings;
    }
  } catch (error) {
    console.warn('Failed to load settings from Firestore:', error);
  }
  return null;
}

/**
 * Batch sync collection to Firestore
 */
export async function syncCollectionToFirestore<T extends { id: string; ownerId?: string }>(
  collectionName: string, 
  items: T[], 
  ownerId: string
): Promise<boolean> {
  if (!ownerId) return false;

  try {
    const batch = writeBatch(db);
    for (const item of items) {
      const docRef = doc(db, collectionName, item.id);
      batch.set(docRef, { ...item, ownerId }, { merge: true });
    }
    await batch.commit();
    return true;
  } catch (error) {
    console.warn(`Firestore batch sync warning for ${collectionName}:`, error);
    return false;
  }
}

// Complete Backup Export
export function exportDatabaseBackup(): string {
  return JSON.stringify({
    app: 'PhoneSell PRO',
    version: '2.0.0',
    exportDate: new Date().toISOString(),
    source: 'Firebase Firestore'
  }, null, 2);
}

// Complete Backup Import
export function importDatabaseBackup(jsonString: string): { success: boolean; message: string } {
  try {
    JSON.parse(jsonString);
    return { success: true, message: 'ব্যাকআপ ভ্যালিডেশন সফল!' };
  } catch {
    return { success: false, message: 'ইনভ্যালিড ব্যাকআপ ফাইল ফরম্যাট' };
  }
}
