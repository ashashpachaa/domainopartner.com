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
  startTime: string;
  endTime: string;
  daysPerWeek: number;
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  date: string;
  loginTime?: string;
  logoutTime?: string;
  hoursWorked: number;
  confirmations: number;
  missedConfirmations: number;
  isLate: boolean;
  attendanceStatus: "present" | "absent" | "inactive";
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
  assignedToStaffId?: string;
}

export type ClientRequestStatus = "pending_approval" | "approved" | "rejected";

export interface ClientRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  country: string;
  status: ClientRequestStatus;
  createdAt: string;
  rejectionReason?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  country: string;
  duration: string;
  services: {
    hasApostille: boolean;
    hasShipping: boolean;
    hasPOA: boolean;
    hasFinancialReport?: boolean;
  };
}

export interface OperationFile {
  id: string;
  fileName: string;
  fileSize: number;
  fileUrl?: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  stage: "sales" | "operation" | "manager" | "apostille" | "poa" | "financial_report" | "shipping" | "post_services";
  notes?: string;
  visibleToClient?: boolean;
}

export interface OrderComment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
  isInternal: boolean;
}

export interface OrderHistory {
  id: string;
  orderId: string;
  previousStatus: string;
  newStatus: string;
  actionType: "user_transition" | "system_transition" | "manager_action";
  actionBy: string;
  actionByName: string;
  createdAt: string;
  reason?: string;
}

export type OrderStatus =
  | "new"
  | "pending_sales_review"
  | "pending_operation"
  | "pending_operation_manager_review"
  | "awaiting_client_acceptance"
  | "rejected_by_operation"
  | "rejected_by_manager"
  | "pending_apostille"
  | "pending_poa"
  | "pending_financial_report"
  | "shipping_preparation"
  | "pending_shipping"
  | "completed"
  | "rejected_by_apostille"
  | "rejected_by_poa"
  | "rejected_by_financial_report"
  | "rejected_by_shipping";

export interface CompanyInfo {
  companyName: string;
  companyActivities?: string;
  totalCapital?: number;
  pricePerShare?: number;
}

export interface Shareholder {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  nationality?: string;
  ownershipPercentage: number;
  passportFile?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  description: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  serviceType: string;
  countries: string[];
  createdAt: string;
  updatedAt?: string;
  userId: string;
  productId?: string;
  assignedToSalesId?: string;
  operationFiles: OperationFile[];
  operationReviewForm?: {
    isCompleted?: boolean;
    submittedBy?: string;
    submittedByName?: string;
    submittedAt?: string;
    operationNotes?: string;
    qualityCheck?: boolean;
    documentsVerified?: boolean;
    complianceReview?: boolean;
    companyName?: string;
    companyNumber?: string;
  };
  requiredServices: {
    hasApostille: boolean;
    hasShipping: boolean;
    hasPOA: boolean;
    hasFinancialReport?: boolean;
  };
  completedServices?: {
    apostilleComplete: boolean;
    shippingComplete: boolean;
    poaComplete: boolean;
    financialReportComplete?: boolean;
  };
  clientCanViewFiles: boolean;
  clientCanViewTracking: boolean;
  trackingNumber?: string;
  trackingNumberAddedBy?: string;
  trackingNumberAddedAt?: string;
  comments: OrderComment[];
  history: OrderHistory[];
  rejectionReasons: string[];
  registeredCompany?: any;
  companyInfo?: CompanyInfo;
  shareholders?: Shareholder[];
  paymentHistory?: PaymentRecord[];
}

export interface PaymentRecord {
  id: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "partial" | "overdue" | "failed";
  paidDate?: string;
  dueDate?: string;
  description: string;
  method?: string;
  reference?: string;
}

export interface Invoice {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "overdue" | "cancelled";
  dueDate: string;
  paidDate?: string;
  notes: string;
  createdAt?: string;
  createdByStaffId?: string;
  updatedAt?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  vendor?: string;
  receipt?: string;
  status: "approved" | "pending" | "rejected";
  submittedBy: string;
  submittedAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
  paymentTerms: string;
  accountNumber?: string;
  bankCode?: string;
}

export interface BudgetEntry {
  id: string;
  category: string;
  plannedAmount: number;
  actualAmount: number;
  variance: number;
  month: number;
  year: number;
}

export interface StaffSalary {
  id: string;
  staffId: string;
  baseSalary: number;
  currency: string;
  payFrequency: "monthly" | "bi-weekly" | "weekly";
  nextPaymentDate: string;
  deductionThreshold?: number;
  deductionAmount?: number;
  appliedDeduction?: boolean;
  deductedAmount?: number;
}

export interface StaffCommission {
  id: string;
  staffId: string;
  paidOrders: number;
  rejectedOrders: number;
  performanceScore: number;
  appliedTier: "bronze" | "silver" | "gold" | "platinum";
  baseCommission: number;
  performanceBonus: number;
  totalCommission: number;
  currency: string;
  period: string;
}

export interface StaffCommissionHistory {
  id: string;
  staffId: string;
  month: number;
  year: number;
  paidOrders: number;
  rejectedOrders: number;
  baseCommission: number;
  performanceBonus: number;
  totalCommission: number;
  appliedTier: "bronze" | "silver" | "gold" | "platinum";
  currency: string;
  notes?: string;
}

export interface StaffPerformance {
  id: string;
  staffId: string;
  month: number;
  year: number;
  score: number;
  earlyCompletions: number;
  rejections: number;
  trend: number;
  salaryImpact: boolean;
  deductionAmount?: number;
}

export interface StaffBonus {
  id: string;
  staffId: string;
  month: number;
  year: number;
  bonusAmount: number;
  bonusTier: "bronze" | "silver" | "gold" | "platinum";
  currency: string;
  paidOrders: number;
  rejectionPenalty: number;
}

