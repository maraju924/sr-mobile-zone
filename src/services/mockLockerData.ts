import { Device, UsedBuyRecord, SMSLog, ChatMessage, StaffMember, AccountEntry, JournalTransaction } from '../types';

// Zero Mock/Demo Data - 100% Pure Firebase
export const INITIAL_DEVICES: Device[] = [];
export const INITIAL_USED_BUYS: UsedBuyRecord[] = [];
export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'STF-ADMIN-01',
    ownerId: 'nzkkjimuewak3uwtcztzkbq7j1s2',
    name: 'এডমিন কর্মকর্তা (Admin)',
    phone: '01700000001',
    role: 'Admin',
    salary: 35000,
    salesCommissionPercent: 2.0,
    pin: '1234',
    branch: 'BP-ISHWARGONJ',
    active: true,
    joinedDate: '2025-01-01'
  },
  {
    id: 'STF-SALES-02',
    ownerId: 'nzkkjimuewak3uwtcztzkbq7j1s2',
    name: 'সাকিব আহমেদ (Sales)',
    phone: '01700000002',
    role: 'Sales Executive',
    salary: 18000,
    salesCommissionPercent: 1.5,
    pin: '1234',
    branch: 'BP-ISHWARGONJ',
    active: true,
    joinedDate: '2025-02-15'
  },
  {
    id: 'STF-MGR-03',
    ownerId: 'nzkkjimuewak3uwtcztzkbq7j1s2',
    name: 'তানভীর হাসান (Manager)',
    phone: '01700000003',
    role: 'Manager',
    salary: 25000,
    salesCommissionPercent: 1.0,
    pin: '1234',
    branch: 'BP-MYMENSINGH',
    active: true,
    joinedDate: '2025-01-10'
  }
];
export const INITIAL_ACCOUNTS: AccountEntry[] = [];
export const INITIAL_JOURNAL: JournalTransaction[] = [];
export const INITIAL_SMS_LOGS: SMSLog[] = [];
export const INITIAL_CHAT: ChatMessage[] = [];

// Standard Functional SMS Text Message Templates (not database mock data)
export const SMS_TEMPLATES = [
  { 
    id: 't1', 
    title: 'কিস্তির বকেয়া তাগাদা (EMI Due Reminder)', 
    text: 'সম্মানিত গ্রাহক, আপনার চলতি মাসের ডিভাইসের কিস্তি পরিশোধের সময় হয়েছে। অনুগ্রহ করে নির্ধারিত সময়ের মধ্যে শপে এসে বা বিকাশ/নগদে পরিশোধ করুন।' 
  },
  { 
    id: 't2', 
    title: 'কিস্তি আদায় কনফার্মেশন (Payment Confirmation)', 
    text: 'ধন্যবাদ! আপনার কিস্তির টাকা সফলভাবে জমা হয়েছে। আপনার ডিজিটাল মানি রিসিট প্রস্তুত রয়েছে।' 
  },
  { 
    id: 't3', 
    title: 'পণ্য বিক্রয় ও ইনভয়েস ধন্যবাদ (Sale Invoice Thank You)', 
    text: 'PhoneSell PRO থেকে পণ্য ক্রয় করার জন্য আপনাকে আন্তরিক ধন্যবাদ। ওয়ারেন্টির জন্য ইনভয়েসটি যত্ন সহকারে সংরক্ষণ করুন।' 
  },
  { 
    id: 't4', 
    title: 'সার্ভিসিং ও মেরামত ডেলিভারি প্রস্তুত (Repair Ready)', 
    text: 'প্রিয় গ্রাহক, আপনার সার্ভিসিংয়ের জন্য রাখা হ্যান্ডসেটটি মেরামত সম্পন্ন হয়েছে। সার্ভিস টোকেন দেখিয়ে ডিভাইসটি শপ থেকে সংগ্রহ করুন।' 
  },
  { 
    id: 't5', 
    title: 'সিকিউরিটি এলার্ট ও লক নোটিশ (Device Lock Notice)', 
    text: 'সতর্কবার্তা: নির্ধারিত কিস্তি পরিশোধ না করায় আপনার ডিভাইসের সার্ভিস লক কার্যকর করা হয়েছে। আনলক করতে অবিলম্বে শোরুমে যোগাযোগ করুন।' 
  }
];
