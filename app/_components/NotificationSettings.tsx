"use client";

import { useState, useEffect } from "react";
import {
  getNotificationSettings,
  saveNotificationSettings,
  type NotificationSettings as Settings,
} from "@/lib/notification-settings";

export default function NotificationSettings() {
  const [settings, setSettings] = useState<Settings>({
    emailNotifications: true,
    reviewNotifications: true,
    hospitalUpdateNotifications: true,
    marketingNotifications: false,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getNotificationSettings());
  }, []);

  function handleToggle(key: keyof Settings) {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  function handleSave() {
    saveNotificationSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const notificationOptions = [
    {
      key: "emailNotifications" as keyof Settings,
      title: "이메일 알림",
      description: "중요한 업데이트를 이메일로 받습니다",
      icon: "📧",
    },
    {
      key: "reviewNotifications" as keyof Settings,
      title: "리뷰 알림",
      description: "내가 작성한 리뷰에 댓글이나 반응이 달렸을 때 알림을 받습니다",
      icon: "💬",
    },
    {
      key: "hospitalUpdateNotifications" as keyof Settings,
      title: "병원 정보 업데이트",
      description: "즐겨찾기한 병원의 정보가 업데이트되면 알림을 받습니다",
      icon: "🏥",
    },
    {
      key: "marketingNotifications" as keyof Settings,
      title: "마케팅 알림",
      description: "프로모션 및 특별 혜택 정보를 받습니다",
      icon: "🎁",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-700">
          <span className="font-medium">💡 알림 설정</span>
          <br />
          알림 설정은 브라우저에 저장됩니다. 다른 기기에서는 별도로 설정해주세요.
        </p>
      </div>

      {notificationOptions.map((option) => (
        <div
          key={option.key}
          className="flex items-start justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
        >
          <div className="flex items-start space-x-3 flex-1">
            <span className="text-2xl">{option.icon}</span>
            <div>
              <h4 className="font-medium text-gray-900">{option.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{option.description}</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle(option.key)}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${settings[option.key] ? "bg-blue-600" : "bg-gray-300"}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${settings[option.key] ? "translate-x-6" : "translate-x-1"}
              `}
            />
          </button>
        </div>
      ))}

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        {saved && (
          <span className="text-green-600 text-sm font-medium">✓ 저장되었습니다</span>
        )}
        <div className="flex-1"></div>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          설정 저장
        </button>
      </div>
    </div>
  );
}

