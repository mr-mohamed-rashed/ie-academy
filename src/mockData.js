// Updated mock database for a comprehensive Virtual Teacher experience
export const initialInstructors = [
  {
    id: 101,
    nameAr: "أ. محمود الجوهري (مدرس افتراضي)",
    nameEn: "Mr. Mahmoud El-Gohary (Virtual)",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120",
    subjectAr: "الفيزياء الذكية",
    subjectEn: "Smart Physics",
    yearAr: "المرحلة الثانوية",
    yearEn: "High School Phase",
    aboutAr: "مدرس فيزياء ذكية متخصص للمرحلة الثانوية، خبرة 10 سنوات في تبسيط المناهج.",
    aboutEn: "Smart Physics teacher specializing in High School, 10 years experience in simplifying curricula.",
    price: "250 ج.م / شهرياً",
    paymentMethods: "فودافون كاش، إنستا باي",
    whatsapp: "+201000000000",
    introVideo: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    isSubscribed: true,
    grades: [
      {
        id: "grade-sec-1",
        nameAr: "الصف الأول الثانوي",
        nameEn: "1st Secondary",
        groups: [
          { id: "sec1-sat", nameAr: "مجموعة السبت والأربعاء", nameEn: "Sat & Wed Group", time: "16:00" },
          { id: "sec1-sun", nameAr: "مجموعة الأحد والخميس", nameEn: "Sun & Thu Group", time: "18:00" }
        ]
      },
      {
        id: "grade-sec-2",
        nameAr: "الصف الثاني الثانوي",
        nameEn: "2nd Secondary",
        groups: [
          { id: "sec2-vip", nameAr: "مجموعة VIP التفاعلية", nameEn: "VIP Interactive Group", time: "19:00" }
        ]
      },
      {
        id: "grade-sec-3",
        nameAr: "الصف الثالث الثانوي",
        nameEn: "3rd Secondary",
        groups: [
          { id: "sec3-intensive", nameAr: "المعسكر المكثف", nameEn: "Intensive Bootcamp", time: "20:00" },
          { id: "sec3-revision", nameAr: "مجموعة المراجعة النهائية", nameEn: "Final Revision Group", time: "15:00" }
        ]
      }
    ]
  },
  {
    id: 102,
    nameAr: "أ. نادية علي",
    nameEn: "Prof. Nadia Ali",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=120",
    subjectAr: "الرياضيات",
    subjectEn: "Mathematics",
    yearAr: "إعدادي",
    yearEn: "Middle School",
    aboutAr: "معلمة رياضيات متميزة للمرحلة الإعدادية، تهتم بتأسيس الطلاب للمراحل المتقدمة.",
    aboutEn: "Outstanding math teacher for Middle School, focusing on foundational skills.",
    price: "150 ج.م / شهرياً",
    paymentMethods: "تحويل بنكي، فودافون كاش",
    whatsapp: "+201200000000",
    isSubscribed: true,
    grades: [
      {
        id: "grade-prep-1",
        nameAr: "الصف الأول الإعدادي",
        nameEn: "1st Prep",
        groups: [
          { id: "math-a", nameAr: "مجموعة أ", nameEn: "Group A", time: "14:00" }
        ]
      }
    ]
  }
];

