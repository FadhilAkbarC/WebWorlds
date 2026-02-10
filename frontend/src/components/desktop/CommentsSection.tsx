'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Heart, Trash2, MessageSquare } from 'lucide-react';
import AppLink from '@/components/shared/AppLink';
import { api } from '@/lib/api';
import { Comment } from '@/types';
import { useAuthStore } from '@/stores/authStore';

interface CommentsProps {
  gameId: string;
}

export const CommentsSection: React.FC<CommentsProps> = ({ gameId }) => {
  const user = useAuthStore((state) => state.user);
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
      
      setComments(comments.map((c) =>
        c._id === commentId
          ? { ...c, likes: updatedComment.likes, likedBy: updatedComment.likedBy }
          : c
      ));
    } catch (err: any) {
      if (err.response?.status === 409) {
        // Already liked, unlike it
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
      
      setComments(comments.map((c) =>
        c._id === commentId
          ? { ...c, likes: updatedComment.likes, likedBy: updatedComment.likedBy }
          : c
      ));
    } catch (err) {
      console.error('Failed to unlike comment:', err);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare size={24} className="text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Comments ({comments.length})</h2>
      </div>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex-shrink-0 flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {user.username[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                maxLength={500}
                rows={2}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-400">
                  {newComment.length}/500
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="px-4 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-sm font-semibold transition-colors"
                >
                  {isSubmitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </form>
      ) : (
        <div className="mb-6 p-4 bg-slate-700 rounded-lg text-center">
          <p className="text-slate-300">
            <AppLink href="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
              Login
            </AppLink>
            {' '}to leave a comment
          </p>
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="text-center py-8 text-slate-400">Loading comments...</div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => {
            const isCommentLiked = user && comment.likedBy.includes(user._id);
            return (
              <div key={comment._id} className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">
                        {comment.username[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">
                        {comment.username}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {user?._id === comment.userId && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete comment"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <p className="text-slate-200 mb-3 text-sm">{comment.text}</p>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() =>
                      isCommentLiked
                        ? handleUnlikeComment(comment._id)
                        : handleLikeComment(comment._id)
                    }
                    className={`flex items-center gap-1 text-sm transition-colors ${
                      isCommentLiked
                        ? 'text-red-400 hover:text-red-300'
                        : 'text-slate-400 hover:text-red-400'
                    }`}
                  >
                    <Heart
                      size={14}
                      fill={isCommentLiked ? 'currentColor' : 'none'}
                    />
                    <span>{comment.likes}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-400">
          No comments yet. Be the first to comment!
        </div>
      )}
    </div>
  );
};
