
'use client';

import { useState } from 'react';
import { queryGemini } from '../actions';
import { FaBrain, FaPaperPlane, FaSpinner, FaLightbulb } from 'react-icons/fa';

export function GeminiQuery() {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt) return;

        setLoading(true);
        setError('');
        setResponse('');

        const result = await queryGemini(prompt);

        if (result.success) {
            setResponse(result.text || '');
        } else {
            setError(result.error || 'Произошла неизвестная ошибка');
        }

        setLoading(false);
    };

    return (
        <div className="card bg-white shadow-lg rounded-xl p-6 border border-slate-200">
            <div className="flex items-center gap-4 mb-4">
                <FaBrain className="text-3xl text-blue-600" />
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Помощник ИИ</h2>
                    <p className="text-sm text-slate-500">Задайте вопрос, запросите аналитику или получите помощь по системе.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                    className="input w-full h-24 p-3 border-slate-300 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Пример: 'Предложи 3 KPI для отслеживания эффективности водителей'"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={loading}
                />
                {/* Обновленная кнопка: позиционирование слева, уменьшенный размер и эффект */}
                <div className="flex justify-start">
                    <button 
                        type="submit" 
                        className="flex items-center justify-center gap-2 px-6 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-[1.02]"
                        disabled={loading || !prompt}
                    >
                        {loading ? (
                            <><FaSpinner className="animate-spin" /> Отправка...</>
                        ) : (
                            <><FaPaperPlane /> Отправить</>
                        )}
                    </button>
                </div>
            </form>

            {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
                    <p className="font-semibold">Ошибка</p>
                    <p>{error}</p>
                </div>
            )}

            {response && (
                <div className="mt-6">
                     <div className="flex items-center gap-3 mb-3">
                        <FaLightbulb className="h-6 w-6 text-yellow-500" />
                        <h3 className="text-lg font-semibold text-slate-800">Ответ от Gemini</h3>
                    </div>
                    <div className="prose prose-slate max-w-none p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                       <p>{response}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
