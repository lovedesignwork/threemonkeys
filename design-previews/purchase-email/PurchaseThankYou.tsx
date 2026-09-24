import * as React from 'react';
import { Body, Button, Column, Container, Head, Heading, Hr, Html, Img, Link, Preview, Row, Section, Text } from '@react-email/components';

// Approval draft only. The live email sender does not import this component.
export interface PurchaseThankYouProps {
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
  assetBaseUrl: string;
}

const C = { forest: '#14271e', ink: '#20352a', lime: '#c0c969', paper: '#faf9f2', muted: '#737a68', line: '#dcdfce' };
const site = 'https://threemonkeysphuket.com';
const sans = 'Arial, Helvetica, sans-serif';
const serif = 'Georgia, "Times New Roman", serif';
const label: React.CSSProperties = { fontFamily: sans, fontSize: 10, fontWeight: 700, letterSpacing: '1.7px', lineHeight: '16px', margin: '0 0 7px', textTransform: 'uppercase', color: C.muted };
const body: React.CSSProperties = { fontFamily: sans, fontSize: 14, lineHeight: '23px', color: C.ink, margin: 0 };
const price = (amount: number) => `฿${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(amount)}`;

function Field({ title, children, border = false }: { title: string; children: React.ReactNode; border?: boolean }) {
  return <Column className="detail-cell" style={{ width: '50%', verticalAlign: 'top', padding: '18px 0', borderBottom: `1px solid ${C.line}`, ...(border ? { paddingLeft: 22, borderLeft: `1px solid ${C.line}` } : { paddingRight: 18 }) }}>
    <Text style={label}>{title}</Text>
    <Text style={{ ...body, fontSize: 16, lineHeight: '24px', fontWeight: 600 }}>{children}</Text>
  </Column>;
}

