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

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  description: string;
  amount: number;
  currency: string;
  status: "pending" | "processing" | "completed" | "cancelled";
  serviceType: string;
  countries: string[];
  createdAt: string;
  completedAt?: string;
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
  },
  {
    id: "O002",
    userId: "1",
    orderNumber: "ORD-2024-002",
    description: "Tax ID Registration",
    amount: 500,
    currency: "USD",
    status: "processing",
    serviceType: "Tax Documentation",
    countries: ["United States"],
    createdAt: "2024-01-08",
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
  },
  {
    id: "O005",
    userId: "3",
    orderNumber: "ORD-2024-005",
    description: "Spanish Company Registration",
    amount: 1200,
    currency: "EUR",
    status: "pending",
    serviceType: "Company Registration",
    countries: ["Spain"],
    createdAt: "2024-01-07",
  },
  {
    id: "O006",
    userId: "4",
    orderNumber: "ORD-2024-006",
    description: "Singapore & Malaysia Setup",
    amount: 3000,
    currency: "SGD",
    status: "processing",
    serviceType: "Multi-Country Setup",
    countries: ["Singapore", "Malaysia"],
    createdAt: "2024-01-02",
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
