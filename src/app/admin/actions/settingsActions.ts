'use server';

import { supabaseAdmin, verifyAdminSession } from './utils';

// --- SITE SETTINGS ---
export async function updateSettingsAction(data: any) {
  try {
    await verifyAdminSession();
    const { data: result, error } = await supabaseAdmin.from('site_settings').update(data).eq('id', 'main_settings').select();
    if (error) return { error: error.message };
    return { data: result };
  } catch (err: any) {
    return { error: err.message };
  }
}

// --- HOME PAGE CONTENT ---
export async function updateHomeContentAction(data: any) {
  try {
    await verifyAdminSession();
    const { data: result, error } = await supabaseAdmin.from('home_page_content').update(data).eq('id', 'home_content').select();
    if (error) return { error: error.message };
    return { data: result };
  } catch (err: any) {
    return { error: err.message };
  }
}
