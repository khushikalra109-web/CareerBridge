const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
const PHONE_REGEX = /(\+?\d{1,3}[-.\s]?)?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/;

const COMMON_SKILLS = [
  'javascript', 'typescript', 'react', 'reactjs', 'node', 'nodejs', 'express', 'mongodb', 'sql', 'postgres', 'mysql',
  'html', 'css', 'tailwind', 'bootstrap', 'aws', 'azure', 'docker', 'kubernetes', 'git', 'github', 'rest api', 'graphql',
  'redux', 'next.js', 'next', 'vue', 'angular', 'python', 'django', 'flask', 'java', 'spring', 'c#', 'dotnet', 'php', 'laravel',
  'c++', 'c', 'go', 'rust', 'swift', 'kotlin', 'flutter', 'react native', 'machine learning', 'data science', 'pandas',
  'numpy', 'tensorflow', 'pytorch', 'figma', 'ui/ux', 'product design', 'project management', 'agile', 'scrum', 'seo',
  'content strategy', 'copywriting', 'digital marketing', 'social media', 'analytics', 'salesforce', 'service now'
];

const EDUCATION_KEYWORDS = [
  'bachelor', 'master', 'phd', 'diploma', 'associate', 'degree',
  'btech', 'bca', 'mtech', 'mca', 'b.tech', 'm.tech',
  'engineering', 'computer science', 'information technology',
  'university', 'college', 'institute', 'school'
];

const EXPERIENCE_KEYWORDS = [
  'experience', 'work', 'worked', 'employment', 'job', 'position',
  'internship', 'intern', 'role', 'responsibilities', 'year', 'years',
  'senior', 'junior', 'lead', 'manager', 'developer', 'engineer',
  'analyst', 'coordinator', 'specialist', 'associate'
];

const PROJECT_KEYWORDS = [
  'project', 'projects', 'developed', 'built', 'created', 'deployed',
  'github', 'repository', 'repo', 'web application', 'mobile app',
  'application', 'software', 'tool', 'framework', 'library'
];

const CERTIFICATION_KEYWORDS = [
  'certification', 'certified', 'certifications', 'achievement', 'award',
  'achieved', 'accomplishment', 'badge', 'license', 'qualified',
  'credential', 'professional', 'training', 'certificate'
];

const normalizeSkill = (skill) =>
  String(skill || '')
    .toLowerCase()
    .trim()
    .replace(/[.,;]+$/g, '')
    .replace(/\.jsx?$/g, '')
    .replace(/next\.js$/g, 'next')
    .replace(/nodejs$/g, 'node')
    .replace(/reactjs$/g, 'react')
    .replace(/expressjs$/g, 'express')
    .replace(/\.\s*js$/g, '')
    .replace(/\s+/g, ' ');

const normalizeSkills = (skills) => {
  if (!skills) return [];
  const normalized = Array.isArray(skills) ? skills : String(skills).split(',');
  return Array.from(
    new Set(
      normalized
        .map(normalizeSkill)
        .filter(Boolean)
    )
  );
};

const calculateContactScore = (text) => {
  let score = 0;
  if (EMAIL_REGEX.test(text)) score += 10;
  if (PHONE_REGEX.test(text)) score += 10;
  return Math.min(score, 20);
};

const extractResumeSkills = (text) => {
  if (!text) return [];
  const textLower = text.toLowerCase();
  const found = new Set();

  COMMON_SKILLS.forEach((skill) => {
    if (textLower.includes(skill.toLowerCase())) {
      found.add(normalizeSkill(skill));
    }
  });

  return Array.from(found).slice(0, 40);
};

const calculateSkillsScore = (text, userSkills, extractedSkills = []) => {
  const textLower = text.toLowerCase();
  const normalizedUserSkills = normalizeSkills(userSkills);
  const normalizedExtractedSkills = normalizeSkills(extractedSkills);

  const matchedSkills = normalizedUserSkills.length
    ? normalizedUserSkills.filter((skill) => textLower.includes(skill))
    : normalizedExtractedSkills.filter((skill) => textLower.includes(skill));

  const totalSkills = normalizedUserSkills.length > 0 ? normalizedUserSkills.length : normalizedExtractedSkills.length;
  if (totalSkills === 0) return 0;

  const matchPercentage = (matchedSkills.length / totalSkills) * 100;
  return Math.round((matchPercentage / 100) * 25);
};

const calculateJobMatch = (jobSkills = [], resumeSkills = []) => {
  const normalizedJobSkills = normalizeSkills(jobSkills);
  const normalizedResumeSkills = normalizeSkills(resumeSkills);

  const strongSkills = normalizedJobSkills.filter((skill) => normalizedResumeSkills.includes(skill));
  const missingSkills = normalizedJobSkills.filter((skill) => !normalizedResumeSkills.includes(skill));
  const matchPercentage = normalizedJobSkills.length ? Math.round((strongSkills.length / normalizedJobSkills.length) * 100) : 0;

  return {
    jobSkills: normalizedJobSkills,
    strongSkills,
    missingSkills,
    matchPercentage,
  };
};

