"use client";

import React, { useState, useEffect } from "react";
import { AppClientLayout } from "@/components/layout/AppClientLayout";
import { Badge } from "@/components/ui/Badge";
import {
  UserCheck,
  GraduationCap,
  Briefcase,
  Code2,
  FolderGit2,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
  Link as LinkIcon,
} from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Skill modal state
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [newSkill, setNewSkill] = useState({
    name: "",
    category: "Programming Languages",
    proficiencyLevel: "INTERMEDIATE",
    isVerified: false,
    verificationSource: "",
    evidenceNotes: "",
  });

  // Project modal state
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    problemSolved: "",
    technologies: "",
    personalContribution: "",
    githubUrl: "",
    liveUrl: "",
    evidenceNotes: "",
  });

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: profile.displayName,
          institution: profile.institution,
          degree: profile.degree,
          branch: profile.branch,
          currentSemester: Number(profile.currentSemester),
          graduationYear: Number(profile.graduationYear),
          cgpa: Number(profile.cgpa),
          location: profile.location,
          workPreference: profile.workPreference,
          minStipend: Number(profile.minStipend),
          bio: profile.bio,
          headline: profile.headline,
        }),
      });

      if (res.ok) {
        setMessage({ text: "Profile details updated successfully!", type: "success" });
      } else {
        setMessage({ text: "Failed to update profile", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error saving profile", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSkill),
      });
      if (res.ok) {
        setShowSkillModal(false);
        setNewSkill({
          name: "",
          category: "Programming Languages",
          proficiencyLevel: "INTERMEDIATE",
          isVerified: false,
          verificationSource: "",
          evidenceNotes: "",
        });
        fetchProfile();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    try {
      const res = await fetch(`/api/skills?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const techArray = newProject.technologies.split(",").map((t) => t.trim()).filter(Boolean);
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newProject,
          technologies: techArray,
        }),
      });
      if (res.ok) {
        setShowProjectModal(false);
        setNewProject({
          title: "",
          description: "",
          problemSolved: "",
          technologies: "",
          personalContribution: "",
          githubUrl: "",
          liveUrl: "",
          evidenceNotes: "",
        });
        fetchProfile();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs font-mono">
        Loading student evidence profile...
      </div>
    );
  }

  return (
    <AppClientLayout>
      <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Student Evidence Profile</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Maintain your verified academic cutoffs, code repositories, and work experiences.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="primary" dot>
            {profile?.profileCompletion || 80}% Evidence Completeness
          </Badge>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30"
              : "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleUpdateProfile} className="space-y-6">
        {/* Personal & Academic Details */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Academic Qualifications & Cutoffs</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={profile?.displayName || ""}
                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">College / University</label>
              <input
                type="text"
                value={profile?.institution || ""}
                onChange={(e) => setProfile({ ...profile, institution: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Degree</label>
              <input
                type="text"
                value={profile?.degree || ""}
                onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Branch / Major</label>
              <input
                type="text"
                value={profile?.branch || ""}
                onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                Graduation Year (Strict Eligibility Filter)
              </label>
              <input
                type="number"
                value={profile?.graduationYear || 2026}
                onChange={(e) => setProfile({ ...profile, graduationYear: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                Current CGPA / Grade (Cutoff Filter)
              </label>
              <input
                type="number"
                step="0.01"
                value={profile?.cgpa || 8.0}
                onChange={(e) => setProfile({ ...profile, cgpa: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Current Location</label>
              <input
                type="text"
                value={profile?.location || ""}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Work Arrangement</label>
              <select
                value={profile?.workPreference || "ANY"}
                onChange={(e) => setProfile({ ...profile, workPreference: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="REMOTE">Remote Only</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ONSITE">Onsite</option>
                <option value="ANY">Flexible / Any</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Minimum Stipend Expectation</label>
              <input
                type="number"
                value={profile?.minStipend || 0}
                onChange={(e) => setProfile({ ...profile, minStipend: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1 text-xs">Bio & Engineering Focus</label>
            <textarea
              rows={2}
              value={profile?.bio || ""}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-sm shadow-blue-600/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? "Saving..." : "Save Academic Details"}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Skills Matrix: Verified vs Self-Reported */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Skills & Verification Matrix</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The engine requires concrete proof links before grading a required skill as 'Satisfied'.
            </p>
          </div>
          <button
            onClick={() => setShowSkillModal(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Skill</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {profile?.skills?.map((item: any) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                item.isVerified
                  ? "bg-blue-50/40 dark:bg-slate-950/60 border-blue-200 dark:border-blue-500/30"
                  : "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{item.skill.name}</span>
                  {item.isVerified ? (
                    <Badge variant="official">Verified</Badge>
                  ) : (
                    <Badge variant="unknown">Self-Reported</Badge>
                  )}
                </div>

                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  Level: <strong className="text-slate-800 dark:text-slate-300">{item.proficiencyLevel}</strong>
                </div>

                {item.verificationSource && (
                  <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1">
                    Proof: {item.verificationSource}
                  </div>
                )}

                {item.evidenceNotes && (
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {item.evidenceNotes}
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-3 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
                <button
                  onClick={() => handleDeleteSkill(item.id)}
                  className="text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 p-1 transition-colors"
                  title="Delete Skill"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Projects with Live Links */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Evidence Projects & Code Repositories</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Demonstrated codebase proof used by the Investigation Engine to satisfy requirements.
            </p>
          </div>
          <button
            onClick={() => setShowProjectModal(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Project</span>
          </button>
        </div>

        <div className="space-y-4">
          {profile?.projects?.map((project: any) => {
            let techs: string[] = [];
            try {
              techs = JSON.parse(project.technologies);
            } catch {}

            return (
              <div
                key={project.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                      {project.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{project.description}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 p-1 transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {project.problemSolved && (
                  <div className="text-[11px] text-slate-700 dark:text-slate-300">
                    <strong className="text-slate-500 dark:text-slate-400">Problem Solved:</strong> {project.problemSolved}
                  </div>
                )}

                {/* Tech Tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {techs.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 border border-slate-200 dark:border-slate-800"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Evidence Links */}
                <div className="flex items-center gap-4 pt-2 text-xs">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>GitHub Repository</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Live Production Demo</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Skill Modal */}
      {showSkillModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Add Skill with Evidence Proof</h3>

            <form onSubmit={handleAddSkill} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  placeholder="e.g. Docker, TypeScript, GraphQL"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Category</label>
                <select
                  value={newSkill.category}
                  onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Programming Languages">Programming Languages</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Databases">Databases</option>
                  <option value="DevOps & Cloud">DevOps & Cloud</option>
                  <option value="AI/ML">AI/ML</option>
                  <option value="Computer Science Fundamentals">Computer Science Fundamentals</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Proficiency Level</label>
                <select
                  value={newSkill.proficiencyLevel}
                  onChange={(e) => setNewSkill({ ...newSkill, proficiencyLevel: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="EXPERT">Expert</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Verification Source / Proof Link
                </label>
                <input
                  type="text"
                  value={newSkill.verificationSource}
                  onChange={(e) =>
                    setNewSkill({
                      ...newSkill,
                      verificationSource: e.target.value,
                      isVerified: Boolean(e.target.value.trim()),
                    })
                  }
                  placeholder="e.g. GitHub: Repo URL / LeetCode Rating / Certificate ID"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                  Providing a verified source tags this skill as independently evidenced.
                </span>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Evidence Notes</label>
                <textarea
                  rows={2}
                  value={newSkill.evidenceNotes}
                  onChange={(e) => setNewSkill({ ...newSkill, evidenceNotes: e.target.value })}
                  placeholder="Briefly describe what you built using this skill..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSkillModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm shadow-blue-600/20"
                >
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Add Portfolio Project Evidence</h3>

            <form onSubmit={handleAddProject} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  placeholder="e.g. Distributed Task Scheduler"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Technologies (Comma separated)</label>
                <input
                  type="text"
                  required
                  value={newProject.technologies}
                  onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
                  placeholder="TypeScript, Next.js, Docker, SQLite"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="What does the project do?"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Problem Solved</label>
                <input
                  type="text"
                  value={newProject.problemSolved}
                  onChange={(e) => setNewProject({ ...newProject, problemSolved: e.target.value })}
                  placeholder="e.g. Prevented race conditions under high concurrent load"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">GitHub Repo URL</label>
                  <input
                    type="url"
                    value={newProject.githubUrl}
                    onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Live Demo URL</label>
                  <input
                    type="url"
                    value={newProject.liveUrl}
                    onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm shadow-blue-600/20"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  </AppClientLayout>
);
}
