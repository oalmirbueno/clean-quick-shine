---
name: Auth UI System
description: Unified premium auth flow — AuthLayout split, password validator, role detection on login
type: feature
---
Auth flow architecture (post-refactor 2026-04):

- Shell: `src/components/auth/AuthLayout.tsx` — split layout (marketing left desktop, form right). Props: onBack, eyebrow, title, subtitle, hideMarketing, showTrust.
- Password: `src/lib/passwordValidation.ts` exports `validatePassword` and `getPasswordStrength`. UI in `PasswordStrengthMeter` + `PasswordField` (eye toggle).
- Role selection: removed from Welcome and Login. Lives ONLY inside Register (segmented control Cliente/Diarista). Login auto-detects role from user_roles and routes.
- Routes: `/onboarding/client` and `/onboarding/pro` redirect to `/register`. Old OnboardingClient.tsx / OnboardingPro.tsx files deleted.
- Welcome (`Onboarding.tsx`) is just a value-prop screen with two CTAs: Criar conta / Entrar.

**Why:** Previous flow had role selectors duplicated across 3 screens (Onboarding, Login, Register), inconsistent visual styles, and 3 copies of password validation logic.
