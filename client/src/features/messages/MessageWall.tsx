import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'framer-motion';
import UserManagement from '../admin/UserManagement';
import { ScrollProgress } from '../../components';
import { MessageItem, MessageInput, MessageAdminPanel } from './components';
import { useMessageWall } from './hooks/useMessageWall';
import { getAdminCode } from '../../constants/authStorage';
import type { MessageWallProps } from './types';

export function MessageWall({ isDarkMode, user, onOpenLogin, isAdmin = false, isSuperAdmin = false }: MessageWallProps) {
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
        <div className="page-container fixed inset-0 overflow-hidden flex flex-col pt-24 overscroll-none">
            <ScrollProgress isDarkMode={isDarkMode} target={scrollContainerRef} />

            {/* Online Count Indicator */}
            {(showOnlineCountToAll || isAdmin) && (
                <div className="fixed top-24 right-4 z-40 transition-opacity duration-300 pointer-events-none">
                    <span className="text-xs px-3 py-1.5 rounded-full font-medium shadow-sm flex items-center gap-2 pointer-events-auto bg-surface/80 text-cyan-400 backdrop-blur-md border border-default/20">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        {onlineCount} {t('messages.online')}
                    </span>
                </div>
            )}

            {/* Messages Area */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-2 md:px-4 pb-20">
                <div className="max-w-4xl mx-auto flex flex-col gap-3">
                    <AnimatePresence>
                        {(!Array.isArray(messages) || messages.length === 0) ? (
                            <div className="text-center py-20 opacity-40 text-sm">{t('messages.empty')}</div>
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

            {/* Input Area */}
            <MessageInput
                user={user ?? null}
                isAdmin={isAdmin}
                isGlobalMute={isGlobalMute}
                replyingTo={replyingTo}
                onSubmit={handleSubmit}
                onCancelReply={() => setReplyingTo(null)}
                onOpenLogin={onOpenLogin ?? (() => {})}
                onOpenAdminPanel={() => setShowAdminPanel(!showAdminPanel)}
            />

            {/* Admin Panel */}
            {showAdminPanel && (
                <div className="border-t bg-surface/80 border-green-500/20 backdrop-blur-lg">
                    <div className="max-w-4xl mx-auto p-3">
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
                    </div>
                </div>
            )}

            <UserManagement
                isOpen={showUserManagement}
                onClose={() => setShowUserManagement(false)}
                superAdminCode={getAdminCode() || ''}
            />
        </div>
    );
}
