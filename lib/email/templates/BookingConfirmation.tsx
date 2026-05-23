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
  zoneName?: string | null;
  specialRequests?: string | null;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://threemonkeysphuket.com';

export const BookingConfirmationEmail = ({
  customerName = 'Guest',
  bookingRef = '3M-000000',
  packageName = '',
  activityDate = '',
  timeSlot = '',
  guestCount = 2,
  totalAmount = 0,
  hotelName,
  roomNumber,
  hasTransfer = false,
  isPrivateTransfer = false,
  addons = [],
  zoneName = null,
  specialRequests = null,
}: BookingConfirmationEmailProps) => {
  const previewText = `Your Three Monkeys reservation is confirmed — ${bookingRef}`;

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* ───── HEADER: lime band with logo + tagline ───── */}
          <Section style={header}>
            <Img
              src={`${baseUrl}/images/threemonkeyslogo.png`}
              width="120"
              height="auto"
              alt="Three Monkeys Restaurant Phuket"
              style={logo}
            />
            <Text style={tagline}>Rainforest Dining · Phuket</Text>
          </Section>

          {/* ───── HERO: confirmation banner ───── */}
          <Section style={heroSection}>
            <div style={checkmarkWrap}>
              <Text style={checkmark}>✓</Text>
            </div>
            <Text style={heroBadge}>RESERVATION CONFIRMED</Text>
            <Heading style={heroTitle}>Your table awaits</Heading>
            <Text style={heroSubtitle}>
              Thank you, {customerName}. We can&apos;t wait to welcome you.
            </Text>
          </Section>

          {/* ───── BOOKING REFERENCE pill ───── */}
          <Section style={refSection}>
            <Text style={refLabel}>BOOKING REFERENCE</Text>
            <Text style={refNumber}>{bookingRef}</Text>
            <Text style={refNote}>Please keep this number for your records</Text>
          </Section>

          {/* ───── RESERVATION DETAILS card ───── */}
          <Section style={detailsCard}>
            <Heading as="h2" style={sectionTitle}>
              Reservation Details
            </Heading>

            <table style={detailsTable}>
              <tbody>
                <tr style={detailsTr}>
                  <td style={detailsKey}>Package</td>
                  <td style={detailsValue}>{packageName}</td>
                </tr>
                <tr style={detailsTr}>
                  <td style={detailsKey}>Date</td>
                  <td style={detailsValue}>{activityDate}</td>
                </tr>
                <tr style={detailsTr}>
                  <td style={detailsKey}>Time</td>
                  <td style={detailsValue}>{timeSlot}</td>
                </tr>
                <tr style={detailsTr}>
                  <td style={detailsKey}>Guests</td>
                  <td style={detailsValue}>
                    {guestCount} {guestCount === 1 ? 'person' : 'people'}
                  </td>
                </tr>
                {zoneName && (
                  <tr style={detailsTr}>
                    <td style={detailsKey}>Dining Zone</td>
                    <td style={detailsValue}>{zoneName}</td>
                  </tr>
                )}
                {hasTransfer && hotelName && (
                  <tr style={detailsTr}>
                    <td style={detailsKey}>
                      {isPrivateTransfer ? 'Private Transfer' : 'Hotel Pickup'}
                    </td>
                    <td style={detailsValue}>
                      {hotelName}
                      {roomNumber ? `, Room ${roomNumber}` : ''}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Section>

          {/* ───── ADD-ONS card ───── */}
          {addons && addons.length > 0 && (
            <Section style={addonsCard}>
              <Heading as="h3" style={subSectionTitle}>
                Add-ons &amp; Extras
              </Heading>
              {addons.map((addon, index) => (
                <Row key={index} style={addonRow}>
                  <Column>
                    <Text style={addonName}>
                      {addon.name}
                      <span style={addonQty}> × {addon.quantity}</span>
                    </Text>
                  </Column>
                  <Column style={addonPriceCol}>
                    <Text style={addonPrice}>
                      ฿{formatPrice(addon.price * addon.quantity)}
                    </Text>
                  </Column>
                </Row>
              ))}
            </Section>
          )}

          {/* ───── SPECIAL REQUESTS card ───── */}
          {specialRequests && specialRequests.trim() && (
            <Section style={requestsCard}>
              <Heading as="h3" style={subSectionTitle}>
                Special Requests
              </Heading>
              <Text style={requestsText}>{specialRequests}</Text>
            </Section>
          )}

          {/* ───── TOTAL ───── */}
          <Section style={totalSection}>
            <Row>
              <Column>
                <Text style={totalLabel}>Total Paid</Text>
              </Column>
              <Column style={totalAmountCol}>
                <Text style={totalAmountStyle}>฿{formatPrice(totalAmount)}</Text>
              </Column>
            </Row>
            <Text style={descriptorNote}>
              The charge appears as <strong style={descriptorTag}>ONEBOOKING</strong> on
              your card statement.
            </Text>
          </Section>

          {/* ───── IMPORTANT INFO ───── */}
          <Section style={importantSection}>
            <Heading as="h3" style={importantTitle}>
              Important Information
            </Heading>
            <Text style={importantItem}>• Please arrive 15 minutes before your reservation time</Text>
            <Text style={importantItem}>• Smart casual dress code recommended</Text>
            <Text style={importantItem}>• Let us know about dietary requirements in advance</Text>
            <Text style={importantItem}>• Reservations held for 15 minutes past booking time</Text>
            <Text style={importantItem}>• Contact us at least 24 hours ahead for any changes</Text>
          </Section>

          {/* ───── CTA ───── */}
          <Section style={ctaSection}>
            <Button style={ctaButton} href={`${baseUrl}`}>
              Visit Three Monkeys
            </Button>
          </Section>

          {/* ───── CONTACT ───── */}
          <Section style={contactCard}>
            <Heading as="h3" style={subSectionTitle}>
              Need Help?
            </Heading>
            <table style={contactTable}>
              <tbody>
                <tr>
                  <td style={contactIconCell}>📞</td>
                  <td style={contactInfoCell}>
                    <Text style={contactLabel}>PHONE</Text>
                    <Link href="tel:+66980108838" style={contactLink}>
                      +66 98-010-8838
                    </Link>
                  </td>
                </tr>
                <tr>
                  <td style={contactIconCell}>💬</td>
                  <td style={contactInfoCell}>
                    <Text style={contactLabel}>WHATSAPP</Text>
                    <Link href="https://wa.me/66980108838" style={contactLink}>
                      +66 98-010-8838
                    </Link>
                  </td>
                </tr>
                <tr>
                  <td style={contactIconCell}>✉️</td>
                  <td style={contactInfoCell}>
                    <Text style={contactLabel}>EMAIL</Text>
                    <Link href="mailto:enjoy@threemonkeysphuket.com" style={contactLink}>
                      enjoy@threemonkeysphuket.com
                    </Link>
                  </td>
                </tr>
                <tr>
                  <td style={contactIconCell}>📍</td>
                  <td style={contactInfoCell}>
                    <Text style={contactLabel}>LOCATION</Text>
                    <Link
                      href="https://maps.app.goo.gl/hk5Z7PQUHnmz6tVB6"
                      style={contactLink}
                    >
                      Inside Hanuman World, Kathu, Phuket
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* ───── FOOTER ───── */}
          <Section style={footer}>
            <Text style={footerBrand}>THREE MONKEYS RESTAURANT</Text>
            <Text style={footerTagline}>Phuket&apos;s rainforest dining experience</Text>
            <Hr style={footerDivider} />
            <Text style={footerLinks}>
              <Link href={baseUrl} style={footerLink}>
                Website
              </Link>
              {' · '}
              <Link href={`${baseUrl}/menu`} style={footerLink}>
                Menu
              </Link>
              {' · '}
              <Link href={`${baseUrl}/special-packages`} style={footerLink}>
                Special Packages
              </Link>
              {' · '}
              <Link href={`${baseUrl}/contact`} style={footerLink}>
                Contact
              </Link>
            </Text>
            <Text style={footerAddress}>
              Inside Hanuman World, 105 Moo 4, Muang Chao Fa Rd., Wichit, Mueang
              Phuket, Phuket 83000, Thailand
            </Text>
            <Text style={footerCopyright}>
              © {new Date().getFullYear()} Three Monkeys Restaurant Phuket. All rights
              reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default BookingConfirmationEmail;

// ────────────────────────────────────────────────────────────
// Three Monkeys CI palette
// ────────────────────────────────────────────────────────────
const BRAND = '#b1b94c'; // lime
const BRAND_DARK = '#8a9139';
const BLACK = '#0a0a0a';
const INK = '#111111';
const TEXT = '#1f2937';
const MUTED = '#6b7280';
const SUCCESS = '#16a34a';
const BG = '#f6f6f1';

// ────────────────────────────────────────────────────────────
// Styles
// ────────────────────────────────────────────────────────────
const main: React.CSSProperties = {
  backgroundColor: BG,
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container: React.CSSProperties = {
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '600px',
};

const header: React.CSSProperties = {
  backgroundColor: BRAND,
  padding: '32px 40px 24px',
  textAlign: 'center' as const,
  borderRadius: '14px 14px 0 0',
};

const logo: React.CSSProperties = {
  margin: '0 auto',
  display: 'block',
};

const tagline: React.CSSProperties = {
  color: BLACK,
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.3em',
  textTransform: 'uppercase' as const,
  margin: '12px 0 0',
  opacity: 0.75,
};

const heroSection: React.CSSProperties = {
  backgroundColor: INK,
  padding: '40px 40px 32px',
  textAlign: 'center' as const,
};

const checkmarkWrap: React.CSSProperties = {
  width: '72px',
  height: '72px',
  backgroundColor: SUCCESS,
  borderRadius: '50%',
  margin: '0 auto 18px',
  display: 'inline-block',
  boxShadow: '0 8px 28px rgba(22, 163, 74, 0.35)',
};

const checkmark: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '36px',
  fontWeight: 'bold',
  lineHeight: '72px',
  margin: 0,
  textAlign: 'center' as const,
};

const heroBadge: React.CSSProperties = {
  color: BRAND,
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.3em',
  margin: '0 0 10px',
  textTransform: 'uppercase' as const,
};

const heroTitle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '30px',
  fontWeight: 700,
  margin: '0 0 10px',
  lineHeight: '1.2',
};

