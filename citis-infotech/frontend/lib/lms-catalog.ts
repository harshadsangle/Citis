export type LmsCourse = {
  id: string;
  title: string;
  description: string;
  audience: string;
  details: Array<{ label: string; value: string }>;
  objectiveAreas: Array<{ number: string; title: string; description: string }>;
};

export type LmsCourseCategory = {
  id: string;
  name: string;
  eyebrow: string;
  description: string;
  courses: LmsCourse[];
};

export type LmsCourseProvider = "adobe" | "autodesk" | "cisco" | "comptia" | "ic3" | "intuit" | "its" | "microsoft" | "unity";

export function normalizeLmsCourseProvider(value?: string): LmsCourseProvider | undefined {
  return value === "adobe" || value === "autodesk" || value === "cisco" || value === "comptia" || value === "ic3" || value === "intuit" || value === "its" || value === "microsoft" || value === "unity" ? value : undefined;
}

const ADOBE_COURSE_GROUPS: LmsCourseCategory[] = [
  {
    id: "adobe-document-creation-management",
    name: "Document Creation & Management",
    eyebrow: "Adobe Certified Professional",
    description: "Official objective-led preparation for document creation, management, editing, review, protection, and export.",
    courses: [
      {
        id: "acrobat-pro-document-creation-management",
        title: "Adobe Certified Professional in Document Creation and Management Using Adobe Acrobat Pro",
        description: "The official exam objectives cover the knowledge and applied skills needed to create, manage, edit, share, protect, standardize, and export documents in Acrobat Pro.",
        audience: "The target candidate has approximately 150 hours of instruction and hands-on experience with Acrobat Pro, and can apply routine document management procedures with limited assistance.",
        details: [
          { label: "Exam format", value: "50-minute exam" },
          { label: "Objective areas", value: "6 sections" },
          { label: "Credential", value: "Adobe Certified Professional" },
        ],
        objectiveAreas: [
          {
            number: "01",
            title: "Working in Document Management",
            description: "Purpose, audience needs, collaboration, legal considerations, and professional document design.",
          },
          {
            number: "02",
            title: "Acrobat Workspace",
            description: "Workspace organization, application preferences, rulers, navigation, viewing, and zoom.",
          },
          {
            number: "03",
            title: "Creating and Organizing PDFs",
            description: "Creating PDFs from appropriate sources, document settings, pages, and PDF portfolios.",
          },
          {
            number: "04",
            title: "Editing PDFs",
            description: "Text, assets, objects, links, bookmarks, and interactive forms.",
          },
          {
            number: "05",
            title: "Sharing and Reviewing PDFs",
            description: "Sharing, review, annotation, proofreading, and error-correction tools.",
          },
          {
            number: "06",
            title: "Protecting, Standardizing, and Exporting",
            description: "Accessibility, redaction, document security, export, compression, and printing.",
          },
        ],
      },
    ],
  },
  {
    id: "adobe-motion-graphics-visual-effects",
    name: "Motion Graphics & Visual Effects",
    eyebrow: "Adobe Certified Professional",
    description: "Official objective-led preparation for visual effects, animation, compositing, and motion graphics production.",
    courses: [
      {
        id: "after-effects-visual-effects-motion-graphics",
        title: "Adobe Certified Professional in Visual Effects and Motion Graphics Using Adobe After Effects 2021 (v 18.x)",
        description: "The official exam objectives cover the knowledge and applied skills needed to plan, set up, organize, create, modify, and publish visual effects and motion graphics projects in After Effects.",
        audience: "The target candidate has approximately 150 hours of instruction and hands-on experience with After Effects, and can apply video composition and motion graphics principles to routine production tasks with limited assistance.",
        details: [
          { label: "Objective areas", value: "5 sections" },
          { label: "Target experience", value: "Approximately 150 hours" },
          { label: "Credential", value: "Adobe Certified Professional" },
        ],
        objectiveAreas: [
          {
            number: "01",
            title: "Working in the Visual Effects and Motion Graphics Industry",
            description: "Audience, delivery, communication, intellectual property, digital media, animation, compositing, and design principles.",
          },
          {
            number: "02",
            title: "Project Setup and Interface",
            description: "Projects, compositions, workspaces, preferences, timeline tools, guides, grids, markers, and imported assets.",
          },
          {
            number: "03",
            title: "Organizing Projects",
            description: "Timeline layers, complex compositions, visibility, opacity, blending modes, track mattes, and masks.",
          },
          {
            number: "04",
            title: "Creating and Modifying Visual Elements",
            description: "Core tools, text, footage, transformations, video, effects, 3D space, composites, and keyframes.",
          },
          {
            number: "05",
            title: "Publishing Digital Media",
            description: "Composition checks, archiving, frame exports, composition exports, codecs, formats, and delivery targets.",
          },
        ],
      },
      {
        id: "animate-multiplatform-animation",
        title: "Adobe Certified Professional in Multiplatform Animation Using Adobe Animate 2021 (v 21.x)",
        description: "The official exam objectives cover the knowledge and applied skills needed to plan, set up, organize, create, modify, and publish multiplatform animation and interactive media projects in Animate.",
        audience: "The target candidate has approximately 150 hours of instruction and hands-on experience with Animate, and can apply animation and interactive-media principles to routine tasks with limited assistance.",
        details: [
          { label: "Objective areas", value: "5 sections" },
          { label: "Exam version", value: "2021 (v 21.x)" },
          { label: "Credential", value: "Adobe Certified Professional" },
        ],
        objectiveAreas: [
          {
            number: "01",
            title: "Working in the Animation Industry",
            description: "Audience needs, communication, copyright, animation terminology, interactive media, typography, design, and animation principles.",
          },
          {
            number: "02",
            title: "Project Setup and Interface",
            description: "Multimedia document settings, workspace, preferences, navigation, visual aids, imported assets, colors, swatches, gradients, and brushes.",
          },
          {
            number: "03",
            title: "Organization of Documents",
            description: "Timeline layers, document structure, content over time, transparency, and masks.",
          },
          {
            number: "04",
            title: "Create and Modify Multimedia Elements",
            description: "Vector tools, typography, selections, graphics, media, effects, styles, animation, interactivity, audio, and video.",
          },
          {
            number: "05",
            title: "Publishing Digital Media",
            description: "Project checks, native Animate files, asset exports, and platform-specific publishing settings.",
          },
        ],
      },
    ],
  },
  {
    id: "adobe-design-publication",
    name: "Design & Publication",
    eyebrow: "Adobe Certified Professional",
    description: "Official objective-led preparation for graphic design, illustration, and print and digital media publication.",
    courses: [
      {
        id: "indesign-print-digital-media-publication",
        title: "Adobe Certified Professional in Print & Digital Media Publication Using Adobe InDesign 2021 (v 16.x)",
        description: "The official exam objectives cover the knowledge and applied skills needed to plan, create, organize, modify, and publish print and digital media publications in InDesign.",
        audience: "The target candidate has approximately 150 hours of instruction and hands-on experience with InDesign, and can apply publication design and production principles to routine tasks with limited assistance.",
        details: [
          { label: "Objective areas", value: "5 sections" },
          { label: "Target experience", value: "Approximately 150 hours" },
          { label: "Credential", value: "Adobe Certified Professional" },
        ],
        objectiveAreas: [
          {
            number: "01",
            title: "Working in the Design Industry",
            description: "Purpose, audience needs, collaboration, copyright, publication terminology, and design principles.",
          },
          {
            number: "02",
            title: "Project Setup and Interface",
            description: "Document settings, workspace, non-printing tools, assets, colors, swatches, gradients, and styles.",
          },
          {
            number: "03",
            title: "Organizing Documents",
            description: "Layers, pages, spreads, alternate layouts, and master pages.",
          },
          {
            number: "04",
            title: "Creating and Modifying Document Elements",
            description: "Frames, typography, selections, graphics, effects, interactive content, and tables.",
          },
          {
            number: "05",
            title: "Publishing Documents",
            description: "Preparing and exporting publications for web, print, and other digital devices.",
          },
        ],
      },
      {
        id: "illustrator-graphic-design-illustration",
        title: "Adobe Certified Professional in Graphic Design and Illustration Using Adobe Illustrator",
        description: "The official exam objectives cover the knowledge and applied skills needed to plan, create, organize, modify, and publish graphic designs and illustrations in Illustrator.",
        audience: "The target candidate has approximately 150 hours of instruction and hands-on experience with Illustrator, and can apply graphic design and illustration principles to routine tasks with limited assistance.",
        details: [
          { label: "Objective areas", value: "5 sections" },
          { label: "Exam versions", value: "2022 (26.x) and 2023 (27.x)" },
          { label: "Credential", value: "Adobe Certified Professional" },
        ],
        objectiveAreas: [
          {
            number: "01",
            title: "Working in the Design Industry",
            description: "Purpose, audience needs, collaboration, copyright, digital-graphics terminology, and design principles.",
          },
          {
            number: "02",
            title: "Project Setup and Interface",
            description: "Document settings, workspace, non-printing tools, assets, colors, swatches, brushes, symbols, styles, and patterns.",
          },
          {
            number: "03",
            title: "Organizing Documents",
            description: "Layers, opacity, and masks for managing visual elements.",
          },
          {
            number: "04",
            title: "Creating and Modifying Visual Elements",
            description: "Core tools, typography, selections, transformations, reconstruction, editing, effects, and graphic styles.",
          },
          {
            number: "05",
            title: "Publishing Digital Media",
            description: "Preparing and exporting digital images for web, print, video, and other formats.",
          },
        ],
      },
      {
        id: "photoshop-visual-design",
        title: "Adobe Certified Professional in Visual Design Using Adobe Photoshop",
        description: "The official exam objectives cover the knowledge and applied skills needed to plan, set up, organize, create, modify, and publish visual designs and digital images in Photoshop.",
        audience: "The target candidate has approximately 150 hours of instruction and hands-on experience with Photoshop, and can apply graphic design and image-editing principles to routine tasks with limited assistance.",
        details: [
          { label: "Objective areas", value: "5 sections" },
          { label: "Exam versions", value: "2022 (23.x) and 2023 (24.x)" },
          { label: "Credential", value: "Adobe Certified Professional" },
        ],
        objectiveAreas: [
          {
            number: "01",
            title: "Working in the Design Industry",
            description: "Purpose, audience needs, collaboration, copyright, digital-image terminology, color, typography, composition, and design principles.",
          },
          {
            number: "02",
            title: "Project Setup and Interface",
            description: "Document settings, workspace, preferences, non-printing tools, imported assets, Camera Raw, colors, swatches, gradients, brushes, styles, and patterns.",
          },
          {
            number: "03",
            title: "Organizing Documents",
            description: "Layer management, visibility, opacity, blending modes, masks, and destructive or nondestructive editing.",
          },
          {
            number: "04",
            title: "Creating and Modifying Visual Elements",
            description: "Raster and vector tools, typography, selections, transformations, retouching, reconstruction, exposure, saturation, filters, and layer styles.",
          },
          {
            number: "05",
            title: "Publishing Digital Media",
            description: "Image checks and exports for web, print, video, native PSD files, and other appropriate formats.",
          },
        ],
      },
    ],
  },
  {
    id: "adobe-content-web-marketing",
    name: "Content, Web & Marketing",
    eyebrow: "Adobe Certified Professional",
    description: "Official objective-led preparation for content creation, digital marketing, web authoring, and publishing.",
    courses: [
      {
        id: "express-content-creation-marketing",
        title: "Adobe Certified Professional in Content Creation and Marketing Using Adobe Express",
        description: "The official exam objectives cover the knowledge and applied skills needed to plan, create, manage, share, and publish content and marketing materials in Adobe Express.",
        audience: "The target candidate is a professional or student with approximately 150 hours of instruction and hands-on experience using Adobe Express for content creation, communication, and digital marketing.",
        details: [
          { label: "Objective areas", value: "5 sections" },
          { label: "Exam format", value: "50-minute exam" },
          { label: "Credential", value: "Adobe Certified Professional" },
        ],
        objectiveAreas: [
          {
            number: "01",
            title: "Digital Marketing Principles",
            description: "Promotion, target marketing, branding, content strategy, optimization, distribution, and social media promotion.",
          },
          {
            number: "02",
            title: "Design Principles",
            description: "Visual design, design processes, accessibility, and ethical asset use.",
          },
          {
            number: "03",
            title: "Content Creation and Modification",
            description: "Graphics, publications, video, audio, animation, webpages, text, templates, files, and audience reach.",
          },
          {
            number: "04",
            title: "Content Management",
            description: "Asset libraries, file organization, templates, and multi-platform content.",
          },
          {
            number: "05",
            title: "Sharing and Publishing",
            description: "Collaboration, publishing, scheduling, and exporting content in appropriate formats.",
          },
        ],
      },
      {
        id: "dreamweaver-web-authoring",
        title: "Adobe Certified Professional in Web Authoring Using Adobe Dreamweaver 2021 (v 21.x)",
        description: "The official exam objectives cover the knowledge and applied skills needed to plan, set up, organize, code, modify, and publish websites in Dreamweaver.",
        audience: "The target candidate has approximately 150 hours of instruction and hands-on experience with Dreamweaver, and can apply web design and development principles to routine tasks with limited assistance.",
        details: [
          { label: "Objective areas", value: "5 sections" },
          { label: "Target experience", value: "Approximately 150 hours" },
          { label: "Credential", value: "Adobe Certified Professional" },
        ],
        objectiveAreas: [
          {
            number: "01",
            title: "Working in the Web Industry",
            description: "Purpose, audience needs, collaboration, permissions, web technologies, and design principles.",
          },
          {
            number: "02",
            title: "Project Setup and Interface",
            description: "Sites, workspace, non-visible workflow tools, and project assets.",
          },
          {
            number: "03",
            title: "Organizing Content on a Page",
            description: "Page structure, responsive design, adaptive design, and multi-device layouts.",
          },
          {
            number: "04",
            title: "Working with Code to Create and Modify Content",
            description: "HTML, tables, semantic elements, CSS, forms, and JavaScript interactivity.",
          },
          {
            number: "05",
            title: "Publishing Digital Media",
            description: "Testing, publishing preparation, saving pages, and publishing a live website.",
          },
        ],
      },
    ],
  },
];

