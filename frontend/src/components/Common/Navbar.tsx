import React from 'react';
import {
  Button,
  Flex,
  Icon,
  useDisclosure,
} from "@chakra-ui/react";
import { FaPlus, FaUpload } from "react-icons/fa";
import { useQueryClient } from "@tanstack/react-query";

import AddUser from "../Admin/AddUser";
import AddItem from "../Items/AddItem";
import AddProject from "../Projects/AddProject";
import AddSupplier from "../Suppliers/AddSupplier";
import AddSupplierContact from "../Suppliercontacts/AddSupplierContact";
import AddCustomer from "../Customers/AddCustomer";
import AddCustomerContact from "../Customercontacts/AddCustomerContact";
import AddPart from "../Parts/AddPart";
import AddExternalInvoice from "../Externalinvoices/AddExternalinvoice";
import UploadInvoice from "../Processing/UploadInvoice";
import AddInternalInvoice from "../Internalinvoices/AddInternalinvoice";
import AddPaymentFromCustomer from "../Paymentsfromcustomers/AddPaymentFromCustomer";
import AddPaymentToSupplier from "../Paymentstosuppliers/AddPaymentToSupplier";

interface NavbarProps {
  type: string;
}

const customLabels: { [key: string]: string } = {
  SupplierContact: "Supplier Contact",
  CustomerContact: "Customer Contact",
  ExternalInvoice: "External Invoice",
  InternalInvoice: "Internal Invoice",
  PaymentFromCustomer: "Payment From Customer",
  PaymentToSupplier: "Payment To Supplier",
};

const Navbar: React.FC<NavbarProps> = ({ type }) => {
  const addUserModal = useDisclosure();
  const addItemModal = useDisclosure();
  const addProjectModal = useDisclosure();
  const addSupplierModal = useDisclosure();
  const addSupplierContactModal = useDisclosure();
  const addCustomerModal = useDisclosure();
  const addCustomerContactModal = useDisclosure();
  const addPartModal = useDisclosure();
  const addExternalInvoiceModal = useDisclosure();
  const uploadExternalInvoiceModal = useDisclosure();
  const addInternalInvoiceModal = useDisclosure();
  const uploadInternalInvoiceModal = useDisclosure();
  const addPaymentFromCustomerModal = useDisclosure();
  const addPaymentToSupplierModal = useDisclosure();

  const queryClient = useQueryClient();

  const handleOpenModal = () => {
    if (type === "User") {
      addUserModal.onOpen();
    } else if (type === "Item") {
      addItemModal.onOpen();
    } else if (type === "Project") {
      addProjectModal.onOpen();
    } else if (type === "Supplier") {
      addSupplierModal.onOpen();
    } else if (type === "SupplierContact") {
      addSupplierContactModal.onOpen();
    } else if (type === "Customer") {
      addCustomerModal.onOpen();
    } else if (type === "CustomerContact") {
      addCustomerContactModal.onOpen();
    } else if (type === "Part") {
      addPartModal.onOpen();
    } else if (type === "ExternalInvoice") {
      addExternalInvoiceModal.onOpen();
    } else if (type === "InternalInvoice") {
      addInternalInvoiceModal.onOpen();
    } else if (type === "PaymentFromCustomer") {
      addPaymentFromCustomerModal.onOpen();
    } else if (type === "PaymentToSupplier") {
      addPaymentToSupplierModal.onOpen();
    }
  };

  const handleCancelModal = (modal: any) => {
    modal.onClose();
  };

  const handleProjectCreated = (newProject: any) => {
    queryClient.setQueryData(["projects"], (old: any) => {
      return { ...old, data: [...(old?.data || []), newProject] };
    });
  };

  const handleSupplierCreated = (newSupplier: any) => {
    queryClient.setQueryData(["suppliers"], (old: any) => {
      return { ...old, data: [...(old?.data || []), newSupplier] };
    });
  };

  const handleCustomerCreated = (newCustomer: any) => {
    queryClient.setQueryData(["customers"], (old: any) => {
      return { ...old, data: [...(old?.data || []), newCustomer] };
    });
  };

  const buttonLabel = customLabels[type] || type;

  return (
    <>
      <Flex py={8} gap={4}>
        <Button
          variant="primary"
          gap={1}
          fontSize={{ base: "sm", md: "inherit" }}
          onClick={handleOpenModal}
        >
          <Icon as={FaPlus} /> Add {buttonLabel}
        </Button>
        <AddUser isOpen={addUserModal.isOpen} onClose={addUserModal.onClose} />
        <AddItem isOpen={addItemModal.isOpen} onClose={addItemModal.onClose} />
        <AddProject 
          isOpen={addProjectModal.isOpen} 
          onClose={addProjectModal.onClose} 
          onProjectCreated={handleProjectCreated}
        />
        <AddSupplier 
          isOpen={addSupplierModal.isOpen} 
          onClose={addSupplierModal.onClose} 
          onSupplierCreated={handleSupplierCreated}
        />
        <AddSupplierContact isOpen={addSupplierContactModal.isOpen} onClose={addSupplierContactModal.onClose} />
        <AddCustomer 
          isOpen={addCustomerModal.isOpen} 
          onClose={addCustomerModal.onClose} 
          onCustomerCreated={handleCustomerCreated}
        />
        <AddCustomerContact isOpen={addCustomerContactModal.isOpen} onClose={addCustomerContactModal.onClose} />
        <AddPart 
          isOpen={addPartModal.isOpen} 
          onClose={addPartModal.onClose} 
          onCancel={() => handleCancelModal(addPartModal)}
        />
        <AddExternalInvoice 
          isOpen={addExternalInvoiceModal.isOpen} 
          onClose={addExternalInvoiceModal.onClose} 
          onCancel={() => handleCancelModal(addExternalInvoiceModal)}
        />
        {(type === "ExternalInvoice" || type === "InternalInvoice") && (
          <>
            <Button
              variant="primary"
              gap={1}
              fontSize={{ base: "sm", md: "inherit" }}
              onClick={type === "ExternalInvoice" ? uploadExternalInvoiceModal.onOpen : uploadInternalInvoiceModal.onOpen}
            >
              <Icon as={FaUpload} /> Upload Invoice
            </Button>
            <UploadInvoice 
              isOpen={type === "ExternalInvoice" ? uploadExternalInvoiceModal.isOpen : uploadInternalInvoiceModal.isOpen}
              onClose={type === "ExternalInvoice" ? uploadExternalInvoiceModal.onClose : uploadInternalInvoiceModal.onClose}
              invoiceType={type === "ExternalInvoice" ? "external" : "internal"}
            />
          </>
        )}
        <AddInternalInvoice 
          isOpen={addInternalInvoiceModal.isOpen} 
          onClose={addInternalInvoiceModal.onClose} 
          onCancel={() => handleCancelModal(addInternalInvoiceModal)}
        />
        <AddPaymentFromCustomer isOpen={addPaymentFromCustomerModal.isOpen} onClose={addPaymentFromCustomerModal.onClose} />
        <AddPaymentToSupplier isOpen={addPaymentToSupplierModal.isOpen} onClose={addPaymentToSupplierModal.onClose} />
      </Flex>
    </>
  );
};

export default Navbar;