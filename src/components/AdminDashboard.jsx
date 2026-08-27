import React, { useState } from 'react';
import { Users, DollarSign, CheckCircle, AlertCircle, PlusCircle, Edit, Trash2, Search, Check, Camera, ShieldAlert, Clock, X as CloseIcon, Eye, Info, Phone, Mail } from 'lucide-react';
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
  onRejectPayment,
  supportAgents = [],
  onAddSupportAgent,
  onDeleteSupportAgent,
  onUpdateTeacherLimit
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingScreenshot, setViewingScreenshot] = useState(null);
  const [adminTab, setAdminTab] = useState('dashboard'); // 'dashboard' | 'support'
  const [viewingTeacherDetails, setViewingTeacherDetails] = useState(null);
  
  // Support agent form states
  const [supportName, setSupportName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [showAddSupportModal, setShowAddSupportModal] = useState(false);
  
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
      <div className="card-title-group" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={26} color="var(--accent-purple)" />
          <span>{t.adminTitle}</span>
        </h2>
        <p>{t.adminSubtitle}</p>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-glass)', marginBottom: '2rem', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setAdminTab('dashboard')}
          style={{
            padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none',
            backgroundColor: adminTab === 'dashboard' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            color: adminTab === 'dashboard' ? 'var(--accent-primary)' : 'var(--text-muted)',
            fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s'
          }}
        >
          {lang === 'ar' ? 'إدارة المدرسين والاشتراكات' : 'Instructors & Payments'}
        </button>
        <button 
          onClick={() => setAdminTab('support')}
          style={{
            padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none',
            backgroundColor: adminTab === 'support' ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
            color: adminTab === 'support' ? 'var(--accent-purple)' : 'var(--text-muted)',
            fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s'
          }}
        >
          {lang === 'ar' ? 'إدارة فريق الدعم الفني' : 'Technical Support Team'}
        </button>
      </div>

      {adminTab === 'dashboard' && (
        <>
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
          <div style={{ width: '100%', height: '220px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Doughnut
              data={chartSpecialtyData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: lang === 'ar' ? 'right' : 'left',
                    rtl: lang === 'ar',
                    labels: {
                      color: 'var(--text-primary)',
                      boxWidth: 12,
                      font: { size: 11, family: 'Cairo, sans-serif', fontWeight: 600 },
                      padding: 12,
                      generateLabels: (chart) => {
                        const data = chart.data;
                        if (data.labels.length && data.datasets.length) {
                          return data.labels.map((label, i) => {
                            const value = data.datasets[0].data[i];
                            const fill = data.datasets[0].backgroundColor[i % data.datasets[0].backgroundColor.length];
                            return {
                              text: `${label}: ${value} ${lang === 'ar' ? (value > 2 && value < 11 ? 'مدرسين' : 'مدرس') : 'Teacher(s)'}`,
                              fillStyle: fill,
                              strokeStyle: 'transparent',
                              lineWidth: 0,
                              index: i
                            };
                          });
                        }
                        return [];
                      }
                    }
                  }
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
              <CloseIcon size={18} />
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
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>{lang === 'ar' ? 'حد الطلاب' : 'Student Limit'}</th>
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
                      <input 
                        type="number" 
                        value={teacher.maxStudentsLimit !== undefined ? teacher.maxStudentsLimit : (teacher.groups?.[0]?.maxStudentsLimit ?? 999999)} 
                        onChange={(e) => onUpdateTeacherLimit(teacher.id, Number(e.target.value))}
                        style={{
                          width: '90px',
                          padding: '0.35rem 0.5rem',
                          borderRadius: '6px',
                          border: '1px solid var(--border-glass)',
                          backgroundColor: 'rgba(0,0,0,0.15)',
                          color: 'var(--text-primary)',
                          textAlign: 'center',
                          fontSize: '0.85rem',
                          fontWeight: 'bold'
                        }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => setViewingTeacherDetails(teacher)} 
                          className="config-btn" 
                          style={{ padding: '0.4rem', borderColor: 'var(--accent-purple)', color: 'var(--accent-purple)' }}
                          title={lang === 'ar' ? 'عرض التفاصيل والاتصال' : 'View Details & Contact'}
                        >
                          <Eye size={14} />
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
      



      {/* 3. View Teacher Details Modal */}
      {viewingTeacherDetails && (() => {
        const teacher = viewingTeacherDetails;
        const enrolledStudents = students.filter(s => s.enrollments?.some(e => e.instructorId === teacher.id));
        return (
          <div style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 7000, 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            direction: lang === 'ar' ? 'rtl' : 'ltr'
          }}>
            <div className="glass-card" style={{ width: '90%', maxWidth: '480px', padding: '2rem', animation: 'slide-in 0.3s ease-out', textAlign: 'start', position: 'relative' }}>
              <button 
                onClick={() => setViewingTeacherDetails(null)}
                style={{ position: 'absolute', top: '1rem', right: lang === 'ar' ? 'auto' : '1rem', left: lang === 'ar' ? '1rem' : 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <CloseIcon size={18} />
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                <img 
                  src={teacher.avatar} 
                  alt={teacher.nameAr} 
                  style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border-glass)' }}
                />
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{lang === 'ar' ? teacher.nameAr : teacher.nameEn}</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600 }}>{lang === 'ar' ? teacher.subjectAr : teacher.subjectEn}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Email info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}>
                  <Mail size={16} style={{ color: 'var(--text-secondary)' }} />
                  <div style={{ flexGrow: 1 }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>{lang === 'ar' ? 'البريد الإلكتروني للاتصال' : 'Contact Email'}</span>
                    <a href={`mailto:${teacher.email}`} style={{ fontSize: '0.85rem', color: 'var(--text-primary)', textDecoration: 'underline', fontWeight: 600 }}>{teacher.email || 'N/A'}</a>
                  </div>
                </div>

                {/* Stages */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}>
                  <Info size={16} style={{ color: 'var(--text-secondary)' }} />
                  <div style={{ flexGrow: 1 }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>{lang === 'ar' ? 'المراحل التعليمية' : 'Educational Stages'}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>{lang === 'ar' ? teacher.yearAr : teacher.yearEn}</span>
                  </div>
                </div>

                {/* Groups count */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}>
                  <Users size={16} style={{ color: 'var(--text-secondary)' }} />
                  <div style={{ flexGrow: 1 }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>{lang === 'ar' ? 'عدد المجموعات الدراسية' : 'Study Groups'}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>{teacher.groups?.length || 0} {lang === 'ar' ? 'مجموعات' : 'Group(s)'}</span>
                  </div>
                </div>

                {/* Students Count */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}>
                  <Users size={16} style={{ color: 'var(--text-secondary)' }} />
                  <div style={{ flexGrow: 1 }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>{lang === 'ar' ? 'الطلاب المشتركون حالياً' : 'Currently Enrolled Students'}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {enrolledStudents.length} / {teacher.maxStudentsLimit !== undefined ? teacher.maxStudentsLimit : (teacher.groups?.[0]?.maxStudentsLimit ?? 999999)} {lang === 'ar' ? 'طالب' : 'Student(s)'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '2rem' }}>
                <button 
                  onClick={() => setViewingTeacherDetails(null)} 
                  className="btn-primary" 
                  style={{ width: '100%' }}
                >
                  {lang === 'ar' ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      </>)}

      {/* 2. Support Team Tab */}
      {adminTab === 'support' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'start' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                  {lang === 'ar' ? 'فريق الدعم الفني وخدمة العملاء' : 'Customer Service & Support Team'}
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {lang === 'ar' ? 'أضف وكلاء الدعم الفني وانسخ لهم روابط المتابعة والولوج لمراقبة سلوك المشاهدة وأرقام الهواتف للطلاب.' : 'Add support agents and copy their invitation monitoring links.'}
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  setSupportName('');
                  setSupportEmail('');
                  setSupportPhone('');
                  setShowAddSupportModal(true);
                }}
                className="btn-primary" 
                style={{ width: 'auto', padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <PlusCircle size={16} />
                <span>{lang === 'ar' ? 'إضافة وكيل دعم جديد' : 'Add Support Agent'}</span>
              </button>
            </div>

            {/* General Support Login Link */}
            <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <div>
                <strong style={{ fontSize: '0.85rem', display: 'block', color: 'var(--accent-primary)' }}>
                  {lang === 'ar' ? 'الرابط العام لدعوة الدعم الفني (للتسجيل):' : 'General Support Invitation Link:'}
                </strong>
                <code style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {window.location.origin}/?invite=support
                </code>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/?invite=support`);
                  triggerToast(lang === 'ar' ? 'تم نسخ رابط الدعوة العام للدعم الفني!' : 'General support invite link copied!', 'success');
                }}
                className="config-btn"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}
              >
                {lang === 'ar' ? 'نسخ الرابط' : 'Copy Link'}
              </button>
            </div>

            {/* Support Agents Table */}
            {supportAgents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                {lang === 'ar' ? 'لا يوجد وكلاء دعم فني مسجلين حالياً. أضف وكيلاً للبدء.' : 'No support agents registered yet. Add one to start.'}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'start' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-glass)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>{lang === 'ar' ? 'الاسم' : 'Name'}</th>
                      <th style={{ padding: '0.75rem 1rem' }}>{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</th>
                      <th style={{ padding: '0.75rem 1rem' }}>{lang === 'ar' ? 'الهاتف' : 'Phone'}</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>{lang === 'ar' ? 'رابط دعوة التسجيل' : 'Registration Invite Link'}</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supportAgents.map((agent) => {
                      const inviteLink = `${window.location.origin}/?invite=support&email=${encodeURIComponent(agent.email)}`;
                      return (
                        <tr key={agent.id} style={{ borderBottom: '1px solid var(--border-glass)', fontSize: '0.9rem' }}>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{agent.name}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{agent.email}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{agent.phone || '-'}</td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(inviteLink);
                                triggerToast(lang === 'ar' ? 'تم نسخ رابط دعوة التسجيل للدعم الفني!' : 'Registration invite link copied!', 'success');
                              }}
                              className="config-btn"
                              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', borderColor: 'var(--accent-purple)', color: 'var(--accent-purple)' }}
                            >
                              {lang === 'ar' ? 'نسخ رابط الدعوة' : 'Copy Invite Link'}
                            </button>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف عضو الدعم الفني هذا؟' : 'Are you sure you want to delete this support agent?')) {
                                  onDeleteSupportAgent(agent.id);
                                  triggerToast(lang === 'ar' ? 'تم حذف العضو بنجاح' : 'Agent deleted successfully', 'success');
                                }
                              }}
                              className="config-btn"
                              style={{ borderColor: 'var(--accent-red)', color: 'var(--accent-red)', padding: '0.35rem 0.65rem' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Support Agent Modal Overlay */}
      {showAddSupportModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '400px', padding: '2rem', textAlign: 'start' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              {lang === 'ar' ? 'إضافة عضو دعم فني جديد' : 'Add New Support Member'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!supportName || !supportEmail) return;
              onAddSupportAgent({ name: supportName, email: supportEmail, phone: supportPhone });
              setShowAddSupportModal(false);
              triggerToast(lang === 'ar' ? 'تم إضافة عضو الدعم بنجاح!' : 'Support agent added successfully!', 'success');
            }}>
              <div className="form-group">
                <label>{lang === 'ar' ? 'اسم وكيل الدعم' : 'Agent Full Name'}</label>
                <input type="text" className="form-control" value={supportName} onChange={e => setSupportName(e.target.value)} required style={{ color: 'var(--text-primary)', backgroundColor: 'rgba(0,0,0,0.1)' }} />
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>{lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</label>
                <input type="email" className="form-control" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} required style={{ color: 'var(--text-primary)', backgroundColor: 'rgba(0,0,0,0.1)' }} />
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>{lang === 'ar' ? 'رقم الهاتف (واتساب)' : 'Phone (WhatsApp)'}</label>
                <input type="tel" className="form-control" value={supportPhone} onChange={e => setSupportPhone(e.target.value)} style={{ color: 'var(--text-primary)', backgroundColor: 'rgba(0,0,0,0.1)' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowAddSupportModal(false)} className="config-btn" style={{ flex: 1, justifyContent: 'center' }}>
                  {t.cancelBtn}
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  {lang === 'ar' ? 'إضافة وتوليد رابط' : 'Add & Create'}
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
