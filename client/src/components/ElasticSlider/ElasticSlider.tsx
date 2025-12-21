import React, { useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform } from 'framer-motion';
import { RiVolumeDownFill, RiVolumeUpFill, RiVolumeMuteFill } from 'react-icons/ri';

import './ElasticSlider.css';

const MAX_OVERFLOW = 50;

interface ElasticSliderProps {
    defaultValue?: number;
    startingValue?: number;
    maxValue?: number;
    className?: string;
    isStepped?: boolean;
    stepSize?: number;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    onChange?: (value: number) => void;
    color?: string; // Tailwind color class or hex (e.g., 'cyan', 'purple', 'fuchsia')
    isMuted?: boolean;
    onToggleMute?: () => void;
}

const ElasticSlider: React.FC<ElasticSliderProps> = ({
    defaultValue = 50,
    startingValue = 0,
    maxValue = 100,
    className = '',
    isStepped = false,
    stepSize = 1,
    leftIcon,
    rightIcon,
    onChange,
    color = 'cyan',
    isMuted = false,
    onToggleMute
}) => {
    const [value, setValue] = useState<number>(defaultValue);
    const sliderRef = useRef<HTMLDivElement>(null);
    const [region, setRegion] = useState<'left' | 'middle' | 'right'>('middle');
    const clientX = useMotionValue(0);
    const overflow = useMotionValue(0);
    const scale = useMotionValue(1);

    // Default icons if not provided, with dynamic color
    const LIcon = leftIcon || (isMuted ? <RiVolumeMuteFill size={18} /> : <RiVolumeDownFill size={18} />);
    const RIcon = rightIcon || <RiVolumeUpFill size={18} />;

    useEffect(() => {
        setValue(defaultValue);
    }, [defaultValue]);

    useMotionValueEvent(clientX, 'change', (latest: number) => {
        if (sliderRef.current) {
            const { left, right } = sliderRef.current.getBoundingClientRect();
            let newValue: number;
            if (latest < left) {
                setRegion('left');
                newValue = left - latest;
            } else if (latest > right) {
                setRegion('right');
                newValue = latest - right;
            } else {
                setRegion('middle');
                newValue = 0;
            }
            overflow.jump(decay(newValue, MAX_OVERFLOW));
        }
    });

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.buttons > 0 && sliderRef.current) {
            const { left, width } = sliderRef.current.getBoundingClientRect();
            let newValue = startingValue + ((e.clientX - left) / width) * (maxValue - startingValue);
            if (isStepped) {
                newValue = Math.round(newValue / stepSize) * stepSize;
            }
            newValue = Math.min(Math.max(newValue, startingValue), maxValue);
            setValue(newValue);
            if (onChange) onChange(newValue);
            clientX.jump(e.clientX);
        }
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        handlePointerMove(e);
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerUp = () => {
        animate(overflow, 0, { type: 'spring', bounce: 0.5 });
    };

    const getRangePercentage = (): number => {
        const totalRange = maxValue - startingValue;
        if (totalRange === 0) return 0;
        return ((value - startingValue) / totalRange) * 100;
    };

    return (
        <div className={`slider-container ${className}`}>
            <motion.div
                onHoverStart={() => animate(scale, 1.2)}
                onHoverEnd={() => animate(scale, 1)}
                style={{
                    scale,
                    opacity: useTransform(scale, [1, 1.2], [0.7, 1])
                }}
                className="slider-wrapper"
            >
                <motion.div
                    animate={{
                        scale: region === 'left' ? [1, 1.4, 1] : 1,
                        transition: { duration: 0.25 }
                    }}
                    style={{
                        x: useTransform(() => (region === 'left' ? -overflow.get() / scale.get() : 0)),
                        color: `var(--slider-color, ${color === 'cyan' ? '#22d3ee' : color === 'purple' ? '#a855f7' : color === 'pink' ? '#f472b6' : color})`
                    }}
                    className={`flex items-center justify-center transition-colors ${onToggleMute ? 'cursor-pointer hover:scale-110 active:scale-95' : ''}`}
                    onClick={(e) => { e.stopPropagation(); onToggleMute?.(); }}
                >
                    {LIcon}
                </motion.div>

                <div
                    ref={sliderRef}
                    className="slider-root"
                    onPointerMove={handlePointerMove}
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                    style={{ '--slider-color': color === 'cyan' ? '#22d3ee' : color === 'purple' ? '#a855f7' : color === 'pink' ? '#f472b6' : color } as any}
                >
                    <motion.div
                        style={{
                            scaleX: useTransform(() => {
                                if (sliderRef.current) {
                                    const { width } = sliderRef.current.getBoundingClientRect();
                                    return 1 + overflow.get() / width;
                                }
                                return 1;
                            }),
                            scaleY: useTransform(overflow, [0, MAX_OVERFLOW], [1, 0.8]),
                            transformOrigin: useTransform(() => {
                                if (sliderRef.current) {
                                    const { left, width } = sliderRef.current.getBoundingClientRect();
                                    return clientX.get() < left + width / 2 ? 'right' : 'left';
                                }
                                return 'center';
                            }),
                            height: useTransform(scale, [1, 1.2], [6, 10]),
                        }}
                        className="slider-track-wrapper w-full"
                    >
                        <div className="slider-track w-full">
                            <div
                                className="slider-range transition-colors duration-300"
                                style={{
                                    width: `${getRangePercentage()}%`,
                                    background: isMuted ? 'rgba(128, 128, 128, 0.4)' : `linear-gradient(90deg, #1e293b, var(--slider-color, #3b82f6))`
                                }}
                            />
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    animate={{
                        scale: region === 'right' ? [1, 1.4, 1] : 1,
                        transition: { duration: 0.25 }
                    }}
                    style={{
                        x: useTransform(() => (region === 'right' ? overflow.get() / scale.get() : 0)),
                        color: `var(--slider-color, ${color === 'cyan' ? '#22d3ee' : color === 'purple' ? '#a855f7' : color === 'pink' ? '#f472b6' : color})`
                    }}
                    className="flex items-center justify-center transition-colors"
                >
                    {RIcon}
                </motion.div>
            </motion.div>
        </div>
    );
};

function decay(value: number, max: number): number {
    if (max === 0) {
        return 0;
    }
    const entry = value / max;
    const sigmoid = 2 * (1 / (1 + Math.exp(-entry)) - 0.5);
    return sigmoid * max;
}

export default ElasticSlider;
