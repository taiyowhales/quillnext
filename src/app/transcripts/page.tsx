import { auth } from "@/auth";
import { getCurrentUserOrg } from "@/lib/auth-helpers";
import { db } from "@/server/db";
import { Student, Transcript } from "@/generated/client";
import { format } from "date-fns";
import Link from "next/link";
import { redirect } from "next/navigation";
import { GraduationCap, FileText, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function TranscriptsPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/api/auth/signin");

    try {
        const { organizationId } = await getCurrentUserOrg(session);

        if (!organizationId) {
            return (
                <div className="container mx-auto py-12 text-center text-red-500">
                    <h3 className="text-lg font-bold">Organization Not Found</h3>
                    <p>Please complete onboarding to set up your organization.</p>
                    <Link href="/onboarding">
                        <Button variant="outline" className="mt-4">Go to Onboarding</Button>
                    </Link>
                </div>
            );
        }

        const students = await (db as any).student.findMany({
            where: { organizationId },
            include: {
                transcripts: {
                    orderBy: { updatedAt: "desc" },
                    take: 1
                }
            }
        }) as (Student & { transcripts: Transcript[] })[];

        return (
            <div className="container mx-auto py-8 max-w-5xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[#383A57]">Transcripts</h1>
                        <p className="text-gray-500 mt-1">Manage and generate official transcripts for your students.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {students.map((student) => (
                        <Card key={student.id} className="hover:shadow-md transition-shadow border-t-4 border-t-[#563963]">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="h-10 w-10 rounded-full bg-[#563963]/10 flex items-center justify-center text-[#563963]">
                                        <GraduationCap className="h-5 w-5" />
                                    </div>
                                    {student.transcripts.length > 0 && (
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium flex items-center">
                                            <FileText className="h-3 w-3 mr-1" />
                                            {student.transcripts.length} Saved
                                        </span>
                                    )}
                                </div>
                                <CardTitle className="mt-4 text-[#383A57]">{student.firstName} {student.lastName}</CardTitle>
                                <CardDescription>
                                    Grade {student.currentGrade || "N/A"} • {student.birthdate ? format(student.birthdate, "MMM d, yyyy") : "No DOB"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {student.transcripts.length > 0 ? (
                                        <div className="text-sm text-gray-500 flex items-center bg-gray-50 p-2 rounded">
                                            <Clock className="h-3 w-3 mr-2" />
                                            Last updated {format(student.transcripts[0].updatedAt, "MMM d, yyyy")}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic py-2">No transcripts generated yet.</p>
                                    )}

                                    <Link href={`/transcripts/${student.id}`} className="block">
                                        <Button className="w-full bg-[#383A57] hover:bg-[#383A57]/90 group">
                                            <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                                            {student.transcripts.length > 0 ? "Edit Transcript" : "Create Transcript"}
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {students.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-gray-50 rounded-lg border border-dashed">
                            <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No students found</h3>
                            <p className="text-gray-500 mt-1">Add students to your organization to generate transcripts.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    } catch (error) {
        console.error("Transcripts Page Error:", error);
        return (
            <div className="container mx-auto py-12 text-center text-red-500">
                <h3 className="text-lg font-bold">Error Loading Students</h3>
                <p>Please ensure you have set up your organization.</p>
                <Link href="/">
                    <Button variant="outline" className="mt-4">Go Home</Button>
                </Link>
            </div>
        );
    }
}
