'use client';

import { useState } from 'react';
import { useFirebase } from '../FirebaseProvider';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function setRoleCookie(role: string) {
  try {
    const days = 7;
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `role=${encodeURIComponent(role)}; expires=${expires}; path=/; SameSite=Lax`;
  } catch { }
}

export default function AuthPage() {
  const { auth, firestore } = useFirebase();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('driver');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(firestore, 'users', user.uid), { role }, { merge: true });
      setRoleCookie(role);
      router.push(role === 'dispatcher' ? '/dispatcher/dashboard' : role === 'driver' ? '/driver/dashboard' : '/admin');
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(firestore, 'users', cred.user.uid));
      const roleDoc = snap.data() as { role?: string };
      const r = roleDoc?.role || 'driver';
      setRoleCookie(r);
      router.push(r === 'dispatcher' ? '/dispatcher/dashboard' : r === 'driver' ? '/driver/dashboard' : '/admin');
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {isSignUp ? 'Регистрация' : 'Вход в систему'}
          </h1>
          <p className="text-slate-600">
            Система управления автопарком для профессионалов
          </p>
        </div>

        {/* Форма */}
        <div className="card p-8">
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email адрес
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Пароль
              </label>
              <input
                id="password"
                type="password"
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isSignUp ? "new-password" : "current-password"}
              />
            </div>

            {/* Role (только для регистрации) */}
            {isSignUp && (
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-2">
                  Выберите роль
                </label>
                <select
                  id="role"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="driver">Водитель</option>
                  <option value="dispatcher">Диспетчер</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isSignUp ? 'Создаём аккаунт...' : 'Входим...'}
                </div>
              ) : (
                isSignUp ? 'Создать аккаунт' : 'Войти в систему'
              )}
            </button>
          </form>

          {/* Toggle between sign in and sign up */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {isSignUp
                ? 'Уже есть аккаунт? Войти'
                : 'Нет аккаунта? Зарегистрироваться'
              }
            </button>
          </div>
        </div>

        {/* Demo accounts info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Демо-аккаунты для тестирования:</h3>
          <div className="text-xs text-blue-700 space-y-1">
            <p>• Водитель: almaz.zh7@gmail.com / 12345678</p>
            <p>• Диспетчер: almaz.zh6@gmail.com / 12345678</p>
            <p>• Админ: almaz.zh5@gmail.com / 12345678</p>
          </div>
        </div>
      </div>
    </div>
  );
}
