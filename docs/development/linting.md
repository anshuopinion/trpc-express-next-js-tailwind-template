# Linting & Code Quality

Complete guide to BiomeJS setup, linting rules, and code quality standards for this template.

## Table of Contents
- [Overview](#overview)
- [BiomeJS Configuration](#biomejs-configuration)
- [Linting Rules](#linting-rules)
- [Code Formatting](#code-formatting)
- [IDE Integration](#ide-integration)
- [Commands](#commands)
- [Pre-commit Hooks](#pre-commit-hooks)
- [Troubleshooting](#troubleshooting)

## Overview

This template uses **BiomeJS** as a fast, all-in-one toolchain for JavaScript/TypeScript that provides:

- **Linting** - Code quality and error detection
- **Formatting** - Consistent code style
- **Import sorting** - Organized import statements
- **Git integration** - VCS-aware tooling

### Why BiomeJS?

- **Speed** - 10-100x faster than ESLint + Prettier
- **All-in-one** - Single tool for linting and formatting
- **TypeScript native** - Built for TypeScript from the ground up
- **Modern standards** - Up-to-date JavaScript/TypeScript best practices

## BiomeJS Configuration

The project uses a shared `biome.json` configuration at the root level:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.1.4/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git", 
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": true
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUndeclaredVariables": "error",
        "noUnusedVariables": "error",
        "useHookAtTopLevel": "error"
      },
      "style": {
        "useConst": "error"
      },
      "suspicious": {
        "noDebugger": "warn",
        "noConsole": "off",
        "noDocumentCookie": "off"
      },
      "a11y": {
        "recommended": true
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double",
      "jsxQuoteStyle": "double", 
      "semicolons": "always",
      "trailingCommas": "es5"
    }
  }
}
```

### Frontend-Specific Overrides

```json
{
  "includes": ["frontend/**/*.tsx", "frontend/**/*.jsx"],
  "linter": {
    "rules": {
      "correctness": {
        "useExhaustiveDependencies": "warn",
        "useHookAtTopLevel": "error"
      }
    }
  }
}
```

### Backend-Specific Overrides

```json
{
  "includes": ["backend/**/*.ts"],
  "linter": {
    "rules": {
      "a11y": {
        "recommended": false
      }
    }
  }
}
```

## Linting Rules

### Rule Categories

#### 1. Correctness Rules
Prevent runtime errors and logical mistakes:

```typescript
// ✅ Good - Variables are declared
const userName = "John";
console.log(userName);

// ❌ Bad - Undeclared variable (noUndeclaredVariables: error)
console.log(undeclaredVar);

// ✅ Good - No unused variables 
const usedVariable = "hello";
console.log(usedVariable);

// ❌ Bad - Unused variable (noUnusedVariables: error)
const unusedVariable = "world"; // This will error

// ✅ Good - Hooks at top level
function MyComponent() {
  const [state, setState] = useState(0);
  return <div>{state}</div>;
}

// ❌ Bad - Hook inside condition (useHookAtTopLevel: error)
function MyComponent() {
  if (condition) {
    const [state, setState] = useState(0); // Error
  }
}
```

#### 2. Style Rules
Enforce consistent code style:

```typescript
// ✅ Good - Use const for non-reassigned variables (useConst: error)
const config = { api: "https://api.example.com" };

// ❌ Bad - Using let when const should be used
let config = { api: "https://api.example.com" }; // Error - should be const
```

#### 3. Suspicious Rules
Detect potentially problematic code:

```typescript
// ⚠️ Warning - Debugger statements (noDebugger: warn)
function debug() {
  debugger; // Warning - should be removed in production
}

// ✅ Allowed - Console statements (noConsole: off)
console.log("This is allowed");
console.error("Errors are also allowed");

// ✅ Allowed - Document cookies (noDocumentCookie: off)
document.cookie = "theme=dark"; // Allowed for this project
```

#### 4. Accessibility Rules (Frontend Only)

```tsx
// ✅ Good - Accessible button
<button onClick={handleClick} aria-label="Close dialog">
  ×
</button>

// ❌ Bad - Missing accessibility attributes
<div onClick={handleClick}>×</div> // Should be a button

// ✅ Good - Alt text for images
<img src="/hero.jpg" alt="Hero section showing our product" />

// ❌ Bad - Missing alt text
<img src="/hero.jpg" /> // Error - missing alt attribute
```

#### 5. React-Specific Rules (Frontend)

```typescript
// ✅ Good - Exhaustive dependencies
useEffect(() => {
  fetchData(userId);
}, [userId]); // userId is in dependency array

// ⚠️ Warning - Missing dependency (useExhaustiveDependencies: warn)
useEffect(() => {
  fetchData(userId);
}, []); // Warning - userId should be in dependency array
```

## Code Formatting

### JavaScript/TypeScript Style

```typescript
// BiomeJS automatically formats to these standards:

// Double quotes for strings
const message = "Hello, world!";
const jsx = <div className="container">Content</div>;

// Semicolons always
const func = () => {
  return "value";
};

// Trailing commas (ES5 style)
const obj = {
  name: "John",
  age: 30, // <- trailing comma
};

const arr = [
  "item1",
  "item2", // <- trailing comma
];

// 2-space indentation
function example() {
  if (condition) {
    console.log("Indented with 2 spaces");
  }
}

// 100-character line width
const longString = "This is a very long string that will be broken into multiple lines when it exceeds 100 characters";
```

### React/JSX Formatting

```tsx
// JSX with consistent formatting
function Component({ title, description, onClick }: Props) {
  return (
    <div className="card">
      <h1 className="title">{title}</h1>
      <p className="description">{description}</p>
      <button
        type="button"
        className="btn btn-primary"
        onClick={onClick}
      >
        Click me
      </button>
    </div>
  );
}

// Props formatting for long component calls
<MyComponent
  prop1="value1"
  prop2="value2"  
  prop3="value3"
  onLongEventHandlerName={handleLongEventHandlerName}
/>
```

## IDE Integration

### Visual Studio Code

1. **Install BiomeJS Extension**:
   ```bash
   code --install-extension biomejs.biome
   ```

2. **Workspace Settings** (`.vscode/settings.json`):
   ```json
   {
     "editor.defaultFormatter": "biomejs.biome",
     "editor.formatOnSave": true,
     "editor.codeActionsOnSave": {
       "quickfix.biome": "explicit",
       "source.organizeImports.biome": "explicit"
     },
     "biome.lspBin": "./node_modules/@biomejs/biome/bin/biome"
   }
   ```

3. **User Settings** for global BiomeJS:
   ```json
   {
     "[javascript]": {
       "editor.defaultFormatter": "biomejs.biome"
     },
     "[typescript]": {
       "editor.defaultFormatter": "biomejs.biome"
     },
     "[javascriptreact]": {
       "editor.defaultFormatter": "biomejs.biome"
     },
     "[typescriptreact]": {
       "editor.defaultFormatter": "biomejs.biome"
     }
   }
   ```

### WebStorm/IntelliJ IDEA

1. **Install BiomeJS Plugin** from JetBrains Marketplace

2. **Enable BiomeJS**:
   - Go to `Settings` → `Languages & Frameworks` → `BiomeJS`
   - Check "Enable BiomeJS"
   - Set "BiomeJS package" to `node_modules/@biomejs/biome`

3. **Format on Save**:
   - Go to `Settings` → `Tools` → `Actions on Save`
   - Enable "Reformat code" and "Optimize imports"

### Neovim

```lua
-- Using Mason for LSP management
require("mason").setup()
require("mason-lspconfig").setup({
  ensure_installed = { "biome" },
})

-- BiomeJS LSP configuration
local lspconfig = require("lspconfig")
lspconfig.biome.setup({
  cmd = { "npx", "@biomejs/biome", "lsp-proxy" },
})

-- Format on save
vim.api.nvim_create_autocmd("BufWritePre", {
  pattern = { "*.js", "*.jsx", "*.ts", "*.tsx" },
  callback = function()
    vim.lsp.buf.format({ async = false })
  end,
})
```

## Commands

### Backend Commands

```bash
# Check linting issues
npm run lint           # Check for linting issues
npm run lint:fix       # Fix auto-fixable linting issues

# Format code
npm run format         # Format all files
npm run format:check   # Check if files are formatted correctly

# Type checking
npm run typecheck      # Run TypeScript type checking
```

### Frontend Commands

```bash
# Linting
npm run lint           # Next.js ESLint + BiomeJS
npm run lint:fix       # Fix auto-fixable issues

# Type checking  
npm run type-check     # TypeScript type checking

# Building (includes linting)
npm run build         # Production build with linting
```

### Global Commands (from root)

```bash
# Format entire project
npx biome format --write .

# Check entire project
npx biome check .

# Apply safe fixes
npx biome check --apply .

# Apply all fixes (including unsafe)
npx biome check --apply-unsafe .
```

## Pre-commit Hooks

### Setup with Husky

1. **Install Dependencies**:
   ```bash
   npm install --save-dev husky lint-staged
   ```

2. **Initialize Husky**:
   ```bash
   npx husky install
   npx husky add .husky/pre-commit "npx lint-staged"
   ```

3. **Configure lint-staged** in `package.json`:
   ```json
   {
     "lint-staged": {
       "*.{js,jsx,ts,tsx}": [
         "biome check --apply --no-errors-on-unmatched",
         "biome format --write --no-errors-on-unmatched"
       ],
       "*.{json,md}": [
         "biome format --write --no-errors-on-unmatched"
       ]
     }
   }
   ```

### Git Hooks Configuration

```bash
#!/bin/sh
# .husky/pre-commit

# Run lint-staged
npx lint-staged

# Run type checking for critical changes
if git diff --cached --name-only | grep -E '\.(ts|tsx)$' > /dev/null; then
  echo "Running TypeScript type checking..."
  cd frontend && npm run type-check
  cd ../backend && npm run typecheck
fi
```

## Troubleshooting

### Common Issues

#### 1. BiomeJS Not Working in IDE

**Problem**: IDE shows formatting/linting errors
**Solution**:
```bash
# Check BiomeJS installation
npx biome --version

# Check configuration
npx biome check --verbose .

# Reinstall BiomeJS
npm install --save-dev @biomejs/biome@latest
```

#### 2. Conflicting Rules with Other Tools

**Problem**: Conflicts between BiomeJS and other linters
**Solution**: Disable conflicting rules in other tools:

```json
// .eslintrc.json (if using ESLint alongside)
{
  "extends": ["@biomejs/biome"],
  "rules": {
    // Disable formatting rules handled by BiomeJS
    "prettier/prettier": "off",
    "@typescript-eslint/semi": "off",
    "@typescript-eslint/quotes": "off"
  }
}
```

#### 3. Import Sorting Issues

**Problem**: Import order not consistent
**Solution**: Configure BiomeJS import sorting:

```json
// biome.json
{
  "organizeImports": {
    "enabled": true
  }
}
```

#### 4. Performance Issues

**Problem**: BiomeJS running slowly
**Solution**:
```bash
# Run with performance profiling
npx biome check --verbose --reporter=json .

# Check file ignore patterns
echo "node_modules/" >> .biomeignore
echo "dist/" >> .biomeignore
echo ".next/" >> .biomeignore
```

### Configuration Overrides

#### Project-specific Rules

```json
// biome.json - Add custom rules for specific needs
{
  "linter": {
    "rules": {
      "suspicious": {
        // Allow console.log in development
        "noConsole": "off"
      },
      "style": {
        // Enforce specific naming conventions
        "useNamingConvention": {
          "level": "error",
          "options": {
            "strictCase": false,
            "conventions": [
              {
                "selector": {
                  "kind": "function"
                },
                "match": "camelCase"
              }
            ]
          }
        }
      }
    }
  }
}
```

#### File-specific Ignores

```javascript
// Disable specific rules for a file
/* biome-ignore lint/suspicious/noConsole: development logging */
console.log("Debug information");

// Disable all linting for a file
/* biome-ignore */
// This file will not be linted

// Disable linting for specific lines
const debugMode = true;
/* biome-ignore lint/suspicious/noDebugger: needed for development */
if (debugMode) debugger;
```

### Migration from ESLint/Prettier

If migrating from ESLint + Prettier:

1. **Remove old dependencies**:
   ```bash
   npm uninstall eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin
   ```

2. **Remove configuration files**:
   ```bash
   rm .eslintrc.json .prettierrc
   ```

3. **Update package.json scripts**:
   ```json
   {
     "scripts": {
       "lint": "biome lint .",
       "lint:fix": "biome lint --apply .",
       "format": "biome format --write .",
       "format:check": "biome format ."
     }
   }
   ```

4. **Update IDE configuration** to use BiomeJS instead of ESLint/Prettier

## Best Practices

### 1. Consistent Rule Application

- **Use shared configuration** across frontend and backend
- **Override rules** only when necessary for specific contexts
- **Document exceptions** when disabling rules

### 2. CI/CD Integration

```yaml
# .github/workflows/lint.yml
name: Lint
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx biome ci .
```

### 3. Performance Optimization

- **Use .biomeignore** for directories that don't need linting
- **Enable caching** in CI environments
- **Run incrementally** for large codebases

### 4. Team Adoption

- **IDE setup guides** for all team members
- **Pre-commit hooks** to catch issues early
- **Clear documentation** of project-specific rules
- **Regular rule reviews** to ensure they still make sense

This linting setup ensures consistent code quality and style across the entire project while providing fast feedback during development.