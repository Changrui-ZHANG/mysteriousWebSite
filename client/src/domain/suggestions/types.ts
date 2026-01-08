export interface Suggestion {
    id: string;
    userId: string;
    username: string;
    suggestion: string;
    timestamp: string;
    status: 'pending' | 'reviewed' | 'implemented';
    commentCount: number;
}

export interface SuggestionComment {
    id: string;
    suggestionId: string;
    userId: string;
    username: string;
    content: string;
    timestamp: string;
    quotedCommentId?: string;
    quotedUsername?: string;
    quotedContent?: string;
}

export interface SuggestionUser {
    userId: string;
    username: string;
}