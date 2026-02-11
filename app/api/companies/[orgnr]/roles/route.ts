import { NextRequest, NextResponse } from 'next/server';
import type { RollerResponse } from '@/server/types';
import { BRREG_API_BASE, findDagligLeder } from '@/lib/brreg';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgnr: string }> }
) {
  try {
    const { orgnr } = await params;
    const response = await fetch(`${BRREG_API_BASE}/enheter/${orgnr}/roller`, {
      headers: {
        'Accept': 'application/vnd.brreg.enhetsregisteret.rolle.v1+json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data: RollerResponse = await response.json();
    const dagligLeder = findDagligLeder(data);
    
    return NextResponse.json({
      roles: data,
      dagligLeder,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

