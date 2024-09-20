export const $ApiTokenCreate = {
	properties: {
		password: {
	type: 'string',
	isRequired: true,
},
		token: {
	type: 'string',
	isRequired: true,
},
	},
} as const;

export const $ApiTokenResponse = {
	properties: {
		token_preview: {
	type: 'string',
	isRequired: true,
},
		created_at: {
	type: 'any-of',
	contains: [{
	type: 'string',
	format: 'date-time',
}, {
	type: 'null',
}],
},
		is_active: {
	type: 'boolean',
	isRequired: true,
},
	},
} as const;

export const $Body_external_invoices_process_external_invoices = {
	properties: {
		files: {
	type: 'array',
	contains: {
	type: 'binary',
	format: 'binary',
},
	isRequired: true,
},
	},
} as const;

export const $Body_internal_invoices_process_internal_invoices = {
	properties: {
		files: {
	type: 'array',
	contains: {
	type: 'binary',
	format: 'binary',
},
	isRequired: true,
},
	},
} as const;

export const $Body_login_login_access_token = {
	properties: {
		grant_type: {
	type: 'any-of',
	contains: [{
	type: 'string',
	pattern: 'password',
}, {
	type: 'null',
}],
},
		username: {
	type: 'string',
	isRequired: true,
},
		password: {
	type: 'string',
	isRequired: true,
},
		scope: {
	type: 'string',
	default: '',
},
		client_id: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		client_secret: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
	},
} as const;

export const $Body_users_upload_profile_picture = {
	properties: {
		file: {
	type: 'binary',
	isRequired: true,
	format: 'binary',
},
	},
} as const;

export const $ChatbotQuery = {
	properties: {
		query: {
	type: 'string',
	isRequired: true,
},
	},
} as const;

export const $CurrencyType = {
	type: 'Enum',
	enum: ['MAD','EUR',],
} as const;

