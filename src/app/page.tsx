import { supabase } from '../lib/supabaseClient';
import HomeClient from './HomeClient';
import { 
  mapCategoryFromDb, 
  mapSettingsFromDb, 
  mapHomeContentFromDb, 
  mapServiceFromDb,
  mapProductFromDb
} from '../context/dbMappers';

export const revalidate = 60; // ISR cache for 60 seconds since it's a public landing page

export default async function Home() {
  let categories: any[] = [];
  let settings: any = null;
  let homeContent: any = null;
  let services: any[] = [];
  let products: any[] = [];

  try {
    const [
      catsRes,
      settingsRes,
      homeRes,
      servicesRes,
      productsRes
    ] = await Promise.all([
      supabase.from('categories').select('*').eq('status', 'active').order('display_order', { ascending: true }),
      supabase.from('site_settings').select('*').limit(1).single(),
      supabase.from('home_page_content').select('*').limit(1).single(),
      supabase.from('services').select('*').eq('status', 'active').order('display_order', { ascending: true }),
      supabase.from('products').select('*').eq('status', 'active').order('display_order', { ascending: true })
    ]);

    if (catsRes.error) console.error('Categories error:', catsRes.error);
    if (settingsRes.error) console.error('Settings error:', settingsRes.error);
    if (homeRes.error) console.error('Home content error:', homeRes.error);
    if (servicesRes.error) console.error('Services error:', servicesRes.error);
    if (productsRes.error) console.error('Products error:', productsRes.error);

    categories = (catsRes.data || []).map(mapCategoryFromDb);
    settings = settingsRes.data ? mapSettingsFromDb(settingsRes.data) : null;
    homeContent = homeRes.data ? mapHomeContentFromDb(homeRes.data) : null;
    services = (servicesRes.data || []).map(mapServiceFromDb);
    products = (productsRes.data || []).map(mapProductFromDb);
  } catch (err) {
    console.error('Home Page SSR data fetching error:', err);
  }

  return (
    <HomeClient 
      initialCategories={categories}
      initialSettings={settings}
      initialHomeContent={homeContent}
      initialServices={services}
      initialProducts={products}
    />
  );
}
