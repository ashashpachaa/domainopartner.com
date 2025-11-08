export type UserStatus = "pending" | "active" | "suspended" | "inactive";
export type StaffRole =
  | "super_admin"
  | "admin"
  | "operation_manager"
  | "operation"
  | "sales"
  | "accounting";

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export type WorkflowStage =
  | "sales"
  | "operation"
  | "manager"
  | "client"
  | "shipping";

export interface StageDealineConfig {
  id: string;
  stageName: string;
  stageId: string;
  daysAllowed: number;
  description: string;
  notes?: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export interface WorkflowPermission {
  stage: WorkflowStage;
  label: string;
  description: string;
  canAccess: boolean;
}

export interface WorkingHours {
  startTime: string; // "09:00" format
  endTime: string; // "18:00" format
  daysPerWeek: number; // 5 for Mon-Fri, etc.
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  date: string; // YYYY-MM-DD
  loginTime?: string; // ISO timestamp
  logoutTime?: string; // ISO timestamp
  hoursWorked: number; // decimal hours
  confirmations: number; // number of successful confirmation popups
  missedConfirmations: number; // number of missed popups
  isLate: boolean; // arrived after startTime
  attendanceStatus: "present" | "absent" | "inactive"; // inactive if marked as such during day
  notes?: string;
}

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: StaffRole;
  status: "active" | "inactive";
  department: string;
  joinDate: string;
  lastLogin: string;
  phone: string;
  workflowPermissions?: WorkflowPermission[];
  workingHours: WorkingHours;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string;
  country: string;
  city: string;
  whatsappNumber: string;
  email: string;
  website: string;
  status: UserStatus;
  subscriptionPlan: "free" | "starter" | "pro" | "enterprise";
  subscriptionStatus: "active" | "cancelled" | "expired";
  createdAt: string;
  lastLogin: string;
}

export type ClientRequestStatus = "pending_approval" | "approved" | "rejected";

export interface ClientRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  country: string;
  city: string;
  whatsappNumber: string;
  website: string;
  status: ClientRequestStatus;
  subscriptionPlan: "free" | "starter" | "pro" | "enterprise";
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string; // staff ID
  rejectionReason?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  duration: string; // e.g., "3-5 business days"
  requirements: string; // e.g., "Valid ID, Company documents"
  price: number;
  currency: string; // e.g., "USD", "GBP", "EUR"
  country: string; // e.g., "United Kingdom", "United States"
  services: {
    hasApostille: boolean;
    hasShipping: boolean;
    hasPOA: boolean;
    hasFinancialReport: boolean;
  };
  createdAt: string;
  status: "active" | "inactive";
}

export type OrderStatus =
  | "new"
  | "pending_sales_review"
  | "rejected_by_sales"
  | "pending_operation"
  | "rejected_by_operation"
  | "pending_operation_manager_review"
  | "rejected_by_operation_manager"
  | "awaiting_client_acceptance"
  | "rejected_by_client"
  | "pending_apostille"
  | "rejected_by_apostille"
  | "pending_poa"
  | "rejected_by_poa"
  | "pending_financial_report"
  | "rejected_by_financial_report"
  | "shipping_preparation"
  | "rejected_by_shipping"
  | "completed";

export type OrderActionType =
  | "accept"
  | "reject"
  | "edit"
  | "resubmit"
  | "system_transition";

export interface OrderHistory {
  id: string;
  orderId: string;
  previousStatus: OrderStatus;
  newStatus: OrderStatus;
  actionType: OrderActionType;
  actionBy: string; // staffId or "client"
  actionByName: string;
  reason?: string; // For rejections
  notes?: string;
  description?: string; // Human-readable description of the action
  createdAt: string;
}

export interface OrderPayment {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "partial" | "paid" | "overdue" | "failed";
  paidDate?: string;
  dueDate: string;
  description: string;
  method?: string;
  reference?: string;
}

export interface OperationFile {
  id: string;
  orderId: string;
  fileName: string;
  fileSize: number; // in bytes
  fileUrl?: string; // URL to download the file
  uploadedBy: string; // staffId
  uploadedByName: string;
  uploadedAt: string;
  stage:
    | "sales"
    | "operation"
    | "manager"
    | "apostille"
    | "poa"
    | "financial_report"
    | "shipping"
    | "post_services"; // workflow stage
  fileType:
    | "document"
    | "receipt"
    | "tracking"
    | "apostille"
    | "poa"
    | "financial_report"
    | "company_form";
  description?: string;
  visibleToClient: boolean; // Individual document visibility toggle
}

export interface OrderComment {
  id: string;
  orderId: string;
  commentBy: string; // staffId or "client"
  commentByName: string;
  commentByRole?: StaffRole | "client";
  content: string;
  isInternal: boolean; // If true, visible only to staff
  createdAt: string;
}

export interface ApostilleDocument {
  id: string;
  orderId: string;
  documentName: string;
  originalFile: OperationFile;
  apostilledBy: string; // staffId (operation manager)
  apostilledByName: string;
  apostilledAt: string;
  isComplete: boolean;
  certificateNumber?: string;
  description?: string;
}

export interface OperationReviewForm {
  isCompleted: boolean;
  submittedBy?: string; // staffId
  submittedByName?: string;
  submittedAt?: string;
  companyName: string;
  companyNumber: string;
}

export interface Shareholder {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD format
  nationality: string;
  ownershipPercentage: number;
  passportFile?: {
    fileName: string;
    fileSize: number;
    fileUrl?: string;
    uploadedAt: string;
  };
}

export interface Order {
  id: string;
  userId: string;
  productId?: string;
  orderNumber: string;
  description: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  serviceType: string;
  countries: string[];
  createdAt: string;
  completedAt?: string;
  createdByStaffId?: string; // staffId who created/received the order
  assignedToSalesId?: string;
  assignedToOperationId?: string;
  assignedToManagerId?: string;
  history: OrderHistory[];
  rejectionReasons: string[];
  clientAccepted?: boolean;
  clientAcceptedAt?: string;
  shippingNumber?: string;
  trackingNumber?: string;
  trackingNumberAddedBy?: string; // staffId who added tracking
  trackingNumberAddedAt?: string;
  documentsUploaded?: boolean;
  paymentHistory?: OrderPayment[];
  operationFiles: OperationFile[]; // files uploaded during workflow
  apostilleDocuments?: ApostilleDocument[]; // apostille documents if applicable
  clientCanViewFiles: boolean; // visibility to client
  clientCanViewTracking: boolean; // visibility of tracking to client
  comments: OrderComment[]; // Comments with internal/public flags
  requiredServices: {
    hasApostille: boolean;
    hasShipping: boolean;
    hasPOA: boolean;
    hasFinancialReport: boolean;
  };
  completedServices: {
    apostilleComplete: boolean;
    shippingComplete: boolean;
    poaComplete: boolean;
    financialReportComplete: boolean;
  };
  operationReviewForm?: OperationReviewForm; // Operation stage review form
  shareholders?: Shareholder[]; // Company shareholders and ownership structure
  companyInfo?: {
    companyName: string;
    companyActivities: string;
    totalCapital: string;
    pricePerShare: string;
  };
  registeredCompany?: RegisteredCompany; // Company registration details after completion
}

export interface RegisteredCompany {
  id: string;
  orderId: string;
  userId: string;
  companyNumber: string;
  companyName: string;
  country: string; // e.g., "United Kingdom", "United States", "Sweden"
  incorporationDate: string; // YYYY-MM-DD
  nextRenewalDate: string; // YYYY-MM-DD
  nextAccountsFilingDate: string; // YYYY-MM-DD
  authCode: string; // e.g., "AUTH001-UK-2025"
  registeredOffice?: string;
  sicCodes?: string[];
  status: "active" | "dissolved" | "liquidation" | "administration";
  fetchedAt: string; // ISO timestamp when data was fetched from Companies House
  incorporationId?: string; // Link to CompanyIncorporation for amendment access
}

export interface CompanyForSale {
  id: string;
  companyName: string;
  companyNumber: string;
  country: string;
  incorporationDate: string;
  nextConfirmationDate: string; // First statement date
  firstAccountsMadeUpTo: string;
  authCode: string;
  registrationStatus: "active" | "dormant" | "liquidation";
  businessType: string;
  askingPrice: number;
  currency: string;
  contact: string;
  contactEmail: string;
  contactPhone: string;
  description: string;
  listedAt: string;
  documents?: string[];
  views: number;
  inquiries: number;
}

export type InvoiceAction =
  | "created"
  | "sent"
  | "viewed"
  | "payment_received"
  | "payment_failed"
  | "reminder_sent"
  | "status_changed"
  | "cancelled";

export interface InvoiceHistory {
  id: string;
  invoiceId: string;
  action: InvoiceAction;
  previousStatus?: string;
  newStatus?: string;
  actionBy: string; // staffId or "client" or "system"
  actionByName: string;
  description: string;
  notes?: string;
  amount?: number;
  createdAt: string;
}

export interface Invoice {
  id: string;
  userId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  createdAt: string;
  createdByStaffId?: string;
  description: string;
  items: { description: string; quantity: number; unitPrice: number }[];
  history: InvoiceHistory[];
}

export interface LoginHistory {
  id: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  location: string;
  status: "success" | "failed";
  loginTime: string;
  logoutTime?: string;
  duration?: number;
}

export interface CommissionTier {
  id: string;
  orderCountMin: number;
  orderCountMax: number;
  percentageRate: number;
  fixedAmount: number;
  description: string;
}

export interface StaffCommission {
  staffId: string;
  currency: string;
  tiers: CommissionTier[];
  totalEarned: number;
  paidAmount: number;
  pendingAmount: number;
}

export interface StaffCommissionHistory {
  id: string;
  staffId: string;
  invoiceId: string;
  orderCount: number;
  appliedTier: CommissionTier;
  invoiceAmount: number;
  commissionPercentage: number;
  commissionFixed: number;
  totalCommission: number;
  currency: string;
  status: "pending" | "paid";
  createdAt: string;
  paidAt?: string;
}

export interface StaffSalary {
  staffId: string;
  baseSalary: number;
  currency: string;
  underperformanceDeduction: number;
  underperformanceThreshold: number;
  rejectionFee: number; // Fee deducted per order rejection
  totalRejectionFees: number; // Cumulative rejection fees for current period
  lastSalaryDate: string;
  nextSalaryDate: string;
}

export interface StaffPerformance {
  staffId: string;
  currentScore: number;
  totalScore: number;
  rejections: number;
  earlyCompletions: number;
  lastUpdated: string;
  performanceHistory: PerformanceRecord[];
}

export interface PerformanceRecord {
  id: string;
  staffId: string;
  type: "rejection" | "early_completion" | "manual_adjustment";
  pointsChange: number;
  description: string;
  relatedOrderId?: string;
  createdAt: string;
}

export interface MonthlyPerformanceReport {
  id: string;
  staffId: string;
  month: number;
  year: number;
  totalScore: number;
  earlyCompletions: number;
  rejections: number;
  scoreTrend: number;
  performanceStatus: "excellent" | "good" | "fair" | "poor";
  salaryImpact: boolean;
  deductionAmount: number;
}

export interface StaffBonus {
  id: string;
  staffId: string;
  month: number;
  year: number;
  performanceScore: number;
  bonusAmount: number;
  bonusTier: "bronze" | "silver" | "gold" | "none"; // 85-89: bronze, 90-94: silver, 95-100: gold
  currency: string;
  status: "earned" | "paid"; // earned = current/pending, paid = distributed
  awardedAt: string; // ISO timestamp
  paidAt?: string; // ISO timestamp when bonus was paid
  notes?: string;
}

// ========== ACCOUNTING SYSTEM INTERFACES ==========

export type ExpenseCategory =
  | "payroll"
  | "utilities"
  | "office_supplies"
  | "equipment"
  | "rent"
  | "marketing"
  | "transportation"
  | "software"
  | "maintenance"
  | "vendor"
  | "other";

export type TaxType =
  | "income_tax"
  | "payroll_tax"
  | "vat"
  | "corporate_tax"
  | "sales_tax";

export interface Expense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency: string;
  vendor?: string;
  date: string; // ISO date
  dueDate?: string;
  status: "pending" | "paid" | "overdue";
  paymentMethod?: string;
  reference?: string;
  attachments?: string[]; // file paths
  notes?: string;
  createdBy: string; // staff ID
  createdAt: string; // ISO timestamp
  updatedAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  address: string;
  taxId?: string;
  paymentTerms: number; // days
  status: "active" | "inactive";
  totalSpent: number;
  currency: string;
  createdAt: string;
}

export interface TaxInfo {
  staffId?: string; // for staff tax, null for company tax
  year: number;
  taxType: TaxType;
  grossIncome: number;
  deductions: number;
  taxableIncome: number;
  taxAmount: number;
  currency: string;
  status: "calculated" | "filed" | "paid";
  notes?: string;
}

export interface Deduction {
  id: string;
  staffId: string;
  type: "tax" | "insurance" | "retirement" | "loan" | "other";
  description: string;
  amount: number;
  frequency: "monthly" | "quarterly" | "yearly" | "one_time";
  startDate: string;
  endDate?: string;
  currency: string;
  status: "active" | "inactive";
}

export interface GeneralLedgerEntry {
  id: string;
  date: string;
  account: string;
  debit?: number;
  credit?: number;
  description: string;
  reference?: string;
  createdBy: string;
  createdAt: string;
}

export interface BudgetEntry {
  id: string;
  category: ExpenseCategory;
  month: number;
  year: number;
  budgetAmount: number;
  actualAmount: number;
  currency: string;
  notes?: string;
  createdAt: string;
}

export interface FinancialReport {
  id: string;
  type: "profit_loss" | "balance_sheet" | "cash_flow";
  period: "monthly" | "quarterly" | "yearly";
  month?: number;
  year: number;
  startDate: string;
  endDate: string;
  data: Record<string, any>;
  currency: string;
  generatedAt: string;
  generatedBy: string;
}

export interface ProfitLossReport {
  period: string;
  revenue: number;
  costOfGoods: number;
  grossProfit: number;
  operatingExpenses: {
    payroll: number;
    utilities: number;
    rent: number;
    marketing: number;
    other: number;
  };
  totalOperatingExpenses: number;
  operatingIncome: number;
  interestExpense: number;
  taxExpense: number;
  netProfit: number;
  currency: string;
}

export interface BalanceSheetReport {
  period: string;
  assets: {
    cash: number;
    accountsReceivable: number;
    inventory: number;
    equipment: number;
    other: number;
  };
  totalAssets: number;
  liabilities: {
    accountsPayable: number;
    shortTermDebt: number;
    longTermDebt: number;
    other: number;
  };
  totalLiabilities: number;
  equity: {
    commonStock: number;
    retainedEarnings: number;
    other: number;
  };
  totalEquity: number;
  currency: string;
}

export interface CashFlowReport {
  period: string;
  operatingActivities: {
    netIncome: number;
    depreciationAmortization: number;
    changesInWorkingCapital: number;
  };
  totalOperatingCashFlow: number;
  investingActivities: {
    capitalExpenditures: number;
    otherInvestments: number;
  };
  totalInvestingCashFlow: number;
  financingActivities: {
    debtRepayment: number;
    equityRaised: number;
    dividendsPaid: number;
  };
  totalFinancingCashFlow: number;
  netCashChange: number;
  endingCashBalance: number;
  currency: string;
}

export const mockExpenses: Expense[] = [
  {
    id: "EXP001",
    category: "office_supplies",
    description: "Monthly office supplies and stationery",
    amount: 450,
    currency: "USD",
    vendor: "Office Depot",
    date: "2024-01-05",
    status: "paid",
    paymentMethod: "credit_card",
    createdBy: "S001",
    createdAt: "2024-01-05T10:30:00Z",
    updatedAt: "2024-01-05T10:30:00Z",
  },
  {
    id: "EXP002",
    category: "utilities",
    description: "Electricity bill - January",
    amount: 1200,
    currency: "USD",
    vendor: "City Power",
    date: "2024-01-01",
    status: "paid",
    paymentMethod: "bank_transfer",
    createdBy: "S001",
    createdAt: "2024-01-01T09:00:00Z",
    updatedAt: "2024-01-01T09:00:00Z",
  },
  {
    id: "EXP003",
    category: "software",
    description: "Monthly SaaS subscriptions",
    amount: 3200,
    currency: "USD",
    vendor: "Various",
    date: "2024-01-03",
    status: "paid",
    paymentMethod: "credit_card",
    createdBy: "S001",
    createdAt: "2024-01-03T11:00:00Z",
    updatedAt: "2024-01-03T11:00:00Z",
  },
  {
    id: "EXP004",
    category: "rent",
    description: "Office rent - January",
    amount: 5000,
    currency: "USD",
    vendor: "Real Estate Partners",
    date: "2024-01-01",
    status: "paid",
    paymentMethod: "bank_transfer",
    createdBy: "S001",
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-01T08:00:00Z",
  },
  {
    id: "EXP005",
    category: "marketing",
    description: "Google Ads campaign",
    amount: 2000,
    currency: "USD",
    vendor: "Google Ads",
    date: "2024-01-08",
    status: "pending",
    paymentMethod: "credit_card",
    createdBy: "S001",
    createdAt: "2024-01-08T14:15:00Z",
    updatedAt: "2024-01-08T14:15:00Z",
  },
  {
    id: "EXP006",
    category: "equipment",
    description: "Laptop purchase for new employee",
    amount: 1500,
    currency: "USD",
    vendor: "TechStore",
    date: "2024-01-06",
    status: "paid",
    paymentMethod: "purchase_order",
    createdBy: "S001",
    createdAt: "2024-01-06T13:45:00Z",
    updatedAt: "2024-01-06T13:45:00Z",
  },
];

export const mockVendors: Vendor[] = [
  {
    id: "VEN001",
    name: "Office Depot",
    email: "sales@officedepot.com",
    phone: "+1-800-463-3768",
    country: "United States",
    address: "2500 National Commerce Drive, Elgin, IL 60123",
    taxId: "12-3456789",
    paymentTerms: 30,
    status: "active",
    totalSpent: 3250,
    currency: "USD",
    createdAt: "2023-06-15",
  },
  {
    id: "VEN002",
    name: "City Power",
    email: "billing@citypower.com",
    phone: "+1-555-0100",
    country: "United States",
    address: "1234 Energy Way, Houston, TX 77001",
    taxId: "98-7654321",
    paymentTerms: 15,
    status: "active",
    totalSpent: 3600,
    currency: "USD",
    createdAt: "2023-07-01",
  },
  {
    id: "VEN003",
    name: "Real Estate Partners",
    email: "leasing@reppartners.com",
    phone: "+1-212-555-0150",
    country: "United States",
    address: "200 5th Avenue, New York, NY 10010",
    taxId: "55-6789012",
    paymentTerms: 30,
    status: "active",
    totalSpent: 15000,
    currency: "USD",
    createdAt: "2023-05-01",
  },
  {
    id: "VEN004",
    name: "TechStore",
    email: "business@techstore.com",
    phone: "+1-510-555-0200",
    country: "United States",
    address: "500 Market Street, San Francisco, CA 94105",
    taxId: "34-5678901",
    paymentTerms: 45,
    status: "active",
    totalSpent: 8500,
    currency: "USD",
    createdAt: "2023-08-20",
  },
];

export const mockBudgets: BudgetEntry[] = [
  {
    id: "BUD001",
    category: "office_supplies",
    month: 1,
    year: 2024,
    budgetAmount: 500,
    actualAmount: 450,
    currency: "USD",
    createdAt: "2024-01-01",
  },
  {
    id: "BUD002",
    category: "utilities",
    month: 1,
    year: 2024,
    budgetAmount: 1500,
    actualAmount: 1200,
    currency: "USD",
    createdAt: "2024-01-01",
  },
  {
    id: "BUD003",
    category: "software",
    month: 1,
    year: 2024,
    budgetAmount: 3500,
    actualAmount: 3200,
    currency: "USD",
    createdAt: "2024-01-01",
  },
  {
    id: "BUD004",
    category: "rent",
    month: 1,
    year: 2024,
    budgetAmount: 5000,
    actualAmount: 5000,
    currency: "USD",
    createdAt: "2024-01-01",
  },
  {
    id: "BUD005",
    category: "marketing",
    month: 1,
    year: 2024,
    budgetAmount: 3000,
    actualAmount: 2000,
    currency: "USD",
    createdAt: "2024-01-01",
  },
];

// ========== COMPANY INCORPORATION SYSTEM ==========

export interface CompanyDirector {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  postcode: string;
  city: string;
  country: string;
}

export interface CompanyShareholder {
  id: string;
  firstName: string;
  lastName: string;
  address: string;
  postcode: string;
  city: string;
  country: string;
  shareAllocation: number; // number of shares
  ownershipPercentage: number;
}

export type CompanyAmendmentType =
  | "director_appointment" // TM01
  | "director_resignation" // TM02
  | "director_change_details" // TM08
  | "registered_office_change" // AD01
  | "sic_code_change" // CH01
  | "share_capital_increase" // SH01
  | "shareholder_change" // SA01
  | "company_name_change" // NM01 - Company Name Change
  | "annual_confirmation"; // CS01 - Annual Confirmation Statement

export interface CompanyAmendment {
  id: string;
  incorporationId: string;
  formType: CompanyAmendmentType; // Form type code (TM01, AD01, etc.)
  status: "draft" | "submitted" | "filed" | "rejected";
  createdAt: string;
  submittedAt?: string;
  filedAt?: string;
  rejectionReason?: string;
  filingReference?: string;

  // Data for Director Appointment (TM01)
  appointmentDirector?: CompanyDirector;

  // Data for Director Resignation (TM02)
  resignationDirector?: CompanyDirector;
  resignationDate?: string;

  // Data for Director Change Details (TM08)
  directorId?: string;
  directorChanges?: {
    field: string; // "firstName", "lastName", "address", "postcode", "city", "country", "dateOfBirth", "nationality"
    oldValue: string;
    newValue: string;
  }[];

  // Data for Address Change (AD01)
  newAddress?: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postcode: string;
    country: string;
  };

  // Data for SIC Code Change (CH01)
  oldSicCode?: string;
  newSicCode?: string;
  newSicDescription?: string;

  // Data for Share Capital Increase (SH01)
  oldCapital?: number;
  newCapital?: number;
  capitalIncrease?: number;
  shareType?: string;

  // Data for Shareholder Change (SA01)
  shareholderChanges?: {
    action: "add" | "remove" | "modify";
    shareholder: CompanyShareholder;
    oldDetails?: CompanyShareholder;
  }[];

  // Data for Company Name Change (NM01)
  oldCompanyName?: string;
  newCompanyName?: string;

  // Data for Annual Confirmation Statement (CS01)
  confirmationYear?: number;
  confirmedDirectors?: CompanyDirector[];
  confirmedShareholders?: CompanyShareholder[];
  confirmedAddress?: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postcode: string;
    country: string;
  };
  confirmedShareCapital?: number;
  confirmedShareType?: string;
  confirmedSicCode?: string;
  directorsUnchanged?: boolean;
  shareholdersUnchanged?: boolean;
  addressUnchanged?: boolean;
  capitalUnchanged?: boolean;
  sicUnchanged?: boolean;
  secretaryDetails?: {
    firstName: string;
    lastName: string;
    address: string;
    postcode: string;
    city: string;
    country: string;
  };

  notes?: string;
  submittedBy?: string; // Staff ID
}

// Comprehensive UK SIC Codes (Standard Industrial Classification)
export interface SICCode {
  code: string;
  description: string;
}

