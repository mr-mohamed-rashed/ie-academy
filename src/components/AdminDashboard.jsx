import React, { useState } from 'react';
import { Users, DollarSign, CheckCircle, AlertCircle, PlusCircle, Edit, Trash2, Search, Check, Camera, ShieldAlert, Clock, X } from 'lucide-react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=120",
  "https://images.unsplash.com/photo-1580894732444-8febeb78fb3e?auto=format&fit=crop&q=80&w=120",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120"
];
const AdminDashboard = ({
  instructors,
  students,
  onAddTeacher,
  onEditTeacher,
  onDeleteTeacher,
  onToggleSubscription,
  lang,
  triggerToast,
  systemFee,
  setSystemFee,
  academicYearFee,
  setAcademicYearFee,
  pendingPayments = [],
  onApprovePayment,
  onRejectPayment
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingScreenshot, setViewingScreenshot] = useState(null);
  
  // Modals visibility states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);

  // Form states for adding/editing teachers
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [subjectAr, setSubjectAr] = useState('');
  const [subjectEn, setSubjectEn] = useState('');
  const [yearAr, setYearAr] = useState('');
  const [yearEn, setYearEn] = useState('');
  const [avatar, setAvatar] = useState(PRESET_AVATARS[0]);
  const [introVideo, setIntroVideo] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Removed static SUBSCRIPTION_FEE to use systemFee prop

  const t = {
    en: {
      adminTitle: "System Administration Console",
      adminSubtitle: "Monitor teacher registrations, toggle active listing visibility, and manage academies.",
      statTotalTeachers: "Total Instructors",
      statSubscribed: "Subscribed (Paid)",
      statFree: "Free (Hidden)",
      statRevenue: "Estimated Monthly Revenues",
      currency: "EGP",
      addTeacherBtn: "Add New Instructor",
      searchPlaceholder: "Search teachers by name or subject...",
      tblAvatar: "Avatar",
      tblName: "Instructor Name",
      tblSubject: "Subject",
      tblYear: "Class Year",
      tblVisibility: "Public Visibility",
      tblActions: "Actions",
      subscribedBadge: "Subscribed (Visible)",
      freeBadge: "Free (Hidden)",
      togglePaid: "Change visibility state",
      deleteConfirm: "Are you sure you want to remove this instructor? All related records will be lost.",
      toastDeleteSuccess: "Teacher removed successfully",
      toastAddSuccess: "New teacher added successfully",
      toastEditSuccess: "Teacher profile modified successfully",
      toastToggleSuccess: "Visibility status toggled!",
      modalAddTitle: "Add New Instructor Profile",
      modalEditTitle: "Modify Instructor Profile",
      modalNameAr: "Name (Arabic)",
      modalNameEn: "Name (English)",
      modalSubjAr: "Subject (Arabic)",
      modalSubjEn: "Subject (English)",
      modalYearAr: "Academic Year (Arabic)",
      modalYearEn: "Academic Year (English)",
      modalAvatar: "Choose Avatar Picture",
      modalCustomAvatar: "Or paste custom image URL:",
      modalIntroVideo: "Intro Video Link (YouTube):",
      modalSubscribed: "Active Subscribed (Visible on Platform)",
      saveBtn: "Save Profile",
      cancelBtn: "Cancel",
      chartSubjectDist: "Teacher Specialty Distribution",
      chartStatusDist: "Subscription Visibility Breakdown",
      noTeachersFound: "No teachers match your search filter."
    },
    ar: {
      adminTitle: "لوحة التحكم وإدارة النظام",
      adminSubtitle: "إدارة حسابات المعلمين، التحكم في ظهورهم في الدليل العام، ومراقبة اشتراكات المنصة.",
      statTotalTeachers: "إجمالي المدرسين",
      statSubscribed: "مشتركين (ظاهر للعامة)",
      statFree: "حسابات مجانية (مخفي)",
      statRevenue: "العائدات الشهرية المتوقعة",
      currency: "جنيه",
      addTeacherBtn: "إضافة معلم جديد للمنصة",
      searchPlaceholder: "ابحث عن المدرسين بالاسم أو المادة...",
      tblAvatar: "الصورة",
      tblName: "اسم المعلم",
      tblSubject: "المادة الدراسية",
      tblYear: "المرحلة التعليمية",
      tblVisibility: "حالة الظهور للزوار",
      tblActions: "الإجراءات",
      subscribedBadge: "مشترك (ظاهر بالمنصة)",
      freeBadge: "مجاني (مخفي للزوار)",
      togglePaid: "تغيير حالة الاشتراك والظهور",
      deleteConfirm: "هل أنت متأكد من حذف هذا المعلم؟ سيتم حذف جميع المجموعات والدرجات المرتبطة به نهائياً.",
      toastDeleteSuccess: "تم حذف حساب المعلم بنجاح",
      toastAddSuccess: "تم إضافة المعلم الجديد بنجاح للمنصة",
      toastEditSuccess: "تم تعديل بيانات حساب المعلم بنجاح",
      toastToggleSuccess: "تم تغيير حالة الظهور والاشتراك بنجاح!",
      modalAddTitle: "إضافة حساب معلم جديد",
      modalEditTitle: "تعديل بيانات حساب المعلم",
      modalNameAr: "اسم المعلم (بالعربية)",
      modalNameEn: "اسم المعلم (بالإنجليزية)",
      modalSubjAr: "المادة الدراسية (بالعربية)",
      modalSubjEn: "المادة الدراسية (بالإنجليزية)",
      modalYearAr: "العام الدراسي (بالعربية)",
      modalYearEn: "العام الدراسي (بالإنجليزية)",
      modalAvatar: "اختر الصورة الرمزية للمدرس",
      modalCustomAvatar: "أو الصق رابط صورة مخصص من الويب:",
      modalIntroVideo: "رابط فيديو تعريفي (يوتيوب):",
      modalSubscribed: "تفعيل الاشتراك والظهور فوراً للزوار (مدفوع)",
      saveBtn: "حفظ البيانات",
      cancelBtn: "إلغاء",
      chartSubjectDist: "توزيع المعلمين حسب التخصصات",
      chartStatusDist: "تقسيم حالة الاشتراكات والظهور",
      noTeachersFound: "لم يتم العثور على أي معلمين يطابقون البحث."
    }
  }[lang];

  // Stats Calculations
  const totalCount = instructors.length;
  const subscribedCount = instructors.filter(i => i.isSubscribed).length;
  const freeCount = totalCount - subscribedCount;
  const estimatedRevenue = subscribedCount * systemFee;

  // Filtered teachers list based on search input
  const filteredInstructors = instructors.filter(i => {
    const name = lang === 'ar' ? i.nameAr : i.nameEn;
    const subject = lang === 'ar' ? i.subjectAr : i.subjectEn;
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           subject.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Chart data 1: Specialty distribution
  const specialtyCounts = {};
  instructors.forEach(i => {
    const spec = lang === 'ar' ? i.subjectAr : i.subjectEn;
    specialtyCounts[spec] = (specialtyCounts[spec] || 0) + 1;
  });

  const chartSpecialtyData = {
    labels: Object.keys(specialtyCounts),
    datasets: [
      {
        data: Object.values(specialtyCounts),
        backgroundColor: ['rgba(99, 102, 241, 0.75)', 'rgba(139, 92, 246, 0.75)', 'rgba(16, 185, 129, 0.75)', 'rgba(245, 158, 11, 0.75)', 'rgba(239, 68, 68, 0.75)'],
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1
      }
    ]
  };

  // Chart data 2: Subscription breakdown
  const chartStatusData = {
    labels: [t.subscribedBadge, t.freeBadge],
    datasets: [
      {
        data: [subscribedCount, freeCount],
        backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(148, 163, 184, 0.4)'],
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1
      }
    ]
  };

  // Open modals with blank or preset data
  const handleOpenAdd = () => {
    setNameAr('');
    setNameEn('');
    setSubjectAr('');
    setSubjectEn('');
    setYearAr('الصف الثالث الإعدادي 2026');
    setYearEn('3rd Prep 2026');
    setAvatar(PRESET_AVATARS[0]);
    setIntroVideo('');
    setIsSubscribed(false);
    setShowAddModal(true);
  };

  const handleOpenEdit = (teacher) => {
    setSelectedTeacherId(teacher.id);
    setNameAr(teacher.nameAr || '');
    setNameEn(teacher.nameEn || '');
    setSubjectAr(teacher.subjectAr || '');
    setSubjectEn(teacher.subjectEn || '');
    setYearAr(teacher.yearAr || '');
    setYearEn(teacher.yearEn || '');
    setAvatar(teacher.avatar || PRESET_AVATARS[0]);
    setIntroVideo(teacher.introVideo || '');
    setIsSubscribed(!!teacher.isSubscribed);
    setShowEditModal(true);
  };

  // CRUD Submits
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!nameAr || !nameEn || !subjectAr || !subjectEn) return;

    onAddTeacher({
      nameAr,
      nameEn,
      subjectAr,
      subjectEn,
      yearAr,
      yearEn,
      avatar,
      introVideo,
      isSubscribed
    });

    triggerToast(t.toastAddSuccess, 'success');
    setShowAddModal(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!selectedTeacherId || !nameAr || !nameEn || !subjectAr || !subjectEn) return;

    onEditTeacher(selectedTeacherId, {
      nameAr,
      nameEn,
      subjectAr,
      subjectEn,
      yearAr,
      yearEn,
      avatar,
      introVideo,
      isSubscribed
    });

    triggerToast(t.toastEditSuccess, 'success');
    setShowEditModal(false);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm(t.deleteConfirm)) {
      onDeleteTeacher(id);
      triggerToast(t.toastDeleteSuccess, 'success');
    }
  };

  return (
    <div style={{ animation: 'slide-in 0.3s ease-out' }}>
      
      {/* Title Header */}
      <div className="card-title-group" style={{ marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={26} color="var(--accent-purple)" />
          <span>{t.adminTitle}</span>
        </h2>
        <p>{t.adminSubtitle}</p>
      </div>

      {/* KPI Stats cards */}
      <div className="dashboard-grid" style={{ marginBottom: '2.5rem' }}>
        
        {/* Total Teachers */}
        <div className="glass-card" style={{ gridColumn: 'span 3', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)' }}>
            <Users size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>{t.statTotalTeachers}</span>
            <strong style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalCount}</strong>
          </div>
        </div>

        {/* Subscribed Active */}
        <div className="glass-card" style={{ gridColumn: 'span 3', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-green)' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>{t.statSubscribed}</span>
            <strong style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-green)' }}>{subscribedCount}</strong>
          </div>
        </div>

        {/* Free Hidden */}
        <div className="glass-card" style={{ gridColumn: 'span 3', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'rgba(148, 163, 184, 0.15)', color: 'var(--text-muted)' }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>{t.statFree}</span>
            <strong style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-secondary)' }}>{freeCount}</strong>
          </div>
        </div>

        {/* Projected monthly revenue */}
        <div className="glass-card" style={{ gridColumn: 'span 3', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', position: 'relative' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'rgba(251, 191, 36, 0.15)', color: 'var(--color-gold)' }}>
            <DollarSign size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>{t.statRevenue}</span>
            <strong style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-gold)' }}>
              {estimatedRevenue} {t.currency}
            </strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem', borderTop: '1px solid var(--border-glass)', paddingTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <input 
                  type="number" 
                  value={systemFee}
                  onChange={(e) => setSystemFee(Number(e.target.value))}
                  style={{ width: '60px', padding: '0.2rem', borderRadius: '4px', border: '1px solid var(--border-glass)', backgroundColor: 'transparent', color: 'var(--color-gold)', fontSize: '0.8rem' }}
                  title="تعديل الاشتراك الشهري"
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{lang === 'ar' ? 'جنيه / شهر' : 'EGP / mo'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <input 
                  type="number" 
                  value={academicYearFee}
                  onChange={(e) => setAcademicYearFee(Number(e.target.value))}
                  style={{ width: '60px', padding: '0.2rem', borderRadius: '4px', border: '1px solid var(--border-glass)', backgroundColor: 'transparent', color: 'var(--color-gold)', fontSize: '0.8rem' }}
                  title="تعديل الاشتراك السنوي"
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{lang === 'ar' ? 'جنيه / سنوي (9 أشهر)' : 'EGP / Year (9m)'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Graphs */}
      <div className="dashboard-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="glass-card" style={{ gridColumn: 'span 6', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '1.5rem', color: 'var(--text-secondary)', width: '100%', textAlign: 'start' }}>
            {t.chartSubjectDist}
          </h4>
          <div style={{ width: '100%', height: '200px', display: 'flex', justifyContent: 'center' }}>
            <Bar
              data={chartSpecialtyData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { stepSize: 1, color: 'var(--text-secondary)' } },
                  x: { ticks: { color: 'var(--text-secondary)' } }
                }
              }}
            />
          </div>
        </div>

        <div className="glass-card" style={{ gridColumn: 'span 6', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '1.5rem', color: 'var(--text-secondary)', width: '100%', textAlign: 'start' }}>
            {t.chartStatusDist}
          </h4>
          <div style={{ width: '100%', height: '200px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '200px', height: '200px' }}>
              <Doughnut
                data={chartStatusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { color: 'var(--text-secondary)', font: { size: 10 } } } }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Subscription Requests (Verifications) */}
      <div className="glass-card" style={{ width: '100%', padding: '1.5rem', marginBottom: '2.5rem', border: pendingPayments.length > 0 ? '1px solid var(--accent-purple)' : '1px solid var(--border-glass)' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
          <Clock size={20} color="var(--accent-purple)" />
          <span>{lang === 'ar' ? 'طلبات الترقية والاشتراكات المعلقة' : 'Pending Upgrade & Subscription Requests'}</span>
          {pendingPayments.length > 0 && (
            <span style={{ backgroundColor: 'var(--accent-purple)', color: '#fff', fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '12px', marginInlineStart: '0.5rem', fontWeight: 800 }}>
              {pendingPayments.length}
            </span>
          )}
        </h3>

        {pendingPayments.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            {lang === 'ar' ? 'لا توجد طلبات ترقية بانتظار المراجعة حالياً.' : 'No pending upgrade requests at the moment.'}
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'start' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-glass)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>{lang === 'ar' ? 'المعلم' : 'Instructor'}</th>
                  <th style={{ padding: '0.75rem 1rem' }}>{lang === 'ar' ? 'الباقة' : 'Plan'}</th>
                  <th style={{ padding: '0.75rem 1rem' }}>{lang === 'ar' ? 'المبلغ' : 'Amount'}</th>
                  <th style={{ padding: '0.75rem 1rem' }}>{lang === 'ar' ? 'تاريخ الطلب' : 'Date'}</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>{lang === 'ar' ? 'صورة التحويل' : 'Receipt Screenshot'}</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {pendingPayments.map((req) => (
                  <tr key={req.id} style={{ borderBottom: '1px solid var(--border-glass)', fontSize: '0.9rem', verticalAlign: 'middle' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{req.instructorName}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600,
                        backgroundColor: req.plan === 'yearly' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                        color: req.plan === 'yearly' ? 'var(--color-gold)' : 'var(--accent-primary)'
                      }}>
                        {req.plan === 'yearly' ? (lang === 'ar' ? 'سنوي (9 أشهر)' : 'Academic Year') : (lang === 'ar' ? 'شهري' : 'Monthly')}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--accent-green)' }}>{req.amount} {lang === 'ar' ? 'جنيه' : 'EGP'}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{req.date}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      {req.screenshot ? (
                        <div 
                          onClick={() => setViewingScreenshot(req.screenshot)}
                          style={{ display: 'inline-block', cursor: 'pointer', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-glass)', width: '60px', height: '40px', position: 'relative' }}
                        >
                          <img src={req.screenshot} alt="Receipt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 1 }} className="hover-overlay">
                            <Camera size={14} color="#fff" />
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button 
                          onClick={() => onApprovePayment(req.id, req.instructorId)} 
                          className="btn-primary" 
                          style={{ padding: '0.4rem 0.75rem', width: 'auto', fontSize: '0.8rem', backgroundColor: 'var(--accent-green)', borderColor: 'var(--accent-green)', color: '#fff', fontWeight: 700 }}
                        >
                          {lang === 'ar' ? 'موافقة وتفعيل' : 'Approve'}
                        </button>
                        <button 
                          onClick={() => onRejectPayment(req.id)} 
                          className="config-btn" 
                          style={{ padding: '0.4rem 0.75rem', width: 'auto', fontSize: '0.8rem', borderColor: 'var(--accent-red)', color: 'var(--accent-red)', fontWeight: 600 }}
                        >
                          {lang === 'ar' ? 'رفض' : 'Reject'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Screenshot Viewer Modal */}
      {viewingScreenshot && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999,
          padding: '1rem'
        }} onClick={() => setViewingScreenshot(null)}>
          <div className="glass-card" style={{ maxWidth: '600px', width: '100%', padding: '0.5rem', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setViewingScreenshot(null)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.9)', border: 'none', color: '#fff', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
            >
              <X size={18} />
            </button>
            <img src={viewingScreenshot} alt="Receipt Fullsize" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px', objectFit: 'contain' }} />
          </div>
        </div>
      )}

      {/* Teachers Directory & Controls */}
      <div className="glass-card" style={{ width: '100%', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          
          {/* Search bar */}
          <div style={{ position: 'relative', maxWidth: '380px', width: '100%' }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingInlineStart: '2.5rem', backgroundColor: 'rgba(0,0,0,0.1)' }}
            />
            <Search size={16} style={{ 
              position: 'absolute', top: '50%', transform: 'translateY(-50%)', 
              left: lang === 'ar' ? 'auto' : '1rem', right: lang === 'ar' ? '1rem' : 'auto', 
              color: 'var(--text-muted)' 
            }} />
          </div>

          {/* Add Teacher btn */}
          <button onClick={handleOpenAdd} className="btn-primary" style={{ width: 'auto', display: 'inline-flex', gap: '0.5rem', padding: '0.65rem 1.25rem' }}>
            <PlusCircle size={18} />
            <span>{t.addTeacherBtn}</span>
          </button>
        </div>

        {/* Directory Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'start' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-glass)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <th style={{ padding: '0.75rem 1rem' }}>{t.tblAvatar}</th>
                <th style={{ padding: '0.75rem 1rem' }}>{t.tblName}</th>
                <th style={{ padding: '0.75rem 1rem' }}>{t.tblSubject}</th>
                <th style={{ padding: '0.75rem 1rem' }}>{t.tblYear}</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>{t.tblVisibility}</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>{t.tblActions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredInstructors.length > 0 ? (
                filteredInstructors.map((teacher, idx) => (
                  <tr key={teacher.id} style={{ borderBottom: '1px solid var(--border-glass)', fontSize: '0.9rem', verticalAlign: 'middle' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <img 
                        src={teacher.avatar} 
                        alt={teacher.nameEn} 
                        style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-glass)' }} 
                      />
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                      {lang === 'ar' ? teacher.nameAr : teacher.nameEn}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--accent-primary)', fontWeight: 500 }}>
                      {lang === 'ar' ? teacher.subjectAr : teacher.subjectEn}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                      {lang === 'ar' ? teacher.yearAr : teacher.yearEn}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      {/* Subscription Visibility Toggle Switch */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                        <label className="switch-toggle">
                          <input 
                            type="checkbox" 
                            checked={!!teacher.isSubscribed}
                            onChange={() => {
                              onToggleSubscription(teacher.id);
                              triggerToast(t.toastToggleSuccess, 'success');
                            }}
                          />
                          <span className="slider-switch"></span>
                        </label>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 600,
                          color: teacher.isSubscribed ? 'var(--accent-green)' : 'var(--text-muted)'
                        }}>
                          {teacher.isSubscribed ? t.subscribedBadge : t.freeBadge}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => handleOpenEdit(teacher)} 
                          className="config-btn" 
                          style={{ padding: '0.4rem', borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}
                          title={t.modalEditTitle}
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(teacher.id)} 
                          className="config-btn" 
                          style={{ padding: '0.4rem', borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {t.noTeachersFound}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD MODALS */}
      
      {/* 1. Add Teacher Modal */}
      {showAddModal && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 5000, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '500px', padding: '2rem', animation: 'slide-in 0.3s ease-out', textAlign: 'start' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>{t.modalAddTitle}</h3>
            
            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label>{t.modalNameAr}</label>
                <input type="text" className="form-control" value={nameAr} onChange={e => setNameAr(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>{t.modalNameEn}</label>
                <input type="text" className="form-control" value={nameEn} onChange={e => setNameEn(e.target.value)} required />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>{t.modalSubjAr}</label>
                  <input type="text" className="form-control" value={subjectAr} onChange={e => setSubjectAr(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>{t.modalSubjEn}</label>
                  <input type="text" className="form-control" value={subjectEn} onChange={e => setSubjectEn(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>{t.modalYearAr}</label>
                  <input type="text" className="form-control" value={yearAr} onChange={e => setYearAr(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>{t.modalYearEn}</label>
                  <input type="text" className="form-control" value={yearEn} onChange={e => setYearEn(e.target.value)} required />
                </div>
              </div>

              {/* Avatar Selector */}
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Camera size={14} />
                  <span>{t.modalAvatar}</span>
                </label>
                <div className="avatar-option-picker">
                  {PRESET_AVATARS.map((url, idx) => (
                    <div key={idx} style={{ position: 'relative' }}>
                      <img 
                        src={url} 
                        alt="Avatar Option" 
                        onClick={() => setAvatar(url)}
                        className={`avatar-option-img ${avatar === url ? 'selected' : ''}`}
                      />
                      {avatar === url && (
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
                <div style={{ marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.modalCustomAvatar}</span>
                  <input 
                    type="url" 
                    className="form-control" 
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem', marginTop: '0.25rem' }}
                  />
                </div>
                <div style={{ marginTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.modalIntroVideo}</span>
                  <input 
                    type="url" 
                    className="form-control" 
                    placeholder="https://www.youtube.com/..." 
                    value={introVideo}
                    onChange={(e) => setIntroVideo(e.target.value)}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem', marginTop: '0.25rem' }}
                  />
                </div>
              </div>

              {/* Visible Checkbox */}
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                <input 
                  type="checkbox" 
                  id="add-is-subscribed" 
                  checked={isSubscribed} 
                  onChange={e => setIsSubscribed(e.target.checked)} 
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="add-is-subscribed" style={{ cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                  {t.modalSubscribed}
                </label>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="config-btn" style={{ flex: 1, justifyContent: 'center' }}>
                  {t.cancelBtn}
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  {t.saveBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit Teacher Modal */}
      {showEditModal && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 5000, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '500px', padding: '2rem', animation: 'slide-in 0.3s ease-out', textAlign: 'start' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>{t.modalEditTitle}</h3>
            
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>{t.modalNameAr}</label>
                <input type="text" className="form-control" value={nameAr} onChange={e => setNameAr(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>{t.modalNameEn}</label>
                <input type="text" className="form-control" value={nameEn} onChange={e => setNameEn(e.target.value)} required />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>{t.modalSubjAr}</label>
                  <input type="text" className="form-control" value={subjectAr} onChange={e => setSubjectAr(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>{t.modalSubjEn}</label>
                  <input type="text" className="form-control" value={subjectEn} onChange={e => setSubjectEn(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>{t.modalYearAr}</label>
                  <input type="text" className="form-control" value={yearAr} onChange={e => setYearAr(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>{t.modalYearEn}</label>
                  <input type="text" className="form-control" value={yearEn} onChange={e => setYearEn(e.target.value)} required />
                </div>
              </div>

              {/* Avatar Selector */}
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Camera size={14} />
                  <span>{t.modalAvatar}</span>
                </label>
                <div className="avatar-option-picker">
                  {PRESET_AVATARS.map((url, idx) => (
                    <div key={idx} style={{ position: 'relative' }}>
                      <img 
                        src={url} 
                        alt="Avatar Option" 
                        onClick={() => setAvatar(url)}
                        className={`avatar-option-img ${avatar === url ? 'selected' : ''}`}
                      />
                      {avatar === url && (
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
                <div style={{ marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.modalCustomAvatar}</span>
                  <input 
                    type="url" 
                    className="form-control" 
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem', marginTop: '0.25rem' }}
                  />
                </div>
                <div style={{ marginTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.modalIntroVideo}</span>
                  <input 
                    type="url" 
                    className="form-control" 
                    placeholder="https://www.youtube.com/..." 
                    value={introVideo}
                    onChange={(e) => setIntroVideo(e.target.value)}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem', marginTop: '0.25rem' }}
                  />
                </div>
              </div>

              {/* Visible Checkbox */}
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                <input 
                  type="checkbox" 
                  id="edit-is-subscribed" 
                  checked={isSubscribed} 
                  onChange={e => setIsSubscribed(e.target.checked)} 
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="edit-is-subscribed" style={{ cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                  {t.modalSubscribed}
                </label>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setShowEditModal(false)} className="config-btn" style={{ flex: 1, justifyContent: 'center' }}>
                  {t.cancelBtn}
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  {t.saveBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
