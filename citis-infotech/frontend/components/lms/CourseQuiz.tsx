"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, CircleHelp, RotateCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { QuizQuestion } from "@/lib/lms-courses";

function quizStorageKey(courseSlug: string) {
  return `citis-lms-quiz-score:${courseSlug}`;
}

export function CourseQuiz({ courseSlug, questions }: { courseSlug: string; questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedScore = window.localStorage.getItem(quizStorageKey(courseSlug));
    if (storedScore !== null) setScore(Number(storedScore));
  }, [courseSlug]);

  function submitQuiz(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (Object.keys(answers).length !== questions.length) {
      setError("Answer every question before submitting the quiz.");
      return;
    }
    const totalCorrect = questions.filter((question) => answers[question.id] === question.correctAnswer).length;
    setScore(totalCorrect);
    setError("");
    window.localStorage.setItem(quizStorageKey(courseSlug), String(totalCorrect));
  }

  function retakeQuiz() {
    setAnswers({});
    setScore(null);
    setError("");
    window.localStorage.removeItem(quizStorageKey(courseSlug));
  }

  return (
    <Card>
      <CardHeader><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Knowledge check</p><CardTitle className="mt-2">Course Quiz</CardTitle></div><CircleHelp className="size-6 text-primary" /></div><p className="text-sm leading-6 text-muted-foreground">Test your understanding with these quick multiple-choice questions.</p></CardHeader>
      <CardContent>
        {score === null ? (
          <form onSubmit={submitQuiz} className="space-y-6">
            {questions.map((question, index) => <fieldset key={question.id} className="space-y-3"><legend className="font-semibold leading-6 text-[#123d5c]">{index + 1}. {question.question}</legend><div className="grid gap-2">{question.options.map((option, optionIndex) => <label key={option} className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3 text-sm leading-6 transition-colors hover:border-primary/40 has-[:checked]:border-primary has-[:checked]:bg-primary/[0.04]"><input type="radio" name={question.id} value={optionIndex} checked={answers[question.id] === optionIndex} onChange={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))} className="mt-1 accent-[#0f4c81]" />{option}</label>)}</div></fieldset>)}
            {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
            <Button type="submit" variant="accent">Submit Quiz <Trophy /></Button>
          </form>
        ) : (
          <div className="rounded-2xl bg-[#f5f9fc] p-6 text-center"><span className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 className="size-6" /></span><p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-primary">Quiz complete</p><h3 className="mt-2 font-heading text-2xl font-bold text-[#123d5c]">You scored {score} / {questions.length}</h3><p className="mt-2 text-sm text-muted-foreground">{Math.round((score / questions.length) * 100)}% correct · Your score is saved for this course.</p><Button type="button" variant="outline" className="mt-5" onClick={retakeQuiz}><RotateCcw />Retake Quiz</Button></div>
        )}
      </CardContent>
    </Card>
  );
}