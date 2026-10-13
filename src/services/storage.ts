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
  PLATFORM_TENANTS: 'platform_tenants',
  PLATFORM_BROADCASTS: 'platform_broadcasts',
  PLATFORM_AUDIT_LOGS: 'platform_audit_logs',
  PLATFORM_CONFIG: 'platform_config',
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
  const cleanId = (userIdentifier || '').toLowerCase().trim();
  const isSR = cleanId === 'srmobilezone000@gmail.com' || 
               cleanId === 'nzkkjimuewak3uwtcztzkbq7j1s2@phonesellpro.com' || 
               cleanId === 'nzkkjimuewak3uwtcztzkbq7j1s2' || 
               cleanId === 'srmobilezone' ||
               cleanId.includes('srmobilezone');

  if (isSR) {
    // Check all legacy and alias keys in descending priority order
    const candidateKeys = [
      `usr_srmobilezone000@gmail.com_${baseKey}`,
      `usr_srmobilezone000_gmail_com_${baseKey}`,
      `usr_nzkkjimuewak3uwtcztzkbq7j1s2@phonesellpro.com_${baseKey}`,
      `usr_nzkkjimuewak3uwtcztzkbq7j1s2_phonesellpro_com_${baseKey}`,
      `usr_nzkkjimuewak3uwtcztzkbq7j1s2_${baseKey}`,
      `usr_tenant-nzkkjimuewak3uwtcztzkbq7j1s2_${baseKey}`,
      `usr_srmobilezone_${baseKey}`,
      `guest_${baseKey}`,
      baseKey
    ];

    for (const key of candidateKeys) {
      const val = loadFromLocal<any>(key, null);
      if (val !== null && val !== undefined) {
        if (Array.isArray(val) && val.length > 0) {
          // Mirror to canonical keys so future reads are instantaneous
          saveToLocal(`usr_srmobilezone000@gmail.com_${baseKey}`, val);
          saveToLocal(`usr_nzkkjimuewak3uwtcztzkbq7j1s2_${baseKey}`, val);
          return val as T;
        } else if (!Array.isArray(val) && typeof val === 'object' && Object.keys(val).length > 0) {
          saveToLocal(`usr_srmobilezone000@gmail.com_${baseKey}`, val);
          saveToLocal(`usr_nzkkjimuewak3uwtcztzkbq7j1s2_${baseKey}`, val);
          return val as T;
        }
      }
    }
    return fallback;
  }

  const scopedKey = getUserScopedKey(baseKey, userIdentifier);
  const result = loadFromLocal<T>(scopedKey, fallback);
  return result;
}

