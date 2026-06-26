'use server';

import { supabaseAdmin, verifyAdminSession } from './utils';

// --- CATEGORIES ---
export async function addCategoryAction(data: any) {
  try {
    await verifyAdminSession();
    const { id, name_tr, name_en, image, images, status, display_order, description_tr, description_en, slug } = data || {};
    const safeData = { id, name_tr, name_en, image, images, status, display_order, description_tr, description_en, slug };
    const { data: result, error } = await supabaseAdmin.from('categories').insert([safeData]).select();
    if (error) return { error: error.message };
    return { data: result };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateCategoryAction(id: string, data: any) {
  try {
    if (typeof id !== 'string' || !id) throw new Error('Geçersiz ID.');
    await verifyAdminSession();
    const { name_tr, name_en, image, images, status, display_order, description_tr, description_en, slug } = data || {};
    const safeData = { name_tr, name_en, image, images, status, display_order, description_tr, description_en, slug };
    const { data: result, error } = await supabaseAdmin.from('categories').update(safeData).eq('id', id).select();
    if (error) return { error: error.message };
    return { data: result };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    if (typeof id !== 'string' || !id) throw new Error('Geçersiz ID.');
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
    const { category_id, name_tr, name_en, slug, display_order, status } = data || {};
    const safeData = { category_id, name_tr, name_en, slug, display_order, status };
    const { data: result, error } = await supabaseAdmin.from('curtain_types').insert([safeData]).select();
    if (error) return { error: error.message };
    return { data: result };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateCurtainTypeAction(id: string, data: any) {
  try {
    if (typeof id !== 'string' || !id) throw new Error('Geçersiz ID.');
    await verifyAdminSession();
    const { category_id, name_tr, name_en, slug, display_order, status } = data || {};
    const safeData = { category_id, name_tr, name_en, slug, display_order, status };
    const { data: result, error } = await supabaseAdmin.from('curtain_types').update(safeData).eq('id', id).select();
    if (error) return { error: error.message };
    return { data: result };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteCurtainTypeAction(id: string) {
  try {
    if (typeof id !== 'string' || !id) throw new Error('Geçersiz ID.');
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
    const { category_id, name_tr, name_en, slug, display_order, status } = data || {};
    const safeData = { category_id, name_tr, name_en, slug, display_order, status };
    const { data: result, error } = await supabaseAdmin.from('fabric_types').insert([safeData]).select();
    if (error) return { error: error.message };
    return { data: result };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateFabricTypeAction(id: string, data: any) {
  try {
    if (typeof id !== 'string' || !id) throw new Error('Geçersiz ID.');
    await verifyAdminSession();
    const { category_id, name_tr, name_en, slug, display_order, status } = data || {};
    const safeData = { category_id, name_tr, name_en, slug, display_order, status };
    const { data: result, error } = await supabaseAdmin.from('fabric_types').update(safeData).eq('id', id).select();
    if (error) return { error: error.message };
    return { data: result };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteFabricTypeAction(id: string) {
  try {
    if (typeof id !== 'string' || !id) throw new Error('Geçersiz ID.');
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
    const { category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order, status } = data || {};
    const safeData = { category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order, status };
    const { data: result, error } = await supabaseAdmin.from('mounting_types').insert([safeData]).select();
    if (error) return { error: error.message };
    return { data: result };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateMountingTypeAction(id: string, data: any) {
  try {
    if (typeof id !== 'string' || !id) throw new Error('Geçersiz ID.');
    await verifyAdminSession();
    const { category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order, status } = data || {};
    const safeData = { category_id, curtain_type_id, name_tr, name_en, description_tr, description_en, display_order, status };
    const { data: result, error } = await supabaseAdmin.from('mounting_types').update(safeData).eq('id', id).select();
    if (error) return { error: error.message };
    return { data: result };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteMountingTypeAction(id: string) {
  try {
    if (typeof id !== 'string' || !id) throw new Error('Geçersiz ID.');
    await verifyAdminSession();
    const { error } = await supabaseAdmin.from('mounting_types').delete().eq('id', id);
    if (error) return { error: error.message };
    return { data: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
