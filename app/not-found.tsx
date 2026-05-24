import { redirect } from 'next/navigation';

/**
 * Global 404 handler.
 *
 * Per project policy, any unknown URL is sent straight back to the
 * homepage rather than shown a dead-end "Not found" screen. This keeps
 * crawlers, shared/legacy links, and typo'd URLs on the brand instead of
 * bouncing off.
 */
export default function NotFound() {
  redirect('/');
}
