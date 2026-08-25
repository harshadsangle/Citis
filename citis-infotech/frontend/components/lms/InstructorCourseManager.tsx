"use client";

import { useEffect, useState } from "react";
import { BookOpen, CheckCircle2, Edit3, Plus, Save, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LMS_COURSES, type CourseModule, type LmsCourse } from "@/lib/lms-courses";

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
  return value.split("\n").map((line, moduleIndex) => line.trim()).filter(Boolean).map((line, moduleIndex) => {
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

  useEffect(() => {
    const custom = readCustomCourses();
    const overrides = new Map(custom.map((course) => [course.slug, course]));
    setCourses([...LMS_COURSES.map((course) => overrides.get(course.slug) ?? course), ...custom.filter((course) => !LMS_COURSES.some((base) => base.slug === course.slug))]);
  }, []);

  function openCreate() {
    setEditingSlug(null);
    setForm(emptyForm);
    setSaved(false);
    setShowForm(true);
  }

  function openEdit(course: LmsCourse) {
    setEditingSlug(course.slug);
    setForm(toForm(course));
    setSaved(false);
    setShowForm(true);
  }

  function saveCourse(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const modules = parseModules(form.modules);
    if (!form.title.trim() || !form.description.trim() || modules.length === 0) return;
    const slug = editingSlug ?? `${form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now()}`;
    const nextCourse: LmsCourse = { slug, title: form.title.trim(), description: form.description.trim(), category: form.category.trim() || "Future Skills", level: form.level, duration: form.duration.trim() || "6 weeks", learners: "New course", progress: 0, instructor: instructorName, outcomes: ["Complete the course modules and practical activities.", "Apply the concepts in a real-world project."], modules, quiz: [], assignments: [], status: form.status };
    const custom = readCustomCourses().filter((course) => course.slug !== slug);
    const nextCustom = [...custom, nextCourse];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCustom));
    setCourses([...LMS_COURSES.map((course) => nextCustom.find((item) => item.slug === course.slug) ?? course), ...nextCustom.filter((course) => !LMS_COURSES.some((base) => base.slug === course.slug))]);
    setEditingSlug(slug);
    setSaved(true);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Teaching workspace</p><h2 className="mt-2 font-heading text-2xl font-bold text-[#123d5c]">My Courses</h2><p className="mt-2 text-muted-foreground">Create, update, and manage your learning catalogue.</p></div><Button variant="accent" onClick={openCreate}><Plus />Create Course</Button></div>
      {showForm && <Card className="border-[#b9d8e6]"><CardHeader><div className="flex items-center justify-between gap-4"><CardTitle>{editingSlug ? "Edit Course" : "Create Course"}</CardTitle><Button variant="ghost" size="icon" onClick={() => setShowForm(false)} aria-label="Close course editor"><X /></Button></div><p className="text-sm leading-6 text-muted-foreground">Use one line per module in the format: module title | module description | lesson one, lesson two.</p></CardHeader><CardContent><form onSubmit={saveCourse} className="grid gap-5 md:grid-cols-2"><div><Label htmlFor="instructor-course-title">Course title</Label><Input id="instructor-course-title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-2" required /></div><div><Label htmlFor="instructor-course-category">Category</Label><Input id="instructor-course-category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="mt-2" /></div><div><Label htmlFor="instructor-course-duration">Duration</Label><Input id="instructor-course-duration" value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} className="mt-2" /></div><div><Label htmlFor="instructor-course-level">Level</Label><select id="instructor-course-level" value={form.level} onChange={(event) => setForm({ ...form, level: event.target.value })} className="mt-2 flex h-11 w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm"><option>Foundation</option><option>Intermediate</option><option>Advanced</option></select></div><div className="md:col-span-2"><Label htmlFor="instructor-course-description">Description</Label><textarea id="instructor-course-description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} className="mt-2 flex w-full resize-y rounded-lg border border-input bg-background px-3.5 py-3 text-sm" required /></div><div className="md:col-span-2"><Label htmlFor="instructor-course-modules">Modules and lessons</Label><textarea id="instructor-course-modules" value={form.modules} onChange={(event) => setForm({ ...form, modules: event.target.value })} rows={4} className="mt-2 flex w-full resize-y rounded-lg border border-input bg-background px-3.5 py-3 text-sm" required /></div><div><Label htmlFor="instructor-course-status">Course status</Label><select id="instructor-course-status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as "Draft" | "Published" })} className="mt-2 flex h-11 w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm"><option value="Draft">Draft</option><option value="Published">Published</option></select></div><div className="flex items-end gap-3"><Button type="submit" variant="accent"><Save />{editingSlug ? "Save Changes" : "Create Course"}</Button>{saved && <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700"><CheckCircle2 className="size-4" />Saved locally</p>}</div></form></CardContent></Card>}
      <div className="grid gap-5 lg:grid-cols-2">{courses.map((course) => <Card key={course.slug}><CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:justify-between"><div className="flex min-w-0 items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><BookOpen className="size-5" /></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-[#123d5c]">{course.title}</h3><Badge variant={course.status === "Draft" ? "outline" : "success"}>{course.status ?? "Published"}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{course.modules.length} modules · {course.modules.reduce((total, module) => total + module.lessons.length, 0)} lessons · {course.duration}</p><p className="mt-1 text-xs text-muted-foreground">Instructor: {course.instructor}</p></div></div><Button variant="outline" size="sm" onClick={() => openEdit(course)}><Edit3 />Edit Course</Button></CardContent></Card>)}</div>
    </div>
  );
}