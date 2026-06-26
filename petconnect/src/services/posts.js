import { supabase } from './supabase';

export async function getPosts() {
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            profiles (
                username,
                avatar
            )
        `)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data;
}

export async function getPostsByUser(userId) {
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            profiles (
                username,
                avatar
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data;
}

export async function createPost(userId, content, image = null) {
    const { data, error } = await supabase
        .from('posts')
        .insert({
            user_id: userId,
            content,
            image,
        })
        .select();

    if (error) throw error;

    return data[0];
}

export async function updatePost(postId, content) {
    const { data, error } = await supabase
        .from('posts')
        .update({ content })
        .eq('id', postId)
        .select();

    if (error) throw error;

    return data[0];
}

export async function deletePost(postId) {
    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

    if (error) throw error;
}

export function subscribeToPosts(callback) {
    const channel = supabase
        .channel('posts')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'posts',
            },
            () => callback()
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}