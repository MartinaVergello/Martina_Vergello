import { supabase } from './Supabase';

const COMMENT_SELECT = `
    *,
    profiles (
        username
    )
`;

export async function getComments(postId) {
    const { data, error } = await supabase
        .from('comments')
        .select(COMMENT_SELECT)
        .eq('post_id', postId)
        .order('created_at');

    if (error) throw error;

    return data;
}

export async function getCommentById(commentId) {
    const { data, error } = await supabase
        .from('comments')
        .select(COMMENT_SELECT)
        .eq('id', commentId)
        .single();

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
        .select(COMMENT_SELECT)
        .single();

    if (error) throw error;

    return data;
}

export function subscribeToComments(postId, callback) {
    const channel = supabase
        .channel(`comments-${postId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'comments',
                filter: `post_id=eq.${postId}`,
            },
            (payload) => callback(payload)
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}
