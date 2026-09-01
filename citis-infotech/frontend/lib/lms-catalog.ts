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

export const LMS_COURSE_CATEGORIES: LmsCourseCategory[] = [
  {
    id: "adobe-certified-professional",
    name: "Adobe Certified Professional",
    eyebrow: "Featured course category",
    description: "Official objective-led preparation for Adobe Creative Cloud application proficiency and digital media careers.",
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
];