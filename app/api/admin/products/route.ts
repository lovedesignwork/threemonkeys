import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin, isAuthError } from '@/lib/auth/api-auth';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;

  try {
    const { data, error } = await supabaseAdmin
      .from('packages')
      .select('*')
      .order('price', { ascending: false });

    if (error) {
      console.error('Error fetching packages:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in admin products API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json();
    const { id, name, price, duration, category, includes_meal, includes_transfer, is_active, image_url } = body;

    const { error } = await supabaseAdmin.from('packages').insert({
      id,
      name,
      price,
      duration: duration || 'TBD',
      category: category || 'combined',
      includes_meal: includes_meal || false,
      includes_transfer: includes_transfer || false,
      is_active: is_active !== false,
      image_url: image_url || null,
    });

    if (error) {
      console.error('Error adding package:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in admin products POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json();
    const { id, name, price, duration, category, includes_meal, includes_transfer, is_active, image_url } = body;

    const { error } = await supabaseAdmin
      .from('packages')
      .update({
        name,
        price,
        duration,
        category,
        includes_meal,
        includes_transfer,
        is_active,
        image_url,
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating package:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in admin products PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json();
    const { id, is_active } = body;

    const { error } = await supabaseAdmin
      .from('packages')
      .update({ is_active })
      .eq('id', id);

    if (error) {
      console.error('Error toggling package:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in admin products PATCH:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
