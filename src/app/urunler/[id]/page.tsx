import { supabase } from '../../../lib/supabaseClient';
import { mapProductFromDb } from '../../../context/dbMappers';
import ProductDetailClient from './ProductDetailClient';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const revalidate = 60; // ISR cache for 60 seconds

type Props = {
  params: Promise<{ id: string }>;
};

// Dynamically generate SEO metadata based on the product
export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const { data: rawProduct } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (!rawProduct) {
    return {
      title: 'Ürün Bulunamadı | Lale Perde'
    };
  }

  const product = mapProductFromDb(rawProduct);

  return {
    title: `${product.nameTr} | Lale Perde`,
    description: product.descriptionTr || 'Lale Perde özel tasarım perde koleksiyonu.',
    openGraph: {
      images: product.coverImage ? [product.coverImage] : product.images,
    }
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const { data: rawProduct } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (!rawProduct) {
    notFound();
  }

  const product = mapProductFromDb(rawProduct);

  return <ProductDetailClient initialProduct={product} />;
}
