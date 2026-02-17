import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/preact";
import { Tabs, TabsList, TabsTrigger } from "../tabs";

describe("Tabs", () => {
  it("defaults to scroll behavior on TabsList", () => {
    render(
      <Tabs value="one" onValueChange={vi.fn()}>
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
      </Tabs>
    );

    var list = screen.getByText("One").closest("div");
    expect(list?.className).toContain("overflow-x-auto");
    expect(list?.className).toContain("no-scrollbar");
  });

  it("supports wrap behavior override", () => {
    render(
      <Tabs value="one" onValueChange={vi.fn()}>
        <TabsList behavior="wrap">
          <TabsTrigger value="one">One</TabsTrigger>
        </TabsList>
      </Tabs>
    );

    var list = screen.getByText("One").closest("div");
    expect(list?.className).toContain("flex-wrap");
    expect(list?.className).not.toContain("overflow-x-auto");
  });

  it("invokes onValueChange when a trigger is clicked", () => {
    var onValueChange = vi.fn();
    render(
      <Tabs value="one" onValueChange={onValueChange}>
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
      </Tabs>
    );

    fireEvent.click(screen.getByText("Two"));
    expect(onValueChange).toHaveBeenCalledWith("two");
  });
});
