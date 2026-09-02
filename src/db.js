let supabaseInstance = null;
const getSupabase = async () => {
  if (!supabaseInstance) {
    const module = await import('./supabaseClient');
    supabaseInstance = module.supabase;
  }
  return supabaseInstance;
};
import { initialStudents, initialSessions, initialInstructors } from './mockData';

// Fallback localStorage keys
const KEYS = {
  students: 'edu_students',
  sessions: 'edu_sessions',
  instructors: 'edu_instructors',
  pendingPayments: 'edu_pending_payments'
};

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || 'https://luhaxtokriahwqruaymr.supabase.co';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ofzb67GhUvtuPpHXRrLT5w_o4t3laqY';
  return url && url !== 'https://your-supabase-project-url.supabase.co' && key && key !== 'your-supabase-public-anon-key';
};

// Helper to decode HTML entities to restore and repair any previously corrupted strings
export function decodeHtmlEntities(text) {
  if (typeof text !== 'string') return text;
  let decoded = text;
  // Decodes nested escapes up to 5 times
  for (let i = 0; i < 5; i++) {
    if (!decoded.includes('&')) break;
    decoded = decoded
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/')
      .replace(/&#39;/g, "'");
  }
  return decoded;
}

// XSS Sanitizer to neutralize HTML tags while preserving normal characters in URLs & base64 strings
export function sanitizeText(text) {
  if (typeof text !== 'string') return text;
  
  // First, decode any previously corrupted entities to clean them
  let cleaned = decodeHtmlEntities(text);
  
  // Strip HTML tags using regex
  cleaned = cleaned.replace(/<[^>]*>?/gm, '');
  
  // Strip dangerous javascript: protocol injection
  cleaned = cleaned.replace(/javascript:/gi, '');
  
  return cleaned;
}

export function sanitizeData(data) {
  if (data === null || data === undefined) return data;
  
  if (typeof data === 'string') {
    return sanitizeText(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }
  
  if (typeof data === 'object') {
    const cleanedObj = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        cleanedObj[key] = sanitizeData(data[key]);
      }
    }
    return cleanedObj;
  }
  
  return data;
}

// 1. Fetch Instructors
export async function getInstructors() {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem(KEYS.instructors);
    return saved ? JSON.parse(saved) : initialInstructors;
  }
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase.from('instructors').select('*');
    if (error) throw error;
    // Map DB schema to UI state
    const dbInstructors = data.map(db => ({
      id: db.id,
      email: db.email,
      nameAr: db.name_ar,
      nameEn: db.name_en,
      avatar: db.avatar,
      subjectAr: db.subject_ar,
      subjectEn: db.subject_en,
      yearAr: db.year_ar,
      yearEn: db.year_en,
      videoUrl: db.video_url,
      isSubscribed: db.is_subscribed,
      groups: db.groups || [
        { id: `group-custom-${db.id}`, nameAr: "المجموعة الافتراضية", nameEn: "Default Group", time: "08:00 PM" }
      ],
      grades: db.grades || [
        { id: `grade-sec-${db.id}`, nameAr: "ثانوي", nameEn: "High School", groups: db.groups || [{ id: `group-custom-${db.id}`, nameAr: "المجموعة الافتراضية", nameEn: "Default Group", time: "08:00 PM" }] }
      ],
      maxStudentsLimit: db.max_students_limit !== undefined ? db.max_students_limit : (db.groups?.[0]?.maxStudentsLimit ?? 999999),
      whatsapp: db.whatsapp || db.groups?.[0]?.whatsapp || '',
      aboutAr: db.about_ar || db.groups?.[0]?.aboutAr || '',
      aboutEn: db.about_en || db.groups?.[0]?.aboutEn || '',
      price: db.price || db.groups?.[0]?.price || '',
      paymentMethods: db.payment_methods || db.groups?.[0]?.paymentMethods || '',
      cashNumber: db.cash_number || db.groups?.[0]?.cashNumber || '',
      paymentType: db.payment_type || db.groups?.[0]?.paymentType || 'cash'
    }));

    return sanitizeData(dbInstructors);
  } catch (err) {
    console.warn("Supabase fetch error, falling back to localStorage:", err);
    const saved = localStorage.getItem(KEYS.instructors);
    return sanitizeData(saved ? JSON.parse(saved) : initialInstructors);
  }
}

// 2. Fetch Students
export async function getStudents() {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem(KEYS.students);
    return saved ? JSON.parse(saved) : initialStudents;
  }
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase.from('students').select('*');
    if (error) throw error;
    const dbStudents = data.map(db => ({
      id: db.id,
      email: db.email,
      nameAr: db.name_ar,
      nameEn: db.name_en,
      avatar: db.avatar,
      studentPhone: db.student_phone,
      parentPhone: db.parent_phone,
      enrollments: db.enrollments || [],
      grades: db.grades || [],
      attendance: db.attendance || [],
      password: db.enrollments?.[0]?.password || ''
    }));

    return sanitizeData(dbStudents);
  } catch (err) {
    console.warn("Supabase fetch error, falling back to localStorage:", err);
    const saved = localStorage.getItem(KEYS.students);
    return sanitizeData(saved ? JSON.parse(saved) : initialStudents);
  }
}