const heroSubtitle: React.CSSProperties = {
  color: 'rgba(255, 255, 255, 0.7)',
  fontSize: '15px',
  margin: 0,
  lineHeight: '1.5',
};

const refSection: React.CSSProperties = {
  backgroundColor: INK,
  padding: '8px 40px 32px',
  textAlign: 'center' as const,
  borderBottom: `2px solid ${BRAND}`,
};

const refLabel: React.CSSProperties = {
  color: 'rgba(255, 255, 255, 0.5)',
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.3em',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
};

const refNumber: React.CSSProperties = {
  color: BRAND,
  fontSize: '28px',
  fontWeight: 700,
  margin: '0 0 6px',
  letterSpacing: '0.1em',
  fontFamily: '"SF Mono", Menlo, Consolas, monospace',
};

const refNote: React.CSSProperties = {
  color: 'rgba(255, 255, 255, 0.4)',
  fontSize: '11px',
  margin: 0,
};

const detailsCard: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '28px 40px',
};

const sectionTitle: React.CSSProperties = {
  color: BLACK,
  fontSize: '16px',
  fontWeight: 700,
  margin: '0 0 18px',
  letterSpacing: '0.05em',
  textTransform: 'uppercase' as const,
};

const subSectionTitle: React.CSSProperties = {
  color: BLACK,
  fontSize: '13px',
  fontWeight: 700,
  margin: '0 0 14px',
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
};

