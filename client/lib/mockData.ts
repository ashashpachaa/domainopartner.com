export type UserStatus = "pending" | "active" | "suspended" | "inactive";
export type StaffRole = "super_admin" | "admin" | "operation_manager" | "operation" | "sales" | "accounting";

export interface Permission {
  id: string;
  name: string;
  description: string;
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
  services: {
    hasApostille: boolean;
    hasShipping: boolean;
    hasPOA: boolean;
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
  | "shipping_preparation"
  | "completed";

export type OrderActionType = "accept" | "reject" | "edit" | "resubmit" | "system_transition";

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
  createdAt: string;
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
  assignedToSalesId?: string;
  assignedToOperationId?: string;
  assignedToManagerId?: string;
  history: OrderHistory[];
  rejectionReasons: string[];
  clientAccepted?: boolean;
  clientAcceptedAt?: string;
  shippingNumber?: string;
  documentsUploaded?: boolean;
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
  description: string;
  items: { description: string; quantity: number; unitPrice: number }[];
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
    requirements: "Shareholder information, Directors details, Company name, Registered office address",
    services: { hasApostille: false, hasShipping: false, hasPOA: false },
    createdAt: "2024-01-01",
    status: "active",
  },
  {
    id: "P002",
    name: "USA New Company Only",
    description: "Formation of a new company in the United States",
    duration: "7-10 business days",
    requirements: "Registered agent, Registered office, Shareholder/Member information",
    services: { hasApostille: false, hasShipping: false, hasPOA: false },
    createdAt: "2024-01-01",
    status: "active",
  },
  {
    id: "P003",
    name: "Canada New Company Only",
    description: "Formation of a new company in Canada",
    duration: "5-7 business days",
    requirements: "Directors details, Registered office address, Articles of incorporation",
    services: { hasApostille: false, hasShipping: false, hasPOA: false },
    createdAt: "2024-01-01",
    status: "active",
  },
  {
    id: "P004",
    name: "Sweden New Company Only",
    description: "Formation of a new company in Sweden",
    duration: "3-5 business days",
    requirements: "Board member information, Registered office, Share capital details",
    services: { hasApostille: false, hasShipping: false, hasPOA: false },
    createdAt: "2024-01-01",
    status: "active",
  },
  {
    id: "P005",
    name: "UK Acquisitions Package",
    description: "Complete acquisition package including apostille, POA and shipping documents",
    duration: "10-14 business days",
    requirements: "Company details, Buyer/Seller information, Legal documentation",
    services: { hasApostille: true, hasShipping: true, hasPOA: true },
    createdAt: "2024-01-01",
    status: "active",
  },
  {
    id: "P006",
    name: "Sweden Acquisitions Package",
    description: "Complete acquisition package with apostille, POA and international shipping",
    duration: "10-14 business days",
    requirements: "Company documentation, Buyer/Seller details, Acquisition agreement",
    services: { hasApostille: true, hasShipping: true, hasPOA: true },
    createdAt: "2024-01-01",
    status: "active",
  },
  {
    id: "P007",
    name: "UK New Company Plus",
    description: "Company formation with apostille and shipping",
    duration: "7-10 business days",
    requirements: "Shareholder information, Directors details, Shipping address",
    services: { hasApostille: true, hasShipping: true, hasPOA: false },
    createdAt: "2024-01-01",
    status: "active",
  },
  {
    id: "P008",
    name: "USA New Company Plus",
    description: "Company formation with apostille and shipping",
    duration: "10-12 business days",
    requirements: "Registered agent, Agent address, Shareholder information",
    services: { hasApostille: true, hasShipping: true, hasPOA: false },
    createdAt: "2024-01-01",
    status: "active",
  },
  {
    id: "P009",
    name: "Canada New Company Plus",
    description: "Company formation with apostille and shipping",
    duration: "7-10 business days",
    requirements: "Directors information, Registered office, Shipping address",
    services: { hasApostille: true, hasShipping: true, hasPOA: false },
    createdAt: "2024-01-01",
    status: "active",
  },
  {
    id: "P010",
    name: "Sweden New Company Plus",
    description: "Company formation with apostille and shipping",
    duration: "5-8 business days",
    requirements: "Board member details, Registered office, Shipping address",
    services: { hasApostille: true, hasShipping: true, hasPOA: false },
    createdAt: "2024-01-01",
    status: "active",
  },
  {
    id: "P011",
    name: "Power of Attorney (POA)",
    description: "Standalone power of attorney document service",
    duration: "2-3 business days",
    requirements: "Principal information, Agent details, Scope of authority",
    services: { hasApostille: false, hasShipping: false, hasPOA: true },
    createdAt: "2024-01-01",
    status: "active",
  },
  {
    id: "P012",
    name: "UK Apostille Service",
    description: "Apostille certification for UK documents",
    duration: "1-2 business days",
    requirements: "Document details, Certification requirements",
    services: { hasApostille: true, hasShipping: false, hasPOA: false },
    createdAt: "2024-01-01",
    status: "active",
  },
  {
    id: "P013",
    name: "Swedish Apostille Service",
    description: "Apostille certification for Swedish documents",
    duration: "1-2 business days",
    requirements: "Document details, Certification requirements",
    services: { hasApostille: true, hasShipping: false, hasPOA: false },
    createdAt: "2024-01-01",
    status: "active",
  },
];

