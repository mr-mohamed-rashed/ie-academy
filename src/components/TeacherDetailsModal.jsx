import React, { useState } from 'react';
import { X, Info, CreditCard, DollarSign, MessageCircle, PlayCircle } from 'lucide-react';

const TeacherDetailsModal = ({ teacher, lang, onClose }) => {
  const [showVideo, setShowVideo] = useState(false);

  if (!teacher) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 6000,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      backdropFilter: 'blur(10px)', overflowY: 'auto', padding: '4rem 1rem 2rem 1rem'
    }}>
      <div className="glass-card" style={{ maxWidth: '600px', width: '100%', padding: '2.5rem', position: 'relative', animation: 'slide-in 0.3s ease-out', margin: 'auto' }}>
        <button 
          className="config-btn" 
          onClick={onClose}
          style={{ position: 'absolute', top: '1.5rem', right: lang === 'ar' ? 'auto' : '1.5rem', left: lang === 'ar' ? '1.5rem' : 'auto', borderColor: 'var(--accent-red)', color: 'var(--accent-red)', padding: '0.35rem 0.75rem', fontSize: '0.8rem', zIndex: 10 }}
        >
          {lang === 'ar' ? 'إغلاق' : 'Close'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '80px', height: '80px' }}>
            <img 
              src={teacher.avatar} 
              alt={teacher.nameEn} 
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-primary)', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)' }}
            />
            {teacher.introVideo && (
              <div 
                onClick={() => setShowVideo(true)}
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.2s', border: '2px solid var(--accent-gold)'
                }}
                className="hover-scale"
              >
                <PlayCircle size={32} color="white" />
              </div>
            )}
          </div>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              {lang === 'ar' ? teacher.nameAr : teacher.nameEn}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
              <span>{lang === 'ar' ? teacher.subjectAr : teacher.subjectEn}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* About Section */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={18} color="var(--accent-primary)" />
              {lang === 'ar' ? 'نبذة عن المدرس' : 'About the Teacher'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '0.95rem' }}>
              {lang === 'ar' ? (teacher.aboutAr || 'لم يتم إضافة تفاصيل إضافية.') : (teacher.aboutEn || 'No additional details added yet.')}
            </p>
          </div>

          {/* Pricing & Payments */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.08)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <DollarSign size={18} color="var(--color-gold)" />
                {lang === 'ar' ? 'المبلغ المحدد' : 'Subscription Fee'}
              </h3>
              <p style={{ color: 'var(--color-gold)', fontWeight: 'bold', fontSize: '1.1rem', margin: 0 }}>
                {teacher.price || (lang === 'ar' ? 'تواصل لمعرفة السعر' : 'Contact for price')}
              </p>
            </div>

            <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.08)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={18} color="var(--accent-green)" />
                {lang === 'ar' ? 'طرق الدفع' : 'Payment Methods'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
                {teacher.paymentMethods || (lang === 'ar' ? 'غير محدد' : 'Not specified')}
              </p>
            </div>
          </div>

          {/* WhatsApp Chat Button */}
          <a 
            href={teacher.whatsapp ? `https://wa.me/${teacher.whatsapp.replace('+', '')}` : '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-primary" 
            style={{ 
              marginTop: '1rem', 
              padding: '1rem', 
              fontSize: '1.1rem', 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '0.75rem', 
              backgroundColor: '#25D366', 
              color: '#fff',
              border: 'none',
              textDecoration: 'none',
              opacity: teacher.whatsapp ? 1 : 0.6,
              pointerEvents: teacher.whatsapp ? 'auto' : 'none'
            }}
          >
            <MessageCircle size={20} />
            <span>{lang === 'ar' ? 'تواصل عبر واتساب' : 'Chat via WhatsApp'}</span>
          </a>
        </div>

      </div>

      {/* Floating Video Modal */}
      {showVideo && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 7000,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <button 
            className="config-btn" 
            onClick={() => setShowVideo(false)}
            style={{ position: 'absolute', top: '2rem', right: '2rem', borderColor: 'var(--accent-red)', color: 'var(--accent-red)', padding: '0.5rem', borderRadius: '50%', zIndex: 10 }}
          >
            <X size={24} />
          </button>
          
          <div style={{ width: '90%', maxWidth: '900px', aspectRatio: '16/9', backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
            <iframe 
              width="100%" 
              height="100%" 
              src={teacher.introVideo} 
              title="Teacher Intro" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDetailsModal;
