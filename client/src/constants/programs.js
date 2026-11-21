// Degree programs offered at registration, grouped by school.
// To add a program, add its name to the right group. Don't rename existing
// entries: the name is stored in student_profiles.degree_program.
export const PROGRAM_GROUPS = [
  {
    school: 'Science & Technology',
    programs: [
      'Software Engineering',
      'Applied Computer Technology',
      'Information Systems Technology',
      'Data Science and Analytics',
      'Mathematics'
    ]
  },
  {
    school: 'Business',
    programs: [
      'Business Administration',
      'International Business Administration',
      'Accounting',
      'Finance',
      'Marketing',
      'Hotel and Restaurant Management',
      'Tourism Management'
    ]
  },
  {
    school: 'Humanities & Social Sciences',
    programs: [
      'International Relations',
      'Psychology',
      'Criminal Justice',
      'Economics'
    ]
  },
  {
    school: 'Communication, Cinematic & Creative Arts',
    programs: [
      'Journalism',
      'Film Production and Directing',
      'Animation',
      'Music Technology'
    ]
  },
  {
    school: 'Pharmacy & Health Sciences',
    programs: [
      'Pharmacy',
      'Nursing',
      'Epidemiology and Biostatistics'
    ]
  }
];

export const ALL_PROGRAMS = PROGRAM_GROUPS.flatMap((group) => group.programs);
