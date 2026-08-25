import { supabase } from './supabaseClient';
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
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return url && url !== 'https://your-supabase-project-url.supabase.co' && key && key !== 'your-supabase-public-anon-key';
};

// XSS Sanitizer to neutralize HTML tags and escape special characters
export function sanitizeText(text) {
  if (typeof text !== 'string') return text;
  // Strip HTML tags using regex
  let cleaned = text.replace(/<[^>]*>?/gm, '');
  // Escape potential dangerous characters for absolute XSS security
  cleaned = cleaned
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
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
      maxStudentsLimit: db.max_students_limit !== undefined ? db.max_students_limit : (db.groups?.[0]?.maxStudentsLimit ?? 999999)
    }));

    // Merge with local storage to prevent data loss if Supabase upsert was blocked
    const localSaved = localStorage.getItem(KEYS.instructors);
    if (localSaved) {
      const localParsed = JSON.parse(localSaved);
      localParsed.forEach(localItem => {
        if (!dbInstructors.some(dbItem => dbItem.email?.toLowerCase() === localItem.email?.toLowerCase())) {
          dbInstructors.push(localItem);
        }
      });
    }
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
      attendance: db.attendance || []
    }));

    // Merge with local storage to prevent data loss if Supabase upsert was blocked
    const localSaved = localStorage.getItem(KEYS.students);
    if (localSaved) {
      const localParsed = JSON.parse(localSaved);
      localParsed.forEach(localItem => {
        if (!dbStudents.some(dbItem => dbItem.email?.toLowerCase() === localItem.email?.toLowerCase())) {
          dbStudents.push(localItem);
        }
      });
    }
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
    const cleanInst = sanitizeData(inst);
    // Safely embed limit in groups JSON to preserve it across schema variations
    if (cleanInst.groups && cleanInst.groups.length > 0) {
      cleanInst.groups[0].maxStudentsLimit = cleanInst.maxStudentsLimit;
    }
    const dbRecord = {
      id: cleanInst.id,
      email: cleanInst.email,
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
      max_students_limit: cleanInst.maxStudentsLimit
    };
    await supabase.from('instructors').upsert(dbRecord);
  } catch (err) {
    console.error("Supabase upsert error:", err);
  }
}

// 6. Save Student
export async function saveStudent(student) {
  if (!isSupabaseConfigured()) return;
  try {
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
    await supabase.from('pending_payments').delete().eq('id', id);
  } catch (err) {
    console.error("Supabase delete error:", err);
  }
}
