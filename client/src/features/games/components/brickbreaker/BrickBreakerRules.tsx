/**
 * BrickBreakerRules - Back face of the flip card showing game rules
 */

import { useTranslation } from 'react-i18next';
import { FaArrowLeft } from 'react-icons/fa';
import { GradientHeading } from '../../../../components';

interface BrickBreakerRulesProps {
    onClose: () => void;
}

export function BrickBreakerRules({ onClose }: BrickBreakerRulesProps) {
    const { t } = useTranslation();

    return (
        <div className="absolute inset-0 w-full h-full flex flex-col p-8 bg-gradient-to-br from-cyan-900/90 to-slate-900/95 overflow-hidden">
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <GradientHeading gradient="cyan-purple" level={2}>
                    {t('game.brick_breaker')} - {t('game.arcade_zone')}
                </GradientHeading>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                    <FaArrowLeft className="text-white text-xl" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 text-left scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-transparent pr-2">
                <section className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <h3 className="text-xl font-bold text-cyan-400 mb-3 flex items-center gap-2">
                        <span className="bg-cyan-500/20 p-2 rounded-lg">🎯</span>
                        {t('game.objective')}
                    </h3>
                    <p className="text-white/80 leading-relaxed text-sm md:text-base">
                        {t('game.brick_breaker_rules')}
                    </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:border-cyan-500/30 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl bg-white/10 p-2 rounded-xl">🎮</span>
                            <h4 className="font-bold text-white">{t('game.controls')}</h4>
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed">{t('game.brick_breaker_controls')}</p>
                    </div>
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:border-yellow-500/30 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl bg-white/10 p-2 rounded-xl">⭐</span>
                            <h4 className="font-bold text-white">{t('game.bonus')}</h4>
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed">{t('game.brick_breaker_bonus')}</p>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-cyan-500/10 to-transparent p-4 rounded-xl border-l-4 border-cyan-400">
                    <p className="text-xs md:text-sm text-cyan-200 italic">
                        💡 {t('game.match3_speed')}
                    </p>
                </div>
            </div>
        </div>
    );
}
