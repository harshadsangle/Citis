"use client";

import { useEffect, useState } from "react";
import { BookOpen, CheckCircle2, Edit3, Plus, Save, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LMS_COURSES, type CourseModule, type LmsCourse } from "@/lib/lms-courses";
import { InstructorLearners } from "@/components/lms/InstructorLearners";

const STORAGE_KEY = "citis-lms-instructor-courses";

type CourseForm = {
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  modules: string;
  status: "Draft" | "Published";
};

const emptyForm: CourseForm = { title: "", description: "", category: "Future Skills", level: "Foundation", duration: "6 weeks", modules: "Module 1 | Course introduction | Welcome lesson, Getting started", status: "Draft" };

function toForm(course: LmsCourse): CourseForm {
  return { title: course.title, description: course.description, category: course.category, level: course.level, duration: course.duration, status: course.status ?? "Published", modules: course.modules.map((module) => `${module.title} | ${module.description} | ${module.lessons.map((lesson) => lesson.title).join(", ")}`).join("\n") };
}

function parseModules(value: string): CourseModule[] {
  return value.split("\n").map((line) => line.trim()).filter(Boolean).map((line, moduleIndex) => {
    const [title, description, lessonList] = line.split("|").map((part) => part.trim());
    const lessons = (lessonList || "Lesson 1").split(",").map((lesson, lessonIndex) => ({ id: `custom-${moduleIndex}-${lessonIndex}`, title: lesson.trim(), duration: "20 min" })).filter((lesson) => lesson.title);
    return { id: `custom-module-${moduleIndex}`, title: title || `Module ${moduleIndex + 1}`, description: description || "Course learning module.", lessons };
  });
}

function readCustomCourses() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(stored) ? stored as LmsCourse[] : [];
  } catch {
    return [];
  }
}

