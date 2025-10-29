import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';


export async function POST(req: Request) {
  try {
    const { id, all } = await req.json();

    if (all) {
      const { error } = await supabaseServer.from('patients').delete().neq('id', 0);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (id) {
      const { error } = await supabaseServer.from('patients').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Missing ID or all flag' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
