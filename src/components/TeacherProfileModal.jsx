import React from 'react';
import { User, BookOpen, Clock, Calendar } from 'lucide-react';

const TeacherProfileModal = ({ teacher, lang, onClose, onLoginClick }) => {
  if (!teacher) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 6000,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      backdropFilter: 'blur(10px)', overflowY: 'auto', padding: '4rem 1rem 2rem 1rem'
    }}>
      <div className="glass-card" style={{ maxWidth: '700px', width: '100%', padding: '2.5rem', position: 'relative', animation: 'slide-in 0.3s ease-out', margin: 'auto' }}>
        <button 
          className="config-btn" 
          onClick={onClose}
          style={{ position: 'absolute', top: '1.5rem', right: lang === 'ar' ? 'auto' : '1.5rem', left: lang === 'ar' ? '1.5rem' : 'auto', borderColor: 'var(--accent-red)', color: 'var(--accent-red)', padding: '0.35rem 0.75rem', fontSize: '0.8rem', zIndex: 10 }}
        >
          {lang === 'ar' ? 'إغلاق' : 'Close'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <img 
            src={teacher.avatar} 
            alt={teacher.nameEn} 
            style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-primary)', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)' }}
          />
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              {lang === 'ar' ? teacher.nameAr : teacher.nameEn}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
              <BookOpen size={16} />
              <span>{lang === 'ar' ? teacher.subjectAr : teacher.subjectEn}</span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span>{lang === 'ar' ? teacher.yearAr : teacher.yearEn}</span>
            </div>
          </div>
        </div>

        <div className="teacher-grades-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {teacher.grades && teacher.grades.length > 0 ? teacher.grades.map(grade => (
            <div key={grade.id} className="grade-section" style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
                {lang === 'ar' ? grade.nameAr : grade.nameEn}
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                {grade.groups && grade.groups.length > 0 ? grade.groups.map(group => (
                  <div key={group.id} className="group-card" style={{ backgroundColor: 'rgba(99, 102, 241, 0.08)', padding: '1rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.75rem', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                      {lang === 'ar' ? group.nameAr : group.nameEn}
                    </div>
                    {group.time && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        <Clock size={14} />
                        <span>{group.time}</span>
                      </div>
                    )}
                    <button 
                      className="btn-primary" 
                      onClick={() => onLoginClick(teacher.id, grade.id, group.id)}
                      style={{ marginTop: 'auto', padding: '0.5rem', fontSize: '0.85rem', width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      <User size={14} />
                      <span>{lang === 'ar' ? 'التسجيل في هذه المجموعة' : 'Register in this group'}</span>
                    </button>
                  </div>
                )) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {lang === 'ar' ? 'لا توجد مجموعات متاحة حالياً' : 'No groups available currently'}
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
              {lang === 'ar' ? 'لم يتم إضافة صفوف أو مجموعات بعد' : 'No grades or groups added yet'}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TeacherProfileModal;
