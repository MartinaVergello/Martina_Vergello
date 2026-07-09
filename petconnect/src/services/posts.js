import { supabase } from './Supabase';

const POST_SELECT = `
    *,
    profiles (
        username,
        avatar
    )
`;

export function upsertPostInList(posts, post) {
    const index = posts.findIndex(item => item.id === post.id);

    if (index === -1) {
        posts.unshift(post);
        return posts;
    }

    posts[index] = {
        ...posts[index],
        ...post,
    };

    return posts;
}

export function removePostFromList(posts, postId) {
    return posts.filter(post => post.id !== postId);
}

export async function getPosts() {
    const { data, error } = await supabase
        .from('posts')
        .select(POST_SELECT)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data;
}

export async function getPostById(postId) {
    const { data, error } = await supabase
        .from('posts')
        .select(POST_SELECT)
        .eq('id', postId)
        .single();

    if (error) throw error;

    return data;
}

export async function getPostsByUser(userId) {
    const { data, error } = await supabase
        .from('posts')
        .select(POST_SELECT)
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
        .select(POST_SELECT)
        .single();

    if (error) throw error;

    return data;
}

export async function updatePost(postId, content) {
    const { data, error } = await supabase
        .from('posts')
        .update({ content })
        .eq('id', postId)
        .select(POST_SELECT)
        .single();

    if (error) throw error;

    return data;
}

export async function deletePost(postId) {
    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

    if (error) throw error;
}

export function subscribeToPosts(callback, userId = null) {
    const channelName = userId ? `posts-user-${userId}` : 'posts-all';
    const config = {
        event: '*',
        schema: 'public',
        table: 'posts',
    };

    if (userId) {
        config.filter = `user_id=eq.${userId}`;
    }

    const channel = supabase
        .channel(channelName)
        .on('postgres_changes', config, (payload) => callback(payload))
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}

export async function applyPostChange(posts, payload, fetchPost) {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    if (eventType === 'INSERT') {
        if (posts.some(post => post.id === newRecord.id)) {
            return posts;
        }

        const post = await fetchPost(newRecord.id);
        return upsertPostInList([...posts], post);
    }

    if (eventType === 'UPDATE') {
        const index = posts.findIndex(post => post.id === newRecord.id);

        if (index === -1) {
            const post = await fetchPost(newRecord.id);
            return upsertPostInList([...posts], post);
        }

        const updated = [...posts];
        updated[index] = {
            ...updated[index],
            ...newRecord,
        };

        return updated;
    }

    if (eventType === 'DELETE') {
        return removePostFromList(posts, oldRecord.id);
    }

    return posts;
}
