import { supabaseAdmin } from '@/lib/supabase/server';

interface BlogAuthor {
  id: string;
  name: string;
  email: string | null;
}

/** Author profiles are optional metadata; they must never hide a blog post. */
export async function getBlogAuthors(authorIds: Array<string | null | undefined>): Promise<Map<string, BlogAuthor>> {
  const authors = new Map<string, BlogAuthor>();
  const ids = [...new Set(authorIds.filter((id): id is string => typeof id === 'string' && id.length > 0))];
  if (!ids.length) return authors;
  try {
    // Read by ID explicitly: some deployed schemas have no author_id FK for
    // PostgREST relationship expansion. Migration 008 uses full_name.
    const { data, error } = await supabaseAdmin.from('admin_users').select('id, full_name, email').in('id', ids);
    if (error) {
      console.warn('Blog author lookup unavailable:', error);
      return authors;
    }
    for (const author of data ?? []) {
      authors.set(author.id, {
        id: author.id,
        name: author.full_name?.trim() || 'Three Monkeys Team',
        email: author.email ?? null,
      });
    }
  } catch (error) {
    console.warn('Blog author lookup unavailable:', error);
  }
  return authors;
}
