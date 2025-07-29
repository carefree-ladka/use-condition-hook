// src/__tests__/useCondition.test.tsx
import { render, renderHook, screen } from "@testing-library/react";
import React from "react";
import { comparators, isValidReactNode, useCondition } from "../index";
import { mockConsole } from "../setupTests";

describe("useCondition Hook", () => {
  describe("Basic when-then functionality", () => {
    it("should render component when condition is true", () => {
      const { result } = renderHook(() => useCondition());

      const component = result.current
        .when(true)
        .then(<div>Test Content</div>)
        .otherwise();

      expect(component).toEqual(<div>Test Content</div>);
      expect(result.current.hasMatched()).toBe(true);
      expect(result.current.getMatchedIndex()).toBe(0);
    });

    it("should not render component when condition is false", () => {
      const { result } = renderHook(() => useCondition());

      const component = result.current
        .when(false)
        .then(<div>Test Content</div>)
        .otherwise();

      expect(component).toBeNull();
      expect(result.current.hasMatched()).toBe(false);
      expect(result.current.getMatchedIndex()).toBe(-1);
    });

    it("should render first matching condition", () => {
      const { result } = renderHook(() => useCondition());

      const component = result.current
        .when(false)
        .then(<div>First</div>)
        .when(true)
        .then(<div>Second</div>)
        .when(true)
        .then(<div>Third</div>)
        .otherwise();

      expect(component).toEqual(<div>Second</div>);
      expect(result.current.getMatchedIndex()).toBe(1);
    });

    it("should handle multiple when-then chains", () => {
      const { result } = renderHook(() => useCondition());

      const component = result.current
        .when(false)
        .then(<div>Loading</div>)
        .when(false)
        .then(<div>Error</div>)
        .when(true)
        .then(<div>Success</div>)
        .otherwise();

      expect(component).toEqual(<div>Success</div>);
    });

    it("should convert non-boolean values to boolean in when()", () => {
      const { result } = renderHook(() => useCondition());
      const warnSpy = mockConsole.warn();

      const component = result.current
        .when("truthy" as any)
        .then(<div>Truthy</div>)
        .otherwise();

      expect(component).toEqual(<div>Truthy</div>);
      expect(warnSpy).toHaveBeenCalledWith(
        "[useCondition] when() expects a boolean value. Non-boolean values will be converted using Boolean()."
      );
    });
  });

  describe("Match-case functionality", () => {
    it("should match exact values", () => {
      const { result } = renderHook(() => useCondition());

      const component = result.current
        .match("admin")
        .case("admin")
        .render(<div>Admin Panel</div>)
        .case("user")
        .render(<div>User Panel</div>)
        .otherwise();

      expect(component).toEqual(<div>Admin Panel</div>);
    });

    it("should handle multiple cases", () => {
      const { result } = renderHook(() => useCondition());

      const component = result.current
        .match("user")
        .case("admin")
        .render(<div>Admin Panel</div>)
        .case("user")
        .render(<div>User Panel</div>)
        .case("guest")
        .render(<div>Guest Panel</div>)
        .otherwise();

      expect(component).toEqual(<div>User Panel</div>);
    });

    it("should return null when no cases match", () => {
      const { result } = renderHook(() => useCondition());

      const component = result.current
        .match("moderator")
        .case("admin")
        .render(<div>Admin Panel</div>)
        .case("user")
        .render(<div>User Panel</div>)
        .otherwise();

      expect(component).toBeNull();
    });

    it("should handle NaN comparisons correctly", () => {
      const { result } = renderHook(() => useCondition());

      const component = result.current
        .match(NaN)
        .case(NaN)
        .render(<div>NaN Match</div>)
        .otherwise();

      expect(component).toEqual(<div>NaN Match</div>);
    });

    it("should warn when case() is called without match()", () => {
      const { result } = renderHook(() => useCondition());
      const warnSpy = mockConsole.warn();

      const component = result.current
        .case("admin")
        .render(<div>Admin Panel</div>)
        .otherwise();

      expect(warnSpy).toHaveBeenCalledWith(
        "[useCondition] case() called without match(). Use match() first to set the value to compare against."
      );
      expect(component).toBeNull();
    });
  });

  describe("Custom comparators", () => {
    it("should use custom comparator function", () => {
      const { result } = renderHook(() => useCondition());

      const caseInsensitive = (a: string, b: string) =>
        a.toLowerCase() === b.toLowerCase();

      const component = result.current
        .match("ADMIN", caseInsensitive)
        .case("admin")
        .render(<div>Admin Panel</div>)
        .otherwise();

      expect(component).toEqual(<div>Admin Panel</div>);
    });

    it("should handle comparator errors gracefully", () => {
      const { result } = renderHook(() => useCondition());
      const errorSpy = mockConsole.error();

      const throwingComparator = () => {
        throw new Error("Comparator error");
      };

      const component = result.current
        .match("test", throwingComparator)
        .case("test")
        .render(<div>Should not render</div>)
        .otherwise(<div>Default</div>);

      expect(component).toEqual(<div>Default</div>);
      expect(errorSpy).toHaveBeenCalledWith(
        "[useCondition] Comparator function threw an error:",
        expect.any(Error)
      );
    });

    it("should warn when comparator is not a function", () => {
      const { result } = renderHook(() => useCondition());
      const warnSpy = mockConsole.warn();

      const component = result.current
        .match("test", "not-a-function" as any)
        .case("test")
        .render(<div>Test</div>)
        .otherwise();

      expect(warnSpy).toHaveBeenCalledWith(
        "[useCondition] comparator must be a function. Using default comparator."
      );
    });
  });

  describe("Fallback functionality", () => {
    it("should render fallback when no conditions match", () => {
      const { result } = renderHook(() => useCondition());

      const component = result.current
        .when(false)
        .then(<div>First</div>)
        .when(false)
        .then(<div>Second</div>)
        .fallback(<div>Fallback</div>)
        .otherwise();

      expect(component).toEqual(<div>Fallback</div>);
    });

    it("should not render fallback when a condition matches", () => {
      const { result } = renderHook(() => useCondition());

      const component = result.current
        .when(true)
        .then(<div>Matched</div>)
        .fallback(<div>Fallback</div>)
        .otherwise();

      expect(component).toEqual(<div>Matched</div>);
    });

    it("should warn when multiple fallbacks are defined", () => {
      const { result } = renderHook(() => useCondition());
      const warnSpy = mockConsole.warn();

      result.current
        .fallback(<div>First Fallback</div>)
        .fallback(<div>Second Fallback</div>)
        .otherwise();

      expect(warnSpy).toHaveBeenCalledWith(
        "[useCondition] Multiple fallback() calls detected. Only the last one will be used."
      );
    });

    it("should render default component when no fallback and no matches", () => {
      const { result } = renderHook(() => useCondition());

      const component = result.current
        .when(false)
        .then(<div>Test</div>)
        .otherwise(<div>Default</div>);

      expect(component).toEqual(<div>Default</div>);
    });
  });

  describe("Method chaining validation", () => {
    it("should warn when then() is called without when()", () => {
      const { result } = renderHook(() => useCondition());
      const warnSpy = mockConsole.warn();

      result.current.then(<div>Test</div>).otherwise();

      expect(warnSpy).toHaveBeenCalledWith(
        "[useCondition] then() called without a preceding condition. Use 'when()' or 'case()' first."
      );
    });

    it("should warn when render() is called without case()", () => {
      const { result } = renderHook(() => useCondition());
      const warnSpy = mockConsole.warn();

      result.current.render(<div>Test</div>).otherwise();

      expect(warnSpy).toHaveBeenCalledWith(
        "[useCondition] render() called without a preceding condition. Use 'when()' or 'case()' first."
      );
    });

    it("should warn when then() follows case()", () => {
      const { result } = renderHook(() => useCondition());
      const warnSpy = mockConsole.warn();

      result.current
        .match("test")
        .case("test")
        .then(<div>Test</div>)
        .otherwise();

      expect(warnSpy).toHaveBeenCalledWith(
        "[useCondition] then() should follow 'when()' but found 'match'."
      );
    });

    it("should warn when render() follows when()", () => {
      const { result } = renderHook(() => useCondition());
      const warnSpy = mockConsole.warn();

      result.current
        .when(true)
        .render(<div>Test</div>)
        .otherwise();

      expect(warnSpy).toHaveBeenCalledWith(
        "[useCondition] render() should follow 'case()' but found 'when'."
      );
    });

    it("should warn about multiple then() calls", () => {
      const { result } = renderHook(() => useCondition());
      const warnSpy = mockConsole.warn();

      result.current
        .when(true)
        .then(<div>First</div>)
        .then(<div>Second</div>)
        .otherwise();

      expect(warnSpy).toHaveBeenCalledWith(
        "[useCondition] Multiple then() calls detected. Only the last one will be used."
      );
    });

    it("should warn about multiple render() calls", () => {
      const { result } = renderHook(() => useCondition());
      const warnSpy = mockConsole.warn();

      result.current
        .match("test")
        .case("test")
        .render(<div>First</div>)
        .render(<div>Second</div>)
        .otherwise();

      expect(warnSpy).toHaveBeenCalledWith(
        "[useCondition] Multiple render() calls detected. Only the last one will be used."
      );
    });
  });

  describe("Incomplete conditions handling", () => {
    it("should warn about incomplete when() without then()", () => {
      const { result } = renderHook(() => useCondition());
      const warnSpy = mockConsole.warn();

      result.current.when(true).otherwise();

      expect(warnSpy).toHaveBeenCalledWith(
        "[useCondition] Found 1 incomplete condition(s). These will be ignored."
      );
    });

    it("should warn about incomplete case() without render()", () => {
      const { result } = renderHook(() => useCondition());
      const warnSpy = mockConsole.warn();

      result.current.match("test").case("test").otherwise();

      expect(warnSpy).toHaveBeenCalledWith(
        "[useCondition] Found 1 incomplete condition(s). These will be ignored."
      );
    });

    it("should count multiple incomplete conditions", () => {
      const { result } = renderHook(() => useCondition());
      const warnSpy = mockConsole.warn();

      result.current
        .when(true)
        .when(false)
        .match("test")
        .case("test")
        .otherwise();

      expect(warnSpy).toHaveBeenCalledWith(
        "[useCondition] Found 3 incomplete condition(s). These will be ignored."
      );
    });
  });

  describe("Reset functionality", () => {
    it("should reset all conditions and state", () => {
      const { result } = renderHook(() => useCondition());

      // Add some conditions
      result.current
        .when(true)
        .then(<div>Test</div>)
        .otherwise();

      expect(result.current.getConditions()).toHaveLength(1);
      expect(result.current.hasMatched()).toBe(true);

      // Reset
      result.current.reset();

      expect(result.current.getConditions()).toHaveLength(0);
      expect(result.current.hasMatched()).toBe(false);
      expect(result.current.getMatchedIndex()).toBe(-1);
    });

    it("should allow building new conditions after reset", () => {
      const { result } = renderHook(() => useCondition());

      const firstResult = result.current
        .when(true)
        .then(<div>First</div>)
        .otherwise();

      const secondResult = result.current
        .reset()
        .when(true)
        .then(<div>Second</div>)
        .otherwise();

      expect(firstResult).toEqual(<div>First</div>);
      expect(secondResult).toEqual(<div>Second</div>);
    });
  });

  describe("Debug functionality", () => {
    it("should log debug information", () => {
      const { result } = renderHook(() => useCondition());
      const logSpy = mockConsole.log();

      result.current
        .when(true)
        .then(<div>Test</div>)
        .debug()
        .otherwise();

      expect(logSpy).toHaveBeenCalledWith("Conditions:", expect.any(Array));
      expect(logSpy).toHaveBeenCalledWith("Meta:", expect.any(Object));
      expect(logSpy).toHaveBeenCalledWith("Matched Index:", expect.any(Number));
    });
  });

  describe("Match mode warnings", () => {
    it("should warn about multiple match() calls", () => {
      const { result } = renderHook(() => useCondition());
      const warnSpy = mockConsole.warn();

      result.current
        .match("first")
        .match("second")
        .case("second")
        .render(<div>Test</div>)
        .otherwise();

      expect(warnSpy).toHaveBeenCalledWith(
        "[useCondition] Multiple match() calls detected. Previous match context will be overridden."
      );
    });
  });

  describe("Integration with React components", () => {
    it("should work within React components", () => {
      function TestComponent({ loading, error, data }: any) {
        const condition = useCondition();

        return (
          <div>
            {condition
              .when(loading)
              .then(<div data-testid="loading">Loading...</div>)
              .when(error)
              .then(<div data-testid="error">Error occurred</div>)
              .when(data)
              .then(<div data-testid="data">Data loaded</div>)
              .otherwise(<div data-testid="empty">No data</div>)}
          </div>
        );
      }

      // Test loading state
      render(<TestComponent loading={true} />);
      expect(screen.getByTestId("loading")).toBeInTheDocument();

      // Test error state
      render(<TestComponent error={true} />);
      expect(screen.getByTestId("error")).toBeInTheDocument();

      // Test data state
      render(<TestComponent data="some data" />);
      expect(screen.getByTestId("data")).toBeInTheDocument();

      // Test empty state
      render(<TestComponent />);
      expect(screen.getByTestId("empty")).toBeInTheDocument();
    });
  });
});

