import React, { useState, useEffect } from 'react';
import { BookOpen, User, Briefcase, Camera, Check } from 'lucide-react';

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=120"
];

const Login = ({ onLogin, lang, instructors = [], initialRole, onClose }) => {
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
  const [role, setRole] = useState(initialRole || (inviteTeacherId ? 'student' : 'instructor'));
  const [avatarUrl, setAvatarUrl] = useState(PRESET_AVATARS[0]);
  const [subject, setSubject] = useState('');
  const [year, setYear] = useState('');
  const [selectedStages, setSelectedStages] = useState([]); // for instructor stages selection
  const [studentPhone, setStudentPhone] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [studentGradeType, setStudentGradeType] = useState('sec'); // 'sec' | 'prep' | 'primary' | 'univ'
  const [studentStep, setStudentStep] = useState(1);

  // Email login states
  const [loginTab, setLoginTab] = useState(initialRole === 'admin' ? 'email' : 'quick'); // 'quick' | 'email'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Simulated OAuth Auth Modals
  const [showGoogleAuth, setShowGoogleAuth] = useState(false);
  const [showFacebookAuth, setShowFacebookAuth] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

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

  // Load saved credentials on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('edu_saved_email');
    const savedPassword = localStorage.getItem('edu_saved_password');
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
      setLoginTab('email');
    }
  }, []);

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

  const checkEmailExists = (selectedEmail) => {
    // Check if an instructor has this email
    const existingInst = instructors?.find(i => i.email === selectedEmail);
    if (existingInst) {
      return { role: 'instructor', data: existingInst };
    }
    // Check if a student has this email
    const existingStud = students?.find(s => s.email === selectedEmail);
    if (existingStud) {
      return { role: 'student', data: existingStud };
    }
    return null;
  };

  const handleGoogleClick = () => {
    setShowGoogleAuth(true);
  };

  const handleFacebookClick = () => {
    setShowFacebookAuth(true);
  };

  const handleEmailLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    
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

        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.75rem' }}>{t.headline}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>{t.tagline}</p>

        {/* Tab Selector */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-glass)', marginBottom: '2rem' }}>
          <button 
            onClick={() => setLoginTab('quick')}
            style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: 'none', borderBottom: loginTab === 'quick' ? '2px solid var(--accent-primary)' : 'none', color: loginTab === 'quick' ? 'var(--text-primary)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
          >
            {t.tabQuick}
          </button>
          <button 
            onClick={() => setLoginTab('email')}
            style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: 'none', borderBottom: loginTab === 'email' ? '2px solid var(--accent-primary)' : 'none', color: loginTab === 'email' ? 'var(--text-primary)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
          >
            {t.tabEmail}
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
              <span>{t.googleBtn}</span>
            </button>

            {/* Facebook Sign In Button */}
            <button onClick={handleFacebookClick} className="google-btn" style={{ backgroundColor: '#1877F2', color: 'white', borderColor: '#1877F2' }}>
              <svg className="google-icon-svg" viewBox="0 0 24 24" style={{ fill: 'white' }}>
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span style={{ color: 'white' }}>{t.facebookBtn}</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleEmailLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'start' }}>
            {errorMessage && (
              <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-red)', fontSize: '0.85rem', fontWeight: 600, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                {errorMessage}
              </div>
            )}
            <div className="form-group" style={{ margin: 0 }}>
              <label>{t.emailLabel}</label>
              <input 
                type="email" 
                required 
                className="form-control" 
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              />
            </div>
            
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)} 
                style={{ accentColor: 'var(--accent-primary)' }}
              />
              <span>{t.rememberMeLabel}</span>
            </label>

            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
              {t.loginBtn}
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
          <div className="glass-card" style={{ width: '90%', maxWidth: '485px', padding: '2rem', animation: 'slide-in 0.3s ease-out' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.25rem' }}>{t.modalTitle}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.modalSubtitle}</p>
            </div>

            <form onSubmit={handleSubmit}>
              
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
                />
              </div>

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
          </div>
        </div>
      )}

      {/* Simulated Google Authentication Choose Account Modal */}
      {showGoogleAuth && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(8px)',
          direction: lang === 'ar' ? 'rtl' : 'ltr'
        }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '400px', padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: '#ffffff', color: '#1f2937' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <svg style={{ width: '40px', height: '40px' }} viewBox="0 0 24 24">
                <path fill="#ea4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2A11.95 11.95 0 0 0 12 0 11.94 11.94 0 0 0 1.29 6.29l3.73 2.9A7.12 7.12 0 0 1 12 5.04z"/>
                <path fill="#4285f4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46a5.53 5.53 0 0 1-2.4 3.63l3.73 2.9a11.92 11.92 0 0 0 3.7-8.68z"/>
                <path fill="#fbbc05" d="M5.02 8.78A7.13 7.13 0 0 1 12 5.04a7.12 7.12 0 0 1 6.98 3.74l3.73-2.9A11.94 11.94 0 0 0 12 0C7.8 0 4.19 2.05 2.02 5.24l3.73 2.9.27.64z"/>
                <path fill="#34a853" d="M12 18.96c-1.92 0-3.63-.64-4.98-1.74l-3.73 2.9C5.46 21.95 8.54 24 12 24c4.14 0 7.73-1.4 10.3-3.8l-3.73-2.9a7.12 7.12 0 0 1-6.57 1.66z"/>
              </svg>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>
                {lang === 'ar' ? 'اختر حساباً للمتابعة' : 'Choose an account'}
              </h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#6b7280' }}>
                {lang === 'ar' ? 'للمتابعة إلى منصة أكاديمية التعليم' : 'to continue to EduAcademy Portal'}
              </p>
            </div>

            {authLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem' }}>
                <div className="loader" style={{ width: '30px', height: '30px', borderTopColor: '#4285f4' }}></div>
                <span style={{ fontSize: '0.85rem', color: '#4b5563' }}>{lang === 'ar' ? 'جاري التحقق والمتابعة...' : 'Verifying account...'}</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', textAlign: 'start' }}>
                <button 
                  type="button"
                  onClick={() => {
                    setAuthLoading(true);
                    setTimeout(() => {
                      setAuthLoading(false);
                      setShowGoogleAuth(false);
                      
                      const existing = checkEmailExists('rishobeh@gmail.com');
                      if (existing) {
                        onLogin({
                          id: existing.data.id,
                          name: existing.role === 'instructor' ? (existing.data.nameAr || existing.data.nameEn) : (existing.data.nameEn || existing.data.nameAr),
                          role: existing.role,
                          avatar: existing.data.avatar,
                          email: 'rishobeh@gmail.com',
                          isSubscribed: existing.data.isSubscribed,
                          isExisting: true
                        });
                      } else {
                        setFullName('Mohamed Rashed');
                        setEmail('rishobeh@gmail.com');
                        setAvatarUrl(PRESET_AVATARS[0]);
                        setShowModal(true);
                      }
                    }, 1200);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', width: '100%', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb', cursor: 'pointer', transition: 'background-color 0.2s', textDecoration: 'none' }}
                >
                  <img src={PRESET_AVATARS[0]} style={{ width: '32px', height: '32px', borderRadius: '50%' }} alt="Mohamed" />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.85rem', color: '#1f2937' }}>Mohamed Rashed (أ/ محمد راشد)</strong>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>rishobeh@gmail.com</span>
                  </div>
                </button>

                <button 
                  type="button"
                  onClick={() => {
                    setAuthLoading(true);
                    setTimeout(() => {
                      setAuthLoading(false);
                      setShowGoogleAuth(false);
                      
                      const existing = checkEmailExists('student.test@gmail.com');
                      if (existing) {
                        onLogin({
                          id: existing.data.id,
                          name: existing.role === 'student' ? (existing.data.nameAr || existing.data.nameEn) : (existing.data.nameEn || existing.data.nameAr),
                          role: existing.role,
                          avatar: existing.data.avatar,
                          email: 'student.test@gmail.com',
                          isExisting: true
                        });
                      } else {
                        setFullName('Test Student');
                        setEmail('student.test@gmail.com');
                        setAvatarUrl(PRESET_AVATARS[1]);
                        setShowModal(true);
                      }
                    }, 1200);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', width: '100%', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb', cursor: 'pointer', transition: 'background-color 0.2s', textDecoration: 'none' }}
                >
                  <img src={PRESET_AVATARS[1]} style={{ width: '32px', height: '32px', borderRadius: '50%' }} alt="Student" />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.85rem', color: '#1f2937' }}>Test Student (طالب تجريبي)</strong>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>student.test@gmail.com</span>
                  </div>
                </button>

                <button 
                  type="button"
                  onClick={() => setShowGoogleAuth(false)}
                  style={{ padding: '0.65rem', border: 'none', borderRadius: '8px', backgroundColor: '#e5e7eb', color: '#374151', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', marginTop: '1rem', width: '100%' }}
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Simulated Facebook Authentication Authorization Modal */}
      {showFacebookAuth && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(8px)',
          direction: lang === 'ar' ? 'rtl' : 'ltr'
        }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '400px', padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: '#ffffff', color: '#1f2937' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <svg style={{ width: '40px', height: '40px', fill: '#1877F2' }} viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>
                {lang === 'ar' ? 'تفويض تطبيق EduAcademy' : 'Authorize EduAcademy App'}
              </h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#6b7280', lineHeight: '1.5' }}>
                {lang === 'ar' 
                  ? 'يطلب تطبيق EduAcademy الحصول على إذن للوصول إلى اسمك وصورتك الشخصية والبريد الإلكتروني المسجل.' 
                  : 'EduAcademy is requesting permission to access your profile name, picture, and email address.'}
              </p>
            </div>

            {authLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem' }}>
                <div className="loader" style={{ width: '30px', height: '30px', borderTopColor: '#1877F2' }}></div>
                <span style={{ fontSize: '0.85rem', color: '#4b5563' }}>{lang === 'ar' ? 'جاري الاتصال بـ Facebook...' : 'Connecting to Facebook...'}</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                <button 
                  type="button"
                  onClick={() => {
                    setAuthLoading(true);
                    setTimeout(() => {
                      setAuthLoading(false);
                      setShowFacebookAuth(false);
                      
                      const existing = checkEmailExists('rishobeh@gmail.com');
                      if (existing) {
                        onLogin({
                          id: existing.data.id,
                          name: existing.role === 'instructor' ? (existing.data.nameAr || existing.data.nameEn) : (existing.data.nameEn || existing.data.nameAr),
                          role: existing.role,
                          avatar: existing.data.avatar,
                          email: 'rishobeh@gmail.com',
                          isSubscribed: existing.data.isSubscribed,
                          isExisting: true
                        });
                      } else {
                        setFullName('Mohamed Rashed');
                        setEmail('rishobeh@gmail.com');
                        setAvatarUrl(PRESET_AVATARS[0]);
                        setShowModal(true);
                      }
                    }, 1200);
                  }}
                  style={{ padding: '0.75rem', border: 'none', borderRadius: '8px', backgroundColor: '#1877F2', color: 'white', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.2s', width: '100%' }}
                >
                  {lang === 'ar' ? 'متابعة باسم محمد راشد' : 'Continue as Mohamed Rashed'}
                </button>

                <button 
                  type="button"
                  onClick={() => setShowFacebookAuth(false)}
                  style={{ padding: '0.65rem', border: 'none', borderRadius: '8px', backgroundColor: '#e5e7eb', color: '#374151', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', marginTop: '0.25rem', width: '100%' }}
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
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
    </div>
  );
};

export default Login;
export { PRESET_AVATARS };
