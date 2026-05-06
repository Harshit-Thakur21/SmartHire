import {useMutation, useQuery} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { sessionAPI } from '../src/api/sessions';

export const useCreateSession = () => {
    const result = useMutation({
        mutationKey: ['createSession'],
        mutationFn: sessionAPI.createSession,
        onSuccess: () => toast.success("Session created successfully!"),
        onError: (error) => toast.error(error.response?.data?.message || "Failed to create session."),
    });

    return result;
}

export const useActiveSessions = () => {
    const result = useQuery({
        queryKey: ['activeSessions'],
        queryFn: sessionAPI.getActiveSessions,
    })

    return result;
};

export const useMyRecentSessions = () => {
    const result = useQuery({
        queryKey: ['myRecentSessions'],
        queryFn: sessionAPI.getMyRecentSessions,
    })

    return result;
};

export const useSessionById = (id) => {
    const result = useQuery({
        queryKey: ['session', id],
        queryFn: () => sessionAPI.getSessionById(id),
        enabled: !!id,
        refetchInterval: 5000, // Refetch every 5 seconds to get real-time updates
    })

    return result;
};

export const useJoinSession = (id) => {
    return useMutation({
        mutationKey: ['joinSession'],
        mutationFn: sessionAPI.joinSession,
        onSuccess: () => toast.success("Joined session successfully!"),
        onError: (error) => toast.error(error.response?.data?.message || "Failed to join session."),
    })

    return result;
};

export const useEndSession = (id) => {
    return useMutation({
        mutationKey: ['endSession'],
        mutationFn: sessionAPI.endSession,
        onSuccess: () => toast.success("Session ended successfully!"),
        onError: (error) => toast.error(error.response?.data?.message || "Failed to end session."),
    })

    return result;
};