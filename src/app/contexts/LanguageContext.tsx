'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ru' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Переводы
const translations = {
  ru: {
    // Header
    'header.user': 'Пользователь',
    'header.logout': 'Выйти',
    'header.driver': 'Водитель',
    'header.dispatcher': 'Диспетчер',
    'header.admin': 'Админ',
    
    // Sidebar
    'sidebar.navigation': 'Навигация',
    
    // Landing page
    'landing.title': 'Fleetly',
    'landing.subtitle': 'Умная система управления автопарком нового поколения',
    'landing.description': 'Оптимизируйте маршруты, контролируйте расходы и повышайте эффективность вашего автопарка с помощью передовых технологий',
    'landing.startButton': 'Начать работу',
    'landing.learnMoreButton': 'Узнать больше',
    'landing.loading': 'Загружаем систему...',
    
    // Features
    'features.title': 'Основные возможности',
    'features.subtitle': 'Полный контроль над автопарком с передовыми технологиями',
    'features.realtime.title': 'Мониторинг в реальном времени',
    'features.realtime.description': 'Водители передают координаты каждые 10 секунд, диспетчер видит всё на карте',
    'features.communication.title': 'Общение без границ',
    'features.communication.description': 'Встроенный чат и push-уведомления — водители всегда на связи',
    'features.routes.title': 'Маршруты и отчётность',
    'features.routes.description': 'История поездок, аналитика пробега, расход топлива и статистика',
    'features.optimization.title': 'Умная оптимизация',
    'features.optimization.description': 'AI предлагает лучшие маршруты с учётом пробок и времени',
    
    // Target audience
    'target.title': 'Для кого?',
    'target.subtitle': 'Fleetly подходит для любого бизнеса с автопарком',
    'target.companies.title': 'Компании с автопарками',
    'target.companies.description': 'Полный контроль и планирование работы транспорта для максимальной эффективности',
    'target.taxi.title': 'Таксопарки и каршеринг',
    'target.taxi.description': 'Безопасность и доверие пассажиров через прозрачность и контроль качества',
    'target.logistics.title': 'Логистика и доставка',
    'target.logistics.description': 'Оптимизация маршрутов и затрат для повышения прибыльности бизнеса',
    
    // Why Fleetly
    'why.title': 'Почему Fleetly?',
    'why.subtitle': 'Современное решение, которое растёт вместе с вашим бизнесом',
    'why.setup.title': 'Простая настройка',
    'why.setup.description': 'Работает из браузера и на телефоне',
    'why.notifications.title': 'Уведомления в реальном времени',
    'why.notifications.description': 'Мгновенные push-уведомления',
    'why.scalable.title': 'Масштабируется',
    'why.scalable.description': 'От 1 до 1000+ машин',
    'why.compatibility.title': 'Совместимость',
    'why.compatibility.description': 'Google Maps и Firebase',
    
    // CTA
    'cta.title': 'Готовы начать?',
    'cta.subtitle': 'Присоединяйтесь к компаниям, которые уже оптимизировали свой автопарк с Fleetly',
    'cta.button': 'Попробовать бесплатно',
    
    // Footer
    'footer.copyright': 'Умная система управления автопарком.',
    
    // Auth page
    'auth.signIn': 'Вход в систему',
    'auth.signUp': 'Регистрация',
    'auth.subtitle': 'Система управления автопарком для профессионалов',
    'auth.email': 'Email адрес',
    'auth.emailPlaceholder': 'your@email.com',
    'auth.password': 'Пароль',
    'auth.passwordPlaceholder': '••••••••',
    'auth.role': 'Выберите роль',
    'auth.roleDriver': 'Водитель',
    'auth.roleDispatcher': 'Диспетчер',
    'auth.roleAdmin': 'Администратор',
    'auth.createAccount': 'Создать аккаунт',
    'auth.signInButton': 'Войти в систему',
    'auth.creatingAccount': 'Создаём аккаунт...',
    'auth.signingIn': 'Входим...',
    'auth.haveAccount': 'Уже есть аккаунт? Войти',
    'auth.noAccount': 'Нет аккаунта? Зарегистрироваться',
    'auth.demoAccounts': 'Демо-аккаунты для тестирования:',
    'auth.demoDriver': 'Водитель: almaz.zh7@gmail.com / 12345678',
    'auth.demoDispatcher': 'Диспетчер: almaz.zh6@gmail.com / 12345678',
    'auth.demoAdmin': 'Админ: almaz.zh5@gmail.com / 12345678',
  },
  en: {
    // Header
    'header.user': 'User',
    'header.logout': 'Logout',
    'header.driver': 'Driver',
    'header.dispatcher': 'Dispatcher',
    'header.admin': 'Admin',
    
    // Sidebar
    'sidebar.navigation': 'Navigation',
    
    // Landing page
    'landing.title': 'Fleetly',
    'landing.subtitle': 'Next-generation smart fleet management system',
    'landing.description': 'Optimize routes, control costs and improve the efficiency of your fleet with advanced technologies',
    'landing.startButton': 'Get Started',
    'landing.learnMoreButton': 'Learn More',
    'landing.loading': 'Loading system...',
    
    // Features
    'features.title': 'Key Features',
    'features.subtitle': 'Complete fleet control with advanced technologies',
    'features.realtime.title': 'Real-time Monitoring',
    'features.realtime.description': 'Drivers send coordinates every 10 seconds, dispatcher sees everything on the map',
    'features.communication.title': 'Seamless Communication',
    'features.communication.description': 'Built-in chat and push notifications — drivers are always connected',
    'features.routes.title': 'Routes and Reporting',
    'features.routes.description': 'Trip history, mileage analytics, fuel consumption and statistics',
    'features.optimization.title': 'Smart Optimization',
    'features.optimization.description': 'AI suggests the best routes considering traffic and time',
    
    // Target audience
    'target.title': 'Who is it for?',
    'target.subtitle': 'Fleetly is suitable for any business with a fleet',
    'target.companies.title': 'Companies with fleets',
    'target.companies.description': 'Complete control and planning of transport operations for maximum efficiency',
    'target.taxi.title': 'Taxi fleets and carsharing',
    'target.taxi.description': 'Safety and passenger trust through transparency and quality control',
    'target.logistics.title': 'Logistics and delivery',
    'target.logistics.description': 'Route and cost optimization to increase business profitability',
    
    // Why Fleetly
    'why.title': 'Why Fleetly?',
    'why.subtitle': 'Modern solution that grows with your business',
    'why.setup.title': 'Easy Setup',
    'why.setup.description': 'Works from browser and mobile',
    'why.notifications.title': 'Real-time Notifications',
    'why.notifications.description': 'Instant push notifications',
    'why.scalable.title': 'Scalable',
    'why.scalable.description': 'From 1 to 1000+ vehicles',
    'why.compatibility.title': 'Compatibility',
    'why.compatibility.description': 'Google Maps and Firebase',
    
    // CTA
    'cta.title': 'Ready to start?',
    'cta.subtitle': 'Join companies that have already optimized their fleet with Fleetly',
    'cta.button': 'Try for free',
    
    // Footer
    'footer.copyright': 'Smart fleet management system.',
    
    // Auth page
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.subtitle': 'Professional fleet management system',
    'auth.email': 'Email address',
    'auth.emailPlaceholder': 'your@email.com',
    'auth.password': 'Password',
    'auth.passwordPlaceholder': '••••••••',
    'auth.role': 'Select role',
    'auth.roleDriver': 'Driver',
    'auth.roleDispatcher': 'Dispatcher',
    'auth.roleAdmin': 'Administrator',
    'auth.createAccount': 'Create account',
    'auth.signInButton': 'Sign in',
    'auth.creatingAccount': 'Creating account...',
    'auth.signingIn': 'Signing in...',
    'auth.haveAccount': 'Already have an account? Sign in',
    'auth.noAccount': 'Don\'t have an account? Sign up',
    'auth.demoAccounts': 'Demo accounts for testing:',
    'auth.demoDriver': 'Driver: almaz.zh7@gmail.com / 12345678',
    'auth.demoDispatcher': 'Dispatcher: almaz.zh6@gmail.com / 12345678',
    'auth.demoAdmin': 'Admin: almaz.zh5@gmail.com / 12345678',
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('ru');

  useEffect(() => {
    // Загружаем сохранённый язык из localStorage
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'ru' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
