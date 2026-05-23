import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface ContactAutoReplyProps {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  submittedAt: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://threemonkeysphuket.com';

export const ContactAutoReply = ({
  name = 'Guest',
  email = '',
  phone = '',
  subject = '',
  message = '',
  submittedAt = '',
}: ContactAutoReplyProps) => {
  const previewText = `We've received your message — Three Monkeys Restaurant Phuket`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with logo */}
          <Section style={header}>
            <Img
              src={`${baseUrl}/images/threemonkeyslogo.png`}
              width="140"
              height="auto"
              alt="Three Monkeys Restaurant Phuket"
              style={logo}
            />
            <Text style={tagline}>Rainforest Dining · Phuket</Text>
          </Section>

          {/* Hero banner */}
          <Section style={heroBanner}>
            <Text style={heroBadge}>MESSAGE RECEIVED</Text>
            <Heading style={heroTitle}>We&apos;ve got your message</Heading>
            <Text style={heroSubtitle}>
              Thanks for reaching out, {name}. Our team will be in touch shortly.
            </Text>
          </Section>

          {/* Greeting */}
          <Section style={contentSection}>
            <Text style={greeting}>Dear {name},</Text>
            <Text style={paragraph}>
              Thank you for contacting <strong>Three Monkeys Restaurant Phuket</strong>. We&apos;ve
              received your enquiry about{' '}
              <strong style={accent}>&ldquo;{subject}&rdquo;</strong> and our team will get back to
              you as soon as possible.
            </Text>
            <Text style={paragraph}>
              We typically respond within 24 hours. If your message is urgent, please reach us
              directly by phone or WhatsApp using the contact details below.
            </Text>
          </Section>

          {/* Submission summary */}
          <Section style={summaryCard}>
            <Text style={summaryLabel}>YOUR MESSAGE</Text>
            <table style={summaryTable}>
              <tbody>
                <tr>
                  <td style={summaryKey}>Subject</td>
                  <td style={summaryValue}>{subject}</td>
                </tr>
                {email && (
                  <tr>
                    <td style={summaryKey}>Email</td>
                    <td style={summaryValue}>
                      <Link href={`mailto:${email}`} style={summaryLink}>
                        {email}
                      </Link>
                    </td>
                  </tr>
                )}
                {phone && (
                  <tr>
                    <td style={summaryKey}>Phone</td>
                    <td style={summaryValue}>
                      <Link href={`tel:${phone}`} style={summaryLink}>
                        {phone}
                      </Link>
                    </td>
                  </tr>
                )}
                {submittedAt && (
                  <tr>
                    <td style={summaryKey}>Submitted</td>
                    <td style={summaryValue}>{submittedAt}</td>
                  </tr>
                )}
              </tbody>
            </table>
            <div style={messageBlock}>
              <Text style={messageLabel}>Message</Text>
              <Text style={messageBody}>{message}</Text>
            </div>
          </Section>

          {/* Contact info */}
          <Section style={contactSection}>
            <Heading as="h2" style={sectionTitle}>
              Need Immediate Assistance?
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
                  <td style={contactIconCell}>🕒</td>
                  <td style={contactInfoCell}>
                    <Text style={contactLabel}>OPERATING HOURS</Text>
                    <Text style={contactValue}>
                      Monday – Sunday · 10:00 AM – 1:00 AM (GMT+7)
                    </Text>
                    <Text style={contactSubValue}>Last order 12:00 AM</Text>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* CTA */}
          <Section style={ctaSection}>
            <Text style={ctaText}>
              While you wait, why not explore our dining experiences?
            </Text>
            <Button style={ctaButton} href={`${baseUrl}/booking`}>
              Book Your Table
            </Button>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerBrand}>Three Monkeys Restaurant</Text>
            <Text style={footerTagline}>Phuket&apos;s rainforest dining experience</Text>
            <Text style={footerAddress}>
              Inside Hanuman World, Kathu, Phuket, Thailand
            </Text>
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
              <Link href={`${baseUrl}/booking`} style={footerLink}>
                Book
              </Link>
              {' · '}
              <Link href={`${baseUrl}/contact`} style={footerLink}>
                Contact
              </Link>
            </Text>
            <Text style={copyright}>
              © {new Date().getFullYear()} Three Monkeys Restaurant Phuket. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ContactAutoReply;

// ───────────────────────────────────────────────────────────
// Styles — Three Monkeys CI (lime #b1b94c on black)
// ───────────────────────────────────────────────────────────
const BRAND = '#b1b94c';
const BRAND_DARK = '#8a9139';
const BLACK = '#0a0a0a';
const TEXT = '#1f2937';
const MUTED = '#6b7280';
const BG = '#f6f6f1';

const main = {
  backgroundColor: BG,
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '600px',
};

