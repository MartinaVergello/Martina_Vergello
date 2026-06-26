import { supabase } from './supabase';

export async function createProfile(id, username) {
    const { data, error } = await supabase
        .from('profiles')
        .insert({
            id,
            username,
        })
        .select();

    if (error) {
        throw error;
    }

    return data[0];
}