export interface MonthlyPerformanceReport {
  id: string;
  staffId: string;
  month: number;
  year: number;
  score: number;
  earlyCompletions: number;
  rejections: number;
  trend: number;
  salaryImpact: boolean;
  deductionAmount?: number;
}

export interface LoginHistory {
  id: string;
  staffId: string;
  loginTime: string;
  logoutTime?: string;
  duration: number;
}

export interface CompanyIncorporation {
  id: string;
  companyName: string;
  companyType: string;
  status: string;
  directors: any[];
  shareholders: any[];
  shareCapital: number;
  amendments?: any[];
  createdAt: string;
  submittedAt?: string;
  completedAt?: string;
}

export interface RegisteredCompany {
  id: string;
  companyName: string;
  companyNumber: string;
  incorporationDate: string;
  status: "active" | "dissolved" | "pending_renewal";
  registeredOfficeAddress: string;
  nextConfirmationDate: string;
  firstAccountsFilingDate?: string;
  country: "UK" | "USA" | "Sweden" | "Canada";
}

export interface CompanyForSale {
  id: string;
  companyName: string;
  companyNumber?: string;
  incorporationDate?: string;
  askingPrice: number;
  businessType: string;
  reason?: string;
  createdAt: string;
  listedBy?: string;
}

export interface CompanyAmendment {
  id: string;
  incorporationId: string;
  formType: string;
  status: string;
  createdAt: string;
  filingReference?: string;
  amendment?: any;
}

// Role Labels
export const roleLabels: Record<StaffRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  operation_manager: "Operation Manager",
  operation: "Operation",
  sales: "Sales",
  accounting: "Accounting",
};

// Role Permissions
export const rolePermissions: Record<StaffRole, string[]> = {
  super_admin: [
    "manage_users",
    "manage_staff",
    "manage_orders",
    "manage_invoices",
    "view_reports",
    "manage_permissions",
    "view_all_data",
  ],
  admin: [
    "manage_users",
    "manage_staff",
    "manage_orders",
    "manage_invoices",
    "view_reports",
    "view_all_data",
  ],
  operation_manager: [
    "manage_orders",
    "upload_documents",
    "change_order_status",
    "view_all_orders",
    "view_operations",
  ],
  operation: [
    "create_orders",
    "edit_assigned_orders",
    "change_order_status",
    "view_assigned_orders",
    "upload_documents",
  ],
  sales: [
    "add_orders",
    "edit_assigned_orders",
    "view_assigned_orders",
    "view_client_orders",
    "view_client_invoices",
    "view_client_payments",
    "track_orders",
  ],
  accounting: [
    "view_invoices",
    "view_payments",
    "manage_billing",
    "view_reports",
  ],
};

// EMPTY MOCK DATA ARRAYS - Ready for live data entry
export const mockExpenses: Expense[] = [];
export const mockVendors: Vendor[] = [];
export const mockBudgets: BudgetEntry[] = [];
export const mockCompanyIncorporations: CompanyIncorporation[] = [];
export const mockUsers: User[] = [];
export const mockClientRequests: ClientRequest[] = [];
export const mockProducts: Product[] = [];
export const mockOrders: Order[] = [];
export const mockStageDeadlines: StageDealineConfig[] = [];
export const mockInvoices: Invoice[] = [];
export const mockLoginHistory: LoginHistory[] = [];
export const mockStaff: Staff[] = [];
export const mockAttendanceRecords: AttendanceRecord[] = [];
export const mockStaffCommissions: StaffCommission[] = [];
export const mockStaffCommissionHistory: StaffCommissionHistory[] = [];
export const mockStaffSalaries: StaffSalary[] = [];
export const mockStaffPerformances: StaffPerformance[] = [];
export const mockMonthlyPerformanceReports: MonthlyPerformanceReport[] = [];
export const mockStaffBonuses: StaffBonus[] = [];
export const mockCompaniesForSale: CompanyForSale[] = [];
export const mockRegisteredCompanies: RegisteredCompany[] = [];