export const UK_SIC_CODES: SICCode[] = [
  // Section A: Agriculture, Forestry and Fishing
  { code: "01110", description: "Growing of cereals (except rice), leguminous crops and oil seeds" },
  { code: "01120", description: "Growing of rice" },
  { code: "01130", description: "Growing of vegetables and melons, roots and tubers" },
  { code: "01140", description: "Growing of sugar cane" },
  { code: "01150", description: "Growing of other non-perennial crops" },
  { code: "01210", description: "Growing of grapes" },
  { code: "01220", description: "Growing of tropical and subtropical fruits" },
  { code: "01230", description: "Growing of other tree and bush fruits and nuts" },
  { code: "01240", description: "Growing of olives" },
  { code: "01250", description: "Growing of other perennial crops" },
  { code: "01260", description: "Growing of flowers and ornamentals" },
  { code: "01270", description: "Growing of other crops not elsewhere classified" },
  { code: "01300", description: "Plant propagation" },
  { code: "01410", description: "Raising of cattle (except buffalo)" },
  { code: "01420", description: "Raising of buffalo" },
  { code: "01430", description: "Raising of horses and other equines" },
  { code: "01440", description: "Raising of camels and camelids" },
  { code: "01450", description: "Raising of sheep and goats" },
  { code: "01460", description: "Raising of swine/pigs" },
  { code: "01470", description: "Raising of poultry" },
  { code: "01480", description: "Raising of other animals" },
  { code: "01490", description: "Mixed farming" },
  { code: "01500", description: "Support activities to agriculture" },
  { code: "01610", description: "Support activities for crop production" },
  { code: "01620", description: "Support activities for animal production" },
  { code: "01630", description: "Post-harvest crop activities" },
  { code: "01640", description: "Seed treatment and plant propagation" },
  { code: "01700", description: "Hunting, trapping and related service activities" },
  { code: "02100", description: "Silviculture and other forestry activities" },
  { code: "02200", description: "Logging" },
  { code: "02300", description: "Gathering of non-wood forest products" },
  { code: "02400", description: "Support services to forestry" },
  { code: "03110", description: "Marine fishing" },
  { code: "03120", description: "Freshwater fishing" },
  { code: "03210", description: "Marine aquaculture" },
  { code: "03220", description: "Freshwater aquaculture" },

  // Section B: Mining and Quarrying
  { code: "05100", description: "Coal mining" },
  { code: "05200", description: "Mining of lignite" },
  { code: "05300", description: "Mining of peat" },
  { code: "06100", description: "Extraction of crude petroleum" },
  { code: "06200", description: "Extraction of natural gas" },
  { code: "07100", description: "Mining of iron ores" },
  { code: "07210", description: "Mining of uranium and thorium ores" },
  { code: "07290", description: "Mining of other non-ferrous metal ores" },
  { code: "08110", description: "Quarrying of ornamental and building stone" },
  { code: "08120", description: "Quarrying of limestone, gypsum, chalk and slate" },
  { code: "08910", description: "Mining and quarrying of other minerals" },
  { code: "08920", description: "Extraction of peat" },

  // Section C: Manufacturing
  { code: "10110", description: "Processing and preserving of meat" },
  { code: "10120", description: "Processing and preserving of poultry meat" },
  { code: "10130", description: "Production of meat and poultry meat products" },
  { code: "10200", description: "Processing and preserving of fish, crustaceans and molluscs" },
  { code: "10310", description: "Processing and preserving of potatoes" },
  { code: "10320", description: "Manufacture of fruit and vegetable juice" },
  { code: "10390", description: "Other processing and preserving of fruit and vegetables" },
  { code: "10410", description: "Manufacture of oils and fats" },
  { code: "10420", description: "Manufacture of margarine and similar edible fats" },
  { code: "10510", description: "Operation of dairies and cheese making" },
  { code: "10520", description: "Manufacture of ice cream" },
  { code: "10610", description: "Manufacture of grain mill products" },
  { code: "10620", description: "Manufacture of starches and starch products" },
  { code: "10710", description: "Manufacture of bread; manufacture of fresh pastry goods and cakes" },
  { code: "10720", description: "Manufacture of rusks and biscuits; manufacture of preserved pastry goods and cakes" },
  { code: "10730", description: "Manufacture of macaroni, noodles, couscous and similar farinaceous products" },
  { code: "10810", description: "Manufacture of sugar" },
  { code: "10820", description: "Manufacture of cocoa and chocolate confectionery" },
  { code: "10830", description: "Manufacture of other confectionery" },
  { code: "10840", description: "Manufacture of homogenised food preparations and dietetic food" },
  { code: "10850", description: "Manufacture of other food products" },
  { code: "10860", description: "Manufacture of animal feed" },
  { code: "11010", description: "Distilling, rectifying and blending of spirits" },
  { code: "11020", description: "Manufacture of wine from grape" },
  { code: "11030", description: "Manufacture of cider and other fruit wines" },
  { code: "11040", description: "Manufacture of other non-distilled fermented beverages" },
  { code: "11050", description: "Manufacture of beer" },
  { code: "11060", description: "Manufacture of malt" },
  { code: "11070", description: "Manufacture of soft drinks; production of mineral waters and other bottled waters" },
  { code: "12000", description: "Manufacture of tobacco products" },
  { code: "13100", description: "Preparation and spinning of textile fibres" },
  { code: "13200", description: "Weaving of textiles" },
  { code: "13300", description: "Finishing of textiles" },
  { code: "14100", description: "Manufacture of wearing apparel, except fur apparel" },
  { code: "14200", description: "Manufacture of articles of fur" },
  { code: "14300", description: "Manufacture of other clothing accessories" },
  { code: "15100", description: "Tanning and dressing of leather; dressing and dyeing of fur" },
  { code: "15200", description: "Manufacture of luggage, handbags and the like, saddlery and harness" },
  { code: "15300", description: "Manufacture of footwear" },
  { code: "16100", description: "Sawmilling and planing of wood" },
  { code: "16200", description: "Manufacture of products of wood, cork, straw and plaiting materials" },
  { code: "17100", description: "Manufacture of pulp, paper and paperboard" },
  { code: "17200", description: "Manufacture of articles of paper and paperboard" },
  { code: "18110", description: "Printing of newspapers" },
  { code: "18112", description: "Other printing" },
  { code: "18120", description: "Service activities related to printing" },
  { code: "19100", description: "Manufacture of coke oven products" },
  { code: "19200", description: "Manufacture of refined petroleum products" },
  { code: "20100", description: "Manufacture of basic chemicals, fertilisers and nitrogen compounds, plastics and synthetic rubber in primary forms" },
  { code: "20200", description: "Manufacture of pesticides and other agrochemical products" },
  { code: "20300", description: "Manufacture of paints, varnishes and similar coatings, printing ink and mastics" },
  { code: "20410", description: "Manufacture of soap and detergents" },
  { code: "20420", description: "Manufacture of perfumes and toilet preparations" },
  { code: "20500", description: "Manufacture of other chemical products" },
  { code: "20600", description: "Manufacture of man-made fibres" },
  { code: "21100", description: "Manufacture of basic pharmaceutical products" },
  { code: "21200", description: "Manufacture of pharmaceutical preparations" },
  { code: "22110", description: "Manufacture of rubber tyres and tubes; retreading and rebuilding of rubber tyres" },
  { code: "22190", description: "Manufacture of other rubber products" },
  { code: "22210", description: "Manufacture of plastic plates, sheets, tubes and profiles" },
  { code: "22220", description: "Manufacture of plastic packing goods" },
  { code: "22230", description: "Manufacture of builders' ware of plastics" },
  { code: "22290", description: "Manufacture of other plastic products" },
  { code: "23110", description: "Manufacture of flat glass" },
  { code: "23120", description: "Shaping and tempering of flat glass" },
  { code: "23130", description: "Manufacture of hollow glass" },
  { code: "23140", description: "Manufacture of glass fibres" },
  { code: "23190", description: "Manufacture and processing of other glass, including technical glassware" },
  { code: "23200", description: "Manufacture of refractory products" },
  { code: "23310", description: "Manufacture of ceramic tiles and flags" },
  { code: "23320", description: "Manufacture of other ceramic products" },
  { code: "23410", description: "Manufacture of cement" },
  { code: "23420", description: "Manufacture of lime and plaster" },
  { code: "23430", description: "Manufacture of articles of cement, concrete or artificial stone" },
  { code: "23510", description: "Manufacture of bricks, tiles and construction products, in baked clay" },
  { code: "23520", description: "Manufacture of other porcelain and ceramic products" },
  { code: "23610", description: "Manufacture of concrete products for construction" },
  { code: "23620", description: "Manufacture of plaster products for construction" },
  { code: "23630", description: "Manufacture of readymixed concrete" },
  { code: "23640", description: "Manufacture of mortars" },
  { code: "23650", description: "Manufacture of fibre cement products" },
  { code: "23690", description: "Manufacture of other articles of concrete, plaster and cement" },
  { code: "23700", description: "Cutting, shaping and finishing of ornamental and building stone" },
  { code: "23900", description: "Manufacture of abrasive products; manufacture of other non-metallic mineral products" },
  { code: "24100", description: "Manufacture of basic iron and steel and of ferro-alloys" },
  { code: "24200", description: "Manufacture of tubes, pipes, hollow profiles and related fittings, of steel" },
  { code: "24300", description: "Other manufacture of basic metals" },
  { code: "24410", description: "Precious metals production" },
  { code: "24420", description: "Aluminium production" },
  { code: "24430", description: "Lead, zinc and tin production" },
  { code: "24440", description: "Copper production" },
  { code: "24450", description: "Other non-ferrous metal production" },
  { code: "24460", description: "Processing of nuclear fuel" },
  { code: "24510", description: "Casting of iron" },
  { code: "24520", description: "Casting of steel" },
  { code: "24530", description: "Casting of light metals" },
  { code: "24540", description: "Casting of other non-ferrous metals" },
  { code: "25100", description: "Manufacture of structural metal products" },
  { code: "25200", description: "Manufacture of tanks, reservoirs and containers of metal" },
  { code: "25300", description: "Manufacture of steam generators, except central heating hot water boilers" },
  { code: "25400", description: "Manufacture of weapons and ammunition" },
  { code: "25500", description: "Forging, pressing, stamping and roll-forming of metal; powder metallurgy" },
  { code: "25610", description: "Treatment and disposal of non-hazardous waste" },
  { code: "25620", description: "Treatment and disposal of hazardous waste" },
  { code: "25710", description: "Manufacture of cutlery" },
  { code: "25720", description: "Manufacture of locks and hinges" },
  { code: "25730", description: "Manufacture of tools" },
  { code: "25910", description: "Manufacture of steel drums and similar containers" },
  { code: "25920", description: "Manufacture of light metal packaging" },
  { code: "25930", description: "Manufacture of wire products, chain and springs" },
  { code: "25940", description: "Manufacture of fasteners and screw machine products" },
  { code: "25990", description: "Manufacture of other fabricated metal products" },
  { code: "26110", description: "Manufacture of electronic components" },
  { code: "26120", description: "Manufacture of loaded electronic boards" },
  { code: "26200", description: "Manufacture of computers and peripheral equipment" },
  { code: "26300", description: "Manufacture of communication equipment" },
  { code: "26400", description: "Manufacture of consumer electronics" },
  { code: "26510", description: "Manufacture of instruments and appliances for measuring, testing and navigation" },
  { code: "26520", description: "Manufacture of watches and clocks" },
  { code: "26600", description: "Manufacture of irradiation, electromedical and electrotherapeutic equipment" },
  { code: "26700", description: "Manufacture of optical instruments and photographic equipment" },
  { code: "26800", description: "Manufacture of magnetic and optical media" },
  { code: "27100", description: "Manufacture of electric motors, generators, transformers, electricity distribution and control apparatus" },
  { code: "27200", description: "Manufacture of batteries and accumulators" },
  { code: "27310", description: "Manufacture of fibre optic cables" },
  { code: "27320", description: "Manufacture of other electronic and electric wires and cables" },
  { code: "27330", description: "Manufacture of wiring devices" },
  { code: "27400", description: "Manufacture of electric lighting equipment" },
  { code: "27510", description: "Manufacture of electric domestic appliances" },
  { code: "27520", description: "Manufacture of non-electric domestic appliances" },
  { code: "27900", description: "Manufacture of other electrical equipment" },
  { code: "28110", description: "Manufacture of engines and turbines, except aircraft, vehicle and cycle engines" },
  { code: "28120", description: "Manufacture of hydraulic and pneumatic transmission equipment" },
  { code: "28130", description: "Manufacture of other pumps, compressors, taps and valves" },
  { code: "28140", description: "Manufacture of bearings, gears, gearing and driving elements" },
  { code: "28150", description: "Manufacture of ovens, furnaces and furnace burners" },
  { code: "28160", description: "Manufacture of lifting and handling equipment" },
  { code: "28170", description: "Manufacture of office machinery and equipment (except computers and peripheral equipment)" },
  { code: "28210", description: "Manufacture of engines and turbines" },
  { code: "28220", description: "Manufacture of turbines" },
  { code: "28230", description: "Manufacture of other prime movers" },
  { code: "28240", description: "Manufacture of mechanical power transmission equipment" },
  { code: "28250", description: "Manufacture of industrial furnaces and ovens" },
  { code: "28290", description: "Manufacture of other general-purpose machinery" },
  { code: "28300", description: "Manufacture of agricultural and forestry machinery" },
  { code: "28410", description: "Manufacture of metal forming machinery" },
  { code: "28420", description: "Manufacture of machine-tools for processing metal" },
  { code: "28430", description: "Manufacture of other machine tools" },
  { code: "28510", description: "Manufacture of machinery for mining and construction" },
  { code: "28520", description: "Manufacture of machinery for metallurgy" },
  { code: "28530", description: "Manufacture of machinery for food, beverage and tobacco processing" },
  { code: "28540", description: "Manufacture of machinery for textile, apparel and leather production" },
  { code: "28550", description: "Manufacture of machinery for paper and paperboard production" },
  { code: "28560", description: "Manufacture of plastics and rubber machinery" },
  { code: "28590", description: "Manufacture of other special-purpose machinery" },
  { code: "28610", description: "Manufacture of metal structural components" },
  { code: "28620", description: "Manufacture of boilers and radiators for central heating" },
  { code: "28630", description: "Manufacture of steam engines and turbines" },
  { code: "28640", description: "Manufacture of other prime movers" },
  { code: "28650", description: "Manufacture of other machinery and equipment for specific industries" },
  { code: "28660", description: "Manufacture of weapons and ammunition" },
  { code: "28670", description: "Manufacture of ordnance and ordnance accessories" },
  { code: "28680", description: "Manufacture of other special-purpose machinery" },
  { code: "28690", description: "Manufacture of machinery and equipment for other purposes" },
  { code: "28700", description: "Manufacture of mechanical handling equipment" },
  { code: "28750", description: "Manufacture of other machinery and equipment" },
  { code: "28910", description: "Manufacture of motor vehicles" },
  { code: "28920", description: "Manufacture of motor vehicle bodies" },
  { code: "28930", description: "Manufacture of motor vehicle parts and accessories" },
  { code: "28940", description: "Manufacture of motorcycles" },
  { code: "28950", description: "Manufacture of bicycles and invalid carriages" },
  { code: "28960", description: "Manufacture of trailers and semi-trailers" },
  { code: "28970", description: "Manufacture of other transport equipment" },
  { code: "28990", description: "Manufacture of other machinery and equipment" },
  { code: "29100", description: "Manufacture of motor vehicles" },
  { code: "29200", description: "Manufacture of motor vehicle bodies and trailers" },
  { code: "29300", description: "Manufacture of parts and accessories for motor vehicles" },
  { code: "30100", description: "Building of ships and boats" },
  { code: "30200", description: "Manufacture of railway locomotives and rolling stock" },
  { code: "30300", description: "Manufacture of air and spacecraft and related machinery" },
  { code: "30400", description: "Manufacture of transport equipment not elsewhere classified" },
  { code: "31000", description: "Manufacture of furniture" },
  { code: "31100", description: "Manufacture of chairs and seats" },
  { code: "31200", description: "Manufacture of other furniture" },
  { code: "32100", description: "Manufacture of jewellery, bijouterie and related articles" },
  { code: "32200", description: "Manufacture of musical instruments" },
  { code: "32300", description: "Manufacture of sports goods" },
  { code: "32400", description: "Manufacture of games and toys" },
  { code: "32500", description: "Manufacture of medical and dental instruments and supplies" },
  { code: "32910", description: "Manufacture of brooms and brushes" },
  { code: "32920", description: "Manufacture of other articles and products" },
  { code: "33110", description: "Repair and maintenance of fabricated metal products" },
  { code: "33120", description: "Repair and maintenance of machinery" },
  { code: "33130", description: "Repair and maintenance of electronic and optical equipment" },
  { code: "33140", description: "Repair and maintenance of electrical equipment" },
  { code: "33150", description: "Repair and maintenance of transport equipment, except motor vehicles" },
  { code: "33160", description: "Repair and maintenance of furniture and home furnishings" },
  { code: "33170", description: "Repair of other equipment" },
  { code: "33190", description: "Repair and maintenance of other equipment" },
  { code: "33200", description: "Installation of industrial machinery and equipment" },

  // Section D: Electricity, Gas, Steam and Air Conditioning Supply
  { code: "35110", description: "Production of electricity" },
  { code: "35120", description: "Transmission of electricity" },
  { code: "35130", description: "Distribution of electricity" },
  { code: "35140", description: "Electric power trading and brokerage" },
  { code: "35210", description: "Manufacture of gas" },
  { code: "35220", description: "Distribution of gaseous fuels through mains" },
  { code: "35230", description: "Trading of gas through mains" },
  { code: "35240", description: "Steam and air conditioning supply" },

  // Section E: Water Supply; Sewerage; Waste Management
  { code: "36000", description: "Water collection, treatment and supply" },
  { code: "37000", description: "Sewerage" },
  { code: "38110", description: "Collection of non-hazardous waste" },
  { code: "38120", description: "Collection of hazardous waste" },
  { code: "38210", description: "Treatment and disposal of non-hazardous waste" },
  { code: "38220", description: "Treatment and disposal of hazardous waste" },
  { code: "38300", description: "Materials recovery and recycling" },
  { code: "38310", description: "Dismantling of waste electrical and electronic equipment" },
  { code: "38320", description: "Recovery of sorted materials" },
  { code: "39000", description: "Remediation activities and other waste management services" },
  { code: "39010", description: "Remediation activities and other waste management services" },
  { code: "39020", description: "Other waste management services" },

  // Section F: Construction
  { code: "41100", description: "Development of building projects" },
  { code: "41200", description: "Construction of residential and non-residential buildings" },
  { code: "41201", description: "Construction of residential buildings" },
  { code: "41202", description: "Construction of non-residential buildings" },
  { code: "42110", description: "Construction of roads and motorways" },
  { code: "42120", description: "Construction of railways and underground railways" },
  { code: "42130", description: "Construction of bridges and tunnels" },
  { code: "42210", description: "Construction of utility projects for fluids" },
  { code: "42220", description: "Construction of utility projects for electricity and telecommunications" },
  { code: "42900", description: "Construction of other civil engineering projects" },
  { code: "43110", description: "Demolition and wrecking of buildings; earth moving" },
  { code: "43120", description: "Site preparation" },
  { code: "43130", description: "Test drilling and boring" },
  { code: "43210", description: "Electrical installation" },
  { code: "43220", description: "Plumbing, heat and air-conditioning installation" },
  { code: "43290", description: "Other construction installation" },
  { code: "43300", description: "Building completion and finishing" },
  { code: "43310", description: "Plastering" },
  { code: "43320", description: "Joinery installation" },
  { code: "43330", description: "Tile hanging, stone facing and other wall and floor coverings" },
  { code: "43340", description: "Painting and glazing" },
  { code: "43350", description: "Other building completion and finishing" },
  { code: "43390", description: "Other specialised construction activities" },
  { code: "43910", description: "Roofing activities" },
  { code: "43920", description: "Insulation work activities" },
  { code: "43930", description: "Scaffolding activities" },
  { code: "43991", description: "Specialised construction activities for concrete treatment and similar activities" },
  { code: "43999", description: "Other specialised construction activities not elsewhere classified" },

  // Section G: Wholesale and Retail Trade; Repair of Motor Vehicles and Motorcycles
  { code: "45110", description: "Sale of cars and light motor vehicles" },
  { code: "45120", description: "Sale of heavy trucks and buses" },
  { code: "45190", description: "Sale of other motor vehicles" },
  { code: "45200", description: "Maintenance and repair of motor vehicles" },
  { code: "45310", description: "Trade in motor vehicle parts and accessories" },
  { code: "45320", description: "Trade in motorcycle parts and accessories" },
  { code: "45400", description: "Sale, maintenance and repair of motorcycles and related parts and accessories" },
  { code: "46110", description: "Wholesale of agricultural products" },
  { code: "46120", description: "Wholesale of food, beverages and tobacco" },
  { code: "46121", description: "Wholesale of fruits and vegetables" },
  { code: "46122", description: "Wholesale of flowers and plants" },
  { code: "46123", description: "Wholesale of live animals" },
  { code: "46124", description: "Wholesale of hides, skins and furs" },
  { code: "46190", description: "Other wholesale trade in agricultural products" },
  { code: "46200", description: "Wholesale of metals and metal ores" },
  { code: "46300", description: "Wholesale of wood, construction materials and sanitary equipment" },
  { code: "46310", description: "Wholesale of wood and wood products" },
  { code: "46320", description: "Wholesale of metal and metal ores" },
  { code: "46330", description: "Wholesale of stone, sand, gravel, cement and construction materials" },
  { code: "46340", description: "Wholesale of hardware, plumbing and heating equipment and supplies" },
  { code: "46350", description: "Wholesale of chemical products" },
  { code: "46360", description: "Wholesale of other machinery and equipment" },
  { code: "46370", description: "Wholesale of waste and scrap" },
  { code: "46380", description: "Wholesale of energy products" },
  { code: "46390", description: "Wholesale of waste and scrap materials" },
  { code: "46400", description: "Wholesale trade on a fee or contract basis" },
  { code: "46410", description: "Acting as agents in the sale of food, beverages and tobacco" },
  { code: "46490", description: "Acting as agents for the sale of other goods" },
  { code: "46500", description: "Wholesale of other household goods" },
  { code: "46510", description: "Wholesale of textiles, clothing and footwear" },
  { code: "46520", description: "Wholesale of electrical household appliances and sanitary equipment" },
  { code: "46530", description: "Wholesale of music and video recordings and musical instruments" },
  { code: "46540", description: "Wholesale of sports goods" },
  { code: "46550", description: "Wholesale of games and toys" },
  { code: "46560", description: "Wholesale of furniture" },
  { code: "46570", description: "Wholesale of books and journals" },
  { code: "46580", description: "Other specialised wholesale" },
  { code: "46590", description: "Other wholesale trade in other household goods" },
  { code: "46600", description: "Wholesale of waste and scrap" },
  { code: "46700", description: "Wholesale trade of waste and scrap materials not elsewhere classified" },
  { code: "46710", description: "Wholesale of waste and scrap" },
  { code: "46720", description: "Wholesale of used goods" },
  { code: "46900", description: "Non-specialised wholesale trade" },
  { code: "47110", description: "Retail sale in non-specialised stores with food, beverages or tobacco predominating" },
  { code: "47120", description: "Other retail sale in non-specialised stores" },
  { code: "47190", description: "Other non-specialised retail trade" },
  { code: "47210", description: "Retail sale of fresh fruits and vegetables" },
  { code: "47220", description: "Retail sale of fish, crustaceans and molluscs" },
  { code: "47230", description: "Retail sale of bread, cakes, flour confectionery and sugar confectionery" },
  { code: "47240", description: "Retail sale of beverages" },
  { code: "47250", description: "Retail sale of tobacco products" },
  { code: "47260", description: "Other retail sale of food, beverages and tobacco in specialised stores" },
  { code: "47290", description: "Other retail sale in specialised food stores" },
  { code: "47300", description: "Retail sale of automotive fuel" },
  { code: "47400", description: "Retail sale of books, newspapers and stationery" },
  { code: "47410", description: "Retail sale of books, newspapers and stationery" },
  { code: "47420", description: "Retail sale of books" },
  { code: "47430", description: "Retail sale of newspapers and stationery" },
  { code: "47500", description: "Retail sale of clothing, footwear and leather goods" },
  { code: "47510", description: "Retail sale of clothing" },
  { code: "47520", description: "Retail sale of footwear" },
  { code: "47530", description: "Retail sale of leather goods" },
  { code: "47540", description: "Retail sale of sports goods, toys and games" },
  { code: "47590", description: "Retail sale of other clothing and accessories" },
  { code: "47600", description: "Retail sale of materials for the construction of buildings; tools; and miscellaneous articles" },
  { code: "47610", description: "Retail sale of tools" },
  { code: "47620", description: "Retail sale of paints and varnishes" },
  { code: "47630", description: "Retail sale of materials for the construction of buildings" },
  { code: "47640", description: "Retail sale of sanitary fixtures and fittings" },
  { code: "47650", description: "Other retail sale of materials for the construction of buildings" },
  { code: "47710", description: "Retail sale of furniture" },
  { code: "47720", description: "Retail sale of lighting equipment and fans" },
  { code: "47730", description: "Retail sale of kitchen and tableware" },
  { code: "47740", description: "Retail sale of carpets, rugs and wall coverings" },
  { code: "47750", description: "Retail sale of paints, varnishes and wall coverings" },
  { code: "47760", description: "Other retail sale of household articles" },
  { code: "47790", description: "Other retail sale of household goods" },
  { code: "47810", description: "Retail sale of clothing and accessories (second hand)" },
  { code: "47820", description: "Retail sale of furniture and home furnishings (second hand)" },
  { code: "47890", description: "Other retail sale of second hand goods" },
  { code: "47900", description: "Retail trade not in stores, stalls and markets" },
  { code: "47910", description: "Retail sale via mail order houses or via Internet" },
  { code: "47920", description: "Retail sale via stalls and markets of food, beverages and tobacco products" },
  { code: "47930", description: "Retail sale via stalls and markets of textiles, clothing and footwear" },
  { code: "47990", description: "Other retail sale via stalls and markets" },

  // Section H: Transportation and Storage
  { code: "49100", description: "Passenger rail transport, interurban" },
  { code: "49110", description: "Passenger rail transport, interurban" },
  { code: "49200", description: "Freight rail transport" },
  { code: "49300", description: "Other urban, suburban and regional passenger land transport" },
  { code: "49310", description: "Urban and suburban passenger land transport" },
  { code: "49320", description: "Taxi operation" },
  { code: "49390", description: "Other passenger land transport" },
  { code: "49400", description: "Road freight transport and removal services" },
  { code: "49410", description: "Road freight transport" },
  { code: "49420", description: "Removal services" },
  { code: "50100", description: "Sea and coastal passenger water transport" },
  { code: "50200", description: "Sea and coastal freight water transport" },
  { code: "50300", description: "Inland passenger water transport" },
  { code: "50400", description: "Inland freight water transport" },
  { code: "51100", description: "Passenger air transport" },
  { code: "51210", description: "Freight air transport" },
  { code: "51220", description: "Space transport" },
  { code: "52100", description: "Warehousing and storage" },
  { code: "52210", description: "Service activities incidental to land transportation" },
  { code: "52220", description: "Service activities incidental to water transportation" },
  { code: "52230", description: "Service activities incidental to air transportation" },
  { code: "52240", description: "Cargo handling" },
  { code: "52290", description: "Other service activities incidental to transportation" },
  { code: "53100", description: "Postal activities under universal service obligation" },
  { code: "53200", description: "Other postal and courier activities" },

  // Section I: Accommodation and Food Service
  { code: "55100", description: "Hotels and similar accommodation" },
  { code: "55110", description: "Hotels and similar accommodation" },
  { code: "55120", description: "Holiday and other short-stay accommodation" },
  { code: "55210", description: "Holiday and other short-stay accommodation" },
  { code: "55220", description: "Camping grounds, recreational vehicle parks and trailer parks" },
  { code: "55230", description: "Other accommodation" },
  { code: "55300", description: "Food and beverage service activities" },
  { code: "55301", description: "Operation of restaurants" },
  { code: "55302", description: "Operation of cafes" },
  { code: "55303", description: "Snack bars and fast food outlets" },
  { code: "55310", description: "Restaurants" },
  { code: "55320", description: "Cafes and bars" },
  { code: "55330", description: "Canteens and catering" },
  { code: "55900", description: "Other food and beverage service" },

  // Section J: Information and Communication
  { code: "58110", description: "Publishing of books, brochures and other printed matter" },
  { code: "58120", description: "Publishing of newspapers" },
  { code: "58130", description: "Publishing of journals and periodicals" },
  { code: "58140", description: "Publishing of recorded media" },
  { code: "58190", description: "Other publishing activities" },
  { code: "58210", description: "Publishing of computer games" },
  { code: "58290", description: "Other software publishing" },
  { code: "59110", description: "Motion picture, video and television programme production activities" },
  { code: "59120", description: "Motion picture, video and television programme post-production activities" },
  { code: "59130", description: "Motion picture, video and television programme distribution activities" },
  { code: "59140", description: "Projection of motion pictures" },
  { code: "59200", description: "Sound recording and music publishing activities" },
  { code: "60100", description: "Radio broadcasting" },
  { code: "60200", description: "Television programming and broadcasting activities" },
  { code: "61100", description: "Wired telecommunications activities" },
  { code: "61200", description: "Wireless telecommunications activities" },
  { code: "61300", description: "Satellite telecommunications activities" },
  { code: "61900", description: "Other telecommunications activities" },
  { code: "62010", description: "Computer programming activities" },
  { code: "62020", description: "Computer consultancy activities" },
  { code: "62030", description: "Computer facilities management activities" },
  { code: "62090", description: "Other information technology and computer service activities" },
  { code: "63110", description: "Data processing, hosting and related activities" },
  { code: "63120", description: "Web portals" },
  { code: "63210", description: "Data processing activities" },
  { code: "63220", description: "Web portal activities" },
  { code: "63290", description: "Other information technology service activities" },
  { code: "63910", description: "News agency activities" },
  { code: "63920", description: "Libraries and archives" },
  { code: "63930", description: "Museums, historical sites and similar institutions" },
  { code: "63990", description: "Other information service activities" },

  // Section K: Financial and Insurance Activities
  { code: "64110", description: "Central banking activities" },
  { code: "64191", description: "Banks" },
  { code: "64199", description: "Other monetary institutions" },
  { code: "64201", description: "Building societies" },
  { code: "64202", description: "Other credit granting" },
  { code: "64209", description: "Other financial institutions" },
  { code: "64210", description: "Financial leasing" },
  { code: "64220", description: "Other financial service activities" },
  { code: "64229", description: "Other financial service activities" },
  { code: "64301", description: "Stock exchange and related activities" },
  { code: "64302", description: "Activities of investment trusts and similar financial entities" },
  { code: "64303", description: "Fund management activities" },
  { code: "64304", description: "Activities of portfolio investment companies" },
  { code: "64309", description: "Other financial market service activities" },
  { code: "64910", description: "Financial guarantee and surety services" },
  { code: "64921", description: "Life insurance and pension funding, except compulsory social security" },
  { code: "64922", description: "Non-life insurance" },
  { code: "64929", description: "Other insurance activities" },
  { code: "64991", description: "Financial intermediation and brokerage services" },
  { code: "64992", description: "Financial consultancy activities" },
  { code: "64999", description: "Other financial service activities, except insurance and pension funding" },

  // Section L: Real Estate Activities
  { code: "68100", description: "Buying and selling of own real estate" },
  { code: "68200", description: "Renting and operating of own or leased real estate" },
  { code: "68201", description: "Renting and letting of own property" },
  { code: "68202", description: "Letting of own property" },
  { code: "68209", description: "Other letting and operating" },
  { code: "68310", description: "Real estate agencies" },
  { code: "68320", description: "Management of real estate on a fee or contract basis" },

  // Section M: Professional, Scientific and Technical Activities
  { code: "69101", description: "Barristers at law" },
  { code: "69102", description: "Solicitors" },
  { code: "69103", description: "Legal representation by those authorised by bodies other than the Bar Council" },
  { code: "69109", description: "Other legal activities" },
  { code: "69201", description: "Accountancy" },
  { code: "69202", description: "Taxation" },
  { code: "69203", description: "Auditing" },
  { code: "69204", description: "Other accounting" },
  { code: "69209", description: "Other professional consultancy activities" },
  { code: "70100", description: "Activities of head offices; management consultancy activities" },
  { code: "70210", description: "Public relations and communication activities" },
  { code: "70220", description: "Management consultancy activities" },
  { code: "71110", description: "Architectural activities" },
  { code: "71120", description: "Engineering activities related to buildings" },
  { code: "71129", description: "Other architectural and engineering design" },
  { code: "71200", description: "Engineering, design and technical consultancy activities" },
  { code: "71210", description: "Engineering design activities related to manufacturing" },
  { code: "71220", description: "Engineering activities related to buildings and civil engineering" },
  { code: "71229", description: "Other engineering activities" },
  { code: "72110", description: "Research and experimental development on natural sciences and engineering" },
  { code: "72120", description: "Research and experimental development on social sciences and humanities" },
  { code: "72190", description: "Other research and experimental development on natural sciences and engineering" },
  { code: "72200", description: "Research and experimental development on social sciences and humanities" },
  { code: "73110", description: "Advertising agencies" },
  { code: "73120", description: "Media representation services" },
  { code: "73200", description: "Market research and public opinion polling" },
  { code: "74100", description: "Specialized design activities" },
  { code: "74200", description: "Photographic activities" },
  { code: "74300", description: "Translation and interpretation activities" },
  { code: "74900", description: "Other professional, scientific and technical activities" },
  { code: "74901", description: "Sign writing and similar activities" },
  { code: "74902", description: "Veterinary activities" },
  { code: "74909", description: "Other professional and technical activities" },
  { code: "75000", description: "Veterinary activities" },

  // Section N: Administrative and Support Service Activities
  { code: "77110", description: "Renting and leasing of cars and light motor vehicles" },
  { code: "77120", description: "Renting and leasing of trucks and heavy vehicles" },
  { code: "77210", description: "Renting and leasing of recreational and sports goods" },
  { code: "77220", description: "Renting of video tapes and discs" },
  { code: "77290", description: "Renting and leasing of other goods" },
  { code: "77300", description: "Leasing of intellectual property and similar products" },
  { code: "77310", description: "Leasing of intellectual property and similar products" },
  { code: "77320", description: "Leasing of industrial machinery and equipment" },
  { code: "77330", description: "Leasing of other machinery, equipment and tangible objects" },
  { code: "77390", description: "Leasing of other intellectual property and similar products" },
  { code: "78100", description: "Activities of employment placement agencies" },
  { code: "78110", description: "Private employment agencies" },
  { code: "78120", description: "Temporary employment agency activities" },
  { code: "78200", description: "Temporary employment agency activities" },
  { code: "78300", description: "Other human resources provision" },
  { code: "78999", description: "Other professional, scientific and technical activities" },
  { code: "79110", description: "Activities of travel agency" },
  { code: "79120", description: "Tour operator activities" },
  { code: "79200", description: "Activities of travel agencies and tour operators" },
  { code: "79210", description: "Activities of travel agencies" },
  { code: "79220", description: "Activities of tour operators" },
  { code: "79900", description: "Other reservation service and related activities" },
  { code: "80100", description: "Private security activities" },
  { code: "80210", description: "Activities of security systems service providers" },
  { code: "80220", description: "Facilities support services" },
  { code: "80230", description: "Cleaning activities" },
  { code: "80241", description: "General cleaning of buildings" },
  { code: "80242", description: "Specialised cleaning services" },
  { code: "80243", description: "Street and related outdoor cleaning services" },
  { code: "80300", description: "Cleaning activities" },
  { code: "81100", description: "Combined facilities support activities" },
  { code: "81210", description: "General cleaning of buildings" },
  { code: "81220", description: "Specialised cleaning services" },
  { code: "81230", description: "Street and related outdoor cleaning services" },
  { code: "81300", description: "Landscape service activities" },
  { code: "82110", description: "Administrative and executive office activities" },
  { code: "82190", description: "Other administrative and office support activities" },
  { code: "82200", description: "Activities of call centres" },
  { code: "82300", description: "Document preparation and other office support activities" },
  { code: "82910", description: "Activities of collection agencies" },
  { code: "82920", description: "Activities of credit reporting agencies" },
  { code: "82990", description: "Other professional, scientific and technical activities" },
  { code: "83100", description: "Activities of labour supply and personnel placement agencies" },
  { code: "83110", description: "Combined office administrative service activities" },
  { code: "83120", description: "Activities of call centres" },
  { code: "83130", description: "Document preparation and other specialist office support activities" },
  { code: "83210", description: "Activities of collection agencies" },
  { code: "83220", description: "Activities of credit reporting agencies" },
  { code: "83290", description: "Other administrative and office support activities" },
  { code: "83300", description: "Activity of business and management consultants" },
  { code: "83910", description: "Activities associated with waste management" },
  { code: "83920", description: "Activities associated with sanitation" },
  { code: "83930", description: "Landscaping service activities" },
  { code: "83990", description: "Other service activities incidental to mining and quarrying" },

  // Section O: Public Administration and Defence
  { code: "84110", description: "General public administration activities" },
  { code: "84120", description: "Regulation of the activities of providing health care, education, cultural services and other social services, excluding social security" },
  { code: "84130", description: "Regulation of and contribution to more efficient operation of businesses" },
  { code: "84210", description: "Foreign affairs" },
  { code: "84220", description: "Defence activities" },
  { code: "84230", description: "Public order and safety activities" },
  { code: "84240", description: "Firefighting and rescue and ambulance service activities" },
  { code: "84250", description: "Activities related to the enforcement of legal requirements" },
  { code: "84300", description: "Compulsory social security activities" },

  // Section P: Education
  { code: "85100", description: "Pre-primary education" },
  { code: "85200", description: "Primary education" },
  { code: "85210", description: "Primary education" },
  { code: "85220", description: "Secondary education" },
  { code: "85300", description: "Higher education" },
  { code: "85310", description: "General further education" },
  { code: "85320", description: "Vocational further education" },
  { code: "85410", description: "Adult education and training" },
  { code: "85420", description: "Educational support services" },

  // Section Q: Human Health and Social Work Activities
  { code: "86101", description: "General medical practice activities" },
  { code: "86102", description: "Specialist medical practice activities" },
  { code: "86110", description: "Hospital activities" },
  { code: "86120", description: "Psychiatric hospital activities" },
  { code: "86210", description: "General medical practice activities" },
  { code: "86220", description: "Specialist medical practice activities" },
  { code: "86230", description: "Dental practice activities" },
  { code: "86240", description: "Other professional, scientific and technical activities" },
  { code: "86900", description: "Other professional, scientific and technical activities" },
  { code: "87100", description: "Residential nursing care facilities" },
  { code: "87200", description: "Residential care facilities" },
  { code: "87210", description: "Residential care for the elderly" },
  { code: "87220", description: "Residential care facilities for the disabled (not psychiatric)" },
  { code: "87300", description: "Social work activities without accommodation" },
  { code: "87310", description: "Child daycare activities" },
  { code: "87320", description: "Social work activities for the elderly and disabled without accommodation" },
  { code: "87330", description: "Social work activities for the disabled without accommodation" },
  { code: "87900", description: "Other social work activities without accommodation" },

  // Section R: Arts, Entertainment and Recreation
  { code: "90010", description: "Performing arts" },
  { code: "90020", description: "Support services to performing arts" },
  { code: "90030", description: "Artistic and literary creation and interpretation" },
  { code: "90040", description: "Operation of arts facilities" },
  { code: "91010", description: "Library and archive activities" },
  { code: "91020", description: "Museums, historical sites and similar institution activities" },
  { code: "91030", description: "Botanical and zoological gardens and nature reserves activities" },
  { code: "92000", description: "Gambling and betting activities" },
  { code: "92110", description: "Gambling activities" },
  { code: "92120", description: "Betting activities" },
  { code: "93110", description: "Operation of sports facilities" },
  { code: "93120", description: "Activities of sports clubs" },
  { code: "93130", description: "Fitness facilities" },
  { code: "93190", description: "Other sports activities" },
  { code: "93210", description: "Activities of amusement parks and theme parks" },
  { code: "93290", description: "Other amusement and recreation activities" },

  // Section S: Other Service Activities
  { code: "94110", description: "Business and employers membership organizations" },
  { code: "94120", description: "Professional membership organizations" },
  { code: "94200", description: "Trade unions" },
  { code: "94910", description: "Religious organizations" },
  { code: "94920", description: "Political organizations" },
  { code: "94990", description: "Other not elsewhere classified membership organizations" },
  { code: "95110", description: "Repair of computers and peripheral equipment" },
  { code: "95120", description: "Repair of communication equipment" },
  { code: "95210", description: "Repair of consumer electronics" },
  { code: "95220", description: "Repair of household appliances and equipment" },
  { code: "95230", description: "Repair of footwear and leather goods" },
  { code: "95240", description: "Repair of furniture and home furnishings" },
  { code: "95250", description: "Repair of watches, clocks and jewellery" },
  { code: "95290", description: "Repair of other personal and household goods" },
  { code: "96010", description: "Washing and dry-cleaning of textile and fur products" },
  { code: "96020", description: "Hairdressing and other beauty treatment" },
  { code: "96030", description: "Funeral and cremation services" },
  { code: "96040", description: "Other personal service activities" },

  // Section T: Activities of Households
  { code: "97000", description: "Activities of households as employers of domestic personnel" },
  { code: "98100", description: "Undifferentiated goods and services producing activities of private households for own use" },
  { code: "98200", description: "Undifferentiated services producing activities of private households for own use" },

  // Section U: Activities of Extraterritorial Organisations
  { code: "99000", description: "Activities of extraterritorial organisations and bodies" },
];

