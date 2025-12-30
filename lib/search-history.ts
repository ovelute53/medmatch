// 검색 기록 관리 (localStorage)

export interface SearchHistoryItem {
  query: string;
  searchedAt: string; // ISO timestamp
}

const SEARCH_HISTORY_KEY = "medmatch_search_history";
const MAX_HISTORY = 10; // 최대 10개까지 저장

// 검색 기록 가져오기
export function getSearchHistory(): SearchHistoryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error("검색 기록 불러오기 실패:", error);
    return [];
  }
}

// 검색 기록 추가
export function addSearchHistory(query: string): void {
  if (typeof window === "undefined" || !query.trim()) return;

  try {
    let history = getSearchHistory();

    // 이미 있는 검색어면 제거 (나중에 맨 앞에 추가)
    history = history.filter((item) => item.query.toLowerCase() !== query.toLowerCase());

    // 새로운 검색어를 맨 앞에 추가
    history.unshift({
      query: query.trim(),
      searchedAt: new Date().toISOString(),
    });

    // 최대 개수만 유지
    history = history.slice(0, MAX_HISTORY);

    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("검색 기록 저장 실패:", error);
  }
}

// 특정 검색 기록 삭제
export function removeSearchHistory(query: string): void {
  if (typeof window === "undefined") return;

  try {
    let history = getSearchHistory();
    history = history.filter((item) => item.query !== query);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("검색 기록 삭제 실패:", error);
  }
}

// 검색 기록 전체 삭제
export function clearSearchHistory(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch (error) {
    console.error("검색 기록 삭제 실패:", error);
  }
}

