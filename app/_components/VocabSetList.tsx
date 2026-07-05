import Link from "next/link";

export function VocabSetList({
  sets,
}: {
  sets: { id: number; name: string }[];
}) {
  if (sets.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-gray-300 p-8">
        <p className="text-gray-500">단어장이 없습니다</p>
        <Link
          href="/upload"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          PDF 업로드
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {sets.map((set) => (
        <li
          key={set.id}
          className="rounded-md border border-gray-200 px-4 py-3"
        >
          {set.name}
        </li>
      ))}
    </ul>
  );
}
