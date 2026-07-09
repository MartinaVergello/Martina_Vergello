import { supabase } from './Supabase';

export async function createProfile(id, username) {
    const { data, error } = await supabase
        .from('profiles')
        .upsert({
            id,
            username,
        })
        .select()
        .single();

    if (error) throw error;

    return data;
}

export async function getProfileById(id) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) throw error;

    return data;
}

export async function updateProfile(id, profileData) {
    const { data, error } = await supabase
        .from('profiles')
        .upsert({
            id,
            username: profileData.username,
            bio: profileData.bio,
            avatar: profileData.avatar,
        })
        .select()
        .single();

    if (error) throw error;

    return data;
}

export async function uploadAvatar(file, userId) {
    const fileName = userId + '-' + Date.now() + '-' + file.name;

    const { error } = await supabase
        .storage
        .from('avatars')
        .upload(fileName, file);

    if (error) throw error;

    const { data } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(fileName);

    return data.publicUrl;
}