const calculateEducationScore = (text) => {
  const textLower = text.toLowerCase();
  const foundKeywords = EDUCATION_KEYWORDS.filter(keyword =>
    textLower.includes(keyword)
  );

  return foundKeywords.length > 0 ? 15 : 0;
};

const calculateExperienceScore = (text) => {
  const textLower = text.toLowerCase();
  const foundKeywords = EXPERIENCE_KEYWORDS.filter(keyword =>
    textLower.includes(keyword)
  );

  if (foundKeywords.length >= 5) return 20;
  if (foundKeywords.length >= 3) return 15;
  if (foundKeywords.length >= 1) return 10;
  return 0;
};

const calculateProjectsScore = (text) => {
  const textLower = text.toLowerCase();
  const foundKeywords = PROJECT_KEYWORDS.filter(keyword =>
    textLower.includes(keyword)
  );

  return foundKeywords.length >= 2 ? 10 : (foundKeywords.length >= 1 ? 5 : 0);
};

const calculateCertificationsScore = (text) => {
  const textLower = text.toLowerCase();
  const foundKeywords = CERTIFICATION_KEYWORDS.filter(keyword =>
    textLower.includes(keyword)
  );

  return foundKeywords.length >= 2 ? 10 : (foundKeywords.length >= 1 ? 5 : 0);
};

const generateSuggestions = (text, userSkills, score) => {
  const suggestions = [];
  const textLower = text.toLowerCase();
  const normalizedUserSkills = normalizeSkills(userSkills);

  if (!EMAIL_REGEX.test(text) || !PHONE_REGEX.test(text)) {
    if (!EMAIL_REGEX.test(text)) suggestions.push('Add your email address');
    if (!PHONE_REGEX.test(text)) suggestions.push('Add your phone number');
  }

  const matchedSkills = normalizedUserSkills.filter(skill => textLower.includes(skill));

  if (!normalizedUserSkills.length || matchedSkills.length < normalizedUserSkills.length * 0.5) {
    suggestions.push('Add more technical skills from your profile');
  }

  const hasEducation = EDUCATION_KEYWORDS.some(keyword => textLower.includes(keyword));
  if (!hasEducation) suggestions.push('Add your educational background');

  const experienceKeywordCount = EXPERIENCE_KEYWORDS.filter(keyword =>
    textLower.includes(keyword)
  ).length;
  if (experienceKeywordCount < 3) suggestions.push('Add detailed work experience descriptions');

  const projectKeywordCount = PROJECT_KEYWORDS.filter(keyword =>
    textLower.includes(keyword)
  ).length;
  if (projectKeywordCount < 2) suggestions.push('Showcase your projects with descriptions');

  const certificationKeywordCount = CERTIFICATION_KEYWORDS.filter(keyword =>
    textLower.includes(keyword)
  ).length;
  if (certificationKeywordCount < 2) suggestions.push('Add certifications and achievements');

  if (score < 40) suggestions.push('Consider using keywords relevant to your target job roles');

  return suggestions.slice(0, 5);
};

const calculateResumeScore = (resumeText, userSkills = [], extractedSkills = []) => {
  if (!resumeText || resumeText.trim().length === 0) {
    return { score: 0, suggestions: ['Upload a resume to get started'], extractedSkills: [], strongSkills: [] };
  }

  const skillsToUse = extractedSkills.length > 0 ? normalizeSkills(extractedSkills) : extractResumeSkills(resumeText);
  const normalizedUserSkills = normalizeSkills(userSkills);
  const strongSkills = normalizedUserSkills.length > 0
    ? skillsToUse.filter((skill) => normalizedUserSkills.includes(skill))
    : skillsToUse.slice(0, 6);

  const contactScore = calculateContactScore(resumeText);
  const skillsScore = calculateSkillsScore(resumeText, normalizedUserSkills, skillsToUse);
  const educationScore = calculateEducationScore(resumeText);
  const experienceScore = calculateExperienceScore(resumeText);
  const projectsScore = calculateProjectsScore(resumeText);
  const certificationsScore = calculateCertificationsScore(resumeText);

  const totalScore = Math.round(
    contactScore + skillsScore + educationScore + experienceScore + projectsScore + certificationsScore
  );

  const suggestions = generateSuggestions(resumeText, normalizedUserSkills, totalScore);

  return {
    score: Math.min(totalScore, 100),
    breakdown: {
      contact: contactScore,
      skills: skillsScore,
      education: educationScore,
      experience: experienceScore,
      projects: projectsScore,
      certifications: certificationsScore,
    },
    suggestions,
    extractedSkills: skillsToUse,
    strongSkills,
  };
};

module.exports = { calculateResumeScore, extractResumeSkills, calculateJobMatch, normalizeSkills };
