import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface BookingConfirmationEmailProps {
  customerName: string;
  bookingRef: string;
  packageName: string;
  activityDate: string;
  timeSlot: string;
  guestCount: number;
  totalAmount: number;
  hotelName?: string;
  roomNumber?: string;
  hasTransfer: boolean;
  isPrivateTransfer?: boolean;
  addons?: Array<{ name: string; quantity: number; price: number }>;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://threemonkeys.com';

export const BookingConfirmationEmail = ({
  customerName = 'John',
  bookingRef = '3M-00001',
  packageName = 'World A+',
  activityDate = 'March 15, 2026',
  timeSlot = '10:00 AM',
  guestCount = 2,
  totalAmount = 5980,
  hotelName = 'Patong Beach Hotel',
  roomNumber = '302',
  hasTransfer = true,
  isPrivateTransfer = false,
  addons = [],
}: BookingConfirmationEmailProps) => {
  const previewText = `Your Three Monkeys reservation is confirmed! Booking #${bookingRef}`;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={header}>
            <Img
              src={`${baseUrl}/images/LOGO-NS.png`}
              width="180"
              height="auto"
              alt="Three Monkeys"
              style={logo}
            />
          </Section>

          {/* Success Banner */}
          <Section style={successBanner}>
            <div style={checkmarkCircle}>
              <Text style={checkmark}>✓</Text>
            </div>
            <Heading style={successTitle}>Booking Confirmed!</Heading>
            <Text style={successSubtitle}>
              Thank you for choosing Three Monkeys, {customerName}!
            </Text>
          </Section>

          {/* Booking Reference */}
          <Section style={refSection}>
            <Text style={refLabel}>BOOKING REFERENCE</Text>
            <Text style={refNumber}>{bookingRef}</Text>
            <Text style={refNote}>Please save this number for your records</Text>
          </Section>

          <Hr style={divider} />

          {/* Booking Details Card */}
          <Section style={detailsCard}>
            <Heading as="h2" style={sectionTitle}>
              Your Reservation Details
            </Heading>

            <Row style={detailRow}>
              <Column style={detailIcon}>
                <Text style={iconText}>📦</Text>
              </Column>
              <Column style={detailContent}>
                <Text style={detailLabel}>Package</Text>
                <Text style={detailValue}>{packageName}</Text>
              </Column>
            </Row>

            <Row style={detailRow}>
              <Column style={detailIcon}>
                <Text style={iconText}>📅</Text>
              </Column>
              <Column style={detailContent}>
                <Text style={detailLabel}>Date</Text>
                <Text style={detailValue}>{activityDate}</Text>
              </Column>
            </Row>

            <Row style={detailRow}>
              <Column style={detailIcon}>
                <Text style={iconText}>🕐</Text>
              </Column>
              <Column style={detailContent}>
                <Text style={detailLabel}>Time</Text>
                <Text style={detailValue}>{timeSlot}</Text>
              </Column>
            </Row>

            <Row style={detailRow}>
              <Column style={detailIcon}>
                <Text style={iconText}>👥</Text>
              </Column>
              <Column style={detailContent}>
                <Text style={detailLabel}>Guests</Text>
                <Text style={detailValue}>{guestCount} {guestCount === 1 ? 'person' : 'people'}</Text>
              </Column>
            </Row>

            {hasTransfer && hotelName && (
              <Row style={detailRow}>
                <Column style={detailIcon}>
                  <Text style={iconText}>🚐</Text>
                </Column>
                <Column style={detailContent}>
                  <Text style={detailLabel}>
                    {isPrivateTransfer ? 'Private Transfer' : 'Hotel Pickup'}
                  </Text>
                  <Text style={detailValue}>
                    {hotelName}{roomNumber ? `, Room ${roomNumber}` : ''}
                  </Text>
                </Column>
              </Row>
            )}
          </Section>

          {/* Add-ons if any */}
          {addons && addons.length > 0 && (
            <Section style={addonsSection}>
              <Heading as="h3" style={addonsTitle}>
                Add-ons
              </Heading>
              {addons.map((addon, index) => (
                <Row key={index} style={addonRow}>
                  <Column>
                    <Text style={addonName}>
                      {addon.name} × {addon.quantity}
                    </Text>
                  </Column>
                  <Column style={addonPriceCol}>
                    <Text style={addonPrice}>฿{formatPrice(addon.price * addon.quantity)}</Text>
                  </Column>
                </Row>
              ))}
            </Section>
          )}

          <Hr style={divider} />

          {/* Total Amount */}
          <Section style={totalSection}>
            <Row>
              <Column>
                <Text style={totalLabel}>Total Paid</Text>
              </Column>
              <Column style={totalAmountCol}>
                <Text style={totalAmount_}>฿{formatPrice(totalAmount)}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* What to Bring */}
          <Section style={infoSection}>
            <Heading as="h2" style={sectionTitle}>
              What to Bring
            </Heading>
            <Row style={infoRow}>
              <Column style={infoBullet}>
                <Text style={bulletPoint}>•</Text>
              </Column>
              <Column>
                <Text style={infoText}>Comfortable clothing & closed-toe shoes</Text>
              </Column>
            </Row>
            <Row style={infoRow}>
              <Column style={infoBullet}>
                <Text style={bulletPoint}>•</Text>
              </Column>
              <Column>
                <Text style={infoText}>Sunscreen & insect repellent</Text>
              </Column>
            </Row>
            <Row style={infoRow}>
              <Column style={infoBullet}>
                <Text style={bulletPoint}>•</Text>
              </Column>
              <Column>
                <Text style={infoText}>Camera with secure strap (optional)</Text>
              </Column>
            </Row>
            <Row style={infoRow}>
              <Column style={infoBullet}>
                <Text style={bulletPoint}>•</Text>
              </Column>
              <Column>
                <Text style={infoText}>This booking confirmation (digital or printed)</Text>
              </Column>
            </Row>
          </Section>

          {/* Important Notes */}
          <Section style={notesSection}>
            <Heading as="h2" style={notesSectionTitle}>
              Important Information
            </Heading>
            <Text style={noteText}>
              ⏰ Please arrive 15 minutes before your reservation time
            </Text>
            <Text style={noteText}>
              🍽️ Smart casual dress code is recommended
            </Text>
            <Text style={noteText}>
              ⚠️ Please inform us of any dietary restrictions or allergies
            </Text>
            <Text style={noteText}>
              📞 Contact us at least 24 hours in advance for any changes
            </Text>
          </Section>

          {/* CTA Button */}
          <Section style={ctaSection}>
            <Button style={ctaButton} href={`${baseUrl}/booking?ref=${bookingRef}`}>
              View Booking Details
            </Button>
          </Section>

          {/* Contact Information */}
          <Section style={contactSection}>
            <Heading as="h3" style={contactTitle}>
              Need Help?
            </Heading>
            <Text style={contactText}>
              📧 Email: <Link href="mailto:enjoy@threemonkeysphuket.com" style={contactLink}>enjoy@threemonkeysphuket.com</Link>
            </Text>
            <Text style={contactText}>
              📞 Phone: <Link href="tel:+66980108838" style={contactLink}>+66 98-010-8838</Link>
            </Text>
            <Text style={contactText}>
              💬 LINE: @threemonkeys
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Img
              src={`${baseUrl}/images/LOGO-NS.png`}
              width="120"
              height="auto"
              alt="Three Monkeys"
              style={footerLogo}
            />
            <Text style={footerText}>
              Phuket&apos;s Premier Thai Restaurant
            </Text>
            <Row style={socialRow}>
              <Column style={socialCol}>
                <Link href="https://www.facebook.com/threemonkeys" style={socialLink}>
                  Facebook
                </Link>
              </Column>
              <Column style={socialCol}>
                <Link href="https://www.instagram.com/threemonkeysrestaurant/" style={socialLink}>
                  Instagram
                </Link>
              </Column>
              <Column style={socialCol}>
                <Link href="https://www.tripadvisor.com/Attraction_Review-g293920-d3519838-Reviews-Flying_Hanuman-Phuket.html" style={socialLink}>
                  TripAdvisor
                </Link>
              </Column>
            </Row>
            <Text style={footerAddress}>
              Inside Hanuman World, 105 Moo 4, Muang Chao Fa Rd., Wichit, Mueang Phuket, Phuket 83000, Thailand
            </Text>
            <Text style={footerCopyright}>
              © 2026 Three Monkeys. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default BookingConfirmationEmail;

// Styles
const main: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container: React.CSSProperties = {
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '600px',
};

const header: React.CSSProperties = {
  backgroundColor: '#1a1a1a',
  padding: '30px 40px',
  textAlign: 'center' as const,
  borderRadius: '16px 16px 0 0',
};

const logo: React.CSSProperties = {
  margin: '0 auto',
};

const successBanner: React.CSSProperties = {
  backgroundColor: '#1a1a1a',
  padding: '20px 40px 40px',
  textAlign: 'center' as const,
};

const checkmarkCircle: React.CSSProperties = {
  width: '80px',
  height: '80px',
  backgroundColor: '#22c55e',
  borderRadius: '50%',
  margin: '0 auto 20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const checkmark: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '40px',
  fontWeight: 'bold',
  lineHeight: '80px',
  margin: 0,
  textAlign: 'center' as const,
};

const successTitle: React.CSSProperties = {
  color: '#b1b94c',
  fontSize: '32px',
  fontWeight: '700',
  margin: '0 0 10px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
};

const successSubtitle: React.CSSProperties = {
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '16px',
  margin: 0,
};

const refSection: React.CSSProperties = {
  backgroundColor: '#0f0f0f',
  padding: '25px 40px',
  textAlign: 'center' as const,
};

const refLabel: React.CSSProperties = {
  color: 'rgba(255, 255, 255, 0.6)',
  fontSize: '12px',
  fontWeight: '600',
  letterSpacing: '2px',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
};

const refNumber: React.CSSProperties = {
  color: '#b1b94c',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 8px',
  letterSpacing: '2px',
};

const refNote: React.CSSProperties = {
  color: 'rgba(255, 255, 255, 0.5)',
  fontSize: '12px',
  margin: 0,
};

const divider: React.CSSProperties = {
  borderColor: '#e4e4e7',
  margin: 0,
};

const detailsCard: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '30px 40px',
};

