'use server';

import { supabaseAdmin, verifyAdminSession } from './utils';

// --- SERVICES ---
export async function addServiceAction(data: any) {
  try {
    await verifyAdminSession();
    const { data: result, error } = await supabaseAdmin.from('services').insert([data]).select();
    if (error) return { error: error.message };
    return { data: result };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateServiceAction(id: string, data: any) {
  try {
    await verifyAdminSession();
    const { data: result, error } = await supabaseAdmin.from('services').update(data).eq('id', id).select();
    if (error) return { error: error.message };
    return { data: result };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteServiceAction(id: string) {
  try {
    await verifyAdminSession();
    const { error } = await supabaseAdmin.from('services').delete().eq('id', id);
    if (error) return { error: error.message };
    return { data: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// --- GUIDES ---
export async function addGuideAction(data: any) {
  try {
    await verifyAdminSession();
    const { data: result, error } = await supabaseAdmin.from('guides').insert([data]).select();
    if (error) return { error: error.message };
    return { data: result };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateGuideAction(id: string, data: any) {
  try {
    await verifyAdminSession();
    const { data: result, error } = await supabaseAdmin.from('guides').update(data).eq('id', id).select();
    if (error) return { error: error.message };
    return { data: result };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteGuideAction(id: string) {
  try {
    await verifyAdminSession();
    const { error } = await supabaseAdmin.from('guides').delete().eq('id', id);
    if (error) return { error: error.message };
    return { data: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// --- CAMPAIGNS ---
export async function addCampaignAction(data: any) {
  try {
    await verifyAdminSession();
    const { data: result, error } = await supabaseAdmin.from('campaigns').insert([data]).select();
    if (error) return { error: error.message };
    return { data: result };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateCampaignAction(id: string, data: any) {
  try {
    await verifyAdminSession();
    const { data: result, error } = await supabaseAdmin.from('campaigns').update(data).eq('id', id).select();
    if (error) return { error: error.message };
    return { data: result };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteCampaignAction(id: string) {
  try {
    await verifyAdminSession();
    const { error } = await supabaseAdmin.from('campaigns').delete().eq('id', id);
    if (error) return { error: error.message };
    return { data: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// --- INBOX ---
export async function updateInboxMessageAction(id: string, data: any) {
  try {
    await verifyAdminSession();
    const { data: result, error } = await supabaseAdmin.from('inbox').update(data).eq('id', id).select();
    if (error) return { error: error.message };
    return { data: result };
  } catch (err: any) {
    return { error: err.message };
  }
}
