import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react"
import { BsThreeDotsVertical } from "react-icons/bs"
import { FiEdit, FiTrash } from "react-icons/fi"
 
import type { 
  ItemPublic,
  UserPublic, 
  SupplierPublic,
  SupplierContactPublic,
  CustomerPublic,
  CustomerContactPublic,
  ProjectPublic, 
  PartPublic, 
  ExternalInvoicePublic,
  InternalInvoicePublic,
  PaymentFromCustomerPublic,
  PaymentToSupplierPublic
} from "../../client"
 
import EditUser from "../Admin/EditUser"
import EditItem from "../Items/EditItem"
import EditProject from "../Projects/EditProject"
import EditSupplier from "../Suppliers/EditSupplier"
import EditSupplierContact from "../Suppliercontacts/EditSupplierContact"
import EditCustomer from "../Customers/EditCustomer"
import EditCustomerContact from "../Customercontacts/EditCustomerContact"
import EditPart from "../Parts/EditPart"
import EditExternalInvoice from "../Externalinvoices/EditExternalInvoice"
import EditInternalInvoice from "../Internalinvoices/EditInternalinvoice"
import EditPaymentFromCustomer from "../Paymentsfromcustomers/EditPaymentFromCustomer"
import EditPaymentToSupplier from "../Paymentstosuppliers/EditPaymentToSupplier"

import Delete from "./DeleteAlert";
 
interface ActionsMenuProps {
  type: string;
  value:
    | ItemPublic
    | UserPublic
    | SupplierPublic
    | CustomerPublic
    | ProjectPublic
    | PartPublic
    | ExternalInvoicePublic
    | InternalInvoicePublic
    | PaymentFromCustomerPublic
    | PaymentToSupplierPublic
    | SupplierContactPublic
    | CustomerContactPublic;
  disabled?: boolean;
}

const customLabels: { [key: string]: string } = {
  SupplierContact: "Supplier Contact",
  CustomerContact: "Customer Contact",
  ExternalInvoice: "External Invoice",
  InternalInvoice: "Internal Invoice",
  PaymentFromCustomer: "Payment From Customer",
  PaymentToSupplier: "Payment To Supplier",
};

const ActionsMenu = ({ type, value, disabled }: ActionsMenuProps) => {
  const editUserModal = useDisclosure();
  const editItemModal = useDisclosure();
  const editSupplierModal = useDisclosure();
  const editSupplierContactModal = useDisclosure();
  const editCustomerModal = useDisclosure();
  const editCustomerContactModal = useDisclosure();
  const editProjectModal = useDisclosure();
  const editPartModal = useDisclosure();
  const editExternalInvoiceModal = useDisclosure();
  const editInternalInvoiceModal = useDisclosure();
  const editPaymentFromCustomerModal = useDisclosure();
  const editPaymentToSupplierModal = useDisclosure();
  const deleteModal = useDisclosure();

  const handleEditOpen = () => {
    switch (type) {
      case "User":
        editUserModal.onOpen();
        break;
      case "Item":
        editItemModal.onOpen();
        break;
      case "Supplier":
        editSupplierModal.onOpen();
        break;
      case "SupplierContact":
        editSupplierContactModal.onOpen();
        break;
      case "Customer":
        editCustomerModal.onOpen();
        break;
      case "CustomerContact":
        editCustomerContactModal.onOpen();
        break;
      case "Project":
        editProjectModal.onOpen();
        break;
      case "Part":
        editPartModal.onOpen();
        break;
      case "ExternalInvoice":
        editExternalInvoiceModal.onOpen();
        break;
      case "InternalInvoice":
        editInternalInvoiceModal.onOpen();
        break;
      case "PaymentFromCustomer":
        editPaymentFromCustomerModal.onOpen();
        break;
      case "PaymentToSupplier":
        editPaymentToSupplierModal.onOpen();
        break;
      default:
        break;
    }
  };

  const getCustomLabel = (action: string) => {
    const label = customLabels[type] || type;
    return `${action} ${label}`;
  };

  return (
    <>
      <Menu>
        <MenuButton
          isDisabled={disabled}
          as={Button}
          rightIcon={<BsThreeDotsVertical />}
          variant="unstyled"
        />
        <MenuList>
          <MenuItem onClick={handleEditOpen} icon={<FiEdit fontSize="16px" />}>
            {getCustomLabel("Edit")}
          </MenuItem>
          <MenuItem
            onClick={deleteModal.onOpen}
            icon={<FiTrash fontSize="16px" />}
            color="ui.danger"
          >
            {getCustomLabel("Delete")}
          </MenuItem>
        </MenuList>
        {type === "User" && (
          <EditUser
            user={value as UserPublic}
            isOpen={editUserModal.isOpen}
            onClose={editUserModal.onClose}
          />
        )}
        {type === "Item" && (
          <EditItem
            item={value as ItemPublic}
            isOpen={editItemModal.isOpen}
            onClose={editItemModal.onClose}
          />
        )}
        {type === "Supplier" && (
          <EditSupplier
            supplier={value as SupplierPublic}
            isOpen={editSupplierModal.isOpen}
            onClose={editSupplierModal.onClose}
          />
        )}
        {type === "SupplierContact" && (
          <EditSupplierContact
            supplierContact={value as SupplierContactPublic}
            isOpen={editSupplierContactModal.isOpen}
            onClose={editSupplierContactModal.onClose}
          />
        )}
        {type === "Customer" && (
          <EditCustomer
            customer={value as CustomerPublic}
            isOpen={editCustomerModal.isOpen}
            onClose={editCustomerModal.onClose}
          />
        )}
        {type === "CustomerContact" && (
          <EditCustomerContact
            customerContact={value as CustomerContactPublic}
            isOpen={editCustomerContactModal.isOpen}
            onClose={editCustomerContactModal.onClose}
          />
        )}
        {type === "Project" && (
          <EditProject
            project={value as ProjectPublic}
            isOpen={editProjectModal.isOpen}
            onClose={editProjectModal.onClose}
          />
        )}
        {type === "Part" && (
          <EditPart
            part={value as PartPublic}
            isOpen={editPartModal.isOpen}
            onClose={editPartModal.onClose}
          />
        )}
        {type === "ExternalInvoice" && (
          <EditExternalInvoice
            externalInvoice={value as ExternalInvoicePublic}
            isOpen={editExternalInvoiceModal.isOpen}
            onClose={editExternalInvoiceModal.onClose}
          />
        )}
        {type === "InternalInvoice" && (
          <EditInternalInvoice
            internalInvoice={value as InternalInvoicePublic}
            isOpen={editInternalInvoiceModal.isOpen}
            onClose={editInternalInvoiceModal.onClose}
          />
        )}
        {type === "PaymentFromCustomer" && (
          <EditPaymentFromCustomer
            paymentFromCustomer={value as PaymentFromCustomerPublic}
            isOpen={editPaymentFromCustomerModal.isOpen}
            onClose={editPaymentFromCustomerModal.onClose}
          />
        )}
        {type === "PaymentToSupplier" && (
          <EditPaymentToSupplier
            paymentToSupplier={value as PaymentToSupplierPublic}
            isOpen={editPaymentToSupplierModal.isOpen}
            onClose={editPaymentToSupplierModal.onClose}
          />
        )}
        <Delete
          type={type}
          id={value.id}
          isOpen={deleteModal.isOpen}
          onClose={deleteModal.onClose}
        />
      </Menu>
    </>
  );
};

export default ActionsMenu;