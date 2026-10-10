import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  Product, 
  ProductCategory,
  Sale, 
  Installment, 
  ReturnClaim, 
  StoreSettings, 
  CartItem, 
  ActiveTab, 
  Language, 
  NotificationItem, 
  ClaimStatus,
  Supplier,
  Purchase,
  SupplierPayment,
  RepairTicket,
  RepairStatus,
  Expense,
  CustomerCreditProfile,
  FollowUpLog,
  Branch,
  BranchInfo,
  Device,
  UsedBuyRecord,
  StaffMember,
  AccountEntry,
  JournalTransaction,
  SMSLog,
  ChatMessage,
  AuthUser,
  UserRole
} from '../types';
import { 
  STORAGE_KEYS, 
  DEFAULT_SETTINGS, 
  loadFromLocal, 
  saveToLocal, 
  saveDocToFirestore,
  deleteDocFromFirestore,
  subscribeCollectionFromFirestore,
  saveSettingsToFirestore,
  loadSettingsFromFirestore,
  syncCollectionToFirestore, 
  loadCollectionFromFirestore,
  exportDatabaseBackup,
  importDatabaseBackup
} from '../services/storage';
import { Unsubscribe } from 'firebase/firestore';
import { 
  auth, 
  onAuthStateChanged, 
  User, 
  loginWithGoogle, 
  loginWithEmail, 
  registerWithEmail, 
  logoutUser, 
  testConnection 
} from '../services/firebase';

export interface ParkedCart {
  id: string;
  cart: CartItem[];
  customerName: string;
  time: string;
  note?: string;
  total: number;
}

interface AppContextType {
  products: Product[];
  categories: ProductCategory[];
  sales: Sale[];
  installments: Installment[];
  returns: ReturnClaim[];
  suppliers: Supplier[];
  purchases: Purchase[];
  repairs: RepairTicket[];
  expenses: Expense[];
  settings: StoreSettings;
  notifications: NotificationItem[];
  cart: CartItem[];
  activeTab: ActiveTab;
  lang: Language;
  isOnline: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  user: User | null;
  authLoading: boolean;
  lastInvoice: Sale | null;
  showInvoiceModal: boolean;
  lastMoneyReceipt: any | null;
  showMoneyReceiptModal: boolean;
  
  // Actions
  setActiveTab: (tab: ActiveTab) => void;
  setLang: (lang: Language) => void;
  t: (bn: string, en: string) => string;
  formatCurrency: (amount: number) => string;
  exportToCsv: (data: any[], filename: string) => void;
  
  // Cart & POS
  addToCart: (product: Product, quantity?: number, serials?: string[]) => boolean;
  updateCartItemQty: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  setCartItemSerials: (productId: string, serials: string[]) => void;
  completeCheckout: (saleData: {
    customerName: string;
    customerPhone: string;
    customerAddress?: string;
    customerNid?: string;
    guarantorName?: string;
    guarantorPhone?: string;
    guarantorNid?: string;
    guarantorRelation?: string;
    guarantorAddress?: string;
    dueDeadline?: string;
    creditTermDays?: number;
    discount: number;
    tax: number;
    paidAmount: number;
    paymentMethod: Sale['paymentMethod'];
    note?: string;
    installmentMonths?: number;
    downPayment?: number;
    enrollDeviceInLocker?: boolean;
    tradeInDiscount?: number;
    receivedAmount?: number;
    changeAmount?: number;
  }) => Sale | null;
  setShowInvoiceModal: (show: boolean) => void;
  setLastInvoice: (sale: Sale | null) => void;
  setShowMoneyReceiptModal: (show: boolean) => void;
  setLastMoneyReceipt: (receipt: any | null) => void;
  voidSale: (saleId: string, reason?: string) => { success: boolean; message: string };

  // Parked Carts (Hold Sales)
  parkedCarts: ParkedCart[];
  parkCurrentCart: (customerName?: string, note?: string) => void;
  restoreParkedCart: (id: string) => void;
  deleteParkedCart: (id: string) => void;

  // Products
  addProduct: (productData: Omit<Product, 'id' | 'ownerId' | 'createdAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Categories
  addCategory: (categoryData: Omit<ProductCategory, 'id' | 'ownerId' | 'createdAt'>) => ProductCategory;
  updateCategory: (id: string, updates: Partial<ProductCategory>, updateProductReferences?: boolean) => void;
  deleteCategory: (id: string, fallbackCategoryName?: string) => { success: boolean; message: string };

  // Suppliers & Purchases
  addSupplier: (supplierData: Omit<Supplier, 'id' | 'ownerId' | 'createdAt' | 'balanceDue' | 'totalPurchased' | 'totalPaid'>) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  recordSupplierPayment: (supplierId: string, amount: number, paymentMethod: string, note?: string) => void;
  addPurchase: (purchaseData: {
    challanNumber: string;
    supplierId: string;
    items: Purchase['items'];
    additionalCost?: number;
    discount?: number;
    paidAmount: number;
    paymentMethod: Purchase['paymentMethod'];
    note?: string;
    purchaseDate: string;
  }) => void;

  // Repairs & Servicing
  addRepairTicket: (ticketData: Omit<RepairTicket, 'id' | 'ownerId' | 'createdAt' | 'ticketNumber' | 'dueAmount'>) => RepairTicket;
  updateRepairStatus: (id: string, status: RepairStatus, notes?: string, finalCost?: number, paidAdditional?: number) => void;
  deleteRepairTicket: (id: string) => void;

  // Expenses
  addExpense: (expenseData: Omit<Expense, 'id' | 'ownerId' | 'createdAt'>) => void;
  deleteExpense: (id: string) => void;

  // Installments & Dues (Advanced)
  customerProfiles: CustomerCreditProfile[];
  updateCustomerCreditProfile: (profile: CustomerCreditProfile) => void;
  recordInstallmentPayment: (installmentId: string, scheduleId: string, amount: number) => void;
  recordInstallmentPartialPayment: (installmentId: string, scheduleId: string, paidAmount: number, penaltyAmount?: number, note?: string) => void;
  recordInstallmentSmartPayment: (
    installmentId: string,
    paidAmount: number,
    options?: {
      targetScheduleId?: string;
      paymentMethod?: 'cash' | 'bkash' | 'nagad' | 'rocket' | 'bank' | 'split';
      trxId?: string;
      bankAccount?: string;
      penaltyAmount?: number;
      waivePenalty?: boolean;
      discountAmount?: number;
      note?: string;
      autoUnlockLinkedDevice?: boolean;
    }
  ) => void;
  reverseInstallmentPayment: (
    installmentId: string,
    scheduleId: string,
    reason?: string
  ) => void;
  collectDuePayment: (saleId: string, amount: number) => void;
  collectDuePaymentAdvanced: (
    saleId: string,
    amount: number,
    options?: {
      paymentMethod?: 'cash' | 'bkash' | 'nagad' | 'rocket' | 'bank';
      trxId?: string;
      note?: string;
      autoUnlockLinkedDevice?: boolean;
    }
  ) => void;
  addInstallmentFollowUp: (installmentId: string, log: Omit<FollowUpLog, 'id' | 'date'>) => void;
  addSaleFollowUp: (saleId: string, log: Omit<FollowUpLog, 'id' | 'date'>) => void;

  // Warranty & Returns
  addReturnClaim: (claim: Omit<ReturnClaim, 'id' | 'ownerId' | 'createdAt'>) => void;
  updateClaimStatus: (id: string, status: ClaimStatus, notes?: string) => void;

  // Settings & Sync
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  syncNow: () => Promise<void>;
  downloadBackup: () => void;
  restoreBackup: (jsonStr: string) => { success: boolean; message: string };
  
  // Notifications
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Auth
  login: () => Promise<void>;
  logout: () => Promise<void>;

  // Branch & Multi-Location
  branch: Branch;
  setBranch: (branch: Branch) => void;
  branches: BranchInfo[];
  addBranch: (newBranch: BranchInfo) => void;
  updateBranch: (branchId: string, updates: Partial<BranchInfo>) => void;
  deleteBranch: (branchId: string) => void;

  // Enterprise Locker & Devices
  devices: Device[];
  addDevice: (device: Omit<Device, 'id' | 'ownerId' | 'enrolledAt' | 'lastSyncAt'>) => Device;
  updateDevice: (id: string, updates: Partial<Device>) => void;
  deleteDevice: (id: string) => void;
  toggleDeviceLock: (deviceId: string, reason?: string) => void;
  issueDeviceCommand: (deviceId: string, command: string, reason?: string) => void;
  generateOfflineCodes: (deviceId: string) => [string, string];
  deviceCredits: number;
  addDeviceCredits: (count: number) => void;

  // Used Buy (পুরনো ফোন কেনা)
  usedBuys: UsedBuyRecord[];
  addUsedBuy: (record: Omit<UsedBuyRecord, 'id' | 'ownerId' | 'createdAt'>) => UsedBuyRecord;
  deleteUsedBuy: (id: string) => void;

  // Staff & HR
  staff: StaffMember[];
  addStaff: (member: Omit<StaffMember, 'id' | 'ownerId'>) => void;
  toggleStaffStatus: (id: string) => void;

  // Accounting & Ledger
  accounts: AccountEntry[];
  journalEntries: JournalTransaction[];
  addJournalEntry: (entry: Omit<JournalTransaction, 'id'>) => void;

  // SMS System
  smsLogs: SMSLog[];
  sendSms: (phone: string, recipientName: string, message: string, type?: SMSLog['type']) => { success: boolean; message: string };

  // Support Chat
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string, sender?: 'shop' | 'customer', customerPhone?: string) => void;

  // Favourites Menu Shortcuts
  favourites: string[];
  toggleFavourite: (tabKey: string) => void;

  // Staff & Admin Authentication
  currentUser: AuthUser | null;
  activeEmail: string | null;
  authLogin: (user: AuthUser) => void;
  authLogout: () => void;
  loginGoogle: () => Promise<void>;
  loginEmail: (email: string, pass: string) => Promise<void>;
  registerEmail: (email: string, pass: string, name?: string) => Promise<void>;
  loginStaff: (phoneOrUsername: string, pin: string) => Promise<{ success: boolean; message: string }>;
}

