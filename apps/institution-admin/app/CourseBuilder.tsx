"use client";

import { type ChangeEvent, type FormEvent, useMemo, useState } from "react";

type ResourceType = "VIDEO" | "PDF" | "DOCUMENT" | "PRESENTATION" | "LINK" | "SCORM" | "INTERACTIVE";
type AssessmentType = "PRACTICE_QUIZ" | "FORMATIVE" | "SUMMATIVE" | "ASSIGNMENT" | "PROJECT" | "VIVA" | "PRACTICAL";
type QuestionType = "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_TEXT" | "NUMERIC";

type BuilderResource = {
  id: string;
  title: string;
  resourceType: ResourceType;
  url: string;
  duration: string;
  file: File | null;
};

type BuilderLesson = {
  id: string;
  title: string;
  description: string;
  estimatedDuration: string;
  resources: BuilderResource[];
};

type BuilderAssignment = {
  id: string;
  title: string;
  description: string;
  instructions: string;
  dueAt: string;
  maxMarks: string;
};

type BuilderQuestion = {
  id: string;
  prompt: string;
  questionType: QuestionType;
  marks: string;
  options: string;
};

type BuilderAssessment = {
  id: string;
  title: string;
  description: string;
  assessmentType: AssessmentType;
  totalMarks: string;
  passingMarks: string;
  durationMinutes: string;
  attemptLimit: string;
  questions: BuilderQuestion[];
};

type BuilderModule = {
  id: string;
  title: string;
  description: string;
  lessons: BuilderLesson[];
  assignments: BuilderAssignment[];
  assessments: BuilderAssessment[];
};

type CourseForm = {
  title: string;
  code: string;
  description: string;
  thumbnail: string;
  price: string;
  purchasable: boolean;
};

type ApiResponse<T = { id: string }> = { success: true; data: T };

const resourceTypes: ResourceType[] = ["VIDEO", "PDF", "DOCUMENT", "PRESENTATION", "LINK", "SCORM", "INTERACTIVE"];
const assessmentTypes: AssessmentType[] = ["PRACTICE_QUIZ", "FORMATIVE", "SUMMATIVE", "ASSIGNMENT", "PROJECT", "VIVA", "PRACTICAL"];
const questionTypes: QuestionType[] = ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_TEXT", "NUMERIC"];

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function newLesson(): BuilderLesson {
  return { id: newId("lesson"), title: "", description: "", estimatedDuration: "", resources: [] };
}

function newModule(): BuilderModule {
  return { id: newId("module"), title: "", description: "", lessons: [], assignments: [], assessments: [] };
}

function newResource(): BuilderResource {
  return { id: newId("resource"), title: "", resourceType: "VIDEO", url: "", duration: "", file: null };
}

function newAssignment(): BuilderAssignment {
  return { id: newId("assignment"), title: "", description: "", instructions: "", dueAt: "", maxMarks: "100" };
}

function newQuestion(): BuilderQuestion {
  return { id: newId("question"), prompt: "", questionType: "SINGLE_CHOICE", marks: "1", options: "" };
}

function newAssessment(): BuilderAssessment {
  return {
    id: newId("assessment"),
    title: "",
    description: "",
    assessmentType: "PRACTICE_QUIZ",
    totalMarks: "10",
    passingMarks: "5",
    durationMinutes: "",
    attemptLimit: "1",
    questions: [],
  };
}

async function request<T>(apiBase: string, path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  if (init?.body instanceof FormData) headers.delete("Content-Type");
  else headers.set("Content-Type", "application/json");
  const response = await fetch(`${apiBase}${path}`, { ...init, credentials: "include", headers });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = typeof payload?.message === "string"
      ? payload.message
      : typeof payload?.error?.message === "string"
        ? payload.error.message
        : typeof payload?.error === "string" ? payload.error : "The request could not be completed.";
    throw new Error(message);
  }
  return payload as T;
}

function numberOrUndefined(value: string) {
  return value.trim() ? Number(value) : undefined;
}

function labelForType(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase());
}

