# CLAUDE.md

## Code Style Rules

### NO DEFENSIVE FALLBACKS
- NEVER use `.get("key", "default")` patterns that hide missing data
- NEVER wrap things in try/catch to silently skip failures
- NEVER add fallbacks that make broken code appear to work
- Let code FAIL LOUDLY when something is wrong
- Breaking is GOOD - it means we can find and fix the actual problem
- Code that can't break is code that hides bugs forever

### Examples of BAD code (do not write):
```python
state.get("sandbox_id", "unknown")  # hides missing sandbox_id
```
```typescript
try { ... } catch { continue }  # silently skips failures
```

### Examples of GOOD code:
```python
state["sandbox_id"]  # fails if missing - we can fix the real bug
```
```typescript
// let it throw - we'll see the error and fix the root cause
```
