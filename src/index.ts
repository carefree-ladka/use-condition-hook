import * as React from "react";

/**
 * Represents a single condition case in the condition chain
 */
type ConditionCase = {
  /** Type of condition: 'when' for boolean, 'match' for value comparison, 'fallback' for default */
  type: "when" | "match" | "fallback";
  /** Boolean result of the condition evaluation */
  condition?: boolean;
  /** Value to match against in match-case scenarios */
  matchValue?: any;
  /** React component to render when condition is true */
  component: React.ReactNode | null;
  /** Unique identifier for debugging purposes */
  id: string;
};

/**
 * Function type for custom value comparison in match-case scenarios
 * @param value - The value being matched against
 * @param matchValue - The value to compare with
 * @returns True if values match according to custom logic
 */
type MatchComparator = (value: any, matchValue: any) => boolean;

/**
 * Internal metadata for managing condition state
 */
interface ConditionMeta {
  /** Index of the matched condition (-1 if none matched) */
  matchedIndex: number;
  /** Value being matched in match-case scenarios */
  value: any;
  /** Custom comparator function for value matching */
  comparator: MatchComparator;
  /** Whether currently in a match-case chain */
  isInMatchMode: boolean;
}

/**
 * API interface for the useCondition hook
 */
interface ConditionAPI {
  /**
   * Creates a conditional branch based on a boolean condition
   * @param condition - Boolean condition to evaluate
   * @returns The condition API for method chaining
   *
   * @example
   * ```tsx
   * condition.when(isLoading).then(<Spinner />)
   * ```
   */
  when(condition: boolean): ConditionAPI;

  /**
   * Specifies the component to render when the preceding 'when' condition is true
   * @param component - React component or element to render
   * @returns The condition API for method chaining
   *
   * @example
   * ```tsx
   * condition
   *   .when(user.isAdmin)
   *   .then(<AdminPanel />)
   * ```
   */
  then(component: React.ReactNode): ConditionAPI;

  /**
   * Initiates a match-case chain for value-based conditional rendering
   * @param value - The value to match against in subsequent case() calls
   * @param comparator - Optional custom comparison function (defaults to strict equality)
   * @returns The condition API for method chaining
   *
   * @example
   * ```tsx
   * // Basic usage
   * condition.match(userRole).case('admin').render(<AdminDashboard />)
   *
   * // With custom comparator
   * condition
   *   .match(score, (a, b) => a >= b)
   *   .case(90).render(<GradeA />)
   *   .case(80).render(<GradeB />)
   * ```
   */
  match(value: any, comparator?: MatchComparator): ConditionAPI;

  /**
   * Creates a case branch in a match-case chain
   * @param matchValue - Value to compare against the matched value
   * @returns The condition API for method chaining
   *
   * @example
   * ```tsx
   * condition
   *   .match(theme)
   *   .case('dark').render(<DarkTheme />)
   *   .case('light').render(<LightTheme />)
   * ```
   */
  case(matchValue: any): ConditionAPI;

  /**
   * Specifies the component to render when the preceding 'case' matches
   * @param component - React component or element to render
   * @returns The condition API for method chaining
   *
   * @example
   * ```tsx
   * condition
   *   .match(status)
   *   .case('loading').render(<LoadingSpinner />)
   *   .case('error').render(<ErrorMessage />)
   * ```
   */
  render(component: React.ReactNode): ConditionAPI;

  /**
   * Specifies a fallback component when no conditions match
   * @param component - React component or element to render as fallback
   * @returns The condition API for method chaining
   *
   * @example
   * ```tsx
   * condition
   *   .when(isLoading).then(<Spinner />)
   *   .when(hasError).then(<Error />)
   *   .fallback(<MainContent />)
   * ```
   */
  fallback(component: React.ReactNode): ConditionAPI;

  /**
   * Logs debug information about current conditions to console
   * @returns The condition API for method chaining
   *
   * @example
   * ```tsx
   * condition
   *   .when(isDev).then(<DevTools />)
   *   .debug() // Logs condition state
   *   .otherwise()
   * ```
   */
  debug(): ConditionAPI;