function ArrivalNote({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return <Row>
    <Column style={{ width: 34, verticalAlign: 'top', paddingTop: 16 }}>
      <Text style={{ ...body, color: '#909952', fontFamily: serif, fontSize: 20 }}>{number}</Text>
    </Column>
    <Column style={{ padding: '16px 0', borderBottom: `1px solid ${C.line}` }}>
      <Text style={{ ...body, fontWeight: 700, marginBottom: 3 }}>{title}</Text>
      <Text style={{ ...body, color: C.muted, fontSize: 12, lineHeight: '20px' }}>{children}</Text>
    </Column>
  </Row>;
}

export default function PurchaseThankYou({ customerName, bookingRef, packageName, activityDate, timeSlot, guestCount, totalAmount, hotelName, roomNumber, hasTransfer, isPrivateTransfer, addons = [], zoneName, specialRequests, assetBaseUrl }: PurchaseThankYouProps) {
  return <Html lang="en">
    <Head>
      <meta name="color-scheme" content="light" />
      <meta name="supported-color-schemes" content="light" />
      <style>{`
        body { margin: 0 !important; padding: 0 !important; }
        table { border-spacing: 0; }
        a { text-underline-offset: 4px; }
        @media only screen and (max-width: 600px) {
          .outer { padding: 0 !important; }
          .email { width: 100% !important; }
          .inset { padding-left: 24px !important; padding-right: 24px !important; }
          .hero-title { font-size: 40px !important; line-height: 44px !important; }
          .hero { padding-top: 32px !important; padding-bottom: 38px !important; }
          .brand-name { font-size: 12px !important; letter-spacing: 1.5px !important; }
          .brand-location { display: none !important; }
          .detail-cell { padding-top: 15px !important; padding-bottom: 15px !important; }
          .main-button { font-size: 13px !important; padding-left: 24px !important; padding-right: 24px !important; }
          .footer-links a { display: inline-block; margin: 4px 6px; }
        }
      `}</style>
    </Head>
    <Preview>Your table is reserved, {customerName}. Here are the details for your visit to Three Monkeys. {bookingRef}</Preview>
    <Body style={{ backgroundColor: '#e9eadf', fontFamily: sans }}>
      <Section className="outer" style={{ padding: '32px 12px' }}>
        <Container className="email" style={{ width: '100%', maxWidth: 640, margin: '0 auto', backgroundColor: C.paper }}>
          <Section className="inset" style={{ backgroundColor: '#101e17', padding: '22px 38px', borderBottom: '1px solid #344233' }}>
            <Row>
              <Column style={{ width: 54 }}><Img src={`${assetBaseUrl}/logo.png`} alt="Three Monkeys" width="42" height="43" style={{ display: 'block' }} /></Column>
              <Column>
                <Text className="brand-name" style={{ margin: 0, color: '#f7f6e9', fontSize: 14, fontWeight: 700, letterSpacing: '2.4px', lineHeight: '21px' }}>THREE MONKEYS</Text>
                <Text style={{ ...label, color: '#a4ad83', fontSize: 8, margin: 0, letterSpacing: '2.3px' }}>RESTAURANT · PHUKET</Text>
              </Column>
              <Column className="brand-location" style={{ textAlign: 'right', verticalAlign: 'middle' }}><Text style={{ ...label, color: '#a4ad83', fontSize: 8, margin: 0, letterSpacing: '1.4px' }}>A LITTLE CLOSER<br />TO NATURE</Text></Column>
            </Row>
          </Section>

          <Section className="hero inset" style={{ backgroundColor: C.forest, backgroundImage: `url("${assetBaseUrl}/botanical-canopy.jpg")`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', padding: '38px 42px 42px', textAlign: 'center' }}>
            <Text style={{ ...label, display: 'inline-block', color: C.lime, fontSize: 9, letterSpacing: '1.8px', margin: '0 0 22px', padding: '6px 13px', border: '1px solid #6b7745', borderRadius: 20 }}>✓ &nbsp; RESERVATION CONFIRMED</Text>
            <Heading className="hero-title" style={{ fontFamily: serif, fontWeight: 400, fontSize: 51, lineHeight: '54px', letterSpacing: '-1.5px', color: '#fffff4', margin: '0 0 20px' }}>Something wonderful<br /><em style={{ color: '#d2d891', fontWeight: 400 }}>awaits you.</em></Heading>
            <Text style={{ ...body, color: '#f0f1de', fontSize: 14, margin: '0 auto', maxWidth: 390 }}>Thank you, {customerName}. Your table is reserved.<br />We can’t wait to welcome you to the rainforest.</Text>
          </Section>

          <Section className="inset" style={{ padding: '29px 40px 0', backgroundColor: C.paper }}>
            <Row>
              <Column><Text style={{ ...label, margin: 0, fontSize: 9 }}>YOUR RESERVATION</Text></Column>
              <Column style={{ textAlign: 'right' }}><Text style={{ ...body, fontFamily: 'Consolas, "Courier New", monospace', fontSize: 12, letterSpacing: '.7px' }}>{bookingRef}</Text></Column>
            </Row>
            <Hr style={{ margin: '16px 0 24px', border: 0, borderTop: `1px dashed #abb18d` }} />
            <Text style={{ ...label, color: '#7d8942' }}>A SEAT AMONG THE TREES</Text>
            <Heading as="h2" style={{ fontFamily: serif, color: C.ink, fontSize: 32, lineHeight: '39px', fontWeight: 400, margin: '0 0 4px' }}>{packageName}</Heading>
            {zoneName && zoneName.toLowerCase() !== packageName.toLowerCase() && <Text style={{ ...body, color: C.muted, fontSize: 12 }}>Dining zone: {zoneName}</Text>}
            <Row><Field title="YOUR DATE">{activityDate}</Field><Field title="YOUR TIME" border>{timeSlot}<br /><span style={{ fontSize: 10, fontWeight: 400, color: C.muted }}>Thailand time · GMT+7</span></Field></Row>
            <Row><Field title="YOUR COMPANY">{guestCount} {guestCount === 1 ? 'guest' : 'guests'}</Field><Field title="YOUR DESTINATION" border>Three Monkeys<br /><span style={{ fontSize: 11, fontWeight: 400, color: C.muted }}>Hanuman World, Phuket</span></Field></Row>
          </Section>

          {(addons.length > 0 || (hasTransfer && hotelName) || specialRequests?.trim()) && <Section className="inset" style={{ padding: '24px 40px 0' }}>
            {addons.length > 0 && <>
              <Text style={label}>A LITTLE SOMETHING EXTRA</Text>
              {addons.map((addon, index) => <Row key={`${addon.name}-${index}`}><Column><Text style={{ ...body, padding: '5px 0', fontSize: 13 }}>{addon.name} <span style={{ color: C.muted }}>× {addon.quantity}</span></Text></Column><Column style={{ textAlign: 'right' }}><Text style={{ ...body, fontSize: 13 }}>{price(addon.price * addon.quantity)}</Text></Column></Row>)}
            </>}
            {hasTransfer && hotelName && <Section style={{ marginTop: addons.length ? 20 : 0 }}>
              <Text style={label}>{isPrivateTransfer ? 'PRIVATE HOTEL TRANSFER' : 'HOTEL PICKUP'}</Text>
              <Text style={{ ...body, fontSize: 13 }}>{hotelName}{roomNumber ? ` · Room ${roomNumber}` : ''}</Text>
              <Text style={{ ...body, color: C.muted, fontSize: 11 }}>For pickup arrangements, contact our team on WhatsApp.</Text>
            </Section>}
            {specialRequests?.trim() && <Section style={{ marginTop: 20, borderLeft: '2px solid #a3ae60', paddingLeft: 14 }}>
              <Text style={{ ...label, fontSize: 9 }}>YOUR NOTE TO OUR TEAM</Text>
              <Text style={{ ...body, fontFamily: serif, fontStyle: 'italic', fontSize: 15, whiteSpace: 'pre-wrap' }}>{specialRequests}</Text>
            </Section>}
          </Section>}

          <Section className="inset" style={{ padding: '24px 40px 30px' }}>
            <Section style={{ backgroundColor: '#e8ebd5', padding: '20px 22px', borderRadius: 2 }}>
              <Row>
                <Column><Text style={{ ...label, color: '#556037', marginBottom: 3, fontSize: 9 }}>PAYMENT RECEIVED</Text><Text style={{ ...body, fontSize: 12 }}>Paid today</Text></Column>
                <Column style={{ textAlign: 'right' }}><Text style={{ fontFamily: serif, fontSize: 34, lineHeight: '39px', margin: 0, color: C.ink }}>{price(totalAmount)}</Text></Column>
              </Row>
            </Section>
            <Text style={{ ...body, fontSize: 10, color: C.muted, textAlign: 'center', margin: '10px 0 24px' }}>Your card statement will show <strong style={{ fontWeight: 600, color: '#4e5a43' }}>ONEBOOKING</strong>.</Text>
            <Section style={{ textAlign: 'center' }}><Button className="main-button" href="https://maps.app.goo.gl/hk5Z7PQUHnmz6tVB6" style={{ backgroundColor: C.forest, color: '#f5f5dc', padding: '16px 40px', borderRadius: 3, fontSize: 13, fontWeight: 700, textDecoration: 'none', letterSpacing: '.5px' }}>Find your way to us &nbsp; ↗</Button></Section>
            <Text style={{ ...body, fontSize: 11, color: C.muted, textAlign: 'center', marginTop: 12 }}>Please keep your booking reference for arrival.</Text>
          </Section>

          <Section style={{ backgroundColor: C.forest }}>
            <Img src={`${assetBaseUrl}/rainforest-dining.jpg`} width="640" height="427" alt="Three Monkeys’ illuminated dining nests tucked among the rainforest trees" style={{ display: 'block', width: '100%', height: 'auto', border: 0 }} />
            <Text style={{ ...label, color: '#c7cf9e', fontSize: 8, letterSpacing: '2.1px', textAlign: 'center', margin: 0, padding: '12px 15px' }}>GOOD FOOD. GREAT COMPANY. A LITTLE MAGIC.</Text>
          </Section>

          <Section className="inset" style={{ padding: '30px 40px 28px' }}>
            <Text style={{ ...label, color: '#7d8942' }}>A FEW LITTLE DETAILS</Text>
            <Heading as="h2" style={{ fontFamily: serif, color: C.ink, fontSize: 29, fontWeight: 400, margin: '0 0 5px', lineHeight: '36px' }}>Before we meet.</Heading>
            <ArrivalNote number="01" title="Take your time getting here.">Please arrive 15 minutes early. We hold reservations for 15 minutes after your booked time.</ArrivalNote>
            <ArrivalNote number="02" title="Come comfortably, dine beautifully.">Smart casual is recommended. Let us know about any dietary requirements before your visit.</ArrivalNote>
            <ArrivalNote number="03" title="Plans change. We understand.">For reservation changes, please contact our team at least 24 hours in advance.</ArrivalNote>
            <Text style={{ ...body, fontFamily: serif, fontSize: 23, fontStyle: 'italic', color: '#60713e', lineHeight: '31px', textAlign: 'center', margin: '30px 0 8px' }}>See you among the trees,</Text>
            <Text style={{ ...label, color: C.ink, textAlign: 'center', fontSize: 9, margin: 0 }}>THE THREE MONKEYS TEAM</Text>
          </Section>

          <Section className="inset" style={{ backgroundColor: C.forest, padding: '27px 35px', textAlign: 'center' }}>
            <Text style={{ ...body, color: '#f3f4df', fontFamily: serif, fontSize: 23, marginBottom: 13 }}>We’re here for the little things.</Text>
            <Text className="footer-links" style={{ ...body, fontSize: 12 }}>
              <Link href="https://wa.me/66980108838" style={{ color: C.lime, textDecoration: 'underline' }}>WhatsApp us</Link>
              <span style={{ color: '#778364', margin: '0 12px' }}> / </span>
              <Link href="tel:+66980108838" style={{ color: C.lime, textDecoration: 'underline' }}>Call our team</Link>
              <span style={{ color: '#778364', margin: '0 12px' }}> / </span>
              <Link href={`${site}/menu`} style={{ color: C.lime, textDecoration: 'underline' }}>Explore the menu</Link>
            </Text>
            <Text style={{ ...body, fontSize: 11, marginTop: 13 }}><Link href="mailto:enjoy@threemonkeysphuket.com" style={{ color: '#c3cbb5', textDecoration: 'none' }}>enjoy@threemonkeysphuket.com</Link></Text>
          </Section>

          <Section className="inset" style={{ padding: '23px 35px', textAlign: 'center', backgroundColor: '#e9eadf' }}>
            <Text style={{ ...label, color: '#536047', fontSize: 8, marginBottom: 6 }}>THREE MONKEYS RESTAURANT · PHUKET</Text>
            <Text style={{ ...body, fontSize: 10, lineHeight: '17px', color: C.muted }}>Inside Hanuman World · Wichit, Phuket 83000, Thailand<br />Open daily, 10AM – 1AM</Text>
            <Text style={{ ...body, fontSize: 9, color: C.muted, marginTop: 10 }}>Sent with care for your Three Monkeys reservation.<br />© {new Date().getFullYear()} Three Monkeys Restaurant</Text>
          </Section>
        </Container>
      </Section>
    </Body>
  </Html>;
}