export const $CustomerContactCreate = {
	properties: {
		contact_name: {
	type: 'string',
	isRequired: true,
},
		phone_number: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		email: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		address: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		bank_details: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		customer_id: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $CustomerContactPublic = {
	properties: {
		contact_name: {
	type: 'string',
	isRequired: true,
},
		phone_number: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		email: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		address: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		bank_details: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		id: {
	type: 'number',
	isRequired: true,
},
		customer_id: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $CustomerContactUpdate = {
	properties: {
		contact_name: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		phone_number: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		email: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		address: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		bank_details: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		customer_id: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $CustomerContactsPublic = {
	properties: {
		data: {
	type: 'array',
	contains: {
		type: 'CustomerContactPublic',
	},
	isRequired: true,
},
		count: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $CustomerCreate = {
	properties: {
		name: {
	type: 'string',
	isRequired: true,
},
		ice: {
	type: 'string',
	isRequired: true,
},
		postal_code: {
	type: 'string',
	isRequired: true,
},
		rib: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
	},
} as const;

export const $CustomerPublic = {
	properties: {
		name: {
	type: 'string',
	isRequired: true,
},
		ice: {
	type: 'string',
	isRequired: true,
},
		postal_code: {
	type: 'string',
	isRequired: true,
},
		rib: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		id: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $CustomerUpdate = {
	properties: {
		name: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		ice: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		postal_code: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		rib: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
	},
} as const;

export const $CustomersPublic = {
	properties: {
		data: {
	type: 'array',
	contains: {
		type: 'CustomerPublic',
	},
	isRequired: true,
},
		count: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $EntityPayment = {
	properties: {
		name: {
	type: 'string',
	isRequired: true,
},
		total_payment: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $ExternalInvoiceCreate = {
	properties: {
		reference: {
	type: 'string',
	isRequired: true,
},
		invoice_date: {
	type: 'string',
	isRequired: true,
	format: 'date',
},
		due_date: {
	type: 'string',
	isRequired: true,
	format: 'date',
},
		amount_ttc: {
	type: 'number',
	isRequired: true,
},
		amount_ht: {
	type: 'number',
	isRequired: true,
},
		vat: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
		currency_type: {
	type: 'CurrencyType',
	isRequired: true,
},
		supplier_id: {
	type: 'number',
	isRequired: true,
},
		project_id: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $ExternalInvoicePublic = {
	properties: {
		reference: {
	type: 'string',
	isRequired: true,
},
		invoice_date: {
	type: 'string',
	isRequired: true,
	format: 'date',
},
		due_date: {
	type: 'string',
	isRequired: true,
	format: 'date',
},
		amount_ttc: {
	type: 'number',
	isRequired: true,
},
		amount_ht: {
	type: 'number',
	isRequired: true,
},
		vat: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
		currency_type: {
	type: 'CurrencyType',
	isRequired: true,
},
		id: {
	type: 'number',
	isRequired: true,
},
		supplier_id: {
	type: 'number',
	isRequired: true,
},
		project_id: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $ExternalInvoiceUpdate = {
	properties: {
		reference: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		invoice_date: {
	type: 'any-of',
	contains: [{
	type: 'string',
	format: 'date',
}, {
	type: 'null',
}],
},
		due_date: {
	type: 'any-of',
	contains: [{
	type: 'string',
	format: 'date',
}, {
	type: 'null',
}],
},
		amount_ttc: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
		amount_ht: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
		vat: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
		currency_type: {
	type: 'any-of',
	contains: [{
	type: 'CurrencyType',
}, {
	type: 'null',
}],
},
		supplier_id: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
		project_id: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
	},
} as const;

export const $ExternalInvoicesPublic = {
	properties: {
		data: {
	type: 'array',
	contains: {
		type: 'ExternalInvoicePublic',
	},
	isRequired: true,
},
		count: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $FullApiTokenResponse = {
	properties: {
		token: {
	type: 'string',
	isRequired: true,
},
		created_at: {
	type: 'string',
	isRequired: true,
	format: 'date-time',
},
		is_active: {
	type: 'boolean',
	isRequired: true,
},
	},
} as const;

export const $HTTPValidationError = {
	properties: {
		detail: {
	type: 'array',
	contains: {
		type: 'ValidationError',
	},
},
	},
} as const;

export const $InternalInvoiceCreate = {
	properties: {
		reference: {
	type: 'string',
	isRequired: true,
},
		invoice_date: {
	type: 'string',
	isRequired: true,
	format: 'date',
},
		due_date: {
	type: 'string',
	isRequired: true,
	format: 'date',
},
		amount_ttc: {
	type: 'number',
	isRequired: true,
},
		amount_ht: {
	type: 'number',
	isRequired: true,
},
		vat: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
		currency_type: {
	type: 'CurrencyType',
	isRequired: true,
},
		customer_id: {
	type: 'number',
	isRequired: true,
},
		project_id: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $InternalInvoicePublic = {
	properties: {
		reference: {
	type: 'string',
	isRequired: true,
},
		invoice_date: {
	type: 'string',
	isRequired: true,
	format: 'date',
},
		due_date: {
	type: 'string',
	isRequired: true,
	format: 'date',
},
		amount_ttc: {
	type: 'number',
	isRequired: true,
},
		amount_ht: {
	type: 'number',
	isRequired: true,
},
		vat: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
		currency_type: {
	type: 'CurrencyType',
	isRequired: true,
},
		id: {
	type: 'number',
	isRequired: true,
},
		customer_id: {
	type: 'number',
	isRequired: true,
},
		project_id: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $InternalInvoiceUpdate = {
	properties: {
		reference: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		invoice_date: {
	type: 'any-of',
	contains: [{
	type: 'string',
	format: 'date',
}, {
	type: 'null',
}],
},
		due_date: {
	type: 'any-of',
	contains: [{
	type: 'string',
	format: 'date',
}, {
	type: 'null',
}],
},
		amount_ttc: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
		amount_ht: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
		vat: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
		currency_type: {
	type: 'any-of',
	contains: [{
	type: 'CurrencyType',
}, {
	type: 'null',
}],
},
		customer_id: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
		project_id: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
	},
} as const;

export const $InternalInvoicesPublic = {
	properties: {
		data: {
	type: 'array',
	contains: {
		type: 'InternalInvoicePublic',
	},
	isRequired: true,
},
		count: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $InvoiceProcessingResponse = {
	properties: {
		data: {
	type: 'array',
	contains: {
	type: 'dictionary',
	contains: {
	properties: {
	},
},
},
	isRequired: true,
},
	},
} as const;

export const $Message = {
	properties: {
		message: {
	type: 'string',
	isRequired: true,
},
	},
} as const;

export const $NewPassword = {
	properties: {
		token: {
	type: 'string',
	isRequired: true,
},
		new_password: {
	type: 'string',
	isRequired: true,
},
	},
} as const;

export const $PartCreate = {
	properties: {
		item_code: {
	type: 'string',
	isRequired: true,
},
		description: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		quantity: {
	type: 'number',
	default: 1,
},
		unit_price: {
	type: 'number',
	isRequired: true,
},
		external_invoice_id: {
	type: 'number',
	isRequired: true,
},
		supplier_id: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
		project_id: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
	},
} as const;

export const $PartPublic = {
	properties: {
		item_code: {
	type: 'string',
	isRequired: true,
},
		description: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		quantity: {
	type: 'number',
	default: 1,
},
		unit_price: {
	type: 'number',
	isRequired: true,
},
		id: {
	type: 'number',
	isRequired: true,
},
		amount: {
	type: 'number',
	isRequired: true,
},
		project_id: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
	isRequired: true,
},
		external_invoice_id: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
	isRequired: true,
},
		supplier_id: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
	isRequired: true,
},
	},
} as const;

export const $PartUpdate = {
	properties: {
		item_code: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		description: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		quantity: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
		unit_price: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
		external_invoice_id: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
		supplier_id: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
		project_id: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
	},
} as const;

export const $PartsPublic = {
	properties: {
		data: {
	type: 'array',
	contains: {
		type: 'PartPublic',
	},
	isRequired: true,
},
		count: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $PaymentFromCustomerCreate = {
	properties: {
		payment_status: {
	type: 'PaymentStatus',
	isRequired: true,
},
		payment_mode: {
	type: 'PaymentMode',
	isRequired: true,
},
		amount: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
		remaining: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
		disbursement_date: {
	type: 'string',
	isRequired: true,
	format: 'date',
},
		payment_ref: {
	type: 'string',
	isRequired: true,
},
		additional_fees: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
		internal_invoice_id: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $PaymentFromCustomerPublic = {
	properties: {
		payment_status: {
	type: 'PaymentStatus',
	isRequired: true,
},
		payment_mode: {
	type: 'PaymentMode',
	isRequired: true,
},
		amount: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
		remaining: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
		disbursement_date: {
	type: 'string',
	isRequired: true,
	format: 'date',
},
		payment_ref: {
	type: 'string',
	isRequired: true,
},
		additional_fees: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
		id: {
	type: 'number',
	isRequired: true,
},
		internal_invoice_id: {
	type: 'number',
	isRequired: true,
},
		customer_id: {
	type: 'number',
	isRequired: true,
},
		project_id: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $PaymentFromCustomerUpdate = {
	properties: {
		payment_status: {
	type: 'any-of',
	contains: [{
	type: 'PaymentStatus',
}, {
	type: 'null',
}],
},
		payment_mode: {
	type: 'any-of',
	contains: [{
	type: 'PaymentMode',
}, {
	type: 'null',
}],
},
		amount: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
		remaining: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
		disbursement_date: {
	type: 'any-of',
	contains: [{
	type: 'string',
	format: 'date',
}, {
	type: 'null',
}],
},
		payment_ref: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		additional_fees: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
		internal_invoice_id: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
	},
} as const;

export const $PaymentFromCustomersPublic = {
	properties: {
		data: {
	type: 'array',
	contains: {
		type: 'PaymentFromCustomerPublic',
	},
	isRequired: true,
},
		count: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $PaymentMode = {
	type: 'Enum',
	enum: ['Cash','Bank Transfer','Check','Credit',],
} as const;

export const $PaymentStatus = {
	type: 'Enum',
	enum: ['Paid','Pending','Partial','Failed','Missing',],
} as const;

export const $PaymentToSupplierCreate = {
	properties: {
		payment_status: {
	type: 'PaymentStatus',
	isRequired: true,
},
		payment_mode: {
	type: 'PaymentMode',
	isRequired: true,
},
		amount: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
		remaining: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
		disbursement_date: {
	type: 'string',
	isRequired: true,
	format: 'date',
},
		payment_ref: {
	type: 'string',
	isRequired: true,
},
		additional_fees: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
		external_invoice_id: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $PaymentToSupplierPublic = {
	properties: {
		payment_status: {
	type: 'PaymentStatus',
	isRequired: true,
},
		payment_mode: {
	type: 'PaymentMode',
	isRequired: true,
},
		amount: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
		remaining: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
		disbursement_date: {
	type: 'string',
	isRequired: true,
	format: 'date',
},
		payment_ref: {
	type: 'string',
	isRequired: true,
},
		additional_fees: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
		id: {
	type: 'number',
	isRequired: true,
},
		external_invoice_id: {
	type: 'number',
	isRequired: true,
},
		supplier_id: {
	type: 'number',
	isRequired: true,
},
		project_id: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $PaymentToSupplierUpdate = {
	properties: {
		payment_status: {
	type: 'any-of',
	contains: [{
	type: 'PaymentStatus',
}, {
	type: 'null',
}],
},
		payment_mode: {
	type: 'any-of',
	contains: [{
	type: 'PaymentMode',
}, {
	type: 'null',
}],
},
		amount: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
		remaining: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
		disbursement_date: {
	type: 'any-of',
	contains: [{
	type: 'string',
	format: 'date',
}, {
	type: 'null',
}],
},
		payment_ref: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		additional_fees: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
		external_invoice_id: {
	type: 'any-of',
	contains: [{
	type: 'number',
}, {
	type: 'null',
}],
},
	},
} as const;

export const $PaymentToSuppliersPublic = {
	properties: {
		data: {
	type: 'array',
	contains: {
		type: 'PaymentToSupplierPublic',
	},
	isRequired: true,
},
		count: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $ProjectCreate = {
	properties: {
		name: {
	type: 'string',
	isRequired: true,
},
		description: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		is_active: {
	type: 'boolean',
	default: true,
},
	},
} as const;

export const $ProjectData = {
	properties: {
		project_name: {
	type: 'string',
	isRequired: true,
},
		income: {
	type: 'number',
	isRequired: true,
},
		expenses: {
	type: 'number',
	isRequired: true,
},
		profit: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $ProjectPublic = {
	properties: {
		name: {
	type: 'string',
	isRequired: true,
},
		description: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		is_active: {
	type: 'boolean',
	isRequired: true,
},
		id: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $ProjectUpdate = {
	properties: {
		name: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		description: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		is_active: {
	type: 'any-of',
	contains: [{
	type: 'boolean',
}, {
	type: 'null',
}],
},
	},
} as const;

export const $ProjectsPublic = {
	properties: {
		data: {
	type: 'array',
	contains: {
		type: 'ProjectPublic',
	},
	isRequired: true,
},
		count: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $ReportData = {
	properties: {
		total_income: {
	type: 'number',
	isRequired: true,
},
		total_expenses: {
	type: 'number',
	isRequired: true,
},
		net_profit: {
	type: 'number',
	isRequired: true,
},
		total_receivables: {
	type: 'number',
	isRequired: true,
},
		total_payables: {
	type: 'number',
	isRequired: true,
},
		project_data: {
	type: 'array',
	contains: {
		type: 'ProjectData',
	},
	isRequired: true,
},
		top_customers: {
	type: 'array',
	contains: {
		type: 'EntityPayment',
	},
	isRequired: true,
},
		top_suppliers: {
	type: 'array',
	contains: {
		type: 'EntityPayment',
	},
	isRequired: true,
},
	},
} as const;

export const $ReportRequest = {
	properties: {
		start_date: {
	type: 'string',
	isRequired: true,
	format: 'date',
},
		end_date: {
	type: 'string',
	isRequired: true,
	format: 'date',
},
		report_type: {
	type: 'string',
	isRequired: true,
},
		output_format: {
	type: 'string',
	isRequired: true,
},
	},
} as const;

export const $ReportResponse = {
	properties: {
		data: {
	type: 'ReportData',
	isRequired: true,
},
		start_date: {
	type: 'string',
	isRequired: true,
	format: 'date',
},
		end_date: {
	type: 'string',
	isRequired: true,
	format: 'date',
},
		report_type: {
	type: 'string',
	isRequired: true,
},
	},
} as const;

export const $SupplierContactCreate = {
	properties: {
		contact_name: {
	type: 'string',
	isRequired: true,
},
		phone_number: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		email: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		address: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		bank_details: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		supplier_id: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $SupplierContactPublic = {
	properties: {
		contact_name: {
	type: 'string',
	isRequired: true,
},
		phone_number: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		email: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		address: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		bank_details: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		id: {
	type: 'number',
	isRequired: true,
},
		supplier_id: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $SupplierContactUpdate = {
	properties: {
		contact_name: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		phone_number: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		email: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		address: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		bank_details: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		supplier_id: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $SupplierContactsPublic = {
	properties: {
		data: {
	type: 'array',
	contains: {
		type: 'SupplierContactPublic',
	},
	isRequired: true,
},
		count: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $SupplierCreate = {
	properties: {
		name: {
	type: 'string',
	isRequired: true,
},
		ice: {
	type: 'string',
	isRequired: true,
},
		postal_code: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		rib: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
	},
} as const;

export const $SupplierPublic = {
	properties: {
		name: {
	type: 'string',
	isRequired: true,
},
		ice: {
	type: 'string',
	isRequired: true,
},
		postal_code: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		rib: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		id: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $SupplierUpdate = {
	properties: {
		name: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		ice: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		postal_code: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		rib: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
	},
} as const;

export const $SuppliersPublic = {
	properties: {
		data: {
	type: 'array',
	contains: {
		type: 'SupplierPublic',
	},
	isRequired: true,
},
		count: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $TaskCreate = {
	properties: {
		title: {
	type: 'string',
	isRequired: true,
},
		description: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		status: {
	type: 'TaskStatus',
	isRequired: true,
},
		due_date: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		is_active: {
	type: 'boolean',
	default: true,
},
	},
} as const;

export const $TaskPublic = {
	properties: {
		title: {
	type: 'string',
	isRequired: true,
},
		description: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		status: {
	type: 'TaskStatus',
	isRequired: true,
},
		due_date: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		is_active: {
	type: 'boolean',
	default: true,
},
		id: {
	type: 'number',
	isRequired: true,
},
		user_id: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $TaskStatus = {
	type: 'Enum',
	enum: ['To Do','In Progress','Done',],
} as const;

export const $TaskUpdate = {
	properties: {
		title: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		description: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		status: {
	type: 'any-of',
	contains: [{
	type: 'TaskStatus',
}, {
	type: 'null',
}],
},
		due_date: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		is_active: {
	type: 'any-of',
	contains: [{
	type: 'boolean',
}, {
	type: 'null',
}],
},
	},
} as const;

export const $TasksPublic = {
	properties: {
		data: {
	type: 'array',
	contains: {
		type: 'TaskPublic',
	},
	isRequired: true,
},
		count: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $Token = {
	properties: {
		access_token: {
	type: 'string',
	isRequired: true,
},
		token_type: {
	type: 'string',
	default: 'bearer',
},
	},
} as const;

export const $UpdatePassword = {
	properties: {
		current_password: {
	type: 'string',
	isRequired: true,
},
		new_password: {
	type: 'string',
	isRequired: true,
},
	},
} as const;

export const $UserCreate = {
	properties: {
		email: {
	type: 'string',
	isRequired: true,
},
		is_active: {
	type: 'boolean',
	default: true,
},
		is_superuser: {
	type: 'boolean',
	default: false,
},
		full_name: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		api_token_enabled: {
	type: 'boolean',
	default: false,
},
		profile_picture: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		password: {
	type: 'string',
	isRequired: true,
},
	},
} as const;

export const $UserPublic = {
	properties: {
		email: {
	type: 'string',
	isRequired: true,
},
		is_active: {
	type: 'boolean',
	default: true,
},
		is_superuser: {
	type: 'boolean',
	default: false,
},
		full_name: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		api_token_enabled: {
	type: 'boolean',
	default: false,
},
		profile_picture: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		id: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $UserRegister = {
	properties: {
		email: {
	type: 'string',
	isRequired: true,
},
		password: {
	type: 'string',
	isRequired: true,
},
		full_name: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
	},
} as const;

export const $UserUpdate = {
	properties: {
		email: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		is_active: {
	type: 'boolean',
	default: true,
},
		is_superuser: {
	type: 'boolean',
	default: false,
},
		full_name: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		api_token_enabled: {
	type: 'any-of',
	contains: [{
	type: 'boolean',
}, {
	type: 'null',
}],
},
		profile_picture: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		password: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
	},
} as const;

export const $UserUpdateMe = {
	properties: {
		full_name: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		email: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		api_token_enabled: {
	type: 'any-of',
	contains: [{
	type: 'boolean',
}, {
	type: 'null',
}],
},
		profile_picture: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
	},
} as const;

export const $UsersPublic = {
	properties: {
		data: {
	type: 'array',
	contains: {
		type: 'UserPublic',
	},
	isRequired: true,
},
		count: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $ValidationError = {
	properties: {
		loc: {
	type: 'array',
	contains: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'number',
}],
},
	isRequired: true,
},
		msg: {
	type: 'string',
	isRequired: true,
},
		type: {
	type: 'string',
	isRequired: true,
},
	},
} as const;