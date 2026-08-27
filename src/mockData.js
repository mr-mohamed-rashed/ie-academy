// Updated mock database for a comprehensive Virtual Teacher experience
export const initialInstructors = [];

export const initialStudents = [];

export const initialSessions = [];

// Helper to calculate score average (GPA) for a student under a specific instructor
export const calculateGPA = (grades, instructorId) => {
  const filteredGrades = instructorId 
    ? grades.filter(g => g.instructorId === instructorId)
    : grades;

  if (!filteredGrades || filteredGrades.length === 0) return 0;
  const total = filteredGrades.reduce((acc, curr) => acc + (curr.score / curr.max) * 100, 0);
  return parseFloat((total / filteredGrades.length).toFixed(1));
};

// Helper to calculate attendance rate under a specific instructor
export const calculateAttendanceRate = (attendance, instructorId) => {
  const filteredAttendance = instructorId
    ? attendance.filter(a => a.instructorId === instructorId)
    : attendance;

  if (!filteredAttendance || filteredAttendance.length === 0) return 0;
  const presents = filteredAttendance.filter((log) => log.status === "present").length;
  return Math.round((presents / filteredAttendance.length) * 100);
};

// Helper to rank students for a specific instructor and optionally a specific group
export const getSortedStudents = (students, instructorId, gradeId = null, groupId = null) => {
  // Filter students who are actually enrolled in this instructor's courses
  const enrolledStudents = students.filter(student => 
    student.enrollments.some(e => {
      let isMatch = e.instructorId === instructorId;
      if (gradeId) isMatch = isMatch && e.gradeId === gradeId;
      if (groupId) isMatch = isMatch && e.groupId === groupId;
      return isMatch;
    })
  );

  return enrolledStudents.map(student => ({
    ...student,
    gpa: calculateGPA(student.grades, instructorId),
    attendanceRate: calculateAttendanceRate(student.attendance, instructorId)
  })).sort((a, b) => b.gpa - a.gpa);
};

export const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=120"
];
