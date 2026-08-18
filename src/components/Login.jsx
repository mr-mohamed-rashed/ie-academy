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
  const [studentPhone, setStudentPhone] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [studentGradeType, setStudentGradeType] = useState('sec'); // 'sec' | 'prep'
  const [studentStep, setStudentStep] = useState(1);

  // Email login states
  const [loginTab, setLoginTab] = useState(initialRole === 'admin' ? 'email' : 'quick'); // 'quick' | 'email'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

  const handleGoogleClick = () => {
    // Simulates the auth popup by showing profile completion modal
    setShowModal(true);
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
      if (studentStep === 1 && !inviteTeacherId) {
        setStudentStep(2);
        return;
      }
      if (!selectedInstructor || !selectedGroup) {
        return;
      }
    }

    onLogin({
      name: fullName,
      role: role,
      avatar: avatarUrl,
      subject: role === 'instructor' ? subject : '',
      yearAr: role === 'instructor' ? year : undefined,
      yearEn: role === 'instructor' ? year : undefined,
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
            <button onClick={handleGoogleClick} className="google-btn" style={{ backgroundColor: '#1877F2', color: 'white', borderColor: '#1877F2' }}>
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
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Briefcase size={14} />
                      <span>{t.yearLabel}</span>
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder={t.yearPlaceholder}
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      required={role === 'instructor'} 
                    />
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
                          onChange={(e) => setStudentPhone(e.target.value)}
                          required={role === 'student'} 
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
                          onChange={(e) => setParentPhone(e.target.value)}
                          required={role === 'student'} 
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
                          <option value="sec">{lang === 'ar' ? 'ثانوي' : 'High School'}</option>
                          <option value="prep">{lang === 'ar' ? 'إعدادي' : 'Middle School / Prep'}</option>
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
                        {instructors.filter(i => {
                          if (!i.isSubscribed) return false;
                          const hasPrep = i.yearAr?.includes('إعدادي') || i.yearAr?.includes('اعدادي') || i.yearEn?.toLowerCase().includes('middle') || i.yearEn?.toLowerCase().includes('prep');
                          const hasSec = i.yearAr?.includes('ثانوي') || i.yearEn?.toLowerCase().includes('high') || i.yearEn?.toLowerCase().includes('sec') || i.yearEn?.toLowerCase().includes('secondary');
                          
                          if (studentGradeType === 'prep') return hasPrep;
                          if (studentGradeType === 'sec') return hasSec;
                          return true;
                        }).map(inst => {
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
                        })}
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
    </div>
  );
};

export default Login;
export { PRESET_AVATARS };
