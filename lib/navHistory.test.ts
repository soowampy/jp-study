import { describe, it, expect } from "vitest";
import {
  canGoBack,
  canGoForward,
  onNavigate,
  onBack,
  onForward,
  type NavState,
} from "@/lib/navHistory";

describe("canGoBack", () => {
  it("position=0이면 false다", () => {
    expect(canGoBack({ position: 0, length: 3 })).toBe(false);
  });

  it("position>0이면 true다", () => {
    expect(canGoBack({ position: 1, length: 3 })).toBe(true);
  });
});

describe("canGoForward", () => {
  it("position이 length-1(마지막)이면 false다", () => {
    expect(canGoForward({ position: 2, length: 3 })).toBe(false);
  });

  it("position이 마지막이 아니면 true다", () => {
    expect(canGoForward({ position: 0, length: 3 })).toBe(true);
  });
});

describe("onNavigate", () => {
  it("position이 1 증가하고 length=position+1로 이후 forward 기록이 잘린다", () => {
    // 뒤로가기로 position=1까지 물러난 상태(length=5, 앞으로 갈 기록이 남아있음)에서
    // 새 페이지로 이동하면 그 남은 forward 기록(2~4)은 사라져야 한다.
    const state: NavState = { position: 1, length: 5 };
    const next = onNavigate(state);

    expect(next.position).toBe(2);
    expect(next.length).toBe(3);
  });
});

describe("onBack", () => {
  it("position이 1 감소한다", () => {
    const next = onBack({ position: 2, length: 3 });
    expect(next.position).toBe(1);
  });

  it("position이 0 미만으로 내려가지 않는다", () => {
    const next = onBack({ position: 0, length: 3 });
    expect(next.position).toBe(0);
  });
});

describe("onForward", () => {
  it("position이 1 증가한다", () => {
    const next = onForward({ position: 0, length: 3 });
    expect(next.position).toBe(1);
  });

  it("position이 length-1을 넘지 않는다", () => {
    const next = onForward({ position: 2, length: 3 });
    expect(next.position).toBe(2);
  });
});