const sectionTitle: React.CSSProperties = {
  color: '#1a1a1a',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 20px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const detailRow: React.CSSProperties = {
  marginBottom: '16px',
};

const detailIcon: React.CSSProperties = {
  width: '40px',
  verticalAlign: 'top',
};

const iconText: React.CSSProperties = {
  fontSize: '20px',
  margin: 0,
};

const detailContent: React.CSSProperties = {
  verticalAlign: 'top',
};

const detailLabel: React.CSSProperties = {
  color: '#71717a',
  fontSize: '12px',
  fontWeight: '500',
  margin: '0 0 2px',
  textTransform: 'uppercase' as const,
};

const detailValue: React.CSSProperties = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: 0,
};

const addonsSection: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  padding: '20px 40px',
};

const addonsTitle: React.CSSProperties = {
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 12px',
  textTransform: 'uppercase' as const,
};

const addonRow: React.CSSProperties = {
  marginBottom: '8px',
};

const addonName: React.CSSProperties = {
  color: '#52525b',
  fontSize: '14px',
  margin: 0,
};

const addonPriceCol: React.CSSProperties = {
  textAlign: 'right' as const,
};

const addonPrice: React.CSSProperties = {
  color: '#18181b',
  fontSize: '14px',
  fontWeight: '600',
  margin: 0,
};

