import { z } from 'zod';
import { IdSchema, TimestampSchema, UsernameSchema } from '../../../shared/schemas/validation';

/**
 * Validation schemas for message domain
 */

// Message content validation
export const MessageContentSchema = z.string()
    .min(1, 'Message cannot be empty')
    .max(500, 'Message must be less than 500 characters')
    .trim();

// Message schema
export const MessageSchema = z.object({
    id: IdSchema,
    userId: IdSchema,
    name: UsernameSchema,
    message: MessageContentSchema,
    timestamp: TimestampSchema,
    isAnonymous: z.boolean().default(false),
    quotedMessageId: IdSchema.optional(),
});

export type Message = z.infer<typeof MessageSchema>;

// Create message request schema
export const CreateMessageSchema = z.object({
    content: MessageContentSchema,
    userId: IdSchema,
    username: UsernameSchema.optional(),
    replyToId: IdSchema.optional(),
    isAnonymous: z.boolean().default(false),
});

export type CreateMessageRequest = z.infer<typeof CreateMessageSchema>;

// Message filters schema
export const MessageFiltersSchema = z.object({
    userId: IdSchema.optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    limit: z.number().int().positive().max(100).default(50),
    offset: z.number().int().nonnegative().default(0),
    includeAnonymous: z.boolean().default(true),
}).refine(
    (data) => !data.startDate || !data.endDate || data.startDate <= data.endDate,
    {
        message: 'Start date must be before or equal to end date',
        path: ['endDate'],
    }
);

export type MessageFilters = z.infer<typeof MessageFiltersSchema>;

// Translation request schema
export const TranslationRequestSchema = z.object({
    messageId: IdSchema,
    targetLanguage: z.string()
        .min(2, 'Language code must be at least 2 characters')
        .max(10, 'Language code must be less than 10 characters')
        .regex(/^[a-z]{2}(-[A-Z]{2})?$/, 'Invalid language code format'),
});

export type TranslationRequest = z.infer<typeof TranslationRequestSchema>;

// Translation response schema
export const TranslationResponseSchema = z.object({
    translation: z.string(),
    sourceLanguage: z.string().optional(),
    confidence: z.number().min(0).max(1).optional(),
});

export type TranslationResponse = z.infer<typeof TranslationResponseSchema>;

// Admin action schemas
export const AdminActionSchema = z.object({
    adminCode: z.string().min(1, 'Admin code is required'),
    action: z.enum(['mute', 'unmute', 'clear', 'delete']),
    targetId: IdSchema.optional(),
});

export type AdminAction = z.infer<typeof AdminActionSchema>;

// Global mute status schema
export const GlobalMuteStatusSchema = z.object({
    isGlobalMute: z.boolean(),
    mutedBy: z.string().optional(),
    mutedAt: TimestampSchema.optional(),
});

export type GlobalMuteStatus = z.infer<typeof GlobalMuteStatusSchema>;

// Message statistics schema
export const MessageStatsSchema = z.object({
    totalMessages: z.number().int().nonnegative(),
    messagesThisWeek: z.number().int().nonnegative(),
    messagesThisMonth: z.number().int().nonnegative(),
    activeUsers: z.number().int().nonnegative(),
    averageMessagesPerUser: z.number().nonnegative(),
    mostActiveUser: z.object({
        userId: IdSchema,
        username: UsernameSchema,
        messageCount: z.number().int().nonnegative(),
    }).optional(),
});

export type MessageStats = z.infer<typeof MessageStatsSchema>;

// WebSocket message schemas
export const WebSocketMessageSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('NEW_MESSAGE'),
        payload: MessageSchema,
    }),
    z.object({
        type: z.literal('DELETE_MESSAGE'),
        payload: IdSchema,
    }),
    z.object({
        type: z.literal('MUTE_STATUS'),
        payload: z.boolean(),
    }),
    z.object({
        type: z.literal('CLEAR_ALL'),
        payload: z.null(),
    }),
]);

export type WebSocketMessage = z.infer<typeof WebSocketMessageSchema>;

// Validation helpers
export const validateMessage = (data: unknown) => {
    return MessageSchema.safeParse(data);
};

export const validateCreateMessage = (data: unknown) => {
    return CreateMessageSchema.safeParse(data);
};

export const validateMessageFilters = (data: unknown) => {
    return MessageFiltersSchema.safeParse(data);
};

export const validateTranslationRequest = (data: unknown) => {
    return TranslationRequestSchema.safeParse(data);
};