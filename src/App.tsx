/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Navigation/Header';
import { Sidebar } from './components/Navigation/Sidebar';
import { BottomTabs } from './components/Navigation/BottomTabs';
import { HomeDashboard } from './components/Dashboard/HomeDashboard';
import { DeviceList } from './components/Locker/DeviceList';
import { LiveWall } from './components/Locker/LiveWall';
import { PosTerminal } from './components/POS/PosTerminal';
import { ProductList } from './components/Inventory/ProductList';
import { SalesHistory } from './components/Sales/SalesHistory';
import { EmiContractManager } from './components/EMI/EmiContractManager';
import { InstallmentDueManager } from './components/Installments/InstallmentDueManager';
import { CustomerManager } from './components/Customers/CustomerManager';
import { UsedBuyManager } from './components/UsedBuy/UsedBuyManager';
import { SupplierManager } from './components/Suppliers/SupplierManager';
import { RepairManager } from './components/Repairs/RepairManager';
import { ExpenseManager } from './components/Expenses/ExpenseManager';
import { AccountingManager } from './components/Accounting/AccountingManager';
import { WarrantyReturns } from './components/Warranty/WarrantyReturns';
import { ReportCenter80 } from './components/Reports/ReportCenter80';
import { SmsSystem } from './components/SMS/SmsSystem';
import { SupportChat } from './components/Chat/SupportChat';
import { StaffManager } from './components/Staff/StaffManager';
import { SettingsModal } from './components/Settings/SettingsModal';
import { InvoiceModal } from './components/POS/InvoiceModal';
import { MoneyReceiptModal } from './components/Installments/MoneyReceiptModal';
import { LoginScreen } from './components/Auth/LoginScreen';
import { Smartphone } from 'lucide-react';

// Error Boundary for Device Section
class DeviceErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error('DeviceErrorBoundary caught error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 p-8 flex flex-col items-center justify-center text-center bg-slate-50 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <Smartphone className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900">ডিভাইস সেকশন রিলোড করুন</h3>
          <p className="text-xs text-slate-500 max-w-md">
            ডিভাইস ডেটা সিঙ্ক করার সময় কোনো ত্রুটি হয়েছে। নিচের বোতামে চাপ দিয়ে ডিফল্ট ফ্লিট ডেটা রিস্টোর করুন।
          </p>
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs cursor-pointer"
          >
            পুনরায় লোড করুন
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  const { 
    activeTab, 
    lastInvoice, 
    showInvoiceModal, 
    setShowInvoiceModal,
    currentUser,
    authLogin,
    lang,
    setLang,
    lastMoneyReceipt
  } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // If user is not authenticated, show professional Login Screen
  if (!currentUser) {
    return (
      <LoginScreen 
        onLoginSuccess={authLogin}
        lang={lang}
        onToggleLang={() => setLang(lang === 'bn' ? 'en' : 'bn')}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100 font-sans">
      {/* Top Header Bar */}
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main Screen Body with Sidebar & Dynamic View */}
      <div className={`flex-1 flex overflow-hidden ${(showInvoiceModal || !!lastMoneyReceipt) ? 'print:hidden' : ''}`}>
        {/* Sidebar */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 flex overflow-hidden pb-[60px] lg:pb-0 relative">
          {activeTab === 'home' && <HomeDashboard />}
          {activeTab === 'devices' && (
            <DeviceErrorBoundary>
              <DeviceList />
            </DeviceErrorBoundary>
          )}
          {activeTab === 'livewall' && <LiveWall />}
          {activeTab === 'pos' && <PosTerminal />}
          {activeTab === 'sales' && <SalesHistory />}
          {activeTab === 'contracts' && <EmiContractManager />}
          {activeTab === 'installments' && <InstallmentDueManager />}
          {activeTab === 'customers' && <CustomerManager />}
          {activeTab === 'inventory' && <ProductList />}
          {activeTab === 'usedbuy' && <UsedBuyManager />}
          {activeTab === 'suppliers' && <SupplierManager />}
          {activeTab === 'repairs' && <RepairManager />}
          {activeTab === 'expenses' && <ExpenseManager />}
          {activeTab === 'accounting' && <AccountingManager />}
          {activeTab === 'warranty' && <WarrantyReturns />}
          {activeTab === 'reports' && <ReportCenter80 />}
          {activeTab === 'sms' && <SmsSystem />}
          {activeTab === 'chat' && <SupportChat />}
          {activeTab === 'staff' && <StaffManager />}
          {activeTab === 'settings' && <SettingsModal />}
        </main>
      </div>

      {/* Mobile 5-Tab Fixed Bottom Navigation */}
      <BottomTabs onOpenMenu={() => setIsSidebarOpen(true)} />

      {/* App Bottom Footer Bar (Desktop only) */}
      <footer className="bg-white border-t border-slate-200 px-4 py-1.5 text-xs text-slate-500 hidden lg:flex items-center justify-between shrink-0 select-none z-10 print:hidden">
        <div className="flex items-center gap-2 text-[11px]">
          <span className="font-semibold text-slate-700">PhoneSell Pro Enterprise</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500">মোবাইল ফাইন্যান্সিং, ক্লাউড লকার ও ইআরপি প্ল্যাটফর্ম</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-slate-600">MDM Security:</span>
          <span className="font-mono text-emerald-600 font-bold">256-bit Encrypted DO Tunnel Active</span>
        </div>
      </footer>

      {/* Global Invoice Preview Modal */}
      <InvoiceModal
        sale={lastInvoice}
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
      />

      {/* Global Money Receipt Modal */}
      <MoneyReceiptModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
