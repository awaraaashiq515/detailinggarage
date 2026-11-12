import { NextResponse } from 'next/server';
import { getWebsiteContent } from '@/lib/website-content';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const content = await getWebsiteContent();
    return NextResponse.json({ success: true, data: content });
  } catch (error) {
    console.error('Error in public website-content API:', error);
    return NextResponse.json({ success: false, error: 'Failed to load content' }, { status: 500 });
  }
}

