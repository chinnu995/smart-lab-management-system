export const DEPARTMENTS = [
  { name: 'Computer Science & Engineering', code: 'CS' },
  { name: 'Information Science & Engineering', code: 'IS' },
  { name: 'Artificial Intelligence & Machine Learning', code: 'AI' },
  { name: 'Computer Science & Data Science', code: 'DS' },
  { name: 'Computer Science & Design', code: 'CD' },
  { name: 'Computer Engineering', code: 'CE' },
  { name: 'Computer Science & Engineering (Cyber Security)', code: 'CY' },
];

export const getDeptCode = (deptName) => {
  if (!deptName) return 'CS';
  const found = DEPARTMENTS.find(d => d.name.toLowerCase() === deptName.toLowerCase());
  if (found) return found.code;

  const d = deptName.toLowerCase();
  if (d.includes('cyber') || d === 'cy') return 'CY';
  if (d.includes('computer engineering') || d === 'ce') return 'CE';
  if (d.includes('data science') || d === 'ds') return 'DS';
  if (d.includes('design') || d === 'cd') return 'CD';
  if (d.includes('artificial intelligence') || d.includes('ai') || d === 'aiml') return 'AI';
  if (d.includes('information science') || d === 'is') return 'IS';
  if (d.includes('computer science') || d === 'cs' || d.includes('cse')) return 'CS';
  return 'CS';
};

export const formatUsnForDept = (rawUsn, deptName) => {
  if (!rawUsn) return '';
  const code = getDeptCode(deptName);
  let clean = rawUsn.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (clean.startsWith('4PM')) {
    clean = clean.slice(3);
  }

  // Case 1: user typed 5 digits, e.g. 24011 -> 24 + CE + 011
  if (/^\d{5}$/.test(clean)) {
    const yr = clean.slice(0, 2);
    const roll = clean.slice(2);
    return `4PM${yr}${code}${roll}`;
  }

  // Case 2: user typed year + branch + roll, e.g. 24CS011 or 24CE011 -> 4PM + 24 + CE + 011
  const match = clean.match(/^(\d{2})([A-Z]{2})(\d{1,3})$/);
  if (match) {
    const yr = match[1];
    const roll = match[3].padStart(3, '0');
    return `4PM${yr}${code}${roll}`;
  }

  // Case 3: partial typing like 24 or 24CE
  if (/^\d{2}$/.test(clean)) {
    return `4PM${clean}`;
  }

  const partialMatch = clean.match(/^(\d{2})([A-Z]{1,2})$/);
  if (partialMatch) {
    const yr = partialMatch[1];
    return `4PM${yr}${code}`;
  }

  return clean.startsWith('4PM') ? clean : `4PM${clean}`;
};
