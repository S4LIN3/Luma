import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("Luma App Component", () => {
  it("renders Luma application header and title", () => {
    render(<App />);
    expect(screen.getByText("Luma")).toBeDefined();
    expect(screen.getByText(/Your Desktop, In Motion/i)).toBeDefined();
  });

  it("renders quick navigation buttons", () => {
    render(<App />);
    expect(screen.getByText("Controls")).toBeDefined();
    expect(screen.getByText("Settings")).toBeDefined();
  });
});