export const mockOrders: Order[] = [
  {
    id: "O001",
    userId: "1",
    orderNumber: "ORD-2024-001",
    description: "Company Registration - USA (Delaware)",
    amount: 1500,
    currency: "USD",
    status: "completed",
    serviceType: "Company Registration",
    countries: ["United States"],
    createdAt: "2024-01-05",
    completedAt: "2024-01-06",
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
    createdAt: "2024-01-08",
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
  },
  {
    id: "O003",
    userId: "2",
    orderNumber: "ORD-2024-003",
    description: "UK Company Registration",
    amount: 2000,
    currency: "GBP",
    status: "completed",
    serviceType: "Company Registration",
    countries: ["United Kingdom"],
    createdAt: "2023-12-20",
    completedAt: "2023-12-22",
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
    createdAt: "2023-11-15",
    completedAt: "2023-12-01",
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
    createdAt: "2024-01-07",
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
    createdAt: "2024-01-02",
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
    createdAt: "2023-12-01",
    completedAt: "2023-12-10",
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
  },
  {
    id: "O008",
    userId: "1",
    orderNumber: "ORD-2024-008",
    description: "Multi-country Corporate Setup",
    amount: 8500,
    currency: "USD",
    status: "awaiting_client_acceptance",
    serviceType: "Multi-Country Setup",
    countries: ["United States", "Canada", "Mexico"],
    createdAt: "2024-01-03",
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
    description: "Tax ID Registration",
    items: [
      {
        description: "Tax ID Application",
        quantity: 1,
        unitPrice: 500,
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
    description: "Spanish Sociedad Limitada Registration",
    items: [
      {
        description: "SL Registration",
        quantity: 1,
        unitPrice: 1200,
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
    description: "Japan Kabushiki Kaisha Registration",
    items: [
      {
        description: "KK Registration & Setup",
        quantity: 1,
        unitPrice: 4500,
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
    description: "Annual Compliance Filing - USA",
    items: [
      {
        description: "Annual Report Filing",
        quantity: 1,
        unitPrice: 800,
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
  },
];

export const mockLoginHistory: LoginHistory[] = [
  {
    id: "L001",
    userId: "1",
    ipAddress: "192.168.1.100",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
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
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
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
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
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
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
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
    lastSalaryDate: "2024-01-01",
    nextSalaryDate: "2024-02-01",
  },
  {
    staffId: "S002",
    baseSalary: 5500,
    currency: "USD",
    underperformanceDeduction: 450,
    underperformanceThreshold: 60,
    lastSalaryDate: "2024-01-01",
    nextSalaryDate: "2024-02-01",
  },
  {
    staffId: "S003",
    baseSalary: 4500,
    currency: "USD",
    underperformanceDeduction: 400,
    underperformanceThreshold: 60,
    lastSalaryDate: "2024-01-01",
    nextSalaryDate: "2024-02-01",
  },
  {
    staffId: "S004",
    baseSalary: 4200,
    currency: "EUR",
    underperformanceDeduction: 350,
    underperformanceThreshold: 60,
    lastSalaryDate: "2024-01-01",
    nextSalaryDate: "2024-02-01",
  },
  {
    staffId: "S005",
    baseSalary: 4200,
    currency: "EUR",
    underperformanceDeduction: 350,
    underperformanceThreshold: 60,
    lastSalaryDate: "2024-01-01",
    nextSalaryDate: "2024-02-01",
  },
  {
    staffId: "S006",
    baseSalary: 4500,
    currency: "GBP",
    underperformanceDeduction: 400,
    underperformanceThreshold: 60,
    lastSalaryDate: "2024-01-01",
    nextSalaryDate: "2024-02-01",
  },
  {
    staffId: "S007",
    baseSalary: 3800,
    currency: "USD",
    underperformanceDeduction: 300,
    underperformanceThreshold: 60,
    lastSalaryDate: "2024-01-01",
    nextSalaryDate: "2024-02-01",
  },
  {
    staffId: "S008",
    baseSalary: 5800,
    currency: "USD",
    underperformanceDeduction: 475,
    underperformanceThreshold: 60,
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
  { id: "MR001", staffId: "S001", month: 9, year: 2023, totalScore: 95, earlyCompletions: 8, rejections: 0, scoreTrend: 5, performanceStatus: "excellent", salaryImpact: false, deductionAmount: 0 },
  { id: "MR002", staffId: "S001", month: 10, year: 2023, totalScore: 100, earlyCompletions: 10, rejections: 0, scoreTrend: 5, performanceStatus: "excellent", salaryImpact: false, deductionAmount: 0 },
  { id: "MR003", staffId: "S001", month: 11, year: 2023, totalScore: 100, earlyCompletions: 9, rejections: 0, scoreTrend: 0, performanceStatus: "excellent", salaryImpact: false, deductionAmount: 0 },
  { id: "MR004", staffId: "S001", month: 12, year: 2023, totalScore: 100, earlyCompletions: 10, rejections: 0, scoreTrend: 0, performanceStatus: "excellent", salaryImpact: false, deductionAmount: 0 },
  { id: "MR005", staffId: "S001", month: 1, year: 2024, totalScore: 100, earlyCompletions: 9, rejections: 0, scoreTrend: 0, performanceStatus: "excellent", salaryImpact: false, deductionAmount: 0 },

  // S002 Reports
  { id: "MR006", staffId: "S002", month: 9, year: 2023, totalScore: 80, earlyCompletions: 5, rejections: 2, scoreTrend: 0, performanceStatus: "good", salaryImpact: false, deductionAmount: 0 },
  { id: "MR007", staffId: "S002", month: 10, year: 2023, totalScore: 85, earlyCompletions: 6, rejections: 1, scoreTrend: 5, performanceStatus: "good", salaryImpact: false, deductionAmount: 0 },
  { id: "MR008", staffId: "S002", month: 11, year: 2023, totalScore: 80, earlyCompletions: 4, rejections: 2, scoreTrend: -5, performanceStatus: "good", salaryImpact: false, deductionAmount: 0 },
  { id: "MR009", staffId: "S002", month: 12, year: 2023, totalScore: 90, earlyCompletions: 7, rejections: 1, scoreTrend: 10, performanceStatus: "excellent", salaryImpact: false, deductionAmount: 0 },
  { id: "MR010", staffId: "S002", month: 1, year: 2024, totalScore: 85, earlyCompletions: 5, rejections: 1, scoreTrend: -5, performanceStatus: "good", salaryImpact: false, deductionAmount: 0 },

  // S003 Reports
  { id: "MR011", staffId: "S003", month: 9, year: 2023, totalScore: 70, earlyCompletions: 4, rejections: 3, scoreTrend: 0, performanceStatus: "fair", salaryImpact: false, deductionAmount: 0 },
  { id: "MR012", staffId: "S003", month: 10, year: 2023, totalScore: 75, earlyCompletions: 5, rejections: 2, scoreTrend: 5, performanceStatus: "good", salaryImpact: false, deductionAmount: 0 },
  { id: "MR013", staffId: "S003", month: 11, year: 2023, totalScore: 65, earlyCompletions: 3, rejections: 3, scoreTrend: -10, performanceStatus: "fair", salaryImpact: true, deductionAmount: 400 },
  { id: "MR014", staffId: "S003", month: 12, year: 2023, totalScore: 75, earlyCompletions: 4, rejections: 2, scoreTrend: 10, performanceStatus: "good", salaryImpact: false, deductionAmount: 0 },
  { id: "MR015", staffId: "S003", month: 1, year: 2024, totalScore: 75, earlyCompletions: 3, rejections: 2, scoreTrend: 0, performanceStatus: "good", salaryImpact: false, deductionAmount: 0 },

  // S004 Reports
  { id: "MR016", staffId: "S004", month: 9, year: 2023, totalScore: 55, earlyCompletions: 2, rejections: 4, scoreTrend: 0, performanceStatus: "poor", salaryImpact: true, deductionAmount: 350 },
  { id: "MR017", staffId: "S004", month: 10, year: 2023, totalScore: 65, earlyCompletions: 3, rejections: 3, scoreTrend: 10, performanceStatus: "fair", salaryImpact: true, deductionAmount: 350 },
  { id: "MR018", staffId: "S004", month: 11, year: 2023, totalScore: 70, earlyCompletions: 4, rejections: 3, scoreTrend: 5, performanceStatus: "fair", salaryImpact: false, deductionAmount: 0 },
  { id: "MR019", staffId: "S004", month: 12, year: 2023, totalScore: 75, earlyCompletions: 3, rejections: 2, scoreTrend: 5, performanceStatus: "good", salaryImpact: false, deductionAmount: 0 },
  { id: "MR020", staffId: "S004", month: 1, year: 2024, totalScore: 70, earlyCompletions: 2, rejections: 3, scoreTrend: -5, performanceStatus: "fair", salaryImpact: false, deductionAmount: 0 },

  // S005 Reports
  { id: "MR021", staffId: "S005", month: 9, year: 2023, totalScore: 80, earlyCompletions: 5, rejections: 2, scoreTrend: 0, performanceStatus: "good", salaryImpact: false, deductionAmount: 0 },
  { id: "MR022", staffId: "S005", month: 10, year: 2023, totalScore: 85, earlyCompletions: 6, rejections: 1, scoreTrend: 5, performanceStatus: "good", salaryImpact: false, deductionAmount: 0 },
  { id: "MR023", staffId: "S005", month: 11, year: 2023, totalScore: 80, earlyCompletions: 4, rejections: 2, scoreTrend: -5, performanceStatus: "good", salaryImpact: false, deductionAmount: 0 },
  { id: "MR024", staffId: "S005", month: 12, year: 2023, totalScore: 90, earlyCompletions: 7, rejections: 1, scoreTrend: 10, performanceStatus: "excellent", salaryImpact: false, deductionAmount: 0 },
  { id: "MR025", staffId: "S005", month: 1, year: 2024, totalScore: 80, earlyCompletions: 4, rejections: 2, scoreTrend: -10, performanceStatus: "good", salaryImpact: false, deductionAmount: 0 },

  // S006 Reports
  { id: "MR026", staffId: "S006", month: 9, year: 2023, totalScore: 90, earlyCompletions: 8, rejections: 1, scoreTrend: 0, performanceStatus: "excellent", salaryImpact: false, deductionAmount: 0 },
  { id: "MR027", staffId: "S006", month: 10, year: 2023, totalScore: 95, earlyCompletions: 9, rejections: 0, scoreTrend: 5, performanceStatus: "excellent", salaryImpact: false, deductionAmount: 0 },
  { id: "MR028", staffId: "S006", month: 11, year: 2023, totalScore: 85, earlyCompletions: 6, rejections: 1, scoreTrend: -10, performanceStatus: "good", salaryImpact: false, deductionAmount: 0 },
  { id: "MR029", staffId: "S006", month: 12, year: 2023, totalScore: 90, earlyCompletions: 8, rejections: 1, scoreTrend: 5, performanceStatus: "excellent", salaryImpact: false, deductionAmount: 0 },
  { id: "MR030", staffId: "S006", month: 1, year: 2024, totalScore: 90, earlyCompletions: 7, rejections: 1, scoreTrend: 0, performanceStatus: "excellent", salaryImpact: false, deductionAmount: 0 },

  // S007 Reports
  { id: "MR031", staffId: "S007", month: 9, year: 2023, totalScore: 100, earlyCompletions: 10, rejections: 0, scoreTrend: 0, performanceStatus: "excellent", salaryImpact: false, deductionAmount: 0 },
  { id: "MR032", staffId: "S007", month: 10, year: 2023, totalScore: 100, earlyCompletions: 9, rejections: 0, scoreTrend: 0, performanceStatus: "excellent", salaryImpact: false, deductionAmount: 0 },
  { id: "MR033", staffId: "S007", month: 11, year: 2023, totalScore: 95, earlyCompletions: 8, rejections: 0, scoreTrend: -5, performanceStatus: "excellent", salaryImpact: false, deductionAmount: 0 },
  { id: "MR034", staffId: "S007", month: 12, year: 2023, totalScore: 100, earlyCompletions: 10, rejections: 0, scoreTrend: 5, performanceStatus: "excellent", salaryImpact: false, deductionAmount: 0 },
  { id: "MR035", staffId: "S007", month: 1, year: 2024, totalScore: 95, earlyCompletions: 8, rejections: 0, scoreTrend: -5, performanceStatus: "excellent", salaryImpact: false, deductionAmount: 0 },

  // S008 Reports
  { id: "MR036", staffId: "S008", month: 9, year: 2023, totalScore: 85, earlyCompletions: 6, rejections: 1, scoreTrend: 0, performanceStatus: "good", salaryImpact: false, deductionAmount: 0 },
  { id: "MR037", staffId: "S008", month: 10, year: 2023, totalScore: 90, earlyCompletions: 7, rejections: 1, scoreTrend: 5, performanceStatus: "excellent", salaryImpact: false, deductionAmount: 0 },
  { id: "MR038", staffId: "S008", month: 11, year: 2023, totalScore: 88, earlyCompletions: 6, rejections: 1, scoreTrend: -2, performanceStatus: "excellent", salaryImpact: false, deductionAmount: 0 },
  { id: "MR039", staffId: "S008", month: 12, year: 2023, totalScore: 92, earlyCompletions: 8, rejections: 0, scoreTrend: 4, performanceStatus: "excellent", salaryImpact: false, deductionAmount: 0 },
  { id: "MR040", staffId: "S008", month: 1, year: 2024, totalScore: 88, earlyCompletions: 6, rejections: 1, scoreTrend: -4, performanceStatus: "excellent", salaryImpact: false, deductionAmount: 0 },
];
