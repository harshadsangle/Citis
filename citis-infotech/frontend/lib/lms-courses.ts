export type Lesson = {
  id: string;
  title: string;
  duration: string;
  completed?: boolean;
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