  /**
   * Resets all conditions and state to initial values
   * @returns The condition API for method chaining
   *
   * @example
   * ```tsx
   * // Reset between different condition chains
   * const result1 = condition.when(x).then(<A />).otherwise();
   * const result2 = condition.reset().when(y).then(<B />).otherwise();
   * ```
   */
  reset(): ConditionAPI;

  /**
   * Evaluates all conditions and returns the appropriate component
   * @param defaultComponent - Component to return if no conditions match and no fallback is set
   * @returns The React component that should be rendered
   *
   * @example
   * ```tsx
   * // Basic usage
   * const content = condition
   *   .when(isLoading).then(<Spinner />)
   *   .when(hasData).then(<DataView />)
   *   .otherwise(<EmptyState />);
   *
   * // Without default
   * const content = condition
   *   .when(showModal).then(<Modal />)
   *   .otherwise(); // Returns null if no match
   * ```
   */
  otherwise(defaultComponent?: React.ReactNode): React.ReactNode;

  /**
   * Returns the index of the matched condition
   * @returns Index of matched condition or -1 if none matched
   *
   * @example
   * ```tsx
   * const result = condition.when(true).then(<div />).otherwise();
   * console.log(condition.getMatchedIndex()); // 0
   * ```
   */
  getMatchedIndex(): number;

  /**
   * Checks if any condition has been matched
   * @returns True if a condition matched, false otherwise
   *
   * @example
   * ```tsx
   * condition.when(false).then(<div />).otherwise();
   * console.log(condition.hasMatched()); // false
   * ```
   */
  hasMatched(): boolean;

  /**
   * Returns a read-only copy of all current conditions
   * @returns Frozen array of condition cases
   *
   * @example
   * ```tsx
   * const conditions = condition
   *   .when(true).then(<div />)
   *   .getConditions();
   * console.log(conditions.length); // 1
   * ```
   */
  getConditions(): readonly ConditionCase[];
}

/**
 * Default comparator function using strict equality
 */
const defaultComparator: MatchComparator = (value, matchValue) => {
  // Handle NaN comparison
  if (Number.isNaN(value) && Number.isNaN(matchValue)) return true;

  // Strict equality check
  return value === matchValue;
};

let conditionIdCounter = 0;

