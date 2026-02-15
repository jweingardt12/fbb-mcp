import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/preact";
import { AlertDialog } from "../alert-dialog";

function makeProps(overrides = {}) {
  return {
    open: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: "Delete player?",
    description: "This action cannot be undone.",
    ...overrides,
  };
}

describe("AlertDialog", () => {
  it("returns null when open is false", () => {
    const { container } = render(<AlertDialog {...makeProps({ open: false })} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders title and description when open", () => {
    render(<AlertDialog {...makeProps()} />);
    expect(screen.getByText("Delete player?")).toBeInTheDocument();
    expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();
  });

  it("shows confirm and cancel buttons with custom labels", () => {
    render(<AlertDialog {...makeProps({ confirmLabel: "Yes, delete", cancelLabel: "Nope" })} />);
    expect(screen.getByText("Yes, delete")).toBeInTheDocument();
    expect(screen.getByText("Nope")).toBeInTheDocument();
  });

  it("loading state: confirm button is disabled", () => {
    const { container } = render(<AlertDialog {...makeProps({ loading: true })} />);
    const buttons = container.querySelectorAll("button");
    const confirmBtn = buttons[buttons.length - 1];
    expect(confirmBtn).toBeDisabled();
  });

  it("loading state: cancel button is disabled", () => {
    const { container } = render(<AlertDialog {...makeProps({ loading: true })} />);
    const buttons = container.querySelectorAll("button");
    const cancelBtn = buttons[0];
    expect(cancelBtn).toBeDisabled();
  });

  it("loading state: confirm button shows spinner", () => {
    const { container } = render(<AlertDialog {...makeProps({ loading: true })} />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("loading state: backdrop click does not fire onClose", () => {
    const onClose = vi.fn();
    const { container } = render(<AlertDialog {...makeProps({ onClose, loading: true })} />);
    const backdrop = container.querySelector(".backdrop-blur-sm") as HTMLElement;
    fireEvent.click(backdrop);
    expect(onClose).not.toHaveBeenCalled();
  });
});
