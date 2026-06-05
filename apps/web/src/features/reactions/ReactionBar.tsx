"use client";

import { useTransition } from "react";
import { toggleLike, toggleBookmark } from "./actions";

interface Props {
  postSlug: string;
  likeCount: number;
  hasLiked: boolean;
  hasBookmarked: boolean;
  isLoggedIn: boolean;
}

export function ReactionBar({ postSlug, likeCount, hasLiked, hasBookmarked, isLoggedIn }: Props) {
  const [likePending, startLike] = useTransition();
  const [bookmarkPending, startBookmark] = useTransition();

  function handleLike() {
    if (!isLoggedIn) { window.location.href = "/login"; return; }
    startLike(() => toggleLike(postSlug));
  }

  function handleBookmark() {
    if (!isLoggedIn) { window.location.href = "/login"; return; }
    startBookmark(() => toggleBookmark(postSlug));
  }

  return (
    <div className="flex items-center gap-4 py-4 border-t border-b border-gray-light">
      <button
        onClick={handleLike}
        disabled={likePending}
        className={`flex items-center gap-1.5 text-sm transition-colors ${hasLiked ? "text-gray-dark font-medium" : "text-gray-mid hover:text-gray-dark"}`}
      >
        <span>{hasLiked ? "♥" : "♡"}</span>
        <span>{likeCount} {likeCount === 1 ? "like" : "likes"}</span>
      </button>
      <button
        onClick={handleBookmark}
        disabled={bookmarkPending}
        className={`flex items-center gap-1.5 text-sm transition-colors ${hasBookmarked ? "text-gray-dark font-medium" : "text-gray-mid hover:text-gray-dark"}`}
      >
        <span>{hasBookmarked ? "🔖" : "🏷"}</span>
        <span>{hasBookmarked ? "Saved" : "Save"}</span>
      </button>
    </div>
  );
}
