import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: Request) {
  // Get IP
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
  const rawIp = ip.split(',')[0].trim();

  // Hash IP using Node's crypto
  const ipHash = crypto.createHash('sha256').update(rawIp + 'lale-perde-secret-salt').digest('hex');

  // Geolocation
  let city = 'TR / Unknown';
  try {
    const ipRes = await fetch(`https://ipapi.co/${rawIp}/json/`, {
      headers: { 'User-Agent': 'nodejs-ipapi' }
    });
    if (ipRes.ok) {
      const ipData = await ipRes.json();
      if (ipData.city && ipData.country_code) {
        city = `${ipData.country_code} / ${ipData.city}`;
      }
    }
  } catch (e) {
    // fallback
  }

  return NextResponse.json({ ipHash, city });
}
