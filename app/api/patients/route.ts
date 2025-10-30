import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('patients')
      .select('*')
      .order('ticket', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API /patients error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
