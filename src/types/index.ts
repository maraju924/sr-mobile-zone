export interface Product {
  id: string;
  ownerId: string;
  name: string;
  brand: string;
  category: string;
  barcode: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  minStockAlert: number;
  warrantyMonths: number;
  serialNumbers?: string[];
  branch?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSerials: string[];
  unitPrice: number;
  discount: number;
  warrantyMonths: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  brand: string;
  category: string;
  quantity: number;
  unitPrice: number;
  purchasePrice: number;
  serialNumbers: string[];
  warrantyMonths: number;
  warrantyExpiryDate: string;
  total: number;
}

export type PaymentMethod = 'cash' | 'bkash' | 'nagad' | 'card' | 'due' | 'installment';
export type PaymentStatus = 'paid' | 'partial' | 'due' | 'cancelled' | 'refunded';
export type SaleType = 'regular' | 'installment';

export interface Sale {
  id: string;
  ownerId: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  saleType: SaleType;
  installmentId?: string;
  note?: string;
  branch?: string;
  dueDeadline?: string;
  creditTermDays?: number;
  followUps?: FollowUpLog[];
  status?: 'active' | 'cancelled' | 'refunded';
  cancelReason?: string;
  cancelledAt?: string;
  createdAt: string;
}

export interface FollowUpLog {
  id: string;
  date: string;
  note: string;
  promiseDate?: string;
  callOutcome?: 'will_pay' | 'requested_time' | 'phone_off' | 'disputed' | 'other';
  recordedBy?: string;
}

export interface CustomerCreditProfile {
  id: string;
  ownerId?: string;
  phone: string;
  name: string;
  creditLimit: number;
  riskRating: 'low' | 'medium' | 'high' | 'blacklisted';
  nidNumber?: string;
  address?: string;
  notes?: string;
  updatedAt?: string;
}

export interface InstallmentScheduleItem {
  id: string;
  installmentNo: number;
  dueDate: string;
  amount: number;
  paidDate?: string;
  paidAmount?: number;
  paymentMethod?: 'cash' | 'bkash' | 'nagad' | 'rocket' | 'bank' | 'split';
  trxId?: string;
  bankAccount?: string;
  lateFee?: number;
  waivedPenalty?: number;
  discountAmount?: number;
  collectedBy?: string;
  remainingOnInstallment?: number;
  isPaid: boolean;
  receiptNo?: string;
  note?: string;
  reversalReason?: string;
  reversedAt?: string;
}

export interface Installment {
  id: string;
  ownerId: string;
  saleId: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerNid?: string;
  customerFatherOrSpouse?: string;
  customerOccupation?: string;
  
  // Guarantor Info (Security for Hire Purchase)
  guarantorName?: string;
  guarantorPhone?: string;
  guarantorNid?: string;
  guarantorRelation?: string;
  guarantorAddress?: string;
  guarantor2Name?: string;
  guarantor2Phone?: string;
  guarantor2Relation?: string;

  productNameSummary: string;
  branch?: string;
  totalAmount: number;
  downPayment: number;
  remainingBalance: number;
  monthlyAmount: number;
  installmentCount: number;
  paidCount: number;
  status: 'active' | 'completed' | 'overdue' | 'foreclosed';
  schedule: InstallmentScheduleItem[];
  lateFeePerDay?: number;
  totalLateFeeAccrued?: number;
  totalWaivedPenalty?: number;
  earlySettlementDiscount?: number;
  followUps?: FollowUpLog[];
  createdAt: string;
}

export type ClaimType = 'return' | 'warranty_repair' | 'replacement';
export type ClaimStatus = 'pending' | 'under_inspection' | 'repaired' | 'replaced' | 'refunded' | 'rejected';

