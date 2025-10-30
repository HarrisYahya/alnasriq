import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';



export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { patient_name, stage, service, status, ticket } = body;

    if (!patient_name || !service) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { error } = await supabaseServer.from('patients').insert([{
      patient_name,
      stage,
      service,
      status,
      ticket,
      inserted_at: new Date().toISOString(),
    }]);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