export const initialStudents = [
  {
    id: 1,
    nameAr: "أحمد المحمود",
    nameEn: "Ahmed El-Mahmoud",
    phone: "+201012345671",
    parentPhone: "+201087654321",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120",
    enrollments: [
      { instructorId: 101, gradeId: "grade-sec-1", groupId: "sec1-sat" }
    ],
    grades: [
      { id: 1, instructorId: 101, titleAr: "الواجب الأول", titleEn: "Assignment 1", score: 98, max: 100 },
      { id: 2, instructorId: 101, titleAr: "اختبار الباب الأول", titleEn: "Chapter 1 Quiz", score: 95, max: 100 },
      { id: 3, instructorId: 101, titleAr: "امتحان شامل", titleEn: "Comprehensive Exam", score: 100, max: 100 }
    ],
    attendance: [
      { instructorId: 101, sessionId: 1001, date: "2026-08-01", status: "present" },
      { instructorId: 101, sessionId: 1002, date: "2026-08-03", status: "present" },
      { instructorId: 101, sessionId: 1003, date: "2026-08-08", status: "present" }
    ]
  },
  {
    id: 2,
    nameAr: "ياسمين صبري",
    nameEn: "Yasmin Sabry",
    phone: "+201012345672",
    parentPhone: "+201087654322",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
    enrollments: [
      { instructorId: 101, gradeId: "grade-sec-1", groupId: "sec1-sat" }
    ],
    grades: [
      { id: 1, instructorId: 101, titleAr: "الواجب الأول", titleEn: "Assignment 1", score: 85, max: 100 },
      { id: 2, instructorId: 101, titleAr: "اختبار الباب الأول", titleEn: "Chapter 1 Quiz", score: 90, max: 100 },
      { id: 3, instructorId: 101, titleAr: "امتحان شامل", titleEn: "Comprehensive Exam", score: 88, max: 100 }
    ],
    attendance: [
      { instructorId: 101, sessionId: 1001, date: "2026-08-01", status: "present" },
      { instructorId: 101, sessionId: 1002, date: "2026-08-03", status: "absent" },
      { instructorId: 101, sessionId: 1003, date: "2026-08-08", status: "present" }
    ]
  },
  {
    id: 3,
    nameAr: "عمر الفاروق",
    nameEn: "Omar Al-Faruq",
    phone: "+201012345673",
    parentPhone: "+201087654323",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
    enrollments: [
      { instructorId: 101, gradeId: "grade-sec-1", groupId: "sec1-sun" }
    ],
    grades: [
      { id: 1, instructorId: 101, titleAr: "الواجب الأول", titleEn: "Assignment 1", score: 92, max: 100 },
      { id: 2, instructorId: 101, titleAr: "اختبار الباب الأول", titleEn: "Chapter 1 Quiz", score: 96, max: 100 }
    ],
    attendance: [
      { instructorId: 101, sessionId: 1004, date: "2026-08-02", status: "present" },
      { instructorId: 101, sessionId: 1005, date: "2026-08-04", status: "present" }
    ]
  },
  {
    id: 4,
    nameAr: "سارة عبد الله",
    nameEn: "Sara Abdullah",
    phone: "+201012345674",
    parentPhone: "+201087654324",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120",
    enrollments: [
      { instructorId: 101, gradeId: "grade-sec-2", groupId: "sec2-vip" }
    ],
    grades: [
      { id: 1, instructorId: 101, titleAr: "اختبار الموائع", titleEn: "Fluids Quiz", score: 98, max: 100 },
      { id: 2, instructorId: 101, titleAr: "تطبيقات الحرارة", titleEn: "Thermal Apps", score: 100, max: 100 }
    ],
    attendance: [
      { instructorId: 101, sessionId: 2001, date: "2026-08-01", status: "present" },
      { instructorId: 101, sessionId: 2002, date: "2026-08-05", status: "present" }
    ]
  },
  {
    id: 5,
    nameAr: "كريم مجدي",
    nameEn: "Karim Magdy",
    phone: "+201012345675",
    parentPhone: "+201087654325",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120",
    enrollments: [
      { instructorId: 101, gradeId: "grade-sec-3", groupId: "sec3-intensive" }
    ],
    grades: [
      { id: 1, instructorId: 101, titleAr: "الفيزياء الحديثة", titleEn: "Modern Physics Quiz", score: 75, max: 100 },
      { id: 2, instructorId: 101, titleAr: "التيار المتردد", titleEn: "AC Current Test", score: 82, max: 100 }
    ],
    attendance: [
      { instructorId: 101, sessionId: 3001, date: "2026-08-02", status: "absent" },
      { instructorId: 101, sessionId: 3002, date: "2026-08-06", status: "present" }
    ]
  }
];