const detailsTable: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const detailsTr: React.CSSProperties = {
  borderBottom: '1px solid #f1f1ec',
};

const detailsKey: React.CSSProperties = {
  color: MUTED,
  fontSize: '12px',
  fontWeight: 500,
  padding: '12px 0',
  width: '40%',
  verticalAlign: 'top' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
};

const detailsValue: React.CSSProperties = {
  color: TEXT,
  fontSize: '15px',
  fontWeight: 600,
  padding: '12px 0',
  verticalAlign: 'top' as const,
};

const addonsCard: React.CSSProperties = {
  backgroundColor: '#fafaf5',
  padding: '24px 40px',
  borderTop: `1px solid ${BRAND}22`,
};

const addonRow: React.CSSProperties = {
  marginBottom: '8px',
};

const addonName: React.CSSProperties = {
  color: TEXT,
  fontSize: '14px',
  fontWeight: 500,
  margin: 0,
};

const addonQty: React.CSSProperties = {
  color: MUTED,
  fontWeight: 400,
};

const addonPriceCol: React.CSSProperties = {
  textAlign: 'right' as const,
};

const addonPrice: React.CSSProperties = {
  color: BRAND_DARK,
  fontSize: '14px',
  fontWeight: 700,
  margin: 0,
};

const requestsCard: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '24px 40px',
  borderTop: '1px solid #f1f1ec',
};

