# 8. Testing Checklist

Complete testing checklist before going live.

## Pre-Deployment Checklist

### Environment Variables

- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set (use `pk_live_` for production)
- [ ] `STRIPE_SECRET_KEY` is set (use `sk_live_` for production)
- [ ] `STRIPE_WEBHOOK_SECRET` is set
- [ ] `ONEBOOKING_API_URL` is set to `https://db.onebooking.co`
- [ ] `ONEBOOKING_API_KEY` is set
- [ ] `WEBSITE_ID` is set to your unique identifier

### Database

- [ ] All tables created (bookings, booking_customers, booking_transport, booking_addons)
- [ ] Indexes created for performance
- [ ] RLS policies enabled
- [ ] `generate_booking_ref` trigger is active
- [ ] Test insert creates booking_ref automatically

### Stripe

- [ ] Webhook endpoint is created in Stripe Dashboard
- [ ] Webhook is listening to `payment_intent.succeeded`
- [ ] Webhook is listening to `payment_intent.payment_failed`
- [ ] Webhook is listening to `charge.refunded`
- [ ] Webhook signing secret is correct

---

## Functional Testing

### Booking Flow

1. **Select Package**
   - [ ] All packages display correctly
   - [ ] Prices are accurate
   - [ ] Package selection updates summary

2. **Select Date & Time**
   - [ ] Calendar works correctly
   - [ ] Past dates are disabled
   - [ ] Time slots display correctly

3. **Guest Count**
   - [ ] Increment/decrement works
   - [ ] Minimum 1 guest enforced
   - [ ] Price updates with guest count

4. **Transport Options**
   - [ ] Hotel pickup shows hotel name field
   - [ ] Private transfer shows passenger count
   - [ ] Self-arrange requires no additional fields
   - [ ] Non-players count works

5. **Add-ons**
   - [ ] All add-ons display correctly
   - [ ] Quantity selection works
   - [ ] Prices update correctly

6. **Customer Details**
   - [ ] All required fields validate
   - [ ] Email format validates
   - [ ] Phone number accepts international format

### Payment Flow

1. **Test Cards**
   - [ ] `4242 4242 4242 4242` - Successful payment
   - [ ] `4000 0000 0000 0002` - Declined card
   - [ ] `4000 0000 0000 9995` - Insufficient funds

2. **Payment Processing**
   - [ ] Loading state shows during processing
   - [ ] Success redirects to success page
   - [ ] Failure shows error message

3. **Success Page**
   - [ ] Booking reference displays
   - [ ] Customer name displays
   - [ ] Package details are correct
   - [ ] Date and time are correct
   - [ ] Guest count is correct
   - [ ] Transport details display (if applicable)
   - [ ] Add-ons display (if applicable)
   - [ ] Total amount is correct

### Webhook & Sync

1. **Stripe Webhook**
   - [ ] Webhook receives events (check Stripe Dashboard)
   - [ ] Booking status updates to 'confirmed'
   - [ ] No signature errors in logs

2. **OneBooking Sync**
   - [ ] Booking appears in OneBooking Dashboard
   - [ ] All booking details are correct
   - [ ] Customer info synced correctly
   - [ ] Transport info synced correctly
   - [ ] Add-ons synced correctly

---

## Test Payment Cards

| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Declined |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0000 0000 0069` | Expired card |
| `4000 0000 0000 0127` | Incorrect CVC |
| `4000 0027 6000 3184` | 3D Secure required |

**For all test cards:**
- Use any future expiry date (e.g., 12/34)
- Use any 3-digit CVC (e.g., 123)
- Use any 5-digit postal code (e.g., 12345)

---

## Monitoring

### Logs to Check

1. **Vercel Runtime Logs**
   - Check for webhook errors
   - Check for database errors
   - Check for OneBooking sync errors

2. **Stripe Dashboard**
   - Webhooks → Your endpoint → Recent deliveries
   - Check for failed deliveries

3. **Supabase Dashboard**
   - Table Editor → bookings
   - Check booking statuses

### Common Issues

| Symptom | Likely Cause |
|---------|--------------|
| Booking stays "pending" | Webhook not configured or failing |
| "Invalid signature" error | Wrong `STRIPE_WEBHOOK_SECRET` |
| OneBooking not syncing | Missing `ONEBOOKING_API_KEY` or `ONEBOOKING_API_URL` |
| Success page shows error | `payment_intent` not passed in URL |
| "Booking not found" | Database connection issue |

---

## Go-Live Checklist

Before switching to production:

1. [ ] Switch Stripe keys from `test` to `live`
2. [ ] Update webhook endpoint to production URL
3. [ ] Verify all environment variables in Vercel
4. [ ] Test one real payment (can refund immediately)
5. [ ] Verify booking appears in OneBooking Dashboard
6. [ ] Verify confirmation email is sent
