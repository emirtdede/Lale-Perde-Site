import { supabase } from '../../lib/supabaseClient';
import { mapProductFromDb, mapCategoryFromDb } from '../../context/dbMappers';
import MeasureWizardClient from './MeasureWizardClient';
import { Metadata } from 'next';

export const revalidate = 60; // ISR cache for 60 seconds

export const metadata: Metadata = {
  title: 'Lale Perde • Ölçü Sihirbazı',
  description: 'Evinizdeki perdelerin ölçüsünü nasıl alacağınızı öğrenin ve interaktif 2D panomuz üzerinden hızlıca fiyat teklifi alın.',
};

export default async function MeasureWizardPage() {
  // Fetch active products and categories securely on the server
  const [
    { data: rawProducts },
    { data: rawCats }
  ] = await Promise.all([
    supabase.from('products').select('*').eq('status', 'active').order('display_order', { ascending: true }),
    supabase.from('categories').select('*').eq('status', 'active').order('display_order', { ascending: true })
  ]);

  const products = (rawProducts || []).map(mapProductFromDb);
  const categories = (rawCats || []).map(mapCategoryFromDb);

  return (
    <MeasureWizardClient 
      initialProducts={products} 
      initialCategories={categories} 
    />
  );
}
