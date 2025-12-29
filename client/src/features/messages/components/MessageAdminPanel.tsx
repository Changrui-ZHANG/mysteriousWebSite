import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface MessageAdminPanelProps {
    isAdmin: boolean;
    isSuperAdmin: boolean;
    isGlobalMute: boolean;
    onlineCount: number;
    showOnlineCountToAll: boolean;
    onToggleMute: () => void;
    onClearAll: () => void;
    onToggleOnlineVisibility: () => void;
    onRefreshOnlineCount: () => void;
    onOpenUserManagement: () => void;
}

export function MessageAdminPanel({
    isAdmin,
    isSuperAdmin,
    isGlobalMute,
    onlineCount,
    showOnlineCountToAll,
    onToggleMute,
    onClearAll,
    onToggleOnlineVisibility,
    onRefreshOnlineCount,
    onOpenUserManagement
}: MessageAdminPanelProps) {
    const { t } = useTranslation();

    if (!isAdmin) {
        return (
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-2 pt-2 border-t border-green-500/10"
            >
                <div className="text-xs text-gray-500 text-center py-2">
                    {t('admin.login_hint')}
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mt-2 pt-2 border-t border-green-500/10"
        >
            <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${isSuperAdmin ? 'text-purple-400' : 'text-green-400'}`}>
                    ✓ {isSuperAdmin ? t('admin.super_admin') : t('admin.admin')}
                </span>

                <div className="w-[1px] h-4 bg-gray-500/30 mx-1" />

                <div className="flex items-center gap-1">
                    <span className="status-indicator status-indicator-info">
                        👥 {onlineCount}
                    </span>
                    <button
                        onClick={onRefreshOnlineCount}
                        className="icon-btn-themed px-2 py-1.5 text-xs"
                        title={t('admin.refresh_count')}
                        aria-label={t('admin.refresh_count')}
                    >
                        🔄
                    </button>
                    {isSuperAdmin && (
                        <>
                            <div className="w-[1px] h-4 bg-gray-500/30 mx-1" />
                            <button
                                onClick={onOpenUserManagement}
                                className="px-2 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-xs"
                            >
                                {t('admin.manage_users')}
                            </button>
                        </>
                    )}
                    <button
                        onClick={onToggleOnlineVisibility}
                        className={`px-3 py-1.5 rounded-lg text-white text-xs ${showOnlineCountToAll ? 'bg-blue-500' : 'bg-gray-600'}`}
                        title={showOnlineCountToAll ? t('admin.hide_count') : t('admin.show_count')}
                        aria-label={showOnlineCountToAll ? t('admin.hide_count') : t('admin.show_count')}
                    >
                        {showOnlineCountToAll ? '👁️' : '👁️‍🗨️'}
                    </button>
                </div>

                <div className="w-[1px] h-4 bg-gray-500/30 mx-1" />

                <button
                    onClick={onToggleMute}
                    className={`px-3 py-1.5 rounded-lg text-white text-xs ${isGlobalMute ? 'bg-orange-500' : 'bg-yellow-500'}`}
                >
                    {isGlobalMute ? t('admin.unmute') : t('admin.mute')}
                </button>

                <div className="w-[1px] h-4 bg-gray-500/30 mx-1" />

                <button
                    onClick={onClearAll}
                    className="ml-auto px-3 py-1.5 bg-red-500 rounded-lg text-white text-xs"
                >
                    {t('admin.clear_all')}
                </button>
            </div>
        </motion.div>
    );
}
