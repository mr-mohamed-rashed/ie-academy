import React, { useState } from 'react';
import { Calendar, PlayCircle, CheckCircle, XCircle, Award, Video, ArrowLeft, BookOpen, QrCode, ShieldAlert } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from 'chart.js';
import { calculateGPA, calculateAttendanceRate } from '../mockData';
import Podium from './Podium';
import InteractiveVideoPlayer from './InteractiveVideoPlayer';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend
);

const StudentDashboard = ({ 
  student, 
  instructors, 
  sessions, 
  students, // All students, for podium rendering inside teacher page
  activeTeacherId, // Selected teacher profile view, null if showing teachers list
  onSelectTeacher,
  onScanQR,
  lang,
  triggerToast
}) => {
  const [activeSession, setActiveSession] = useState(null);
  
  // State for simulated QR Code Scanning modal
  const [showScanner, setShowScanner] = useState(false);
  const [qrInputCode, setQrInputCode] = useState('');

  const t = {
    en: {
      gpaBadge: "Current GPA",
      attendanceTitle: "Attendance tracker",
      attendText: "Attended",
      absentText: "Absent",
      attendanceLogs: "Attendance History Logs",
      chartTitle: "Academic Performance Graph",
      sessionListTitle: "Course Syllabus & Lecture Videos",
      watchBtn: "Watch Lecture Video",
      closeVideo: "Close Video Player",
      quizName: "Task Name",
      grade: "Grade",
      status: "Result",
      date: "Published Date",
      present: "Present",
      absent: "Absent",
      myTeachers: "My Enrolled Courses & Instructors",
      myTeachersSub: "Select a teacher's course space to view curriculum, honors podium, and scan attendance QR.",
      enterCourse: "Go to Course Portal",
      backToTeachers: "Back to Instructors",
      academicYear: "Academic Year",
      classroomGroup: "Classroom Group",
      noTeachers: "You are not enrolled in any courses yet.",
      qrScannerTitle: "Scan Center Attendance QR",
      qrScannerDesc: "Simulate scanning the QR code displayed on the center screen by entering the Session ID below.",
      qrInputLabel: "Enter Session ID from Teacher's screen",
      qrSubmit: "Verify & Record Attendance",
      qrOpenBtn: "Scan Attendance QR Code",
      qrSuccessToast: "Attendance recorded successfully for session #",
      qrErrorToast: "Invalid Session ID or already recorded present!",
      gradesSummaryTitle: "Class Assignments & Quizzes"
    },
    ar: {
      gpaBadge: "معدلك التراكمي في المادة",
      attendanceTitle: "سجل حضور المحاضرات",
      attendText: "أيام الحضور",
      absentText: "أيام الغياب",
      attendanceLogs: "تفاصيل الحضور والغياب للمحاضرات",
      chartTitle: "منحنى تقدم المستوى الدراسي",
      sessionListTitle: "منهج الكورس ومحاضرات الفيديو",
      watchBtn: "مشاهدة فيديو الشرح",
      closeVideo: "إغلاق مشغل الفيديو",
      quizName: "اسم التقييم/الاختبار",
      grade: "الدرجة المستلمة",
      status: "الحالة",
      date: "تاريخ النشر",
      present: "حاضر",
      absent: "غائب",
      myTeachers: "المواد والمدرسين المشترك لديهم",
      myTeachersSub: "اختر بوابة المادة للدخول ومتابعة الشروحات، ومدرج الشرف المتفوقين، وتسجيل حضورك بالـ QR.",
      enterCourse: "دخول بوابة المادة",
      backToTeachers: "العودة للمدرسين والمواد",
      academicYear: "الفصل الدراسي",
      classroomGroup: "المجموعة المسجل فيها",
      noTeachers: "أنت غير مسجل في أي كورس حالياً.",
      qrScannerTitle: "تسجيل الحضور بالـ QR في السنتر",
      qrScannerDesc: "قم بمحاكاة مسح رمز الـ QR المعروض على شاشة المدرس بالسنتر عبر كتابة معرف الحصة (Session ID) أدناه.",
      qrInputLabel: "أدخل معرف الحصة (رقم الحصة) الظاهر لدى المعلم",
      qrSubmit: "تأكيد وتسجيل الحضور فوراً",
      qrOpenBtn: "تسجيل حضور الحصة بالـ QR",
      qrSuccessToast: "تم تسجيل حضورك بنجاح في الحصة رقم #",
      qrErrorToast: "معرف الحصة غير صحيح أو تم تسجيل حضورك مسبقاً!",
      gradesSummaryTitle: "قائمة درجات الاختبارات والواجبات"
    }
  }[lang];

  const getEnrollment = (teacherId) => {
    return student.enrollments.find(e => e.instructorId === teacherId);
  };


  // --- TEACHER COURSE PAGE VIEW ---
  const currentTeacher = instructors.find(i => i.id === activeTeacherId);
  const enrollment = getEnrollment(activeTeacherId);
  const activeGroupId = enrollment?.groupId;

  if (!currentTeacher || !enrollment) {
    return (
      <div className="dashboard-container" style={{ padding: '2rem' }}>
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          {lang === 'ar' ? 'لم يتم العثور على مقررات مسجلة.' : 'No enrolled courses found.'}
        </div>
      </div>
    );
  }

  // Filter sessions ONLY corresponding to student's group
  const groupSessions = sessions.filter(session => 
    session.instructorId === activeTeacherId && session.groupId === activeGroupId
  );

  // Filter student grades and attendance specific to this teacher
  const studentGrades = student.grades.filter(g => g.instructorId === activeTeacherId);
  const studentAttendance = student.attendance.filter(a => a.instructorId === activeTeacherId);

  const attendanceRate = calculateAttendanceRate(student.attendance, activeTeacherId);
  const totalLogs = studentAttendance.length;
  const attendedCount = studentAttendance.filter(a => a.status === 'present').length;
  const absentCount = totalLogs - attendedCount;

  // Chart data setup for this subject
  const chartLabels = studentGrades.map(g => lang === 'ar' ? g.titleAr : g.titleEn);
  const chartScores = studentGrades.map(g => g.score);

  const chartData = {
    labels: chartLabels.length > 0 ? chartLabels : ['Quiz 1'],
    datasets: [
      {
        label: lang === 'ar' ? 'الدرجة المستلمة (%)' : 'Score (%)',
        data: chartScores.length > 0 ? chartScores : [0],
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#fff',
        pointHoverRadius: 7,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.parsed.y}%`
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: 'var(--text-secondary)' }
      },
      x: {
        grid: { display: false },
        ticks: { color: 'var(--text-secondary)' }
      }
    }
  };

  // QR Attendance scan handler
  const handleQrScanSubmit = (e) => {
    e.preventDefault();
    const sessionId = Number(qrInputCode);

    // Verify session belongs to this teacher & group
    const sessionMatch = groupSessions.find(s => s.id === sessionId);

    if (sessionMatch) {
      const success = onScanQR(student.id, activeTeacherId, sessionId);
      if (success) {
        triggerToast(t.qrSuccessToast + sessionId, 'success');
        setShowScanner(false);
        setQrInputCode('');
      } else {
        triggerToast(t.qrErrorToast, 'error');
      }
    } else {
      triggerToast(t.qrErrorToast, 'error');
    }
  };

  return (
    <div className="dashboard-grid" style={{ animation: 'slide-in 0.3s ease-out' }}>
      
      {/* Return button and active course banner */}
      <div className="glass-card" style={{ gridColumn: 'span 12', display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <button 
          onClick={() => {
            onSelectTeacher(null);
            setActiveSession(null);
          }}
          className="config-btn"
          style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <ArrowLeft size={16} />
          <span>{t.backToTeachers}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src={currentTeacher.avatar} alt={currentTeacher.nameEn} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>{lang === 'ar' ? currentTeacher.nameAr : currentTeacher.nameEn}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {lang === 'ar' ? currentTeacher.subjectAr : currentTeacher.subjectEn} ({lang === 'ar' ? currentTeacher.yearAr : currentTeacher.yearEn})
            </p>
          </div>
        </div>

        {/* QR Code Scan Trigger Button */}
        <button 
          className="btn-primary" 
          onClick={() => setShowScanner(true)}
          style={{ width: 'auto', backgroundColor: 'var(--accent-green)', padding: '0.6rem 1.2rem' }}
        >
          <QrCode size={18} />
          <span>{t.qrOpenBtn}</span>
        </button>
      </div>

      {/* Simulated Camera Scanner Modal overlay */}
      {showScanner && (
        <div style={{ 
          position: 'fixed', 
          top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.85)', 
          zIndex: 2000, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '450px', padding: '2rem', animation: 'slide-in 0.3s ease-out' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '70px', height: '70px', borderRadius: '50%', 
                backgroundColor: 'rgba(16,185,129,0.15)', 
                color: 'var(--accent-green)',
                display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <QrCode size={36} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{t.qrScannerTitle}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.qrScannerDesc}</p>
              
              <form onSubmit={handleQrScanSubmit} style={{ width: '100%', marginTop: '1rem' }}>
                <div className="form-group" style={{ textAlign: 'start' }}>
                  <label>{t.qrInputLabel}</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="e.g., 1011"
                    value={qrInputCode}
                    onChange={(e) => setQrInputCode(e.target.value)}
                    required 
                    style={{ textAlign: 'center', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.1em' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowScanner(false);
                      setQrInputCode('');
                    }}
                    className="config-btn" 
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{ flex: 1, backgroundColor: 'var(--accent-green)' }}
                  >
                    {t.qrSubmit}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* GPA Banner Card */}
      <div className="glass-card hero-card student-welcome" style={{ gridColumn: 'span 12', padding: '1.5rem 2rem' }}>
        <div className="hero-text">
          <span className="hero-badge">{t.gpaBadge}</span>
          <h2>{lang === 'ar' ? student.nameAr : student.nameEn}</h2>
          <p style={{ color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: 700 }}>
            {lang === 'ar' ? 'المعدل: ' : 'Average: '}
            <span style={{ color: 'var(--color-gold)', fontSize: '1.7rem' }}>
              {calculateGPA(student.grades, activeTeacherId)}%
            </span>
          </p>
        </div>
        <div>
          <img src={student.avatar} alt={student.nameEn} style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid var(--accent-purple)', objectFit: 'cover' }} />
        </div>
      </div>

      {/* Honors Podium & List specifically for THIS subject */}
      <div style={{ gridColumn: 'span 12' }}>
        <Podium students={students} lang={lang} instructorId={activeTeacherId} />
      </div>

      {/* Attendance Circular Card */}
      <div className="glass-card attendance-card" style={{ gridColumn: 'span 4' }}>
        <div className="card-title-group" style={{ textAlign: 'center' }}>
          <h3>{t.attendanceTitle}</h3>
        </div>
        <div className="attendance-circle">
          <span className="attendance-percent" style={{ color: 'var(--accent-purple)' }}>{attendanceRate}%</span>
          <span className="attendance-lbl">{attendedCount}/{totalLogs} {lang === 'ar' ? 'محاضرات' : 'sessions'}</span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', width: '100%', justifyContent: 'center', marginBottom: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.attendText}</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-green)' }}>{attendedCount}</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.absentText}</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-red)' }}>{absentCount}</span>
          </div>
        </div>

        {/* Detailed Attendance List */}
        <div style={{ width: '100%', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
          <h4 style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{t.attendanceLogs}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '110px', overflowY: 'auto' }}>
            {studentAttendance.length > 0 ? (
              studentAttendance.map((log, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                  <span>Session #{log.sessionId} ({log.date})</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                    {log.status === 'present' ? (
                      <>
                        <CheckCircle size={12} color="var(--accent-green)" />
                        <span style={{ color: 'var(--accent-green)', fontSize: '0.75rem' }}>{t.present}</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={12} color="var(--accent-red)" />
                        <span style={{ color: 'var(--accent-red)', fontSize: '0.75rem' }}>{t.absent}</span>
                      </>
                    )}
                  </span>
                </div>
              ))
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No session logs recorded.</span>
            )}
          </div>
        </div>
      </div>

      {/* Grade charts */}
      <div className="glass-card chart-card" style={{ gridColumn: 'span 8' }}>
        <div className="card-title-group">
          <h3>{t.chartTitle}</h3>
        </div>
        <div style={{ height: '230px', position: 'relative' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Sessions and video materials - FILTERED to student's group */}
      <div className="glass-card sessions-section" style={{ gridColumn: 'span 12' }}>
        <div className="card-title-group">
          <h3>{t.sessionListTitle}</h3>
        </div>

        {/* Embedded Dynamic Video Player Widget */}
        {activeSession && (
          <div style={{ animation: 'slide-in 0.3s ease-out', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', color: 'var(--accent-primary)' }}>
                <Video size={18} color="var(--accent-primary)" />
                {lang === 'ar' ? 'بث المحاضرة المباشرة والتفاعلية' : 'Interactive Live Broadcast'}
              </h4>
              <button 
                onClick={() => setActiveSession(null)} 
                className="config-btn"
                style={{ borderColor: 'var(--accent-red)', color: 'var(--accent-red)', fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
              >
                {t.closeVideo}
              </button>
            </div>
            <InteractiveVideoPlayer 
              session={activeSession} 
              lang={lang} 
              onClose={() => setActiveSession(null)} 
            />
          </div>
        )}

        <div className="sessions-grid">
          {groupSessions.length > 0 ? (
            groupSessions.map((session) => {
              const attendanceLog = studentAttendance.find(a => a.sessionId === session.id);
              const status = attendanceLog ? attendanceLog.status : 'absent';

              return (
                <div key={session.id} className="glass-card session-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      {lang === 'ar' ? session.titleAr : session.titleEn}
                    </h4>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      padding: '0.15rem 0.5rem', 
                      borderRadius: '20px', 
                      fontWeight: 600,
                      backgroundColor: status === 'present' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                      color: status === 'present' ? 'var(--accent-green)' : 'var(--accent-red)',
                      border: `1px solid ${status === 'present' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                    }}>
                      {status === 'present' ? t.present : t.absent}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', flexGrow: 1, margin: '0.5rem 0' }}>
                    {lang === 'ar' ? session.descAr : session.descEn}
                  </p>
                  <div className="session-meta">
                    <span><Calendar size={12} style={{ verticalAlign: 'middle', marginInlineEnd: '4px' }} /> {session.date}</span>
                    <button 
                      onClick={() => setActiveSession(session)} 
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: 'var(--accent-primary)', 
                        cursor: 'pointer', 
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.8rem'
                      }}
                    >
                      <PlayCircle size={14} />
                      <span>{t.watchBtn}</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ gridColumn: 'span 2', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {lang === 'ar' ? 'لا توجد محاضرات منشورة لهذه المجموعة حالياً.' : 'No sessions published for this group yet.'}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default StudentDashboard;