export interface CompanyIncorporation {
  id: string;
  companyName: string;
  companyType: "private_limited" | "public_limited" | "limited_by_guarantee" | "private_guarantee" | "unlimited";
  registeredOfficeAddress: string;
  registeredOfficePostcode: string;
  registeredOfficeCity: string;
  registeredOfficeCountry: string;
  directors: CompanyDirector[];
  shareholders: CompanyShareholder[];
  shareCapital: number;
  shareType: string; // "Ordinary Shares", "Preference Shares", etc.
  sicCode?: string; // Standard Industrial Classification code
  memorandumOfAssociation?: string; // Base64 encoded PDF
  memorandumOfAssociationAccepted?: boolean;
  articlesOfAssociation?: string; // Base64 encoded PDF
  articlesOfAssociationAccepted?: boolean;
  statementOfCompliance?: string; // Declaration text
  complianceStatementAccepted?: boolean;
  directorConsentAccepted?: boolean;
  shareholderConsentAccepted?: boolean;
  status:
    | "draft"
    | "submitted"
    | "payment_pending"
    | "filing"
    | "completed"
    | "rejected";
  filingReference?: string;
  companyRegistrationNumber?: string;
  companyAuthenticationCode?: string;
  certificateOfIncorporation?: string; // Base64 encoded PDF
  createdBy: string; // Staff ID
  createdAt: string;
  submittedAt?: string;
  completedAt?: string;
  notes?: string;
  currency: string;
  filingFee: number;
  paymentStatus?: "pending" | "paid" | "failed";
  paymentReference?: string;
  paymentDate?: string;
  amendments?: CompanyAmendment[]; // Track all amendments filed
}

export const mockCompanyIncorporations: CompanyIncorporation[] = [
  {
    id: "INC001",
    companyName: "Tech Innovations Ltd",
    companyType: "private_limited",
    registeredOfficeAddress: "123 Tech Street",
    registeredOfficePostcode: "SW1A 1AA",
    registeredOfficeCity: "London",
    registeredOfficeCountry: "United Kingdom",
    directors: [
      {
        id: "DIR001",
        firstName: "Ahmed",
        lastName: "Hassan",
        dateOfBirth: "1990-05-15",
        nationality: "Egyptian",
        address: "10 Director Lane",
        postcode: "W1B 1AE",
        city: "London",
        country: "United Kingdom",
      },
    ],
    shareholders: [
      {
        id: "SHA001",
        firstName: "Ahmed",
        lastName: "Hassan",
        address: "10 Director Lane",
        postcode: "W1B 1AE",
        city: "London",
        country: "United Kingdom",
        shareAllocation: 1000,
        ownershipPercentage: 100,
      },
    ],
    shareCapital: 1000,
    shareType: "Ordinary Shares",
    status: "completed",
    filingReference: "YYYY-MM-DD-12345",
    companyRegistrationNumber: "15432890",
    companyAuthenticationCode: "ABCD1234EF56GH",
    createdBy: "S001",
    createdAt: "2024-01-15",
    submittedAt: "2024-01-15",
    completedAt: "2024-01-16",
    currency: "GBP",
    filingFee: 12,
    amendments: [
      {
        id: "AMD001",
        incorporationId: "INC001",
        formType: "director_appointment",
        status: "filed",
        createdAt: "2024-01-20",
        submittedAt: "2024-01-20",
        filedAt: "2024-01-21",
        filingReference: "CH-AMEND-1762590453381",
        appointmentDirector: {
          id: "DIR002",
          firstName: "Sarah",
          lastName: "Johnson",
          dateOfBirth: "1992-03-20",
          nationality: "British",
          address: "20 Executive Way",
          postcode: "EC1A 1BB",
          city: "London",
          country: "United Kingdom",
        },
      },
    ],
  },
];

export const mockUsers: User[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    companyName: "Acme Corporation",
    country: "United States",
    city: "New York",
    whatsappNumber: "+1-555-0101",
    email: "john.doe@acmecorp.com",
    website: "https://acmecorp.com",
    status: "active",
    subscriptionPlan: "pro",
    subscriptionStatus: "active",
    createdAt: "2024-01-15",
    lastLogin: "2024-01-08T14:30:00Z",
  },
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Smith",
    companyName: "Global Tech Solutions",
    country: "United Kingdom",
    city: "London",
    whatsappNumber: "+44-20-7946-0958",
    email: "sarah.smith@globaltech.uk",
    website: "https://globaltech.co.uk",
    status: "active",
    subscriptionPlan: "enterprise",
    subscriptionStatus: "active",
    createdAt: "2023-11-20",
    lastLogin: "2024-01-08T10:15:00Z",
  },
  {
    id: "3",
    firstName: "Maria",
    lastName: "Garcia",
    companyName: "Innovate Spain",
    country: "Spain",
    city: "Madrid",
    whatsappNumber: "+34-91-234-5678",
    email: "maria@innovatespain.es",
    website: "https://innovatespain.es",
    status: "pending",
    subscriptionPlan: "starter",
    subscriptionStatus: "active",
    createdAt: "2024-01-05",
    lastLogin: "2024-01-07T09:45:00Z",
  },
  {
    id: "4",
    firstName: "Michael",
    lastName: "Chen",
    companyName: "Asia Pacific Ventures",
    country: "Singapore",
    city: "Singapore",
    whatsappNumber: "+65-6789-0123",
    email: "michael.chen@apventures.sg",
    website: "https://apventures.sg",
    status: "active",
    subscriptionPlan: "pro",
    subscriptionStatus: "active",
    createdAt: "2023-12-10",
    lastLogin: "2024-01-08T16:20:00Z",
  },
  {
    id: "5",
    firstName: "Emma",
    lastName: "Wilson",
    companyName: "Digital Dynamics Australia",
    country: "Australia",
    city: "Sydney",
    whatsappNumber: "+61-2-1234-5678",
    email: "emma@digitaldynamics.com.au",
    website: "https://digitaldynamics.com.au",
    status: "suspended",
    subscriptionPlan: "starter",
    subscriptionStatus: "cancelled",
    createdAt: "2023-10-30",
    lastLogin: "2024-01-02T11:00:00Z",
  },
  {
    id: "6",
    firstName: "Alex",
    lastName: "Johnson",
    companyName: "StartUp Innovations Inc",
    country: "Canada",
    city: "Toronto",
    whatsappNumber: "+1-416-234-5678",
    email: "alex@startupinnovations.ca",
    website: "https://startupinnovations.ca",
    status: "pending",
    subscriptionPlan: "free",
    subscriptionStatus: "active",
    createdAt: "2024-01-08",
    lastLogin: "2024-01-08T13:00:00Z",
  },
  {
    id: "7",
    firstName: "Yuki",
    lastName: "Tanaka",
    companyName: "Rising Sun Enterprises",
    country: "Japan",
    city: "Tokyo",
    whatsappNumber: "+81-90-1234-5678",
    email: "yuki@risingsun.jp",
    website: "https://risingsun.jp",
    status: "active",
    subscriptionPlan: "enterprise",
    subscriptionStatus: "active",
    createdAt: "2023-09-15",
    lastLogin: "2024-01-08T15:45:00Z",
  },
  {
    id: "8",
    firstName: "Lucas",
    lastName: "Silva",
    companyName: "Brasil Tech Group",
    country: "Brazil",
    city: "São Paulo",
    whatsappNumber: "+55-11-98765-4321",
    email: "lucas@brasiltechgroup.com.br",
    website: "https://brasiltechgroup.com.br",
    status: "inactive",
    subscriptionPlan: "free",
    subscriptionStatus: "expired",
    createdAt: "2023-08-20",
    lastLogin: "2023-12-15T10:30:00Z",
  },
];

export const mockClientRequests: ClientRequest[] = [
  {
    id: "CR001",
    firstName: "David",
    lastName: "Johnson",
    email: "david.johnson@newtech.com",
    companyName: "NewTech Solutions",
    country: "United States",
    city: "San Francisco",
    whatsappNumber: "+1-415-555-0100",
    website: "https://newtech.com",
    status: "pending_approval",
    subscriptionPlan: "pro",
    createdAt: "2024-01-08T10:30:00Z",
  },
  {
    id: "CR002",
    firstName: "Emma",
    lastName: "Miller",
    email: "emma.miller@globalventures.co.uk",
    companyName: "Global Ventures Ltd",
    country: "United Kingdom",
    city: "London",
    whatsappNumber: "+44-20-7946-1111",
    website: "https://globalventures.co.uk",
    status: "pending_approval",
    subscriptionPlan: "starter",
    createdAt: "2024-01-08T14:15:00Z",
  },
  {
    id: "CR003",
    firstName: "Franco",
    lastName: "Rossi",
    email: "franco.rossi@italiatech.it",
    companyName: "Italia Tech Group",
    country: "Italy",
    city: "Milan",
    whatsappNumber: "+39-02-1234-5678",
    website: "https://italiatech.it",
    status: "rejected",
    subscriptionPlan: "free",
    createdAt: "2024-01-07T09:00:00Z",
    reviewedAt: "2024-01-07T16:30:00Z",
    reviewedBy: "S001",
    rejectionReason: "Incomplete company information provided",
  },
  {
    id: "CR004",
    firstName: "Lisa",
    lastName: "Zhang",
    email: "lisa.zhang@chinaexpress.cn",
    companyName: "China Express Logistics",
    country: "China",
    city: "Shanghai",
    whatsappNumber: "+86-21-5555-0123",
    website: "https://chinaexpress.cn",
    status: "pending_approval",
    subscriptionPlan: "enterprise",
    createdAt: "2024-01-06T11:45:00Z",
  },
  {
    id: "CR005",
    firstName: "Carlos",
    lastName: "Garcia",
    email: "carlos.garcia@mexicoservices.mx",
    companyName: "Mexico Services Inc",
    country: "Mexico",
    city: "Mexico City",
    whatsappNumber: "+52-55-1234-5678",
    website: "https://mexicoservices.mx",
    status: "approved",
    subscriptionPlan: "pro",
    createdAt: "2024-01-05T13:20:00Z",
    reviewedAt: "2024-01-05T14:00:00Z",
    reviewedBy: "S001",
  },
];

export const mockProducts: Product[] = [
  {
    id: "P001",
    name: "UK New Company Only",
    description: "Formation of a new company in the United Kingdom",
    duration: "5-7 business days",
    requirements:
      "Shareholder information, Directors details, Company name, Registered office address",
    price: 450,
    currency: "GBP",
    country: "United Kingdom",
    services: {
      hasApostille: false,
      hasShipping: false,
      hasPOA: false,
      hasFinancialReport: false,
    },
    createdAt: "2024-01-01",
    status: "active",
  },
  {
    id: "P002",
    name: "USA New Company Only",
    description: "Formation of a new company in the United States",
    duration: "7-10 business days",
    requirements:
      "Registered agent, Registered office, Shareholder/Member information",
    price: 500,
    currency: "USD",
    country: "United States",
    services: {
      hasApostille: false,
      hasShipping: false,
      hasPOA: false,
      hasFinancialReport: false,
    },
    createdAt: "2024-01-01",
    status: "active",
  },
  {
    id: "P003",
    name: "Canada New Company Only",
    description: "Formation of a new company in Canada",
    duration: "5-7 business days",
    requirements:
      "Directors details, Registered office address, Articles of incorporation",
    price: 475,
    currency: "CAD",
    country: "Canada",
    services: {
      hasApostille: false,
      hasShipping: false,
      hasPOA: false,
      hasFinancialReport: false,
    },
    createdAt: "2024-01-01",
    status: "active",
  },
  {
    id: "P004",
    name: "Sweden New Company Only",
    description: "Formation of a new company in Sweden",
    duration: "3-5 business days",
    requirements:
      "Board member information, Registered office, Share capital details",
    price: 425,
    currency: "SEK",
    country: "Sweden",
    services: {
      hasApostille: false,
      hasShipping: false,
      hasPOA: false,
      hasFinancialReport: false,
    },
    createdAt: "2024-01-01",
    status: "active",
  },
  {
    id: "P005",
    name: "UK Acquisitions Package",
    description:
      "Complete acquisition package including apostille, POA and shipping documents",
    duration: "10-14 business days",
    requirements:
      "Company details, Buyer/Seller information, Legal documentation",
    price: 1500,
    currency: "GBP",
    country: "United Kingdom",
    services: {
      hasApostille: true,
      hasShipping: true,
      hasPOA: true,
      hasFinancialReport: false,
    },
    createdAt: "2024-01-01",
    status: "active",
  },
  {
    id: "P006",
    name: "Sweden Acquisitions Package",
    description:
      "Complete acquisition package with apostille, POA and international shipping",
    duration: "10-14 business days",
    requirements:
      "Company documentation, Buyer/Seller details, Acquisition agreement",
    price: 1600,
    currency: "EUR",
    country: "Sweden",
    services: {
      hasApostille: true,
      hasShipping: true,
      hasPOA: true,
      hasFinancialReport: false,
    },
    createdAt: "2024-01-01",
    status: "active",
  },
  {
    id: "P007",
    name: "UK New Company Plus",
    description:
      "Company formation with apostille, POA, financial report, and shipping",
    duration: "7-10 business days",
    requirements:
      "Shareholder information, Directors details, Shipping address, Financial documents",
    price: 1200,
    currency: "GBP",
    country: "United Kingdom",
    services: {
      hasApostille: true,
      hasShipping: true,
      hasPOA: true,
      hasFinancialReport: true,
    },
    createdAt: "2024-01-01",
    status: "active",
  },
  {
    id: "P008",
    name: "USA New Company Plus",
    description: "Company formation with apostille and shipping",
    duration: "10-12 business days",
    requirements: "Registered agent, Agent address, Shareholder information",
    price: 850,
    currency: "USD",
    country: "United States",
    services: {
      hasApostille: true,
      hasShipping: true,
      hasPOA: false,
      hasFinancialReport: false,
    },
    createdAt: "2024-01-01",
    status: "active",
  },
  {
    id: "P009",
    name: "Canada New Company Plus",
    description: "Company formation with apostille and shipping",
    duration: "7-10 business days",
    requirements: "Directors information, Registered office, Shipping address",
    price: 800,
    currency: "CAD",
    country: "Canada",
    services: {
      hasApostille: true,
      hasShipping: true,
      hasPOA: false,
      hasFinancialReport: false,
    },
    createdAt: "2024-01-01",
    status: "active",
  },
  {
    id: "P010",
    name: "Sweden New Company Plus",
    description: "Company formation with apostille and shipping",
    duration: "5-8 business days",
    requirements: "Board member details, Registered office, Shipping address",
    price: 900,
    currency: "EUR",
    country: "Sweden",
    services: {
      hasApostille: true,
      hasShipping: true,
      hasPOA: false,
      hasFinancialReport: false,
    },
    createdAt: "2024-01-01",
    status: "active",
  },
  {
    id: "P011",
    name: "Power of Attorney (POA)",
    description: "Standalone power of attorney document service",
    duration: "2-3 business days",
    requirements: "Principal information, Agent details, Scope of authority",
    price: 250,
    currency: "USD",
    country: "United States",
    services: {
      hasApostille: false,
      hasShipping: false,
      hasPOA: true,
      hasFinancialReport: false,
    },
    createdAt: "2024-01-01",
    status: "active",
  },
  {
    id: "P012",
    name: "UK Apostille Service",
    description: "Apostille certification for UK documents",
    duration: "1-2 business days",
    requirements: "Document details, Certification requirements",
    price: 150,
    currency: "GBP",
    country: "United Kingdom",
    services: {
      hasApostille: true,
      hasShipping: false,
      hasPOA: false,
      hasFinancialReport: false,
    },
    createdAt: "2024-01-01",
    status: "active",
  },
  {
    id: "P013",
    name: "Swedish Apostille Service",
    description: "Apostille certification for Swedish documents",
    duration: "1-2 business days",
    requirements: "Document details, Certification requirements",
    price: 175,
    currency: "EUR",
    country: "Sweden",
    services: {
      hasApostille: true,
      hasShipping: false,
      hasPOA: false,
      hasFinancialReport: false,
    },
    createdAt: "2024-01-01",
    status: "active",
  },
  {
    id: "P014",
    name: "Premium Global Business Package",
    description:
      "Complete international business package with apostille, POA, financial report audit, and international shipping",
    duration: "12-16 business days",
    requirements:
      "Company registration documents, Financial statements, POA authorization forms, Shipping address",
    price: 2500,
    currency: "USD",
    country: "United States",
    services: {
      hasApostille: true,
      hasShipping: true,
      hasPOA: true,
      hasFinancialReport: true,
    },
    createdAt: "2024-01-01",
    status: "active",
  },
];

