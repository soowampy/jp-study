import type { ParsedWord } from "@/lib/parse";

export function ParseReviewTable({ words }: { words: ParsedWord[] }) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-gray-300 text-left text-gray-500">
          <th className="p-2">漢字</th>
          <th className="p-2">후리가나</th>
          <th className="p-2">뜻</th>
        </tr>
      </thead>
      <tbody>
        {words.map((word, i) => (
          <tr key={i} className="border-b border-gray-100">
            <td className="p-2">{word.kanji ?? ""}</td>
            <td className="p-2">{word.reading}</td>
            <td className="p-2">{word.meaningKo}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
