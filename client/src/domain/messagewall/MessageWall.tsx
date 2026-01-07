import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import UserManagement from '../user/UserManagement';
import { ScrollProgress } from '../../shared/components';
import { MessageItem, MessageInput, MessageAdminPanel } from './components';
import { useMessageWall } from './hooks/useMessageWall';
import { getAdminCode } from '../../shared/constants/authStorage';
import type { MessageWallProps } from './types';

export function MessageWall({ user, onOpenLogin, isAdmin = false, isSuperAdmin = false }: MessageWallProps) {
    const { t } = useTranslation();
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [showUserManagement, setShowUserManagement] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const {
        messages, replyingTo, setReplyingTo, translations, translating, showTranslated,
        isGlobalMute, onlineCount, showOnlineCountToAll, highlightedMessageId,
        handleTranslate, handleSubmit, handleDelete,
        toggleMute, clearAllMessages, toggleOnlineCountVisibility, fetchOnlineCount,
        isOwnMessage, canDeleteMessage, scrollToMessage
    } = useMessageWall({ user, isAdmin });

    return (
        <div className="page-container fixed inset-0 overflow-hidden flex flex-col pt-20 overscroll-none">
            <ScrollProgress target={scrollContainerRef} />

            {/* Online Count Indicator - Liquid Pill */}
            {(showOnlineCountToAll || isAdmin) && (
                <div className="fixed top-20 right-6 z-40 transition-all duration-500">
                    <span className="text-[10px] px-4 py-2 rounded-full font-black tracking-widest uppercase shadow-2xl flex items-center gap-2.5 bg-surface-translucent text-accent-primary backdrop-blur-2xl border border-default relative after:absolute after:inset-0 after:rounded-full after:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15)] after:pointer-events-none">
                        <span className="w-2 h-2 rounded-full bg-accent-success animate-pulse shadow-[0_0_10px_var(--color-accent-success)]" />
                        {onlineCount} {t('messages.online')}
                    </span>
                </div>
            )}

            {/* Messages Area - Centered Container */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 md:px-8 pb-40" style={{ scrollbarGutter: 'stable' }}>
                <div className="max-w-3xl mx-auto flex flex-col gap-4 py-6">
                    <AnimatePresence mode="popLayout">
                        {(!Array.isArray(messages) || messages.length === 0) ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-32 opacity-30 text-lg font-medium"
                            >
                                {t('messages.empty')}
                            </motion.div>
                        ) : (
                            messages.map((msg, index) => (
                                <MessageItem
                                    key={msg.id}
                                    msg={msg}
                                    index={index}
                                    isOwn={isOwnMessage(msg)}
                                    isHighlighted={highlightedMessageId === msg.id}
                                    canDelete={canDeleteMessage(msg)}
                                    translation={translations[msg.id]}
                                    isTranslating={translating.has(msg.id)}
                                    showTranslation={showTranslated.has(msg.id)}
                                    onDelete={handleDelete}
                                    onReply={setReplyingTo}
                                    onTranslate={handleTranslate}
                                    onScrollToMessage={scrollToMessage}
                                />
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Input Area + Admin Panel Container */}
            <MessageInput
                user={user ?? null}
                isAdmin={isAdmin}
                isGlobalMute={isGlobalMute}
                replyingTo={replyingTo}
                onSubmit={handleSubmit}
                onCancelReply={() => setReplyingTo(null)}
                onOpenLogin={onOpenLogin ?? (() => { })}
                onOpenAdminPanel={() => setShowAdminPanel(!showAdminPanel)}
                showAdminPanel={showAdminPanel}
                adminPanelContent={
                    <MessageAdminPanel
                        isAdmin={isAdmin}
                        isSuperAdmin={isSuperAdmin}
                        isGlobalMute={isGlobalMute}
                        onlineCount={onlineCount}
                        showOnlineCountToAll={showOnlineCountToAll}
                        onToggleMute={toggleMute}
                        onClearAll={clearAllMessages}
                        onToggleOnlineVisibility={toggleOnlineCountVisibility}
                        onRefreshOnlineCount={fetchOnlineCount}
                        onOpenUserManagement={() => setShowUserManagement(true)}
                    />
                }
            />

            <UserManagement
                isOpen={showUserManagement}
                onClose={() => setShowUserManagement(false)}
                superAdminCode={getAdminCode() || ''}
            />
        </div>
    );
}
