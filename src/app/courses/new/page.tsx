"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ComboboxWithCreate } from "@/components/ui/combobox-with-create";

interface Subject {
  id: string;
  name: string;
}

interface Strand {
  id: string;
  name: string;
}

interface GradeBand {
  id: string;
  name: string;
}

export default function NewCoursePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedStrand, setSelectedStrand] = useState<string>("");
  const [selectedGradeBand, setSelectedGradeBand] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [strands, setStrands] = useState<Strand[]>([]);
  const [gradeBands, setGradeBands] = useState<GradeBand[]>([]);

  useEffect(() => {
    // Load subjects and grade bands
    Promise.all([
      fetch("/api/curriculum/subjects").then((r) => r.json()),
      fetch("/api/curriculum/grade-bands").then((r) => r.json()),
    ]).then(([subjectsData, gradeBandsData]) => {
      setSubjects(subjectsData.subjects || []);
      setGradeBands(gradeBandsData.gradeBands || []);

      // Pre-fill from URL params
      const bookId = searchParams.get("bookId");
      if (bookId) {
        // Could fetch book's subject/strand here
      }
    });
  }, [searchParams]);

  useEffect(() => {
    if (selectedSubject) {
      fetch(`/api/curriculum/strands?subjectId=${selectedSubject}`)
        .then((res) => res.json())
        .then((data) => setStrands(data.strands || []))
        .catch(console.error);
    } else {
      setStrands([]);
    }
  }, [selectedSubject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      if (!selectedSubject) {
        alert("Please select a subject");
        setIsCreating(false);
        return;
      }

      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          subjectId: selectedSubject,
          strandId: selectedStrand || null,
          gradeBandId: selectedGradeBand || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create course");
      }

      const data = await response.json();
      router.push(`/courses/${data.course.id}/builder`);
    } catch (error) {
      console.error("Course creation failed:", error);
      alert("Failed to create course. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-2xl">Create New Course</CardTitle>
          <CardDescription>Set up a new course for your students</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Introduction to Algebra"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the course"
                className="mt-2 w-full min-h-[100px] rounded-qc-md border border-qc-border-subtle px-3 py-2 font-body text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-qc-primary focus-visible:ring-offset-2"
              />
            </div>

            <div>
              <Label htmlFor="subject" className="font-body">
                Subject *
              </Label>
              <ComboboxWithCreate
                options={subjects.map(s => ({ label: s.name, value: s.id }))}
                value={selectedSubject}
                onSelect={(val) => {
                  setSelectedSubject(val);
                  setSelectedStrand("");
                }}
                onCreate={(val) => {
                  // Start simplified handling: assume ID = Name for new items
                  // In real app, we'd create the record first or handle it in backend
                  // For now, we will assume backend handles ID or Name
                  const tempId = `new:${val}`;
                  setSubjects([...subjects, { id: tempId, name: val }]);
                  setSelectedSubject(tempId);
                  setSelectedStrand("");
                }}
                placeholder="Select or create a subject"
              />
            </div>

            <div>
              <Label htmlFor="strand" className="font-body">
                Strand *
              </Label>
              <ComboboxWithCreate
                options={strands.map(s => ({ label: s.name, value: s.id }))}
                value={selectedStrand}
                onSelect={setSelectedStrand}
                onCreate={(val) => {
                  const tempId = `new:${val}`;
                  setStrands([...strands, { id: tempId, name: val }]);
                  setSelectedStrand(tempId);
                }}
                placeholder="Select or create a strand"
                disabled={!selectedSubject}
              />
            </div>

            <div>
              <Label htmlFor="gradeBand" className="font-body">
                Grade Band (Optional)
              </Label>
              <select
                id="gradeBand"
                value={selectedGradeBand}
                onChange={(e) => setSelectedGradeBand(e.target.value)}
                className="mt-2 flex h-10 w-full rounded-qc-md border border-qc-border-subtle bg-white px-3 py-2 font-body text-sm text-qc-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-qc-primary focus-visible:ring-offset-2"
              >
                <option value="">Select a grade band (optional)</option>
                {gradeBands.map((band) => (
                  <option key={band.id} value={band.id}>
                    {band.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating || !title.trim() || !selectedSubject || !selectedStrand}>
                {isCreating ? "Creating..." : "Create Course"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


