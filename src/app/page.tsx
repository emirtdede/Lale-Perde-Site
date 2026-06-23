import { supabase } from '../lib/supabaseClient';
import HomeClient from './HomeClient';
import { 
  mapCategoryFromDb, 
  mapSettingsFromDb, 
  mapHomeContentFromDb, 
  mapServiceFromDb 
} from '../context/dbMappers';

export const revalidate = 60; // ISR cache for 60 seconds since it's a public landing page

export default async function Home() {
  const [
    { data: rawCats },
    { data: rawSettings },
    { data: rawHome },
    { data: rawSrvs }
  ] = await Promise.all([
    supabase.from('categories').select('*').eq('status', 'active').order('display_order', { ascending: true }),
    supabase.from('site_settings').select('*').limit(1).single(),
    supabase.from('home_page_content').select('*').limit(1).single(),
    supabase.from('services').select('*').eq('status', 'active').order('display_order', { ascending: true })
  ]);

  const categories = (rawCats || []).map(mapCategoryFromDb);
  const settings = rawSettings ? mapSettingsFromDb(rawSettings) : null;
  const homeContent = rawHome ? mapHomeContentFromDb(rawHome) : null;
  const services = (rawSrvs || []).map(mapServiceFromDb);

  return (
    <HomeClient 
      initialCategories={categories}
      initialSettings={settings}
      initialHomeContent={homeContent}
      initialServices={services}
    />
  );
}
