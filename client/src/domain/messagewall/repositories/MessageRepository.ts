import { BaseService } from '../../../shared/services/BaseService';
import { postJson, deleteJson } from '../../../shared/api/httpClient';
import { API_ENDPOINTS } from '../../../shared/constants/endpoints';
import { getAdminCode } from '../../../shared/constants/authStorage';
import type { Message } from '../types';

interface CreateMessageData {
    content: string;
    userId: string;
    username: string;
    replyToId?: string;
}

interface MessageFilters {
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
}

/**
 * Repository for message data access
 * Implements the Repository pattern for clean separation of data access logic
 * Updated to match backend endpoints exactly
 */
export class MessageRepository extends BaseService<Message, CreateMessageData> {
    constructor() {
        super(API_ENDPOINTS.MESSAGES.LIST);
    }

    /**
     * Get all messages (backend doesn't support filtering yet)
     */
    async getMessages(_filters?: MessageFilters): Promise<Message[]> {
        // Backend only supports getting all messages, no filtering
        return this.findAll();
    }

    /**
     * Submit a new message
     */
    async submitMessage(data: CreateMessageData, isAdmin: boolean = false): Promise<Message> {
        const adminCode = isAdmin ? getAdminCode() : undefined;
        
        // Create message object matching backend expectations
        // Backend generates the ID, so we don't send it
        const messagePayload = {
            userId: data.userId,
            name: data.username || '',
            message: data.content,
            timestamp: Date.now(),
            isAnonymous: !data.username || data.username.trim() === '',
            quotedMessageId: data.replyToId || null,
        };

        const url = adminCode ? `${this.baseUrl}?adminCode=${adminCode}` : this.baseUrl;
        
        const response = await postJson<{ success: boolean; data: Message }>(url, messagePayload);
        return response.data;
    }

    /**
     * Delete a message
     */
    async deleteMessage(messageId: string, userId: string, isAdmin: boolean = false): Promise<void> {
        const adminCode = isAdmin ? getAdminCode() : undefined;
        const params: Record<string, string> = { userId };
        if (adminCode) params.adminCode = adminCode;

        return deleteJson<void>(this.buildUrl(`/${messageId}`, params));
    }

    /**
     * Get global mute status from response headers
     */
    async getGlobalMuteStatus(): Promise<boolean> {
        try {
            const response = await fetch(this.baseUrl);
            const muteHeader = response.headers.get('X-System-Muted');
            return muteHeader === 'true';
        } catch (error) {
            console.warn('Failed to get mute status:', error);
            return false;
        }
    }

    /**
     * Toggle global mute (admin only)
     */
    async toggleGlobalMute(_enabled: boolean): Promise<void> {
        const adminCode = getAdminCode();
        if (!adminCode) throw new Error('Admin access required');

        return postJson<void>(
            `${API_ENDPOINTS.MESSAGES.TOGGLE_MUTE}?adminCode=${adminCode}`,
            {}
        );
    }

    /**
     * Clear all messages (admin only)
     */
    async clearAllMessages(): Promise<void> {
        const adminCode = getAdminCode();
        if (!adminCode) throw new Error('Admin access required');

        return postJson<void>(
            `${API_ENDPOINTS.MESSAGES.CLEAR}?adminCode=${adminCode}`,
            {}
        );
    }

    /**
     * Get message statistics (not implemented in backend yet)
     */
    async getMessageStats(): Promise<{
        totalMessages: number;
        messagesThisWeek: number;
        activeUsers: number;
    }> {
        // Backend doesn't have this endpoint yet, return mock data
        const messages = await this.getMessages();
        return {
            totalMessages: messages.length,
            messagesThisWeek: messages.filter(m => {
                const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
                return m.timestamp > weekAgo;
            }).length,
            activeUsers: new Set(messages.map(m => m.userId)).size,
        };
    }

    /**
     * Translate a message (not implemented in backend yet)
     */
    async translateMessage(_messageId: string, _targetLanguage: string): Promise<string> {
        // Backend doesn't have translation endpoint yet
        throw new Error('Translation not implemented in backend');
    }
}