export const mockOrders: Order[] = [
  {
    id: "O001",
    userId: "1",
    productId: "P002",
    orderNumber: "ORD-2024-001",
    description: "Company Registration - USA (Delaware)",
    amount: 1500,
    currency: "USD",
    status: "completed",
    serviceType: "Company Registration",
    countries: ["United States"],
    createdAt: "2024-01-05T10:00:00Z",
    completedAt: "2024-01-06",
    createdByStaffId: "S003",
    assignedToSalesId: "S003",
    assignedToOperationId: "S004",
    assignedToManagerId: "S002",
    clientAccepted: true,
    clientAcceptedAt: "2024-01-06",
    shippingNumber: "SHIP-001",
    documentsUploaded: true,
    history: [
      {
        id: "H001-1",
        orderId: "O001",
        previousStatus: "new",
        newStatus: "pending_sales_review",
        actionType: "system_transition",
        actionBy: "system",
        actionByName: "System",
        createdAt: "2024-01-05T10:00:00Z",
      },
      {
        id: "H001-2",
        orderId: "O001",
        previousStatus: "pending_sales_review",
        newStatus: "pending_operation",
        actionType: "accept",
        actionBy: "S003",
        actionByName: "Jessica Chen",
        createdAt: "2024-01-05T11:00:00Z",
      },
      {
        id: "H001-3",
        orderId: "O001",
        previousStatus: "pending_operation",
        newStatus: "pending_operation_manager_review",
        actionType: "system_transition",
        actionBy: "S004",
        actionByName: "Robert Martinez",
        createdAt: "2024-01-05T16:00:00Z",
      },
      {
        id: "H001-4",
        orderId: "O001",
        previousStatus: "pending_operation_manager_review",
        newStatus: "awaiting_client_acceptance",
        actionType: "accept",
        actionBy: "S002",
        actionByName: "David Anderson",
        createdAt: "2024-01-05T17:00:00Z",
      },
      {
        id: "H001-5",
        orderId: "O001",
        previousStatus: "awaiting_client_acceptance",
        newStatus: "shipping_preparation",
        actionType: "accept",
        actionBy: "client",
        actionByName: "John Doe",
        createdAt: "2024-01-06T09:00:00Z",
      },
      {
        id: "H001-6",
        orderId: "O001",
        previousStatus: "shipping_preparation",
        newStatus: "completed",
        actionType: "system_transition",
        actionBy: "S002",
        actionByName: "David Anderson",
        createdAt: "2024-01-06T15:00:00Z",
      },
    ],
    rejectionReasons: [],
    paymentHistory: [
      {
        id: "PAY-O001-1",
        amount: 750,
        currency: "USD",
        status: "paid",
        paidDate: "2024-01-05",
        dueDate: "2024-01-10",
        description: "Initial payment (50%)",
        method: "Bank Transfer",
        reference: "WIRE-20240105-0001",
      },
      {
        id: "PAY-O001-2",
        amount: 750,
        currency: "USD",
        status: "paid",
        paidDate: "2024-01-06",
        dueDate: "2024-01-13",
        description: "Final payment (50%)",
        method: "Credit Card",
        reference: "TXN-20240106-0001",
      },
    ],
    operationFiles: [
      {
        id: "F001-1",
        orderId: "O001",
        fileName: "company_registration.pdf",
        fileSize: 2048000,
        uploadedBy: "S003",
        uploadedByName: "Jessica Chen",
        uploadedAt: "2024-01-05T11:30:00Z",
        stage: "sales",
        fileType: "document",
        description: "Company registration documents",
        visibleToClient: true,
      },
      {
        id: "F001-2",
        orderId: "O001",
        fileName: "tax_id_confirmation.pdf",
        fileSize: 1024000,
        uploadedBy: "S004",
        uploadedByName: "Robert Martinez",
        uploadedAt: "2024-01-05T16:45:00Z",
        stage: "operation",
        fileType: "document",
        description: "Tax ID confirmation from government",
        visibleToClient: true,
      },
      {
        id: "F001-3",
        orderId: "O001",
        fileName: "final_certificate.pdf",
        fileSize: 1536000,
        uploadedBy: "S002",
        uploadedByName: "David Anderson",
        uploadedAt: "2024-01-05T17:30:00Z",
        stage: "manager",
        fileType: "document",
        description: "Final registration certificate",
        visibleToClient: true,
      },
    ],
    trackingNumber: "USPS-9400-1234-5678-9012-34",
    trackingNumberAddedBy: "S002",
    trackingNumberAddedAt: "2024-01-06T15:00:00Z",
    clientCanViewFiles: true,
    clientCanViewTracking: true,
    comments: [
      {
        id: "C001-1",
        orderId: "O001",
        commentBy: "S003",
        commentByName: "Jessica Chen",
        commentByRole: "sales",
        content: "Order approved and sent to operations team for processing.",
        isInternal: false,
        createdAt: "2024-01-05T11:00:00Z",
      },
      {
        id: "C001-2",
        orderId: "O001",
        commentBy: "S004",
        commentByName: "Robert Martinez",
        commentByRole: "operation",
        content: "Company creation complete. Documents uploaded.",
        isInternal: false,
        createdAt: "2024-01-05T16:00:00Z",
      },
    ],
    requiredServices: {
      hasApostille: false,
      hasShipping: false,
      hasPOA: false,
      hasFinancialReport: false,
    },
    completedServices: {
      apostilleComplete: false,
      shippingComplete: false,
      poaComplete: false,
      financialReportComplete: false,
    },
    operationReviewForm: {
      isCompleted: false,
      companyName: "",
      companyNumber: "",
    },
  },
  {
    id: "O002",
    userId: "1",
    orderNumber: "ORD-2024-002",
    description: "Tax ID Registration",
    amount: 500,
    currency: "USD",
    status: "pending_sales_review",
    serviceType: "Tax Documentation",
    countries: ["United States"],
    createdAt: "2024-01-08T09:00:00Z",
    createdByStaffId: "S003",
    assignedToSalesId: "S003",
    history: [
      {
        id: "H002-1",
        orderId: "O002",
        previousStatus: "new",
        newStatus: "pending_sales_review",
        actionType: "system_transition",
        actionBy: "system",
        actionByName: "System",
        createdAt: "2024-01-08T10:00:00Z",
      },
    ],
    rejectionReasons: [],
    paymentHistory: [
      {
        id: "PAY-O002-1",
        amount: 500,
        currency: "USD",
        status: "paid",
        paidDate: "2024-01-08",
        dueDate: "2024-01-15",
        description: "Full payment for Tax ID Registration",
        method: "Credit Card",
        reference: "TXN-20240108-0001",
      },
    ],
    operationFiles: [],
    clientCanViewFiles: false,
    clientCanViewTracking: false,
    comments: [],
    requiredServices: {
      hasApostille: false,
      hasShipping: false,
      hasPOA: false,
      hasFinancialReport: false,
    },
    completedServices: {
      apostilleComplete: false,
      shippingComplete: false,
      poaComplete: false,
      financialReportComplete: false,
    },
    operationReviewForm: {
      isCompleted: false,
      companyName: "",
      companyNumber: "",
    },
  },
  {
    id: "O003",
    userId: "2",
    productId: "P005",
    orderNumber: "ORD-2024-003",
    description: "UK Company Registration",
    amount: 2000,
    currency: "GBP",
    status: "completed",
    serviceType: "Company Registration",
    countries: ["United Kingdom"],
    createdAt: "2023-12-20T08:00:00Z",
    completedAt: "2023-12-22",
    createdByStaffId: "S006",
    assignedToSalesId: "S006",
    assignedToOperationId: "S005",
    assignedToManagerId: "S002",
    clientAccepted: true,
    clientAcceptedAt: "2023-12-22",
    shippingNumber: "SHIP-003",
    documentsUploaded: true,
    history: [
      {
        id: "H003-1",
        orderId: "O003",
        previousStatus: "new",
        newStatus: "pending_sales_review",
        actionType: "system_transition",
        actionBy: "system",
        actionByName: "System",
        createdAt: "2023-12-20T10:00:00Z",
      },
      {
        id: "H003-2",
        orderId: "O003",
        previousStatus: "pending_sales_review",
        newStatus: "pending_operation",
        actionType: "accept",
        actionBy: "S006",
        actionByName: "Michael Brown",
        createdAt: "2023-12-20T11:00:00Z",
      },
      {
        id: "H003-3",
        orderId: "O003",
        previousStatus: "pending_operation",
        newStatus: "pending_operation_manager_review",
        actionType: "system_transition",
        actionBy: "S005",
        actionByName: "Sarah Thompson",
        createdAt: "2023-12-21T16:00:00Z",
      },
      {
        id: "H003-4",
        orderId: "O003",
        previousStatus: "pending_operation_manager_review",
        newStatus: "awaiting_client_acceptance",
        actionType: "accept",
        actionBy: "S002",
        actionByName: "David Anderson",
        createdAt: "2023-12-21T17:00:00Z",
      },
      {
        id: "H003-5",
        orderId: "O003",
        previousStatus: "awaiting_client_acceptance",
        newStatus: "shipping_preparation",
        actionType: "accept",
        actionBy: "client",
        actionByName: "Sarah Smith",
        createdAt: "2023-12-22T09:00:00Z",
      },
      {
        id: "H003-6",
        orderId: "O003",
        previousStatus: "shipping_preparation",
        newStatus: "completed",
        actionType: "system_transition",
        actionBy: "S002",
        actionByName: "David Anderson",
        createdAt: "2023-12-22T15:00:00Z",
      },
    ],
    rejectionReasons: [],
    operationFiles: [
      {
        id: "F003-1",
        orderId: "O003",
        fileName: "uk_acquisition_docs.pdf",
        fileSize: 3048000,
        uploadedBy: "S006",
        uploadedByName: "Michael Brown",
        uploadedAt: "2023-12-20T11:30:00Z",
        stage: "sales",
        fileType: "document",
        description: "UK acquisition related documents",
      },
      {
        id: "F003-2",
        orderId: "O003",
        fileName: "company_search_results.pdf",
        fileSize: 2048000,
        uploadedBy: "S005",
        uploadedByName: "Sarah Thompson",
        uploadedAt: "2023-12-21T14:45:00Z",
        stage: "operation",
        fileType: "document",
        description: "Company search results from UK registry",
      },
      {
        id: "F003-3",
        orderId: "O003",
        fileName: "apostille_cert.pdf",
        fileSize: 1548000,
        uploadedBy: "S002",
        uploadedByName: "David Anderson",
        uploadedAt: "2023-12-21T17:30:00Z",
        stage: "manager",
        fileType: "apostille",
        description: "Apostille certificate",
      },
    ],
    apostilleDocuments: [
      {
        id: "APO001-1",
        orderId: "O003",
        documentName: "Certificate of Incorporation - Apostille",
        originalFile: {
          id: "F003-3",
          orderId: "O003",
          fileName: "apostille_cert.pdf",
          fileSize: 1548000,
          uploadedBy: "S002",
          uploadedByName: "David Anderson",
          uploadedAt: "2023-12-21T17:30:00Z",
          stage: "manager",
          fileType: "apostille",
        } as any,
        apostilledBy: "S002",
        apostilledByName: "David Anderson",
        apostilledAt: "2023-12-22T10:00:00Z",
        isComplete: true,
        certificateNumber: "APO-2023-UK-12345",
        description: "Apostille for Certificate of Incorporation",
      },
    ],
    trackingNumber: "UPS-1Z999AA10123456784",
    trackingNumberAddedBy: "S002",
    trackingNumberAddedAt: "2023-12-22T15:00:00Z",
    clientCanViewFiles: true,
    clientCanViewTracking: true,
  },
  {
    id: "O004",
    userId: "2",
    orderNumber: "ORD-2024-004",
    description: "EU Business Expansion Package",
    amount: 5500,
    currency: "EUR",
    status: "completed",
    serviceType: "Multi-Country Setup",
    countries: ["Germany", "France", "Netherlands"],
    createdAt: "2023-11-15T08:00:00Z",
    completedAt: "2023-12-01",
    createdByStaffId: "S006",
    assignedToSalesId: "S006",
    assignedToOperationId: "S004",
    assignedToManagerId: "S002",
    clientAccepted: true,
    clientAcceptedAt: "2023-12-01",
    shippingNumber: "SHIP-004",
    documentsUploaded: true,
    history: [
      {
        id: "H004-1",
        orderId: "O004",
        previousStatus: "new",
        newStatus: "pending_sales_review",
        actionType: "system_transition",
        actionBy: "system",
        actionByName: "System",
        createdAt: "2023-11-15T10:00:00Z",
      },
      {
        id: "H004-2",
        orderId: "O004",
        previousStatus: "pending_sales_review",
        newStatus: "pending_operation",
        actionType: "accept",
        actionBy: "S006",
        actionByName: "Michael Brown",
        createdAt: "2023-11-15T11:00:00Z",
      },
      {
        id: "H004-3",
        orderId: "O004",
        previousStatus: "pending_operation",
        newStatus: "pending_operation_manager_review",
        actionType: "system_transition",
        actionBy: "S004",
        actionByName: "Robert Martinez",
        createdAt: "2023-11-28T16:00:00Z",
      },
      {
        id: "H004-4",
        orderId: "O004",
        previousStatus: "pending_operation_manager_review",
        newStatus: "awaiting_client_acceptance",
        actionType: "accept",
        actionBy: "S002",
        actionByName: "David Anderson",
        createdAt: "2023-11-28T17:00:00Z",
      },
      {
        id: "H004-5",
        orderId: "O004",
        previousStatus: "awaiting_client_acceptance",
        newStatus: "shipping_preparation",
        actionType: "accept",
        actionBy: "client",
        actionByName: "Sarah Smith",
        createdAt: "2023-12-01T09:00:00Z",
      },
      {
        id: "H004-6",
        orderId: "O004",
        previousStatus: "shipping_preparation",
        newStatus: "completed",
        actionType: "system_transition",
        actionBy: "S002",
        actionByName: "David Anderson",
        createdAt: "2023-12-01T15:00:00Z",
      },
    ],
    rejectionReasons: [],
    operationFiles: [],
    clientCanViewFiles: true,
    clientCanViewTracking: true,
    comments: [],
    requiredServices: {
      hasApostille: false,
      hasShipping: false,
      hasPOA: false,
      hasFinancialReport: false,
    },
    completedServices: {
      apostilleComplete: false,
      shippingComplete: false,
      poaComplete: false,
      financialReportComplete: false,
    },
    operationReviewForm: {
      isCompleted: false,
      companyName: "",
      companyNumber: "",
    },
  },
  {
    id: "O005",
    userId: "3",
    orderNumber: "ORD-2024-005",
    description: "Spanish Company Registration",
    amount: 1200,
    currency: "EUR",
    status: "pending_operation",
    serviceType: "Company Registration",
    countries: ["Spain"],
    createdAt: "2024-01-07T10:00:00Z",
    createdByStaffId: "S003",
    assignedToSalesId: "S003",
    assignedToOperationId: "S004",
    history: [
      {
        id: "H005-1",
        orderId: "O005",
        previousStatus: "new",
        newStatus: "pending_sales_review",
        actionType: "system_transition",
        actionBy: "system",
        actionByName: "System",
        createdAt: "2024-01-07T10:00:00Z",
      },
      {
        id: "H005-2",
        orderId: "O005",
        previousStatus: "pending_sales_review",
        newStatus: "pending_operation",
        actionType: "accept",
        actionBy: "S003",
        actionByName: "Jessica Chen",
        createdAt: "2024-01-07T11:00:00Z",
      },
    ],
    rejectionReasons: [],
    operationFiles: [
      {
        id: "F005-1",
        orderId: "O005",
        fileName: "spanish_company_docs.pdf",
        fileSize: 2048000,
        uploadedBy: "S003",
        uploadedByName: "Jessica Chen",
        uploadedAt: "2024-01-07T11:30:00Z",
        stage: "sales",
        fileType: "document",
        description: "Spanish company registration documents",
        visibleToClient: false,
      },
      {
        id: "F005-2",
        orderId: "O005",
        fileName: "spanish_registration_form.pdf",
        fileSize: 1024000,
        uploadedBy: "S004",
        uploadedByName: "Robert Martinez",
        uploadedAt: "2024-01-08T10:00:00Z",
        stage: "operation",
        fileType: "document",
        description: "Spanish registration form in process",
        visibleToClient: false,
      },
    ],
    clientCanViewFiles: false,
    clientCanViewTracking: false,
    comments: [],
    requiredServices: {
      hasApostille: true,
      hasShipping: true,
      hasPOA: false,
      hasFinancialReport: true,
    },
    completedServices: {
      apostilleComplete: false,
      shippingComplete: false,
      poaComplete: false,
      financialReportComplete: false,
    },
    operationReviewForm: {
      isCompleted: false,
      companyName: "",
      companyNumber: "",
    },
  },
  {
    id: "O006",
    userId: "4",
    orderNumber: "ORD-2024-006",
    description: "Singapore & Malaysia Setup",
    amount: 3000,
    currency: "SGD",
    status: "rejected_by_operation",
    serviceType: "Multi-Country Setup",
    countries: ["Singapore", "Malaysia"],
    createdAt: "2024-01-02T10:00:00Z",
    createdByStaffId: "S006",
    assignedToSalesId: "S006",
    assignedToOperationId: "S005",
    history: [
      {
        id: "H006-1",
        orderId: "O006",
        previousStatus: "new",
        newStatus: "pending_sales_review",
        actionType: "system_transition",
        actionBy: "system",
        actionByName: "System",
        createdAt: "2024-01-02T10:00:00Z",
      },
      {
        id: "H006-2",
        orderId: "O006",
        previousStatus: "pending_sales_review",
        newStatus: "pending_operation",
        actionType: "accept",
        actionBy: "S006",
        actionByName: "Michael Brown",
        createdAt: "2024-01-02T11:00:00Z",
      },
      {
        id: "H006-3",
        orderId: "O006",
        previousStatus: "pending_operation",
        newStatus: "rejected_by_operation",
        actionType: "reject",
        actionBy: "S005",
        actionByName: "Sarah Thompson",
        reason: "Incomplete documentation for Malaysia setup",
        createdAt: "2024-01-06T14:00:00Z",
      },
    ],
    rejectionReasons: ["Incomplete documentation for Malaysia setup"],
    operationFiles: [
      {
        id: "F006-1",
        orderId: "O006",
        fileName: "singapore_malaysia_docs.pdf",
        fileSize: 3048000,
        uploadedBy: "S006",
        uploadedByName: "Michael Brown",
        uploadedAt: "2024-01-02T11:30:00Z",
        stage: "sales",
        fileType: "document",
        description: "Singapore and Malaysia setup documents",
      },
    ],
    clientCanViewFiles: false,
    clientCanViewTracking: false,
    comments: [],
    requiredServices: {
      hasApostille: false,
      hasShipping: false,
      hasPOA: false,
      hasFinancialReport: false,
    },
    completedServices: {
      apostilleComplete: false,
      shippingComplete: false,
      poaComplete: false,
      financialReportComplete: false,
    },
    operationReviewForm: {
      isCompleted: false,
      companyName: "",
      companyNumber: "",
    },
  },
  {
    id: "O007",
    userId: "7",
    orderNumber: "ORD-2024-007",
    description: "Japan Corporate Registration",
    amount: 4500,
    currency: "JPY",
    status: "completed",
    serviceType: "Company Registration",
    countries: ["Japan"],
    createdAt: "2023-12-01T08:00:00Z",
    completedAt: "2023-12-10",
    createdByStaffId: "S003",
    assignedToSalesId: "S003",
    assignedToOperationId: "S005",
    assignedToManagerId: "S002",
    clientAccepted: true,
    clientAcceptedAt: "2023-12-10",
    shippingNumber: "SHIP-007",
    documentsUploaded: true,
    history: [
      {
        id: "H007-1",
        orderId: "O007",
        previousStatus: "new",
        newStatus: "pending_sales_review",
        actionType: "system_transition",
        actionBy: "system",
        actionByName: "System",
        createdAt: "2023-12-01T10:00:00Z",
      },
      {
        id: "H007-2",
        orderId: "O007",
        previousStatus: "pending_sales_review",
        newStatus: "rejected_by_sales",
        actionType: "reject",
        actionBy: "S003",
        actionByName: "Jessica Chen",
        reason: "Missing required documentation",
        createdAt: "2023-12-01T11:00:00Z",
      },
      {
        id: "H007-3",
        orderId: "O007",
        previousStatus: "rejected_by_sales",
        newStatus: "pending_sales_review",
        actionType: "resubmit",
        actionBy: "client",
        actionByName: "Yuki Tanaka",
        createdAt: "2023-12-02T10:00:00Z",
      },
      {
        id: "H007-4",
        orderId: "O007",
        previousStatus: "pending_sales_review",
        newStatus: "pending_operation",
        actionType: "accept",
        actionBy: "S003",
        actionByName: "Jessica Chen",
        createdAt: "2023-12-02T11:00:00Z",
      },
      {
        id: "H007-5",
        orderId: "O007",
        previousStatus: "pending_operation",
        newStatus: "pending_operation_manager_review",
        actionType: "system_transition",
        actionBy: "S005",
        actionByName: "Sarah Thompson",
        createdAt: "2023-12-08T16:00:00Z",
      },
      {
        id: "H007-6",
        orderId: "O007",
        previousStatus: "pending_operation_manager_review",
        newStatus: "awaiting_client_acceptance",
        actionType: "accept",
        actionBy: "S002",
        actionByName: "David Anderson",
        createdAt: "2023-12-08T17:00:00Z",
      },
      {
        id: "H007-7",
        orderId: "O007",
        previousStatus: "awaiting_client_acceptance",
        newStatus: "shipping_preparation",
        actionType: "accept",
        actionBy: "client",
        actionByName: "Yuki Tanaka",
        createdAt: "2023-12-10T09:00:00Z",
      },
      {
        id: "H007-8",
        orderId: "O007",
        previousStatus: "shipping_preparation",
        newStatus: "completed",
        actionType: "system_transition",
        actionBy: "S002",
        actionByName: "David Anderson",
        createdAt: "2023-12-10T15:00:00Z",
      },
    ],
    rejectionReasons: ["Missing required documentation"],
    operationFiles: [
      {
        id: "F007-1",
        orderId: "O007",
        fileName: "japan_corp_registration.pdf",
        fileSize: 2548000,
        uploadedBy: "S003",
        uploadedByName: "Jessica Chen",
        uploadedAt: "2023-12-02T11:30:00Z",
        stage: "sales",
        fileType: "document",
        description: "Japan corporate registration documents",
        visibleToClient: true,
      },
      {
        id: "F007-2",
        orderId: "O007",
        fileName: "japan_tax_id_proof.pdf",
        fileSize: 1748000,
        uploadedBy: "S005",
        uploadedByName: "Sarah Thompson",
        uploadedAt: "2023-12-08T14:45:00Z",
        stage: "operation",
        fileType: "document",
        description: "Japan tax ID proof",
        visibleToClient: true,
      },
      {
        id: "F007-3",
        orderId: "O007",
        fileName: "final_registration_cert.pdf",
        fileSize: 1348000,
        uploadedBy: "S002",
        uploadedByName: "David Anderson",
        uploadedAt: "2023-12-08T17:30:00Z",
        stage: "manager",
        fileType: "document",
        description: "Final registration certificate",
        visibleToClient: true,
      },
    ],
    trackingNumber: "FedEx-794628316794",
    trackingNumberAddedBy: "S002",
    trackingNumberAddedAt: "2023-12-10T15:00:00Z",
    clientCanViewFiles: true,
    clientCanViewTracking: true,
    comments: [],
    requiredServices: {
      hasApostille: false,
      hasShipping: false,
      hasPOA: false,
      hasFinancialReport: false,
    },
    completedServices: {
      apostilleComplete: false,
      shippingComplete: false,
      poaComplete: false,
      financialReportComplete: false,
    },
    operationReviewForm: {
      isCompleted: false,
      companyName: "",
      companyNumber: "",
    },
  },
  {
    id: "O008",
    userId: "1",
    productId: "P010",
    orderNumber: "ORD-2024-008",
    description: "Multi-country Corporate Setup",
    amount: 8500,
    currency: "USD",
    status: "awaiting_client_acceptance",
    serviceType: "Multi-Country Setup",
    countries: ["United States", "Canada", "Mexico"],
    createdAt: "2024-01-03T10:00:00Z",
    createdByStaffId: "S003",
    assignedToSalesId: "S003",
    assignedToOperationId: "S004",
    assignedToManagerId: "S002",
    history: [
      {
        id: "H008-1",
        orderId: "O008",
        previousStatus: "new",
        newStatus: "pending_sales_review",
        actionType: "system_transition",
        actionBy: "system",
        actionByName: "System",
        createdAt: "2024-01-03T10:00:00Z",
      },
      {
        id: "H008-2",
        orderId: "O008",
        previousStatus: "pending_sales_review",
        newStatus: "pending_operation",
        actionType: "accept",
        actionBy: "S003",
        actionByName: "Jessica Chen",
        createdAt: "2024-01-03T11:00:00Z",
      },
      {
        id: "H008-3",
        orderId: "O008",
        previousStatus: "pending_operation",
        newStatus: "rejected_by_operation",
        actionType: "reject",
        actionBy: "S004",
        actionByName: "Robert Martinez",
        reason: "Missing tax ID information for Canada",
        createdAt: "2024-01-04T14:00:00Z",
      },
      {
        id: "H008-4",
        orderId: "O008",
        previousStatus: "rejected_by_operation",
        newStatus: "pending_operation",
        actionType: "resubmit",
        actionBy: "S003",
        actionByName: "Jessica Chen",
        notes: "Added missing Canada tax ID",
        createdAt: "2024-01-05T10:00:00Z",
      },
      {
        id: "H008-5",
        orderId: "O008",
        previousStatus: "pending_operation",
        newStatus: "pending_operation_manager_review",
        actionType: "system_transition",
        actionBy: "S004",
        actionByName: "Robert Martinez",
        createdAt: "2024-01-05T16:00:00Z",
      },
      {
        id: "H008-6",
        orderId: "O008",
        previousStatus: "pending_operation_manager_review",
        newStatus: "awaiting_client_acceptance",
        actionType: "accept",
        actionBy: "S002",
        actionByName: "David Anderson",
        createdAt: "2024-01-05T17:00:00Z",
      },
    ],
    rejectionReasons: ["Missing tax ID information for Canada"],
    operationFiles: [
      {
        id: "F008-1",
        orderId: "O008",
        fileName: "multi_country_setup_docs.pdf",
        fileSize: 4048000,
        uploadedBy: "S003",
        uploadedByName: "Jessica Chen",
        uploadedAt: "2024-01-03T11:30:00Z",
        stage: "sales",
        fileType: "document",
        description: "Multi-country setup documents",
        visibleToClient: false,
      },
      {
        id: "F008-2",
        orderId: "O008",
        fileName: "canada_tax_id_proof.pdf",
        fileSize: 1248000,
        uploadedBy: "S003",
        uploadedByName: "Jessica Chen",
        uploadedAt: "2024-01-05T10:30:00Z",
        stage: "sales",
        fileType: "document",
        description: "Canada tax ID proof (resubmitted)",
        visibleToClient: false,
      },
      {
        id: "F008-3",
        orderId: "O008",
        fileName: "us_mexico_registration_docs.pdf",
        fileSize: 2548000,
        uploadedBy: "S004",
        uploadedByName: "Robert Martinez",
        uploadedAt: "2024-01-05T16:45:00Z",
        stage: "operation",
        fileType: "document",
        description: "US and Mexico registration documents",
        visibleToClient: false,
      },
      {
        id: "F008-4",
        orderId: "O008",
        fileName: "final_approval_letter.pdf",
        fileSize: 948000,
        uploadedBy: "S002",
        uploadedByName: "David Anderson",
        uploadedAt: "2024-01-05T17:30:00Z",
        stage: "manager",
        fileType: "document",
        description: "Final approval letter from manager",
        visibleToClient: false,
      },
    ],
    clientCanViewFiles: false,
    clientCanViewTracking: false,
    comments: [],
    requiredServices: {
      hasApostille: true,
      hasShipping: true,
      hasPOA: true,
      hasFinancialReport: true,
    },
    completedServices: {
      apostilleComplete: false,
      shippingComplete: false,
      poaComplete: false,
      financialReportComplete: false,
    },
    operationReviewForm: {
      isCompleted: false,
      companyName: "",
      companyNumber: "",
    },
  },
  {
    id: "O009",
    userId: "5",
    productId: "P007",
    orderNumber: "ORD-2024-009",
    description: "UK Company Formation with Apostille",
    amount: 750,
    currency: "GBP",
    status: "shipping_preparation",
    serviceType: "Company Registration",
    countries: ["United Kingdom"],
    createdAt: "2024-01-06T09:00:00Z",
    createdByStaffId: "S006",
    assignedToSalesId: "S006",
    assignedToOperationId: "S005",
    assignedToManagerId: "S002",
    clientAccepted: true,
    clientAcceptedAt: "2024-01-09T10:00:00Z",
    history: [
      {
        id: "H009-1",
        orderId: "O009",
        previousStatus: "new",
        newStatus: "pending_sales_review",
        actionType: "system_transition",
        actionBy: "system",
        actionByName: "System",
        description: "Order created in the system",
        createdAt: "2024-01-06T09:00:00Z",
      },
      {
        id: "H009-2",
        orderId: "O009",
        previousStatus: "pending_sales_review",
        newStatus: "pending_operation",
        actionType: "accept",
        actionBy: "S006",
        actionByName: "Michael Brown",
        description:
          "Michael Brown accepted the order and moved it to Operation",
        createdAt: "2024-01-06T10:00:00Z",
      },
      {
        id: "H009-3",
        orderId: "O009",
        previousStatus: "pending_operation",
        newStatus: "pending_operation_manager_review",
        actionType: "system_transition",
        actionBy: "S005",
        actionByName: "Sarah Thompson",
        description:
          "Order automatically moved to Manager Review by Sarah Thompson",
        createdAt: "2024-01-08T16:00:00Z",
      },
      {
        id: "H009-4",
        orderId: "O009",
        previousStatus: "pending_operation_manager_review",
        newStatus: "awaiting_client_acceptance",
        actionType: "accept",
        actionBy: "S002",
        actionByName: "David Anderson",
        description:
          "David Anderson accepted the order and moved it to Client Acceptance",
        createdAt: "2024-01-08T17:00:00Z",
      },
      {
        id: "H009-5",
        orderId: "O009",
        previousStatus: "awaiting_client_acceptance",
        newStatus: "shipping_preparation",
        actionType: "accept",
        actionBy: "client",
        actionByName: "Emily Wilson",
        description:
          "Client accepted the order - now requires apostille processing",
        createdAt: "2024-01-09T10:00:00Z",
      },
    ],
    rejectionReasons: [],
    paymentHistory: [
      {
        id: "PAY-O009-1",
        amount: 750,
        currency: "GBP",
        status: "paid",
        paidDate: "2024-01-06",
        dueDate: "2024-01-15",
        description: "Full payment for UK Company Formation with Apostille",
        method: "Bank Transfer",
        reference: "WIRE-20240106-0009",
      },
    ],
    operationFiles: [
      {
        id: "F009-1",
        orderId: "O009",
        fileName: "uk_company_formation_docs.pdf",
        fileSize: 2548000,
        uploadedBy: "S006",
        uploadedByName: "Michael Brown",
        uploadedAt: "2024-01-06T10:30:00Z",
        stage: "sales",
        fileType: "document",
        description: "UK company formation documents and requirements",
        visibleToClient: true,
      },
      {
        id: "F009-2",
        orderId: "O009",
        fileName: "uk_registration_confirmation.pdf",
        fileSize: 1848000,
        uploadedBy: "S005",
        uploadedByName: "Sarah Thompson",
        uploadedAt: "2024-01-08T14:45:00Z",
        stage: "operation",
        fileType: "document",
        description: "UK Companies House registration confirmation",
        visibleToClient: true,
      },
      {
        id: "F009-3",
        orderId: "O009",
        fileName: "certificate_of_incorporation.pdf",
        fileSize: 1248000,
        uploadedBy: "S002",
        uploadedByName: "David Anderson",
        uploadedAt: "2024-01-08T17:30:00Z",
        stage: "manager",
        fileType: "document",
        description: "Certificate of Incorporation ready for apostille",
        visibleToClient: true,
      },
    ],
    apostilleDocuments: [
      {
        id: "APO009-1",
        orderId: "O009",
        documentName: "Certificate of Incorporation - Apostille",
        originalFile: {
          id: "F009-3",
          orderId: "O009",
          fileName: "certificate_of_incorporation.pdf",
          fileSize: 1248000,
          uploadedBy: "S002",
          uploadedByName: "David Anderson",
          uploadedAt: "2024-01-08T17:30:00Z",
          stage: "manager",
          fileType: "document",
        } as any,
        apostilledBy: "S002",
        apostilledByName: "David Anderson",
        apostilledAt: "2024-01-10T11:00:00Z",
        isComplete: true,
        certificateNumber: "APO-2024-UK-54321",
        description: "Apostille certification for Certificate of Incorporation",
      },
      {
        id: "APO009-2",
        orderId: "O009",
        documentName: "Memorandum & Articles of Association - Apostille",
        originalFile: {
          id: "F009-3",
          orderId: "O009",
          fileName: "certificate_of_incorporation.pdf",
          fileSize: 1248000,
          uploadedBy: "S002",
          uploadedByName: "David Anderson",
          uploadedAt: "2024-01-08T17:30:00Z",
          stage: "manager",
          fileType: "document",
        } as any,
        apostilledBy: "S002",
        apostilledByName: "David Anderson",
        apostilledAt: "2024-01-10T11:30:00Z",
        isComplete: true,
        certificateNumber: "APO-2024-UK-54322",
        description: "Apostille certification for M&A documents",
      },
    ],
    trackingNumber: "FEDEX-794612345678",
    trackingNumberAddedBy: "S002",
    trackingNumberAddedAt: "2024-01-10T14:00:00Z",
    clientCanViewFiles: true,
    clientCanViewTracking: true,
    comments: [],
    requiredServices: {
      hasApostille: true,
      hasShipping: true,
      hasPOA: false,
      hasFinancialReport: false,
    },
    completedServices: {
      apostilleComplete: true,
      shippingComplete: false,
      poaComplete: false,
      financialReportComplete: false,
    },
    operationReviewForm: {
      isCompleted: false,
      companyName: "",
      companyNumber: "",
    },
  },
  {
    id: "O010",
    userId: "8",
    productId: "P014",
    orderNumber: "ORD-2024-010-DEMO",
    description:
      "Premium Global Business Package - Demo Order with All Services",
    amount: 2500,
    currency: "USD",
    status: "pending_operation",
    serviceType: "Global Business Setup",
    countries: ["United Kingdom", "United States", "Germany"],
    createdAt: "2024-01-09T08:00:00Z",
    createdByStaffId: "S003",
    assignedToSalesId: "S003",
    assignedToOperationId: "S004",
    assignedToManagerId: "S002",
    history: [
      {
        id: "H010-1",
        orderId: "O010",
        previousStatus: "new",
        newStatus: "pending_sales_review",
        actionType: "system_transition",
        actionBy: "system",
        actionByName: "System",
        description: "Order created in the system",
        createdAt: "2024-01-09T08:00:00Z",
      },
      {
        id: "H010-2",
        orderId: "O010",
        previousStatus: "pending_sales_review",
        newStatus: "pending_operation",
        actionType: "accept",
        actionBy: "S003",
        actionByName: "Jessica Chen",
        description: "Sales review completed - Order approved for processing",
        createdAt: "2024-01-09T09:30:00Z",
      },
      {
        id: "H010-3",
        orderId: "O010",
        previousStatus: "pending_operation",
        newStatus: "pending_operation_manager_review",
        actionType: "system_transition",
        actionBy: "S004",
        actionByName: "Robert Martinez",
        description:
          "Operations team completed processing - Moving to manager review",
        createdAt: "2024-01-09T15:45:00Z",
      },
      {
        id: "H010-4",
        orderId: "O010",
        previousStatus: "pending_operation_manager_review",
        newStatus: "pending_operation",
        actionType: "reject",
        actionBy: "S002",
        actionByName: "David Anderson",
        reason: "Documents require revision and resubmission before approval",
        description:
          "David Anderson sent order back for rework - Documents require revision and resubmission before approval",
        createdAt: "2024-01-09T16:30:00Z",
      },
    ],
    rejectionReasons: [
      "Documents require revision and resubmission before approval",
    ],
    paymentHistory: [
      {
        id: "PAY-O010-1",
        amount: 1250,
        currency: "USD",
        status: "paid",
        paidDate: "2024-01-09",
        dueDate: "2024-01-20",
        description: "Initial payment (50%) - Premium Global Business Package",
        method: "Bank Transfer",
        reference: "WIRE-20240109-0010",
      },
      {
        id: "PAY-O010-2",
        amount: 1250,
        currency: "USD",
        status: "pending",
        dueDate: "2024-01-20",
        description: "Final payment (50%) - Due upon completion",
        method: "Bank Transfer",
      },
    ],
    operationFiles: [
      {
        id: "F010-1",
        orderId: "O010",
        fileName: "business_registration_package.pdf",
        fileSize: 3548000,
        uploadedBy: "S003",
        uploadedByName: "Jessica Chen",
        uploadedAt: "2024-01-09T09:45:00Z",
        stage: "sales",
        fileType: "document",
        description:
          "Complete business registration documents for UK, US, and Germany",
        visibleToClient: true,
      },
      {
        id: "F010-2",
        orderId: "O010",
        fileName: "financial_statements_audit.pdf",
        fileSize: 4200000,
        uploadedBy: "S004",
        uploadedByName: "Robert Martinez",
        uploadedAt: "2024-01-09T14:20:00Z",
        stage: "operation",
        fileType: "financial_report",
        description:
          "Audited financial statements and tax compliance documents",
        visibleToClient: false,
      },
      {
        id: "F010-3",
        orderId: "O010",
        fileName: "power_of_attorney_forms.pdf",
        fileSize: 1248000,
        uploadedBy: "S004",
        uploadedByName: "Robert Martinez",
        uploadedAt: "2024-01-09T14:35:00Z",
        stage: "operation",
        fileType: "document",
        description:
          "Executed power of attorney documents for all three jurisdictions",
        visibleToClient: false,
      },
      {
        id: "F010-4",
        orderId: "O010",
        fileName: "certificates_of_good_standing.pdf",
        fileSize: 2848000,
        uploadedBy: "S004",
        uploadedByName: "Robert Martinez",
        uploadedAt: "2024-01-09T15:30:00Z",
        stage: "operation",
        fileType: "document",
        description: "Certificates of good standing from all jurisdictions",
        visibleToClient: false,
      },
    ],
    apostilleDocuments: [],
    trackingNumber: undefined,
    trackingNumberAddedBy: undefined,
    trackingNumberAddedAt: undefined,
    clientCanViewFiles: false,
    clientCanViewTracking: false,
    comments: [
      {
        id: "C010-1",
        orderId: "O010",
        commentBy: "S003",
        commentByName: "Jessica Chen",
        commentByRole: "sales",
        content:
          "This is a comprehensive demo order showcasing all service types. Ready for operations processing with multi-country requirements.",
        isInternal: false,
        createdAt: "2024-01-09T09:30:00Z",
      },
      {
        id: "C010-2",
        orderId: "O010",
        commentBy: "S004",
        commentByName: "Robert Martinez",
        commentByRole: "operation",
        content:
          "All processing complete. Documents verified and audited. Financial statements prepared. POA forms executed. Ready for manager review and apostille processing.",
        isInternal: true,
        createdAt: "2024-01-09T15:40:00Z",
      },
      {
        id: "C010-3",
        orderId: "O010",
        commentBy: "S003",
        commentByName: "Jessica Chen",
        commentByRole: "sales",
        content:
          "Customer confirmed all information is accurate. Awaiting final manager approval before apostille processing and shipment.",
        isInternal: true,
        createdAt: "2024-01-09T16:00:00Z",
      },
      {
        id: "C010-4",
        orderId: "O010",
        commentBy: "S002",
        commentByName: "David Anderson",
        commentByRole: "operation_manager",
        content:
          "⚠️ REJECTION/REWORK: Documents require revision and resubmission before approval. Please review financial statements and POA forms for completeness and accuracy. Return to Operation Process for fixes.",
        isInternal: true,
        createdAt: "2024-01-09T16:30:00Z",
      },
    ],
    requiredServices: {
      hasApostille: true,
      hasShipping: true,
      hasPOA: true,
      hasFinancialReport: true,
    },
    completedServices: {
      apostilleComplete: false,
      shippingComplete: false,
      poaComplete: false,
      financialReportComplete: true,
    },
    operationReviewForm: {
      isCompleted: false,
      companyName: "",
      companyNumber: "",
    },
  },
  {
    id: "O011",
    userId: "8",
    productId: "P014",
    orderNumber: "ORD-2024-011-NEW",
    description: "New Order - Premium Global Business Package",
    amount: 2500,
    currency: "USD",
    status: "new",
    serviceType: "Global Business Setup",
    countries: ["United Kingdom", "United States", "Germany"],
    createdAt: new Date().toISOString(),
    createdByStaffId: undefined,
    assignedToSalesId: undefined,
    assignedToOperationId: undefined,
    assignedToManagerId: undefined,
    history: [
      {
        id: "H011-1",
        orderId: "O011",
        previousStatus: "new",
        newStatus: "new",
        actionType: "system_transition",
        actionBy: "system",
        actionByName: "System",
        description: "Order created by client",
        createdAt: new Date().toISOString(),
      },
    ],
    rejectionReasons: [],
    paymentHistory: [
      {
        id: "PAY-O011-1",
        amount: 2500,
        currency: "USD",
        status: "pending",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        description: "Full payment for Premium Global Business Package",
        method: "Bank Transfer",
      },
    ],
    operationFiles: [],
    apostilleDocuments: [],
    trackingNumber: undefined,
    trackingNumberAddedBy: undefined,
    trackingNumberAddedAt: undefined,
    clientCanViewFiles: false,
    clientCanViewTracking: false,
    comments: [
      {
        id: "C011-1",
        orderId: "O011",
        commentBy: "8",
        commentByName: "Lucas Silva",
        commentByRole: "client",
        content:
          "Hello, I would like to place an order for your Premium Global Business Package. Please proceed with the sales review.",
        isInternal: false,
        createdAt: new Date().toISOString(),
      },
    ],
    requiredServices: {
      hasApostille: true,
      hasShipping: true,
      hasPOA: true,
      hasFinancialReport: true,
    },
    completedServices: {
      apostilleComplete: false,
      shippingComplete: false,
      poaComplete: false,
      financialReportComplete: false,
    },
    operationReviewForm: {
      isCompleted: false,
      companyName: "",
      companyNumber: "",
    },
  },
  {
    id: "O013",
    userId: "2",
    productId: "P005",
    orderNumber: "ORD-2024-013-APOSTILLE",
    description:
      "UK Acquisitions with Apostille - Test Order for Apostille Stage",
    amount: 3500,
    currency: "GBP",
    status: "pending_apostille",
    serviceType: "acquisition",
    countries: ["United Kingdom"],
    createdAt: "2024-01-10T08:00:00Z",
    createdByStaffId: "S001",
    assignedToSalesId: "S003",
    assignedToOperationId: "S004",
    assignedToManagerId: "S002",
    clientAccepted: true,
    clientAcceptedAt: "2024-01-15T10:30:00Z",
    history: [
      {
        id: "H013-1",
        orderId: "O013",
        action: "created",
        actionBy: "S001",
        actionByName: "Admin User",
        description: "Order created",
        createdAt: "2024-01-10T08:00:00Z",
      },
      {
        id: "H013-2",
        orderId: "O013",
        action: "assigned",
        actionBy: "S001",
        actionByName: "Admin User",
        description: "Assigned to Sales Review",
        createdAt: "2024-01-10T08:15:00Z",
      },
    ],
    rejectionReasons: [],
    operationFiles: [],
    clientCanViewFiles: false,
    clientCanViewTracking: false,
    comments: [],
    requiredServices: {
      hasApostille: true,
      hasShipping: true,
      hasPOA: false,
      hasFinancialReport: false,
    },
    completedServices: {
      apostilleComplete: false,
      shippingComplete: false,
      poaComplete: false,
      financialReportComplete: false,
    },
    operationReviewForm: {
      isCompleted: true,
      companyName: "Tech Solutions Ltd",
      companyNumber: "12345678",
      submittedBy: "S004",
      submittedByName: "Michael Brown",
      submittedAt: "2024-01-13T14:20:00Z",
      qualityCheck: true,
      documentsVerified: true,
      complianceReview: true,
      operationNotes:
        "All documents reviewed and verified. Ready for apostille processing.",
    },
  },
  {
    id: "O014",
    userId: "3",
    productId: "P006",
    orderNumber: "ORD-2024-014-POA",
    description: "Sweden Acquisitions with POA - Test Order for POA Stage",
    amount: 4200,
    currency: "SEK",
    status: "pending_poa",
    serviceType: "acquisition",
    countries: ["Sweden"],
    createdAt: "2024-01-11T09:00:00Z",
    createdByStaffId: "S001",
    assignedToSalesId: "S006",
    assignedToOperationId: "S005",
    assignedToManagerId: "S002",
    clientAccepted: true,
    clientAcceptedAt: "2024-01-16T11:00:00Z",
    history: [
      {
        id: "H014-1",
        orderId: "O014",
        action: "created",
        actionBy: "S001",
        actionByName: "Admin User",
        description: "Order created",
        createdAt: "2024-01-11T09:00:00Z",
      },
    ],
    rejectionReasons: [],
    operationFiles: [],
    clientCanViewFiles: false,
    clientCanViewTracking: false,
    comments: [],
    requiredServices: {
      hasApostille: true,
      hasShipping: true,
      hasPOA: true,
      hasFinancialReport: false,
    },
    completedServices: {
      apostilleComplete: true,
      shippingComplete: false,
      poaComplete: false,
      financialReportComplete: false,
    },
    operationReviewForm: {
      isCompleted: true,
      companyName: "Tech Solutions Ltd",
      companyNumber: "12345678",
      submittedBy: "S005",
      submittedByName: "Sarah Wilson",
      submittedAt: "2024-01-14T15:45:00Z",
      qualityCheck: true,
      documentsVerified: true,
      complianceReview: true,
      operationNotes:
        "Documents passed quality checks. Proceeding to apostille and POA processing.",
    },
  },
  {
    id: "O015",
    userId: "4",
    productId: "P007",
    orderNumber: "ORD-2024-015-FINANCIAL",
    description: "UK New Company Plus - Test Order for Financial Report Stage",
    amount: 1800,
    currency: "GBP",
    status: "pending_financial_report",
    serviceType: "formation",
    countries: ["United Kingdom"],
    createdAt: "2024-01-12T10:00:00Z",
    createdByStaffId: "S001",
    assignedToSalesId: "S003",
    assignedToOperationId: "S004",
    assignedToManagerId: "S002",
    clientAccepted: true,
    clientAcceptedAt: "2024-01-17T09:30:00Z",
    history: [
      {
        id: "H015-1",
        orderId: "O015",
        action: "created",
        actionBy: "S001",
        actionByName: "Admin User",
        description: "Order created",
        createdAt: "2024-01-12T10:00:00Z",
      },
    ],
    rejectionReasons: [],
    operationFiles: [],
    clientCanViewFiles: false,
    clientCanViewTracking: false,
    comments: [],
    requiredServices: {
      hasApostille: true,
      hasShipping: true,
      hasPOA: true,
      hasFinancialReport: true,
    },
    completedServices: {
      apostilleComplete: true,
      shippingComplete: false,
      poaComplete: false,
      financialReportComplete: false,
    },
    operationReviewForm: {
      isCompleted: true,
      companyName: "Tech Solutions Ltd",
      companyNumber: "12345678",
      submittedBy: "S004",
      submittedByName: "Michael Brown",
      submittedAt: "2024-01-15T13:00:00Z",
    },
  },
  {
    id: "O016",
    userId: "5",
    productId: "P010",
    orderNumber: "ORD-2024-016-SHIPPING",
    description: "Sweden New Company Plus - Test Order for Shipping Stage",
    amount: 2500,
    currency: "SEK",
    status: "shipping_preparation",
    serviceType: "formation",
    countries: ["Sweden"],
    createdAt: "2024-01-13T11:00:00Z",
    createdByStaffId: "S001",
    assignedToSalesId: "S006",
    assignedToOperationId: "S005",
    assignedToManagerId: "S002",
    clientAccepted: true,
    clientAcceptedAt: "2024-01-18T10:00:00Z",
    history: [
      {
        id: "H016-1",
        orderId: "O016",
        action: "created",
        actionBy: "S001",
        actionByName: "Admin User",
        description: "Order created",
        createdAt: "2024-01-13T11:00:00Z",
      },
    ],
    rejectionReasons: [],
    operationFiles: [],
    clientCanViewFiles: false,
    clientCanViewTracking: false,
    comments: [],
    requiredServices: {
      hasApostille: true,
      hasShipping: true,
      hasPOA: false,
      hasFinancialReport: false,
    },
    completedServices: {
      apostilleComplete: true,
      shippingComplete: false,
      poaComplete: false,
      financialReportComplete: false,
    },
    operationReviewForm: {
      isCompleted: true,
      companyName: "Tech Solutions Ltd",
      companyNumber: "12345678",
      submittedBy: "S005",
      submittedByName: "Sarah Wilson",
      submittedAt: "2024-01-16T14:30:00Z",
    },
  },
  {
    id: "O017",
    userId: "3",
    productId: "P007",
    orderNumber: "ORD-2025-017-DEMO",
    description: "Complete Workflow Demo - All Services Included",
    amount: 1200,
    currency: "GBP",
    status: "shipping_preparation",
    serviceType: "Company Formation + Full Services",
    countries: ["United Kingdom"],
    createdAt: "2025-01-01T08:00:00Z",
    createdByStaffId: "S001",
    assignedToSalesId: "S003",
    assignedToOperationId: "S005",
    assignedToManagerId: "S002",
    clientAccepted: true,
    clientAcceptedAt: "2025-01-08T14:00:00Z",
    trackingNumber: "DHL-UK-2025-123456",
    trackingNumberAddedBy: "S002",
    trackingNumberAddedAt: "2025-01-12T10:00:00Z",
    history: [
      {
        id: "H017-1",
        orderId: "O017",
        previousStatus: "new",
        newStatus: "pending_sales_review",
        actionType: "system_transition",
        actionBy: "system",
        actionByName: "System",
        createdAt: "2025-01-01T08:00:00Z",
      },
      {
        id: "H017-2",
        orderId: "O017",
        previousStatus: "pending_sales_review",
        newStatus: "pending_operation",
        actionType: "accept",
        actionBy: "S003",
        actionByName: "Jessica Chen",
        createdAt: "2025-01-02T10:00:00Z",
      },
      {
        id: "H017-3",
        orderId: "O017",
        previousStatus: "pending_operation",
        newStatus: "pending_operation_manager_review",
        actionType: "status_transition",
        actionBy: "S005",
        actionByName: "Sarah Thompson",
        createdAt: "2025-01-05T16:00:00Z",
      },
      {
        id: "H017-4",
        orderId: "O017",
        previousStatus: "pending_operation_manager_review",
        newStatus: "awaiting_client_acceptance",
        actionType: "accept",
        actionBy: "S002",
        actionByName: "David Anderson",
        createdAt: "2025-01-05T17:00:00Z",
      },
      {
        id: "H017-5",
        orderId: "O017",
        previousStatus: "awaiting_client_acceptance",
        newStatus: "pending_apostille",
        actionType: "status_transition",
        actionBy: "client",
        actionByName: "Michael Brown",
        createdAt: "2025-01-08T14:00:00Z",
      },
      {
        id: "H017-6",
        orderId: "O017",
        previousStatus: "pending_apostille",
        newStatus: "pending_poa",
        actionType: "status_transition",
        actionBy: "S002",
        actionByName: "David Anderson",
        createdAt: "2025-01-09T10:00:00Z",
      },
      {
        id: "H017-7",
        orderId: "O017",
        previousStatus: "pending_poa",
        newStatus: "pending_financial_report",
        actionType: "status_transition",
        actionBy: "S002",
        actionByName: "David Anderson",
        createdAt: "2025-01-10T09:00:00Z",
      },
      {
        id: "H017-8",
        orderId: "O017",
        previousStatus: "pending_financial_report",
        newStatus: "shipping_preparation",
        actionType: "status_transition",
        actionBy: "S002",
        actionByName: "David Anderson",
        createdAt: "2025-01-11T15:00:00Z",
      },
    ],
    rejectionReasons: [],
    operationFiles: [
      {
        id: "F017-1",
        orderId: "O017",
        fileName: "apostille_certificate.pdf",
        fileSize: 548000,
        uploadedBy: "S002",
        uploadedByName: "David Anderson",
        uploadedAt: "2025-01-09T10:15:00Z",
        stage: "apostille",
        fileType: "apostille",
        description: "Official apostille certificate for company documents",
        visibleToClient: false,
      },
      {
        id: "F017-2",
        orderId: "O017",
        fileName: "power_of_attorney.pdf",
        fileSize: 648000,
        uploadedBy: "S002",
        uploadedByName: "David Anderson",
        uploadedAt: "2025-01-10T09:30:00Z",
        stage: "poa",
        fileType: "poa",
        description: "Signed power of attorney document",
        visibleToClient: false,
      },
      {
        id: "F017-3",
        orderId: "O017",
        fileName: "financial_report_2024.pdf",
        fileSize: 2048000,
        uploadedBy: "S002",
        uploadedByName: "David Anderson",
        uploadedAt: "2025-01-11T14:00:00Z",
        stage: "financial_report",
        fileType: "financial_report",
        description: "Annual financial report for 2024",
        visibleToClient: false,
      },
    ],
    clientCanViewFiles: false,
    clientCanViewTracking: true,
    comments: [],
    requiredServices: {
      hasApostille: true,
      hasShipping: true,
      hasPOA: true,
      hasFinancialReport: true,
    },
    completedServices: {
      apostilleComplete: true,
      shippingComplete: true,
      poaComplete: true,
      financialReportComplete: true,
    },
    operationReviewForm: {
      isCompleted: true,
      submittedBy: "S005",
      submittedByName: "Sarah Thompson",
      submittedAt: "2025-01-05T16:00:00Z",
      companyName: "Acme Solutions Ltd",
      companyNumber: "UK14567890",
    },
  },
  {
    id: "O18",
    userId: "1",
    productId: "P005",
    orderNumber: "ORD-2025-18",
    description:
      "UK Company Acquisitions - Full Service Package with all required documents",
    amount: 1500,
    currency: "USD",
    status: "completed",
    serviceType: "UK Acquisitions",
    countries: ["United Kingdom"],
    createdAt: "2025-01-10T09:00:00Z",
    createdByStaffId: "S001",
    assignedToSalesId: "S006",
    assignedToOperationId: "S004",
    assignedToManagerId: "S002",
    clientAccepted: true,
    clientAcceptedAt: "2025-01-15T11:00:00Z",
    trackingNumber: "DHL-2025-UK-18",
    trackingNumberAddedBy: "S002",
    trackingNumberAddedAt: "2025-01-17T14:30:00Z",
    history: [
      {
        id: "H018-1",
        orderId: "O18",
        previousStatus: "new",
        newStatus: "pending_sales_review",
        actionType: "system_transition",
        actionBy: "system",
        actionByName: "System",
        createdAt: "2025-01-10T09:00:00Z",
      },
      {
        id: "H018-2",
        orderId: "O18",
        previousStatus: "pending_sales_review",
        newStatus: "pending_operation",
        actionType: "accept",
        actionBy: "S006",
        actionByName: "Robert Wilson",
        createdAt: "2025-01-11T10:00:00Z",
      },
      {
        id: "H018-3",
        orderId: "O18",
        previousStatus: "pending_operation",
        newStatus: "pending_operation_manager_review",
        actionType: "status_transition",
        actionBy: "S004",
        actionByName: "Emily Davis",
        createdAt: "2025-01-13T15:30:00Z",
      },
      {
        id: "H018-4",
        orderId: "O18",
        previousStatus: "pending_operation_manager_review",
        newStatus: "awaiting_client_acceptance",
        actionType: "accept",
        actionBy: "S002",
        actionByName: "David Anderson",
        createdAt: "2025-01-14T09:00:00Z",
      },
      {
        id: "H018-5",
        orderId: "O18",
        previousStatus: "awaiting_client_acceptance",
        newStatus: "pending_apostille",
        actionType: "status_transition",
        actionBy: "1",
        actionByName: "John Doe",
        createdAt: "2025-01-15T11:00:00Z",
      },
      {
        id: "H018-6",
        orderId: "O18",
        previousStatus: "pending_apostille",
        newStatus: "pending_poa",
        actionType: "status_transition",
        actionBy: "S002",
        actionByName: "David Anderson",
        createdAt: "2025-01-16T10:30:00Z",
      },
      {
        id: "H018-7",
        orderId: "O18",
        previousStatus: "pending_poa",
        newStatus: "shipping_preparation",
        actionType: "status_transition",
        actionBy: "S002",
        actionByName: "David Anderson",
        createdAt: "2025-01-17T08:00:00Z",
      },
      {
        id: "H018-8",
        orderId: "O18",
        previousStatus: "shipping_preparation",
        newStatus: "completed",
        actionType: "status_transition",
        actionBy: "S002",
        actionByName: "David Anderson",
        createdAt: "2025-01-17T16:00:00Z",
      },
    ],
    rejectionReasons: [],
    operationFiles: [
      {
        id: "F018-1",
        orderId: "O18",
        fileName: "apostille_certificate.pdf",
        fileSize: 512000,
        fileUrl: "https://example.com/files/apostille_certificate.pdf",
        uploadedBy: "S002",
        uploadedByName: "David Anderson",
        uploadedAt: "2025-01-16T10:45:00Z",
        stage: "apostille",
        fileType: "apostille",
        description:
          "Official apostille certificate for company acquisition documents",
        visibleToClient: false,
      },
      {
        id: "F018-2",
        orderId: "O18",
        fileName: "power_of_attorney.pdf",
        fileSize: 623000,
        fileUrl: "https://example.com/files/power_of_attorney.pdf",
        uploadedBy: "S002",
        uploadedByName: "David Anderson",
        uploadedAt: "2025-01-16T14:20:00Z",
        stage: "poa",
        fileType: "poa",
        description: "Signed power of attorney for acquisition process",
        visibleToClient: false,
      },
    ],
    clientCanViewFiles: true,
    clientCanViewTracking: true,
    comments: [
      {
        id: "C018-1",
        orderId: "O18",
        commentBy: "S006",
        commentByName: "Robert Wilson",
        commentByRole: "sales",
        content: "Order is progressing well, all documentation is in order",
        isInternal: false,
        createdAt: "2025-01-12T14:00:00Z",
      },
      {
        id: "C018-2",
        orderId: "O18",
        commentBy: "S002",
        commentByName: "David Anderson",
        commentByRole: "operation_manager",
        content:
          "Apostille and POA documents have been processed and are ready for shipment",
        isInternal: false,
        createdAt: "2025-01-17T15:30:00Z",
      },
    ],
    requiredServices: {
      hasApostille: true,
      hasShipping: true,
      hasPOA: true,
      hasFinancialReport: false,
    },
    completedServices: {
      apostilleComplete: true,
      shippingComplete: true,
      poaComplete: true,
      financialReportComplete: false,
    },
    operationReviewForm: {
      isCompleted: true,
      submittedBy: "S002",
      submittedByName: "David Anderson",
      submittedAt: "2025-01-17T14:00:00Z",
      companyName: "Acme Corporation UK Ltd",
      companyNumber: "UK12345678",
    },
    companyInfo: {
      companyName: "Acme Corporation UK Ltd",
      companyActivities: "Business consulting and advisory services",
      totalCapital: "£250,000",
      pricePerShare: "£10",
    },
    shareholders: [
      {
        id: "SH001",
        firstName: "Ahmed",
        lastName: "Sameh",
        dateOfBirth: "1984-07-21",
        nationality: "Egyptian",
        ownershipPercentage: 60,
        passportFile: {
          fileName: "ahmed_passport.pdf",
          fileSize: 234567,
          fileUrl: "https://example.com/files/ahmed_passport.pdf",
        },
      },
      {
        id: "SH002",
        firstName: "Fatima",
        lastName: "Hassan",
        dateOfBirth: "1986-03-15",
        nationality: "Egyptian",
        ownershipPercentage: 40,
        passportFile: {
          fileName: "fatima_passport.pdf",
          fileSize: 189234,
          fileUrl: "https://example.com/files/fatima_passport.pdf",
        },
      },
    ],
  },
];

