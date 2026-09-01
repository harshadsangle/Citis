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