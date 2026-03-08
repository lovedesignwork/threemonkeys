import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Link,
} from '@react-email/components';
import * as React from 'react';

interface ContactFormEmailProps {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  submittedAt: string;
}

export const ContactFormEmail = ({
  name,
  email,
  phone,
  subject,
  message,
  submittedAt,
}: ContactFormEmailProps) => {
  const previewText = `New contact form submission from ${name}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>New Contact Form Submission</Heading>
          </Section>

          {/* Alert Banner */}
          <Section style={alertBanner}>
            <Text style={alertText}>
              You have received a new message from the Three Monkeys website contact form.
            </Text>
          </Section>

          {/* Contact Details */}
          <Section style={detailsCard}>
            <Heading as="h2" style={sectionTitle}>
              Contact Details
            </Heading>
            
            <table style={table}>
              <tbody>
                <tr>
                  <td style={labelCell}>Name:</td>
                  <td style={valueCell}>{name}</td>
                </tr>
                <tr>
                  <td style={labelCell}>Email:</td>
                  <td style={valueCell}>
                    <Link href={`mailto:${email}`} style={link}>{email}</Link>
                  </td>
                </tr>
                {phone && (
                  <tr>
                    <td style={labelCell}>Phone:</td>
                    <td style={valueCell}>
                      <Link href={`tel:${phone}`} style={link}>{phone}</Link>
                    </td>
                  </tr>
                )}
                <tr>
                  <td style={labelCell}>Subject:</td>
                  <td style={valueCell}>{subject}</td>
                </tr>
                <tr>
                  <td style={labelCell}>Submitted:</td>
                  <td style={valueCell}>{submittedAt}</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Hr style={divider} />

          {/* Message */}
          <Section style={messageSection}>
            <Heading as="h2" style={sectionTitle}>
              Message
            </Heading>
            <Text style={messageText}>{message}</Text>
          </Section>

          <Hr style={divider} />

          {/* Quick Actions */}
          <Section style={actionsSection}>
            <Heading as="h2" style={sectionTitle}>
              Quick Actions
            </Heading>
            <Text style={actionText}>
              <Link href={`mailto:${email}?subject=Re: ${subject}`} style={actionLink}>
                Reply to {name}
              </Link>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This email was sent from the Three Monkeys website contact form.
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} Three Monkeys. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ContactFormEmail;

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
  backgroundColor: '#1a1a1a',
  padding: '30px 40px',
  borderRadius: '12px 12px 0 0',
};

const headerTitle = {
  color: '#b1b94c',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0',
  textAlign: 'center' as const,
};

const alertBanner = {
  backgroundColor: '#b1b94c',
  padding: '15px 40px',
};

const alertText = {
  color: '#000000',
  fontSize: '14px',
  margin: '0',
  textAlign: 'center' as const,
};

const detailsCard = {
  backgroundColor: '#ffffff',
  padding: '30px 40px',
};

const sectionTitle = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 20px 0',
};

const table = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const labelCell = {
  color: '#64748b',
  fontSize: '14px',
  fontWeight: '500',
  padding: '8px 0',
  width: '120px',
  verticalAlign: 'top' as const,
};

const valueCell = {
  color: '#1e293b',
  fontSize: '14px',
  padding: '8px 0',
  verticalAlign: 'top' as const,
};

const link = {
  color: '#1a1a1a',
  textDecoration: 'underline',
};

const divider = {
  borderColor: '#e2e8f0',
  margin: '0',
};

const messageSection = {
  backgroundColor: '#ffffff',
  padding: '30px 40px',
};

const messageText = {
  color: '#334155',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
};

const actionsSection = {
  backgroundColor: '#f8fafc',
  padding: '20px 40px',
};

const actionText = {
  margin: '0',
};

const actionLink = {
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: '500',
  textDecoration: 'underline',
};

const footer = {
  backgroundColor: '#1a1a1a',
  padding: '20px 40px',
  borderRadius: '0 0 12px 12px',
};

const footerText = {
  color: '#94a3b8',
  fontSize: '12px',
  margin: '5px 0',
  textAlign: 'center' as const,
};
