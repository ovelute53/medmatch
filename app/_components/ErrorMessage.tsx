interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({
  title = "오류가 발생했습니다",
  message,
  onRetry,
}: ErrorMessageProps) {
  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
      <div className="text-red-600 text-5xl mb-5">⚠️</div>
      <h3 className="text-xl font-bold text-red-900 mb-2">{title}</h3>
      <p className="text-red-700 mb-6 font-medium">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}