export const mockStageDeadlines: StageDealineConfig[] = [
  {
    id: "SD001",
    stageName: "Order Created",
    stageId: "new",
    daysAllowed: 3,
    description:
      "Time allowed for admin/sales to review and assign new order to sales team",
    notes: "3 business days from order creation",
    lastUpdatedBy: "S001",
    lastUpdatedAt: "2024-01-01T10:00:00Z",
  },
  {
    id: "SD002",
    stageName: "Sales Review",
    stageId: "pending_sales_review",
    daysAllowed: 0.25,
    description:
      "Time allowed for sales team to review client details and documents (6 hours)",
    notes: "Quick review stage - 6 hours maximum",
    lastUpdatedBy: "S001",
    lastUpdatedAt: "2024-01-01T10:00:00Z",
  },
  {
    id: "SD003",
    stageName: "Operation Processing",
    stageId: "pending_operation",
    daysAllowed: 3,
    description:
      "Time allowed for operation team to process documents and prepare files",
    notes: "3 business days for document processing",
    lastUpdatedBy: "S001",
    lastUpdatedAt: "2024-01-01T10:00:00Z",
  },
  {
    id: "SD004",
    stageName: "Manager Review",
    stageId: "pending_operation_manager_review",
    daysAllowed: 1,
    description:
      "Time allowed for operation manager to review and approve documents",
    notes: "1 business day for manager approval",
    lastUpdatedBy: "S001",
    lastUpdatedAt: "2024-01-01T10:00:00Z",
  },
  {
    id: "SD005",
    stageName: "Client Acceptance",
    stageId: "awaiting_client_acceptance",
    daysAllowed: 1,
    description: "Time allowed for client to review and accept the order",
    notes: "1 business day for client to accept",
    lastUpdatedBy: "S001",
    lastUpdatedAt: "2024-01-01T10:00:00Z",
  },
  {
    id: "SD006",
    stageName: "Apostille Processing",
    stageId: "pending_apostille",
    daysAllowed: 3,
    description:
      "Time allowed for apostille certificate processing and authentication",
    notes: "3 business days for apostille processing",
    lastUpdatedBy: "S001",
    lastUpdatedAt: "2024-01-01T10:00:00Z",
  },
  {
    id: "SD007",
    stageName: "Power of Attorney",
    stageId: "pending_poa",
    daysAllowed: 2,
    description:
      "Time allowed for power of attorney document preparation and signing",
    notes: "2 business days for POA processing",
    lastUpdatedBy: "S001",
    lastUpdatedAt: "2024-01-01T10:00:00Z",
  },
  {
    id: "SD008",
    stageName: "Financial Report",
    stageId: "pending_financial_report",
    daysAllowed: 2,
    description:
      "Time allowed for financial report preparation and verification",
    notes: "2 business days for financial report processing",
    lastUpdatedBy: "S001",
    lastUpdatedAt: "2024-01-01T10:00:00Z",
  },
  {
    id: "SD009",
    stageName: "Shipping & Tracking",
    stageId: "shipping_preparation",
    daysAllowed: 1,
    description:
      "Time allowed for shipping arrangement and tracking number addition",
    notes: "1 business day for shipping and tracking",
    lastUpdatedBy: "S001",
    lastUpdatedAt: "2024-01-01T10:00:00Z",
  },
];