const requestsText: React.CSSProperties = {
  color: TEXT,
  fontSize: '14px',
  lineHeight: '1.6',
  margin: 0,
  padding: '14px 16px',
  backgroundColor: '#fafaf5',
  border: `1px solid ${BRAND}22`,
  borderRadius: '10px',
  whiteSpace: 'pre-wrap' as const,
};

const totalSection: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '24px 40px',
  borderTop: `2px solid ${BRAND}`,
};

const totalLabel: React.CSSProperties = {
  color: TEXT,
  fontSize: '15px',
  fontWeight: 500,
  margin: 0,
};

const totalAmountCol: React.CSSProperties = {
  textAlign: 'right' as const,
};

const totalAmountStyle: React.CSSProperties = {
  color: BLACK,
  fontSize: '28px',
  fontWeight: 700,
  margin: 0,
  letterSpacing: '-0.02em',
};

const descriptorNote: React.CSSProperties = {
  color: MUTED,
  fontSize: '11px',
  margin: '10px 0 0',
  textAlign: 'right' as const,
};

const descriptorTag: React.CSSProperties = {
  backgroundColor: '#f1f1ec',
  padding: '2px 6px',
  borderRadius: '4px',
  fontFamily: '"SF Mono", Menlo, Consolas, monospace',
  fontSize: '10px',
  color: TEXT,
};

const importantSection: React.CSSProperties = {
  backgroundColor: '#fffaeb',
  padding: '20px 40px',
  border: '1px solid #fde68a',
  borderLeft: '4px solid #f59e0b',
  margin: '16px 0 0',
};

const importantTitle: React.CSSProperties = {
  color: '#92400e',
  fontSize: '13px',
  fontWeight: 700,
  margin: '0 0 10px',
  letterSpacing: '0.05em',
  textTransform: 'uppercase' as const,
};

const importantItem: React.CSSProperties = {
  color: '#92400e',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: '4px 0',
};

const ctaSection: React.CSSProperties = {
  backgroundColor: '#fafaf5',
  padding: '28px 40px',
  textAlign: 'center' as const,
};

const ctaButton: React.CSSProperties = {
  backgroundColor: BRAND,
  borderRadius: '999px',
  color: BLACK,
  fontSize: '14px',
  fontWeight: 700,
  padding: '14px 36px',
  textDecoration: 'none',
  letterSpacing: '0.05em',
};

const contactCard: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '24px 40px 32px',
  borderTop: '1px solid #f1f1ec',
};

const contactTable: React.CSSProperties = {
  width: '100%',
};

const contactIconCell: React.CSSProperties = {
  fontSize: '20px',
  padding: '10px 14px 10px 0',
  verticalAlign: 'top' as const,
  width: '34px',
};

const contactInfoCell: React.CSSProperties = {
  padding: '10px 0',
  verticalAlign: 'top' as const,
};

const contactLabel: React.CSSProperties = {
  color: MUTED,
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.15em',
  margin: '0 0 3px',
};

const contactLink: React.CSSProperties = {
  color: BRAND_DARK,
  fontSize: '14px',
  fontWeight: 600,
  textDecoration: 'none',
};

const footer: React.CSSProperties = {
  backgroundColor: BLACK,
  padding: '32px 40px 28px',
  borderRadius: '0 0 14px 14px',
  textAlign: 'center' as const,
};

const footerBrand: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 700,
  letterSpacing: '0.15em',
  margin: '0 0 4px',
};

const footerTagline: React.CSSProperties = {
  color: BRAND,
  fontSize: '11px',
  letterSpacing: '0.2em',
  margin: '0 0 14px',
  textTransform: 'uppercase' as const,
};

const footerDivider: React.CSSProperties = {
  borderColor: '#1f2937',
  margin: '14px 0',
};

const footerLinks: React.CSSProperties = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '0 0 14px',
};

const footerLink: React.CSSProperties = {
  color: BRAND,
  textDecoration: 'none',
  fontWeight: 500,
};

const footerAddress: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '11px',
  margin: '0 0 12px',
  lineHeight: '1.5',
};

const footerCopyright: React.CSSProperties = {
  color: '#4b5563',
  fontSize: '10px',
  margin: 0,
};
