import React, { useState } from 'react';
import { 
  GraduationCap, BookOpen, Star, AlertCircle, Link, Activity, 
  TrendingUp, FileText, Award, User, Info, CheckCircle, QrCode 
} from 'lucide-react';

export default function VisitorBelowTheFold({
  lang,
  subscribedTeachers,
  showAdminPanel,
  setLoginModalRole,
  setShowLoginModal,
  setLandingPodiumTeacherId,
  setShowPodiumModal,
  setSelectedTeacherProfile,
  setSelectedTeacherDetails
}) {
  const [visitorTab, setVisitorTab] = useState('guide');
  const [searchQuery, setSearchQuery] = useState('');
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  return (
    <>
      {/* Top 10 VIP Instructors Infinite Loop Row */}
      {subscribedTeachers.length > 0 && (
        <div className="marquee-container">
          <div className="marquee-track">
            {(() => {
              const repeatedList = [];
              while (repeatedList.length < 32) {
                repeatedList.push(...subscribedTeachers);
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

        {/* Interactive Platform Interface Showcase: Instructor Experience vs Student Experience */}
        <div className="centers-gallery-section" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', marginTop: '5rem', borderTop: '1px solid var(--border-glass)', paddingTop: '4rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <span className="hero-badge" style={{ marginBottom: '0.75rem' }}>
              {lang === 'ar' ? 'تصميم مبتكر وسرعة فائقة' : 'Next-Gen Interface & 0-Lag Design'}
            </span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {lang === 'ar' ? 'واجهات ذكية مخصصة لكل من المعلم والطالب' : 'Dedicated Intelligent Interfaces for Instructors & Students'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem', maxWidth: '720px', margin: '0.25rem auto 0 auto' }}>
              {lang === 'ar' 
                ? 'استمتع بتجربة تفاعلية سلسة مصممة بأحدث تقنيات الويب دون انتظار أو تحميل صور ثقيلة، مجهزة بكامل أدوات الأتمتة والمتابعة اللحظية.' 
                : 'Experience ultra-fast, zero-bloat reactive dashboards built with modern cloud tech for real-time tracking and automated grading.'}
            </p>
          </div>

          <div className="visitor-teachers-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            
            {/* 1. Instructor Interface Showcase Card */}
            <div className="glass-card" style={{ 
              padding: '2rem', 
              borderRadius: '24px', 
              border: '1px solid rgba(99, 102, 241, 0.35)', 
              background: 'linear-gradient(145deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.03) 100%)',
              boxShadow: '0 12px 36px rgba(99, 102, 241, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Top Accent Line */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />

              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)' }}>
                    <BookOpen size={22} />
                  </div>
                  <div style={{ textAlign: 'start' }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                      {lang === 'ar' ? 'واجهة المعلم الذكية' : 'Smart Instructor Portal'}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600 }}>
                      {lang === 'ar' ? 'تحكم كامل وأتمتة للفصول' : 'Full Control & Classroom Automation'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#a5b4fc', fontSize: '0.75rem', fontWeight: 700 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }}></span>
                  {lang === 'ar' ? 'جلسة بث مباشر نشطة' : 'Live Session Active'}
                </div>
              </div>

              {/* Interactive Mockup Preview Box */}
              <div style={{ 
                background: 'rgba(10, 4, 18, 0.55)', 
                borderRadius: '16px', 
                border: '1px solid rgba(167, 139, 250, 0.2)', 
                padding: '1.25rem', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1rem',
                backdropFilter: 'blur(8px)'
              }}>
                {/* Mini Stats Bar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.65rem 0.4rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#818cf8' }}>142</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{lang === 'ar' ? 'طالب مسجل' : 'Students'}</div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.65rem 0.4rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>98.5%</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{lang === 'ar' ? 'حضور بالـ QR' : 'QR Attend.'}</div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.65rem 0.4rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b' }}>34</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{lang === 'ar' ? 'كويز مصحح' : 'AI Quizzes'}</div>
                  </div>
                </div>

                {/* Simulated Live QR Code Card */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: '12px', background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.08))', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <QrCode size={20} />
                    </div>
                    <div style={{ textAlign: 'start' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {lang === 'ar' ? 'كود تسجيل حضور القاعة' : 'Live Attendance QR'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#c4b5fd' }}>
                        {lang === 'ar' ? 'رمز فوري يتجدد تلقائياً لمنع التلاعب' : 'Self-regenerating secure live token'}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a5b4fc', padding: '0.2rem 0.5rem', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(165, 180, 252, 0.3)' }}>
                    LIVE #882
                  </span>
                </div>
              </div>

              {/* Bullet Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', textAlign: 'start', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="#6366f1" />
                  <span>{lang === 'ar' ? 'إدارة المجموعات ومتابعة الاشتراكات المستحقة' : 'Manage study groups and collect subscription fees'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="#6366f1" />
                  <span>{lang === 'ar' ? 'إرسال تقارير أوتوماتيكية للواتساب لأولياء الأمور' : 'Automated WhatsApp performance dispatches to parents'}</span>
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={() => {
                  setLoginModalRole('instructor');
                  setShowLoginModal(true);
                }}
                className="btn-primary" 
                style={{ 
                  marginTop: 'auto', 
                  padding: '0.85rem', 
                  borderRadius: '12px', 
                  fontWeight: 800, 
                  fontSize: '0.95rem',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.35)'
                }}
              >
                {lang === 'ar' ? '🚀 دخول وتجربة واجهة المعلم' : '🚀 Try Instructor Portal'}
              </button>
            </div>

            {/* 2. Student & Parent Interface Showcase Card */}
            <div className="glass-card" style={{ 
              padding: '2rem', 
              borderRadius: '24px', 
              border: '1px solid rgba(16, 185, 129, 0.35)', 
              background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.08) 0%, rgba(20, 184, 166, 0.03) 100%)',
              boxShadow: '0 12px 36px rgba(16, 185, 129, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Top Accent Line */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #10b981, #06b6d4)' }} />

              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)' }}>
                    <GraduationCap size={22} />
                  </div>
                  <div style={{ textAlign: 'start' }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                      {lang === 'ar' ? 'واجهة الطالب وولي الأمر' : 'Student & Parent Portal'}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: '#6ee7b7', fontWeight: 600 }}>
                      {lang === 'ar' ? 'متابعة تفاعلية وجوائز تفوق' : 'Gamified Learning & Instant Feedback'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#a7f3d0', fontSize: '0.75rem', fontWeight: 700 }}>
                  <Award size={14} color="#10b981" />
                  {lang === 'ar' ? 'لوحة الشرف: المركز الأول 🥇' : 'Podium Rank: 1st Place 🥇'}
                </div>
              </div>

              {/* Interactive Mockup Preview Box */}
              <div style={{ 
                background: 'rgba(10, 4, 18, 0.55)', 
                borderRadius: '16px', 
                border: '1px solid rgba(52, 211, 153, 0.2)', 
                padding: '1.25rem', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1rem',
                backdropFilter: 'blur(8px)'
              }}>
                {/* Mini Stats Bar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.65rem 0.4rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399' }}>99/100</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{lang === 'ar' ? 'درجة الكويز' : 'Quiz GPA'}</div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.65rem 0.4rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fbbf24' }}>1,850</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{lang === 'ar' ? 'نقاط تميز' : 'Earned XP'}</div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.65rem 0.4rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8' }}>100%</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{lang === 'ar' ? 'نسبة الالتزام' : 'Attendance'}</div>
                  </div>
                </div>

                {/* Simulated Student Progress Strip */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: '12px', background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.08))', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Activity size={20} />
                    </div>
                    <div style={{ textAlign: 'start' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {lang === 'ar' ? 'كاميرا مسح الـ QR لحصد النقاط' : 'Scan Live QR & Earn Points'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#a7f3d0' }}>
                        {lang === 'ar' ? 'تسجيل فوري مع إشعار تلقائي لولي الأمر' : 'Instant check-in & parent WhatsApp alert'}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6ee7b7', padding: '0.2rem 0.5rem', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(110, 231, 183, 0.3)' }}>
                    +50 XP
                  </span>
                </div>
              </div>

              {/* Bullet Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', textAlign: 'start', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="#10b981" />
                  <span>{lang === 'ar' ? 'مكتبة شروحات مسجلة ومذكرات جاهزة للتحميل' : 'On-demand recorded sessions and downloadable notes'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="#10b981" />
                  <span>{lang === 'ar' ? 'منصة منافسة شريفة ومراكز الترتيب على المجموعة' : 'Friendly podium leaderboards and rankings'}</span>
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={() => {
                  setLoginModalRole('student');
                  setShowLoginModal(true);
                }}
                className="btn-primary" 
                style={{ 
                  marginTop: 'auto', 
                  padding: '0.85rem', 
                  borderRadius: '12px', 
                  fontWeight: 800, 
                  fontSize: '0.95rem',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)'
                }}
              >
                {lang === 'ar' ? '🎓 دخول وتجربة واجهة الطالب' : '🎓 Try Student Portal'}
              </button>
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
            style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, padding: 0 }}
          >
            {lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
          </button>
          <button 
            onClick={() => setTermsOpen(true)}
            style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, padding: 0 }}
          >
            {lang === 'ar' ? 'شروط الاستخدام' : 'Terms of Use'}
          </button>
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
    </>
  );
}

