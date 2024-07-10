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
  type PaymentFromCustomerCreate,
  PaymentsfromcustomerService,
  InternalInvoicesService,
} from "../../client";
import useCustomToast from "../../hooks/useCustomToast";

interface AddPaymentFromCustomerProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddPaymentFromCustomer = ({ isOpen, onClose }: AddPaymentFromCustomerProps) => {
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
    formState: { errors, isSubmitting },
  } = useForm<PaymentFromCustomerCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      payment_status: "Pending",
      payment_mode: "Cash",
      amount: null,
      remaining: null,
      disbursement_date: "",
      payment_ref: "",
      additional_fees: null,
      internal_invoice_id: 0,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: PaymentFromCustomerCreate) =>
      PaymentsfromcustomerService.createPaymentFromCustomer({ requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Payment from customer created successfully.", "success");
      reset();
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

  const onSubmit: SubmitHandler<PaymentFromCustomerCreate> = (data) => {
    const transformedData = {
      ...data,
      amount: transformEmptyStringToNull(data.amount),
      remaining: transformEmptyStringToNull(data.remaining),
      additional_fees: transformEmptyStringToNull(data.additional_fees),
    };
    mutation.mutate(transformedData);
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
        <ModalHeader>Add Payment From Customer</ModalHeader>
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
              })}
              placeholder="Amount (MAD)"
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
              {...register("additional_fees")}
              placeholder="Additional Fees"
              type="number"
              step="0.01"
            />
            <FormErrorMessage>{errors.additional_fees?.message}</FormErrorMessage>
          </FormControl>
          <FormControl mt={4} isRequired isInvalid={!!errors.internal_invoice_id}>
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
            <FormErrorMessage>{errors.internal_invoice_id?.message}</FormErrorMessage>
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

export default AddPaymentFromCustomer;