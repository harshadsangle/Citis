export interface GlobalCertification {
  slug: string;
  name: string;
  provider: string;
  category: string;
  tagline: string;
  overview: string;
  skills: string[];
  benefits: string[];
  careerRelevance: string;
  suitableFor: string;
}

export const GLOBAL_CERTIFICATIONS: GlobalCertification[] = [
  {
    slug: "adobe",
    name: "Adobe Certified Professional",
    provider: "Adobe · Certiport",
    category: "Professional certification",
    tagline: "Validate job-ready skills in Adobe Creative Cloud software.",
    overview:
      "Adobe Certified Professional is the industry-recognized certification that demonstrates mastery of Adobe Creative Cloud software and the must-have knowledge for digital media careers. Each exam is integrated with an Adobe application and designed by experts for an authentic assessment of job-ready skills.",
    skills: [
      "Product and Experience Design with AI Using Adobe Firefly",
      "Content Creation and Marketing Using Adobe Express",
      "Document Creation & Management Using Adobe Acrobat Pro",
      "Visual Design Using Adobe Photoshop",
      "Graphic Design & Illustration Using Adobe Illustrator",
      "Print & Digital Media Publication Using Adobe InDesign",
      "Visual Effects & Motion Graphics Using Adobe After Effects",
      "Digital Video Using Adobe Premiere",
      "Multiplatform Animation Using Adobe Animate",
      "Web Authoring Using Adobe Dreamweaver",
    ],
    benefits: [
      "150 hours of hands-on Adobe app experience and instruction recommended before the exam.",
      "Live-in-the-app exams available online through OnVUE or in person at a Certiport Authorized Testing Center.",
      "Exams available in 12 languages, with objective domains and product releases published by Adobe and Certiport.",
      "A corresponding digital badge is issued through Credly after earning the certification, with verifiable credential data.",
    ],
    careerRelevance:
      "Professional Certifications are industry-recognized certifications demonstrating mastery of Adobe Creative Cloud software. They provide a clear, trusted signal for digital media careers across design, marketing, publishing, video, web and content production.",
    suitableFor: "Professionals, job seekers and students",
  },
  {
    slug: "apple",
    name: "Apple",
    provider: "Apple app development pathway",
    category: "App development",
    tagline: "Learn to turn an idea into a thoughtful app experience.",
    overview:
      "The Apple pathway introduces learners to app design and development through Swift and the Apple development ecosystem. It combines programming fundamentals with user-focused thinking, testing and iteration.",
    skills: ["Swift programming foundations", "App interface design", "Problem-solving and debugging", "Testing and iterative development"],
    benefits: ["Understand the complete app-building journey", "Develop projects that demonstrate coding ability", "Practise structured thinking and debugging", "Connect software concepts with user needs"],
    careerRelevance:
      "These foundations support progression into iOS development, mobile product teams, software internships and further computer science study. The project-led approach also develops skills that transfer to other programming environments.",
    suitableFor: "Learners exploring coding, mobile apps and software product development",
  },
  {
    slug: "autodesk",
    name: "Autodesk",
    provider: "Autodesk Certified User pathway",
    category: "Design and engineering",
    tagline: "Bring ideas from sketches to accurate digital models.",
    overview:
      "The Autodesk pathway develops practical confidence with computer-aided design and digital modelling. Learners work from design intent to a well-organised model while learning the precision expected in professional workflows.",
    skills: ["CAD drawing and modelling", "Technical visualisation", "Design accuracy and documentation", "3D thinking and spatial reasoning"],
    benefits: ["Create demonstrable technical design work", "Strengthen precision and design communication", "Gain exposure to professional CAD workflows", "Prepare for further design and engineering study"],
    careerRelevance:
      "Autodesk capability can support entry-level opportunities in architecture, engineering, manufacturing, construction, product design and 3D visualisation. It is especially valuable when paired with a project portfolio.",
    suitableFor: "Students, makers and learners considering design, engineering or architecture",
  },
  {
    slug: "cisco",
    name: "Cisco",
    provider: "Cisco networking and cyber skills pathway",
    category: "Networking and cybersecurity",
    tagline: "Build the foundations for connected, secure digital systems.",
    overview:
      "The Cisco pathway introduces the way devices, networks and people connect. Learners develop a practical understanding of networking concepts and responsible security habits through scenarios and guided activities.",
    skills: ["Networking concepts", "IP addressing and connectivity", "Network troubleshooting", "Cybersecurity awareness"],
    benefits: ["Build a strong foundation for IT study", "Practise diagnosing common connectivity issues", "Understand how security protects systems and users", "Learn vocabulary used in technology teams"],
    careerRelevance:
      "Cisco-aligned foundations are relevant to network support, IT helpdesk, systems administration and cybersecurity entry pathways. They give learners a practical base for advanced networking credentials.",
    suitableFor: "Learners beginning a career in networking, IT support or cybersecurity",
  },
  {
    slug: "entrepreneurship",
    name: "Entrepreneurship",
    provider: "CITIS and EtrainIndia entrepreneurship pathway",
    category: "Innovation and enterprise",
    tagline: "Move from an opportunity to a tested, responsible solution.",
    overview:
      "The Entrepreneurship pathway helps learners understand how ideas become useful products, services or social initiatives. It focuses on discovering real needs, testing assumptions and communicating a clear value proposition.",
    skills: ["Opportunity discovery", "Customer and user research", "Business model thinking", "Pitching and collaborative problem-solving"],
    benefits: ["Build confidence turning ideas into action", "Learn from evidence instead of assumptions", "Create a practical venture or innovation project", "Develop communication and teamwork skills"],
    careerRelevance:
      "Entrepreneurial capability strengthens careers in startups, innovation teams, consulting, product management and family businesses. It is also valuable for professionals who need to improve processes and create new opportunities.",
    suitableFor: "Students, founders, innovators and professionals building new initiatives",
  },
  {
    slug: "ic3-digital-literacy",
    name: "IC3 Digital Literacy",
    provider: "IC3 Digital Literacy pathway",
    category: "Digital foundations",
    tagline: "Build the everyday digital confidence needed for study and work.",
    overview:
      "The IC3 Digital Literacy pathway establishes a practical baseline across computing, digital citizenship and common productivity workflows. It helps learners use technology safely, confidently and purposefully.",
    skills: ["Computing fundamentals", "Online living and digital citizenship", "Productivity software", "Information and device safety"],
    benefits: ["Close gaps in essential digital skills", "Work more confidently in online environments", "Develop safer technology habits", "Create a recognised foundation for further learning"],
    careerRelevance:
      "Digital literacy supports almost every modern role, from administration and education to retail, operations and customer service. It is a helpful first credential for learners entering higher education or the workplace.",
    suitableFor: "School and college learners, career starters and digital upskilling groups",
  },
  {
    slug: "information-technology-specialist",
    name: "Information Technology Specialist",
    provider: "Information Technology Specialist pathway",
    category: "Technology foundations",
    tagline: "Validate the technology skills behind modern digital work.",
    overview:
      "The Information Technology Specialist pathway lets learners focus on a practical technology domain while building confidence with the language and methods used by IT teams. It is designed as a clear bridge from learning to role exploration.",
    skills: ["Programming and computational thinking", "Databases and data concepts", "Web and software foundations", "IT troubleshooting and security awareness"],
    benefits: ["Explore different technology job families", "Turn classroom learning into practical evidence", "Build a focused starting point for advanced study", "Strengthen problem-solving and technical communication"],
    careerRelevance:
      "The pathway can support next steps toward junior development, technical support, data, web and systems roles. It also helps learners choose a specialisation with more clarity before investing in advanced training.",
    suitableFor: "Students and early-career learners exploring IT specialisations",
  },
  {
    slug: "intuit",
    name: "Intuit",
    provider: "Intuit financial technology pathway",
    category: "Business and finance",
    tagline: "Connect financial understanding with practical digital tools.",
    overview:
      "The Intuit pathway introduces the workflows behind small-business finance and accounting technology. Learners practise organising financial information, interpreting business activity and using digital tools with care.",
    skills: ["Bookkeeping fundamentals", "Financial record organisation", "Small-business workflows", "Accuracy and responsible data handling"],
    benefits: ["Understand the language of business finance", "Practise with technology-enabled workflows", "Build confidence supporting small organisations", "Develop accuracy, organisation and attention to detail"],
    careerRelevance:
      "These skills are relevant to bookkeeping, accounts support, small-business operations, finance administration and entrepreneurship. They also help non-finance professionals make better decisions with business information.",
    suitableFor: "Learners, entrepreneurs and professionals supporting business operations",
  },
  {
    slug: "meta",
    name: "Meta",
    provider: "Meta digital marketing pathway",
    category: "Digital marketing",
    tagline: "Plan digital campaigns that are useful, measurable and human.",
    overview:
      "The Meta pathway develops practical digital marketing capability across audience understanding, content planning and campaign measurement. Learners connect creative communication with responsible, data-informed decisions.",
    skills: ["Audience and channel planning", "Social media content", "Campaign fundamentals", "Performance measurement and optimisation"],
    benefits: ["Create a structured digital marketing plan", "Understand how campaigns reach different audiences", "Build useful portfolio evidence", "Balance creativity with measurement and ethics"],
    careerRelevance:
      "Meta-aligned skills support social media, performance marketing, content, communications and community roles. They are valuable for agencies, nonprofits, startups and any organisation building a digital presence.",
    suitableFor: "Aspiring marketers, creators, entrepreneurs and communications teams",
  },
  {
    slug: "microsoft",
    name: "Microsoft",
    provider: "Microsoft technology and productivity pathway",
    category: "Productivity and cloud",
    tagline: "Work smarter with tools used across modern organisations.",
    overview:
      "The Microsoft pathway helps learners turn everyday technology into productive, collaborative work. Depending on the track, learning can span productivity, data, cloud concepts and the digital habits employers expect.",
    skills: ["Productivity and collaboration", "Data organisation and analysis", "Cloud concepts", "Professional digital communication"],
    benefits: ["Improve day-to-day workplace readiness", "Build transferable digital workflows", "Learn to organise and communicate information clearly", "Create a base for further Microsoft credentials"],
    careerRelevance:
      "Microsoft skills appear across administration, education, operations, sales, data, IT and project teams. A focused pathway helps learners demonstrate practical capability from their first workplace experience.",
    suitableFor: "Students, professionals and teams improving workplace digital skills",
  },
  {
    slug: "project-management-institute",
    name: "Project Management Institute",
    provider: "Project Management Institute pathway",
    category: "Project leadership",
    tagline: "Learn the habits that turn plans into dependable outcomes.",
    overview:
      "The PMI pathway introduces the discipline of organising people, time, scope and risk around a shared outcome. Learners practise planning and communication in ways that apply across industries and project types.",
    skills: ["Project planning and delivery", "Stakeholder communication", "Risk and dependency awareness", "Team collaboration and accountability"],
    benefits: ["Bring structure to complex work", "Communicate progress with greater clarity", "Build leadership habits without needing a formal title", "Apply project thinking to academic and workplace goals"],
    careerRelevance:
      "Project skills support roles in technology, construction, education, operations, consulting and events. They are also a strong complement to technical or functional expertise as careers progress.",
    suitableFor: "Students, aspiring coordinators, team leads and working professionals",
  },
  {
    slug: "unity",
    name: "Unity",
    provider: "Unity real-time 3D pathway",
    category: "Interactive media",
    tagline: "Create immersive experiences through real-time 3D.",
    overview:
      "The Unity pathway introduces the creative and technical process behind interactive 3D experiences. Learners combine scene building, interaction logic and iteration to create projects that can be explored and shared.",
    skills: ["Real-time 3D concepts", "Scene and asset creation", "Interactive logic", "Testing and experience design"],
    benefits: ["Build an engaging interactive portfolio", "Connect creative and technical thinking", "Practise iterative design through projects", "Explore games, simulation and immersive learning"],
    careerRelevance:
      "Unity capability is relevant to games, simulation, visualisation, XR, training and interactive media. The underlying skills also transfer to software development, 3D design and experience prototyping.",
    suitableFor: "Creators, developers, designers and learners exploring immersive technology",
  },
];

export function getGlobalCertification(slug: string) {
  return GLOBAL_CERTIFICATIONS.find((certification) => certification.slug === slug);
}