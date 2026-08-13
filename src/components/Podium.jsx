import React, { useState } from 'react';
import { Award, Search, Trophy } from 'lucide-react';
import { getSortedStudents } from '../mockData';
import StudentAnalyticsModal from './StudentAnalyticsModal';

const Podium = ({ students, lang, instructorId, gradeId, groupId, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentForAnalytics, setSelectedStudentForAnalytics] = useState(null);

  const sorted = getSortedStudents(students, instructorId, gradeId, groupId);
  
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
      title: "Honor & Recognition Board",
      subtitle: "Honoring our top 3 students and displaying their achievements.",
      gold: "1st Place",
      silver: "2nd Place",
      bronze: "3rd Place",
      honorRollTitle: "Honor Roll",
      honorRollSubtitle: "Rankings 4 and below",
      searchPlaceholder: "Search student...",
      noResults: "No students found",
      rank: "Rank",
      name: "Name",
      score: "GPA Score",
      emptyPodium: "Not enough students to display podium"
    },
    ar: {
      title: "لوحة الشرف والتكريم",
      subtitle: "نحتفي بالطلاب الثلاثة الأوائل ونعرض إنجازاتهم المتميزة.",
      gold: "المركز الأول",
      silver: "المركز الثاني",
      bronze: "المركز الثالث",
      honorRollTitle: "لوحة الشرف",
      honorRollSubtitle: "باقي مراتب لوحة الشرف المتميزة",
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
      </div>



      {selectedStudentForAnalytics && (
        <StudentAnalyticsModal
          student={selectedStudentForAnalytics}
          instructorId={instructorId}
          lang={lang}
          onClose={() => setSelectedStudentForAnalytics(null)}
        />
      )}
    </div>
  );
};

export default Podium;
