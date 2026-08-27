import React, { useState } from 'react';
import { Award, Search, Trophy } from 'lucide-react';
import { getSortedStudents } from '../mockData';
const StudentAnalyticsModal = React.lazy(() => import('./StudentAnalyticsModal'));

const Podium = ({ students, lang, instructorId, gradeId, groupId, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentForAnalytics, setSelectedStudentForAnalytics] = useState(null);

  // Honors board ranks all students in the same grade (omitting groupId)
  const sorted = getSortedStudents(students, instructorId, gradeId);
  
  // Extract top 3 for podium
  const first = sorted[0];
  const second = sorted[1];
  const third = sorted[2];
  
  // Ranks 4 and beyond for the honor roll
  const honorRoll = sorted.slice(3);

  // Filter honor roll based on search
  const filteredHonorRoll = honorRoll.filter(s => {
    const name = lang === 'ar' ? s.nameAr : s.nameEn;
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const t = {
    en: {
      title: "Grade Honors & Recognition Board",
      subtitle: "Honoring our top 3 students across all classrooms and displaying their achievements.",
      gold: "1st Place",
      silver: "2nd Place",
      bronze: "3rd Place",
      honorRollTitle: "Honor Roll List",
      honorRollSubtitle: "Rankings 4 and below (All Groups)",
      searchPlaceholder: "Search student...",
      noResults: "No students found",
      rank: "Rank",
      name: "Name",
      score: "GPA Score",
      emptyPodium: "Not enough students to display podium"
    },
    ar: {
      title: "لوحة الشرف والتكريم للمرحلة",
      subtitle: "نحتفي بالطلاب الثلاثة الأوائل على مستوى جميع المجموعات ونعرض إنجازاتهم المتميزة.",
      gold: "المركز الأول",
      silver: "المركز الثاني",
      bronze: "المركز الثالث",
      honorRollTitle: "لوحة الشرف",
      honorRollSubtitle: "باقي مراتب لوحة الشرف المتميزة (جميع المجموعات)",
      searchPlaceholder: "ابحث عن طالب...",
      noResults: "لم يتم العثور على طلاب",
      rank: "الترتيب",
      name: "الاسم",
      score: "المعدل الدراسي",
      emptyPodium: "لا يوجد عدد كافٍ من الطلاب لعرض مدرج التكريم"
    }
  }[lang];

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {/* 3D-like Podium */}
      <div className="glass-card podium-card" style={{ position: 'relative', width: '100%', height: '100%' }}>
        {onClose && (
          <button 
            className="config-btn" 
            onClick={onClose}
            style={{ position: 'absolute', top: '1.5rem', right: lang === 'ar' ? 'auto' : '1.5rem', left: lang === 'ar' ? '1.5rem' : 'auto', borderColor: 'var(--accent-red)', color: 'var(--accent-red)', padding: '0.35rem 0.75rem', fontSize: '0.8rem', zIndex: 10 }}
          >
            {lang === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        )}
        <div className="card-title-group" style={{ textAlign: 'center', width: '100%' }}>
          <Trophy size={32} color="var(--color-gold)" style={{ margin: '0 auto 0.5rem auto' }} />
          <h3>{t.title}</h3>
          <p>{t.subtitle}</p>
        </div>

        {sorted.length >= 3 ? (
          <div className="podium-container">
            {/* 2nd Place: Silver */}
            {second && (
              <div className="podium-column silver">
                <div className="podium-student" onClick={() => setSelectedStudentForAnalytics(second)} style={{ cursor: 'pointer' }}>
                  <div className="podium-avatar-wrapper">
                    <img src={second.avatar} alt={second.nameEn} className="podium-avatar" />
                    <span className="medal-badge">2</span>
                  </div>
                  <div className="podium-student-name">
                    {lang === 'ar' ? second.nameAr : second.nameEn}
                  </div>
                  <div className="podium-student-score">{second.gpa}%</div>
                </div>
                <div className="podium-pedestal">
                  <Trophy size={18} color="var(--color-silver)" />
                  <span>2</span>
                </div>
              </div>
            )}

            {/* 1st Place: Gold */}
            {first && (
              <div className="podium-column gold">
                <div className="podium-student" onClick={() => setSelectedStudentForAnalytics(first)} style={{ cursor: 'pointer' }}>
                  <div className="podium-avatar-wrapper">
                    <img src={first.avatar} alt={first.nameEn} className="podium-avatar" />
                    <span className="medal-badge">1</span>
                  </div>
                  <div className="podium-student-name" style={{ fontWeight: 800 }}>
                    {lang === 'ar' ? first.nameAr : first.nameEn}
                  </div>
                  <div className="podium-student-score" style={{ fontWeight: 700, color: 'var(--color-gold)' }}>
                    {first.gpa}%
                  </div>
                </div>
                <div className="podium-pedestal">
                  <Trophy size={22} color="var(--color-gold)" style={{ filter: 'drop-shadow(0 0 4px rgba(251,191,36,0.5))' }} />
                  <span>1</span>
                </div>
              </div>
            )}

            {/* 3rd Place: Bronze */}
            {third && (
              <div className="podium-column bronze">
                <div className="podium-student" onClick={() => setSelectedStudentForAnalytics(third)} style={{ cursor: 'pointer' }}>
                  <div className="podium-avatar-wrapper">
                    <img src={third.avatar} alt={third.nameEn} className="podium-avatar" />
                    <span className="medal-badge">3</span>
                  </div>
                  <div className="podium-student-name">
                    {lang === 'ar' ? third.nameAr : third.nameEn}
                  </div>
                  <div className="podium-student-score">{third.gpa}%</div>
                </div>
                <div className="podium-pedestal">
                  <Trophy size={16} color="var(--color-bronze)" />
                  <span>3</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: '3rem', color: 'var(--text-muted)' }}>{t.emptyPodium}</div>
        )}

        {/* Honor Roll Table (Ranks 4+) */}
        {sorted.length > 3 && (
          <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border-glass)', paddingTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ textAlign: 'start' }}>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>{t.honorRollTitle}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>{t.honorRollSubtitle}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 1rem', borderRadius: '50px', border: '1px solid var(--border-glass)' }}>
                <Search size={16} color="var(--text-secondary)" />
                <input 
                  type="text" 
                  placeholder={t.searchPlaceholder} 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'start' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-glass)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{t.rank}</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{t.name}</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{t.score}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHonorRoll.map((student, idx) => {
                    const actualRank = idx + 4;
                    return (
                      <tr 
                        key={student.id} 
                        onClick={() => setSelectedStudentForAnalytics(student)}
                        style={{ borderBottom: '1px solid var(--border-glass)', cursor: 'pointer', transition: 'background 0.2s' }}
                        className="hover-bg"
                      >
                        <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: 700 }}>
                          <span style={{ display: 'inline-flex', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                            {actualRank}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img src={student.avatar} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                          <span style={{ fontWeight: 600 }}>{lang === 'ar' ? student.nameAr : student.nameEn}</span>
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                          {student.gpa}%
                        </td>
                      </tr>
                    );
                  })}
                  {filteredHonorRoll.length === 0 && (
                    <tr>
                      <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        {t.noResults}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {selectedStudentForAnalytics && (
        <React.Suspense fallback={
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <span className="loader" style={{ width: '28px', height: '28px', borderTopColor: 'var(--accent-primary)' }}></span>
          </div>
        }>
          <StudentAnalyticsModal
            student={selectedStudentForAnalytics}
            instructorId={instructorId}
            lang={lang}
            onClose={() => setSelectedStudentForAnalytics(null)}
          />
        </React.Suspense>
      )}
    </div>
  );
};

export default Podium;
