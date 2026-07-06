/** 브라우저 세션 히스토리 위치를 추적하는 순수 리듀서. (#12) */
export type NavState = { position: number; length: number };

export const initialNavState: NavState = { position: 0, length: 1 };

export function canGoBack(state: NavState): boolean {
  return state.position > 0;
}

export function canGoForward(state: NavState): boolean {
  return state.position < state.length - 1;
}

/** 새 페이지로 이동 — position+1, 이전 forward 기록은 잘린다. */
export function onNavigate(state: NavState): NavState {
  const position = state.position + 1;
  return { position, length: position + 1 };
}

export function onBack(state: NavState): NavState {
  return { ...state, position: Math.max(0, state.position - 1) };
}

export function onForward(state: NavState): NavState {
  return { ...state, position: Math.min(state.length - 1, state.position + 1) };
}
