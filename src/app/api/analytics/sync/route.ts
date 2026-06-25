import { NextResponse } from 'next/server';
import crypto from 'crypto';
// @ts-expect-error
import { Client } from 'pg';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

let hasCheckedTable = false;

async function ensureTableExists() {
  if (hasCheckedTable) return;
  hasCheckedTable = true;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn('DATABASE_URL is not configured. Cannot ensure table exists via pg.');
    return;
  }
  const client = new Client({ connectionString });
  try {
    await client.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS analytics_cache (
        id TEXT PRIMARY KEY DEFAULT 'ga4_dashboard_data',
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        quota_exceeded BOOLEAN DEFAULT FALSE
      );
      INSERT INTO analytics_cache (id, data, updated_at, quota_exceeded)
      VALUES (
        'ga4_dashboard_data', 
        '{"activeUsers": 0, "screenPageViews": 0, "sessions": 0, "whatsappClicks": 0, "mapsClicks": 0, "formSubmits": 0}', 
        NOW(), 
        FALSE
      )
      ON CONFLICT (id) DO NOTHING;

      CREATE TABLE IF NOT EXISTS form_interactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    // Reload PostgREST schema cache
    await client.query("NOTIFY pgrst, 'reload schema';");
  } catch (err: any) {
    console.warn('Failed to ensure analytics_cache / form_interactions tables exist via direct PG connection:', err.message);
  } finally {
    try {
      await client.end();
    } catch (e) {}
  }
}