// SIC CODES - Keep populated for selection
export const SIC_CODES = [
  { code: "01110", description: "Growing of cereals (except rice), leguminous crops and oil seeds" },
  { code: "01130", description: "Growing of vegetables and melons, roots and tubers" },
  { code: "01150", description: "Growing of other non-perennial crops" },
  { code: "01210", description: "Growing of grapes" },
  { code: "01220", description: "Growing of tropical and subtropical fruits" },
  { code: "01230", description: "Growing of other tree and bush fruits and nuts" },
  { code: "01240", description: "Growing of beverage crops" },
  { code: "01250", description: "Growing of spice, aromatic, drug and similar crops" },
  { code: "01260", description: "Growing of other crops not classified elsewhere" },
  { code: "01300", description: "Plant propagation" },
  { code: "01410", description: "Raising of cattle (except dairy cattle)" },
  { code: "01420", description: "Raising of dairy cattle" },
  { code: "01430", description: "Raising of horses and other equines" },
  { code: "01450", description: "Raising of sheep and goats" },
  { code: "01460", description: "Raising of swine/pigs" },
  { code: "01470", description: "Raising of poultry" },
  { code: "01490", description: "Raising of other animals" },
  { code: "01500", description: "Mixed farming" },
  { code: "01610", description: "Support activities for crop production" },
  { code: "01620", description: "Support activities for animal production" },
  { code: "01630", description: "Post-harvest crop activities" },
  { code: "01640", description: "Seed processing for propagation" },
  { code: "01700", description: "Hunting, trapping and related service activities" },
  { code: "02100", description: "Silviculture and other forestry activities" },
  { code: "02200", description: "Logging" },
  { code: "02300", description: "Gathering of wild growing non-wood products" },
  { code: "02400", description: "Support services to forestry" },
  { code: "03110", description: "Fishing" },
  { code: "03120", description: "Aquaculture" },
  { code: "05101", description: "Mining of hard coal" },
  { code: "05102", description: "Mining of lignite" },
  { code: "05201", description: "Mining of crude petroleum" },
  { code: "05202", description: "Mining and agglomeration of peat" },
  { code: "05301", description: "Mining of natural gas" },
  { code: "05401", description: "Mining of iron ores" },
  { code: "05409", description: "Mining of other non-ferrous metal ores" },
  { code: "05501", description: "Mining of stone, sand and clay" },
  { code: "05509", description: "Other mining and quarrying not classified elsewhere" },
  { code: "05601", description: "Extraction of salt" },
  { code: "05609", description: "Other mining and quarrying n.e.c." },
  { code: "05701", description: "Mining of chemical and fertiliser minerals" },
  { code: "05702", description: "Extraction and refining of salt" },
  { code: "05709", description: "Other mining of chemical and fertiliser minerals" },
  { code: "05801", description: "Other mining n.e.c." },
  { code: "05809", description: "Mining and quarrying n.e.c." },
  { code: "05901", description: "Support activities for petroleum and natural gas extraction" },
  { code: "05902", description: "Support activities for other mining and quarrying" },
  { code: "06010", description: "Extraction of crude petroleum" },
  { code: "07010", description: "Extraction of iron ores" },
  { code: "07020", description: "Extraction of non-ferrous metal ores" },
  { code: "08110", description: "Quarrying of stone, sand and clay" },
  { code: "08120", description: "Mining and quarrying of salt" },
  { code: "08130", description: "Extraction of chemical and fertiliser minerals" },
  { code: "08910", description: "Extraction of salt" },
  { code: "08920", description: "Extraction of chemical and fertiliser minerals" },
  { code: "09100", description: "Support activities for petroleum and natural gas extraction" },
  { code: "09200", description: "Support activities for other mining and quarrying" },
  { code: "09900", description: "Support activities for mining and quarrying n.e.c." },
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
  { code: "10730", description: "Manufacture of macaroni, noodles and similar products" },
  { code: "10810", description: "Manufacture of sugar" },
  { code: "10820", description: "Manufacture of cocoa and chocolate confectionery" },
  { code: "10830", description: "Manufacture of other sugar confectionery" },
  { code: "10860", description: "Manufacture of other food products n.e.c." },
  { code: "10890", description: "Manufacture of other food products n.e.c." },
  { code: "10910", description: "Manufacture of prepared feeds for farm animals" },
  { code: "10920", description: "Manufacture of prepared pet foods" },
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
  { code: "14300", description: "Manufacture of other textiles" },
  { code: "15100", description: "Tanning and dressing of leather; manufacture of luggage, handbags and the like, saddlery and harness; dressing and dyeing of fur" },
  { code: "15200", description: "Manufacture of footwear" },
  { code: "16100", description: "Sawmilling and planing of wood" },
  { code: "16210", description: "Manufacture of veneer sheets and wood-based panels" },
  { code: "16220", description: "Manufacture of assembled parquet floors" },
  { code: "16230", description: "Manufacture of other wood products; manufacture of articles of cork, straw and plaiting materials" },
  { code: "16240", description: "Manufacture of wooden containers" },
  { code: "16290", description: "Manufacture of other wood products n.e.c." },
  { code: "16300", description: "Manufacture of articles of cork, straw and plaiting materials" },
  { code: "17100", description: "Manufacture of pulp, paper and paperboard" },
  { code: "17210", description: "Manufacture of corrugated paper and paperboard and of containers of corrugated paper and paperboard" },
  { code: "17220", description: "Manufacture of paper and paperboard containers" },
  { code: "17230", description: "Manufacture of paper stationery" },
  { code: "17240", description: "Manufacture of wallpaper" },
  { code: "17290", description: "Manufacture of other articles of paper and paperboard n.e.c." },
  { code: "18110", description: "Printing of newspapers" },
  { code: "18120", description: "Other printing" },
  { code: "18130", description: "Pre-press and pre-media services" },
  { code: "18140", description: "Binding and related services" },
  { code: "19100", description: "Manufacture of coke" },
  { code: "19200", description: "Manufacture of refined petroleum products" },
  { code: "20110", description: "Manufacture of industrial gases" },
  { code: "20120", description: "Manufacture of dyes and pigments" },
  { code: "20130", description: "Manufacture of other inorganic basic chemicals" },
  { code: "20140", description: "Manufacture of other organic basic chemicals" },
  { code: "20150", description: "Manufacture of fertilisers and nitrogen compounds" },
  { code: "20160", description: "Manufacture of plastics in primary forms" },
  { code: "20170", description: "Manufacture of synthetic rubber in primary forms" },
  { code: "20200", description: "Manufacture of pesticides and other agrochemical products" },
  { code: "20301", description: "Manufacture of paints, varnishes and similar coatings, printing ink and mastics" },
  { code: "20302", description: "Manufacture of printing ink" },
  { code: "20410", description: "Manufacture of soap and detergents" },
  { code: "20420", description: "Manufacture of perfumes and toilet preparations" },
  { code: "20510", description: "Manufacture of explosives" },
  { code: "20520", description: "Manufacture of glues and adhesives" },
  { code: "20530", description: "Manufacture of essential oils" },
  { code: "20591", description: "Manufacture of photographic and cinematographic chemicals" },
  { code: "20592", description: "Manufacture of other chemical products n.e.c." },
  { code: "20600", description: "Manufacture of man-made fibres" },
  { code: "21100", description: "Manufacture of basic pharmaceutical products" },
  { code: "21200", description: "Manufacture of pharmaceutical preparations" },
  { code: "22110", description: "Manufacture of rubber tyres and tubes; retreading and rebuilding of rubber tyres" },
  { code: "22120", description: "Manufacture of other rubber products" },
  { code: "22210", description: "Manufacture of plastic plates, sheets, tubes and profiles" },
  { code: "22220", description: "Manufacture of plastic packing goods" },
  { code: "22230", description: "Manufacture of other plastic products" },
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
  { code: "23430", description: "Manufacture of articles of cement, concrete or plaster" },
  { code: "23510", description: "Manufacture of articles of stone" },
  { code: "23520", description: "Manufacture of concrete products for construction" },
  { code: "23610", description: "Manufacture of abrasive products" },
  { code: "23620", description: "Manufacture of other non-metallic mineral products n.e.c." },
  { code: "24100", description: "Manufacture of basic iron and steel and of ferro-alloys" },
  { code: "24200", description: "Manufacture of tubes, pipes, hollow profiles and related fittings, of steel" },
  { code: "24310", description: "Cold drawing of bars" },
  { code: "24320", description: "Cold rolling of narrow strip" },
  { code: "24330", description: "Cold forming or folding" },
  { code: "24340", description: "Wire drawing" },
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
  { code: "25200", description: "Manufacture of tanks, reservoirs and containers of metal; manufacture of steam generators" },
  { code: "25300", description: "Manufacture of steam generators, except central heating hot water boilers" },
  { code: "25400", description: "Manufacture of weapons and ammunition" },
  { code: "25500", description: "Forging, pressing, stamping and roll forming of metal; powder metallurgy" },
  { code: "25610", description: "Treatment and disposal of non-hazardous waste" },
  { code: "25620", description: "Treatment and disposal of hazardous waste" },
  { code: "25710", description: "Manufacture of cutlery" },
  { code: "25720", description: "Manufacture of locks and hinges" },
  { code: "25730", description: "Manufacture of tools" },
  { code: "25910", description: "Manufacture of steel drums and similar containers" },
  { code: "25920", description: "Manufacture of light metal packaging" },
  { code: "25930", description: "Manufacture of wire products, chain, springs and fasteners" },
  { code: "25990", description: "Manufacture of other fabricated metal products n.e.c." },
  { code: "26110", description: "Manufacture of electronic components" },
  { code: "26120", description: "Manufacture of loaded electronic circuits and complete electronic units" },
  { code: "26200", description: "Manufacture of computers and peripheral equipment" },
  { code: "26300", description: "Manufacture of communication equipment" },
  { code: "26400", description: "Manufacture of consumer electronics" },
  { code: "26510", description: "Manufacture of instruments and appliances for measuring, testing and navigation" },
  { code: "26520", description: "Manufacture of watches and clocks" },
  { code: "26600", description: "Manufacture of irradiation, electromedical and electrotherapeutic equipment" },
  { code: "26701", description: "Manufacture of optical instruments and photographic equipment" },
  { code: "26702", description: "Manufacture of other optical instruments" },
  { code: "26800", description: "Manufacture of magnetic and optical media" },
  { code: "27100", description: "Manufacture of electric motors, generators, transformers and electricity distribution and control apparatus" },
  { code: "27200", description: "Manufacture of batteries and accumulators" },
  { code: "27310", description: "Manufacture of fibre optic cables" },
  { code: "27320", description: "Manufacture of other electronic and electric wires and cables" },
  { code: "27330", description: "Manufacture of wiring devices" },
  { code: "27400", description: "Manufacture of electric lighting equipment" },
  { code: "27510", description: "Manufacture of electric domestic appliances" },
  { code: "27520", description: "Manufacture of non-electric heating and cooking appliances" },
  { code: "27900", description: "Manufacture of other electrical equipment" },
  { code: "28110", description: "Manufacture of engines and turbines, except aircraft, vehicle and cycle engines" },
  { code: "28120", description: "Manufacture of hydraulic and pneumatic power engines and motors" },
  { code: "28130", description: "Manufacture of other pumps and compressors" },
  { code: "28140", description: "Manufacture of taps and valves" },
  { code: "28150", description: "Manufacture of bearings, gears, gearing and driving elements" },
  { code: "28160", description: "Manufacture of ovens, furnaces and furnace burners" },
  { code: "28170", description: "Manufacture of lifting and handling equipment" },
  { code: "28190", description: "Manufacture of other general-purpose machinery" },
  { code: "28210", description: "Manufacture of engines and turbines for agricultural machinery" },
  { code: "28220", description: "Manufacture of machinery for mining, quarrying and construction" },
  { code: "28230", description: "Manufacture of machinery for food, beverage and tobacco processing" },
  { code: "28240", description: "Manufacture of machinery for textile, apparel and leather production" },
  { code: "28250", description: "Manufacture of machinery for paper and paperboard production" },
  { code: "28290", description: "Manufacture of other special-purpose machinery" },
  { code: "28300", description: "Manufacture of agricultural and forestry machinery" },
  { code: "28410", description: "Manufacture of metal-forming machinery and machine tools" },
  { code: "28490", description: "Manufacture of other machine tools" },
  { code: "28910", description: "Manufacture of machinery for metallurgy" },
  { code: "28920", description: "Manufacture of machinery for mining and quarrying" },
  { code: "28930", description: "Manufacture of machinery for food, beverage and tobacco processing" },
  { code: "28940", description: "Manufacture of machinery for textile, apparel and leather production" },
  { code: "28950", description: "Manufacture of paper and pulp machinery" },
  { code: "28960", description: "Manufacture of plastics and rubber machinery" },
  { code: "28990", description: "Manufacture of other special-purpose machinery n.e.c." },
  { code: "29100", description: "Manufacture of motor vehicles" },
  { code: "29200", description: "Manufacture of bodies (coachwork) for motor vehicles; manufacture of trailers and semi-trailers" },
  { code: "29310", description: "Manufacture of electrical and electronic equipment for motor vehicles" },
  { code: "29320", description: "Manufacture of other parts and accessories for motor vehicles" },
  { code: "30110", description: "Building of ships and floating structures" },
  { code: "30120", description: "Building of pleasure and sporting boats" },
  { code: "30200", description: "Manufacture of railway locomotives and rolling stock" },
  { code: "30300", description: "Manufacture of air and spacecraft and related machinery" },
  { code: "30400", description: "Manufacture of military fighting vehicles" },
  { code: "30910", description: "Manufacture of motorcycles" },
  { code: "30920", description: "Manufacture of bicycles and invalid carriages" },
  { code: "30990", description: "Manufacture of other transport equipment n.e.c." },
  { code: "31010", description: "Manufacture of office and shop furniture" },
  { code: "31020", description: "Manufacture of kitchen furniture" },
  { code: "31030", description: "Manufacture of mattresses" },
  { code: "31090", description: "Manufacture of other furniture" },
  { code: "32110", description: "Striking of coins" },
  { code: "32120", description: "Manufacture of jewellery and related articles" },
  { code: "32130", description: "Manufacture of imitation jewellery and related articles" },
  { code: "32200", description: "Manufacture of musical instruments" },
  { code: "32300", description: "Manufacture of sports goods" },
  { code: "32401", description: "Manufacture of games and toys" },
  { code: "32409", description: "Manufacture of other games and toys" },
  { code: "32500", description: "Manufacture of medical and dental instruments and supplies" },
  { code: "32910", description: "Manufacture of brooms and brushes" },
  { code: "32990", description: "Other manufacturing n.e.c." },
  { code: "33110", description: "Repair of fabricated metal products" },
  { code: "33120", description: "Repair of machinery" },
  { code: "33130", description: "Repair of electronic and optical equipment" },
  { code: "33140", description: "Repair of electrical equipment" },
  { code: "33150", description: "Repair and maintenance of ships and boats" },
  { code: "33160", description: "Repair and maintenance of aircraft and spacecraft" },
  { code: "33170", description: "Repair and maintenance of other transport equipment" },
  { code: "33190", description: "Repair of other equipment" },
  { code: "33200", description: "Installation of industrial machinery and equipment" },
  { code: "35110", description: "Electric power generation, transmission and distribution" },
  { code: "35120", description: "Electric power generation from renewable sources" },
  { code: "35210", description: "Manufacture of gas; distribution of gaseous fuels through mains" },
  { code: "35220", description: "Distribution of gaseous fuels through mains" },
  { code: "35300", description: "Steam and air conditioning supply" },
  { code: "36000", description: "Water collection, treatment and supply" },
  { code: "37000", description: "Sewerage" },
  { code: "38110", description: "Collection of non-hazardous waste" },
  { code: "38120", description: "Collection of hazardous waste" },
  { code: "38210", description: "Treatment and disposal of non-hazardous waste" },
  { code: "38220", description: "Treatment and disposal of hazardous waste" },
  { code: "38300", description: "Materials recovery and recycling" },
  { code: "39000", description: "Remediation activities and other waste management services" },
  { code: "41100", description: "Development of building projects" },
  { code: "41200", description: "Construction of residential and non-residential buildings" },
  { code: "42110", description: "Construction of roads and motorways" },
  { code: "42120", description: "Construction of railways and underground railways" },
  { code: "42130", description: "Construction of bridges and tunnels" },
  { code: "42210", description: "Construction of water projects" },
  { code: "42220", description: "Construction of power and telecommunications lines and masts" },
  { code: "42290", description: "Construction of other civil engineering projects n.e.c." },
  { code: "42910", description: "Site preparation" },
  { code: "42990", description: "Other specialised construction activities n.e.c." },
  { code: "43110", description: "Demolition and site preparation" },
  { code: "43120", description: "Test drilling and boring" },
  { code: "43210", description: "Electrical installation" },
  { code: "43220", description: "Plumbing, heat and air-conditioning installation" },
  { code: "43290", description: "Other electrical, plumbing and other construction installation activities" },
  { code: "43310", description: "Plastering" },
  { code: "43320", description: "Joinery installation" },
  { code: "43330", description: "Floor and wall covering" },
  { code: "43341", description: "Painting of buildings" },
  { code: "43342", description: "Glazing and fitting of windows and doors" },
  { code: "43343", description: "Other finishing installation" },
  { code: "43390", description: "Other building completion and finishing work" },
  { code: "43910", description: "Roofing activities" },
  { code: "43991", description: "Other specialised construction activities n.e.c." },
  { code: "43999", description: "Specialised construction activities not elsewhere classified" },
  { code: "45111", description: "Sale of cars and light motor vehicles" },
  { code: "45112", description: "Sale of heavy trucks and lorries" },
  { code: "45190", description: "Sale of motor vehicles n.e.c." },
  { code: "45200", description: "Maintenance and repair of motor vehicles" },
  { code: "45310", description: "Trade in motor vehicle parts and accessories" },
  { code: "45320", description: "Trade in motor bikes, parts and accessories" },
  { code: "45401", description: "Sale, maintenance and repair of motorcycles, motor scooters, mopeds, cycles and related parts and accessories" },
  { code: "45402", description: "Sale, maintenance and repair of motorcycles and related parts and accessories" },
  { code: "45500", description: "Retail sale of motor fuel" },
  { code: "46110", description: "Agents involved in the sale of agricultural raw materials, live animals, textile raw materials and semi-finished goods" },
  { code: "46120", description: "Agents involved in the sale of fuels, ores, metals and industrial chemicals" },
  { code: "46130", description: "Agents involved in the sale of timber and building materials" },
  { code: "46140", description: "Agents involved in the sale of machinery, equipment, vessels and aircraft" },
  { code: "46150", description: "Agents involved in the sale of furniture, household goods and hardware" },
  { code: "46160", description: "Agents involved in the sale of textiles, clothing, fur, footwear and leather goods" },
  { code: "46170", description: "Agents involved in the sale of food, beverages and tobacco" },
  { code: "46180", description: "Agents specialising in the sale of particular products or materials n.e.c." },
  { code: "46190", description: "Agents involved in the sale of a variety of goods" },
  { code: "46210", description: "Wholesale of grain, seeds and agricultural raw materials" },
  { code: "46220", description: "Wholesale of live animals" },
  { code: "46230", description: "Wholesale of hides, skins and leather" },
  { code: "46240", description: "Wholesale of unmanufactured tobacco" },
  { code: "46310", description: "Wholesale of fruit and vegetables" },
  { code: "46320", description: "Wholesale of meat and meat products" },
  { code: "46330", description: "Wholesale of dairy products, eggs and edible oils and fats" },
  { code: "46340", description: "Wholesale of beverages" },
  { code: "46350", description: "Wholesale of sugar and sugar confectionery" },
  { code: "46360", description: "Wholesale of coffee, tea, cocoa and spices" },
  { code: "46370", description: "Wholesale of other food, including fish, crustaceans and molluscs" },
  { code: "46380", description: "Wholesale of tobacco products" },
  { code: "46390", description: "Non-specialised wholesale of food, beverages and tobacco" },
  { code: "46410", description: "Wholesale of textiles" },
  { code: "46420", description: "Wholesale of clothing and footwear" },
  { code: "46430", description: "Wholesale of electrical household appliances and sanitary ware" },
  { code: "46440", description: "Wholesale of china, glassware, wallpaper and cleaning materials" },
  { code: "46450", description: "Wholesale of perfumery and cosmetics" },
  { code: "46460", description: "Wholesale of pharmaceutical goods" },
  { code: "46470", description: "Wholesale of furniture, carpets and lighting equipment" },
  { code: "46480", description: "Wholesale of watches and jewellery" },
  { code: "46490", description: "Wholesale of other household goods" },
  { code: "46500", description: "Wholesale of machinery, equipment and supplies" },
  { code: "46510", description: "Wholesale of computers, computer peripheral equipment and software" },
  { code: "46520", description: "Wholesale of electronic and telecommunications equipment and parts" },
  { code: "46610", description: "Wholesale of fuels and related products" },
  { code: "46620", description: "Wholesale of metals and metal ores" },
  { code: "46630", description: "Wholesale of wood, construction materials and sanitary ware" },
  { code: "46640", description: "Wholesale of hardware, plumbing and heating equipment and supplies" },
  { code: "46650", description: "Wholesale of chemical products" },
  { code: "46660", description: "Wholesale of other intermediate products" },
  { code: "46690", description: "Wholesale of waste and scrap" },
  { code: "46700", description: "Wholesale of waste and scrap" },
  { code: "46710", description: "Wholesale of paper and paperboard" },
  { code: "46720", description: "Wholesale of books, magazines and newspapers" },
  { code: "46730", description: "Wholesale of recorded media" },
  { code: "46740", description: "Wholesale of bottles" },
  { code: "46750", description: "Wholesale of other machinery and equipment" },
  { code: "46760", description: "Wholesale of other goods" },
  { code: "46770", description: "Wholesale of waste and scrap" },
  { code: "46900", description: "Non-specialised wholesale trade" },
  { code: "47110", description: "Retail sale in non-specialised stores with food, beverages or tobacco predominating" },
  { code: "47191", description: "Retail sale in non-specialised stores with food, beverages or tobacco predominating" },
  { code: "47192", description: "Retail sale in non-specialised stores without food, beverages or tobacco predominating" },
  { code: "47210", description: "Retail sale of fruit and vegetables" },
  { code: "47220", description: "Retail sale of meat and meat products" },
  { code: "47230", description: "Retail sale of fish, crustaceans and molluscs" },
  { code: "47240", description: "Retail sale of bread, cakes, flour confectionery and sugar confectionery" },
  { code: "47250", description: "Retail sale of beverages" },
  { code: "47260", description: "Retail sale of tobacco products" },
  { code: "47290", description: "Other retail sale of food in specialised stores" },
  { code: "47310", description: "Retail sale of clothing" },
  { code: "47320", description: "Retail sale of footwear and leather goods" },
  { code: "47410", description: "Retail sale of books, newspapers and stationery" },
  { code: "47420", description: "Retail sale of music and video recordings" },
  { code: "47430", description: "Retail sale of sports goods, camping goods, boats and bicycles" },
  { code: "47440", description: "Retail sale of games and toys" },
  { code: "47450", description: "Retail sale of sport equipment" },
  { code: "47460", description: "Retail sale of flowers, plants, seeds, fertilisers, pet animals and pet food" },
  { code: "47470", description: "Retail sale of jewellery, bijouterie and related articles" },
  { code: "47480", description: "Other retail sale of new goods in specialised stores" },
  { code: "47490", description: "Retail sale of other household goods" },
  { code: "47500", description: "Retail sale of used goods" },
  { code: "47610", description: "Retail sale via stalls and markets of food, beverages and tobacco products" },
  { code: "47620", description: "Retail sale via stalls and markets of other goods" },
  { code: "47810", description: "Retail sale via mail order houses or via Internet" },
  { code: "47820", description: "Other non-store retail sale" },
  { code: "47900", description: "Other non-store retail sale" },
  { code: "49100", description: "Passenger rail transport, interurban" },
  { code: "49200", description: "Passenger rail transport, interurban" },
  { code: "49300", description: "Other passenger land transport" },
  { code: "49410", description: "Freight transport by road" },
  { code: "49420", description: "Removal services" },
  { code: "49500", description: "Transport via pipeline" },
  { code: "50100", description: "Sea and coastal freight water transport" },
  { code: "50200", description: "Sea and coastal passenger water transport" },
  { code: "50300", description: "Inland freight water transport" },
  { code: "50400", description: "Inland passenger water transport" },
  { code: "51100", description: "Passenger air transport" },
  { code: "51210", description: "Freight air transport" },
  { code: "51220", description: "Space transport" },
  { code: "52100", description: "Warehousing and storage" },
  { code: "52210", description: "Service activities incidental to land transportation" },
  { code: "52220", description: "Service activities incidental to water transportation" },
  { code: "52230", description: "Service activities incidental to air transportation" },
  { code: "52240", description: "Loading and unloading of cargo (except in ports and harbours)" },
  { code: "52290", description: "Other transportation support activities" },
  { code: "53100", description: "Postal activities under universal service obligation" },
  { code: "53200", description: "Other postal and courier activities" },
  { code: "55100", description: "Hotels and similar accommodation" },
  { code: "55200", description: "Holiday and other short-stay accommodation" },
  { code: "55300", description: "Camping grounds, recreational vehicle parks and trailer parks" },
  { code: "55900", description: "Other accommodation" },
  { code: "56101", description: "Licensed restaurants" },
  { code: "56102", description: "Unlicensed restaurants and cafes" },
  { code: "56103", description: "Take-away food shops and mobile food service activities" },
  { code: "56201", description: "Event catering activities" },
  { code: "56202", description: "Catering for events and other food service activities" },
  { code: "56210", description: "Event catering activities" },
  { code: "56220", description: "Catering for events and other food service activities" },
  { code: "56290", description: "Other food service activities" },
  { code: "56301", description: "Licensed bars" },
  { code: "56302", description: "Unlicensed bars" },
  { code: "58110", description: "Book publishing" },
  { code: "58120", description: "Publishing of directories and mailing lists" },
  { code: "58130", description: "Publishing of newspapers" },
  { code: "58140", description: "Publishing of journals and periodicals" },
  { code: "58190", description: "Other publishing activities" },
  { code: "58210", description: "Software publishing" },
  { code: "58290", description: "Other publishing of recorded media" },
  { code: "59110", description: "Motion picture, video and television programme production" },
  { code: "59120", description: "Motion picture, video and television programme post-production" },
  { code: "59130", description: "Motion picture, video and television programme distribution" },
  { code: "59140", description: "Motion picture projection" },
  { code: "59200", description: "Sound recording and music publishing activities" },
  { code: "60100", description: "Radio broadcasting" },
  { code: "60200", description: "Television programming and broadcasting activities" },
  { code: "61100", description: "Wired telecommunications activities" },
  { code: "61200", description: "Wireless telecommunications activities" },
  { code: "61300", description: "Satellite telecommunications activities" },
  { code: "61900", description: "Other telecommunications activities" },
  { code: "62010", description: "Data processing, hosting and related activities; web portals" },
  { code: "62011", description: "Data processing, hosting and related activities" },
  { code: "62012", description: "Web portals and internet intermediation activities" },
  { code: "62020", description: "Information technology consultancy activities" },
  { code: "62030", description: "Computer facilities management activities" },
  { code: "62090", description: "Other information technology service activities" },
  { code: "63110", description: "Data processing, hosting and related activities" },
  { code: "63120", description: "Web portals" },
  { code: "63210", description: "Data processing, hosting and related activities; web portals" },
  { code: "63220", description: "Data processing, hosting and related activities; web portals" },
  { code: "63230", description: "Preparation and development of web sites and other software and consultancy related to web and software development" },
  { code: "63910", description: "News agency activities" },
  { code: "63990", description: "Other information service activities n.e.c." },
  { code: "64110", description: "Central banking" },
  { code: "64191", description: "Banks" },
  { code: "64192", description: "Building societies" },
  { code: "64201", description: "Activities of building societies" },
  { code: "64209", description: "Other credit institutions" },
  { code: "64301", description: "Activities of mortgage finance companies" },
  { code: "64302", description: "Activities of other credit institutions" },
  { code: "64910", description: "Financial leasing" },
  { code: "64921", description: "Activities of credit card companies" },
  { code: "64922", description: "Activities of consumer finance providers" },
  { code: "64991", description: "Financial intermediation, other than insurance and pension funding, n.e.c." },
  { code: "64992", description: "Activities of mortgage finance companies" },
  { code: "65110", description: "Life insurance" },
  { code: "65120", description: "Non-life insurance" },
  { code: "65201", description: "Life reinsurance" },
  { code: "65202", description: "Non-life reinsurance" },
  { code: "65301", description: "Insurance and pension funding, except compulsory social security" },
  { code: "65302", description: "Pension funding activities" },
  { code: "66110", description: "Administration of financial markets" },
  { code: "66120", description: "Security brokerage services" },
  { code: "66190", description: "Other activities auxiliary to financial services, except insurance and pension funding" },
  { code: "66210", description: "Risk and damage evaluation (except compulsory social security)" },
  { code: "66220", description: "Activities of insurance agents and brokers" },
  { code: "66290", description: "Other activities auxiliary to insurance and pension funding" },
  { code: "66300", description: "Fund management activities" },
  { code: "66900", description: "Other professional, scientific and technical activities not elsewhere classified" },
  { code: "68100", description: "Buying and selling of own real estate" },
  { code: "68201", description: "Renting and operating of own or leased real estate" },
  { code: "68202", description: "Development of building projects for sale" },
  { code: "68209", description: "Other real estate activities" },
  { code: "68310", description: "Real estate agencies" },
  { code: "68320", description: "Management of real estate on a fee or contract basis" },
  { code: "69101", description: "Activities of lawyers" },
  { code: "69102", description: "Activities of notaries public" },
  { code: "69103", description: "Activities of patent and trademark agents" },
  { code: "69109", description: "Other professional, scientific and technical activities n.e.c." },
  { code: "69201", description: "Accounting and bookkeeping activities" },
  { code: "69202", description: "Auditing activities and tax consultancy" },
  { code: "70100", description: "Activities of head offices" },
  { code: "70210", description: "Public relations and communication activities" },
  { code: "70220", description: "Business and management consultancy activities" },
  { code: "73110", description: "Advertising agencies" },
  { code: "73120", description: "Media representation" },
  { code: "73200", description: "Market research and public opinion polling" },
  { code: "74100", description: "Design activities" },
  { code: "74201", description: "Photographic activities" },
  { code: "74202", description: "Photographic darkroom, studio and laboratory activities" },
  { code: "74203", description: "Translation and interpretation activities" },
  { code: "74209", description: "Other professional, scientific and technical activities n.e.c." },
  { code: "74300", description: "Specialised design activities" },
  { code: "74900", description: "Other professional, scientific and technical activities n.e.c." },
  { code: "75000", description: "Public administration and defence; compulsory social security" },
  { code: "75100", description: "General government administration" },
  { code: "75201", description: "Defence activities" },
  { code: "75202", description: "Compulsory social security activities" },
  { code: "75300", description: "Law and order and safety activities" },
  { code: "80100", description: "General secondary education" },
  { code: "80101", description: "General secondary education" },
  { code: "80102", description: "Technical and vocational secondary education" },
  { code: "80200", description: "Technical and vocational secondary education" },
  { code: "80210", description: "Post-secondary non-tertiary education" },
  { code: "80300", description: "Higher education" },
  { code: "80400", description: "Adult and other education" },
  { code: "85100", description: "Hospital activities" },
  { code: "85200", description: "Medical practice activities" },
  { code: "85310", description: "Dental practice activities" },
  { code: "85320", description: "Other human health activities" },
  { code: "85410", description: "Residential nursing care activities" },
  { code: "85420", description: "Social work activities without accommodation for the elderly and disabled" },
  { code: "85430", description: "Social work activities without accommodation for the elderly and disabled" },
  { code: "85492", description: "Social work activities without accommodation for the elderly and disabled" },
  { code: "85499", description: "Social work activities without accommodation for the elderly and disabled" },
  { code: "85500", description: "Social work activities without accommodation for the elderly and disabled" },
  { code: "86000", description: "Social work activities without accommodation for the elderly and disabled" },
  { code: "86100", description: "Hospital activities" },
  { code: "86210", description: "General medical practice activities" },
  { code: "86220", description: "Specialists medical practice activities" },
  { code: "86231", description: "Dental practice activities" },
  { code: "86232", description: "Dental practice activities" },
  { code: "86239", description: "Other health and social work activities" },
  { code: "86900", description: "Other health care activities" },
  { code: "87100", description: "Residential nursing care activities" },
  { code: "87200", description: "Residential care activities for people with learning disabilities, mental health problems and substance abuse" },
  { code: "87300", description: "Residential care activities for the elderly and disabled" },
  { code: "87900", description: "Other residential care activities" },
  { code: "88100", description: "Social work activities for the elderly and disabled without accommodation" },
  { code: "88910", description: "Child day-care activities" },
  { code: "88990", description: "Other social work activities without accommodation n.e.c." },
  { code: "90010", description: "Performing arts" },
  { code: "90020", description: "Support services to performing arts" },
  { code: "90030", description: "Artistic creation and interpretation" },
  { code: "90040", description: "Operation of arts facilities and other arts activities" },
  { code: "91010", description: "Library and archives activities" },
  { code: "91020", description: "Museums, historical sites and similar institutions" },
  { code: "91030", description: "Botanical and zoological gardens and nature reserves activities" },
  { code: "91040", description: "Sports activities and amusement and recreation activities" },
  { code: "92000", description: "Gambling and betting activities" },
  { code: "92110", description: "Gambling activities" },
  { code: "92120", description: "Betting activities" },
  { code: "93110", description: "Sports facilities operation" },
  { code: "93120", description: "Other sports activities" },
  { code: "93191", description: "Activities of sports clubs" },
  { code: "93199", description: "Other sports activities" },
  { code: "93210", description: "Amusement parks and theme parks" },
  { code: "93290", description: "Other amusement and recreation activities" },
  { code: "94110", description: "Activities of business and employers organisations" },
  { code: "94120", description: "Activities of professional organisations" },
  { code: "94200", description: "Activities of trade unions" },
  { code: "94910", description: "Religious organisations" },
  { code: "94920", description: "Activities of political organisations" },
  { code: "94990", description: "Activities of other membership organisations" },
  { code: "95110", description: "Repair of computers and peripheral equipment" },
  { code: "95120", description: "Repair of communication equipment" },
  { code: "95210", description: "Repair of consumer electronics" },
  { code: "95220", description: "Repair of household appliances and home and garden equipment" },
  { code: "95230", description: "Repair of footwear and leather goods" },
  { code: "95240", description: "Repair of furniture and furnishings" },
  { code: "95250", description: "Repair of watches, clocks and jewellery" },
  { code: "95290", description: "Repair of other personal goods" },
  { code: "96010", description: "Washing and (dry-)cleaning of textile and fur products" },
  { code: "96020", description: "Other laundry services" },
  { code: "96030", description: "Dry-cleaning and dyeing of textile and fur products" },
  { code: "96040", description: "Laundry service of uniforms and work clothes" },
  { code: "96090", description: "Other laundry services" },
  { code: "96020", description: "Laundry service of uniforms and work clothes" },
  { code: "96030", description: "Laundry service of uniforms and work clothes" },
  { code: "96040", description: "Laundry service of uniforms and work clothes" },
  { code: "96090", description: "Other laundry services" },
  { code: "96010", description: "Hairdressing and other beauty treatment" },
  { code: "96020", description: "Other personal service activities" },
  { code: "97000", description: "Activities of households as employers of domestic personnel" },
  { code: "97100", description: "Undifferentiated goods-producing activities of private households for own use" },
  { code: "97200", description: "Undifferentiated service-producing activities of private households for own use" },
  { code: "98100", description: "Activities of extraterritorial organisations and bodies" },
  { code: "98200", description: "Accommodation and food service activities" },
];
