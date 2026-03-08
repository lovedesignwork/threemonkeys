import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin, isAuthError } from '@/lib/auth/api-auth';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;

  try {
    const { data, error } = await supabaseAdmin
      .from('promo_addons')
      .select('*')
      .order('price', { ascending: false });

    if (error) {
      console.error('Error fetching addons:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in admin addons API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json();
    const { id, name, price, original_price, description, is_active, image_url } = body;

    const { error } = await supabaseAdmin.from('promo_addons').insert({
      id,
      name,
      price,
      original_price: original_price || price,
      description: description || null,
      is_active: is_active !== false,
      image_url: image_url || null,
    });

    if (error) {
      console.error('Error adding addon:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in admin addons POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json();
    const { id, name, price, original_price, description, is_active, image_url } = body;

    const { error } = await supabaseAdmin
      .from('promo_addons')
      .update({
        name,
        price,
        original_price,
        description,
        is_active,
        image_url,
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating addon:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in admin addons PUT:', error);
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
      .from('promo_addons')
      .update({ is_active })
      .eq('id', id);

    if (error) {
      console.error('Error toggling addon:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in admin addons PATCH:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
