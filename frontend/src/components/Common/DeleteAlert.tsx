import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useForm } from "react-hook-form";

import {
  UsersService,
  SuppliersService,
  CustomersService,
  ProjectsService,
  PartsService,
  ExternalInvoicesService,
  InternalInvoicesService,
  PaymentsfromcustomerService,
  PaymentstosupplierService,
} from "../../client";
import useCustomToast from "../../hooks/useCustomToast";

interface DeleteProps {
  type: string;
  id: number;
  isOpen: boolean;
  onClose: () => void;
}

const customLabels: { [key: string]: string } = {
  SupplierContact: "Supplier Contact",
  CustomerContact: "Customer Contact",
  ExternalInvoice: "External Invoice",
  InternalInvoice: "Internal Invoice",
  PaymentFromCustomer: "Payment From Customer",
  PaymentToSupplier: "Payment To Supplier",
};

const Delete = ({ type, id, isOpen, onClose }: DeleteProps) => {
  const queryClient = useQueryClient();
  const showToast = useCustomToast();
  const cancelRef = React.useRef<HTMLButtonElement | null>(null);
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  const deleteEntity = async (id: number) => {
    switch (type) {
      case "User":
        await UsersService.deleteUser({ userId: id });
        break;
      case "Supplier":
        await SuppliersService.deleteSupplier({ supplierId: id });
        break;
      case "Customer":
        await CustomersService.deleteCustomer({ customerId: id });
        break;
      case "Project":
        await ProjectsService.deleteProject({ projectId: id });
        break;
      case "Part":
        await PartsService.deletePart({ partId: id });
        break;
      case "ExternalInvoice":
        await ExternalInvoicesService.deleteExternalInvoice({ externalInvoiceId: id });
        break;
      case "InternalInvoice":
        await InternalInvoicesService.deleteInternalInvoice({ internalInvoiceId: id });
        break;
      case "PaymentFromCustomer":
        await PaymentsfromcustomerService.deletePaymentFromCustomer({ paymentId: id });
        break;
      case "PaymentToSupplier":
        await PaymentstosupplierService.deletePaymentToSupplier({ paymentId: id });
        break;
      case "CustomerContact":
        await CustomersService.deleteCustomerContact({ contactId: id });
        break;
      case "SupplierContact":
        await SuppliersService.deleteSupplierContact({ contactId: id });
        break;
      default:
        throw new Error(`Unexpected type: ${type}`);
    }
  };

  const mutation = useMutation({
    mutationFn: deleteEntity,
    onSuccess: () => {
      showToast(
        "Success",
        `The ${getCustomLabel(type)} was deleted successfully.`,
        "success"
      );
      onClose();
    },
    onError: () => {
      showToast(
        "An error occurred.",
        `An error occurred while deleting the ${getCustomLabel(type)}.`,
        "error"
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [type.toLowerCase() + "s"],
      });
    },
  });

  const onSubmit = async () => {
    mutation.mutate(id);
  };

  const getCustomLabel = (entityType: string): string => {
    return customLabels[entityType] || entityType;
  };

  return (
    <AlertDialog
      isOpen={isOpen}
      onClose={onClose}
      leastDestructiveRef={cancelRef}
      size={{ base: "sm", md: "md" }}
      isCentered
    >
      <AlertDialogOverlay>
        <AlertDialogContent as="form" onSubmit={handleSubmit(onSubmit)}>
          <AlertDialogHeader>Delete {getCustomLabel(type)}</AlertDialogHeader>

          <AlertDialogBody>
            {type === "User" && (
              <span>
                All items associated with this user will also be{" "}
                <strong>permanently deleted. </strong>
              </span>
            )}
            Please confirm, this action is <strong>irreversible.</strong>
          </AlertDialogBody>

          <AlertDialogFooter gap={3}>
            <Button variant="danger" type="submit" isLoading={isSubmitting}>
              Delete {getCustomLabel(type)}
            </Button>
            <Button
              ref={cancelRef}
              onClick={onClose}
              isDisabled={isSubmitting}
            >
              Cancel
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default Delete;