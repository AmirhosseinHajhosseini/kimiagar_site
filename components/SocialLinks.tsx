'use client';
import { FaTelegram, FaInstagram, FaPhone } from 'react-icons/fa';

export default function SocialLinks() {
  return (
    <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
      <a href="https://t.me/YOUR_ID" style={{ color: 'var(--cyan)', fontSize: '24px' }}>
        <FaTelegram />
      </a>
      <a href="https://instagram.com/YOUR_ID" style={{ color: 'var(--cyan)', fontSize: '24px' }}>
        <FaInstagram />
      </a>
      <a href="tel:09200921735" style={{ color: 'var(--cyan)', fontSize: '24px' }}>
        <FaPhone />
      </a>
    </div>
  );
}
