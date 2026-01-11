import { BaseService } from '../../../shared/services/BaseService';
import { fetchJson, postJson, deleteJson } from '../../../shared/api/httpClient';
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
 */
export class MessageRepository extends BaseService<Message, CreateMessageData> {
    constructor() {
        super(API_ENDPOINTS.MESSAGES.LIST);
    }

    /**
     * Get messages with optional filters
     */
    async getMessages(filters?: MessageFilters): Promise<Message[]> {
        if (!filters) {
            return this.findAll();
        }

        const params: Record<string, string | number> = {};
        if (filters.userId) params.userId = filters.userId;
        if (filters.startDate) params.startDate = filters.startDate.toISOString();
        if (filters.endDate) params.endDate = filters.endDate.toISOString();
        if (filters.limit) params.limit = filters.limit;
        if (filters.offset) params.offset = filters.offset;

        return fetchJson<Message[]>(this.buildUrl('', params));
    }

    /**
     * Submit a new message
     */
    async submitMessage(data: CreateMessageData, isAdmin: boolean = false): Promise<Message> {
        const adminCode = isAdmin ? getAdminCode() : undefined;
        const url = adminCode ? `${this.baseUrl}?adminCode=${adminCode}` : this.baseUrl;
        
        return postJson<Message>(url, {
            id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
            userId: data.userId,
            name: data.username,
            message: data.content,
            timestamp: Date.now(),
            isAnonymous: !data.username,
            quotedMessageId: data.replyToId,
        });
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
     * Translate a message
     */
    async translateMessage(messageId: string, targetLanguage: string): Promise<string> {
        const response = await postJson<{ translation: string }>(
            `${this.baseUrl}/${messageId}/translate`,
            { targetLanguage }
        );
        return response.translation;
    }

    /**
     * Get global mute status
     */
    async getGlobalMuteStatus(): Promise<boolean> {
        const response = await fetchJson<{ isGlobalMute: boolean }>(`${this.baseUrl}/global-mute`);
        return response.isGlobalMute;
    }

    /**
     * Toggle global mute (admin only)
     */
    async toggleGlobalMute(enabled: boolean): Promise<void> {
        const adminCode = getAdminCode();
        if (!adminCode) throw new Error('Admin access required');

        return postJson<void>(
            this.buildUrl('/global-mute', { adminCode }),
            { enabled }
        );
    }

    /**
     * Clear all messages (admin only)
     */
    async clearAllMessages(): Promise<void> {
        const adminCode = getAdminCode();
        if (!adminCode) throw new Error('Admin access required');

        return postJson<void>(
            this.buildUrl('/clear', { adminCode }),
            {}
        );
    }

    /**
     * Get message statistics
     */
    async getMessageStats(): Promise<{
        totalMessages: number;
        messagesThisWeek: number;
        activeUsers: number;
    }> {
        return fetchJson<{
            totalMessages: number;
            messagesThisWeek: number;
            activeUsers: number;
        }>(`${this.baseUrl}/stats`);
    }
}