export function InstructorCourseManager({ instructorName }: { instructorName: string }) {
  const [courses, setCourses] = useState<LmsCourse[]>([]);
  const [form, setForm] = useState<CourseForm>(emptyForm);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  function mergeCourses(custom: LmsCourse[]) {
    const overrides = new Map(custom.map((course) => [course.slug, course]));
    return [...LMS_COURSES.map((course) => overrides.get(course.slug) ?? course), ...custom.filter((course) => !LMS_COURSES.some((base) => base.slug === course.slug))];
  }

  useEffect(() => {
    async function loadCourses() {
      const custom = readCustomCourses();
      setCourses(mergeCourses(custom));
      try {
        const response = await fetch("/api/lms/courses?manage=1");
        if (response.ok) {
          const result = await response.json() as { courses?: LmsCourse[] };
          if (result.courses) setCourses(result.courses);
        }
      } catch {
        setError("The database catalogue is unavailable; showing your saved browser courses.");
      } finally {
        setLoading(false);
      }
    }
    void loadCourses();
  }, []);

  function openCreate() {
    setEditingSlug(null);
    setForm(emptyForm);
    setSaved(false);
    setError("");
    setShowForm(true);
  }

  function openEdit(course: LmsCourse) {
    setEditingSlug(course.slug);
    setForm(toForm(course));
    setSaved(false);
    setError("");
    setShowForm(true);
  }

  async function saveCourse(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const modules = parseModules(form.modules);
    if (!form.title.trim() || !form.description.trim() || modules.length === 0) return;
    const slug = editingSlug ?? `${form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now()}`;
    const nextCourse: LmsCourse = { slug, title: form.title.trim(), description: form.description.trim(), category: form.category.trim() || "Future Skills", level: form.level, duration: form.duration.trim() || "6 weeks", learners: "New course", progress: 0, instructor: instructorName, outcomes: ["Complete the course modules and practical activities.", "Apply the concepts in a real-world project."], modules, quiz: [], assignments: [], status: form.status };
    const isEditing = Boolean(editingSlug);
    const response = await fetch(isEditing ? `/api/lms/courses/${slug}` : "/api/lms/courses", { method: isEditing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(nextCourse) }).catch(() => null);
    const result = response ? await response.json() as { course?: LmsCourse; error?: string } : null;
    if (!response?.ok || !result?.course) {
      const custom = readCustomCourses().filter((course) => course.slug !== slug);
      const nextCustom = [...custom, nextCourse];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCustom));
      setCourses(mergeCourses(nextCustom));
      setError(result?.error ?? "Course saved in browser storage, but the database could not be reached.");
      setSaved(false);
      return;
    }

    const dbCourse = result.course;
    const custom = readCustomCourses().filter((course) => course.slug !== slug);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...custom, dbCourse]));
    setCourses((current) => current.some((course) => course.slug === slug) ? current.map((course) => course.slug === slug ? dbCourse : course) : [...current, dbCourse]);
    setEditingSlug(dbCourse.slug);
    setSaved(true);
  }

  async function deleteCourse(course: LmsCourse) {
    if (!window.confirm(`Delete “${course.title}”? This cannot be undone.`)) return;
    setError("");
    const response = await fetch(`/api/lms/courses/${course.slug}`, { method: "DELETE" }).catch(() => null);
    if (!response?.ok) {
      const result = response ? await response.json() as { error?: string } : null;
      setError(result?.error ?? "Unable to delete the course from the database.");
      return;
    }
    const nextCustom = readCustomCourses().filter((item) => item.slug !== course.slug);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCustom));
    setCourses((current) => current.filter((item) => item.slug !== course.slug));
    if (editingSlug === course.slug) {
      setEditingSlug(null);
      setShowForm(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Teaching workspace</p><h2 className="mt-2 font-heading text-2xl font-bold text-[#123d5c]">My Courses</h2><p className="mt-2 text-muted-foreground">Create, update, and manage your learning catalogue.</p></div><Button variant="accent" onClick={openCreate}><Plus />Create Course</Button></div>
      {error && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{error}</p>}
      {loading && <p className="rounded-xl border border-dashed border-[#9fc6d6] bg-white p-5 text-sm text-muted-foreground">Loading courses from the database…</p>}
      {showForm && <Card className="border-[#b9d8e6]"><CardHeader><div className="flex items-center justify-between gap-4"><CardTitle>{editingSlug ? "Edit Course" : "Create Course"}</CardTitle><Button variant="ghost" size="icon" onClick={() => setShowForm(false)} aria-label="Close course editor"><X /></Button></div><p className="text-sm leading-6 text-muted-foreground">Use one line per module in the format: module title | module description | lesson one, lesson two.</p></CardHeader><CardContent><form onSubmit={saveCourse} className="grid gap-5 md:grid-cols-2"><div><Label htmlFor="instructor-course-title">Course title</Label><Input id="instructor-course-title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-2" required /></div><div><Label htmlFor="instructor-course-category">Category</Label><Input id="instructor-course-category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="mt-2" /></div><div><Label htmlFor="instructor-course-duration">Duration</Label><Input id="instructor-course-duration" value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} className="mt-2" /></div><div><Label htmlFor="instructor-course-level">Level</Label><select id="instructor-course-level" value={form.level} onChange={(event) => setForm({ ...form, level: event.target.value })} className="mt-2 flex h-11 w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm"><option>Foundation</option><option>Intermediate</option><option>Advanced</option></select></div><div className="md:col-span-2"><Label htmlFor="instructor-course-description">Description</Label><textarea id="instructor-course-description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} className="mt-2 flex w-full resize-y rounded-lg border border-input bg-background px-3.5 py-3 text-sm" required /></div><div className="md:col-span-2"><Label htmlFor="instructor-course-modules">Modules and lessons</Label><textarea id="instructor-course-modules" value={form.modules} onChange={(event) => setForm({ ...form, modules: event.target.value })} rows={4} className="mt-2 flex w-full resize-y rounded-lg border border-input bg-background px-3.5 py-3 text-sm" required /></div><div><Label htmlFor="instructor-course-status">Course status</Label><select id="instructor-course-status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as "Draft" | "Published" })} className="mt-2 flex h-11 w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm"><option value="Draft">Draft</option><option value="Published">Published</option></select></div><div className="flex items-end gap-3"><Button type="submit" variant="accent"><Save />{editingSlug ? "Save Changes" : "Create Course"}</Button>{saved && <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700"><CheckCircle2 className="size-4" />Saved locally</p>}</div></form></CardContent></Card>}
      <InstructorLearners />
      <div className="grid gap-5 lg:grid-cols-2">{courses.map((course) => <Card key={course.slug}><CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:justify-between"><div className="flex min-w-0 items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><BookOpen className="size-5" /></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-[#123d5c]">{course.title}</h3><Badge variant={course.status === "Draft" ? "outline" : "success"}>{course.status ?? "Published"}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{course.modules.length} modules · {course.modules.reduce((total, module) => total + module.lessons.length, 0)} lessons · {course.duration}</p><p className="mt-1 text-xs text-muted-foreground">Instructor: {course.instructor}</p></div></div><div className="flex shrink-0 gap-2"><Button variant="outline" size="sm" onClick={() => openEdit(course)}><Edit3 />Edit Course</Button><Button variant="ghost" size="icon" onClick={() => deleteCourse(course)} aria-label={`Delete ${course.title}`}><Trash2 /></Button></div></CardContent></Card>)}</div>
    </div>
  );
}