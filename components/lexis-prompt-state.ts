"use client";

import { useSyncExternalStore } from "react";
import { FIXTURES, type FixtureId } from "@/components/lexis-fixtures";

interface PromptState {
  pending: FixtureId;
  heroInput: string;
  selectedExample: FixtureId;
  reviewRan: boolean;
}

const initialState: PromptState = {
  pending: "clean",
  heroInput: FIXTURES.clean.request,
  selectedExample: "find",
  reviewRan: false,
};

let state = initialState;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return state;
}

function getServerSnapshot() {
  return initialState;
}

export function usePromptState(): PromptState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function setHeroInput(heroInput: string) {
  state = { ...state, heroInput };
  emit();
}

export function submitFixture(pending: FixtureId) {
  state = { ...state, pending, reviewRan: false };
  emit();
}

export function selectExample(selectedExample: FixtureId) {
  state = { ...state, selectedExample };
  emit();
}

export function runReview() {
  if (state.reviewRan) return;
  state = { ...state, reviewRan: true };
  emit();
}
