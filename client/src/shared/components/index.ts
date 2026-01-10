// UI Components
export { Button } from './ui/Button';
export { FlipCard } from './ui/FlipCard';
export { GlassCard } from './ui/GlassCard';
export { GlassPanel } from './ui/GlassPanel';
export { AuroraCard } from './ui/AuroraCard';
export { GradientHeading } from './ui/GradientHeading';
export { IconButton } from './ui/IconButton';
export { LoadingSpinner } from './ui/LoadingSpinner';
export { Modal } from './ui/Modal';
export { PageContainer } from './ui/PageContainer';
export { Gallery } from './ui/Gallery';
export { LiquidDecoration } from './ui/LiquidDecoration';
export { LoginRequired } from './LoginRequired';
export { SplashScreen } from './SplashScreen';

export { ScrollProgress } from './ui/ScrollProgress';
export { ScrollSection } from './ui/ScrollSection';
export { TextReveal } from './ui/TextReveal';
export { TiltCard } from './ui/TiltCard';
export { VisualEffect } from './ui/VisualEffect';
export { default as MagneticButton } from './ui/MagneticButton';
export { default as ElasticSlider } from './ui/ElasticSlider/ElasticSlider';

// Error Handling
export { ErrorBoundary } from './ErrorBoundary';

// Audio Components
export { MuteButton } from './audio/MuteButton';

// Re-exports from domain (for backward compatibility)
// Note: These cross-domain imports can cause circular dependencies
export { GravityPlayground } from '../../domain/game/components/GravityPlayground';
export { ScoreDisplay } from '../../domain/game/components/ScoreDisplay';
export { LiquidSphere, ExperienceCard } from '../../domain/cv/components';