export interface ReturnClaim {
  id: string;
  ownerId: string;
  invoiceNumber: string;
  productId?: string;
  productName: string;
  serialNumber?: string;
  customerName: string;
  customerPhone: string;
  claimType: ClaimType;
  reason: string;
  refundAmount: number;
  status: ClaimStatus;
  notes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface BranchInfo {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  isDefault?: boolean;
}

export interface StoreSettings {
  ownerId: string;
  storeName: string;
  phone: string;
  address: string;
  vatPercent: number;
  currencySymbol: string;
  invoiceFooter: string;
  deviceCredits?: number;
  branches?: BranchInfo[];
  defaultLabelOrientation?: 'landscape' | 'portrait';
  defaultLabelPresetId?: string;
  smsGatewayApiKey?: string;
  smsGatewaySenderId?: string;
}

export interface NotificationItem {
  id: string;
  type: 'low_stock' | 'due_reminder' | 'warranty_alert' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionTab?: string;
}

export interface Supplier {
  id: string;
  ownerId: string;
  name: string;
  companyName: string;
  phone: string;
  email?: string;
  address: string;
  balanceDue: number;
  totalPurchased: number;
  totalPaid: number;
  createdAt: string;
  updatedAt?: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  serialNumbers?: string[];
}

export interface Purchase {
  id: string;
  ownerId: string;
  challanNumber: string;
  supplierId: string;
  supplierName: string;
  supplierPhone: string;
  items: PurchaseItem[];
  subtotal: number;
  additionalCost?: number;
  discount?: number;
  total: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: 'cash' | 'bank' | 'bkash' | 'nagad' | 'due';
  note?: string;
  purchaseDate: string;
  createdAt: string;
}

export interface SupplierPayment {
  id: string;
  ownerId: string;
  supplierId: string;
  supplierName: string;
  amount: number;
  paymentMethod: string;
  note?: string;
  date: string;
  createdAt: string;
}

export type RepairStatus = 'received' | 'diagnosing' | 'in_progress' | 'waiting_parts' | 'ready' | 'delivered' | 'cancelled';

export interface RepairTicket {
  id: string;
  ownerId: string;
  ticketNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  deviceType: string;
  deviceBrand: string;
  deviceModel: string;
  serialOrImei?: string;
  defectDescription: string;
  accessoriesReceived?: string;
  estimatedCost: number;
  advancePaid: number;
  finalCost?: number;
  dueAmount: number;
  technicianNotes?: string;
  status: RepairStatus;
  receivedDate: string;
  estimatedDeliveryDate: string;
  deliveredDate?: string;
  createdAt: string;
}

export type ExpenseCategory = 'rent' | 'electricity' | 'salary' | 'entertainment' | 'transport' | 'maintenance' | 'marketing' | 'other';

export interface Expense {
  id: string;
  ownerId: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  paymentMethod: 'cash' | 'bkash' | 'nagad' | 'bank';
  branch?: string;
  note?: string;
  date: string;
  createdAt: string;
}

export type ActiveTab = 
  | 'home' 
  | 'pos' 
  | 'devices' 
  | 'livewall' 
  | 'customers' 
  | 'contracts' 
  | 'installments'
  | 'sales' 
  | 'inventory' 
  | 'usedbuy' 
  | 'suppliers' 
  | 'repairs' 
  | 'expenses' 
  | 'accounting' 
  | 'warranty' 
  | 'reports' 
  | 'sms' 
  | 'chat' 
  | 'staff' 
  | 'settings';

export type Language = 'bn' | 'en';
export type Branch = string;

// --- Enterprise Locker & Device Models ---
export interface LocationPoint {
  id: string;
  lat: number;
  lng: number;
  accuracy: number;
  battery: number;
  source: 'agent' | 'network' | 'gps';
  timestamp: string;
}

export interface CallLog {
  id: string;
  number: string;
  name?: string;
  type: 'incoming' | 'outgoing' | 'missed';
  durationSec: number;
  timestamp: string;
}

export interface SecurityEvent {
  id: string;
  type: 'SIM_CHANGE' | 'TAMPER_DETECTED' | 'LOCATION_OFF' | 'APP_CONTROL_ATTEMPT' | 'OFFLINE_TOO_LONG' | 'BOOTLOADER_ACCESS';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details: string;
  timestamp: string;
  reviewed: boolean;
}

export interface CommandLog {
  id: string;
  command: string;
  status: 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
  issuedBy: string;
  reason?: string;
  timestamp: string;
  completedAt?: string;
}

export interface SimInfo {
  slot: number;
  operator: string;
  iccid: string;
  phoneNumber?: string;
  lastChangedAt?: string;
  simChangeHistory?: { previousIccid: string; newIccid: string; changedAt: string }[];
}

export interface Device {
  id: string;
  ownerId: string;
  branch: Branch;
  imei1: string;
  imei2?: string;
  brand: string;
  model: string;
  osVersion?: string;
  