const makeComptiaCourse = (config: {
  id: string;
  title: string;
  examCode: string;
  description: string;
  domains: string[];
}): LmsCourse => ({
  id: config.id,
  title: config.title,
  description: config.description,
  audience: "The target candidate is preparing for the named CompTIA certification and will use the official objective domains as a structured study path.",
  details: [
    { label: "Exam code", value: config.examCode },
    { label: "Objective areas", value: `${config.domains.length} domains` },
    { label: "Credential", value: "CompTIA certification" },
  ],
  objectiveAreas: config.domains.map((domain, index) => ({
    number: String(index + 1).padStart(2, "0"),
    title: domain.replace(/^\d+\.\d+\s+/, ""),
    description: `Official ${domain.replace(/^\d+\.\d+\s+/, "").toLowerCase()} exam objectives.`,
  })),
});

const COMPTIA_COURSES: LmsCourse[] = [
  makeComptiaCourse({
    id: "comptia-a-core-2-220-1102",
    title: "CompTIA A+ Core 2 (220-1102)",
    examCode: "220-1102",
    description: "Official objective-led preparation for operating systems, security, software troubleshooting, and operational procedures.",
    domains: ["1.0 Operating Systems", "2.0 Security", "3.0 Software Troubleshooting", "4.0 Operational Procedures"],
  }),
  makeComptiaCourse({
    id: "comptia-casp-cas-004",
    title: "CompTIA Advanced Security Practitioner (CASP+) (CAS-004)",
    examCode: "CAS-004",
    description: "Official objective-led preparation for enterprise security architecture, operations, engineering, cryptography, governance, risk, and compliance.",
    domains: ["1.0 Security Architecture", "2.0 Security Operations", "3.0 Security Engineering and Cryptography", "4.0 Governance, Risk, and Compliance"],
  }),
  makeComptiaCourse({
    id: "comptia-cloud-cv0-004",
    title: "CompTIA Cloud+ (CV0-004)",
    examCode: "CV0-004",
    description: "Official objective-led preparation for cloud architecture, deployment, operations, security, DevOps, and troubleshooting.",
    domains: ["1.0 Cloud Architecture", "2.0 Deployment", "3.0 Operations", "4.0 Security", "5.0 DevOps Fundamentals", "6.0 Troubleshooting"],
  }),
  makeComptiaCourse({
    id: "comptia-cloud-essentials-clo-002",
    title: "CompTIA Cloud Essentials+ (CLO-002)",
    examCode: "CLO-002",
    description: "Official objective-led preparation for cloud concepts, business principles, management, technical operations, governance, risk, compliance, and security.",
    domains: ["1.0 Cloud Concepts", "2.0 Business Principles of Cloud Environments", "3.0 Management and Technical Operations", "4.0 Governance, Risk, Compliance, and Security for the Cloud"],
  }),
  makeComptiaCourse({
    id: "comptia-cysa-cs0-003",
    title: "CompTIA Cybersecurity Analyst (CySA+) (CS0-003)",
    examCode: "CS0-003",
    description: "Official objective-led preparation for security operations, vulnerability management, incident response, reporting, and communication.",
    domains: ["1.0 Security Operations", "2.0 Vulnerability Management", "3.0 Incident Response and Management", "4.0 Reporting and Communication"],
  }),
  makeComptiaCourse({
    id: "comptia-data-da0-001",
    title: "CompTIA Data+ (DA0-001)",
    examCode: "DA0-001",
    description: "Official objective-led preparation for data concepts, mining, analysis, visualization, governance, quality, and controls.",
    domains: ["1.0 Data Concepts and Environments", "2.0 Data Mining", "3.0 Data Analysis", "4.0 Visualization", "5.0 Data Governance, Quality, and Controls"],
  }),
  makeComptiaCourse({
    id: "comptia-datasys-ds0-001",
    title: "CompTIA DataSys+ (DS0-001)",
    examCode: "DS0-001",
    description: "Official objective-led preparation for database fundamentals, deployment, management, maintenance, security, and business continuity.",
    domains: ["1.0 Database Fundamentals", "2.0 Database Deployment", "3.0 Database Management and Maintenance", "4.0 Data and Database Security", "5.0 Business Continuity"],
  }),
  makeComptiaCourse({
    id: "comptia-datax-dy0-001",
    title: "CompTIA DataX (DY0-001)",
    examCode: "DY0-001",
    description: "Official objective-led preparation for mathematics, statistics, modeling, analysis, machine learning, operations, and specialized data science applications.",
    domains: ["1.0 Mathematics and Statistics", "2.0 Modeling, Analysis, and Outcomes", "3.0 Machine Learning", "4.0 Operations and Processes", "5.0 Specialized Applications of Data Science"],
  }),
  makeComptiaCourse({
    id: "comptia-itf-fc0-u61",
    title: "CompTIA IT Fundamentals (ITF+) (FC0-U61)",
    examCode: "FC0-U61",
    description: "Official objective-led preparation for IT concepts, infrastructure, applications, software development, databases, and security.",
    domains: ["1.0 IT Concepts and Terminology", "2.0 Infrastructure", "3.0 Applications and Software", "4.0 Software Development", "5.0 Database Fundamentals", "6.0 Security"],
  }),
  makeComptiaCourse({
    id: "comptia-linux-xk0-005",
    title: "CompTIA Linux+ (XK0-005)",
    examCode: "XK0-005",
    description: "Official objective-led preparation for system management, security, scripting, containers, automation, and troubleshooting.",
    domains: ["1.0 System Management", "2.0 Security", "3.0 Scripting, Containers, and Automation", "4.0 Troubleshooting"],
  }),
  makeComptiaCourse({
    id: "comptia-network-n10-009",
    title: "CompTIA Network+ (N10-009)",
    examCode: "N10-009",
    description: "Official objective-led preparation for networking concepts, implementation, operations, security, and troubleshooting.",
    domains: ["1.0 Networking Concepts", "2.0 Network Implementation", "3.0 Network Operations", "4.0 Network Security", "5.0 Network Troubleshooting"],
  }),
  makeComptiaCourse({
    id: "comptia-pentest-pt0-002",
    title: "CompTIA PenTest+ (PT0-002)",
    examCode: "PT0-002",
    description: "Official objective-led preparation for planning, reconnaissance, vulnerability scanning, attacks, exploits, reporting, tools, and code analysis.",
    domains: ["1.0 Planning and Scoping", "2.0 Information Gathering and Vulnerability Scanning", "3.0 Attacks and Exploits", "4.0 Reporting and Communication", "5.0 Tools and Code Analysis"],
  }),
  makeComptiaCourse({
    id: "comptia-project-pk0-005",
    title: "CompTIA Project+ (PK0-005)",
    examCode: "PK0-005",
    description: "Official objective-led preparation for project management concepts, life cycle phases, tools, documentation, IT, and governance.",
    domains: ["1.0 Project Management Concepts", "2.0 Project Life Cycle Phases", "3.0 Tools and Documentation", "4.0 Basics of IT and Governance"],
  }),
  makeComptiaCourse({
    id: "comptia-security-sy0-601",
    title: "CompTIA Security+ (SY0-601)",
    examCode: "SY0-601",
    description: "Official objective-led preparation for threats, architecture, implementation, operations, incident response, governance, risk, and compliance.",
    domains: ["1.0 Threats, Attacks, and Vulnerabilities", "2.0 Architecture and Design", "3.0 Implementation", "4.0 Operations and Incident Response", "5.0 Governance, Risk, and Compliance"],
  }),
  makeComptiaCourse({
    id: "comptia-securityx-cas-005",
    title: "CompTIA SecurityX (CAS-005)",
    examCode: "CAS-005",
    description: "Official objective-led preparation for governance, risk, compliance, security architecture, engineering, and security operations.",
    domains: ["1.0 Governance, Risk and Compliance", "2.0 Security Architecture", "3.0 Security Engineering", "4.0 Security Operations"],
  }),
  makeComptiaCourse({
    id: "comptia-server-sk0-005",
    title: "CompTIA Server+ (SK0-005)",
    examCode: "SK0-005",
    description: "Official objective-led preparation for server hardware, administration, security, disaster recovery, and troubleshooting.",
    domains: ["1.0 Server Hardware Installation and Management", "2.0 Server Administration", "3.0 Security and Disaster Recovery", "4.0 Troubleshooting"],
  }),
  makeComptiaCourse({
    id: "comptia-tech-fc0-u71",
    title: "CompTIA Tech+ (FC0-U71)",
    examCode: "FC0-U71",
    description: "Official objective-led preparation for IT concepts, infrastructure, applications, software development, data, databases, and security.",
    domains: ["1.0 IT Concepts and Terminology", "2.0 Infrastructure", "3.0 Applications and Software", "4.0 Software Development Concepts", "5.0 Data and Database Fundamentals", "6.0 Security"],
  }),
];

