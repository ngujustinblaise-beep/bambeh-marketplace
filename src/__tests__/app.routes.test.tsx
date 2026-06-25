import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";

function renderAt(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>
  );
}

describe("app route groups", () => {
  test("onboarding routes render", () => {
    renderAt("/language");
    expect(screen.queryByText(/language/i)).toBeTruthy();
  });

  test("auth routes render", () => {
    renderAt("/login");
    expect(screen.queryByText(/login/i)).toBeTruthy();
  });

  test("marketplace routes render", () => {
    renderAt("/marketplace");
    expect(screen.queryByText(/marketplace/i)).toBeTruthy();
  });

  test("vendor routes render", () => {
    renderAt("/vendor/home");
    expect(screen.queryByText(/vendor/i)).toBeTruthy();
  });

  test("admin routes render", () => {
    renderAt("/admin/login");
    expect(screen.queryByText(/admin/i)).toBeTruthy();
  });

  test("payment routes render", () => {
    renderAt("/subscription");
    expect(screen.queryByText(/subscription/i)).toBeTruthy();
  });

  test("community routes render", () => {
    renderAt("/community");
    expect(screen.queryByText(/community/i)).toBeTruthy();
  });

  test("unknown route falls through to 404", () => {
    renderAt("/this-route-should-not-exist");
    expect(screen.queryByText(/not found/i)).toBeTruthy();
  });
});
