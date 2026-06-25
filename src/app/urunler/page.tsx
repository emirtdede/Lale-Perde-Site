import { supabase } from '../../lib/supabaseClient';
import { mapProductFromDb, mapCategoryFromDb, mapCurtainTypeFromDb, mapFabricTypeFromDb } from '../../context/dbMappers';
import ProductsCatalogClient from './ProductsCatalogClient';
import { Metadata } from 'next';

export const revalidate = 60; // ISR cache for 60 seconds

export const metadata: Metadata = {
  title: 'Lale Perde • Ürün Kataloğu',
  description: 'Doğal dokular, zarif renkler ve modern tasarımlarla eviniz için en iyi perde seçeneklerini inceleyin.',
};

export default async function ProductsCatalogPage() {
  let products: any[] = [];
  let categories: any[] = [];
  let curtainTypes: any[] = [];
  let fabricTypes: any[] = [];

  try {
    const [
      productsRes,
      catsRes,
      curtainsRes,
      fabricsRes
    ] = await Promise.all([
      supabase.from('products').select('*').eq('status', 'active').order('display_order', { ascending: true }),
      supabase.from('categories').select('*').eq('status', 'active').order('display_order', { ascending: true }),
      supabase.from('curtain_types').select('*').eq('status', 'active').order('display_order', { ascending: true }),
      supabase.from('fabric_types').select('*').eq('status', 'active').order('display_order', { ascending: true })
    ]);

    if (productsRes.error) console.error('Products error:', productsRes.error);
    if (catsRes.error) console.error('Categories error:', catsRes.error);
    if (curtainsRes.error) console.error('Curtains error:', curtainsRes.error);
    if (fabricsRes.error) console.error('Fabrics error:', fabricsRes.error);

    products = (productsRes.data || []).map(mapProductFromDb);
    categories = (catsRes.data || []).map(mapCategoryFromDb);
    curtainTypes = (curtainsRes.data || []).map(mapCurtainTypeFromDb);
    fabricTypes = (fabricsRes.data || []).map(mapFabricTypeFromDb);
  } catch (err) {
    console.error('Products catalog SSR data fetching error:', err);
  }

  return (
    <ProductsCatalogClient 
      initialProducts={products} 
      initialCategories={categories} 
      initialCurtainTypes={curtainTypes}
      initialFabricTypes={fabricTypes}
    />
  );
}