const MICROSOFT_COURSES: LmsCourse[] = [
  {
    id: "mos-word-2016-77-725",
    title: "Microsoft Word (Office 2016) — Exam 77-725",
    description: "Official Microsoft Office Specialist objectives for creating, formatting, collaborating on, and communicating with professional Word documents in Office 2016.",
    audience: "The target candidate has approximately 150 hours of instruction and hands-on experience with Word 2016, and can complete document-creation tasks independently.",
    details: [
      { label: "Exam", value: "77-725" },
      { label: "Objective areas", value: "6 sections" },
      { label: "Credential", value: "Microsoft Office Specialist" },
    ],
    objectiveAreas: [
      { number: "01", title: "Create and Manage Documents", description: "Create documents, use templates, insert content, navigate, format, and customize document views." },
      { number: "02", title: "Navigate Through a Document", description: "Search for text, add hyperlinks and bookmarks, and move to specific document locations." },
      { number: "03", title: "Format a Document", description: "Apply themes, styles, page setup, headers, footers, and page-background elements." },
      { number: "04", title: "Customize Options and Views", description: "Configure Word options, views, zoom settings, the Quick Access Toolbar, and document properties." },
      { number: "05", title: "Manage Tables and Lists", description: "Create and modify tables, sort content, and build numbered or bulleted lists." },
      { number: "06", title: "Insert and Format Graphic Elements", description: "Insert and format shapes, pictures, SmartArt, screenshots, icons, and text boxes." },
    ],
  },
  {
    id: "mos-word-expert-2016-77-726",
    title: "Microsoft Word Expert (Office 2016) — Exam 77-726",
    description: "Official Microsoft Office Specialist objectives for advanced Word document management, review, formatting, custom elements, and productivity features in Office 2016.",
    audience: "The target candidate has approximately 150 hours of instruction and hands-on experience with Word 2016, and can independently create and manage specialized professional documents.",
    details: [
      { label: "Exam", value: "77-726" },
      { label: "Objective areas", value: "5 sections" },
      { label: "Credential", value: "Microsoft Office Specialist" },
    ],
    objectiveAreas: [
      { number: "01", title: "Manage Documents and Templates", description: "Modify templates, reuse custom styles and building blocks, manage versions, and compare documents." },
      { number: "02", title: "Prepare Documents for Review", description: "Track changes, manage comments, compare and combine documents, and protect reviewed content." },
      { number: "03", title: "Use Advanced Editing and Formatting", description: "Apply advanced find and replace, paragraph layout, styles, themes, and formatting controls." },
      { number: "04", title: "Create Custom Document Elements", description: "Build and manage custom styles, building blocks, fields, content controls, and forms." },
      { number: "05", title: "Use Advanced Word Features", description: "Manage references, mail merge, macros, master documents, and linked document content." },
    ],
  },
  {
    id: "mos-excel-2016-77-727",
    title: "Microsoft Excel (Office 2016) — Exam 77-727",
    description: "Official Microsoft Office Specialist objectives for creating, managing, formatting, analyzing, and visualizing worksheets and workbooks in Excel 2016.",
    audience: "The target candidate has approximately 150 hours of instruction and hands-on experience with Excel 2016, and can complete spreadsheet tasks independently.",
    details: [
      { label: "Exam", value: "77-727" },
      { label: "Objective areas", value: "7 sections" },
      { label: "Credential", value: "Microsoft Office Specialist" },
    ],
    objectiveAreas: [
      { number: "01", title: "Create Worksheets and Workbooks", description: "Create workbooks, import data, navigate worksheets, and customize workbook views." },
      { number: "02", title: "Navigate in Worksheets and Workbooks", description: "Find, move, and format worksheet content while managing rows, columns, and worksheet structure." },
      { number: "03", title: "Format Worksheets and Workbooks", description: "Apply cell formats, page setup, themes, styles, headers, footers, and print settings." },
      { number: "04", title: "Manage Data Cells and Ranges", description: "Insert, manipulate, format, sort, filter, and validate data cells and ranges." },
      { number: "05", title: "Create Tables", description: "Create, format, modify, and manage Excel tables and their data." },
      { number: "06", title: "Perform Operations with Formulas and Functions", description: "Create formulas, use references and functions, and summarize data with formulas." },
      { number: "07", title: "Create Charts and Objects", description: "Create, format, modify, and manage charts, illustrations, and other worksheet objects." },
    ],
  },
  {
    id: "mos-excel-expert-2016-77-728",
    title: "Microsoft Excel Expert (Office 2016) — Exam 77-728",
    description: "Official Microsoft Office Specialist objectives for advanced Excel workbook management, data analysis, formulas, charts, and PivotTables in Office 2016.",
    audience: "The target candidate has approximately 150 hours of instruction and hands-on experience with Excel 2016, and can complete advanced spreadsheet tasks independently.",
    details: [
      { label: "Exam", value: "77-728" },
      { label: "Objective areas", value: "4 sections" },
      { label: "Credential", value: "Microsoft Office Specialist" },
    ],
    objectiveAreas: [
      { number: "01", title: "Manage Workbook Options and Settings", description: "Manage workbooks, references, macros, versions, collaboration, protection, and calculation options." },
      { number: "02", title: "Apply Custom Data Formats and Layouts", description: "Apply custom formats, data validation, advanced conditional formatting, and filtering." },
      { number: "03", title: "Create Advanced Formulas and Macros", description: "Use logical, lookup, date, financial, array, and data-analysis functions and create simple macros." },
      { number: "04", title: "Create Advanced Charts and Tables", description: "Build advanced charts, PivotTables, PivotCharts, slicers, calculated fields, and grouped data." },
    ],
  },
  {
    id: "mos-powerpoint-2016-77-729",
    title: "Microsoft PowerPoint (Office 2016) — Exam 77-729",
    description: "Official Microsoft Office Specialist objectives for creating, formatting, presenting, and managing professional presentations in PowerPoint 2016.",
    audience: "The target candidate has approximately 150 hours of instruction and hands-on experience with PowerPoint 2016, and can complete presentation tasks independently.",
    details: [
      { label: "Exam", value: "77-729" },
      { label: "Objective areas", value: "6 sections" },
      { label: "Credential", value: "Microsoft Office Specialist" },
    ],
    objectiveAreas: [
      { number: "01", title: "Create and Manage Presentations", description: "Create presentations, use templates, apply presentation options, and manage multiple presentations." },
      { number: "02", title: "Insert and Format Slides", description: "Insert, duplicate, arrange, hide, delete, and apply layouts and backgrounds to slides." },
      { number: "03", title: "Modify Slides, Handouts, and Notes", description: "Customize slide masters, handouts, notes, headers, footers, and print settings." },
      { number: "04", title: "Insert and Format Text, Shapes, and Images", description: "Add and format text, shapes, pictures, SmartArt, screenshots, icons, and 3D elements." },
      { number: "05", title: "Insert Tables, Charts, SmartArt, and Media", description: "Create and format tables, charts, SmartArt, audio, video, and other presentation content." },
      { number: "06", title: "Apply Transitions and Animations", description: "Apply transitions, animations, timings, and presentation effects to slide content." },
    ],
  },
  {
    id: "mos-outlook-2016-77-731",
    title: "Microsoft Outlook (Office 2016) — Exam 77-731",
    description: "Official Microsoft Office Specialist objectives for professional email, correspondence, calendars, contacts, scheduling, and tasks in Outlook 2016.",
    audience: "The target candidate has approximately 150 hours of instruction and hands-on experience with Outlook 2016, and can complete communication and scheduling tasks independently.",
    details: [
      { label: "Exam", value: "77-731" },
      { label: "Objective areas", value: "5 sections" },
      { label: "Credential", value: "Microsoft Office Specialist" },
    ],
    objectiveAreas: [
      { number: "01", title: "Manage the Outlook Environment", description: "Customize settings, navigation, accounts, views, and message or calendar display options." },
      { number: "02", title: "Manage Messages", description: "Create, format, send, respond to, organize, search, and print email messages." },
      { number: "03", title: "Manage Contacts", description: "Create, edit, organize, search, and communicate with contacts and contact groups." },
      { number: "04", title: "Manage Calendars", description: "Create appointments and meetings, manage calendars, and schedule resources." },
      { number: "05", title: "Manage Tasks", description: "Create, assign, update, organize, and track tasks and follow-up activities." },
    ],
  },
  {
    id: "mos-word-2019-mo-100",
    title: "Microsoft Word (Office 2019) — Exam MO-100",
    description: "Official Microsoft Office Specialist objectives for managing documents, formatting content, tables, references, graphics, and collaboration in Word 2019.",
    audience: "The target candidate has approximately 150 hours of instruction and hands-on experience with Word 2019, and can complete professional document tasks independently.",
    details: [
      { label: "Exam", value: "MO-100" },
      { label: "Objective areas", value: "6 sections" },
      { label: "Credential", value: "Microsoft Office Specialist" },
    ],
    objectiveAreas: [
      { number: "01", title: "Manage Documents", description: "Navigate, format, save, share, inspect, and manage professional Word documents." },
      { number: "02", title: "Insert and Format Text, Paragraphs, and Sections", description: "Insert content, format text and paragraphs, and configure document sections." },
      { number: "03", title: "Manage Tables and Lists", description: "Create and modify tables, numbered lists, bulleted lists, and list levels." },
      { number: "04", title: "Create and Manage References", description: "Create footnotes, endnotes, tables of contents, citations, and bibliographies." },
      { number: "05", title: "Insert and Format Graphic Elements", description: "Insert, format, and manage shapes, pictures, icons, SmartArt, and text boxes." },
      { number: "06", title: "Manage Document Collaboration", description: "Manage comments, track changes, review documents, and control document access." },
    ],
  },
  {
    id: "mos-word-expert-2019-mo-101",
    title: "Microsoft Word Expert (Office 2019) — Exam MO-101",
    description: "Official Microsoft Office Specialist objectives for advanced Word editing, document options, custom elements, references, and productivity features in Office 2019.",
    audience: "The target candidate has approximately 150 hours of instruction and hands-on experience with Word 2019, and can independently create and manage specialized professional documents.",
    details: [
      { label: "Exam", value: "MO-101" },
      { label: "Objective areas", value: "4 sections" },
      { label: "Credential", value: "Microsoft Office Specialist" },
    ],
    objectiveAreas: [
      { number: "01", title: "Manage Document Options and Settings", description: "Manage documents and templates, collaboration, language options, and advanced application settings." },
      { number: "02", title: "Use Advanced Editing and Formatting Features", description: "Use advanced find and replace, paste options, paragraph layout, hyphenation, styles, and formatting." },
      { number: "03", title: "Create Custom Document Elements", description: "Create and manage building blocks, custom styles, fields, content controls, and forms." },
      { number: "04", title: "Use Advanced Word Features", description: "Manage references, mail merge, master documents, macros, and linked document content." },
    ],
  },
  {
    id: "mos-excel-2019-mo-200",
    title: "Microsoft Excel (Office 2019) — Exam MO-200",
    description: "Official Microsoft Office Specialist objectives for managing worksheets, data, tables, formulas, functions, and charts in Excel 2019.",
    audience: "The target candidate has approximately 150 hours of instruction and hands-on experience with Excel 2019, and can complete spreadsheet tasks independently.",
    details: [
      { label: "Exam", value: "MO-200" },
      { label: "Objective areas", value: "5 sections" },
      { label: "Credential", value: "Microsoft Office Specialist" },
    ],
    objectiveAreas: [
      { number: "01", title: "Manage Worksheets and Workbooks", description: "Import data, navigate workbooks, format worksheets, customize views, and prepare workbooks for sharing." },
      { number: "02", title: "Manage Data Cells and Ranges", description: "Manipulate, format, name, sort, filter, and validate worksheet cells and ranges." },
      { number: "03", title: "Manage Tables and Table Data", description: "Create, modify, format, sort, filter, and summarize Excel tables." },
      { number: "04", title: "Perform Operations Using Formulas and Functions", description: "Create formulas, use references and functions, and perform data calculations." },
      { number: "05", title: "Manage Charts", description: "Create, format, modify, and manage charts and chart elements." },
    ],
  },
  {
    id: "mos-excel-expert-2019-mo-201",
    title: "Microsoft Excel Expert (Office 2019) — Exam MO-201",
    description: "Official Microsoft Office Specialist objectives for advanced Excel workbook settings, data formats, formulas, macros, charts, and PivotTables in Office 2019.",
    audience: "The target candidate has approximately 150 hours of instruction and hands-on experience with Excel 2019, and can complete advanced spreadsheet tasks independently.",
    details: [
      { label: "Exam", value: "MO-201" },
      { label: "Objective areas", value: "4 sections" },
      { label: "Credential", value: "Microsoft Office Specialist" },
    ],
    objectiveAreas: [
      { number: "01", title: "Manage Workbook Options and Settings", description: "Manage workbooks, macros, collaboration, protection, versions, and formula calculation options." },
      { number: "02", title: "Manage and Format Data", description: "Apply custom formats, advanced conditional formatting, filtering, subtotals, and duplicate-data controls." },
      { number: "03", title: "Create Advanced Formulas and Macros", description: "Use logical, lookup, date, financial, dynamic-array, analysis, and error-checking tools and macros." },
      { number: "04", title: "Manage Advanced Charts and Tables", description: "Create advanced charts, PivotTables, slicers, calculated fields, and PivotCharts." },
    ],
  },
  {
    id: "mos-powerpoint-2019-mo-300",
    title: "Microsoft PowerPoint (Office 2019) — Exam MO-300",
    description: "Official Microsoft Office Specialist objectives for managing presentations, slides, content, media, transitions, animations, and presentation delivery in PowerPoint 2019.",
    audience: "The target candidate has approximately 150 hours of instruction and hands-on experience with PowerPoint 2019, and can complete presentation tasks independently.",
    details: [
      { label: "Exam", value: "MO-300" },
      { label: "Objective areas", value: "6 sections" },
      { label: "Credential", value: "Microsoft Office Specialist" },
    ],
    objectiveAreas: [
      { number: "01", title: "Manage Presentations", description: "Modify masters, options, views, print settings, slide shows, collaboration, and distribution settings." },
      { number: "02", title: "Manage Slides", description: "Insert, modify, order, group, hide, and arrange slides and layouts." },
      { number: "03", title: "Insert and Format Text, Shapes, and Images", description: "Create, format, align, group, and manage text, shapes, pictures, icons, and 3D models." },
      { number: "04", title: "Insert Tables, Charts, SmartArt, 3D Models, and Media", description: "Add and format structured data, diagrams, charts, models, audio, and video." },
      { number: "05", title: "Apply Transitions and Animations", description: "Apply transitions, animations, timings, and motion effects to presentation content." },
      { number: "06", title: "Manage Multiple Presentations", description: "Compare, combine, reuse, and present content across multiple presentation files." },
    ],
  },
  {
    id: "mos-outlook-2019-mo-400",
    title: "Microsoft Outlook (Office 2019) — Exam MO-400",
    description: "Official Microsoft Office Specialist objectives for Outlook settings, correspondence, contacts, calendars, meetings, scheduling, and tasks in Office 2019.",
    audience: "The target candidate has approximately 150 hours of instruction and hands-on experience with Outlook 2019, and can complete communication and scheduling tasks independently.",
    details: [
      { label: "Exam", value: "MO-400" },
      { label: "Objective areas", value: "5 sections" },
      { label: "Credential", value: "Microsoft Office Specialist" },
    ],
    objectiveAreas: [
      { number: "01", title: "Manage Outlook Settings and Processes", description: "Customize the interface, accounts, mail settings, search, printing, saving, and attachment workflows." },
      { number: "02", title: "Manage Messages", description: "Create, format, send, respond to, organize, and manage email content and attachments." },
      { number: "03", title: "Manage Schedules", description: "Create appointments and meetings, manage calendars, and schedule resources and attendees." },
      { number: "04", title: "Manage Contacts and Tasks", description: "Create and manage contacts, contact groups, tasks, flags, and follow-up activities." },
      { number: "05", title: "Manage Multiple Accounts", description: "Configure and work with multiple Outlook accounts and account-specific settings." },
    ],
  },
  {
    id: "mos-access-expert-2019-mo-500",
    title: "Microsoft Access Expert (Office 2019) — Exam MO-500",
    description: "Official Microsoft Office Specialist objectives for advanced Access database objects, data management, queries, forms, reports, and relationships in Office 2019.",
    audience: "The target candidate has approximately 150 hours of instruction and hands-on experience with Access 2019, and can complete advanced database tasks independently.",
    details: [
      { label: "Exam", value: "MO-500" },
      { label: "Objective areas", value: "5 sections" },
      { label: "Credential", value: "Microsoft Office Specialist" },
    ],
    objectiveAreas: [
      { number: "01", title: "Manage Database Objects", description: "Create, modify, organize, and manage tables, relationships, indexes, and database objects." },
      { number: "02", title: "Manage Data", description: "Import, export, validate, update, summarize, and maintain database data." },
      { number: "03", title: "Create Queries", description: "Create advanced select, action, parameter, crosstab, and SQL queries." },
      { number: "04", title: "Create Forms", description: "Create, format, configure, and manage advanced forms and controls." },
      { number: "05", title: "Create Reports", description: "Create, format, calculate, group, sort, and publish advanced reports." },
    ],
  },
  {
    id: "mos-word-microsoft-365-mo-110",
    title: "Word (Microsoft 365 Apps) — Exam MO-110",
    description: "Official Microsoft Office Specialist objectives for managing documents, formatting content, tables, references, graphics, and collaboration in Microsoft 365 Apps.",
    audience: "The target candidate has approximately 150 hours of instruction and hands-on experience with Word in Microsoft 365 Apps, and can complete professional document tasks independently.",
    details: [
      { label: "Exam", value: "MO-110" },
      { label: "Objective areas", value: "6 sections" },
      { label: "Credential", value: "Microsoft Office Specialist" },
    ],
    objectiveAreas: [
      { number: "01", title: "Manage Documents", description: "Navigate, format, save, share, inspect, and manage professional Word documents." },
      { number: "02", title: "Insert and Format Text, Paragraphs, and Sections", description: "Insert content, format text and paragraphs, and configure document sections." },
      { number: "03", title: "Manage Tables and Lists", description: "Create and modify tables, numbered lists, bulleted lists, and list levels." },
      { number: "04", title: "Create and Manage References", description: "Create footnotes, endnotes, tables of contents, citations, and bibliographies." },
      { number: "05", title: "Insert and Format Graphic Elements", description: "Insert, format, and manage shapes, pictures, icons, SmartArt, and text boxes." },
      { number: "06", title: "Manage Document Collaboration", description: "Manage comments, track changes, review documents, and control document access." },
    ],
  },
  {
    id: "mos-word-expert-microsoft-365-mo-111",
    title: "Word Expert (Microsoft 365 Apps) — Exam MO-111",
    description: "Official Microsoft Office Specialist objectives for advanced Word editing, document options, custom elements, references, and productivity features in Microsoft 365 Apps.",
    audience: "The target candidate has approximately 150 hours of instruction and hands-on experience with Word in Microsoft 365 Apps, and can independently create and manage specialized professional documents.",
    details: [
      { label: "Exam", value: "MO-111" },
      { label: "Objective areas", value: "4 sections" },
      { label: "Credential", value: "Microsoft Office Specialist" },
    ],
    objectiveAreas: [
      { number: "01", title: "Manage Document Options and Settings", description: "Manage documents and templates, collaboration, language options, and advanced application settings." },
      { number: "02", title: "Use Advanced Editing and Formatting Features", description: "Use advanced find and replace, paste options, paragraph layout, styles, and formatting." },
      { number: "03", title: "Create Custom Document Elements", description: "Create and manage building blocks, custom styles, fields, content controls, and forms." },
      { number: "04", title: "Use Advanced Word Features", description: "Manage references, mail merge, master documents, macros, and linked document content." },
    ],
  },
  {
    id: "mos-excel-microsoft-365-mo-210",
    title: "Excel (Microsoft 365 Apps) — Exam MO-210",
    description: "Official Microsoft Office Specialist objectives for managing worksheets, data, tables, formulas, functions, and charts in Microsoft 365 Apps.",
    audience: "The target candidate has approximately 150 hours of instruction and hands-on experience with Excel in Microsoft 365 Apps, and can complete spreadsheet tasks independently.",
    details: [
      { label: "Exam", value: "MO-210" },
      { label: "Objective areas", value: "5 sections" },
      { label: "Credential", value: "Microsoft Office Specialist" },
    ],
    objectiveAreas: [
      { number: "01", title: "Manage Worksheets and Workbooks", description: "Import data, navigate workbooks, format worksheets, customize views, and prepare workbooks for sharing." },
      { number: "02", title: "Manage Data Cells and Ranges", description: "Manipulate, format, name, sort, filter, and validate worksheet cells and ranges." },
      { number: "03", title: "Manage Tables and Table Data", description: "Create, modify, format, sort, filter, and summarize Excel tables." },
      { number: "04", title: "Perform Operations Using Formulas and Functions", description: "Create formulas, use references and functions, and perform data calculations." },
      { number: "05", title: "Manage Charts", description: "Create, format, modify, and manage charts and chart elements." },
    ],
  },
  {
    id: "mos-excel-expert-microsoft-365-mo-211",
    title: "Excel Expert (Microsoft 365 Apps) — Exam MO-211",
    description: "Official Microsoft Office Specialist objectives for advanced Excel workbook settings, data formats, formulas, macros, charts, and PivotTables in Microsoft 365 Apps.",
    audience: "The target candidate has approximately 150 hours of instruction and hands-on experience with Excel in Microsoft 365 Apps, and can complete advanced spreadsheet tasks independently.",
    details: [
      { label: "Exam", value: "MO-211" },
      { label: "Objective areas", value: "4 sections" },
      { label: "Credential", value: "Microsoft Office Specialist" },
    ],
    objectiveAreas: [
      { number: "01", title: "Manage Workbook Options and Settings", description: "Manage workbooks, macros, collaboration, protection, versions, and formula calculation options." },
      { number: "02", title: "Manage and Format Data", description: "Apply custom formats, advanced conditional formatting, filtering, subtotals, and duplicate-data controls." },
      { number: "03", title: "Create Advanced Formulas and Macros", description: "Use logical, lookup, date, financial, dynamic-array, analysis, and error-checking tools and macros." },
      { number: "04", title: "Manage Advanced Charts and Tables", description: "Create advanced charts, PivotTables, slicers, calculated fields, and PivotCharts." },
    ],
  },
  {
    id: "mos-powerpoint-microsoft-365-mo-310",
    title: "PowerPoint (Microsoft 365 Apps) — Exam MO-310",
    description: "Official Microsoft Office Specialist objectives for managing presentations, slides, content, media, transitions, animations, and delivery in Microsoft 365 Apps.",
    audience: "The target candidate has approximately 150 hours of instruction and hands-on experience with PowerPoint in Microsoft 365 Apps, and can complete presentation tasks independently.",
    details: [
      { label: "Exam", value: "MO-310" },
      { label: "Objective areas", value: "6 sections" },
      { label: "Credential", value: "Microsoft Office Specialist" },
    ],
    objectiveAreas: [
      { number: "01", title: "Manage Presentations", description: "Modify masters, options, views, print settings, slide shows, collaboration, and distribution settings." },
      { number: "02", title: "Manage Slides", description: "Insert, modify, order, group, hide, and arrange slides and layouts." },
      { number: "03", title: "Insert and Format Text, Shapes, and Images", description: "Create, format, align, group, and manage text, shapes, pictures, icons, and 3D models." },
      { number: "04", title: "Insert Tables, Charts, SmartArt, 3D Models, and Media", description: "Add and format structured data, diagrams, charts, models, audio, and video." },
      { number: "05", title: "Apply Transitions and Animations", description: "Apply transitions, animations, timings, and motion effects to presentation content." },
      { number: "06", title: "Manage Multiple Presentations", description: "Compare, combine, reuse, and present content across multiple presentation files." },
    ],
  },
];

