import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressDashboard } from "@/app/_components/ProgressDashboard";
import type { DashboardStats, SetProgress } from "@/lib/dashboard";

const stats: DashboardStats = {
  totalWords: 8,
  progressRate: 38,
  dueToday: 3,
  unlearned: 2,
  levelCounts: [4, 1, 0, 2, 0, 1],
};

const sets: SetProgress[] = [
  { id: 1, name: "N2 단어장", totalWords: 100, progressRate: 42 },
  { id: 2, name: "동사 모음", totalWords: 50, progressRate: 10 },
];

describe("ProgressDashboard", () => {
  it("진도율 퍼센트가 보인다", () => {
    render(<ProgressDashboard stats={stats} sets={sets} />);

    expect(screen.getByText(/진도율/)).toBeInTheDocument();
    expect(screen.getByText(/38%/)).toBeInTheDocument();
  });

  it("오늘 복습 수와 미학습 수가 보인다", () => {
    render(<ProgressDashboard stats={stats} sets={sets} />);

    expect(screen.getByText("오늘 복습 3개")).toBeInTheDocument();
    expect(screen.getByText("미학습 2개")).toBeInTheDocument();
  });

  it("Lv.0~Lv.5 라벨과 각 레벨 개수가 표시된다", () => {
    render(<ProgressDashboard stats={stats} sets={sets} />);

    for (let lv = 0; lv <= 5; lv++) {
      expect(screen.getByText(`Lv.${lv}`)).toBeInTheDocument();
    }
    expect(screen.getByText("4")).toBeInTheDocument(); // Lv.0 개수
    expect(screen.getByText("2")).toBeInTheDocument(); // Lv.3 개수
  });

  it("각 단어장 이름과 진도율이 표시된다", () => {
    render(<ProgressDashboard stats={stats} sets={sets} />);

    expect(screen.getByText("N2 단어장")).toBeInTheDocument();
    expect(screen.getByText(/42%/)).toBeInTheDocument();
    expect(screen.getByText("동사 모음")).toBeInTheDocument();
    expect(screen.getByText(/10%/)).toBeInTheDocument();
  });
});
