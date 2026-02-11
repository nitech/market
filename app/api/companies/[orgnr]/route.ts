import { NextRequest, NextResponse } from 'next/server';
import { BRREG_API_BASE } from '@/lib/brreg';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgnr: string }> }
) {
  try {
    const { orgnr } = await params;
    const response = await fetch(`${BRREG_API_BASE}/enheter/${orgnr}`, {
      headers: {
        'Accept': 'application/vnd.brreg.enhetsregisteret.enhet.v2+json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

