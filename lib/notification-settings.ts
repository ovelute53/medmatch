// 알림 설정 관리 (localStorage)

export interface NotificationSettings {
  emailNotifications: boolean;
  reviewNotifications: boolean;
  hospitalUpdateNotifications: boolean;
  marketingNotifications: boolean;
}

const NOTIFICATION_SETTINGS_KEY = "medmatch_notification_settings";

const DEFAULT_SETTINGS: NotificationSettings = {
  emailNotifications: true,
  reviewNotifications: true,
  hospitalUpdateNotifications: true,
  marketingNotifications: false,
};

// 알림 설정 가져오기
export function getNotificationSettings(): NotificationSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;

  try {
    const data = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (!data) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch (error) {
    console.error("알림 설정 불러오기 실패:", error);
    return DEFAULT_SETTINGS;
  }
}

// 알림 설정 저장
export function saveNotificationSettings(settings: NotificationSettings): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("알림 설정 저장 실패:", error);
  }
}

// 특정 알림 설정 토글
export function toggleNotification(key: keyof NotificationSettings): void {
  const settings = getNotificationSettings();
  settings[key] = !settings[key];
  saveNotificationSettings(settings);
}

