'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useDb } from '../../context/DbContext';
import { supabase } from '../../lib/supabaseClient';
import { useGoogleAds } from '../../context/GoogleAdsContext';
import { submitContactForm } from '../actions/contactActions';

export default function IletisimPage() {
  const { t, language } = useLanguage();
  const { settings, addInboxMessage } = useDb();
  const { trackConversion } = useGoogleAds();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('Toptan Alım');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionTrackId, setSessionTrackId] = useState<string | null>(null);

  const handleInputFocus = async () => {
    if (sessionTrackId) return; // Already started tracking

    const tempId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setSessionTrackId(tempId);

    const res = await supabase.from('form_interactions').insert({
      session_id: tempId,
      status: 'form_started'
    });
    if (res.error) {
      console.warn('Failed to log form interaction start:', res.error);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Track Google Ads Conversion
    trackConversion('contact');

    const result = await submitContactForm({
      type: 'lead',
      name,
      email,
      phone,
      subject: `İletişim Talebi: ${contactSubject}`,
      message: message || `${contactSubject} hakkında bilgi talebi.`,
      formId: 'xkolnkpg'
    });

    if (result.error) {
      console.warn('Form submission failed:', result.error);
    }

    if (sessionTrackId) {
      const res = await supabase
        .from('form_interactions')
        .update({ status: 'form_completed' })
        .eq('session_id', sessionTrackId);
      if (res.error) {
        console.warn('Failed to log form interaction completion:', res.error);
      }
    }

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
    }, 1200);
  };

  return (
    <div style={{ backgroundColor: 'var(--color-primary)', minHeight: 'calc(100vh - 90px)' }}>
      <section className="appointment" style={{ padding: '8rem 4rem', minHeight: 'calc(100vh - 90px)', display: 'grid' }}>
        <div className="appointment-info reveal active">
          <span className="section-label">{t('contactPage.label')}</span>
          <h1 className="appointment-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '3.5rem', lineHeight: '1.2', color: '#fff' }}>
            {t('contactPage.title')}
          </h1>
          <p style={{ marginBottom: '2rem', fontWeight: 300, opacity: 0.9, fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)' }}>
            {t('contactPage.desc')}
          </p>
          
          <div className="contact-details">
            <div className="contact-item">
              <div className="contact-icon">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
              </div>
              <div className="contact-text">
                <h4 style={{ color: 'var(--color-accent)' }}>{t('appointment.emailLabel')}</h4>
                <p><a href={settings?.email ? `mailto:${settings.email}` : '#'} style={{ color: '#fff', textDecoration: 'none' }}>{settings?.email}</a></p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
              </div>
              <div className="contact-text">
                <h4 style={{ color: 'var(--color-accent)' }}>{t('appointment.phoneLabel')}</h4>
                <p><a href={settings?.phone ? `tel:${settings.phone.replace(/\s+/g, '')}` : '#'} style={{ color: '#fff', textDecoration: 'none' }}>{settings?.phone}</a></p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              </div>
              <div className="contact-text">
                <h4 style={{ color: 'var(--color-accent)' }}>{t('appointment.addressLabel')}</h4>
                <p>
                  <a href={settings?.address ? `https://maps.google.com/?q=${encodeURIComponent(settings.address)}` : '#'} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none' }}>
                    {settings?.address}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="appointment-form reveal active" style={{ transitionDelay: '0.2s' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '2.5rem', textAlign: 'center', color: 'var(--color-white)' }}>
            {t('contactPage.formTitle')}
          </h2>
          {submitted ? (
            <div style={{ textAlign: 'center', color: 'var(--color-accent)', fontSize: '1.2rem', padding: '2rem', fontFamily: 'var(--font-serif)' }}>
              {t('contactPage.successMsg')}
            </div>
          ) : (
            <form onSubmit={handleFormSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">{t('contactPage.fullName')}</label>
                  <input 
                    type="text" 
                    id="name" 
                    required 
                    placeholder={t('appointment.placeholderName')}
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    onFocus={handleInputFocus}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">{t('contactPage.phone')}</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    required 
                    placeholder={t('appointment.placeholderPhone')}
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    onFocus={handleInputFocus}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">{t('contactPage.email')}</label>
                  <input 
                    type="email" 
                    id="email" 
                    required 
                    placeholder={t('appointment.placeholderEmail')}
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={handleInputFocus}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="subject">{t('contactPage.subjectLabel')}</label>
                  <select 
                    id="subject" 
                    value={contactSubject} 
                    onChange={(e) => setContactSubject(e.target.value)}
                    onFocus={handleInputFocus}
                  >
                    <option value="Toptan Alım">{t('contactPage.subjects.general')}</option>
                    <option value="Bayilik">{t('contactPage.subjects.cooperation')}</option>
                    <option value="Proje İş Birliği">{t('contactPage.subjects.suggestion')}</option>
                    <option value="Kurumsal Talep">{t('contactPage.subjects.other')}</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label htmlFor="message">{t('contactPage.details')}</label>
                  <textarea 
                    id="message" 
                    rows={4} 
                    placeholder={t('contactPage.placeholderDetails')}
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)}
                    onFocus={handleInputFocus}
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? '...' : t('contactPage.submitBtn')}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
