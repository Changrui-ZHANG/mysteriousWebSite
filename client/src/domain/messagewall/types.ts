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
}

export interface User {
    userId: string;
    username: string;
}

export interface MessageWallProps {
    // Props removed - now using useAuth() context
}