export const mockInvoices: Invoice[] = [
  {
    id: "INV001",
    userId: "1",
    invoiceNumber: "INV-2024-001",
    amount: 1500,
    currency: "USD",
    status: "paid",
    issueDate: "2024-01-05",
    dueDate: "2024-02-05",
    paidDate: "2024-01-06",
    createdAt: "2024-01-05T09:00:00Z",
    createdByStaffId: "S003",
    description: "Company Registration Service - USA",
    items: [
      {
        description: "Company Registration",
        quantity: 1,
        unitPrice: 1000,
      },
      {
        description: "Documentation & Filing",
        quantity: 1,
        unitPrice: 500,
      },
    ],
    history: [
      {
        id: "H001-1",
        invoiceId: "INV001",
        action: "created",
        actionBy: "S003",
        actionByName: "Jessica Chen",
        description: "Invoice created",
        createdAt: "2024-01-05T09:00:00Z",
      },
      {
        id: "H001-2",
        invoiceId: "INV001",
        action: "sent",
        actionBy: "S003",
        actionByName: "Jessica Chen",
        description: "Invoice sent to customer",
        createdAt: "2024-01-05T09:15:00Z",
      },
      {
        id: "H001-3",
        invoiceId: "INV001",
        action: "payment_received",
        actionBy: "1",
        actionByName: "John Doe",
        description: "Full payment received",
        amount: 1500,
        createdAt: "2024-01-06T14:30:00Z",
      },
    ],
  },
  {
    id: "INV002",
    userId: "1",
    invoiceNumber: "INV-2024-002",
    amount: 500,
    currency: "USD",
    status: "paid",
    issueDate: "2024-01-08",
    dueDate: "2024-02-08",
    paidDate: "2024-01-10",
    createdAt: "2024-01-08T10:30:00Z",
    createdByStaffId: "S003",
    description: "Tax ID Registration",
    items: [
      {
        description: "Tax ID Application",
        quantity: 1,
        unitPrice: 500,
      },
    ],
    history: [
      {
        id: "H002-1",
        invoiceId: "INV002",
        action: "created",
        actionBy: "S003",
        actionByName: "Jessica Chen",
        description: "Invoice created",
        createdAt: "2024-01-08T10:30:00Z",
      },
      {
        id: "H002-2",
        invoiceId: "INV002",
        action: "sent",
        actionBy: "S003",
        actionByName: "Jessica Chen",
        description: "Invoice sent to customer",
        createdAt: "2024-01-08T10:45:00Z",
      },
      {
        id: "H002-3",
        invoiceId: "INV002",
        action: "payment_received",
        actionBy: "1",
        actionByName: "John Doe",
        description: "Payment received - USD 500",
        amount: 500,
        createdAt: "2024-01-10T11:20:00Z",
      },
    ],
  },
  {
    id: "INV003",
    userId: "2",
    invoiceNumber: "INV-2024-003",
    amount: 2000,
    currency: "GBP",
    status: "paid",
    issueDate: "2023-12-20",
    dueDate: "2024-01-20",
    paidDate: "2023-12-22",
    createdAt: "2023-12-20T14:00:00Z",
    createdByStaffId: "S006",
    description: "UK Company Formation",
    items: [
      {
        description: "Limited Company Registration",
        quantity: 1,
        unitPrice: 1500,
      },
      {
        description: "Director Registration",
        quantity: 1,
        unitPrice: 500,
      },
    ],
    history: [
      {
        id: "H003-1",
        invoiceId: "INV003",
        action: "created",
        actionBy: "S006",
        actionByName: "Robert Martinez",
        description: "Invoice created",
        createdAt: "2023-12-20T14:00:00Z",
      },
      {
        id: "H003-2",
        invoiceId: "INV003",
        action: "sent",
        actionBy: "S006",
        actionByName: "Robert Martinez",
        description: "Invoice sent to customer",
        createdAt: "2023-12-20T14:15:00Z",
      },
      {
        id: "H003-3",
        invoiceId: "INV003",
        action: "payment_received",
        actionBy: "2",
        actionByName: "Jane Smith",
        description: "Full payment received - GBP 2000",
        amount: 2000,
        createdAt: "2023-12-22T10:30:00Z",
      },
    ],
  },
  {
    id: "INV004",
    userId: "2",
    invoiceNumber: "INV-2024-004",
    amount: 5500,
    currency: "EUR",
    status: "paid",
    issueDate: "2023-11-15",
    dueDate: "2023-12-15",
    paidDate: "2023-12-01",
    createdAt: "2023-11-15T11:15:00Z",
    createdByStaffId: "S005",
    description: "EU Multi-Country Business Setup",
    items: [
      {
        description: "German GmbH Registration",
        quantity: 1,
        unitPrice: 2000,
      },
      {
        description: "French SARL Formation",
        quantity: 1,
        unitPrice: 1800,
      },
      {
        description: "Dutch BV Setup",
        quantity: 1,
        unitPrice: 1700,
      },
    ],
    history: [
      {
        id: "H004-1",
        invoiceId: "INV004",
        action: "created",
        actionBy: "S005",
        actionByName: "Michael Wong",
        description: "Invoice created",
        createdAt: "2023-11-15T11:15:00Z",
      },
      {
        id: "H004-2",
        invoiceId: "INV004",
        action: "sent",
        actionBy: "S005",
        actionByName: "Michael Wong",
        description: "Invoice sent to customer",
        createdAt: "2023-11-15T11:30:00Z",
      },
      {
        id: "H004-3",
        invoiceId: "INV004",
        action: "payment_received",
        actionBy: "2",
        actionByName: "Jane Smith",
        description: "Full payment received - EUR 5500",
        amount: 5500,
        createdAt: "2023-12-01T15:45:00Z",
      },
    ],
  },
  {
    id: "INV005",
    userId: "3",
    invoiceNumber: "INV-2024-005",
    amount: 1200,
    currency: "EUR",
    status: "sent",
    issueDate: "2024-01-07",
    dueDate: "2024-02-07",
    createdAt: "2024-01-07T13:45:00Z",
    createdByStaffId: "S005",
    description: "Spanish Sociedad Limitada Registration",
    items: [
      {
        description: "SL Registration",
        quantity: 1,
        unitPrice: 1200,
      },
    ],
    history: [
      {
        id: "H005-1",
        invoiceId: "INV005",
        action: "created",
        actionBy: "S005",
        actionByName: "Michael Wong",
        description: "Invoice created",
        createdAt: "2024-01-07T13:45:00Z",
      },
      {
        id: "H005-2",
        invoiceId: "INV005",
        action: "sent",
        actionBy: "S005",
        actionByName: "Michael Wong",
        description: "Invoice sent to customer",
        createdAt: "2024-01-07T14:00:00Z",
      },
      {
        id: "H005-3",
        invoiceId: "INV005",
        action: "viewed",
        actionBy: "3",
        actionByName: "Maria Garcia",
        description: "Invoice viewed by customer",
        createdAt: "2024-01-08T09:20:00Z",
      },
    ],
  },
  {
    id: "INV006",
    userId: "4",
    invoiceNumber: "INV-2024-006",
    amount: 3000,
    currency: "SGD",
    status: "sent",
    issueDate: "2024-01-02",
    dueDate: "2024-02-02",
    createdAt: "2024-01-02T08:20:00Z",
    createdByStaffId: "S004",
    description: "Singapore & Malaysia Corporate Setup",
    items: [
      {
        description: "Singapore Pte Ltd Registration",
        quantity: 1,
        unitPrice: 1800,
      },
      {
        description: "Malaysia Sdn Bhd Formation",
        quantity: 1,
        unitPrice: 1200,
      },
    ],
    history: [
      {
        id: "H006-1",
        invoiceId: "INV006",
        action: "created",
        actionBy: "S004",
        actionByName: "Sarah Johnson",
        description: "Invoice created",
        createdAt: "2024-01-02T08:20:00Z",
      },
      {
        id: "H006-2",
        invoiceId: "INV006",
        action: "sent",
        actionBy: "S004",
        actionByName: "Sarah Johnson",
        description: "Invoice sent to customer",
        createdAt: "2024-01-02T08:35:00Z",
      },
      {
        id: "H006-3",
        invoiceId: "INV006",
        action: "reminder_sent",
        actionBy: "S004",
        actionByName: "Sarah Johnson",
        description: "Payment reminder sent",
        createdAt: "2024-01-20T10:00:00Z",
      },
    ],
  },
  {
    id: "INV007",
    userId: "7",
    invoiceNumber: "INV-2024-007",
    amount: 4500,
    currency: "JPY",
    status: "paid",
    issueDate: "2023-12-01",
    dueDate: "2024-01-01",
    paidDate: "2023-12-15",
    createdAt: "2023-12-01T10:00:00Z",
    createdByStaffId: "S006",
    description: "Japan Kabushiki Kaisha Registration",
    items: [
      {
        description: "KK Registration & Setup",
        quantity: 1,
        unitPrice: 4500,
      },
    ],
    history: [
      {
        id: "H007-1",
        invoiceId: "INV007",
        action: "created",
        actionBy: "S006",
        actionByName: "Robert Martinez",
        description: "Invoice created",
        createdAt: "2023-12-01T10:00:00Z",
      },
      {
        id: "H007-2",
        invoiceId: "INV007",
        action: "sent",
        actionBy: "S006",
        actionByName: "Robert Martinez",
        description: "Invoice sent to customer",
        createdAt: "2023-12-01T10:15:00Z",
      },
      {
        id: "H007-3",
        invoiceId: "INV007",
        action: "payment_received",
        actionBy: "7",
        actionByName: "Kenji Tanaka",
        description: "Full payment received - JPY 4500",
        amount: 4500,
        createdAt: "2023-12-15T16:20:00Z",
      },
    ],
  },
  {
    id: "INV008",
    userId: "1",
    invoiceNumber: "INV-2024-008",
    amount: 800,
    currency: "USD",
    status: "overdue",
    issueDate: "2023-12-05",
    dueDate: "2024-01-05",
    createdAt: "2023-12-05T15:30:00Z",
    createdByStaffId: "S003",
    description: "Annual Compliance Filing - USA",
    items: [
      {
        description: "Annual Report Filing",
        quantity: 1,
        unitPrice: 800,
      },
    ],
    history: [
      {
        id: "H008-1",
        invoiceId: "INV008",
        action: "created",
        actionBy: "S003",
        actionByName: "Jessica Chen",
        description: "Invoice created",
        createdAt: "2023-12-05T15:30:00Z",
      },
      {
        id: "H008-2",
        invoiceId: "INV008",
        action: "sent",
        actionBy: "S003",
        actionByName: "Jessica Chen",
        description: "Invoice sent to customer",
        createdAt: "2023-12-05T15:45:00Z",
      },
      {
        id: "H008-3",
        invoiceId: "INV008",
        action: "payment_failed",
        actionBy: "1",
        actionByName: "John Doe",
        description: "Payment attempt failed",
        createdAt: "2024-01-10T14:00:00Z",
      },
      {
        id: "H008-4",
        invoiceId: "INV008",
        action: "status_changed",
        previousStatus: "sent",
        newStatus: "overdue",
        actionBy: "system",
        actionByName: "System",
        description: "Invoice marked as overdue",
        createdAt: "2024-01-06T00:00:00Z",
      },
    ],
  },
  {
    id: "INV009",
    userId: "5",
    invoiceNumber: "INV-2024-009",
    amount: 2200,
    currency: "AUD",
    status: "draft",
    issueDate: "2024-01-08",
    dueDate: "2024-02-08",
    createdAt: "2024-01-08T16:50:00Z",
    createdByStaffId: "S004",
    description: "Australian Business Registration",
    items: [
      {
        description: "ACN Registration",
        quantity: 1,
        unitPrice: 1500,
      },
      {
        description: "ABN Registration",
        quantity: 1,
        unitPrice: 700,
      },
    ],
    history: [
      {
        id: "H009-1",
        invoiceId: "INV009",
        action: "created",
        actionBy: "S004",
        actionByName: "Sarah Johnson",
        description: "Invoice created",
        createdAt: "2024-01-08T16:50:00Z",
      },
      {
        id: "H009-2",
        invoiceId: "INV009",
        action: "status_changed",
        previousStatus: "draft",
        newStatus: "draft",
        actionBy: "S004",
        actionByName: "Sarah Johnson",
        description: "Invoice status: Draft",
        createdAt: "2024-01-08T16:50:00Z",
      },
    ],
  },
  {
    id: "INV010",
    userId: "2",
    invoiceNumber: "INV-2024-010",
    amount: 1800,
    currency: "GBP",
    status: "sent",
    issueDate: "2024-01-06",
    dueDate: "2024-02-06",
    createdAt: "2024-01-06T12:00:00Z",
    createdByStaffId: "S005",
    description: "UK Tax Compliance - Annual",
    items: [
      {
        description: "Tax Return Filing",
        quantity: 1,
        unitPrice: 1200,
      },
      {
        description: "Accounting Review",
        quantity: 1,
        unitPrice: 600,
      },
    ],
    history: [
      {
        id: "H010-1",
        invoiceId: "INV010",
        action: "created",
        actionBy: "S005",
        actionByName: "Michael Wong",
        description: "Invoice created",
        createdAt: "2024-01-06T12:00:00Z",
      },
      {
        id: "H010-2",
        invoiceId: "INV010",
        action: "sent",
        actionBy: "S005",
        actionByName: "Michael Wong",
        description: "Invoice sent to customer",
        createdAt: "2024-01-06T12:15:00Z",
      },
      {
        id: "H010-3",
        invoiceId: "INV010",
        action: "reminder_sent",
        actionBy: "S005",
        actionByName: "Michael Wong",
        description: "Payment reminder sent",
        createdAt: "2024-01-25T10:00:00Z",
      },
    ],
  },
  {
    id: "INV011",
    userId: "3",
    invoiceNumber: "INV-2024-011",
    amount: 950,
    currency: "EUR",
    status: "paid",
    issueDate: "2024-01-01",
    dueDate: "2024-02-01",
    paidDate: "2024-01-05",
    description: "EU Data Protection Compliance",
    items: [
      {
        description: "GDPR Compliance Setup",
        quantity: 1,
        unitPrice: 950,
      },
    ],
    history: [
      {
        id: "H011-1",
        invoiceId: "INV011",
        action: "created",
        actionBy: "system",
        actionByName: "System",
        description: "Invoice created",
        createdAt: "2024-01-01T08:00:00Z",
      },
      {
        id: "H011-2",
        invoiceId: "INV011",
        action: "sent",
        actionBy: "system",
        actionByName: "System",
        description: "Invoice sent to customer",
        createdAt: "2024-01-01T08:15:00Z",
      },
      {
        id: "H011-3",
        invoiceId: "INV011",
        action: "payment_received",
        actionBy: "3",
        actionByName: "Maria Garcia",
        description: "Full payment received - EUR 950",
        amount: 950,
        createdAt: "2024-01-05T13:30:00Z",
      },
    ],
  },
  {
    id: "INV012",
    userId: "4",
    invoiceNumber: "INV-2024-012",
    amount: 2500,
    currency: "SGD",
    status: "overdue",
    issueDate: "2023-12-10",
    dueDate: "2024-01-10",
    description: "Singapore Annual Fee",
    items: [
      {
        description: "Company Annual Filing",
        quantity: 1,
        unitPrice: 2500,
      },
    ],
    history: [
      {
        id: "H012-1",
        invoiceId: "INV012",
        action: "created",
        actionBy: "S004",
        actionByName: "Sarah Johnson",
        description: "Invoice created",
        createdAt: "2023-12-10T09:00:00Z",
      },
      {
        id: "H012-2",
        invoiceId: "INV012",
        action: "sent",
        actionBy: "S004",
        actionByName: "Sarah Johnson",
        description: "Invoice sent to customer",
        createdAt: "2023-12-10T09:15:00Z",
      },
      {
        id: "H012-3",
        invoiceId: "INV012",
        action: "status_changed",
        previousStatus: "sent",
        newStatus: "overdue",
        actionBy: "system",
        actionByName: "System",
        description: "Invoice marked as overdue",
        createdAt: "2024-01-11T00:00:00Z",
      },
    ],
  },
  {
    id: "INV013",
    userId: "6",
    invoiceNumber: "INV-2024-013",
    amount: 1350,
    currency: "CAD",
    status: "sent",
    issueDate: "2024-01-04",
    dueDate: "2024-02-04",
    description: "Canada Corporate Setup",
    items: [
      {
        description: "Federal Incorporation",
        quantity: 1,
        unitPrice: 850,
      },
      {
        description: "Business Registration",
        quantity: 1,
        unitPrice: 500,
      },
    ],
    history: [
      {
        id: "H013-1",
        invoiceId: "INV013",
        action: "created",
        actionBy: "system",
        actionByName: "System",
        description: "Invoice created",
        createdAt: "2024-01-04T10:00:00Z",
      },
      {
        id: "H013-2",
        invoiceId: "INV013",
        action: "sent",
        actionBy: "system",
        actionByName: "System",
        description: "Invoice sent to customer",
        createdAt: "2024-01-04T10:15:00Z",
      },
      {
        id: "H013-3",
        invoiceId: "INV013",
        action: "viewed",
        actionBy: "6",
        actionByName: "Ahmed Hassan",
        description: "Invoice viewed by customer",
        createdAt: "2024-01-05T14:30:00Z",
      },
    ],
  },
  {
    id: "INV014",
    userId: "7",
    invoiceNumber: "INV-2024-014",
    amount: 3200,
    currency: "JPY",
    status: "paid",
    issueDate: "2023-12-15",
    dueDate: "2024-01-15",
    paidDate: "2024-01-02",
    description: "Japan Tax & Audit Services",
    items: [
      {
        description: "Tax Planning Consultation",
        quantity: 1,
        unitPrice: 1500,
      },
      {
        description: "Audit Services",
        quantity: 1,
        unitPrice: 1700,
      },
    ],
    history: [
      {
        id: "H014-1",
        invoiceId: "INV014",
        action: "created",
        actionBy: "S006",
        actionByName: "Robert Martinez",
        description: "Invoice created",
        createdAt: "2023-12-15T09:00:00Z",
      },
      {
        id: "H014-2",
        invoiceId: "INV014",
        action: "sent",
        actionBy: "S006",
        actionByName: "Robert Martinez",
        description: "Invoice sent to customer",
        createdAt: "2023-12-15T09:15:00Z",
      },
      {
        id: "H014-3",
        invoiceId: "INV014",
        action: "payment_received",
        actionBy: "7",
        actionByName: "Kenji Tanaka",
        description: "Full payment received - JPY 3200",
        amount: 3200,
        createdAt: "2024-01-02T16:45:00Z",
      },
    ],
  },
  {
    id: "INV015",
    userId: "8",
    invoiceNumber: "INV-2024-015",
    amount: 675,
    currency: "BRL",
    status: "cancelled",
    issueDate: "2023-11-20",
    dueDate: "2023-12-20",
    description: "Brazil Setup Services (Cancelled)",
    items: [
      {
        description: "CNPJ Registration",
        quantity: 1,
        unitPrice: 675,
      },
    ],
    history: [
      {
        id: "H015-1",
        invoiceId: "INV015",
        action: "created",
        actionBy: "system",
        actionByName: "System",
        description: "Invoice created",
        createdAt: "2023-11-20T10:00:00Z",
      },
      {
        id: "H015-2",
        invoiceId: "INV015",
        action: "sent",
        actionBy: "system",
        actionByName: "System",
        description: "Invoice sent to customer",
        createdAt: "2023-11-20T10:15:00Z",
      },
      {
        id: "H015-3",
        invoiceId: "INV015",
        action: "cancelled",
        actionBy: "system",
        actionByName: "System",
        description: "Invoice cancelled - Client request",
        notes: "Client no longer needs Brazil setup services",
        createdAt: "2023-11-25T14:20:00Z",
      },
    ],
  },
];

export const mockLoginHistory: LoginHistory[] = [
  {
    id: "L001",
    userId: "1",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    location: "New York, USA",
    status: "success",
    loginTime: "2024-01-08T14:30:00Z",
    logoutTime: "2024-01-08T15:45:00Z",
    duration: 75,
  },
  {
    id: "L002",
    userId: "1",
    ipAddress: "192.168.1.101",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    location: "New York, USA",
    status: "success",
    loginTime: "2024-01-07T10:15:00Z",
    logoutTime: "2024-01-07T11:30:00Z",
    duration: 75,
  },
  {
    id: "L003",
    userId: "1",
    ipAddress: "203.0.113.45",
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
    location: "Newark, USA",
    status: "failed",
    loginTime: "2024-01-06T22:10:00Z",
  },
  {
    id: "L004",
    userId: "2",
    ipAddress: "198.51.100.50",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    location: "London, UK",
    status: "success",
    loginTime: "2024-01-08T10:15:00Z",
    logoutTime: "2024-01-08T12:45:00Z",
    duration: 150,
  },
  {
    id: "L005",
    userId: "2",
    ipAddress: "198.51.100.51",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    location: "London, UK",
    status: "success",
    loginTime: "2024-01-07T09:00:00Z",
    logoutTime: "2024-01-07T17:30:00Z",
    duration: 510,
  },
  {
    id: "L006",
    userId: "3",
    ipAddress: "192.0.2.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    location: "Madrid, Spain",
    status: "success",
    loginTime: "2024-01-07T09:45:00Z",
    logoutTime: "2024-01-07T10:20:00Z",
    duration: 35,
  },
  {
    id: "L007",
    userId: "4",
    ipAddress: "203.0.113.60",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2_1 like Mac OS X)",
    location: "Singapore",
    status: "success",
    loginTime: "2024-01-08T16:20:00Z",
  },
  {
    id: "L008",
    userId: "5",
    ipAddress: "192.0.2.200",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    location: "Sydney, Australia",
    status: "success",
    loginTime: "2024-01-02T11:00:00Z",
    logoutTime: "2024-01-02T11:45:00Z",
    duration: 45,
  },
];

// Role Permissions
export const rolePermissions: Record<StaffRole, string[]> = {
  super_admin: [
    "manage_users",
    "manage_staff",
    "manage_orders",
    "manage_invoices",
    "view_reports",
    "manage_permissions",
    "add_orders",
    "edit_orders",
    "delete_orders",
    "view_all_data",
  ],
  admin: [
    "manage_users",
    "manage_staff",
    "manage_orders",
    "manage_invoices",
    "view_reports",
    "add_orders",
    "edit_orders",
    "view_all_data",
  ],
  operation_manager: [
    "view_operations",
    "view_sales",
    "manage_orders",
    "view_all_orders",
    "edit_orders",
    "view_invoices",
    "upload_documents",
  ],
  operation: [
    "create_orders",
    "edit_assigned_orders",
    "change_order_status",
    "upload_documents",
    "view_assigned_orders",
  ],
  sales: [
    "create_orders",
    "view_client_orders",
    "view_client_invoices",
    "view_client_payments",
    "track_orders",
  ],
  accounting: ["view_invoices", "view_payments", "manage_billing"],
};

export const roleLabels: Record<StaffRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  operation_manager: "Operation Manager",
  operation: "Operation",
  sales: "Sales",
  accounting: "Accounting",
};

export const mockStaff: Staff[] = [
  {
    id: "S001",
    firstName: "Admin",
    lastName: "User",
    email: "admin@domaino.com",
    role: "super_admin",
    status: "active",
    department: "Management",
    joinDate: "2024-01-01",
    lastLogin: "2024-01-08T14:30:00Z",
    phone: "+1-555-0001",
    workingHours: { startTime: "08:30", endTime: "17:30", daysPerWeek: 5 },
    workflowPermissions: [
      {
        stage: "sales",
        label: "Sales Review",
        description: "Review and approve sales orders",
        canAccess: true,
      },
      {
        stage: "operation",
        label: "Operation Process",
        description: "Handle order operations",
        canAccess: true,
      },
      {
        stage: "manager",
        label: "Manager Review",
        description: "Review and approve operations",
        canAccess: true,
      },
      {
        stage: "client",
        label: "Client Acceptance",
        description: "Handle client communications",
        canAccess: true,
      },
      {
        stage: "shipping",
        label: "Shipping & Complete",
        description: "Manage shipping and completion",
        canAccess: true,
      },
    ],
  },
  {
    id: "S002",
    firstName: "David",
    lastName: "Anderson",
    email: "david.anderson@domaino.com",
    role: "operation_manager",
    status: "active",
    department: "Operations",
    joinDate: "2023-12-15",
    lastLogin: "2024-01-08T13:15:00Z",
    phone: "+1-555-0002",
    workingHours: { startTime: "09:00", endTime: "18:00", daysPerWeek: 5 },
    workflowPermissions: [
      {
        stage: "sales",
        label: "Sales Review",
        description: "Review and approve sales orders",
        canAccess: false,
      },
      {
        stage: "operation",
        label: "Operation Process",
        description: "Handle order operations",
        canAccess: true,
      },
      {
        stage: "manager",
        label: "Manager Review",
        description: "Review and approve operations",
        canAccess: true,
      },
      {
        stage: "client",
        label: "Client Acceptance",
        description: "Handle client communications",
        canAccess: true,
      },
      {
        stage: "shipping",
        label: "Shipping & Complete",
        description: "Manage shipping and completion",
        canAccess: true,
      },
    ],
  },
  {
    id: "S003",
    firstName: "Jessica",
    lastName: "Chen",
    email: "jessica.chen@domaino.com",
    role: "sales",
    status: "active",
    department: "Sales",
    joinDate: "2023-11-01",
    lastLogin: "2024-01-08T11:45:00Z",
    phone: "+1-555-0003",
    workingHours: { startTime: "09:30", endTime: "18:30", daysPerWeek: 5 },
    workflowPermissions: [
      {
        stage: "sales",
        label: "Sales Review",
        description: "Review and approve sales orders",
        canAccess: true,
      },
      {
        stage: "operation",
        label: "Operation Process",
        description: "Handle order operations",
        canAccess: false,
      },
      {
        stage: "manager",
        label: "Manager Review",
        description: "Review and approve operations",
        canAccess: false,
      },
      {
        stage: "client",
        label: "Client Acceptance",
        description: "Handle client communications",
        canAccess: false,
      },
      {
        stage: "shipping",
        label: "Shipping & Complete",
        description: "Manage shipping and completion",
        canAccess: false,
      },
    ],
  },
  {
    id: "S004",
    firstName: "Robert",
    lastName: "Martinez",
    email: "robert.martinez@domaino.com",
    role: "operation",
    status: "active",
    department: "Operations",
    joinDate: "2023-10-20",
    lastLogin: "2024-01-08T16:20:00Z",
    phone: "+1-555-0004",
    workingHours: { startTime: "08:00", endTime: "17:00", daysPerWeek: 5 },
    workflowPermissions: [
      {
        stage: "sales",
        label: "Sales Review",
        description: "Review and approve sales orders",
        canAccess: false,
      },
      {
        stage: "operation",
        label: "Operation Process",
        description: "Handle order operations",
        canAccess: true,
      },
      {
        stage: "manager",
        label: "Manager Review",
        description: "Review and approve operations",
        canAccess: false,
      },
      {
        stage: "client",
        label: "Client Acceptance",
        description: "Handle client communications",
        canAccess: false,
      },
      {
        stage: "shipping",
        label: "Shipping & Complete",
        description: "Manage shipping and completion",
        canAccess: false,
      },
    ],
  },
  {
    id: "S005",
    firstName: "Sarah",
    lastName: "Thompson",
    email: "sarah.thompson@domaino.com",
    role: "operation",
    status: "active",
    department: "Operations",
    joinDate: "2023-10-15",
    lastLogin: "2024-01-07T09:30:00Z",
    phone: "+1-555-0005",
    workingHours: { startTime: "09:00", endTime: "18:00", daysPerWeek: 5 },
    workflowPermissions: [
      {
        stage: "sales",
        label: "Sales Review",
        description: "Review and approve sales orders",
        canAccess: false,
      },
      {
        stage: "operation",
        label: "Operation Process",
        description: "Handle order operations",
        canAccess: true,
      },
      {
        stage: "manager",
        label: "Manager Review",
        description: "Review and approve operations",
        canAccess: false,
      },
      {
        stage: "client",
        label: "Client Acceptance",
        description: "Handle client communications",
        canAccess: false,
      },
      {
        stage: "shipping",
        label: "Shipping & Complete",
        description: "Manage shipping and completion",
        canAccess: false,
      },
    ],
  },
  {
    id: "S006",
    firstName: "Michael",
    lastName: "Brown",
    email: "michael.brown@domaino.com",
    role: "sales",
    status: "active",
    department: "Sales",
    joinDate: "2023-12-01",
    lastLogin: "2024-01-08T10:00:00Z",
    phone: "+1-555-0006",
    workingHours: { startTime: "10:00", endTime: "19:00", daysPerWeek: 5 },
    workflowPermissions: [
      {
        stage: "sales",
        label: "Sales Review",
        description: "Review and approve sales orders",
        canAccess: true,
      },
      {
        stage: "operation",
        label: "Operation Process",
        description: "Handle order operations",
        canAccess: false,
      },
      {
        stage: "manager",
        label: "Manager Review",
        description: "Review and approve operations",
        canAccess: false,
      },
      {
        stage: "client",
        label: "Client Acceptance",
        description: "Handle client communications",
        canAccess: false,
      },
      {
        stage: "shipping",
        label: "Shipping & Complete",
        description: "Manage shipping and completion",
        canAccess: false,
      },
    ],
  },
  {
    id: "S007",
    firstName: "Emily",
    lastName: "Johnson",
    email: "emily.johnson@domaino.com",
    role: "accounting",
    status: "active",
    department: "Accounting",
    joinDate: "2023-09-10",
    lastLogin: "2024-01-08T08:45:00Z",
    phone: "+1-555-0007",
    workingHours: { startTime: "09:00", endTime: "18:00", daysPerWeek: 5 },
    workflowPermissions: [
      {
        stage: "sales",
        label: "Sales Review",
        description: "Review and approve sales orders",
        canAccess: false,
      },
      {
        stage: "operation",
        label: "Operation Process",
        description: "Handle order operations",
        canAccess: false,
      },
      {
        stage: "manager",
        label: "Manager Review",
        description: "Review and approve operations",
        canAccess: false,
      },
      {
        stage: "client",
        label: "Client Acceptance",
        description: "Handle client communications",
        canAccess: false,
      },
      {
        stage: "shipping",
        label: "Shipping & Complete",
        description: "Manage shipping and completion",
        canAccess: false,
      },
    ],
  },
  {
    id: "S008",
    firstName: "James",
    lastName: "Wilson",
    email: "james.wilson@domaino.com",
    role: "admin",
    status: "active",
    department: "Management",
    joinDate: "2024-01-05",
    lastLogin: "2024-01-08T15:30:00Z",
    phone: "+1-555-0008",
    workingHours: { startTime: "08:30", endTime: "17:30", daysPerWeek: 5 },
    workflowPermissions: [
      {
        stage: "sales",
        label: "Sales Review",
        description: "Review and approve sales orders",
        canAccess: true,
      },
      {
        stage: "operation",
        label: "Operation Process",
        description: "Handle order operations",
        canAccess: true,
      },
      {
        stage: "manager",
        label: "Manager Review",
        description: "Review and approve operations",
        canAccess: true,
      },
      {
        stage: "client",
        label: "Client Acceptance",
        description: "Handle client communications",
        canAccess: true,
      },
      {
        stage: "shipping",
        label: "Shipping & Complete",
        description: "Manage shipping and completion",
        canAccess: true,
      },
    ],
  },
];

