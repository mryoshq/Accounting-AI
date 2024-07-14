import type { CancelablePromise } from './core/CancelablePromise';
import { OpenAPI } from './core/OpenAPI';
import { request as __request } from './core/request';

import type { Body_login_login_access_token,Message,NewPassword,Token,UserPublic,UpdatePassword,UserCreate,UserRegister,UsersPublic,UserUpdate,UserUpdateMe,PartPublic,PartsPublic,PaymentToSuppliersPublic,ProjectCreate,ProjectPublic,ProjectsPublic,ProjectUpdate,ExternalInvoicesPublic,SupplierContactCreate,SupplierContactPublic,SupplierContactsPublic,SupplierContactUpdate,SupplierCreate,SupplierPublic,SuppliersPublic,SupplierUpdate,CustomerContactCreate,CustomerContactPublic,CustomerContactsPublic,CustomerContactUpdate,CustomerCreate,CustomerPublic,CustomersPublic,CustomerUpdate,InternalInvoicesPublic,PaymentFromCustomersPublic,PartCreate,PartUpdate,Body_external_invoices_process_external_invoices,ExternalInvoiceCreate,ExternalInvoicePublic,ExternalInvoiceUpdate,InvoiceProcessingResponse,Body_internal_invoices_process_internal_invoices,InternalInvoiceCreate,InternalInvoicePublic,InternalInvoiceUpdate,PaymentToSupplierCreate,PaymentToSupplierPublic,PaymentToSupplierUpdate,PaymentFromCustomerCreate,PaymentFromCustomerPublic,PaymentFromCustomerUpdate } from './models';

export type TDataLoginAccessToken = {
                formData: Body_login_login_access_token
                
            }
export type TDataRecoverPassword = {
                email: string
                
            }
export type TDataResetPassword = {
                requestBody: NewPassword
                
            }
export type TDataRecoverPasswordHtmlContent = {
                email: string
                
            }

export class LoginService {

	/**
	 * Login Access Token
	 * OAuth2 compatible token login, get an access token for future requests
	 * @returns Token Successful Response
	 * @throws ApiError
	 */
	public static loginAccessToken(data: TDataLoginAccessToken): CancelablePromise<Token> {
		const {
formData,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/login/access-token',
			formData: formData,
			mediaType: 'application/x-www-form-urlencoded',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Test Token
	 * Test access token
	 * @returns UserPublic Successful Response
	 * @throws ApiError
	 */
	public static testToken(): CancelablePromise<UserPublic> {
				return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/login/test-token',
		});
	}

