import { useTranslation } from 'react-i18next';

interface StatusBadgeProps {
    status: 'pending' | 'reviewed' | 'implemented';
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const { t } = useTranslation();

    const badges = {
        pending: { label: t('suggestions.status_pending'), color: 'bg-accent-warning/20 text-accent-warning border-accent-warning/30' },
        reviewed: { label: t('suggestions.status_reviewed'), color: 'bg-accent-info/20 text-accent-info border-accent-info/30' },
        implemented: { label: t('suggestions.status_implemented'), color: 'bg-accent-success/20 text-accent-success border-accent-success/30' }
    };

    const badge = badges[status] || badges.pending;

    return (
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
            {badge.label}
        </span>
    );
}