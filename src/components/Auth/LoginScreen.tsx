import React, { useState } from 'react';
import { 
  Smartphone, 
  Lock, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  KeyRound, 
  Mail, 
  Globe,
  LogIn
} from 'lucide-react';
import { AuthUser } from '../../types';
import { loginWithGoogle, loginWithEmail, registerWithEmail } from '../../services/firebase';

interface LoginScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
  lang?: 'en' | 'bn';
  onToggleLang?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ 
  onLoginSuccess, 
  lang = 'bn', 
  onToggleLang 
}) => {
  const [activeAuthTab, setActiveAuthTab] = useState<'google' | 'email'>('google');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Email/Password Form States
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle Google Login
  const handleGoogleLogin = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const fbUser = await loginWithGoogle();
      if (!fbUser) {
        // User closed or dismissed the popup
        return;
      }
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
        onLoginSuccess(authU);
      }
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        return;
      }
      setError(
        lang === 'bn' 
          ? 'গুগল সাইন-ইন ব্যর্থ হয়েছে। ইন্টারনেট সংযোগ চেক করুন অথবা ইমেইল ও পাসওয়ার্ড দিয়ে সাইন ইন করুন।' 
          : 'Google Sign-In failed. Please check your connection or use Email & Password.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Email Sign In or Registration with Firebase Auth
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError(lang === 'bn' ? 'সঠিক ইমেইল এড্রেস লিখুন' : 'Please enter a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      setError(lang === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' : 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    if (isRegisterMode) {
      try {
        const fbUser = await registerWithEmail(cleanEmail, password, fullName.trim() || undefined);
        if (fbUser && fbUser.email) {
          const authU: AuthUser = {
            id: fbUser.uid,
            name: fullName.trim() || fbUser.displayName || cleanEmail.split('@')[0],
            username: cleanEmail.split('@')[0],
            email: fbUser.email,
            role: 'SUPER_ADMIN',
            branch: 'ALL',
            phone: '',
            securityPin: '',
            lastLogin: new Date().toISOString()
          };
          onLoginSuccess(authU);
        }
      } catch (err: any) {
        console.error('Firebase registration error:', err);
        if (err?.code === 'auth/email-already-in-use') {
          setError(lang === 'bn' ? 'এই ইমেইল দিয়ে ইতিপূর্বে অ্যাকাউন্ট খোলা হয়েছে। সাইন ইন করুন।' : 'Email is already in use. Please sign in.');
        } else if (err?.code === 'auth/weak-password') {
          setError(lang === 'bn' ? 'পাসওয়ার্ড আরও শক্তিশালী দিন (কমপক্ষে ৬ অক্ষর)।' : 'Password is too weak.');
        } else {
          setError(err?.message || (lang === 'bn' ? 'অ্যাকাউন্ট তৈরি করা যায়নি।' : 'Registration failed.'));
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        const fbUser = await loginWithEmail(cleanEmail, password);
        if (fbUser && fbUser.email) {
          const authU: AuthUser = {
            id: fbUser.uid,
            name: fbUser.displayName || cleanEmail.split('@')[0],
            username: cleanEmail.split('@')[0],
            email: fbUser.email,
            role: 'SUPER_ADMIN',
            branch: 'ALL',
            phone: fbUser.phoneNumber || '',
            securityPin: '',
            avatar: fbUser.photoURL || undefined,
            lastLogin: new Date().toISOString()
          };
          onLoginSuccess(authU);
        }
      } catch (err: any) {
        console.error('Firebase sign-in error:', err);
        if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
          setError(lang === 'bn' ? 'ভুল ইমেইল বা পাসওয়ার্ড। নতুন অ্যাকাউন্ট হলে "নতুন অ্যাকাউন্ট তৈরি করুন" সিলেক্ট করুন।' : 'Invalid credentials. Create an account if you are new.');
        } else if (err?.code === 'auth/wrong-password') {
          setError(lang === 'bn' ? 'ভুল পাসওয়ার্ড। আবার চেষ্টা করুন।' : 'Wrong password. Please try again.');
        } else {
          setError(err?.message || (lang === 'bn' ? 'লগইন ব্যর্থ হয়েছে।' : 'Sign-in failed.'));
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-600 selection:text-white relative overflow-hidden font-sans">
      
      {/* Background Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Top Header */}
      <header className="p-4 sm:p-6 flex items-center justify-between relative z-10 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="font-black text-base sm:text-lg tracking-tight text-white flex items-center gap-2">
              <span>PhoneSell PRO</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                FIREBASE CLOUD
              </span>
            </div>
            <div className="text-[11px] text-slate-400">১০০% ফায়ারবেজ ক্লাউড অথেনটিকেশন ও ডাটাবেজ</div>
          </div>
        </div>

        {onToggleLang && (
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 transition cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>
        )}
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10 my-3">
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-5">
          
          {/* Header Title */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'ফায়ারবেজ ক্লাউড সুরক্ষিত' : 'Firebase Cloud Secured'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {lang === 'bn' ? 'ফায়ারবেজে সাইন ইন করুন' : 'Sign In with Firebase'}
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'bn' 
                ? 'আপনার নিজস্ব জিমেইল বা ইমেইল অ্যাকাউন্ট দিয়ে প্রবেশ করুন' 
                : 'Authenticate with your official Google or email account'}
            </p>
          </div>

          {/* Pure Firebase Live Cloud Notice */}
          <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-3 text-[11px] text-indigo-200 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-white block mb-0.5">
                {lang === 'bn' ? 'লাইভ ফায়ারবেজ ডাটাবেজ' : 'Live Firebase Database'}
              </span>
              {lang === 'bn'
                ? 'এখানে কোনো ডেমো বা লোকাল ডামি ডাটা নেই। আপনি যা এন্ট্রি করবেন তা সরাসরি আপনার অ্যাকাউন্টের ফায়ারবেজ ফায়ারস্টোরে সংরক্ষিত হবে।'
                : 'Zero mock/demo data. All entries are stored directly in your private Firebase Firestore database.'}
            </div>
          </div>

          {/* Auth Mode Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setActiveAuthTab('google'); setError(null); }}
              className={`py-2 rounded-lg transition text-center cursor-pointer ${
                activeAuthTab === 'google' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Google দিয়ে সাইন ইন
            </button>
            <button
              type="button"
              onClick={() => { setActiveAuthTab('email'); setError(null); }}
              className={`py-2 rounded-lg transition text-center cursor-pointer ${
                activeAuthTab === 'email' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ইমেইল ও পাসওয়ার্ড
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 p-3 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 p-3 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: GOOGLE 1-CLICK SIGN IN */}
          {activeAuthTab === 'google' && (
            <div className="space-y-4 pt-1 animate-in fade-in">
              <div className="text-center py-2 space-y-1">
                <p className="text-xs text-slate-300 leading-relaxed">
                  {lang === 'bn'
                    ? 'আপনার গুগল জিমেইল (Gmail) অ্যাকাউন্ট দিয়ে সরাসরি ফায়ারবেজে সাইন ইন করুন।'
                    : 'Sign in directly to Firebase with your authorized Google Gmail account.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-extrabold rounded-2xl shadow-xl flex items-center justify-center gap-3 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span className="text-sm">
                  {lang === 'bn' ? 'Google দিয়ে সাইন ইন করুন' : 'Continue with Google'}
                </span>
              </button>
            </div>
          )}

          {/* TAB 2: EMAIL & PASSWORD (LOGIN / REGISTER) */}
          {activeAuthTab === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-3.5 pt-1 animate-in fade-in">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-xs">
                <span className="text-slate-400">
                  {isRegisterMode ? (lang === 'bn' ? 'নতুন ফায়ারবেজ অ্যাকাউন্ট' : 'New Firebase Account') : (lang === 'bn' ? 'ফায়ারবেজ সাইন ইন' : 'Firebase Sign In')}
                </span>
                <button
                  type="button"
                  onClick={() => { setIsRegisterMode(!isRegisterMode); setError(null); }}
                  className="text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
                >
                  {isRegisterMode 
                    ? (lang === 'bn' ? 'আগে থেকেই অ্যাকাউন্ট আছে? সাইন ইন' : 'Have an account? Sign In') 
                    : (lang === 'bn' ? '+ নতুন অ্যাকাউন্ট তৈরি করুন' : '+ Create Account')}
                </button>
              </div>

              {/* Full Name (if registering) */}
              {isRegisterMode && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">
                    {lang === 'bn' ? 'আপনার নাম' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. Shop Owner"
                      className="w-full pl-10 pr-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>{lang === 'bn' ? 'ইমেইল এড্রেস *' : 'Email Address *'}</span>
                  <span className="text-[10px] text-slate-500">e.g. maraju921@gmail.com</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full pl-10 pr-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-mono"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>{lang === 'bn' ? 'পাসওয়ার্ড *' : 'Password *'}</span>
                  <span className="text-[10px] text-slate-500">Min 6 characters</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer text-sm"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>
                      {isRegisterMode 
                        ? (lang === 'bn' ? 'ফায়ারবেজে অ্যাকাউন্ট খুলুন' : 'Register with Firebase') 
                        : (lang === 'bn' ? 'লগইন করুন' : 'Sign In')}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

        </div>
      </main>

      {/* Footer Security Badges */}
      <footer className="p-4 text-center text-xs text-slate-500 relative z-10 border-t border-slate-900">
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Google Firebase Authentication</span>
          </span>
          <span className="text-slate-700">•</span>
          <span>Cloud Firestore Realtime Multi-Tenant</span>
          <span className="text-slate-700">•</span>
          <span>Zero Mock Data</span>
        </div>
      </footer>

    </div>
  );
};
