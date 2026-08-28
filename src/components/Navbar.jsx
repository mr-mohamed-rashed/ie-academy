import React, { useState, useEffect } from 'react';
import { BookOpen, Globe, Moon, Sun, UserCheck, Settings, LogOut, Camera, Check, Menu, X as CloseIcon } from 'lucide-react';
import { PRESET_AVATARS } from '../mockData';

const Navbar = ({ 
  lang, 
  theme, 
  userRole, 
  activeStudentId,
  activeInstructorId,
  students,
  instructors,
  currentUser, // Active logged in user
  onLangToggle, 
  onThemeToggle, 
  onRoleChange,
  onStudentChange,
  onInstructorChange,
  onLogout,
  onUpdateProfile,
  activeGradeId,
  activeGroupId,
  onGradeChange,
  onGroupChange,
  onPlayVideo
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editAvatar, setEditAvatar] = useState(currentUser?.avatar || '');
  const [editSubject, setEditSubject] = useState(currentUser?.subject || '');
  const [editYear, setEditYear] = useState(currentUser?.year || currentUser?.yearAr || '');
  const [editParentPhone, setEditParentPhone] = useState(currentUser?.parentPhone || '');
  const [editVideoUrl, setEditVideoUrl] = useState(currentUser?.videoUrl || currentUser?.introVideo || '');
  const [editAbout, setEditAbout] = useState(currentUser?.about || currentUser?.aboutAr || '');
  const [editPrice, setEditPrice] = useState(currentUser?.price || '');
  const [editPaymentMethods, setEditPaymentMethods] = useState(currentUser?.paymentMethods || '');
  const [editWhatsapp, setEditWhatsapp] = useState(currentUser?.whatsapp || '');
  const [editCashNumber, setEditCashNumber] = useState(currentUser?.cashNumber || '');
  const [editPaymentType, setEditPaymentType] = useState(currentUser?.paymentType || 'cash');

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

  const t = {
    en: {
      logo: "I E ACADEMY",
      role: "Current Role",
      visitor: "Homepage (Visitor)",
      instructor: "Instructor View",
      student: "Student View",
      admin: "Admin Control Panel",
      studentSelect: "Select Student Profile",
      teacherSelect: "Select Teacher Profile",
      langText: "العربية",
      themeDark: "Dark Mode",
      themeLight: "Light Mode",
      editProfile: "Edit Profile Settings",
      logout: "Log Out",
      modalTitle: "Edit Profile Settings",
      modalSubtitle: "Update your name, picture, and specialization.",
      nameLabel: "Full Name",
      avatarLabel: "Profile Picture",
      subjectLabel: "Specialized Subject",
      yearLabel: "Grade Level / Year",
      parentPhoneLabel: "Parent Phone Number",
      submitBtn: "Save Changes",
      cancelBtn: "Cancel",
      avatarOrPaste: "Or paste custom image URL:",
      videoLabel: "Introductory Video Link (YouTube/Direct)"
    },
    ar: {
      logo: "I E ACADEMY",
      role: "الدور الحالي",
      visitor: "الرئيسية (زائر)",
      instructor: "بوابة المعلم",
      student: "بوابة الطالب",
      admin: "لوحة تحكم المدير",
      studentSelect: "اختر حساب الطالب",
      teacherSelect: "اختر حساب المعلم",
      langText: "English",
      themeDark: "الوضع الداكن",
      themeLight: "الوضع الفاتح",
      editProfile: "تعديل حسابي الشخصي",
      logout: "تسجيل الخروج",
      modalTitle: "تعديل بيانات الحساب",
      modalSubtitle: "تحديث اسمك وصورتك الرمزية وتخصصك التعليمي.",
      nameLabel: "الاسم الكامل",
      avatarLabel: "صورة الحساب",
      subjectLabel: "المادة المتخصص فيها المدرس",
      yearLabel: "الصف الدراسي / المرحلة",
      parentPhoneLabel: "رقم هاتف ولي الأمر",
      submitBtn: "حفظ التغييرات",
      cancelBtn: "إلغاء",
      avatarOrPaste: "أو الصق رابط صورة مخصص:",
      videoLabel: "رابط فيديو تعريفي للمدرس (يوتيوب أو مباشر)"
    }
  }[lang];

  const handleEditAvatarFileChange = (e) => {
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
      
      setEditAvatar(canvas.toDataURL('image/jpeg', 0.9));
      setRawImage(null);
    };
  };

  // Prevent background scrolling when modals are open
  useEffect(() => {
    if (showEditModal || rawImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showEditModal, rawImage]);

  // Initialize form fields when opening modal
  const openModal = () => {
    setEditName(currentUser?.name || '');
    setEditAvatar(currentUser?.avatar || '');
    setEditSubject(currentUser?.subject || '');
    setEditYear(currentUser?.year || currentUser?.yearAr || '');
    setEditParentPhone(currentUser?.parentPhone || '');
    setEditVideoUrl(currentUser?.videoUrl || currentUser?.introVideo || '');
    setEditAbout(currentUser?.about || currentUser?.aboutAr || '');
    setEditPrice(currentUser?.price || '');
    setEditPaymentMethods(currentUser?.paymentMethods || '');
    setEditWhatsapp(currentUser?.whatsapp || '');
    setEditCashNumber(currentUser?.cashNumber || '');
    setEditPaymentType(currentUser?.paymentType || 'cash');
    setShowEditModal(true);
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    onUpdateProfile({
      name: editName,
      avatar: editAvatar,
      subject: currentUser.role === 'instructor' ? editSubject : '',
      yearAr: currentUser.role === 'instructor' ? editYear : undefined,
      yearEn: currentUser.role === 'instructor' ? editYear : undefined,
      videoUrl: currentUser.role === 'instructor' ? editVideoUrl : undefined,
      about: currentUser.role === 'instructor' ? editAbout : undefined,
      aboutAr: currentUser.role === 'instructor' ? editAbout : undefined,
      aboutEn: currentUser.role === 'instructor' ? editAbout : undefined,
      price: currentUser.role === 'instructor' ? editPrice : undefined,
      paymentMethods: currentUser.role === 'instructor' ? editPaymentMethods : undefined,
      whatsapp: currentUser.role === 'instructor' ? editWhatsapp : undefined,
      cashNumber: currentUser.role === 'instructor' ? editCashNumber : undefined,
      paymentType: currentUser.role === 'instructor' ? editPaymentType : undefined,
      parentPhone: currentUser.role === 'student' ? editParentPhone : undefined
    });
    setShowEditModal(false);
  };

  return (
    <>
      <button 
        className="mobile-menu-btn" 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle Menu"
      >
        {isMobileMenuOpen ? <CloseIcon size={24} /> : <Menu size={24} />}
      </button>

      {isMobileMenuOpen && (
        <div className="sidebar-backdrop" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
        <div className="brand-icon">
          <BookOpen size={24} />
        </div>
        <span className="brand-name">{t.logo}</span>
      </div>

      <nav className="sidebar-nav">
        {userRole === 'instructor' && (() => {
          const inst = instructors.find(i => i.id === activeInstructorId);
          return inst?.grades?.map((grade) => {
          const isExpanded = activeGradeId === grade.id;
          return (
            <div key={grade.id} className="sidebar-grade-section" style={{ marginBottom: '0.5rem' }}>
              <div 
                className={`sidebar-grade-header ${isExpanded ? 'expanded' : ''}`}
                onClick={() => {
                  onGradeChange(grade.id);
                  if (grade.groups?.length > 0) {
                    onGroupChange(grade.groups[0].id);
                  }
                }}
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                  padding: '0.75rem 1rem', cursor: 'pointer', borderRadius: '8px',
                  backgroundColor: isExpanded ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: isExpanded ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: isExpanded ? '700' : '600',
                  transition: 'all 0.2s'
                }}
              >
                <span>{lang === 'ar' ? grade.nameAr : grade.nameEn}</span>
                <span style={{ fontSize: '0.75rem' }}>{isExpanded ? '▼' : '▶'}</span>
              </div>
              
              {isExpanded && grade.groups?.length > 0 && (
                <div className="sidebar-groups-list" style={{ paddingInlineStart: '1rem', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {grade.groups.map(group => (
                    <div 
                      key={group.id}
                      className={`sidebar-group-item ${activeGroupId === group.id ? 'active' : ''}`}
                      onClick={() => onGroupChange(group.id)}
                      style={{
                        padding: '0.5rem 1rem', cursor: 'pointer', borderRadius: '6px', fontSize: '0.85rem',
                        backgroundColor: activeGroupId === group.id ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                        color: activeGroupId === group.id ? 'var(--color-success)' : 'var(--text-muted)',
                        borderInlineStart: `3px solid ${activeGroupId === group.id ? 'var(--color-success)' : 'transparent'}`,
                        transition: 'all 0.2s'
                      }}
                    >
                      {lang === 'ar' ? group.nameAr : group.nameEn}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })})()}
      </nav>

      <div className="sidebar-footer" style={{ gap: '0.5rem' }}>
        
        {/* Utilities Row: Language, Theme */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="config-btn" onClick={onLangToggle} style={{ flex: 1, justifyContent: 'center', padding: '0.4rem', fontSize: '0.8rem' }}>
            <Globe size={14} />
            <span>{t.langText}</span>
          </button>

          <button className="config-btn" onClick={onThemeToggle} style={{ flex: 1, justifyContent: 'center', padding: '0.4rem', fontSize: '0.8rem' }}>
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            <span>{theme === 'dark' ? t.themeLight : t.themeDark}</span>
          </button>
        </div>

        {/* User Badging, Settings & Logout */}
        {currentUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
            {/* Clean User Info Card */}
            <div className="user-badge" style={{ display: 'flex', alignItems: 'center', padding: '0.65rem 0.85rem', borderRadius: '8px', backgroundColor: 'var(--bg-glass)', border: '1px solid var(--border-glass)', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', width: '100%' }}>
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="user-badge-img" 
                  style={{ 
                    width: '36px', 
                    height: '36px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: (currentUser.role === 'instructor' && currentUser.isSubscribed) ? '2px solid var(--color-gold)' : 'none',
                    boxShadow: (currentUser.role === 'instructor' && currentUser.isSubscribed) ? '0 0 8px var(--color-gold)' : 'none',
                    flexShrink: 0
                  }}
                />
                <div className="user-badge-info" style={{ flexGrow: 1, minWidth: 0 }}>
                  <p className="user-badge-name" style={{ fontSize: '0.85rem', margin: 0, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={currentUser.name}>{currentUser.name}</p>
                  <p className="user-badge-role" style={{ fontSize: '0.7rem', margin: 0, color: 'var(--text-secondary)' }}>
                    {currentUser.role === 'instructor' 
                      ? (currentUser.subject || 'Instructor') 
                      : (currentUser.role === 'admin' 
                        ? (lang === 'ar' ? 'مدير المنصة' : 'System Admin')
                        : (currentUser.role === 'support'
                          ? (lang === 'ar' ? 'الدعم الفني والخدمة' : 'Support Team')
                          : (lang === 'ar' ? 'طالب' : 'Student')))}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons Stretched Full Width */}
            <button 
              onClick={openModal} 
              className="btn-primary" 
              style={{ 
                width: '100%', 
                padding: '0.55rem', 
                fontSize: '0.8rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.5rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              <Settings size={14} />
              <span>{lang === 'ar' ? 'تعديل البيانات' : 'Edit Profile'}</span>
            </button>

            {localStorage.getItem('edu_last_video') && (
              <button 
                onClick={() => onPlayVideo(localStorage.getItem('edu_last_video'))}
                className="btn-primary" 
                style={{ 
                  width: '100%', 
                  padding: '0.55rem', 
                  fontSize: '0.8rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '0.5rem',
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  color: '#818cf8',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
              >
                <svg style={{ width: '12px', height: '12px', fill: 'currentColor' }} viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <span>{lang === 'ar' ? 'آخر فيديو شاهدته' : 'Resume Last Video'}</span>
              </button>
            )}

            <button 
              onClick={onLogout} 
              className="btn-primary" 
              style={{ 
                width: '100%', 
                padding: '0.55rem', 
                fontSize: '0.8rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.5rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: 'var(--accent-red)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              <LogOut size={14} />
              <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Log Out'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Edit Profile Settings Modal Overlay */}
      {showEditModal && (
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
          <div className="glass-card" style={{ width: '90%', maxWidth: '450px', maxHeight: '85vh', padding: '1.5rem', display: 'flex', flexDirection: 'column', animation: 'slide-in 0.3s ease-out' }}>
            <div style={{ marginBottom: '1rem', textAlign: 'start' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>{t.modalTitle}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>{t.modalSubtitle}</p>
            </div>

            <form onSubmit={handleUpdateSubmit} style={{ textAlign: 'start', display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
              {/* Scrollable form fields body container */}
              <div style={{ overflowY: 'auto', flexGrow: 1, paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                {/* Name field */}
              <div className="form-group">
                <label>{t.nameLabel}</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required 
                />
              </div>

              {/* Preset avatar selector */}
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Camera size={14} />
                  <span>{t.avatarLabel}</span>
                </label>
                <div className="avatar-option-picker">
                  {PRESET_AVATARS.map((url, idx) => (
                    <div key={idx} style={{ position: 'relative' }}>
                      <img 
                        src={url} 
                        alt="Avatar Option" 
                        onClick={() => setEditAvatar(url)}
                        className={`avatar-option-img ${editAvatar === url ? 'selected' : ''}`}
                      />
                      {editAvatar === url && (
                        <span style={{ 
                          position: 'absolute', bottom: 0, right: 0, 
                          backgroundColor: 'var(--accent-primary)', 
                          color: 'white', borderRadius: '50%', 
                          width: '14px', height: '14px', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '8px', border: '1px solid #fff'
                        }}>
                          <Check size={8} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                 <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <img 
                      src={editAvatar} 
                      alt="Preview" 
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--accent-primary)' }} 
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', flex: 1 }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {lang === 'ar' ? 'رفع صورة من جهازك:' : 'Upload from your device:'}
                      </span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleEditAvatarFileChange} 
                        style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}
                      />
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>{t.avatarOrPaste}</span>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={editAvatar.startsWith('data:') ? '' : editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem', marginTop: '0.15rem' }}
                  />
                </div>
              </div>

              {/* Subject field (for instructors) */}
              {currentUser.role === 'instructor' && (
                <>
                  <div className="form-group">
                    <label>{t.subjectLabel}</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>{t.yearLabel}</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder={lang === 'ar' ? 'مثل: ثانوي' : 'e.g. High School'}
                      value={editYear}
                      onChange={(e) => setEditYear(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>{t.videoLabel}</label>
                    <input 
                      type="url" 
                      className="form-control" 
                      placeholder="https://..."
                      value={editVideoUrl}
                      onChange={(e) => setEditVideoUrl(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>{lang === 'ar' ? 'نبذة عن المدرس' : 'About the Teacher'}</label>
                    <textarea 
                      className="form-control" 
                      rows="3"
                      placeholder={lang === 'ar' ? 'اكتب نبذة مختصرة عن خبراتك وشهاداتك...' : 'Write a short description of your experience...'}
                      value={editAbout}
                      onChange={(e) => setEditAbout(e.target.value)}
                      style={{ resize: 'vertical', width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-glass)', backgroundColor: 'var(--bg-input)' }}
                    />
                  </div>
                  <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label>{lang === 'ar' ? 'المبلغ المحدد' : 'Subscription Price'}</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder={lang === 'ar' ? 'مثال: ٢٠٠ جنيه' : 'e.g. 200 EGP'}
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                      />
                    </div>
                    <div>
                      <label>{lang === 'ar' ? 'طريقة الدفع' : 'Payment Type'}</label>
                      <select 
                        className="form-control" 
                        value={editPaymentType}
                        onChange={(e) => setEditPaymentType(e.target.value)}
                        style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-input)' }}
                      >
                        <option value="cash">{lang === 'ar' ? 'كاش (فودافون كاش)' : 'Cash (Vodafone Cash)'}</option>
                        <option value="instapay">{lang === 'ar' ? 'انستا باي' : 'InstaPay'}</option>
                        <option value="both">{lang === 'ar' ? 'كاش أو انستا باي' : 'Cash or InstaPay'}</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label>
                      {editPaymentType === 'instapay' 
                        ? (lang === 'ar' ? 'رقم أو عنوان انستا باي' : 'InstaPay Number/Username')
                        : (lang === 'ar' ? 'رقم الكاش (محفظة المحمول)' : 'Mobile Wallet Cash Number')}
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder={editPaymentType === 'instapay' ? 'username@instapay' : '01xxxxxxxxx'}
                      value={editCashNumber}
                      onChange={(e) => setEditCashNumber(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label>{lang === 'ar' ? 'رقم الواتساب للتواصل (مثال: 201234567890)' : 'WhatsApp Number (e.g. 201234567890)'}</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. 201012345678"
                      value={editWhatsapp}
                      onChange={(e) => setEditWhatsapp(e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* Parent Phone (for students) */}
              {currentUser.role === 'student' && (
                <div className="form-group">
                  <label>{t.parentPhoneLabel}</label>
                  <input 
                    type="tel" 
                    className="form-control" 
                    placeholder="01xxxxxxxxx"
                    value={editParentPhone}
                    onChange={(e) => setEditParentPhone(e.target.value)}
                    required 
                  />
                </div>
              )}

              </div>

              {/* Actions Footer (Fixed at the bottom) */}
              <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-glass)' }}>
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
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

            </form>
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
    </aside>
    </>
  );
};

export default Navbar;
export { PRESET_AVATARS };
