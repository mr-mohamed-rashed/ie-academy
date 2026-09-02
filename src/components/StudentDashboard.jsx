import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, PlayCircle, CheckCircle, XCircle, Award, Video, ArrowLeft, 
  BookOpen, QrCode, ShieldAlert, Camera, CameraOff, RefreshCw, Zap, 
  CheckCircle2, Sparkles, X as CloseIcon, Keyboard, Volume2 
} from 'lucide-react';
import jsQR from 'jsqr';
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

const playSuccessChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    // Play two-tone celebratory chime (E5 -> A5 -> E6)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now); // E5
    osc1.frequency.setValueAtTime(880.00, now + 0.1); // A5
    osc1.frequency.setValueAtTime(1318.51, now + 0.22); // E6
    
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    osc1.start(now);
    osc1.stop(now + 0.65);
  } catch (e) {
    console.warn("Audio chime error:", e);
  }
};

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
  if (!student) {
    return (
      <div className="dashboard-container" style={{ padding: '2rem' }}>
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          {lang === 'ar' ? 'الرجاء تسجيل الدخول أو إكمال بيانات الحساب.' : 'Please log in or complete your profile.'}
        </div>
      </div>
    );
  }

  const [activeSession, setActiveSession] = useState(null);
  
  // Camera & QR Scanner States
  const [showScanner, setShowScanner] = useState(false);
  const [scannerTab, setScannerTab] = useState('camera'); // 'camera' | 'manual'
  const [qrInputCode, setQrInputCode] = useState('');
  const [cameraFacing, setCameraFacing] = useState('environment'); // 'environment' | 'user'
  const [cameraError, setCameraError] = useState('');
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [scanSuccessData, setScanSuccessData] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);

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
      qrScannerTitle: "Live Classroom Attendance Scanner",
      qrScannerDesc: "Point your device camera at the live QR code on the classroom screen to record your attendance and earn points.",
      qrTabCamera: "Live Camera Scanner",
      qrTabManual: "Manual Code Entry",
      qrCameraStarting: "Initializing camera...",
      qrCameraHint: "Align the QR code within the target box",
      qrInputLabel: "Enter Session ID (Number on teacher's screen)",
      qrSubmit: "Verify & Record Attendance",
      qrOpenBtn: "Scan Live Class QR",
      qrSuccessToast: "Attendance recorded successfully for session #",
      qrErrorToast: "Invalid Session ID or session is not active for this class!",
      qrSuccessHeading: "Attendance Confirmed!",
      qrSuccessPoints: "+10 Attendance Points Awarded",
      gradesSummaryTitle: "Class Assignments & Quizzes",
      switchCamera: "Flip Camera",
      toggleTorch: "Flashlight"
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
      qrScannerTitle: "مسح كود حضور الحصة بالكاميرا",
      qrScannerDesc: "وجّه كاميرا هاتفك نحو رمز الـ QR المعروض على شاشة القاعة لتسجيل حضورك الفعلي واكتساب درجات الحضور.",
      qrTabCamera: "كاميرا المسح المباشر",
      qrTabManual: "كتابة رقم الحصة يدوياً",
      qrCameraStarting: "جاري تشغيل الكاميرا...",
      qrCameraHint: "ضع كود الـ QR داخل الإطار الأخضر",
      qrInputLabel: "أدخل رقم الحصة الظاهر على شاشة المدرس (Session ID)",
      qrSubmit: "تأكيد وتسجيل الحضور فوراً",
      qrOpenBtn: "تسجيل حضور الحصة بالكاميرا",
      qrSuccessToast: "تم تسجيل حضورك بنجاح في الحصة رقم #",
      qrErrorToast: "رقم الحصة غير صحيح أو غير متاح لمجموعتك حالياً!",
      qrSuccessHeading: "تم رصد حضورك بنجاح! 🎉",
      qrSuccessPoints: "+10 درجات حضور تمت إضافتها لسجلك",
      gradesSummaryTitle: "قائمة درجات الاختبارات والواجبات",
      switchCamera: "تبديل الكاميرا",
      toggleTorch: "الكشاف"
    }
  }[lang];

  const getEnrollment = (teacherId) => {
    return student.enrollments.find(e => e.instructorId === teacherId);
  };

  // --- TEACHER COURSE PAGE VIEW ---
  const currentTeacher = instructors.find(i => i.id === activeTeacherId) || instructors[0];
  const enrollment = getEnrollment(activeTeacherId) || student.enrollments?.[0];
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
    session.instructorId === activeTeacherId && 
    (!session.groupId || session.groupId === activeGroupId)
  );

  // Filter student grades and attendance specific to this teacher
  const studentGrades = student.grades?.filter(g => g.instructorId === activeTeacherId) || [];
  const studentAttendance = student.attendance?.filter(a => a.instructorId === activeTeacherId) || [];

  const attendanceRate = calculateAttendanceRate(student.attendance || [], activeTeacherId);
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

  // --- CAMERA CONTROLS & LIFECYCLE ---
  const stopCameraStream = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try { track.stop(); } catch (e) { /* ignore */ }
      });
      streamRef.current = null;
    }
    setTorchOn(false);
    setIsCameraStarting(false);
  };

  const startCameraStream = async () => {
    stopCameraStream();
    setCameraError('');
    setIsCameraStarting(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(lang === 'ar' ? 'متصفحك لا يدعم فتح الكاميرا المباشرة. يرجى استخدام الإدخال اليدوي.' : 'Camera API not supported in this browser. Please use manual code entry.');
        setIsCameraStarting(false);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;

      // Check for torch capability
      const track = stream.getVideoTracks()[0];
      if (track && track.getCapabilities && track.getCapabilities().torch) {
        setHasTorch(true);
      } else {
        setHasTorch(false);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsCameraStarting(false);
        animFrameRef.current = requestAnimationFrame(scanVideoFrame);
      }
    } catch (err) {
      console.warn("Camera stream error:", err);
      let msg = lang === 'ar' ? 'تعذر فتح الكاميرا. يرجى التأكد من السماح بإذن الكاميرا للمتصفح.' : 'Unable to access camera. Please allow camera permissions.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = lang === 'ar' ? 'تم رفض إذن الكاميرا. يرجى منح الإذن للموقع من إعدادات المتصفح ثم المحاولة مرة أخرى.' : 'Camera permission denied. Please allow camera access in browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = lang === 'ar' ? 'لم يتم العثور على كاميرا في هذا الجهاز.' : 'No camera hardware found on this device.';
      }
      setCameraError(msg);
      setIsCameraStarting(false);
    }
  };

  const toggleTorchLight = async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track && track.getCapabilities && track.getCapabilities().torch) {
        try {
          const nextTorch = !torchOn;
          await track.applyConstraints({ advanced: [{ torch: nextTorch }] });
          setTorchOn(nextTorch);
        } catch (err) {
          console.warn("Toggle torch error:", err);
        }
      }
    }
  };

  const scanVideoFrame = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert"
        });

        if (code && code.data) {
          const raw = String(code.data).trim();
          const matchNum = raw.match(/\d+/);
          const parsedSessionId = matchNum ? Number(matchNum[0]) : Number(raw);

          if (parsedSessionId) {
            handleAttendanceConfirmation(parsedSessionId);
            return; // Stop scan loop on success
          }
        }
      }
    }

    if (streamRef.current) {
      animFrameRef.current = requestAnimationFrame(scanVideoFrame);
    }
  };

  // Start or stop camera based on modal visibility and tab
  useEffect(() => {
    if (showScanner && scannerTab === 'camera' && !scanSuccessData) {
      startCameraStream();
    } else {
      stopCameraStream();
    }
    return () => {
      stopCameraStream();
    };
  }, [showScanner, scannerTab, cameraFacing, scanSuccessData]);

  // Execute Attendance Confirmation & Audio/Haptic rewards
  const handleAttendanceConfirmation = (sessionId) => {
    stopCameraStream();

    // Trigger success audio chime
    playSuccessChime();

    // Trigger haptic vibration on mobile
    if (navigator.vibrate) {
      try { navigator.vibrate([80, 40, 120]); } catch (e) { /* ignore */ }
    }

    const success = onScanQR(student.id, activeTeacherId, sessionId);

    if (success) {
      setScanSuccessData(sessionId);
      triggerToast(t.qrSuccessToast + sessionId + ' (+10 درجات حضور)', 'success');
      setTimeout(() => {
        setShowScanner(false);
        setScanSuccessData(null);
        setQrInputCode('');
      }, 3000);
    } else {
      triggerToast(t.qrErrorToast, 'error');
      setShowScanner(false);
      setScanSuccessData(null);
    }
  };

  // Manual QR submit
  const handleQrManualSubmit = (e) => {
    e.preventDefault();
    const sessionId = Number(qrInputCode);
    if (!sessionId) return;
    handleAttendanceConfirmation(sessionId);
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

        {/* Live Camera QR Code Scan Trigger Button */}
        <button 
          className="btn-primary" 
          onClick={() => {
            setScannerTab('camera');
            setScanSuccessData(null);
            setCameraError('');
            setShowScanner(true);
          }}
          style={{ 
            width: 'auto', 
            backgroundColor: 'var(--accent-green)', 
            padding: '0.65rem 1.3rem', 
            fontWeight: 800,
            fontSize: '0.95rem',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Camera size={20} />
          <span>{t.qrOpenBtn}</span>
        </button>
      </div>

      {/* Modern Live Camera QR Scanner Modal overlay */}
      {showScanner && (
        <div style={{ 
          position: 'fixed', 
          top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.88)', 
          zIndex: 7000, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backdropFilter: 'blur(12px)',
          padding: '1rem'
        }}>
          <div className="glass-card" style={{ 
            width: '100%', 
            maxWidth: '480px', 
            padding: '1.75rem', 
            animation: 'slide-in 0.3s ease-out',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            position: 'relative'
          }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ 
                  width: '40px', height: '40px', borderRadius: '12px', 
                  backgroundColor: 'rgba(16,185,129,0.18)', color: 'var(--accent-green)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                  <Camera size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>{t.qrScannerTitle}</h3>
                  <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.qrScannerDesc}</p>
                </div>
              </div>

              <button 
                onClick={() => {
                  stopCameraStream();
                  setShowScanner(false);
                  setScanSuccessData(null);
                  setQrInputCode('');
                }}
                className="config-btn"
                style={{ borderRadius: '50%', width: '36px', height: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <CloseIcon size={18} />
              </button>
            </div>

            {/* Success Celebration Screen */}
            {scanSuccessData ? (
              <div style={{ 
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', 
                padding: '2.5rem 1rem', gap: '1.25rem', animation: 'slide-in 0.4s ease-out' 
              }}>
                <div style={{ 
                  width: '90px', height: '90px', borderRadius: '50%', 
                  backgroundColor: 'rgba(16, 185, 129, 0.2)', 
                  border: '3px solid var(--accent-green)',
                  color: 'var(--accent-green)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 30px rgba(16, 185, 129, 0.5)'
                }}>
                  <CheckCircle2 size={54} />
                </div>

                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent-green)', margin: 0 }}>
                    {t.qrSuccessHeading}
                  </h3>
                  <p style={{ fontSize: '1rem', color: 'var(--text-primary)', marginTop: '0.5rem', fontWeight: 700 }}>
                    {lang === 'ar' ? `تم تسجيل حضورك في الحصة #${scanSuccessData}` : `Recorded Attendance for Session #${scanSuccessData}`}
                  </p>
                </div>

                <div style={{ 
                  backgroundColor: 'rgba(234, 179, 8, 0.15)', 
                  border: '1px solid rgba(234, 179, 8, 0.4)',
                  color: 'var(--color-gold)',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 800,
                  fontSize: '0.95rem'
                }}>
                  <Sparkles size={18} />
                  <span>{t.qrSuccessPoints}</span>
                </div>
              </div>
            ) : (
              <>
                {/* Tabs Switcher: Live Camera vs Manual Input */}
                <div style={{ 
                  display: 'flex', 
                  backgroundColor: 'rgba(255,255,255,0.05)', 
                  borderRadius: '10px', 
                  padding: '0.3rem', 
                  marginBottom: '1.25rem' 
                }}>
                  <button
                    onClick={() => {
                      setScannerTab('camera');
                      setCameraError('');
                    }}
                    style={{
                      flex: 1,
                      padding: '0.6rem',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: scannerTab === 'camera' ? 'var(--accent-green)' : 'transparent',
                      color: scannerTab === 'camera' ? '#fff' : 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Camera size={16} />
                    <span>{t.qrTabCamera}</span>
                  </button>

                  <button
                    onClick={() => {
                      stopCameraStream();
                      setScannerTab('manual');
                    }}
                    style={{
                      flex: 1,
                      padding: '0.6rem',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: scannerTab === 'manual' ? 'var(--accent-primary)' : 'transparent',
                      color: scannerTab === 'manual' ? '#fff' : 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Keyboard size={16} />
                    <span>{t.qrTabManual}</span>
                  </button>
                </div>

                {/* Tab 1: Live Camera Viewfinder */}
                {scannerTab === 'camera' && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {cameraError ? (
                      <div style={{ 
                        width: '100%', 
                        padding: '2rem 1rem', 
                        textAlign: 'center', 
                        borderRadius: '16px',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem'
                      }}>
                        <CameraOff size={42} color="var(--accent-red)" />
                        <p style={{ color: 'var(--accent-red)', fontSize: '0.9rem', margin: 0, fontWeight: 600 }}>
                          {cameraError}
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                          <button
                            onClick={startCameraStream}
                            className="btn-primary"
                            style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                          >
                            <RefreshCw size={15} />
                            <span>{lang === 'ar' ? 'إعادة المحاولة' : 'Retry'}</span>
                          </button>
                          <button
                            onClick={() => setScannerTab('manual')}
                            className="config-btn"
                            style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                          >
                            <Keyboard size={15} />
                            <span>{t.qrTabManual}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ 
                        position: 'relative', 
                        width: '100%', 
                        height: '320px', 
                        borderRadius: '16px', 
                        overflow: 'hidden', 
                        backgroundColor: '#000',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
                        border: '2px solid rgba(16, 185, 129, 0.4)'
                      }}>
                        {/* Live Video Element */}
                        <video 
                          ref={videoRef} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <canvas ref={canvasRef} style={{ display: 'none' }} />

                        {/* Camera Starting Loader Overlay */}
                        {isCameraStarting && (
                          <div style={{ 
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                            backgroundColor: 'rgba(0,0,0,0.75)', color: '#fff', gap: '0.75rem' 
                          }}>
                            <span className="loader" style={{ width: '35px', height: '35px', borderTopColor: 'var(--accent-green)' }}></span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.qrCameraStarting}</span>
                          </div>
                        )}

                        {/* Top Helper Badge */}
                        <div style={{ 
                          position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', 
                          backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', 
                          color: '#fff', fontSize: '0.75rem', fontWeight: 600, 
                          padding: '0.35rem 0.85rem', borderRadius: '20px',
                          display: 'flex', alignItems: 'center', gap: '0.35rem',
                          border: '1px solid rgba(255,255,255,0.15)',
                          whiteSpace: 'nowrap'
                        }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-green)', display: 'inline-block', boxShadow: '0 0 6px var(--accent-green)' }}></span>
                          <span>{t.qrCameraHint}</span>
                        </div>

                        {/* Central Target Viewfinder Box with Laser Scan */}
                        <div style={{ 
                          position: 'absolute', 
                          top: '50%', left: '50%', 
                          transform: 'translate(-50%, -50%)', 
                          width: '210px', height: '210px', 
                          border: '2px dashed rgba(16, 185, 129, 0.4)',
                          borderRadius: '16px',
                          pointerEvents: 'none'
                        }}>
                          {/* Corner Target Brackets */}
                          <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '24px', height: '24px', borderTop: '4px solid var(--accent-green)', borderLeft: '4px solid var(--accent-green)', borderTopLeftRadius: '12px' }}></div>
                          <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '24px', height: '24px', borderTop: '4px solid var(--accent-green)', borderRight: '4px solid var(--accent-green)', borderTopRightRadius: '12px' }}></div>
                          <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '24px', height: '24px', borderBottom: '4px solid var(--accent-green)', borderLeft: '4px solid var(--accent-green)', borderBottomLeftRadius: '12px' }}></div>
                          <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '24px', height: '24px', borderBottom: '4px solid var(--accent-green)', borderRight: '4px solid var(--accent-green)', borderBottomRightRadius: '12px' }}></div>

                          {/* Animated Scanning Laser Line */}
                          <div style={{
                            position: 'absolute',
                            width: '100%',
                            height: '3px',
                            background: 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.95), transparent)',
                            top: '0',
                            left: '0',
                            animation: 'scan 2s linear infinite',
                            boxShadow: '0 0 10px rgba(16, 185, 129, 0.9)'
                          }}></div>
                        </div>

                        {/* Bottom Camera Toolbar */}
                        <div style={{ 
                          position: 'absolute', bottom: '12px', left: '0', width: '100%', 
                          display: 'flex', justifyContent: 'center', gap: '1rem',
                          padding: '0 1rem'
                        }}>
                          {/* Flip Camera Button */}
                          <button 
                            type="button"
                            onClick={() => setCameraFacing(prev => prev === 'environment' ? 'user' : 'environment')}
                            style={{
                              backgroundColor: 'rgba(0,0,0,0.65)',
                              backdropFilter: 'blur(8px)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: '20px',
                              color: '#fff',
                              padding: '0.4rem 0.85rem',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem'
                            }}
                            title={t.switchCamera}
                          >
                            <RefreshCw size={14} />
                            <span>{t.switchCamera}</span>
                          </button>

                          {/* Torch Toggle Button */}
                          {hasTorch && (
                            <button 
                              type="button"
                              onClick={toggleTorchLight}
                              style={{
                                backgroundColor: torchOn ? 'rgba(234, 179, 8, 0.75)' : 'rgba(0,0,0,0.65)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '20px',
                                color: torchOn ? '#000' : '#fff',
                                padding: '0.4rem 0.85rem',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem'
                              }}
                              title={t.toggleTorch}
                            >
                              <Zap size={14} />
                              <span>{t.toggleTorch}</span>
                            </button>
                          )}
                        </div>

                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Manual Code Input Form */}
                {scannerTab === 'manual' && (
                  <form onSubmit={handleQrManualSubmit} style={{ width: '100%' }}>
                    <div className="form-group" style={{ textAlign: 'start' }}>
                      <label style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>
                        {t.qrInputLabel}
                      </label>
                      <input 
                        type="number" 
                        className="form-control" 
                        placeholder="e.g., 4442"
                        value={qrInputCode}
                        onChange={(e) => setQrInputCode(e.target.value)}
                        required 
                        autoFocus
                        style={{ 
                          textAlign: 'center', 
                          fontSize: '1.5rem', 
                          fontWeight: 900, 
                          letterSpacing: '0.15em', 
                          color: 'var(--accent-green)',
                          padding: '0.75rem',
                          backgroundColor: 'rgba(0,0,0,0.15)'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                      <button 
                        type="button" 
                        onClick={() => setScannerTab('camera')}
                        className="config-btn" 
                        style={{ flex: 1, justifyContent: 'center', padding: '0.75rem' }}
                      >
                        <Camera size={16} />
                        <span>{t.qrTabCamera}</span>
                      </button>
                      <button 
                        type="submit" 
                        className="btn-primary" 
                        style={{ flex: 1.5, backgroundColor: 'var(--accent-green)', justifyContent: 'center', padding: '0.75rem', fontWeight: 800 }}
                      >
                        <CheckCircle size={18} />
                        <span>{t.qrSubmit}</span>
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

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
