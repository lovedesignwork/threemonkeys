import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface BookingAddon {
  name: string;
  quantity: number;
  price: number;
}

interface NewBookingNotificationProps {
  bookingRef: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  packageName: string;
  playDate: string;
  timeSlot: string;
  guests: number;
  additionalGuests?: number;
  transportType: 'none' | 'shared' | 'private';
  hotelName?: string;
  roomNumber?: string;
  privatePassengers?: number;
  addons?: BookingAddon[];
  totalAmount: number;
  paymentStatus: string;
  bookedAt: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://threemonkeys.vercel.app';

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const NewBookingNotification = ({
  bookingRef,
  customerName,
  customerEmail,
  customerPhone,
  packageName,
  playDate,
  timeSlot,
  guests,
  additionalGuests,
  transportType,
  hotelName,
  roomNumber,
  privatePassengers,
  addons,
  totalAmount,
  paymentStatus,
  bookedAt,
}: NewBookingNotificationProps) => {
  const previewText = `New Booking: ${bookingRef} - ${customerName} - ${packageName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>🎉 New Booking Received!</Heading>
          </Section>

          {/* Alert Banner */}
          <Section style={alertBanner}>
            <Text style={alertText}>
              A new reservation has been made on Three Monkeys Restaurant website
            </Text>
          </Section>

          {/* Booking Reference */}
          <Section style={refSection}>
            <Text style={refLabel}>Booking Reference</Text>
            <Text style={refNumber}>{bookingRef}</Text>
            <Text style={refStatus}>
              Payment Status: <span style={paymentStatus === 'confirmed' ? statusConfirmed : statusPending}>
                {paymentStatus.toUpperCase()}
              </span>
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Customer Details */}
          <Section style={detailsCard}>
            <Heading as="h2" style={sectionTitle}>
              👤 Customer Details
            </Heading>
            
            <table style={table}>
              <tbody>
                <tr>
                  <td style={labelCell}>Name:</td>
                  <td style={valueCell}>{customerName}</td>
                </tr>
                <tr>
                  <td style={labelCell}>Email:</td>
                  <td style={valueCell}>
                    <Link href={`mailto:${customerEmail}`} style={link}>{customerEmail}</Link>
                  </td>
                </tr>
                <tr>
                  <td style={labelCell}>Phone:</td>
                  <td style={valueCell}>
                    <Link href={`tel:${customerPhone}`} style={link}>{customerPhone}</Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Hr style={divider} />

          {/* Booking Details */}
          <Section style={detailsCard}>
            <Heading as="h2" style={sectionTitle}>
              📋 Booking Details
            </Heading>
            
            <table style={table}>
              <tbody>
                <tr>
                  <td style={labelCell}>Package:</td>
                  <td style={valueCellBold}>{packageName}</td>
                </tr>
                <tr>
                  <td style={labelCell}>Play Date:</td>
                  <td style={valueCell}>{playDate}</td>
                </tr>
                <tr>
                  <td style={labelCell}>Time Slot:</td>
                  <td style={valueCell}>{timeSlot}</td>
                </tr>
                <tr>
                  <td style={labelCell}>Guests:</td>
                  <td style={valueCell}>{guests} guest{guests > 1 ? 's' : ''}</td>
                </tr>
                {additionalGuests && additionalGuests > 0 && (
                  <tr>
                    <td style={labelCell}>Additional Guests:</td>
                    <td style={valueCell}>{additionalGuests} person{additionalGuests > 1 ? 's' : ''}</td>
                  </tr>
                )}
                <tr>
                  <td style={labelCell}>Booked At:</td>
                  <td style={valueCell}>{bookedAt}</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Hr style={divider} />

          {/* Transport Details */}
          <Section style={detailsCard}>
            <Heading as="h2" style={sectionTitle}>
              🚐 Transport Details
            </Heading>
            
            <table style={table}>
              <tbody>
                <tr>
                  <td style={labelCell}>Type:</td>
                  <td style={valueCell}>
                    {transportType === 'none' && 'Self-Arrival (No Transfer)'}
                    {transportType === 'shared' && 'Shared Transfer'}
                    {transportType === 'private' && 'Private Transfer'}
                  </td>
                </tr>
                {transportType !== 'none' && hotelName && (
                  <tr>
                    <td style={labelCell}>Hotel:</td>
                    <td style={valueCell}>{hotelName}</td>
                  </tr>
                )}
                {transportType !== 'none' && roomNumber && (
                  <tr>
                    <td style={labelCell}>Room:</td>
                    <td style={valueCell}>{roomNumber}</td>
                  </tr>
                )}
                {transportType === 'private' && privatePassengers && (
                  <tr>
                    <td style={labelCell}>Passengers:</td>
                    <td style={valueCell}>{privatePassengers} passenger{privatePassengers > 1 ? 's' : ''}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Section>

          {/* Add-ons */}
          {addons && addons.length > 0 && (
            <>
              <Hr style={divider} />
              <Section style={detailsCard}>
                <Heading as="h2" style={sectionTitle}>
                  🎁 Add-ons
                </Heading>
                
                <table style={table}>
                  <tbody>
                    {addons.map((addon, index) => (
                      <tr key={index}>
                        <td style={labelCell}>{addon.name}:</td>
                        <td style={valueCell}>
                          {addon.quantity}x @ {formatPrice(addon.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Section>
            </>
          )}

          <Hr style={divider} />

          {/* Total */}
          <Section style={totalSection}>
            <Row>
              <Column>
                <Text style={totalLabel}>Total Amount</Text>
              </Column>
              <Column align="right">
                <Text style={totalAmountStyle}>{formatPrice(totalAmount)}</Text>
              </Column>
            </Row>
          </Section>

          {/* CTA */}
          <Section style={ctaSection}>
            <Button style={ctaButton} href={`${baseUrl}/admin/bookings`}>
              View in Admin Dashboard
            </Button>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This is an automated notification from Three Monkeys Restaurant reservation system.
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} Three Monkeys Restaurant. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default NewBookingNotification;

// Styles
const main = {
  backgroundColor: '#f4f4f5',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '600px',
};

const header = {
  backgroundColor: '#1a237e',
  padding: '30px 40px',
  borderRadius: '12px 12px 0 0',
};

const headerTitle = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0',
  textAlign: 'center' as const,
};

const alertBanner = {
  backgroundColor: '#22c55e',
  padding: '12px 40px',
};

const alertText = {
  color: '#ffffff',
  fontSize: '14px',
  margin: '0',
  textAlign: 'center' as const,
};

const refSection = {
  backgroundColor: '#0d1259',
  padding: '25px 40px',
  textAlign: 'center' as const,
};

const refLabel = {
  color: '#94a3b8',
  fontSize: '12px',
  fontWeight: '500',
  margin: '0 0 5px 0',
  textTransform: 'uppercase' as const,
};

const refNumber = {
  color: '#f97316',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 10px 0',
  letterSpacing: '2px',
};

const refStatus = {
  color: '#ffffff',
  fontSize: '14px',
  margin: '0',
};

const statusConfirmed = {
  color: '#22c55e',
  fontWeight: '600',
};

const statusPending = {
  color: '#f97316',
  fontWeight: '600',
};

const detailsCard = {
  backgroundColor: '#ffffff',
  padding: '25px 40px',
};

const sectionTitle = {
  color: '#1a237e',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 15px 0',
};

const table = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const labelCell = {
  color: '#64748b',
  fontSize: '14px',
  fontWeight: '500',
  padding: '6px 0',
  width: '140px',
  verticalAlign: 'top' as const,
};

const valueCell = {
  color: '#1e293b',
  fontSize: '14px',
  padding: '6px 0',
  verticalAlign: 'top' as const,
};

const valueCellBold = {
  color: '#1e293b',
  fontSize: '14px',
  fontWeight: '600',
  padding: '6px 0',
  verticalAlign: 'top' as const,
};

const link = {
  color: '#1a237e',
  textDecoration: 'underline',
};

const divider = {
  borderColor: '#e2e8f0',
  margin: '0',
};

const totalSection = {
  backgroundColor: '#f8fafc',
  padding: '20px 40px',
};

const totalLabel = {
  color: '#64748b',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
};

const totalAmountStyle = {
  color: '#1a237e',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0',
};

const ctaSection = {
  backgroundColor: '#ffffff',
  padding: '25px 40px',
  textAlign: 'center' as const,
};

const ctaButton = {
  backgroundColor: '#1a237e',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  padding: '12px 30px',
  textDecoration: 'none',
};

const footer = {
  backgroundColor: '#1e293b',
  padding: '20px 40px',
  borderRadius: '0 0 12px 12px',
};

const footerText = {
  color: '#94a3b8',
  fontSize: '12px',
  margin: '5px 0',
  textAlign: 'center' as const,
};
