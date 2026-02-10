

# Fix: Placeholder text showing raw translation key

## Problem

The name input field in onboarding step 1 shows the raw key `preOnboarding.name.placeholder` instead of actual text like "Tu nombre". This is because the translation key in the code doesn't match the one defined in the language file.

- **Code uses**: `t('preOnboarding.name.placeholder')` (with dot notation)
- **Translation defines**: `preOnboarding.namePlaceholder` (camelCase, no dot)

## Fix

**File: `src/pages/PreOnboarding.tsx` (line 441)**

Change the translation key from `preOnboarding.name.placeholder` to `preOnboarding.namePlaceholder` to match the existing translation.

This is a one-line fix.

