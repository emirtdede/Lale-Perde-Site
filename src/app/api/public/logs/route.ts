import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// In-memory rate limiting map
// Key: IP address, Value: Array of timestamps
const rateLimitMap = new Map<string, number[]>();

// Max requests per minute per IP
const MAX_REQUESTS_PER_MINUTE = 10;
const WINDOW_MS = 60 * 1000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  
  // Filter timestamps within the window
  const recentTimestamps = timestamps.filter(ts => now - ts < WINDOW_MS);
  
  if (recentTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    // Save filtered array to prevent memory leak
    rateLimitMap.set(ip, recentTimestamps);
    return true;
  }
  
  recentTimestamps.push(now);
  rateLimitMap.set(ip, recentTimestamps);
  
  // Periodically cleanup old IPs (basic garbage collection for this map)
  if (rateLimitMap.size > 1000) {
    const cutoff = now - WINDOW_MS;
    for (const [key, times] of rateLimitMap.entries()) {
      const validTimes = times.filter(t => t > cutoff);
      if (validTimes.length === 0) {
        rateLimitMap.delete(key);
      } else {
        rateLimitMap.set(key, validTimes);
      }
    }
  }

  return false;
}

// Create admin client to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json({ error: 'Missing type or data' }, { status: 400 });
    }

    if (type === 'visitor') {
      const { data: result, error } = await supabaseAdmin
        .from('visitor_logs')
        .insert([data])
        .select();
        
      if (error) throw error;
      return NextResponse.json({ success: true, data: result });
    } 
    else if (type === 'search') {
      const { query } = data;
      const { data: existing } = await supabaseAdmin.from('search_logs').select('id, count').eq('query', query).single();
      
      let result, error;
      if (existing) {
        ({ data: result, error } = await supabaseAdmin
          .from('search_logs')
          .update({ count: (existing.count || 0) + 1 })
          .eq('query', query)
          .select());
      } else {
        ({ data: result, error } = await supabaseAdmin
          .from('search_logs')
          .insert([{ query, count: 1 }])
          .select());
      }
        
      if (error) throw error;
      return NextResponse.json({ success: true, data: result });
    }
    else {
      return NextResponse.json({ error: 'Invalid log type' }, { status: 400 });
    }

  } catch (error) {
    console.error('Log API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  // For updating visitor duration
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const { type, id, data } = body;

    if (type === 'visitor_duration' && id && data?.duration !== undefined) {
      const { error } = await supabaseAdmin
        .from('visitor_logs')
        .update({ duration: data.duration })
        .eq('id', id);
        
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid update request' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
