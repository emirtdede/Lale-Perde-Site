'use server';

import { supabaseAdmin, verifyAdminSession } from './utils';

// --- CATEGORIES ---
export async function addCategoryAction(data: any) {
  try {
    await verifyAdminSession();
    const { data: result, error } = await supabaseAdmin.from('categories').insert([data]).select();
    if (error) return { error: error.message };
    return { data: result };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateCategoryAction(id: string, data: any) {
  try {
    await verifyAdminSession();
    const { data: result, error } = await supabaseAdmin.from('categories').update(data).eq('id', id).select();
    if (error) return { error: error.message };
    return { data: result };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    await verifyAdminSession();
    const { error } = await supabaseAdmin.from('categories').delete().eq('id', id);
    if (error) return { error: error.message };
    return { data: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// --- CURTAIN TYPES ---
export async function addCurtainTypeAction(data: any) {
  try {
    await verifyAdminSession();
    const { data: result, error } = await supabaseAdmin.from('curtain_types').insert([data]).select();
    if (error) return { error: error.message };
    return { data: result };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateCurtainTypeAction(id: string, data: any) {
  try {
    await verifyAdminSession();
    const { data: result, error } = await supabaseAdmin.from('curtain_types').update(data).eq('id', id).select();
    if (error) return { error: error.message };
    return { data: result };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteCurtainTypeAction(id: string) {
  try {
    await verifyAdminSession();
    const { error } = await supabaseAdmin.from('curtain_types').delete().eq('id', id);
    if (error) return { error: error.message };
    return { data: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// --- FABRIC TYPES ---
export async function addFabricTypeAction(data: any) {
  try {
    await verifyAdminSession();
    const { data: result, error } = await supabaseAdmin.from('fabric_types').insert([data]).select();
    if (error) return { error: error.message };
    return { data: result };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateFabricTypeAction(id: string, data: any) {
  try {
    await verifyAdminSession();
    const { data: result, error } = await supabaseAdmin.from('fabric_types').update(data).eq('id', id).select();
    if (error) return { error: error.message };
    return { data: result };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteFabricTypeAction(id: string) {
  try {
    await verifyAdminSession();
    const { error } = await supabaseAdmin.from('fabric_types').delete().eq('id', id);
    if (error) return { error: error.message };
    return { data: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// --- MOUNTING TYPES ---
export async function addMountingTypeAction(data: any) {
  try {
    await verifyAdminSession();
    const { data: result, error } = await supabaseAdmin.from('mounting_types').insert([data]).select();
    if (error) return { error: error.message };
    return { data: result };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateMountingTypeAction(id: string, data: any) {
  try {
    await verifyAdminSession();
    const { data: result, error } = await supabaseAdmin.from('mounting_types').update(data).eq('id', id).select();
    if (error) return { error: error.message };
    return { data: result };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteMountingTypeAction(id: string) {
  try {
    await verifyAdminSession();
    const { error } = await supabaseAdmin.from('mounting_types').delete().eq('id', id);
    if (error) return { error: error.message };
    return { data: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