const CISCO_COURSES: LmsCourse[] = [
  {
    id: "cisco-certified-support-technician-it-support",
    title: "Cisco Certified Support Technician IT Support",
    description: "Official Cisco Certified Support Technician IT Support objectives for entry-level help desk, desktop support, connectivity, operating system, application, security, and job-tool skills.",
    audience: "Entry-level help desk technicians, end user desktop support technicians, IT students, interns, and other candidates with at least 150 hours of instruction and hands-on experience.",
    details: [
      { label: "Objective areas", value: "6 sections" },
      { label: "Target experience", value: "At least 150 hours" },
      { label: "Credential", value: "Cisco Certified Support Technician IT Support" },
    ],
    objectiveAreas: [
      { number: "01", title: "IT Support Job Tasks and Responsibilities", description: "Help desk concepts, customer-interaction documentation, problem-solving processes, and the interpersonal practices used in IT support." },
      { number: "02", title: "Hardware Issues", description: "Safety procedures, device information, ports and cables, desktop components, drivers, e-waste, and commonly encountered hardware issues." },
      { number: "03", title: "Connectivity and Resource Access Issues", description: "Network-based resources, directory services, multifactor authentication, shared drives, peripheral connectivity, end-device network access, and connectivity commands." },
      { number: "04", title: "Operating System and Application Issues", description: "Windows, macOS, and mobile device issues; virtualization and cloud terminology; and common application installation and support issues." },
      { number: "05", title: "Common Threats and Preventions", description: "End-user security threats, basic investigation and escalation, social engineering, and company policies protecting confidential, proprietary, and personally identifiable information." },
      { number: "06", title: "Job Tools", description: "Remote access software and troubleshooting tools used to research issues and update internal documentation, including AI limitations, ethics, privacy, and security risks." },
    ],
  },
  {
    id: "cisco-certified-support-technician-networking",
    title: "Cisco Certified Support Technician Networking",
    description: "Official Cisco Certified Support Technician Networking objectives for foundational network operations, addressing, endpoints, infrastructure, troubleshooting, and security.",
    audience: "Foundational network technicians, networking students, interns, and IT or networking professionals with at least 150 hours of instruction and hands-on experience.",
    details: [
      { label: "Objective areas", value: "6 sections" },
      { label: "Target experience", value: "At least 150 hours" },
      { label: "Credential", value: "Cisco Certified Support Technician Networking" },
    ],
    objectiveAreas: [
      { number: "01", title: "Standards and Concepts", description: "TCP/IP and OSI models, frames and packets, addressing, bandwidth and throughput, network types and topologies, cloud and on-premises services, and common protocols." },
      { number: "02", title: "Addressing and Subnet Formats", description: "Private and public addresses, NAT, IPv4 addresses and subnet formats, subnet concepts, subnet masks, broadcast domains, IPv6 addresses, and prefix formats." },
      { number: "03", title: "Endpoints and Media Types", description: "LAN cables and connectors, Wi-Fi, cellular and wired technologies, endpoint devices, and network connectivity on Windows, Linux, macOS, Android, and Apple iOS." },
      { number: "04", title: "Infrastructure", description: "Cisco device status lights, network diagrams and cabling, network-device ports, basic routing concepts, and basic switching concepts." },
      { number: "05", title: "Diagnosing Problems", description: "Troubleshooting methodology, help desk practices, packet capture with Wireshark, diagnostic commands, and methods for accessing and collecting network-device data." },
      { number: "06", title: "Security", description: "Firewall traffic filtering, confidentiality, integrity and availability, authentication, authorization and accounting, multifactor authentication, encryption, threats, and basic wireless security." },
    ],
  },
  {
    id: "cisco-certified-support-technician-cybersecurity",
    title: "Cisco Certified Support Technician Cybersecurity",
    description: "Official Cisco Certified Support Technician Cybersecurity objectives for essential security principles, network and endpoint security, vulnerability and risk management, and incident handling.",
    audience: "Candidates beginning their cybersecurity journey with at least 150 hours of instruction and hands-on experience.",
    details: [
      { label: "Objective areas", value: "5 sections" },
      { label: "Target experience", value: "At least 150 hours" },
      { label: "Credential", value: "Cisco Certified Support Technician Cybersecurity" },
    ],
    objectiveAreas: [
      { number: "01", title: "Essential Security Principles", description: "Vulnerabilities, threats, exploits, risks, attack vectors, hardening, defense-in-depth, the CIA triad, attackers, ethics, access management, and encryption." },
      { number: "02", title: "Basic Network Security Concepts", description: "TCP/IP protocol vulnerabilities, network addresses, IPv4 and IPv6, MAC addresses, segmentation, CIDR, NAT, network security architecture, wireless security, ACLs, firewalls, VPNs, and NAC." },
      { number: "03", title: "Endpoint Security Concepts", description: "Operating system security, endpoint assessment tools, security policies and standards, software and hardware updates, system logs, and malware removal." },
      { number: "04", title: "Vulnerability Assessment and Risk Management", description: "Vulnerability identification and mitigation, reconnaissance, testing, threat intelligence, vulnerability databases, cybersecurity reporting, risk ranking, mitigation strategies, disaster recovery, and business continuity." },
      { number: "05", title: "Incident Handling", description: "Security-event monitoring and escalation, SIEM and SOAR, digital forensics, attack attribution, evidence handling, compliance frameworks, reporting, and the incident-response lifecycle." },
    ],
  },
];

