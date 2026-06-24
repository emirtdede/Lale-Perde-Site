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
  // Fetch active products and categories securely on the server
  const [
    { data: rawProducts },
    { data: rawCats },
    { data: rawCurtains },
    { data: rawFabrics }
  ] = await Promise.all([
    supabase.from('products').select('*').eq('status', 'active').order('display_order', { ascending: true }),
    supabase.from('categories').select('*').eq('status', 'active').order('display_order', { ascending: true }),
    supabase.from('curtain_types').select('*').eq('status', 'active').order('display_order', { ascending: true }),
    supabase.from('fabric_types').select('*').eq('status', 'active').order('display_order', { ascending: true })
  ]);

  const products = (rawProducts || []).map(mapProductFromDb);
  const categories = (rawCats || []).map(mapCategoryFromDb);
  const curtainTypes = (rawCurtains || []).map(mapCurtainTypeFromDb);
  const fabricTypes = (rawFabrics || []).map(mapFabricTypeFromDb);

  return (
    <ProductsCatalogClient 
      initialProducts={products} 
      initialCategories={categories} 
      initialCurtainTypes={curtainTypes}
      initialFabricTypes={fabricTypes}
    />
  );
}