/**
 * A React hook for declarative conditional rendering with fluent API
 *
 * Provides a clean, chainable API for complex conditional rendering scenarios,
 * supporting both boolean conditions and value-based matching with custom comparators.
 *
 * @returns {ConditionAPI} Fluent API for building conditional rendering chains
 *
 * @example
 * **Basic When-Then Usage:**
 * ```tsx
 * function UserProfile({ user, isLoading, error }) {
 *   const condition = useCondition();
 *
 *   return condition
 *     .when(isLoading)
 *     .then(<div>Loading user profile...</div>)
 *     .when(error)
 *     .then(<div className="error">Failed to load profile</div>)
 *     .when(!user)
 *     .then(<div>User not found</div>)
 *     .fallback(<UserDetails user={user} />)
 *     .otherwise();
 * }
 * ```
 *
 * @example
 * **Match-Case Usage:**
 * ```tsx
 * function StatusBadge({ status }) {
 *   const condition = useCondition();
 *
 *   return condition
 *     .match(status)
 *     .case('active').render(<span className="badge-green">Active</span>)
 *     .case('inactive').render(<span className="badge-gray">Inactive</span>)
 *     .case('suspended').render(<span className="badge-red">Suspended</span>)
 *     .fallback(<span className="badge-blue">Unknown</span>)
 *     .otherwise();
 * }
 * ```
 *
 * @example
 * **Complex Nested Conditions:**
 * ```tsx
 * function Dashboard({ user, permissions, theme }) {
 *   const condition = useCondition();
 *
 *   const content = condition
 *     // Authentication check
 *     .when(!user)
 *     .then(<LoginForm />)
 *
 *     // Permission-based rendering
 *     .when(user && !permissions.includes('read'))
 *     .then(<AccessDenied />)
 *
 *     // Theme-based rendering
 *     .match(theme)
 *     .case('admin').render(<AdminDashboard user={user} />)
 *     .case('user').render(<UserDashboard user={user} />)
 *
 *     // Default fallback
 *     .fallback(<StandardDashboard user={user} />)
 *     .otherwise();
 *
 *   return <div className="dashboard">{content}</div>;
 * }
 * ```
 *
 * @example
 * **Custom Comparators:**
 * ```tsx
 * function ScoreDisplay({ score }) {
 *   const condition = useCondition();
 *
 *   return condition
 *     .match(score, (current, threshold) => current >= threshold)
 *     .case(90).render(<div className="grade-a">Excellent!</div>)
 *     .case(80).render(<div className="grade-b">Good job!</div>)
 *     .case(70).render(<div className="grade-c">Not bad!</div>)
 *     .case(60).render(<div className="grade-d">Needs improvement</div>)
 *     .fallback(<div className="grade-f">Try harder!</div>)
 *     .otherwise();
 * }
 * ```
 *
 * @example
 * **Using Built-in Comparators:**
 * ```tsx
 * import { useCondition, comparators } from 'use-condition';
 *
 * function SearchResults({ query, results }) {
 *   const condition = useCondition();
 *
 *   return condition
 *     .when(!query.trim())
 *     .then(<div>Enter a search term</div>)
 *
 *     .match(results, comparators.includes)
 *     .case([]).render(<div>No results found</div>)
 *
 *     .when(results.length > 100)
 *     .then(<div>Too many results, please refine your search</div>)
 *
 *     .fallback(<ResultsList results={results} />)
 *     .otherwise();
 * }
 * ```
 *
 * @example
 * **Form Validation:**
 * ```tsx
 * function FormField({ value, errors, touched }) {
 *   const condition = useCondition();
 *
 *   const fieldContent = condition
 *     .when(touched && errors.length > 0)
 *     .then(
 *       <div>
 *         <input value={value} className="error" />
 *         <span className="error-text">{errors[0]}</span>
 *       </div>
 *     )
 *     .when(touched && errors.length === 0)
 *     .then(<input value={value} className="success" />)
 *     .fallback(<input value={value} />)
 *     .otherwise();
 *
 *   return <div className="form-field">{fieldContent}</div>;
 * }
 * ```
 *
 * @example
 * **Debugging and Introspection:**
 * ```tsx
 * function DebugComponent({ condition }) {
 *   const cond = useCondition();
 *
 *   const result = cond
 *     .when(condition > 0)
 *     .then(<div>Positive</div>)
 *     .when(condition < 0)
 *     .then(<div>Negative</div>)
 *     .debug() // Logs condition state to console
 *     .otherwise(<div>Zero</div>);
 *
 *   // Check what matched
 *   console.log('Matched:', cond.hasMatched());
 *   console.log('Matched index:', cond.getMatchedIndex());
 *
 *   return result;
 * }
 * ```
 *
 * @example
 * **Reusable Condition Chains:**
 * ```tsx
 * function useAuthCondition(user) {
 *   const condition = useCondition();
 *
 *   return condition
 *     .when(!user)
 *     .then(<LoginPrompt />)
 *     .when(user && !user.emailVerified)
 *     .then(<EmailVerificationPrompt />)
 *     .when(user && user.suspended)
 *     .then(<AccountSuspendedMessage />);
 * }
 *
 * function ProfilePage({ user }) {
 *   const authCondition = useAuthCondition(user);
 *
 *   return authCondition
 *     .fallback(<UserProfile user={user} />)
 *     .otherwise();
 * }
 * ```
 */