export default function CourseBuilder({
  apiBase,
  programmeId,
  onClose,
  onCreated,
}: {
  apiBase: string;
  programmeId: string;
  onClose: () => void;
  onCreated: (title: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [course, setCourse] = useState<CourseForm>({ title: "", code: "", description: "", thumbnail: "", price: "", purchasable: false });
  const [modules, setModules] = useState<BuilderModule[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [moduleDraft, setModuleDraft] = useState<BuilderModule | null>(null);
  const [lessonDraft, setLessonDraft] = useState<BuilderLesson | null>(null);
  const [resourceDraft, setResourceDraft] = useState<BuilderResource | null>(null);
  const [assignmentDraft, setAssignmentDraft] = useState<BuilderAssignment | null>(null);
  const [assessmentDraft, setAssessmentDraft] = useState<BuilderAssessment | null>(null);
  const [questionDraft, setQuestionDraft] = useState<BuilderQuestion | null>(null);
  const [editingId, setEditingId] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState("");

  const selectedModule = modules.find((item) => item.id === selectedModuleId) || null;
  const selectedLesson = selectedModule?.lessons.find((item) => item.id === selectedLessonId) || null;
  const allLessons = useMemo(() => modules.flatMap((module) => module.lessons.map((lesson) => ({ module, lesson }))), [modules]);

  function updateCourse(key: keyof CourseForm, value: string | boolean) {
    setCourse((current) => ({ ...current, [key]: value }));
  }

  function selectModule(id: string) {
    setSelectedModuleId(id);
    const module = modules.find((item) => item.id === id);
    setSelectedLessonId(module?.lessons[0]?.id || "");
    setLessonDraft(null);
    setResourceDraft(null);
  }

  function saveModule(event: FormEvent) {
    event.preventDefault();
    if (!moduleDraft?.title.trim()) return;
    const savedModule = editingId ? { ...moduleDraft, id: editingId } : { ...moduleDraft, id: newId("module") };
    setModules((current) => editingId
      ? current.map((item) => item.id === editingId ? savedModule : item)
      : [...current, savedModule]);
    if (!editingId) {
      setSelectedModuleId(savedModule.id);
      setSelectedLessonId("");
    }
    setModuleDraft(null);
    setEditingId("");
  }

  function saveLesson(event: FormEvent) {
    event.preventDefault();
    if (!lessonDraft?.title.trim() || !selectedModuleId) return;
    setModules((current) => current.map((module) => module.id !== selectedModuleId ? module : {
      ...module,
      lessons: editingId
        ? module.lessons.map((item) => item.id === editingId ? { ...lessonDraft, id: editingId } : item)
        : [...module.lessons, { ...lessonDraft, id: newId("lesson") }],
    }));
    setLessonDraft(null);
    setEditingId("");
  }

  function saveResource(event: FormEvent) {
    event.preventDefault();
    if (!resourceDraft?.title.trim() || !selectedModuleId || !selectedLessonId) return;
    setModules((current) => current.map((module) => module.id !== selectedModuleId ? module : {
      ...module,
      lessons: module.lessons.map((lesson) => lesson.id !== selectedLessonId ? lesson : {
        ...lesson,
        resources: editingId
          ? lesson.resources.map((item) => item.id === editingId ? { ...resourceDraft, id: editingId } : item)
          : [...lesson.resources, { ...resourceDraft, id: newId("resource") }],
      }),
    }));
    setResourceDraft(null);
    setEditingId("");
  }

  function saveAssignment(event: FormEvent) {
    event.preventDefault();
    if (!assignmentDraft?.title.trim() || !selectedModuleId || !assignmentDraft.instructions.trim()) return;
    setModules((current) => current.map((module) => module.id !== selectedModuleId ? module : {
      ...module,
      assignments: editingId
        ? module.assignments.map((item) => item.id === editingId ? { ...assignmentDraft, id: editingId } : item)
        : [...module.assignments, { ...assignmentDraft, id: newId("assignment") }],
    }));
    setAssignmentDraft(null);
    setEditingId("");
  }

  function saveAssessment(event: FormEvent) {
    event.preventDefault();
    if (!assessmentDraft?.title.trim() || !selectedModuleId) return;
    setModules((current) => current.map((module) => module.id !== selectedModuleId ? module : {
      ...module,
      assessments: editingId
        ? module.assessments.map((item) => item.id === editingId ? { ...assessmentDraft, id: editingId } : item)
        : [...module.assessments, { ...assessmentDraft, id: newId("assessment") }],
    }));
    setAssessmentDraft(null);
    setEditingId("");
  }

  function saveQuestion(event: FormEvent) {
    event.preventDefault();
    if (!questionDraft?.prompt.trim() || !assessmentDraft) return;
    setAssessmentDraft((current) => current ? {
      ...current,
      questions: editingId
        ? current.questions.map((item) => item.id === editingId ? { ...questionDraft, id: editingId } : item)
        : [...current.questions, { ...questionDraft, id: newId("question") }],
    } : current);
    setQuestionDraft(null);
    setEditingId("");
  }

  function beginModule(module?: BuilderModule) {
    setEditingId(module?.id || "");
    setModuleDraft(module ? { ...module, lessons: [...module.lessons], assignments: [...module.assignments], assessments: [...module.assessments] } : newModule());
  }

  function beginLesson(lesson?: BuilderLesson) {
    setEditingId(lesson?.id || "");
    setLessonDraft(lesson ? { ...lesson, resources: [...lesson.resources] } : newLesson());
  }

  function beginResource(resource?: BuilderResource) {
    setEditingId(resource?.id || "");
    setResourceDraft(resource ? { ...resource } : newResource());
  }

  function beginAssignment(assignment?: BuilderAssignment) {
    setEditingId(assignment?.id || "");
    setAssignmentDraft(assignment ? { ...assignment } : newAssignment());
  }

  function beginAssessment(assessment?: BuilderAssessment) {
    setEditingId(assessment?.id || "");
    setAssessmentDraft(assessment ? { ...assessment, questions: [...assessment.questions] } : newAssessment());
  }

  function removeModule(id: string) {
    setModules((current) => current.filter((item) => item.id !== id));
    if (selectedModuleId === id) {
      const next = modules.find((item) => item.id !== id);
      setSelectedModuleId(next?.id || "");
      setSelectedLessonId(next?.lessons[0]?.id || "");
    }
  }

  function removeLesson(id: string) {
    setModules((current) => current.map((module) => module.id !== selectedModuleId ? module : { ...module, lessons: module.lessons.filter((item) => item.id !== id) }));
    if (selectedLessonId === id) setSelectedLessonId("");
  }

  function removeResource(id: string) {
    setModules((current) => current.map((module) => module.id !== selectedModuleId ? module : {
      ...module,
      lessons: module.lessons.map((lesson) => lesson.id !== selectedLessonId ? lesson : { ...lesson, resources: lesson.resources.filter((item) => item.id !== id) }),
    }));
  }

  function moveModule(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= modules.length) return;
    setModules((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function moveLesson(index: number, direction: -1 | 1) {
    setModules((current) => current.map((module) => {
      if (module.id !== selectedModuleId) return module;
      const target = index + direction;
      if (target < 0 || target >= module.lessons.length) return module;
      const lessons = [...module.lessons];
      [lessons[index], lessons[target]] = [lessons[target], lessons[index]];
      return { ...module, lessons };
    }));
  }

  function parseOptions(value: string) {
    return value.split("\n").map((line) => {
      const [optionValue = "", label = "", correct = "false"] = line.split("|");
      return { value: optionValue.trim(), label: label.trim(), isCorrect: correct.trim().toLowerCase() === "true" };
    }).filter((option) => option.value && option.label);
  }

  async function createCourse() {
    if (!programmeId) {
      setError("This workspace has no existing course catalogue relationship available.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      setProgress("Creating course details…");
      const createdCourse = await request<ApiResponse>(apiBase, "/courses", {
        method: "POST",
        body: JSON.stringify({
          programmeId,
          title: course.title.trim(),
          code: course.code.trim(),
          description: course.description.trim() || undefined,
          thumbnail: course.thumbnail.trim() || undefined,
          priceMinor: numberOrUndefined(course.price) === undefined ? undefined : Math.round(Number(course.price) * 100),
          currency: course.price.trim() ? "INR" : undefined,
          purchasable: course.purchasable,
        }),
      });
      const courseId = createdCourse.data.id;

      for (let moduleIndex = 0; moduleIndex < modules.length; moduleIndex += 1) {
        const module = modules[moduleIndex];
        setProgress(`Creating module ${moduleIndex + 1} of ${modules.length}…`);
        const createdModule = await request<ApiResponse>(apiBase, "/course-modules", {
          method: "POST",
          body: JSON.stringify({ courseId, title: module.title.trim(), description: module.description.trim() || undefined, sequence: moduleIndex + 1 }),
        });
        const moduleId = createdModule.data.id;

        for (let lessonIndex = 0; lessonIndex < module.lessons.length; lessonIndex += 1) {
          const lesson = module.lessons[lessonIndex];
          setProgress(`Creating lesson ${lessonIndex + 1} in ${module.title}…`);
          const createdLesson = await request<ApiResponse>(apiBase, "/lessons", {
            method: "POST",
            body: JSON.stringify({
              moduleId,
              title: lesson.title.trim(),
              description: lesson.description.trim() || undefined,
              sequence: lessonIndex + 1,
              estimatedDuration: numberOrUndefined(lesson.estimatedDuration),
            }),
          });
          const lessonId = createdLesson.data.id;
          for (let resourceIndex = 0; resourceIndex < lesson.resources.length; resourceIndex += 1) {
            const resource = lesson.resources[resourceIndex];
            setProgress(`Adding resource ${resourceIndex + 1} in ${lesson.title}…`);
            const createdResource = await request<ApiResponse>(apiBase, "/learning-resources", {
              method: "POST",
              body: JSON.stringify({
                lessonId,
                resourceType: resource.resourceType,
                title: resource.title.trim(),
                url: resource.url.trim() || undefined,
                duration: numberOrUndefined(resource.duration),
                sequence: resourceIndex + 1,
              }),
            });
            if (resource.file) {
              const formData = new FormData();
              formData.append("file", resource.file);
              await request(apiBase, `/learning-resources/${createdResource.data.id}/${resource.resourceType === "SCORM" ? "scorm" : "file"}`, { method: "POST", body: formData });
            }
          }
        }

        for (const assignment of module.assignments) {
          setProgress(`Adding assignment in ${module.title}…`);
          await request(apiBase, "/assignments", {
            method: "POST",
            body: JSON.stringify({
              courseId,
              moduleId,
              title: assignment.title.trim(),
              description: assignment.description.trim() || undefined,
              instructions: assignment.instructions.trim(),
              dueAt: assignment.dueAt ? new Date(assignment.dueAt).toISOString() : undefined,
              maxMarks: Number(assignment.maxMarks),
            }),
          });
        }

        for (const assessment of module.assessments) {
          setProgress(`Adding assessment in ${module.title}…`);
          const createdAssessment = await request<ApiResponse>(apiBase, "/assessments", {
            method: "POST",
            body: JSON.stringify({
              courseId,
              moduleId,
              title: assessment.title.trim(),
              description: assessment.description.trim() || undefined,
              assessmentType: assessment.assessmentType,
              totalMarks: Number(assessment.totalMarks),
              passingMarks: Number(assessment.passingMarks),
              durationMinutes: numberOrUndefined(assessment.durationMinutes),
              attemptLimit: Number(assessment.attemptLimit),
            }),
          });
          for (let questionIndex = 0; questionIndex < assessment.questions.length; questionIndex += 1) {
            const question = assessment.questions[questionIndex];
            setProgress(`Adding question ${questionIndex + 1} in ${assessment.title}…`);
            await request(apiBase, `/assessments/${createdAssessment.data.id}/questions`, {
              method: "POST",
              body: JSON.stringify({
                prompt: question.prompt.trim(),
                questionType: question.questionType,
                marks: Number(question.marks),
                sequence: questionIndex + 1,
                options: parseOptions(question.options),
              }),
            });
          }
        }
      }
      setProgress("");
      onCreated(course.title.trim());
    } catch (reason) {
      setError(reason instanceof Error ? `${reason.message} The course record was created, but the remaining draft items were not completed.` : "The course was created, but one of its child records could not be saved.");
      setProgress("");
    } finally {
      setSaving(false);
    }
  }

  function goToStep(next: number) {
    setError("");
    if (next > 0 && (!course.title.trim() || !course.code.trim())) {
      setError("Add a course title and course code before continuing.");
      setStep(0);
      return;
    }
    setStep(Math.max(0, Math.min(3, next)));
  }

  function renderModuleForm() {
    if (!moduleDraft) return null;
    return <form className="builder-inline-form" onSubmit={saveModule}>
      <div className="builder-form-heading"><strong>{editingId ? "Edit module" : "Add module"}</strong><button type="button" className="builder-link" onClick={() => { setModuleDraft(null); setEditingId(""); }}>Cancel</button></div>
      <label>Module title *<input autoFocus required minLength={2} value={moduleDraft.title} onChange={(event) => setModuleDraft({ ...moduleDraft, title: event.target.value })} placeholder="e.g. Foundations" /></label>
      <label>Description<textarea rows={2} value={moduleDraft.description} onChange={(event) => setModuleDraft({ ...moduleDraft, description: event.target.value })} placeholder="What this module covers" /></label>
      <button className="primary-button compact-button" type="submit">{editingId ? "Save module" : "Add module"}</button>
    </form>;
  }

  function renderLessonForm() {
    if (!lessonDraft) return null;
    return <form className="builder-inline-form" onSubmit={saveLesson}>
      <div className="builder-form-heading"><strong>{editingId ? "Edit lesson" : "Add lesson"}</strong><button type="button" className="builder-link" onClick={() => { setLessonDraft(null); setEditingId(""); }}>Cancel</button></div>
      <label>Lesson title *<input autoFocus required minLength={2} value={lessonDraft.title} onChange={(event) => setLessonDraft({ ...lessonDraft, title: event.target.value })} placeholder="e.g. Getting started" /></label>
      <label>Description<textarea rows={2} value={lessonDraft.description} onChange={(event) => setLessonDraft({ ...lessonDraft, description: event.target.value })} /></label>
      <label>Estimated duration (minutes)<input min={0} type="number" value={lessonDraft.estimatedDuration} onChange={(event) => setLessonDraft({ ...lessonDraft, estimatedDuration: event.target.value })} /></label>
      <button className="primary-button compact-button" type="submit">{editingId ? "Save lesson" : "Add lesson"}</button>
    </form>;
  }

  function renderResourceForm() {
    if (!resourceDraft) return null;
    const onFile = (event: ChangeEvent<HTMLInputElement>) => setResourceDraft({ ...resourceDraft, file: event.target.files?.[0] || null });
    return <form className="builder-inline-form" onSubmit={saveResource}>
      <div className="builder-form-heading"><strong>{editingId ? "Edit resource" : "Add resource"}</strong><button type="button" className="builder-link" onClick={() => { setResourceDraft(null); setEditingId(""); }}>Cancel</button></div>
      <label>Resource title *<input autoFocus required minLength={2} value={resourceDraft.title} onChange={(event) => setResourceDraft({ ...resourceDraft, title: event.target.value })} placeholder="e.g. Workbook or lesson video" /></label>
      <div className="builder-two-col"><label>Type<select value={resourceDraft.resourceType} onChange={(event) => setResourceDraft({ ...resourceDraft, resourceType: event.target.value as ResourceType })}>{resourceTypes.map((type) => <option key={type} value={type}>{labelForType(type)}</option>)}</select></label><label>Duration (minutes)<input min={0} type="number" value={resourceDraft.duration} onChange={(event) => setResourceDraft({ ...resourceDraft, duration: event.target.value })} /></label></div>
      <label>Video or external URL<input type="url" value={resourceDraft.url} onChange={(event) => setResourceDraft({ ...resourceDraft, url: event.target.value })} placeholder="https://…" /></label>
      {["PDF", "DOCUMENT", "PRESENTATION", "SCORM"].includes(resourceDraft.resourceType) && <label>{resourceDraft.resourceType === "SCORM" ? "SCORM package (.zip)" : "Managed document"}<input type="file" accept={resourceDraft.resourceType === "SCORM" ? ".zip,application/zip" : ".pdf,.doc,.docx,.odt,.ppt,.pptx,.odp"} onChange={onFile} />{resourceDraft.file && <span className="selected-file">{resourceDraft.file.name} · {(resourceDraft.file.size / 1024 / 1024).toFixed(1)} MB</span>}</label>}
      <p className="field-hint">Resources are stored securely and remain attached to this lesson.</p>
      <button className="primary-button compact-button" type="submit">{editingId ? "Save resource" : "Add resource"}</button>
    </form>;
  }

  function renderAssignmentForm() {
    if (!assignmentDraft) return null;
    return <form className="builder-inline-form" onSubmit={saveAssignment}>
      <div className="builder-form-heading"><strong>{editingId ? "Edit assignment" : "Add assignment"}</strong><button type="button" className="builder-link" onClick={() => { setAssignmentDraft(null); setEditingId(""); }}>Cancel</button></div>
      <label>Assignment title *<input autoFocus required minLength={2} value={assignmentDraft.title} onChange={(event) => setAssignmentDraft({ ...assignmentDraft, title: event.target.value })} /></label>
      <label>Instructions *<textarea required minLength={2} rows={4} value={assignmentDraft.instructions} onChange={(event) => setAssignmentDraft({ ...assignmentDraft, instructions: event.target.value })} placeholder="Tell learners what to submit" /></label>
      <label>Description<textarea rows={2} value={assignmentDraft.description} onChange={(event) => setAssignmentDraft({ ...assignmentDraft, description: event.target.value })} /></label>
      <div className="builder-two-col"><label>Max marks *<input required min={0.01} step="0.01" type="number" value={assignmentDraft.maxMarks} onChange={(event) => setAssignmentDraft({ ...assignmentDraft, maxMarks: event.target.value })} /></label><label>Due date (optional)<input type="datetime-local" value={assignmentDraft.dueAt} onChange={(event) => setAssignmentDraft({ ...assignmentDraft, dueAt: event.target.value })} /></label></div>
      <button className="primary-button compact-button" type="submit">{editingId ? "Save assignment" : "Add assignment"}</button>
    </form>;
  }

  function renderAssessmentForm() {
    if (!assessmentDraft) return null;
    return <div className="builder-inline-form">
      <div className="builder-form-heading"><strong>{editingId ? "Edit assessment" : "Add assessment"}</strong><button type="button" className="builder-link" onClick={() => { setAssessmentDraft(null); setEditingId(""); }}>Done</button></div>
      <form onSubmit={saveAssessment}>
        <label>Assessment title *<input autoFocus required minLength={2} value={assessmentDraft.title} onChange={(event) => setAssessmentDraft({ ...assessmentDraft, title: event.target.value })} /></label>
        <label>Description<textarea rows={2} value={assessmentDraft.description} onChange={(event) => setAssessmentDraft({ ...assessmentDraft, description: event.target.value })} /></label>
        <div className="builder-two-col"><label>Type<select value={assessmentDraft.assessmentType} onChange={(event) => setAssessmentDraft({ ...assessmentDraft, assessmentType: event.target.value as AssessmentType })}>{assessmentTypes.map((type) => <option key={type} value={type}>{labelForType(type)}</option>)}</select></label><label>Attempts<input required min={1} type="number" value={assessmentDraft.attemptLimit} onChange={(event) => setAssessmentDraft({ ...assessmentDraft, attemptLimit: event.target.value })} /></label></div>
        <div className="builder-two-col"><label>Total marks *<input required min={0} step="0.01" type="number" value={assessmentDraft.totalMarks} onChange={(event) => setAssessmentDraft({ ...assessmentDraft, totalMarks: event.target.value })} /></label><label>Passing marks *<input required min={0} step="0.01" type="number" value={assessmentDraft.passingMarks} onChange={(event) => setAssessmentDraft({ ...assessmentDraft, passingMarks: event.target.value })} /></label></div>
        <label>Duration (minutes)<input min={1} type="number" value={assessmentDraft.durationMinutes} onChange={(event) => setAssessmentDraft({ ...assessmentDraft, durationMinutes: event.target.value })} /></label>
        <button className="primary-button compact-button" type="submit">{editingId ? "Save assessment" : "Add assessment"}</button>
      </form>
      <div className="builder-subsection">
        <div className="builder-form-heading"><strong>Questions ({assessmentDraft.questions.length})</strong><button type="button" className="builder-link" onClick={() => { setEditingId(""); setQuestionDraft(newQuestion()); }}>+ Add question</button></div>
        {assessmentDraft.questions.map((question, index) => <div className="builder-mini-row" key={question.id}><span><strong>{index + 1}. {question.prompt || "Untitled question"}</strong><small>{labelForType(question.questionType)} · {question.marks} marks</small></span><button type="button" className="builder-link" onClick={() => { setEditingId(question.id); setQuestionDraft({ ...question }); }}>Edit</button><button type="button" className="builder-danger" onClick={() => setAssessmentDraft({ ...assessmentDraft, questions: assessmentDraft.questions.filter((item) => item.id !== question.id) })}>Remove</button></div>)}
        {questionDraft && <form className="builder-question-form" onSubmit={saveQuestion}><label>Question prompt *<textarea required minLength={2} rows={3} value={questionDraft.prompt} onChange={(event) => setQuestionDraft({ ...questionDraft, prompt: event.target.value })} /></label><div className="builder-two-col"><label>Type<select value={questionDraft.questionType} onChange={(event) => setQuestionDraft({ ...questionDraft, questionType: event.target.value as QuestionType })}>{questionTypes.map((type) => <option key={type} value={type}>{labelForType(type)}</option>)}</select></label><label>Marks *<input required min={0.01} step="0.01" type="number" value={questionDraft.marks} onChange={(event) => setQuestionDraft({ ...questionDraft, marks: event.target.value })} /></label></div><label>Options (value|label|true/false, one per line)<textarea rows={4} value={questionDraft.options} onChange={(event) => setQuestionDraft({ ...questionDraft, options: event.target.value })} placeholder={"a|Option A|true\\nb|Option B|false"} /></label><button className="primary-button compact-button" type="submit">{editingId ? "Save question" : "Add question"}</button></form>}
      </div>
    </div>;
  }

  function renderHierarchy() {
    return <div className="builder-hierarchy">
      {modules.length === 0 && <div className="builder-empty">No modules yet. Add at least one module to start shaping the course.</div>}
      {modules.map((module, moduleIndex) => <article className={`builder-module-card ${selectedModuleId === module.id ? "selected" : ""}`} key={module.id}>
        <div className="builder-node-row"><button type="button" className="builder-node-title" onClick={() => selectModule(module.id)}><span className="builder-node-number">{moduleIndex + 1}</span><span><strong>{module.title || "Untitled module"}</strong><small>{module.lessons.length} lesson{module.lessons.length === 1 ? "" : "s"} · {module.assignments.length} assignment{module.assignments.length === 1 ? "" : "s"} · {module.assessments.length} assessment{module.assessments.length === 1 ? "" : "s"}</small></span></button><span className="builder-row-actions"><button type="button" className="builder-link" onClick={() => moveModule(moduleIndex, -1)} disabled={moduleIndex === 0}>↑</button><button type="button" className="builder-link" onClick={() => moveModule(moduleIndex, 1)} disabled={moduleIndex === modules.length - 1}>↓</button><button type="button" className="builder-link" onClick={() => beginModule(module)}>Edit</button><button type="button" className="builder-danger" onClick={() => removeModule(module.id)}>Remove</button></span></div>
        {selectedModuleId === module.id && <div className="builder-children">
          {module.lessons.map((lesson, lessonIndex) => <div className={`builder-lesson-row ${selectedLessonId === lesson.id ? "selected" : ""}`} key={lesson.id}><button type="button" className="builder-node-title" onClick={() => { setSelectedLessonId(lesson.id); setResourceDraft(null); }}><span className="builder-child-mark">L</span><span><strong>{lesson.title || "Untitled lesson"}</strong><small>{lesson.resources.length} resource{lesson.resources.length === 1 ? "" : "s"}</small></span></button><span className="builder-row-actions"><button type="button" className="builder-link" onClick={() => moveLesson(lessonIndex, -1)} disabled={lessonIndex === 0}>↑</button><button type="button" className="builder-link" onClick={() => moveLesson(lessonIndex, 1)} disabled={lessonIndex === module.lessons.length - 1}>↓</button><button type="button" className="builder-link" onClick={() => beginLesson(lesson)}>Edit</button><button type="button" className="builder-danger" onClick={() => removeLesson(lesson.id)}>Remove</button></span></div>)}
          {module.assignments.map((assignment) => <div className="builder-asset-row" key={assignment.id}><span className="builder-child-mark">A</span><span><strong>{assignment.title || "Untitled assignment"}</strong><small>Assignment · {assignment.maxMarks} marks</small></span><button type="button" className="builder-link" onClick={() => beginAssignment(assignment)}>Edit</button><button type="button" className="builder-danger" onClick={() => setModules((current) => current.map((item) => item.id === module.id ? { ...item, assignments: item.assignments.filter((entry) => entry.id !== assignment.id) } : item))}>Remove</button></div>)}
          {module.assessments.map((assessment) => <div className="builder-asset-row" key={assessment.id}><span className="builder-child-mark">Q</span><span><strong>{assessment.title || "Untitled assessment"}</strong><small>Assessment · {assessment.questions.length} question{assessment.questions.length === 1 ? "" : "s"}</small></span><button type="button" className="builder-link" onClick={() => beginAssessment(assessment)}>Edit</button><button type="button" className="builder-danger" onClick={() => setModules((current) => current.map((item) => item.id === module.id ? { ...item, assessments: item.assessments.filter((entry) => entry.id !== assessment.id) } : item))}>Remove</button></div>)}
          <button type="button" className="builder-add-child" onClick={() => beginLesson()}>+ Add lesson to this module</button>
        </div>}
      </article>)}
    </div>;
  }

  const counts = modules.reduce((summary, module) => ({
    modules: summary.modules + 1,
    lessons: summary.lessons + module.lessons.length,
    resources: summary.resources + module.lessons.reduce((total, lesson) => total + lesson.resources.length, 0),
    assignments: summary.assignments + module.assignments.length,
    assessments: summary.assessments + module.assessments.length,
  }), { modules: 0, lessons: 0, resources: 0, assignments: 0, assessments: 0 });

  return <div className="builder-backdrop" role="presentation">
    <section className="course-builder" role="dialog" aria-modal="true" aria-labelledby="course-builder-title">
      <header className="builder-header"><div><div className="eyebrow">Course authoring</div><h2 id="course-builder-title">Create a complete course</h2><p>Build the structure first. Nothing is added to the catalogue until you finish.</p></div><button type="button" className="close-button" onClick={onClose} disabled={saving} aria-label="Close course builder">×</button></header>
      <nav className="builder-steps" aria-label="Course builder steps">{["Details", "Structure", "Activities", "Review"].map((label, index) => <button type="button" className={step === index ? "active" : step > index ? "complete" : ""} key={label} onClick={() => goToStep(index)}><span>{index + 1}</span>{label}</button>)}</nav>
      <div className="builder-body">
        {error && <div className="builder-alert">{error}</div>}
        {step === 0 && <div className="builder-panel"><div className="builder-panel-heading"><div><h3>Basic course details</h3><p>These details become the course catalogue record on final creation.</p></div><span className="builder-required">* Required</span></div><div className="builder-form-grid"><label>Course title *<input autoFocus required minLength={2} value={course.title} onChange={(event) => updateCourse("title", event.target.value)} placeholder="e.g. Digital Productivity Essentials" /></label><label>Course code *<input required minLength={2} pattern="[A-Za-z0-9][A-Za-z0-9_-]*" value={course.code} onChange={(event) => updateCourse("code", event.target.value)} placeholder="e.g. DPE-101" /></label><label className="builder-span-two">Description<textarea rows={5} value={course.description} onChange={(event) => updateCourse("description", event.target.value)} placeholder="Describe what learners will achieve." /></label><label className="builder-span-two">Thumbnail URL (optional)<input type="url" value={course.thumbnail} onChange={(event) => updateCourse("thumbnail", event.target.value)} placeholder="https://…" /></label><label>Price in INR (optional)<input min={0} step="0.01" type="number" value={course.price} onChange={(event) => updateCourse("price", event.target.value)} placeholder="0.00" /></label><label className="builder-check"><input type="checkbox" checked={course.purchasable} onChange={(event) => updateCourse("purchasable", event.target.checked)} /> Available for learner purchase</label></div><div className="builder-note"><strong>Completion settings</strong><span>Lesson completion is tracked by the existing learner progress service. Add resources, assignments, and assessments to define the learning path; no unsupported completion fields are added here.</span></div></div>}
        {step === 1 && <div className="builder-panel"><div className="builder-panel-heading"><div><h3>Course structure</h3><p>Arrange the Course → Module → Lesson hierarchy. Assignments and assessments are attached to modules.</p></div><button type="button" className="primary-button compact-button" onClick={() => beginModule()}>+ Add module</button></div>{renderModuleForm()}{renderLessonForm()}{renderHierarchy()}{selectedModule && selectedLesson && <div className="builder-selection-note">Selected: <strong>{selectedModule.title}</strong> / {selectedLesson.title}</div>}</div>}
        {step === 2 && <div className="builder-panel"><div className="builder-panel-heading"><div><h3>Add learning content</h3><p>Choose a lesson for resources, or a module for assignments and assessments.</p></div></div><div className="builder-picker-grid"><label>Lesson resources<select value={selectedLessonId} onChange={(event) => { setSelectedLessonId(event.target.value); setResourceDraft(null); }}>{allLessons.length === 0 && <option value="">Add a lesson first</option>}{allLessons.map(({ module, lesson }) => <option key={lesson.id} value={lesson.id}>{module.title || "Module"} / {lesson.title || "Lesson"}</option>)}</select></label><label>Module activities<select value={selectedModuleId} onChange={(event) => selectModule(event.target.value)}>{modules.length === 0 && <option value="">Add a module first</option>}{modules.map((module) => <option key={module.id} value={module.id}>{module.title || "Module"}</option>)}</select></label></div><div className="builder-activity-columns"><div className="builder-activity-card"><div className="builder-form-heading"><strong>Resources {selectedLesson ? `in ${selectedLesson.title}` : ""}</strong><button type="button" className="builder-link" disabled={!selectedLesson} onClick={() => beginResource()}>+ Add resource</button></div>{selectedLesson?.resources.map((resource) => <div className="builder-mini-row" key={resource.id}><span><strong>{resource.title || "Untitled resource"}</strong><small>{labelForType(resource.resourceType)}{resource.file ? ` · ${resource.file.name}` : ""}</small></span><button type="button" className="builder-link" onClick={() => beginResource(resource)}>Edit</button><button type="button" className="builder-danger" onClick={() => removeResource(resource.id)}>Remove</button></div>)}{resourceDraft && renderResourceForm()}</div><div className="builder-activity-card"><div className="builder-form-heading"><strong>Assignments {selectedModule ? `in ${selectedModule.title}` : ""}</strong><button type="button" className="builder-link" disabled={!selectedModule} onClick={() => beginAssignment()}>+ Add assignment</button></div>{selectedModule?.assignments.map((assignment) => <div className="builder-mini-row" key={assignment.id}><span><strong>{assignment.title || "Untitled assignment"}</strong><small>{assignment.maxMarks} marks</small></span><button type="button" className="builder-link" onClick={() => beginAssignment(assignment)}>Edit</button><button type="button" className="builder-danger" onClick={() => setModules((current) => current.map((module) => module.id === selectedModule.id ? { ...module, assignments: module.assignments.filter((item) => item.id !== assignment.id) } : module))}>Remove</button></div>)}{assignmentDraft && renderAssignmentForm()}</div><div className="builder-activity-card"><div className="builder-form-heading"><strong>Assessments {selectedModule ? `in ${selectedModule.title}` : ""}</strong><button type="button" className="builder-link" disabled={!selectedModule} onClick={() => beginAssessment()}>+ Add assessment</button></div>{selectedModule?.assessments.map((assessment) => <div className="builder-mini-row" key={assessment.id}><span><strong>{assessment.title || "Untitled assessment"}</strong><small>{assessment.questions.length} question{assessment.questions.length === 1 ? "" : "s"}</small></span><button type="button" className="builder-link" onClick={() => beginAssessment(assessment)}>Edit</button><button type="button" className="builder-danger" onClick={() => setModules((current) => current.map((module) => module.id === selectedModule.id ? { ...module, assessments: module.assessments.filter((item) => item.id !== assessment.id) } : module))}>Remove</button></div>)}{assessmentDraft && renderAssessmentForm()}</div></div></div>}
        {step === 3 && <div className="builder-panel"><div className="builder-panel-heading"><div><h3>Review course hierarchy</h3><p>Check the complete structure before creating the catalogue record.</p></div></div><div className="builder-review-head"><div><span className="eyebrow">Course</span><h3>{course.title || "Untitled course"}</h3><p>{course.code || "No course code"}{course.purchasable ? " · Purchasable" : ""}</p></div><div className="builder-counts">{Object.entries(counts).map(([key, value]) => <span key={key}><strong>{value}</strong>{key}</span>)}</div></div>{renderHierarchy()}<div className="builder-note"><strong>Final create</strong><span>The course is created first so every child record can use a real parent ID. If a later API step fails, the message will identify the partial save rather than silently discarding it.</span></div></div>}
      </div>
      <footer className="builder-footer"><button type="button" className="secondary-button" onClick={step === 0 ? onClose : () => goToStep(step - 1)} disabled={saving}>{step === 0 ? "Cancel" : "Back"}</button><span className="builder-progress">{saving ? progress : `${step + 1} of 4`}</span>{step < 3 ? <button type="button" className="primary-button" onClick={() => goToStep(step + 1)} disabled={saving}>{step === 2 ? "Review course" : "Continue"}</button> : <button type="button" className="primary-button" onClick={() => void createCourse()} disabled={saving || !course.title.trim() || !course.code.trim() || !programmeId}>{saving ? "Creating course…" : "Create Course"}</button>}</footer>
    </section>
  </div>;
}