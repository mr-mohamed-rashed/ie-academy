import React, { useState } from 'react';
import { Users, GraduationCap, Calendar, Clock, PlusCircle, CheckCircle, Share2, QrCode, Trash2, Edit, DollarSign, X as CloseIcon, Camera, Copy, PlayCircle, Maximize2, Minimize2, Radio, Check, Sparkles, Timer, AlertCircle, Play, Eye } from 'lucide-react';
import { calculateGPA, calculateAttendanceRate } from '../mockData';
const StudentAnalyticsModal = React.lazy(() => import('./StudentAnalyticsModal'));
import Podium from './Podium';

const getYoutubeEmbedUrl = (url) => {
  if (!url) return '';
  if (url.includes('youtube.com/embed/')) return url;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?autoplay=1` : url;
};

const getYoutubeThumbnail = (url) => {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg` : '';
};

/**
 * InstructorDashboard component.
 * Serves as the primary panel for subscribed educators, permitting student list management,
 * grades input, session posting, classroom stats, and referral/invite tracking via code and QR.
 */
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
  academicYearFee,
  pendingPayments,
  onSubmitPaymentRequest,
  onPaySubscription
}) => {
  if (!instructor) {
    return (
      <div className="dashboard-container" style={{ padding: '2rem' }}>
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          {lang === 'ar' ? 'الرجاء تسجيل الدخول أو إكمال بيانات الحساب.' : 'Please log in or complete your profile.'}
        </div>
      </div>
    );
  }

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
  const [showInviteQrModal, setShowInviteQrModal] = useState(false);

  // Online Curriculum Session Publishing State
  const [sessionTitleAr, setSessionTitleAr] = useState('');
  const [sessionTitleEn, setSessionTitleEn] = useState('');
  const [sessionDescAr, setSessionDescAr] = useState('');
  const [sessionDescEn, setSessionDescEn] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [formLang, setFormLang] = useState('ar'); // 'ar' | 'en'
  const [playingSessionId, setPlayingSessionId] = useState(null);

  // Live Classroom Attendance (QR Session) State
  const [showLiveSessionModal, setShowLiveSessionModal] = useState(false);
  const [activeLiveSession, setActiveLiveSession] = useState(null);
  const [liveTopicAr, setLiveTopicAr] = useState('');
  const [liveTopicEn, setLiveTopicEn] = useState('');
  const [liveScheduleTime, setLiveScheduleTime] = useState('');
  const [liveDuration, setLiveDuration] = useState('30'); // Duration in minutes (0 = open)
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isFullscreenQr, setIsFullscreenQr] = useState(false);

  // Timer effect for live session
  React.useEffect(() => {
    let interval = null;
    if (activeLiveSession && activeLiveSession.isLive) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeLiveSession]);

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(''); // 'instapay' | 'cash'
  const [hasSkippedPlan, setHasSkippedPlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly'); // 'monthly' | 'yearly'
  const [screenshot, setScreenshot] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Prevent background scrolling when payment modal or live modal is open
  React.useEffect(() => {
    if (showPaymentModal || (showLiveSessionModal && isFullscreenQr)) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showPaymentModal, showLiveSessionModal, isFullscreenQr]);

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
      dashboardSubtitle: "Add new lecture sessions, grade student tasks, and manage live in-center QR attendance.",
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
      sessionTitle: "Publish Lesson / Explanation for Group",
      sTitleAr: "Lesson Title (Arabic)",
      sTitleEn: "Lesson Title (English)",
      sDescAr: "Explanation & Details (Arabic)",
      sDescEn: "Explanation & Details (English)",
      sVideo: "Video Link (YouTube / Vimeo)",
      submitSession: "Publish Lesson Now",
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
      toastSessionSuccess: "Successfully published lesson: ",
      videoPlaceholder: "e.g., https://www.youtube.com/embed/SqcY0GlETPk",
      inviteTitle: "Invite Students to this Group",
      inviteDesc: "Share this link with your students to automatically register them to this class group.",
      copyBtn: "Copy Invitation Link",
      toastCopied: "Signup invitation link copied to clipboard!",
      liveSessionBtn: "Start Class (Live QR)",
      liveSessionActive: "Class in Progress",
      liveModalTitle: "Live Classroom Attendance (QR Code)",
      liveModalDesc: "Launch attendance session for students entering the center. Customize duration and view live scan records.",
      liveTopicLabel: "Class Topic / Title",
      liveScheduleLabel: "Group Schedule Time",
      liveDurationLabel: "Attendance Scan Window",
      dur15: "15 Minutes",
      dur30: "30 Minutes",
      dur45: "45 Minutes",
      dur60: "60 Minutes",
      durOpen: "Open (Until manually closed)",
      startLiveBtn: "Start Class & Generate QR",
      endLiveBtn: "End Class & Close Attendance",
      projectorMode: "Projector Mode (Fullscreen)",
      exitProjector: "Exit Fullscreen",
      sessionIdLabel: "Session ID",
      copySessionId: "Copy ID",
      liveAttendeesCount: "Attended Students",
      livePendingCount: "Not Checked-In",
      liveStatusRunning: "Class in Progress - Scan QR",
      liveEndedToast: "Class attendance finalized for: ",
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
      dashboardSubtitle: "نشر شروحات الدروس، رصد درجات الطلاب، وبدء الحصص المباشرة لتسجيل الحضور بالـ QR في السنتر.",
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
      sessionTitle: "نشر شرح / درس جديد للمجموعة",
      sTitleAr: "عنوان الدرس (بالعربية)",
      sTitleEn: "عنوان الدرس (بالإنجليزية)",
      sDescAr: "شرح وتفاصيل الدرس (بالعربية)",
      sDescEn: "شرح وتفاصيل الدرس (بالإنجليزية)",
      sVideo: "رابط فيديو الشرح (YouTube / Vimeo)",
      submitSession: "نشر الدرس الآن للمجموعة",
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
      toastSessionSuccess: "تم نشر الدرس بنجاح: ",
      videoPlaceholder: "مثال: https://www.youtube.com/embed/SqcY0GlETPk",
      inviteTitle: "دعوة الطلاب للانضمام للمجموعة",
      inviteDesc: "شارك هذا الرابط مع الطلاب ليقوموا بالتسجيل والانضمام تلقائياً لهذه المجموعة الدراسية.",
      copyBtn: "نسخ رابط الدعوة",
      toastCopied: "تم نسخ رابط دعوة التسجيل إلى الحافظة!",
      liveSessionBtn: "بدء الحصة (Live QR)",
      liveSessionActive: "الحصة جارية الآن",
      liveModalTitle: "لوحة حضور الحصة المباشرة (السنتر)",
      liveModalDesc: "بدء الحصة الفعلية في السنتر وتوليد رمز QR للطلاب مع ضبط التوقيت ومدة التسجيل بدقة.",
      liveTopicLabel: "عنوان أو موضوع الحصة",
      liveScheduleLabel: "ميعاد وتوقيت الحصة",
      liveDurationLabel: "مدة استقبال تسجيل الحضور",
      dur15: "15 دقيقة",
      dur30: "30 دقيقة",
      dur45: "45 دقيقة",
      dur60: "60 دقيقة",
      durOpen: "مفتوح (حتى إغلاق الحصة يدوياً)",
      startLiveBtn: "بدء الحصة وتوليد كود الـ QR",
      endLiveBtn: "إنهاء الحصة وإغلاق الحضور",
      projectorMode: "شاشة البروجكتور (ملء الشاشة)",
      exitProjector: "خروج من ملء الشاشة",
      sessionIdLabel: "رقم الحصة",
      copySessionId: "نسخ رقم الحصة",
      liveAttendeesCount: "الطلاب الحاضرين",
      livePendingCount: "لم يسجلوا بعد",
      liveStatusRunning: "الحصة جارية الآن - يرجى مسح الكود",
      liveEndedToast: "تم إنهاء الحصة وتسجيل حضور الطلاب بنجاح لـ ",
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

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartLiveSession = (e) => {
    if (e) e.preventDefault();
    const newSessionId = 1000 + Math.floor(Math.random() * 9000);
    const topicAr = liveTopicAr.trim() || (activeGroup ? `حصة ${activeGroup.nameAr} - ${new Date().toLocaleDateString('ar-EG')}` : 'حصة اليوم');
    const topicEn = liveTopicEn.trim() || topicAr;

    const newSessionData = {
      id: newSessionId,
      instructorId: instructor.id,
      gradeId: activeGradeId,
      groupId: activeGroupId,
      titleAr: topicAr,
      titleEn: topicEn,
      descAr: `حصة تفاعلية مباشرة في السنتر للمجموعة (${activeGroup?.nameAr || ''}) - التوقيت: ${liveScheduleTime || 'مباشر'}`,
      descEn: `In-center live attendance session for (${activeGroup?.nameEn || ''})`,
      date: new Date().toISOString().split('T')[0],
      time: liveScheduleTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isLive: true
    };

    onAddSession(newSessionData);

    setActiveLiveSession({
      id: newSessionId,
      titleAr: topicAr,
      titleEn: topicEn,
      gradeId: activeGradeId,
      groupId: activeGroupId,
      durationMinutes: Number(liveDuration),
      scheduleTime: liveScheduleTime,
      startTime: Date.now(),
      isLive: true
    });
    setElapsedSeconds(0);
    triggerToast(lang === 'ar' ? `تم بدء الحصة وتوليد رمز الحضور (Session #${newSessionId})` : `Class started with QR Code (Session #${newSessionId})`, 'success');
  };

  const handleEndLiveSession = () => {
    if (!activeLiveSession) return;
    const attendedCount = groupStudents.filter(s => 
      s.attendance?.some(a => a.sessionId === activeLiveSession.id && a.status === 'present')
    ).length;

    triggerToast(
      lang === 'ar' 
        ? `تم إنهاء الحصة وإغلاق الحضور. حضر ${attendedCount} من إجمالي ${groupStudents.length} طالب.` 
        : `Class ended. ${attendedCount} of ${groupStudents.length} students attended.`,
      'success'
    );

    setActiveLiveSession(null);
    setIsFullscreenQr(false);
    setShowLiveSessionModal(false);
  };

  // Copy referral invite link
  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}${window.location.pathname}?invite=IE-${instructor.id}`;
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
    const titleAr = sessionTitleAr.trim();
    const titleEn = sessionTitleEn.trim() || titleAr;
    const finalTitleAr = titleAr || titleEn;
    const finalTitleEn = titleEn;

    const descAr = sessionDescAr.trim();
    const descEn = sessionDescEn.trim() || descAr;
    const finalDescAr = descAr || descEn;
    const finalDescEn = descEn;

    if (!finalTitleAr || !finalTitleEn || !videoUrl) return;

    const newSession = {
      instructorId: instructor.id,
      gradeId: activeGradeId, // Sessions attached to grade
      titleAr: finalTitleAr,
      titleEn: finalTitleEn,
      descAr: finalDescAr,
      descEn: finalDescEn,
      videoUrl: videoUrl,
      date: new Date().toISOString().split('T')[0]
    };

    onAddSession(newSession);
    triggerToast(t.toastSessionSuccess + (lang === 'ar' ? finalTitleAr : finalTitleEn), 'success');

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
    if (!screenshot) {
      triggerToast(lang === 'ar' ? 'يرجى إرفاق صورة لقطة شاشة التحويل أولاً!' : 'Please attach a screenshot of the transfer first!', 'error');
      return;
    }

    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setPaymentSuccess(true);
      setHasSkippedPlan(true);
      setShowPaymentModal(false); // Close the modal
      
      if (onSubmitPaymentRequest) {
        onSubmitPaymentRequest({
          instructorId: instructor.id,
          instructorName: lang === 'ar' ? instructor.nameAr : instructor.nameEn,
          plan: selectedPlan,
          amount: selectedPlan === 'monthly' ? systemFee : academicYearFee,
          screenshot: screenshot
        });
      }
      
      setScreenshot(null); // Clear screenshot for next use
      triggerToast(lang === 'ar' ? 'تم إرسال لقطة شاشة التحويل للإدارة بنجاح!' : 'Transfer screenshot submitted to administration successfully!', 'success');
    }, 1000);
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const hasPendingRequest = pendingPayments?.some(r => r.instructorId === instructor.id && r.status === 'pending');

  if (!instructor.isSubscribed && !hasSkippedPlan && !showPaymentModal && !hasPendingRequest) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 1rem', animation: 'slide-up 0.5s ease-out' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', textAlign: 'center' }}>
          {lang === 'ar' ? 'اختر نظام حسابك' : 'Choose Your Account System'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', textAlign: 'center' }}>
          {lang === 'ar' ? 'يمكنك استخدام المنصة مجاناً بصلاحيات محدودة، أو الترقية للنظام المدفوع للظهور للطلاب.' : 'Use the platform for free with limited access, or upgrade to appear to students.'}
        </p>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '1100px', width: '100%' }}>
          
          {/* Free Plan Card */}
          <div className="glass-card" style={{ flex: '1 1 300px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid var(--border-glass)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', textAlign: 'center' }}>
              {lang === 'ar' ? 'النظام المجاني' : 'Free Plan'}
            </h3>
            <div style={{ textAlign: 'center', margin: '1rem 0' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>{lang === 'ar' ? 'مجاناً' : 'Free'}</span>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle size={18} color="var(--accent-green)"/> <span>{lang === 'ar' ? 'إضافة عدد محدود من الفصول والطلاب' : 'Add limited classes and students'}</span></li>
              <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle size={18} color="var(--accent-green)"/> <span>{lang === 'ar' ? 'إدارة درجات الطلاب وحضورهم' : 'Manage student grades and attendance'}</span></li>
              <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', opacity: 0.5 }}><CloseIcon size={18} /> <del>{lang === 'ar' ? 'الظهور للطلاب في المنصة الرئيسية' : 'Appear in student searches'}</del></li>
              <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', opacity: 0.5 }}><CloseIcon size={18} /> <del>{lang === 'ar' ? 'دعم إعلاني وتسويق لحصصك الدراسية' : 'Ads and marketing support'}</del></li>
            </ul>
            <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
              <button onClick={() => setHasSkippedPlan(true)} className="config-btn" style={{ width: '100%', padding: '1rem', justifyContent: 'center' }}>
                {lang === 'ar' ? 'الاستمرار بالنظام المجاني' : 'Continue for Free'}
              </button>
            </div>
          </div>

          {/* Monthly Paid Plan Card */}
          <div className="glass-card" style={{ flex: '1 1 300px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid var(--border-glass)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-primary)', textAlign: 'center' }}>
              {lang === 'ar' ? 'النظام الشهري' : 'Monthly VIP Plan'}
            </h3>
            <div style={{ textAlign: 'center', margin: '1rem 0' }}>
              <strong style={{ fontSize: '2.5rem', color: 'var(--accent-primary)' }}>{systemFee}</strong>
              <span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginInlineStart: '0.5rem' }}>{lang === 'ar' ? 'جنيه / شهر' : 'EGP / mo'}</span>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle size={18} color="var(--accent-primary)"/> <span>{lang === 'ar' ? 'الظهور للطلاب في المنصة الرئيسية' : 'Appear to students on main platform'}</span></li>
              <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle size={18} color="var(--accent-primary)"/> <span>{lang === 'ar' ? 'دعم إعلاني وتسويق لحصصك' : 'Full ad support and marketing'}</span></li>
              <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle size={18} color="var(--accent-primary)"/> <span>{lang === 'ar' ? 'أولوية في لوحات الشرف والتقييمات' : 'Priority in honor boards & ratings'}</span></li>
              <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle size={18} color="var(--accent-primary)"/> <span>{lang === 'ar' ? 'تجديد شهري حسب الحاجة' : 'Renew monthly as needed'}</span></li>
            </ul>
            <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
              <button onClick={() => { setSelectedPlan('monthly'); setShowPaymentModal(true); }} className="btn-primary" style={{ width: '100%', padding: '1rem', justifyContent: 'center' }}>
                {lang === 'ar' ? 'اشترك شهرياً' : 'Subscribe Monthly'}
              </button>
            </div>
          </div>

          {/* Academic Year Paid Plan Card */}
          <div className="glass-card" style={{ flex: '1 1 300px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '2px solid var(--color-gold)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '1rem', right: '-2.5rem', backgroundColor: 'var(--color-gold)', color: '#000', padding: '0.25rem 3rem', transform: 'rotate(45deg)', fontWeight: 800, fontSize: '0.8rem' }}>
              {lang === 'ar' ? 'الأوفر' : 'BEST VALUE'}
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-gold)', textAlign: 'center' }}>
              {lang === 'ar' ? 'النظام السنوي (9 أشهر)' : 'Academic Year VIP'}
            </h3>
            <div style={{ textAlign: 'center', margin: '1rem 0' }}>
              <strong style={{ fontSize: '2.5rem', color: 'var(--color-gold)' }}>{academicYearFee}</strong>
              <span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginInlineStart: '0.5rem' }}>{lang === 'ar' ? 'جنيه / 9 أشهر' : 'EGP / 9 Months'}</span>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-primary)' }}>
              <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle size={18} color="var(--color-gold)"/> <strong>{lang === 'ar' ? 'اشتراك كامل لمدة 9 أشهر دراسية' : 'Full subscription for 9 academic months'}</strong></li>
              <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle size={18} color="var(--color-gold)"/> <strong>{lang === 'ar' ? 'توفير مالي كبير مقارنة بالشهري' : 'Huge savings compared to monthly'}</strong></li>
              <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle size={18} color="var(--color-gold)"/> <strong>{lang === 'ar' ? 'الظهور الدائم للطلاب في صفحات البحث' : 'Continuous appearance in searches'}</strong></li>
              <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><CheckCircle size={18} color="var(--color-gold)"/> <strong>{lang === 'ar' ? 'أولوية في لوحات الشرف والتقييمات' : 'Priority in honor boards & ratings'}</strong></li>
            </ul>
            <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
              <button onClick={() => { setSelectedPlan('yearly'); setShowPaymentModal(true); }} className="btn-primary" style={{ width: '100%', padding: '1rem', justifyContent: 'center', backgroundColor: 'var(--color-gold)', color: '#000', fontWeight: 800 }}>
                {lang === 'ar' ? 'اشترك سنويًا (9 أشهر)' : 'Subscribe Academic Year'}
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-grid" style={{ animation: 'slide-in 0.3s ease-out' }}>
      
      {/* Group selector and Referral Link header */}
      <div className="glass-card" style={{ gridColumn: 'span 12', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
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

          {activeLiveSession ? (
            <button 
              className="btn-primary"
              onClick={() => setShowLiveSessionModal(true)}
              style={{ 
                padding: '0.65rem 1.25rem', 
                display: 'flex', 
                gap: '0.5rem', 
                alignItems: 'center',
                backgroundColor: 'rgba(239, 68, 68, 0.95)',
                boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)',
                border: '1px solid #ef4444',
                color: '#fff',
                fontWeight: 800
              }}
            >
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#fff', display: 'inline-block', boxShadow: '0 0 8px #fff' }}></span>
              <Radio size={16} />
              <span>{lang === 'ar' ? `الحصة جارية الآن (#${activeLiveSession.id})` : `Class Live in Progress (#${activeLiveSession.id})`}</span>
            </button>
          ) : (
            <button 
              className="btn-primary"
              onClick={() => {
                setLiveTopicAr(activeGroup ? `حصة ${activeGroup.nameAr} - ${new Date().toLocaleDateString('ar-EG')}` : 'حصة اليوم');
                setLiveScheduleTime(activeGroup?.time || '4:00 م');
                setShowLiveSessionModal(true);
              }}
              style={{ 
                padding: '0.65rem 1.25rem', 
                display: 'flex', 
                gap: '0.5rem', 
                alignItems: 'center',
                backgroundColor: 'var(--accent-green)',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                color: '#fff',
                fontWeight: 700
              }}
            >
              <QrCode size={18} />
              <span>{t.liveSessionBtn}</span>
            </button>
          )}
        </div>

        {/* Invite Student Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderInlineStart: '2px solid var(--border-glass)', paddingInlineStart: '1.5rem', flexWrap: 'wrap' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
              {lang === 'ar' ? `كود دعوة الطلاب: IE-${instructor.id}` : `Student Invite Code: IE-${instructor.id}`}
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0 0' }}>{t.inviteDesc}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="config-btn" onClick={copyInviteLink} style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)', padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Share2 size={15} />
              <span>{t.copyBtn}</span>
            </button>
            <button className="config-btn" onClick={() => setShowInviteQrModal(true)} style={{ borderColor: 'var(--accent-purple)', color: 'var(--accent-purple)', padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <QrCode size={15} />
              <span>{lang === 'ar' ? 'كود QR' : 'QR Code'}</span>
            </button>
          </div>
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
          <div style={{ gridColumn: 'span 12' }}>
            <Podium students={students} lang={lang} instructorId={instructor.id} gradeId={activeGradeId} groupId={activeGroupId} />
          </div>

          {/* Live Session Quick Banner */}
          <div className="glass-card" style={{ 
            gridColumn: 'span 12', 
            padding: '1.25rem 1.5rem', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: '1rem',
            background: activeLiveSession 
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(99, 102, 241, 0.1))' 
              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(99, 102, 241, 0.08))',
            border: activeLiveSession ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '46px', height: '46px', borderRadius: '12px', 
                backgroundColor: activeLiveSession ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                color: activeLiveSession ? '#ef4444' : 'var(--accent-green)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <QrCode size={24} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {activeLiveSession ? (
                    <>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block', boxShadow: '0 0 8px #ef4444' }}></span>
                      <span>{lang === 'ar' ? `حصة حضور جارية الآن (رقم الحصة: #${activeLiveSession.id})` : `Class Session in Progress (ID: #${activeLiveSession.id})`}</span>
                    </>
                  ) : (
                    <span>{lang === 'ar' ? 'حضور الحصة الفعلية في السنتر (Live QR)' : 'Live In-Center Class Attendance'}</span>
                  )}
                </h4>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {activeLiveSession 
                    ? (lang === 'ar' 
                        ? `جاري استقبال الطلاب للمسح • الوقت المنقضي: ${formatTimer(elapsedSeconds)} • حضر ${groupStudents.filter(s => s.attendance?.some(a => a.sessionId === activeLiveSession.id && a.status === 'present')).length} طالب` 
                        : `Scanning active • Elapsed: ${formatTimer(elapsedSeconds)} • ${groupStudents.filter(s => s.attendance?.some(a => a.sessionId === activeLiveSession.id && a.status === 'present')).length} checked in`)
                    : (lang === 'ar' 
                        ? 'اضغط لبدء الحصة وتوليد كود الـ QR للطلاب على شاشة القاعة عند بدء موعد المجموعة.' 
                        : 'Click to start class and display the QR code on the classroom screen for student check-in.')
                  }
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button 
                onClick={() => {
                  if (!activeLiveSession) {
                    setLiveTopicAr(activeGroup ? `حصة ${activeGroup.nameAr} - ${new Date().toLocaleDateString('ar-EG')}` : 'حصة اليوم');
                    setLiveScheduleTime(activeGroup?.time || '4:00 م');
                  }
                  setShowLiveSessionModal(true);
                }}
                className="btn-primary"
                style={{ 
                  padding: '0.65rem 1.25rem', 
                  backgroundColor: activeLiveSession ? '#ef4444' : 'var(--accent-green)',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  boxShadow: activeLiveSession ? '0 0 15px rgba(239, 68, 68, 0.4)' : '0 4px 14px rgba(16, 185, 129, 0.35)'
                }}
              >
                <QrCode size={18} />
                <span>{activeLiveSession ? (lang === 'ar' ? 'عرض شاشة الحصة والـ QR' : 'View Live QR Screen') : t.liveSessionBtn}</span>
              </button>
            </div>
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
        <div className="desktop-only-table">
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
                    <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      {lang === 'ar' ? 'لا يوجد طلاب مضافين.' : 'No students found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Responsive Cards View */}
        <div className="mobile-only-cards" style={{ display: 'none', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
          {groupStudents.length > 0 ? (
            groupStudents.map(s => {
              const gpaVal = calculateGPA(s.grades, instructor.id);
              const standing = getStandings(gpaVal);
              return (
                <div 
                  key={s.id} 
                  onClick={() => setSelectedStudentForAnalytics(s)}
                  style={{ 
                    padding: '1rem', 
                    borderRadius: '12px', 
                    backgroundColor: 'rgba(255,255,255,0.02)', 
                    border: '1px solid var(--border-glass)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={s.avatar} alt={s.nameEn} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--accent-primary)' }} />
                    <div style={{ textAlign: 'start' }}>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>{lang === 'ar' ? s.nameAr : s.nameEn}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {lang === 'ar' ? 'المعدل: ' : 'GPA: '} {gpaVal}% | {lang === 'ar' ? 'الحضور: ' : 'Att: '} {calculateAttendanceRate(s.attendance, instructor.id)}%
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <span style={{ 
                      color: standing.color, 
                      fontWeight: 700, 
                      backgroundColor: `${standing.color}15`,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '20px',
                      fontSize: '0.7rem',
                      border: `1px solid ${standing.color}20`
                    }}>
                      {standing.text}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(lang === 'ar' ? `هل أنت متأكد من حذف ${s.nameAr} من المجموعة؟` : `Are you sure you want to remove ${s.nameEn} from this group?`)) {
                          onRemoveStudent(s.id, instructor.id, activeGradeId, activeGroupId);
                          triggerToast(lang === 'ar' ? 'تم الحذف بنجاح' : 'Successfully removed', 'success');
                        }
                      }}
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', backgroundColor: 'transparent', border: '1px solid var(--accent-red)', color: 'var(--accent-red)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                    >
                      <Trash2 size={12} />
                      <span>{lang === 'ar' ? 'حذف' : 'Remove'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              {lang === 'ar' ? 'لا يوجد طلاب مضافين.' : 'No students found.'}
            </div>
          )}
        </div>
      </div>
        </>
      )}

      {activeTab === 'curriculum' && (
        <>
      {/* Create Lesson / Explanation Form */}
      <div className="glass-card session-create-card" style={{ gridColumn: 'span 12' }}>
        <div className="card-title-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{t.sessionTitle}</h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {lang === 'ar' ? 'رفع المحاضرات والشروحات والفيديوهات المخصصة لمشاهدتها من قبل طلاب هذه المجموعة.' : 'Upload lecture videos and notes for students of this group to study online.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.25rem', padding: '0.25rem', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            <button 
              type="button"
              onClick={() => setFormLang('ar')} 
              style={{
                padding: '0.35rem 0.85rem',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: formLang === 'ar' ? 'var(--accent-purple)' : 'transparent',
                color: formLang === 'ar' ? 'white' : 'var(--text-secondary)',
                transition: 'all 0.2s'
              }}
            >
              العربية
            </button>
            <button 
              type="button"
              onClick={() => setFormLang('en')} 
              style={{
                padding: '0.35rem 0.85rem',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: formLang === 'en' ? 'var(--accent-purple)' : 'transparent',
                color: formLang === 'en' ? 'white' : 'var(--text-secondary)',
                transition: 'all 0.2s'
              }}
            >
              English
            </button>
          </div>
        </div>
        <form onSubmit={handleSessionSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {formLang === 'ar' ? (
              <>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t.sTitleAr}</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="المحاضرة 6: مدخل إلى..."
                    value={sessionTitleAr}
                    onChange={(e) => setSessionTitleAr(e.target.value)}
                    required={!sessionTitleEn.trim()}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t.sVideo}</label>
                  <input 
                    type="url" 
                    className="form-control" 
                    placeholder={t.videoPlaceholder}
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t.sDescAr}</label>
                  <textarea 
                    rows="3" 
                    className="form-control" 
                    placeholder="اكتب شرحاً مختصراً للمحاضرة هنا..."
                    value={sessionDescAr}
                    onChange={(e) => setSessionDescAr(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t.sTitleEn}</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Session 6: Introduction to..."
                    value={sessionTitleEn}
                    onChange={(e) => setSessionTitleEn(e.target.value)}
                    required={!sessionTitleAr.trim()}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t.sVideo}</label>
                  <input 
                    type="url" 
                    className="form-control" 
                    placeholder={t.videoPlaceholder}
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t.sDescEn}</label>
                  <textarea 
                    rows="3" 
                    className="form-control" 
                    placeholder="Write a brief explanation of the session..."
                    value={sessionDescEn}
                    onChange={(e) => setSessionDescEn(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <button type="submit" className="btn-primary" style={{ backgroundColor: 'var(--accent-purple)', width: '100%', padding: '0.85rem', justifyContent: 'center', marginTop: '1rem', fontWeight: 700 }}>
            <PlusCircle size={18} />
            <span>{t.submitSession}</span>
          </button>
        </form>
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
                {session.videoUrl && (() => {
                  const embedUrl = getYoutubeEmbedUrl(session.videoUrl);
                  
                  if (playingSessionId === session.id) {
                    return (
                      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                        <iframe 
                          src={embedUrl} 
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} 
                          frameBorder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={lang === 'ar' ? session.titleAr : session.titleEn}
                        />
                      </div>
                    );
                  }

                  const thumb = getYoutubeThumbnail(session.videoUrl);
                  return (
                    <div 
                      onClick={() => setPlayingSessionId(session.id)}
                      style={{ 
                        position: 'relative', 
                        paddingBottom: '56.25%', 
                        height: 0, 
                        cursor: 'pointer',
                        background: '#1e293b',
                        backgroundImage: thumb ? `url(${thumb})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.3)'}
                      >
                        <div style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(99, 102, 241, 0.9)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.5)'
                        }}>
                          <PlayCircle size={32} />
                        </div>
                      </div>
                    </div>
                  );
                })()}
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


      {/* Upgrade/Status Banner for Accounts (Moved to the bottom) */}
      {instructor.isSubscribed ? (
        <div style={{ gridColumn: 'span 12', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.05)', marginTop: '1.5rem', width: '100%' }}>
          <CheckCircle size={18} color="var(--accent-green)" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', textAlign: 'start' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-green)', fontWeight: 700 }}>
              {lang === 'ar' 
                ? (instructor.subscriptionPlan === 'monthly' ? 'حسابك مفعل على النظام الشهري المميز VIP' : 'حسابك مفعل على النظام السنوي المميز VIP') 
                : (instructor.subscriptionPlan === 'monthly' ? 'Your account is active on VIP Monthly Premium' : 'Your account is active on VIP Academic Year Premium')
              }
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
              • {lang === 'ar' ? 'يظهر حسابك الآن للطلاب في صفحات البحث الرئيسية للمنصة ويستفيد من الدعم الإعلاني.' : 'Your account is visible to students on search pages with full ad support.'}
            </span>
          </div>
        </div>
      ) : hasPendingRequest ? (
        <div style={{ gridColumn: 'span 12', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '12px', backgroundColor: 'rgba(251, 191, 36, 0.05)', marginTop: '1.5rem', width: '100%', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
            <Clock size={18} color="var(--color-gold)" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', textAlign: 'start' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-gold)', fontWeight: 700 }}>
                {lang === 'ar' ? 'طلب الترقية قيد المراجعة حالياً' : 'Upgrade Request Under Review'}
              </span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                • {lang === 'ar' ? 'يتم مراجعة الطلب من قبل الإدارة لتفعيل حسابك كـ VIP.' : 'The admin is currently reviewing your request to activate VIP status.'}
              </span>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-gold)', fontWeight: 700, border: '1px solid var(--color-gold)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
            {lang === 'ar' ? 'قيد الانتظار' : 'Pending'}
          </span>
        </div>
      ) : (
        <div className="glass-card" style={{ gridColumn: 'span 12', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', border: '1px solid var(--accent-gold)', backgroundColor: 'rgba(251, 191, 36, 0.05)', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(251, 191, 36, 0.15)', color: 'var(--color-gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={22} />
              </div>
              <div style={{ textAlign: 'start' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--color-gold)', fontWeight: 700 }}>
                  {lang === 'ar' ? 'أنت الآن على النظام المجاني (صلاحيات محدودة)' : 'You are on the Free Plan (Limited Access)'}
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.15rem' }}>
                  {lang === 'ar' ? 'قم بالترقية للنظام المدفوع للظهور على المنصة الرئيسية للطلاب والاستفادة من ميزات إضافية.' : 'Upgrade to the paid plan to appear on the main platform to students and unlock premium features.'}
                </p>
              </div>
            </div>
            <button onClick={() => setShowPaymentModal(true)} className="btn-primary" style={{ padding: '0.6rem 1.2rem', backgroundColor: 'var(--color-gold)', color: '#000', fontWeight: 800, fontSize: '0.85rem' }}>
              {lang === 'ar' ? 'ترقية الحساب الآن' : 'Upgrade Account Now'}
            </button>
          </div>
        </div>
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
        <React.Suspense fallback={
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <span className="loader" style={{ width: '28px', height: '28px', borderTopColor: 'var(--accent-primary)' }}></span>
          </div>
        }>
          <StudentAnalyticsModal
            student={selectedStudentForAnalytics}
            instructorId={instructor.id}
            lang={lang}
            onClose={() => setSelectedStudentForAnalytics(null)}
          />
        </React.Suspense>
      )}

    {/* Payment/Upgrade Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
          padding: '1rem'
        }}>
          <div id="payment-modal-scroll-container" className="glass-card" style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--border-glass)' }}>
              <h2 style={{ margin: 0 }}>{lang === 'ar' ? 'الترقية للنظام المدفوع' : 'Upgrade to Premium'}</h2>
              <button onClick={() => { setShowPaymentModal(false); setPaymentSuccess(false); setScreenshot(null); }} className="close-btn" style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><CloseIcon size={24} /></button>
            </div>
            
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {paymentSuccess ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle size={48} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                      {lang === 'ar' ? 'تم إرسال الطلب بنجاح!' : 'Request Sent Successfully!'}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                      {lang === 'ar' ? 'لقد تم إرفاق صورة التحويل وإرسال طلب الترقية بنجاح. حسابك الآن قيد المراجعة وسيتم تفعيله كـ VIP فور مراجعة التحويل والتحقق من قبل الإدارة.' : 'The transfer screenshot has been attached and your upgrade request has been sent successfully. Your account is now under review and will be activated as VIP shortly after validation.'}
                    </p>
                  </div>
                  <button 
                    onClick={() => { setShowPaymentModal(false); setPaymentSuccess(false); setScreenshot(null); }} 
                    className="btn-primary" 
                    style={{ width: '100%', padding: '1rem', justifyContent: 'center', fontWeight: 800 }}
                  >
                    {lang === 'ar' ? 'الدخول إلى لوحة التحكم' : 'Go to Dashboard'}
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: 'var(--color-gold)' }}>{lang === 'ar' ? 'مميزات النظام المدفوع:' : 'Premium Features:'}</h4>
                    <ul style={{ margin: 0, paddingInlineStart: '1.5rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                      <li>{lang === 'ar' ? 'الظهور للطلاب في المنصة الرئيسية في صفحة بحث المدرسين.' : 'Appear to students on the main platform search.'}</li>
                      <li>{lang === 'ar' ? 'دعم كامل لإعلانات المنصة وتسويق حصصك الدراسية.' : 'Full support for platform ads and marketing your sessions.'}</li>
                      <li>{lang === 'ar' ? 'الحصول على أولوية في الظهور في لوحات الشرف والتقييمات.' : 'Priority appearance on honor boards and ratings.'}</li>
                      <li>{lang === 'ar' ? 'لا حدود على عدد الفصول أو الطلاب المضافين.' : 'No limits on the number of classes or students added.'}</li>
                    </ul>
                  </div>

                  {/* Package Toggle */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem' }}>{lang === 'ar' ? 'اختر باقة الاشتراك:' : 'Select Subscription Package:'}</h4>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button 
                        onClick={() => { 
                          setSelectedPlan('monthly'); 
                          setPaymentMethod(''); 
                          setTimeout(() => {
                            const c = document.getElementById('payment-modal-scroll-container');
                            if (c) c.scrollTo({ top: c.scrollHeight, behavior: 'smooth' });
                          }, 80);
                        }}
                        className="role-tab"
                        style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)', backgroundColor: selectedPlan === 'monthly' ? 'var(--accent-primary)' : 'transparent', color: selectedPlan === 'monthly' ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}
                      >
                        {lang === 'ar' ? 'باقة شهرية' : 'Monthly'} ({systemFee} {lang === 'ar' ? 'جنيه' : 'EGP'})
                      </button>
                      <button 
                        onClick={() => { 
                          setSelectedPlan('yearly'); 
                          setPaymentMethod(''); 
                          setTimeout(() => {
                            const c = document.getElementById('payment-modal-scroll-container');
                            if (c) c.scrollTo({ top: c.scrollHeight, behavior: 'smooth' });
                          }, 80);
                        }}
                        className="role-tab"
                        style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)', backgroundColor: selectedPlan === 'yearly' ? 'var(--color-gold)' : 'transparent', color: selectedPlan === 'yearly' ? '#000' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}
                      >
                        {lang === 'ar' ? 'باقة سنوية (9 أشهر)' : 'Academic Year'} ({academicYearFee} {lang === 'ar' ? 'جنيه' : 'EGP'})
                      </button>
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', padding: '1rem', border: '1px solid var(--border-glass)', borderRadius: '12px' }}>
                    <span style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      {lang === 'ar' ? (selectedPlan === 'monthly' ? 'قيمة الاشتراك الشهري' : 'قيمة الاشتراك السنوي (9 أشهر)') : (selectedPlan === 'monthly' ? 'Monthly Subscription Fee' : 'Academic Year Subscription Fee')}
                    </span>
                    <strong style={{ fontSize: '2.5rem', color: 'var(--accent-primary)' }}>
                      {selectedPlan === 'monthly' ? systemFee : academicYearFee}
                    </strong>
                    <span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginInlineStart: '0.5rem' }}>{lang === 'ar' ? 'جنيه' : 'EGP'}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem' }}>{lang === 'ar' ? 'اختر طريقة الدفع:' : 'Select Payment Method:'}</h4>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button 
                        onClick={() => {
                          setPaymentMethod('instapay');
                          setTimeout(() => {
                            const c = document.getElementById('payment-modal-scroll-container');
                            if (c) c.scrollTo({ top: c.scrollHeight, behavior: 'smooth' });
                          }, 80);
                        }}
                        className="glass-card"
                        style={{ flex: 1, padding: '1rem', border: paymentMethod === 'instapay' ? '2px solid var(--accent-primary)' : '1px solid var(--border-glass)', cursor: 'pointer', textAlign: 'center' }}
                      >
                        <strong style={{ display: 'block', marginBottom: '0.25rem', color: paymentMethod === 'instapay' ? 'var(--accent-primary)' : 'inherit' }}>{lang === 'ar' ? 'انستاباي (InstaPay)' : 'InstaPay'}</strong>
                      </button>
                      <button 
                        onClick={() => {
                          setPaymentMethod('cash');
                          setTimeout(() => {
                            const c = document.getElementById('payment-modal-scroll-container');
                            if (c) c.scrollTo({ top: c.scrollHeight, behavior: 'smooth' });
                          }, 80);
                        }}
                        className="glass-card"
                        style={{ flex: 1, padding: '1rem', border: paymentMethod === 'cash' ? '2px solid var(--accent-red)' : '1px solid var(--border-glass)', cursor: 'pointer', textAlign: 'center' }}
                      >
                        <strong style={{ display: 'block', marginBottom: '0.25rem', color: paymentMethod === 'cash' ? 'var(--accent-red)' : 'inherit' }}>{lang === 'ar' ? 'فودافون كاش' : 'Vodafone Cash'}</strong>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {paymentMethod && (
                <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid var(--border-glass)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                    {lang === 'ar' ? 'يرجى تحويل مبلغ الاشتراك إلى الرقم التالي:' : 'Please transfer the subscription amount to the following number:'}
                  </p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', margin: '0.5rem 0' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '2px', color: paymentMethod === 'instapay' ? 'var(--accent-primary)' : 'var(--accent-red)', userSelect: 'all' }}>
                      {paymentMethod === 'instapay' ? '01005144500' : '01020906262'}
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        const num = paymentMethod === 'instapay' ? '01005144500' : '01020906262';
                        navigator.clipboard.writeText(num);
                        alert(lang === 'ar' ? 'تم نسخ الرقم بنجاح!' : 'Number copied successfully!');
                      }}
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid var(--border-glass)',
                        borderRadius: '8px',
                        padding: '0.5rem',
                        cursor: 'pointer',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.2s'
                      }}
                      title={lang === 'ar' ? 'نسخ الرقم' : 'Copy Number'}
                    >
                      <Copy size={18} />
                    </button>
                  </div>

                  {/* Screenshot Uploader */}
                  <div style={{ textAlign: 'start' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                      {lang === 'ar' ? 'ارفاق صورة التحويل (لقطة الشاشة):' : 'Attach Transfer Screenshot:'}
                    </label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleScreenshotChange}
                      style={{ display: 'none' }}
                      id="payment-screenshot-input"
                    />
                    <label htmlFor="payment-screenshot-input" className="config-btn" style={{ justifyContent: 'center', padding: '0.75rem', cursor: 'pointer', borderStyle: 'dashed', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <Camera size={16} />
                      <span>{lang === 'ar' ? 'اختر صورة التحويل' : 'Choose screenshot'}</span>
                    </label>
                    {screenshot && (
                      <div style={{ marginTop: '0.75rem', position: 'relative', display: 'inline-block' }}>
                        <img src={screenshot} alt="Screenshot Preview" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px', border: '1px solid var(--border-glass)' }} />
                        <button onClick={() => setScreenshot(null)} style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(239, 68, 68, 0.9)', border: 'none', color: 'white', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CloseIcon size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={simulatePayment}
                    disabled={isPaying}
                    className="btn-primary" 
                    style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', backgroundColor: paymentMethod === 'instapay' ? 'var(--accent-primary)' : 'var(--accent-red)' }}
                  >
                    {isPaying ? (
                      <span className="loader" style={{ width: '20px', height: '20px', borderTopColor: '#fff' }}></span>
                    ) : (
                      <CheckCircle size={20} />
                    )}
                    {lang === 'ar' 
                      ? (isPaying ? 'جاري التحقق...' : 'إرسال تأكيد التحويل عبر واتساب') 
                      : (isPaying ? 'Confirming...' : 'Send confirmation via WhatsApp')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showInviteQrModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
          padding: '1rem'
        }}>
          <div className="glass-card" style={{ maxWidth: '400px', width: '100%', padding: '2rem', textAlign: 'center', position: 'relative' }}>
            <button onClick={() => setShowInviteQrModal(false)} className="close-btn" style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><CloseIcon size={24} /></button>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              {lang === 'ar' ? 'رمز دعوة الطلاب الـ QR' : 'Student Invite QR Code'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              {lang === 'ar' ? 'دع طلابك يمسحون هذا الكود للانتقال الفوري إلى صفحة التسجيل الخاصة بك.' : 'Let students scan this QR code to join your classroom immediately.'}
            </p>
            <div style={{ display: 'inline-block', padding: '1rem', backgroundColor: '#fff', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}${window.location.pathname}?invite=IE-${instructor.id}`)}`} 
                alt="Invite QR Code" 
                style={{ display: 'block', width: '200px', height: '200px' }} 
              />
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--accent-primary)', padding: '0.5rem 1rem', border: '1px dashed var(--accent-primary)', borderRadius: '8px', display: 'inline-block' }}>
              {lang === 'ar' ? `كود الدعوة: IE-${instructor.id}` : `Invite Code: IE-${instructor.id}`}
            </div>
          </div>
        </div>
      )}

      {/* Live Classroom Attendance Modal */}
      {showLiveSessionModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: isFullscreenQr ? '#090d16' : 'rgba(0, 0, 0, 0.85)', 
          backdropFilter: isFullscreenQr ? 'none' : 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000,
          padding: isFullscreenQr ? 0 : '1rem',
          transition: 'all 0.3s ease'
        }}>
          <div className="glass-card" style={{ 
            maxWidth: isFullscreenQr ? '100vw' : '720px', 
            width: isFullscreenQr ? '100vw' : '100%', 
            height: isFullscreenQr ? '100vh' : 'auto',
            maxHeight: isFullscreenQr ? '100vh' : '90vh',
            overflowY: 'auto',
            padding: isFullscreenQr ? '3rem 2rem' : '2rem', 
            borderRadius: isFullscreenQr ? 0 : '16px',
            border: isFullscreenQr ? 'none' : '1px solid var(--border-glass)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: isFullscreenQr ? 'center' : 'flex-start',
            direction: lang === 'ar' ? 'rtl' : 'ltr',
            textAlign: 'start'
          }}>
            
            {/* Top Bar Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ 
                  width: '42px', height: '42px', borderRadius: '10px', 
                  backgroundColor: activeLiveSession ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  color: activeLiveSession ? '#ef4444' : 'var(--accent-green)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <QrCode size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {t.liveModalTitle}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {activeGrade?.nameAr || ''} • {activeGroup?.nameAr || ''}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {activeLiveSession && (
                  <button 
                    onClick={() => setIsFullscreenQr(!isFullscreenQr)} 
                    className="config-btn"
                    style={{ padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
                    title={isFullscreenQr ? t.exitProjector : t.projectorMode}
                  >
                    {isFullscreenQr ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    <span>{isFullscreenQr ? t.exitProjector : t.projectorMode}</span>
                  </button>
                )}
                <button 
                  onClick={() => {
                    setIsFullscreenQr(false);
                    setShowLiveSessionModal(false);
                  }} 
                  className="close-btn" 
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.4rem' }}
                >
                  <CloseIcon size={22} />
                </button>
              </div>
            </div>

            {/* Content: Setup Mode vs Live Mode */}
            {!activeLiveSession ? (
              <form onSubmit={handleStartLiveSession} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {t.liveModalDesc}
                </p>

                <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
                      {t.liveTopicLabel}
                    </label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder={activeGroup ? `حصة ${activeGroup.nameAr} - ${new Date().toLocaleDateString('ar-EG')}` : 'حصة اليوم'}
                      value={liveTopicAr}
                      onChange={(e) => setLiveTopicAr(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
                        {t.liveScheduleLabel}
                      </label>
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="مثال: 4:00 مساءً"
                        value={liveScheduleTime}
                        onChange={(e) => setLiveScheduleTime(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
                        {t.liveDurationLabel}
                      </label>
                      <select 
                        className="form-control"
                        value={liveDuration}
                        onChange={(e) => setLiveDuration(e.target.value)}
                      >
                        <option value="15">{t.dur15}</option>
                        <option value="30">{t.dur30}</option>
                        <option value="45">{t.dur45}</option>
                        <option value="60">{t.dur60}</option>
                        <option value="0">{t.durOpen}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowLiveSessionModal(false)}
                    className="config-btn"
                    style={{ flex: 1, padding: '0.85rem', justifyContent: 'center' }}
                  >
                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                    style={{ 
                      flex: 2, 
                      padding: '0.85rem', 
                      backgroundColor: 'var(--accent-green)', 
                      justifyContent: 'center', 
                      fontWeight: 800,
                      fontSize: '1.05rem',
                      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                    }}
                  >
                    <PlayCircle size={20} />
                    <span>{t.startLiveBtn}</span>
                  </button>
                </div>
              </form>
            ) : (
              // Live Mode Display
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                
                {/* Live Status and Timer Header */}
                <div style={{ 
                  width: '100%', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  flexWrap: 'wrap', 
                  gap: '1rem',
                  padding: '0.85rem 1.25rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ 
                      width: '12px', height: '12px', borderRadius: '50%', 
                      backgroundColor: '#ef4444', 
                      display: 'inline-block',
                      boxShadow: '0 0 10px #ef4444' 
                    }}></span>
                    <span style={{ fontWeight: 800, color: '#ef4444', fontSize: '0.95rem' }}>
                      {t.liveStatusRunning}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                      <Timer size={16} color="var(--color-gold)" />
                      <span>{lang === 'ar' ? 'الوقت المنقضي:' : 'Elapsed:'}</span>
                      <strong style={{ color: 'var(--color-gold)', fontSize: '1.1rem', fontFamily: 'monospace' }}>
                        {formatTimer(elapsedSeconds)}
                      </strong>
                    </div>

                    {activeLiveSession.durationMinutes > 0 && (
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        ({lang === 'ar' ? 'المدة المحددة:' : 'Window:'} {activeLiveSession.durationMinutes} {lang === 'ar' ? 'دقيقة' : 'min'})
                      </div>
                    )}
                  </div>
                </div>

                {/* Main QR Display Box */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  padding: isFullscreenQr ? '2.5rem 3rem' : '1.75rem 2rem', 
                  backgroundColor: '#ffffff', 
                  borderRadius: '16px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                  border: '3px solid var(--accent-primary)',
                  position: 'relative',
                  overflow: 'hidden',
                  maxWidth: isFullscreenQr ? '450px' : '360px',
                  width: '100%'
                }}>
                  {/* Pulsing Scan Beam */}
                  <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '4px',
                    background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.9), transparent)',
                    top: '0',
                    left: '0',
                    animation: 'scan 2.5s linear infinite',
                    boxShadow: '0 0 12px rgba(99, 102, 241, 0.9)'
                  }}></div>

                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(String(activeLiveSession.id))}`}
                    alt="Live Attendance QR"
                    style={{ 
                      width: isFullscreenQr ? '280px' : '220px', 
                      height: isFullscreenQr ? '280px' : '220px', 
                      objectFit: 'contain',
                      display: 'block' 
                    }}
                  />

                  {/* Big Session ID Badge with Copy */}
                  <div style={{ 
                    marginTop: '1.25rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    backgroundColor: '#0f172a', 
                    padding: '0.65rem 1.25rem', 
                    borderRadius: '10px',
                    width: '100%',
                    justifyContent: 'center'
                  }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>
                      {t.sessionIdLabel}:
                    </span>
                    <span style={{ color: '#38bdf8', fontSize: '1.5rem', fontWeight: 900, letterSpacing: '2px' }}>
                      #{activeLiveSession.id}
                    </span>
                    <button 
                      type="button" 
                      onClick={() => {
                        navigator.clipboard.writeText(String(activeLiveSession.id));
                        triggerToast(lang === 'ar' ? 'تم نسخ كود الحصة!' : 'Session ID copied!', 'success');
                      }}
                      style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem', display: 'flex', alignItems: 'center' }}
                      title={t.copySessionId}
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>

                {/* Live Real-time Attendance Stats */}
                {(() => {
                  const attendees = groupStudents.filter(s => 
                    s.attendance?.some(a => a.sessionId === activeLiveSession.id && a.status === 'present')
                  );
                  const attendeeCount = attendees.length;
                  const totalCount = groupStudents.length;
                  const percent = totalCount > 0 ? Math.round((attendeeCount / totalCount) * 100) : 0;

                  return (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem', fontWeight: 700 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Users size={18} color="var(--accent-primary)" />
                          <span>{t.liveAttendeesCount}: <strong style={{ color: 'var(--accent-green)' }}>{attendeeCount}</strong> / {totalCount}</span>
                        </span>
                        <span style={{ color: 'var(--accent-primary)' }}>{percent}%</span>
                      </div>

                      {/* Progress Bar */}
                      <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${percent}%`, 
                          height: '100%', 
                          backgroundColor: 'var(--accent-green)', 
                          transition: 'width 0.4s ease',
                          boxShadow: '0 0 8px var(--accent-green)'
                        }}></div>
                      </div>

                      {/* Attendee Live Pills */}
                      <div style={{ 
                        display: 'flex', 
                        gap: '0.5rem', 
                        flexWrap: 'wrap', 
                        maxHeight: '120px', 
                        overflowY: 'auto', 
                        padding: '0.5rem 0' 
                      }}>
                        {attendees.length > 0 ? (
                          attendees.map(s => (
                            <div key={s.id} style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.4rem', 
                              padding: '0.35rem 0.75rem', 
                              borderRadius: '20px', 
                              backgroundColor: 'rgba(16, 185, 129, 0.15)', 
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              fontSize: '0.8rem',
                              color: 'var(--text-primary)',
                              animation: 'slide-in 0.2s ease-out'
                            }}>
                              <CheckCircle size={14} color="var(--accent-green)" />
                              <span>{lang === 'ar' ? s.nameAr : s.nameEn}</span>
                            </div>
                          ))
                        ) : (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            {lang === 'ar' ? 'في انتظار تسجيل الطلاب للحضور...' : 'Waiting for students to scan and check in...'}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Footer Controls */}
                <div style={{ width: '100%', display: 'flex', gap: '1rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem', flexWrap: 'wrap' }}>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsFullscreenQr(false);
                      setShowLiveSessionModal(false);
                    }}
                    className="config-btn"
                    style={{ flex: 1, padding: '0.75rem', justifyContent: 'center' }}
                  >
                    {lang === 'ar' ? 'تصغير وإبقاء الحصة جارية' : 'Minimize (Keep Running)'}
                  </button>

                  <button 
                    type="button"
                    onClick={handleEndLiveSession}
                    className="btn-primary"
                    style={{ 
                      flex: 1.5, 
                      padding: '0.75rem', 
                      backgroundColor: '#ef4444', 
                      justifyContent: 'center',
                      fontWeight: 800,
                      boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)'
                    }}
                  >
                    <CloseIcon size={18} />
                    <span>{t.endLiveBtn}</span>
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default InstructorDashboard;
