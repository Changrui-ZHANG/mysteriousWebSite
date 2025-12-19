import { FaArrowLeft } from 'react-icons/fa';

interface RulesPageProps {
    onBack: () => void;
}

export function RulesPage({ onBack }: RulesPageProps) {
    return (
        <div className="absolute inset-0 w-full h-full flex flex-col p-4 md:p-8 bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 border-2 border-cyan-500/50 rounded-xl overflow-hidden pointer-events-auto">
            <div className="flex justify-between items-center mb-6 border-b border-cyan-500/30 pb-4">
                <h2 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    ZOMBIE SHOOTER - GUIDE
                </h2>
                <button
                    onClick={onBack}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                    <FaArrowLeft className="text-white text-xl" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 md:space-y-6 text-left scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-transparent pr-2 select-text" style={{ touchAction: 'pan-y' }} onPointerDown={(e) => e.stopPropagation()}>
                <section>
                    <h3 className="text-lg md:text-xl font-bold text-cyan-400 mb-2">🎯 Objectif</h3>
                    <p className="text-white/80 text-sm md:text-base leading-relaxed">
                        Survivez le plus longtemps possible contre des vagues infinies de zombies. Éliminez-les et collectez des power-ups pour améliorer vos armes.
                    </p>
                </section>

                <section>
                    <h3 className="text-lg md:text-xl font-bold text-cyan-400 mb-3">🎮 Contrôles</h3>
                    <div className="space-y-2 text-sm md:text-base">
                        <div className="bg-white/5 p-3 rounded-lg">
                            <span className="text-yellow-400 font-bold">PC:</span>
                            <span className="text-white/70 ml-2">Déplacez votre souris pour bouger. Tir automatique.</span>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg">
                            <span className="text-yellow-400 font-bold">Mobile:</span>
                            <span className="text-white/70 ml-2">Utilisez les pads tactiques en bas de l'écran pour bouger.</span>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-lg md:text-xl font-bold text-cyan-400 mb-3">📊 Interface Tactique (Mobile)</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs md:text-sm">
                        <div className="bg-cyan-500/5 p-2 border border-cyan-500/20 rounded-lg flex items-center gap-2">
                            <span className="text-lg">🚀</span>
                            <span className="text-white/80">**Cadence** : Vitesse de tir</span>
                        </div>
                        <div className="bg-cyan-500/5 p-2 border border-cyan-500/20 rounded-lg flex items-center gap-2">
                            <span className="text-lg">⚡</span>
                            <span className="text-white/80">**Dégâts** : Puissance par tir</span>
                        </div>
                        <div className="bg-cyan-500/5 p-2 border border-cyan-500/20 rounded-lg flex items-center gap-2">
                            <span className="text-lg">🎯</span>
                            <span className="text-white/80">**Critique** : % de chance de coup critique</span>
                        </div>
                        <div className="bg-cyan-500/5 p-2 border border-cyan-500/20 rounded-lg flex items-center gap-2">
                            <span className="text-lg">🔫</span>
                            <span className="text-white/80">**Canons** : Nombre de projectiles</span>
                        </div>
                        <div className="bg-cyan-500/5 p-2 border border-cyan-500/20 rounded-lg flex items-center gap-2">
                            <span className="text-lg">🛡️</span>
                            <span className="text-white/80">**Rebond** : Nombre de rebonds</span>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-lg md:text-xl font-bold text-cyan-400 mb-3">⚡ Power-Ups</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-white/5 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                                <h4 className="font-bold text-white">Scatter (Jaune)</h4>
                            </div>
                            <p className="text-xs md:text-sm text-white/60">+1 Canon supplémentaire</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                <h4 className="font-bold text-white">Cadence (Bleu)</h4>
                            </div>
                            <p className="text-xs md:text-sm text-white/60">Réduit le délai entre les tirs</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg border border-yellow-500/30">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></span>
                                <h4 className="font-bold text-white">Critique (Jaune)</h4>
                            </div>
                            <p className="text-xs md:text-sm text-white/60">+10% Chance de Critique (Bonus de dégâts variable)</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                <h4 className="font-bold text-white">Tech (Rouge)</h4>
                            </div>
                            <p className="text-xs md:text-sm text-white/60">Débloque des modes de tir avancés</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                                <h4 className="font-bold text-white">Dégâts (Orange)</h4>
                            </div>
                            <p className="text-xs md:text-sm text-white/60">+10 Dégâts par tir</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg border border-white/30">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-3 h-3 rounded-full bg-white"></span>
                                <h4 className="font-bold text-white">Rebond (Blanc)</h4>
                            </div>
                            <p className="text-xs md:text-sm text-white/60">+1 Rebond sur les murs</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-lg md:text-xl font-bold text-cyan-400 mb-3">🔫 Modes de Tir</h3>
                    <div className="space-y-2 text-sm md:text-base">
                        <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/30">
                            <span className="text-green-300 font-bold">PERF (Tech 1):</span>
                            <span className="text-white/70 ml-2">Tirs perforants - traverse les ennemis</span>
                        </div>
                        <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/30">
                            <span className="text-blue-300 font-bold">REB (Tech 2):</span>
                            <span className="text-white/70 ml-2">Tirs rebondissants - rebondissent sur les murs</span>
                        </div>
                        <div className="bg-purple-500/10 p-3 rounded-lg border border-purple-500/30">
                            <span className="text-purple-300 font-bold">CHAÎNE (Tech 3):</span>
                            <span className="text-white/70 ml-2">Tirs en chaîne - sautent entre ennemis</span>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-lg md:text-xl font-bold text-cyan-400 mb-2">🧟 Types d'Ennemis</h3>
                    <div className="space-y-2 text-sm md:text-base">
                        <div className="bg-white/5 p-2 rounded">
                            <span className="text-green-400">●</span> <span className="text-white font-bold">Walker:</span>
                            <span className="text-white/60 ml-1">Lent, HP Normal (1x)</span>
                        </div>
                        <div className="bg-white/5 p-2 rounded">
                            <span className="text-yellow-400">●</span> <span className="text-white font-bold">Runner:</span>
                            <span className="text-white/60 ml-1">Rapide, HP Faible (0.5x)</span>
                        </div>
                        <div className="bg-white/5 p-2 rounded">
                            <span className="text-red-400">●</span> <span className="text-white font-bold">Tank:</span>
                            <span className="text-white/60 ml-1">Lent, HP Élevé (4x), résiste au knockback</span>
                        </div>
                        <div className="bg-purple-500/20 p-2 rounded border border-purple-500/30">
                            <span className="text-purple-400">●</span> <span className="text-white font-bold">Boss:</span>
                            <span className="text-white/60 ml-1 text-xs">Très Lent, HP Légendaire (10x), BUTIN GARANTI</span>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-lg md:text-xl font-bold text-cyan-400 mb-2">📈 Score</h3>
                    <div className="space-y-2 text-sm md:text-base">
                        <div className="bg-cyan-900/20 p-4 rounded border border-cyan-500/30">
                            <p className="text-white mb-2">Le score est déterminé par la **dernière vague atteinte**.</p>
                            <p className="text-white/60 text-xs">Terminez des vagues pour augmenter votre score global et débloquer des récompenses d'élite.</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-lg md:text-xl font-bold text-cyan-400 mb-2">🎁 Récompenses Spéciales</h3>
                    <div className="space-y-2 text-sm md:text-base">
                        <div className="bg-purple-500/10 p-3 rounded-lg border border-purple-500/30 italic text-purple-300">
                            "Le Boss laisse tomber systématiquement un Power-Up à sa mort."
                        </div>
                        <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/30 font-bold text-red-400 animate-pulse">
                            DÉFENSE DÉSESPÉRÉE : Tout zombie éliminé dans la ZONE ROUGE laisse tomber un Power-Up !
                        </div>
                        <div className="bg-cyan-500/10 p-3 rounded-lg border border-cyan-500/30 text-xs italic text-cyan-200">
                            DÉFI ÉLITE : Si aucun zombie n'entre dans la Zone Sécurisée pendant 5 vagues, leur santé augmente de +50%.
                        </div>
                    </div>
                </section>

                <div className="text-center pt-4 border-t border-cyan-500/20">
                    <p className="text-white/50 text-xs md:text-sm">
                        💡 Astuce: Les HP des zombies augmentent de <span className="text-yellow-400 font-bold">20% à chaque vague (exponentiel)</span>. Améliorez vos dégâts!
                    </p>
                </div>
            </div>
        </div>
    );
}
