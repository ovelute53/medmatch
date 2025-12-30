interface HighlightTextProps {
  text: string;
  searchQuery: string;
}

export default function HighlightText({ text, searchQuery }: HighlightTextProps) {
  if (!searchQuery.trim()) {
    return <>{text}</>;
  }

  const parts = text.split(new RegExp(`(${searchQuery})`, "gi"));
  
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === searchQuery.toLowerCase() ? (
          <mark key={index} className="bg-yellow-200 px-1 rounded">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
}