const IC3_COURSES: LmsCourse[] = [
  {
    id: "ic3-spark",
    title: "IC3 Spark",
    description: "Official IC3 Spark objectives for younger learners covering Computing Fundamentals, Key Applications, and Living Online.",
    audience: "Younger learners and primary or middle school-aged students who are new to computers or the Internet.",
    details: [
      { label: "Exam format", value: "Single 50-minute exam" },
      { label: "Objective areas", value: "3 sections" },
      { label: "Credential", value: "IC3 Spark certification" },
    ],
    objectiveAreas: [
      { number: "01", title: "Computing Fundamentals", description: "Mobile devices, hardware devices, computer software architecture, backup and restore, file sharing, cloud computing, and security." },
      { number: "02", title: "Key Applications", description: "Common features, documents, spreadsheets, basic database concepts, presentations, application uses and platforms, and graphic modification." },
      { number: "03", title: "Living Online", description: "Internet concepts, common functionality, email clients, calendaring, social media, communications, online conferencing, streaming, and digital citizenship." },
    ],
  },
  {
    id: "ic3-digital-literacy-global-standard-6-level-1",
    title: "IC3 Digital Literacy Global Standard 6 — Level 1",
    description: "Official IC3 GS6 Level 1 exam objectives for foundational digital literacy, including technology basics, digital citizenship, information management, content creation, communication, collaboration, and safety and security.",
    audience: "Candidates building foundational digital literacy skills through the IC3 Digital Literacy Global Standard 6 pathway.",
    details: [
      { label: "Objective areas", value: "7 sections" },
      { label: "Certification path", value: "IC3 Digital Literacy GS6 Level 1" },
      { label: "Source", value: "Certiport exam domains" },
    ],
    objectiveAreas: [
      { number: "01", title: "Technology Basics", description: "Access and navigate between digital environments; identify digital devices and connections; and explain fundamental software, hardware, operating system, and networking concepts." },
      { number: "02", title: "Digital Citizenship", description: "Create and manage a digital identity, cultivate and protect a digital reputation, and respond to inappropriate digital behavior and content." },
      { number: "03", title: "Information Management", description: "Use and refine criteria for online searches, search within digital content, and understand copyright and licensing restrictions for digital content." },
      { number: "04", title: "Content Creation", description: "Create basic documents and presentations, use referencing and attribution, save and back up work, and understand fundamental printing concepts." },
      { number: "05", title: "Communication", description: "Express yourself through digital means and interact with others in a digital environment using appropriate, effective, and inclusive communication." },
      { number: "06", title: "Collaboration", description: "Identify digital collaboration concepts and digital etiquette standards for collaborative processes." },
      { number: "07", title: "Safety and Security", description: "Describe digital security threats, protect devices and digital content, understand data-collection technology, and identify health risks associated with digital technologies." },
    ],
  },
  {
    id: "ic3-digital-literacy-global-standard-6-level-2",
    title: "IC3 Digital Literacy Global Standard 6 — Level 2",
    description: "Official IC3 GS6 Level 2 exam objectives for developing digital literacy across technology basics, digital citizenship, information management, content creation, communication, collaboration, and safety and security.",
    audience: "Candidates developing intermediate digital literacy skills through the IC3 Digital Literacy Global Standard 6 pathway.",
    details: [
      { label: "Objective areas", value: "7 sections" },
      { label: "Certification path", value: "IC3 Digital Literacy GS6 Level 2" },
      { label: "Source", value: "Certiport exam domains" },
    ],
    objectiveAreas: [
      { number: "01", title: "Technology Basics", description: "Customize digital environments, use a personal digital calendar, define higher-level technology concepts, adjust hardware, understand core printer concepts, and identify digital devices and connections." },
      { number: "02", title: "Digital Citizenship", description: "Create and manage multiple digital identities, apply digital etiquette standards, and seek opportunities to increase digital competence." },
      { number: "03", title: "Information Management", description: "Determine digital information needs, assess the veracity of search results or digital artifacts, and manage online data collection, storage, and retrieval." },
      { number: "04", title: "Content Creation", description: "Create and edit digital content, manage digital information and files, responsibly repurpose digital resources, and publish or present content for a specific audience." },
      { number: "05", title: "Communication", description: "Interact with others in a digital environment and understand Internet commerce basics." },
      { number: "06", title: "Collaboration", description: "Use digital tools to collaborate on content creation and apply digital etiquette standards for collaborative processes." },
      { number: "07", title: "Safety and Security", description: "Avoid health risks and physical harm, avoid mental health threats, understand device security, and understand file security." },
    ],
  },
  {
    id: "ic3-digital-literacy-global-standard-6-level-3",
    title: "IC3 Digital Literacy Global Standard 6 — Level 3",
    description: "Official IC3 GS6 Level 3 exam objectives for advanced digital literacy, including evaluating technology, information search and sources, original media, visual data, accessibility, communication, collaboration, and security.",
    audience: "Candidates advancing digital literacy skills through the IC3 Digital Literacy Global Standard 6 pathway.",
    details: [
      { label: "Objective areas", value: "7 sections" },
      { label: "Certification path", value: "IC3 Digital Literacy GS6 Level 3" },
      { label: "Source", value: "Certiport exam domains" },
    ],
    objectiveAreas: [
      { number: "01", title: "Technology Basics", description: "Evaluate software and hardware devices, identify and resolve technical problems with assistance, and understand selected software concepts." },
      { number: "02", title: "Digital Citizenship", description: "Protect others’ personally identifiable information and explain best practices for digital citizenship." },
      { number: "03", title: "Information Management", description: "Construct an effective information search and evaluate digital information sources and multiple search results." },
      { number: "04", title: "Content Creation", description: "Create, edit, publish, and present original digital media; represent data visually; manage files; address accessibility; apply intellectual property standards; and manage a cyclical design process." },
      { number: "05", title: "Communication", description: "Manage interpersonal digital communications and communicate with others to identify and understand issues." },
      { number: "06", title: "Collaboration", description: "Collaborate with others to resolve issues and contribute constructively to project teams." },
      { number: "07", title: "Safety and Security", description: "Manage device security and understand the physical and environmental impact of digital tools and technologies." },
    ],
  },
];

