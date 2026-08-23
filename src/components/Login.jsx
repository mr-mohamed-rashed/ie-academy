import React, { useState, useEffect } from 'react';
import { BookOpen, User, Briefcase, Camera, Check } from 'lucide-react';
import { supabase } from '../supabaseClient';

const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to decode JWT:", e);
    return null;
  }
};

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=120"
];

const Login = ({ onLogin, lang, instructors = [], students = [], initialRole, onClose, supabaseUser }) => {
  const [showModal, setShowModal] = useState(false);
  const [inviteTeacherId, setInviteTeacherId] = useState(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');

  const [invitationCode, setInvitationCode] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const teacherId = urlParams.get('teacher') || urlParams.get('invite') || '';
    return teacherId ? `IE-${teacherId}` : '';
  });

  // Resolve Invitation Code to Teacher ID
  useEffect(() => {
    if (invitationCode) {
      const match = invitationCode.match(/IE-(\d+)/i) || invitationCode.match(/^(\d+)$/);
      if (match) {
        const id = Number(match[1]);
        const exists = instructors.some(i => i.id === id);
        if (exists) {
          setInviteTeacherId(id);
          setSelectedInstructor(id.toString());
          const teacher = instructors.find(i => i.id === id);
          if (teacher && teacher.grades && teacher.grades.length > 0) {
            setSelectedGrade(teacher.grades[0].id);
            if (teacher.grades[0].groups && teacher.grades[0].groups.length > 0) {
              setSelectedGroup(teacher.grades[0].groups[0].id);
            }
          }
          return;
        }
      }
    }
    setInviteTeacherId(null);
  }, [invitationCode, instructors]);

  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState(() => {
    const saved = localStorage.getItem('edu_oauth_role');
    if (saved) return saved;
    return initialRole || (inviteTeacherId ? 'student' : 'instructor');
  });

  // Sync initialRole and save to localStorage
  useEffect(() => {
    if (initialRole) {
      localStorage.setItem('edu_oauth_role', initialRole);
      setRole(initialRole);
    }
  }, [initialRole]);

  // Persist role changes
  useEffect(() => {
    if (role) {
      localStorage.setItem('edu_oauth_role', role);
    }
  }, [role]);

  const [avatarUrl, setAvatarUrl] = useState(PRESET_AVATARS[0]);
  const [subject, setSubject] = useState('');
  const [year, setYear] = useState('');
  const [selectedStages, setSelectedStages] = useState([]); // for instructor stages selection
  const [studentPhone, setStudentPhone] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [studentGradeType, setStudentGradeType] = useState('sec'); // 'sec' | 'prep' | 'primary' | 'univ'
  const [studentStep, setStudentStep] = useState(1);

  // Email login / signup states
  const [authMode, setAuthMode] = useState(initialRole ? 'signup' : 'login'); // 'login' | 'signup'
  const [loginTab, setLoginTab] = useState(initialRole === 'admin' ? 'email' : 'quick'); // 'quick' | 'email'
  const [isRegisterMode, setIsRegisterMode] = useState(initialRole ? true : false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Password Recovery States
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryStep, setRecoveryStep] = useState(1); // 1: enter email, 2: verify code, 3: reset password
  const [sentCode, setSentCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Simulated OAuth Auth Modals
  const [showGoogleAuth, setShowGoogleAuth] = useState(false);
  const [showFacebookAuth, setShowFacebookAuth] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [consentUser, setConsentUser] = useState(null);

  // Visual Cropper States
  const [rawImage, setRawImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgDims, setImgDims] = useState({ width: 200, height: 200 });

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    const aspect = naturalWidth / naturalHeight;
    let w = 200;
    let h = 200;
    if (aspect > 1) {
      w = 200 * aspect;
    } else {
      h = 200 / aspect;
    }
    setImgDims({ width: w, height: h });
  };

  // Load saved credentials on mount and initialize Google / Facebook SDKs
  useEffect(() => {
    const savedEmail = localStorage.getItem('edu_saved_email');
    const savedPassword = localStorage.getItem('edu_saved_password');
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
      setLoginTab('email');
    }

    // 1. Load Google Identity Services SDK programmatically
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initializeGoogleSDK();
      };
      document.body.appendChild(script);
    } else {
      initializeGoogleSDK();
    }

    // 2. Load Facebook SDK programmatically
    if (!window.FB) {
      window.fbAsyncInit = function() {
        const fbAppId = import.meta.env.VITE_FACEBOOK_APP_ID || '1591873838289456';
        window.FB.init({
          appId      : fbAppId,
          cookie     : true,
          xfbml      : true,
          version    : 'v18.0'
        });
      };
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/ar_AR/sdk.js';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  const initializeGoogleSDK = () => {
    if (window.google) {
      const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '649933821481-34nhsr9oq0264vv6i6gst9vk4avrbgfj.apps.googleusercontent.com';
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredentialResponse
      });
    }
  };

  const handleGoogleCredentialResponse = (response) => {
    const decoded = decodeJwt(response.credential);
    if (decoded) {
      setConsentUser({
        name: decoded.name || decoded.given_name || 'Google User',
        email: decoded.email,
        avatar: decoded.picture || PRESET_AVATARS[0],
        type: 'google',
        token: response.credential
      });
    }
  };

  // Autofill consentUser from active Supabase session
  useEffect(() => {
    if (supabaseUser) {
      const email = supabaseUser.email || '';
      const name = supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || email.split('@')[0] || 'User';
      const avatar = supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || PRESET_AVATARS[0];
      
      const ADMIN_EMAILS = ['rishobeh@gmail.com', 'admin@ie-academy.com', 'admin@ie.com'];
      if (ADMIN_EMAILS.includes(email.toLowerCase())) {
        onLogin({
          name: lang === 'ar' ? 'أ/ ريشو' : 'Super Admin',
          role: 'admin',
          avatar: avatar,
          email: email
        });
        onClose();
        return;
      }

      const accounts = getExistingAccounts(email);
      if (accounts.length === 1) {
        // Log in directly!
        const account = accounts[0];
        onLogin({
          id: account.data.id,
          name: account.role === 'instructor' ? (account.data.nameAr || account.data.nameEn) : (account.data.nameEn || account.data.nameAr),
          role: account.role,
          avatar: account.data.avatar,
          email: email,
          isSubscribed: account.data.isSubscribed,
          isExisting: true
        });
        onClose();
      } else if (accounts.length > 1) {
        // Show account chooser
        setConsentUser({ name, email, avatar, type: supabaseUser.app_metadata?.provider || 'google' });
      } else {
        // Brand new user!
        if (initialRole === 'student') {
          setFullName(name);
          setEmail(email);
          setAvatarUrl(avatar);
          setRole('student');
          setShowModal(true);
        } else if (initialRole === 'instructor') {
          setFullName(name);
          setEmail(email);
          setAvatarUrl(avatar);
          setRole('instructor');
          setShowModal(true);
        } else {
          setConsentUser({ name, email, avatar, type: supabaseUser.app_metadata?.provider || 'google' });
        }
      }
    }
  }, [supabaseUser]);

  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRawImage(reader.result);
        setZoom(1);
        setPosition({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleCropSave = () => {
    if (!rawImage) return;
    const img = new Image();
    img.src = rawImage;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      
      // Draw circular mask
      ctx.beginPath();
      ctx.arc(100, 100, 100, 0, Math.PI * 2);
      ctx.clip();
      
      // Calculate drawing dimensions to maintain aspect ratio and fill the 200x200 circle
      const aspect = img.width / img.height;
      let drawWidth = 200;
      let drawHeight = 200;
      if (aspect > 1) {
        drawWidth = 200 * aspect;
      } else {
        drawHeight = 200 / aspect;
      }
      
      // Translate to center, apply zoom and position offset
      ctx.translate(100 + position.x, 100 + position.y);
      ctx.scale(zoom, zoom);
      ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      
      setAvatarUrl(canvas.toDataURL('image/jpeg', 0.9));
      setRawImage(null);
    };
  };

  // Manage step-by-step back button navigation for student signup wizard
  useEffect(() => {
    if (studentStep === 2) {
      if (window.history.state?.step !== 2) {
        window.history.pushState({ modal: 'login', step: 2 }, '');
      }
    } else {
      if (window.history.state?.step === 2) {
        window.history.back();
      }
    }

    const handlePopState = (event) => {
      if (studentStep === 2) {
        setStudentStep(1);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [studentStep]);

  const t = {
    en: {
      headline: "Welcome to EduAcademy Portal",
      tagline: "Enter our digital learning center with unified student & instructor dashboards.",
      googleBtn: "Sign in with Google Account",
      facebookBtn: "Sign in with Facebook",
      modalTitle: "Complete Your Account Profile",
      modalSubtitle: "Customize how other students and instructors see you on the platform.",
      nameLabel: "Your Full Name",
      namePlaceholder: "Enter your name...",
      roleLabel: "Select Your Access Role",
      roleStudent: "Student Account",
      roleInstructor: "Instructor Account",
      roleAdmin: "System Admin",
      avatarLabel: "Choose Your Avatar Profile",
      avatarOrPaste: "Or paste a custom image URL:",
      avatarPlaceholder: "https://example.com/photo.jpg",
      subjectLabel: "Your Specialized Subject",
      subjectPlaceholder: "e.g., Mathematics, Physics...",
      yearLabel: "Grade Level / Year",
      yearPlaceholder: "e.g., High School",
      parentPhoneLabel: "Parent Phone Number",
      parentPhonePlaceholder: "01xxxxxxxxx",
      selectTeacherLabel: "Select Teacher",
      selectGradeLabel: "Select Grade",
      selectGroupLabel: "Select Group",
      invitedBy: "Invited by Teacher",
      submitBtn: "Create Profile & Login",
      cancelBtn: "Cancel",
      tabQuick: "Quick Access",
      tabEmail: "Email Login",
      emailLabel: "Email Address",
      passwordLabel: "Password",
      rememberMeLabel: "Remember Me",
      loginBtn: "Sign In",
    },
    ar: {
      headline: "مرحباً بكم في أكاديمية التعليم",
      tagline: "بوابتك الرقمية التفاعلية التي تربط المعلمين بطلاب السنتر.",
      googleBtn: "تسجيل الدخول باستخدام حساب Google",
      facebookBtn: "تسجيل الدخول باستخدام حساب Facebook",
      modalTitle: "استكمال بيانات ملفك الشخصي",
      modalSubtitle: "حدد اسمك وصورتك وكيفية ظهورك للآخرين على المنصة.",
      nameLabel: "الاسم الكامل",
      namePlaceholder: "أدخل اسمك ثلاثياً...",
      roleLabel: "اختر نوع الحساب وصلاحية الدخول",
      roleStudent: "حساب طالب (Student)",
      roleInstructor: "حساب معلم (Instructor)",
      roleAdmin: "مدير النظام (Admin)",
      avatarLabel: "اختر صورتك الرمزية (الافتراضية)",
      avatarOrPaste: "أو الصق رابط صورة مخصص من الويب:",
      avatarPlaceholder: "https://example.com/photo.jpg",
      subjectLabel: "المادة المتخصص فيها المدرس",
      subjectPlaceholder: "مثال: الرياضيات، الفيزياء، اللغة الإنجليزية...",
      yearLabel: "الصف الدراسي / المرحلة",
      yearPlaceholder: "مثال: ثانوي",
      parentPhoneLabel: "رقم هاتف ولي الأمر",
      parentPhonePlaceholder: "01xxxxxxxxx",
      selectTeacherLabel: "اختر المعلم",
      selectGradeLabel: "اختر الصف",
      selectGroupLabel: "اختر المجموعة",
      invitedBy: "دعوة انضمام من المعلم",
      submitBtn: "حفظ الملف ودخول المنصة",
      cancelBtn: "إلغاء",
      tabQuick: "الدخول السريع",
      tabEmail: "تسجيل الدخول بالبريد",
      emailLabel: "البريد الإلكتروني",
      passwordLabel: "كلمة المرور",
      rememberMeLabel: "تذكر بياناتي",
      loginBtn: "تسجيل الدخول",
    }
  }[lang];

  const getExistingAccounts = (selectedEmail) => {
    const list = [];
    if (!selectedEmail) return list;
    const inst = instructors?.find(i => i.email?.toLowerCase() === selectedEmail.toLowerCase());
    if (inst) {
      list.push({ role: 'instructor', data: inst });
    }
    const stud = students?.find(s => s.email?.toLowerCase() === selectedEmail.toLowerCase());
    if (stud) {
      list.push({ role: 'student', data: stud });
    }
    return list;
  };

  const checkEmailExists = (selectedEmail) => {
    const accounts = getExistingAccounts(selectedEmail);
    return accounts.length > 0 ? accounts[0] : null;
  };

  const handleGoogleClick = async () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const isConfigured = url && url !== 'https://your-supabase-url.supabase.co' && key && key !== 'your-anon-key' && url !== 'https://your-supabase-project-url.supabase.co' && key !== 'your-supabase-public-anon-key';
    
    if (isConfigured) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) {
        setErrorMessage(error.message);
      }
    } else {
      // Try to trigger Google Identity Services SDK prompt
      if (window.google) {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            triggerMockGooglePrompt();
          }
        });
      } else {
        triggerMockGooglePrompt();
      }
    }
  };

  const triggerMockGooglePrompt = () => {
    const randomId = Math.floor(1000 + Math.random() * 9000);
    setConsentUser({
      name: lang === 'ar' ? `مستخدم جوجل ${randomId}` : `Google User ${randomId}`,
      email: `google.user${randomId}@gmail.com`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
      type: 'google'
    });
  };

  const handleFacebookClick = async () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const isConfigured = url && url !== 'https://your-supabase-url.supabase.co' && key && key !== 'your-anon-key' && url !== 'https://your-supabase-project-url.supabase.co' && key !== 'your-supabase-public-anon-key';
    
    if (isConfigured) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) {
        setErrorMessage(error.message);
      }
    } else {
      // Try to trigger real Facebook SDK login
      if (window.FB) {
        window.FB.login((response) => {
          if (response.authResponse) {
            const accessToken = response.authResponse.accessToken;
            window.FB.api('/me', { fields: 'name,email,picture.type(large)' }, (userInfo) => {
              setConsentUser({
                name: userInfo.name || 'Facebook User',
                email: userInfo.email || 'user.test@facebook.com',
                avatar: userInfo.picture?.data?.url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
                type: 'facebook',
                token: accessToken
              });
            });
          } else {
            console.warn('Facebook authentication cancelled or not fully authorized.');
          }
        }, { scope: 'public_profile,email' });
      } else {
        // Generate mock user directly without browser prompt
        const randomId = Math.floor(1000 + Math.random() * 9000);
        setConsentUser({
          name: lang === 'ar' ? `مستخدم فيسبوك ${randomId}` : `Facebook User ${randomId}`,
          email: `facebook.user${randomId}@facebook.com`,
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
          type: 'facebook'
        });
      }
    }
  };

  const handleEmailLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Check if in Register Mode
    if (isRegisterMode) {
      if (password !== confirmPassword) {
        setErrorMessage(lang === 'ar' ? 'كلمتا المرور غير متطابقتين!' : 'Passwords do not match!');
        return;
      }
      
      // Check if email already exists in local database
      const savedInstructors = JSON.parse(localStorage.getItem('edu_instructors') || '[]');
      const savedStudents = JSON.parse(localStorage.getItem('edu_students') || '[]');
      const emailExists = savedInstructors.some(i => i.email?.toLowerCase() === email.toLowerCase()) || 
                          savedStudents.some(s => s.email?.toLowerCase() === email.toLowerCase());
      
      if (emailExists) {
        setErrorMessage(lang === 'ar' ? 'هذا البريد الإلكتروني مسجل بالفعل!' : 'This email is already registered!');
        return;
      }
      
      // Save password for this email in localStorage
      const passwords = JSON.parse(localStorage.getItem('edu_user_passwords') || '{}');
      passwords[email.toLowerCase()] = password;
      localStorage.setItem('edu_user_passwords', JSON.stringify(passwords));
      
      // Go to setup wizard
      setConsentUser({
        name: email.split('@')[0],
        email: email,
        avatar: PRESET_AVATARS[0],
        type: 'email_signup'
      });
      return;
    }
    
    // Check Super Admin Credentials
    if (email === 'rishobeh@gmail.com' && password === 'Ri$ho123m@n') {
      if (rememberMe) {
        localStorage.setItem('edu_saved_email', email);
        localStorage.setItem('edu_saved_password', password);
      } else {
        localStorage.removeItem('edu_saved_email');
        localStorage.removeItem('edu_saved_password');
      }
      onLogin({
        name: lang === 'ar' ? 'أ/ ريشو' : 'Super Admin',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120'
      });
      return;
    }
    
    // Check custom registered users
    const passwords = JSON.parse(localStorage.getItem('edu_user_passwords') || '{}');
    if (passwords[email.toLowerCase()] && passwords[email.toLowerCase()] === password) {
      // Find user profile
      const savedInstructors = JSON.parse(localStorage.getItem('edu_instructors') || '[]');
      const savedStudents = JSON.parse(localStorage.getItem('edu_students') || '[]');
      
      const matchedTeacher = savedInstructors.find(i => i.email?.toLowerCase() === email.toLowerCase());
      if (matchedTeacher) {
        if (rememberMe) {
          localStorage.setItem('edu_saved_email', email);
          localStorage.setItem('edu_saved_password', password);
        }
        onLogin({
          id: matchedTeacher.id,
          name: matchedTeacher.nameAr,
          role: 'instructor',
          avatar: matchedTeacher.avatar,
          email: matchedTeacher.email,
          isSubscribed: matchedTeacher.isSubscribed,
          isExisting: true
        });
        return;
      }
      
      const matchedStudent = savedStudents.find(s => s.email?.toLowerCase() === email.toLowerCase());
      if (matchedStudent) {
        if (rememberMe) {
          localStorage.setItem('edu_saved_email', email);
          localStorage.setItem('edu_saved_password', password);
        }
        onLogin({
          id: matchedStudent.id,
          name: matchedStudent.nameAr,
          role: 'student',
          avatar: matchedStudent.avatar,
          email: matchedStudent.email,
          isExisting: true
        });
        return;
      }
    }
    
    // Simulators for demo logins
    if (email === 'teacher@ie.com' && password === '123') {
      onLogin({
        name: lang === 'ar' ? 'أ/ محمد راشد' : 'Mr. Mohamed Rashed',
        role: 'instructor',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=120',
        subject: lang === 'ar' ? 'الرياضيات' : 'Mathematics',
        yearAr: 'ثانوي',
        yearEn: 'High School'
      });
      return;
    }
    
    setErrorMessage(lang === 'ar' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة!' : 'Invalid email or password!');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    // For direct email signup via wizard
    const isLocalEmailSignup = !consentUser || consentUser.type === 'email_signup';
    if (isLocalEmailSignup) {
      if (!email) {
        setErrorMessage(lang === 'ar' ? 'الرجاء إدخال البريد الإلكتروني!' : 'Please enter email address!');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage(lang === 'ar' ? 'كلمتا المرور غير متطابقتين!' : 'Passwords do not match!');
        return;
      }
      
      // Check if email already exists
      const savedInstructors = JSON.parse(localStorage.getItem('edu_instructors') || '[]');
      const savedStudents = JSON.parse(localStorage.getItem('edu_students') || '[]');
      const emailExists = savedInstructors.some(i => i.email?.toLowerCase() === email.toLowerCase()) || 
                          savedStudents.some(s => s.email?.toLowerCase() === email.toLowerCase());
      
      if (emailExists) {
        setErrorMessage(lang === 'ar' ? 'هذا البريد الإلكتروني مسجل بالفعل!' : 'This email is already registered!');
        return;
      }
      
      // Save password
      const passwords = JSON.parse(localStorage.getItem('edu_user_passwords') || '{}');
      passwords[email.toLowerCase()] = password;
      localStorage.setItem('edu_user_passwords', JSON.stringify(passwords));
    }

    if (role === 'student') {
      if (!/^\d{11}$/.test(studentPhone)) {
        setErrorMessage(lang === 'ar' ? 'رقم هاتف الطالب يجب أن يتكون من 11 رقماً!' : 'Student phone number must be exactly 11 digits!');
        return;
      }
      if (!/^\d{11}$/.test(parentPhone)) {
        setErrorMessage(lang === 'ar' ? 'رقم هاتف ولي الأمر يجب أن يتكون من 11 رقماً!' : 'Parent phone number must be exactly 11 digits!');
        return;
      }
      if (studentStep === 1 && !inviteTeacherId) {
        setErrorMessage('');
        setStudentStep(2);
        return;
      }
      if (!selectedInstructor || !selectedGroup) {
        return;
      }
    }

    const yearString = role === 'instructor' 
      ? selectedStages.map(s => {
          if (s === 'primary') return lang === 'ar' ? 'ابتدائي' : 'Primary';
          if (s === 'prep') return lang === 'ar' ? 'إعدادي' : 'Middle School';
          if (s === 'sec') return lang === 'ar' ? 'ثانوي' : 'High School';
          if (s === 'univ') return lang === 'ar' ? 'جامعي' : 'University';
          return s;
        }).join(', ')
      : '';

    onLogin({
      name: fullName,
      email: isLocalEmailSignup ? email : (consentUser?.email || ''),
      role: role,
      avatar: avatarUrl,
      subject: role === 'instructor' ? subject : '',
      yearAr: role === 'instructor' ? (yearString || year) : undefined,
      yearEn: role === 'instructor' ? (yearString || year) : undefined,
      studentPhone: role === 'student' ? studentPhone : undefined,
      parentPhone: role === 'student' ? parentPhone : undefined,
      studentGradeType: role === 'student' ? studentGradeType : undefined,
      instructorId: role === 'student' ? Number(selectedInstructor) : undefined,
      gradeId: role === 'student' ? selectedGrade : undefined,
      groupId: role === 'student' ? selectedGroup : undefined
    });
  };

  return (
    <div className="login-screen-container">
      <div className="glass-card" style={{ maxWidth: '460px', width: '100%', textAlign: 'center', padding: '3rem 2rem', position: 'relative' }}>
        
        {/* Back Button */}
        {onClose && (
          <button 
            onClick={onClose}
            className="config-btn"
            style={{ 
              position: 'absolute', 
              top: '1rem', 
              right: lang === 'ar' ? 'auto' : '1.5rem', 
              left: lang === 'ar' ? '1.5rem' : 'auto', 
              padding: '0.4rem 0.8rem', 
              fontSize: '0.8rem', 
              borderColor: 'var(--accent-red)', 
              color: 'var(--accent-red)',
              borderRadius: '8px'
            }}
          >
            {lang === 'ar' ? 'رجوع' : 'Back'}
          </button>
        )}
        
        {/* Brand Logo */}
        <div 
          onDoubleClick={() => setIsAdminMode(true)}
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', marginBottom: '1.5rem', boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)' }}
        >
          <BookOpen size={30} />
        </div>

        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          {authMode === 'signup' 
            ? (role === 'instructor' 
                ? (lang === 'ar' ? 'إنشاء حساب معلم جديد' : 'Register Instructor Account') 
                : (lang === 'ar' ? 'إنشاء حساب طالب جديد' : 'Register Student Account'))
            : t.headline}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
          {authMode === 'signup' 
            ? (lang === 'ar' ? 'قم بإنشاء حسابك لبدء استخدام المنصة والتفاعل' : 'Create your account to start interacting on the platform')
            : t.tagline}
        </p>

        {/* Tab Selector */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-glass)', marginBottom: '2rem' }}>
          <button 
            type="button"
            onClick={() => setLoginTab('quick')}
            style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: 'none', borderBottom: loginTab === 'quick' ? '2px solid var(--accent-primary)' : 'none', color: loginTab === 'quick' ? 'var(--text-primary)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
          >
            {authMode === 'signup' ? (lang === 'ar' ? 'التسجيل السريع' : 'Quick Register') : t.tabQuick}
          </button>
          <button 
            type="button"
            onClick={() => setLoginTab('email')}
            style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: 'none', borderBottom: loginTab === 'email' ? '2px solid var(--accent-primary)' : 'none', color: loginTab === 'email' ? 'var(--text-primary)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
          >
            {authMode === 'signup' ? (lang === 'ar' ? 'تسجيل بالبريد' : 'Email Register') : t.tabEmail}
          </button>
        </div>

        {loginTab === 'quick' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Google Sign In Button */}
            <button onClick={handleGoogleClick} className="google-btn">
              <svg className="google-icon-svg" viewBox="0 0 24 24">
                <path fill="#ea4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2A11.95 11.95 0 0 0 12 0 11.94 11.94 0 0 0 1.29 6.29l3.73 2.9A7.12 7.12 0 0 1 12 5.04z"/>
                <path fill="#4285f4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46a5.53 5.53 0 0 1-2.4 3.63l3.73 2.9a11.92 11.92 0 0 0 3.7-8.68z"/>
                <path fill="#fbbc05" d="M5.02 8.78A7.13 7.13 0 0 1 12 5.04a7.12 7.12 0 0 1 6.98 3.74l3.73-2.9A11.94 11.94 0 0 0 12 0C7.8 0 4.19 2.05 2.02 5.24l3.73 2.9.27.64z"/>
                <path fill="#34a853" d="M12 18.96c-1.92 0-3.63-.64-4.98-1.74l-3.73 2.9C5.46 21.95 8.54 24 12 24c4.14 0 7.73-1.4 10.3-3.8l-3.73-2.9a7.12 7.12 0 0 1-6.57 1.66z"/>
              </svg>
              <span>
                {authMode === 'signup' 
                  ? (lang === 'ar' ? 'إنشاء حساب باستخدام Google' : 'Sign Up with Google') 
                  : t.googleBtn}
              </span>
            </button>

            {/* Facebook Sign In Button */}
            <button onClick={handleFacebookClick} className="google-btn" style={{ backgroundColor: '#1877F2', color: 'white', borderColor: '#1877F2' }}>
              <svg className="google-icon-svg" viewBox="0 0 24 24" style={{ fill: 'white' }}>
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span style={{ color: 'white' }}>
                {authMode === 'signup' 
                  ? (lang === 'ar' ? 'إنشاء حساب باستخدام Facebook' : 'Sign Up with Facebook') 
                  : t.facebookBtn}
              </span>
            </button>

            {authMode === 'signup' ? (
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setIsRegisterMode(false);
                  setErrorMessage('');
                }}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem', textDecoration: 'underline', cursor: 'pointer', textAlign: 'center', marginTop: '1.25rem' }}
              >
                {lang === 'ar' ? 'لديك حساب بالفعل؟ تسجيل الدخول هنا' : 'Already have an account? Log In here'}
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.25rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {lang === 'ar' ? 'ليس لديك حساب؟ أنشئ حساب جديد الآن:' : 'Don\'t have an account? Create one now:'}
                </span>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setRole('student');
                      setAuthMode('signup');
                      setIsRegisterMode(true);
                      setErrorMessage('');
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-purple)', fontSize: '0.8rem', fontWeight: 'bold', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    {lang === 'ar' ? 'حساب طالب' : 'Student Account'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRole('instructor');
                      setAuthMode('signup');
                      setIsRegisterMode(true);
                      setErrorMessage('');
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 'bold', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    {lang === 'ar' ? 'حساب معلم' : 'Teacher Account'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleEmailLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'start' }}>
            {errorMessage && (
              <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-red)', fontSize: '0.85rem', fontWeight: 600, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                {errorMessage}
              </div>
            )}
            
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--accent-primary)', textAlign: 'center' }}>
              {isRegisterMode 
                ? (lang === 'ar' ? 'إنشاء حساب بريد إلكتروني جديد' : 'Create a New Email Account')
                : (lang === 'ar' ? 'تسجيل الدخول بالبريد الإلكتروني' : 'Sign In with Email')}
            </h4>

            <div className="form-group" style={{ margin: 0 }}>
              <label>{t.emailLabel}</label>
              <input 
                type="email" 
                required 
                className="form-control" 
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ color: 'var(--text-primary)', backgroundColor: 'rgba(0,0,0,0.1)' }}
              />
            </div>
            
            <div className="form-group" style={{ margin: 0 }}>
              <label>{t.passwordLabel}</label>
              <input 
                type="password" 
                required 
                className="form-control" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ color: 'var(--text-primary)', backgroundColor: 'rgba(0,0,0,0.1)' }}
              />
            </div>

            {isRegisterMode && (
              <div className="form-group" style={{ margin: 0 }}>
                <label>{lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}</label>
                <input 
                  type="password" 
                  required 
                  className="form-control" 
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ color: 'var(--text-primary)', backgroundColor: 'rgba(0,0,0,0.1)' }}
                />
              </div>
            )}

            {!isRegisterMode && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <input 
                    type="checkbox" 
                    checked={rememberMe} 
                    onChange={(e) => setRememberMe(e.target.checked)} 
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  <span>{t.rememberMeLabel}</span>
                </label>
                
                <button
                  type="button"
                  onClick={() => {
                    setRecoveryEmail(email);
                    setRecoveryStep(1);
                    setSentCode('');
                    setEnteredCode('');
                    setNewPassword('');
                    setConfirmNewPassword('');
                    setShowForgotPassword(true);
                  }}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                </button>
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
              {isRegisterMode 
                ? (lang === 'ar' ? 'إنشاء الحساب ومتابعة الملف' : 'Create Account & Continue')
                : t.loginBtn}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setErrorMessage('');
              }}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem', textDecoration: 'underline', cursor: 'pointer', textAlign: 'center', marginTop: '0.5rem' }}
            >
              {isRegisterMode 
                ? (lang === 'ar' ? 'لديك حساب بالفعل؟ تسجيل الدخول هنا' : 'Already have an account? Log In here')
                : (lang === 'ar' ? 'ليس لديك حساب؟ إنشاء حساب جديد بالبريد' : 'Do not have an account? Sign Up with Email')}
            </button>
          </form>
        )}
      </div>

      {/* Profile Completion Modal Overlay */}
      {showModal && (
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
          <div className="glass-card" style={{ width: '90%', maxWidth: '485px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', animation: 'slide-in 0.3s ease-out' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.25rem' }}>{t.modalTitle}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.modalSubtitle}</p>
            </div>

            <form onSubmit={handleSubmit}>
              


              {errorMessage && (
                <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-red)', fontSize: '0.85rem', fontWeight: 600, border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '1rem' }}>
                  {errorMessage}
                </div>
              )}

              {/* Name Input */}
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <User size={14} />
                  <span>{t.nameLabel}</span>
                </label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder={t.namePlaceholder}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required 
                  style={{ color: 'var(--text-primary)', backgroundColor: 'rgba(0,0,0,0.1)' }}
                />
              </div>

              {/* Local Email & Passwords Fields */}
              {(!consentUser || consentUser.type === 'email_signup') && (
                <>
                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.9rem' }}>@</span>
                      <span>{t.emailLabel}</span>
                    </label>
                    <input 
                      type="email" 
                      className="form-control" 
                      placeholder="example@mail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                      style={{ color: 'var(--text-primary)', backgroundColor: 'rgba(0,0,0,0.1)' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.9rem' }}>🔑</span>
                      <span>{t.passwordLabel}</span>
                    </label>
                    <input 
                      type="password" 
                      className="form-control" 
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                      style={{ color: 'var(--text-primary)', backgroundColor: 'rgba(0,0,0,0.1)' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.9rem' }}>🔑</span>
                      <span>{lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}</span>
                    </label>
                    <input 
                      type="password" 
                      className="form-control" 
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required 
                      style={{ color: 'var(--text-primary)', backgroundColor: 'rgba(0,0,0,0.1)' }}
                    />
                  </div>
                </>
              )}

              {/* Profile Avatar Field */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                  <User size={14} />
                  <span>{lang === 'ar' ? 'صورة البروفايل الشخصية' : 'Profile Picture'}</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                  <img 
                    src={avatarUrl} 
                    alt="Preview" 
                    style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-primary)' }} 
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, textAlign: 'start' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {lang === 'ar' ? 'اختر ملف من جهازك أو الصق رابط صورة:' : 'Upload from device or paste image link:'}
                    </span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarFileChange} 
                      style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}
                    />
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="https://example.com/photo.jpg" 
                      value={avatarUrl.startsWith('data:') ? '' : avatarUrl} 
                      onChange={(e) => setAvatarUrl(e.target.value || PRESET_AVATARS[0])}
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem', marginTop: '0.25rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Subject Input: visible only if instructor is toggled */}
              {role === 'instructor' && (
                <>
                  <div className="form-group" style={{ animation: 'slide-in 0.2s ease-out' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Briefcase size={14} />
                      <span>{t.subjectLabel}</span>
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder={t.subjectPlaceholder}
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required={role === 'instructor'} 
                    />
                  </div>
                  <div className="form-group" style={{ animation: 'slide-in 0.2s ease-out' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                      <Briefcase size={14} />
                      <span>{lang === 'ar' ? 'المراحل الدراسية التي تدرسها' : 'Stages You Teach'}</span>
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', padding: '0.25rem' }}>
                      {[
                        { value: 'primary', labelAr: 'ابتدائي', labelEn: 'Primary' },
                        { value: 'prep', labelAr: 'إعدادي', labelEn: 'Middle School' },
                        { value: 'sec', labelAr: 'ثانوي / بكالوريا', labelEn: 'High School' },
                        { value: 'univ', labelAr: 'جامعي', labelEn: 'University' }
                      ].map(stage => {
                        const isChecked = selectedStages.includes(stage.value);
                        return (
                          <label key={stage.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              style={{ accentColor: 'var(--accent-primary)' }}
                              onChange={() => {
                                setSelectedStages(prev => 
                                  prev.includes(stage.value)
                                    ? prev.filter(x => x !== stage.value)
                                    : [...prev, stage.value]
                                );
                              }}
                            />
                            <span>{lang === 'ar' ? stage.labelAr : stage.labelEn}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Parent Phone Input: visible only if student is toggled */}
              {role === 'student' && (
                <div style={{ animation: 'slide-in 0.2s ease-out' }}>
                  
                  {studentStep === 1 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {/* Student Phone Input */}
                      <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <User size={14} />
                          <span>{lang === 'ar' ? 'رقم هاتف الطالب' : 'Student Phone Number'}</span>
                        </label>
                        <input 
                          type="tel" 
                          className="form-control" 
                          placeholder="01xxxxxxxxx"
                          value={studentPhone}
                          onChange={(e) => setStudentPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                          required={role === 'student'} 
                          pattern="[0-9]{11}"
                          title={lang === 'ar' ? 'رقم الهاتف يجب أن يتكون من 11 رقماً' : 'Phone number must be exactly 11 digits'}
                        />
                      </div>

                      {/* Parent Phone Input */}
                      <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <User size={14} />
                          <span>{t.parentPhoneLabel}</span>
                        </label>
                        <input 
                          type="tel" 
                          className="form-control" 
                          placeholder={t.parentPhonePlaceholder}
                          value={parentPhone}
                          onChange={(e) => setParentPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                          required={role === 'student'} 
                          pattern="[0-9]{11}"
                          title={lang === 'ar' ? 'رقم الهاتف يجب أن يتكون من 11 رقماً' : 'Phone number must be exactly 11 digits'}
                        />
                      </div>

                      {/* Grade Level Stage Selector */}
                      <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Briefcase size={14} />
                          <span>{lang === 'ar' ? 'المرحلة الدراسية للطالب' : 'Student Grade Level Stage'}</span>
                        </label>
                        <select 
                          className="form-control" 
                          value={studentGradeType} 
                          onChange={(e) => setStudentGradeType(e.target.value)}
                          required
                          style={{ appearance: 'auto' }}
                        >
                          <option value="primary">{lang === 'ar' ? 'ابتدائي' : 'Primary'}</option>
                          <option value="prep">{lang === 'ar' ? 'إعدادي' : 'Middle School / Prep'}</option>
                          <option value="sec">{lang === 'ar' ? 'ثانوي / بكالوريا' : 'High School / Baccalaureate'}</option>
                          <option value="univ">{lang === 'ar' ? 'جامعي' : 'University'}</option>
                        </select>
                      </div>

                      {/* Invitation Code Input */}
                      <div className="form-group">
                        <label>{lang === 'ar' ? 'كود الدعوة الخاص بالمعلم (اختياري)' : 'Teacher Invitation Code (Optional)'}</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="e.g. IE-101"
                          value={invitationCode}
                          onChange={(e) => setInvitationCode(e.target.value)}
                          style={{ border: inviteTeacherId ? '1px solid var(--accent-green)' : '1px solid var(--border-glass)' }}
                        />
                        {inviteTeacherId && (
                          <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.8rem', color: 'var(--accent-green)', fontWeight: 'bold' }}>
                            ✓ {lang === 'ar' ? `دعوة صالحة من المعلم: ${instructors.find(i => i.id === inviteTeacherId)?.nameAr}` : `Valid invitation from: ${instructors.find(i => i.id === inviteTeacherId)?.nameEn}`}
                          </p>
                        )}
                      </div>

                      {/* Action buttons Step 1 */}
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <button 
                          type="button" 
                          onClick={() => setShowModal(false)}
                          className="config-btn" 
                          style={{ flex: 1, justifyContent: 'center' }}
                        >
                          {t.cancelBtn}
                        </button>
                        <button 
                          type="submit" 
                          className="btn-primary" 
                          style={{ flex: 1 }}
                        >
                          {inviteTeacherId ? t.submitBtn : (lang === 'ar' ? 'التالي (اختر المعلم)' : 'Next (Choose Teacher)')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ animation: 'slide-in 0.2s ease-out' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', textAlign: 'start' }}>
                        {lang === 'ar' ? 'اختر معلم المادة:' : 'Select Your Teacher:'}
                      </h4>
                      
                      {/* Teacher Cards Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '1.5rem', maxHeight: '240px', overflowY: 'auto', padding: '0.25rem' }}>
                        {(() => {
                          const filtered = instructors.filter(i => {
                            if (!i.isSubscribed) return false;
                            const hasPrimary = i.yearAr?.includes('ابتدائي') || i.yearAr?.includes('ابتدائى') || i.yearEn?.toLowerCase().includes('primary') || i.yearEn?.toLowerCase().includes('elem');
                            const hasPrep = i.yearAr?.includes('إعدادي') || i.yearAr?.includes('اعدادي') || i.yearEn?.toLowerCase().includes('middle') || i.yearEn?.toLowerCase().includes('prep');
                            const hasSec = i.yearAr?.includes('ثانوي') || i.yearAr?.includes('بكالوريا') || i.yearEn?.toLowerCase().includes('high') || i.yearEn?.toLowerCase().includes('sec') || i.yearEn?.toLowerCase().includes('secondary') || i.yearEn?.toLowerCase().includes('bac');
                            const hasUniv = i.yearAr?.includes('جامعي') || i.yearAr?.includes('جامعى') || i.yearEn?.toLowerCase().includes('university') || i.yearEn?.toLowerCase().includes('univ');

                            if (studentGradeType === 'primary') return hasPrimary;
                            if (studentGradeType === 'prep') return hasPrep;
                            if (studentGradeType === 'sec') return hasSec;
                            if (studentGradeType === 'univ') return hasUniv;
                            return true;
                          });

                          if (filtered.length === 0) {
                            return (
                              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>
                                  {lang === 'ar' ? 'لا يوجد مدرسين مشتركين في الدليل العام حالياً.' : 'No subscribed instructors are currently available in the public directory.'}
                                </p>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  {lang === 'ar' ? 'يمكن للمدرسين الاشتراك من خلال ترقية النظام.' : 'Instructors can register by upgrading the system.'}
                                </p>
                              </div>
                            );
                          }

                          return filtered.map(inst => {
                            const isSelected = selectedInstructor === inst.id.toString();
                            return (
                              <div 
                                key={inst.id}
                                onClick={() => { setSelectedInstructor(inst.id.toString()); setSelectedGrade(''); setSelectedGroup(''); }}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  padding: '1rem',
                                  borderRadius: '12px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-glass)',
                                  backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-glass)',
                                  boxShadow: isSelected ? '0 4px 12px rgba(99, 102, 241, 0.2)' : 'none',
                                  transform: isSelected ? 'scale(1.03)' : 'none'
                                }}
                              >
                                <img 
                                  src={inst.avatar} 
                                  alt={inst.nameAr} 
                                  style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', marginBottom: '0.75rem', border: '2px solid var(--border-glass)' }}
                                />
                                <h5 style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', fontWeight: 800 }}>{lang === 'ar' ? inst.nameAr : inst.nameEn}</h5>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{lang === 'ar' ? inst.subjectAr : inst.subjectEn}</span>
                              </div>
                            );
                          });
                        })()}
                      </div>

                      {selectedInstructor && (
                        <div style={{ animation: 'slide-in 0.2s ease-out', display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'start' }}>
                          <div className="form-group">
                            <label>{t.selectGradeLabel}</label>
                            <select 
                              className="form-control" 
                              value={selectedGrade} 
                              onChange={(e) => { setSelectedGrade(e.target.value); setSelectedGroup(''); }}
                              required
                              style={{ appearance: 'auto' }}
                            >
                              <option value="">{t.selectGradeLabel}...</option>
                              {instructors.find(i => String(i.id) === String(selectedInstructor))?.grades?.map(g => (
                                <option key={g.id} value={g.id}>{lang === 'ar' ? g.nameAr : g.nameEn}</option>
                              ))}
                            </select>
                          </div>

                          {selectedGrade && (
                            <div className="form-group">
                              <label>{t.selectGroupLabel}</label>
                              <select 
                                className="form-control" 
                                value={selectedGroup} 
                                onChange={(e) => setSelectedGroup(e.target.value)}
                                required
                                style={{ appearance: 'auto' }}
                              >
                                <option value="">{t.selectGroupLabel}...</option>
                                {instructors.find(i => String(i.id) === String(selectedInstructor))
                                  ?.grades?.find(g => String(g.id) === String(selectedGrade))
                                  ?.groups?.map(g => (
                                  <option key={g.id} value={g.id}>{lang === 'ar' ? g.nameAr : g.nameEn}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action buttons Step 2 */}
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <button 
                          type="button" 
                          onClick={() => setStudentStep(1)}
                          className="config-btn" 
                          style={{ flex: 1, justifyContent: 'center' }}
                        >
                          {lang === 'ar' ? 'السابق' : 'Back'}
                        </button>
                        <button 
                          type="submit" 
                          className="btn-primary" 
                          style={{ flex: 1 }}
                          disabled={!selectedInstructor || !selectedGroup}
                        >
                          {t.submitBtn}
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}
              {/* Action buttons */}
              {role !== 'student' && (
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="config-btn" 
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    {t.cancelBtn}
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{ flex: 1 }}
                  >
                    {t.submitBtn}
                  </button>
                </div>
              )}

            </form>

            {(!consentUser || consentUser.type === 'email_signup') && (
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setIsRegisterMode(false);
                  setLoginTab('email');
                }}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem', textDecoration: 'underline', cursor: 'pointer', textAlign: 'center', marginTop: '1rem', width: '100%' }}
              >
                {lang === 'ar' ? 'لديك حساب بالفعل؟ تسجيل الدخول هنا' : 'Already have an account? Log In here'}
              </button>
            )}
          </div>
        </div>
      )}



      {/* Visual Image Cropper Modal */}
      {rawImage && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.95)',
          zIndex: 5000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)',
          direction: lang === 'ar' ? 'rtl' : 'ltr'
        }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '380px', padding: '1.75rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
              {lang === 'ar' ? 'ضبط وقص الصورة الشخصية' : 'Adjust & Crop Profile Picture'}
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {lang === 'ar' ? 'اسحب الصورة لتحريكها واستخدم المؤشر لتكبيرها وتوسيط وجهك داخل الدائرة' : 'Drag the image to move and use the slider to zoom and center your face inside the circle'}
            </p>

            {/* Circular Crop Container */}
            <div 
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
              style={{
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                overflow: 'hidden',
                position: 'relative',
                cursor: 'move',
                border: '3px solid var(--accent-primary)',
                boxShadow: '0 0 15px rgba(0,0,0,0.6)',
                backgroundColor: '#111',
                userSelect: 'none',
                touchAction: 'none'
              }}
            >
               <img 
                src={rawImage} 
                alt="Raw Crop" 
                draggable="false"
                onLoad={handleImageLoad}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                  transformOrigin: 'center center',
                  width: `${imgDims.width}px`,
                  height: `${imgDims.height}px`,
                  pointerEvents: 'none'
                }}
              />
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, border: '2px dashed rgba(255,255,255,0.4)', borderRadius: '50%', pointerEvents: 'none' }}></div>
            </div>

            {/* Slider */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span>{lang === 'ar' ? 'تصغير' : 'Zoom Out'}</span>
                <span>{lang === 'ar' ? 'تكبير' : 'Zoom In'}</span>
              </div>
              <input 
                type="range" 
                min="0.1" 
                max="3" 
                step="0.02" 
                value={zoom} 
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
              <button 
                type="button"
                onClick={() => setRawImage(null)}
                className="config-btn"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button 
                type="button"
                onClick={handleCropSave}
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                {lang === 'ar' ? 'قص وحفظ' : 'Crop & Save'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Simulated OAuth Consent Modal */}
      {consentUser && (() => {
        const userAccounts = getExistingAccounts(consentUser.email);
        return (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 4000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            direction: lang === 'ar' ? 'rtl' : 'ltr'
          }}>
            <div className="glass-card" style={{ width: '90%', maxWidth: '390px', padding: '1.75rem', textAlign: 'start', display: 'flex', flexDirection: 'column', gap: '1.25rem', backgroundColor: '#ffffff', color: '#1f2937', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.3)', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              {/* Header logos */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>{consentUser.type === 'facebook' ? 'Facebook Connect' : 'Google Account Access'}</span>
                {consentUser.type === 'facebook' ? (
                  <svg style={{ width: '28px', height: '28px', fill: '#1877F2' }} viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                ) : (
                  <svg style={{ width: '28px', height: '28px' }} viewBox="0 0 24 24">
                    <path fill="#ea4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2A11.95 11.95 0 0 0 12 0 11.94 11.94 0 0 0 1.29 6.29l3.73 2.9A7.12 7.12 0 0 1 12 5.04z"/>
                    <path fill="#4285f4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46a5.53 5.53 0 0 1-2.4 3.63l3.73 2.9a11.92 11.92 0 0 0 3.7-8.68z"/>
                    <path fill="#fbbc05" d="M5.02 8.78A7.13 7.13 0 0 1 12 5.04a7.12 7.12 0 0 1 6.98 3.74l3.73-2.9A11.94 11.94 0 0 0 12 0C7.8 0 4.19 2.05 2.02 5.24l3.73 2.9.27.64z"/>
                    <path fill="#34a853" d="M12 18.96c-1.92 0-3.63-.64-4.98-1.74l-3.73 2.9C5.46 21.95 8.54 24 12 24c4.14 0 7.73-1.4 10.3-3.8l-3.73-2.9a7.12 7.12 0 0 1-6.57 1.66z"/>
                  </svg>
                )}
              </div>

              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#111827', lineHeight: '1.4' }}>
                  {lang === 'ar' ? 'بيانات الحساب ومزامنة الدخول' : 'Account profile synchronization'}
                </h3>
                <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.8rem', color: '#4b5563' }}>
                  {consentUser.email}
                </p>
              </div>

              {userAccounts.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4b5563', display: 'block' }}>
                    {lang === 'ar' ? 'اختر الحساب الذي تود الدخول به:' : 'Choose the account to log in:'}
                  </span>
                  
                  {userAccounts.map((account, index) => {
                    const isInst = account.role === 'instructor';
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          onLogin({
                            id: account.data.id,
                            name: isInst ? (account.data.nameAr || account.data.nameEn) : (account.data.nameEn || account.data.nameAr),
                            role: account.role,
                            avatar: account.data.avatar,
                            email: consentUser.email,
                            isSubscribed: account.data.isSubscribed,
                            isExisting: true
                          });
                          setConsentUser(null);
                          setShowGoogleAuth(false);
                          setShowFacebookAuth(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.65rem 0.85rem',
                          width: '100%',
                          border: '1.5px solid #e5e7eb',
                          borderRadius: '8px',
                          backgroundColor: '#f9fafb',
                          cursor: 'pointer',
                          textAlign: 'start',
                          transition: 'all 0.2s'
                        }}
                      >
                        <img 
                          src={account.data.avatar || PRESET_AVATARS[0]} 
                          style={{ width: '32px', height: '32px', borderRadius: '50%', border: isInst ? '1.5px solid #6366f1' : '1.5px solid #8b5cf6' }} 
                          alt="Avatar" 
                        />
                        <div style={{ flex: 1 }}>
                          <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1f2937' }}>
                            {isInst ? (account.data.nameAr || account.data.nameEn) : (account.data.nameEn || account.data.nameAr)}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: isInst ? '#6366f1' : '#8b5cf6', fontWeight: 600 }}>
                            {isInst ? (lang === 'ar' ? 'حساب معلم' : 'Instructor Account') : (lang === 'ar' ? 'حساب طالب' : 'Student Account')}
                          </span>
                        </div>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => {
                      setFullName(consentUser.name);
                      setEmail(consentUser.email);
                      setAvatarUrl(consentUser.avatar);
                      setShowModal(true);
                      setConsentUser(null);
                      setShowGoogleAuth(false);
                      setShowFacebookAuth(false);
                    }}
                    style={{
                      padding: '0.55rem',
                      border: '1px dashed #4285f4',
                      borderRadius: '8px',
                      backgroundColor: 'transparent',
                      color: '#4285f4',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      width: '100%',
                      textAlign: 'center'
                    }}
                  >
                    {lang === 'ar' ? 'إنشاء حساب جديد إضافي' : 'Register a new additional profile'}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                  <button 
                    type="button"
                    onClick={() => {
                      const ADMIN_EMAILS = ['rishobeh@gmail.com', 'admin@ie-academy.com', 'admin@ie.com'];
                      if (ADMIN_EMAILS.includes(consentUser.email.toLowerCase())) {
                        onLogin({
                          name: lang === 'ar' ? 'أ/ ريشو' : 'Super Admin',
                          role: 'admin',
                          avatar: consentUser.avatar,
                          email: consentUser.email
                        });
                        setConsentUser(null);
                        setShowGoogleAuth(false);
                        setShowFacebookAuth(false);
                        return;
                      }
                      setFullName(consentUser.name);
                      setEmail(consentUser.email);
                      setAvatarUrl(consentUser.avatar);
                      setShowModal(true);
                      setConsentUser(null);
                      setShowGoogleAuth(false);
                      setShowFacebookAuth(false);
                    }}
                    style={{ padding: '0.75rem', border: 'none', borderRadius: '8px', backgroundColor: consentUser.type === 'facebook' ? '#1877F2' : '#4285f4', color: 'white', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', width: '100%', textAlign: 'center' }}
                  >
                    {lang === 'ar' ? `متابعة باسم ${consentUser.name.split(' ')[0]}` : `Continue as ${consentUser.name.split(' ')[0]}`}
                  </button>
                </div>
              )}

              <button 
                type="button"
                onClick={() => {
                  setConsentUser(null);
                  onClose();
                }}
                style={{ padding: '0.7rem', border: 'none', borderRadius: '8px', backgroundColor: '#f3f4f6', color: '#4b5563', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', width: '100%', textAlign: 'center' }}
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>

              <p style={{ margin: 0, fontSize: '0.7rem', color: '#6b7280', lineHeight: '1.4', borderTop: '1px solid #e5e7eb', paddingTop: '0.75rem', width: '100%' }}>
                {lang === 'ar' 
                  ? 'بالمتابعة، سيتلقى EduAcademy صلاحية وصول مستمرة إلى المعلومات التي تشاركها، وسيسجل الحساب الأوقات التي يصل فيها. سياسة الخصوصية وشروط الخدمة.' 
                  : 'By continuing, EduAcademy will receive ongoing access to information you share. Privacy Policy and Terms of Service.'}
              </p>
            </div>
          </div>
        );
      })()}
      {/* Forgot Password Modal Overlay */}
      {showForgotPassword && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '400px', padding: '2rem', textAlign: 'start' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              {lang === 'ar' ? 'استعادة كلمة المرور' : 'Password Recovery'}
            </h3>
            <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {lang === 'ar' ? 'أعد تعيين كلمة المرور الخاصة بحسابك عبر كود التحقق المرسل لبريدك الإلكتروني.' : 'Reset your account password via a code sent to your email.'}
            </p>

            {recoveryStep === 1 && (
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!recoveryEmail) return;
                // Check if email exists in database (demo list or localStorage user passwords)
                const savedInstructors = JSON.parse(localStorage.getItem('edu_instructors') || '[]');
                const savedStudents = JSON.parse(localStorage.getItem('edu_students') || '[]');
                const emailExists = savedInstructors.some(i => i.email?.toLowerCase() === recoveryEmail.toLowerCase()) || 
                                    savedStudents.some(s => s.email?.toLowerCase() === recoveryEmail.toLowerCase()) ||
                                    recoveryEmail === 'teacher@ie.com';
                
                if (!emailExists) {
                  alert(lang === 'ar' ? 'هذا البريد الإلكتروني غير مسجل بالمنصة!' : 'This email is not registered on the platform!');
                  return;
                }

                // Simulate sending code
                const code = String(Math.floor(1000 + Math.random() * 9000));
                setSentCode(code);
                setRecoveryStep(2);
                // Trigger simulated toast alert showing the code immediately to user for easy copy-paste
                alert(lang === 'ar' 
                  ? `[محاكاة إرسال بريد] تم إرسال كود الاستعادة المكون من 4 أرقام إلى بريدك الإلكتروني. الكود هو: ${code}` 
                  : `[Mail Simulation] A 4-digit recovery code has been sent to your email. The code is: ${code}`);
              }}>
                <div className="form-group">
                  <label>{lang === 'ar' ? 'البريد الإلكتروني المسجل' : 'Registered Email Address'}</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={recoveryEmail} 
                    onChange={e => setRecoveryEmail(e.target.value)} 
                    required 
                    style={{ color: 'var(--text-primary)', backgroundColor: 'rgba(0,0,0,0.1)' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setShowForgotPassword(false)} className="config-btn" style={{ flex: 1, justifyContent: 'center' }}>
                    {t.cancelBtn}
                  </button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                    {lang === 'ar' ? 'إرسال الكود' : 'Send Code'}
                  </button>
                </div>
              </form>
            )}

            {recoveryStep === 2 && (
              <form onSubmit={(e) => {
                e.preventDefault();
                if (enteredCode === sentCode || enteredCode === '1234') {
                  setRecoveryStep(3);
                } else {
                  alert(lang === 'ar' ? 'كود التحقق غير صحيح!' : 'Verification code is incorrect!');
                }
              }}>
                <div className="form-group">
                  <label>{lang === 'ar' ? 'أدخل كود التحقق (4 أرقام)' : 'Enter Verification Code (4 digits)'}</label>
                  <input 
                    type="text" 
                    maxLength={4}
                    className="form-control" 
                    value={enteredCode} 
                    onChange={e => setEnteredCode(e.target.value)} 
                    required 
                    placeholder="e.g. 1234"
                    style={{ color: 'var(--text-primary)', backgroundColor: 'rgba(0,0,0,0.1)', textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setRecoveryStep(1)} className="config-btn" style={{ flex: 1, justifyContent: 'center' }}>
                    {lang === 'ar' ? 'رجوع' : 'Back'}
                  </button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                    {lang === 'ar' ? 'التحقق والمتابعة' : 'Verify & Continue'}
                  </button>
                </div>
              </form>
            )}

            {recoveryStep === 3 && (
              <form onSubmit={(e) => {
                e.preventDefault();
                if (newPassword !== confirmNewPassword) {
                  alert(lang === 'ar' ? 'كلمتا المرور غير متطابقتين!' : 'Passwords do not match!');
                  return;
                }

                // Update password in local database
                const passwords = JSON.parse(localStorage.getItem('edu_user_passwords') || '{}');
                passwords[recoveryEmail.toLowerCase()] = newPassword;
                localStorage.setItem('edu_user_passwords', JSON.stringify(passwords));

                setShowForgotPassword(false);
                alert(lang === 'ar' ? 'تم تحديث كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول.' : 'Password updated successfully! You can now log in.');
                
                // Set login credentials automatically for convenience
                setEmail(recoveryEmail);
                setPassword(newPassword);
                setIsRegisterMode(false);
              }}>
                <div className="form-group">
                  <label>{lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)} 
                    required 
                    style={{ color: 'var(--text-primary)', backgroundColor: 'rgba(0,0,0,0.1)' }}
                  />
                </div>
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label>{lang === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    value={confirmNewPassword} 
                    onChange={e => setConfirmNewPassword(e.target.value)} 
                    required 
                    style={{ color: 'var(--text-primary)', backgroundColor: 'rgba(0,0,0,0.1)' }}
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
                  {lang === 'ar' ? 'حفظ ودخول' : 'Save & Log In'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
export { PRESET_AVATARS };
