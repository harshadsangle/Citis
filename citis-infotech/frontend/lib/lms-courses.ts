export type Lesson = {
  id: string;
  title: string;
  duration: string;
  completed?: boolean;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
};

export type CourseAssignment = {
  id: string;
  title: string;
  instructions: string;
};

export type CourseModule = {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
};

export type LmsCourse = {
  slug: string;
  title: string;
  category: string;
  level: string;
  duration: string;
  learners: string;
  progress: number;
  instructor: string;
  description: string;
  outcomes: string[];
  modules: CourseModule[];
  quiz: QuizQuestion[];
  assignments: CourseAssignment[];
  status?: "Draft" | "Published";
};

export const LMS_COURSES: LmsCourse[] = [
  {
    slug: "ai-foundations-for-educators",
    title: "AI Foundations for Educators",
    category: "Artificial Intelligence",
    level: "Foundation",
    duration: "6 weeks",
    learners: "240 learners",
    progress: 68,
    instructor: "Dr. Maya Rao",
    description: "Build practical confidence with responsible AI, digital pedagogy, and classroom-ready applications.",
    outcomes: ["Explain core AI concepts in clear, learner-friendly language.", "Design responsible AI activities for different classroom contexts.", "Evaluate AI outputs for accuracy, bias, and learning value."],
    quiz: [
      { id: "ai-q1", question: "Which practice is most important when using AI-generated information in class?", options: ["Accept every output as accurate", "Verify outputs and discuss limitations", "Avoid asking questions about the output", "Use the longest response available"], correctAnswer: 1 },
      { id: "ai-q2", question: "A responsible classroom AI policy should protect a learner’s...", options: ["Ability to skip all assessment", "Access to unlimited automation", "Privacy, agency, and academic integrity", "Choice of any final grade"], correctAnswer: 2 },
    ],
    assignments: [{ id: "ai-a1", title: "Design a classroom AI policy", instructions: "Create a one-page policy for responsible AI use in a classroom or learning programme. Include guidance for privacy, verification, and academic integrity." }],
    status: "Published",
    modules: [
      { id: "ai-1", title: "AI in the learning ecosystem", description: "Understand the technologies changing how learners discover, create, and collaborate.", lessons: [{ id: "ai-1-1", title: "Welcome and course orientation", duration: "08 min", completed: true }, { id: "ai-1-2", title: "A practical map of AI concepts", duration: "22 min", completed: true }, { id: "ai-1-3", title: "Where AI fits in education", duration: "18 min", completed: true }] },
      { id: "ai-2", title: "Prompting for meaningful learning", description: "Create prompts that encourage reasoning, reflection, and original student work.", lessons: [{ id: "ai-2-1", title: "From instructions to useful prompts", duration: "24 min", completed: true }, { id: "ai-2-2", title: "Designing classroom workflows", duration: "28 min", completed: true }] },
      { id: "ai-3", title: "Responsible AI foundations", description: "Build practical habits for academic integrity, privacy, fairness, and verification.", lessons: [{ id: "ai-3-1", title: "Bias, privacy, and learner agency", duration: "26 min", completed: true }, { id: "ai-3-2", title: "Assessment in an AI-enabled classroom", duration: "31 min" }] },
      { id: "ai-4", title: "Responsible AI in practice", description: "Apply a responsible AI framework to a real teaching and learning scenario.", lessons: [{ id: "ai-4-1", title: "Build your classroom AI policy", duration: "35 min" }, { id: "ai-4-2", title: "Checkpoint: responsible AI", duration: "12 min" }] },
    ],
  },
  {
    slug: "applied-data-and-digital-skills",
    title: "Applied Data & Digital Skills",
    category: "Digital Technology",
    level: "Intermediate",
    duration: "8 weeks",
    learners: "180 learners",
    progress: 42,
    instructor: "Arjun Mehta",
    description: "Develop the data fluency and digital problem-solving skills needed in modern academic and professional settings.",
    outcomes: ["Organise and interpret real-world datasets.", "Communicate insights through clear visualisations.", "Use digital tools to solve structured problems with confidence."],
    quiz: [
      { id: "data-q1", question: "What is a useful first step when exploring a new dataset?", options: ["Delete unusual values immediately", "Understand the questions and fields it contains", "Create a presentation before reviewing it", "Only look at the largest number"], correctAnswer: 1 },
      { id: "data-q2", question: "A visualisation is most effective when it...", options: ["Uses as many colours as possible", "Makes the intended pattern easy to understand", "Removes all context from the data", "Includes every available data point"], correctAnswer: 1 },
    ],
    assignments: [{ id: "data-a1", title: "Build a learner insights dashboard", instructions: "Use a small dataset to identify three useful learner insights. Describe your approach and explain which visualisation would communicate each insight best." }],
    status: "Published",
    modules: [
      { id: "data-1", title: "Thinking with data", description: "Learn how to ask useful questions and identify the evidence needed to answer them.", lessons: [{ id: "data-1-1", title: "Data in everyday decisions", duration: "16 min", completed: true }, { id: "data-1-2", title: "Questions, measures, and evidence", duration: "24 min", completed: true }] },
      { id: "data-2", title: "Finding patterns in data", description: "Move from raw information to patterns that can support better decisions.", lessons: [{ id: "data-2-1", title: "Clean and structure a dataset", duration: "28 min", completed: true }, { id: "data-2-2", title: "Spotting trends and outliers", duration: "26 min" }] },
      { id: "data-3", title: "Digital problem solving", description: "Use a repeatable framework to explore, test, and communicate solutions.", lessons: [{ id: "data-3-1", title: "Break down a complex problem", duration: "20 min" }, { id: "data-3-2", title: "Build a learner insights dashboard", duration: "42 min" }] },
    ],
  },
  {
    slug: "entrepreneurship-and-innovation",
    title: "Entrepreneurship & Innovation",
    category: "Future Skills",
    level: "Foundation",
    duration: "5 weeks",
    learners: "320 learners",
    progress: 18,
    instructor: "Priya Kulkarni",
    description: "Move from opportunity discovery to tested ideas through a structured, project-led innovation pathway.",
    outcomes: ["Discover opportunities grounded in real user needs.", "Test assumptions through practical experiments.", "Present a clear solution story and next-step plan."],
    quiz: [
      { id: "entre-q1", question: "A strong opportunity usually starts with...", options: ["A real user need or meaningful problem", "A finished logo", "A large office", "A long business plan"], correctAnswer: 0 },
      { id: "entre-q2", question: "Why should innovators test assumptions early?", options: ["To avoid listening to users", "To learn what works before investing heavily", "To guarantee every idea succeeds", "To replace all creative thinking"], correctAnswer: 1 },
    ],
    assignments: [{ id: "entre-a1", title: "Test an opportunity", instructions: "Choose a problem you care about, describe the user need behind it, and propose one small experiment that could validate your most important assumption." }],
    status: "Published",
    modules: [
      { id: "entre-1", title: "From idea to opportunity", description: "Explore curiosity, observation, and the signals that reveal meaningful opportunities.", lessons: [{ id: "entre-1-1", title: "The innovator's mindset", duration: "18 min", completed: true }, { id: "entre-1-2", title: "Map a real user need", duration: "24 min" }] },
      { id: "entre-2", title: "Designing a valuable solution", description: "Shape an idea into a solution that creates measurable value for its users.", lessons: [{ id: "entre-2-1", title: "Value propositions", duration: "22 min" }, { id: "entre-2-2", title: "Prototype before you build", duration: "30 min" }] },
      { id: "entre-3", title: "Testing and communicating", description: "Gather useful feedback and communicate your next steps with confidence.", lessons: [{ id: "entre-3-1", title: "Run a learning experiment", duration: "25 min" }, { id: "entre-3-2", title: "Tell your innovation story", duration: "20 min" }] },
    ],
  },
];

export function getCourseBySlug(slug: string) {
  return LMS_COURSES.find((course) => course.slug === slug);
}