const INTUIT_COURSES: LmsCourse[] = [
  {
    id: "intuit-certified-bookkeeping-professional",
    title: "Intuit Certified Bookkeeping Professional",
    description: "Official Intuit Certified Bookkeeping Professional objectives covering accounting basics, assets and sales transactions, liabilities and purchases, reconciliation, and financial statements.",
    audience: "Candidates preparing for the Intuit Certified Bookkeeping Professional certification.",
    details: [
      { label: "Objective areas", value: "4 sections" },
      { label: "Credential", value: "Intuit Certified Bookkeeping Professional" },
      { label: "Source", value: "Certiport exam objectives" },
    ],
    objectiveAreas: [
      { number: "01", title: "Accounting Basics", description: "Accounting measurement, bookkeeping ethics, the accounting equation, financial statements, double-entry accounting, the accounting cycle, adjusting entries, and accounting principles." },
      { number: "02", title: "Accounting for Assets and Sales Transactions", description: "Assets, natural account balances, current and long-term assets, sales, accounts receivable, cash receipts, merchandise inventory, inventory valuation, and depreciation." },
      { number: "03", title: "Accounting for Liabilities, Equity, and Purchase Transactions", description: "Liabilities, purchase transactions, accounts payable, cash payments, payroll, payroll tax forms, equity accounts, and the effects of transactions on the accounting equation." },
      { number: "04", title: "Reconciliation and Financial Statements", description: "Account reconciliation concepts, bank reconciliation preparation and reconciling items, balance sheets, comparative income statements, budgets, cost of goods sold, and revenue analysis." },
    ],
  },
  {
    id: "intuit-design-for-delight-innovator",
    title: "Intuit Design for Delight Innovator Certification",
    description: "Official Intuit Design for Delight Innovator objectives covering customer empathy, brainstorming and narrowing, rapid customer experiments, prototyping, and learning from test results.",
    audience: "Candidates preparing for the Intuit Design for Delight Innovator Certification.",
    details: [
      { label: "Objective areas", value: "4 sections" },
      { label: "Credential", value: "Intuit Design for Delight Innovator Certification" },
      { label: "Source", value: "Certiport exam objectives" },
    ],
    objectiveAreas: [
      { number: "01", title: "Design for Delight Concepts", description: "The Design for Delight mindset, Deep Customer Empathy, Go Broad to Go Narrow, Rapid Experiments with Customers, customer delight metrics, problem-solution-benefit relationships, looping, prototyping, and experimentation." },
      { number: "02", title: "Develop deep customer empathy", description: "Observing customer behavior, identifying customer challenges, summarizing learning, defining customer problem statements, and conceptualizing the ideal customer state." },
      { number: "03", title: "Brainstorm and narrow", description: "The purposes, methods, and best practices of brainstorming and narrowing, plus methods for making ideas into concrete solutions and representations." },
      { number: "04", title: "Perform rapid customer experiments", description: "Rapid experiment principles, assumptions, prioritizing customer behavior assumptions, leap of faith assumptions, hypotheses, internal prototypes, test evaluation, and next steps." },
    ],
  },
  {
    id: "intuit-quickbooks-online-certified-user",
    title: "Intuit QuickBooks Online Certified User",
    description: "Official Intuit QuickBooks Online Certified User objectives for QuickBooks Online Plus administration, sales and money in, vendors and money out, bank accounts, transaction rules, receipts, reports, and views.",
    audience: "An individual earning this certification has at least 150 hours of instruction or hands-on experience with the Intuit QuickBooks Online software.",
    details: [
      { label: "Objective areas", value: "5 sections" },
      { label: "Target experience", value: "At least 150 hours" },
      { label: "Credential", value: "Intuit QuickBooks Online Certified User" },
    ],
    objectiveAreas: [
      { number: "01", title: "Intuit QuickBooks Online Administration", description: "Set up and manage Intuit QuickBooks Online Plus, manage lists, recurring transactions, journal entries, and connections to apps." },
      { number: "02", title: "Sales and Money-In", description: "Set up customers, products, and services; manage sales settings; and record invoices, sales receipts, payments, undeposited funds, deposits, credit memos, and refund receipts." },
      { number: "03", title: "Vendors and Money-out", description: "Manage vendor records and expense settings, identify 1099 contractors, and record and manage bills, checks, credit cards, debit cards, vendor credits, refunds, and other money-out transactions." },
      { number: "04", title: "Bank Accounts, Transaction Rules, and Receipts", description: "Connect financial accounts, process bank-feed transactions, use bank rules, upload receipts, and record transactions from uploaded receipts." },
      { number: "05", title: "Basic Reports and Views", description: "Understand financial, money-in, and money-out reports; customize and deliver standard reports; and use the Audit Log and dashboards." },
    ],
  },
  {
    id: "intuit-personal-finance",
    title: "Intuit Personal Finance Certification",
    description: "Official Intuit Personal Finance objectives covering income, spending, saving, investing, managing credit, managing debt, insurance, identity fraud, and consumer protection.",
    audience: "Candidates preparing for the Intuit Personal Finance Certification.",
    details: [
      { label: "Objective areas", value: "6 sections" },
      { label: "Credential", value: "Intuit Personal Finance Certification" },
      { label: "Source", value: "Certiport exam objectives" },
    ],
    objectiveAreas: [
      { number: "01", title: "Earning income", description: "Pay stubs, gross and net income, taxes and withholdings, filing status, deductions, credits, tax forms, total compensation, payment methods, and earned versus unearned income." },
      { number: "02", title: "Spending", description: "Outside influences on spending, marketing and social pressures, time value of money, supply and demand, inflation, budgeting methods, expense types, and comparing major purchases." },
      { number: "03", title: "Saving", description: "Short-term and long-term financial goals, the Pay Yourself First principle, SMART goals, consumer banking, insured deposits, debit and credit cards, and account types." },
      { number: "04", title: "Investing", description: "The relationship between risk and return, financial risk tolerance, diversification, investment types, investment costs and income, and the Rule of 72." },
      { number: "05", title: "Managing Credit", description: "Secured and unsecured loans, installment and revolving loans, alternative lending, funding documentation, credit scores, APR, debt types, credit reports, and debt management methods." },
      { number: "06", title: "Managing Risk", description: "Auto, health, life, home, renters, disability, and accidental-death insurance; insurance costs and risk factors; identity fraud; and consumer protection resources." },
    ],
  },
];