export const DEFAULT_PRODUCT_CATEGORIES: ProductCategory[] = [
  { id: 'cat_smartphones', name: 'স্মার্টফোন', nameEn: 'Smartphones', description: 'স্মার্টফোন ও ফোল্ডেবল হ্যান্ডসেট', color: 'indigo', icon: 'smartphone', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: 'cat_featurephones', name: 'ফিচার ফোন', nameEn: 'Feature Phones', description: 'বাটন ও সাধারণ ফিচার ফোন', color: 'blue', icon: 'phone', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: 'cat_usedphones', name: 'ব্যবহৃত স্মার্টফোন (Pre-owned)', nameEn: 'Used Smartphones', description: 'সেকেন্ড হ্যান্ড ও প্রি-ওউনড স্মার্টফোন', color: 'amber', icon: 'repeat', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: 'cat_laptops', name: 'ল্যাপটপ ও কম্পিউটার', nameEn: 'Laptops & PC', description: 'ল্যাপটপ, ডেক্সটপ ও কম্পিউটার যন্ত্রাংশ', color: 'purple', icon: 'laptop', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: 'cat_tv', name: 'টেলিভিশন', nameEn: 'TV & Displays', description: 'স্মার্ট টিভি, এলইডি ও মনিটর', color: 'cyan', icon: 'tv', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: 'cat_acfridge', name: 'এসি ও রেফ্রিজারেটর', nameEn: 'AC & Fridge', description: 'ইনভার্টার এসি ও ফ্রিজ', color: 'sky', icon: 'snowflake', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: 'cat_homeapp', name: 'হোম অ্যাপ্লায়েন্স', nameEn: 'Home Appliances', description: 'মাইক্রোওভেন, ব্লেন্ডার ও গৃহস্থালি পণ্য', color: 'emerald', icon: 'home', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: 'cat_audio', name: 'অডিও ও সাউন্ড', nameEn: 'Audio & Sound', description: 'হেডফোন, ইয়ারবাডস ও ব্লুটুথ সাউন্ডবক্স', color: 'rose', icon: 'headphones', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: 'cat_accessories', name: 'এক্সেসরিজ', nameEn: 'Accessories', description: 'চার্জার, ক্যাবল, ব্যাককভার ও স্ক্রিন প্রটেক্টর', color: 'orange', icon: 'cable', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: 'cat_other', name: 'অন্যান্য', nameEn: 'Other', description: 'বিবিধ ইলেকট্রনিক পণ্য ও গ্যাজেটস', color: 'slate', icon: 'package', createdAt: '2025-01-01T00:00:00.000Z' },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initially authenticated user if available
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = loadFromLocal<AuthUser | null>('phonesell_auth_user', null);
      if (saved && (saved.email || saved.id)) return saved;
    } catch (e) {
      console.warn('Failed to load user', e);
    }
    return null;
  });

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Active email identifier used for strict multi-tenant isolation
  const activeEmail = (currentUser?.email || user?.email || '').toLowerCase().trim() || null;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>(() => {
    try {
      const saved = loadFromLocal<ProductCategory[]>(STORAGE_KEYS.CATEGORIES, []);
      if (saved && saved.length > 0) return saved;
    } catch (e) {
      console.warn('Failed to load categories', e);
    }
    return DEFAULT_PRODUCT_CATEGORIES;
  });
  const [sales, setSales] = useState<Sale[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [returns, setReturns] = useState<ReturnClaim[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [repairs, setRepairs] = useState<RepairTicket[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [customerProfiles, setCustomerProfiles] = useState<CustomerCreditProfile[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [lang, setLang] = useState<Language>(() => loadFromLocal(STORAGE_KEYS.LANGUAGE, 'bn'));
  const [branch, setBranchState] = useState<Branch>(() => loadFromLocal(STORAGE_KEYS.BRANCH, 'BP-ISHWARGONJ'));
  const [devices, setDevices] = useState<Device[]>([]);
  const [usedBuys, setUsedBuys] = useState<UsedBuyRecord[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [accounts, setAccounts] = useState<AccountEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalTransaction[]>([]);
  const [smsLogs, setSmsLogs] = useState<SMSLog[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [favourites, setFavourites] = useState<string[]>(() => loadFromLocal(STORAGE_KEYS.FAVOURITES, ['devices', 'pos', 'installments', 'usedbuy', 'livewall']));
  const [deviceCredits, setDeviceCredits] = useState<number>(0);
  const [parkedCarts, setParkedCarts] = useState<ParkedCart[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [lastInvoice, setLastInvoice] = useState<Sale | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);
  const [lastMoneyReceipt, setLastMoneyReceipt] = useState<any | null>(null);
  const [showMoneyReceiptModal, setShowMoneyReceiptModal] = useState<boolean>(false);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      testConnection();
      syncNow();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    testConnection();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitor Auth state & establish 100% real-time Firestore subscriptions scoped to this user
  useEffect(() => {
    let subscriptions: (Unsubscribe | null)[] = [];

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      // Clean up any previous subscriptions immediately
      subscriptions.forEach(unsub => unsub?.());
      subscriptions = [];

      setUser(fbUser);
      setAuthLoading(false);

      if (fbUser && fbUser.email) {
        const mappedUser: AuthUser = {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email.split('@')[0],
          username: fbUser.email.split('@')[0],
          email: fbUser.email,
          role: 'SUPER_ADMIN',
          branch: 'ALL',
          phone: fbUser.phoneNumber || '',
          securityPin: '',
          avatar: fbUser.photoURL || undefined,
          lastLogin: new Date().toISOString()
        };
        setCurrentUser(mappedUser);
        saveToLocal('phonesell_auth_user', mappedUser);

        const uid = fbUser.uid;

        // Fetch or create user-specific store settings in Firestore
        try {
          const remoteSettings = await loadSettingsFromFirestore(uid);
          if (remoteSettings && remoteSettings.storeName) {
            setSettings(remoteSettings);
            setDeviceCredits(remoteSettings.deviceCredits ?? 0);
          } else {
            const initSettings: StoreSettings = {
              ...DEFAULT_SETTINGS,
              ownerId: uid,
              storeName: 'PhoneSell PRO ডিজিটাল শপ',
              deviceCredits: 0
            };
            setSettings(initSettings);
            saveSettingsToFirestore(initSettings, uid);
            setDeviceCredits(0);
          }
        } catch (err) {
          console.warn('Initial settings load warning:', err);
        }

        // Real-time Firestore subscriptions - 100% pure cloud data, strictly partitioned by uid
        subscriptions.push(subscribeCollectionFromFirestore<Product>('products', uid, setProducts));
        subscriptions.push(subscribeCollectionFromFirestore<ProductCategory>('categories', uid, (remoteCategories) => {
          if (remoteCategories && remoteCategories.length > 0) {
            setCategories(remoteCategories);
            saveToLocal(STORAGE_KEYS.CATEGORIES, remoteCategories);
          }
        }));
        subscriptions.push(subscribeCollectionFromFirestore<Sale>('sales', uid, setSales));
        subscriptions.push(subscribeCollectionFromFirestore<Installment>('installments', uid, setInstallments));
        subscriptions.push(subscribeCollectionFromFirestore<ReturnClaim>('returns', uid, setReturns));
        subscriptions.push(subscribeCollectionFromFirestore<Supplier>('suppliers', uid, setSuppliers));
        subscriptions.push(subscribeCollectionFromFirestore<Purchase>('purchases', uid, setPurchases));
        subscriptions.push(subscribeCollectionFromFirestore<RepairTicket>('repairs', uid, setRepairs));
        subscriptions.push(subscribeCollectionFromFirestore<Expense>('expenses', uid, setExpenses));
        subscriptions.push(subscribeCollectionFromFirestore<CustomerCreditProfile>('customer_profiles', uid, setCustomerProfiles));
        subscriptions.push(subscribeCollectionFromFirestore<Device>('devices', uid, setDevices));
        subscriptions.push(subscribeCollectionFromFirestore<UsedBuyRecord>('used_buys', uid, setUsedBuys));
        subscriptions.push(subscribeCollectionFromFirestore<StaffMember>('staff', uid, setStaff));
        subscriptions.push(subscribeCollectionFromFirestore<AccountEntry>('accounts', uid, setAccounts));
        subscriptions.push(subscribeCollectionFromFirestore<JournalTransaction>('journal', uid, setJournalEntries));
        subscriptions.push(subscribeCollectionFromFirestore<SMSLog>('sms_logs', uid, setSmsLogs));
        subscriptions.push(subscribeCollectionFromFirestore<ChatMessage>('chat_messages', uid, setChatMessages));
      } else {
        // If user is logged in via local Super Admin / Vercel session, preserve the session!
        const savedUser = loadFromLocal<AuthUser | null>('phonesell_auth_user', null);
        if (savedUser && (savedUser.email || savedUser.id)) {
          setCurrentUser(savedUser);
          const uid = savedUser.id || 'default_store_owner';

          // Attempt settings load
          loadSettingsFromFirestore(uid).then(remoteSettings => {
            if (remoteSettings && remoteSettings.storeName) {
              setSettings(remoteSettings);
              setDeviceCredits(remoteSettings.deviceCredits ?? 0);
            }
          }).catch(() => {});

          // Subscribe Firestore collections if online/authenticated
          try {
            subscriptions.push(subscribeCollectionFromFirestore<Product>('products', uid, setProducts));
            subscriptions.push(subscribeCollectionFromFirestore<ProductCategory>('categories', uid, (remoteCategories) => {
              if (remoteCategories && remoteCategories.length > 0) {
                setCategories(remoteCategories);
                saveToLocal(STORAGE_KEYS.CATEGORIES, remoteCategories);
              }
            }));
            subscriptions.push(subscribeCollectionFromFirestore<Sale>('sales', uid, setSales));
            subscriptions.push(subscribeCollectionFromFirestore<Installment>('installments', uid, setInstallments));
            subscriptions.push(subscribeCollectionFromFirestore<ReturnClaim>('returns', uid, setReturns));
            subscriptions.push(subscribeCollectionFromFirestore<Supplier>('suppliers', uid, setSuppliers));
            subscriptions.push(subscribeCollectionFromFirestore<Purchase>('purchases', uid, setPurchases));
            subscriptions.push(subscribeCollectionFromFirestore<RepairTicket>('repairs', uid, setRepairs));
            subscriptions.push(subscribeCollectionFromFirestore<Expense>('expenses', uid, setExpenses));
            subscriptions.push(subscribeCollectionFromFirestore<CustomerCreditProfile>('customer_profiles', uid, setCustomerProfiles));
            subscriptions.push(subscribeCollectionFromFirestore<Device>('devices', uid, setDevices));
            subscriptions.push(subscribeCollectionFromFirestore<UsedBuyRecord>('used_buys', uid, setUsedBuys));
            subscriptions.push(subscribeCollectionFromFirestore<StaffMember>('staff', uid, setStaff));
            subscriptions.push(subscribeCollectionFromFirestore<AccountEntry>('accounts', uid, setAccounts));
            subscriptions.push(subscribeCollectionFromFirestore<JournalTransaction>('journal', uid, setJournalEntries));
            subscriptions.push(subscribeCollectionFromFirestore<SMSLog>('sms_logs', uid, setSmsLogs));
            subscriptions.push(subscribeCollectionFromFirestore<ChatMessage>('chat_messages', uid, setChatMessages));
          } catch (e) {
            console.warn('Subscription notice:', e);
          }
        } else {
          // Explicitly logged out: Clear all store state to empty array
          setCurrentUser(null);
          setProducts([]);
          setSales([]);
          setInstallments([]);
          setReturns([]);
          setSuppliers([]);
          setPurchases([]);
          setRepairs([]);
          setExpenses([]);
          setCustomerProfiles([]);
          setDevices([]);
          setUsedBuys([]);
          setStaff([]);
          setAccounts([]);
          setJournalEntries([]);
          setSmsLogs([]);
          setChatMessages([]);
          setSettings(DEFAULT_SETTINGS);
          setCart([]);
          setDeviceCredits(0);
        }
      }
    });

    return () => {
      unsubscribe();
      subscriptions.forEach(unsub => unsub?.());
    };
  }, []);

  useEffect(() => {
    saveToLocal(STORAGE_KEYS.LANGUAGE, lang);
  }, [lang]);

  // Generate real-time notifications for low stock, due installments
  useEffect(() => {
    const newNotifications: NotificationItem[] = [];

    // Check low stock products
    products.forEach(p => {
      if (p.stock <= p.minStockAlert) {
        newNotifications.push({
          id: `low_stock_${p.id}`,
          type: 'low_stock',
          title: lang === 'bn' ? 'কম স্টক সতর্কতা!' : 'Low Stock Alert!',
          message: lang === 'bn' 
            ? `${p.name} এর স্টক মাত্র ${p.stock} টি বাকি রয়েছে!`
            : `${p.name} has only ${p.stock} units remaining!`,
          timestamp: new Date().toLocaleTimeString(),
          read: false,
          actionTab: 'inventory'
        });
      }
    });

    // Check overdue installments
    const today = new Date().toISOString().split('T')[0];
    installments.forEach(inst => {
      if (inst.status === 'active') {
        const overdue = inst.schedule.filter(s => !s.isPaid && s.dueDate < today);
        if (overdue.length > 0) {
          newNotifications.push({
            id: `due_${inst.id}`,
            type: 'due_reminder',
            title: lang === 'bn' ? 'বকেয়া কিস্তি নোটিফিকেশন' : 'Overdue Installment Notice',
            message: lang === 'bn'
              ? `${inst.customerName} এর ${overdue.length} টি কিস্তি বকেয়া হয়েছে (${inst.productNameSummary})`
              : `${inst.customerName} has ${overdue.length} overdue installment(s) for ${inst.productNameSummary}`,
            timestamp: new Date().toLocaleTimeString(),
            read: false,
            actionTab: 'installments'
          });
        }
      }
    });

    setNotifications(newNotifications);
  }, [products, installments, lang]);

  // Translation helper
  const t = useCallback((bn: string, en: string) => {
    return lang === 'bn' ? bn : en;
  }, [lang]);

  // Format currency
  const formatCurrency = useCallback((amount: number | null | undefined) => {
    const num = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    const formatted = Math.round(num).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US');
    return `${settings.currencySymbol} ${formatted}`;
  }, [lang, settings.currencySymbol]);

  // Cart operations
  const addToCart = (product: Product, quantity = 1, serials: string[] = []): boolean => {
    if (product.stock <= 0) {
      alert(t('এই পণ্যটির বর্তমানে কোন স্টক নেই!', 'This product is out of stock!'));
      return false;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        const nextQty = existing.quantity + quantity;
        if (nextQty > product.stock) {
          alert(t(`স্টকে সর্বোচ্চ ${product.stock} টি পণ্য রয়েছে!`, `Only ${product.stock} units available in stock!`));
          return prev;
        }
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: nextQty } 
            : item
        );
      } else {
        return [...prev, {
          product,
          quantity,
          selectedSerials: serials.length > 0 ? serials : (product.serialNumbers && product.serialNumbers.length > 0 ? [product.serialNumbers[0]] : []),
          unitPrice: product.sellingPrice,
          discount: 0,
          warrantyMonths: product.warrantyMonths || 12
        }];
      }
    });
    return true;
  };

  const updateCartItemQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const product = products.find(p => p.id === productId);
    if (product && quantity > product.stock) {
      alert(t(`স্টকে সর্বোচ্চ ${product.stock} টি রয়েছে!`, `Max available stock is ${product.stock}!`));
      return;
    }
    setCart(prev => prev.map(item => item.product.id === productId ? { ...item, quantity } : item));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const setCartItemSerials = (productId: string, serials: string[]) => {
    setCart(prev => prev.map(item => item.product.id === productId ? { ...item, selectedSerials: serials } : item));
  };

  // Complete checkout
  const completeCheckout = (saleData: {
    customerName: string;
    customerPhone: string;
    customerAddress?: string;
    customerNid?: string;
    guarantorName?: string;
    guarantorPhone?: string;
    guarantorNid?: string;
    guarantorRelation?: string;
    guarantorAddress?: string;
    dueDeadline?: string;
    creditTermDays?: number;
    discount: number;
    tax: number;
    paidAmount: number;
    paymentMethod: Sale['paymentMethod'];
    note?: string;
    installmentMonths?: number;
    downPayment?: number;
    enrollDeviceInLocker?: boolean;
    tradeInDiscount?: number;
    receivedAmount?: number;
    changeAmount?: number;
  }): Sale | null => {
    if (cart.length === 0) return null;

    const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const tradeIn = saleData.tradeInDiscount || 0;
    const total = Math.max(0, subtotal - saleData.discount - tradeIn + saleData.tax);
    const paid = Math.min(total, saleData.paidAmount);
    const due = Math.max(0, total - paid);

    const now = new Date();
    const invoiceNumber = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String(sales.length + 1).padStart(4, '0')}`;
    const currentOwnerId = user?.uid || currentUser?.id || 'default_store_owner';

    // Prepare Sale Items safely
    const items = cart.map(item => {
      const wMonths = typeof item.warrantyMonths === 'number' && !isNaN(item.warrantyMonths) ? item.warrantyMonths : (item.product.warrantyMonths || 0);
      const expDate = new Date();
      expDate.setMonth(expDate.getMonth() + (wMonths > 0 ? wMonths : 12));
      const warrantyExpiryDate = expDate.toISOString();

      return {
        productId: item.product.id,
        productName: item.product.name,
        brand: item.product.brand || 'General',
        category: item.product.category || 'General',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        purchasePrice: item.product.purchasePrice || 0,
        serialNumbers: item.selectedSerials || [],
        warrantyMonths: wMonths,
        warrantyExpiryDate,
        total: item.unitPrice * item.quantity
      };
    });

    const isInstallment = saleData.paymentMethod === 'installment';
    const saleId = `sale_${Date.now()}`;

    let newInstallmentId: string | undefined = undefined;

    // If installment, create installment agreement & schedule
    if (isInstallment && saleData.installmentMonths && saleData.installmentMonths > 0) {
      const count = saleData.installmentMonths;
      const down = saleData.downPayment !== undefined ? saleData.downPayment : paid;
      const balance = Math.max(0, total - down);
      const monthlyAmt = Math.round(balance / count);
      newInstallmentId = `inst_${Date.now()}`;

      const schedule = Array.from({ length: count }, (_, idx) => {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + (idx + 1));
        return {
          id: `sch_${idx + 1}_${Date.now()}`,
          installmentNo: idx + 1,
          dueDate: dueDate.toISOString().split('T')[0],
          amount: idx === count - 1 ? balance - (monthlyAmt * (count - 1)) : monthlyAmt,
          isPaid: false
        };
      });

      const newInstallment: Installment = {
        id: newInstallmentId,
        ownerId: currentOwnerId,
        saleId,
        invoiceNumber,
        customerName: saleData.customerName || (lang === 'bn' ? 'সাধারণ ক্রেতা' : 'Walk-in Customer'),
        customerPhone: saleData.customerPhone || 'N/A',
        customerAddress: saleData.customerAddress,
        customerNid: saleData.customerNid,
        guarantorName: saleData.guarantorName,
        guarantorPhone: saleData.guarantorPhone,
        guarantorNid: saleData.guarantorNid,
        guarantorRelation: saleData.guarantorRelation,
        guarantorAddress: saleData.guarantorAddress,
        productNameSummary: cart.map(c => c.product.name).join(', '),
        totalAmount: total,
        downPayment: down,
        remainingBalance: balance,
        monthlyAmount: monthlyAmt,
        installmentCount: count,
        paidCount: 0,
        status: balance <= 0 ? 'completed' : 'active',
        schedule,
        branch: branch || 'BP-ISHWARGONJ',
        createdAt: now.toISOString()
      };

      setInstallments(prev => [newInstallment, ...prev]);
      if (currentOwnerId) saveDocToFirestore('installments', newInstallment, currentOwnerId);

      // If enrolled in Device Locker, auto-add to fleet!
      if (saleData.enrollDeviceInLocker) {
        cart.forEach(cItem => {
          const serials = cItem.selectedSerials && cItem.selectedSerials.length > 0 ? cItem.selectedSerials : [`IMEI-${Date.now().toString().slice(-6)}`];
          serials.forEach((sn, idx) => {
            const devId = `DEV-${Date.now().toString().slice(-4)}${idx}`;
            const autoDev: Device = {
              id: devId,
              ownerId: currentOwnerId,
              branch,
              brand: cItem.product.brand || 'Samsung',
              model: cItem.product.name,
              imei1: sn,
              customerName: saleData.customerName || 'EMI Customer',
              customerPhone: saleData.customerPhone || 'N/A',
              outstandingDue: balance,
              lockStatus: 'UNLOCKED',
              financeStatus: 'ACTIVE',
              managementStatus: 'ACTIVE',
              liveStatus: 'online',
              batteryPercent: 98,
              offlineCodes: ['112233', '445566'],
              simInfo: { 
                slot: 1, 
                operator: 'Banglalink / GP 4G', 
                iccid: `898801234567890${idx}`
              },
              securityEvents: [],
              callLogs: [],
              locationHistory: [],
              commandHistory: [],
              enrolledAt: now.toISOString().split('T')[0],
              lastSyncAt: 'Just now',
              currentLocation: {
                address: saleData.customerAddress || 'ঈশ্বরগঞ্জ, ময়মনসিংহ',
                lat: 24.6853,
                lng: 90.5975,
                accuracy: 10,
                updatedAt: now.toISOString(),
                locationServicesOn: true
              }
            };
            setDevices(prev => [autoDev, ...prev]);
            if (currentOwnerId) saveDocToFirestore('devices', autoDev, currentOwnerId);
          });
        });
      }
    }

    const newSale: Sale = {
      id: saleId,
      ownerId: currentOwnerId,
      invoiceNumber,
      customerName: saleData.customerName || (lang === 'bn' ? 'সাধারণ ক্রেতা' : 'Walk-in Customer'),
      customerPhone: saleData.customerPhone || 'N/A',
      customerAddress: saleData.customerAddress || '',
      items,
      subtotal,
      discount: saleData.discount + tradeIn,
      tax: saleData.tax,
      total,
      paidAmount: paid,
      dueAmount: due,
      paymentMethod: saleData.paymentMethod,
      paymentStatus: due <= 0 ? 'paid' : (paid > 0 ? 'partial' : 'due'),
      saleType: isInstallment ? 'installment' : 'regular',
      installmentId: newInstallmentId,
      note: saleData.note,
      branch: branch || 'BP-ISHWARGONJ',
      dueDeadline: saleData.dueDeadline,
      creditTermDays: saleData.creditTermDays,
      createdAt: now.toISOString()
    };

    // Save sale directly to Firebase Firestore
    if (currentOwnerId) {
      saveDocToFirestore('sales', newSale, currentOwnerId);
    }

    // Double-entry bookkeeping: Record journal entry for sale payment
    if (paid > 0) {
      addJournalEntry({
        date: now.toISOString().split('T')[0],
        referenceNo: `SALE-${invoiceNumber}`,
        description: `পণ্য বিক্রয় ইনভয়েস #${invoiceNumber} (${saleData.customerName || 'ক্রেতা'})`,
        debitAccount: saleData.paymentMethod === 'bkash' || saleData.paymentMethod === 'nagad'
          ? 'bKash/Nagad Wallet'
          : saleData.paymentMethod === 'card'
          ? 'Bank Account'
          : 'Cash in Hand',
        creditAccount: 'Sales Revenue',
        amount: paid,
        branch: branch || 'BP-ISHWARGONJ'
      });
    }

    // Update customer credit profile when customer info is available
    if (saleData.customerPhone && saleData.customerPhone !== 'N/A' && saleData.customerPhone.trim()) {
      const cleanPhone = saleData.customerPhone.trim();
      const profileToSave: CustomerCreditProfile = {
        phone: cleanPhone,
        id: cleanPhone,
        ownerId: currentOwnerId,
        name: saleData.customerName || 'Customer',
        address: saleData.customerAddress || '',
        nidNumber: saleData.customerNid || '',
        creditLimit: 50000,
        riskRating: 'low',
        notes: 'Created via POS Checkout',
        updatedAt: now.toISOString()
      };
      setCustomerProfiles(prev => {
        const existing = prev.find(p => p.phone === cleanPhone);
        if (existing) {
          const updated = prev.map(p => p.phone === cleanPhone ? { ...p, ...profileToSave } : p);
          return updated;
        } else {
          return [profileToSave, ...prev];
        }
      });
      if (currentOwnerId) saveDocToFirestore('customer_profiles', profileToSave, currentOwnerId);
    }

    // Update product stock and remove sold serial numbers directly in Firestore
    setProducts(prev => prev.map(p => {
      const cartItem = cart.find(c => c.product.id === p.id);
      if (cartItem) {
        const updatedSerials = (p.serialNumbers || []).filter(s => !(cartItem.selectedSerials || []).includes(s));
        const updatedProduct = {
          ...p,
          stock: Math.max(0, (p.stock || 0) - cartItem.quantity),
          serialNumbers: updatedSerials,
          updatedAt: now.toISOString()
        };
        if (currentOwnerId) saveDocToFirestore('products', updatedProduct, currentOwnerId);
        return updatedProduct;
      }
      return p;
    }));

    // Update Sales list
    setSales(prev => [newSale, ...prev]);
    setLastInvoice(newSale);
    setShowInvoiceModal(true);
    clearCart();

    return newSale;
  };

  // Products CRUD - Direct Firebase Firestore Persistence
  const addProduct = (productData: Omit<Product, 'id' | 'ownerId' | 'createdAt'>) => {
    const ownerId = user?.uid || currentUser?.id;
    if (!ownerId) return;
    const newProd: Product = {
      ...productData,
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ownerId,
      createdAt: new Date().toISOString()
    };
    setProducts(prev => [newProd, ...prev]);
    saveDocToFirestore('products', newProd, ownerId);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const ownerId = user?.uid || currentUser?.id;
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, ...updates, updatedAt: new Date().toISOString() };
        if (ownerId) saveDocToFirestore('products', updated, ownerId);
        return updated;
      }
      return p;
    }));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    deleteDocFromFirestore('products', id);
  };

  // Auto-sync categories with products so previous categories and product categories always exist
  useEffect(() => {
    if (products.length > 0) {
      const existingNames = new Set(categories.map(c => c.name.trim().toLowerCase()));
      const missing: ProductCategory[] = [];
      const ownerId = user?.uid || currentUser?.id || 'default_store_owner';

      products.forEach(p => {
        if (p.category && p.category.trim() && !existingNames.has(p.category.trim().toLowerCase())) {
          existingNames.add(p.category.trim().toLowerCase());
          const newCat: ProductCategory = {
            id: `cat_auto_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            ownerId,
            name: p.category.trim(),
            nameEn: p.category.trim(),
            description: 'ইনভেন্টরি থেকে সমন্বিত ক্যাটাগরি',
            color: 'blue',
            createdAt: new Date().toISOString()
          };
          missing.push(newCat);
        }
      });

      if (missing.length > 0) {
        setCategories(prev => {
          const next = [...prev, ...missing];
          saveToLocal(STORAGE_KEYS.CATEGORIES, next);
          return next;
        });
        if (ownerId) {
          missing.forEach(cat => saveDocToFirestore('categories', cat, ownerId));
        }
      }
    }
  }, [products]);

  // Categories CRUD
  const addCategory = (categoryData: Omit<ProductCategory, 'id' | 'ownerId' | 'createdAt'>): ProductCategory => {
    const ownerId = user?.uid || currentUser?.id || 'default_store_owner';
    const newCat: ProductCategory = {
      ...categoryData,
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ownerId,
      createdAt: new Date().toISOString()
    };
    setCategories(prev => {
      const next = [newCat, ...prev];
      saveToLocal(STORAGE_KEYS.CATEGORIES, next);
      return next;
    });
    if (ownerId) {
      saveDocToFirestore('categories', newCat, ownerId);
    }
    return newCat;
  };

  const updateCategory = (id: string, updates: Partial<ProductCategory>, updateProductReferences: boolean = true) => {
    const ownerId = user?.uid || currentUser?.id;
    let oldName = '';
    
    setCategories(prev => {
      const updated = prev.map(c => {
        if (c.id === id) {
          oldName = c.name;
          const next = { ...c, ...updates, updatedAt: new Date().toISOString() };
          if (ownerId) saveDocToFirestore('categories', next, ownerId);
          return next;
        }
        return c;
      });
      saveToLocal(STORAGE_KEYS.CATEGORIES, updated);
      return updated;
    });

    // If category name was renamed, propagate to all products using the old name
    if (updateProductReferences && updates.name && oldName && updates.name.trim() !== oldName.trim()) {
      const newName = updates.name.trim();
      setProducts(prev => {
        return prev.map(p => {
          if (p.category === oldName) {
            const updatedProd = { ...p, category: newName, updatedAt: new Date().toISOString() };
            if (ownerId) saveDocToFirestore('products', updatedProd, ownerId);
            return updatedProd;
          }
          return p;
        });
      });
    }
  };

  const deleteCategory = (id: string, fallbackCategoryName: string = 'অন্যান্য'): { success: boolean; message: string } => {
    const target = categories.find(c => c.id === id);
    if (!target) return { success: false, message: 'ক্যাটাগরি খুঁজে পাওয়া যায়নি!' };

    const ownerId = user?.uid || currentUser?.id;
    const affectedProducts = products.filter(p => p.category === target.name);

    if (affectedProducts.length > 0) {
      setProducts(prev => {
        return prev.map(p => {
          if (p.category === target.name) {
            const updatedProd = { ...p, category: fallbackCategoryName, updatedAt: new Date().toISOString() };
            if (ownerId) saveDocToFirestore('products', updatedProd, ownerId);
            return updatedProd;
          }
          return p;
        });
      });
    }

    setCategories(prev => {
      const next = prev.filter(c => c.id !== id);
      saveToLocal(STORAGE_KEYS.CATEGORIES, next);
      return next;
    });
    deleteDocFromFirestore('categories', id);

    return {
      success: true,
      message: affectedProducts.length > 0
        ? `ক্যাটাগরি মুছে ফেলা হয়েছে এবং এর ${affectedProducts.length} টি পণ্য "${fallbackCategoryName}" এ স্থানান্তর করা হয়েছে।`
        : 'ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে।'
    };
  };

  // Installment schedule payment - Direct Firebase Firestore Persistence
  const recordInstallmentPayment = (installmentId: string, scheduleId: string, amount: number) => {
    const ownerId = user?.uid || currentUser?.id || '';
    const now = new Date();
    let receiptData: any = null;

    setInstallments(prev => prev.map(inst => {
      if (inst.id !== installmentId) return inst;

      const updatedSchedule = inst.schedule.map(sch => {
        if (sch.id === scheduleId) {
          return {
            ...sch,
            isPaid: true,
            paidAmount: amount,
            paidDate: now.toISOString(),
            receiptNo: `RC-${Date.now().toString().slice(-6)}`
          };
        }
        return sch;
      });

      const totalPaid = updatedSchedule.filter(s => s.isPaid).length;
      const remaining = Math.max(0, inst.remainingBalance - amount);
      const isCompleted = remaining <= 0 || updatedSchedule.every(s => s.isPaid);

      receiptData = {
        receiptNo: `RC-${Date.now().toString().slice(-6)}`,
        customerName: inst.customerName,
        customerPhone: inst.customerPhone,
        title: 'কিস্তি আদায় রশিদ',
        invoiceNumber: inst.invoiceNumber,
        productSummary: inst.productNameSummary,
        amount,
        remainingDue: remaining,
        date: now.toISOString(),
        method: 'cash'
      };

      const updatedInst: Installment = {
        ...inst,
        paidCount: totalPaid,
        remainingBalance: remaining,
        status: isCompleted ? 'completed' : 'active',
        schedule: updatedSchedule
      };
      if (ownerId) saveDocToFirestore('installments', updatedInst, ownerId);

      // Also update linked Sale record so paidAmount and dueAmount stay 100% synchronized
      setSales(prevSales => prevSales.map(s => {
        if (s.installmentId === installmentId || s.invoiceNumber === inst.invoiceNumber) {
          const newPaid = s.paidAmount + amount;
          const newDue = Math.max(0, s.total - newPaid);
          const updatedSale: Sale = {
            ...s,
            paidAmount: newPaid,
            dueAmount: newDue,
            paymentStatus: newDue <= 0 ? 'paid' : 'partial'
          };
          if (ownerId) saveDocToFirestore('sales', updatedSale, ownerId);
          return updatedSale;
        }
        return s;
      }));

      // Double-entry accounting for installment recovery
      addJournalEntry({
        date: now.toISOString().split('T')[0],
        referenceNo: `INST-${inst.invoiceNumber}-${Date.now().toString().slice(-4)}`,
        description: `কিস্তি আদায় - ইনভয়েস: ${inst.invoiceNumber} (${inst.customerName})`,
        debitAccount: 'Cash in Hand',
        creditAccount: 'Installment Accounts Receivable',
        amount,
        branch: inst.branch || branch
      });

      return updatedInst;
    }));

    if (receiptData) {
      setLastMoneyReceipt(receiptData);
      setShowMoneyReceiptModal(true);
    }
  };

  // Collect due payment - Direct Firebase Firestore Persistence
  const collectDuePayment = (saleId: string, amount: number) => {
    const ownerId = user?.uid || currentUser?.id || '';
    let receiptData: any = null;

    setSales(prev => prev.map(sale => {
      if (sale.id !== saleId) return sale;
      const newPaid = sale.paidAmount + amount;
      const newDue = Math.max(0, sale.total - newPaid);

      receiptData = {
        receiptNo: `RC-${Date.now().toString().slice(-6)}`,
        customerName: sale.customerName,
        customerPhone: sale.customerPhone,
        title: 'বকেয়া পরিশোধ রশিদ',
        invoiceNumber: sale.invoiceNumber,
        productSummary: sale.items.map(i => i.productName).join(', '),
        amount,
        remainingDue: newDue,
        date: new Date().toISOString(),
        method: 'cash'
      };

      const updatedSale: Sale = {
        ...sale,
        paidAmount: newPaid,
        dueAmount: newDue,
        paymentStatus: newDue <= 0 ? 'paid' : 'partial'
      };
      if (ownerId) saveDocToFirestore('sales', updatedSale, ownerId);

      // Double-entry accounting for collected due
      addJournalEntry({
        date: new Date().toISOString().split('T')[0],
        referenceNo: `DUE-${sale.invoiceNumber}-${Date.now().toString().slice(-4)}`,
        description: `বকেয়া আদায় - ইনভয়েস #${sale.invoiceNumber} (${sale.customerName})`,
        debitAccount: 'Cash in Hand',
        creditAccount: 'Accounts Receivable',
        amount,
        branch: sale.branch || branch
      });

      return updatedSale;
    }));

    if (receiptData) {
      setLastMoneyReceipt(receiptData);
      setShowMoneyReceiptModal(true);
    }
  };

  // Customer Credit Profile Management - Direct Firebase Firestore Persistence
  const updateCustomerCreditProfile = (profile: CustomerCreditProfile) => {
    const ownerId = user?.uid || currentUser?.id || '';
    const cleanPhone = profile.phone;
    const profileToSave: CustomerCreditProfile = {
      ...profile,
      id: cleanPhone,
      ownerId,
      updatedAt: new Date().toISOString()
    };
    setCustomerProfiles(prev => {
      const idx = prev.findIndex(p => p.phone === profile.phone);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = profileToSave;
        return next;
      }
      return [...prev, profileToSave];
    });
    if (ownerId) saveDocToFirestore('customer_profiles', profileToSave, ownerId);
  };

  // Follow-Up Reminders & Diary - Direct Firebase Firestore Persistence
  const addInstallmentFollowUp = (installmentId: string, log: Omit<FollowUpLog, 'id' | 'date'>) => {
    const ownerId = user?.uid || currentUser?.id || '';
    const newLog: FollowUpLog = {
      ...log,
      id: `flw_${Date.now()}`,
      date: new Date().toISOString()
    };
    setInstallments(prev => prev.map(inst => {
      if (inst.id !== installmentId) return inst;
      const updatedInst = {
        ...inst,
        followUps: [newLog, ...(inst.followUps || [])]
      };
      if (ownerId) saveDocToFirestore('installments', updatedInst, ownerId);
      return updatedInst;
    }));
  };

  const addSaleFollowUp = (saleId: string, log: Omit<FollowUpLog, 'id' | 'date'>) => {
    const ownerId = user?.uid || currentUser?.id || '';
    const newLog: FollowUpLog = {
      ...log,
      id: `flw_${Date.now()}`,
      date: new Date().toISOString()
    };
    setSales(prev => prev.map(sale => {
      if (sale.id !== saleId) return sale;
      const updatedSale = {
        ...sale,
        followUps: [newLog, ...(sale.followUps || [])]
      };
      if (ownerId) saveDocToFirestore('sales', updatedSale, ownerId);
      return updatedSale;
    }));
  };

  // Advanced Partial Installment & Late Fee Payment - Direct Firebase Firestore Persistence
  const recordInstallmentPartialPayment = (
    installmentId: string, 
    scheduleId: string, 
    paidAmount: number, 
    penaltyAmount: number = 0,
    note?: string
  ) => {
    // Delegate to smart payment with targeted schedule
    recordInstallmentSmartPayment(installmentId, paidAmount, {
      targetScheduleId: scheduleId,
      penaltyAmount,
      note,
      paymentMethod: 'cash'
    });
  };

  // Smart Multi-Installment, Custom Amount & Foreclosure Engine
  const recordInstallmentSmartPayment = (
    installmentId: string,
    paidAmount: number,
    options?: {
      targetScheduleId?: string;
      paymentMethod?: 'cash' | 'bkash' | 'nagad' | 'rocket' | 'bank' | 'split';
      trxId?: string;
      bankAccount?: string;
      penaltyAmount?: number;
      waivePenalty?: boolean;
      discountAmount?: number;
      note?: string;
      autoUnlockLinkedDevice?: boolean;
    }
  ) => {
    const ownerId = user?.uid || currentUser?.id || '';
    const now = new Date();
    const method = options?.paymentMethod || 'cash';
    const effectivePenalty = options?.waivePenalty ? 0 : (options?.penaltyAmount || 0);
    const discount = Math.max(0, options?.discountAmount || 0);
    let receiptData: any = null;
    let newlyPaidItemNumbers: number[] = [];

    setInstallments(prev => prev.map(inst => {
      if (inst.id !== installmentId) return inst;

      let remainingPaymentPool = Math.max(0, paidAmount);
      const isTargeted = Boolean(options?.targetScheduleId);

      // Clone schedules and determine sequence
      const updatedSchedule = inst.schedule.map(sch => ({ ...sch }));

      // Order of processing: targeted item first, then remaining unpaid items in chronological order
      const processOrder = updatedSchedule
        .filter(s => isTargeted ? s.id === options?.targetScheduleId : !s.isPaid)
        .concat(
          isTargeted
            ? updatedSchedule.filter(s => s.id !== options?.targetScheduleId && !s.isPaid)
            : []
        );

      processOrder.forEach((sch) => {
        if (remainingPaymentPool <= 0) return;

        const isThisTarget = sch.id === options?.targetScheduleId;
        const itemPenalty = isThisTarget ? effectivePenalty : 0;
        const currentPaid = sch.paidAmount || 0;
        const remainingOnThisItem = Math.max(0, (sch.amount + itemPenalty) - currentPaid);

        if (remainingOnThisItem <= 0) return;

        const allocate = Math.min(remainingPaymentPool, remainingOnThisItem);
        remainingPaymentPool -= allocate;

        const totalPaidSoFar = currentPaid + allocate;
        const totalTarget = sch.amount + itemPenalty;
        const isNowPaid = totalPaidSoFar >= totalTarget;

        if (isNowPaid) {
          newlyPaidItemNumbers.push(sch.installmentNo);
        }

        // Mutate in-place inside updatedSchedule
        const idx = updatedSchedule.findIndex(s => s.id === sch.id);
        if (idx >= 0) {
          updatedSchedule[idx] = {
            ...updatedSchedule[idx],
            paidAmount: totalPaidSoFar,
            isPaid: isNowPaid,
            paidDate: now.toISOString(),
            paymentMethod: method,
            trxId: options?.trxId,
            bankAccount: options?.bankAccount,
            lateFee: (updatedSchedule[idx].lateFee || 0) + itemPenalty,
            waivedPenalty: options?.waivePenalty && isThisTarget ? (options?.penaltyAmount || 0) : (updatedSchedule[idx].waivedPenalty || 0),
            discountAmount: isThisTarget ? discount : (updatedSchedule[idx].discountAmount || 0),
            receiptNo: updatedSchedule[idx].receiptNo || `RC-${Date.now().toString().slice(-6)}`,
            note: options?.note ? (updatedSchedule[idx].note ? `${updatedSchedule[idx].note}; ${options.note}` : options.note) : updatedSchedule[idx].note
          };
        }
      });

      const totalPaidCount = updatedSchedule.filter(s => s.isPaid).length;
      // Balance reduces by actual cash paid + any early closure discount applied
      const totalBalanceReduction = paidAmount + discount;
      const newRemainingBalance = Math.max(0, inst.remainingBalance - totalBalanceReduction);
      const isCompleted = newRemainingBalance <= 0 || updatedSchedule.every(s => s.isPaid);

      const status: 'active' | 'completed' | 'overdue' | 'foreclosed' = isCompleted
        ? (discount > 0 ? 'foreclosed' : 'completed')
        : 'active';

      receiptData = {
        receiptNo: `RC-${Date.now().toString().slice(-6)}`,
        customerName: inst.customerName,
        customerPhone: inst.customerPhone,
        title: discount > 0 ? 'কিস্তি এককালীন ক্লোজার ও আদায় রশিদ' : 'কিস্তি আদায় রশিদ (EMI Receipt)',
        invoiceNumber: inst.invoiceNumber,
        productSummary: inst.productNameSummary,
        amount: paidAmount,
        lateFee: effectivePenalty,
        waivedFee: options?.waivePenalty ? (options?.penaltyAmount || 0) : 0,
        discount,
        remainingDue: newRemainingBalance,
        date: now.toISOString(),
        method,
        trxId: options?.trxId,
        bankAccount: options?.bankAccount,
        paidInstallmentsSummary: newlyPaidItemNumbers.length > 0 ? `কিস্তি নং ${newlyPaidItemNumbers.join(', ')}` : undefined,
        note: options?.note
      };

      const updatedInst: Installment = {
        ...inst,
        paidCount: totalPaidCount,
        remainingBalance: newRemainingBalance,
        totalLateFeeAccrued: (inst.totalLateFeeAccrued || 0) + effectivePenalty,
        totalWaivedPenalty: (inst.totalWaivedPenalty || 0) + (options?.waivePenalty ? (options?.penaltyAmount || 0) : 0),
        earlySettlementDiscount: (inst.earlySettlementDiscount || 0) + discount,
        status,
        schedule: updatedSchedule
      };

      if (ownerId) saveDocToFirestore('installments', updatedInst, ownerId);

      // 100% Synchronize linked Sale record
      setSales(prevSales => prevSales.map(s => {
        if (s.installmentId === installmentId || s.invoiceNumber === inst.invoiceNumber) {
          const newPaid = s.paidAmount + paidAmount + discount;
          const newDue = Math.max(0, s.total - newPaid);
          const updatedSale: Sale = {
            ...s,
            paidAmount: newPaid,
            dueAmount: newDue,
            paymentStatus: newDue <= 0 ? 'paid' : 'partial'
          };
          if (ownerId) saveDocToFirestore('sales', updatedSale, ownerId);
          return updatedSale;
        }
        return s;
      }));

      // Double-entry accounting for installment recovery
      const debitAccount = (method === 'bkash' || method === 'nagad' || method === 'rocket')
        ? 'bKash/Nagad Wallet'
        : (method === 'bank' ? 'Bank Account' : 'Cash in Hand');

      addJournalEntry({
        date: now.toISOString().split('T')[0],
        referenceNo: `INST-${inst.invoiceNumber}-${Date.now().toString().slice(-4)}`,
        description: `কিস্তি আদায় (${method.toUpperCase()}) - ইনভয়েস: ${inst.invoiceNumber} (${inst.customerName})${options?.trxId ? ` TrxID: ${options.trxId}` : ''}`,
        debitAccount,
        creditAccount: 'Installment Accounts Receivable',
        amount: paidAmount,
        branch: inst.branch || branch
      });

      return updatedInst;
    }));

    // Auto-unlock linked locked phone in Device Locker if requested
    if (options?.autoUnlockLinkedDevice) {
      const lockedDevice = devices.find(d => 
        (d.customerPhone === receiptData?.customerPhone || d.customerName === receiptData?.customerName) &&
        d.lockStatus === 'LOCKED'
      );
      if (lockedDevice) {
        toggleDeviceLock(lockedDevice.id, 'কিস্তি পরিশোধের প্রেক্ষিতে স্বয়ংক্রিয় ডিভাইস আনলক');
      }
    }

    if (receiptData) {
      setLastMoneyReceipt(receiptData);
      setShowMoneyReceiptModal(true);
    }
  };

  // Reverse / Void an installment payment (Error correction)
  const reverseInstallmentPayment = (installmentId: string, scheduleId: string, reason?: string) => {
    const ownerId = user?.uid || currentUser?.id || '';
    const now = new Date();

    setInstallments(prev => prev.map(inst => {
      if (inst.id !== installmentId) return inst;

      const targetItem = inst.schedule.find(s => s.id === scheduleId);
      if (!targetItem || (!targetItem.isPaid && (!targetItem.paidAmount || targetItem.paidAmount <= 0))) {
        return inst;
      }

      const amountToRevert = targetItem.paidAmount || targetItem.amount;

      const updatedSchedule = inst.schedule.map(sch => {
        if (sch.id === scheduleId) {
          return {
            ...sch,
            isPaid: false,
            paidAmount: 0,
            paidDate: undefined,
            reversalReason: reason || 'ক্যাশিয়ার কর্তৃক ভুল এন্ট্রি সংশোধন ও বাতিল',
            reversedAt: now.toISOString(),
            note: sch.note ? `${sch.note} (বাতিলকৃত)` : 'বাতিলকৃত'
          };
        }
        return sch;
      });

      const newPaidCount = updatedSchedule.filter(s => s.isPaid).length;
      const newRemainingBalance = inst.remainingBalance + amountToRevert;

      const updatedInst: Installment = {
        ...inst,
        paidCount: newPaidCount,
        remainingBalance: newRemainingBalance,
        status: 'active',
        schedule: updatedSchedule
      };

      if (ownerId) saveDocToFirestore('installments', updatedInst, ownerId);

      // Revert linked sale
      setSales(prevSales => prevSales.map(s => {
        if (s.installmentId === installmentId || s.invoiceNumber === inst.invoiceNumber) {
          const revertedPaid = Math.max(0, s.paidAmount - amountToRevert);
          const revertedDue = Math.max(0, s.total - revertedPaid);
          const updatedSale: Sale = {
            ...s,
            paidAmount: revertedPaid,
            dueAmount: revertedDue,
            paymentStatus: revertedPaid <= 0 ? 'due' : 'partial'
          };
          if (ownerId) saveDocToFirestore('sales', updatedSale, ownerId);
          return updatedSale;
        }
        return s;
      }));

      // Reversal accounting journal entry
      addJournalEntry({
        date: now.toISOString().split('T')[0],
        referenceNo: `REV-INST-${inst.invoiceNumber}-${Date.now().toString().slice(-4)}`,
        description: `কিস্তি পেমেন্ট বাতিল/রিভার্সাল - ইনভয়েস #${inst.invoiceNumber} (কারণ: ${reason || 'ভুল এন্ট্রি'})`,
        debitAccount: 'Installment Accounts Receivable',
        creditAccount: 'Cash in Hand',
        amount: amountToRevert,
        branch: inst.branch || branch
      });

      return updatedInst;
    }));
  };

  // Advanced Due Payment Collection for Regular Sales
  const collectDuePaymentAdvanced = (
    saleId: string,
    amount: number,
    options?: {
      paymentMethod?: 'cash' | 'bkash' | 'nagad' | 'rocket' | 'bank';
      trxId?: string;
      note?: string;
      autoUnlockLinkedDevice?: boolean;
    }
  ) => {
    const ownerId = user?.uid || currentUser?.id || '';
    const now = new Date();
    const method = options?.paymentMethod || 'cash';
    let receiptData: any = null;

    setSales(prev => prev.map(sale => {
      if (sale.id !== saleId) return sale;
      const newPaid = sale.paidAmount + amount;
      const newDue = Math.max(0, sale.total - newPaid);

      receiptData = {
        receiptNo: `RC-${Date.now().toString().slice(-6)}`,
        customerName: sale.customerName,
        customerPhone: sale.customerPhone,
        title: 'বকেয়া পরিশোধ রশিদ (Due Voucher)',
        invoiceNumber: sale.invoiceNumber,
        productSummary: sale.items.map(i => i.productName).join(', '),
        amount,
        remainingDue: newDue,
        date: now.toISOString(),
        method,
        trxId: options?.trxId,
        note: options?.note
      };

      const updatedSale: Sale = {
        ...sale,
        paidAmount: newPaid,
        dueAmount: newDue,
        paymentStatus: newDue <= 0 ? 'paid' : 'partial'
      };
      if (ownerId) saveDocToFirestore('sales', updatedSale, ownerId);

      const debitAccount = (method === 'bkash' || method === 'nagad' || method === 'rocket')
        ? 'bKash/Nagad Wallet'
        : (method === 'bank' ? 'Bank Account' : 'Cash in Hand');

      addJournalEntry({
        date: now.toISOString().split('T')[0],
        referenceNo: `DUE-${sale.invoiceNumber}-${Date.now().toString().slice(-4)}`,
        description: `বকেয়া আদায় (${method.toUpperCase()}) - ইনভয়েস #${sale.invoiceNumber} (${sale.customerName})${options?.trxId ? ` TrxID: ${options.trxId}` : ''}`,
        debitAccount,
        creditAccount: 'Accounts Receivable',
        amount,
        branch: sale.branch || branch
      });

      return updatedSale;
    }));

    if (options?.autoUnlockLinkedDevice) {
      const lockedDevice = devices.find(d => 
        (d.customerPhone === receiptData?.customerPhone || d.customerName === receiptData?.customerName) &&
        d.lockStatus === 'LOCKED'
      );
      if (lockedDevice) {
        toggleDeviceLock(lockedDevice.id, 'বকেয়া পরিশোধের প্রেক্ষিতে স্বয়ংক্রিয় ডিভাইস আনলক');
      }
    }

    if (receiptData) {
      setLastMoneyReceipt(receiptData);
      setShowMoneyReceiptModal(true);
    }
  };

  // Supplier CRUD & Payment - Direct Firebase Firestore Persistence
  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'ownerId' | 'createdAt' | 'balanceDue' | 'totalPurchased' | 'totalPaid'>) => {
    const ownerId = user?.uid || currentUser?.id || '';
    const newSupplier: Supplier = {
      ...supplierData,
      id: `supp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ownerId,
      balanceDue: 0,
      totalPurchased: 0,
      totalPaid: 0,
      createdAt: new Date().toISOString()
    };
    setSuppliers(prev => [newSupplier, ...prev]);
    if (ownerId) saveDocToFirestore('suppliers', newSupplier, ownerId);
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    const ownerId = user?.uid || currentUser?.id || '';
    setSuppliers(prev => prev.map(s => {
      if (s.id === id) {
        const updated = { ...s, ...updates, updatedAt: new Date().toISOString() };
        if (ownerId) saveDocToFirestore('suppliers', updated, ownerId);
        return updated;
      }
      return s;
    }));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
    deleteDocFromFirestore('suppliers', id);
  };

  const recordSupplierPayment = (supplierId: string, amount: number, paymentMethod: string, note?: string) => {
    const ownerId = user?.uid || currentUser?.id || '';
    setSuppliers(prev => prev.map(s => {
      if (s.id !== supplierId) return s;
      const newDue = Math.max(0, s.balanceDue - amount);
      const newPaid = s.totalPaid + amount;
      const updatedS = {
        ...s,
        balanceDue: newDue,
        totalPaid: newPaid,
        updatedAt: new Date().toISOString()
      };
      if (ownerId) saveDocToFirestore('suppliers', updatedS, ownerId);
      return updatedS;
    }));

    // Also record expense for cash flow tracking in Firestore
    const newExpense: Expense = {
      id: `exp_supp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ownerId,
      title: `সাপ্লায়ার দেনা পরিশোধ (${suppliers.find(s => s.id === supplierId)?.companyName || 'সাপ্লায়ার'})`,
      category: 'other',
      amount,
      paymentMethod: (paymentMethod as any) || 'cash',
      note: note || 'সাপ্লায়ার বকেয়া পরিশোধ',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
    setExpenses(prev => [newExpense, ...prev]);
    if (ownerId) saveDocToFirestore('expenses', newExpense, ownerId);
  };

  // Purchase (Stock In) Management - Direct Firebase Firestore Persistence
  const addPurchase = (purchaseData: {
    challanNumber: string;
    supplierId: string;
    items: Purchase['items'];
    additionalCost?: number;
    discount?: number;
    paidAmount: number;
    paymentMethod: Purchase['paymentMethod'];
    note?: string;
    purchaseDate: string;
  }) => {
    const ownerId = user?.uid || currentUser?.id || '';
    const supplier = suppliers.find(s => s.id === purchaseData.supplierId);
    const subtotal = purchaseData.items.reduce((sum, item) => sum + item.totalCost, 0);
    const addCost = purchaseData.additionalCost || 0;
    const disc = purchaseData.discount || 0;
    const total = Math.max(0, subtotal + addCost - disc);
    const dueAmount = Math.max(0, total - purchaseData.paidAmount);

    const newPurchase: Purchase = {
      id: `pur_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ownerId,
      challanNumber: purchaseData.challanNumber,
      supplierId: purchaseData.supplierId,
      supplierName: supplier?.companyName || supplier?.name || 'অজানা সাপ্লায়ার',
      supplierPhone: supplier?.phone || '',
      items: purchaseData.items,
      subtotal,
      additionalCost: addCost,
      discount: disc,
      total,
      paidAmount: purchaseData.paidAmount,
      dueAmount,
      paymentMethod: purchaseData.paymentMethod,
      note: purchaseData.note,
      purchaseDate: purchaseData.purchaseDate,
      createdAt: new Date().toISOString()
    };

    setPurchases(prev => [newPurchase, ...prev]);
    if (ownerId) saveDocToFirestore('purchases', newPurchase, ownerId);

    // Update Product stocks & unit cost in inventory directly in Firestore
    setProducts(prev => {
      return prev.map(p => {
        const matchingItem = purchaseData.items.find(item => item.productId === p.id);
        if (matchingItem) {
          const newStock = p.stock + matchingItem.quantity;
          const updatedSerials = [...(p.serialNumbers || []), ...(matchingItem.serialNumbers || [])];
          const updatedProd = {
            ...p,
            stock: newStock,
            purchasePrice: matchingItem.unitCost > 0 ? matchingItem.unitCost : p.purchasePrice,
            serialNumbers: updatedSerials,
            updatedAt: new Date().toISOString()
          };
          if (ownerId) saveDocToFirestore('products', updatedProd, ownerId);
          return updatedProd;
        }
        return p;
      });
    });

    // Update Supplier ledger in Firestore
    if (supplier) {
      setSuppliers(prev => prev.map(s => {
        if (s.id !== supplier.id) return s;
        const updatedSupp = {
          ...s,
          totalPurchased: s.totalPurchased + total,
          totalPaid: s.totalPaid + purchaseData.paidAmount,
          balanceDue: s.balanceDue + dueAmount,
          updatedAt: new Date().toISOString()
        };
        if (ownerId) saveDocToFirestore('suppliers', updatedSupp, ownerId);
        return updatedSupp;
      }));
    }
  };

  // Repair / Servicing Management - Direct Firebase Firestore Persistence
  const addRepairTicket = (ticketData: Omit<RepairTicket, 'id' | 'ownerId' | 'createdAt' | 'ticketNumber' | 'dueAmount'>) => {
    const ownerId = user?.uid || currentUser?.id || '';
    const dueAmount = Math.max(0, ticketData.estimatedCost - ticketData.advancePaid);
    const newTicket: RepairTicket = {
      ...ticketData,
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ownerId,
      ticketNumber: `REP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      dueAmount,
      createdAt: new Date().toISOString()
    };

    setRepairs(prev => [newTicket, ...prev]);
    if (ownerId) saveDocToFirestore('repairs', newTicket, ownerId);
    return newTicket;
  };

  const updateRepairStatus = (id: string, status: RepairStatus, notes?: string, finalCost?: number, paidAdditional?: number) => {
    const ownerId = user?.uid || currentUser?.id || '';
    setRepairs(prev => prev.map(ticket => {
      if (ticket.id !== id) return ticket;
      const cost = finalCost !== undefined ? finalCost : (ticket.finalCost || ticket.estimatedCost);
      const addPaid = paidAdditional || 0;
      const totalPaid = ticket.advancePaid + addPaid;
      const newDue = Math.max(0, cost - totalPaid);

      const updatedTicket: RepairTicket = {
        ...ticket,
        status,
        finalCost: cost,
        advancePaid: totalPaid,
        dueAmount: newDue,
        technicianNotes: notes !== undefined ? notes : ticket.technicianNotes,
        deliveredDate: status === 'delivered' ? new Date().toISOString() : ticket.deliveredDate
      };
      if (ownerId) saveDocToFirestore('repairs', updatedTicket, ownerId);
      return updatedTicket;
    }));
  };

  const deleteRepairTicket = (id: string) => {
    setRepairs(prev => prev.filter(t => t.id !== id));
    deleteDocFromFirestore('repairs', id);
  };

  // Expense Management - Direct Firebase Firestore Persistence
  const addExpense = (expenseData: Omit<Expense, 'id' | 'ownerId' | 'createdAt'>) => {
    const ownerId = user?.uid || currentUser?.id || '';
    const newExpense: Expense = {
      ...expenseData,
      id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ownerId,
      createdAt: new Date().toISOString()
    };
    setExpenses(prev => [newExpense, ...prev]);
    if (ownerId) saveDocToFirestore('expenses', newExpense, ownerId);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    deleteDocFromFirestore('expenses', id);
  };

  // CSV Export utility with UTF-8 BOM for Bengali Excel support
  const exportToCsv = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      alert(t('এক্সপোর্ট করার মতো কোনো ডেটা নেই!', 'No data available to export!'));
      return;
    }
    const headers = Object.keys(data[0]);
    const rows = data.map(item =>
      headers.map(header => {
        let val = item[header];
        if (typeof val === 'object' && val !== null) {
          val = JSON.stringify(val);
        }
        return `"${String(val ?? '').replace(/"/g, '""')}"`;
      }).join(',')
    );
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Warranty / Returns - Direct Firebase Firestore Persistence
  const addReturnClaim = (claim: Omit<ReturnClaim, 'id' | 'ownerId' | 'createdAt'>) => {
    const ownerId = user?.uid || currentUser?.id || '';
    const newClaim: ReturnClaim = {
      ...claim,
      id: `claim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ownerId,
      createdAt: new Date().toISOString()
    };
    setReturns(prev => [newClaim, ...prev]);
    if (ownerId) saveDocToFirestore('returns', newClaim, ownerId);
  };

  const updateClaimStatus = (id: string, status: ClaimStatus, notes?: string) => {
    const ownerId = user?.uid || currentUser?.id || '';
    setReturns(prev => prev.map(c => {
      if (c.id === id) {
        const updatedClaim: ReturnClaim = {
          ...c,
          status,
          notes: notes !== undefined ? notes : c.notes,
          resolvedAt: ['repaired', 'replaced', 'refunded', 'rejected'].includes(status) ? new Date().toISOString() : c.resolvedAt
        };
        if (ownerId) saveDocToFirestore('returns', updatedClaim, ownerId);
        return updatedClaim;
      }
      return c;
    }));
  };

  // Update Settings - Direct Firebase Firestore Persistence
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    const ownerId = user?.uid || currentUser?.id || '';
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    if (ownerId) saveSettingsToFirestore(merged, ownerId);
  };

  // Cloud Sync
  const syncNow = async () => {
    if (!isOnline) {
      alert(t('আপনি অফলাইন আছেন। ইন্টারনেট সংযোগ পেলে স্বয়ংক্রিয় সিঙ্ক হবে।', 'You are currently offline. Automatic sync will resume when online.'));
      return;
    }
    if (!user) {
      console.log('User not logged in to sync to cloud. Offline storage is healthy.');
      return;
    }

    setIsSyncing(true);
    try {
      await syncCollectionToFirestore('products', products, user.uid);
      await syncCollectionToFirestore('sales', sales, user.uid);
      await syncCollectionToFirestore('installments', installments, user.uid);
      await syncCollectionToFirestore('returns', returns, user.uid);
      await syncCollectionToFirestore('suppliers', suppliers, user.uid);
      await syncCollectionToFirestore('purchases', purchases, user.uid);
      await syncCollectionToFirestore('repairs', repairs, user.uid);
      await syncCollectionToFirestore('expenses', expenses, user.uid);
      setPendingSyncCount(0);
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Backup & Restore - 100% Pure Firebase
  const downloadBackup = () => {
    const backupData = {
      app: 'PhoneSell PRO',
      version: '2.0.0',
      exportDate: new Date().toISOString(),
      userEmail: user?.email || currentUser?.email,
      ownerId: user?.uid || currentUser?.id,
      data: {
        products,
        categories,
        sales,
        installments,
        returns,
        suppliers,
        purchases,
        repairs,
        expenses,
        customerProfiles,
        devices,
        usedBuys,
        staff,
        accounts,
        journalEntries,
        smsLogs,
        settings
      }
    };
    const json = JSON.stringify(backupData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const emailSanitized = (user?.email || currentUser?.email || 'user').replace(/[^a-zA-Z0-9]/g, '_');
    a.download = `PhoneSellPRO_Backup_${emailSanitized}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const restoreBackup = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      const ownerId = user?.uid || currentUser?.id;
      if (!ownerId) {
        return { success: false, message: 'রিস্টোর করতে প্রথমে ফায়ারবেজে লগইন করুন।' };
      }
      const data = parsed.data || parsed;
      // Directly persist loaded records into Firebase Firestore scoped to active ownerId
      if (Array.isArray(data.products)) {
        data.products.forEach((p: Product) => saveDocToFirestore('products', { ...p, ownerId }, ownerId));
      }
      if (Array.isArray(data.categories)) {
        data.categories.forEach((c: ProductCategory) => saveDocToFirestore('categories', { ...c, ownerId }, ownerId));
      }
      if (Array.isArray(data.sales)) {
        data.sales.forEach((s: Sale) => saveDocToFirestore('sales', { ...s, ownerId }, ownerId));
      }
      if (Array.isArray(data.installments)) {
        data.installments.forEach((inst: Installment) => saveDocToFirestore('installments', { ...inst, ownerId }, ownerId));
      }
      if (Array.isArray(data.returns)) {
        data.returns.forEach((ret: ReturnClaim) => saveDocToFirestore('returns', { ...ret, ownerId }, ownerId));
      }
      if (Array.isArray(data.suppliers)) {
        data.suppliers.forEach((sup: Supplier) => saveDocToFirestore('suppliers', { ...sup, ownerId }, ownerId));
      }
      if (Array.isArray(data.purchases)) {
        data.purchases.forEach((pur: Purchase) => saveDocToFirestore('purchases', { ...pur, ownerId }, ownerId));
      }
      if (Array.isArray(data.repairs)) {
        data.repairs.forEach((rep: RepairTicket) => saveDocToFirestore('repairs', { ...rep, ownerId }, ownerId));
      }
      if (Array.isArray(data.expenses)) {
        data.expenses.forEach((exp: Expense) => saveDocToFirestore('expenses', { ...exp, ownerId }, ownerId));
      }
      if (Array.isArray(data.customerProfiles)) {
        data.customerProfiles.forEach((cp: CustomerCreditProfile) => {
          const profileItem = { ...cp, id: cp.id || cp.phone, ownerId };
          saveDocToFirestore('customer_profiles', profileItem, ownerId);
        });
      }
      if (Array.isArray(data.devices)) {
        data.devices.forEach((d: Device) => saveDocToFirestore('devices', { ...d, ownerId }, ownerId));
      }
      if (Array.isArray(data.usedBuys)) {
        data.usedBuys.forEach((ub: UsedBuyRecord) => saveDocToFirestore('used_buys', { ...ub, ownerId }, ownerId));
      }
      if (Array.isArray(data.staff)) {
        data.staff.forEach((st: StaffMember) => saveDocToFirestore('staff', { ...st, ownerId }, ownerId));
      }
      if (Array.isArray(data.accounts)) {
        data.accounts.forEach((acc: AccountEntry) => saveDocToFirestore('accounts', { ...acc, ownerId }, ownerId));
      }
      if (Array.isArray(data.journalEntries)) {
        data.journalEntries.forEach((jn: JournalTransaction) => saveDocToFirestore('journal', { ...jn, ownerId }, ownerId));
      }
      if (data.settings && data.settings.storeName) {
        saveSettingsToFirestore({ ...data.settings, ownerId }, ownerId);
      }
      return { success: true, message: 'ফায়ারবেজে ডাটা সফলভাবে রিস্টোর হয়েছে!' };
    } catch {
      return { success: false, message: 'ইনভ্যালিড ব্যাকআপ ফাইল ফরম্যাট' };
    }
  };

  // Notification controls
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Staff & Admin Authentication Actions
  const authLogin = (userToLogin: AuthUser) => {
    const fullUser: AuthUser = {
      ...userToLogin,
      email: userToLogin.email || `${userToLogin.username}@phonesellpro.com`
    };
    setCurrentUser(fullUser);
    saveToLocal('phonesell_auth_user', fullUser);
    if (fullUser.branch && fullUser.branch !== 'ALL') {
      setBranchState(fullUser.branch);
    }
  };

  const authLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.warn('Logout error:', err);
    }
    setCurrentUser(null);
    setUser(null);
    localStorage.removeItem('phonesell_auth_user');
    setProducts([]);
    setSales([]);
    setInstallments([]);
    setReturns([]);
    setSuppliers([]);
    setPurchases([]);
    setRepairs([]);
    setExpenses([]);
    setCustomerProfiles([]);
    setDevices([]);
    setUsedBuys([]);
    setStaff([]);
    setAccounts([]);
    setJournalEntries([]);
    setSmsLogs([]);
    setChatMessages([]);
    setSettings(DEFAULT_SETTINGS);
    setCart([]);
    setDeviceCredits(0);
  };

  // Google sign in with pure Firebase Auth
  const loginGoogle = async () => {
    try {
      const fbUser = await loginWithGoogle();
      if (!fbUser) return;
      if (fbUser.email) {
        const authU: AuthUser = {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email.split('@')[0],
          username: fbUser.email.split('@')[0],
          email: fbUser.email,
          role: 'SUPER_ADMIN',
          branch: 'ALL',
          phone: fbUser.phoneNumber || '',
          securityPin: '',
          avatar: fbUser.photoURL || undefined,
          lastLogin: new Date().toISOString()
        };
        authLogin(authU);
      }
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        return;
      }
      console.warn('Google login dismissed or failed:', err?.message || err);
    }
  };

  // Email and password login with pure Firebase Auth (zero fake mock user bypass)
  const loginEmail = async (emailStr: string, passStr: string) => {
    const trimmed = emailStr.trim().toLowerCase();
    const fbUser = await loginWithEmail(trimmed, passStr);
    if (fbUser && fbUser.email) {
      const authU: AuthUser = {
        id: fbUser.uid,
        name: fbUser.displayName || fbUser.email.split('@')[0],
        username: fbUser.email.split('@')[0],
        email: fbUser.email,
        role: 'SUPER_ADMIN',
        branch: 'ALL',
        phone: fbUser.phoneNumber || '',
        securityPin: '',
        avatar: fbUser.photoURL || undefined,
        lastLogin: new Date().toISOString()
      };
      authLogin(authU);
    }
  };

  // Register with email and password with pure Firebase Auth
  const registerEmail = async (emailStr: string, passStr: string, nameStr?: string) => {
    const trimmed = emailStr.trim().toLowerCase();
    const fbUser = await registerWithEmail(trimmed, passStr, nameStr);
    if (fbUser && fbUser.email) {
      const authU: AuthUser = {
        id: fbUser.uid,
        name: nameStr || fbUser.displayName || fbUser.email.split('@')[0],
        username: fbUser.email.split('@')[0],
        email: fbUser.email,
        role: 'SUPER_ADMIN',
        branch: 'ALL',
        phone: fbUser.phoneNumber || '',
        securityPin: '',
        avatar: fbUser.photoURL || undefined,
        lastLogin: new Date().toISOString()
      };
      authLogin(authU);
    }
  };

  const login = loginGoogle;
  const logout = authLogout;

  // Dynamic Branch List & Management
  const branches: BranchInfo[] = (settings.branches && settings.branches.length > 0)
    ? settings.branches
    : [
        { id: 'BP-ISHWARGONJ', name: 'ঈশ্বরগঞ্জ ব্রাঞ্চ (BP-ISHWARGONJ)', address: 'ঈশ্বরগঞ্জ বাজার, ময়মনসিংহ', phone: '+8801700000001', isDefault: true },
        { id: 'BP-MYMENSINGH', name: 'ময়মনসিংহ ব্রাঞ্চ (BP-MYMENSINGH)', address: 'গাঙ্গিনার পাড়, ময়মনসিংহ', phone: '+8801700000002' }
      ];

  // Branch switcher
  const setBranch = (newBranch: Branch) => {
    setBranchState(newBranch);
    saveToLocal(STORAGE_KEYS.BRANCH, newBranch);
  };

  const addBranch = (newBranch: BranchInfo) => {
    const ownerId = user?.uid || currentUser?.id || '';
    const updatedBranches = [...branches.filter(b => b.id !== newBranch.id), newBranch];
    const newSettings = { ...settings, branches: updatedBranches };
    setSettings(newSettings);
    if (ownerId) saveSettingsToFirestore(newSettings, ownerId);
  };

  const updateBranch = (branchId: string, updates: Partial<BranchInfo>) => {
    const ownerId = user?.uid || currentUser?.id || '';
    const updatedBranches = branches.map(b => b.id === branchId ? { ...b, ...updates } : b);
    const newSettings = { ...settings, branches: updatedBranches };
    setSettings(newSettings);
    if (ownerId) saveSettingsToFirestore(newSettings, ownerId);
  };

  const deleteBranch = (branchId: string) => {
    const ownerId = user?.uid || currentUser?.id || '';
    const updatedBranches = branches.filter(b => b.id !== branchId);
    const newSettings = { ...settings, branches: updatedBranches };
    setSettings(newSettings);
    if (branch === branchId && updatedBranches.length > 0) {
      setBranch(updatedBranches[0].id);
    }
    if (ownerId) saveSettingsToFirestore(newSettings, ownerId);
  };

  const loginStaff = async (phoneOrUsername: string, pin: string): Promise<{ success: boolean; message: string }> => {
    const cleanInput = phoneOrUsername.trim().toLowerCase();
    const cleanPin = pin.trim();
    
    const foundStaff = staff.find(s => 
      s.active && 
      (s.phone.replace(/[^0-9]/g, '') === cleanInput.replace(/[^0-9]/g, '') ||
       s.name.toLowerCase() === cleanInput ||
       s.phone === cleanInput)
    );

    if (!foundStaff) {
      return { 
        success: false, 
        message: lang === 'bn' ? 'স্টাফ অ্যাকাউন্ট পাওয়া যায়নি বা এটি নিষ্ক্রিয় আছে।' : 'Staff account not found or inactive.' 
      };
    }

    if (foundStaff.pin && foundStaff.pin !== cleanPin) {
      return { 
        success: false, 
        message: lang === 'bn' ? 'ভুল সিকিউরিটি পিন! সঠিক ৪-ডিজিট পিন দিন।' : 'Incorrect security PIN. Please enter correct 4-digit PIN.' 
      };
    }

    const roleMap: Record<StaffMember['role'], UserRole> = {
      'Manager': 'BRANCH_MANAGER',
      'Sales Executive': 'SALES_CASHIER',
      'Technician': 'TECH_OPERATOR',
      'Accountant': 'BRANCH_MANAGER'
    };

    const authU: AuthUser = {
      id: foundStaff.id,
      name: foundStaff.name,
      username: foundStaff.phone,
      email: `${foundStaff.phone.replace(/[^0-9]/g, '') || 'staff'}@phonesellpro.com`,
      role: roleMap[foundStaff.role] || 'SALES_CASHIER',
      branch: foundStaff.branch,
      phone: foundStaff.phone,
      securityPin: foundStaff.pin || '',
      lastLogin: new Date().toISOString()
    };

    authLogin(authU);
    return { success: true, message: lang === 'bn' ? 'সফলভাবে লগইন হয়েছে!' : 'Logged in successfully!' };
  };

  // Favourites Menu Shortcuts
  const toggleFavourite = (tabKey: string) => {
    setFavourites(prev => {
      const next = prev.includes(tabKey) ? prev.filter(k => k !== tabKey) : [...prev, tabKey];
      saveToLocal(STORAGE_KEYS.FAVOURITES, next);
      return next;
    });
  };

  // Enterprise Locker & Device Control - Direct Firebase Firestore Persistence
  const addDevice = (deviceData: Omit<Device, 'id' | 'ownerId' | 'enrolledAt' | 'lastSyncAt'>): Device => {
    const ownerId = user?.uid || currentUser?.id || '';
    const newDevice: Device = {
      ...deviceData,
      id: `DEV-${Date.now().toString().slice(-4)}`,
      ownerId,
      enrolledAt: new Date().toISOString().split('T')[0],
      lastSyncAt: 'Just now'
    };
    setDevices(prev => [newDevice, ...prev]);
    if (ownerId) saveDocToFirestore('devices', newDevice, ownerId);
    setDeviceCredits(c => {
      const next = Math.max(0, c - 1);
      if (ownerId) saveSettingsToFirestore({ ...settings, deviceCredits: next }, ownerId);
      return next;
    });
    return newDevice;
  };

  const updateDevice = (id: string, updates: Partial<Device>) => {
    const ownerId = user?.uid || currentUser?.id || '';
    setDevices(prev => prev.map(d => {
      if (d.id === id) {
        const updated = { ...d, ...updates };
        if (ownerId) saveDocToFirestore('devices', updated, ownerId);
        return updated;
      }
      return d;
    }));
  };

  const deleteDevice = (id: string) => {
    setDevices(prev => prev.filter(d => d.id !== id));
    deleteDocFromFirestore('devices', id);
  };

  const toggleDeviceLock = (deviceId: string, reason?: string) => {
    const ownerId = user?.uid || currentUser?.id || '';
    setDevices(prev => prev.map(d => {
      if (d.id === deviceId) {
        const newStatus: 'LOCKED' | 'UNLOCKED' = d.lockStatus === 'LOCKED' ? 'UNLOCKED' : 'LOCKED';
        const newFinance: 'RESTRICTED' | 'ACTIVE' = newStatus === 'LOCKED' ? 'RESTRICTED' : 'ACTIVE';
        const newCommand: any = {
          id: `CMD-${Date.now()}`,
          command: newStatus === 'LOCKED' ? 'LOCK_DEVICE (FREEZE)' : 'RESTORE_DEVICE (UNLOCK)',
          status: 'COMPLETED',
          issuedBy: 'ADMIN',
          reason: reason || 'Manual action from dashboard',
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
        const updated: Device = {
          ...d,
          lockStatus: newStatus,
          financeStatus: newFinance,
          commandHistory: [newCommand, ...(d.commandHistory || [])]
        };
        if (ownerId) saveDocToFirestore('devices', updated, ownerId);
        return updated;
      }
      return d;
    }));
  };

  const issueDeviceCommand = (deviceId: string, command: string, reason?: string) => {
    const ownerId = user?.uid || currentUser?.id || '';
    setDevices(prev => prev.map(d => {
      if (d.id === deviceId) {
        const newCommand: any = {
          id: `CMD-${Date.now()}`,
          command,
          status: 'COMPLETED',
          issuedBy: 'ADMIN',
          reason: reason || 'User requested',
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
        let extraUpdates: Partial<Device> = {};
        if (command === 'LOCATE') {
          extraUpdates = { lastSyncAt: 'Just now' };
        } else if (command === 'MARK_LOST') {
          extraUpdates = { isLost: true, lockStatus: 'LOCKED', financeStatus: 'RESTRICTED' };
        } else if (command === 'RELEASE_DEVICE') {
          extraUpdates = { managementStatus: 'UNENROLLED', financeStatus: 'COMPLETED', lockStatus: 'UNLOCKED' };
        }
        const updated: Device = {
          ...d,
          ...extraUpdates,
          commandHistory: [newCommand, ...(d.commandHistory || [])]
        };
        if (ownerId) saveDocToFirestore('devices', updated, ownerId);
        return updated;
      }
      return d;
    }));
  };

  const generateOfflineCodes = (deviceId: string): [string, string] => {
    const code1 = Math.floor(100000 + Math.random() * 900000).toString();
    const code2 = Math.floor(100000 + Math.random() * 900000).toString();
    const newCodes: [string, string] = [code1, code2];
    updateDevice(deviceId, { offlineCodes: newCodes });
    return newCodes;
  };

  const addDeviceCredits = (count: number) => {
    const ownerId = user?.uid || currentUser?.id || '';
    setDeviceCredits(c => {
      const next = c + count;
      if (ownerId) saveSettingsToFirestore({ ...settings, deviceCredits: next }, ownerId);
      return next;
    });
  };

  // Used Buy (পুরনো ফোন কেনা) - Direct Firebase Firestore Persistence
  const addUsedBuy = (record: Omit<UsedBuyRecord, 'id' | 'ownerId' | 'createdAt'>): UsedBuyRecord => {
    const ownerId = user?.uid || currentUser?.id || '';
    const newRecord: UsedBuyRecord = {
      ...record,
      id: `UB-${Date.now()}`,
      ownerId,
      createdAt: new Date().toISOString()
    };
    setUsedBuys(prev => [newRecord, ...prev]);
    if (ownerId) saveDocToFirestore('used_buys', newRecord, ownerId);
    return newRecord;
  };

  const deleteUsedBuy = (id: string) => {
    setUsedBuys(prev => prev.filter(b => b.id !== id));
    deleteDocFromFirestore('used_buys', id);
  };

  // Staff Management - Direct Firebase Firestore Persistence
  const addStaff = (member: Omit<StaffMember, 'id' | 'ownerId'>) => {
    const ownerId = user?.uid || currentUser?.id || '';
    const newMember: StaffMember = {
      ...member,
      id: `STF-${Date.now()}`,
      ownerId
    };
    setStaff(prev => [...prev, newMember]);
    if (ownerId) saveDocToFirestore('staff', newMember, ownerId);
  };

  const toggleStaffStatus = (id: string) => {
    const ownerId = user?.uid || currentUser?.id || '';
    setStaff(prev => prev.map(s => {
      if (s.id === id) {
        const updated = { ...s, active: !s.active };
        if (ownerId) saveDocToFirestore('staff', updated, ownerId);
        return updated;
      }
      return s;
    }));
  };

  // Accounting & Journal - Direct Firebase Firestore Persistence
  const addJournalEntry = (entry: Omit<JournalTransaction, 'id'>) => {
    const ownerId = user?.uid || currentUser?.id || '';
    const newEntry: JournalTransaction = {
      ...entry,
      id: `JRN-${Date.now()}`
    };
    setJournalEntries(prev => [newEntry, ...prev]);
    if (ownerId) saveDocToFirestore('journal', newEntry, ownerId);
  };

  // SMS System - Direct Firebase Firestore Persistence
  const sendSms = (phone: string, recipientName: string, message: string, type: SMSLog['type'] = 'CUSTOM') => {
    const ownerId = user?.uid || currentUser?.id || '';
    const newLog: SMSLog = {
      id: `SMS-${Date.now()}`,
      phone,
      recipientName,
      message,
      type,
      status: 'DELIVERED',
      timestamp: 'Just now'
    };
    setSmsLogs(prev => [newLog, ...prev]);
    if (ownerId) saveDocToFirestore('sms_logs', newLog, ownerId);
    return { success: true, message: 'SMS delivered successfully via Gateway' };
  };

  // Support Chat - Direct Firebase Firestore Persistence
  const sendChatMessage = (text: string, sender: 'shop' | 'customer' = 'shop', customerPhone: string = '01712345678') => {
    const ownerId = user?.uid || currentUser?.id || '';
    const newMsg: ChatMessage = {
      id: `CH-${Date.now()}`,
      sender,
      senderName: sender === 'shop' ? 'Shop Admin' : 'Customer',
      customerPhone,
      text,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      read: true
    };
    setChatMessages(prev => [...prev, newMsg]);
    if (ownerId) saveDocToFirestore('chat_messages', newMsg, ownerId);
  };

  // Void Sale
  const voidSale = (saleId: string, reason: string = 'Voided by Admin') => {
    const ownerId = user?.uid || currentUser?.id || '';
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return { success: false, message: 'Sale not found' };
    if (sale.status === 'cancelled') return { success: false, message: 'Sale is already voided' };

    sale.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        updateProduct(prod.id, { stock: prod.stock + item.quantity });
      }
    });

    const updatedSale: Sale = {
      ...sale,
      status: 'cancelled' as any,
      paymentStatus: 'cancelled' as any,
      cancelReason: reason,
      cancelledAt: new Date().toISOString()
    };

    setSales(prev => prev.map(s => s.id === saleId ? updatedSale : s));
    if (ownerId) saveDocToFirestore('sales', updatedSale, ownerId);

    return { success: true, message: 'Sale voided and stock restored successfully' };
  };

  // Parked Carts
  const parkCurrentCart = (customerName: string = 'Walk-in Customer', note: string = '') => {
    if (cart.length === 0) return;
    const total = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity - item.discount), 0);
    const newPark: ParkedCart = {
      id: `PARK-${Date.now()}`,
      cart: [...cart],
      customerName,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      note,
      total
    };
    setParkedCarts(prev => [newPark, ...prev]);
    clearCart();
  };

  const restoreParkedCart = (id: string) => {
    const parked = parkedCarts.find(p => p.id === id);
    if (!parked) return;
    setCart(parked.cart);
    setParkedCarts(prev => prev.filter(p => p.id !== id));
  };

  const deleteParkedCart = (id: string) => {
    setParkedCarts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <AppContext.Provider value={{
      products,
      categories,
      sales,
      installments,
      returns,
      suppliers,
      purchases,
      repairs,
      expenses,
      settings,
      notifications,
      cart,
      activeTab,
      lang,
      isOnline,
      isSyncing,
      pendingSyncCount,
      user,
      authLoading,
      lastInvoice,
      showInvoiceModal,
      lastMoneyReceipt,
      showMoneyReceiptModal,
      setActiveTab,
      setLang,
      t,
      formatCurrency,
      exportToCsv,
      addToCart,
      updateCartItemQty,
      removeFromCart,
      clearCart,
      setCartItemSerials,
      completeCheckout,
      setShowInvoiceModal,
      setLastInvoice,
      setShowMoneyReceiptModal,
      setLastMoneyReceipt,
      voidSale,
      parkedCarts,
      parkCurrentCart,
      restoreParkedCart,
      deleteParkedCart,
      branch,
      setBranch,
      branches,
      addBranch,
      updateBranch,
      deleteBranch,
      devices,
      addDevice,
      updateDevice,
      deleteDevice,
      toggleDeviceLock,
      issueDeviceCommand,
      generateOfflineCodes,
      deviceCredits,
      addDeviceCredits,
      usedBuys,
      addUsedBuy,
      deleteUsedBuy,
      staff,
      addStaff,
      toggleStaffStatus,
      accounts,
      journalEntries,
      addJournalEntry,
      smsLogs,
      sendSms,
      chatMessages,
      sendChatMessage,
      favourites,
      toggleFavourite,
      addProduct,
      updateProduct,
      deleteProduct,
      addCategory,
      updateCategory,
      deleteCategory,
      addSupplier,
      updateSupplier,
      deleteSupplier,
      recordSupplierPayment,
      addPurchase,
      addRepairTicket,
      updateRepairStatus,
      deleteRepairTicket,
      addExpense,
      deleteExpense,
      customerProfiles,
      updateCustomerCreditProfile,
      recordInstallmentPayment,
      recordInstallmentPartialPayment,
      recordInstallmentSmartPayment,
      reverseInstallmentPayment,
      collectDuePayment,
      collectDuePaymentAdvanced,
      addInstallmentFollowUp,
      addSaleFollowUp,
      addReturnClaim,
      updateClaimStatus,
      updateSettings,
      syncNow,
      downloadBackup,
      restoreBackup,
      markNotificationRead,
      clearAllNotifications,
      login,
      logout,
      currentUser,
      activeEmail,
      authLogin,
      authLogout,
      loginGoogle,
      loginEmail,
      registerEmail,
      loginStaff
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
