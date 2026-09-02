import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Podium from './components/Podium';
const Login = React.lazy(() => import('./components/Login'));
let supabaseInstance = null;
const getSupabase = async () => {
  if (!supabaseInstance) {
    const module = await import('./supabaseClient');
    supabaseInstance = module.supabase;
  }
  return supabaseInstance;
};
const InstructorDashboard = React.lazy(() => import('./components/InstructorDashboard'));
const StudentDashboard = React.lazy(() => import('./components/StudentDashboard'));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));
const SupportDashboard = React.lazy(() => import('./components/SupportDashboard'));
import TeacherProfileModal from './components/TeacherProfileModal';
import TeacherDetailsModal from './components/TeacherDetailsModal';
import { initialStudents, initialSessions, initialInstructors } from './mockData';
import { GraduationCap, Award, BookOpen, Star, AlertCircle, ShieldAlert, Globe, Sun, Moon, User, Info, Play, X as CloseIcon, Pencil, Ruler, Lightbulb, QrCode, MessageSquare, TrendingUp, BarChart3, Link, Activity, FileText, Users } from 'lucide-react';
import { 
  getInstructors, getStudents, getSessions, getPendingPayments, 
  saveInstructor, saveStudent, saveSession, addPendingPayment, deletePendingPayment,
  deleteInstructor
} from './db';

const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || 'https://luhaxtokriahwqruaymr.supabase.co';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ofzb67GhUvtuPpHXRrLT5w_o4t3laqY';
  return url && url !== 'https://your-supabase-url.supabase.co' && key && key !== 'your-anon-key' && url !== 'https://your-supabase-project-url.supabase.co' && key !== 'your-supabase-public-anon-key';
};