const UNITY_COURSES: LmsCourse[] = [
  {
    id: "unity-certified-user-artist",
    title: "Unity Certified User Artist",
    description: "Official Unity Certified User Artist objectives for 2D and 3D digital artistry, asset workflows, scene design, lighting, cameras, materials, and rendering.",
    audience: "The target candidate has at least 150 hours of Unity software use and training, and can create interactive 2D and 3D experiences with limited assistance.",
    details: [
      { label: "Target experience", value: "At least 150 hours" },
      { label: "Objective areas", value: "3 sections" },
      { label: "Credential", value: "Unity Certified User" },
    ],
    objectiveAreas: [
      { number: "01", title: "Asset Management", description: "Import FBX and OBJ assets, configure Asset Store content, slice spritesheets, identify mesh components, animate keyframes, and use Prefabs." },
      { number: "02", title: "Scene Content Design", description: "Use Transform tools, prototype with primitives and low-poly meshes, and create landscapes with the Terrain tool and materials." },
      { number: "03", title: "Lighting, Cameras, and Materials Implementation", description: "Configure Standard Shader materials, lighting, cameras, and the appropriate rendering pipeline." },
    ],
  },
  {
    id: "unity-certified-user-programmer",
    title: "Unity Certified User Programmer",
    description: "Official Unity Certified User Programmer objectives for C# programming, debugging, API interpretation, code evaluation, Unity interface navigation, and Animator state machines.",
    audience: "The target candidate has at least 150 hours of Unity software use and training, and can use foundational C# and Unity programming concepts independently.",
    details: [
      { label: "Target experience", value: "At least 150 hours" },
      { label: "Objective areas", value: "4 sections" },
      { label: "Credential", value: "Unity Certified User" },
    ],
    objectiveAreas: [
      { number: "01", title: "Debugging, Problem-Solving, and Interpreting the API", description: "Interpret debug logs, diagnose null objects, and select appropriate Unity API methods, properties, arguments, and syntax." },
      { number: "02", title: "Creating Code", description: "Initialize variables, use data collections, construct functions, handle input, apply flow control, and respond to UI changes." },
      { number: "03", title: "Evaluating Code", description: "Evaluate event functions, data types, access modifiers, ECS classes, naming conventions, and code comments." },
      { number: "04", title: "Navigating the Interface", description: "Use Unity IDE windows, change the scripting IDE, and create functional Animator state machines." },
    ],
  },
  {
    id: "unity-certified-user-vr-developer",
    title: "Unity Certified User VR Developer",
    description: "Official Unity Certified User VR Developer objectives for creating VR scenes, world-space UX, interaction, locomotion, C# scripting, troubleshooting, playtesting, and optimization.",
    audience: "The target candidate has at least 150 hours of Unity software use and training; familiarity with C# and VR software and hardware is helpful for this certification path.",
    details: [
      { label: "Target experience", value: "At least 150 hours" },
      { label: "Objective areas", value: "5 sections" },
      { label: "Credential", value: "Unity Certified User" },
    ],
    objectiveAreas: [
      { number: "01", title: "Basic Unity Concepts for VR Development", description: "Understand stereoscopic vision, XR differences, tracking, VR input, packages, Prefabs, Transform, workspace windows, and Inspector components." },
      { number: "02", title: "Building a Scene for VR", description: "Apply VR preplanning, environment design with finalized 3D assets, and Baked versus Realtime lighting." },
      { number: "03", title: "UX Implementation for VR", description: "Build world-space UI, physical object interactions, locomotion, health and safety interactions, and 2D or spatial audio." },
      { number: "04", title: "Scripting with Unity", description: "Select C# code and Unity classes for VR goals and handle collision and trigger events." },
      { number: "05", title: "Troubleshooting and Playtesting", description: "Troubleshoot scene and physics settings, interpret Console logs and errors, and optimize VR scenes." },
    ],
  },
];

function itsCourse(id: string, title: string, modules: string[], description: string): LmsCourse {
  return {
    id,
    title,
    description,
    audience: "Learners preparing for a Certiport IT Specialist exam with approximately 150 hours of instruction or hands-on experience.",
    details: [
      { label: "Objective areas", value: `${modules.length} sections` },
      { label: "Target experience", value: "Approximately 150 hours" },
      { label: "Credential", value: "IT Specialist" },
    ],
    objectiveAreas: modules.map((module, index) => ({
      number: String(index + 1).padStart(2, "0"),
      title: module,
      description: `Official IT Specialist objective area: ${module}.`,
    })),
  };
}

const ITS_COURSES: LmsCourse[] = [
  itsCourse("its-network-security", "IT Specialist Network Security", ["Defense in Depth", "Operating System Security", "Network Device Security", "Secure Computing"], "Objective-led preparation for the Certiport IT Specialist Network Security exam."),
  itsCourse("its-device-configuration-management", "IT Specialist Device Configuration and Management", ["Windows Installation and Configuration", "Windows Feature, Application and Peripheral", "Data Access and Management", "Device Security", "Windows Management and Troubleshooting"], "Objective-led preparation for the Certiport IT Specialist Device Configuration and Management exam."),
  itsCourse("its-cloud-computing", "IT Specialist Cloud Computing", ["Cloud Concepts", "Developing cloud architecture", "Implementing the cloud development life cycle", "Deploy the application", "Understanding cloud governance"], "Objective-led preparation for the Certiport IT Specialist Cloud Computing exam."),
  itsCourse("its-cybersecurity", "IT Specialist Cybersecurity", ["Security Principles", "Securing the Network", "Securing Endpoint Devices", "Vulnerability Assessment and Risk Management", "Incident Handling"], "Objective-led preparation for the Certiport IT Specialist Cybersecurity exam."),
  itsCourse("its-databases", "IT Specialist Databases", ["Database Design", "Database Object Management using DDL", "Data Retrieval", "Data Manipulation using DML", "Troubleshooting"], "Objective-led preparation for the Certiport IT Specialist Databases exam."),
  itsCourse("its-data-analytics", "IT Specialist Data Analytics", ["Data Basics", "Data Manipulation", "Data Analysis", "Data Visualization and Communication", "Responsible Analytics Practices"], "Objective-led preparation for the Certiport IT Specialist Data Analytics exam."),
  itsCourse("its-html-and-css", "IT Specialist HTML and CSS", ["HTML Fundamentals", "CSS Fundamentals", "Document Structure using HTML", "Multimedia Presentation using HTML", "Webpage Styling using CSS", "Accessibility, Readability, and Testing"], "Objective-led preparation for the Certiport IT Specialist HTML and CSS exam."),
  itsCourse("its-javascript", "IT Specialist JavaScript", ["JavaScript Operators, Methods, and Keywords", "Variables, Data Types, and Functions", "Decisions and Loops", "Document Object Model", "HTML Forms"], "Objective-led preparation for the Certiport IT Specialist JavaScript exam."),
  itsCourse("its-python", "IT Specialist Python", ["Operations using Data Types and Operators", "Flow Control with Decisions and Loops", "Input and Output Operations", "Code Documentation and Structure", "Troubleshooting and Error Handling", "Operations using Modules and Tools"], "Objective-led preparation for the Certiport IT Specialist Python exam."),
  itsCourse("its-java", "IT Specialist Java", ["Java Fundamentals", "Data Types, Variables, and Expressions", "Flow Control Implementation", "Object-Oriented Programming", "Code Compilation and Debugging"], "Objective-led preparation for the Certiport IT Specialist Java exam."),
  itsCourse("its-software-development", "IT Specialist Software Development", ["Core Programming Concepts", "Software Development Principles", "Object-Oriented Programming", "Web Applications", "Databases"], "Objective-led preparation for the Certiport IT Specialist Software Development exam."),
  itsCourse("its-html5-application-development", "IT Specialist HTML5 Application Development", ["Application Lifecycle Management", "Graphics and Animation", "Forms", "Layouts", "JavaScript Coding"], "Objective-led preparation for the Certiport IT Specialist HTML5 Application Development exam."),
  itsCourse("its-computational-thinking", "IT Specialist Computational Thinking", ["Foundational Concepts", "Identify and Collect Data", "Apply Abstraction", "Specify a Solution", "Automate a Solution", "Present and Improve a Solution"], "Objective-led preparation for the Certiport IT Specialist Computational Thinking exam."),
  itsCourse("its-networking", "IT Specialist Networking", ["Networking Fundamentals", "Network Infrastructures", "Network Hardware", "Protocols and Services", "Troubleshooting"], "Objective-led preparation for the Certiport IT Specialist Networking exam."),
];

