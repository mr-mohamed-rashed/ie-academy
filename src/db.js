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
    return dbInstructors;
  } catch (err) {
    console.warn("Supabase fetch error, falling back to localStorage:", err);
    const saved = localStorage.getItem(KEYS.instructors);
    return saved ? JSON.parse(saved) : initialInstructors;
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
    return dbStudents;
  } catch (err) {
    console.warn("Supabase fetch error, falling back to localStorage:", err);
    const saved = localStorage.getItem(KEYS.students);
    return saved ? JSON.parse(saved) : initialStudents;
  }
}

// 3. Fetch Sessions
export async function getSessions() {
  if (!isSupabaseConfigured()) {
    const saved = localStorage.getItem(KEYS.sessions);
    return saved ? JSON.parse(saved) : initialSessions;
  }
  try {
    const { data, error } = await supabase.from('sessions').select('*');
    if (error) throw error;
    return data.map(db => ({
      id: db.id,
      instructorId: db.instructor_id,
      groupId: db.group_id,
      titleAr: db.title_ar,
      titleEn: db.title_en,
      date: db.date,
      time: db.time,
      isActive: db.is_active
    }));
  } catch (err) {
    console.warn("Supabase fetch error, falling back to localStorage:", err);
    const saved = localStorage.getItem(KEYS.sessions);
    return saved ? JSON.parse(saved) : initialSessions;
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
    // Safely embed limit in groups JSON to preserve it across schema variations
    if (inst.groups && inst.groups.length > 0) {
      inst.groups[0].maxStudentsLimit = inst.maxStudentsLimit;
    }
    const dbRecord = {
      id: inst.id,
      email: inst.email,
      name_ar: inst.nameAr,
      name_en: inst.nameEn,
      avatar: inst.avatar,
      subject_ar: inst.subjectAr,
      subject_en: inst.subjectEn,
      year_ar: inst.yearAr,
      year_en: inst.yearEn,
      video_url: inst.videoUrl,
      is_subscribed: inst.isSubscribed,
      groups: inst.groups,
      grades: inst.grades,
      max_students_limit: inst.maxStudentsLimit
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
    const dbRecord = {
      id: student.id,
      email: student.email,
      name_ar: student.nameAr,
      name_en: student.nameEn,
      avatar: student.avatar,
      student_phone: student.studentPhone,
      parent_phone: student.parentPhone,
      enrollments: student.enrollments,
      grades: student.grades,
      attendance: student.attendance
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
    const dbRecord = {
      id: session.id,
      instructor_id: session.instructorId,
      group_id: session.groupId,
      title_ar: session.titleAr,
      title_en: session.titleEn,
      date: session.date,
      time: session.time,
      is_active: session.isActive
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
    const dbRecord = {
      id: req.id,
      instructor_id: req.instructorId,
      instructor_name: req.instructorName,
      plan: req.plan,
      amount: req.amount,
      screenshot: req.screenshot,
      date: req.date,
      status: req.status
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