describe("Comparators", () => {
  describe("strict comparator", () => {
    it("should perform strict equality", () => {
      expect(comparators.strict(1, 1)).toBe(true);
      expect(comparators.strict(1, "1")).toBe(false);
      expect(comparators.strict(null, undefined)).toBe(false);
    });
  });

  describe("loose comparator", () => {
    it("should perform loose equality", () => {
      expect(comparators.loose(1, "1")).toBe(true);
      expect(comparators.loose(0, false)).toBe(true);
      expect(comparators.loose(null, undefined)).toBe(true);
    });
  });

  describe("deepEqual comparator", () => {
    it("should compare objects deeply", () => {
      expect(comparators.deepEqual({ a: 1 }, { a: 1 })).toBe(true);
      expect(comparators.deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(false); // Order matters in JSON.stringify
      expect(comparators.deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    });
  });

  describe("regex comparator", () => {
    it("should test regex patterns", () => {
      expect(comparators.regex("hello world", /hello/)).toBe(true);
      expect(comparators.regex("Hello World", /hello/i)).toBe(true);
      expect(comparators.regex("goodbye", /hello/)).toBe(false);
    });
  });

  describe("includes comparator", () => {
    it("should check array inclusion", () => {
      expect(comparators.includes([1, 2, 3], 2)).toBe(true);
      expect(comparators.includes(["a", "b", "c"], "d")).toBe(false);
      expect(comparators.includes("not array" as any, "test")).toBe(false);
    });
  });

  describe("greaterThan comparator", () => {
    it("should compare numbers", () => {
      expect(comparators.greaterThan(5, 3)).toBe(true);
      expect(comparators.greaterThan(3, 5)).toBe(false);
      expect(comparators.greaterThan(5, 5)).toBe(false);
    });
  });

  describe("lessThan comparator", () => {
    it("should compare numbers", () => {
      expect(comparators.lessThan(3, 5)).toBe(true);
      expect(comparators.lessThan(5, 3)).toBe(false);
      expect(comparators.lessThan(5, 5)).toBe(false);
    });
  });

  describe("range comparator", () => {
    it("should check if value is within range", () => {
      expect(comparators.range(5, 1, 10)).toBe(true);
      expect(comparators.range(1, 1, 10)).toBe(true);
      expect(comparators.range(10, 1, 10)).toBe(true);
      expect(comparators.range(0, 1, 10)).toBe(false);
      expect(comparators.range(11, 1, 10)).toBe(false);
    });
  });
});

describe("isValidReactNode utility", () => {
  it("should validate React nodes correctly", () => {
    expect(isValidReactNode(null)).toBe(true);
    expect(isValidReactNode(undefined)).toBe(true);
    expect(isValidReactNode("string")).toBe(true);
    expect(isValidReactNode(123)).toBe(true);
    expect(isValidReactNode(true)).toBe(true);
    expect(isValidReactNode(<div />)).toBe(true);
    expect(isValidReactNode([<div key="1" />, <span key="2" />])).toBe(true);
    expect(isValidReactNode({ invalidObject: true })).toBe(false);
    expect(isValidReactNode(() => {})).toBe(false);
  });
});