export const LMS_COURSE_CATEGORIES: LmsCourseCategory[] = [
  {
    id: "adobe",
    name: "Adobe",
    eyebrow: "Adobe certification courses",
    description: "Official objective-led preparation across Adobe document creation, motion graphics, design, publication, content, web, and marketing applications.",
    courses: ADOBE_COURSE_GROUPS.flatMap((category) => category.courses),
  },
  {
    id: "autodesk",
    name: "Autodesk",
    eyebrow: "Autodesk Certified User courses",
    description: "Official objective-led preparation across Autodesk CAD, architecture, product design, 3D modeling, animation, and rendering applications.",
    courses: [
      {
        id: "autocad-certified-user",
        title: "Autodesk Certified User in AutoCAD",
        description: "The official Autodesk AutoCAD Certified User objectives cover computer-aided design, drafting, drawing, editing, annotation, layouts, and printing.",
        audience: "The target candidate is a qualified student, intern, or entry-level user with at least 150 hours of instruction and/or hands-on experience using AutoCAD.",
        details: [
          { label: "Objective areas", value: "5 sections" },
          { label: "Target experience", value: "Approximately 150 hours" },
          { label: "Credential", value: "Autodesk Certified User" },
        ],
        objectiveAreas: [
          { number: "01", title: "Draw and Modify Objects", description: "Basic drawing objects, polylines, selection sets, layers, and blocks." },
          { number: "02", title: "Draw with Accuracy", description: "Object snaps, object snap tracking, coordinates, dynamic input, and direct distance entry." },
          { number: "03", title: "Basic Editing", description: "Object properties, editing commands, trimming, arrays, offsets, fillets, and chamfers." },
          { number: "04", title: "Annotation", description: "Text, leaders, multileaders, dimensions, hatches, and fill patterns." },
          { number: "05", title: "Layouts and Printing", description: "Layouts, viewports, title blocks, publishing, printing, and plotting." },
        ],
      },
      {
        id: "fusion-360-certified-user",
        title: "Autodesk Certified User in Fusion 360",
        description: "The official Autodesk Fusion 360 Certified User objectives cover workspace navigation, sketching, modeling, assemblies, and technical documentation.",
        audience: "The target candidate has foundational proficiency and approximately 150 hours of hands-on experience with Fusion 360, and can perform basic component and assembly modeling with limited assistance.",
        details: [
          { label: "Objective areas", value: "5 sections" },
          { label: "Target experience", value: "Approximately 150 hours" },
          { label: "Credential", value: "Autodesk Certified User" },
        ],
        objectiveAreas: [
          { number: "01", title: "Workspace and Navigation", description: "Data panel, model views, browser, toolbar, grid, units, selection, timeline, and work features." },
          { number: "02", title: "Sketch", description: "Sketch creation and editing, projected geometry, constraints, dimensions, and design parameters." },
          { number: "03", title: "Model", description: "Solid creation, feature modification, inspection, inserts, and form modeling." },
          { number: "04", title: "Assemble", description: "Assemblies, components, joints, positioning, motion, and interference checks." },
          { number: "05", title: "Document", description: "Drawing sheets, drawing views, dimensions, and annotations." },
        ],
      },
      {
        id: "inventor-certified-user",
        title: "Autodesk Certified User in Inventor",
        description: "The official Autodesk Inventor Certified User objectives cover workspace navigation, sketching, feature modeling, assemblies, and drawings.",
        audience: "The target candidate has foundational proficiency and approximately 150 hours of hands-on experience with Inventor, and can perform basic component and assembly modeling with limited assistance.",
        details: [
          { label: "Objective areas", value: "5 sections" },
          { label: "Target experience", value: "Approximately 150 hours" },
          { label: "Credential", value: "Autodesk Certified User" },
        ],
        objectiveAreas: [
          { number: "01", title: "Workspace and Navigation", description: "Inventor file formats, project files, graphics navigation, model browser, selection, display, inspection, planes, and axes." },
          { number: "02", title: "Sketch", description: "Sketch creation, sketch tools, projected geometry, editing, constraints, dimensions, and design parameters." },
          { number: "03", title: "Model", description: "Sketched features, placed features, solid operations, holes, fillets, chamfers, shells, and feature patterns." },
          { number: "04", title: "Assemble", description: "Component placement, assembly constraints, joints, degrees of freedom, manipulation, and interference checks." },
          { number: "05", title: "Document", description: "Drawing sheets, title blocks, drawing views, dimensions, and annotations." },
        ],
      },
      {
        id: "maya-certified-user",
        title: "Autodesk Certified User in Maya",
        description: "The official Autodesk Maya Certified User objectives cover scene management, modeling, texture coordinates, materials, rigging, cameras, animation, lighting, and rendering.",
        audience: "The target candidate has approximately 150 hours of instruction and hands-on experience with Maya and can create polygon-based models, rig and animate them, and light and render scenes at an entry level.",
        details: [
          { label: "Objective areas", value: "9 sections" },
          { label: "Target experience", value: "Approximately 150 hours" },
          { label: "Credential", value: "Autodesk Certified User" },
        ],
        objectiveAreas: [
          { number: "01", title: "Scene Management", description: "Projects, scene preferences, object organization, hierarchies, pivots, attributes, and viewport display." },
          { number: "02", title: "Modeling", description: "Polygon primitives, polygon surfaces, image planes, and modeling toolkit operations." },
          { number: "03", title: "Texture Coordinates", description: "UV projections, UV attributes, UV components, shells, transformations, and distortion aids." },
          { number: "04", title: "Materials / Shading", description: "Material and shader types, material creation, assignment, Hypershade, textures, and shader attributes." },
          { number: "05", title: "Rigging", description: "Joints, skeletons, inverse kinematics, skinning, constraints, and hierarchy connections." },
          { number: "06", title: "Cameras", description: "Camera types, creation, viewport controls, camera attributes, clipping, and view guides." },
          { number: "07", title: "Animation", description: "Time Slider, keyframes, playback, motion paths, animation tangents, and the Graph Editor." },
          { number: "08", title: "Lighting", description: "Light and shadow types, light attributes, manipulators, and light links." },
          { number: "09", title: "Rendering", description: "Built-in renderers, render settings, sampling, frame ranges, and batch rendering." },
        ],
      },
      {
        id: "3ds-max-certified-user",
        title: "Autodesk Certified User in 3ds Max",
        description: "The official Autodesk 3ds Max Certified User objectives cover scene management, modeling, UVW coordinates, materials, rigging, cameras, animation, lighting, and rendering.",
        audience: "The target candidate has approximately 150 hours of instruction and hands-on experience with 3ds Max and can create, rig, animate, light, and render polygon-based models at an entry level.",
        details: [
          { label: "Objective areas", value: "9 sections" },
          { label: "Target experience", value: "Approximately 150 hours" },
          { label: "Credential", value: "Autodesk Certified User" },
        ],
        objectiveAreas: [
          { number: "01", title: "Scene Management", description: "Projects, scene preferences, object organization, transformations, pivots, and viewport display." },
          { number: "02", title: "Modeling", description: "Polygon primitives, editable polygon surfaces, modifiers, symmetry, soft selection, and object operations." },
          { number: "03", title: "UVW Coordinates", description: "UVW Map projections, Unwrap UVW sub-objects, transformations, stitching, unfolding, and distortion aids." },
          { number: "04", title: "Materials / Shading", description: "Materials, shaders, material editors, maps, material nodes, and renderer-specific properties." },
          { number: "05", title: "Rigging", description: "Bones, skin, forward and inverse kinematics, constraints, and Character Studio." },
          { number: "06", title: "Cameras", description: "Camera types, camera controls, walkthroughs, clipping planes, focal length, and safe frames." },
          { number: "07", title: "Animation", description: "Keyframes, Time Slider, time configuration, paths, tangents, Curve Editor, and Dope Sheet." },
          { number: "08", title: "Lighting", description: "Light types, parameters, light include/exclude, shadow types, and shadow settings." },
          { number: "09", title: "Rendering", description: "Built-in renderers, Scanline parameters, sampling, ray depth, and still or animation rendering." },
        ],
      },
      {
        id: "revit-architectural-design-certified-user",
        title: "Autodesk Certified User in Revit for Architectural Design",
        description: "The official Autodesk Revit for Architectural Design Certified User objectives cover building information modeling, architectural modeling, display, views, annotation, schedules, and sheets.",
        audience: "The target candidate has approximately 150 hours of instruction and hands-on experience with Revit and can perform basic building-information modeling and architectural design tasks at an entry level.",
        details: [
          { label: "Objective areas", value: "3 sections" },
          { label: "Target experience", value: "Approximately 150 hours" },
          { label: "Credential", value: "Autodesk Certified User" },
        ],
        objectiveAreas: [
          { number: "01", title: "Modeling", description: "Walls, doors, windows, openings, floors, ceilings, roofs, components, grids, columns, stairs, rooms, and modify tools." },
          { number: "02", title: "Display", description: "Levels, plan, section, elevation, drafting, 3D and camera views, view display, underlays, ranges, and family types." },
          { number: "03", title: "Documentation", description: "Text, tags, dimensions, schedules, 2D annotation detail, sheet composition, and title blocks." },
        ],
      },
    ],
  },
  {
    id: "comptia",
    name: "CompTIA",
    eyebrow: "CompTIA certification courses",
    description: "Official objective-led preparation across CompTIA foundational, infrastructure, cloud, data, project, networking, Linux, and cybersecurity certifications.",
    courses: COMPTIA_COURSES,
  },
  {
    id: "cisco",
    name: "Cisco Certified Support Technician",
    eyebrow: "Cisco · Certiport certification courses",
    description: "Official objective-led preparation for Cisco Certified Support Technician IT Support, Networking, and Cybersecurity certifications.",
    courses: CISCO_COURSES,
  },
  {
    id: "ic3",
    name: "IC3 Digital Literacy",
    eyebrow: "IC3 · Certiport certification courses",
    description: "Official objective-led preparation for IC3 Spark and IC3 Digital Literacy Global Standard 6 Levels 1, 2, and 3.",
    courses: IC3_COURSES,
  },
  {
    id: "intuit",
    name: "Intuit",
    eyebrow: "Intuit certification courses",
    description: "Official objective-led preparation for Intuit bookkeeping, Design for Delight, QuickBooks Online, and personal finance certifications.",
    courses: INTUIT_COURSES,
  },
  {
    id: "its",
    name: "IT Specialist",
    eyebrow: "IT Specialist certification courses",
    description: "Official Certiport objective-led preparation across networking, security, cloud, data, programming, web, and computational thinking exams.",
    courses: ITS_COURSES,
  },
  {
    id: "microsoft",
    name: "Microsoft Office Specialist",
    eyebrow: "Microsoft Office Specialist certification courses",
    description: "Official objective-led preparation for Microsoft Word, Excel, PowerPoint, Outlook, and Access exams across Office 2016, Office 2019, and Microsoft 365 Apps.",
    courses: MICROSOFT_COURSES,
  },
  {
    id: "unity",
    name: "Unity Certified User",
    eyebrow: "Unity Certified User certification courses",
    description: "Official objective-led preparation for Unity Artist, Programmer, and VR Developer certification exams.",
    courses: UNITY_COURSES,
  },
];