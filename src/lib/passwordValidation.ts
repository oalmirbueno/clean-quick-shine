// Unified password validator + strength meter for all auth flows.

const COMMON_PASSWORDS = [
  "12345678", "password", "123456789", "qwerty123", "password1",
  "11111111", "abc12345", "iloveyou", "admin123", "welcome1",
  "monkey12", "master12", "qwerty12", "letmein1", "trustno1",
  "jalimpo1", "jalimpo123", "limpeza1", "limpeza123",
];

export function validatePassword(pwd: string): string | null {
  if (pwd.length < 8) return "Senha deve ter no mínimo 8 caracteres";
  if (!/[A-Z]/.test(pwd)) return "Senha deve ter pelo menos 1 letra maiúscula";
  if (!/[a-z]/.test(pwd)) return "Senha deve ter pelo menos 1 letra minúscula";
  if (!/[0-9]/.test(pwd)) return "Senha deve ter pelo menos 1 número";
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return "Senha deve ter pelo menos 1 caractere especial";
  if (COMMON_PASSWORDS.includes(pwd.toLowerCase())) {
    return "Esta senha é muito comum. Escolha uma senha mais segura.";
  }
  return null;
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: "destructive" | "warning" | "primary" | "success";
  checks: {
    length: boolean;
    upper: boolean;
    lower: boolean;
    number: boolean;
    special: boolean;
  };
}

export function getPasswordStrength(pwd: string): PasswordStrength {
  const checks = {
    length: pwd.length >= 8,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    number: /[0-9]/.test(pwd),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
  };
  const passed = Object.values(checks).filter(Boolean).length;

  if (pwd.length === 0) {
    return { score: 0, label: "", color: "destructive", checks };
  }
  if (passed <= 2) return { score: 1, label: "Fraca", color: "destructive", checks };
  if (passed === 3) return { score: 2, label: "Média", color: "warning", checks };
  if (passed === 4) return { score: 3, label: "Boa", color: "primary", checks };
  return { score: 4, label: "Forte", color: "success", checks };
}