// Mock Attendance Records
export const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: "A001-2024-01-08",
    staffId: "S001",
    date: "2024-01-08",
    loginTime: "2024-01-08T08:25:00Z",
    logoutTime: "2024-01-08T17:35:00Z",
    hoursWorked: 9.17,
    confirmations: 8,
    missedConfirmations: 0,
    isLate: false,
    attendanceStatus: "present",
  },
  {
    id: "A002-2024-01-08",
    staffId: "S002",
    date: "2024-01-08",
    loginTime: "2024-01-08T09:05:00Z",
    logoutTime: "2024-01-08T18:00:00Z",
    hoursWorked: 8.92,
    confirmations: 7,
    missedConfirmations: 1,
    isLate: false,
    attendanceStatus: "present",
  },
  {
    id: "A003-2024-01-08",
    staffId: "S003",
    date: "2024-01-08",
    loginTime: "2024-01-08T09:35:00Z",
    logoutTime: "2024-01-08T18:30:00Z",
    hoursWorked: 8.92,
    confirmations: 6,
    missedConfirmations: 2,
    isLate: false,
    attendanceStatus: "present",
  },
  {
    id: "A004-2024-01-08",
    staffId: "S004",
    date: "2024-01-08",
    loginTime: "2024-01-08T08:15:00Z",
    logoutTime: "2024-01-08T17:00:00Z",
    hoursWorked: 8.75,
    confirmations: 7,
    missedConfirmations: 0,
    isLate: false,
    attendanceStatus: "present",
  },
  {
    id: "A005-2024-01-08",
    staffId: "S005",
    date: "2024-01-08",
    loginTime: "2024-01-08T09:15:00Z",
    logoutTime: "2024-01-08T18:00:00Z",
    hoursWorked: 8.75,
    confirmations: 5,
    missedConfirmations: 3,
    isLate: false,
    attendanceStatus: "present",
  },
  {
    id: "A006-2024-01-08",
    staffId: "S006",
    date: "2024-01-08",
    loginTime: "2024-01-08T10:30:00Z",
    hoursWorked: 5.5,
    confirmations: 4,
    missedConfirmations: 0,
    isLate: false,
    attendanceStatus: "present",
  },
  {
    id: "A007-2024-01-08",
    staffId: "S007",
    date: "2024-01-08",
    loginTime: "2024-01-08T09:00:00Z",
    logoutTime: "2024-01-08T18:00:00Z",
    hoursWorked: 9.0,
    confirmations: 8,
    missedConfirmations: 0,
    isLate: false,
    attendanceStatus: "present",
  },
  {
    id: "A008-2024-01-08",
    staffId: "S008",
    date: "2024-01-08",
    loginTime: "2024-01-08T08:45:00Z",
    logoutTime: "2024-01-08T17:30:00Z",
    hoursWorked: 8.75,
    confirmations: 6,
    missedConfirmations: 1,
    isLate: false,
    attendanceStatus: "present",
  },
];

// Staff Commission Configurations
export const mockStaffCommissions: StaffCommission[] = [
  {
    staffId: "S003",
    currency: "USD",
    tiers: [
      {
        id: "T001",
        orderCountMin: 1,
        orderCountMax: 10,
        percentageRate: 5,
        fixedAmount: 50,
        description: "Orders 1-10",
      },
      {
        id: "T002",
        orderCountMin: 11,
        orderCountMax: 20,
        percentageRate: 7,
        fixedAmount: 100,
        description: "Orders 11-20",
      },
      {
        id: "T003",
        orderCountMin: 21,
        orderCountMax: 50,
        percentageRate: 10,
        fixedAmount: 150,
        description: "Orders 21-50",
      },
      {
        id: "T004",
        orderCountMin: 51,
        orderCountMax: 999999,
        percentageRate: 12,
        fixedAmount: 200,
        description: "Orders 51+",
      },
    ],
    totalEarned: 4850,
    paidAmount: 3200,
    pendingAmount: 1650,
  },
  {
    staffId: "S004",
    currency: "EUR",
    tiers: [
      {
        id: "T005",
        orderCountMin: 1,
        orderCountMax: 10,
        percentageRate: 4,
        fixedAmount: 40,
        description: "Orders 1-10",
      },
      {
        id: "T006",
        orderCountMin: 11,
        orderCountMax: 20,
        percentageRate: 6,
        fixedAmount: 80,
        description: "Orders 11-20",
      },
      {
        id: "T007",
        orderCountMin: 21,
        orderCountMax: 999999,
        percentageRate: 8,
        fixedAmount: 120,
        description: "Orders 21+",
      },
    ],
    totalEarned: 2340,
    paidAmount: 1500,
    pendingAmount: 840,
  },
  {
    staffId: "S006",
    currency: "GBP",
    tiers: [
      {
        id: "T008",
        orderCountMin: 1,
        orderCountMax: 10,
        percentageRate: 5,
        fixedAmount: 60,
        description: "Orders 1-10",
      },
      {
        id: "T009",
        orderCountMin: 11,
        orderCountMax: 25,
        percentageRate: 8,
        fixedAmount: 120,
        description: "Orders 11-25",
      },
      {
        id: "T010",
        orderCountMin: 26,
        orderCountMax: 999999,
        percentageRate: 11,
        fixedAmount: 180,
        description: "Orders 26+",
      },
    ],
    totalEarned: 5620,
    paidAmount: 4000,
    pendingAmount: 1620,
  },
  {
    staffId: "S005",
    currency: "EUR",
    tiers: [
      {
        id: "T011",
        orderCountMin: 1,
        orderCountMax: 15,
        percentageRate: 4,
        fixedAmount: 45,
        description: "Orders 1-15",
      },
      {
        id: "T012",
        orderCountMin: 16,
        orderCountMax: 30,
        percentageRate: 6,
        fixedAmount: 90,
        description: "Orders 16-30",
      },
      {
        id: "T013",
        orderCountMin: 31,
        orderCountMax: 999999,
        percentageRate: 9,
        fixedAmount: 140,
        description: "Orders 31+",
      },
    ],
    totalEarned: 1950,
    paidAmount: 1200,
    pendingAmount: 750,
  },
];

// Commission History for Staff
export const mockStaffCommissionHistory: StaffCommissionHistory[] = [
  {
    id: "CH001",
    staffId: "S003",
    invoiceId: "INV001",
    orderCount: 5,
    appliedTier: {
      id: "T001",
      orderCountMin: 1,
      orderCountMax: 10,
      percentageRate: 5,
      fixedAmount: 50,
      description: "Orders 1-10",
    },
    invoiceAmount: 1500,
    commissionPercentage: 75,
    commissionFixed: 50,
    totalCommission: 125,
    currency: "USD",
    status: "paid",
    createdAt: "2024-01-05",
    paidAt: "2024-01-06",
  },
  {
    id: "CH002",
    staffId: "S003",
    invoiceId: "INV002",
    orderCount: 8,
    appliedTier: {
      id: "T001",
      orderCountMin: 1,
      orderCountMax: 10,
      percentageRate: 5,
      fixedAmount: 50,
      description: "Orders 1-10",
    },
    invoiceAmount: 500,
    commissionPercentage: 25,
    commissionFixed: 50,
    totalCommission: 75,
    currency: "USD",
    status: "paid",
    createdAt: "2024-01-08",
    paidAt: "2024-01-10",
  },
  {
    id: "CH003",
    staffId: "S003",
    invoiceId: "INV003",
    orderCount: 12,
    appliedTier: {
      id: "T002",
      orderCountMin: 11,
      orderCountMax: 20,
      percentageRate: 7,
      fixedAmount: 100,
      description: "Orders 11-20",
    },
    invoiceAmount: 2000,
    commissionPercentage: 140,
    commissionFixed: 100,
    totalCommission: 240,
    currency: "USD",
    status: "paid",
    createdAt: "2023-12-20",
    paidAt: "2023-12-22",
  },
  {
    id: "CH004",
    staffId: "S003",
    invoiceId: "INV004",
    orderCount: 15,
    appliedTier: {
      id: "T002",
      orderCountMin: 11,
      orderCountMax: 20,
      percentageRate: 7,
      fixedAmount: 100,
      description: "Orders 11-20",
    },
    invoiceAmount: 5500,
    commissionPercentage: 385,
    commissionFixed: 100,
    totalCommission: 485,
    currency: "USD",
    status: "paid",
    createdAt: "2023-11-15",
    paidAt: "2023-12-01",
  },
  {
    id: "CH005",
    staffId: "S006",
    invoiceId: "INV005",
    orderCount: 3,
    appliedTier: {
      id: "T008",
      orderCountMin: 1,
      orderCountMax: 10,
      percentageRate: 5,
      fixedAmount: 60,
      description: "Orders 1-10",
    },
    invoiceAmount: 1200,
    commissionPercentage: 60,
    commissionFixed: 60,
    totalCommission: 120,
    currency: "GBP",
    status: "paid",
    createdAt: "2024-01-07",
    paidAt: "2024-01-08",
  },
  {
    id: "CH006",
    staffId: "S006",
    invoiceId: "INV006",
    orderCount: 7,
    appliedTier: {
      id: "T008",
      orderCountMin: 1,
      orderCountMax: 10,
      percentageRate: 5,
      fixedAmount: 60,
      description: "Orders 1-10",
    },
    invoiceAmount: 3000,
    commissionPercentage: 150,
    commissionFixed: 60,
    totalCommission: 210,
    currency: "GBP",
    status: "pending",
    createdAt: "2024-01-02",
  },
  {
    id: "CH007",
    staffId: "S004",
    invoiceId: "INV007",
    orderCount: 9,
    appliedTier: {
      id: "T005",
      orderCountMin: 1,
      orderCountMax: 10,
      percentageRate: 4,
      fixedAmount: 40,
      description: "Orders 1-10",
    },
    invoiceAmount: 4500,
    commissionPercentage: 180,
    commissionFixed: 40,
    totalCommission: 220,
    currency: "EUR",
    status: "paid",
    createdAt: "2023-12-01",
    paidAt: "2023-12-15",
  },
  {
    id: "CH008",
    staffId: "S004",
    invoiceId: "INV008",
    orderCount: 11,
    appliedTier: {
      id: "T006",
      orderCountMin: 11,
      orderCountMax: 20,
      percentageRate: 6,
      fixedAmount: 80,
      description: "Orders 11-20",
    },
    invoiceAmount: 800,
    commissionPercentage: 48,
    commissionFixed: 80,
    totalCommission: 128,
    currency: "EUR",
    status: "pending",
    createdAt: "2023-12-05",
  },
  {
    id: "CH009",
    staffId: "S005",
    invoiceId: "INV009",
    orderCount: 4,
    appliedTier: {
      id: "T011",
      orderCountMin: 1,
      orderCountMax: 15,
      percentageRate: 4,
      fixedAmount: 45,
      description: "Orders 1-15",
    },
    invoiceAmount: 2200,
    commissionPercentage: 88,
    commissionFixed: 45,
    totalCommission: 133,
    currency: "EUR",
    status: "paid",
    createdAt: "2024-01-08",
    paidAt: "2024-01-09",
  },
];

// Staff Salary Configuration
export const mockStaffSalaries: StaffSalary[] = [
  {
    staffId: "S001",
    baseSalary: 6000,
    currency: "USD",
    underperformanceDeduction: 500,
    underperformanceThreshold: 60,
    rejectionFee: 75,
    totalRejectionFees: 0,
    lastSalaryDate: "2024-01-01",
    nextSalaryDate: "2024-02-01",
  },
  {
    staffId: "S002",
    baseSalary: 5500,
    currency: "USD",
    underperformanceDeduction: 450,
    underperformanceThreshold: 60,
    rejectionFee: 60,
    totalRejectionFees: 120,
    lastSalaryDate: "2024-01-01",
    nextSalaryDate: "2024-02-01",
  },
  {
    staffId: "S003",
    baseSalary: 4500,
    currency: "USD",
    underperformanceDeduction: 400,
    underperformanceThreshold: 60,
    rejectionFee: 50,
    totalRejectionFees: 50,
    lastSalaryDate: "2024-01-01",
    nextSalaryDate: "2024-02-01",
  },
  {
    staffId: "S004",
    baseSalary: 4200,
    currency: "EUR",
    underperformanceDeduction: 350,
    underperformanceThreshold: 60,
    rejectionFee: 45,
    totalRejectionFees: 0,
    lastSalaryDate: "2024-01-01",
    nextSalaryDate: "2024-02-01",
  },
  {
    staffId: "S005",
    baseSalary: 4200,
    currency: "EUR",
    underperformanceDeduction: 350,
    underperformanceThreshold: 60,
    rejectionFee: 45,
    totalRejectionFees: 90,
    lastSalaryDate: "2024-01-01",
    nextSalaryDate: "2024-02-01",
  },
  {
    staffId: "S006",
    baseSalary: 4500,
    currency: "GBP",
    underperformanceDeduction: 400,
    underperformanceThreshold: 60,
    rejectionFee: 50,
    totalRejectionFees: 100,
    lastSalaryDate: "2024-01-01",
    nextSalaryDate: "2024-02-01",
  },
  {
    staffId: "S007",
    baseSalary: 3800,
    currency: "USD",
    underperformanceDeduction: 300,
    underperformanceThreshold: 60,
    rejectionFee: 40,
    totalRejectionFees: 0,
    lastSalaryDate: "2024-01-01",
    nextSalaryDate: "2024-02-01",
  },
  {
    staffId: "S008",
    baseSalary: 5800,
    currency: "USD",
    underperformanceDeduction: 475,
    underperformanceThreshold: 60,
    rejectionFee: 65,
    totalRejectionFees: 0,
    lastSalaryDate: "2024-01-01",
    nextSalaryDate: "2024-02-01",
  },
];

// Staff Performance Scores
export const mockStaffPerformances: StaffPerformance[] = [
  {
    staffId: "S001",
    currentScore: 100,
    totalScore: 100,
    rejections: 0,
    earlyCompletions: 5,
    lastUpdated: "2024-01-08",
    performanceHistory: [
      {
        id: "P001",
        staffId: "S001",
        type: "early_completion",
        pointsChange: 10,
        description: "Completed order ORD-2024-001 before deadline",
        relatedOrderId: "O001",
        createdAt: "2024-01-06",
      },
      {
        id: "P002",
        staffId: "S001",
        type: "early_completion",
        pointsChange: 10,
        description: "Completed order ORD-2024-003 before deadline",
        relatedOrderId: "O003",
        createdAt: "2023-12-22",
      },
      {
        id: "P003",
        staffId: "S001",
        type: "early_completion",
        pointsChange: 10,
        description: "Completed order ORD-2024-004 before deadline",
        relatedOrderId: "O004",
        createdAt: "2023-12-01",
      },
      {
        id: "P004",
        staffId: "S001",
        type: "early_completion",
        pointsChange: 10,
        description: "Completed order ORD-2024-007 before deadline",
        relatedOrderId: "O007",
        createdAt: "2023-12-10",
      },
      {
        id: "P005",
        staffId: "S001",
        type: "early_completion",
        pointsChange: 10,
        description: "Completed order ORD-2024-014 before deadline",
        relatedOrderId: "O007",
        createdAt: "2024-01-02",
      },
    ],
  },
  {
    staffId: "S002",
    currentScore: 85,
    totalScore: 100,
    rejections: 1,
    earlyCompletions: 4,
    lastUpdated: "2024-01-08",
    performanceHistory: [
      {
        id: "P006",
        staffId: "S002",
        type: "early_completion",
        pointsChange: 10,
        description: "Completed order ORD-2024-002 before deadline",
        relatedOrderId: "O002",
        createdAt: "2024-01-08",
      },
      {
        id: "P007",
        staffId: "S002",
        type: "early_completion",
        pointsChange: 10,
        description: "Completed order before deadline",
        relatedOrderId: "O006",
        createdAt: "2024-01-05",
      },
      {
        id: "P008",
        staffId: "S002",
        type: "rejection",
        pointsChange: -10,
        description: "Review request rejected - Order incomplete documentation",
        relatedOrderId: "O005",
        createdAt: "2024-01-04",
      },
      {
        id: "P009",
        staffId: "S002",
        type: "early_completion",
        pointsChange: 10,
        description: "Completed order before deadline",
        relatedOrderId: "O003",
        createdAt: "2023-12-22",
      },
      {
        id: "P010",
        staffId: "S002",
        type: "early_completion",
        pointsChange: 10,
        description: "Completed order before deadline",
        relatedOrderId: "O004",
        createdAt: "2023-12-01",
      },
    ],
  },
  {
    staffId: "S003",
    currentScore: 75,
    totalScore: 100,
    rejections: 2,
    earlyCompletions: 3,
    lastUpdated: "2024-01-08",
    performanceHistory: [
      {
        id: "P011",
        staffId: "S003",
        type: "early_completion",
        pointsChange: 10,
        description: "Completed order ORD-2024-001 before deadline",
        relatedOrderId: "O001",
        createdAt: "2024-01-06",
      },
      {
        id: "P012",
        staffId: "S003",
        type: "early_completion",
        pointsChange: 10,
        description: "Completed order before deadline",
        relatedOrderId: "O002",
        createdAt: "2024-01-10",
      },
      {
        id: "P013",
        staffId: "S003",
        type: "rejection",
        pointsChange: -10,
        description: "Review request rejected - Missing compliance documents",
        relatedOrderId: "O005",
        createdAt: "2024-01-08",
      },
      {
        id: "P014",
        staffId: "S003",
        type: "rejection",
        pointsChange: -10,
        description: "Review request rejected - Incomplete service delivery",
        relatedOrderId: "O006",
        createdAt: "2024-01-03",
      },
      {
        id: "P015",
        staffId: "S003",
        type: "early_completion",
        pointsChange: 10,
        description: "Completed order ORD-2024-003 before deadline",
        relatedOrderId: "O003",
        createdAt: "2023-12-22",
      },
    ],
  },
  {
    staffId: "S004",
    currentScore: 70,
    totalScore: 100,
    rejections: 3,
    earlyCompletions: 2,
    lastUpdated: "2024-01-08",
    performanceHistory: [
      {
        id: "P016",
        staffId: "S004",
        type: "early_completion",
        pointsChange: 10,
        description: "Completed order before deadline",
        relatedOrderId: "O007",
        createdAt: "2023-12-10",
      },
      {
        id: "P017",
        staffId: "S004",
        type: "rejection",
        pointsChange: -10,
        description: "Review request rejected - Quality issues",
        relatedOrderId: "O006",
        createdAt: "2024-01-04",
      },
      {
        id: "P018",
        staffId: "S004",
        type: "rejection",
        pointsChange: -10,
        description: "Review request rejected - Late submission",
        relatedOrderId: "O005",
        createdAt: "2024-01-02",
      },
      {
        id: "P019",
        staffId: "S004",
        type: "early_completion",
        pointsChange: 10,
        description: "Completed order before deadline",
        relatedOrderId: "O002",
        createdAt: "2024-01-08",
      },
      {
        id: "P020",
        staffId: "S004",
        type: "rejection",
        pointsChange: -10,
        description: "Review request rejected - Incomplete requirements",
        relatedOrderId: "O001",
        createdAt: "2024-01-05",
      },
    ],
  },
  {
    staffId: "S005",
    currentScore: 80,
    totalScore: 100,
    rejections: 2,
    earlyCompletions: 3,
    lastUpdated: "2024-01-08",
    performanceHistory: [
      {
        id: "P021",
        staffId: "S005",
        type: "early_completion",
        pointsChange: 10,
        description: "Completed order ORD-2024-009 before deadline",
        relatedOrderId: "O002",
        createdAt: "2024-01-08",
      },
      {
        id: "P022",
        staffId: "S005",
        type: "rejection",
        pointsChange: -10,
        description: "Review request rejected - Missing files",
        relatedOrderId: "O005",
        createdAt: "2024-01-05",
      },
      {
        id: "P023",
        staffId: "S005",
        type: "early_completion",
        pointsChange: 10,
        description: "Completed order before deadline",
        relatedOrderId: "O006",
        createdAt: "2024-01-03",
      },
      {
        id: "P024",
        staffId: "S005",
        type: "rejection",
        pointsChange: -10,
        description: "Review request rejected - Format issues",
        relatedOrderId: "O004",
        createdAt: "2024-01-01",
      },
      {
        id: "P025",
        staffId: "S005",
        type: "early_completion",
        pointsChange: 10,
        description: "Completed order before deadline",
        relatedOrderId: "O003",
        createdAt: "2023-12-22",
      },
    ],
  },
  {
    staffId: "S006",
    currentScore: 90,
    totalScore: 100,
    rejections: 1,
    earlyCompletions: 4,
    lastUpdated: "2024-01-08",
    performanceHistory: [
      {
        id: "P026",
        staffId: "S006",
        type: "early_completion",
        pointsChange: 10,
        description: "Completed order ORD-2024-005 before deadline",
        relatedOrderId: "O001",
        createdAt: "2024-01-06",
      },
      {
        id: "P027",
        staffId: "S006",
        type: "early_completion",
        pointsChange: 10,
        description: "Completed order before deadline",
        relatedOrderId: "O002",
        createdAt: "2024-01-08",
      },
      {
        id: "P028",
        staffId: "S006",
        type: "rejection",
        pointsChange: -10,
        description: "Review request rejected - Minor corrections needed",
        relatedOrderId: "O006",
        createdAt: "2024-01-03",
      },
      {
        id: "P029",
        staffId: "S006",
        type: "early_completion",
        pointsChange: 10,
        description: "Completed order before deadline",
        relatedOrderId: "O003",
        createdAt: "2023-12-22",
      },
      {
        id: "P030",
        staffId: "S006",
        type: "early_completion",
        pointsChange: 10,
        description: "Completed order before deadline",
        relatedOrderId: "O007",
        createdAt: "2023-12-10",
      },
    ],
  },
  {
    staffId: "S007",
    currentScore: 95,
    totalScore: 100,
    rejections: 0,
    earlyCompletions: 4,
    lastUpdated: "2024-01-08",
    performanceHistory: [
      {
        id: "P031",
        staffId: "S007",
        type: "early_completion",
        pointsChange: 10,
        description: "Completed order before deadline",
        relatedOrderId: "O001",
        createdAt: "2024-01-06",
      },
      {
        id: "P032",
        staffId: "S007",
        type: "early_completion",
        pointsChange: 10,
        description: "Completed order before deadline",
        relatedOrderId: "O002",
        createdAt: "2024-01-08",
      },
      {
        id: "P033",
        staffId: "S007",
        type: "early_completion",
        pointsChange: 10,
        description: "Completed order before deadline",
        relatedOrderId: "O003",
        createdAt: "2023-12-22",
      },
      {
        id: "P034",
        staffId: "S007",
        type: "early_completion",
        pointsChange: 10,
        description: "Completed order before deadline",
        relatedOrderId: "O007",
        createdAt: "2023-12-10",
      },
    ],
  },
  {
    staffId: "S008",
    currentScore: 88,
    totalScore: 100,
    rejections: 1,
    earlyCompletions: 3,
    lastUpdated: "2024-01-08",
    performanceHistory: [
      {
        id: "P035",
        staffId: "S008",
        type: "early_completion",
        pointsChange: 10,
        description: "Completed order before deadline",
        relatedOrderId: "O001",
        createdAt: "2024-01-06",
      },
      {
        id: "P036",
        staffId: "S008",
        type: "early_completion",
        pointsChange: 10,
        description: "Completed order before deadline",
        relatedOrderId: "O002",
        createdAt: "2024-01-08",
      },
      {
        id: "P037",
        staffId: "S008",
        type: "rejection",
        pointsChange: -10,
        description: "Review request rejected - Needs revision",
        relatedOrderId: "O005",
        createdAt: "2024-01-04",
      },
      {
        id: "P038",
        staffId: "S008",
        type: "early_completion",
        pointsChange: 10,
        description: "Completed order before deadline",
        relatedOrderId: "O003",
        createdAt: "2023-12-22",
      },
    ],
  },
];