export function useCondition(): ConditionAPI {
  const conditions = React.useRef<ConditionCase[]>([]);
  const meta = React.useRef<ConditionMeta>({
    matchedIndex: -1,
    value: null,
    comparator: defaultComparator,
    isInMatchMode: false,
  });

  // Reset function to clear all state
  const reset = React.useCallback(() => {
    conditions.current = [];
    meta.current = {
      matchedIndex: -1,
      value: null,
      comparator: defaultComparator,
      isInMatchMode: false,
    };
    return api;
  }, []);

  // Validation helpers
  const validateChaining = React.useCallback(
    (expectedPrevious: string, operation: string) => {
      const lastCondition = conditions.current[conditions.current.length - 1];

      if (!lastCondition) {
        console.warn(
          `[useCondition] ${operation} called without a preceding condition. Use 'when()' or 'case()' first.`
        );
        return false;
      }

      if (expectedPrevious === "when" && lastCondition.type !== "when") {
        console.warn(
          `[useCondition] ${operation} should follow 'when()' but found '${lastCondition.type}'.`
        );
        return false;
      }

      if (expectedPrevious === "case" && lastCondition.type !== "match") {
        console.warn(
          `[useCondition] ${operation} should follow 'case()' but found '${lastCondition.type}'.`
        );
        return false;
      }

      return true;
    },
    []
  );

  const api: ConditionAPI = React.useMemo(
    () => ({
      when(condition: boolean) {
        try {
          if (typeof condition !== "boolean") {
            console.warn(
              "[useCondition] when() expects a boolean value. Non-boolean values will be converted using Boolean()."
            );
          }

          conditions.current.push({
            type: "when",
            condition: Boolean(condition),
            component: null,
            id: `when-${++conditionIdCounter}`,
          });
        } catch (error) {
          console.error(
            "[useCondition] Error during condition evaluation:",
            error
          );
        }
        return api;
      },

      then(component: React.ReactNode) {
        if (!validateChaining("when", "then()")) {
          return api;
        }

        const lastCondition = conditions.current[conditions.current.length - 1];
        if (lastCondition) {
          if (lastCondition.component !== null) {
            console.warn(
              "[useCondition] Multiple then() calls detected. Only the last one will be used."
            );
          }
          lastCondition.component = component;
        }
        return api;
      },

      match(value: any, comparator: MatchComparator = defaultComparator) {
        if (meta.current.isInMatchMode) {
          console.warn(
            "[useCondition] Multiple match() calls detected. Previous match context will be overridden."
          );
        }

        if (typeof comparator !== "function") {
          console.warn(
            "[useCondition] comparator must be a function. Using default comparator."
          );
          comparator = defaultComparator;
        }

        meta.current.value = value;
        meta.current.comparator = comparator;
        meta.current.isInMatchMode = true;
        return api;
      },

      case(matchValue: any) {
        try {
          if (!meta.current.isInMatchMode) {
            console.warn(
              "[useCondition] case() called without match(). Use match() first to set the value to compare against."
            );
            return api;
          }

          const currentValue = meta.current.value;
          const comparator = meta.current.comparator;

          let condition = false;
          try {
            condition = comparator(currentValue, matchValue);
          } catch (error) {
            console.error(
              "[useCondition] Comparator function threw an error:",
              error
            );
            condition = false;
          }

          conditions.current.push({
            type: "match",
            condition,
            matchValue,
            component: null,
            id: `case-${++conditionIdCounter}`,
          });
        } catch (error) {
          console.error(
            "[useCondition] Error during condition evaluation:",
            error
          );
        }
        return api;
      },

      render(component: React.ReactNode) {
        if (!validateChaining("case", "render()")) {
          return api;
        }

        const lastCondition = conditions.current[conditions.current.length - 1];
        if (lastCondition) {
          if (lastCondition.component !== null) {
            console.warn(
              "[useCondition] Multiple render() calls detected. Only the last one will be used."
            );
          }
          lastCondition.component = component;
        }
        return api;
      },

      fallback(component: React.ReactNode) {
        // Check if fallback already exists
        const existingFallback = conditions.current.find(
          (c) => c.type === "fallback"
        );
        if (existingFallback) {
          console.warn(
            "[useCondition] Multiple fallback() calls detected. Only the last one will be used."
          );
          existingFallback.component = component;
        } else {
          conditions.current.push({
            type: "fallback",
            component,
            id: `fallback-${++conditionIdCounter}`,
          });
        }
        return api;
      },

      debug() {
        console.group("[useCondition] Debug Info");
        console.log("Conditions:", conditions.current);
        console.log("Meta:", meta.current);
        console.log("Matched Index:", meta.current.matchedIndex);
        console.groupEnd();
        return api;
      },

      reset,

      getMatchedIndex() {
        return meta.current.matchedIndex;
      },

      hasMatched() {
        return meta.current.matchedIndex !== -1;
      },

      getConditions() {
        return Object.freeze([...conditions.current]);
      },

      otherwise(defaultComponent: React.ReactNode = null) {
        try {
          // Reset matched index for fresh evaluation
          meta.current.matchedIndex = -1;

          // Check for incomplete condition chains
          const incompleteConditions = conditions.current.filter(
            (c) =>
              (c.type === "when" || c.type === "match") && c.component === null
          );

          if (incompleteConditions.length > 0) {
            console.warn(
              `[useCondition] Found ${incompleteConditions.length} incomplete condition(s). These will be ignored.`
            );
          }

          // Find first matching condition
          for (let i = 0; i < conditions.current.length; i++) {
            const conditionCase = conditions.current[i];

            if (
              conditionCase &&
              (conditionCase.type === "when" ||
                conditionCase.type === "match") &&
              conditionCase.condition &&
              conditionCase.component !== null
            ) {
              meta.current.matchedIndex = i;
              return conditionCase.component;
            }
          }

          // Look for fallback
          const fallback = conditions.current.find(
            (c) => c.type === "fallback"
          );
          if (fallback && fallback.component !== null) {
            return fallback.component;
          }

          return defaultComponent;
        } catch (error) {
          console.error(
            "[useCondition] Error during condition evaluation:",
            error
          );
          return defaultComponent;
        }
      },
    }),
    [validateChaining, reset]
  );

  return api;
}

