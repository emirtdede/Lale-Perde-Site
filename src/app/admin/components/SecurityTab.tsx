import React, { useEffect, useState } from 'react';
import { useDb } from '@/context/DbContext';
import { SystemSettings } from '@/context/dbTypes';

export default function SecurityTab() {
  const { settings: dbSettings, updateSettings } = useDb();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 2FA Inline Editing States
  const [editingField, setEditingField] = useState<'email' | 'phone' | null>(null);
  const [newValueInput, setNewValueInput] = useState('');
  const [verificationFlow, setVerificationFlow] = useState(false);
  const [sentCode, setSentCode] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Initial sync with public settings (for fallback)
    if (dbSettings) {
      setSettings(prev => ({
        ...dbSettings,
        adminUsername: prev?.adminUsername || '',
        adminEmail: prev?.adminEmail || '',
        adminPhone: prev?.adminPhone || '',
        twoFactorEnabled: prev?.twoFactorEnabled || false,
        twoFactorType: prev?.twoFactorType || 'both'
      }));
    }

    // Fetch secure settings from the server
    fetch('/api/admin/verify')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setSettings(prev => {
            if (!prev) return null;
            return {
              ...prev,
              adminUsername: data.adminUsername || '',
              adminEmail: data.adminEmail || '',
              adminPhone: data.adminPhone || '',
              twoFactorEnabled: data.twoFactorEnabled || false,
              twoFactorType: data.twoFactorType || 'both'
            };
          });
        }
      })
      .catch(err => console.error('Error fetching secure settings', err));
  }, [dbSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!settings) return;
    setSettings({ ...settings, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleStartEdit = (field: 'email' | 'phone') => {
    if (!settings) return;
    setEditingField(field);
    setNewValueInput(field === 'email' ? settings.adminEmail : settings.adminPhone);
    setVerificationFlow(false);
    setVerificationError('');
    setCodeInput('');
    setIsDeleting(false);
  };

  const handleStartDelete = (field: 'email' | 'phone') => {
    if (!settings) return;
    setEditingField(field);
    setNewValueInput('');
    setVerificationFlow(false);
    setVerificationError('');
    setCodeInput('');
    setIsDeleting(true);
  };

  const triggerVerification = async () => {
    if (!settings) return;
    setVerificationError('');
    
    // Check if field is empty when editing
    if (!isDeleting && !newValueInput.trim()) {
      setVerificationError('Lütfen geçerli bir değer girin.');
      return;
    }

    const currentTarget = editingField === 'email' ? settings.adminEmail : settings.adminPhone;
    if (!currentTarget) {
      // If there was no previous value, we can save directly without verification code!
      saveNewValue();
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setSentCode(otp);

    if (editingField === 'email') {
      setSendingEmail(true);
      try {
        const response = await fetch('/api/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: settings.adminEmail, code: otp, type: 'change' })
        });
        const data = await response.json();
        if (!response.ok) {
          setVerificationError(data.error || 'Mevcut e-postaya doğrulama kodu gönderilemedi.');
          setSendingEmail(false);
          return;
        }
      } catch (err) {
        console.error(err);
        setVerificationError('E-posta servisi ile bağlantı kurulamadı.');
        setSendingEmail(false);
        return;
      }
      setSendingEmail(false);
    } else {
      // Simulated phone/SMS sending
      console.log(`[LALE PERDE GÜVENLİK] SMS Edit/Delete verification code generated (simulated): ${otp}`);
      alert(`[SMS Simülasyonu] Mevcut telefonunuza (${settings.adminPhone}) gönderilen güvenlik kodu: ${otp}`);
    }

    setVerificationFlow(true);
  };

  const saveNewValue = async () => {
    if (!settings || !editingField) return;
    
    const dbField = editingField === 'email' ? 'adminEmail' : 'adminPhone';
    const updatedSettings = { ...settings, [dbField]: newValueInput };
    
    // Auto-update 2FA selection if one of them is empty
    if (!updatedSettings.adminEmail && updatedSettings.twoFactorType === 'email') {
      updatedSettings.twoFactorType = 'phone';
    }
    if (!updatedSettings.adminPhone && updatedSettings.twoFactorType === 'phone') {
      updatedSettings.twoFactorType = 'email';
    }

    try {
      const res = await fetch('/api/admin/update-security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_profile',
          adminEmail: updatedSettings.adminEmail,
          adminPhone: updatedSettings.adminPhone,
          adminUsername: updatedSettings.adminUsername
        })
      });

      if (res.ok) {
        // Also update local 2FA state if it changed
        await fetch('/api/admin/update-security', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_2fa',
            twoFactorEnabled: updatedSettings.twoFactorEnabled,
            twoFactorType: updatedSettings.twoFactorType
          })
        });

        // Finally update global Context (so UI syncs)
        await updateSettings(updatedSettings);

        setSettings(updatedSettings);
        setEditingField(null);
        setVerificationFlow(false);
        setNewValueInput('');
        setSentCode('');
        setCodeInput('');
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setVerificationError('Bilgiler veritabanına kaydedilemedi.');
      }
    } catch (e) {
      setVerificationError('Sunucu hatası oluştu.');
    }
  };

  const handleVerifyCode = () => {
    if (codeInput === sentCode) {
      saveNewValue();
    } else {
      setVerificationError('Doğrulama kodu hatalı. Lütfen tekrar deneyin.');
    }
  };

  const handleToggleMethod = (method: 'email' | 'phone') => {
    if (!settings) return;

    const emailChecked = settings.twoFactorEnabled && (settings.twoFactorType === 'email' || settings.twoFactorType === 'both');
    const phoneChecked = settings.twoFactorEnabled && (settings.twoFactorType === 'phone' || settings.twoFactorType === 'both');

    let newEmailChecked = emailChecked;
    let newPhoneChecked = phoneChecked;

    if (method === 'email') {
      newEmailChecked = !emailChecked;
    } else {
      newPhoneChecked = !phoneChecked;
    }

    let newEnabled = false;
    let newType: 'email' | 'phone' | 'both' = 'both';

    if (newEmailChecked && newPhoneChecked) {
      newEnabled = true;
      newType = 'both';
    } else if (newEmailChecked) {
      newEnabled = true;
      newType = 'email';
    } else if (newPhoneChecked) {
      newEnabled = true;
      newType = 'phone';
    } else {
      newEnabled = false;
      newType = 'both';
    }

    setSettings({
      ...settings,
      twoFactorEnabled: newEnabled,
      twoFactorType: newType
    });
    setSaved(false);
  };

  const handleProfileSave = async () => {
    if (settings) {
      try {
        const res = await fetch('/api/admin/update-security', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_profile',
            adminUsername: settings.adminUsername,
            adminEmail: settings.adminEmail,
            adminPhone: settings.adminPhone
          })
        });

        if (res.ok) {
          // Also save 2fa to be safe
          await fetch('/api/admin/update-security', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'update_2fa',
              twoFactorEnabled: settings.twoFactorEnabled,
              twoFactorType: settings.twoFactorType
            })
          });

          await updateSettings(settings); // Sync Context
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        }
      } catch (e) {
        console.error('Profile update failed', e);
      }
    }
  };

  const handlePasswordChange = async () => {
    if (!settings) return;
    setPasswordError('');
    
    if (!currentPassword) {
      setPasswordError('Lütfen mevcut şifrenizi girin.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Yeni şifre en az 6 karakter olmalıdır.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Yeni şifre ve onayı eşleşmiyor.');
      return;
    }

    try {
      const res = await fetch('/api/admin/update-security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_password',
          currentPassword,
          newPassword
        })
      });
      const data = await res.json();

      if (res.ok) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setPasswordError(data.error || 'Şifre güncellenemedi.');
      }
    } catch (e) {
      setPasswordError('Bağlantı hatası.');
    }
  };

  if (!settings) return <div style={{ color: '#E0E6ED' }}>Yükleniyor...</div>;

  return (
    <div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Profile Info */}
        <div style={{ backgroundColor: '#0F1820', padding: '2rem', borderRadius: '8px', border: '1px solid rgba(189, 149, 75, 0.15)' }}>
          <h3 style={{ color: '#E0E6ED', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>Yönetici Profili</h3>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#A3B3C2', marginBottom: '0.5rem' }}>Kullanıcı Adı</label>
            <input
              type="text"
              name="adminUsername"
              value={settings.adminUsername}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.8rem', background: 'rgba(15,24,32,0.8)', border: '1px solid rgba(189,149,75,0.3)', borderRadius: '4px', color: '#FFF', outline: 'none' }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#A3B3C2', marginBottom: '0.5rem' }}>Yönetici E-Posta</label>
            <input
              type="email"
              name="adminEmail"
              value={settings.adminEmail}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.8rem', background: 'rgba(15,24,32,0.8)', border: '1px solid rgba(189,149,75,0.3)', borderRadius: '4px', color: '#FFF', outline: 'none' }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#A3B3C2', marginBottom: '0.5rem' }}>Yönetici Telefon (Şifre Sıfırlama için)</label>
            <input
              type="text"
              name="adminPhone"
              value={settings.adminPhone}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.8rem', background: 'rgba(15,24,32,0.8)', border: '1px solid rgba(189,149,75,0.3)', borderRadius: '4px', color: '#FFF', outline: 'none' }}
            />
          </div>

          <button 
            onClick={handleProfileSave}
            style={{ 
              background: 'linear-gradient(135deg, #BD954B, #A57E3B)', 
              color: '#FFF', 
              border: 'none', 
              padding: '0.8rem 1.5rem', 
              borderRadius: '6px', 
              fontWeight: 600, 
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Profili Kaydet
          </button>
        </div>

        {/* Password Change */}
        <div style={{ backgroundColor: '#0F1820', padding: '2rem', borderRadius: '8px', border: '1px solid rgba(189, 149, 75, 0.15)' }}>
          <h3 style={{ color: '#E0E6ED', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>Şifre Değiştir</h3>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#A3B3C2', marginBottom: '0.5rem' }}>Mevcut Şifre</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={{ width: '100%', padding: '0.8rem', background: 'rgba(15,24,32,0.8)', border: '1px solid rgba(189,149,75,0.3)', borderRadius: '4px', color: '#FFF', outline: 'none' }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#A3B3C2', marginBottom: '0.5rem' }}>Yeni Şifre</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: '100%', padding: '0.8rem', background: 'rgba(15,24,32,0.8)', border: '1px solid rgba(189,149,75,0.3)', borderRadius: '4px', color: '#FFF', outline: 'none' }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#A3B3C2', marginBottom: '0.5rem' }}>Yeni Şifre (Tekrar)</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: '100%', padding: '0.8rem', background: 'rgba(15,24,32,0.8)', border: '1px solid rgba(189,149,75,0.3)', borderRadius: '4px', color: '#FFF', outline: 'none' }}
            />
          </div>

          {passwordError && (
            <p style={{ color: '#FF6B6B', fontSize: '0.85rem', marginBottom: '1rem', background: 'rgba(255, 75, 75, 0.08)', padding: '0.6rem', borderRadius: '4px' }}>
              {passwordError}
            </p>
          )}

          <button 
            onClick={handlePasswordChange}
            style={{ 
              background: 'transparent', 
              color: 'var(--color-accent)', 
              border: '1px solid var(--color-accent)', 
              padding: '0.8rem 1.5rem', 
              borderRadius: '6px', 
              fontWeight: 600, 
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(189, 149, 75, 0.1)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            Şifreyi Güncelle
          </button>
        </div>
      </div>

      {/* 2FA Settings Card */}
      <div style={{ backgroundColor: '#0F1820', padding: '2rem', borderRadius: '8px', border: '1px solid rgba(189, 149, 75, 0.15)', marginTop: '2rem' }}>
        <h3 style={{ color: '#E0E6ED', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>İki Adımlı Doğrulama (2FA)</h3>
        <p style={{ color: '#A3B3C2', fontSize: '0.85rem', marginBottom: '2rem', lineHeight: '1.4' }}>
          Giriş güvenliği için kullanmak istediğiniz doğrulama yöntemlerini seçin. Birden fazla seçim yapılması durumunda giriş esnasında her iki kanaldan da doğrulama yapılabilecektir.
        </p>

        {/* E-Posta Method Row */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '1.2rem 1.5rem', 
          background: 'rgba(255,255,255,0.01)', 
          borderRadius: '6px', 
          border: '1px solid rgba(189, 149, 75, 0.08)',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input
              type="checkbox"
              id="twoFactorEmailCheck"
              disabled={!settings.adminEmail}
              checked={!!settings.adminEmail && (settings.twoFactorEnabled && (settings.twoFactorType === 'email' || settings.twoFactorType === 'both'))}
              onChange={() => handleToggleMethod('email')}
              style={{ width: '20px', height: '20px', cursor: settings.adminEmail ? 'pointer' : 'not-allowed', accentColor: 'var(--color-accent)' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ color: settings.adminEmail ? 'var(--color-accent)' : '#A3B3C2' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </span>
              <div>
                <label htmlFor="twoFactorEmailCheck" style={{ display: 'block', color: '#E0E6ED', fontSize: '0.95rem', fontWeight: 500, cursor: settings.adminEmail ? 'pointer' : 'default' }}>
                  E-Posta Doğrulaması
                </label>
                <span style={{ color: settings.adminEmail ? '#A3B3C2' : 'rgba(163, 179, 194, 0.4)', fontSize: '0.85rem' }}>
                  {settings.adminEmail ? settings.adminEmail : 'E-Posta adresi tanımlanmamış. Aktif etmek için önce e-posta ekleyin.'}
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => handleStartEdit('email')}
              style={{
                background: 'rgba(189, 149, 75, 0.1)',
                color: 'var(--color-accent)',
                border: '1px solid rgba(189, 149, 75, 0.3)',
                padding: '0.4rem 0.8rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"></path></svg>
              {settings.adminEmail ? 'Düzenle' : 'Ekle'}
            </button>
            {settings.adminEmail && (
              <button
                onClick={() => handleStartDelete('email')}
                style={{
                  background: 'rgba(255, 75, 75, 0.08)',
                  color: '#FF6B6B',
                  border: '1px solid rgba(255, 75, 75, 0.2)',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                Sil
              </button>
            )}
          </div>
        </div>

        {/* E-Posta Edit/Verification Box */}
        <div style={{
          maxHeight: editingField === 'email' ? '500px' : '0',
          opacity: editingField === 'email' ? 1 : 0,
          overflow: 'hidden',
          transition: 'all 0.3s ease-in-out',
          marginBottom: editingField === 'email' ? '1.5rem' : '0'
        }}>
          {editingField === 'email' && (
            <div style={{
              background: 'rgba(15, 24, 32, 0.95)',
              border: '1px solid var(--color-accent)',
              borderRadius: '6px',
              padding: '1.5rem',
              marginTop: '0.5rem'
            }}>
              <h4 style={{ color: '#E0E6ED', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', fontSize: '0.95rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                {isDeleting ? 'E-Posta Bilgisini Sil' : 'E-Posta Bilgisini Güncelle'}
              </h4>

              {verificationFlow ? (
                <div>
                  <p style={{ color: '#A3B3C2', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: '1.4' }}>
                    Güvenliğiniz için mevcut e-posta adresinize 6 haneli bir doğrulama kodu gönderilmiştir. Lütfen gelen kodu girin.
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="------"
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value)}
                      style={{
                        width: '120px',
                        padding: '0.6rem',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(189,149,75,0.5)',
                        borderRadius: '4px',
                        color: '#FFF',
                        fontSize: '1.1rem',
                        letterSpacing: '4px',
                        textAlign: 'center',
                        outline: 'none'
                      }}
                    />
                    <button
                      onClick={handleVerifyCode}
                      style={{
                        background: 'linear-gradient(135deg, #BD954B, #A57E3B)',
                        color: '#FFF',
                        border: 'none',
                        padding: '0.6rem 1.2rem',
                        borderRadius: '4px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Onayla ve {isDeleting ? 'Sil' : 'Kaydet'}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {!isDeleting && (
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#A3B3C2', marginBottom: '0.5rem' }}>
                        Yeni E-Posta Adresi
                      </label>
                      <input
                        type="text"
                        value={newValueInput}
                        onChange={(e) => setNewValueInput(e.target.value)}
                        placeholder="emirdede@example.com"
                        style={{
                          width: '100%',
                          padding: '0.7rem 0.8rem',
                          background: 'rgba(0,0,0,0.2)',
                          border: '1px solid rgba(189,149,75,0.3)',
                          borderRadius: '4px',
                          color: '#FFF',
                          outline: 'none'
                        }}
                      />
                    </div>
                  )}
                  {isDeleting && (
                    <p style={{ color: '#FF6B6B', fontSize: '0.85rem', marginBottom: '1rem' }}>
                      Bu işlemi gerçekleştirmek için doğrulama yapılması zorunludur. Mevcut adrese bir doğrulama kodu gönderilecektir.
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={triggerVerification}
                      disabled={sendingEmail}
                      style={{
                        background: 'linear-gradient(135deg, #BD954B, #A57E3B)',
                        color: '#FFF',
                        border: 'none',
                        padding: '0.6rem 1.2rem',
                        borderRadius: '4px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        opacity: sendingEmail ? 0.7 : 1
                      }}
                    >
                      {sendingEmail ? 'Kod Gönderiliyor...' : 'Doğrulama Kodu Gönder'}
                    </button>
                    <button
                      onClick={() => { setEditingField(null); setVerificationFlow(false); }}
                      style={{
                        background: 'transparent',
                        color: '#A3B3C2',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '0.6rem 1.2rem',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Vazgeç
                    </button>
                  </div>
                </div>
              )}

              {verificationError && (
                <p style={{ color: '#FF6B6B', fontSize: '0.85rem', marginTop: '1rem', background: 'rgba(255, 75, 75, 0.08)', padding: '0.6rem', borderRadius: '4px' }}>
                  {verificationError}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Telefon / SMS Method Row */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '1.2rem 1.5rem', 
          background: 'rgba(255,255,255,0.01)', 
          borderRadius: '6px', 
          border: '1px solid rgba(189, 149, 75, 0.08)',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input
              type="checkbox"
              id="twoFactorPhoneCheck"
              disabled={!settings.adminPhone}
              checked={!!settings.adminPhone && (settings.twoFactorEnabled && (settings.twoFactorType === 'phone' || settings.twoFactorType === 'both'))}
              onChange={() => handleToggleMethod('phone')}
              style={{ width: '20px', height: '20px', cursor: settings.adminPhone ? 'pointer' : 'not-allowed', accentColor: 'var(--color-accent)' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ color: settings.adminPhone ? 'var(--color-accent)' : '#A3B3C2' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
              </span>
              <div>
                <label htmlFor="twoFactorPhoneCheck" style={{ display: 'block', color: '#E0E6ED', fontSize: '0.95rem', fontWeight: 500, cursor: settings.adminPhone ? 'pointer' : 'default' }}>
                  SMS / Telefon Doğrulaması
                </label>
                <span style={{ color: settings.adminPhone ? '#A3B3C2' : 'rgba(163, 179, 194, 0.4)', fontSize: '0.85rem' }}>
                  {settings.adminPhone ? settings.adminPhone : 'Telefon numarası tanımlanmamış. Aktif etmek için önce telefon ekleyin.'}
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => handleStartEdit('phone')}
              style={{
                background: 'rgba(189, 149, 75, 0.1)',
                color: 'var(--color-accent)',
                border: '1px solid rgba(189, 149, 75, 0.3)',
                padding: '0.4rem 0.8rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"></path></svg>
              {settings.adminPhone ? 'Düzenle' : 'Ekle'}
            </button>
            {settings.adminPhone && (
              <button
                onClick={() => handleStartDelete('phone')}
                style={{
                  background: 'rgba(255, 75, 75, 0.08)',
                  color: '#FF6B6B',
                  border: '1px solid rgba(255, 75, 75, 0.2)',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                Sil
              </button>
            )}
          </div>
        </div>

        {/* Telefon / SMS Edit/Verification Box */}
        <div style={{
          maxHeight: editingField === 'phone' ? '500px' : '0',
          opacity: editingField === 'phone' ? 1 : 0,
          overflow: 'hidden',
          transition: 'all 0.3s ease-in-out',
          marginBottom: editingField === 'phone' ? '1.5rem' : '0'
        }}>
          {editingField === 'phone' && (
            <div style={{
              background: 'rgba(15, 24, 32, 0.95)',
              border: '1px solid var(--color-accent)',
              borderRadius: '6px',
              padding: '1.5rem',
              marginTop: '0.5rem'
            }}>
              <h4 style={{ color: '#E0E6ED', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', fontSize: '0.95rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                {isDeleting ? 'Telefon Bilgisini Sil' : 'Telefon Bilgisini Güncelle'}
              </h4>

              {verificationFlow ? (
                <div>
                  <p style={{ color: '#A3B3C2', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: '1.4' }}>
                    Güvenliğiniz için mevcut telefon adresinize 6 haneli bir doğrulama kodu gönderilmiştir. Lütfen gelen kodu girin.
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="------"
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value)}
                      style={{
                        width: '120px',
                        padding: '0.6rem',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(189,149,75,0.5)',
                        borderRadius: '4px',
                        color: '#FFF',
                        fontSize: '1.1rem',
                        letterSpacing: '4px',
                        textAlign: 'center',
                        outline: 'none'
                      }}
                    />
                    <button
                      onClick={handleVerifyCode}
                      style={{
                        background: 'linear-gradient(135deg, #BD954B, #A57E3B)',
                        color: '#FFF',
                        border: 'none',
                        padding: '0.6rem 1.2rem',
                        borderRadius: '4px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Onayla ve {isDeleting ? 'Sil' : 'Kaydet'}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {!isDeleting && (
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#A3B3C2', marginBottom: '0.5rem' }}>
                        Yeni Telefon Numarası
                      </label>
                      <input
                        type="text"
                        value={newValueInput}
                        onChange={(e) => setNewValueInput(e.target.value)}
                        placeholder="+90 555 555 55 55"
                        style={{
                          width: '100%',
                          padding: '0.7rem 0.8rem',
                          background: 'rgba(0,0,0,0.2)',
                          border: '1px solid rgba(189,149,75,0.3)',
                          borderRadius: '4px',
                          color: '#FFF',
                          outline: 'none'
                        }}
                      />
                    </div>
                  )}
                  {isDeleting && (
                    <p style={{ color: '#FF6B6B', fontSize: '0.85rem', marginBottom: '1rem' }}>
                      Bu işlemi gerçekleştirmek için doğrulama yapılması zorunludur. Mevcut adrese bir doğrulama kodu gönderilecektir.
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={triggerVerification}
                      disabled={sendingEmail}
                      style={{
                        background: 'linear-gradient(135deg, #BD954B, #A57E3B)',
                        color: '#FFF',
                        border: 'none',
                        padding: '0.6rem 1.2rem',
                        borderRadius: '4px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        opacity: sendingEmail ? 0.7 : 1
                      }}
                    >
                      {sendingEmail ? 'Kod Gönderiliyor...' : 'Doğrulama Kodu Gönder'}
                    </button>
                    <button
                      onClick={() => { setEditingField(null); setVerificationFlow(false); }}
                      style={{
                        background: 'transparent',
                        color: '#A3B3C2',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '0.6rem 1.2rem',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Vazgeç
                    </button>
                  </div>
                </div>
              )}

              {verificationError && (
                <p style={{ color: '#FF6B6B', fontSize: '0.85rem', marginTop: '1rem', background: 'rgba(255, 75, 75, 0.08)', padding: '0.6rem', borderRadius: '4px' }}>
                  {verificationError}
                </p>
              )}
            </div>
          )}
        </div>

        <button 
          onClick={handleProfileSave}
          style={{ 
            background: 'linear-gradient(135deg, #BD954B, #A57E3B)', 
            color: '#FFF', 
            border: 'none', 
            padding: '0.8rem 1.5rem', 
            borderRadius: '6px', 
            fontWeight: 600, 
            cursor: 'pointer',
            width: '100%'
          }}
        >
          2FA Ayarlarını Kaydet
        </button>
      </div>


      {saved && (
        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50', border: '1px solid rgba(76, 175, 80, 0.3)', borderRadius: '6px', textAlign: 'center' }}>
          Değişiklikler başarıyla kaydedildi.
        </div>
      )}
    </div>
  );
}
