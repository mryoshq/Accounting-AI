export type Body_external_invoices_process_external_invoices = {
	files: Array<Blob | File>;
};



export type Body_internal_invoices_process_internal_invoices = {
	files: Array<Blob | File>;
};



export type Body_login_login_access_token = {
	grant_type?: string | null;
	username: string;
	password: string;
	scope?: string;
	client_id?: string | null;
	client_secret?: string | null;
};



export type CurrencyType = 'MAD' | 'EUR';



export type CustomerContactCreate = {
	contact_name: string;
	phone_number?: string | null;
	email?: string | null;
	address?: string | null;
	bank_details?: string | null;
	customer_id: number;
};



export type CustomerContactPublic = {
	contact_name: string;
	phone_number?: string | null;
	email?: string | null;
	address?: string | null;
	bank_details?: string | null;
	id: number;
	customer_id: number;
};



export type CustomerContactUpdate = {
	contact_name?: string | null;
	phone_number?: string | null;
	email?: string | null;
	address?: string | null;
	bank_details?: string | null;
	customer_id: number;
};



export type CustomerContactsPublic = {
	data: Array<CustomerContactPublic>;
	count: number;
};



export type CustomerCreate = {
	name: string;
	ice: string;
	postal_code: string;
	rib?: string | null;
};



export type CustomerPublic = {
	name: string;
	ice: string;
	postal_code: string;
	rib?: string | null;
	id: number;
};



export type CustomerUpdate = {
	name?: string | null;
	ice?: string | null;
	postal_code?: string | null;
	rib?: string | null;
};



export type CustomersPublic = {
	data: Array<CustomerPublic>;
	count: number;
};



export type ExternalInvoiceCreate = {
	reference: string;
	invoice_date: string;
	due_date: string;
	amount_ttc: number;
	amount_ht: number;
	vat?: number | null;
	currency_type: CurrencyType;
	supplier_id: number;
	project_id: number;
};



export type ExternalInvoicePublic = {
	reference: string;
	invoice_date: string;
	due_date: string;
	amount_ttc: number;
	amount_ht: number;
	vat?: number | null;
	currency_type: CurrencyType;
	id: number;
	supplier_id: number;
	project_id: number;
};



export type ExternalInvoiceUpdate = {
	reference?: string | null;
	invoice_date?: string | null;
	due_date?: string | null;
	amount_ttc?: number | null;
	amount_ht?: number | null;
	vat?: number | null;
	currency_type?: CurrencyType | null;
	supplier_id?: number | null;
	project_id?: number | null;
};



export type ExternalInvoicesPublic = {
	data: Array<ExternalInvoicePublic>;
	count: number;
};



export type HTTPValidationError = {
	detail?: Array<ValidationError>;
};



export type InternalInvoiceCreate = {
	reference: string;
	invoice_date: string;
	due_date: string;
	amount_ttc: number;
	amount_ht: number;
	vat?: number | null;
	currency_type: CurrencyType;
	customer_id: number;
	project_id: number;
};



export type InternalInvoicePublic = {
	reference: string;
	invoice_date: string;
	due_date: string;
	amount_ttc: number;
	amount_ht: number;
	vat?: number | null;
	currency_type: CurrencyType;
	id: number;
	customer_id: number;
	project_id: number;
};



export type InternalInvoiceUpdate = {
	reference?: string | null;
	invoice_date?: string | null;
	due_date?: string | null;
	amount_ttc?: number | null;
	amount_ht?: number | null;
	vat?: number | null;
	currency_type?: CurrencyType | null;
	customer_id?: number | null;
	project_id?: number | null;
};



export type InternalInvoicesPublic = {
	data: Array<InternalInvoicePublic>;
	count: number;
};



export type InvoiceProcessingResponse = {
	data: Array<Record<string, unknown>>;
};



export type Message = {
	message: string;
};



export type NewPassword = {
	token: string;
	new_password: string;
};



export type PartCreate = {
	item_code: string;
	description?: string | null;
	quantity?: number;
	unit_price: number;
	external_invoice_id: number;
	supplier_id?: number | null;
	project_id?: number | null;
};



export type PartPublic = {
	item_code: string;
	description?: string | null;
	quantity?: number;
	unit_price: number;
	id: number;
	amount: number;
	project_id: number | null;
	external_invoice_id: number | null;
	supplier_id: number | null;
};



export type PartUpdate = {
	item_code?: string | null;
	description?: string | null;
	quantity?: number | null;
	unit_price?: number | null;
	external_invoice_id?: number | null;
	supplier_id?: number | null;
	project_id?: number | null;
};



export type PartsPublic = {
	data: Array<PartPublic>;
	count: number;
};



export type PaymentFromCustomerCreate = {
	payment_status: PaymentStatus;
	payment_mode: PaymentMode;
	amount?: number | null;
	remaining?: number | null;
	disbursement_date: string;
	payment_ref: string;
	additional_fees?: number | null;
	internal_invoice_id: number;
};



