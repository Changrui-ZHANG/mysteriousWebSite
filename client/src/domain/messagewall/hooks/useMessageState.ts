import { useReducer, useCallback } from 'react';
import type { Message } from '../types';

// State interface
interface MessageState {
    messages: Message[];
    replyingTo: Message | null;
    highlightedMessageId: string | null;
    isGlobalMute: boolean;
    isLoading: boolean;
}

// Action types
type MessageAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_MESSAGES'; payload: Message[] }
    | { type: 'ADD_MESSAGE'; payload: Message }
    | { type: 'DELETE_MESSAGE'; payload: string }
    | { type: 'CLEAR_MESSAGES' }
    | { type: 'SET_REPLYING_TO'; payload: Message | null }
    | { type: 'SET_HIGHLIGHTED_MESSAGE'; payload: string | null }
    | { type: 'SET_GLOBAL_MUTE'; payload: boolean };

// Initial state
const initialState: MessageState = {
    messages: [],
    replyingTo: null,
    highlightedMessageId: null,
    isGlobalMute: false,
    isLoading: false,
};

// Reducer function
function messageReducer(state: MessageState, action: MessageAction): MessageState {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
            
        case 'SET_MESSAGES':
            return { ...state, messages: action.payload, isLoading: false };
            
        case 'ADD_MESSAGE':
            return { 
                ...state, 
                messages: [...state.messages, action.payload] 
            };
            
        case 'DELETE_MESSAGE':
            return { 
                ...state, 
                messages: state.messages.filter(m => m.id !== action.payload) 
            };
            
        case 'CLEAR_MESSAGES':
            return { ...state, messages: [] };
            
        case 'SET_REPLYING_TO':
            return { ...state, replyingTo: action.payload };
            
        case 'SET_HIGHLIGHTED_MESSAGE':
            return { ...state, highlightedMessageId: action.payload };
            
        case 'SET_GLOBAL_MUTE':
            return { ...state, isGlobalMute: action.payload };
            
        default:
            return state;
    }
}

/**
 * Hook for managing message state with useReducer
 * Consolidates related state variables and provides clean actions
 */
export function useMessageState() {
    const [state, dispatch] = useReducer(messageReducer, initialState);

    // Action creators
    const actions = {
        setLoading: useCallback((loading: boolean) => {
            dispatch({ type: 'SET_LOADING', payload: loading });
        }, []),

        setMessages: useCallback((messages: Message[]) => {
            dispatch({ type: 'SET_MESSAGES', payload: messages });
        }, []),

        addMessage: useCallback((message: Message) => {
            dispatch({ type: 'ADD_MESSAGE', payload: message });
        }, []),

        deleteMessage: useCallback((messageId: string) => {
            dispatch({ type: 'DELETE_MESSAGE', payload: messageId });
        }, []),

        clearMessages: useCallback(() => {
            dispatch({ type: 'CLEAR_MESSAGES' });
        }, []),

        setReplyingTo: useCallback((message: Message | null) => {
            dispatch({ type: 'SET_REPLYING_TO', payload: message });
        }, []),

        setHighlightedMessage: useCallback((messageId: string | null) => {
            dispatch({ type: 'SET_HIGHLIGHTED_MESSAGE', payload: messageId });
        }, []),

        setGlobalMute: useCallback((muted: boolean) => {
            dispatch({ type: 'SET_GLOBAL_MUTE', payload: muted });
        }, []),
    };

    return {
        state,
        actions,
    };
}

export default useMessageState;