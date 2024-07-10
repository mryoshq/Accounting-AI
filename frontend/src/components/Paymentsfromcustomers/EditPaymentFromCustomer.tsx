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
  type PaymentFromCustomerPublic,
  type PaymentFromCustomerUpdate,
  PaymentsfromcustomerService,
  InternalInvoicesService,
} from "../../client";
import useCustomToast from "../../hooks/useCustomToast";

interface EditPaymentFromCustomerProps {
  paymentFromCustomer: PaymentFromCustomerPublic;
  isOpen: boolean;
  onClose: () => void;
}

const EditPaymentFromCustomer = ({
  paymentFromCustomer,
  isOpen,
  onClose,
}: EditPaymentFromCustomerProps) => {
  const queryClient = useQueryClient();
  const showToast = useCustomToast();

  const { data: internalInvoices } = useQuery({
    queryKey: ["internalinvoices"],
    queryFn: () => InternalInvoicesService.readInternalInvoices(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors, isDirty },
  } = useForm<PaymentFromCustomerUpdate & { internal_invoice_id: number }>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: paymentFromCustomer,
  });

  const mutation = useMutation({
    mutationFn: (data: PaymentFromCustomerUpdate & { internal_invoice_id: number }) =>
      PaymentsfromcustomerService.patchPaymentFromCustomer({
        paymentId: paymentFromCustomer.id,
        requestBody: data,
      }),
    onSuccess: () => {
      showToast("Success!", "Payment from customer updated successfully.", "success");
      onClose();
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail;
      showToast("Something went wrong.", `${errDetail}`, "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentfromcustomers"] });
    },
  });

  const transformEmptyStringToNull = (value: any) => (value === "" ? null : value);

  const onSubmit: SubmitHandler<PaymentFromCustomerUpdate & { internal_invoice_id: number }> = (data) => {
    const transformedData = {
      ...data,
      amount: transformEmptyStringToNull(data.amount),
      remaining: transformEmptyStringToNull(data.remaining),
      additional_fees: transformEmptyStringToNull(data.additional_fees),
    };
    mutation.mutate(transformedData);
  };

  const onCancel = () => {
    reset();
    onClose();
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
        <ModalHeader>Edit Payment From Customer</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl mt={4} isInvalid={!!errors.payment_ref}>
            <FormLabel htmlFor="payment_ref">Payment Reference</FormLabel>
            <Input
              id="payment_ref"
              {...register("payment_ref", {
                required: "Payment Reference is required.",
              })}
              placeholder="Payment Reference"
              type="text"
            />
            {errors.payment_ref && (
              <FormErrorMessage>{errors.payment_ref.message}</FormErrorMessage>
            )}
          </FormControl>
          <FormControl isInvalid={!!errors.payment_status}>
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
            {errors.payment_status && (
              <FormErrorMessage>{errors.payment_status.message}</FormErrorMessage>
            )}
          </FormControl>
          <FormControl mt={4} isInvalid={!!errors.payment_mode}>
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
            {errors.payment_mode && (
              <FormErrorMessage>{errors.payment_mode.message}</FormErrorMessage>
            )}
          </FormControl>
          <FormControl mt={4} isInvalid={!!errors.amount}>
            <FormLabel htmlFor="amount">Amount (MAD)</FormLabel>
            <Input
              id="amount"
              {...register("amount", {
                required: "Amount is required.",
              })}
              placeholder="Amount (MAD)"
              type="number"
              step="0.01"
            />
            {errors.amount && (
              <FormErrorMessage>{errors.amount.message}</FormErrorMessage>
            )}
          </FormControl>
         
          <FormControl mt={4} isInvalid={!!errors.remaining}>
            <FormLabel htmlFor="remaining">Remaining</FormLabel>
            <Input
              id="remaining"
              {...register("remaining", {
                required: "Remaining Amount is required.",
              })}
              placeholder="Remaining Amount"
              type="number"
              step="0.01"
            />
            {errors.remaining && (
              <FormErrorMessage>{errors.remaining.message}</FormErrorMessage>
            )}
          </FormControl>
          <FormControl mt={4} isInvalid={!!errors.disbursement_date}>
            <FormLabel htmlFor="disbursement_date">Disbursement Date</FormLabel>
            <Input
              id="disbursement_date"
              {...register("disbursement_date", {
                required: "Disbursement Date is required.",
              })}
              placeholder="YYYY-MM-DD"
              type="date"
            />
            {errors.disbursement_date && (
              <FormErrorMessage>{errors.disbursement_date.message}</FormErrorMessage>
            )}
          </FormControl>
          <FormControl mt={4} isInvalid={!!errors.additional_fees}>
            <FormLabel htmlFor="additional_fees">Additional Fees</FormLabel>
            <Input
              id="additional_fees"
              {...register("additional_fees")}
              placeholder="Additional Fees"
              type="number"
              step="0.01"
            />
            {errors.additional_fees && (
              <FormErrorMessage>{errors.additional_fees.message}</FormErrorMessage>
            )}
          </FormControl>
          <FormControl mt={4} isInvalid={!!errors.internal_invoice_id}>
            <FormLabel htmlFor="internal_invoice_id">Internal Invoice</FormLabel>
            <Select
              id="internal_invoice_id"
              {...register("internal_invoice_id", {
                required: "Internal Invoice is required.",
              })}
              placeholder="Select Internal Invoice"
            >
              {internalInvoices?.data.map((invoice: any) => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.reference}
                </option>
              ))}
            </Select>
            {errors.internal_invoice_id && (
              <FormErrorMessage>{errors.internal_invoice_id.message}</FormErrorMessage>
            )}
          </FormControl>
        </ModalBody>

        <ModalFooter gap={3}>
          <Button
            variant="primary"
            type="submit"
            isLoading={isSubmitting}
            isDisabled={!isDirty}
          >
            Save
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditPaymentFromCustomer;