export type PaymentFromCustomerPublic = {
	payment_status: PaymentStatus;
	payment_mode: PaymentMode;
	amount?: number | null;
	remaining?: number | null;
	disbursement_date: string;
	payment_ref: string;
	additional_fees?: number | null;
	id: number;
	internal_invoice_id: number;
	customer_id: number;
	project_id: number;
};



export type PaymentFromCustomerUpdate = {
	payment_status?: PaymentStatus | null;
	payment_mode?: PaymentMode | null;
	amount?: number | null;
	remaining?: number | null;
	disbursement_date?: string | null;
	payment_ref?: string | null;
	additional_fees?: number | null;
	internal_invoice_id?: number | null;
};



export type PaymentFromCustomersPublic = {
	data: Array<PaymentFromCustomerPublic>;
	count: number;
};



export type PaymentMode = 'Cash' | 'Bank Transfer' | 'Check' | 'Credit';



export type PaymentStatus = 'Paid' | 'Pending' | 'Partial' | 'Failed' | 'Missing';



export type PaymentToSupplierCreate = {
	payment_status: PaymentStatus;
	payment_mode: PaymentMode;
	amount?: number | null;
	remaining?: number | null;
	disbursement_date: string;
	payment_ref: string;
	additional_fees?: number | null;
	external_invoice_id: number;
};



export type PaymentToSupplierPublic = {
	payment_status: PaymentStatus;
	payment_mode: PaymentMode;
	amount?: number | null;
	remaining?: number | null;
	disbursement_date: string;
	payment_ref: string;
	additional_fees?: number | null;
	id: number;
	external_invoice_id: number;
	supplier_id: number;
	project_id: number;
};



export type PaymentToSupplierUpdate = {
	payment_status?: PaymentStatus | null;
	payment_mode?: PaymentMode | null;
	amount?: number | null;
	remaining?: number | null;
	disbursement_date?: string | null;
	payment_ref?: string | null;
	additional_fees?: number | null;
	external_invoice_id?: number | null;
};



export type PaymentToSuppliersPublic = {
	data: Array<PaymentToSupplierPublic>;
	count: number;
};



export type ProjectCreate = {
	name: string;
	description?: string | null;
	is_active?: boolean;
};



export type ProjectPublic = {
	name: string;
	description?: string | null;
	is_active: boolean;
	id: number;
};



export type ProjectUpdate = {
	name?: string | null;
	description?: string | null;
	is_active?: boolean | null;
};



export type ProjectsPublic = {
	data: Array<ProjectPublic>;
	count: number;
};



export type ReportData = {
	total_income: number;
	total_expenses: number;
	net_profit: number;
};



export type ReportRequest = {
	start_date: string;
	end_date: string;
	report_type: string;
	output_format: string;
};



export type ReportResponse = {
	data: ReportData;
	start_date: string;
	end_date: string;
	report_type: string;
};



export type SupplierContactCreate = {
	contact_name: string;
	phone_number?: string | null;
	email?: string | null;
	address?: string | null;
	bank_details?: string | null;
	supplier_id: number;
};



export type SupplierContactPublic = {
	contact_name: string;
	phone_number?: string | null;
	email?: string | null;
	address?: string | null;
	bank_details?: string | null;
	id: number;
	supplier_id: number;
};



export type SupplierContactUpdate = {
	contact_name?: string | null;
	phone_number?: string | null;
	email?: string | null;
	address?: string | null;
	bank_details?: string | null;
	supplier_id: number;
};



export type SupplierContactsPublic = {
	data: Array<SupplierContactPublic>;
	count: number;
};



export type SupplierCreate = {
	name: string;
	ice: string;
	postal_code?: string | null;
	rib?: string | null;
};



export type SupplierPublic = {
	name: string;
	ice: string;
	postal_code?: string | null;
	rib?: string | null;
	id: number;
};



export type SupplierUpdate = {
	name?: string | null;
	ice?: string | null;
	postal_code?: string | null;
	rib?: string | null;
};



export type SuppliersPublic = {
	data: Array<SupplierPublic>;
	count: number;
};



export type Token = {
	access_token: string;
	token_type?: string;
};



export type UpdatePassword = {
	current_password: string;
	new_password: string;
};



export type UserCreate = {
	email: string;
	is_active?: boolean;
	is_superuser?: boolean;
	full_name?: string | null;
	password: string;
};



export type UserPublic = {
	email: string;
	is_active?: boolean;
	is_superuser?: boolean;
	full_name?: string | null;
	id: number;
};



export type UserRegister = {
	email: string;
	password: string;
	full_name?: string | null;
};



export type UserUpdate = {
	email?: string | null;
	is_active?: boolean;
	is_superuser?: boolean;
	full_name?: string | null;
	password?: string | null;
};



export type UserUpdateMe = {
	full_name?: string | null;
	email?: string | null;
};



export type UsersPublic = {
	data: Array<UserPublic>;
	count: number;
};



export type ValidationError = {
	loc: Array<string | number>;
	msg: string;
	type: string;
};

