"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import LoadingSpinner from "../_components/LoadingSpinner";
import NotificationSettings from "../_components/NotificationSettings";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [reviews, setReviews] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 프로필 편집 상태
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (session?.user) {
      setEditForm({
        name: session.user.name || "",
        email: session.user.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setProfileImage(session.user.image || null);
      setImagePreview(session.user.image || null);
      
      loadUserReviews();
      loadUserFavorites();
    }
  }, [session, status, router]);

  async function loadUserReviews() {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/users/${session.user.id}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error("리뷰 로드 오류:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadUserFavorites() {
    if (!session?.user?.id) return;

    try {
      const res = await fetch(`/api/users/${session.user.id}/favorites`);
      if (res.ok) {
        const data = await res.json();
        setFavorites(data.favorites || []);
      }
    } catch (error) {
      console.error("즐겨찾기 로드 오류:", error);
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      // 파일 크기 제한 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUpdateError("이미지 크기는 5MB 이하여야 합니다.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleUpdateProfile() {
    if (!session?.user?.id) return;

    setUpdateError(null);
    setUpdateSuccess(null);

    // 비밀번호 변경 시 검증
    if (editForm.newPassword) {
      if (editForm.newPassword !== editForm.confirmPassword) {
        setUpdateError("새 비밀번호가 일치하지 않습니다.");
        return;
      }

      if (editForm.newPassword.length < 8) {
        setUpdateError("비밀번호는 최소 8자 이상이어야 합니다.");
        return;
      }

      if (!editForm.currentPassword) {
        setUpdateError("현재 비밀번호를 입력해주세요.");
        return;
      }
    }

    setUpdateLoading(true);
    try {
      const updateData: any = {
        name: editForm.name,
        email: editForm.email,
      };

      if (profileImage && profileImage !== session.user.image) {
        updateData.image = profileImage;
      }

      if (editForm.newPassword) {
        updateData.currentPassword = editForm.currentPassword;
        updateData.newPassword = editForm.newPassword;
      }

      const res = await fetch(`/api/users/${session.user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (!res.ok) {
        setUpdateError(data.error || "프로필 업데이트에 실패했습니다.");
        return;
      }

      setUpdateSuccess("프로필이 성공적으로 업데이트되었습니다.");
      setIsEditing(false);
      
      // 세션 업데이트
      await update();

      // 비밀번호 필드 초기화
      setEditForm({
        ...editForm,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // 3초 후 성공 메시지 제거
      setTimeout(() => {
        setUpdateSuccess(null);
      }, 3000);
    } catch (error) {
      console.error("프로필 업데이트 오류:", error);
      setUpdateError("프로필 업데이트 중 오류가 발생했습니다.");
    } finally {
      setUpdateLoading(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-burgundy-50 via-rose-50 to-pink-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="로딩 중..." />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-burgundy-50 via-rose-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-burgundy-700 to-burgundy-900 bg-clip-text text-transparent">
              마이 페이지
            </h1>
            <Link
              href="/"
              className="px-4 py-2 text-sm text-burgundy-700 hover:text-burgundy-900 border border-burgundy-300 rounded-lg hover:bg-white"
            >
              ← 홈으로
            </Link>
          </div>

          {/* 탭 네비게이션 */}
          <div className="bg-white rounded-lg shadow-lg mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`
                    ${
                      activeTab === "profile"
                        ? "border-burgundy-700 text-burgundy-700"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  `}
                >
                  프로필
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`
                    ${
                      activeTab === "reviews"
                        ? "border-burgundy-700 text-burgundy-700"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  `}
                >
                  내 리뷰 ({reviews.length})
                </button>
                <button
                  onClick={() => setActiveTab("favorites")}
                  className={`
                    ${
                      activeTab === "favorites"
                        ? "border-burgundy-700 text-burgundy-700"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  `}
                >
                  즐겨찾기 ({favorites.length})
                </button>
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`
                    ${
                      activeTab === "notifications"
                        ? "border-burgundy-700 text-burgundy-700"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  `}
                >
                  알림 설정
                </button>
              </nav>
            </div>

            <div className="p-6">
              {/* 프로필 탭 */}
              {activeTab === "profile" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">프로필 정보</h2>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-burgundy-700 text-white rounded-lg hover:bg-burgundy-800"
                      >
                        편집
                      </button>
                    )}
                  </div>

                  {updateSuccess && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
                      {updateSuccess}
                    </div>
                  )}

                  {updateError && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
                      {updateError}
                    </div>
                  )}

                  <div className="space-y-6">
                    {/* 프로필 이미지 */}
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-burgundy-400 to-burgundy-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                          {imagePreview ? (
                            <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            session.user?.name?.charAt(0).toUpperCase() || "U"
                          )}
                        </div>
                        {isEditing && (
                          <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50">
                            <svg
                              className="w-5 h-5 text-burgundy-700"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleImageChange}
                            />
                          </label>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{session.user?.name}</h3>
                        <p className="text-sm text-gray-600">{session.user?.email}</p>
                        {session.user?.role === "admin" && (
                          <span className="inline-block mt-2 px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                            관리자
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 프로필 정보 편집 */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          이름
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-900">{session.user?.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          이메일
                        </label>
                        {isEditing ? (
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-900">{session.user?.email}</p>
                        )}
                      </div>

                      {isEditing && (
                        <>
                          <div className="border-t pt-4 mt-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">비밀번호 변경</h3>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  현재 비밀번호
                                </label>
                                <input
                                  type="password"
                                  value={editForm.currentPassword}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, currentPassword: e.target.value })
                                  }
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent"
                                  placeholder="변경하려면 입력"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  새 비밀번호
                                </label>
                                <input
                                  type="password"
                                  value={editForm.newPassword}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, newPassword: e.target.value })
                                  }
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent"
                                  placeholder="8자 이상"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  새 비밀번호 확인
                                </label>
                                <input
                                  type="password"
                                  value={editForm.confirmPassword}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, confirmPassword: e.target.value })
                                  }
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent"
                                  placeholder="새 비밀번호 재입력"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 pt-4">
                            <button
                              onClick={handleUpdateProfile}
                              disabled={updateLoading}
                              className="px-6 py-2 bg-burgundy-700 text-white rounded-lg hover:bg-burgundy-800 disabled:opacity-50"
                            >
                              {updateLoading ? "저장 중..." : "저장"}
                            </button>
                            <button
                              onClick={() => {
                                setIsEditing(false);
                                setEditForm({
                                  name: session.user?.name || "",
                                  email: session.user?.email || "",
                                  currentPassword: "",
                                  newPassword: "",
                                  confirmPassword: "",
                                });
                                setImagePreview(session.user?.image || null);
                                setUpdateError(null);
                                setUpdateSuccess(null);
                              }}
                              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                              취소
                            </button>
                          </div>
                        </>
                      )}

                      {session.user?.role === "admin" && (
                        <div className="pt-4 mt-4 border-t">
                          <Link
                            href="/admin"
                            className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                          >
                            관리자 페이지로 이동
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 내 리뷰 탭 */}
              {activeTab === "reviews" && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">내가 작성한 리뷰</h2>
                  {reviews.length === 0 ? (
                    <p className="text-gray-500">작성한 리뷰가 없습니다.</p>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b pb-4 last:border-b-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <Link
                                href={`/hospitals/${review.hospitalId}`}
                                className="text-burgundy-700 hover:text-burgundy-900 font-medium"
                              >
                                {review.hospital?.name}
                              </Link>
                              {review.title && (
                                <h3 className="font-medium text-gray-900 mt-1">{review.title}</h3>
                              )}
                              <p className="text-gray-600 text-sm mt-1">{review.content}</p>
                              <p className="text-gray-500 text-xs mt-2">
                                {new Date(review.createdAt).toLocaleDateString("ko-KR")}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <span className="text-yellow-500 font-semibold">{review.rating}점</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 즐겨찾기 탭 */}
              {activeTab === "favorites" && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">즐겨찾는 병원</h2>
                  {favorites.length === 0 ? (
                    <p className="text-gray-500">즐겨찾기한 병원이 없습니다.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {favorites.map((favorite) => (
                        <Link
                          key={favorite.id}
                          href={`/hospitals/${favorite.hospital.id}`}
                          className="border rounded-lg p-4 hover:shadow-xl transition-shadow border-rose-100"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">
                                {favorite.hospital.name}
                              </h3>
                              {favorite.hospital.nameEn && (
                                <p className="text-sm text-gray-600">{favorite.hospital.nameEn}</p>
                              )}
                              <p className="text-sm text-gray-500 mt-2">
                                {favorite.hospital.city && `${favorite.hospital.city} · `}
                                {favorite.hospital.address}
                              </p>
                              {favorite.hospital.departments && favorite.hospital.departments.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {favorite.hospital.departments.slice(0, 3).map((dept: any) => (
                                    <span
                                      key={dept.id}
                                      className="text-xs px-2 py-1 bg-burgundy-50 text-burgundy-800 rounded"
                                    >
                                      {dept.department.name}
                                    </span>
                                  ))}
                                  {favorite.hospital.departments.length > 3 && (
                                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                      +{favorite.hospital.departments.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            {favorite.hospital.rating !== null && favorite.hospital.rating > 0 && (
                              <div className="text-right ml-4">
                                <div className="text-yellow-500 text-sm">⭐</div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {favorite.hospital.rating.toFixed(1)}
                                </div>
                              </div>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 알림 설정 탭 */}
              {activeTab === "notifications" && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">알림 설정</h2>
                  <NotificationSettings />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
