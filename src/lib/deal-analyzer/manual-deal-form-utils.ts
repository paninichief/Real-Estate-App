import type { ManualDealFormValues } from "./manual-deal-types";

/** Every raw form field as the plain string a text input holds. */
export type ManualDealRawValues = Record<keyof ManualDealFormValues, string>;

export const EMPTY_MANUAL_DEAL_RAW_VALUES: ManualDealRawValues = {
  address: "",
  purchasePrice: "",
  monthlyRent: "",
  bedrooms: "",
  bathrooms: "",
  squareFootage: "",
  downPayment: "",
  interestRatePercent: "",
  loanTermYears: "",
  propertyTaxes: "",
  insurance: "",
  propertyManagement: "",
  maintenanceReserve: "",
  hoa: "",
  vacancyReserve: "",
  utilities: "",
  numberOfUnits: "",
  renovationCosts: "",
  occupancy: "",
  section8Status: "",
};

/** Exported for reuse by the down-payment Amount/Percent toggle in the form component. */
export function parseOptionalNumber(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseOptionalText(raw: string): string | null {
  const trimmed = raw.trim();
  return trimmed === "" ? null : trimmed;
}

/**
 * Converts raw input strings into typed values. A blank field always
 * becomes `null` ("not provided") — never 0, never NaN — so downstream
 * calculation code can rely on `null` as the single "not entered" signal.
 */
export function parseManualDealValues(raw: ManualDealRawValues): ManualDealFormValues {
  return {
    address: parseOptionalText(raw.address),
    purchasePrice: parseOptionalNumber(raw.purchasePrice),
    monthlyRent: parseOptionalNumber(raw.monthlyRent),
    bedrooms: parseOptionalNumber(raw.bedrooms),
    bathrooms: parseOptionalNumber(raw.bathrooms),
    squareFootage: parseOptionalNumber(raw.squareFootage),
    downPayment: parseOptionalNumber(raw.downPayment),
    interestRatePercent: parseOptionalNumber(raw.interestRatePercent),
    loanTermYears: parseOptionalNumber(raw.loanTermYears),
    propertyTaxes: parseOptionalNumber(raw.propertyTaxes),
    insurance: parseOptionalNumber(raw.insurance),
    propertyManagement: parseOptionalNumber(raw.propertyManagement),
    maintenanceReserve: parseOptionalNumber(raw.maintenanceReserve),
    hoa: parseOptionalNumber(raw.hoa),
    vacancyReserve: parseOptionalNumber(raw.vacancyReserve),
    utilities: parseOptionalNumber(raw.utilities),
    numberOfUnits: parseOptionalNumber(raw.numberOfUnits),
    renovationCosts: parseOptionalNumber(raw.renovationCosts),
    occupancy: parseOptionalText(raw.occupancy),
    section8Status: parseOptionalText(raw.section8Status),
  };
}

export type ManualDealValidationErrors = Partial<Record<keyof ManualDealFormValues, string>>;

const EXPENSE_FIELD_LABELS: Record<string, string> = {
  propertyTaxes: "Property taxes",
  insurance: "Insurance",
  propertyManagement: "Property management",
  maintenanceReserve: "Maintenance reserve",
  hoa: "HOA",
  vacancyReserve: "Monthly vacancy reserve",
  utilities: "Utilities",
};

/**
 * Field-level validation (spec section 11.1). Required fields must be
 * present; every numeric field, required or optional, must be a sensible
 * number when entered. Leaving an optional field blank is always valid.
 */
export function validateManualDealRawValues(raw: ManualDealRawValues): ManualDealValidationErrors {
  const values = parseManualDealValues(raw);
  const errors: ManualDealValidationErrors = {};

  if (values.address === null) {
    errors.address = "Enter the property address.";
  }

  if (values.purchasePrice === null) {
    errors.purchasePrice = "Enter the purchase price.";
  } else if (values.purchasePrice <= 0) {
    errors.purchasePrice = "Purchase price must be a positive number.";
  }

  if (values.monthlyRent === null) {
    errors.monthlyRent = "Enter the monthly rent.";
  } else if (values.monthlyRent < 0) {
    errors.monthlyRent = "Monthly rent must be zero or a positive number.";
  }

  if (values.bedrooms === null) {
    errors.bedrooms = "Enter the number of bedrooms.";
  } else if (values.bedrooms < 0) {
    errors.bedrooms = "Bedrooms must be zero or a positive number.";
  }

  if (values.bathrooms === null) {
    errors.bathrooms = "Enter the number of bathrooms.";
  } else if (values.bathrooms < 0) {
    errors.bathrooms = "Bathrooms must be zero or a positive number.";
  }

  if (values.squareFootage === null) {
    errors.squareFootage = "Enter the square footage.";
  } else if (values.squareFootage <= 0) {
    errors.squareFootage = "Square footage must be a positive number.";
  }

  if (values.downPayment !== null && values.downPayment < 0) {
    errors.downPayment = "Down payment must be zero or a positive number.";
  } else if (
    values.downPayment !== null &&
    values.purchasePrice !== null &&
    values.downPayment > values.purchasePrice
  ) {
    errors.downPayment = "Down payment cannot exceed the purchase price.";
  }

  if (values.interestRatePercent !== null && values.interestRatePercent < 0) {
    errors.interestRatePercent = "Interest rate must be zero or a positive number.";
  }

  if (values.loanTermYears !== null && values.loanTermYears <= 0) {
    errors.loanTermYears = "Loan term must be a positive number of years.";
  }

  for (const field of Object.keys(EXPENSE_FIELD_LABELS) as Array<keyof typeof EXPENSE_FIELD_LABELS>) {
    const value = values[field as keyof ManualDealFormValues] as number | null;
    if (value !== null && value < 0) {
      errors[field as keyof ManualDealFormValues] = `${EXPENSE_FIELD_LABELS[field]} must be zero or a positive number.`;
    }
  }

  if (values.numberOfUnits !== null && (values.numberOfUnits <= 0 || !Number.isInteger(values.numberOfUnits))) {
    errors.numberOfUnits = "Number of units must be a positive whole number.";
  }

  if (values.renovationCosts !== null && values.renovationCosts < 0) {
    errors.renovationCosts = "Renovation costs must be zero or a positive number.";
  }

  return errors;
}
