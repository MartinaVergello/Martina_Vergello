import { supabase } from './Supabase';

let user = null;
let observers = [];

export function subscribeToAuth(callback) {
    observers.push(callback);
    callback(user);

    return () => {
        observers = observers.filter(observer => observer !== callback);
    };
}

function notifyAll() {
    observers.forEach(callback => callback(user));
}

export function getAuthErrorMessage(error) {
    if (error.status === 429) {
        return 'Demasiados intentos seguidos. Esperá unos minutos y probá de nuevo.';
    }

    return error.message;
}

export async function register(email, password, username) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { username },
        },
    });

    if (error) throw error;

    user = data.session?.user || data.user;
    notifyAll();

    return user;
}

export async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;

    user = data.user;
    notifyAll();

    return data.user;
}

export async function updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({
        password: newPassword,
    });

    if (error) throw error;
}

export async function logout() {
    await supabase.auth.signOut();

    user = null;
    notifyAll();
}

export async function getCurrentUser() {
    const { data } = await supabase.auth.getUser();

    user = data.user;
    notifyAll();

    return user;
}

export function getLoggedUser() {
    return user;
}