	/**
	 * Recover Password
	 * Password Recovery
	 * @returns Message Successful Response
	 * @throws ApiError
	 */
	public static recoverPassword(data: TDataRecoverPassword): CancelablePromise<Message> {
		const {
email,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/password-recovery/{email}',
			path: {
				email
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Reset Password
	 * Reset password
	 * @returns Message Successful Response
	 * @throws ApiError
	 */
	public static resetPassword(data: TDataResetPassword): CancelablePromise<Message> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/reset-password/',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Recover Password Html Content
	 * HTML Content for Password Recovery
	 * @returns string Successful Response
	 * @throws ApiError
	 */
	public static recoverPasswordHtmlContent(data: TDataRecoverPasswordHtmlContent): CancelablePromise<string> {
		const {
email,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/password-recovery-html-content/{email}',
			path: {
				email
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

}

export type TDataReadUsers = {
                limit?: number
skip?: number
                
            }
export type TDataCreateUser = {
                requestBody: UserCreate
                
            }
export type TDataUpdateUserMe = {
                requestBody: UserUpdateMe
                
            }
export type TDataUpdatePasswordMe = {
                requestBody: UpdatePassword
                
            }
export type TDataRegisterUser = {
                requestBody: UserRegister
                
            }
export type TDataReadUserById = {
                userId: number
                
            }
export type TDataUpdateUser = {
                requestBody: UserUpdate
userId: number
                
            }
export type TDataDeleteUser = {
                userId: number
                
            }

export class UsersService {

	/**
	 * Read Users
	 * Retrieve users.
	 * @returns UsersPublic Successful Response
	 * @throws ApiError
	 */
	public static readUsers(data: TDataReadUsers = {}): CancelablePromise<UsersPublic> {
		const {
limit = 100,
skip = 0,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/users/',
			query: {
				skip, limit
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Create User
	 * Create new user.
	 * @returns UserPublic Successful Response
	 * @throws ApiError
	 */
	public static createUser(data: TDataCreateUser): CancelablePromise<UserPublic> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/users/',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read User Me
	 * Get current user.
	 * @returns UserPublic Successful Response
	 * @throws ApiError
	 */
	public static readUserMe(): CancelablePromise<UserPublic> {
				return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/users/me',
		});
	}

	/**
	 * Delete User Me
	 * Delete own user.
	 * @returns Message Successful Response
	 * @throws ApiError
	 */
	public static deleteUserMe(): CancelablePromise<Message> {
				return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/v1/users/me',
		});
	}

	/**
	 * Update User Me
	 * Update own user.
	 * @returns UserPublic Successful Response
	 * @throws ApiError
	 */
	public static updateUserMe(data: TDataUpdateUserMe): CancelablePromise<UserPublic> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'PATCH',
			url: '/api/v1/users/me',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Update Password Me
	 * Update own password.
	 * @returns Message Successful Response
	 * @throws ApiError
	 */
	public static updatePasswordMe(data: TDataUpdatePasswordMe): CancelablePromise<Message> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'PATCH',
			url: '/api/v1/users/me/password',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Register User
	 * Create new user without the need to be logged in.
	 * @returns UserPublic Successful Response
	 * @throws ApiError
	 */
	public static registerUser(data: TDataRegisterUser): CancelablePromise<UserPublic> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/users/signup',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read User By Id
	 * Get a specific user by id.
	 * @returns UserPublic Successful Response
	 * @throws ApiError
	 */
	public static readUserById(data: TDataReadUserById): CancelablePromise<UserPublic> {
		const {
userId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/users/{user_id}',
			path: {
				user_id: userId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Update User
	 * Update a user.
	 * @returns UserPublic Successful Response
	 * @throws ApiError
	 */
	public static updateUser(data: TDataUpdateUser): CancelablePromise<UserPublic> {
		const {
requestBody,
userId,
} = data;
		return __request(OpenAPI, {
			method: 'PATCH',
			url: '/api/v1/users/{user_id}',
			path: {
				user_id: userId
			},
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Delete User
	 * Delete a user.
	 * @returns Message Successful Response
	 * @throws ApiError
	 */
	public static deleteUser(data: TDataDeleteUser): CancelablePromise<Message> {
		const {
userId,
} = data;
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/v1/users/{user_id}',
			path: {
				user_id: userId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

}

export type TDataTestEmail = {
                emailTo: string
                
            }

export class UtilsService {

	/**
	 * Test Email
	 * Test emails.
	 * @returns Message Successful Response
	 * @throws ApiError
	 */
	public static testEmail(data: TDataTestEmail): CancelablePromise<Message> {
		const {
emailTo,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/utils/test-email/',
			query: {
				email_to: emailTo
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

}

export type TDataReadProjects = {
                limit?: number
skip?: number
                
            }
export type TDataCreateProject = {
                requestBody: ProjectCreate
                
            }
export type TDataReadProject = {
                projectId: number
                
            }
export type TDataUpdateProject = {
                projectId: number
requestBody: ProjectUpdate
                
            }
export type TDataDeleteProject = {
                projectId: number
                
            }
export type TDataReadProjectParts = {
                projectId: number
                
            }
export type TDataReadProjectPartByProjectAndPartId = {
                partId: number
projectId: number
                
            }
export type TDataReadPaymentsForProject = {
                projectId: number
                
            }

export class ProjectsService {

	/**
	 * Read Projects
	 * Retrieve projects.
	 * @returns ProjectsPublic Successful Response
	 * @throws ApiError
	 */
	public static readProjects(data: TDataReadProjects = {}): CancelablePromise<ProjectsPublic> {
		const {
limit = 100,
skip = 0,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/projects/',
			query: {
				skip, limit
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Create Project
	 * Create new project.
	 * @returns ProjectPublic Successful Response
	 * @throws ApiError
	 */
	public static createProject(data: TDataCreateProject): CancelablePromise<ProjectPublic> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/projects/',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read Project
	 * Get project by ID.
	 * @returns ProjectPublic Successful Response
	 * @throws ApiError
	 */
	public static readProject(data: TDataReadProject): CancelablePromise<ProjectPublic> {
		const {
projectId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/projects/{project_id}',
			path: {
				project_id: projectId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Update Project
	 * Update an existing project.
	 * @returns ProjectPublic Successful Response
	 * @throws ApiError
	 */
	public static updateProject(data: TDataUpdateProject): CancelablePromise<ProjectPublic> {
		const {
projectId,
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'PATCH',
			url: '/api/v1/projects/{project_id}',
			path: {
				project_id: projectId
			},
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Delete Project
	 * Delete project.
	 * @returns ProjectPublic Successful Response
	 * @throws ApiError
	 */
	public static deleteProject(data: TDataDeleteProject): CancelablePromise<ProjectPublic> {
		const {
projectId,
} = data;
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/v1/projects/{project_id}',
			path: {
				project_id: projectId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read Project Parts
	 * Retrieve parts for a specific project.
	 * @returns PartsPublic Successful Response
	 * @throws ApiError
	 */
	public static readProjectParts(data: TDataReadProjectParts): CancelablePromise<PartsPublic> {
		const {
projectId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/projects/{project_id}/parts',
			path: {
				project_id: projectId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read Project Part By Project And Part Id
	 * Get part by part ID for a specific project.
	 * @returns PartPublic Successful Response
	 * @throws ApiError
	 */
	public static readProjectPartByProjectAndPartId(data: TDataReadProjectPartByProjectAndPartId): CancelablePromise<PartPublic> {
		const {
partId,
projectId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/projects/{project_id}/parts/{part_id}',
			path: {
				project_id: projectId, part_id: partId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read Payments For Project
	 * Retrieve all payments to suppliers for a specific project.
	 * @returns PaymentToSuppliersPublic Successful Response
	 * @throws ApiError
	 */
	public static readPaymentsForProject(data: TDataReadPaymentsForProject): CancelablePromise<PaymentToSuppliersPublic> {
		const {
projectId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/projects/{project_id}/payments',
			path: {
				project_id: projectId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

}

export type TDataReadSuppliers = {
                limit?: number
skip?: number
                
            }
export type TDataCreateSupplier = {
                requestBody: SupplierCreate
                
            }
export type TDataReadAllSupplierContacts = {
                limit?: number
skip?: number
                
            }
export type TDataReadSupplier = {
                supplierId: number
                
            }
export type TDataUpdateSupplier = {
                requestBody: SupplierUpdate
supplierId: number
                
            }
export type TDataDeleteSupplier = {
                supplierId: number
                
            }
export type TDataReadSupplierContacts = {
                supplierId: number
                
            }
export type TDataCreateSupplierContact = {
                requestBody: SupplierContactCreate
                
            }

export type TDataUpdateSupplierContact = {
                contactId: number
requestBody: SupplierContactUpdate
                
            }
export type TDataDeleteSupplierContact = {
                contactId: number
                
            }
export type TDataReadSupplierContact = {
                contactId: number
supplierId: number
                
            }
export type TDataReadExternalInvoicesForSupplier = {
                supplierId: number
                
            }
export type TDataReadPaymentsToSupplier = {
                supplierId: number
                
            }
export type TDataReadPartsBySupplier = {
                limit?: number
skip?: number
supplierId: number
                
            }

export class SuppliersService {

	/**
	 * Read Suppliers
	 * Retrieve suppliers.
	 * @returns SuppliersPublic Successful Response
	 * @throws ApiError
	 */
	public static readSuppliers(data: TDataReadSuppliers = {}): CancelablePromise<SuppliersPublic> {
		const {
limit = 100,
skip = 0,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/suppliers/',
			query: {
				skip, limit
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Create Supplier
	 * Create new supplier.
	 * @returns SupplierPublic Successful Response
	 * @throws ApiError
	 */
	public static createSupplier(data: TDataCreateSupplier): CancelablePromise<SupplierPublic> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/suppliers/',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read All Supplier Contacts
	 * Retrieve all supplier contacts.
	 * @returns SupplierContactsPublic Successful Response
	 * @throws ApiError
	 */
	public static readAllSupplierContacts(data: TDataReadAllSupplierContacts = {}): CancelablePromise<SupplierContactsPublic> {
		const {
limit = 100,
skip = 0,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/suppliers/contacts',
			query: {
				skip, limit
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read Supplier
	 * Get supplier by ID.
	 * @returns SupplierPublic Successful Response
	 * @throws ApiError
	 */
	public static readSupplier(data: TDataReadSupplier): CancelablePromise<SupplierPublic> {
		const {
supplierId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/suppliers/{supplier_id}',
			path: {
				supplier_id: supplierId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Update Supplier
	 * Update an existing supplier.
	 * @returns SupplierPublic Successful Response
	 * @throws ApiError
	 */
	public static updateSupplier(data: TDataUpdateSupplier): CancelablePromise<SupplierPublic> {
		const {
requestBody,
supplierId,
} = data;
		return __request(OpenAPI, {
			method: 'PUT',
			url: '/api/v1/suppliers/{supplier_id}',
			path: {
				supplier_id: supplierId
			},
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Delete Supplier
	 * Delete supplier.
	 * @returns SupplierPublic Successful Response
	 * @throws ApiError
	 */
	public static deleteSupplier(data: TDataDeleteSupplier): CancelablePromise<SupplierPublic> {
		const {
supplierId,
} = data;
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/v1/suppliers/{supplier_id}',
			path: {
				supplier_id: supplierId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read Supplier Contacts
	 * Retrieve supplier contacts.
	 * @returns SupplierContactsPublic Successful Response
	 * @throws ApiError
	 */
	public static readSupplierContacts(data: TDataReadSupplierContacts): CancelablePromise<SupplierContactsPublic> {
		const {
supplierId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/suppliers/{supplier_id}/contacts',
			path: {
				supplier_id: supplierId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Create Supplier Contact
	 * Create new supplier contact.
	 * @returns SupplierContactPublic Successful Response
	 * @throws ApiError
	 */
	public static createSupplierContact(data: TDataCreateSupplierContact): CancelablePromise<SupplierContactPublic> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/suppliers/{supplier_id}/contacts',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read Contact
	 * Read contact by contact ID.
	 * @returns SupplierContactPublic Successful Response
	 * @throws ApiError
	 */
	public static readContact(data: TDataReadContact): CancelablePromise<SupplierContactPublic> {
		const {
contactId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/suppliers/contacts/{contact_id}',
			path: {
				contact_id: contactId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Update Supplier Contact
	 * Update supplier contact.
	 * @returns SupplierContactPublic Successful Response
	 * @throws ApiError
	 */
	public static updateSupplierContact(data: TDataUpdateSupplierContact): CancelablePromise<SupplierContactPublic> {
		const {
contactId,
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'PUT',
			url: '/api/v1/suppliers/contacts/{contact_id}',
			path: {
				contact_id: contactId
			},
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Delete Supplier Contact
	 * Delete supplier contact.
	 * @returns SupplierContactPublic Successful Response
	 * @throws ApiError
	 */
	public static deleteSupplierContact(data: TDataDeleteSupplierContact): CancelablePromise<SupplierContactPublic> {
		const {
contactId,
} = data;
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/v1/suppliers/contacts/{contact_id}',
			path: {
				contact_id: contactId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read Supplier Contact
	 * Get contact by supplier ID and contact ID.
	 * @returns SupplierContactPublic Successful Response
	 * @throws ApiError
	 */
	public static readSupplierContact(data: TDataReadSupplierContact): CancelablePromise<SupplierContactPublic> {
		const {
contactId,
supplierId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/suppliers/{supplier_id}/contacts/{contact_id}',
			path: {
				supplier_id: supplierId, contact_id: contactId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read External Invoices For Supplier
	 * Retrieve all external invoices for a specific supplier.
	 * @returns ExternalInvoicesPublic Successful Response
	 * @throws ApiError
	 */
	public static readExternalInvoicesForSupplier(data: TDataReadExternalInvoicesForSupplier): CancelablePromise<ExternalInvoicesPublic> {
		const {
supplierId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/suppliers/{supplier_id}/externalinvoices',
			path: {
				supplier_id: supplierId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read Payments To Supplier
	 * Retrieve all payments to a specific supplier.
	 * @returns PaymentToSuppliersPublic Successful Response
	 * @throws ApiError
	 */
	public static readPaymentsToSupplier(data: TDataReadPaymentsToSupplier): CancelablePromise<PaymentToSuppliersPublic> {
		const {
supplierId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/suppliers/{supplier_id}/payments',
			path: {
				supplier_id: supplierId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read Parts By Supplier
	 * Retrieve all parts bought from a specific supplier.
	 * @returns PartsPublic Successful Response
	 * @throws ApiError
	 */
	public static readPartsBySupplier(data: TDataReadPartsBySupplier): CancelablePromise<PartsPublic> {
		const {
limit = 100,
skip = 0,
supplierId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/suppliers/{supplier_id}/parts',
			path: {
				supplier_id: supplierId
			},
			query: {
				skip, limit
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

}

export type TDataReadCustomers = {
                limit?: number
skip?: number
                
            }
export type TDataCreateCustomer = {
                requestBody: CustomerCreate
                
            }
export type TDataReadAllCustomerContacts = {
                limit?: number
skip?: number
                
            }
export type TDataReadCustomer = {
                customerId: number
                
            }
export type TDataUpdateCustomer = {
                customerId: number
requestBody: CustomerUpdate
                
            }
export type TDataDeleteCustomer = {
                customerId: number
                
            }
export type TDataReadCustomerContacts = {
                customerId: number
                
            }
export type TDataCreateCustomerContact = {
                requestBody: CustomerContactCreate
                
            }
export type TDataReadContact = {
                contactId: number
                
            }
export type TDataUpdateCustomerContact = {
                contactId: number
requestBody: CustomerContactUpdate
                
            }
export type TDataDeleteCustomerContact = {
                contactId: number
                
            }
export type TDataReadCustomerContact = {
                contactId: number
customerId: number
                
            }
export type TDataReadInternalInvoicesForCustomer = {
                customerId: number
                
            }
export type TDataReadPaymentsFromCustomer = {
                customerId: number
                
            }

export class CustomersService {

	/**
	 * Read Customers
	 * Retrieve customers.
	 * @returns CustomersPublic Successful Response
	 * @throws ApiError
	 */
	public static readCustomers(data: TDataReadCustomers = {}): CancelablePromise<CustomersPublic> {
		const {
limit = 100,
skip = 0,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/customers/',
			query: {
				skip, limit
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Create Customer
	 * Create new customer.
	 * @returns CustomerPublic Successful Response
	 * @throws ApiError
	 */
	public static createCustomer(data: TDataCreateCustomer): CancelablePromise<CustomerPublic> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/customers/',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read All Customer Contacts
	 * Retrieve all customer contacts.
	 * @returns CustomerContactsPublic Successful Response
	 * @throws ApiError
	 */
	public static readAllCustomerContacts(data: TDataReadAllCustomerContacts = {}): CancelablePromise<CustomerContactsPublic> {
		const {
limit = 100,
skip = 0,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/customers/contacts',
			query: {
				skip, limit
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read Customer
	 * Get customer by ID.
	 * @returns CustomerPublic Successful Response
	 * @throws ApiError
	 */
	public static readCustomer(data: TDataReadCustomer): CancelablePromise<CustomerPublic> {
		const {
customerId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/customers/{customer_id}',
			path: {
				customer_id: customerId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Update Customer
	 * Update an existing customer.
	 * @returns CustomerPublic Successful Response
	 * @throws ApiError
	 */
	public static updateCustomer(data: TDataUpdateCustomer): CancelablePromise<CustomerPublic> {
		const {
customerId,
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'PUT',
			url: '/api/v1/customers/{customer_id}',
			path: {
				customer_id: customerId
			},
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Delete Customer
	 * Delete customer.
	 * @returns CustomerPublic Successful Response
	 * @throws ApiError
	 */
	public static deleteCustomer(data: TDataDeleteCustomer): CancelablePromise<CustomerPublic> {
		const {
customerId,
} = data;
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/v1/customers/{customer_id}',
			path: {
				customer_id: customerId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read Customer Contacts
	 * Retrieve customer contacts.
	 * @returns CustomerContactsPublic Successful Response
	 * @throws ApiError
	 */
	public static readCustomerContacts(data: TDataReadCustomerContacts): CancelablePromise<CustomerContactsPublic> {
		const {
customerId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/customers/{customer_id}/contacts',
			path: {
				customer_id: customerId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Create Customer Contact
	 * Create new customer contact.
	 * @returns CustomerContactPublic Successful Response
	 * @throws ApiError
	 */
	public static createCustomerContact(data: TDataCreateCustomerContact): CancelablePromise<CustomerContactPublic> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/customers/{customer_id}/contacts',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read Contact
	 * Read contact by contact ID.
	 * @returns CustomerContactPublic Successful Response
	 * @throws ApiError
	 */
	public static readContact(data: TDataReadContact): CancelablePromise<CustomerContactPublic> {
		const {
contactId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/customers/contacts/{contact_id}',
			path: {
				contact_id: contactId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Update Customer Contact
	 * Update customer contact.
	 * @returns CustomerContactPublic Successful Response
	 * @throws ApiError
	 */
	public static updateCustomerContact(data: TDataUpdateCustomerContact): CancelablePromise<CustomerContactPublic> {
		const {
contactId,
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'PUT',
			url: '/api/v1/customers/contacts/{contact_id}',
			path: {
				contact_id: contactId
			},
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Delete Customer Contact
	 * Delete customer contact.
	 * @returns CustomerContactPublic Successful Response
	 * @throws ApiError
	 */
	public static deleteCustomerContact(data: TDataDeleteCustomerContact): CancelablePromise<CustomerContactPublic> {
		const {
contactId,
} = data;
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/v1/customers/contacts/{contact_id}',
			path: {
				contact_id: contactId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read Customer Contact
	 * Get contact by customer ID and contact ID.
	 * @returns CustomerContactPublic Successful Response
	 * @throws ApiError
	 */
	public static readCustomerContact(data: TDataReadCustomerContact): CancelablePromise<CustomerContactPublic> {
		const {
contactId,
customerId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/customers/{customer_id}/contacts/{contact_id}',
			path: {
				customer_id: customerId, contact_id: contactId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read Internal Invoices For Customer
	 * Retrieve all internal invoices for a specific customer.
	 * @returns InternalInvoicesPublic Successful Response
	 * @throws ApiError
	 */
	public static readInternalInvoicesForCustomer(data: TDataReadInternalInvoicesForCustomer): CancelablePromise<InternalInvoicesPublic> {
		const {
customerId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/customers/{customer_id}/internalinvoices',
			path: {
				customer_id: customerId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read Payments From Customer
	 * Retrieve all payments from a specific customer.
	 * @returns PaymentFromCustomersPublic Successful Response
	 * @throws ApiError
	 */
	public static readPaymentsFromCustomer(data: TDataReadPaymentsFromCustomer): CancelablePromise<PaymentFromCustomersPublic> {
		const {
customerId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/customers/{customer_id}/payments',
			path: {
				customer_id: customerId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

}

export type TDataCreatePart = {
                requestBody: PartCreate
                
            }
export type TDataReadParts = {
                limit?: number
skip?: number
                
            }
export type TDataUpdatePart = {
                partId: number
requestBody: PartUpdate
                
            }
export type TDataReadPart = {
                partId: number
                
            }
export type TDataDeletePart = {
                partId: number
                
            }

export class PartsService {

	/**
	 * Create Part
	 * Create new part.
	 * @returns PartPublic Successful Response
	 * @throws ApiError
	 */
	public static createPart(data: TDataCreatePart): CancelablePromise<PartPublic> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/parts/',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read Parts
	 * Retrieve parts.
	 * @returns PartsPublic Successful Response
	 * @throws ApiError
	 */
	public static readParts(data: TDataReadParts = {}): CancelablePromise<PartsPublic> {
		const {
limit = 100,
skip = 0,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/parts/',
			query: {
				skip, limit
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Update Part
	 * Update an existing part.
	 * @returns PartPublic Successful Response
	 * @throws ApiError
	 */
	public static updatePart(data: TDataUpdatePart): CancelablePromise<PartPublic> {
		const {
partId,
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'PATCH',
			url: '/api/v1/parts/{part_id}',
			path: {
				part_id: partId
			},
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read Part
	 * Get part by ID.
	 * @returns PartPublic Successful Response
	 * @throws ApiError
	 */
	public static readPart(data: TDataReadPart): CancelablePromise<PartPublic> {
		const {
partId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/parts/{part_id}',
			path: {
				part_id: partId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Delete Part
	 * Delete a part.
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static deletePart(data: TDataDeletePart): CancelablePromise<unknown> {
		const {
partId,
} = data;
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/v1/parts/{part_id}',
			path: {
				part_id: partId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

}

export type TDataReadExternalInvoices = {
                limit?: number
skip?: number
                
            }
export type TDataCreateExternalInvoice = {
                requestBody: ExternalInvoiceCreate
                
            }
export type TDataReadExternalInvoice = {
                externalInvoiceId: number
                
            }
export type TDataUpdateExternalInvoice = {
                externalInvoiceId: number
requestBody: ExternalInvoiceUpdate
                
            }
export type TDataDeleteExternalInvoice = {
                externalInvoiceId: number
                
            }
export type TDataReadExternalInvoiceParts = {
                externalInvoiceId: number
                
            }
export type TDataReadExternalInvoicePartByInvoice = {
                externalInvoiceId: number
partId: number
                
            }
export type TDataReadPaymentsForExternalInvoice = {
                externalInvoiceId: number
                
            }
export type TDataProcessExternalInvoices = {
                formData: Body_external_invoices_process_external_invoices
                
            }

export class ExternalInvoicesService {

	/**
	 * Read External Invoices
	 * Retrieve external invoices.
	 * @returns ExternalInvoicesPublic Successful Response
	 * @throws ApiError
	 */
	public static readExternalInvoices(data: TDataReadExternalInvoices = {}): CancelablePromise<ExternalInvoicesPublic> {
		const {
limit = 100,
skip = 0,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/external_invoices/',
			query: {
				skip, limit
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Create External Invoice
	 * Create new external invoice.
	 * @returns ExternalInvoicePublic Successful Response
	 * @throws ApiError
	 */
	public static createExternalInvoice(data: TDataCreateExternalInvoice): CancelablePromise<ExternalInvoicePublic> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/external_invoices/',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read External Invoice
	 * Get external invoice by ID.
	 * @returns ExternalInvoicePublic Successful Response
	 * @throws ApiError
	 */
	public static readExternalInvoice(data: TDataReadExternalInvoice): CancelablePromise<ExternalInvoicePublic> {
		const {
externalInvoiceId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/external_invoices/{external_invoice_id}',
			path: {
				external_invoice_id: externalInvoiceId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Update External Invoice
	 * Update an existing external invoice.
	 * @returns ExternalInvoicePublic Successful Response
	 * @throws ApiError
	 */
	public static updateExternalInvoice(data: TDataUpdateExternalInvoice): CancelablePromise<ExternalInvoicePublic> {
		const {
externalInvoiceId,
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'PATCH',
			url: '/api/v1/external_invoices/{external_invoice_id}',
			path: {
				external_invoice_id: externalInvoiceId
			},
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Delete External Invoice
	 * Delete external invoice.
	 * @returns ExternalInvoicePublic Successful Response
	 * @throws ApiError
	 */
	public static deleteExternalInvoice(data: TDataDeleteExternalInvoice): CancelablePromise<ExternalInvoicePublic> {
		const {
externalInvoiceId,
} = data;
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/v1/external_invoices/{external_invoice_id}',
			path: {
				external_invoice_id: externalInvoiceId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read External Invoice Parts
	 * Retrieve parts for a specific external invoice.
	 * @returns PartsPublic Successful Response
	 * @throws ApiError
	 */
	public static readExternalInvoiceParts(data: TDataReadExternalInvoiceParts): CancelablePromise<PartsPublic> {
		const {
externalInvoiceId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/external_invoices/{external_invoice_id}/parts',
			path: {
				external_invoice_id: externalInvoiceId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read External Invoice Part By Invoice
	 * Get part by ID for a specific external invoice.
	 * @returns PartPublic Successful Response
	 * @throws ApiError
	 */
	public static readExternalInvoicePartByInvoice(data: TDataReadExternalInvoicePartByInvoice): CancelablePromise<PartPublic> {
		const {
externalInvoiceId,
partId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/external_invoices/{external_invoice_id}/parts/{part_id}',
			path: {
				external_invoice_id: externalInvoiceId, part_id: partId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read Payments For External Invoice
	 * Retrieve all payments to suppliers for a specific external invoice.
	 * @returns PaymentToSuppliersPublic Successful Response
	 * @throws ApiError
	 */
	public static readPaymentsForExternalInvoice(data: TDataReadPaymentsForExternalInvoice): CancelablePromise<PaymentToSuppliersPublic> {
		const {
externalInvoiceId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/external_invoices/{external_invoice_id}/payments',
			path: {
				external_invoice_id: externalInvoiceId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Process External Invoices
	 * Process external invoices and extract relevant information.
	 * @returns InvoiceProcessingResponse Successful Response
	 * @throws ApiError
	 */
	public static processExternalInvoices(data: TDataProcessExternalInvoices): CancelablePromise<InvoiceProcessingResponse> {
		const {
formData,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/external_invoices/process_invoice',
			formData: formData,
			mediaType: 'multipart/form-data',
			errors: {
				422: `Validation Error`,
			},
		});
	}

}

export type TDataReadInternalInvoices = {
                limit?: number
skip?: number
                
            }
export type TDataCreateInternalInvoice = {
                requestBody: InternalInvoiceCreate
                
            }
export type TDataReadInternalInvoice = {
                internalInvoiceId: number
                
            }
export type TDataUpdateInternalInvoice = {
                internalInvoiceId: number
requestBody: InternalInvoiceUpdate
                
            }
export type TDataDeleteInternalInvoice = {
                internalInvoiceId: number
                
            }
export type TDataReadPaymentsForInternalInvoice = {
                internalInvoiceId: number
                
            }
export type TDataProcessInternalInvoices = {
                formData: Body_internal_invoices_process_internal_invoices
                
            }

export class InternalInvoicesService {

	/**
	 * Read Internal Invoices
	 * Retrieve all internal invoices.
	 * @returns InternalInvoicesPublic Successful Response
	 * @throws ApiError
	 */
	public static readInternalInvoices(data: TDataReadInternalInvoices = {}): CancelablePromise<InternalInvoicesPublic> {
		const {
limit = 100,
skip = 0,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/internal_invoices/',
			query: {
				skip, limit
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Create Internal Invoice
	 * Create new internal invoice.
	 * @returns InternalInvoicePublic Successful Response
	 * @throws ApiError
	 */
	public static createInternalInvoice(data: TDataCreateInternalInvoice): CancelablePromise<InternalInvoicePublic> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/internal_invoices/',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read Internal Invoice
	 * Get internal invoice by ID.
	 * @returns InternalInvoicePublic Successful Response
	 * @throws ApiError
	 */
	public static readInternalInvoice(data: TDataReadInternalInvoice): CancelablePromise<InternalInvoicePublic> {
		const {
internalInvoiceId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/internal_invoices/{internal_invoice_id}',
			path: {
				internal_invoice_id: internalInvoiceId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Update Internal Invoice
	 * Update an existing internal invoice.
	 * @returns InternalInvoicePublic Successful Response
	 * @throws ApiError
	 */
	public static updateInternalInvoice(data: TDataUpdateInternalInvoice): CancelablePromise<InternalInvoicePublic> {
		const {
internalInvoiceId,
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'PATCH',
			url: '/api/v1/internal_invoices/{internal_invoice_id}',
			path: {
				internal_invoice_id: internalInvoiceId
			},
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Delete Internal Invoice
	 * Delete internal invoice.
	 * @returns InternalInvoicePublic Successful Response
	 * @throws ApiError
	 */
	public static deleteInternalInvoice(data: TDataDeleteInternalInvoice): CancelablePromise<InternalInvoicePublic> {
		const {
internalInvoiceId,
} = data;
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/v1/internal_invoices/{internal_invoice_id}',
			path: {
				internal_invoice_id: internalInvoiceId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read Payments For Internal Invoice
	 * Retrieve all payments from customers for a specific internal invoice.
	 * @returns PaymentFromCustomersPublic Successful Response
	 * @throws ApiError
	 */
	public static readPaymentsForInternalInvoice(data: TDataReadPaymentsForInternalInvoice): CancelablePromise<PaymentFromCustomersPublic> {
		const {
internalInvoiceId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/internal_invoices/{internal_invoice_id}/payments',
			path: {
				internal_invoice_id: internalInvoiceId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Process Internal Invoices
	 * Process internal invoices and extract relevant information.
	 * @returns InvoiceProcessingResponse Successful Response
	 * @throws ApiError
	 */
	public static processInternalInvoices(data: TDataProcessInternalInvoices): CancelablePromise<InvoiceProcessingResponse> {
		const {
formData,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/internal_invoices/process_invoice',
			formData: formData,
			mediaType: 'multipart/form-data',
			errors: {
				422: `Validation Error`,
			},
		});
	}

}

export type TDataReadPaymentsToSuppliers = {
                limit?: number
skip?: number
                
            }
export type TDataCreatePaymentToSupplier = {
                requestBody: PaymentToSupplierCreate
                
            }
export type TDataReadPaymentToSupplier = {
                paymentId: number
                
            }
export type TDataPatchPaymentToSupplier = {
                paymentId: number
requestBody: PaymentToSupplierUpdate
                
            }
export type TDataDeletePaymentToSupplier = {
                paymentId: number
                
            }

export class PaymentstosupplierService {

	/**
	 * Read Payments To Suppliers
	 * Retrieve payments to suppliers.
	 * @returns PaymentToSuppliersPublic Successful Response
	 * @throws ApiError
	 */
	public static readPaymentsToSuppliers(data: TDataReadPaymentsToSuppliers = {}): CancelablePromise<PaymentToSuppliersPublic> {
		const {
limit = 100,
skip = 0,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/paymentstosupplier/',
			query: {
				skip, limit
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Create Payment To Supplier
	 * Create new payment to supplier.
	 * @returns PaymentToSupplierPublic Successful Response
	 * @throws ApiError
	 */
	public static createPaymentToSupplier(data: TDataCreatePaymentToSupplier): CancelablePromise<PaymentToSupplierPublic> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/paymentstosupplier/',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read Payment To Supplier
	 * Get payment to supplier by ID.
	 * @returns PaymentToSupplierPublic Successful Response
	 * @throws ApiError
	 */
	public static readPaymentToSupplier(data: TDataReadPaymentToSupplier): CancelablePromise<PaymentToSupplierPublic> {
		const {
paymentId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/paymentstosupplier/{payment_id}',
			path: {
				payment_id: paymentId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Patch Payment To Supplier
	 * Patch an existing payment to supplier.
	 * @returns PaymentToSupplierPublic Successful Response
	 * @throws ApiError
	 */
	public static patchPaymentToSupplier(data: TDataPatchPaymentToSupplier): CancelablePromise<PaymentToSupplierPublic> {
		const {
paymentId,
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'PATCH',
			url: '/api/v1/paymentstosupplier/{payment_id}',
			path: {
				payment_id: paymentId
			},
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Delete Payment To Supplier
	 * Delete payment to supplier.
	 * @returns PaymentToSupplierPublic Successful Response
	 * @throws ApiError
	 */
	public static deletePaymentToSupplier(data: TDataDeletePaymentToSupplier): CancelablePromise<PaymentToSupplierPublic> {
		const {
paymentId,
} = data;
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/v1/paymentstosupplier/{payment_id}',
			path: {
				payment_id: paymentId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

}

export type TDataReadPaymentsFromCustomers = {
                limit?: number
skip?: number
                
            }
export type TDataCreatePaymentFromCustomer = {
                requestBody: PaymentFromCustomerCreate
                
            }
export type TDataReadPaymentFromCustomer = {
                paymentId: number
                
            }
export type TDataPatchPaymentFromCustomer = {
                paymentId: number
requestBody: PaymentFromCustomerUpdate
                
            }
export type TDataDeletePaymentFromCustomer = {
                paymentId: number
                
            }

export class PaymentsfromcustomerService {

	/**
	 * Read Payments From Customers
	 * Retrieve payments from customers.
	 * @returns PaymentFromCustomersPublic Successful Response
	 * @throws ApiError
	 */
	public static readPaymentsFromCustomers(data: TDataReadPaymentsFromCustomers = {}): CancelablePromise<PaymentFromCustomersPublic> {
		const {
limit = 100,
skip = 0,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/paymentsfromcustomer/',
			query: {
				skip, limit
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Create Payment From Customer
	 * Create new payment from customer.
	 * @returns PaymentFromCustomerPublic Successful Response
	 * @throws ApiError
	 */
	public static createPaymentFromCustomer(data: TDataCreatePaymentFromCustomer): CancelablePromise<PaymentFromCustomerPublic> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/paymentsfromcustomer/',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read Payment From Customer
	 * Get payment from customer by ID.
	 * @returns PaymentFromCustomerPublic Successful Response
	 * @throws ApiError
	 */
	public static readPaymentFromCustomer(data: TDataReadPaymentFromCustomer): CancelablePromise<PaymentFromCustomerPublic> {
		const {
paymentId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/paymentsfromcustomer/{payment_id}',
			path: {
				payment_id: paymentId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Patch Payment From Customer
	 * Patch an existing payment from customer.
	 * @returns PaymentFromCustomerPublic Successful Response
	 * @throws ApiError
	 */
	public static patchPaymentFromCustomer(data: TDataPatchPaymentFromCustomer): CancelablePromise<PaymentFromCustomerPublic> {
		const {
paymentId,
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'PATCH',
			url: '/api/v1/paymentsfromcustomer/{payment_id}',
			path: {
				payment_id: paymentId
			},
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Delete Payment From Customer
	 * Delete payment from customer.
	 * @returns PaymentFromCustomerPublic Successful Response
	 * @throws ApiError
	 */
	public static deletePaymentFromCustomer(data: TDataDeletePaymentFromCustomer): CancelablePromise<PaymentFromCustomerPublic> {
		const {
paymentId,
} = data;
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/v1/paymentsfromcustomer/{payment_id}',
			path: {
				payment_id: paymentId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

}