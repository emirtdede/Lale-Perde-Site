import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface LoginScreenProps {
  handleLogin: (e: React.FormEvent) => void;
  usernameInput: string;
  setUsernameInput: (val: string) => void;
  passwordInput: string;
  setPasswordInput: (val: string) => void;
  loginError: string;
  resetFlow: boolean;
  setResetFlow: (val: boolean) => void;
  resetEmailOrPhone: string;
  setResetEmailOrPhone: (val: string) => void;
  triggerResetOTP: () => void;
  sentResetOTP: string;
  otpInput: string;
  setOtpInput: (val: string) => void;
  verifyResetOTP: () => void;
  otpVerified: boolean;
  newPasswordInput: string;
  setNewPasswordInput: (val: string) => void;
  changePasswordWithOTP: () => void;
  resetStatus: string;
  // 2FA props
  twoFactorFlow: boolean;
  setTwoFactorFlow: (val: boolean) => void;
  twoFactorInput: string;
  setTwoFactorInput: (val: string) => void;
  twoFactorError: string;
  twoFactorSentDestination: string;
  handleTwoFactorVerify: (e: React.FormEvent) => void;
  twoFactorChoiceFlow: boolean;
  setTwoFactorChoiceFlow: (val: boolean) => void;
  sendOTPForLogin: (type: 'email' | 'phone') => void;
  adminEmail: string;
  adminPhone: string;
}