function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('edu_lang') || 'ar'); // Default to Arabic
  const [theme, setTheme] = useState(() => localStorage.getItem('edu_theme') || 'light'); // Default to light
  const [showAdminPanel, setShowAdminPanel] = useState(() => localStorage.getItem('edu_show_admin_link') === 'true');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setShowAdminPanel(true);
      localStorage.setItem('edu_show_admin_link', 'true');
    }
  }, []);
  
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
  const handlePlayVideo = (url) => {
    setPlayingVideoUrl(url);
    if (url) {
      localStorage.setItem('edu_last_video', url);
    }
  };

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

  // Sync currentUser with updated database records on mount
  useEffect(() => {
    if (!isLoading && currentUser) {
      if (currentUser.role === 'instructor' && activeInstructorId) {
        const dbInst = instructors.find(i => i.id === activeInstructorId);
        if (dbInst) {
          setCurrentUser(prev => ({
            ...prev,
            ...dbInst,
            name: dbInst.nameAr || dbInst.nameEn || prev.name
          }));
        }
      } else if (currentUser.role === 'student' && activeStudentId) {
        const dbStud = students.find(s => s.id === activeStudentId);
        if (dbStud) {
          setCurrentUser(prev => ({
            ...prev,
            ...dbStud,
            name: dbStud.nameAr || dbStud.nameEn || prev.name
          }));
        }
      }
    }
  }, [isLoading, instructors, students, activeInstructorId, activeStudentId]);

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
  
  // Auto-logout if local state is corrupt (e.g. database cleared but user session remains)
  useEffect(() => {
    if (isLoading) return; // Prevent premature logout while database is loading!
    if (isLoggedIn) {
      if (userRole === 'instructor' && activeInstructorId && instructors.length > 0 && !instructors.some(i => i.id === activeInstructorId)) {
        // Run clear session
        setIsLoggedIn(false);
        setCurrentUser(null);
        setUserRole('landing');
        localStorage.setItem('edu_is_logged_in', 'false');
        localStorage.removeItem('edu_current_user');
        localStorage.removeItem('edu_active_instructor_id');
      } else if (userRole === 'student' && activeStudentId && students.length > 0 && !students.some(s => s.id === activeStudentId)) {
        setIsLoggedIn(false);
        setCurrentUser(null);
        setUserRole('landing');
        localStorage.setItem('edu_is_logged_in', 'false');
        localStorage.removeItem('edu_current_user');
        localStorage.removeItem('edu_active_student_id');
      }
    }
  }, [isLoggedIn, userRole, activeInstructorId, activeStudentId, instructors, students, isLoading]);
  
  // PWA BeforeInstallPrompt Listener
  useEffect(() => {
    let timer;
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA after a short delay
      timer = setTimeout(() => {
        setShowInstallBanner(true);
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Simulate mobile banner for demonstration purposes if on small screen
    if (window.innerWidth <= 768 && !localStorage.getItem('pwa_banner_dismissed')) {
       timer = setTimeout(() => {
         setShowInstallBanner(true);
       }, 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      if (timer) clearTimeout(timer);
    };
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
  
  // Real Supabase OAuth User state
  const [supabaseUser, setSupabaseUser] = useState(null);
  
  // Technical Support Agents list state
  const [supportAgents, setSupportAgents] = useState(() => {
    const saved = localStorage.getItem('edu_support_agents');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: "م. أحمد علي (دعم فني)", email: "ahmed.support@ie-academy.com", phone: "01099887766" }
    ];
  });

  useEffect(() => {
    localStorage.setItem('edu_support_agents', JSON.stringify(supportAgents));
  }, [supportAgents]);

  const handleAddSupportAgent = (agent) => {
    const newAgent = {
      id: Date.now(),
      name: agent.name,
      email: agent.email,
      phone: agent.phone
    };
    setSupportAgents(prev => [...prev, newAgent]);
  };

  const handleDeleteSupportAgent = (id) => {
    setSupportAgents(prev => prev.filter(a => a.id !== id));
  };

  // Handle Admin & Support Agent Invitation Link Triggers
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteParam = params.get('invite');
    if (inviteParam === 'support' || inviteParam === 'admin') {
      setLoginModalRole(inviteParam);
      setShowLoginModal(true);
      // Clear URL params so it doesn't trigger repeatedly
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);
  
  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  const [toasts, setToasts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle Supabase OAuth session changes
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let subInstance;
    getSupabase().then(supabase => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setSupabaseUser(session.user);
          const savedOAuthRole = localStorage.getItem('edu_oauth_role');
          if (savedOAuthRole && savedOAuthRole !== 'login') {
            setLoginModalRole(savedOAuthRole);
          }
          // Automatically pop up login overlay to chooser/wizard if not logged in
          if (localStorage.getItem('edu_is_logged_in') !== 'true') {
            setShowLoginModal(true);
          }
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setSupabaseUser(session.user);
          const savedOAuthRole = localStorage.getItem('edu_oauth_role');
          if (savedOAuthRole && savedOAuthRole !== 'login') {
            setLoginModalRole(savedOAuthRole);
          }
          if (localStorage.getItem('edu_is_logged_in') !== 'true') {
            setShowLoginModal(true);
          }
        } else {
          setSupabaseUser(null);
        }
      });
      subInstance = subscription;
    });

    return () => {
      if (subInstance) subInstance.unsubscribe();
    };
  }, []);

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
    const newId = instructors.length > 0 ? Math.max(...instructors.map(i => Number(i.id) || 100)) + 1 : 101;
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
      aboutAr: newTeacherData.aboutAr || '',
      aboutEn: newTeacherData.aboutEn || '',
      price: newTeacherData.price || '',
      paymentMethods: newTeacherData.paymentMethods || '',
      whatsapp: newTeacherData.whatsapp || '',
      groups: [
        { id: `group-custom-${newId}`, nameAr: "المجموعة الافتراضية", nameEn: "Default Group" }
      ]
    };
    setInstructors((prev) => [...prev, newTeacherObj]);
    saveInstructor(newTeacherObj);
  };
  const handleEditTeacher = (id, updatedData) => {
    setInstructors((prev) =>
      prev.map((inst) => {
        if (inst.id === id) {
          const updated = { ...inst, ...updatedData };
          saveInstructor(updated);
          return updated;
        }
        return inst;
      })
    );
  };

  const handleDeleteTeacher = (id) => {
    setInstructors((prev) => prev.filter((inst) => inst.id !== id));
    if (landingPodiumTeacherId === id) {
      setLandingPodiumTeacherId(null);
    }
    deleteInstructor(id);
  };

  const handleToggleSubscription = (id) => {
    setInstructors((prev) =>
      prev.map((inst) => {
        if (inst.id === id) {
          const updated = { ...inst, isSubscribed: !inst.isSubscribed };
          saveInstructor(updated);
          return updated;
        }
        return inst;
      })
    );
  };

  const handleUpdateTeacherLimit = (id, limit) => {
    setInstructors((prev) =>
      prev.map((inst) => {
        if (inst.id === id) {
          const updated = { ...inst, maxStudentsLimit: limit };
          saveInstructor(updated);
          return updated;
        }
        return inst;
      })
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
    const nextLang = lang === 'ar' ? 'en' : 'ar';
    setLang(nextLang);
    localStorage.setItem('edu_lang', nextLang);
    triggerToast(lang === 'ar' ? 'Switched to English' : 'تم تغيير اللغة إلى العربية', 'success');
  };

  const handleThemeToggle = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('edu_theme', nextTheme);
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
  const handleLogin = async (profileData) => {
    // Generate and store unique session token to prevent concurrent logins on multiple devices
    const newToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('edu_session_token', newToken);

    if (isSupabaseConfigured()) {
      try {
        const supabase = await getSupabase();
        await supabase.auth.updateUser({ data: { current_session_token: newToken } });
      } catch (err) {
        console.warn("Failed to sync session token with Supabase Auth metadata:", err);
      }
    }

    let formattedName = profileData.name;
    if (profileData.role === 'instructor') {
      formattedName = formatTeacherName(profileData.name);
    }
    
    // Existing user direct login or auto-match existing account by email
    const cleanEmail = (profileData.email || '').trim().toLowerCase();
    const existingInstructor = cleanEmail ? instructors.find(i => i.email?.trim().toLowerCase() === cleanEmail) : null;
    const existingStudent = cleanEmail ? students.find(s => s.email?.trim().toLowerCase() === cleanEmail) : null;

    if (profileData.isExisting || existingInstructor || existingStudent) {
      const match = (profileData.role === 'instructor' ? existingInstructor : (profileData.role === 'student' ? existingStudent : null)) || existingInstructor || existingStudent;
      const matchedRole = match ? (match === existingInstructor ? 'instructor' : 'student') : profileData.role;
      const targetId = match ? match.id : profileData.id;
      
      setIsLoggedIn(true);
      setCurrentUser({
        id: targetId,
        name: match?.nameAr || match?.nameEn || formattedName,
        role: matchedRole,
        avatar: match?.avatar || profileData.avatar,
        email: match?.email || profileData.email,
        isSubscribed: match?.isSubscribed ?? profileData.isSubscribed,
        ...(match || {})
      });
      setUserRole(matchedRole);
      if (matchedRole === 'instructor') {
        setActiveInstructorId(targetId);
      } else if (matchedRole === 'student') {
        setActiveStudentId(targetId);
      }
      setShowLoginModal(false);
      triggerToast(lang === 'ar' ? `مرحباً بعودتك يا ${match?.nameAr || formattedName}!` : `Welcome back, ${match?.nameEn || formattedName}!`, 'success');
      return;
    }
    
    const updatedProfileData = { ...profileData, name: formattedName };
    setCurrentUser(updatedProfileData);
    setIsLoggedIn(true);
    setShowLoginModal(false); // Close login modal if open

    if (updatedProfileData.role === 'instructor') {
      // Create new instructor profile in list
      const newTeacherId = instructors.length > 0 ? Math.max(...instructors.map(i => Number(i.id) || 100)) + 1 : 101;
      const rawStages = profileData.grades || ['sec'];
      const instructorGrades = rawStages.map((stage) => {
        let nameAr = "ثانوي";
        let nameEn = "High School";
        if (stage === 'primary') { nameAr = "ابتدائي"; nameEn = "Primary"; }
        else if (stage === 'prep') { nameAr = "إعدادي"; nameEn = "Middle School"; }
        else if (stage === 'sec') { nameAr = "ثانوي"; nameEn = "High School"; }
        else if (stage === 'univ') { nameAr = "جامعي"; nameEn = "University"; }
        
        return {
          id: `grade-${stage}-${newTeacherId}`,
          nameAr,
          nameEn,
          groups: [
            { id: `group-custom-${newTeacherId}`, nameAr: "المجموعة الافتراضية", nameEn: "Default Group", time: "08:00 PM" }
          ]
        };
      });

      const newTeacherObj = {
        id: newTeacherId,
        email: (profileData.email || '').trim().toLowerCase(), // Save normalized email!
        nameAr: formattedName,
        nameEn: formattedName,
        avatar: profileData.avatar,
        subjectAr: profileData.subject || "الرياضيات",
        subjectEn: profileData.subject || "Mathematics",
        yearAr: profileData.yearAr || "ثانوي",
        yearEn: profileData.yearEn || "High School",
        isSubscribed: false, // Starts as free/unapproved (hidden from visitors)
        grades: instructorGrades,
        groups: [
          { id: `group-custom-${newTeacherId}`, nameAr: "المجموعة الافتراضية", nameEn: "Default Group", time: "08:00 PM", password: profileData.password }
        ],
        password: profileData.password
      };
      setInstructors((prev) => [...prev, newTeacherObj]);
      saveInstructor(newTeacherObj); // Persist to Supabase instantly!
      setActiveInstructorId(newTeacherId);
      setUserRole('instructor');
      triggerToast(lang === 'ar' ? `مرحباً بك يا معلم ${formattedName}!` : `Welcome Instructor ${formattedName}!`, 'success');
    } else if (updatedProfileData.role === 'admin') {
      setUserRole('admin');
      triggerToast(lang === 'ar' ? `مرحباً بك يا مدير المنصة ${profileData.name}!` : `Welcome Admin ${profileData.name}!`, 'success');
    } else {
      // Create new student profile in list
      const newStudentId = students.length > 0 ? Math.max(...students.map(s => Number(s.id) || 0)) + 1 : 1;
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
            groupId: profileData.groupId || "math-a",
            password: profileData.password 
          }
        ],
        grades: [
          { id: 900, instructorId: updatedProfileData.instructorId ? Number(updatedProfileData.instructorId) : 101, titleAr: "اختبار مبدئي", titleEn: "Initial Quiz", score: 0, max: 100 }
        ],
        attendance: [],
        password: profileData.password
      };
      setStudents((prev) => [...prev, newStudentObj]);
      saveStudent(newStudentObj); // Persist to Supabase instantly!
      setActiveStudentId(newStudentId);
      setUserRole('student');
      triggerToast(lang === 'ar' ? `مرحباً بك يا طالب ${formattedName}!` : `Welcome Student ${formattedName}!`, 'success');
    }
  };

  const handleLogout = async () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setUserRole('landing');
    
    // Call Supabase signOut
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      supabase.auth.signOut();
    }
    setSupabaseUser(null);
    triggerToast(lang === 'ar' ? 'تم تسجيل الخروج بنجاح' : 'Successfully logged out', 'success');
  };

  // Periodically check for concurrent logins from other devices
  useEffect(() => {
    if (!isSupabaseConfigured() || !isLoggedIn) return;

    const checkSession = async () => {
      try {
        const supabase = await getSupabase();
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) return;

        const dbToken = user.user_metadata?.current_session_token;
        const localToken = localStorage.getItem('edu_session_token');

        if (dbToken && localToken && dbToken !== localToken) {
          // Log out immediately!
          handleLogout();
          triggerToast(
            lang === 'ar' 
              ? 'تم تسجيل الدخول إلى هذا الحساب من جهاز آخر! تم تسجيل خروجك لحماية حسابك.' 
              : 'This account has been logged in from another device! You have been logged out to protect your account.',
            'error'
          );
        }
      } catch (err) {
        console.warn("Error checking session concurrency:", err);
      }
    };

    // Check on mount/focus
    checkSession();
    
    const interval = setInterval(checkSession, 10000); // Check every 10 seconds
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSession();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isLoggedIn, lang]);

  const clearSupabaseSession = async () => {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      supabase.auth.signOut();
    }
    setSupabaseUser(null);
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
    if (!isLoggedIn) {
      clearSupabaseSession();
    }
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
            const updated = {
              ...inst,
              nameAr: formattedName,
              nameEn: formattedName,
              avatar: updatedData.avatar,
              subjectAr: updatedData.subject,
              subjectEn: updatedData.subject,
              videoUrl: updatedData.videoUrl,
              introVideo: updatedData.videoUrl,
              aboutAr: updatedData.aboutAr !== undefined ? updatedData.aboutAr : inst.aboutAr,
              aboutEn: updatedData.aboutEn !== undefined ? updatedData.aboutEn : inst.aboutEn,
              price: updatedData.price !== undefined ? updatedData.price : inst.price,
              paymentMethods: updatedData.paymentMethods !== undefined ? updatedData.paymentMethods : inst.paymentMethods,
              yearAr: updatedData.yearAr || inst.yearAr,
              yearEn: updatedData.yearEn || inst.yearEn,
              whatsapp: updatedData.whatsapp !== undefined ? updatedData.whatsapp : inst.whatsapp,
              cashNumber: updatedData.cashNumber !== undefined ? updatedData.cashNumber : inst.cashNumber,
              paymentType: updatedData.paymentType !== undefined ? updatedData.paymentType : inst.paymentType
            };
            saveInstructor(updated);
            return updated;
          }
          return inst;
        })
      );
    } else {
      // Update student list record matching active profile
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id === activeStudentId) {
            const updated = {
              ...s,
              nameAr: formattedName,
              nameEn: formattedName,
              avatar: updatedData.avatar,
              parentPhone: updatedData.parentPhone || s.parentPhone
            };
            saveStudent(updated);
            return updated;
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
    const newSessionId = newSessionData.id || (sessions.length + 1000 + Math.floor(Math.random() * 900));
    const newSession = {
      ...newSessionData,
      id: newSessionId,
    };
    
    // Add session to sessions list
    setSessions((prevSessions) => [...prevSessions, newSession]);

    // Simulate initial attendance for all students enrolled in this group
    setStudents((prevStudents) =>
      prevStudents.map((student) => {
        // Only add attendance check if student is enrolled in this teacher group
        const isEnrolled = student.enrollments.some(
          (e) => e.instructorId === newSessionData.instructorId && 
                 (!newSessionData.groupId || e.groupId === newSessionData.groupId) &&
                 (!newSessionData.gradeId || e.gradeId === newSessionData.gradeId)
        );

        if (isEnrolled) {
          // Default to absent, so they can scan the QR code to mark present!
          const newAttendance = {
            instructorId: newSessionData.instructorId,
            sessionId: newSessionId,
            date: newSessionData.date || new Date().toISOString().split('T')[0],
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
    return newSessionId;
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

          const updatedGrades = [...(student.grades || [])];
          const hasAttendanceGrade = updatedGrades.some(g => g.instructorId === instructorId && g.sessionId === sessionId);

          if (logIdx > -1) {
            const updatedAttendance = [...student.attendance];
            updatedAttendance[logIdx] = {
              ...updatedAttendance[logIdx],
              status: 'present'
            };
            
            if (!hasAttendanceGrade) {
              updatedGrades.push({
                id: Date.now(),
                instructorId: instructorId,
                sessionId: sessionId,
                titleAr: `حضور الحصة #${sessionId}`,
                titleEn: `Attendance Session #${sessionId}`,
                score: 100,
                max: 100,
                date: new Date().toISOString().split('T')[0]
              });
            }

            success = true;
            return {
              ...student,
              attendance: updatedAttendance,
              grades: updatedGrades
            };
          } else {
            // Log doesn't exist, create a new present log
            const newLog = {
              instructorId: instructorId,
              sessionId: sessionId,
              date: new Date().toISOString().split('T')[0],
              status: 'present'
            };

            if (!hasAttendanceGrade) {
              updatedGrades.push({
                id: Date.now(),
                instructorId: instructorId,
                sessionId: sessionId,
                titleAr: `حضور الحصة #${sessionId}`,
                titleEn: `Attendance Session #${sessionId}`,
                score: 100,
                max: 100,
                date: new Date().toISOString().split('T')[0]
              });
            }

            success = true;
            return {
              ...student,
              attendance: [...student.attendance, newLog],
              grades: updatedGrades
            };
          }
        }
        return student;
      })
    );

    return success;
  };

  // Derived active instructor & student with robust fallbacks
  const activeInstructor = instructors.find(i => i.id === activeInstructorId || (currentUser?.email && i.email?.trim().toLowerCase() === currentUser.email?.trim().toLowerCase())) || 
                           (currentUser?.role === 'instructor' ? currentUser : null) || 
                           instructors[0] || null;

  const activeStudent = students.find(s => s.id === activeStudentId || (currentUser?.email && s.email?.trim().toLowerCase() === currentUser.email?.trim().toLowerCase())) || 
                        (currentUser?.role === 'student' ? currentUser : null) || 
                        students[0] || null;

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
            <button className="config-btn" onClick={handleLangToggle} aria-label={lang === 'ar' ? 'English' : 'العربية'}>
              <Globe size={16} />
              <span className="hide-on-mobile">{lang === 'ar' ? 'English' : 'العربية'}</span>
            </button>
            <button className="config-btn" onClick={handleThemeToggle} aria-label={lang === 'ar' ? 'تغيير المظهر' : 'Toggle Theme'}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              <span className="hide-on-mobile">
                {lang === 'ar' ? (theme === 'dark' ? 'المظهر الفاتح' : 'المظهر الداكن') : (theme === 'dark' ? 'Light Mode' : 'Dark Mode')}
              </span>
            </button>
            <button className="btn-primary" onClick={() => setShowLoginModal(true)} style={{ width: 'auto', padding: '0.55rem 1.25rem' }}>
              {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
            </button>
          </div>
        </header>

        <main className="visitor-main-content">
          {/* Hero Section */}
          <section className="visitor-hero">
          <div className="visitor-hero-overlay"></div>
          
          {/* Floating Educational Background Elements */}
          <div className="hero-decorations" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
            <Pencil className="floating-shape" style={{ top: '15%', left: '20%', transform: 'rotate(-45deg)', animationDelay: '0s' }} size={56} />
            <Ruler className="floating-shape" style={{ top: '22%', right: '22%', transform: 'rotate(30deg)', animationDelay: '1.5s' }} size={52} />
            <Lightbulb className="floating-shape" style={{ top: '65%', left: '18%', transform: 'rotate(15deg)', animationDelay: '3s' }} size={58} />
            <GraduationCap className="floating-shape" style={{ top: '10%', right: '32%', transform: 'rotate(-10deg)', animationDelay: '0.8s' }} size={64} />
            <BookOpen className="floating-shape" style={{ bottom: '20%', right: '20%', transform: 'rotate(20deg)', animationDelay: '2.3s' }} size={54} />
            <Pencil className="floating-shape" style={{ bottom: '15%', left: '32%', transform: 'rotate(60deg)', animationDelay: '4s' }} size={48} />
            <Lightbulb className="floating-shape" style={{ top: '50%', right: '35%', transform: 'rotate(-20deg)', animationDelay: '5s' }} size={50} />
            <Ruler className="floating-shape" style={{ bottom: '35%', left: '24%', transform: 'rotate(-15deg)', animationDelay: '2.7s' }} size={56} />
          </div>

          <div className="visitor-hero-content" style={{ animation: 'slide-in 0.4s ease-out', zIndex: 5, width: '100%' }}>
            <span className="hero-badge">{lang === 'ar' ? 'منصة الربط الأكاديمي والتعليم التفاعلي' : 'Interactive Academic Linking Platform'}</span>
            <h1>{lang === 'ar' ? 'أكاديمية التعليم المتكاملة' : 'Integrated EduAcademy Hub'}</h1>
            <p>{lang === 'ar' ? 'منظومة إلكترونية متطورة تربط المدرسين بطلاب السنتر. تابع مستواك الدراسي، تفاعل مع الدروس المصورة، وسجّل حضورك اليومي بالـ QR code بكل سهولة.' : 'An advanced electronic ecosystem linking tutors with center students. Track your performance, engage with recorded lecture modules, and log daily attendance via QR codes.'}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center', marginTop: '2.5rem' }}>
              {/* New Registrations Row */}
              <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button className="btn-primary" onClick={() => { setLoginModalRole('student'); setShowLoginModal(true); }} style={{ width: 'auto', padding: '0.75rem 1.75rem', fontSize: '1rem', backgroundColor: 'var(--accent-purple)' }}>
                  {lang === 'ar' ? 'ابدأ كطالب (حساب جديد)' : 'Start as Student (New)'}
                </button>
                <button className="btn-primary" onClick={() => { setLoginModalRole('instructor'); setShowLoginModal(true); }} style={{ width: 'auto', padding: '0.75rem 1.75rem', fontSize: '1rem' }}>
                  {lang === 'ar' ? 'ابدأ كمعلم (حساب جديد)' : 'Start as Teacher (New)'}
                </button>
              </div>
              
              {/* Secondary Actions Row */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button className="config-btn" onClick={() => document.getElementById('explore-section').scrollIntoView({ behavior: 'smooth' })} style={{ padding: '0.75rem 2.2rem', fontSize: '1rem' }}>
                  {lang === 'ar' ? 'استكشف المزايا' : 'Explore Features'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Top 10 VIP Instructors Infinite Loop Row */}
        {subscribedTeachers.length > 0 && (
          <div className="marquee-container">
            <div className="marquee-track">
              {/* Dynamically duplicate the teachers array until it contains at least 32 cards to guarantee there is never blank space on wide viewports */}
              {(() => {
                const repeatedList = [];
                if (subscribedTeachers.length > 0) {
                  while (repeatedList.length < 32) {
                    repeatedList.push(...subscribedTeachers);
                  }
                }
                return repeatedList.map((teacher, idx) => (
                  <div 
                    key={`${teacher.id}-${idx}`} 
                    className="marquee-teacher-card"
                    onClick={() => setSelectedTeacherDetails(teacher)}
                  >
                    <img 
                      src={teacher.avatar} 
                      alt={teacher.nameEn} 
                      style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-gold)', boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)' }}
                    />
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>{lang === 'ar' ? teacher.nameAr : teacher.nameEn}</h4>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', display: 'block', marginTop: '0.2rem' }}>
                        {lang === 'ar' ? teacher.subjectAr : teacher.subjectEn}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '0.4rem 0.75rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                      <span>{lang === 'ar' ? 'الطلاب: ٣٠+' : 'Students: 30+'}</span>
                      <span>{lang === 'ar' ? 'المحاضرات: ٦' : 'Lectures: 6'}</span>
                    </div>
                    
                    <button className="config-btn" style={{ fontSize: '0.75rem', padding: '0.35rem 1rem', pointerEvents: 'none', border: 'none', backgroundColor: '#fff', color: '#000', fontWeight: 800, borderRadius: '8px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                      {lang === 'ar' ? 'اعرف أكثر' : 'Know More'}
                    </button>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

        {/* Main Content Tabs (Guides, Subscribed Teachers, Centers Gallery) */}
        <section id="explore-section" className="visitor-content-section" style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 1.5rem' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, textAlign: 'center', marginBottom: '2.5rem', background: 'linear-gradient(to right, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', position: 'relative', zIndex: 10 }}>
            {lang === 'ar' ? 'استكشف منصتنا التعليمية' : 'Explore Our Educational Platform'}
          </h2>
          <div className="role-selector-container" style={{ justifyContent: 'center', marginBottom: '3rem', width: '100%', gap: '1rem', position: 'relative', zIndex: 10 }}>
            <button 
              className={`role-tab ${visitorTab === 'guide' ? 'active' : ''}`}
              onClick={() => setVisitorTab('guide')}
              style={{ fontSize: '1.05rem', padding: '0.75rem 1.5rem', cursor: 'pointer' }}
            >
              {lang === 'ar' ? 'كيفية الاستخدام' : 'How It Works'}
            </button>
            <button 
              className={`role-tab ${visitorTab === 'teachers' ? 'active' : ''}`}
              onClick={() => setVisitorTab('teachers')}
              style={{ fontSize: '1.05rem', padding: '0.75rem 1.5rem', cursor: 'pointer' }}
            >
              {lang === 'ar' ? 'المدرسين' : 'Instructors'}
            </button>
          </div>

          {visitorTab === 'guide' && (
            <div className="guide-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', width: '100%' }}>
              
              {/* Column 1: Student & Parent Gate (3 Cards) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <GraduationCap size={28} color="var(--accent-purple)" />
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 850, margin: 0 }}>
                    {lang === 'ar' ? 'حساب الطلاب وأولياء الأمور' : 'Student & Parent Accounts'}
                  </h3>
                </div>

                {/* Card 1: Registration & Search */}
                <div className="glass-card" style={{ 
                  flex: 1,
                  padding: '1.5rem', 
                  borderRadius: '20px', 
                  border: '1px solid rgba(139, 92, 246, 0.3)', 
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.04) 0%, rgba(99, 102, 241, 0.08) 100%)',
                  boxShadow: '0 4px 20px rgba(139, 92, 246, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  textAlign: 'start'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Link size={20} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-purple)' }}>
                      {lang === 'ar' ? '1. التسجيل والبحث عن المدرسين' : '1. Registration & Search'}
                    </h3>
                  </div>
                  <ul className="guide-list" style={{ color: 'var(--text-secondary)', paddingInlineStart: '1.25rem', fontSize: '0.85rem', lineHeight: '1.7', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li>{lang === 'ar' ? 'التسجيل الفوري والمباشر عن طريق الرابط الخاص بالمدرس (Invitation Link).' : 'Register instantly via the instructor\'s invitation link.'}</li>
                    <li>{lang === 'ar' ? 'التسجيل السريع بمسح كود الـ QR الخاص بالمدرس أو إدخال كود الدعوة (Invitation Code) المرسل منه.' : 'Scan QR code or enter the teacher\'s specific invitation code to join.'}</li>
                    <li>{lang === 'ar' ? 'البحث الذكي عن المدرسين المتميزين واختيار الدروس (أونلاين أو أوفلاين بالسنتر) مع المتابعة المستمرة لمجموعاتهم.' : 'Search top teachers, choose online/offline center lessons and follow their groups.'}</li>
                  </ul>
                </div>

                {/* Card 2: Student Learning & Benefits */}
                <div className="glass-card" style={{ 
                  flex: 1,
                  padding: '1.5rem', 
                  borderRadius: '20px', 
                  border: '1px solid rgba(16, 185, 129, 0.3)', 
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.04) 0%, rgba(20, 184, 166, 0.08) 100%)',
                  boxShadow: '0 4px 20px rgba(16, 185, 129, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  textAlign: 'start'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Activity size={20} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-green)' }}>
                      {lang === 'ar' ? '2. رحلتك التعليمية واستفادتك من المنصة' : '2. Student Learning & Benefits'}
                    </h3>
                  </div>
                  <ul className="guide-list" style={{ color: 'var(--text-secondary)', paddingInlineStart: '1.25rem', fontSize: '0.85rem', lineHeight: '1.7', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li>{lang === 'ar' ? 'مكتبة دروس مسجلة متكاملة في حسابك للرجوع للشروحات والمراجعات في أي وقت لضمان فهمك.' : 'Access a library of recorded sessions and revisions anytime to guarantee full comprehension.'}</li>
                    <li>{lang === 'ar' ? 'أداء الكويزات القصيرة (Mini Quizzes) بعد الحصص والواجبات المنزلية مع تصحيح ذكي فوري.' : 'Take quick mini-quizzes after lessons and assignments with instant smart grading.'}</li>
                    <li>{lang === 'ar' ? 'لوحة تحكم تفصيلية تسجل جميع درجات الاختبارات، ونسب الحضور، ودرجات التاسكات والواجبات بدقة.' : 'Detailed report dashboard recording quiz scores, attendance logs, and task completions.'}</li>
                    <li>{lang === 'ar' ? 'الوصول المباشر، التحدث، والتفاعل الفوري مع المدرس لمناقشة الأسئلة الصعبة بكل سهولة.' : 'Direct chat and instant interaction with the teacher to discuss complex topics.'}</li>
                  </ul>
                </div>

                {/* Card 3: Parent Tracking & Reports */}
                <div className="glass-card" style={{ 
                  flex: 1,
                  padding: '1.5rem', 
                  borderRadius: '20px', 
                  border: '1px solid rgba(245, 158, 11, 0.3)', 
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.04) 0%, rgba(251, 146, 60, 0.08) 100%)',
                  boxShadow: '0 4px 20px rgba(245, 158, 11, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  textAlign: 'start'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp size={20} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-gold)' }}>
                      {lang === 'ar' ? '3. بوابة ولي الأمر والمتابعة الذكية' : '3. Parent Tracking & Reports'}
                    </h3>
                  </div>
                  <ul className="guide-list" style={{ color: 'var(--text-secondary)', paddingInlineStart: '1.25rem', fontSize: '0.85rem', lineHeight: '1.7', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li>{lang === 'ar' ? 'إرسال تقارير دورية وفورية مباشرة لولي الأمر توضح سلوك الطالب ومدى التزامه بالحضور.' : 'Receive periodic and instant reports detailing student behavior and attendance.'}</li>
                    <li>{lang === 'ar' ? 'رسوم بيانية توضح مؤشرات تطور مستوى الطالب الدراسي أو تراجعه مع تحليلات ذكية للمستوى.' : 'Progress graphs plotting the student\'s development metrics or regressions with smart analytical logs.'}</li>
                    <li>{lang === 'ar' ? 'إشعارات تلقائية عبر الواتساب فور رصد الغياب أو تسجيل درجات كويز جديد لإبقاء ولي الأمر في الصورة.' : 'Automated WhatsApp alerts for absences or graded homework, keeping parents constantly involved.'}</li>
                  </ul>
                </div>
              </div>

              {/* Column 2: Teacher Gate (3 Cards) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <BookOpen size={28} color="var(--accent-primary)" />
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 850, margin: 0 }}>
                    {lang === 'ar' ? 'حساب المعلم' : 'Instructor Accounts'}
                  </h3>
                </div>

                {/* Card 1: How the Instructor uses the platform */}
                <div className="glass-card" style={{ 
                  flex: 1,
                  padding: '1.5rem', 
                  borderRadius: '20px', 
                  border: '1px solid rgba(99, 102, 241, 0.3)', 
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.04) 0%, rgba(139, 92, 246, 0.08) 100%)',
                  boxShadow: '0 4px 20px rgba(99, 102, 241, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  textAlign: 'start'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={20} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                      {lang === 'ar' ? '1. طريقة استخدام المعلم للمنصة' : '1. How Tutors Use the Platform'}
                    </h3>
                  </div>
                  <ul className="guide-list" style={{ color: 'var(--text-secondary)', paddingInlineStart: '1.25rem', fontSize: '0.85rem', lineHeight: '1.7', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li>{lang === 'ar' ? 'إنشاء مجموعات دراسية نشطة وإدارتها بالكامل بشكل مستقل عبر مختلف المراحل التعليمية.' : 'Establish and manage class groups across all educational phases independently.'}</li>
                    <li>{lang === 'ar' ? 'توليد كود الـ QR الذكي لتسجيل الحضور للطلاب في القاعة بشكل لحظي وسريع.' : 'Generate live QR codes for instantaneous in-class student attendance logging.'}</li>
                    <li>{lang === 'ar' ? 'إضافة الدروس، المحاضرات المرئية المسجلة، المذكرات، وتحديد الأسعار وطرق الدفع بحرية.' : 'Publish video lectures, files, mementos, fees, and preferred payment channels easily.'}</li>
                    <li>{lang === 'ar' ? 'توليد دعوة الانضمام والروابط المباشرة لسهولة التحاق الطلاب بمجموعاتك.' : 'Generate direct invitation links and codes for effortless student onboarding.'}</li>
                  </ul>
                </div>

                {/* Card 2: How the Instructor benefits */}
                <div className="glass-card" style={{ 
                  flex: 1,
                  padding: '1.5rem', 
                  borderRadius: '20px', 
                  border: '1px solid rgba(244, 63, 94, 0.3)', 
                  background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.04) 0%, rgba(225, 29, 72, 0.08) 100%)',
                  boxShadow: '0 4px 20px rgba(244, 63, 94, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  textAlign: 'start'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Activity size={20} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-red)' }}>
                      {lang === 'ar' ? '2. استفادة المعلم ومميزات الأتمتة' : '2. Benefits & Automation for Instructors'}
                    </h3>
                  </div>
                  <ul className="guide-list" style={{ color: 'var(--text-secondary)', paddingInlineStart: '1.25rem', fontSize: '0.85rem', lineHeight: '1.7', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li>{lang === 'ar' ? 'تصحيح تلقائي فوري للكويزات والاختبارات بالذكاء الاصطناعي مع رصد آلي للدرجات لتوفير الوقت.' : 'Instant AI grading for quizzes with automated score logging to save time and effort.'}</li>
                    <li>{lang === 'ar' ? 'مساعد ذكاء اصطناعي ذكي يتواصل مع طلابك ويرد بأسلوبك وشرحك الخاص لتخفيف العبء.' : 'Custom AI assistant answering student questions in your tone based on summaries.'}</li>
                    <li>{lang === 'ar' ? 'رصد آلي ومتابعة مستمرة لمنحنى تطور كل طالب لتحديد نقاط الضعف والقوة بدقة.' : 'Track student learning curve metrics and highlight academic strengths or weaknesses.'}</li>
                    <li>{lang === 'ar' ? 'إرسال تقارير الغياب، السلوك، والدرجات لولي الأمر تلقائياً عبر الواتساب لضمان التواصل.' : 'Automated WhatsApp alerts to parents detailing absences, scores, and behavioral milestones.'}</li>
                  </ul>
                </div>

                {/* Card 3: VIP Upgrade & Promotion */}
                <div className="glass-card" style={{ 
                  flex: 1,
                  padding: '1.5rem', 
                  borderRadius: '20px', 
                  border: '1px solid rgba(245, 158, 11, 0.3)', 
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.04) 0%, rgba(251, 146, 60, 0.08) 100%)',
                  boxShadow: '0 4px 20px rgba(245, 158, 11, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  textAlign: 'start'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Star size={20} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-gold)' }}>
                      {lang === 'ar' ? '3. ترقية النظام والظهور الترويجي' : '3. VIP Upgrade & Platform Promotion'}
                    </h3>
                  </div>
                  <ul className="guide-list" style={{ color: 'var(--text-secondary)', paddingInlineStart: '1.25rem', fontSize: '0.85rem', lineHeight: '1.7', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li>{lang === 'ar' ? 'الترقية إلى نظام VIP للظهور المميز والمباشر في لوحة أفضل 10 مدرسين بالصفحة الرئيسية للمنصة.' : 'Upgrade to VIP for direct premier placement in the top 10 teachers row on the landing page.'}</li>
                    <li>{lang === 'ar' ? 'الاستفادة من العروض الترويجية والحملات التسويقية والاعلانية لرفع اسمك على محركات البحث.' : 'Take advantage of our platform-wide promotional ad campaigns to feature your profile.'}</li>
                    <li>{lang === 'ar' ? 'الظهور لعدد أكبر من الطلاب وأولياء الأمور في صفحات البحث الرئيسية، مما يضاعف معدل تسجيلات المشتركين.' : 'Ensure maximum exposure to new students and parents, scaling your student base and subscriptions.'}</li>
                  </ul>
                </div>
              </div>

            </div>
          )}

          {visitorTab === 'teachers' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
              {/* Search Bar */}
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%', maxWidth: '500px', margin: '0 auto 0.5rem auto', position: 'relative', zIndex: 5 }}>
                <input
                  type="text"
                  placeholder={lang === 'ar' ? '🔍 ابحث عن مدرس بالاسم أو المادة أو الصف...' : '🔍 Search teachers by name, subject or grade...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1.5rem',
                    borderRadius: '50px',
                    border: '1px solid var(--border-glass)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem',
                    outline: 'none',
                    textAlign: 'center',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>

              {/* Grid */}
              <div className="visitor-teachers-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                {subscribedTeachers.filter(t => {
                  const q = searchQuery.toLowerCase().trim();
                  if (!q) return true;
                  const nameAr = (t.nameAr || '').toLowerCase();
                  const nameEn = (t.nameEn || '').toLowerCase();
                  const subjectAr = (t.subjectAr || '').toLowerCase();
                  const subjectEn = (t.subjectEn || '').toLowerCase();
                  const yearAr = (t.yearAr || '').toLowerCase();
                  const yearEn = (t.yearEn || '').toLowerCase();
                  return nameAr.includes(q) || nameEn.includes(q) || subjectAr.includes(q) || subjectEn.includes(q) || yearAr.includes(q) || yearEn.includes(q);
                }).length > 0 ? (
                  subscribedTeachers.filter(t => {
                    const q = searchQuery.toLowerCase().trim();
                    if (!q) return true;
                    const nameAr = (t.nameAr || '').toLowerCase();
                    const nameEn = (t.nameEn || '').toLowerCase();
                    const subjectAr = (t.subjectAr || '').toLowerCase();
                    const subjectEn = (t.subjectEn || '').toLowerCase();
                    const yearAr = (t.yearAr || '').toLowerCase();
                    const yearEn = (t.yearEn || '').toLowerCase();
                    return nameAr.includes(q) || nameEn.includes(q) || subjectAr.includes(q) || subjectEn.includes(q) || yearAr.includes(q) || yearEn.includes(q);
                  }).map((teacher) => (
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
                      {lang === 'ar' ? 'لا يوجد نتائج تطابق بحثك حالياً.' : 'No teachers matches your search query.'}
                    </p>
                  </div>
                )}
              </div>
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
                <picture>
                  <source srcSet={`${import.meta.env.BASE_URL}classroom.webp`} type="image/webp" />
                  <img 
                    src={`${import.meta.env.BASE_URL}classroom.webp`} 
                    alt="Smart Classroom AI" 
                    style={{ width: '100%', height: '260px', objectFit: 'cover', borderBottom: '1px solid var(--border-glass)' }}
                    fetchpriority="high"
                    loading="eager"
                  />
                </picture>
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
                <picture>
                  <source srcSet={`${import.meta.env.BASE_URL}lobby.webp`} type="image/webp" />
                  <img 
                    src={`${import.meta.env.BASE_URL}lobby.webp`} 
                    alt="Luxury Lobby AI" 
                    style={{ width: '100%', height: '260px', objectFit: 'cover', borderBottom: '1px solid var(--border-glass)' }}
                    loading="lazy"
                  />
                </picture>
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
      </main>

        {/* Visitor Footer with Google Compliance Links */}
        <footer className="visitor-footer" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', borderTop: '1px solid var(--border-glass)', marginTop: '4rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <p>© 2026 {lang === 'ar' ? 'منصة أكاديمية التعليم الرقمية التفاعلية.' : 'EduAcademy Interactive Digital Platform. All rights reserved.'}</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a 
              href="/privacy.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}
            >
              {lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </a>
            <a 
              href="/terms.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}
            >
              {lang === 'ar' ? 'شروط الاستخدام' : 'Terms of Use'}
            </a>
            {showAdminPanel && (
              <>
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
              </>
            )}
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
            <React.Suspense fallback={
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
                <span className="loader" style={{ width: '30px', height: '30px', borderTopColor: 'var(--accent-primary)' }}></span>
              </div>
            }>
              <Login mode={loginModalRole ? 'signup' : 'login'} onLogin={handleLogin} lang={lang} instructors={instructors} students={students} initialRole={loginModalRole} onClose={handleCloseLoginModal} supabaseUser={supabaseUser} isLoading={isLoading} />
            </React.Suspense>
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
        onPlayVideo={handlePlayVideo}
      />

      {/* Main Panel Viewport */}
      <main className="main-viewport">
        {/* Page Header */}
        <header className="page-header">
          <div className="header-title">
            {userRole === 'instructor' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div 
                  style={{ position: 'relative', cursor: activeInstructor?.videoUrl ? 'pointer' : 'default' }}
                  onClick={() => activeInstructor?.videoUrl && handlePlayVideo(activeInstructor.videoUrl)}
                  title={activeInstructor?.videoUrl ? (lang === 'ar' ? 'تشغيل الفيديو التعريفي' : 'Play Intro Video') : ''}
                >
                  <img 
                    src={activeInstructor?.avatar} 
                    alt="Avatar" 
                    style={{ 
                      width: '60px', 
                      height: '60px', 
                      borderRadius: '50%', 
                      objectFit: 'cover', 
                      border: activeInstructor?.isSubscribed ? '3px solid var(--color-gold)' : '2px solid var(--accent-primary)',
                      boxShadow: activeInstructor?.isSubscribed ? '0 0 12px var(--color-gold)' : 'none'
                    }} 
                  />
                  {activeInstructor?.videoUrl && (
                    <div style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: 'var(--accent-primary)', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-app)' }}>
                      <Play size={10} color="white" fill="white" />
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                  <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {lang === 'ar' ? activeInstructor?.nameAr : activeInstructor?.nameEn}
                  </h1>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--accent-primary)', fontSize: '0.95rem', fontWeight: 500 }}>
                      {lang === 'ar' ? activeInstructor?.subjectAr : activeInstructor?.subjectEn}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>•</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 400 }}>
                      {lang === 'ar' ? activeInstructor?.yearAr : activeInstructor?.yearEn}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <h1 style={{ margin: 0 }}>
                  {userRole === 'landing' && t.guestHeadline}
                  {userRole === 'admin' && (lang === 'ar' ? 'لوحة تحكم مدير النظام' : 'System Admin Console')}
                  {userRole === 'student' && (lang === 'ar' ? activeStudent?.nameAr : activeStudent?.nameEn)}
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
            {instructors.filter(i => i.isSubscribed).length > 0 ? (
              <>
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
              </>
            ) : (
              <div className="glass-card" style={{ gridColumn: 'span 12', padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <Award size={64} color="var(--accent-purple)" style={{ opacity: 0.8 }} />
                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 800 }}>
                  {lang === 'ar' ? 'مرحباً بك في المنصة التعليمية!' : 'Welcome to the Educational Platform!'}
                </h3>
                <p style={{ margin: 0, maxWidth: '600px', lineHeight: '1.7', fontSize: '0.95rem' }}>
                  {lang === 'ar' 
                    ? 'سيتم عرض المدرسين المشتركين ولوحة شرف الطلاب المتفوقين هنا فور تفعيل الاشتراكات. إذا كنت معلماً، يمكنك إنشاء حسابك وتفعيله للظهور للطلاب.' 
                    : 'Subscribed instructors and the student honors board will be displayed here once subscriptions are active. If you are a teacher, register your account and activate it to start.'}
                </p>
              </div>
            )}
          </div>
        )}

        <React.Suspense fallback={
          <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem 0', width: '100%' }}>
            <span className="loader" style={{ width: '40px', height: '40px', borderTopColor: 'var(--accent-primary)' }}></span>
          </div>
        }>
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
              onPaySubscription={() => activeInstructor && handleToggleSubscription(activeInstructor.id)}
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

          {userRole === 'support' && (
            <SupportDashboard
              students={students}
              lang={lang}
              onLogout={handleLogout}
              currentUser={currentUser}
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
              supportAgents={supportAgents}
              onAddSupportAgent={handleAddSupportAgent}
              onDeleteSupportAgent={handleDeleteSupportAgent}
              onUpdateTeacherLimit={handleUpdateTeacherLimit}
            />
          )}
        </React.Suspense>

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
                <CloseIcon size={20} />
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