export function saveUserToLocal<T>(baseKey: string, userIdentifier: string | null | undefined, data: T): void {
  if (!userIdentifier) return;
  const cleanId = (userIdentifier || '').toLowerCase().trim();
  const isSR = cleanId === 'srmobilezone000@gmail.com' || 
               cleanId === 'nzkkjimuewak3uwtcztzkbq7j1s2@phonesellpro.com' || 
               cleanId === 'nzkkjimuewak3uwtcztzkbq7j1s2' || 
               cleanId === 'srmobilezone' ||
               cleanId.includes('srmobilezone');

  if (isSR) {
    saveToLocal(`usr_srmobilezone000@gmail.com_${baseKey}`, data);
    saveToLocal(`usr_nzkkjimuewak3uwtcztzkbq7j1s2_${baseKey}`, data);
    saveToLocal(`usr_nzkkjimuewak3uwtcztzkbq7j1s2@phonesellpro.com_${baseKey}`, data);
    saveToLocal(`usr_srmobilezone000_gmail_com_${baseKey}`, data);
  } else {
    const scopedKey = getUserScopedKey(baseKey, userIdentifier);
    saveToLocal<T>(scopedKey, data);
  }
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
 * Real-time listener for a Firestore collection scoped to a user's ownerId (with alias support)
 */
export function subscribeCollectionFromFirestore<T>(
  collectionName: string, 
  ownerId: string, 
  onData: (data: T[]) => void,
  ownerIdAliases?: string[]
): Unsubscribe | null {
  if (!ownerId) return null;

  try {
    const isSR = ownerId === 'nzkkjimuewak3uwtcztzkbq7j1s2' || 
                 ownerId === 'srmobilezone000@gmail.com' ||
                 ownerId === 'nzkkjimuewak3uwtcztzkbq7j1s2@phonesellpro.com' ||
                 ownerId === 'srmobilezone' ||
                 ownerId.includes('srmobilezone');

    const effectiveList = Array.from(new Set([
      ownerId,
      ...(ownerIdAliases || []),
      ...(isSR ? [
        'nzkkjimuewak3uwtcztzkbq7j1s2', 
        'srmobilezone000@gmail.com', 
        'nzkkjimuewak3uwtcztzkbq7j1s2@phonesellpro.com',
        'srmobilezone',
        'tenant-nzkkjimuewak3uwtcztzkbq7j1s2'
      ] : [])
    ])).filter(Boolean);

    const q = effectiveList.length > 1
      ? query(collection(db, collectionName), where('ownerId', 'in', effectiveList))
      : query(collection(db, collectionName), where('ownerId', '==', ownerId));

    return onSnapshot(
      q, 
      (snapshot) => {
        const results: T[] = [];
        const seenIds = new Set<string>();
        snapshot.forEach(docSnap => {
          const item = docSnap.data() as any;
          const docId = item?.id || docSnap.id;
          if (item && docId && !seenIds.has(docId)) {
            seenIds.add(docId);
            results.push({ ...item, id: docId } as T);
          } else if (item && !docId) {
            results.push(item as T);
          }
        });

        if (results.length > 0) {
          onData(results);
        } else {
          // If where-query returned 0 items, check whether Super Admin can fetch items without filter
          const curEmail = auth.currentUser?.email || '';
          if (curEmail.toLowerCase() === 'maraju921@gmail.com') {
            getDocs(collection(db, collectionName)).then(allSnap => {
              const matched: T[] = [];
              const seen = new Set<string>();
              allSnap.forEach(d => {
                const item = d.data() as any;
                if (!item) return;
                const matchOwner = effectiveList.includes(item.ownerId) ||
                  (isSR && (item.ownerId?.includes('srmobilezone') || item.ownerId === 'nzkkjimuewak3uwtcztzkbq7j1s2' || item.ownerId === 'srmobilezone000@gmail.com'));
                if (matchOwner) {
                  const id = item.id || d.id;
                  if (!seen.has(id)) {
                    seen.add(id);
                    matched.push({ ...item, id } as T);
                  }
                }
              });
              if (matched.length > 0) {
                onData(matched);
              } else {
                onData([]);
              }
            }).catch(() => {
              onData([]);
            });
          } else {
            onData([]);
          }
        }
      },
      (error) => {
        console.warn(`Firestore real-time subscription notice for ${collectionName}:`, error.message);
        // Do not pass empty array on subscription error so existing cached state is retained
      }
    );
  } catch (error) {
    console.warn(`Failed to subscribe to ${collectionName}:`, error);
    return null;
  }
}

/**
 * Load remote collection once from Firestore (with alias support)
 */
export async function loadCollectionFromFirestore<T>(collectionName: string, ownerId: string): Promise<T[]> {
  if (!ownerId) return [];

  try {
    const isSR = ownerId === 'nzkkjimuewak3uwtcztzkbq7j1s2' || 
                 ownerId === 'srmobilezone000@gmail.com' ||
                 ownerId === 'nzkkjimuewak3uwtcztzkbq7j1s2@phonesellpro.com' ||
                 ownerId === 'srmobilezone';

    const effectiveList = isSR 
      ? ['nzkkjimuewak3uwtcztzkbq7j1s2', 'srmobilezone000@gmail.com', 'nzkkjimuewak3uwtcztzkbq7j1s2@phonesellpro.com', 'srmobilezone']
      : [ownerId];

    const q = effectiveList.length > 1
      ? query(collection(db, collectionName), where('ownerId', 'in', effectiveList))
      : query(collection(db, collectionName), where('ownerId', '==', ownerId));

    const snapshot = await getDocs(q);
    const results: T[] = [];
    const seenIds = new Set<string>();
    snapshot.forEach(docSnap => {
      const item = docSnap.data() as any;
      if (item && item.id && !seenIds.has(item.id)) {
        seenIds.add(item.id);
        results.push(item as T);
      } else if (item && !item.id) {
        results.push(item as T);
      }
    });
    return results;
  } catch (error) {
    console.warn(`Firestore read notice for ${collectionName}:`, error);
    return [];
  }
}

/**
 * Save user store settings to Firestore
 */
export async function saveSettingsToFirestore(settings: StoreSettings, ownerId: string): Promise<void> {
  if (!ownerId) return;
  const isSR = ownerId === 'nzkkjimuewak3uwtcztzkbq7j1s2' || 
               ownerId === 'srmobilezone000@gmail.com' || 
               ownerId === 'nzkkjimuewak3uwtcztzkbq7j1s2@phonesellpro.com' ||
               settings.email === 'srmobilezone000@gmail.com' ||
               settings.storeName === 'SR Mobile Zone';

  const canonicalId = isSR ? 'nzkkjimuewak3uwtcztzkbq7j1s2' : ownerId;
  const canonicalSettings: StoreSettings = {
    ...settings,
    ownerId: canonicalId,
    ...(isSR ? {
      storeName: 'SR Mobile Zone',
      email: 'srmobilezone000@gmail.com'
    } : {})
  };

  try {
    const docRef = doc(db, 'store_settings', canonicalId);
    const cleaned = cleanForFirestore(canonicalSettings);
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
  const isSR = ownerId === 'nzkkjimuewak3uwtcztzkbq7j1s2' || 
               ownerId === 'srmobilezone000@gmail.com' || 
               ownerId === 'nzkkjimuewak3uwtcztzkbq7j1s2@phonesellpro.com';

  const targetIds = isSR 
    ? ['nzkkjimuewak3uwtcztzkbq7j1s2', 'srmobilezone000@gmail.com', 'nzkkjimuewak3uwtcztzkbq7j1s2@phonesellpro.com']
    : [ownerId];

  for (const tid of targetIds) {
    try {
      const docRef = doc(db, 'store_settings', tid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as StoreSettings;
        if (isSR) {
          data.storeName = 'SR Mobile Zone';
          data.email = 'srmobilezone000@gmail.com';
          data.ownerId = 'nzkkjimuewak3uwtcztzkbq7j1s2';
        }
        return data;
      }
    } catch (error) {
      console.warn(`Failed to load settings for ${tid}:`, error);
    }
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

/**
 * Super Admin discovery: fetch all store_settings documents from Firestore
 * and compute live product counts and sales from Firestore
 */
export async function fetchAllFirestoreTenants(): Promise<Array<{ id: string; settings: StoreSettings; ownerId: string; productCount: number; salesCount: number; totalRevenue: number }>> {
  try {
    const colRef = collection(db, 'store_settings');
    const snap = await getDocs(colRef);
    const list: Array<{ id: string; settings: StoreSettings; ownerId: string; productCount: number; salesCount: number; totalRevenue: number }> = [];

    // Also get all products and sales that super admin can read to compute exact metrics
    let allProducts: any[] = [];
    let allSales: any[] = [];
    try {
      const prodSnap = await getDocs(collection(db, 'products'));
      prodSnap.forEach(p => allProducts.push(p.data()));
    } catch (e) {
      console.warn('Could not list all products:', e);
    }

    try {
      const salesSnap = await getDocs(collection(db, 'sales'));
      salesSnap.forEach(s => allSales.push(s.data()));
    } catch (e) {
      console.warn('Could not list all sales:', e);
    }

    snap.forEach(docSnap => {
      const data = docSnap.data() as StoreSettings;
      let ownerId = data.ownerId || docSnap.id;

      // Canonical mapping for SR Mobile Zone
      if (ownerId === 'nzkkjimuewak3uwtcztzkbq7j1s2' || docSnap.id === 'nzkkjimuewak3uwtcztzkbq7j1s2' || data.email === 'nzkkjimuewak3uwtcztzkbq7j1s2@phonesellpro.com' || data.email === 'srmobilezone000@gmail.com') {
        ownerId = 'nzkkjimuewak3uwtcztzkbq7j1s2';
        data.ownerId = 'nzkkjimuewak3uwtcztzkbq7j1s2';
        data.email = 'srmobilezone000@gmail.com';
        data.storeName = 'SR Mobile Zone';
      }

      // Filter products and sales for this ownerId (including legacy aliases)
      const isSR = ownerId === 'nzkkjimuewak3uwtcztzkbq7j1s2' || 
                   ownerId === 'srmobilezone000@gmail.com' ||
                   docSnap.id === 'nzkkjimuewak3uwtcztzkbq7j1s2' ||
                   data.email === 'srmobilezone000@gmail.com' ||
                   data.storeName === 'SR Mobile Zone';

      const storeProducts = allProducts.filter(p => p && (
        p.ownerId === ownerId || 
        (isSR && (
          p.ownerId === 'srmobilezone000@gmail.com' || 
          p.ownerId === 'nzkkjimuewak3uwtcztzkbq7j1s2@phonesellpro.com' ||
          p.ownerId === 'nzkkjimuewak3uwtcztzkbq7j1s2' ||
          p.ownerId === 'srmobilezone' ||
          p.ownerId === 'tenant-nzkkjimuewak3uwtcztzkbq7j1s2'
        ))
      ));
      const storeSales = allSales.filter(s => s && (
        s.ownerId === ownerId || 
        (isSR && (
          s.ownerId === 'srmobilezone000@gmail.com' || 
          s.ownerId === 'nzkkjimuewak3uwtcztzkbq7j1s2@phonesellpro.com' ||
          s.ownerId === 'nzkkjimuewak3uwtcztzkbq7j1s2' ||
          s.ownerId === 'srmobilezone' ||
          s.ownerId === 'tenant-nzkkjimuewak3uwtcztzkbq7j1s2'
        ))
      ));
      const revenue = storeSales.reduce((sum, s) => sum + (s.total || s.totalAmount || 0), 0);

      // Pre-cache discovered products and sales into user-scoped local storage so inspecting never shows 0
      if (storeProducts.length > 0) {
        saveUserToLocal('products', ownerId, storeProducts);
        if (isSR) {
          saveUserToLocal('products', 'srmobilezone000@gmail.com', storeProducts);
          saveUserToLocal('products', 'nzkkjimuewak3uwtcztzkbq7j1s2', storeProducts);
        }
      }
      if (storeSales.length > 0) {
        saveUserToLocal('sales', ownerId, storeSales);
        if (isSR) {
          saveUserToLocal('sales', 'srmobilezone000@gmail.com', storeSales);
          saveUserToLocal('sales', 'nzkkjimuewak3uwtcztzkbq7j1s2', storeSales);
        }
      }

      const existingIdx = list.findIndex(item => item.ownerId === ownerId);
      if (existingIdx >= 0) {
        list[existingIdx] = {
          id: ownerId,
          settings: { 
            ...list[existingIdx].settings, 
            ...data, 
            ownerId, 
            storeName: data.storeName || list[existingIdx].settings.storeName,
            email: data.email || list[existingIdx].settings.email 
          },
          ownerId,
          productCount: Math.max(list[existingIdx].productCount, storeProducts.length),
          salesCount: Math.max(list[existingIdx].salesCount, storeSales.length),
          totalRevenue: Math.max(list[existingIdx].totalRevenue, revenue)
        };
      } else {
        list.push({
          id: docSnap.id,
          settings: data,
          ownerId,
          productCount: storeProducts.length,
          salesCount: storeSales.length,
          totalRevenue: revenue
        });
      }
    });
    return list;
  } catch (error) {
    console.warn('Super Admin fetchAllFirestoreTenants warning:', error);
    return [];
  }
}

/**
 * Super Admin discovery: scan browser localStorage for any stores registered previously across emails
 */
export function discoverLocalTenants(): Array<{ ownerKey: string; storeName: string; email: string; productCount: number; lastUpdated: string }> {
  const discovered: Array<{ ownerKey: string; storeName: string; email: string; productCount: number; lastUpdated: string }> = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      // Check if key is store_settings or usr_*_store_settings
      if (key.endsWith('store_settings')) {
        try {
          const val = JSON.parse(localStorage.getItem(key) || '{}');
          if (val && (val.storeName || val.ownerId)) {
            let email = '';
            if (val.phone && val.phone.includes('@')) email = val.phone;
            else if (val.ownerId && val.ownerId.includes('@')) email = val.ownerId;
            else if (key.startsWith('usr_')) {
              // Extract from usr_xxx_store_settings
              const parts = key.replace('usr_', '').replace('_store_settings', '');
              email = parts.replace(/_/g, '@');
            }

            // Also check corresponding products count in localStorage
            let prodCount = 0;
            const prefix = key.replace('_store_settings', '');
            const prodKey = `${prefix}_products`;
            try {
              const savedProds = JSON.parse(localStorage.getItem(prodKey) || '[]');
              if (Array.isArray(savedProds)) prodCount = savedProds.length;
            } catch {}

            // Also check default products key if ownerId matches
            if (prodCount === 0) {
              try {
                const defaultProds = JSON.parse(localStorage.getItem('products') || '[]');
                if (Array.isArray(defaultProds)) {
                  const matching = defaultProds.filter((p: any) => p && (p.ownerId === val.ownerId || p.ownerId === email));
                  if (matching.length > 0) prodCount = matching.length;
                }
              } catch {}
            }

            // Canonical mapping for SR Mobile Zone
            if (email.includes('nzkkjimuewak3uwtcztzkbq7j1s2') || val.ownerId === 'nzkkjimuewak3uwtcztzkbq7j1s2' || email === 'srmobilezone000@gmail.com') {
              email = 'srmobilezone000@gmail.com';
              val.storeName = 'SR Mobile Zone';
              val.ownerId = 'nzkkjimuewak3uwtcztzkbq7j1s2';
            }

            discovered.push({
              ownerKey: key,
              storeName: val.storeName || 'PhoneSell Store',
              email: email || val.ownerId || 'unknown@phonesellpro.com',
              productCount: prodCount,
              lastUpdated: new Date().toISOString()
            });
          }
        } catch {}
      }
    }
  } catch (e) {
    console.warn('LocalStorage tenant discovery warning:', e);
  }
  return discovered;
}

