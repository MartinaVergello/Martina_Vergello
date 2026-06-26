import { supabase } from './supabase';

export async function getComments(postId) {
    const { data, error } = await supabase
        .from('comments')
        .select(`
            *,
            profiles (
                username
            )
        `)
        .eq('post_id', postId)
        .order('created_at');

    if (error) throw error;

    return data;
}

export async function createComment(postId, userId, content) {
    const { data, error } = await supabase
        .from('comments')
        .insert({
            post_id: postId,
            user_id: userId,
            content,
        })
        .select();

    if (error) throw error;

    return data[0];
}

export function subscribeToComments(postId, callback) {
    const channel = supabase
        .channel('comments-' + postId)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'comments',
                filter: 'post_id=eq.' + postId,
            },
            () => callback()
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}