export default function LoginScreen({
  handleLogin,
  usernameInput,
  setUsernameInput,
  passwordInput,
  setPasswordInput,
  loginError,
  resetFlow,
  setResetFlow,
  resetEmailOrPhone,
  setResetEmailOrPhone,
  triggerResetOTP,
  sentResetOTP,
  otpInput,
  setOtpInput,
  verifyResetOTP,
  otpVerified,
  newPasswordInput,
  setNewPasswordInput,
  changePasswordWithOTP,
  resetStatus,
  twoFactorFlow,
  setTwoFactorFlow,
  twoFactorInput,
  setTwoFactorInput,
  twoFactorError,
  twoFactorSentDestination,
  handleTwoFactorVerify,
  twoFactorChoiceFlow,
  setTwoFactorChoiceFlow,
  sendOTPForLogin,
  adminEmail,
  adminPhone
}: LoginScreenProps) {
  const { t } = useLanguage();
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'phone' | null>(null);
  const [confirmInput, setConfirmInput] = useState('');
  const [confirmError, setConfirmError] = useState('');

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      padding: '2rem',
      backgroundColor: '#0A1118',
      backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(189, 149, 75, 0.06) 0%, transparent 60%)'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '460px', 
        padding: '3rem 2.5rem', 
        backgroundColor: '#0F1820',
        border: '1px solid rgba(189, 149, 75, 0.15)',
        borderRadius: '16px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle inner glow at top */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '200px',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(189, 149, 75, 0.5), transparent)'
        }} />

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            display: 'inline-block',
            width: '80px',
            height: '80px',
            filter: 'drop-shadow(0 4px 12px rgba(189, 149, 75, 0.25))'
          }}>
            <img 
              src="/assets/laleperdelogo.svg" 
              alt="Lale Perde" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain',
                filter: 'brightness(0) saturate(100%) invert(60%) sepia(70%) saturate(400%) hue-rotate(7deg) brightness(92%) contrast(90%)'
              }} 
            />
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            fontFamily: "'La Fleur Grande', 'La Fleur', var(--font-serif)", 
            fontSize: '1.5rem', 
            color: 'var(--color-accent)',
            letterSpacing: '0.2em',
            fontWeight: 'normal',
            marginBottom: '0.4rem'
          }}>
            LALE PERDE
          </div>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '1rem',
            color: 'var(--color-accent)',
            letterSpacing: '0.18em',
            fontWeight: 500,
            textTransform: 'uppercase'
          }}>
            {t('admin.login.title')}
          </p>
        </div>
        
        {twoFactorChoiceFlow ? (
          <div>
            {selectedMethod === null ? (
              <>
                <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', opacity: 0.8, color: '#A3B3C2', lineHeight: '1.5' }}>
                  {t('admin.login.twoFactorChoiceSubtitle')}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  <button 
                    type="button"
                    onClick={() => { setSelectedMethod('email'); setConfirmInput(''); setConfirmError(''); }} 
                    style={{ 
                      padding: '1.1rem', 
                      background: 'rgba(189, 149, 75, 0.08)', 
                      border: '1px solid rgba(189, 149, 75, 0.3)', 
                      color: '#E0E6ED', 
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.6rem',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      transition: 'all 0.2s',
                      width: '100%'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(189, 149, 75, 0.15)'; e.currentTarget.style.borderColor = 'rgba(189, 149, 75, 0.6)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(189, 149, 75, 0.08)'; e.currentTarget.style.borderColor = 'rgba(189, 149, 75, 0.3)'; }}
                  >
                    <svg width="20" height="20" fill="none" stroke="var(--color-accent)" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    {t('admin.login.sendToEmail')}
                  </button>

                  <button 
                    type="button"
                    onClick={() => { setSelectedMethod('phone'); setConfirmInput(''); setConfirmError(''); }} 
                    style={{ 
                      padding: '1.1rem', 
                      background: 'rgba(189, 149, 75, 0.08)', 
                      border: '1px solid rgba(189, 149, 75, 0.3)', 
                      color: '#E0E6ED', 
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.6rem',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      transition: 'all 0.2s',
                      width: '100%'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(189, 149, 75, 0.15)'; e.currentTarget.style.borderColor = 'rgba(189, 149, 75, 0.6)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(189, 149, 75, 0.08)'; e.currentTarget.style.borderColor = 'rgba(189, 149, 75, 0.3)'; }}
                  >
                    <svg width="20" height="20" fill="none" stroke="var(--color-accent)" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    {t('admin.login.sendToPhone')}
                  </button>
                </div>
              </>
            ) : (
              <div>
                <p style={{ fontSize: '0.9rem', marginBottom: '1.2rem', opacity: 0.8, color: '#A3B3C2', lineHeight: '1.5' }}>
                  {selectedMethod === 'email' 
                    ? t('admin.login.resetSubtitle') 
                    : t('admin.login.resetSubtitle')}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '1.5rem' }}>
                  <input
                    type={selectedMethod === 'email' ? 'email' : 'text'}
                    required
                    placeholder={selectedMethod === 'email' ? 'emirdede@example.com' : '+90 555 555 55 55'}
                    value={confirmInput}
                    onChange={(e) => setConfirmInput(e.target.value)}
                    style={{ 
                      padding: '0.85rem 1rem', 
                      border: '1px solid rgba(189, 149, 75, 0.3)', 
                      borderRadius: '6px', 
                      background: 'rgba(15, 24, 32, 0.6)', 
                      color: '#E0E6ED',
                      fontSize: '1rem',
                      outline: 'none',
                      textAlign: 'center'
                    }}
                  />
                  {confirmError && (
                    <p style={{ color: '#FF6B6B', fontSize: '0.85rem', textAlign: 'center', background: 'rgba(255, 75, 75, 0.08)', padding: '0.6rem', borderRadius: '6px', border: '1px solid rgba(255, 75, 75, 0.15)', margin: 0 }}>
                      {confirmError}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                      type="button"
                      onClick={() => setSelectedMethod(null)}
                      style={{ 
                        flex: 1,
                        padding: '0.85rem', 
                        background: 'transparent', 
                        border: '1px solid rgba(189, 149, 75, 0.4)', 
                        color: 'rgba(189, 149, 75, 0.9)', 
                        fontWeight: 600, 
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      Geri
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        if (selectedMethod === 'email') {
                          if (confirmInput.trim().toLowerCase() === adminEmail.trim().toLowerCase()) {
                            sendOTPForLogin('email');
                            setSelectedMethod(null);
                          } else {
                            setConfirmError('Girdiğiniz e-posta adresi kayıtlı bilgilerle uyuşmuyor.');
                          }
                        } else {
                          const cleanConfirm = confirmInput.replace(/\D/g, '');
                          const cleanAdminPhone = adminPhone.replace(/\D/g, '');
                          if (cleanConfirm === cleanAdminPhone && cleanConfirm !== '') {
                            sendOTPForLogin('phone');
                            setSelectedMethod(null);
                          } else {
                            setConfirmError('Girdiğiniz telefon numarası kayıtlı bilgilerle uyuşmuyor.');
                          }
                        }
                      }}
                      style={{ 
                        flex: 2,
                        padding: '0.85rem', 
                        background: 'linear-gradient(135deg, #BD954B, #A57E3B)', 
                        border: 'none', 
                        color: '#FFF', 
                        fontWeight: 600, 
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      {t('admin.login.sendCodeBtn')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {loginError && !confirmError && (
              <p style={{ color: '#FF6B6B', fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'center', background: 'rgba(255, 75, 75, 0.08)', padding: '0.6rem', borderRadius: '6px', border: '1px solid rgba(255, 75, 75, 0.15)' }}>{loginError}</p>
            )}

            <button 
              type="button"
              onClick={() => { setTwoFactorChoiceFlow(false); setSelectedMethod(null); }} 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'rgba(189, 149, 75, 0.7)', 
                cursor: 'pointer', 
                display: 'block', 
                marginTop: '1.5rem', 
                width: '100%', 
                textAlign: 'center',
                fontSize: '0.9rem'
              }}
            >
              ← {t('admin.login.backToLogin')}
            </button>
          </div>
        ) : twoFactorFlow ? (
          <form onSubmit={handleTwoFactorVerify}>
            <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', opacity: 0.8, color: '#A3B3C2', lineHeight: '1.5' }}>
              {t('admin.login.twoFactorSubtitle')}
              <br />
              <strong style={{ color: 'var(--color-accent)' }}>{twoFactorSentDestination}</strong>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '1.5rem' }}>
              <input
                type="text"
                maxLength={6}
                required
                placeholder="000000"
                value={twoFactorInput}
                onChange={(e) => setTwoFactorInput(e.target.value.replace(/\D/g, ''))}
                style={{ 
                  padding: '0.85rem 1rem', 
                  border: '1px solid rgba(189, 149, 75, 0.3)', 
                  borderRadius: '6px', 
                  background: 'rgba(15, 24, 32, 0.6)', 
                  color: '#E0E6ED',
                  fontSize: '1.2rem',
                  letterSpacing: '0.3em',
                  textAlign: 'center',
                  outline: 'none',
                  fontFamily: 'monospace'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(189, 149, 75, 0.7)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(189, 149, 75, 0.3)'}
              />
              {twoFactorError && (
                <p style={{ color: '#FF6B6B', fontSize: '0.85rem', textAlign: 'center', background: 'rgba(255, 75, 75, 0.08)', padding: '0.6rem', borderRadius: '6px', border: '1px solid rgba(255, 75, 75, 0.15)', margin: 0 }}>
                  {twoFactorError}
                </p>
              )}
              <button 
                type="submit" 
                style={{ 
                  padding: '0.85rem', 
                  background: 'linear-gradient(135deg, #BD954B, #A57E3B)', 
                  border: 'none', 
                  color: '#FFF', 
                  fontWeight: 600, 
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  letterSpacing: '0.05em',
                  transition: 'all 0.3s ease',
                  width: '100%'
                }}
                onMouseOver={(e) => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseOut={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {t('admin.login.twoFactorVerifyBtn')}
              </button>
            </div>
            
            <button 
              type="button"
              onClick={() => setTwoFactorFlow(false)} 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'rgba(189, 149, 75, 0.7)', 
                cursor: 'pointer', 
                display: 'block', 
                marginTop: '1.5rem', 
                width: '100%', 
                textAlign: 'center',
                fontSize: '0.9rem'
              }}
            >
              ← {t('admin.login.backToLogin')}
            </button>
          </form>
        ) : resetFlow ? (
          <div>
            <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', opacity: 0.8, color: '#A3B3C2' }}>
              {t('admin.login.resetSubtitle')}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '1.5rem' }}>
              <input
                type="text"
                placeholder={t('admin.login.contactInfo')}
                value={resetEmailOrPhone}
                onChange={(e) => setResetEmailOrPhone(e.target.value)}
                style={{ 
                  padding: '0.85rem 1rem', 
                  border: '1px solid rgba(189, 149, 75, 0.3)', 
                  borderRadius: '6px', 
                  background: 'rgba(15, 24, 32, 0.6)', 
                  color: '#E0E6ED',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(189, 149, 75, 0.7)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(189, 149, 75, 0.3)'}
              />
              <button 
                onClick={triggerResetOTP} 
                style={{ 
                  padding: '0.85rem', 
                  background: 'linear-gradient(135deg, #BD954B, #A57E3B)', 
                  border: 'none', 
                  color: '#FFF', 
                  fontWeight: 600, 
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  letterSpacing: '0.05em',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseOut={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {t('admin.login.sendCodeBtn')}
              </button>
            </div>

            {sentResetOTP && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '1.5rem' }}>
                <input
                  type="text"
                  placeholder={t('admin.login.enterCode')}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  style={{ 
                    padding: '0.85rem 1rem', 
                    border: '1px solid rgba(189, 149, 75, 0.3)', 
                    borderRadius: '6px', 
                    background: 'rgba(15, 24, 32, 0.6)', 
                    color: '#E0E6ED',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(189, 149, 75, 0.7)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(189, 149, 75, 0.3)'}
                />
                <button 
                  onClick={verifyResetOTP} 
                  style={{ 
                    padding: '0.85rem', 
                    background: 'linear-gradient(135deg, #BD954B, #A57E3B)', 
                    border: 'none', 
                    color: '#FFF', 
                    fontWeight: 600, 
                    borderRadius: '6px',
                    cursor: 'pointer',
                    letterSpacing: '0.05em'
                  }}
                >
                  {t('admin.login.verifyBtn')}
                </button>
              </div>
            )}

            {otpVerified && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '1.5rem' }}>
                <input
                  type="password"
                  placeholder={t('admin.login.newPassword')}
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  style={{ 
                    padding: '0.85rem 1rem', 
                    border: '1px solid rgba(189, 149, 75, 0.3)', 
                    borderRadius: '6px', 
                    background: 'rgba(15, 24, 32, 0.6)', 
                    color: '#E0E6ED',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(189, 149, 75, 0.7)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(189, 149, 75, 0.3)'}
                />
                <button 
                  onClick={changePasswordWithOTP} 
                  style={{ 
                    padding: '0.85rem', 
                    background: 'linear-gradient(135deg, #BD954B, #A57E3B)', 
                    border: 'none', 
                    color: '#FFF', 
                    fontWeight: 600, 
                    borderRadius: '6px',
                    cursor: 'pointer',
                    letterSpacing: '0.05em'
                  }}
                >
                  {t('admin.login.savePasswordBtn')}
                </button>
              </div>
            )}

            {resetStatus && (
              <div style={{ padding: '0.8rem', background: 'rgba(189, 149, 75, 0.08)', fontSize: '0.8rem', borderRadius: '6px', marginTop: '1rem', color: 'var(--color-accent)', border: '1px solid rgba(189, 149, 75, 0.15)' }}>
                {resetStatus}
              </div>
            )}
            
            <button 
              onClick={() => setResetFlow(false)} 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'var(--color-accent)', 
                cursor: 'pointer', 
                display: 'block', 
                marginTop: '1.5rem', 
                width: '100%', 
                textAlign: 'center',
                fontSize: '0.9rem'
              }}
            >
              ← {t('admin.login.backToLogin')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'rgba(163, 179, 194, 0.8)', letterSpacing: '0.08em', fontWeight: 600 }}>{t('admin.login.username')}</label>
                <input 
                  type="text" 
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  required 
                  placeholder="admin"
                  style={{ 
                    padding: '0.85rem 1rem', 
                    border: '1px solid rgba(189, 149, 75, 0.3)', 
                    borderRadius: '6px', 
                    background: 'rgba(15, 24, 32, 0.6)', 
                    color: '#E0E6ED',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(189, 149, 75, 0.7)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(189, 149, 75, 0.08)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(189, 149, 75, 0.3)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'rgba(163, 179, 194, 0.8)', letterSpacing: '0.08em', fontWeight: 600 }}>{t('admin.login.password')}</label>
                <input 
                  type="password" 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  required 
                  placeholder="••••••••••••••"
                  style={{ 
                    padding: '0.85rem 1rem', 
                    border: '1px solid rgba(189, 149, 75, 0.3)', 
                    borderRadius: '6px', 
                    background: 'rgba(15, 24, 32, 0.6)', 
                    color: '#E0E6ED',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(189, 149, 75, 0.7)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(189, 149, 75, 0.08)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(189, 149, 75, 0.3)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {loginError && (
              <p style={{ color: '#FF6B6B', fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'center', background: 'rgba(255, 75, 75, 0.08)', padding: '0.6rem', borderRadius: '6px', border: '1px solid rgba(255, 75, 75, 0.15)' }}>{loginError}</p>
            )}

            <button 
              type="submit" 
              style={{ 
                width: '100%', 
                padding: '0.9rem', 
                background: 'linear-gradient(135deg, #BD954B 0%, #A57E3B 100%)',
                color: '#FFFFFF', 
                border: 'none', 
                borderRadius: '8px', 
                fontWeight: 600, 
                fontSize: '1rem', 
                letterSpacing: '0.08em',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                marginBottom: '1.5rem',
                boxShadow: '0 4px 15px rgba(189, 149, 75, 0.25)'
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(189, 149, 75, 0.35)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(189, 149, 75, 0.25)'; }}
            >
              {t('admin.login.loginBtn')}
            </button>
            
            <button 
              type="button" 
              onClick={() => setResetFlow(true)} 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'rgba(189, 149, 75, 0.7)', 
                cursor: 'pointer', 
                display: 'block', 
                width: '100%', 
                textAlign: 'center', 
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'color 0.3s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#BD954B'}
              onMouseOut={(e) => e.currentTarget.style.color = 'rgba(189, 149, 75, 0.7)'}
            >
              {t('admin.login.forgotPassword')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
