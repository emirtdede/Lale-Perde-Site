import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'lale-perde-fallback-secret-key-32chars'
);

// Create a Supabase client with the Service Role Key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(request: Request) {
  try {
    // 1. Verify Authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      await jwtVerify(token, SECRET_KEY);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 2. Parse Request
    const body = await request.json();
    const { table, action, data, id, eqField, eqValue } = body;

    if (!table || !action) {
      return NextResponse.json({ error: 'Missing table or action' }, { status: 400 });
    }

    // 3. Execute DB Operation
    let result;
    
    switch (action) {
      case 'insert':
        result = await supabaseAdmin.from(table).insert(data).select();
        break;
      case 'update':
        if (id) {
          result = await supabaseAdmin.from(table).update(data).eq('id', id).select();
        } else if (eqField && eqValue) {
          result = await supabaseAdmin.from(table).update(data).eq(eqField, eqValue).select();
        } else {
          return NextResponse.json({ error: 'Missing ID or eq filters for update' }, { status: 400 });
        }
        break;
      case 'delete':
        if (id) {
          result = await supabaseAdmin.from(table).delete().eq('id', id);
        } else if (eqField && eqValue) {
          result = await supabaseAdmin.from(table).delete().eq(eqField, eqValue);
        } else {
          return NextResponse.json({ error: 'Missing ID or eq filters for delete' }, { status: 400 });
        }
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (result.error) {
      console.error('Supabase error:', result.error);
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result.data });

  } catch (error) {
    console.error('DB Proxy error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