// 3. Fetch Sessions
export async function getSessions() {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem(KEYS.sessions);
    const savedSessions = saved ? JSON.parse(saved) : initialSessions;
    
    // Offline local storage mock user constraint check
    const localUserStr = localStorage.getItem('edu_current_user');
    if (localUserStr) {
      try {
        const localUser = JSON.parse(localUserStr);
        if (localUser.role === 'student') {
          const studentsList = JSON.parse(localStorage.getItem('edu_students') || '[]');
          const currentStudent = studentsList.find(s => s.id === localUser.id || s.email?.toLowerCase() === localUser.email?.toLowerCase());
          if (currentStudent) {
            const groupIds = (currentStudent.enrollments || []).map(e => e.groupId);
            return savedSessions.filter(s => groupIds.includes(s.groupId));
          }
          return []; // Unregistered student gets empty
        } else if (localUser.role === 'instructor') {
          return savedSessions.filter(s => s.instructorId === localUser.id);
        }
      } catch (e) {
        console.warn("Offline session parsing error:", e);
      }
    }
    return sanitizeData(savedSessions);
  }
  try {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    let allowedGroupIds = null;
    let allowedInstructorId = null;
    let isAdmin = false;

    if (user) {
      const email = user.email?.toLowerCase();
      const ADMIN_EMAILS = ['rishobeh@gmail.com', 'admin@ie-academy.com', 'admin@ie.com'];
      if (ADMIN_EMAILS.includes(email)) {
        isAdmin = true;
      } else {
        // Strict fetch student record matching this email to find their registered group enrollments
        const { data: studentData } = await supabase
          .from('students')
          .select('enrollments')
          .eq('email', email)
          .maybeSingle();

        if (studentData) {
          const enrollments = studentData.enrollments || [];
          allowedGroupIds = enrollments.map(e => e.groupId);
        } else {
          // If not student, check if it's an instructor
          const { data: instData } = await supabase
            .from('instructors')
            .select('id')
            .eq('email', email)
            .maybeSingle();
          if (instData) {
            allowedInstructorId = instData.id;
          }
        }
      }
    }

    const { data, error } = await supabase.from('sessions').select('*');
    if (error) throw error;

    let filteredData = data;
    if (user && !isAdmin) {
      if (allowedGroupIds !== null) {
        // Enforce strict student group membership constraint!
        filteredData = data.filter(db => allowedGroupIds.includes(db.group_id));
      } else if (allowedInstructorId !== null) {
        // Enforce instructor constraint (only see their own lessons)
        filteredData = data.filter(db => db.instructor_id === allowedInstructorId);
      } else {
        filteredData = [];
      }
    }

    return sanitizeData(filteredData.map(db => ({
      id: db.id,
      instructorId: db.instructor_id,
      groupId: db.group_id,
      titleAr: db.title_ar,
      titleEn: db.title_en,
      date: db.date,
      time: db.time,
      isActive: db.is_active
    })));
  } catch (err) {
    console.warn("Supabase fetch error, falling back to localStorage:", err);
    const saved = localStorage.getItem(KEYS.sessions);
    return sanitizeData(saved ? JSON.parse(saved) : initialSessions);
  }
}

// 4. Fetch Pending Payments
export async function getPendingPayments() {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem(KEYS.pendingPayments);
    return saved ? JSON.parse(saved) : [];
  }
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase.from('pending_payments').select('*');
    if (error) throw error;
    return data.map(db => ({
      id: db.id,
      instructorId: db.instructor_id,
      instructorName: db.instructor_name,
      plan: db.plan,
      amount: db.amount,
      screenshot: db.screenshot,
      date: db.date,
      status: db.status
    }));
  } catch (err) {
    console.warn("Supabase fetch error, falling back to localStorage:", err);
    const saved = localStorage.getItem(KEYS.pendingPayments);
    return saved ? JSON.parse(saved) : [];
  }
}