/**
 * Collection of predefined comparator functions for common comparison scenarios
 *
 * @example
 * ```tsx
 * import { useCondition, comparators } from 'use-condition';
 *
 * function Example({ value, items, text, score }) {
 *   const condition = useCondition();
 *
 *   return condition
 *     // Strict equality (===)
 *     .match(value, comparators.strict)
 *     .case('exact').render(<div>Exact match</div>)
 *
 *     // Loose equality (==)
 *     .match(value, comparators.loose)
 *     .case('123').render(<div>Loose match</div>)
 *
 *     // Deep object comparison
 *     .match(user, comparators.deepEqual)
 *     .case({ id: 1, name: 'John' }).render(<div>User John</div>)
 *
 *     // Regex matching
 *     .match(text, comparators.regex)
 *     .case(/^hello/i).render(<div>Starts with hello</div>)
 *
 *     // Array includes
 *     .match(items, comparators.includes)
 *     .case('targetItem').render(<div>Found target</div>)
 *
 *     // Numeric comparisons
 *     .match(score, comparators.greaterThan)
 *     .case(90).render(<div>High score!</div>)
 *
 *     // Range checking
 *     .match(score, (val, range) => comparators.range(val, range.min, range.max))
 *     .case({ min: 80, max: 100 }).render(<div>Good score range</div>)
 *
 *     .otherwise();
 * }
 * ```
 */
export const comparators = {
  /** Strict equality comparison (===) */
  strict: (a: any, b: any) => a === b,

  /** Loose equality comparison (==) */
  loose: (a: any, b: any) => a == b,

  /** Deep object equality using JSON.stringify (note: not suitable for objects with functions) */
  deepEqual: (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b),

  /** Regular expression matching for strings */
  regex: (value: string, pattern: RegExp) => pattern.test(value),

  /** Check if array includes a specific value */
  includes: (array: any[], value: any) =>
    Array.isArray(array) && array.includes(value),

  /** Numeric greater than comparison */
  greaterThan: (a: number, b: number) => a > b,

  /** Numeric less than comparison */
  lessThan: (a: number, b: number) => a < b,

  /** Check if value is within a numeric range (inclusive) */
  range: (value: number, min: number, max: number) =>
    value >= min && value <= max,
} as const;

/**
 * Type guard to check if a value is a valid React node
 *
 * @param value - Value to check
 * @returns True if the value can be rendered by React
 *
 * @example
 * ```tsx
 * import { isValidReactNode } from 'use-condition';
 *
 * function SafeRender({ content }) {
 *   if (isValidReactNode(content)) {
 *     return <div>{content}</div>;
 *   }
 *   return <div>Invalid content</div>;
 * }
 * ```
 */
export const isValidReactNode = (value: any): value is React.ReactNode => {
  return (
    value === null ||
    value === undefined ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    React.isValidElement(value) ||
    Array.isArray(value)
  );
};
