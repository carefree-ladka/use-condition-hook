# use-condition-hook

[![npm version](https://badge.fury.io/js/use-condition-hook.svg)](https://badge.fury.io/js/use-condition-hook)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A React hook for **declarative conditional rendering** with a fluent, chainable API. Say goodbye to nested ternary operators and complex conditional logic in your JSX!

## ✨ Features

- 🎯 **Declarative syntax** - Clean, readable conditional rendering
- 🔗 **Chainable API** - Fluent method chaining for complex scenarios
- 🎛️ **Multiple patterns** - Support for `when-then`, `match-case`, and fallback patterns
- 🧩 **Custom comparators** - Flexible value comparison with built-in utilities
- 📘 **TypeScript first** - Full type safety and excellent IDE support
- 🪶 **Lightweight** - Minimal bundle size impact (< 5kB)
- ⚡ **Zero dependencies** - Only requires React 16.8+
- 🛡️ **Production ready** - Comprehensive error handling and edge case management

## 📦 Installation

```bash
npm install use-condition-hook
```

```bash
yarn add use-condition-hook
```

```bash
pnpm add use-condition-hook
```

## 🚀 Quick Start

```tsx
import { useCondition } from 'use-condition-hook';

function UserProfile({ user, isLoading, error }) {
  const condition = useCondition();

  return condition
    .when(isLoading)
    .then(<div>Loading...</div>)
    .when(error)
    .then(<div className="error">Failed to load profile</div>)
    .when(!user)
    .then(<div>User not found</div>)
    .fallback(<UserDetails user={user} />)
    .otherwise();
}
```

## 📚 API Reference

### Core Methods

#### `when(condition: boolean)`
Creates a conditional branch based on a boolean condition.

```tsx
condition.when(isLoading).then(<Spinner />)
```

#### `then(component: React.ReactNode)`
Specifies the component to render when the preceding `when` condition is true.

```tsx
condition
  .when(user.isAdmin)
  .then(<AdminPanel />)
```

#### `match(value: any, comparator?: Function)`
Initiates a match-case chain for value-based conditional rendering.

```tsx
condition.match(userRole).case('admin').render(<AdminDashboard />)
```

#### `case(matchValue: any)`
Creates a case branch in a match-case chain.

```tsx
condition
  .match(theme)
  .case('dark').render(<DarkTheme />)
  .case('light').render(<LightTheme />)
```

#### `render(component: React.ReactNode)`
Specifies the component to render when the preceding `case` matches.

```tsx
condition
  .match(status)
  .case('loading').render(<LoadingSpinner />)
```

#### `fallback(component: React.ReactNode)`
Specifies a fallback component when no conditions match.

```tsx
condition
  .when(isLoading).then(<Spinner />)
  .fallback(<MainContent />)
```

#### `otherwise(defaultComponent?: React.ReactNode)`
Evaluates all conditions and returns the appropriate component.

```tsx
const result = condition
  .when(isLoading).then(<Spinner />)
  .otherwise(<DefaultContent />);
```

### Utility Methods

#### `reset()`
Resets all conditions and state to initial values.

#### `debug()`
Logs debug information about current conditions to console.

#### `getMatchedIndex()`
Returns the index of the matched condition (-1 if none matched).

#### `hasMatched()`
Checks if any condition has been matched.

#### `getConditions()`
Returns a read-only copy of all current conditions.

## 🎨 Usage Patterns

### 1. Basic When-Then Pattern

Perfect for simple boolean conditions:

```tsx
function LoadingButton({ isLoading, onClick, children }) {
  const condition = useCondition();

  return (
    <button onClick={onClick} disabled={isLoading}>
      {condition
        .when(isLoading)
        .then(<>🔄 Loading...</>)
        .otherwise(children)
      }
    </button>
  );
}
```

### 2. Match-Case Pattern

Ideal for value-based switching:

```tsx
function StatusBadge({ status }) {
  const condition = useCondition();

  return condition
    .match(status)
    .case('active').render(<span className="badge-green">✅ Active</span>)
    .case('inactive').render(<span className="badge-gray">⏸️ Inactive</span>)
    .case('suspended').render(<span className="badge-red">🚫 Suspended</span>)
    .case('pending').render(<span className="badge-yellow">⏳ Pending</span>)
    .fallback(<span className="badge-blue">❓ Unknown</span>)
    .otherwise();
}
```

### 3. Complex Authentication Flow

Handle multiple authentication states:

```tsx
function AuthenticatedRoute({ user, permissions, children }) {
  const condition = useCondition();

  return condition
    // Check if user is logged in
    .when(!user)
    .then(<LoginForm />)

    // Check email verification
    .when(user && !user.emailVerified)
    .then(<EmailVerificationPrompt />)

    // Check account status
    .when(user?.status === 'suspended')
    .then(<AccountSuspendedMessage />)

    // Check permissions
    .when(user && !permissions.includes('access'))
    .then(<AccessDeniedMessage />)

    // All good, show content
    .fallback(children)
    .otherwise();
}
```

### 4. Form Validation States

Handle different validation scenarios:

```tsx
function FormField({ value, errors, touched, isSubmitting }) {
  const condition = useCondition();

  const fieldClassName = condition
    .when(touched && errors.length > 0)
    .then('form-field error')
    .when(touched && errors.length === 0 && value)
    .then('form-field success')
    .when(isSubmitting)
    .then('form-field submitting')
    .otherwise('form-field');

  const fieldContent = condition
    .reset() // Reset for new chain
    .when(touched && errors.length > 0)
    .then(
      <>
        <input value={value} className={fieldClassName} />
        <span className="error-message">{errors[0]}</span>
      </>
    )
    .otherwise(<input value={value} className={fieldClassName} />);

  return <div className="form-group">{fieldContent}</div>;
}
```

### 5. Data Fetching States

Handle API loading states elegantly:

```tsx
function DataTable({ data, isLoading, error, isEmpty }) {
  const condition = useCondition();

  return (
    <div className="data-container">
      {condition
        .when(isLoading)
        .then(
          <div className="loading-state">
            <Spinner />
            <p>Loading data...</p>
          </div>
        )
        .when(error)
        .then(
          <div className="error-state">
            <ErrorIcon />
            <p>Failed to load data: {error.message}</p>
            <button onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        )
        .when(isEmpty)
        .then(
          <div className="empty-state">
            <EmptyIcon />
            <p>No data available</p>
            <button>Add New Item</button>
          </div>
        )
        .fallback(<Table data={data} />)
        .otherwise()
      }
    </div>
  );
}
```

## 🔧 Custom Comparators

### Built-in Comparators

```tsx
import { useCondition, comparators } from 'use-condition-hook';

function Example({ score, items, text, user }) {
  const condition = useCondition();

  return condition
    // Strict equality (===)
    .match(user.role, comparators.strict)
    .case('admin').render(<AdminView />)

    // Loose equality (==)
    .match(score, comparators.loose)
    .case('100').render(<PerfectScore />)

    // Deep object comparison
    .match(user, comparators.deepEqual)
    .case({ id: 1, name: 'John' }).render(<WelcomeJohn />)

    // Regex matching
    .match(text, comparators.regex)
    .case(/^hello/i).render(<Greeting />)

    // Array includes
    .match(items, comparators.includes)
    .case('premium').render(<PremiumFeature />)

    // Numeric comparisons
    .match(score, comparators.greaterThan)
    .case(90).render(<HighScore />)

    // Range checking
    .match(score, (val, range) => comparators.range(val, range.min, range.max))
    .case({ min: 80, max: 100 }).render(<GoodRange />)

    .otherwise();
}
```

### Available Comparators

| Comparator | Description | Example |
|------------|-------------|---------|
| `strict` | Strict equality (`===`) | `comparators.strict(1, 1)` |
| `loose` | Loose equality (`==`) | `comparators.loose(1, '1')` |
| `deepEqual` | Deep object comparison | `comparators.deepEqual({a:1}, {a:1})` |
| `regex` | Regular expression test | `comparators.regex('hello', /^h/)` |
| `includes` | Array includes check | `comparators.includes([1,2,3], 2)` |
| `greaterThan` | Numeric greater than | `comparators.greaterThan(5, 3)` |
| `lessThan` | Numeric less than | `comparators.lessThan(3, 5)` |
| `range` | Numeric range check | `comparators.range(5, 1, 10)` |

### Custom Comparator Examples

```tsx
// Case-insensitive string matching
const caseInsensitive = (a, b) =>
  a.toLowerCase() === b.toLowerCase();

// Array length comparison
const arrayLength = (arr, length) =>
  Array.isArray(arr) && arr.length === length;

// Date comparison
const dateAfter = (date, afterDate) =>
  new Date(date) > new Date(afterDate);

// Usage
condition
  .match(username, caseInsensitive)
  .case('ADMIN').render(<AdminPanel />)

  .match(items, arrayLength)
  .case(0).render(<EmptyList />)

  .match(createdAt, dateAfter)
  .case('2024-01-01').render(<NewPost />);
```

## 🎯 Advanced Patterns

### Reusable Condition Hooks

Create reusable condition logic:

```tsx
function useAuthCondition(user) {
  const condition = useCondition();

  return condition
    .when(!user)
    .then(<LoginPrompt />)
    .when(user && !user.emailVerified)
    .then(<EmailVerificationPrompt />)
    .when(user && user.suspended)
    .then(<AccountSuspendedMessage />);
}

function ProfilePage({ user }) {
  const authCondition = useAuthCondition(user);

  return authCondition
    .fallback(<UserProfile user={user} />)
    .otherwise();
}

function SettingsPage({ user }) {
  const authCondition = useAuthCondition(user);

  return authCondition
    .fallback(<UserSettings user={user} />)
    .otherwise();
}
```

### Nested Conditions

Handle complex nested scenarios:

```tsx
function Dashboard({ user, subscription, features }) {
  const condition = useCondition();

  return condition
    .when(!user)
    .then(<AuthRequired />)
    .when(user && !subscription)
    .then(<SubscriptionRequired />)
    .match(subscription?.tier)
    .case('basic').render(
      condition
        .reset()
        .when(features.basicDashboard)
        .then(<BasicDashboard />)
        .otherwise(<UpgradePrompt />)
    )
    .case('premium').render(<PremiumDashboard />)
    .case('enterprise').render(<EnterpriseDashboard />)
    .fallback(<StandardDashboard />)
    .otherwise();
}
```

### Performance Optimization

```tsx
// Memoize expensive conditions
function ExpensiveComponent({ data, filters }) {
  const condition = useCondition();

  const shouldShowExpensiveView = useMemo(() =>
    data.length > 1000 && filters.complex
  , [data.length, filters.complex]);

  return condition
    .when(shouldShowExpensiveView)
    .then(<VirtualizedTable data={data} />)
    .otherwise(<SimpleTable data={data} />);
}
```

## 🧪 Testing

Testing components that use `useCondition`:

```tsx
import { render, screen } from '@testing-library/react';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  it('shows loading state', () => {
    render(<UserProfile isLoading={true} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    const error = new Error('Failed to load');
    render(<UserProfile error={error} />);
    expect(screen.getByText('Failed to load profile')).toBeInTheDocument();
  });

  it('shows user details when loaded', () => {
    const user = { name: 'John Doe', email: 'john@example.com' };
    render(<UserProfile user={user} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

## 🔍 Debugging

Use the built-in debugging features:

```tsx
function DebugComponent({ condition }) {
  const cond = useCondition();

  const result = cond
    .when(condition > 0)
    .then(<div>Positive</div>)
    .when(condition < 0)
    .then(<div>Negative</div>)
    .debug() // Logs condition state to console
    .otherwise(<div>Zero</div>);

  // Additional debugging
  console.log('Matched:', cond.hasMatched());
  console.log('Matched index:', cond.getMatchedIndex());
  console.log('All conditions:', cond.getConditions());

  return result;
}
```

## ⚠️ Common Pitfalls

### 1. Forgetting to call `otherwise()`

```tsx
// ❌ Wrong - nothing will render
const result = condition.when(true).then(<div />);

// ✅ Correct
const result = condition.when(true).then(<div />).otherwise();
```

### 2. Incomplete condition chains

```tsx
// ❌ Wrong - condition without component
condition.when(true).otherwise(); // Warning logged

// ✅ Correct
condition.when(true).then(<div />).otherwise();
```

### 3. Using `match()` without `case()`

```tsx
// ❌ Wrong
condition.match(value).otherwise(); // Warning logged

// ✅ Correct
condition.match(value).case('test').render(<div />).otherwise();
```

### 4. Multiple fallbacks

```tsx
// ❌ Wrong - only last fallback is used
condition
  .fallback(<div>First</div>)   // Ignored
  .fallback(<div>Second</div>)  // Used
  .otherwise();
```

## 🔄 Migration Guide

### From Ternary Operators

```tsx
// Before
function Component({ loading, error, data }) {
  return (
    <div>
      {loading ? (
        <Spinner />
      ) : error ? (
        <Error message={error.message} />
      ) : data ? (
        <DataView data={data} />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

// After
function Component({ loading, error, data }) {
  const condition = useCondition();

  return (
    <div>
      {condition
        .when(loading)
        .then(<Spinner />)
        .when(error)
        .then(<Error message={error.message} />)
        .when(data)
        .then(<DataView data={data} />)
        .otherwise(<EmptyState />)
      }
    </div>
  );
}
```

### From Switch Statements

```tsx
// Before
function StatusComponent({ status }) {
  const renderStatus = () => {
    switch (status) {
      case 'loading':
        return <Spinner />;
      case 'error':
        return <ErrorMessage />;
      case 'success':
        return <SuccessMessage />;
      default:
        return <DefaultMessage />;
    }
  };

  return <div>{renderStatus()}</div>;
}

// After
function StatusComponent({ status }) {
  const condition = useCondition();

  return (
    <div>
      {condition
        .match(status)
        .case('loading').render(<Spinner />)
        .case('error').render(<ErrorMessage />)
        .case('success').render(<SuccessMessage />)
        .fallback(<DefaultMessage />)
        .otherwise()
      }
    </div>
  );
}
```

## 📊 Performance

`use-condition-hook` is designed for optimal performance:

- **Minimal re-renders**: Uses `useRef` for state management
- **Memoized API**: Methods are memoized to prevent unnecessary re-creation
- **Small bundle size**: < 5kB minified and gzipped
- **Tree-shakeable**: Only import what you use
- **Zero dependencies**: No additional bundle weight

## 🤝 Contributing

<!-- We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details. -->

### Development Setup

```bash
git clone https://github.com/carefree-ladka/use-condition-hook.git
cd use-condition-hook
npm install
npm run dev
```

### Running Tests

```bash
npm test          # Run tests once
npm run test:watch # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

## 📄 License

MIT © [Your Name](https://github.com/carefree-ladka)

## 🙏 Acknowledgments

- Inspired by pattern matching in functional programming languages
- Built with modern React patterns and TypeScript best practices
- Thanks to the React community for feedback and suggestions

---

**Happy coding! 🚀**

If you find this hook useful, please consider giving it a ⭐ on [GitHub](https://github.com/yourusername/use-condition-hook)!
