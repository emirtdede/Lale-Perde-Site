'use server';

import { supabaseAdmin, verifyAdminSession } from './utils';

export async function addProductAction(data: any) {
  try {
    await verifyAdminSession();
    const { data: result, error } = await supabaseAdmin.from('products').insert([data]).select();
    if (error) return { error: error.message };
    return { data: result };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateProductAction(id: string, data: any) {
  try {
    await verifyAdminSession();
    const { data: result, error } = await supabaseAdmin.from('products').update(data).eq('id', id).select();
    if (error) return { error: error.message };
    return { data: result };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteProductAction(id: string) {
  try {
    await verifyAdminSession();
    const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
    if (error) return { error: error.message };
    return { data: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
