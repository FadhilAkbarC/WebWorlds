'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Heart, Trash2, MessageSquare } from 'lucide-react';
import { api } from '@/lib/api';
import { Comment } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import MobileLink from '@/components/mobile/MobileLink';

interface CommentsProps {
  gameId: string;
}

const MobileCommentsSection: React.FC<CommentsProps> = ({ gameId }) => {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/games/${gameId}/comments?limit=20`);
      if (response.data.success || Array.isArray(response.data.data)) {
        setComments(response.data.data || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch comments:', err);
      setError(err.response?.data?.error || 'Comments are unavailable');
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    void fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('Please login to comment');
      return;
    }

    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await api.post(`/games/${gameId}/comments`, {
        text: newComment,
      });

      if (response.data.success || response.data.data) {
        setComments([response.data.data || response.data, ...comments]);
        setNewComment('');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;

    try {
      await api.delete(`/comments/${commentId}`);
      setComments(comments.filter((c) => c._id !== commentId));
    } catch (err: any) {
      console.error('Failed to delete comment:', err);
      setError(err.response?.data?.error || 'Failed to delete comment');
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) {
      setError('Please login to like comments');
      return;
    }

    try {
      const response = await api.post(`/comments/${commentId}/like`);
      const updatedComment = response.data.data;

      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? { ...c, likes: updatedComment.likes, likedBy: updatedComment.likedBy }
            : c
        )
      );
    } catch (err: any) {
      if (err.response?.status === 409) {
        handleUnlikeComment(commentId);
      } else {
        console.error('Failed to like comment:', err);
      }
    }
  };

  const handleUnlikeComment = async (commentId: string) => {
    try {
      const response = await api.post(`/comments/${commentId}/unlike`);
      const updatedComment = response.data.data;

      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? { ...c, likes: updatedComment.likes, likedBy: updatedComment.likedBy }
            : c
        )
      );
    } catch (err) {
      console.error('Failed to unlike comment:', err);
    }
  };

  return (
    <div className="rounded-2xl border border-[#232323] bg-[#181818] p-4">
      <div className="mb-4 flex items-center gap-2 text-white">
        <MessageSquare size={18} className="text-blue-400" />
        <h2 className="text-base font-semibold">Comments ({comments.length})</h2>
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-4 space-y-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment"
            maxLength={500}
            rows={3}
            className="w-full rounded-xl border border-[#2b2b2b] bg-[#121212] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{newComment.length}/500</span>
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold text-white disabled:opacity-50"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </form>
      ) : (
        <div className="mb-4 rounded-xl border border-[#2b2b2b] bg-[#141414] p-3 text-center text-xs text-slate-300">
          <MobileLink href="/login" className="font-semibold text-blue-300">
            Login
          </MobileLink>{' '}
          to comment.
        </div>
      )}

      {isLoading ? (
        <div className="py-6 text-center text-xs text-slate-400">Loading comments...</div>
      ) : comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((comment) => {
            const isCommentLiked = user && comment.likedBy.includes(user._id);
            return (
              <div key={comment._id} className="rounded-xl border border-[#2b2b2b] bg-[#141414] p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-white">{comment.username}</p>
                    <p className="text-[10px] text-slate-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {user?._id === comment.userId && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-slate-500 hover:text-red-400"
                      title="Delete comment"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <p className="mt-2 text-sm text-slate-200">{comment.text}</p>
                <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                  <button
                    onClick={() =>
                      isCommentLiked
                        ? handleUnlikeComment(comment._id)
                        : handleLikeComment(comment._id)
                    }
                    className={`flex items-center gap-1 ${
                      isCommentLiked ? 'text-red-300' : 'text-slate-400'
                    }`}
                  >
                    <Heart size={12} fill={isCommentLiked ? 'currentColor' : 'none'} />
                    {comment.likes}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-slate-400">No comments yet.</div>
      )}
    </div>
  );
};

export default MobileCommentsSection;