const header = {
  backgroundColor: BLACK,
  padding: '32px 40px 24px',
  borderRadius: '14px 14px 0 0',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
};

const tagline = {
  color: BRAND,
  fontSize: '11px',
  letterSpacing: '0.25em',
  margin: '12px 0 0',
  textTransform: 'uppercase' as const,
};

const heroBanner = {
  background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`,
  backgroundColor: BRAND,
  padding: '40px 40px 36px',
  textAlign: 'center' as const,
};

const heroBadge = {
  color: BLACK,
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '0.25em',
  margin: '0 0 12px',
  opacity: 0.7,
};

const heroTitle = {
  color: BLACK,
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '1.2',
  margin: '0 0 12px',
};

const heroSubtitle = {
  color: BLACK,
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
  opacity: 0.85,
};

const contentSection = {
  backgroundColor: '#ffffff',
  padding: '32px 40px 16px',
};

const greeting = {
  color: TEXT,
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 16px',
};

const paragraph = {
  color: '#4b5563',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 14px',
};

const accent = {
  color: BRAND_DARK,
};

const summaryCard = {
  backgroundColor: '#ffffff',
  padding: '8px 40px 32px',
};

const summaryLabel = {
  color: MUTED,
  fontSize: '10px',
  fontWeight: '700',
  letterSpacing: '0.2em',
  margin: '0 0 12px',
  textTransform: 'uppercase' as const,
};

const summaryTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  backgroundColor: '#fafaf5',
  borderRadius: '12px',
  border: `1px solid ${BRAND}33`,
};

const summaryKey = {
  color: MUTED,
  fontSize: '12px',
  fontWeight: '500',
  padding: '12px 16px',
  width: '100px',
  verticalAlign: 'top' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
};

const summaryValue = {
  color: TEXT,
  fontSize: '14px',
  padding: '12px 16px 12px 0',
  verticalAlign: 'top' as const,
};

const summaryLink = {
  color: BRAND_DARK,
  textDecoration: 'none',
  fontWeight: '500',
};

const messageBlock = {
  marginTop: '16px',
  padding: '16px',
  backgroundColor: '#fafaf5',
  border: `1px solid ${BRAND}33`,
  borderRadius: '12px',
};

const messageLabel = {
  color: MUTED,
  fontSize: '11px',
  fontWeight: '600',
  letterSpacing: '0.1em',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
};

const messageBody = {
  color: TEXT,
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
};

const contactSection = {
  backgroundColor: '#ffffff',
  padding: '28px 40px 32px',
  borderTop: `1px solid ${BRAND}22`,
};

const sectionTitle = {
  color: BLACK,
  fontSize: '16px',
  fontWeight: '700',
  margin: '0 0 20px',
};

const contactTable = {
  width: '100%',
};

const contactIconCell = {
  fontSize: '22px',
  padding: '10px 16px 10px 0',
  verticalAlign: 'top' as const,
  width: '40px',
};

const contactInfoCell = {
  padding: '10px 0',
  verticalAlign: 'top' as const,
};

const contactLabel = {
  color: MUTED,
  fontSize: '10px',
  fontWeight: '700',
  letterSpacing: '0.15em',
  margin: '0 0 4px',
};

const contactLink = {
  color: BRAND_DARK,
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
};

const contactValue = {
  color: TEXT,
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
};

const contactSubValue = {
  color: MUTED,
  fontSize: '12px',
  margin: '2px 0 0',
};

const ctaSection = {
  backgroundColor: '#fafaf5',
  padding: '32px 40px',
  textAlign: 'center' as const,
};

const ctaText = {
  color: TEXT,
  fontSize: '14px',
  margin: '0 0 20px',
};

const ctaButton = {
  backgroundColor: BRAND,
  borderRadius: '999px',
  color: BLACK,
  fontSize: '14px',
  fontWeight: '700',
  padding: '14px 36px',
  textDecoration: 'none',
  letterSpacing: '0.05em',
};

const footer = {
  backgroundColor: BLACK,
  padding: '32px 40px 28px',
  borderRadius: '0 0 14px 14px',
  textAlign: 'center' as const,
};

const footerBrand = {
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '700',
  letterSpacing: '0.05em',
  margin: '0',
};

const footerTagline = {
  color: BRAND,
  fontSize: '11px',
  letterSpacing: '0.2em',
  margin: '4px 0 12px',
  textTransform: 'uppercase' as const,
};

const footerAddress = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '0 0 8px',
};

const footerDivider = {
  borderColor: '#1f2937',
  margin: '16px 0',
};

const footerLinks = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '0 0 12px',
};

const footerLink = {
  color: BRAND,
  textDecoration: 'none',
  fontWeight: '500',
};

const copyright = {
  color: '#6b7280',
  fontSize: '10px',
  margin: '0',
};
