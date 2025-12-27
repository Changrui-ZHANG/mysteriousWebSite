import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { IconButton } from '../ui/IconButton';
import { useMute } from '../../hooks/useMute';

type MuteButtonSize = 'sm' | 'md' | 'lg';
type MuteButtonColor = 'default' | 'cyan' | 'purple' | 'amber' | 'white';

interface MuteButtonProps {
    size?: MuteButtonSize;
    color?: MuteButtonColor;
    className?: string;
    /** Optional override - if provided, component becomes controlled */
    isMuted?: boolean;
    onToggle?: () => void;
}

/**
 * Reusable mute/unmute toggle button.
 * Can be used as controlled or uncontrolled component.
 * Uncontrolled mode uses useMute hook for state management.
 */
export function MuteButton({
    size = 'md',
    color = 'default',
    className = '',
    isMuted: controlledMuted,
    onToggle,
}: MuteButtonProps) {
    const { isMuted: hookMuted, toggleMute: hookToggle } = useMute();

    // Use controlled props if provided, otherwise use hook
    const isMuted = controlledMuted !== undefined ? controlledMuted : hookMuted;
    const toggleMute = onToggle || hookToggle;

    const iconSize = size === 'sm' ? 14 : size === 'md' ? 20 : 24;

    return (
        <IconButton
            icon={isMuted ? <FaVolumeMute size={iconSize} /> : <FaVolumeUp size={iconSize} />}
            onClick={toggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
            size={size}
            color={color}
            className={className}
        />
    );
}
