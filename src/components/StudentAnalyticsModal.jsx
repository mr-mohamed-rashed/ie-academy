import React from 'react';
import { X as CloseIcon, User, BarChart2, MessageCircle, AlertTriangle, Sparkles } from 'lucide-react';

const StudentAnalyticsModal = ({ student, instructorId, lang, onClose }) => {
  if (!student) return null;

  // Filter attendance and grades for the specific instructor
  const instructorAttendance = student.attendance?.filter(a => a.instructorId === instructorId) || [];
  const instructorGrades = student.grades?.filter(g => g.instructorId === instructorId) || [];

  const totalSessions = instructorAttendance.length;
  const attendedSessions = instructorAttendance.filter(a => a.status === 'present').length;
  const missedSessions = instructorAttendance.filter(a => a.status === 'absent').length;
  const attendanceRate = totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0;

  // Compute GPA for this instructor
  let totalScore = 0;
  let maxScore = 0;
  instructorGrades.forEach(g => {
    totalScore += g.score;
    maxScore += g.max;
  });
  const gpa = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  // AI Analysis Logic
  let analysisText = '';
  if (lang === 'ar') {
    if (gpa >= 90 && attendanceRate >= 90) {
      analysisText = 'أداء ممتاز وملتزم جداً بالحضور. مستواه في تصاعد مستمر.';
    } else if (gpa >= 80 && attendanceRate >= 80) {
      analysisText = 'مستوى جيد، ولكن يمكن تحسين الدرجات قليلاً. الحضور منتظم.';
    } else if (gpa < 70 || attendanceRate < 70) {
      analysisText = 'الطالب بحاجة لمتابعة مستمرة. يوجد ضعف في الحضور أو الدرجات.';
    } else {
      analysisText = 'مستوى متوسط. يجب التركيز أكثر على حل الواجبات والاختبارات.';
    }
  } else {
    if (gpa >= 90 && attendanceRate >= 90) {
      analysisText = 'Excellent performance with perfect attendance. Showing great progress.';
    } else if (gpa >= 80 && attendanceRate >= 80) {
      analysisText = 'Good performance, but scores can be improved slightly. Regular attendance.';
    } else if (gpa < 70 || attendanceRate < 70) {
      analysisText = 'Needs immediate attention. Low attendance or scores detected.';
    } else {
      analysisText = 'Average performance. Needs to focus more on assignments.';
    }
  }

  const handleParentWhatsapp = () => {
    const msg = lang === 'ar' 
      ? `مرحباً ولي أمر الطالب ${student.nameAr}، نود إعلامكم بتفاصيل أداء الطالب مؤخراً.\nنسبة الحضور: ${attendanceRate}%\nالمعدل: ${gpa}%`
      : `Hello parent of ${student.nameEn}, here is the student's recent performance.\nAttendance: ${attendanceRate}%\nGPA: ${gpa}%`;
    window.open(`https://wa.me/${student.parentPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleStudentWhatsapp = () => {
    const msg = lang === 'ar' 
      ? `مرحباً ${student.nameAr}، استمر في مجهودك بالمذاكرة!`
      : `Hello ${student.nameEn}, keep up the good work!`;
    window.open(`https://wa.me/${student.phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleAbsenceAlert = () => {
    const msg = lang === 'ar' 
      ? `تنبيه غياب: نود إعلامكم بأن الطالب ${student.nameAr} لم يحضر المحاضرة الأخيرة.`
      : `Absence Alert: Please note that ${student.nameEn} did not attend the last session.`;
    window.open(`https://wa.me/${student.parentPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
      padding: '1rem'
    }}>
      <div className="glass-card" onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto',
        position: 'relative', padding: '0', display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem', borderBottom: '1px solid var(--border-glass)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img src={student.avatar} alt="avatar" style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{lang === 'ar' ? student.nameAr : student.nameEn}</h3>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button onClick={handleStudentWhatsapp} style={{ background: 'none', border: 'none', color: '#25D366', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: 600 }}>
                  <MessageCircle size={16} />
                  {lang === 'ar' ? 'طالب' : 'Student'}
                </button>
                <button onClick={handleParentWhatsapp} style={{ background: 'none', border: 'none', color: '#25D366', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: 600 }}>
                  <MessageCircle size={16} />
                  {lang === 'ar' ? 'ولي الأمر' : 'Parent'}
                </button>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <CloseIcon size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* AI Analysis Box */}
          <div style={{
            backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid var(--accent-primary)',
            borderRadius: '12px', padding: '1.25rem', display: 'flex', gap: '1rem'
          }}>
            <div style={{ color: 'var(--accent-primary)' }}>
              <Sparkles size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>
                {lang === 'ar' ? 'تحليل الأداء الذكي' : 'AI Performance Analysis'}
              </h4>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>{analysisText}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ color: 'var(--accent-green)', marginBottom: '0.5rem' }}><User size={24} style={{ margin: '0 auto' }} /></div>
              <h5 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{lang === 'ar' ? 'نسبة الحضور' : 'Attendance Rate'}</h5>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{attendanceRate}%</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {lang === 'ar' ? `${attendedSessions} حضور / ${missedSessions} غياب` : `${attendedSessions} Present / ${missedSessions} Absent`}
              </div>
            </div>
            
            <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ color: 'var(--accent-purple)', marginBottom: '0.5rem' }}><BarChart2 size={24} style={{ margin: '0 auto' }} /></div>
              <h5 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{lang === 'ar' ? 'المعدل التراكمي' : 'GPA Score'}</h5>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{gpa}%</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {lang === 'ar' ? `${instructorGrades.length} تقييمات` : `${instructorGrades.length} Assessments`}
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>{lang === 'ar' ? 'الدرجات والتاسكات' : 'Grades & Tasks'}</h4>
            {instructorGrades.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {instructorGrades.map(grade => (
                  <div key={grade.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.75rem 1rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px'
                  }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{lang === 'ar' ? grade.titleAr : grade.titleEn}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{grade.score} / {grade.max}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                {lang === 'ar' ? 'لا يوجد درجات مسجلة' : 'No grades recorded yet'}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button onClick={handleAbsenceAlert} className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-red)', border: '1px solid var(--accent-red)' }}>
              <AlertTriangle size={16} />
              <span>{lang === 'ar' ? 'إرسال إنذار غياب للولي الأمر' : 'Send Absence Alert'}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentAnalyticsModal;