  // Statuses
  liveStatus: 'online' | 'offline';
  financeStatus: 'ACTIVE' | 'RESTRICTED' | 'COMPLETED';
  managementStatus: 'ACTIVE' | 'UNENROLLED';
  lockStatus: 'LOCKED' | 'UNLOCKED';
  isLost?: boolean;

  // Customer linkage
  customerId?: string;
  customerName: string;
  customerPhone: string;
  contractId?: string;
  outstandingDue: number;

  // Telemetry & Hardware Info
  batteryPercent: number;
  currentLocation?: {
    lat: number;
    lng: number;
    accuracy: number;
    address?: string;
    updatedAt: string;
    locationServicesOn: boolean;
  };

  // Offline Unlock Security
  offlineCodes: [string, string];
  screenLockPin?: string;

  // Logs & History
  simInfo: SimInfo;
  securityEvents: SecurityEvent[];
  callLogs: CallLog[];
  locationHistory: LocationPoint[];
  commandHistory: CommandLog[];

  // Provisioning
  enrolledAt: string;
  lastSyncAt: string;
  qrExpiresAt?: string;
}

// --- Used Buy (পুরনো ফোন ক্রয় ও চুক্তিপত্র) ---
export interface InspectionChecklist {
  display: boolean;
  touch: boolean;
  camera: boolean;
  speaker: boolean;
  mic: boolean;
  wifi: boolean;
  sim: boolean;
  charging: boolean;
  buttons: boolean;
  icloudOrGoogleCleared: boolean;
  frpCleared: boolean;
  screenLockRemoved: boolean;
  boxIncluded: boolean;
  chargerIncluded: boolean;
  originalMatchesImei: boolean;
  glassCracked: boolean;
  repairedBefore: boolean;
  scratchNotes?: string;
}

export interface UsedBuyRecord {
  id: string;
  ownerId: string;
  branch: Branch;
  buyReceiptNo: string;
  date: string;
  
  // Seller KYC
  sellerName: string;
  sellerPhone: string;
  sellerAddress: string;
  idType: 'NID' | 'Passport' | 'Driving Licence' | 'Birth Certificate';
  idNumber: string;
  sellerConfirmedOwnership: boolean;
  sellerPhotoUrl?: string;
  nidFrontPhotoUrl?: string;

  // Phone Identifiers & Condition
  brand: string;
  model: string;
  color: string;
  storage: string;
  imei1: string;
  imei2?: string;
  condition: 'Used' | 'Refurbished' | 'New';
  grade: 'A+' | 'A' | 'B' | 'C';
  batteryHealthPercent: number;

  // Pricing
  buyPrice: number;
  estimatedResalePrice: number;
  paidFromAccount: string;

  // Technical Assessment
  inspection: InspectionChecklist;
  inspectionNotes?: string;
  agreementPrinted: boolean;
  createdAt: string;
}

// --- SMS System ---
export interface SMSLog {
  id: string;
  phone: string;
  recipientName: string;
  message: string;
  type: 'INSTALLMENT_REMINDER' | 'LOCK_WARNING' | 'PAYMENT_RECEIPT' | 'SECURITY_ALERT' | 'WELCOME' | 'CUSTOM';
  status: 'SENT' | 'DELIVERED' | 'FAILED';
  timestamp: string;
}

// --- Customer Support Chat ---
export interface ChatMessage {
  id: string;
  sender: 'customer' | 'shop';
  senderName: string;
  customerPhone: string;
  text: string;
  timestamp: string;
  read: boolean;
}

// --- Staff & Branch Management ---
export interface StaffMember {
  id: string;
  ownerId: string;
  branch: Branch;
  name: string;
  phone: string;
  role: 'Manager' | 'Sales Executive' | 'Technician' | 'Accountant';
  salary: number;
  salesCommissionPercent: number;
  pin?: string;
  active: boolean;
  joinedDate: string;
}

// --- Financial Accounting Models ---
export interface AccountEntry {
  id: string;
  accountName: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  balance: number;
  accountNumber?: string;
}

export interface JournalTransaction {
  id: string;
  date: string;
  referenceNo: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  branch: Branch;
}

// --- Authentication & Security Models ---
export type UserRole = 'SUPER_ADMIN' | 'BRANCH_MANAGER' | 'SALES_CASHIER' | 'TECH_OPERATOR';

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  branch: Branch | 'ALL';
  phone: string;
  email: string;
  securityPin: string;
  avatar?: string;
  lastLogin?: string;
}
