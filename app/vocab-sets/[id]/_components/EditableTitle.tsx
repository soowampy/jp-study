"use client";

import { useState } from "react";

/** 단어장 상세 제목 인라인 편집. 빈 이름은 저장하지 않는다. (#13) */
export function EditableTitle({
  name,
  onSave,
}: {
  name: string;
  onSave: (name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);

  if (!editing) {
    return (
      <h1
        className="cursor-pointer text-2xl font-bold"
        onClick={() => {
          setValue(name);
          setEditing(true);
        }}
      >
        {name}
      </h1>
    );
  }

  const save = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSave(trimmed);
    setEditing(false);
  };

  return (
    <input
      autoFocus
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") save();
      }}
      onBlur={save}
      className="rounded-lg border border-gray-300 px-3 py-2 text-2xl font-bold"
    />
  );
}
