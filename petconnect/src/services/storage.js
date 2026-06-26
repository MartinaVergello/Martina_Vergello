import { supabase } from './supabase';

export async function uploadPostImage(file) {
    const fileName = Date.now() + '-' + file.name;

    const { error } = await supabase
        .storage
        .from('post-images')
        .upload(fileName, file);

    if (error) throw error;

    const { data } = supabase
        .storage
        .from('post-images')
        .getPublicUrl(fileName);

    return data.publicUrl;
}