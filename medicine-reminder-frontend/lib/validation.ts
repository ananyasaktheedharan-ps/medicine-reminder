const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email is required";
  if (!EMAIL_RE.test(email.trim())) return "Enter a valid email address";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password))
    return "Password must contain a letter and a number";
  return null;
}

export function validateName(name: string, label = "Name"): string | null {
  if (!name.trim()) return `${label} is required`;
  if (name.trim().length < 2) return `${label} must be at least 2 characters`;
  return null;
}

export interface MedicineInput {
  name: string;
  dosage: string;
  times: string[];
  startDate: string;
  endDate?: string;
}

export function validateMedicine(input: MedicineInput): Record<string, string> {
  const errors: Record<string, string> = {};
  const nameErr = validateName(input.name, "Medicine name");
  if (nameErr) errors.name = nameErr;
  if (!input.dosage.trim()) errors.dosage = "Dosage is required";
  if (input.times.length === 0) errors.times = "Add at least one reminder time";
  if (!input.startDate) errors.startDate = "Start date is required";
  if (input.endDate && input.startDate && input.endDate < input.startDate)
    errors.endDate = "End date cannot be before start date";
  return errors;
}
