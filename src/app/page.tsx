'use client';

import { useEffect, useState } from 'react';
import { useFirebase } from './FirebaseProvider';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { logActivity } from './actions'; // <--- 1. Импортируем наше действие
import { useLanguage } from './contexts/LanguageContext';
import { 
  FaTruck, 
  FaMapMarkerAlt, 
  FaComments, 
  FaChartBar, 
  FaBolt, 
  FaMobile, 
  FaBell, 
  FaExpand, 
  FaLink,
  FaSpinner
} from 'react-icons/fa';

export default function Page() {
  const { auth, firestore } = useFirebase();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('landing') === 'true') {
          setIsLoading(false);
          return;
        }
        
        const docRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const { role } = docSnap.data();

          // --- 2. Логируем активность перед редиректом ---
          await logActivity({
            user: user.email || 'Неизвестный пользователь',
            action: 'Вошел в систему',
            status: 'success'
          });
          // ----------------------------------------------

          router.push(`/${role}/dashboard`);
        } else {
          router.push('/auth');
        }
      } else {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, firestore, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
            <FaTruck className="w-8 h-8 text-white" />
          </div>
          <div className="relative">
            <FaSpinner className="w-12 h-12 text-blue-600 animate-spin" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-900 font-poppins">{t('landing.title')}</h2>
            <p className="text-slate-600">{t('landing.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl shadow-2xl">
                <FaTruck className="w-10 h-10 text-white" />
              </div>
            </div>
            
            {/* Main Title */}
            <h1 className="text-6xl md:text-7xl font-bold text-slate-900 mb-6 font-poppins">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t('landing.title')}
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              {t('landing.subtitle')}
            </p>
            
            {/* Description */}
            <p className="text-lg text-slate-500 mb-12 max-w-2xl mx-auto">
              {t('landing.description')}
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button 
                onClick={() => router.push('/auth')}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                {t('landing.startButton')}
              </button>
              <button className="px-8 py-4 bg-white text-blue-700 font-semibold rounded-2xl shadow-lg hover:shadow-xl border border-blue-200 hover:border-blue-300 transform hover:-translate-y-1 transition-all duration-300">
                {t('landing.learnMoreButton')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 font-poppins">
              {t('features.title')}
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
                  <FaMapMarkerAlt className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3 font-poppins">{t('features.realtime.title')}</h3>
              <p className="text-sm text-slate-600">{t('features.realtime.description')}</p>
            </div>
            
            {/* Feature 2 */}
            <div className="text-center p-6 rounded-3xl bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center">
                  <FaComments className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3 font-poppins">{t('features.communication.title')}</h3>
              <p className="text-sm text-slate-600">{t('features.communication.description')}</p>
            </div>
            
            {/* Feature 3 */}
            <div className="text-center p-6 rounded-3xl bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center">
                  <FaChartBar className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3 font-poppins">{t('features.routes.title')}</h3>
              <p className="text-sm text-slate-600">{t('features.routes.description')}</p>
            </div>

            {/* Feature 4 */}
            <div className="text-center p-6 rounded-3xl bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center">
                  <FaBolt className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3 font-poppins">{t('features.optimization.title')}</h3>
              <p className="text-sm text-slate-600">{t('features.optimization.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 font-poppins">
              {t('target.title')}
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {t('target.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Target 1 */}
            <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-4xl mb-6">🚚</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4 font-poppins">{t('target.companies.title')}</h3>
              <p className="text-slate-600">{t('target.companies.description')}</p>
            </div>
            
            {/* Target 2 */}
            <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-4xl mb-6">🚕</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4 font-poppins">{t('target.taxi.title')}</h3>
              <p className="text-slate-600">{t('target.taxi.description')}</p>
            </div>
            
            {/* Target 3 */}
            <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-4xl mb-6">🏢</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4 font-poppins">{t('target.logistics.title')}</h3>
              <p className="text-slate-600">{t('target.logistics.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Fleetly Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 font-poppins">
              {t('why.title')}
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {t('why.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Advantage 1 */}
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FaMobile className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{t('why.setup.title')}</h3>
              <p className="text-sm text-slate-600">{t('why.setup.description')}</p>
            </div>
            
            {/* Advantage 2 */}
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FaBell className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{t('why.notifications.title')}</h3>
              <p className="text-sm text-slate-600">{t('why.notifications.description')}</p>
            </div>
            
            {/* Advantage 3 */}
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FaExpand className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{t('why.scalable.title')}</h3>
              <p className="text-sm text-slate-600">{t('why.scalable.description')}</p>
            </div>
            
            {/* Advantage 4 */}
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100">
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FaLink className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{t('why.compatibility.title')}</h3>
              <p className="text-sm text-slate-600">{t('why.compatibility.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-6 font-poppins">
            {t('cta.title')}
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            {t('cta.subtitle')}
          </p>
          <button 
            onClick={() => router.push('/auth')}
            className="px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 text-lg"
          >
            {t('cta.button')}
          </button>
        </div>
      </section>
    </div>
  );
}
