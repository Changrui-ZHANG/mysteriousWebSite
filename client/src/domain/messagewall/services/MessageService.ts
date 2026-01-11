import { MessageRepository } from '../repositories/MessageRepository';
import { validateMessageData } from '../schemas/messageSchemas';
import { AppError, ERROR_CODES } from '../../../shared/utils/errorHandling';
import type { Message } from '../types';

interface CreateMessageData {
    content: string;
    userId: string;
    username: string;
    replyToId?: string;
}

/**
 * Service for message business logic
 * Handles validation, orchestration, and business rules
 * Uses MessageRepository for data access
 */
export class MessageService {
    private repository: MessageRepository;

    constructor() {
        this.repository = new MessageRepository();
    }

    /**
     * Submit a new message with validation and business logic
     */
    async submitMessage(data: CreateMessageData, isAdmin: boolean = false): Promise<Message> {
        // Validate input data
        const validation = validateMessageData(data);
        if (!validation.success) {
            throw new AppError(
                'Invalid message data',
                ERROR_CODES.VALIDATION_ERROR,
                'Les données du message sont invalides',
                validation.error
            );
        }

        // Business logic: Check content length and sanitize
        const sanitizedData = {
            ...data,
            content: data.content.trim(),
            username: data.username?.trim() || '',
        };

        // Delegate to repository for data persistence
        return this.repository.submitMessage(sanitizedData, isAdmin);
    }

    /**
     * Delete a message with authorization checks
     */
    async deleteMessage(messageId: string, userId: string, isAdmin: boolean = false): Promise<void> {
        if (!messageId || !userId) {
            throw new AppError(
                'Missing required parameters',
                ERROR_CODES.INVALID_INPUT,
                'Paramètres manquants pour supprimer le message'
            );
        }

        return this.repository.deleteMessage(messageId, userId, isAdmin);
    }

    /**
     * Translate a message with caching logic
     */
    async translateMessage(messageId: string, targetLanguage: string): Promise<string> {
        if (!messageId || !targetLanguage) {
            throw new AppError(
                'Missing translation parameters',
                ERROR_CODES.INVALID_INPUT,
                'Paramètres de traduction manquants'
            );
        }

        try {
            // Business logic: Could add caching here in the future
            return await this.repository.translateMessage(messageId, targetLanguage);
        } catch (error) {
            // Translation not implemented in backend yet
            throw new AppError(
                'Translation service not available',
                ERROR_CODES.OPERATION_FAILED,
                'Service de traduction non disponible pour le moment'
            );
        }
    }

    /**
     * Toggle global mute with admin authorization
     */
    async toggleGlobalMute(enabled: boolean): Promise<void> {
        return this.repository.toggleGlobalMute(enabled);
    }

    /**
     * Get global mute status
     */
    async getGlobalMuteStatus(): Promise<boolean> {
        return this.repository.getGlobalMuteStatus();
    }

    /**
     * Get messages with business logic filtering
     */
    async getMessages(filters?: {
        userId?: string;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
        offset?: number;
    }): Promise<Message[]> {
        // Business logic: Apply default limits, sanitize filters
        const sanitizedFilters = filters ? {
            ...filters,
            limit: Math.min(filters.limit || 50, 100), // Max 100 messages
            offset: Math.max(filters.offset || 0, 0),
        } : undefined;

        return this.repository.getMessages(sanitizedFilters);
    }

    /**
     * Clear all messages (admin only)
     */
    async clearAllMessages(): Promise<void> {
        return this.repository.clearAllMessages();
    }

    /**
     * Get message statistics with business logic
     */
    async getMessageStats(): Promise<{
        totalMessages: number;
        messagesThisWeek: number;
        activeUsers: number;
    }> {
        return this.repository.getMessageStats();
    }
}