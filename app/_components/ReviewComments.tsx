"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface ReviewComment {
  id: number;
  authorName: string;
  content: string;
  isHospitalReply: boolean;
  createdAt: string;
  user: {
    id: number;
    name: string;
    image: string | null;
    role: string;
  } | null;
}

interface ReviewCommentsProps {
  reviewId: number;
}

export default function ReviewComments({ reviewId }: ReviewCommentsProps) {
  const { data: session, status } = useSession();
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadComments();
  }, [reviewId]);

  async function loadComments() {
    try {
      const res = await fetch(`/api/reviews/${reviewId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error("댓글 로드 오류:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!newComment.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    if (status !== "authenticated") {
      alert("로그인이 필요합니다.");
      return;
    }

    setPosting(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: session?.user?.name || "익명",
          content: newComment,
          userId: session?.user?.id,
          isHospitalReply: false,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "댓글 작성에 실패했습니다.");
        return;
      }

      // 댓글 목록 새로고침
      await loadComments();
      setNewComment("");
      setShowForm(false);
    } catch (error) {
      console.error("댓글 작성 오류:", error);
      alert("댓글 작성 중 오류가 발생했습니다.");
    } finally {
      setPosting(false);
    }
  }

  async function handleDelete(commentId: number) {
    if (!confirm("댓글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const res = await fetch(`/api/reviews/${reviewId}/comments?commentId=${commentId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "댓글 삭제에 실패했습니다.");
        return;
      }

      // 댓글 목록 새로고침
      await loadComments();
    } catch (error) {
      console.error("댓글 삭제 오류:", error);
      alert("댓글 삭제 중 오류가 발생했습니다.");
    }
  }

  const canDeleteComment = (comment: ReviewComment) => {
    if (!session) return false;
    if (session.user?.role === "admin") return true;
    if (comment.user && session.user?.id === comment.user.id.toString()) return true;
    return false;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-2">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-800">
          댓글 {comments.length}개
        </h4>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            + 댓글 작성
          </button>
        )}
      </div>

      {/* 댓글 작성 폼 */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 bg-gray-50 rounded-lg p-3 border border-gray-200">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력하세요..."
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
          <div className="flex items-center justify-end space-x-2 mt-2">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setNewComment("");
              }}
              className="px-3 py-1.5 text-xs text-gray-700 hover:text-gray-900"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={posting || !newComment.trim()}
              className="px-4 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {posting ? "작성 중..." : "작성"}
            </button>
          </div>
        </form>
      )}

      {/* 댓글 목록 */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-4">
            아직 댓글이 없습니다.
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`
                rounded-lg p-3 text-sm
                ${
                  comment.isHospitalReply
                    ? "bg-blue-50 border border-blue-200"
                    : "bg-white border border-gray-200"
                }
              `}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {comment.user?.image ? (
                    <img
                      src={comment.user.image}
                      alt={comment.authorName}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-bold">
                      {comment.authorName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-900">
                      {comment.authorName}
                    </span>
                    {comment.isHospitalReply && (
                      <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                        병원 측 답변
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                  {canDeleteComment(comment) && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

