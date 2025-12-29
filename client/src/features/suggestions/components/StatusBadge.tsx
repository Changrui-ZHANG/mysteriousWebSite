import { useTranslation } from 'react-i18next';

interface StatusBadgeProps {
    status: 'pending' | 'reviewed' | 'implemented';
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const { t } = useTranslation();

    const badges = {
        pending: { label: t('suggestions.status_pending'), color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' },
        reviewed: { label: t('suggestions.status_reviewed'), color: 'bg-blue-500/20 text-blue-400 border-blue-500/50' },
        implemented: { label: t('suggestions.status_implemented'), color: 'bg-green-500/20 text-green-400 border-green-500/50' }
    };

    const badge = badges[status] || badges.pending;

    return (
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
            {badge.label}
        </span>
    );
}
