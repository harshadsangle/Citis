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
];