// 5. Save Instructor
export async function saveInstructor(inst) {
  if (!isSupabaseConfigured()) return;
  try {
    const supabase = await getSupabase();
    const cleanInst = sanitizeData(inst);
    // Safely embed limit and whatsapp and bio/pricing fields in groups JSON to preserve it across schema variations
    if (cleanInst.groups && cleanInst.groups.length > 0) {
      cleanInst.groups[0].maxStudentsLimit = cleanInst.maxStudentsLimit;
      cleanInst.groups[0].whatsapp = cleanInst.whatsapp;
      cleanInst.groups[0].aboutAr = cleanInst.aboutAr || cleanInst.about;
      cleanInst.groups[0].aboutEn = cleanInst.aboutEn || cleanInst.about;
      cleanInst.groups[0].price = cleanInst.price;
      cleanInst.groups[0].paymentMethods = cleanInst.paymentMethods;
      cleanInst.groups[0].cashNumber = cleanInst.cashNumber || '';
      cleanInst.groups[0].paymentType = cleanInst.paymentType || 'cash';
    }
    const cleanEmail = (cleanInst.email || '').trim().toLowerCase();
    const dbRecord = {
      id: cleanInst.id,
      email: cleanEmail,
      name_ar: cleanInst.nameAr,
      name_en: cleanInst.nameEn,
      avatar: cleanInst.avatar,
      subject_ar: cleanInst.subjectAr,
      subject_en: cleanInst.subjectEn,
      year_ar: cleanInst.yearAr,
      year_en: cleanInst.yearEn,
      video_url: cleanInst.videoUrl,
      is_subscribed: cleanInst.isSubscribed,
      groups: cleanInst.groups,
      grades: cleanInst.grades,
      max_students_limit: cleanInst.maxStudentsLimit,
      whatsapp: cleanInst.whatsapp,
      about_ar: cleanInst.aboutAr || cleanInst.about || '',
      about_en: cleanInst.aboutEn || cleanInst.about || '',
      price: cleanInst.price || '',
      payment_methods: cleanInst.paymentMethods || '',
      cash_number: cleanInst.cashNumber || '',
      payment_type: cleanInst.paymentType || 'cash'
    };
    
    let { error } = await supabase.from('instructors').upsert(dbRecord, { onConflict: 'id' });
    if (error) {
      console.warn("Upsert failed, retrying by stripping potential missing columns:", error.message);
      const fallbackRecord = { ...dbRecord };
      delete fallbackRecord.whatsapp;
      delete fallbackRecord.about_ar;
      delete fallbackRecord.about_en;
      delete fallbackRecord.price;
      delete fallbackRecord.payment_methods;
      delete fallbackRecord.cash_number;
      delete fallbackRecord.payment_type;
      
      const { error: retryError } = await supabase.from('instructors').upsert(fallbackRecord, { onConflict: 'id' });
      if (retryError) throw retryError;
    }
  } catch (err) {
    console.error("Supabase upsert error:", err);
  }
}

// 6. Save Student
export async function saveStudent(student) {
  if (!isSupabaseConfigured()) return;
  try {
    const supabase = await getSupabase();
    const cleanStudent = sanitizeData(student);
    const dbRecord = {
      id: cleanStudent.id,
      email: cleanStudent.email,
      name_ar: cleanStudent.nameAr,
      name_en: cleanStudent.nameEn,
      avatar: cleanStudent.avatar,
      student_phone: cleanStudent.studentPhone,
      parent_phone: cleanStudent.parentPhone,
      enrollments: cleanStudent.enrollments,
      grades: cleanStudent.grades,
      attendance: cleanStudent.attendance
    };
    await supabase.from('students').upsert(dbRecord);
  } catch (err) {
    console.error("Supabase upsert error:", err);
  }
}

// 7. Save Session
export async function saveSession(session) {
  if (!isSupabaseConfigured()) return;
  try {
    const supabase = await getSupabase();
    const cleanSession = sanitizeData(session);
    const dbRecord = {
      id: cleanSession.id,
      instructor_id: cleanSession.instructorId,
      group_id: cleanSession.groupId,
      title_ar: cleanSession.titleAr,
      title_en: cleanSession.titleEn,
      date: cleanSession.date,
      time: cleanSession.time,
      is_active: cleanSession.isActive
    };
    await supabase.from('sessions').upsert(dbRecord);
  } catch (err) {
    console.error("Supabase upsert error:", err);
  }
}

// 8. Add Pending Payment Request
export async function addPendingPayment(req) {
  if (!isSupabaseConfigured()) return;
  try {
    const supabase = await getSupabase();
    const cleanReq = sanitizeData(req);
    const dbRecord = {
      id: cleanReq.id,
      instructor_id: cleanReq.instructorId,
      instructor_name: cleanReq.instructorName,
      plan: cleanReq.plan,
      amount: cleanReq.amount,
      screenshot: cleanReq.screenshot,
      date: cleanReq.date,
      status: cleanReq.status
    };
    await supabase.from('pending_payments').insert(dbRecord);
  } catch (err) {
    console.error("Supabase insert error:", err);
  }
}

// 9. Delete Pending Payment
export async function deletePendingPayment(id) {
  if (!isSupabaseConfigured()) return;
  try {
    const supabase = await getSupabase();
    await supabase.from('pending_payments').delete().eq('id', id);
  } catch (err) {
    console.error("Supabase delete error:", err);
  }
}

// 10. Delete Instructor
export async function deleteInstructor(id) {
  if (!isSupabaseConfigured()) return;
  try {
    const supabase = await getSupabase();
    await supabase.from('instructors').delete().eq('id', id);
  } catch (err) {
    console.error("Supabase delete instructor error:", err);
  }
}
