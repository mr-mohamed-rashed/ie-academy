import React, { useState } from 'react';
import { Users, GraduationCap, Calendar, Clock, PlusCircle, CheckCircle, Share2, QrCode, Trash2, Edit, DollarSign, X } from 'lucide-react';
import { calculateGPA, calculateAttendanceRate } from '../mockData';
import StudentAnalyticsModal from './StudentAnalyticsModal';
import Podium from './Podium';

const InstructorDashboard = ({ 
  instructor, 
  students, 
  sessions, 
  onAddGrade, 
  onAddSession, 
  onAddGroup,
  onEditGroup,
  onDeleteGroup,
  onRemoveStudent,
  lang, 
  triggerToast,
  activeGradeId,
  activeGroupId,
  onGradeChange,
  onGroupChange,
  systemFee,
  onPaySubscription
}) => {
  // Use props for grade and group state
  const activeGrade = instructor.grades?.find(g => g.id === activeGradeId) || instructor.grades?.[0];
  const derivedActiveGradeId = activeGrade?.id || '';

  const activeGroup = activeGrade?.groups?.find(g => g.id === activeGroupId) || activeGrade?.groups?.[0];
  const derivedActiveGroupId = activeGroup?.id || '';

  // Update active group when grade changes
  React.useEffect(() => {
    if (activeGradeId !== derivedActiveGradeId) {
      onGradeChange(derivedActiveGradeId);
    }
    if (activeGroupId !== derivedActiveGroupId) {
      onGroupChange(derivedActiveGroupId);
    }
  }, [derivedActiveGradeId, derivedActiveGroupId, activeGradeId, activeGroupId, onGradeChange, onGroupChange]);
  
  // Tabs state for organizing the dashboard
  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'curriculum'
  
  // Grading State
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [quizNameAr, setQuizNameAr] = useState('');
  const [quizNameEn, setQuizNameEn] = useState('');
  const [score, setScore] = useState('');
  const [selectedStudentForAnalytics, setSelectedStudentForAnalytics] = useState(null);

  // Session State
  const [sessionTitleAr, setSessionTitleAr] = useState('');
  const [sessionTitleEn, setSessionTitleEn] = useState('');
  const [sessionDescAr, setSessionDescAr] = useState('');
  const [sessionDescEn, setSessionDescEn] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const [selectedQrSessionId, setSelectedQrSessionId] = useState('');

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(''); // 'instapay' | 'cash'
  const [hasSkippedPlan, setHasSkippedPlan] = useState(false);

  // Add Group State
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [newGradeNameAr, setNewGradeNameAr] = useState('');
  const [newGroupNameAr, setNewGroupNameAr] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [groupTime, setGroupTime] = useState('');

  const daysOfWeekAr = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
  const daysOfWeekEn = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  const t = {
    en: {
      dashboardTitle: "Instructor Control Center",
      dashboardSubtitle: "Add new lecture sessions, grade student tasks, and generate attendance QR Codes.",
      statStudents: "Group Students",
      statAvgGPA: "Group Average GPA",
      statAttendance: "Group Avg Attendance",
      statSessions: "Group Sessions",
      gradeTitle: "Record Student Grade",
      selectStudent: "Select Student",
      quizTitleAr: "Task Name (Arabic)",
      quizTitleEn: "Task Name (English)",
      scoreLabel: "Grade (Out of 100)",
      submitGrade: "Record Grade",
      sessionTitle: "Publish New Lesson Session",
      sTitleAr: "Session Title (Arabic)",
      sTitleEn: "Session Title (English)",
      sDescAr: "Session Description (Arabic)",
      sDescEn: "Session Description (English)",
      sVideo: "Video Embed URL (YouTube/Vimeo)",
      submitSession: "Publish Session",
      studentListTitle: "Student Roster & Progress Analytics",
      tblName: "Student Name",
      tblGPA: "Current GPA",
      tblAttendance: "Attendance",
      tblStatus: "Status",
      excellent: "Excellent",
      good: "Good",
      average: "Average",
      pass: "Needs Review",
      toastGradeSuccess: "Successfully recorded grade for ",
      toastSessionSuccess: "Successfully published session: ",
      videoPlaceholder: "e.g., https://www.youtube.com/embed/SqcY0GlETPk",
      inviteTitle: "Invite Students to this Group",
      inviteDesc: "Share this link with your students to automatically register them to this class group.",
      copyBtn: "Copy Invitation Link",
      toastCopied: "Signup invitation link copied to clipboard!",
      qrTitle: "In-Center Attendance QR Generator",
      qrDesc: "Display this QR code on the screen in your classroom/center. Students can scan it on their portals to record attendance instantly.",
      qrSelectSession: "Select Session to Generate QR",
      qrGenerateBtn: "Generate Attendance QR",
      noSessionsQr: "Please publish a session first to generate a QR code.",
      activeGroupLabel: "Active Classroom Group:",
      addGroupBtn: "Create Group",
      addGroupTitle: "Create New Classroom Group",
      groupNameAr: "Group Name (Arabic)",
      groupNameEn: "Group Name (English)",
      groupType: "Group Type/Location",
      typeOnline: "Online Only",
      typeCenter: "In-Center (Offline)",
      toastGroupSuccess: "Group created successfully!",
      editGroupBtn: "Edit Group",
      editGroupTitle: "Edit Classroom Group",
      groupManagement: "Group Management & Roster",
      toastEditSuccess: "Group updated successfully!"
    },
    ar: {
      dashboardTitle: "مركز التحكم والتدريب",
      dashboardSubtitle: "إضافة محاضرات جديدة، رصد درجات الطلاب، وتوليد كود الحضور والـ QR في السنتر.",
      statStudents: "طلاب المجموعة",
      statAvgGPA: "متوسط درجات المجموعة",
      statAttendance: "نسبة الحضور للمجموعة",
      statSessions: "محاضرات المجموعة",
      gradeTitle: "رصد درجات الطلاب",
      selectStudent: "اختر الطالب",
      quizTitleAr: "اسم الاختبار/الواجب (بالعربية)",
      quizTitleEn: "اسم الاختبار/الواجب (بالإنجليزية)",
      scoreLabel: "الدرجة (من 100)",
      submitGrade: "تسجيل الدرجة",
      sessionTitle: "نشر محاضرة / درس جديد للمجموعة",
      sTitleAr: "عنوان المحاضرة (بالعربية)",
      sTitleEn: "عنوان المحاضرة (بالإنجليزية)",
      sDescAr: "شرح وتفاصيل المحاضرة (بالعربية)",
      sDescEn: "شرح وتفاصيل المحاضرة (بالإنجليزية)",
      sVideo: "رابط تضمين الفيديو (YouTube / Vimeo)",
      submitSession: "نشر المحاضرة الآن",
      studentListTitle: "سجل حضور ودرجات طلاب المجموعة",
      tblName: "اسم الطالب",
      tblGPA: "المعدل التراكمي",
      tblAttendance: "نسبة الحضور",
      tblStatus: "حالة الطالب",
      excellent: "ممتاز",
      good: "جيد جداً",
      average: "جيد/متوسط",
      pass: "يحتاج مراجعة",
      toastGradeSuccess: "تم رصد الدرجة بنجاح للطالب ",
      toastSessionSuccess: "تم نشر المحاضرة بنجاح: ",
      videoPlaceholder: "مثال: https://www.youtube.com/embed/SqcY0GlETPk",
      inviteTitle: "دعوة الطلاب للانضمام للمجموعة",
      inviteDesc: "شارك هذا الرابط مع الطلاب ليقوموا بالتسجيل والانضمام تلقائياً لهذه المجموعة الدراسية.",
      copyBtn: "نسخ رابط الدعوة",
      toastCopied: "تم نسخ رابط دعوة التسجيل إلى الحافظة!",
      qrTitle: "توليد رمز حضور الحصة (QR Code)",
      qrDesc: "اعرض رمز الـ QR هذا للطلاب في السنتر/القاعة. يمكن للطلاب عمل مسح للكود من هواتفهم لتسجيل حضورهم فوراً.",
      qrSelectSession: "اختر الحصة لتوليد رمز الحضور لها",
      qrGenerateBtn: "توليد كود الحضور الـ QR",
      noSessionsQr: "الرجاء نشر محاضرة أولاً لتوليد كود الـ QR.",
      activeGroupLabel: "الصف الدراسي النشط:",
      addGroupBtn: "إضافة صف / مجموعة",
      addGroupTitle: "إضافة صف دراسي جديد",
      groupNameAr: "اسم المجموعة (بالعربية)",
      groupNameEn: "اسم المجموعة (بالإنجليزية)",
      groupType: "نوع / مكان المجموعة",
      typeOnline: "أونلاين فقط",
      typeCenter: "في السنتر (أوفلاين)",
      toastGroupSuccess: "تم الإنشاء بنجاح!",
      editGroupBtn: "تعديل بيانات المجموعة",
      editGroupTitle: "تعديل بيانات المجموعة",
      groupManagement: "إدارة المجموعة والطلاب",
      toastEditSuccess: "تم تعديل المجموعة بنجاح!"
    }
  }[lang];

  // Filter students enrolled in this teacher's specific active group
  const groupStudents = students.filter(student =>
    student.enrollments.some(e => e.instructorId === instructor.id && e.gradeId === activeGradeId && e.groupId === activeGroupId)
  );

  // Filter sessions for this teacher's active grade
  const gradeSessions = sessions.filter(session =>
    session.instructorId === instructor.id && session.gradeId === activeGradeId
  );

  // Default the selected student when the group changes
  React.useEffect(() => {
    if (groupStudents.length > 0) {
      setSelectedStudentId(groupStudents[0].id.toString());
    } else {
      setSelectedStudentId('');
    }
  }, [activeGroupId, students]);

  // Set default QR session
  React.useEffect(() => {
    if (gradeSessions.length > 0) {
      setSelectedQrSessionId(gradeSessions[0].id.toString());
    } else {
      setSelectedQrSessionId('');
    }
  }, [activeGradeId, sessions]);

  // Copy referral invite link
  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/signup?teacher=${instructor.id}&grade=${activeGradeId}&group=${activeGroupId}`;
    navigator.clipboard.writeText(inviteLink).then(() => {
      triggerToast(t.toastCopied, 'success');
    });
  };

  // Grade Form handler
  const handleGradeSubmit = (e) => {
    e.preventDefault();
    if (!selectedStudentId || !quizNameAr || !quizNameEn || !score) return;

    onAddGrade(
      Number(selectedStudentId), 
      quizNameAr, 
      quizNameEn, 
      Number(score)
    );

    const stud = students.find(s => s.id === Number(selectedStudentId));
    const studName = lang === 'ar' ? stud.nameAr : stud.nameEn;
    triggerToast(t.toastGradeSuccess + studName, 'success');

    // Reset fields except student selector
    setQuizNameAr('');
    setQuizNameEn('');
    setScore('');
  };

  const handleAddGroupSubmit = (e) => {
    e.preventDefault();
    if (!newGradeNameAr || !newGroupNameAr) return;
    
    onAddGroup(instructor.id, {
      gradeNameAr: newGradeNameAr,
      groupNameAr: newGroupNameAr,
      days: selectedDays,
      time: groupTime
    });
    
    triggerToast(t.toastGroupSuccess, 'success');
    setShowAddGroup(false);
    setNewGradeNameAr('');
    setNewGroupNameAr('');
    setSelectedDays([]);
    setGroupTime('');
  };

  const handleToggleDay = (day) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // Session Form handler
  const handleSessionSubmit = (e) => {
    e.preventDefault();
    if (!sessionTitleAr || !sessionTitleEn || !videoUrl) return;

    const newSession = {
      instructorId: instructor.id,
      gradeId: activeGradeId, // Sessions attached to grade
      titleAr: sessionTitleAr,
      titleEn: sessionTitleEn,
      descAr: sessionDescAr,
      descEn: sessionDescEn,
      videoUrl: videoUrl,
      date: new Date().toISOString().split('T')[0]
    };

    onAddSession(newSession);
    triggerToast(t.toastSessionSuccess + (lang === 'ar' ? sessionTitleAr : sessionTitleEn), 'success');

    // Reset fields
    setSessionTitleAr('');
    setSessionTitleEn('');
    setSessionDescAr('');
    setSessionDescEn('');
    setVideoUrl('');
  };

  // Aggregated group stats
  const totalStudents = groupStudents.length;
  const avgGPA = totalStudents > 0 
    ? parseFloat((groupStudents.reduce((acc, s) => acc + calculateGPA(s.grades, instructor.id), 0) / totalStudents).toFixed(1))
    : 0;
  const avgAttendance = totalStudents > 0
    ? Math.round(groupStudents.reduce((acc, s) => acc + calculateAttendanceRate(s.attendance, instructor.id), 0) / totalStudents)
    : 0;
  const totalSessions = gradeSessions.length;

  const [isPaying, setIsPaying] = useState(false);

  const getStandings = (gpa) => {
    if (gpa >= 90) return { text: t.excellent, color: 'var(--accent-green)' };
    if (gpa >= 80) return { text: t.good, color: 'var(--accent-purple)' };
    if (gpa >= 70) return { text: t.average, color: 'var(--color-gold)' };
    return { text: t.pass, color: 'var(--accent-red)' };
  };

  const simulatePayment = () => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setShowPaymentModal(false);
      setHasSkippedPlan(true);
      onPaySubscription();
      triggerToast(lang === 'ar' ? 'تم تأكيد الدفع وتفعيل حسابك بنجاح!' : 'Payment confirmed! Account activated.', 'success');
    }, 2000);
  };

  if (!instructor.isSubscribed && !hasSkippedPlan && !showPaymentModal) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 1rem', animation: 'slide-up 0.5s ease-out' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', textAlign: 'center' }}>
          {lang === 'ar' ? 'اختر نظام حسابك' : 'Choose Your Account System'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', textAlign: 'center' }}>
          {lang === 'ar' ? 'يمكنك استخدام المنصة مجاناً بصلاحيات محدودة، أو الترقية للنظام المدفوع للظهور للطلاب.' : 'Use the platform for free with limited access, or upgrade to appear to students.'}
        </p>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '900px', width: '100%' }}>
          
          {/* Free Plan Card */}
          <div className="glass-card" style={{ flex: '1 1 350px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid var(--border-glass)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', textAlign: 'center' }}>
              {lang === 'ar' ? 'النظام المجاني' : 'Free Plan'}
            </h3>
            <div style={{ textAlign: 'center', margin: '1rem 0' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>{lang === 'ar' ? 'مجاناً' : 'Free'}</span>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle size={18} color="var(--accent-green)"/> <span>{lang === 'ar' ? 'إضافة عدد محدود من الفصول والطلاب' : 'Add limited classes and students'}</span></li>
              <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle size={18} color="var(--accent-green)"/> <span>{lang === 'ar' ? 'إدارة درجات الطلاب وحضورهم' : 'Manage student grades and attendance'}</span></li>
              <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', opacity: 0.5 }}><X size={18} /> <del>{lang === 'ar' ? 'الظهور للطلاب في المنصة الرئيسية' : 'Appear in student searches'}</del></li>
              <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', opacity: 0.5 }}><X size={18} /> <del>{lang === 'ar' ? 'دعم إعلاني وتسويق لحصصك الدراسية' : 'Ads and marketing support'}</del></li>
            </ul>
            <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
              <button onClick={() => setHasSkippedPlan(true)} className="config-btn" style={{ width: '100%', padding: '1rem', justifyContent: 'center' }}>
                {lang === 'ar' ? 'الاستمرار بالنظام المجاني' : 'Continue for Free'}
              </button>
            </div>
          </div>

          {/* Paid Plan Card */}
          <div className="glass-card" style={{ flex: '1 1 350px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '2px solid var(--color-gold)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '1rem', right: '-2.5rem', backgroundColor: 'var(--color-gold)', color: '#000', padding: '0.25rem 3rem', transform: 'rotate(45deg)', fontWeight: 800, fontSize: '0.8rem' }}>
              {lang === 'ar' ? 'الأفضل' : 'BEST'}
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-gold)', textAlign: 'center' }}>
              {lang === 'ar' ? 'النظام المدفوع (VIP)' : 'VIP Premium Plan'}
            </h3>
            <div style={{ textAlign: 'center', margin: '1rem 0' }}>
              <strong style={{ fontSize: '2.5rem', color: 'var(--accent-primary)' }}>{systemFee}</strong>
              <span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginInlineStart: '0.5rem' }}>{lang === 'ar' ? 'جنيه / شهر' : 'EGP / mo'}</span>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-primary)' }}>
              <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle size={18} color="var(--color-gold)"/> <strong>{lang === 'ar' ? 'الظهور للطلاب في المنصة الرئيسية' : 'Appear to students on main platform'}</strong></li>
              <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle size={18} color="var(--color-gold)"/> <strong>{lang === 'ar' ? 'دعم كامل للإعلانات وتسويق حصصك' : 'Full ad support and marketing'}</strong></li>
              <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle size={18} color="var(--color-gold)"/> <strong>{lang === 'ar' ? 'أولوية في لوحات الشرف والتقييمات' : 'Priority in honor boards & ratings'}</strong></li>
              <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle size={18} color="var(--color-gold)"/> <strong>{lang === 'ar' ? 'لا حدود على عدد الفصول أو الطلاب' : 'Unlimited classes and students'}</strong></li>
            </ul>
            <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
              <button onClick={() => setShowPaymentModal(true)} className="btn-primary" style={{ width: '100%', padding: '1rem', justifyContent: 'center', backgroundColor: 'var(--color-gold)', color: '#000', fontWeight: 800 }}>
                {lang === 'ar' ? 'اشترك ورقي حسابك' : 'Upgrade & Subscribe'}
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-grid" style={{ animation: 'slide-in 0.3s ease-out' }}>
      
      {/* Upgrade Banner for Free Accounts */}
      {!instructor.isSubscribed && (
        <div className="glass-card" style={{ gridColumn: 'span 12', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--accent-gold)', backgroundColor: 'rgba(251, 191, 36, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '50px', height: '50px', backgroundColor: 'rgba(251, 191, 36, 0.15)', color: 'var(--color-gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={28} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-gold)' }}>
                  {lang === 'ar' ? 'أنت الآن على النظام المجاني (صلاحيات محدودة)' : 'You are on the Free Plan (Limited Access)'}
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  {lang === 'ar' ? 'قم بالترقية للنظام المدفوع للظهور على المنصة الرئيسية للطلاب والاستفادة من ميزات إضافية.' : 'Upgrade to the paid plan to appear on the main platform to students and unlock premium features.'}
                </p>
              </div>
            </div>
            <button onClick={() => setShowPaymentModal(true)} className="btn-primary" style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--color-gold)', color: '#000', fontWeight: 800 }}>
              {lang === 'ar' ? 'ترقية الحساب الآن' : 'Upgrade Account Now'}
            </button>
          </div>
        </div>
      )}
      {/* Group selector and Referral Link header */}
      <div className="glass-card" style={{ gridColumn: 'span 12', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            className="btn-primary"
            onClick={() => {
              setNewGradeNameAr(activeGrade?.nameAr || '');
              setShowAddGroup(true);
            }}
            style={{ padding: '0.65rem 1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
          >
            <PlusCircle size={18} />
            <span>{lang === 'ar' ? 'إنشاء صف / مجموعة جديدة' : 'Create Grade / Group'}</span>
          </button>
        </div>

        {/* Invite Student Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderInlineStart: '2px solid var(--border-glass)', paddingInlineStart: '1.5rem' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{t.inviteTitle}</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.inviteDesc}</p>
          </div>
          <button className="config-btn" onClick={copyInviteLink} style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)', padding: '0.6rem 1rem' }}>
            <Share2 size={16} />
            <span>{t.copyBtn}</span>
          </button>
        </div>
      </div>

      {/* Group stats */}
      <div className="stats-strip">
        <div className="glass-card stat-card">
          <div className="stat-icon"><Users size={24} /></div>
          <div className="stat-info">
            <span className="stat-lbl">{t.statStudents}</span>
            <span className="stat-val">{totalStudents}</span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon"><GraduationCap size={24} /></div>
          <div className="stat-info">
            <span className="stat-lbl">{t.statAvgGPA}</span>
            <span className="stat-val" style={{ color: 'var(--color-gold)' }}>{avgGPA}%</span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon"><Clock size={24} /></div>
          <div className="stat-info">
            <span className="stat-lbl">{t.statAttendance}</span>
            <span className="stat-val" style={{ color: 'var(--accent-green)' }}>{avgAttendance}%</span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon"><Calendar size={24} /></div>
          <div className="stat-info">
            <span className="stat-lbl">{t.statSessions}</span>
            <span className="stat-val">{totalSessions}</span>
          </div>
        </div>
      </div>

      {/* Tabs Control */}
      <div className="dashboard-tabs" style={{ gridColumn: 'span 12', display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        <button 
          className={`role-tab ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
          style={{ padding: '0.5rem 1.5rem' }}
        >
          {lang === 'ar' ? 'إدارة الطلبة' : 'Student Management'}
        </button>
        <button 
          className={`role-tab ${activeTab === 'curriculum' ? 'active' : ''}`}
          onClick={() => setActiveTab('curriculum')}
          style={{ padding: '0.5rem 1.5rem' }}
        >
          {lang === 'ar' ? 'إدارة المنهج' : 'Curriculum Management'}
        </button>
      </div>

      {activeTab === 'students' && (
        <>
          <div style={{ gridColumn: 'span 8' }}>
            <Podium students={students} lang={lang} instructorId={instructor.id} gradeId={activeGradeId} groupId={activeGroupId} />
          </div>
          {/* Grade entry form */}
      <div className="glass-card grade-entry-card" style={{ gridColumn: 'span 4' }}>
        <div className="card-title-group">
          <h3>{t.gradeTitle}</h3>
        </div>
        {groupStudents.length > 0 ? (
          <form onSubmit={handleGradeSubmit}>
            <div className="form-group">
              <label>{t.selectStudent}</label>
              <select 
                value={selectedStudentId} 
                onChange={(e) => setSelectedStudentId(e.target.value)} 
                className="form-control"
              >
                {groupStudents.map(s => (
                  <option key={s.id} value={s.id}>
                    {lang === 'ar' ? s.nameAr : s.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>{t.quizTitleAr}</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="مثال: واجب الهندسة التحليلية" 
                value={quizNameAr} 
                onChange={(e) => setQuizNameAr(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>{t.quizTitleEn}</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Geometry Homework" 
                value={quizNameEn} 
                onChange={(e) => setQuizNameEn(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>{t.scoreLabel}</label>
              <input 
                type="number" 
                min="0" 
                max="100" 
                className="form-control" 
                placeholder="95" 
                value={score} 
                onChange={(e) => setScore(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary">
              <CheckCircle size={18} />
              <span>{t.submitGrade}</span>
            </button>
          </form>
        ) : (
          <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            {lang === 'ar' ? 'لا يوجد طلاب مسجلين في هذه المجموعة حالياً.' : 'No students enrolled in this group yet.'}
          </div>
        )}
      </div>
      {/* Classroom Grade Table */}
      <div className="glass-card" style={{ gridColumn: 'span 12' }}>
        <div className="card-title-group" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>{t.groupManagement}</h3>
          
          {activeGradeId && activeGroupId && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                className="config-btn"
                onClick={() => {
                  setNewGradeNameAr(activeGrade?.nameAr || '');
                  setNewGroupNameAr(activeGroup?.nameAr || '');
                  // Note: schedule parsing could be added here for days/time, leaving default for now
                  setShowEditGroup(true);
                }}
                style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
              >
                <Edit size={16} />
                <span>{t.editGroupBtn}</span>
              </button>
              
              <button 
                className="config-btn"
                onClick={() => {
                  if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذه المجموعة؟ سيتم حذفها نهائياً.' : 'Are you sure you want to delete this group?')) {
                    onDeleteGroup(instructor.id, activeGradeId, activeGroupId);
                    triggerToast(lang === 'ar' ? 'تم حذف المجموعة بنجاح.' : 'Group deleted successfully.', 'success');
                  }
                }}
                style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}
              >
                <Trash2 size={16} />
                <span>{lang === 'ar' ? 'حذف المجموعة' : 'Delete Group'}</span>
              </button>
            </div>
          )}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', textAlign: 'start' }}>
                <th style={{ padding: '0.75rem', textAlign: 'start' }}>{t.tblName}</th>
                <th style={{ padding: '0.75rem', textAlign: 'start' }}>{t.tblGPA}</th>
                <th style={{ padding: '0.75rem', textAlign: 'start' }}>{t.tblAttendance}</th>
                <th style={{ padding: '0.75rem', textAlign: 'start' }}>{t.tblStatus}</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {groupStudents.length > 0 ? (
                groupStudents.map(s => {
                  const gpaVal = calculateGPA(s.grades, instructor.id);
                  const standing = getStandings(gpaVal);
                  return (
                    <tr 
                      key={s.id} 
                      onClick={() => setSelectedStudentForAnalytics(s)}
                      style={{ borderBottom: '1px solid var(--border-glass)', cursor: 'pointer', transition: 'background-color 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img src={s.avatar} alt={s.nameEn} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{lang === 'ar' ? s.nameAr : s.nameEn}</span>
                      </td>
                      <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--color-gold)', fontSize: '0.9rem' }}>{gpaVal}%</td>
                      <td style={{ padding: '0.75rem', fontSize: '0.9rem' }}>{calculateAttendanceRate(s.attendance, instructor.id)}%</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ 
                          color: standing.color, 
                          fontWeight: 700, 
                          backgroundColor: `${standing.color}15`,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          border: `1px solid ${standing.color}20`
                        }}>
                          {standing.text}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <button 
                          className="config-btn"
                          style={{ padding: '0.4rem', borderColor: 'var(--accent-red)', color: 'var(--accent-red)', margin: '0 auto' }}
                          title={lang === 'ar' ? 'حذف الطالب من المجموعة' : 'Remove student from group'}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(lang === 'ar' ? `هل أنت متأكد من حذف ${s.nameAr} من المجموعة؟` : `Are you sure you want to remove ${s.nameEn} from this group?`)) {
                              onRemoveStudent(s.id, instructor.id, activeGradeId, activeGroupId);
                              triggerToast(lang === 'ar' ? 'تم الحذف بنجاح' : 'Successfully removed', 'success');
                            }
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {lang === 'ar' ? 'لا يوجد طلاب مضافين.' : 'No students found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}

      {activeTab === 'curriculum' && (
        <>
      {/* Create Session Form */}
      <div className="glass-card session-create-card" style={{ gridColumn: 'span 7' }}>
        <div className="card-title-group">
          <h3>{t.sessionTitle}</h3>
        </div>
        <form onSubmit={handleSessionSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>{t.sTitleAr}</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="المحاضرة 6: مدخل إلى..."
                value={sessionTitleAr}
                onChange={(e) => setSessionTitleAr(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>{t.sTitleEn}</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Session 6: Introduction to..."
                value={sessionTitleEn}
                onChange={(e) => setSessionTitleEn(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>{t.sDescAr}</label>
            <textarea 
              rows="1" 
              className="form-control" 
              placeholder="اكتب شرحاً مختصراً للمحاضرة هنا..."
              value={sessionDescAr}
              onChange={(e) => setSessionDescAr(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>{t.sDescEn}</label>
            <textarea 
              rows="1" 
              className="form-control" 
              placeholder="Write a brief explanation of the session..."
              value={sessionDescEn}
              onChange={(e) => setSessionDescEn(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>{t.sVideo}</label>
            <input 
              type="url" 
              className="form-control" 
              placeholder={t.videoPlaceholder}
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ backgroundColor: 'var(--accent-purple)' }}>
            <PlusCircle size={18} />
            <span>{t.submitSession}</span>
          </button>
        </form>
      </div>

      {/* In-Center Attendance QR Generator Card */}
      <div className="glass-card" style={{ gridColumn: 'span 5' }}>
        <div className="card-title-group">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <QrCode size={20} color="var(--accent-primary)" />
            {t.qrTitle}
          </h3>
          <p style={{ marginTop: '0.25rem' }}>{t.qrDesc}</p>
        </div>

        {gradeSessions.length > 0 ? (
          <div>
            <div className="form-group">
              <label>{t.qrSelectSession}</label>
              <select 
                value={selectedQrSessionId}
                onChange={(e) => setSelectedQrSessionId(e.target.value)}
                className="form-control"
              >
                {gradeSessions.map(s => (
                  <option key={s.id} value={s.id}>
                    {lang === 'ar' ? s.titleAr : s.titleEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Simulated Live Pulsing QR Code Box */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              padding: '1.5rem', 
              backgroundColor: '#fff', 
              borderRadius: '12px',
              border: '2px dashed var(--accent-primary)',
              marginTop: '1rem',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Pulsing Radar scanning line */}
              <div style={{
                position: 'absolute',
                width: '100%',
                height: '4px',
                background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.8), transparent)',
                top: '0',
                left: '0',
                animation: 'scan 2.5s linear infinite',
                boxShadow: '0 0 10px rgba(99, 102, 241, 0.8)'
              }}></div>
              
              {/* Renders custom SVG QR Mockup with active session ID info */}
              <svg width="150" height="150" viewBox="0 0 29 29" style={{ shapeRendering: 'crispEdges' }}>
                <path d="M0 0h7v7H0zM22 0h7v7h-7zM0 22h7v7H0zM3 3h1v1H3zM25 3h1v1h-1zM3 25h1v1H3z" fill="#0f172a" />
                {/* Random blocks representing QR details dependent on active session */}
                <path d={`M8 1h2v1H8zM12 0h1v3h-1zM15 2h3v1h-3zM20 1h1v1h-1zM10 4h3v1h-3zM15 5h1v2h-1zM19 4h2v3h-2zM0 8h2v1H0zM4 9h3v1H4zM9 8h2v2H9zM13 9h4v1h-4zM20 8h1v2h-1zM23 9h4v1h-4zM2 12h1v3H2zM6 13h2v1H6zM10 11h4v1h-4zM16 12h2v3h-2zM21 11h3v2h-3zM27 12h1v2h-1zM1 16h3v1H1zM6 15h1v3H6zM9 16h4v1H9zM15 16h2v2h-2zM19 15h2v3h-2zM23 16h3v1h-3zM28 15h1v3h-1zM1 19h2v1H1zM5 20h3v1H5zM10 19h2v2h-2zM14 20h3v1h-3zM19 19h4v2h-4zM25 20h3v1h-3zM8 22h3v1H8zM13 23h2v1h-2zM17 22h2v2h-2zM21 23h3v1h-3zM26 22h2v2h-2z` 
                  + (selectedQrSessionId ? `M10 15h3v2h-3zM12 18h2v2h-2z` : '')} fill="#0f172a" />
              </svg>
              
              <span style={{ color: '#0f172a', fontWeight: 800, fontSize: '0.8rem', marginTop: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Session ID: #{selectedQrSessionId}
              </span>
            </div>
          </div>
        ) : (
          <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {t.noSessionsQr}
          </div>
        )}
      </div>

      {/* Published Sessions List */}
      <div className="glass-card" style={{ gridColumn: 'span 12', marginTop: '0.5rem' }}>
        <div className="card-title-group" style={{ marginBottom: '1.5rem' }}>
          <h3>{lang === 'ar' ? 'المحاضرات المرفوعة للمجموعة' : 'Published Group Sessions'}</h3>
          <p>{lang === 'ar' ? 'شروحات الفيديو والمذكرات المرفوعة لهذه المجموعة' : 'Video lectures and materials published for this group'}</p>
        </div>
        
        {gradeSessions.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {gradeSessions.map(session => (
              <div key={session.id} style={{ border: '1px solid var(--border-glass)', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--bg-glass)' }}>
                {session.videoUrl && (
                  <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                    <iframe 
                      src={session.videoUrl} 
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} 
                      frameBorder="0" 
                      allowFullScreen
                      title={lang === 'ar' ? session.titleAr : session.titleEn}
                    />
                  </div>
                )}
                <div style={{ padding: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: 800 }}>
                    {lang === 'ar' ? session.titleAr : session.titleEn}
                  </h4>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                    {lang === 'ar' ? session.descAr : session.descEn}
                  </p>
                  <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-glass)', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{session.date}</span>
                    <span>{lang === 'ar' ? 'رقم المحاضرة:' : 'Session ID:'} {session.id}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            {lang === 'ar' ? 'لم يتم نشر أي محاضرات لهذه المجموعة بعد.' : 'No sessions published for this group yet.'}
          </div>
        )}
      </div>
        </>
      )}


      {/* Custom Scan Line Animation for QR Mockup */}
      <style>{`
        @keyframes scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
      `}</style>

      {/* Add Group Modal */}
      {showAddGroup && (
        <div style={{ 
          position: 'fixed', 
          top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.85)', 
          zIndex: 4000, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backdropFilter: 'blur(10px)',
          direction: lang === 'ar' ? 'rtl' : 'ltr'
        }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '450px', padding: '2rem', animation: 'slide-in 0.3s ease-out' }}>
            <div style={{ marginBottom: '1.5rem', textAlign: 'start' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{t.addGroupTitle}</h3>
            </div>
            <form onSubmit={handleAddGroupSubmit} style={{ textAlign: 'start' }}>
              <div className="form-group">
                <label>{lang === 'ar' ? 'الصف الدراسي' : 'Grade / Year'}</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder={lang === 'ar' ? 'مثال: الصف الأول الثانوي' : 'e.g. 1st Secondary'}
                  value={newGradeNameAr}
                  onChange={(e) => setNewGradeNameAr(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label>{lang === 'ar' ? 'اسم المجموعة' : 'Group Name'}</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder={lang === 'ar' ? 'مثال: مجموعة أ' : 'e.g. Group A'}
                  value={newGroupNameAr}
                  onChange={(e) => setNewGroupNameAr(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label>{lang === 'ar' ? 'أيام المواعيد' : 'Schedule Days'}</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  {(lang === 'ar' ? daysOfWeekAr : daysOfWeekEn).map((day, idx) => (
                    <button
                      type="button"
                      key={day}
                      onClick={() => handleToggleDay(daysOfWeekAr[idx])}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        border: selectedDays.includes(daysOfWeekAr[idx]) ? 'none' : '1px solid var(--border-glass)',
                        backgroundColor: selectedDays.includes(daysOfWeekAr[idx]) ? 'var(--accent-primary)' : 'var(--bg-glass)',
                        color: selectedDays.includes(daysOfWeekAr[idx]) ? 'white' : 'var(--text-primary)',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>{lang === 'ar' ? 'وقت المحاضرة' : 'Lecture Time'}</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder={lang === 'ar' ? "اكتب 4 مثلاً وتلقائياً ستصبح 4:00 مساءً" : "e.g. 4"}
                  value={groupTime}
                  onChange={(e) => setGroupTime(e.target.value)}
                  onBlur={(e) => {
                    let val = e.target.value.trim();
                    if (/^\d{1,2}$/.test(val)) {
                      setGroupTime(`${val}:00 ${lang === 'ar' ? 'مساءً' : 'PM'}`);
                    }
                  }}
                  required 
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddGroup(false)}
                  className="config-btn" 
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ flex: 1 }}
                >
                  {t.addGroupBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {showEditGroup && (
        <div style={{ 
          position: 'fixed', 
          top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.85)', 
          zIndex: 4000, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backdropFilter: 'blur(10px)',
          direction: lang === 'ar' ? 'rtl' : 'ltr'
        }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '450px', padding: '2rem', animation: 'slide-in 0.3s ease-out' }}>
            <div style={{ marginBottom: '1.5rem', textAlign: 'start' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{t.editGroupTitle}</h3>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newGradeNameAr || !newGroupNameAr) return;
              
              onEditGroup(instructor.id, activeGradeId, activeGroupId, {
                gradeNameAr: newGradeNameAr,
                groupNameAr: newGroupNameAr,
                days: selectedDays,
                time: groupTime
              });
              
              triggerToast(t.toastEditSuccess, 'success');
              setShowEditGroup(false);
            }} style={{ textAlign: 'start' }}>
              <div className="form-group">
                <label>{lang === 'ar' ? 'الصف الدراسي' : 'Grade / Year'}</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder={lang === 'ar' ? 'مثال: الصف الأول الثانوي' : 'e.g. 1st Secondary'}
                  value={newGradeNameAr}
                  onChange={(e) => setNewGradeNameAr(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label>{lang === 'ar' ? 'اسم المجموعة' : 'Group Name'}</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder={lang === 'ar' ? 'مثال: مجموعة أ' : 'e.g. Group A'}
                  value={newGroupNameAr}
                  onChange={(e) => setNewGroupNameAr(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label>{lang === 'ar' ? 'أيام المواعيد' : 'Schedule Days'}</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  {(lang === 'ar' ? daysOfWeekAr : daysOfWeekEn).map((day, idx) => (
                    <button
                      type="button"
                      key={day}
                      onClick={() => handleToggleDay(daysOfWeekAr[idx])}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        border: selectedDays.includes(daysOfWeekAr[idx]) ? 'none' : '1px solid var(--border-glass)',
                        backgroundColor: selectedDays.includes(daysOfWeekAr[idx]) ? 'var(--accent-primary)' : 'var(--bg-glass)',
                        color: selectedDays.includes(daysOfWeekAr[idx]) ? 'white' : 'var(--text-primary)',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>{lang === 'ar' ? 'وقت المحاضرة' : 'Lecture Time'}</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder={lang === 'ar' ? "اكتب 4 مثلاً وتلقائياً ستصبح 4:00 مساءً" : "e.g. 4"}
                  value={groupTime}
                  onChange={(e) => setGroupTime(e.target.value)}
                  onBlur={(e) => {
                    let val = e.target.value.trim();
                    if (/^\d{1,2}$/.test(val)) {
                      setGroupTime(`${val}:00 ${lang === 'ar' ? 'مساءً' : 'PM'}`);
                    }
                  }}
                  required 
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowEditGroup(false)}
                  className="config-btn" 
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ flex: 1 }}
                >
                  {t.editGroupBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedStudentForAnalytics && (
        <StudentAnalyticsModal
          student={selectedStudentForAnalytics}
          instructorId={instructor.id}
          lang={lang}
          onClose={() => setSelectedStudentForAnalytics(null)}
        />
      )}

    {/* Payment/Upgrade Modal */}
      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card" style={{ maxWidth: '600px', width: '100%' }}>
            <div className="modal-header">
              <h2>{lang === 'ar' ? 'الترقية للنظام المدفوع' : 'Upgrade to Premium'}</h2>
              <button onClick={() => setShowPaymentModal(false)} className="close-btn"><X size={24} /></button>
            </div>
            
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: 'var(--color-gold)' }}>{lang === 'ar' ? 'مميزات النظام المدفوع:' : 'Premium Features:'}</h4>
                <ul style={{ margin: 0, paddingInlineStart: '1.5rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <li>{lang === 'ar' ? 'الظهور للطلاب في المنصة الرئيسية في صفحة بحث المدرسين.' : 'Appear to students on the main platform search.'}</li>
                  <li>{lang === 'ar' ? 'دعم كامل لإعلانات المنصة وتسويق حصصك الدراسية.' : 'Full support for platform ads and marketing your sessions.'}</li>
                  <li>{lang === 'ar' ? 'الحصول على أولوية في الظهور في لوحات الشرف والتقييمات.' : 'Priority appearance on honor boards and ratings.'}</li>
                  <li>{lang === 'ar' ? 'لا حدود على عدد الفصول أو الطلاب المضافين.' : 'No limits on the number of classes or students added.'}</li>
                </ul>
              </div>

              <div style={{ textAlign: 'center', padding: '1rem', border: '1px solid var(--border-glass)', borderRadius: '12px' }}>
                <span style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  {lang === 'ar' ? 'قيمة الاشتراك الشهري' : 'Monthly Subscription Fee'}
                </span>
                <strong style={{ fontSize: '2.5rem', color: 'var(--accent-primary)' }}>{systemFee}</strong>
                <span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginInlineStart: '0.5rem' }}>{lang === 'ar' ? 'جنيه' : 'EGP'}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h4 style={{ margin: 0, fontSize: '1rem' }}>{lang === 'ar' ? 'اختر طريقة الدفع:' : 'Select Payment Method:'}</h4>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={() => setPaymentMethod('instapay')}
                    className="glass-card"
                    style={{ flex: 1, padding: '1rem', border: paymentMethod === 'instapay' ? '2px solid var(--accent-primary)' : '1px solid var(--border-glass)', cursor: 'pointer', textAlign: 'center' }}
                  >
                    <strong style={{ display: 'block', marginBottom: '0.25rem', color: paymentMethod === 'instapay' ? 'var(--accent-primary)' : 'inherit' }}>{lang === 'ar' ? 'انستاباي (InstaPay)' : 'InstaPay'}</strong>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('cash')}
                    className="glass-card"
                    style={{ flex: 1, padding: '1rem', border: paymentMethod === 'cash' ? '2px solid var(--accent-red)' : '1px solid var(--border-glass)', cursor: 'pointer', textAlign: 'center' }}
                  >
                    <strong style={{ display: 'block', marginBottom: '0.25rem', color: paymentMethod === 'cash' ? 'var(--accent-red)' : 'inherit' }}>{lang === 'ar' ? 'فودافون كاش' : 'Vodafone Cash'}</strong>
                  </button>
                </div>
              </div>

              {paymentMethod && (
                <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid var(--border-glass)', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)' }}>
                    {lang === 'ar' ? 'يرجى تحويل مبلغ الاشتراك إلى الرقم التالي:' : 'Please transfer the subscription amount to the following number:'}
                  </p>
                  <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '2px', color: paymentMethod === 'instapay' ? 'var(--accent-primary)' : 'var(--accent-red)', marginBottom: '1.5rem', userSelect: 'all' }}>
                    {paymentMethod === 'instapay' ? '01005144500' : '01020906262'}
                  </div>
                  
                  <button 
                    onClick={simulatePayment}
                    disabled={isPaying}
                    className="btn-primary" 
                    style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem' }}
                  >
                    {isPaying ? (
                      <span className="loader" style={{ width: '20px', height: '20px', borderTopColor: '#fff' }}></span>
                    ) : (
                      <CheckCircle size={20} />
                    )}
                    {lang === 'ar' 
                      ? (isPaying ? 'جاري التأكيد...' : 'لقد قمت بالتحويل بنجاح') 
                      : (isPaying ? 'Confirming...' : 'I have transferred successfully')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default InstructorDashboard;