const totalSection: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '20px 40px',
};

const totalLabel: React.CSSProperties = {
  color: '#52525b',
  fontSize: '16px',
  fontWeight: '500',
  margin: 0,
};

const totalAmountCol: React.CSSProperties = {
  textAlign: 'right' as const,
};

const totalAmount_: React.CSSProperties = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: '700',
  margin: 0,
};

const infoSection: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '30px 40px',
};

const infoRow: React.CSSProperties = {
  marginBottom: '8px',
};

const infoBullet: React.CSSProperties = {
  width: '20px',
  verticalAlign: 'top',
};

const bulletPoint: React.CSSProperties = {
  color: '#b1b94c',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: 0,
};

const infoText: React.CSSProperties = {
  color: '#52525b',
  fontSize: '14px',
  margin: 0,
  lineHeight: '1.5',
};

const notesSection: React.CSSProperties = {
  backgroundColor: '#fef9c3',
  padding: '25px 40px',
  borderLeft: '4px solid #b1b94c',
};

const notesSectionTitle: React.CSSProperties = {
  color: '#713f12',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0 0 15px',
  textTransform: 'uppercase' as const,
};

const noteText: React.CSSProperties = {
  color: '#78350f',
  fontSize: '14px',
  margin: '0 0 8px',
  lineHeight: '1.5',
};

const ctaSection: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '30px 40px',
  textAlign: 'center' as const,
};

const ctaButton: React.CSSProperties = {
  backgroundColor: '#b1b94c',
  borderRadius: '12px',
  color: '#000000',
  fontSize: '16px',
  fontWeight: '700',
  padding: '16px 32px',
  textDecoration: 'none',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
};

const contactSection: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  padding: '30px 40px',
  textAlign: 'center' as const,
};

const contactTitle: React.CSSProperties = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0 0 15px',
};

const contactText: React.CSSProperties = {
  color: '#52525b',
  fontSize: '14px',
  margin: '0 0 8px',
};

const contactLink: React.CSSProperties = {
  color: '#1a1a1a',
  textDecoration: 'none',
};

const footer: React.CSSProperties = {
  backgroundColor: '#1a1a1a',
  padding: '40px',
  textAlign: 'center' as const,
  borderRadius: '0 0 16px 16px',
};

const footerLogo: React.CSSProperties = {
  margin: '0 auto 15px',
};

const footerText: React.CSSProperties = {
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '14px',
  margin: '0 0 20px',
};

const socialRow: React.CSSProperties = {
  marginBottom: '20px',
};

const socialCol: React.CSSProperties = {
  textAlign: 'center' as const,
};

const socialLink: React.CSSProperties = {
  color: '#b1b94c',
  fontSize: '14px',
  textDecoration: 'none',
  padding: '0 15px',
};

const footerAddress: React.CSSProperties = {
  color: 'rgba(255, 255, 255, 0.5)',
  fontSize: '12px',
  margin: '0 0 10px',
  lineHeight: '1.5',
};

const footerCopyright: React.CSSProperties = {
  color: 'rgba(255, 255, 255, 0.4)',
  fontSize: '11px',
  margin: 0,
};
