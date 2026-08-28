import React, { useState } from 'react';
import { Search, Phone, Play, AlertTriangle, Eye, ArrowRight, UserCheck, MessageSquare, Clock, Info, CheckCircle, Flame } from 'lucide-react';

const formatWhatsappNumber = (phone) => {
  if (!phone) return '';
  let cleaned = phone.toString().replace(/\D/g, '');
  if (cleaned.startsWith('00')) cleaned = cleaned.substring(2);
  if (cleaned.startsWith('01') && cleaned.length === 11) cleaned = '2' + cleaned;
  if (cleaned.startsWith('1') && cleaned.length === 10) cleaned = '20' + cleaned;
  return cleaned;
};

const SupportDashboard = ({ students = [], lang, onLogout, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(students[0] || null);
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  // Generate some realistic detailed mock video logs if they don't exist
  const getMockVideoLogs = (studentId) => {
    // Return custom logs for specific mock students
    return [
      {
        sessionId: 1001,
        titleAr: "حصة الفيزياء: قوانين الحركة الدائرية",
        titleEn: "Physics: Circular Motion Laws",
        watchedPercent: 68,
        totalDuration: "45:00",
        spentTime: "30:45",
        skipsCount: 3,
        playbackSpeed: "1.5x",
        timeline: [
          { start: 0, end: 12, status: 'watched' },
          { start: 12, end: 20, status: 'skipped' },
          { start: 20, end: 35, status: 'watched' },
          { start: 35, end: 40, status: 'skipped' },
          { start: 40, end: 45, status: 'watched' }
        ],
        logs: [
          { time: "10:15:02 AM", type: "play", descAr: "بدأ تشغيل الفيديو بجودة 720p", descEn: "Started video playback at 720p" },
          { time: "10:20:15 AM", type: "speed", descAr: "قام بتغيير سرعة التشغيل إلى 1.5x", descEn: "Changed playback speed to 1.5x" },
          { time: "10:27:04 AM", type: "skip", descAr: "تخطي 8 دقائق دفعة واحدة (من الدقيقة 12 إلى 20)", descEn: "Skipped 8 minutes at once (from 12:00 to 20:00)" },
          { time: "10:35:40 AM", type: "quiz", descAr: "توقف لحل الكويز السريع (أجاب بشكل صحيح من أول محاولة)", descEn: "Paused to solve mini quiz (answered correctly on first try)" },
          { time: "10:42:12 AM", type: "skip", descAr: "تخطي 5 دقائق (من الدقيقة 35 إلى 40)", descEn: "Skipped 5 minutes (from 35:00 to 40:00)" },
          { time: "10:50:30 AM", type: "pause", descAr: "أغلق نافذة الدرس (نسبة الاكتمال الإجمالية 68%)", descEn: "Closed lesson player (total watched completion 68%)" }
        ]
      },
      {
        sessionId: 1002,
        titleAr: "مراجعة قوانين نيوتن وتطبيقات الجاذبية",
        titleEn: "Newton's Laws & Gravity Review",
        watchedPercent: 95,
        totalDuration: "35:00",
        spentTime: "34:10",
        skipsCount: 0,
        playbackSpeed: "1.0x (طبيعي)",
        timeline: [
          { start: 0, end: 35, status: 'watched' }
        ],
        logs: [
          { time: "02:10:00 PM", type: "play", descAr: "بدأ تشغيل الفيديو بجودة 1080p (سرعة طبيعية)", descEn: "Started video playback at 1080p (normal speed)" },
          { time: "02:22:15 PM", type: "note", descAr: "شاهد بتركيز مستمر دون أي تقديم أو تسريع", descEn: "Watched attentively with zero forwarding or speedup" },
          { time: "02:35:40 PM", type: "quiz", descAr: "توقف لحل الكويز السريع (أجاب إجابة خاطئة ثم أعاد مشاهدة الجزء واجتازه)", descEn: "Failed quiz once, re-watched segment, and passed" },
          { time: "02:45:10 PM", type: "complete", descAr: "أتم مشاهدة الحصة بالكامل بنسبة 100%", descEn: "Completed watching the lesson 100%" }
        ]
      }
    ];
  };

  const filteredStudents = students.filter(s => {
    const name = s.nameAr || s.nameEn || '';
    const phone = s.studentPhone || s.phone || '';
    const parentPhone = s.parentPhone || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           phone.includes(searchTerm) ||
           parentPhone.includes(searchTerm);
  });

  const activeLogs = selectedStudent ? getMockVideoLogs(selectedStudent.id) : [];
  const selectedLog = activeLogs.find(l => l.sessionId === (selectedSessionId || activeLogs[0]?.sessionId)) || activeLogs[0];

  return (
    <div className="support-dashboard-container" style={{
      display: 'grid',
      gridTemplateColumns: '320px 1fr',
      gap: '1.5rem',
      width: '100%',
      minHeight: '82vh',
      direction: lang === 'ar' ? 'rtl' : 'ltr',
      color: 'var(--text-primary)'
    }}>
      
      {/* Left Sidebar: Students List */}
      <div className="glass-card" style={{
        padding: '1.25rem',
        borderRadius: '20px',
        border: '1px solid var(--border-glass)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        height: '100%'
      }}>
        <div style={{ textAlign: 'start' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
            {lang === 'ar' ? 'أرقام الطلاب والمتابعة' : 'Student Registry & Logs'}
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
            {lang === 'ar' ? 'مراقبة سلوك المشاهدة وتفاصيل الهواتف' : 'Monitor video behavior & numbers'}
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: lang === 'ar' ? '0.75rem' : 'auto', left: lang === 'ar' ? 'auto' : '0.75rem', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            className="form-control"
            placeholder={lang === 'ar' ? 'ابحث باسم الطالب أو الهاتف...' : 'Search by name or phone...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              paddingRight: lang === 'ar' ? '2.25rem' : '0.75rem',
              paddingLeft: lang === 'ar' ? '0.75rem' : '2.25rem',
              fontSize: '0.8rem'
            }}
          />
        </div>

        {/* Students List Scrollbox */}
        <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '55vh', paddingRight: '0.25rem' }}>
          {filteredStudents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              {lang === 'ar' ? 'لا يوجد نتائج مطابقة' : 'No matching students found'}
            </div>
          ) : (
            filteredStudents.map(s => {
              const isSelected = selectedStudent?.id === s.id;
              return (
                <div 
                  key={s.id}
                  onClick={() => {
                    setSelectedStudent(s);
                    setSelectedSessionId(null); // Reset session selection on student switch
                  }}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '12px',
                    border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-glass)',
                    background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'start'
                  }}
                >
                  <strong style={{ display: 'block', fontSize: '0.85rem', color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                    {lang === 'ar' ? (s.nameAr || s.nameEn) : (s.nameEn || s.nameAr)}
                  </strong>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <Phone size={10} />
                    <span>{s.studentPhone || s.phone || 'N/A'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Content: Student Monitoring Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
        {selectedStudent ? (
          <>
            {/* Student Header Card */}
            <div className="glass-card" style={{
              padding: '1.5rem',
              borderRadius: '20px',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              textAlign: 'start'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img 
                  src={selectedStudent.avatar} 
                  alt="Avatar"
                  style={{ width: '55px', height: '55px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-purple)' }}
                />
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                    {lang === 'ar' ? (selectedStudent.nameAr || selectedStudent.nameEn) : (selectedStudent.nameEn || selectedStudent.nameAr)}
                  </h2>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span>{lang === 'ar' ? `هاتف الطالب: ${selectedStudent.studentPhone || selectedStudent.phone || 'N/A'}` : `Student: ${selectedStudent.studentPhone || selectedStudent.phone || 'N/A'}`}</span>
                    <span>•</span>
                    <span>{lang === 'ar' ? `هاتف ولي الأمر: ${selectedStudent.parentPhone || 'N/A'}` : `Parent Phone: ${selectedStudent.parentPhone || 'N/A'}`}</span>
                  </div>
                </div>
              </div>

              {/* Quick WhatsApp Actions */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <a 
                  href={selectedStudent.studentPhone || selectedStudent.phone ? `https://wa.me/${formatWhatsappNumber(selectedStudent.studentPhone || selectedStudent.phone)}` : '#'} 
                  target="_blank" 
                  rel="noreferrer"
                  className="config-btn"
                  style={{ borderColor: '#25D366', color: '#25D366', fontSize: '0.8rem', padding: '0.5rem 0.85rem' }}
                >
                  <MessageSquare size={14} />
                  <span>{lang === 'ar' ? 'واتساب الطالب' : 'WhatsApp Student'}</span>
                </a>
                <a 
                  href={selectedStudent.parentPhone ? `https://wa.me/${formatWhatsappNumber(selectedStudent.parentPhone)}` : '#'} 
                  target="_blank" 
                  rel="noreferrer"
                  className="config-btn"
                  style={{ borderColor: '#128C7E', color: '#128C7E', fontSize: '0.8rem', padding: '0.5rem 0.85rem' }}
                >
                  <MessageSquare size={14} />
                  <span>{lang === 'ar' ? 'واتساب ولي الأمر' : 'WhatsApp Parent'}</span>
                </a>
              </div>
            </div>

            {/* Video Logs & Timeline Section */}
            <div className="glass-card" style={{
              padding: '1.5rem',
              borderRadius: '20px',
              border: '1px solid var(--border-glass)',
              flexGrow: 1,
              display: 'grid',
              gridTemplateColumns: '260px 1fr',
              gap: '1.5rem',
              textAlign: 'start'
            }}>
              
              {/* Sessions List */}
              <div style={{ borderEnd: '1px solid var(--border-glass)', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-secondary)', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-glass)' }}>
                  {lang === 'ar' ? 'الدروس المشاهدة:' : 'Watched Lessons:'}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', maxHeight: '42vh' }}>
                  {activeLogs.map(log => {
                    const isSelected = selectedLog?.sessionId === log.sessionId;
                    return (
                      <div
                        key={log.sessionId}
                        onClick={() => setSelectedSessionId(log.sessionId)}
                        style={{
                          padding: '0.75rem',
                          borderRadius: '10px',
                          border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-glass)',
                          backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                          cursor: 'pointer',
                          textAlign: 'start'
                        }}
                      >
                        <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {lang === 'ar' ? log.titleAr : log.titleEn}
                        </span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem' }}>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                            {log.watchedPercent}% {lang === 'ar' ? 'اكتمال' : 'completion'}
                          </span>
                          {log.skipsCount > 0 && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', fontSize: '0.6rem', color: 'var(--accent-red)', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 'bold' }}>
                              <AlertTriangle size={8} />
                              {lang === 'ar' ? 'تخطي' : 'Skips'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Activity & Video Behavior Log */}
              {selectedLog ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* Title & Stats */}
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                      {lang === 'ar' ? selectedLog.titleAr : selectedLog.titleEn}
                    </h3>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} />
                        {lang === 'ar' ? `المدة: ${selectedLog.totalDuration} دقيقة` : `Duration: ${selectedLog.totalDuration}`}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Eye size={12} />
                        {lang === 'ar' ? `المشاهدة الفعلية: ${selectedLog.spentTime}` : `Actual Watch: ${selectedLog.spentTime}`}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Flame size={12} />
                        {lang === 'ar' ? `السرعة: ${selectedLog.playbackSpeed}` : `Speed: ${selectedLog.playbackSpeed}`}
                      </span>
                    </div>
                  </div>

                  {/* VISUAL MONITORING TIMELINE */}
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      {lang === 'ar' ? 'مخطط التتبع الزمني (مشاهدة / تخطي):' : 'Visual Progress Timeline (Watched vs Skipped):'}
                    </span>
                    <div style={{
                      display: 'flex',
                      height: '24px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border-glass)'
                    }}>
                      {selectedLog.timeline.map((segment, index) => {
                        const widthPct = ((segment.end - segment.start) / 45) * 100;
                        const isWatched = segment.status === 'watched';
                        return (
                          <div 
                            key={index}
                            title={lang === 'ar' 
                              ? `${isWatched ? 'مقطع تمت مشاهدته' : 'جزء تم تخطيه'} (الدقيقة ${segment.start} إلى ${segment.end})`
                              : `${isWatched ? 'Watched' : 'Skipped'} (Min ${segment.start} to ${segment.end})`
                            }
                            style={{
                              width: `${widthPct}%`,
                              height: '100%',
                              backgroundColor: isWatched ? '#10B981' : '#EF4444',
                              opacity: isWatched ? 0.85 : 0.9,
                              borderInlineEnd: index < selectedLog.timeline.length - 1 ? '1px solid rgba(255,255,255,0.2)' : 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.6rem',
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          >
                            {segment.end - segment.start > 4 && `${segment.start}-${segment.end}m`}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', fontSize: '0.65rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#10B981' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
                        {lang === 'ar' ? 'تمت مشاهدته بتركيز' : 'Watched segment'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#EF4444' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444' }}></span>
                        {lang === 'ar' ? 'تم تخطيه وتجاوزه' : 'Skipped / Forwarded'}
                      </span>
                    </div>
                  </div>

                  {/* LIVE BEHAVIOR LOG TERMINAL */}
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      {lang === 'ar' ? 'سجل أحداث المشاهدة التفصيلي:' : 'Live Playback Event Logs:'}
                    </span>
                    <div style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.25)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '12px',
                      padding: '1rem',
                      maxHeight: '180px',
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      fontFamily: 'monospace'
                    }}>
                      {selectedLog.logs.map((log, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.7rem', color: log.type === 'skip' ? '#F59E0B' : (log.type === 'complete' ? '#10B981' : 'var(--text-muted)') }}>
                          <span style={{ fontWeight: 'bold' }}>[{log.time}]</span>
                          <span>{lang === 'ar' ? log.descAr : log.descEn}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {lang === 'ar' ? 'لا يوجد سجلات مشاهدة لهذا الطالب' : 'No watch logs available'}
                </div>
              )}

            </div>
          </>
        ) : (
          <div className="glass-card" style={{ padding: '3rem', borderRadius: '20px', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            {lang === 'ar' ? 'الرجاء اختيار طالب من القائمة الجانبية لمراقبة أرقامه وتتبع فيديوهاته' : 'Select a student from the sidebar to monitor behavior'}
          </div>
        )}
      </div>

    </div>
  );
};

export default SupportDashboard;
