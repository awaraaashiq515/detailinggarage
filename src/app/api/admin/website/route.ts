import { NextResponse } from 'next/server';
import { getWebsiteContent, updateWebsiteContent } from '@/lib/website-content';
import { getCurrentUser } from '@/lib/auth/jwt';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const content = await getWebsiteContent();
    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching website content:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const updatedContent = await updateWebsiteContent(body);

    return NextResponse.json(updatedContent);
  } catch (error) {
    console.error('Error updating website content:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
