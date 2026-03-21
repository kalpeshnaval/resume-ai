"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  resumeId: string;
};

export default function DeleteResumeButton({ resumeId }: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const shouldDelete = window.confirm("Delete this resume permanently?");

    if (!shouldDelete) {
      return;
    }

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: "DELETE",
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to delete resume.");
      }

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete resume.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:opacity-60"
    >
      <Trash2 className="h-4 w-4" />
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