// Monthly Performance Reports
export const mockMonthlyPerformanceReports: MonthlyPerformanceReport[] = [
  // S001 Reports
  {
    id: "MR001",
    staffId: "S001",
    month: 9,
    year: 2023,
    totalScore: 95,
    earlyCompletions: 8,
    rejections: 0,
    scoreTrend: 5,
    performanceStatus: "excellent",
    salaryImpact: false,
    deductionAmount: 0,
  },
  {
    id: "MR002",
    staffId: "S001",
    month: 10,
    year: 2023,
    totalScore: 100,
    earlyCompletions: 10,
    rejections: 0,
    scoreTrend: 5,
    performanceStatus: "excellent",
    salaryImpact: false,
    deductionAmount: 0,
  },
  {
    id: "MR003",
    staffId: "S001",
    month: 11,
    year: 2023,
    totalScore: 100,
    earlyCompletions: 9,
    rejections: 0,
    scoreTrend: 0,
    performanceStatus: "excellent",
    salaryImpact: false,
    deductionAmount: 0,
  },
  {
    id: "MR004",
    staffId: "S001",
    month: 12,
    year: 2023,
    totalScore: 100,
    earlyCompletions: 10,
    rejections: 0,
    scoreTrend: 0,
    performanceStatus: "excellent",
    salaryImpact: false,
    deductionAmount: 0,
  },
  {
    id: "MR005",
    staffId: "S001",
    month: 1,
    year: 2024,
    totalScore: 100,
    earlyCompletions: 9,
    rejections: 0,
    scoreTrend: 0,
    performanceStatus: "excellent",
    salaryImpact: false,
    deductionAmount: 0,
  },

  // S002 Reports
  {
    id: "MR006",
    staffId: "S002",
    month: 9,
    year: 2023,
    totalScore: 80,
    earlyCompletions: 5,
    rejections: 2,
    scoreTrend: 0,
    performanceStatus: "good",
    salaryImpact: false,
    deductionAmount: 0,
  },
  {
    id: "MR007",
    staffId: "S002",
    month: 10,
    year: 2023,
    totalScore: 85,
    earlyCompletions: 6,
    rejections: 1,
    scoreTrend: 5,
    performanceStatus: "good",
    salaryImpact: false,
    deductionAmount: 0,
  },
  {
    id: "MR008",
    staffId: "S002",
    month: 11,
    year: 2023,
    totalScore: 80,
    earlyCompletions: 4,
    rejections: 2,
    scoreTrend: -5,
    performanceStatus: "good",
    salaryImpact: false,
    deductionAmount: 0,
  },
  {
    id: "MR009",
    staffId: "S002",
    month: 12,
    year: 2023,
    totalScore: 90,
    earlyCompletions: 7,
    rejections: 1,
    scoreTrend: 10,
    performanceStatus: "excellent",
    salaryImpact: false,
    deductionAmount: 0,
  },
  {
    id: "MR010",
    staffId: "S002",
    month: 1,
    year: 2024,
    totalScore: 85,
    earlyCompletions: 5,
    rejections: 1,
    scoreTrend: -5,
    performanceStatus: "good",
    salaryImpact: false,
    deductionAmount: 0,
  },

  // S003 Reports
  {
    id: "MR011",
    staffId: "S003",
    month: 9,
    year: 2023,
    totalScore: 70,
    earlyCompletions: 4,
    rejections: 3,
    scoreTrend: 0,
    performanceStatus: "fair",
    salaryImpact: false,
    deductionAmount: 0,
  },
  {
    id: "MR012",
    staffId: "S003",
    month: 10,
    year: 2023,
    totalScore: 75,
    earlyCompletions: 5,
    rejections: 2,
    scoreTrend: 5,
    performanceStatus: "good",
    salaryImpact: false,
    deductionAmount: 0,
  },
  {
    id: "MR013",
    staffId: "S003",
    month: 11,
    year: 2023,
    totalScore: 65,
    earlyCompletions: 3,
    rejections: 3,
    scoreTrend: -10,
    performanceStatus: "fair",
    salaryImpact: true,
    deductionAmount: 400,
  },
  {
    id: "MR014",
    staffId: "S003",
    month: 12,
    year: 2023,
    totalScore: 75,
    earlyCompletions: 4,
    rejections: 2,
    scoreTrend: 10,
    performanceStatus: "good",
    salaryImpact: false,
    deductionAmount: 0,
  },
  {
    id: "MR015",
    staffId: "S003",
    month: 1,
    year: 2024,
    totalScore: 75,
    earlyCompletions: 3,
    rejections: 2,
    scoreTrend: 0,
    performanceStatus: "good",
    salaryImpact: false,
    deductionAmount: 0,
  },

  // S004 Reports
  {
    id: "MR016",
    staffId: "S004",
    month: 9,
    year: 2023,
    totalScore: 55,
    earlyCompletions: 2,
    rejections: 4,
    scoreTrend: 0,
    performanceStatus: "poor",
    salaryImpact: true,
    deductionAmount: 350,
  },
  {
    id: "MR017",
    staffId: "S004",
    month: 10,
    year: 2023,
    totalScore: 65,
    earlyCompletions: 3,
    rejections: 3,
    scoreTrend: 10,
    performanceStatus: "fair",
    salaryImpact: true,
    deductionAmount: 350,
  },
  {
    id: "MR018",
    staffId: "S004",
    month: 11,
    year: 2023,
    totalScore: 70,
    earlyCompletions: 4,
    rejections: 3,
    scoreTrend: 5,
    performanceStatus: "fair",
    salaryImpact: false,
    deductionAmount: 0,
  },
  {
    id: "MR019",
    staffId: "S004",
    month: 12,
    year: 2023,
    totalScore: 75,
    earlyCompletions: 3,
    rejections: 2,
    scoreTrend: 5,
    performanceStatus: "good",
    salaryImpact: false,
    deductionAmount: 0,
  },
  {
    id: "MR020",
    staffId: "S004",
    month: 1,
    year: 2024,
    totalScore: 70,
    earlyCompletions: 2,
    rejections: 3,
    scoreTrend: -5,
    performanceStatus: "fair",
    salaryImpact: false,
    deductionAmount: 0,
  },

  // S005 Reports
  {
    id: "MR021",
    staffId: "S005",
    month: 9,
    year: 2023,
    totalScore: 80,
    earlyCompletions: 5,
    rejections: 2,
    scoreTrend: 0,
    performanceStatus: "good",
    salaryImpact: false,
    deductionAmount: 0,
  },
  {
    id: "MR022",
    staffId: "S005",
    month: 10,
    year: 2023,
    totalScore: 85,
    earlyCompletions: 6,
    rejections: 1,
    scoreTrend: 5,
    performanceStatus: "good",
    salaryImpact: false,
    deductionAmount: 0,
  },
  {
    id: "MR023",
    staffId: "S005",
    month: 11,
    year: 2023,
    totalScore: 80,
    earlyCompletions: 4,
    rejections: 2,
    scoreTrend: -5,
    performanceStatus: "good",
    salaryImpact: false,
    deductionAmount: 0,
  },
  {
    id: "MR024",
    staffId: "S005",
    month: 12,
    year: 2023,
    totalScore: 90,
    earlyCompletions: 7,
    rejections: 1,
    scoreTrend: 10,
    performanceStatus: "excellent",
    salaryImpact: false,
    deductionAmount: 0,
  },
  {
    id: "MR025",
    staffId: "S005",
    month: 1,
    year: 2024,
    totalScore: 80,
    earlyCompletions: 4,
    rejections: 2,
    scoreTrend: -10,
    performanceStatus: "good",
    salaryImpact: false,
    deductionAmount: 0,
  },

  // S006 Reports
  {
    id: "MR026",
    staffId: "S006",
    month: 9,
    year: 2023,
    totalScore: 90,
    earlyCompletions: 8,
    rejections: 1,
    scoreTrend: 0,
    performanceStatus: "excellent",
    salaryImpact: false,
    deductionAmount: 0,
  },
  {
    id: "MR027",
    staffId: "S006",
    month: 10,
    year: 2023,
    totalScore: 95,
    earlyCompletions: 9,
    rejections: 0,
    scoreTrend: 5,
    performanceStatus: "excellent",
    salaryImpact: false,
    deductionAmount: 0,
  },
  {
    id: "MR028",
    staffId: "S006",
    month: 11,
    year: 2023,
    totalScore: 85,
    earlyCompletions: 6,
    rejections: 1,
    scoreTrend: -10,
    performanceStatus: "good",
    salaryImpact: false,
    deductionAmount: 0,
  },
  {
    id: "MR029",
    staffId: "S006",
    month: 12,
    year: 2023,
    totalScore: 90,
    earlyCompletions: 8,
    rejections: 1,
    scoreTrend: 5,
    performanceStatus: "excellent",
    salaryImpact: false,
    deductionAmount: 0,
  },
  {
    id: "MR030",
    staffId: "S006",
    month: 1,
    year: 2024,
    totalScore: 90,
    earlyCompletions: 7,
    rejections: 1,
    scoreTrend: 0,
    performanceStatus: "excellent",
    salaryImpact: false,
    deductionAmount: 0,
  },

  // S007 Reports
  {
    id: "MR031",
    staffId: "S007",
    month: 9,
    year: 2023,
    totalScore: 100,
    earlyCompletions: 10,
    rejections: 0,
    scoreTrend: 0,
    performanceStatus: "excellent",
    salaryImpact: false,
    deductionAmount: 0,
  },
  {
    id: "MR032",
    staffId: "S007",
    month: 10,
    year: 2023,
    totalScore: 100,
    earlyCompletions: 9,
    rejections: 0,
    scoreTrend: 0,
    performanceStatus: "excellent",
    salaryImpact: false,
    deductionAmount: 0,
  },
  {
    id: "MR033",
    staffId: "S007",
    month: 11,
    year: 2023,
    totalScore: 95,
    earlyCompletions: 8,
    rejections: 0,
    scoreTrend: -5,
    performanceStatus: "excellent",
    salaryImpact: false,
    deductionAmount: 0,
  },
  {
    id: "MR034",
    staffId: "S007",
    month: 12,
    year: 2023,
    totalScore: 100,
    earlyCompletions: 10,
    rejections: 0,
    scoreTrend: 5,
    performanceStatus: "excellent",
    salaryImpact: false,
    deductionAmount: 0,
  },
  {
    id: "MR035",
    staffId: "S007",
    month: 1,
    year: 2024,
    totalScore: 95,
    earlyCompletions: 8,
    rejections: 0,
    scoreTrend: -5,
    performanceStatus: "excellent",
    salaryImpact: false,
    deductionAmount: 0,
  },

  // S008 Reports
  {
    id: "MR036",
    staffId: "S008",
    month: 9,
    year: 2023,
    totalScore: 85,
    earlyCompletions: 6,
    rejections: 1,
    scoreTrend: 0,
    performanceStatus: "good",
    salaryImpact: false,
    deductionAmount: 0,
  },
  {
    id: "MR037",
    staffId: "S008",
    month: 10,
    year: 2023,
    totalScore: 90,
    earlyCompletions: 7,
    rejections: 1,
    scoreTrend: 5,
    performanceStatus: "excellent",
    salaryImpact: false,
    deductionAmount: 0,
  },
  {
    id: "MR038",
    staffId: "S008",
    month: 11,
    year: 2023,
    totalScore: 88,
    earlyCompletions: 6,
    rejections: 1,
    scoreTrend: -2,
    performanceStatus: "excellent",
    salaryImpact: false,
    deductionAmount: 0,
  },
  {
    id: "MR039",
    staffId: "S008",
    month: 12,
    year: 2023,
    totalScore: 92,
    earlyCompletions: 8,
    rejections: 0,
    scoreTrend: 4,
    performanceStatus: "excellent",
    salaryImpact: false,
    deductionAmount: 0,
  },
  {
    id: "MR040",
    staffId: "S008",
    month: 1,
    year: 2024,
    totalScore: 88,
    earlyCompletions: 6,
    rejections: 1,
    scoreTrend: -4,
    performanceStatus: "excellent",
    salaryImpact: false,
    deductionAmount: 0,
  },
];

// Staff Bonus Records
export const mockStaffBonuses: StaffBonus[] = [
  {
    id: "B001",
    staffId: "S001",
    month: 12,
    year: 2023,
    performanceScore: 95,
    bonusAmount: 500,
    bonusTier: "gold",
    currency: "USD",
    status: "paid",
    awardedAt: "2023-12-31",
    paidAt: "2024-01-05",
    notes: "Excellent performance in December 2023",
  },
  {
    id: "B002",
    staffId: "S002",
    month: 12,
    year: 2023,
    performanceScore: 88,
    bonusAmount: 100,
    bonusTier: "bronze",
    currency: "USD",
    status: "paid",
    awardedAt: "2023-12-31",
    paidAt: "2024-01-05",
    notes: "Good performance in December 2023",
  },
  {
    id: "B003",
    staffId: "S003",
    month: 12,
    year: 2023,
    performanceScore: 92,
    bonusAmount: 250,
    bonusTier: "silver",
    currency: "USD",
    status: "paid",
    awardedAt: "2023-12-31",
    paidAt: "2024-01-05",
    notes: "Strong performance in December 2023",
  },
  {
    id: "B004",
    staffId: "S004",
    month: 12,
    year: 2023,
    performanceScore: 78,
    bonusAmount: 0,
    bonusTier: "none",
    currency: "EUR",
    status: "earned",
    awardedAt: "2023-12-31",
    notes: "Below threshold, no bonus awarded",
  },
  {
    id: "B005",
    staffId: "S005",
    month: 12,
    year: 2023,
    performanceScore: 85,
    bonusAmount: 100,
    bonusTier: "bronze",
    currency: "EUR",
    status: "paid",
    awardedAt: "2023-12-31",
    paidAt: "2024-01-05",
    notes: "Meets minimum threshold with bronze bonus",
  },
  {
    id: "B006",
    staffId: "S006",
    month: 12,
    year: 2023,
    performanceScore: 90,
    bonusAmount: 250,
    bonusTier: "silver",
    currency: "GBP",
    status: "paid",
    awardedAt: "2023-12-31",
    paidAt: "2024-01-05",
    notes: "Very good performance in December 2023",
  },
  {
    id: "B007",
    staffId: "S007",
    month: 12,
    year: 2023,
    performanceScore: 82,
    bonusAmount: 0,
    bonusTier: "none",
    currency: "USD",
    status: "earned",
    awardedAt: "2023-12-31",
    notes: "Below threshold, no bonus awarded",
  },
  {
    id: "B008",
    staffId: "S008",
    month: 12,
    year: 2023,
    performanceScore: 98,
    bonusAmount: 500,
    bonusTier: "gold",
    currency: "USD",
    status: "paid",
    awardedAt: "2023-12-31",
    paidAt: "2024-01-05",
    notes: "Exceptional performance in December 2023",
  },
  {
    id: "B009",
    staffId: "S001",
    month: 1,
    year: 2024,
    performanceScore: 96,
    bonusAmount: 500,
    bonusTier: "gold",
    currency: "USD",
    status: "earned",
    awardedAt: "2024-01-31",
    notes: "Current month bonus - earned but not yet paid",
  },
  {
    id: "B010",
    staffId: "S002",
    month: 1,
    year: 2024,
    performanceScore: 91,
    bonusAmount: 250,
    bonusTier: "silver",
    currency: "USD",
    status: "earned",
    awardedAt: "2024-01-31",
    notes: "Current month bonus - earned but not yet paid",
  },
  {
    id: "B011",
    staffId: "S003",
    month: 1,
    year: 2024,
    performanceScore: 87,
    bonusAmount: 100,
    bonusTier: "bronze",
    currency: "USD",
    status: "earned",
    awardedAt: "2024-01-31",
    notes: "Current month bonus - earned but not yet paid",
  },
  {
    id: "B012",
    staffId: "S006",
    month: 1,
    year: 2024,
    performanceScore: 93,
    bonusAmount: 250,
    bonusTier: "silver",
    currency: "GBP",
    status: "earned",
    awardedAt: "2024-01-31",
    notes: "Current month bonus - earned but not yet paid",
  },
];

export const mockCompaniesForSale: CompanyForSale[] = [
  {
    id: "CFS001",
    companyName: "TechVenture Solutions Ltd",
    companyNumber: "14234567",
    country: "United Kingdom",
    incorporationDate: "2015-03-15",
    nextConfirmationDate: "2025-03-15",
    firstAccountsMadeUpTo: "2016-03-15",
    authCode: "AUTH001TVS",
    registrationStatus: "active",
    businessType: "Software Development",
    askingPrice: 150000,
    currency: "GBP",
    contact: "John Smith",
    contactEmail: "john@techventure.co.uk",
    contactPhone: "+44 20 7946 0958",
    description:
      "Established software development company with a strong client base. Annual revenue £500k. Looking for strategic acquisition.",
    listedAt: "2024-01-10",
    views: 245,
    inquiries: 12,
  },
  {
    id: "CFS002",
    companyName: "Digital Marketing Pro Ltd",
    companyNumber: "13456789",
    country: "United Kingdom",
    incorporationDate: "2018-07-22",
    nextConfirmationDate: "2025-07-22",
    firstAccountsMadeUpTo: "2019-07-22",
    authCode: "AUTH002DMP",
    registrationStatus: "active",
    businessType: "Digital Marketing",
    askingPrice: 85000,
    currency: "GBP",
    contact: "Sarah Johnson",
    contactEmail: "sarah@digitalmarketingpro.uk",
    contactPhone: "+44 121 456 7890",
    description:
      "Digital marketing agency with expertise in SEO and social media. Profitable with recurring clients. Ready for expansion.",
    listedAt: "2024-01-05",
    views: 178,
    inquiries: 8,
  },
  {
    id: "CFS003",
    companyName: "Green Energy Systems Ltd",
    companyNumber: "12345678",
    country: "United Kingdom",
    incorporationDate: "2019-11-08",
    nextConfirmationDate: "2025-11-08",
    firstAccountsMadeUpTo: "2020-11-08",
    authCode: "AUTH003GES",
    registrationStatus: "active",
    businessType: "Renewable Energy",
    askingPrice: 250000,
    currency: "GBP",
    contact: "Michael Chen",
    contactEmail: "michael@greenenergysys.co.uk",
    contactPhone: "+44 161 234 5678",
    description:
      "Renewable energy consulting firm. Strong government contracts. Annual turnover £800k. Seeking investor partnership.",
    listedAt: "2024-01-15",
    views: 312,
    inquiries: 19,
  },
  {
    id: "CFS004",
    companyName: "E-Commerce Retail Ltd",
    companyNumber: "13789456",
    country: "United Kingdom",
    incorporationDate: "2017-05-30",
    nextConfirmationDate: "2025-05-30",
    firstAccountsMadeUpTo: "2018-05-30",
    authCode: "AUTH004ECR",
    registrationStatus: "active",
    businessType: "E-Commerce",
    askingPrice: 120000,
    currency: "GBP",
    contact: "Emma Wilson",
    contactEmail: "emma@ecomretail.co.uk",
    contactPhone: "+44 113 276 6789",
    description:
      "Established online retail business with 50k monthly visitors. Multiple product lines. Good profit margins.",
    listedAt: "2024-01-08",
    views: 201,
    inquiries: 15,
  },
  {
    id: "CFS005",
    companyName: "Business Consulting Group Ltd",
    companyNumber: "14567890",
    country: "United Kingdom",
    incorporationDate: "2020-02-14",
    nextConfirmationDate: "2025-02-14",
    firstAccountsMadeUpTo: "2021-02-14",
    authCode: "AUTH005BCG",
    registrationStatus: "active",
    businessType: "Consulting",
    askingPrice: 95000,
    currency: "GBP",
    contact: "David Thompson",
    contactEmail: "david@bcgroupltd.co.uk",
    contactPhone: "+44 20 3456 7890",
    description:
      "Management consulting firm specializing in business transformation. Blue-chip clients. High margins.",
    listedAt: "2024-01-12",
    views: 156,
    inquiries: 10,
  },
  {
    id: "CFS006",
    companyName: "Health Tech Innovations Ltd",
    companyNumber: "14890123",
    country: "United Kingdom",
    incorporationDate: "2021-09-20",
    nextConfirmationDate: "2025-09-20",
    firstAccountsMadeUpTo: "2022-09-20",
    authCode: "AUTH006HTI",
    registrationStatus: "active",
    businessType: "Healthcare Technology",
    askingPrice: 300000,
    currency: "GBP",
    contact: "Dr. Lisa Anderson",
    contactEmail: "lisa@healthtech.co.uk",
    contactPhone: "+44 131 456 7890",
    description:
      "Healthcare technology startup with innovative medical software. Patent pending. Looking for venture capital.",
    listedAt: "2024-01-18",
    views: 289,
    inquiries: 22,
  },
  {
    id: "CFS007",
    companyName: "Property Management Services Ltd",
    companyNumber: "13234567",
    country: "United Kingdom",
    incorporationDate: "2016-04-11",
    nextConfirmationDate: "2025-04-11",
    firstAccountsMadeUpTo: "2017-04-11",
    authCode: "AUTH007PMS",
    registrationStatus: "active",
    businessType: "Property Management",
    askingPrice: 110000,
    currency: "GBP",
    contact: "Robert Cooper",
    contactEmail: "robert@propmanagement.co.uk",
    contactPhone: "+44 20 7234 5678",
    description:
      "Property management company managing 150+ residential units. Stable rental income. Professional team in place.",
    listedAt: "2024-01-06",
    views: 167,
    inquiries: 7,
  },
  {
    id: "CFS008",
    companyName: "StartUp Tech Innovations Inc",
    companyNumber: "45678901",
    country: "United States",
    incorporationDate: "2018-05-12",
    registrationStatus: "active",
    businessType: "Software Development",
    askingPrice: 250000,
    currency: "USD",
    contact: "James Mitchell",
    contactEmail: "james@startuptechinc.com",
    contactPhone: "+1 415 234 5678",
    description:
      "San Francisco-based software startup with cutting-edge AI technology. Series A ready. Annual revenue $800k.",
    listedAt: "2024-01-14",
    views: 425,
    inquiries: 28,
  },
  {
    id: "CFS009",
    companyName: "East Coast Logistics LLC",
    companyNumber: "56789012",
    country: "United States",
    incorporationDate: "2015-09-20",
    registrationStatus: "active",
    businessType: "Logistics & Transportation",
    askingPrice: 180000,
    currency: "USD",
    contact: "Patricia Brown",
    contactEmail: "patricia@eastcoastlogistics.com",
    contactPhone: "+1 212 345 6789",
    description:
      "Major logistics company with fleet of 50+ vehicles. Contracts with Fortune 500 companies. Strong cash flow.",
    listedAt: "2024-01-09",
    views: 312,
    inquiries: 16,
  },
  {
    id: "CFS010",
    companyName: "Digital Media Group USA",
    companyNumber: "67890123",
    country: "United States",
    incorporationDate: "2019-03-15",
    registrationStatus: "active",
    businessType: "Digital Marketing & Media",
    askingPrice: 220000,
    currency: "USD",
    contact: "Michael Torres",
    contactEmail: "michael@digitalmediagroup.us",
    contactPhone: "+1 305 678 9012",
    description:
      "Creative digital agency with 25+ team members. Serves tech and retail sectors. Annual turnover $1.2M.",
    listedAt: "2024-01-11",
    views: 278,
    inquiries: 19,
  },
  {
    id: "CFS011",
    companyName: "Green Energy Solutions Sweden AB",
    companyNumber: "123456789",
    country: "Sweden",
    incorporationDate: "2016-07-18",
    registrationStatus: "active",
    businessType: "Renewable Energy",
    askingPrice: 320000,
    currency: "EUR",
    contact: "Erik Nordström",
    contactEmail: "erik@greenenergyswedenab.se",
    contactPhone: "+46 8 234 5678",
    description:
      "Stockholm-based renewable energy company. Major wind power projects. Government contracts. Growing portfolio.",
    listedAt: "2024-01-13",
    views: 356,
    inquiries: 24,
  },
  {
    id: "CFS012",
    companyName: "Nordic Tech Solutions AB",
    companyNumber: "987654321",
    country: "Sweden",
    incorporationDate: "2017-11-22",
    registrationStatus: "active",
    businessType: "Software Development",
    askingPrice: 280000,
    currency: "EUR",
    contact: "Anna Bergström",
    contactEmail: "anna@nordictechsolutions.se",
    contactPhone: "+46 31 456 7890",
    description:
      "Gothenburg-based software firm specializing in enterprise solutions. 15 employees. Annual revenue 4M SEK.",
    listedAt: "2024-01-16",
    views: 289,
    inquiries: 18,
  },
  {
    id: "CFS013",
    companyName: "Swedish Consulting Group AB",
    companyNumber: "555666777",
    country: "Sweden",
    incorporationDate: "2014-02-10",
    registrationStatus: "active",
    businessType: "Management Consulting",
    askingPrice: 190000,
    currency: "EUR",
    contact: "Johan Lindström",
    contactEmail: "johan@swedishconsultingab.se",
    contactPhone: "+46 8 567 8901",
    description:
      "Executive consulting firm serving Nordic region. Offices in Stockholm and Malmö. Strong client retention.",
    listedAt: "2024-01-07",
    views: 234,
    inquiries: 12,
  },
];

export const mockRegisteredCompanies: RegisteredCompany[] = [
  {
    id: "REG001",
    orderId: "O001",
    userId: "1",
    companyNumber: "14567890",
    companyName: "Acme Corporation UK Ltd",
    country: "United Kingdom",
    incorporationDate: "2020-05-15",
    nextRenewalDate: "2025-02-08",
    nextAccountsFilingDate: "2025-02-10",
    authCode: "AUTH001-ACM-2024",
    registeredOffice: "123 Business Street, London, UK",
    sicCodes: ["62010", "62020"],
    status: "active",
    fetchedAt: "2024-01-15T10:30:00Z",
    incorporationId: "INC001",
  },
  {
    id: "REG002",
    orderId: "O002",
    userId: "2",
    companyNumber: "15678901",
    companyName: "Tech Solutions Ltd",
    country: "United Kingdom",
    incorporationDate: "2019-08-22",
    nextRenewalDate: "2025-02-05",
    nextAccountsFilingDate: "2025-02-12",
    authCode: "AUTH002-TSL-2024",
    registeredOffice: "456 Innovation Avenue, Manchester, UK",
    sicCodes: ["62010"],
    status: "active",
    fetchedAt: "2024-01-14T14:20:00Z",
    incorporationId: "INC001",
  },
  {
    id: "REG003",
    orderId: "O003",
    userId: "3",
    companyNumber: "16789012",
    companyName: "Global Trade Partners LLC",
    country: "United States",
    incorporationDate: "2021-03-10",
    nextRenewalDate: "2025-02-10",
    nextAccountsFilingDate: "2025-02-15",
    authCode: "AUTH003-GTP-2024",
    registeredOffice: "789 Commerce Drive, New York, NY 10001",
    sicCodes: ["5411", "5412"],
    status: "active",
    fetchedAt: "2024-01-13T09:15:00Z",
  },
  {
    id: "REG004",
    orderId: "O004",
    userId: "4",
    companyNumber: "17890123",
    companyName: "Nordic Innovation AB",
    country: "Sweden",
    incorporationDate: "2020-11-05",
    nextRenewalDate: "2025-02-06",
    nextAccountsFilingDate: "2025-02-11",
    authCode: "AUTH004-NIA-2024",
    registeredOffice: "Strandvägen 58, Stockholm, Sweden",
    sicCodes: ["6201", "6202"],
    status: "active",
    fetchedAt: "2024-01-12T11:45:00Z",
  },
  {
    id: "REG005",
    orderId: "O005",
    userId: "1",
    companyNumber: "18901234",
    companyName: "Prime Consulting Ltd",
    country: "United Kingdom",
    incorporationDate: "2018-12-01",
    nextRenewalDate: "2025-02-04",
    nextAccountsFilingDate: "2025-02-09",
    authCode: "AUTH005-PCL-2024",
    registeredOffice: "321 Professional Plaza, Bristol, UK",
    sicCodes: ["7020"],
    status: "active",
    fetchedAt: "2024-01-11T16:30:00Z",
  },
  {
    id: "REG006",
    orderId: "O006",
    userId: "2",
    companyNumber: "19012345",
    companyName: "Digital Ventures Inc",
    country: "United States",
    incorporationDate: "2022-02-14",
    nextRenewalDate: "2025-02-09",
    nextAccountsFilingDate: "2025-02-14",
    authCode: "AUTH006-DVI-2024",
    registeredOffice: "555 Market Street, San Francisco, CA 94102",
    sicCodes: ["5112", "6201"],
    status: "active",
    fetchedAt: "2024-01-10T13:20:00Z",
  },
  {
    id: "REG007",
    orderId: "O007",
    userId: "3",
    companyNumber: "1234567890",
    companyName: "Maple Technologies Ltd",
    country: "Canada",
    incorporationDate: "2019-06-10",
    nextRenewalDate: "2025-02-03",
    nextAccountsFilingDate: "2025-02-08",
    authCode: "AUTH007-MTL-2024",
    registeredOffice: "456 Bay Street, Toronto, ON M5J 2S1",
    sicCodes: ["6201", "6202"],
    status: "active",
    fetchedAt: "2024-01-09T10:15:00Z",
  },
  {
    id: "REG008",
    orderId: "O008",
    userId: "4",
    companyNumber: "0987654321",
    companyName: "Northern Resources Inc",
    country: "Canada",
    incorporationDate: "2020-03-25",
    nextRenewalDate: "2025-02-07",
    nextAccountsFilingDate: "2025-02-13",
    authCode: "AUTH008-NRI-2024",
    registeredOffice: "789 Main Street, Vancouver, BC V6B 2S1",
    sicCodes: ["5112", "6201"],
    status: "active",
    fetchedAt: "2024-01-08T14:45:00Z",
  },
];