// Helper to sign JWT using native Node.js crypto library
function generateGoogleJwt(clientEmail: string, privateKey: string) {
  const cleanPrivateKey = privateKey.replace(/\\n/g, '\n');
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64Claim = Buffer.from(JSON.stringify(claim)).toString('base64url');
  const signatureInput = `${base64Header}.${base64Claim}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signatureInput);
  const signature = signer.sign(cleanPrivateKey, 'base64url');

  return `${signatureInput}.${signature}`;
}

async function getAccessToken(clientEmail: string, privateKey: string) {
  const jwtToken = generateGoogleJwt(clientEmail, privateKey);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwtToken,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Auth token generation failed: ${errText}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

export async function POST() {
  try {
    // Ensure table exists first (non-blocking)
    await ensureTableExists();

    // 1. Fetch current cached record from Supabase
    const { data: currentRecord } = await supabase
      .from('analytics_cache')
      .select('*')
      .eq('id', 'ga4_dashboard_data')
      .single();

    // 2. Read GA4 API configuration credentials from environment variables
    const propertyId = process.env.GA4_PROPERTY_ID;
    const clientEmail = process.env.GA4_CLIENT_EMAIL;
    const privateKey = process.env.GA4_PRIVATE_KEY;

    if (!propertyId || !clientEmail || !privateKey) {
      console.warn('GA4 environment variables are not fully configured.');
      // If credentials are not set, return current cached data gracefully
      return NextResponse.json({
        success: true,
        data: currentRecord?.data || { activeUsers: 0, screenPageViews: 0, sessions: 0, whatsappClicks: 0, mapsClicks: 0, formSubmits: 0 },
        updatedAt: currentRecord?.updated_at || new Date().toISOString(),
        quotaExceeded: currentRecord?.quota_exceeded || false,
        warning: 'Credentials missing, serving cache.'
      });
    }

    let token: string;
    try {
      token = await getAccessToken(clientEmail, privateKey);
    } catch (authErr: any) {
      console.error('GA4 Authentication Error:', authErr);
      return NextResponse.json({
        success: false,
        error: 'Authentication failed with Google APIs.',
        data: currentRecord?.data || { activeUsers: 0, screenPageViews: 0, sessions: 0, whatsappClicks: 0, mapsClicks: 0, formSubmits: 0 },
        updatedAt: currentRecord?.updated_at || new Date().toISOString(),
        quotaExceeded: false,
      }, { status: 401 });
    }

    // 3. Request GA4 Batch Report data
    const reportUrl = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:batchRunReports`;
    const reportBody = {
      requests: [
        {
          dateRanges: [{ startDate: '1825daysAgo', endDate: 'today' }],
          metrics: [
            { name: 'activeUsers' },
            { name: 'screenPageViews' },
            { name: 'sessions' }
          ]
        },
        {
          dateRanges: [{ startDate: '1825daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'eventName' }],
          metrics: [{ name: 'eventCount' }],
          dimensionFilter: {
            filter: {
              fieldName: 'eventName',
              inListFilter: {
                values: ['whatsapp_click', 'maps_click', 'form_submit']
              }
            }
          }
        },
        {
          dateRanges: [{ startDate: '1825daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'date' }],
          metrics: [
            { name: 'activeUsers' },
            { name: 'screenPageViews' },
            { name: 'sessions' }
          ]
        },
        {
          dateRanges: [{ startDate: '1825daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'date' }, { name: 'eventName' }],
          metrics: [{ name: 'eventCount' }],
          dimensionFilter: {
            filter: {
              fieldName: 'eventName',
              inListFilter: {
                values: ['whatsapp_click', 'maps_click', 'form_submit']
              }
            }
          }
        }
      ]
    };

    const gaRes = await fetch(reportUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reportBody)
    });

    // 4. Rate-Limit / Quota Exceeded (429) Handling
    if (gaRes.status === 429 || gaRes.status === 403) {
      console.warn('GA4 API quota exceeded or forbidden rate limit hit.');
      
      // Update cache table to mark quota_exceeded = TRUE, retaining existing statistics data
      await supabase
        .from('analytics_cache')
        .update({
          quota_exceeded: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', 'ga4_dashboard_data');

      const { count: formStartedCount } = await supabase
        .from('form_interactions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'form_started');

      const { count: formCompletedCount } = await supabase
        .from('form_interactions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'form_completed');

      return NextResponse.json({
        success: false,
        quotaExceeded: true,
        error: 'Günlük kotanız dolmuştur, kotanız yenilenince verileriniz güncellenecektir.',
        data: currentRecord?.data || { activeUsers: 0, screenPageViews: 0, sessions: 0, whatsappClicks: 0, mapsClicks: 0, formSubmits: 0, daily: [] },
        updatedAt: currentRecord?.updated_at || new Date().toISOString(),
        formStartedCount: formStartedCount || 0,
        formCompletedCount: formCompletedCount || 0
      });
    }

    if (!gaRes.ok) {
      const gaErrText = await gaRes.text();
      throw new Error(`GA4 API request failed: ${gaErrText}`);
    }

    const gaData = await gaRes.json();

    // 5. Parse GA4 Batch Reports
    let activeUsers = 0;
    let screenPageViews = 0;
    let sessions = 0;
    let whatsappClicks = 0;
    let mapsClicks = 0;
    let formSubmits = 0;

    const reports = gaData.reports || [];
    
    // Parse General Report
    if (reports[0] && reports[0].rows && reports[0].rows[0] && reports[0].rows[0].metricValues) {
      const vals = reports[0].rows[0].metricValues;
      activeUsers = parseInt(vals[0]?.value) || 0;
      screenPageViews = parseInt(vals[1]?.value) || 0;
      sessions = parseInt(vals[2]?.value) || 0;
    }

    // Parse Event Counts Report
    if (reports[1] && reports[1].rows) {
      reports[1].rows.forEach((row: any) => {
        const eventName = row.dimensionValues?.[0]?.value;
        const eventCount = parseInt(row.metricValues?.[0]?.value) || 0;
        if (eventName === 'whatsapp_click') {
          whatsappClicks = eventCount;
        } else if (eventName === 'maps_click') {
          mapsClicks = eventCount;
        } else if (eventName === 'form_submit') {
          formSubmits = eventCount;
        }
      });
    }

    // Parse Daily Metrics Report combined with Daily Event Counts
    const dailyMap: { [date: string]: any } = {};

    if (reports[2] && reports[2].rows) {
      reports[2].rows.forEach((row: any) => {
        const dateStr = row.dimensionValues?.[0]?.value || ''; // Format YYYYMMDD
        const vals = row.metricValues || [];
        const activeUsersD = parseInt(vals[0]?.value) || 0;
        const screenPageViewsD = parseInt(vals[1]?.value) || 0;
        const sessionsD = parseInt(vals[2]?.value) || 0;
        
        let formattedDate = dateStr;
        if (dateStr.length === 8) {
          formattedDate = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
        }
        
        dailyMap[formattedDate] = {
          date: formattedDate,
          activeUsers: activeUsersD,
          screenPageViews: screenPageViewsD,
          sessions: sessionsD,
          whatsappClicks: 0,
          mapsClicks: 0,
          formSubmits: 0
        };
      });
    }

    if (reports[3] && reports[3].rows) {
      reports[3].rows.forEach((row: any) => {
        const dateStr = row.dimensionValues?.[0]?.value || ''; // Format YYYYMMDD
        const eventName = row.dimensionValues?.[1]?.value || '';
        const eventCount = parseInt(row.metricValues?.[0]?.value) || 0;

        let formattedDate = dateStr;
        if (dateStr.length === 8) {
          formattedDate = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
        }

        if (!dailyMap[formattedDate]) {
          dailyMap[formattedDate] = {
            date: formattedDate,
            activeUsers: 0,
            screenPageViews: 0,
            sessions: 0,
            whatsappClicks: 0,
            mapsClicks: 0,
            formSubmits: 0
          };
        }

        if (eventName === 'whatsapp_click') {
          dailyMap[formattedDate].whatsappClicks = eventCount;
        } else if (eventName === 'maps_click') {
          dailyMap[formattedDate].mapsClicks = eventCount;
        } else if (eventName === 'form_submit') {
          dailyMap[formattedDate].formSubmits = eventCount;
        }
      });
    }

    const daily = Object.values(dailyMap);
    // Sort daily data by date ascending
    daily.sort((a: any, b: any) => a.date.localeCompare(b.date));

    const payload = {
      activeUsers,
      screenPageViews,
      sessions,
      whatsappClicks,
      mapsClicks,
      formSubmits,
      daily
    };

    // 6. Write to Supabase Caching table
    const { data: updatedRecord, error: dbErr } = await supabase
      .from('analytics_cache')
      .upsert({
        id: 'ga4_dashboard_data',
        data: payload,
        updated_at: new Date().toISOString(),
        quota_exceeded: false
      })
      .select()
      .single();

    if (dbErr) {
      throw new Error(`Database cache update failed: ${dbErr.message}`);
    }

    const { count: formStartedCount } = await supabase
      .from('form_interactions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'form_started');

    const { count: formCompletedCount } = await supabase
      .from('form_interactions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'form_completed');

    return NextResponse.json({
      success: true,
      data: payload,
      updatedAt: updatedRecord.updated_at,
      quotaExceeded: false,
      formStartedCount: formStartedCount || 0,
      formCompletedCount: formCompletedCount || 0
    });

  } catch (err: any) {
    console.error('Analytics Sync error occurred:', err);
    // On unexpected errors, return current cache table record if available
    const { data: fallbackRecord } = await supabase
      .from('analytics_cache')
      .select('*')
      .eq('id', 'ga4_dashboard_data')
      .single();

    const { count: formStartedCount } = await supabase
      .from('form_interactions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'form_started');

    const { count: formCompletedCount } = await supabase
      .from('form_interactions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'form_completed');

    return NextResponse.json({
      success: false,
      error: err.message || 'An unexpected error occurred.',
      data: fallbackRecord?.data || { activeUsers: 0, screenPageViews: 0, sessions: 0, whatsappClicks: 0, mapsClicks: 0, formSubmits: 0, daily: [] },
      updatedAt: fallbackRecord?.updated_at || new Date().toISOString(),
      quotaExceeded: fallbackRecord?.quota_exceeded || false,
      formStartedCount: formStartedCount || 0,
      formCompletedCount: formCompletedCount || 0
    }, { status: 500 });
  }
}

// GET handler to fetch current cache directly without triggering sync
export async function GET() {
  try {
    // Ensure table exists first (non-blocking)
    await ensureTableExists();

    const { data, error } = await supabase
      .from('analytics_cache')
      .select('*')
      .eq('id', 'ga4_dashboard_data')
      .single();

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    const { count: formStartedCount } = await supabase
      .from('form_interactions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'form_started');

    const { count: formCompletedCount } = await supabase
      .from('form_interactions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'form_completed');

    return NextResponse.json({
      success: true,
      data: data.data,
      updatedAt: data.updated_at,
      quotaExceeded: data.quota_exceeded,
      formStartedCount: formStartedCount || 0,
      formCompletedCount: formCompletedCount || 0
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 });
  }
}
