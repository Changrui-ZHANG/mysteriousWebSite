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

interface TranslateMessageData {
    messageId: string;
    targetLanguage: string;
}

/**
 * Service for message-related API operations
 * Extends BaseService for standard CRUD operations
 */
export class MessageService extends BaseService<Message, CreateMessageData> {
    constructor() {
        super(API_ENDPOINTS.MESSAGES.LIST);
    }

    /**
     * Submit a new message
     */
    async submitMessage(data: CreateMessageData): Promise<Message> {
        return this.create(data);
    }

    /**
     * Delete a message (admin only)
     */
    async deleteMessage(messageId: string): Promise<void> {
        const adminCode = getAdminCode();
        return deleteJson<void>(`${this.baseUrl}/${messageId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-Admin-Code': adminCode || '',
            },
        });
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
     * Toggle global mute (admin only)
     */
    async toggleGlobalMute(enabled: boolean): Promise<void> {
        const adminCode = getAdminCode();
        return postJson<void>(`${this.baseUrl}/global-mute`, 
            { enabled },
            {
                headers: {
                    'X-Admin-Code': adminCode || '',
                },
            }
        );
    }

    /**
     * Get global mute status
     */
    async getGlobalMuteStatus(): Promise<boolean> {
        const response = await fetchJson<{ isGlobalMute: boolean }>(`${this.baseUrl}/global-mute`);
        return response.isGlobalMute;
    }
}