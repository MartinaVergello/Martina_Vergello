import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tkhjbdpunshehlsbuzgw.supabase.co';
const supabaseKey = 'sb_publishable_GTDoIR72mphHozah1MzKwg_cDx86h04';

export const supabase = createClient(supabaseUrl, supabaseKey);