export const initialSessions = [
  // Sec 1 - Sat Group
  {
    id: 1001,
    instructorId: 101,
    groupId: "sec1-sat",
    gradeId: "grade-sec-1",
    titleAr: "الفيزياء 1 - المحاضرة 1: القياس الفيزيائي",
    titleEn: "Physics 1 - Session 1: Physical Measurements",
    descAr: "مقدمة عن أدوات القياس ومعادلات الأبعاد وأخطاء القياس بالتفصيل.",
    descEn: "Introduction to measurement tools, dimension equations, and measurement errors.",
    videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk",
    date: "2026-08-01"
  },
  {
    id: 1002,
    instructorId: 101,
    groupId: "sec1-sat",
    gradeId: "grade-sec-1",
    titleAr: "الفيزياء 1 - المحاضرة 2: الكميات القياسية والمتجهة",
    titleEn: "Physics 1 - Session 2: Scalars and Vectors",
    descAr: "شرح مبسط للفروق بين الكميات، وجمع وتحليل المتجهات وتطبيقات الذكاء الاصطناعي.",
    descEn: "Simplified explanation of differences between quantities, adding/resolving vectors with AI apps.",
    videoUrl: "https://www.youtube.com/embed/Ke90Tje7VS0",
    date: "2026-08-03"
  },
  {
    id: 1003,
    instructorId: 101,
    groupId: "sec1-sat",
    gradeId: "grade-sec-1",
    titleAr: "الفيزياء 1 - المحاضرة 3: السرعة والعجلة",
    titleEn: "Physics 1 - Session 3: Velocity and Acceleration",
    descAr: "حركة الأجسام في خط مستقيم وقوانين الحركة بعجلة منتظمة.",
    descEn: "Linear motion of bodies and laws of motion with uniform acceleration.",
    videoUrl: "https://www.youtube.com/embed/0ZJgJwR44IA",
    date: "2026-08-08"
  },
  // Sec 1 - Sun Group
  {
    id: 1004,
    instructorId: 101,
    groupId: "sec1-sun",
    gradeId: "grade-sec-1",
    titleAr: "الفيزياء 1 - المحاضرة 1: القياس الفيزيائي (الأحد)",
    titleEn: "Physics 1 - Session 1: Physical Measurements (Sun)",
    descAr: "شرح تفاعلي للقياس لمجموعة الأحد.",
    descEn: "Interactive measurements explanation for Sunday group.",
    videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk",
    date: "2026-08-02"
  },
  {
    id: 1005,
    instructorId: 101,
    groupId: "sec1-sun",
    gradeId: "grade-sec-1",
    titleAr: "الفيزياء 1 - المحاضرة 2: المتجهات (الأحد)",
    titleEn: "Physics 1 - Session 2: Vectors (Sun)",
    descAr: "تدريبات مكثفة على المتجهات.",
    descEn: "Intensive vector exercises.",
    videoUrl: "https://www.youtube.com/embed/Ke90Tje7VS0",
    date: "2026-08-04"
  },
  // Sec 2 - VIP Group
  {
    id: 2001,
    instructorId: 101,
    groupId: "sec2-vip",
    gradeId: "grade-sec-2",
    titleAr: "الفيزياء 2 - المحاضرة 1: خواص الموائع الساكنة",
    titleEn: "Physics 2 - Session 1: Static Fluids Properties",
    descAr: "الكثافة والضغط وقاعدة باسكال مع تجارب تفاعلية مصورة.",
    descEn: "Density, pressure, and Pascal's principle with interactive recorded experiments.",
    videoUrl: "https://www.youtube.com/embed/tS47t_S4xI0",
    date: "2026-08-01"
  },
  {
    id: 2002,
    instructorId: 101,
    groupId: "sec2-vip",
    gradeId: "grade-sec-2",
    titleAr: "الفيزياء 2 - المحاضرة 2: الحرارة والديناميكا",
    titleEn: "Physics 2 - Session 2: Heat and Thermodynamics",
    descAr: "قوانين الديناميكا الحرارية وتطبيقات الغازات المثالية.",
    descEn: "Laws of thermodynamics and ideal gas applications.",
    videoUrl: "https://www.youtube.com/embed/c04A8A6P_K4",
    date: "2026-08-05"
  },
  // Sec 3 - Intensive Group
  {
    id: 3001,
    instructorId: 101,
    groupId: "sec3-intensive",
    gradeId: "grade-sec-3",
    titleAr: "الفيزياء 3 - المحاضرة 1: التيار الكهربي وقانون أوم",
    titleEn: "Physics 3 - Session 1: Electric Current and Ohm's Law",
    descAr: "أساسيات الكهربية، المقاومة، وتوصيل المقاومات توالي وتوازي.",
    descEn: "Electricity basics, resistance, and series/parallel connections.",
    videoUrl: "https://www.youtube.com/embed/0ZJgJwR44IA",
    date: "2026-08-02"
  },
  {
    id: 3002,
    instructorId: 101,
    groupId: "sec3-intensive",
    gradeId: "grade-sec-3",
    titleAr: "الفيزياء 3 - المحاضرة 2: التأثير المغناطيسي",
    titleEn: "Physics 3 - Session 2: Magnetic Effect",
    descAr: "المجال المغناطيسي للتيار الكهربي وقوة لورنتز.",
    descEn: "Magnetic field of electric current and Lorentz force.",
    videoUrl: "https://www.youtube.com/embed/SqcY0GlETPk",
    date: "2026-08-06"
  }
];

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
