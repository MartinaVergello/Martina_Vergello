import { supabase } from './supabase';

export async function getLikesByPost(postId) {
    const { data, error } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', postId);

    if (error) throw error;

    return data;
}

export async function likePost(postId, userId) {
    const { data, error } = await supabase
        .from('likes')
        .insert({
            post_id: postId,
            user_id: userId,
        })
        .select();

    if (error) throw error;

    return data[0];
}

export async function unlikePost(postId, userId) {
    const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

    if (error) throw error;
}

export function subscribeToLikes(postId, callback) {
    const channel = supabase
        .channel('likes-' + postId)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'likes',
                filter: 'post_id=eq.' + postId,
            },
            () => callback()
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}