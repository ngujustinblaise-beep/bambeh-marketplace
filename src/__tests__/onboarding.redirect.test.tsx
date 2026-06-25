import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";

function setOnboardingState({
  language = null,
  terms = null,
  welcome = null
}: {
  language?: string | null;
  terms?: string | null;
  welcome?: string | null;
}) {
  if (language === null) localStorage.removeItem("Bambeh_language");
  else localStorage.setItem("Bambeh_language", language);

  if (terms === null) localStorage.removeItem("Bambeh_terms_accepted");
  else localStorage.setItem("Bambeh_terms_accepted", terms);

  if (welcome === null) localStorage.removeItem("Bambeh_welcome_shown");
  else localStorage.setItem("Bambeh_welcome_shown", welcome);
}

function renderAt(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>
  );
}

describe("onboarding redirect order", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("fresh install starts at language selector", async () => {
    setOnboardingState({ language: null, terms: null, welcome: null });
    renderAt("/");

    await waitFor(() => {
      expect(window.location.hash).toContain("/language");
    });
  });

  test("after language, terms acceptance comes next", async () => {
    setOnboardingState({ language: "en", terms: null, welcome: null });
    renderAt("/");

    await waitFor(() => {
      expect(window.location.hash).toContain("/terms-acceptance");
    });
  });

  test("after terms, welcome comes next", async () => {
    setOnboardingState({ language: "en", terms: "true", welcome: null });
    renderAt("/");

    await waitFor(() => {
      expect(window.location.hash).toContain("/welcome");
    });
  });

  test("after welcome, app can continue to main app", async () => {
    setOnboardingState({ language: "en", terms: "true", welcome: "true" });
    renderAt("/");

    await waitFor(() => {
      expect(window.location.hash === "#/" || window.location.hash === "").toBeTruthy();
    });
  });

  test("direct login still remains reachable", async () => {
    setOnboardingState({ language: "en", terms: "true", welcome: "true" });
    renderAt("/login");

    expect(await screen.findByText(/login/i)).toBeTruthy();
  });
});
