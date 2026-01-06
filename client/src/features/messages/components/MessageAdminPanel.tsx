import { useTranslation } from 'react-i18next';
import { FaUsers, FaSync, FaUsersCog, FaEye, FaEyeSlash, FaVolumeMute, FaVolumeUp, FaTrashAlt } from 'react-icons/fa';

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
            <div className="text-center py-3 text-xs text-white/30">
                {t('admin.login_hint')}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3 flex-wrap">
            {/* Admin Badge */}
            <span className={`text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-lg border ${isSuperAdmin ? 'text-accent-secondary border-accent-secondary/30 bg-accent-secondary/10' : 'text-accent-success border-accent-success/30 bg-accent-success/10'}`}>
                ✓ {isSuperAdmin ? t('admin.super_admin') : t('admin.admin')}
            </span>

            {/* Divider */}
            <div className="w-px h-5 bg-white/10" />

            {/* Online Count + Refresh */}
            <div className="flex items-center gap-1.5 bg-white/5 rounded-xl p-1 border border-white/5">
                <span className="text-[10px] font-bold px-2 text-white/50 flex items-center gap-1.5">
                    <FaUsers className="text-[9px]" /> {onlineCount}
                </span>
                <button
                    onClick={onRefreshOnlineCount}
                    className="w-7 h-7 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg transition-all text-white/50 hover:text-white"
                    title={t('admin.refresh_count')}
                >
                    <FaSync className="text-[10px]" />
                </button>
                <button
                    onClick={onToggleOnlineVisibility}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${showOnlineCountToAll ? 'bg-accent-primary/20 text-accent-primary' : 'bg-white/5 text-white/30'}`}
                    title={showOnlineCountToAll ? t('admin.hide_count') : t('admin.show_count')}
                >
                    {showOnlineCountToAll ? <FaEye className="text-[10px]" /> : <FaEyeSlash className="text-[10px]" />}
                </button>
            </div>

            {/* Super Admin: User Management */}
            {isSuperAdmin && (
                <button
                    onClick={onOpenUserManagement}
                    className="px-3 py-1.5 rounded-lg bg-accent-secondary/20 hover:bg-accent-secondary/30 border border-accent-secondary/30 text-accent-secondary text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
                >
                    <FaUsersCog className="text-[9px]" />
                    {t('admin.manage_users')}
                </button>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Mute Toggle */}
            <button
                onClick={onToggleMute}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border flex items-center gap-1.5 ${isGlobalMute ? 'bg-accent-warning/20 border-accent-warning/40 text-accent-warning' : 'bg-white/5 border-white/10 text-white/50 hover:bg-accent-warning/10 hover:text-accent-warning'}`}
            >
                {isGlobalMute ? <FaVolumeUp className="text-[9px]" /> : <FaVolumeMute className="text-[9px]" />}
                {isGlobalMute ? t('admin.unmute') : t('admin.mute')}
            </button>

            {/* Clear All */}
            <button
                onClick={onClearAll}
                className="px-3 py-1.5 bg-accent-danger/20 border border-accent-danger/40 hover:bg-accent-danger/30 text-accent-danger rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
            >
                <FaTrashAlt className="text-[9px]" />
                {t('admin.clear_all')}
            </button>
        </div>
    );
}
