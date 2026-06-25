'use server';

import { supabaseAdmin, verifyAdminSession } from './utils';

export async function addProductAction(data: any) {
  try {
    await verifyAdminSession();
    const {
      name_tr, name_en, category_tr, category_en, category_id,
      description_tr, description_en, colors, fabric_type_tr, fabric_type_en,
      price_multiplier, popularity, images, tech_specs_tr, tech_specs_en,
      status, cover_image, display_order, curtain_type_id, fabric_type_id,
      mounting_type_ids
    } = data || {};

    const safeData = {
      name_tr, name_en, category_tr, category_en, category_id,
      description_tr, description_en, colors, fabric_type_tr, fabric_type_en,
      price_multiplier, popularity, images, tech_specs_tr, tech_specs_en,
      status, cover_image, display_order, curtain_type_id, fabric_type_id,
      mounting_type_ids
    };

    const { data: result, error } = await supabaseAdmin.from('products').insert([safeData]).select();
    if (error) return { error: error.message };
    return { data: result };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateProductAction(id: string, data: any) {
  try {
    if (typeof id !== 'string' || !id) throw new Error('Geçersiz ID.');
    await verifyAdminSession();
    const {
      name_tr, name_en, category_tr, category_en, category_id,
      description_tr, description_en, colors, fabric_type_tr, fabric_type_en,
      price_multiplier, popularity, images, tech_specs_tr, tech_specs_en,
      status, cover_image, display_order, curtain_type_id, fabric_type_id,
      mounting_type_ids
    } = data || {};

    const safeData = {
      name_tr, name_en, category_tr, category_en, category_id,
      description_tr, description_en, colors, fabric_type_tr, fabric_type_en,
      price_multiplier, popularity, images, tech_specs_tr, tech_specs_en,
      status, cover_image, display_order, curtain_type_id, fabric_type_id,
      mounting_type_ids
    };

    const { data: result, error } = await supabaseAdmin.from('products').update(safeData).eq('id', id).select();
    if (error) return { error: error.message };
    return { data: result };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteProductAction(id: string) {
  try {
    if (typeof id !== 'string' || !id) throw new Error('Geçersiz ID.');
    await verifyAdminSession();
    const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
    if (error) return { error: error.message };
    return { data: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
