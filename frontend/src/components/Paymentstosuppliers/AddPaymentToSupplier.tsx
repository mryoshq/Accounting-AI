import React from 'react';
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
} from "@chakra-ui/react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { type SubmitHandler, useForm } from "react-hook-form";
import {
  type ApiError,
  type PaymentToSupplierCreate,
  PaymentstosupplierService,
  ExternalInvoicesService,
} from "../../client";
import useCustomToast from "../../hooks/useCustomToast";

interface AddPaymentToSupplierProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddPaymentToSupplier: React.FC<AddPaymentToSupplierProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const showToast = useCustomToast();
  
  const { data: externalInvoices } = useQuery({
    queryKey: ["externalinvoices"],
    queryFn: () => ExternalInvoicesService.readExternalInvoices(),
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PaymentToSupplierCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      payment_status: "Paid",
      payment_mode: "Cash",
      amount: 0,
      remaining: 0,
      disbursement_date: "",
      payment_ref: "",
      additional_fees: 0,
      external_invoice_id: 0,
    },
  });

  const amount = watch("amount");

  const mutation = useMutation({
    mutationFn: (data: PaymentToSupplierCreate) =>
      PaymentstosupplierService.createPaymentToSupplier({ requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Payment to supplier created successfully.", "success");
      reset();
      onClose();
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail;
      showToast("Something went wrong.", `${errDetail}`, "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["paymenttosuppliers"] });
    },
  });

  const onSubmit: SubmitHandler<PaymentToSupplierCreate> = (data) => {
    mutation.mutate(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: "sm", md: "md" }}
      isCentered
    >
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>Add Payment To Supplier</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl isRequired isInvalid={!!errors.payment_ref}>
            <FormLabel htmlFor="payment_ref">Payment Reference</FormLabel>
            <Input
              id="payment_ref"
              {...register("payment_ref", {
                required: "Payment Reference is required.",
              })}
              placeholder="Payment Reference"
              type="text"
            />
            <FormErrorMessage>{errors.payment_ref?.message}</FormErrorMessage>
          </FormControl>
          <FormControl mt={4} isRequired isInvalid={!!errors.payment_status}>
            <FormLabel htmlFor="payment_status">Payment Status</FormLabel>
            <Select
              id="payment_status"
              {...register("payment_status", {
                required: "Payment Status is required.",
              })}
              placeholder="Select Payment Status"
            >
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Partial">Partial</option>
              <option value="Failed">Failed</option>
              <option value="Missing">Missing</option>
            </Select>
            <FormErrorMessage>{errors.payment_status?.message}</FormErrorMessage>
          </FormControl>
          <FormControl mt={4} isRequired isInvalid={!!errors.payment_mode}>
            <FormLabel htmlFor="payment_mode">Payment Mode</FormLabel>
            <Select
              id="payment_mode"
              {...register("payment_mode", {
                required: "Payment Mode is required.",
              })}
              placeholder="Select Payment Mode"
            >
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Check">Check</option>
              <option value="Credit">Credit</option>
            </Select>
            <FormErrorMessage>{errors.payment_mode?.message}</FormErrorMessage>
          </FormControl>
          <FormControl mt={4} isRequired isInvalid={!!errors.amount}>
            <FormLabel htmlFor="amount">Amount</FormLabel>
            <Input
              id="amount"
              {...register("amount", {
                required: "Amount is required.",
                valueAsNumber: true,
                min: { value: 0, message: "Amount must be positive" }
              })}
              placeholder="Amount"
              type="number"
              step="0.01"
            />
            <FormErrorMessage>{errors.amount?.message}</FormErrorMessage>
          </FormControl>
          <FormControl mt={4} isRequired isInvalid={!!errors.remaining}>
            <FormLabel htmlFor="remaining">Remaining</FormLabel>
            <Input
              id="remaining"
              {...register("remaining", {
                required: "Remaining Amount is required.",
                valueAsNumber: true,
                validate: (value): string | boolean => {
                  if (typeof value !== 'number' || typeof amount !== 'number') {
                    return "Invalid input";
                  }
                  return value <= amount || "Remaining amount must be less than or equal to the total amount";
                }
              })}
              placeholder="Remaining Amount"
              type="number"
              step="0.01"
            />
            <FormErrorMessage>{errors.remaining?.message}</FormErrorMessage>
          </FormControl>
          <FormControl mt={4} isRequired isInvalid={!!errors.disbursement_date}>
            <FormLabel htmlFor="disbursement_date">Disbursement Date</FormLabel>
            <Input
              id="disbursement_date"
              {...register("disbursement_date", {
                required: "Disbursement Date is required.",
              })}
              placeholder="YYYY-MM-DD"
              type="date"
            />
            <FormErrorMessage>{errors.disbursement_date?.message}</FormErrorMessage>
          </FormControl>
          <FormControl mt={4} isInvalid={!!errors.additional_fees}>
            <FormLabel htmlFor="additional_fees">Additional Fees</FormLabel>
            <Input
              id="additional_fees"
              {...register("additional_fees", {
                valueAsNumber: true,
                min: { value: 0, message: "Additional fees must be positive or zero" }
              })}
              placeholder="Additional Fees"
              type="number"
              step="0.01"
            />
            <FormErrorMessage>{errors.additional_fees?.message}</FormErrorMessage>
          </FormControl>
          <FormControl mt={4} isRequired isInvalid={!!errors.external_invoice_id}>
            <FormLabel htmlFor="external_invoice_id">External Invoice</FormLabel>
            <Select
              id="external_invoice_id"
              {...register("external_invoice_id", {
                required: "External Invoice is required.",
                valueAsNumber: true,
              })}
              placeholder="Select External Invoice"
            >
              {externalInvoices?.data.map((invoice: any) => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.reference}
                </option>
              ))}
            </Select>
            <FormErrorMessage>{errors.external_invoice_id?.message}</FormErrorMessage>
          </FormControl>
        </ModalBody>

        <ModalFooter gap={3}>
          <Button variant="primary" type="submit" isLoading={isSubmitting}>
            Save
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddPaymentToSupplier;