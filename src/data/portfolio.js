// Clean, compact portfolio data and plain-text command outputs
export const portfolioData = {
  name: "Jayesh Channe",
  title: "Software Engineer",
  email: "jayeshchanne9@gmail.com",
  github: "https://github.com/Jayesh242663",
  linkedin: "https://linkedin.com/in/jayeshchanne",
  location: "Mumbai, India",

  about: "Information Technology undergraduate with strong hands-on experience in designing and building full-stack web applications. Proficient in modern frontend frameworks, backend API development, and relational database design. Experienced in implementing secure authentication, role-based access control, and data integrity mechanisms in real-world projects. Demonstrates solid problem-solving ability, system-level thinking, and a keen interest in building reliable, user-focused software solutions",

  skills: {
    languages: ["Python", "JavaScript", "C", "Java"],
    frontend: ["React", "HTML", "CSS"],
    backend: ["Node.js", "Express.js"],
    databases: ["MySQL", "MongoDB", "PostgreSQL"],
    tools: ["Git", "GitHub", "Wireshark", "Burp Suite"],
  },

  projects: [
    {
      name: "Bank Management System",
      description: "Simulates core banking operations with account management and transactions; originally Java, rebuilt in Python with MySQL integration.",
      tech: ["Python", "MySQL"],
      link: "https://github.com/Jayesh242663/BankingSystemApplication-python-",
    },
    {
      name: "Workspace Management System",
      description: "Platform to manage employees, tasks and project progress to improve productivity and transparency.",
      tech: ["Python", "MySQL"],
      link: "https://github.com/Jayesh242663/workspace-management-system",
    },
    {
      name: "Secure Pass",
      description: "A web app for secure password storage, security diagnostics and breach monitoring. (Under development)",
      tech: ["React", "Python", "PostgreSQL"],
      link: "https://github.com/Jayesh242663/secure-pass",
    },
  ],

  education: [
    {
      degree: "Bachelor of Engineering in Information Technology",
      institution: "Mumbai University",
      period: "2022 - 2027",
      details: "Focused on Web Development, AI & ML, data structures, algorithms, and system design.",
    },
  ],

  certifications: [
    {
      name: "The Complete Full-Stack Web Development Bootcamp",
      issuer: "Udemy (Dr. Angela Yu)",
      date: "2025",
      link: "https://www.udemy.com/certificate/UC-21e0129e-be9a-48aa-a4d0-5db42fa53c0a/",
    },
    {
      name: "100 Days of Code™: The Complete Python Pro Bootcamp",
      issuer: "Udemy (Dr. Angela Yu)",
      date: "2024",
      link: "https://www.udemy.com/certificate/UC-a7425637-c8a8-4839-b725-ae08543fd1e1/",
    },
  ],
};

export const commandOutputs = {
  help: `Available commands:\nabout - Display info about me\nskills - Show my technical skills\nprojects - List my projects\ncontact - Get my contact info\nexperience - View my work history\nwhoami - Display current user\ntheme - Toggle theme\nsound - Toggle background hum\nclear - Clear the terminal\nhelp - Show this help message`,
  whoami: `guest`,
  notFound: (cmd) => `Command not found: ${cmd}\nType 'help' for a list of available commands.`,
};

export const generateAbout = (data) => `Name: ${data.name}\nRole: ${data.title}\nLocation: ${data.location}\n\n${data.about}`;

export const generateSkills = (data) => {
  const formatList = (items = []) => items.map(item => `- ${item}`).join('\n');
  return `Languages:\n${formatList(data.skills.languages)}\n\nFrontend:\n${formatList(data.skills.frontend)}\n\nBackend:\n${formatList(data.skills.backend)}\n\nDatabases:\n${formatList(data.skills.databases)}\n\nTools & Platforms:\n${formatList(data.skills.tools)}`;
};

export const generateProjects = (data) => {
  const projectList = data.projects.map((p, i) => `${i + 1}. ${p.name}\n  ${p.description}\n  Tech: ${p.tech.join(', ')}${p.link ? `\n  Link: ${p.link}` : ''}`).join('\n\n');
  return `My Projects:\n\n${projectList}`;
};

export const generateContact = (data) => `Contact Information:\nEmail: ${data.email}\nGitHub: ${data.github}\nLinkedIn: ${data.linkedin}\nLocation: ${data.location}`;

export const generateExperience = (data) => {
  const expList = data.experience.map(e => `${e.role} @ ${e.company}\n${e.period}\n${e.description}`).join('\n\n');
  return `Work Experience:\n\n${expList}`;
};

