import React, { useState, useEffect } from 'react';
const Navbar = React.lazy(() => import('./components/Navbar'));
const Podium = React.lazy(() => import('./components/Podium'));
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
const TeacherProfileModal = React.lazy(() => import('./components/TeacherProfileModal'));
const TeacherDetailsModal = React.lazy(() => import('./components/TeacherDetailsModal'));
const VisitorBelowTheFold = React.lazy(() => import('./components/VisitorBelowTheFold'));
import { initialStudents, initialSessions, initialInstructors } from './mockData';
import { GraduationCap, Award, BookOpen, AlertCircle, Globe, Sun, Moon, User, Play, X as CloseIcon, Pencil, Ruler, Lightbulb, Link } from 'lucide-react';
import { 
  getInstructors, getStudents, getSessions, getPendingPayments, 
  saveInstructor, saveStudent, saveSession, addPendingPayment, deletePendingPayment,
  deleteInstructor
} from './db';

const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  if (url.includes('your-') || url.includes('luhaxtokriahwqruaymr') || key.includes('your-') || key.includes('anon-key')) return false;
  return true;
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
      try {
        const timeout = new Promise((resolve) => setTimeout(() => resolve(null), 1500));
        const fetchAll = Promise.all([
          getInstructors(),
          getStudents(),
          getSessions(),
          getPendingPayments()
        ]);
        const result = await Promise.race([fetchAll, timeout]);
        if (result) {
          const [insts, studs, sesss, pends] = result;
          setInstructors(insts || []);
          setStudents(studs || []);
          setSessions(sesss || []);
          setPendingPayments(pends || []);
        } else {
          // Timeout reached (e.g. unreachable Supabase host), fallback to local storage instantly
          const savedInst = localStorage.getItem('edu_instructors');
          const savedStud = localStorage.getItem('edu_students');
          const savedSess = localStorage.getItem('edu_sessions');
          const savedPend = localStorage.getItem('edu_pending_payments');
          setInstructors(savedInst ? JSON.parse(savedInst) : initialInstructors);
          setStudents(savedStud ? JSON.parse(savedStud) : initialStudents);
          setSessions(savedSess ? JSON.parse(savedSess) : initialSessions);
          setPendingPayments(savedPend ? JSON.parse(savedPend) : []);
        }
      } catch (err) {
        console.warn("loadData error, falling back:", err);
      } finally {
        setIsLoading(false);
      }
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
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)', gap: '1.25rem' }}>
        <style>{`@keyframes spinLoader { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <div style={{ width: '45px', height: '45px', border: '4px solid rgba(99, 102, 241, 0.2)', borderTop: '4px solid #6366f1', borderRadius: '50%', animation: 'spinLoader 0.8s linear infinite' }}></div>
        <p style={{ fontWeight: 700, fontSize: '1rem', color: '#6366f1' }}>{lang === 'ar' ? 'جاري تحميل المنصة...' : 'Loading Platform...'}</p>
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

        </main>

        {/* Lazy Loaded Below-The-Fold Sections (Marquee, Guides, Teachers, Centers Gallery, Footer, Legal Modals) */}
        <React.Suspense fallback={
          <div style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid rgba(99, 102, 241, 0.2)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spinLoader 0.8s linear infinite' }}></div>
          </div>
        }>
          <VisitorBelowTheFold
            lang={lang}
            subscribedTeachers={subscribedTeachers}
            showAdminPanel={showAdminPanel}
            setLoginModalRole={setLoginModalRole}
            setShowLoginModal={setShowLoginModal}
            setLandingPodiumTeacherId={setLandingPodiumTeacherId}
            setShowPodiumModal={setShowPodiumModal}
            setSelectedTeacherProfile={setSelectedTeacherProfile}
            setSelectedTeacherDetails={setSelectedTeacherDetails}
          />
        </React.Suspense>

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
            <React.Suspense fallback={null}>
              <Podium students={students} lang={lang} instructorId={landingPodiumTeacherId} onClose={() => setShowPodiumModal(false)} />
            </React.Suspense>
          </div>
        )}



        {/* Teacher Profile Modal */}
        {selectedTeacherProfile && (
          <React.Suspense fallback={null}>
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
          </React.Suspense>
        )}

        {/* Teacher Details Modal */}
        {selectedTeacherDetails && (
          <React.Suspense fallback={null}>
            <TeacherDetailsModal 
              teacher={selectedTeacherDetails} 
              lang={lang} 
              onClose={() => setSelectedTeacherDetails(null)} 
            />
          </React.Suspense>
        )}

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
    <div className={`app-layout role-${userRole}`}>
      {/* Sidebar Navigation */}
      <React.Suspense fallback={<aside className="sidebar" style={{ minWidth: '280px' }} />}>
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
      </React.Suspense>

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
                    <React.Suspense fallback={<div style={{ minHeight: '300px' }} />}>
                      <Podium students={students} lang={lang} instructorId={landingPodiumTeacherId} />
                    </React.Suspense>
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
