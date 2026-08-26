import pg from "pg";

const { Pool } = pg;

const courses = [
  {
    slug: "ai-foundations-for-educators",
    title: "AI Foundations for Educators",
    description: "Build practical confidence with responsible AI, digital pedagogy, and classroom-ready applications.",
    category: "Artificial Intelligence",
    level: "Foundation",
    duration: "6 weeks",
    outcomes: ["Explain core AI concepts in clear, learner-friendly language.", "Design responsible AI activities for different classroom contexts.", "Evaluate AI outputs for accuracy, bias, and learning value."],
  },
  {
    slug: "applied-data-and-digital-skills",
    title: "Applied Data & Digital Skills",
    description: "Develop the data fluency and digital problem-solving skills needed in modern academic and professional settings.",
    category: "Digital Technology",
    level: "Intermediate",
    duration: "8 weeks",
    outcomes: ["Organise and interpret real-world datasets.", "Communicate insights through clear visualisations.", "Use digital tools to solve structured problems with confidence."],
  },
  {
    slug: "entrepreneurship-and-innovation",
    title: "Entrepreneurship & Innovation",
    description: "Move from opportunity discovery to tested ideas through a structured, project-led innovation pathway.",
    category: "Future Skills",
    level: "Foundation",
    duration: "5 weeks",
    outcomes: ["Discover opportunities grounded in real user needs.", "Test assumptions through practical experiments.", "Present a clear solution story and next-step plan."],
  },
];

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required to seed LMS courses.");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

try {
  for (const course of courses) {
    await pool.query(
      `INSERT INTO lms_courses (slug, title, description, category, level, duration, status, outcomes, modules)
       VALUES ($1, $2, $3, $4, $5, $6, 'published', $7::jsonb, '[]'::jsonb)
       ON CONFLICT (slug) DO UPDATE SET
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         category = EXCLUDED.category,
         level = EXCLUDED.level,
         duration = EXCLUDED.duration,
         outcomes = EXCLUDED.outcomes`,
      [course.slug, course.title, course.description, course.category, course.level, course.duration, JSON.stringify(course.outcomes)],
    );
  }
  console.log(`Seeded ${courses.length} CITIS LMS courses.`);
} finally {
  await pool.end();
}