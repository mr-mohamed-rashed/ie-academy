import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Podium from './components/Podium';
import Login from './components/Login';
import InstructorDashboard from './components/InstructorDashboard';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import TeacherProfileModal from './components/TeacherProfileModal';
import TeacherDetailsModal from './components/TeacherDetailsModal';
import { initialStudents, initialSessions, initialInstructors } from './mockData';
import { GraduationCap, Award, BookOpen, Star, AlertCircle, ShieldAlert, Globe, Sun, Moon, User, Info, Play, X } from 'lucide-react';
import { 
  getInstructors, getStudents, getSessions, getPendingPayments, 
  saveInstructor, saveStudent, saveSession, addPendingPayment, deletePendingPayment 
} from './db';

function App() {
  const [lang, setLang] = useState('ar'); // Default to Arabic
  const [theme, setTheme] = useState('dark'); // Default to dark
  
  // Simulated Google Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('edu_is_logged_in') === 'true';
  });
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('edu_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('edu_user_role') || 'landing';
  });
  const [activeStudentId, setActiveStudentId] = useState(() => {
    const saved = localStorage.getItem('edu_active_student_id');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [activeInstructorId, setActiveInstructorId] = useState(() => {
    const saved = localStorage.getItem('edu_active_instructor_id');
    return saved ? parseInt(saved, 10) : null;
  });

  // System subscription fee for instructors (Persisted)
  const [systemFee, setSystemFee] = useState(() => {
    const savedFee = localStorage.getItem('edu_system_fee');
    return savedFee ? parseInt(savedFee, 10) : 750; // default to 750 EGP
  });

  // Academic Year subscription fee (9 months) (Persisted)
  const [academicYearFee, setAcademicYearFee] = useState(() => {
    const savedFee = localStorage.getItem('edu_academic_year_fee');
    return savedFee ? parseInt(savedFee, 10) : 2000; // default to 2000 EGP
  });

  const [playingVideoUrl, setPlayingVideoUrl] = useState(null);

  // Derived active objectsy default
  
  // Lifted state for Instructor Dashboard grades/groups
  const [activeGradeId, setActiveGradeId] = useState('');
  const [activeGroupId, setActiveGroupId] = useState('');

  // Active viewing state for student dashboard
  const [activeTeacherId, setActiveTeacherId] = useState(null); // For student view course page routing
  
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from Supabase on mount (falls back to localStorage if not configured)
  useEffect(() => {
    async function loadData() {
      const insts = await getInstructors();
      const studs = await getStudents();
      const sesss = await getSessions();
      const pends = await getPendingPayments();
      setInstructors(insts);
      setStudents(studs);
      setSessions(sesss);
      setPendingPayments(pends);
      setIsLoading(false);
    }
    loadData();
  }, []);

  // Sync state to local storage and Supabase database
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('edu_students', JSON.stringify(students));
      if (students.length > 0) {
        students.forEach(s => saveStudent(s));
      }
    }
  }, [students, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('edu_sessions', JSON.stringify(sessions));
      if (sessions.length > 0) {
        sessions.forEach(s => saveSession(s));
      }
    }
  }, [sessions, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('edu_instructors', JSON.stringify(instructors));
      if (instructors.length > 0) {
        instructors.forEach(i => saveInstructor(i));
      }
    }
  }, [instructors, isLoading]);

  useEffect(() => {
    localStorage.setItem('edu_system_fee', systemFee);
  }, [systemFee]);
  useEffect(() => {
    localStorage.setItem('edu_academic_year_fee', academicYearFee);
  }, [academicYearFee]);

  useEffect(() => {
    localStorage.setItem('edu_pending_payments', JSON.stringify(pendingPayments));
  }, [pendingPayments]);

  useEffect(() => {
    localStorage.setItem('edu_is_logged_in', isLoggedIn);
    localStorage.setItem('edu_user_role', userRole);
    if (currentUser) {
      localStorage.setItem('edu_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('edu_current_user');
    }
    if (activeStudentId) {
      localStorage.setItem('edu_active_student_id', activeStudentId);
    }
    if (activeInstructorId) {
      localStorage.setItem('edu_active_instructor_id', activeInstructorId);
    } else {
      localStorage.removeItem('edu_active_instructor_id');
    }
  }, [isLoggedIn, currentUser, userRole, activeStudentId, activeInstructorId]);
  
  // PWA BeforeInstallPrompt Listener
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Simulate mobile banner for demonstration purposes if on small screen
    if (window.innerWidth <= 768 && !localStorage.getItem('pwa_banner_dismissed')) {
       setShowInstallBanner(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    setShowInstallBanner(false);
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      setDeferredPrompt(null);
    } else {
      triggerToast(lang === 'ar' ? 'قم بالضغط على مشاركة (Share) ثم أضف للشاشة الرئيسية' : 'Tap Share then Add to Home Screen', 'info');
    }
  };

  const handleDismissBanner = () => {
    setShowInstallBanner(false);
    localStorage.setItem('pwa_banner_dismissed', 'true');
  };
  
  // Landing page active course podium filter
  const [landingPodiumTeacherId, setLandingPodiumTeacherId] = useState(101);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalRole, setLoginModalRole] = useState(null);
  const [visitorTab, setVisitorTab] = useState('guide'); // 'guide' | 'teachers' | 'centers'
  const [showPodiumModal, setShowPodiumModal] = useState(false);
  const [selectedTeacherProfile, setSelectedTeacherProfile] = useState(null);
  const [selectedTeacherDetails, setSelectedTeacherDetails] = useState(null);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  
  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  const [toasts, setToasts] = useState([]);

  // Lock background scroll when modal overlays are active
  useEffect(() => {
    if (showLoginModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showLoginModal]);

  const subscribedTeachers = instructors.filter(i => i.isSubscribed);

  // Auto-sync landing podium select to a valid subscribed teacher if active one gets hidden
  useEffect(() => {
    const firstSub = instructors.find(i => i.isSubscribed);
    const activeSubscribedExists = instructors.some(i => i.id === landingPodiumTeacherId && i.isSubscribed);
    if (!activeSubscribedExists && firstSub) {
      setLandingPodiumTeacherId(firstSub.id);
    }
  }, [instructors, landingPodiumTeacherId]);

  // Admin CRUD action callbacks
  const handleAddTeacher = (newTeacherData) => {
    const newId = 100 + instructors.length + 1;
    const newTeacherObj = {
      id: newId,
      nameAr: newTeacherData.nameAr,
      nameEn: newTeacherData.nameEn,
      avatar: newTeacherData.avatar,
      subjectAr: newTeacherData.subjectAr,
      subjectEn: newTeacherData.subjectEn,
      yearAr: newTeacherData.yearAr,
      yearEn: newTeacherData.yearEn,
      isSubscribed: newTeacherData.isSubscribed,
      groups: [
        { id: `group-custom-${newId}`, nameAr: "المجموعة الافتراضية", nameEn: "Default Group" }
      ]
    };
    setInstructors((prev) => [...prev, newTeacherObj]);
  };

  const handleEditTeacher = (id, updatedData) => {
    setInstructors((prev) =>
      prev.map((inst) => (inst.id === id ? { ...inst, ...updatedData } : inst))
    );
  };

  const handleDeleteTeacher = (id) => {
    setInstructors((prev) => prev.filter((inst) => inst.id !== id));
    if (landingPodiumTeacherId === id) {
      setLandingPodiumTeacherId(null);
    }
  };

  const handleToggleSubscription = (id) => {
    setInstructors((prev) =>
      prev.map((inst) =>
        inst.id === id ? { ...inst, isSubscribed: !inst.isSubscribed } : inst
      )
    );
  };

  // Manage browser history back button for login modal
  useEffect(() => {
    if (showLoginModal) {
      if (window.history.state?.modal !== 'login') {
        window.history.pushState({ modal: 'login' }, '');
      }
    } else {
      if (window.history.state?.modal === 'login') {
        window.history.back();
      }
    }

    const handlePopState = (event) => {
      if (showLoginModal) {
        setShowLoginModal(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [showLoginModal]);

  // Apply language (dir) and theme (data-theme) to document elements
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    if (lang === 'ar') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [lang, theme]);

  // When active student profile changes, set active teacher to first enrolled
  useEffect(() => {
    if (activeStudentId && userRole === 'student') {
      const student = students.find(s => s.id === activeStudentId);
      if (student && student.enrollments.length > 0) {
        setActiveTeacherId(student.enrollments[0].instructorId);
      } else {
        setActiveTeacherId(null);
      }
    } else {
      setActiveTeacherId(null);
    }
  }, [activeStudentId, userRole, students]);

  // Handle toast notifications
  const triggerToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleLangToggle = () => {
    setLang(lang === 'ar' ? 'en' : 'ar');
    triggerToast(lang === 'ar' ? 'Switched to English' : 'تم تغيير اللغة إلى العربية', 'success');
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Helper to format teacher name
  const formatTeacherName = (name) => {
    if (!name) return name;
    const isArabic = /[\u0600-\u06FF]/.test(name);
    if (isArabic) {
      if (!name.trim().match(/^(أ\/|أ\.|أستاذ|استاذ)/)) {
        return `أ/ ${name}`;
      }
    } else {
      const lower = name.trim().toLowerCase();
      if (!lower.startsWith('mr') && !lower.startsWith('dr') && !lower.startsWith('prof') && !lower.startsWith('ms') && !lower.startsWith('mrs')) {
        return `MR- ${name}`;
      }
    }
    return name;
  };

  // Google Login simulation callback
  const handleLogin = (profileData) => {
    let formattedName = profileData.name;
    if (profileData.role === 'instructor') {
      formattedName = formatTeacherName(profileData.name);
    }
    
    // Existing user direct login logic
    if (profileData.isExisting) {
      setIsLoggedIn(true);
      setCurrentUser({
        id: profileData.id,
        name: formattedName,
        role: profileData.role,
        avatar: profileData.avatar,
        email: profileData.email,
        isSubscribed: profileData.isSubscribed
      });
      setUserRole(profileData.role);
      if (profileData.role === 'instructor') {
        setActiveInstructorId(profileData.id);
      } else if (profileData.role === 'student') {
        setActiveStudentId(profileData.id);
      }
      setShowLoginModal(false);
      triggerToast(lang === 'ar' ? `مرحباً بعودتك يا ${formattedName}!` : `Welcome back, ${formattedName}!`, 'success');
      return;
    }
    
    const updatedProfileData = { ...profileData, name: formattedName };
    setCurrentUser(updatedProfileData);
    setIsLoggedIn(true);
    setShowLoginModal(false); // Close login modal if open

    if (updatedProfileData.role === 'instructor') {
      // Create new instructor profile in list
      const newTeacherId = 100 + instructors.length + 1;
      const newTeacherObj = {
        id: newTeacherId,
        email: profileData.email, // Save email!
        nameAr: formattedName,
        nameEn: formattedName,
        avatar: profileData.avatar,
        subjectAr: profileData.subject,
        subjectEn: profileData.subject,
        yearAr: profileData.yearAr || "ثانوي",
        yearEn: profileData.yearEn || "High School",
        isSubscribed: false, // Starts as free/unapproved (hidden from visitors)
        groups: [
          { id: `group-custom-${newTeacherId}`, nameAr: "المجموعة الافتراضية", nameEn: "Default Group" }
        ]
      };
      setInstructors((prev) => [...prev, newTeacherObj]);
      setActiveInstructorId(newTeacherId);
      setUserRole('instructor');
      triggerToast(lang === 'ar' ? `مرحباً بك يا معلم ${formattedName}!` : `Welcome Instructor ${formattedName}!`, 'success');
    } else if (updatedProfileData.role === 'admin') {
      setUserRole('admin');
      triggerToast(lang === 'ar' ? `مرحباً بك يا مدير المنصة ${profileData.name}!` : `Welcome Admin ${profileData.name}!`, 'success');
    } else {
      // Create new student profile in list
      const newStudentId = students.length + 1;
      const newStudentObj = {
        id: newStudentId,
        email: profileData.email, // Save email!
        nameAr: formattedName,
        nameEn: formattedName,
        avatar: updatedProfileData.avatar,
        studentPhone: profileData.studentPhone || '',
        parentPhone: profileData.parentPhone || '',
        enrollments: [
          { 
            instructorId: profileData.instructorId ? Number(profileData.instructorId) : 101, 
            groupId: profileData.groupId || "math-a" 
          }
        ],
        grades: [
          { id: 900, instructorId: updatedProfileData.instructorId ? Number(updatedProfileData.instructorId) : 101, titleAr: "اختبار مبدئي", titleEn: "Initial Quiz", score: 0, max: 100 }
        ],
        attendance: []
      };
      setStudents((prev) => [...prev, newStudentObj]);
      setActiveStudentId(newStudentId);
      setUserRole('student');
      triggerToast(lang === 'ar' ? `مرحباً بك يا طالب ${formattedName}!` : `Welcome Student ${formattedName}!`, 'success');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setUserRole('landing');
    triggerToast(lang === 'ar' ? 'تم تسجيل الخروج بنجاح' : 'Successfully logged out', 'success');
  };

  const handleSubmitPaymentRequest = (requestData) => {
    const newRequest = {
      id: `req-${Date.now()}`,
      instructorId: requestData.instructorId,
      instructorName: requestData.instructorName,
      plan: requestData.plan,
      amount: requestData.amount,
      screenshot: requestData.screenshot,
      date: new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'pending'
    };
    
    // Auto-approve instantly so the teacher is redirected immediately to the active VIP dashboard!
    setInstructors((prev) =>
      prev.map((inst) => (inst.id === requestData.instructorId ? { ...inst, isSubscribed: true } : inst))
    );
    setCurrentUser(prev => prev && prev.role === 'instructor' ? { ...prev, isSubscribed: true } : prev);
    
    setPendingPayments((prev) => [...prev, newRequest]);
    addPendingPayment(newRequest); // Sync to Supabase
  };

  const handleApprovePayment = (requestId, instructorId) => {
    setInstructors((prev) =>
      prev.map((inst) => (inst.id === instructorId ? { ...inst, isSubscribed: true } : inst))
    );
    setPendingPayments((prev) => prev.filter((r) => r.id !== requestId));
    deletePendingPayment(requestId); // Sync to Supabase
    triggerToast(lang === 'ar' ? 'تمت الموافقة على التحويل وتفعيل الاشتراك بنجاح!' : 'Payment approved and subscription activated!', 'success');
  };

  const handleRejectPayment = (requestId) => {
    setPendingPayments((prev) => prev.filter((r) => r.id !== requestId));
    deletePendingPayment(requestId); // Sync to Supabase
    triggerToast(lang === 'ar' ? 'تم رفض طلب الاشتراك وحذف الطلب' : 'Subscription request rejected and removed', 'error');
  };

  const handleUpdateProfile = (updatedData) => {
    let formattedName = updatedData.name;
    if (currentUser.role === 'instructor') {
      formattedName = formatTeacherName(updatedData.name);
    }
    
    // Update active logged-in user state
    setCurrentUser((prev) => ({
      ...prev,
      ...updatedData,
      name: formattedName
    }));

    if (currentUser.role === 'instructor') {
      // Update instructor list record matching active profile
      setInstructors((prev) =>
        prev.map((inst) => {
          if (inst.id === activeInstructorId) {
            return {
              ...inst,
              nameAr: formattedName,
              nameEn: formattedName,
              avatar: updatedData.avatar,
              subjectAr: updatedData.subject,
              subjectEn: updatedData.subject,
              videoUrl: updatedData.videoUrl,
              yearAr: updatedData.yearAr || inst.yearAr,
              yearEn: updatedData.yearEn || inst.yearEn
            };
          }
          return inst;
        })
      );
    } else {
      // Update student list record matching active profile
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id === activeStudentId) {
            return {
              ...s,
              nameAr: formattedName,
              nameEn: formattedName,
              avatar: updatedData.avatar,
              parentPhone: updatedData.parentPhone || s.parentPhone
            };
          }
          return s;
        })
      );
    }
    triggerToast(lang === 'ar' ? 'تم تحديث الملف الشخصي بنجاح!' : 'Profile updated successfully!', 'success');
  };

  // Grade addition callback
  const handleAddGrade = (studentId, quizTitleAr, quizTitleEn, score) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) => {
        if (student.id === studentId) {
          const newGradeId = student.grades.length + 1;
          const newGrade = {
            id: newGradeId,
            instructorId: activeInstructorId,
            titleAr: quizTitleAr,
            titleEn: quizTitleEn,
            score: score,
            max: 100,
          };
          return {
            ...student,
            grades: [...student.grades, newGrade],
          };
        }
        return student;
      })
    );
  };

  // Session addition callback
  const handleAddSession = (newSessionData) => {
    const newSessionId = sessions.length + 1000 + Math.floor(Math.random() * 900); // Random unique ID
    const newSession = {
      id: newSessionId,
      ...newSessionData,
    };
    
    // Add session to sessions list
    setSessions((prevSessions) => [...prevSessions, newSession]);

    // Simulate initial attendance for all students enrolled in this group
    setStudents((prevStudents) =>
      prevStudents.map((student) => {
        // Only add attendance check if student is enrolled in this teacher group
        const isEnrolled = student.enrollments.some(
          (e) => e.instructorId === newSessionData.instructorId && e.groupId === newSessionData.groupId
        );

        if (isEnrolled) {
          // Default to absent, so they can scan the QR code to mark present!
          const newAttendance = {
            instructorId: newSessionData.instructorId,
            sessionId: newSessionId,
            date: newSessionData.date,
            status: 'absent',
          };
          return {
            ...student,
            attendance: [...student.attendance, newAttendance],
          };
        }
        return student;
      })
    );
  };

  // Group addition callback
  const handleAddGroup = (instructorId, newGroupData) => {
    let finalGradeId = '';
    const newGroupId = `group-${Date.now()}`;

    setInstructors((prev) =>
      prev.map((inst) => {
        if (inst.id === instructorId) {
          const existingGrade = inst.grades?.find(g => g.nameAr === newGroupData.gradeNameAr);
          const newGroupObj = {
            id: newGroupId,
            nameAr: newGroupData.groupNameAr,
            nameEn: newGroupData.groupNameAr,
            days: newGroupData.days,
            time: newGroupData.time
          };

          if (existingGrade) {
            finalGradeId = existingGrade.id;
            const updatedGrades = inst.grades.map(g => 
              g.id === existingGrade.id 
                ? { ...g, groups: [...(g.groups || []), newGroupObj] }
                : g
            );
            return { ...inst, grades: updatedGrades };
          } else {
            finalGradeId = `grade-${Date.now()}`;
            const newGradeObj = {
              id: finalGradeId,
              nameAr: newGroupData.gradeNameAr,
              nameEn: newGroupData.gradeNameAr,
              groups: [newGroupObj]
            };
            return { ...inst, grades: [...(inst.grades || []), newGradeObj] };
          }
        }
        return inst;
      })
    );

    // Automatically switch to the newly created group
    setTimeout(() => {
      setActiveGradeId(finalGradeId);
      setActiveGroupId(newGroupId);
    }, 0);
  };

  const handleEditGroup = (instructorId, gradeId, groupId, updatedData) => {
    setInstructors((prev) => 
      prev.map(inst => {
        if (inst.id === instructorId) {
          const updatedGrades = inst.grades.map(grade => {
            if (grade.id === gradeId) {
              const updatedGroups = grade.groups.map(group => {
                if (group.id === groupId) {
                  return {
                    ...group,
                    nameAr: updatedData.groupNameAr,
                    nameEn: updatedData.groupNameAr, // Fallback for bilingual if needed
                    scheduleAr: `${updatedData.days.join(' و ')} الساعة ${updatedData.time}`,
                    scheduleEn: `${updatedData.days.join(' & ')} at ${updatedData.time}`
                  };
                }
                return group;
              });
              // Also update grade name if they changed it
              return { 
                ...grade, 
                nameAr: updatedData.gradeNameAr, 
                nameEn: updatedData.gradeNameAr,
                groups: updatedGroups 
              };
            }
            return grade;
          });
          return { ...inst, grades: updatedGrades };
        }
        return inst;
      })
    );
  };

  const handleDeleteGroup = (instructorId, gradeId, groupId) => {
    setInstructors((prev) =>
      prev.map((inst) => {
        if (inst.id === instructorId) {
          const updatedGrades = inst.grades.map(grade => {
            if (grade.id === gradeId) {
              return { ...grade, groups: grade.groups.filter(g => g.id !== groupId) };
            }
            return grade;
          }).filter(grade => grade.groups.length > 0);
          return { ...inst, grades: updatedGrades };
        }
        return inst;
      })
    );
  };

  const handleRemoveStudentFromGroup = (studentId, instructorId, gradeId, groupId) => {
    setStudents((prev) =>
      prev.map(student => {
        if (student.id === studentId) {
          return {
            ...student,
            enrollments: student.enrollments.filter(e => 
              !(e.instructorId === instructorId && e.gradeId === gradeId && e.groupId === groupId)
            )
          };
        }
        return student;
      })
    );
  };

  // QR Attendance scanning confirmation
  const handleScanQR = (studentId, instructorId, sessionId) => {
    let success = false;

    setStudents((prevStudents) =>
      prevStudents.map((student) => {
        if (student.id === studentId) {
          // Check if attendance log already exists
          const logIdx = student.attendance.findIndex(
            (a) => a.instructorId === instructorId && a.sessionId === sessionId
          );

          if (logIdx > -1) {
            if (student.attendance[logIdx].status === 'absent') {
              const updatedAttendance = [...student.attendance];
              updatedAttendance[logIdx] = {
                ...updatedAttendance[logIdx],
                status: 'present'
              };
              success = true;
              return {
                ...student,
                attendance: updatedAttendance
              };
            }
          } else {
            // Log doesn't exist, create a new present log
            const newLog = {
              instructorId: instructorId,
              sessionId: sessionId,
              date: new Date().toISOString().split('T')[0],
              status: 'present'
            };
            success = true;
            return {
              ...student,
              attendance: [...student.attendance, newLog]
            };
          }
        }
        return student;
      })
    );

    return success;
  };

  const activeStudent = students.find((s) => s.id === activeStudentId) || students[0];
  const activeInstructor = instructors.find((i) => i.id === activeInstructorId) || instructors[0];

  const t = {
    en: {
      heroBadge: "Online Interactive Academy",
      heroTitle: "Welcome to EduAcademy Platform",
      heroDesc: "A premium bilingual space linking students with center instructors. Switch user profiles on the sidebar to check grades, scan attendance QR codes, or publish sessions.",
      activePodiumLabel: "Display Honors Board for Course:",
      courseDetails: "Interactive Portal Systems",
      guestHeadline: "Portal Honors Board"
    },
    ar: {
      heroBadge: "الأكاديمية التعليمية التفاعلية",
      heroTitle: "مرحباً بكم في منصة أكاديمية التعليم",
      heroDesc: "بيئة تعليمية متميزة تربط المدرسين بطلاب السنتر. استخدم شريط التحكم الجانبي للتنقل وتجربة لوحة المدرس لرصد الدرجات وتوليد كود الـ QR، أو لوحة الطالب لمسح الكود ومتابعة محاضراته.",
      activePodiumLabel: "عرض لوحة الشرف لمادة:",
      courseDetails: "البوابات التعليمية الرقمية الموحدة",
      guestHeadline: "لوحة الشرف والمكرمين"
    }
  }[lang];

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-app)', color: 'white' }}>
        <div className="loader" style={{ width: '40px', height: '40px', borderTopColor: 'var(--accent-primary)' }}></div>
      </div>
    );
  }

  // If not logged in, render the Visitor Landing Page
  if (!isLoggedIn) {
    const subscribedTeachers = instructors.filter(inst => inst.isSubscribed);
    return (
      <div className="visitor-landing-page">
        {/* Visitor Navigation Header */}
        <header className="visitor-header">
          <div className="brand-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="brand-icon">
              <BookOpen size={24} />
            </div>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, background: 'linear-gradient(to right, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {lang === 'ar' ? 'أكاديمية التعليم' : 'EduAcademy'}
            </span>
          </div>
          <div className="visitor-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button className="config-btn" onClick={handleLangToggle}>
              <Globe size={16} />
              <span className="hide-on-mobile">{lang === 'ar' ? 'English' : 'العربية'}</span>
            </button>
            <button className="config-btn" onClick={handleThemeToggle}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button className="btn-primary" onClick={() => setShowLoginModal(true)} style={{ width: 'auto', padding: '0.55rem 1.25rem' }}>
              {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="visitor-hero">
          <div className="visitor-hero-overlay"></div>
          <div className="visitor-hero-content" style={{ animation: 'slide-in 0.4s ease-out' }}>
            <span className="hero-badge">{lang === 'ar' ? 'منصة الربط الأكاديمي والتعليم التفاعلي' : 'Interactive Academic Linking Platform'}</span>
            <h1>{lang === 'ar' ? 'أكاديمية التعليم المتكاملة' : 'Integrated EduAcademy Hub'}</h1>
            <p>{lang === 'ar' ? 'منظومة إلكترونية متطورة تربط المدرسين بطلاب السنتر. تابع مستواك الدراسي، تفاعل مع الدروس المصورة، وسجّل حضورك اليومي بالـ QR code بكل سهولة.' : 'An advanced electronic ecosystem linking tutors with center students. Track your performance, engage with recorded lecture modules, and log daily attendance via QR codes.'}</p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '2rem' }}>
              <button className="btn-primary" onClick={() => { setLoginModalRole('student'); setShowLoginModal(true); }} style={{ width: 'auto', padding: '0.75rem 1.75rem', fontSize: '1rem', backgroundColor: 'var(--accent-purple)' }}>
                {lang === 'ar' ? 'ابدأ كطالب الآن' : 'Start as Student'}
              </button>
              <button className="btn-primary" onClick={() => { setLoginModalRole('instructor'); setShowLoginModal(true); }} style={{ width: 'auto', padding: '0.75rem 1.75rem', fontSize: '1rem' }}>
                {lang === 'ar' ? 'ابدأ كمعلم الآن' : 'Start as Teacher'}
              </button>
              <button className="config-btn" onClick={() => document.getElementById('explore-section').scrollIntoView({ behavior: 'smooth' })} style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}>
                {lang === 'ar' ? 'استكشف المزايا' : 'Explore Features'}
              </button>
            </div>
          </div>
        </section>

        {/* Main Content Tabs (Guides, Subscribed Teachers, Centers Gallery) */}
        <section id="explore-section" className="visitor-content-section" style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 1.5rem' }}>
          <div className="role-selector-container" style={{ justifyContent: 'center', marginBottom: '3rem', width: '100%', gap: '1rem', position: 'relative', zIndex: 10 }}>
            <button 
              className={`role-tab ${visitorTab === 'guide' ? 'active' : ''}`}
              onClick={() => setVisitorTab('guide')}
              style={{ fontSize: '1.05rem', padding: '0.75rem 1.5rem', cursor: 'pointer' }}
            >
              {lang === 'ar' ? 'كيفية الاستخدام للمنصة' : 'How the Platform Works'}
            </button>
            <button 
              className={`role-tab ${visitorTab === 'teachers' ? 'active' : ''}`}
              onClick={() => setVisitorTab('teachers')}
              style={{ fontSize: '1.05rem', padding: '0.75rem 1.5rem', cursor: 'pointer' }}
            >
              {lang === 'ar' ? 'المدرسين المشتركين' : 'Subscribed Instructors'}
            </button>
          </div>

          {visitorTab === 'guide' && (
            <div className="guide-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
              
              {/* Student Guide Card */}
              <div className="glass-card guide-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '4px solid var(--accent-purple)' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GraduationCap size={28} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{lang === 'ar' ? 'بوابة حساب الطلاب' : 'For Student Accounts'}</h3>
                <ul className="guide-list" style={{ color: 'var(--text-secondary)', paddingInlineStart: '1.25rem', fontSize: '0.9rem', lineHeight: '1.8' }}>
                  <li>{lang === 'ar' ? 'تلقي دعوة المدرسين للانضمام المباشر للمجموعات الدراسية وبدء رحلة التعلم.' : 'Receive direct classroom group registration invitations.'}</li>
                  <li>{lang === 'ar' ? 'مسح كود الـ QR الخاص بالحصة في القاعة لتسجيل الحضور، مع إشعار ولي الأمر تلقائياً عبر الواتساب.' : 'Scan QR to record attendance with automated WhatsApp notifications to parents.'}</li>
                  <li>{lang === 'ar' ? 'توفر شروحات الفيديو التفاعلية والمراجعات المستمرة دائماً في حسابك للرجوع إليها وقتما تشاء لضمان فهمك الكامل.' : 'Constant access to interactive video tutorials and revision materials anytime you need them.'}</li>
                  <li>{lang === 'ar' ? 'مساعد ذكي متوفر على مدار الساعة للإجابة على أسئلتك بأسلوب معلمك الخاص بناءً على ملخصات الدروس.' : '24/7 AI assistant to answer your questions in your teacher\'s exact style based on lesson summaries.'}</li>
                  <li>{lang === 'ar' ? 'أداء الكويزات والاختبارات والحصول على التصحيح الفوري الدقيق بالذكاء الاصطناعي لمعرفة أخطائك فوراً.' : 'Take quizzes with instant, precise AI grading to know your mistakes immediately.'}</li>
                  <li>{lang === 'ar' ? 'استلام درجات الواجبات والاختبارات ومشاهدة منحنى التطور الشخصي وتقارير الأداء التفصيلية.' : 'Receive assignment scores and monitor your dynamic personal progress and performance reports.'}</li>
                  <li>{lang === 'ar' ? 'استعراض لوحة شرف المادة (Podium) لأوائل المتفوقين والمنافسة بقوة لتصدر الترتيب.' : 'View honors podiums recognizing top classmates and compete for the top rank.'}</li>
                </ul>
              </div>

              {/* Teacher Guide Card */}
              <div className="glass-card guide-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '4px solid var(--accent-primary)' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={28} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{lang === 'ar' ? 'بوابة حساب المعلم' : 'For Instructor Accounts'}</h3>
                <ul className="guide-list" style={{ color: 'var(--text-secondary)', paddingInlineStart: '1.25rem', fontSize: '0.9rem', lineHeight: '1.8' }}>
                  <li>{lang === 'ar' ? 'إنشاء مجموعات دراسية نشطة وإدارتها بالكامل بشكل مستقل عبر مختلف المراحل التعليمية.' : 'Establish and manage class groups across all educational phases independently.'}</li>
                  <li>{lang === 'ar' ? 'توليد كود الـ QR لتسجيل الحضور للطلاب في القاعة، مع إرسال إشعارات واتساب تلقائية لولي الأمر فوراً في حال الغياب.' : 'Generate QR for attendance, with immediate automated WhatsApp notifications to parents for absences.'}</li>
                  <li>{lang === 'ar' ? 'توفير مساعد ذكاء اصطناعي يتواصل مع الطلاب ويرد على أسئلتهم بأسلوبك الخاص بناءً على الشرح لتخفيف العبء عنك.' : 'Provide an AI assistant that answers student questions in your style based on your summaries to reduce your workload.'}</li>
                  <li>{lang === 'ar' ? 'تصحيح الاختبارات والكويزات فورياً بالذكاء الاصطناعي مع التسجيل والتحليل الآلي للدرجات لتوفير الجهد والوقت.' : 'Instant AI grading for quizzes with automated score recording and analysis to save time and effort.'}</li>
                  <li>{lang === 'ar' ? 'إضافة دروس ومواد تعليمية مرئية مسجلة ومذكرات بحرية تامة لإنشاء مكتبة مراجعات متكاملة لطلابك.' : 'Publish video tutorials and curriculum description blocks to build a comprehensive revision library.'}</li>
                  <li>{lang === 'ar' ? 'رصد وتحديث درجات الواجبات ومتابعة منحنى تطور كل طالب لتحديد نقاط الضعف والقوة بدقة.' : 'Record assignment scores and track each student\'s progress curve to precisely identify strengths and weaknesses.'}</li>
                  <li>{lang === 'ar' ? 'التحلي بصلاحيات عمل كاملة في البوابة الشخصية الخاصة بك بشكل مجاني تماماً.' : 'Enjoy full portal capabilities and absolute control free of charge.'}</li>
                </ul>
              </div>
            </div>
          )}

          {visitorTab === 'teachers' && (
            <div className="visitor-teachers-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
              {subscribedTeachers.length > 0 ? (
                subscribedTeachers.map((teacher) => (
                  <div key={teacher.id} className="glass-card visitor-teacher-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem', border: '1px solid var(--border-glass)', transition: 'transform 0.3s ease' }}>
                    <img 
                      src={teacher.avatar} 
                      alt={teacher.nameEn} 
                      style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-gold)', boxShadow: '0 4px 15px rgba(251, 191, 36, 0.4)' }}
                    />
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{lang === 'ar' ? teacher.nameAr : teacher.nameEn}</h3>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)', display: 'block', marginTop: '0.25rem' }}>
                        {lang === 'ar' ? teacher.subjectAr : teacher.subjectEn}
                      </span>
                    </div>
                    
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', width: '100%', color: 'var(--text-secondary)' }}>
                      <span>{lang === 'ar' ? teacher.yearAr : teacher.yearEn}</span>
                    </div>



                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', marginTop: 'auto' }}>
                      <button 
                        className="btn-primary" 
                        onClick={() => {
                          setLandingPodiumTeacherId(teacher.id);
                          setShowPodiumModal(true);
                        }}
                        style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                      >
                        <Award size={14} />
                        <span>{lang === 'ar' ? 'عرض لوحة شرف المادة' : 'View Course Honors Podium'}</span>
                      </button>

                      <button 
                        className="btn-primary" 
                        onClick={() => setSelectedTeacherProfile(teacher)}
                        style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', backgroundColor: 'var(--accent-purple)' }}
                      >
                        <User size={14} />
                        <span>{lang === 'ar' ? 'عرض صفحة المدرس' : 'View Teacher Profile'}</span>
                      </button>
                      <button 
                        className="btn-primary" 
                        onClick={() => setSelectedTeacherDetails(teacher)}
                        style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', backgroundColor: '#10b981', borderColor: '#10b981' }}
                      >
                        <Info size={14} />
                        <span>{lang === 'ar' ? 'التواصل والتفاصيل' : 'Details & Contact'}</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <AlertCircle size={48} style={{ margin: '0 auto 1rem auto', color: 'var(--text-muted)' }} />
                  <p style={{ fontSize: '1rem', fontWeight: 600 }}>
                    {lang === 'ar' ? 'لا يوجد مدرسون مشتركون في الظهور في الدليل العام حالياً.' : 'No subscribed instructors are currently available in the directory.'}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    {lang === 'ar' ? 'يمكن للمدرسين الاشتراك من خلال ترقية النظام' : 'Instructors can subscribe by upgrading the system.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Smart Centers Gallery - Rendered statically below the tab contents */}
          <div className="centers-gallery-section" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', marginTop: '5rem', borderTop: '1px solid var(--border-glass)', paddingTop: '4rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {lang === 'ar' ? 'بيئة دراسية تفاعلية حديثة' : 'Modern Interactive Study Environment'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                {lang === 'ar' ? 'قاعات تدريب مجهزه باحدث تقنيات التعليم الذكى' : 'Visual showcase of our tutoring center classrooms and study lounges equipped with smart learning tech.'}
              </p>
            </div>

            <div className="visitor-teachers-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              {/* Classroom Card */}
              <div className="glass-card visitor-teacher-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid var(--border-glass)' }}>
                <img 
                  src={`${import.meta.env.BASE_URL}classroom.png`} 
                  alt="Smart Classroom AI" 
                  style={{ width: '100%', height: '260px', objectFit: 'cover', borderBottom: '1px solid var(--border-glass)' }}
                />
                <div style={{ padding: '1.5rem', textAlign: 'start' }}>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {lang === 'ar' ? 'القاعات الدراسية والتدريبية الذكية' : 'Smart Training Classrooms'}
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem', lineHeight: '1.6' }}>
                    {lang === 'ar' ? 'قاعات تدريس مجهزة بشاشات تفاعلية ذكية، وإضاءة مريحة للعين، ونظام بث مباشر لتسهيل حضور المحاضرات والتفاعل بين المعلم والطلاب.' : 'Classrooms equipped with smart interactive boards, eye-care ambient lighting, and live stream rigs to enable premium interaction.'}
                  </p>
                </div>
              </div>

              {/* Lobby Card */}
              <div className="glass-card visitor-teacher-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid var(--border-glass)' }}>
                <img 
                  src={`${import.meta.env.BASE_URL}lobby.png`} 
                  alt="Luxury Lobby AI" 
                  style={{ width: '100%', height: '260px', objectFit: 'cover', borderBottom: '1px solid var(--border-glass)' }}
                />
                <div style={{ padding: '1.5rem', textAlign: 'start' }}>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {lang === 'ar' ? 'ردهات الاستراحة والمذاكرة الفاخرة' : 'Premium Study Lounges'}
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem', lineHeight: '1.6' }}>
                    {lang === 'ar' ? 'مساحات انتظار ومذاكرة مهيأة تماماً ومريحة للأعصاب، تحفز الطلاب على التركيز والمراجعة بشكل فردي أو جماعي قبل الحصص.' : 'Calm waiting and study areas, structured to encourage focused individual or group reviews before class sessions begin.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Visitor Footer with Google Compliance Links */}
        <footer className="visitor-footer" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', borderTop: '1px solid var(--border-glass)', marginTop: '4rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <p>© 2026 {lang === 'ar' ? 'منصة أكاديمية التعليم الرقمية التفاعلية.' : 'EduAcademy Interactive Digital Platform. All rights reserved.'}</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <button 
              onClick={() => setPrivacyOpen(true)}
              style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
            >
              {lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </button>
            <button 
              onClick={() => setTermsOpen(true)}
              style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
            >
              {lang === 'ar' ? 'شروط الاستخدام' : 'Terms of Use'}
            </button>
            <span style={{ color: 'var(--border-glass)' }}>|</span>
            <button 
              onClick={() => {
                setLoginModalRole('admin');
                setShowLoginModal(true);
              }}
              style={{ background: 'none', border: 'none', color: 'var(--color-gold)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
            >
              {lang === 'ar' ? 'إدارة المنصة' : 'Admin Panel'}
            </button>
          </div>
        </footer>

        {/* Login Simulator Modal Overlay */}
        {showLoginModal && (
          <div style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 6000, 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(10px)'
          }}>
            <Login onLogin={handleLogin} lang={lang} instructors={instructors} initialRole={loginModalRole} onClose={() => setShowLoginModal(false)} />
          </div>
        )}

        {/* Public Honors Board Modal Overlay */}
        {showPodiumModal && (
          <div style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 6000, 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(10px)', overflowY: 'auto', padding: '2rem 1rem'
          }}>
              <Podium students={students} lang={lang} instructorId={landingPodiumTeacherId} onClose={() => setShowPodiumModal(false)} />
          </div>
        )}

        {/* Privacy Policy Modal */}
        {privacyOpen && (
          <div style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 7000, 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(10px)', overflowY: 'auto', padding: '2rem 1rem'
          }}>
            <div className="glass-card" style={{ maxWidth: '650px', width: '100%', padding: '2rem', direction: lang === 'ar' ? 'rtl' : 'ltr', textAlign: 'start', position: 'relative' }}>
              <button 
                className="config-btn" 
                onClick={() => setPrivacyOpen(false)}
                style={{ position: 'absolute', top: '1.5rem', right: lang === 'ar' ? 'auto' : '1.5rem', left: lang === 'ar' ? '1.5rem' : 'auto', borderColor: 'var(--accent-red)', color: 'var(--accent-red)', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              >
                {lang === 'ar' ? 'إغلاق' : 'Close'}
              </button>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                {lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
              </h3>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.8', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {lang === 'ar' ? (
                  <>
                    <p>أهلاً بك في منصة <strong>أكاديمية التعليم</strong>. نحن ملتزمون بحماية خصوصيتك وبياناتك الشخصية.</p>
                    <h4 style={{ color: 'var(--text-primary)', marginTop: '1rem', marginBottom: '0.5rem' }}>1. البيانات التي نجمعها</h4>
                    <p>عند تسجيل الدخول باستخدام حساب Google الخاص بك، فإننا نقرأ فقط المعلومات الأساسية المعتمدة من Google OAuth وهي: اسمك الكامل، عنوان بريدك الإلكتروني، وصورتك الرمزية (الملف الشخصي).</p>
                    <h4 style={{ color: 'var(--text-primary)', marginTop: '1rem', marginBottom: '0.5rem' }}>2. كيف نستخدم بياناتك</h4>
                    <p>نحن نستخدم هذه البيانات حصرياً لإنشاء حسابك وتخصيص لوحة التحكم الخاصة بك كطالب أو معلم، وعرض اسمك وصورتك في المجموعات ولوحة الشرف الدراسية.</p>
                    <h4 style={{ color: 'var(--text-primary)', marginTop: '1rem', marginBottom: '0.5rem' }}>3. حماية البيانات ومشاركتها</h4>
                    <p>نحن لا نبيع أو نشارك بياناتك الشخصية مع أي أطراف ثالثة. يتم تشفير اتصالاتك بالكامل وتخزين بياناتك في بيئة آمنة تمنع الوصول غير المصرح به.</p>
                  </>
                ) : (
                  <>
                    <p>Welcome to <strong>EduAcademy</strong>. We are committed to protecting your privacy and personal data.</p>
                    <h4 style={{ color: 'var(--text-primary)', marginTop: '1rem', marginBottom: '0.5rem' }}>1. Information We Collect</h4>
                    <p>When you log in using your Google Account, we only access basic Google OAuth verified profile information: your full name, email address, and profile picture avatar.</p>
                    <h4 style={{ color: 'var(--text-primary)', marginTop: '1rem', marginBottom: '0.5rem' }}>2. How We Use Your Data</h4>
                    <p>We use this information solely to create your account, configure your custom Student or Instructor workspace, and display your details in class groups and honors boards.</p>
                    <h4 style={{ color: 'var(--text-primary)', marginTop: '1rem', marginBottom: '0.5rem' }}>3. Data Protection & Sharing</h4>
                    <p>We never sell or share your personal information with third parties. All communications are fully encrypted and stored securely to prevent unauthorized access.</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Terms of Use Modal */}
        {termsOpen && (
          <div style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 7000, 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(10px)', overflowY: 'auto', padding: '2rem 1rem'
          }}>
            <div className="glass-card" style={{ maxWidth: '650px', width: '100%', padding: '2rem', direction: lang === 'ar' ? 'rtl' : 'ltr', textAlign: 'start', position: 'relative' }}>
              <button 
                className="config-btn" 
                onClick={() => setTermsOpen(false)}
                style={{ position: 'absolute', top: '1.5rem', right: lang === 'ar' ? 'auto' : '1.5rem', left: lang === 'ar' ? '1.5rem' : 'auto', borderColor: 'var(--accent-red)', color: 'var(--accent-red)', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              >
                {lang === 'ar' ? 'إغلاق' : 'Close'}
              </button>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                {lang === 'ar' ? 'شروط الاستخدام' : 'Terms of Use'}
              </h3>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.8', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {lang === 'ar' ? (
                  <>
                    <p>باستخدامك لمنصة <strong>أكاديمية التعليم</strong>، فإنك توافق على الالتزام بالشروط والبنود التالية:</p>
                    <h4 style={{ color: 'var(--text-primary)', marginTop: '1rem', marginBottom: '0.5rem' }}>1. شروط الحساب والاستخدام</h4>
                    <p>يجب على الطلاب والمعلمين الحفاظ على سرية حساباتهم وعدم استخدام المنصة لأي غرض غير قانوني أو انتهاك حقوق الملكية الفكرية للمواد التعليمية المنشورة.</p>
                    <h4 style={{ color: 'var(--text-primary)', marginTop: '1rem', marginBottom: '0.5rem' }}>2. نظام اشتراكات المعلمين</h4>
                    <p>تقدم المنصة باقة ظهور عامة مدفوعة للمعلمين لتمكينهم من الظهور للزوار في دليل المنصة الرئيسي. يمكن للمدرسين الاستفادة من كافة خصائص ومميزات النظام مجاناً دون إدراجهم في الدليل العام للزوار.</p>
                    <h4 style={{ color: 'var(--text-primary)', marginTop: '1rem', marginBottom: '0.5rem' }}>3. إنهاء الخدمة والتعديل</h4>
                    <p>نحتفظ بالحق في تعديل هذه الشروط أو إيقاف الحسابات التي تنتهك معايير السلوك الأكاديمي والتعليمي في أي وقت.</p>
                  </>
                ) : (
                  <>
                    <p>By using the <strong>EduAcademy</strong> platform, you agree to comply with and be bound by the following terms:</p>
                    <h4 style={{ color: 'var(--text-primary)', marginTop: '1rem', marginBottom: '0.5rem' }}>1. Account & Usage Guidelines</h4>
                    <p>Students and teachers must safeguard their credentials and agree not to use the platform for any illegal purpose or infringe educational material intellectual copyrights.</p>
                    <h4 style={{ color: 'var(--text-primary)', marginTop: '1rem', marginBottom: '0.5rem' }}>2. Teacher Subscription Visibility Tiers</h4>
                    <p>The platform provides paid public directory listings for instructors. Instructors are welcome to use all grading, group management, and classroom QR code features for free without public listing visibility.</p>
                    <h4 style={{ color: 'var(--text-primary)', marginTop: '1rem', marginBottom: '0.5rem' }}>3. Service Modifications & Termination</h4>
                    <p>We reserve the right to amend these terms or terminate accounts that breach standard academic and educational ethics at any time.</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Teacher Profile Modal */}
        <TeacherProfileModal 
          teacher={selectedTeacherProfile} 
          lang={lang} 
          onClose={() => setSelectedTeacherProfile(null)} 
          onLoginClick={(teacherId, gradeId, groupId) => {
            window.history.pushState({}, '', `?teacher=${teacherId}&grade=${gradeId}&group=${groupId}`);
            setSelectedTeacherProfile(null);
            setLoginModalRole('student');
            setShowLoginModal(true);
          }}
        />

        {/* Teacher Details Modal */}
        <TeacherDetailsModal 
          teacher={selectedTeacherDetails} 
          lang={lang} 
          onClose={() => setSelectedTeacherDetails(null)} 
        />

        {/* Toast Notifications */}
        <div className="toast-container">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast ${toast.type}`}>
              <AlertCircle size={18} />
              <span>{toast.message}</span>
            </div>
          ))}
        </div>

        {/* PWA Install Banner */}
        {showInstallBanner && (
          <div style={{
            position: 'fixed', bottom: '1.5rem', left: '1.5rem', right: '1.5rem',
            backgroundColor: 'var(--bg-glass)', border: '1px solid var(--accent-primary)',
            padding: '1.25rem', borderRadius: '16px', zIndex: 5000,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)',
            animation: 'slide-up 0.5s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <BookOpen size={24} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem', fontWeight: 800 }}>{lang === 'ar' ? 'تطبيق أكاديمية التعليم' : 'EduAcademy App'}</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{lang === 'ar' ? 'ثبت التطبيق على هاتفك لتجربة أسرع وأفضل.' : 'Install the app on your phone for a faster, better experience.'}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button 
                onClick={handleDismissBanner}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', padding: '0.5rem' }}
              >
                {lang === 'ar' ? 'لاحقاً' : 'Later'}
              </button>
              <button 
                onClick={handleInstallClick}
                className="btn-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', borderRadius: '8px' }}
              >
                {lang === 'ar' ? 'تثبيت' : 'Install'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Navbar
        lang={lang}
        theme={theme}
        userRole={userRole}
        activeStudentId={activeStudentId}
        activeInstructorId={activeInstructorId}
        students={students}
        instructors={instructors}
        currentUser={currentUser}
        onLangToggle={handleLangToggle}
        onThemeToggle={handleThemeToggle}
        onRoleChange={setUserRole}
        onStudentChange={setActiveStudentId}
        onInstructorChange={setActiveInstructorId}
        onLogout={handleLogout}
        onUpdateProfile={handleUpdateProfile}
        activeGradeId={activeGradeId}
        activeGroupId={activeGroupId}
        onGradeChange={setActiveGradeId}
        onGroupChange={setActiveGroupId}
      />

      {/* Main Panel Viewport */}
      <main className="main-viewport">
        {/* Page Header */}
        <header className="page-header">
          <div className="header-title">
            {userRole === 'instructor' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div 
                  style={{ position: 'relative', cursor: activeInstructor.videoUrl ? 'pointer' : 'default' }}
                  onClick={() => activeInstructor.videoUrl && setPlayingVideoUrl(activeInstructor.videoUrl)}
                  title={activeInstructor.videoUrl ? (lang === 'ar' ? 'تشغيل الفيديو التعريفي' : 'Play Intro Video') : ''}
                >
                  <img 
                    src={activeInstructor.avatar} 
                    alt="Avatar" 
                    style={{ 
                      width: '60px', 
                      height: '60px', 
                      borderRadius: '50%', 
                      objectFit: 'cover', 
                      border: activeInstructor.isSubscribed ? '3px solid var(--color-gold)' : '2px solid var(--accent-primary)',
                      boxShadow: activeInstructor.isSubscribed ? '0 0 12px var(--color-gold)' : 'none'
                    }} 
                  />
                  {activeInstructor.videoUrl && (
                    <div style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: 'var(--accent-primary)', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-app)' }}>
                      <Play size={10} color="white" fill="white" />
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                  <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {lang === 'ar' ? activeInstructor.nameAr : activeInstructor.nameEn}
                  </h1>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--accent-primary)', fontSize: '0.95rem', fontWeight: 500 }}>
                      {lang === 'ar' ? activeInstructor.subjectAr : activeInstructor.subjectEn}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>•</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 400 }}>
                      {lang === 'ar' ? activeInstructor.yearAr : activeInstructor.yearEn}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <h1 style={{ margin: 0 }}>
                  {userRole === 'landing' && t.guestHeadline}
                  {userRole === 'admin' && (lang === 'ar' ? 'لوحة تحكم مدير النظام' : 'System Admin Console')}
                  {userRole === 'student' && (lang === 'ar' ? activeStudent.nameAr : activeStudent.nameEn)}
                </h1>
                <p style={{ marginTop: '0.25rem' }}>{t.courseDetails}</p>
              </>
            )}
          </div>

          {/* Role switcher removed per user request */}
        </header>

        {/* Views */}
        {userRole === 'landing' && (
          <div className="dashboard-grid">
            {/* Welcoming Hero Banner */}
            <div className="glass-card hero-card" style={{ animation: 'slide-in 0.3s ease-out' }}>
              <div className="hero-text">
                <span className="hero-badge">{t.heroBadge}</span>
                <h2>{t.heroTitle}</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: '1.6' }}>
                  {t.heroDesc}
                </p>
              </div>
              <div style={{ zIndex: 1, color: 'var(--accent-primary)', opacity: 0.85 }}>
                <GraduationCap size={120} />
              </div>
            </div>

            {/* Course Selector for Landing Podium */}
            <div className="glass-card" style={{ gridColumn: 'span 12', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {t.activePodiumLabel}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {instructors.filter(i => i.isSubscribed).map(inst => (
                  <button 
                    key={inst.id}
                    className={`role-tab ${landingPodiumTeacherId === inst.id ? 'active' : ''}`}
                    onClick={() => setLandingPodiumTeacherId(inst.id)}
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    {lang === 'ar' ? `${inst.nameAr} - ${inst.subjectAr}` : `${inst.nameEn} - ${inst.subjectEn}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Renders dynamic podium for chosen course */}
            <div style={{ gridColumn: 'span 12' }}>
              {landingPodiumTeacherId && (
                <Podium students={students} lang={lang} instructorId={landingPodiumTeacherId} />
              )}
            </div>
          </div>
        )}

        {userRole === 'instructor' && (
          <InstructorDashboard
            instructor={activeInstructor}
            students={students}
            sessions={sessions}
            onAddGrade={handleAddGrade}
            onAddSession={handleAddSession}
            onAddGroup={handleAddGroup}
            onEditGroup={handleEditGroup}
            onDeleteGroup={handleDeleteGroup}
            onRemoveStudent={handleRemoveStudentFromGroup}
            lang={lang}
            triggerToast={triggerToast}
            activeGradeId={activeGradeId}
            activeGroupId={activeGroupId}
            onGradeChange={setActiveGradeId}
            onGroupChange={setActiveGroupId}
            systemFee={systemFee}
            academicYearFee={academicYearFee}
            pendingPayments={pendingPayments}
            onSubmitPaymentRequest={handleSubmitPaymentRequest}
            onPaySubscription={() => handleToggleSubscription(activeInstructor.id)}
          />
        )}

        {userRole === 'student' && (
          <StudentDashboard
            student={activeStudent}
            instructors={instructors}
            sessions={sessions}
            students={students}
            activeTeacherId={activeTeacherId}
            onSelectTeacher={setActiveTeacherId}
            onScanQR={handleScanQR}
            lang={lang}
            triggerToast={triggerToast}
          />
        )}

        {userRole === 'admin' && (
          <AdminDashboard
            instructors={instructors}
            students={students}
            onAddTeacher={handleAddTeacher}
            onEditTeacher={handleEditTeacher}
            onDeleteTeacher={handleDeleteTeacher}
            onToggleSubscription={handleToggleSubscription}
            lang={lang}
            triggerToast={triggerToast}
            systemFee={systemFee}
            setSystemFee={setSystemFee}
            academicYearFee={academicYearFee}
            setAcademicYearFee={setAcademicYearFee}
            pendingPayments={pendingPayments}
            onApprovePayment={handleApprovePayment}
            onRejectPayment={handleRejectPayment}
          />
        )}

      </main>

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <AlertCircle size={18} />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
      {/* Floating Video Modal */}
      {playingVideoUrl && (() => {
        const getEmbedUrl = (url) => {
          if (!url) return '';
          let videoId = '';
          if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = url.match(regExp);
            if (match && match[2].length === 11) {
              videoId = match[2];
            }
            return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
          }
          return url;
        };

        const embedUrl = getEmbedUrl(playingVideoUrl);

        return (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999,
            padding: '1rem'
          }} onClick={() => setPlayingVideoUrl(null)}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '800px', padding: '0.5rem', border: '1px solid var(--border-glass)', borderRadius: '16px', position: 'relative' }} onClick={e => e.stopPropagation()}>
              <button 
                onClick={() => setPlayingVideoUrl(null)} 
                style={{ position: 'absolute', top: '-2.5rem', right: 0, background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem' }}
              >
                <X size={20} />
                <span>{lang === 'ar' ? 'إغلاق' : 'Close'}</span>
              </button>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px' }}>
                <iframe
                  src={embedUrl}
                  title="Intro Video"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}

export default App;
