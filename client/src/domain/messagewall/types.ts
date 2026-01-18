import type { Reaction } from './types/reaction.types';

export interface Message {
    id: string;
    userId: string;
    name: string;
    message: string;
    timestamp: number;
    isAnonymous: boolean;
    isVerified: boolean;
    quotedMessageId?: string;
    quotedName?: string;
    quotedMessage?: string;
    channelId?: string; // Channel auquel appartient le message
    reactions?: Reaction[];
    imageUrl?: string; // URL de l'image attachée
}

export interface User {
    userId: string;
    username: string;
}

export interface MessageWallProps {
    // Props removed - now using useAuth() context
}
