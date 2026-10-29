import { connection } from 'next/server';
import BookingClient from './BookingClient';

export default async function BookingPage() {
  // Render the existing search-param-driven booking flow for the request.
  // Without this server boundary, static prerendering only emits its spinner.
  await connection();
  return <BookingClient />;
}
