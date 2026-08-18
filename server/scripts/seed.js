import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Department from '../models/Department.js';
import Course from '../models/Course.js';
import Attendance from '../models/Attendance.js';
import Examination from '../models/Examination.js';
import Result from '../models/Result.js';
import Announcement from '../models/Announcement.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/student_portal';

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected! Cleaning database collections...');

    // Clear all existing data
    await User.deleteMany();
    await Student.deleteMany();
    await Teacher.deleteMany();
    await Department.deleteMany();
    await Course.deleteMany();
    await Attendance.deleteMany();
    await Examination.deleteMany();
    await Result.deleteMany();
    await Announcement.deleteMany();

    console.log('Database cleared.');

    // 1. Create Admins
    console.log('Creating Admin accounts...');
    const adminUser = await User.create({
      email: 'admin@university.edu',
      password: 'admin123', // Pre-hashed by mongoose pre-save hook
      role: 'admin',
      isActive: true,
    });
    console.log('Admin account created (admin@university.edu / admin123)');

    // 2. Create Departments
    console.log('Creating Departments...');
    const cseDept = await Department.create({
      name: 'Computer Science & Engineering',
      code: 'CSE',
      description: 'Department of Computer Science and Software Engineering.',
    });

    const eeDept = await Department.create({
      name: 'Electrical Engineering',
      code: 'EE',
      description: 'Department of Electrical and Electronics Engineering.',
    });

    const meDept = await Department.create({
      name: 'Mechanical Engineering',
      code: 'ME',
      description: 'Department of Mechanical and Industrial Engineering.',
    });

    const bbaDept = await Department.create({
      name: 'Business Administration',
      code: 'BBA',
      description: 'Department of Business Management and Administration.',
    });

    // 3. Create Teachers (User logins first, then Teacher profiles)
    console.log('Creating Teachers...');

    // Teacher 1: Sarah Connor (HOD CSE)
    const uSarah = await User.create({
      email: 'sarah.connor@university.edu',
      password: 'teacher123',
      role: 'teacher',
      isActive: true,
    });
    const tSarah = await Teacher.create({
      user: uSarah._id,
      employeeId: 'TCH001',
      firstName: 'Sarah',
      lastName: 'Connor',
      email: 'sarah.connor@university.edu',
      phone: '+1 (555) 019-2831',
      department: cseDept._id,
      position: 'Professor / HOD',
      joiningDate: new Date('2018-08-15'),
      status: 'active',
    });

    // Link HOD to Department
    cseDept.headOfDepartment = tSarah._id;
    await cseDept.save();

    // Teacher 2: Alan Turing (Teacher CSE)
    const uAlan = await User.create({
      email: 'alan.turing@university.edu',
      password: 'teacher123',
      role: 'teacher',
      isActive: true,
    });
    const tAlan = await Teacher.create({
      user: uAlan._id,
      employeeId: 'TCH002',
      firstName: 'Alan',
      lastName: 'Turing',
      email: 'alan.turing@university.edu',
      phone: '+1 (555) 019-4567',
      department: cseDept._id,
      position: 'Associate Professor',
      joiningDate: new Date('2020-01-10'),
      status: 'active',
    });

    // Teacher 3: Nikola Tesla (HOD EE)
    const uTesla = await User.create({
      email: 'nikola.tesla@university.edu',
      password: 'teacher123',
      role: 'teacher',
      isActive: true,
    });
    const tTesla = await Teacher.create({
      user: uTesla._id,
      employeeId: 'TCH003',
      firstName: 'Nikola',
      lastName: 'Tesla',
      email: 'nikola.tesla@university.edu',
      phone: '+1 (555) 019-9999',
      department: eeDept._id,
      position: 'Professor / HOD',
      joiningDate: new Date('2015-05-12'),
      status: 'active',
    });

    eeDept.headOfDepartment = tTesla._id;
    await eeDept.save();

    // Teacher 4: James Watt (Teacher ME)
    const uWatt = await User.create({
      email: 'james.watt@university.edu',
      password: 'teacher123',
      role: 'teacher',
      isActive: true,
    });
    const tWatt = await Teacher.create({
      user: uWatt._id,
      employeeId: 'TCH004',
      firstName: 'James',
      lastName: 'Watt',
      email: 'james.watt@university.edu',
      phone: '+1 (555) 019-7777',
      department: meDept._id,
      position: 'Lecturer',
      joiningDate: new Date('2022-09-01'),
      status: 'active',
    });

    console.log('Teachers created successfully.');

    // 4. Create Courses
    console.log('Creating Courses...');
    const cs101 = await Course.create({
      courseCode: 'CS-101',
      courseName: 'Introduction to Computer Programming',
      department: cseDept._id,
      semester: 1,
      creditHours: 4,
      assignedTeacher: tAlan._id,
      status: 'active',
    });

    const cs202 = await Course.create({
      courseCode: 'CS-202',
      courseName: 'Data Structures and Algorithms',
      department: cseDept._id,
      semester: 3,
      creditHours: 3,
      assignedTeacher: tAlan._id,
      status: 'active',
    });

    const cs301 = await Course.create({
      courseCode: 'CS-301',
      courseName: 'Database Management Systems',
      department: cseDept._id,
      semester: 5,
      creditHours: 3,
      assignedTeacher: tSarah._id,
      status: 'active',
    });

    const ee101 = await Course.create({
      courseCode: 'EE-101',
      courseName: 'Basic Electrical Engineering',
      department: eeDept._id,
      semester: 1,
      creditHours: 3,
      assignedTeacher: tTesla._id,
      status: 'active',
    });

    const me201 = await Course.create({
      courseCode: 'ME-201',
      courseName: 'Engineering Thermodynamics',
      department: meDept._id,
      semester: 3,
      creditHours: 4,
      assignedTeacher: tWatt._id,
      status: 'active',
    });

    console.log('Courses created successfully.');

    // 5. Create Students
    console.log('Creating Students...');

    // Student 1: John Doe (CSE, Sem 3)
    const uJohn = await User.create({
      email: 'john.doe@student.edu',
      password: 'student123',
      role: 'student',
      isActive: true,
    });
    const sJohn = await Student.create({
      user: uJohn._id,
      studentId: 'STD2024001',
      firstName: 'John',
      lastName: 'Doe',
      dob: new Date('2004-05-15'),
      gender: 'Male',
      email: 'john.doe@student.edu',
      phone: '+1 (555) 012-3456',
      address: '123 Academic Way, University Campus',
      department: cseDept._id,
      program: 'B.Tech CSE',
      semester: 3,
      enrollmentDate: new Date('2024-08-20'),
      status: 'active',
      courses: [cs202._id, cs301._id],
    });

    // Student 2: Jane Smith (CSE, Sem 3)
    const uJane = await User.create({
      email: 'jane.smith@student.edu',
      password: 'student123',
      role: 'student',
      isActive: true,
    });
    const sJane = await Student.create({
      user: uJane._id,
      studentId: 'STD2024002',
      firstName: 'Jane',
      lastName: 'Smith',
      dob: new Date('2005-02-28'),
      gender: 'Female',
      email: 'jane.smith@student.edu',
      phone: '+1 (555) 012-7890',
      address: '456 Residence Hall A, University Campus',
      department: cseDept._id,
      program: 'B.Tech CSE',
      semester: 3,
      enrollmentDate: new Date('2024-08-20'),
      status: 'active',
      courses: [cs202._id, cs301._id],
      documents: [
        { name: 'High School Transcript', fileUrl: 'https://example.com/docs/jane_hs_transcript.pdf' },
        { name: 'Enrollment Offer Letter', fileUrl: 'https://example.com/docs/jane_offer_letter.pdf' }
      ]
    });

    // Student 3: Bob Johnson (EE, Sem 1)
    const uBob = await User.create({
      email: 'bob.johnson@student.edu',
      password: 'student123',
      role: 'student',
      isActive: true,
    });
    const sBob = await Student.create({
      user: uBob._id,
      studentId: 'STD2025001',
      firstName: 'Bob',
      lastName: 'Johnson',
      dob: new Date('2006-11-05'),
      gender: 'Male',
      email: 'bob.johnson@student.edu',
      phone: '+1 (555) 012-1111',
      address: '789 College Avenue, Cityville',
      department: eeDept._id,
      program: 'B.Tech EE',
      semester: 1,
      enrollmentDate: new Date('2025-08-10'),
      status: 'active',
      courses: [cs101._id, ee101._id],
    });

    // Student 4: Alice Brown (CSE, Sem 5)
    const uAlice = await User.create({
      email: 'alice.brown@student.edu',
      password: 'student123',
      role: 'student',
      isActive: true,
    });
    const sAlice = await Student.create({
      user: uAlice._id,
      studentId: 'STD2023001',
      firstName: 'Alice',
      lastName: 'Brown',
      dob: new Date('2003-09-12'),
      gender: 'Female',
      email: 'alice.brown@student.edu',
      phone: '+1 (555) 012-3333',
      address: '101 Pine Street, Metro Heights',
      department: cseDept._id,
      program: 'B.Tech CSE',
      semester: 5,
      enrollmentDate: new Date('2023-08-15'),
      status: 'active',
      courses: [cs301._id],
    });

    console.log('Students created successfully.');

    // 6. Create Attendance records (past 5 school days for John and Jane in CS-202)
    console.log('Creating Attendance records...');
    const days = [
      new Date('2026-08-11'),
      new Date('2026-08-12'),
      new Date('2026-08-13'),
      new Date('2026-08-14'),
      new Date('2026-08-17'),
    ];

    // Seed John's attendance (4 Present, 1 Late)
    for (let i = 0; i < days.length; i++) {
      const status = i === 2 ? 'Late' : 'Present';
      await Attendance.create({
        course: cs202._id,
        student: sJohn._id,
        date: days[i],
        status,
        markedBy: uAlan._id,
      });
    }

    // Seed Jane's attendance (3 Present, 1 Absent, 1 Present)
    for (let i = 0; i < days.length; i++) {
      const status = i === 3 ? 'Absent' : 'Present';
      await Attendance.create({
        course: cs202._id,
        student: sJane._id,
        date: days[i],
        status,
        markedBy: uAlan._id,
      });
    }

    console.log('Attendance seeded.');

    // 7. Create Examinations and Results
    console.log('Creating Examinations & Results...');

    // Mid-Term exam for CS-202 (published)
    const midTermExam = await Examination.create({
      examName: 'Mid Semester Examination 2026',
      course: cs202._id,
      date: new Date('2026-07-15'),
      maxMarks: 50,
      status: 'published',
    });

    // Enter results for Mid-Term
    // John: 42/50 (84% -> A, GPA: 3.7)
    await Result.create({
      examination: midTermExam._id,
      course: cs202._id,
      student: sJohn._id,
      marksObtained: 42,
      grade: 'A',
      gpa: 3.7,
      remarks: 'Excellent programming logic, watch for minor space complexities.',
    });

    // Jane: 48/50 (96% -> A+, GPA: 4.0)
    await Result.create({
      examination: midTermExam._id,
      course: cs202._id,
      student: sJane._id,
      marksObtained: 48,
      grade: 'A+',
      gpa: 4.0,
      remarks: 'Perfect exam script, elegant algorithm designs.',
    });

    // Quiz 1 for CS-301 (Scheduled, in future)
    await Examination.create({
      examName: 'Database Design Quiz 1',
      course: cs301._id,
      date: new Date('2026-09-05'),
      maxMarks: 20,
      status: 'scheduled',
    });

    console.log('Examinations and Results seeded.');

    // 8. Create Announcements
    console.log('Creating Announcements...');
    await Announcement.create({
      title: 'Welcome to the Academic Year 2026-27',
      content: 'We are excited to welcome all new and returning students to campus. Please ensure your semester course registrations are completed before classes commence.',
      targetRole: 'all',
      createdBy: adminUser._id,
    });

    await Announcement.create({
      title: 'Special Workshop on Machine Learning & Neural Networks',
      content: 'The Computer Science department is organizing a guest lecture by visiting scholars on contemporary developments in ML/DL. Recommended for Semester 3 and Semester 5 students.',
      targetRole: 'student',
      targetDepartment: cseDept._id,
      createdBy: adminUser._id,
    });

    await Announcement.create({
      title: 'Submission of Semester Grade Sheets & Syllabus Completion Reports',
      content: 'All faculty members are requested to upload their respective syllabus completion percentages and marks sheets to the admin portal by the end of next week.',
      targetRole: 'teacher',
      createdBy: adminUser._id,
    });

    console.log('Announcements seeded.');
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error: ', error);
    process.exit(1);
  }
};

seedData();
