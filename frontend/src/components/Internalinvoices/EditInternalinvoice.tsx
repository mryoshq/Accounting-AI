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
  type InternalInvoicePublic,
  type InternalInvoiceUpdate,
  InternalInvoicesService,
  CustomersService,
  ProjectsService,
} from "../../client";
import useCustomToast from "../../hooks/useCustomToast";

interface EditInternalInvoiceProps {
  internalInvoice: InternalInvoicePublic;
  isOpen: boolean;
  onClose: () => void;
}

const EditInternalInvoice = ({
  internalInvoice,
  isOpen,
  onClose,
}: EditInternalInvoiceProps) => {
  const queryClient = useQueryClient();
  const showToast = useCustomToast();

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: () => CustomersService.readCustomers(),
  });

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => ProjectsService.readProjects(),
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { isSubmitting, errors, isDirty },
  } = useForm<InternalInvoiceUpdate & { customer_id: number; project_id: number }>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      ...internalInvoice,
      customer_id: internalInvoice.customer_id,
      project_id: internalInvoice.project_id,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: InternalInvoiceUpdate & { customer_id: number; project_id: number }) =>
      InternalInvoicesService.updateInternalInvoice({
        internalInvoiceId: internalInvoice.id,
        requestBody: data,
      }),
    onSuccess: () => {
      showToast("Success!", "Internal Invoice updated successfully.", "success");
      onClose();
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail;
      showToast("Something went wrong.", `${errDetail}`, "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["internalinvoices"] });
    },
  });

  const onSubmit: SubmitHandler<InternalInvoiceUpdate & { customer_id: number; project_id: number }> = async (data) => {
    clearErrors(); // Clear any previous errors
    let hasError = false;

    const amountTtc = parseFloat(data.amount_ttc as unknown as string) || 0;
    const amountHt = parseFloat(data.amount_ht as unknown as string) || 0;

    if (amountTtc < amountHt) {
      setError("amount_ttc", {
        type: "manual",
        message: "Amount TTC should be greater than or equal to Amount HT.",
      });
      hasError = true;
    }

    const invoiceDate = new Date(data.invoice_date || "");
    const dueDate = new Date(data.due_date || "");

    if (invoiceDate > dueDate) {
      setError("invoice_date", {
        type: "manual",
        message: "Invoice Date should be the same as or before Due Date.",
      });
      hasError = true;
    }

    if (!hasError) {
      mutation.mutate(data);
    }
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
        <ModalHeader>Edit Internal Invoice</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl isInvalid={!!errors.reference}>
            <FormLabel htmlFor="reference">Reference</FormLabel>
            <Input
              id="reference"
              {...register("reference", {
                required: "Reference is required.",
              })}
              placeholder="Reference"
              type="text"
            />
            <FormErrorMessage>
              {errors.reference?.message}
            </FormErrorMessage>
          </FormControl>
          <FormControl mt={4} isInvalid={!!errors.invoice_date}>
            <FormLabel htmlFor="invoice_date">Invoice Date</FormLabel>
            <Input
              id="invoice_date"
              {...register("invoice_date", {
                required: "Invoice Date is required.",
              })}
              placeholder="YYYY-MM-DD"
              type="date"
            />
            <FormErrorMessage>
              {errors.invoice_date?.message}
            </FormErrorMessage>
          </FormControl>
          <FormControl mt={4} isInvalid={!!errors.due_date}>
            <FormLabel htmlFor="due_date">Due Date</FormLabel>
            <Input
              id="due_date"
              {...register("due_date", {
                required: "Due Date is required.",
              })}
              placeholder="YYYY-MM-DD"
              type="date"
            />
            <FormErrorMessage>
              {errors.due_date?.message}
            </FormErrorMessage>
          </FormControl>
          <FormControl mt={4} isInvalid={!!errors.amount_ttc}>
            <FormLabel htmlFor="amount_ttc">Amount TTC</FormLabel>
            <Input
              id="amount_ttc"
              {...register("amount_ttc", {
                required: "Amount TTC is required.",
              })}
              placeholder="Amount TTC"
              type="number"
              step="0.01"
            />
            <FormErrorMessage>
              {errors.amount_ttc?.message}
            </FormErrorMessage>
          </FormControl>
          <FormControl mt={4} isInvalid={!!errors.amount_ht}>
            <FormLabel htmlFor="amount_ht">Amount HT</FormLabel>
            <Input
              id="amount_ht"
              {...register("amount_ht", {
                required: "Amount HT is required.",
              })}
              placeholder="Amount HT"
              type="number"
              step="0.01"
            />
            <FormErrorMessage>
              {errors.amount_ht?.message}
            </FormErrorMessage>
          </FormControl>
          <FormControl mt={4} isInvalid={!!errors.vat}>
            <FormLabel htmlFor="vat">VAT</FormLabel>
            <Input
              id="vat"
              {...register("vat", {
                required: "VAT is required.",
              })}
              placeholder="VAT"
              type="number"
              step="0.01"
            />
            <FormErrorMessage>
              {errors.vat?.message}
            </FormErrorMessage>
          </FormControl>
          <FormControl mt={4} isInvalid={!!errors.currency_type}>
            <FormLabel htmlFor="currency_type">Currency Type</FormLabel>
            <Select
              id="currency_type"
              {...register("currency_type", {
                required: "Currency Type is required.",
              })}
              placeholder="Select Currency Type"
            >
              <option value="MAD">MAD</option>
              <option value="EUR">EUR</option>
            </Select>
            <FormErrorMessage>
              {errors.currency_type?.message}
            </FormErrorMessage>
          </FormControl>
          <FormControl mt={4} isInvalid={!!errors.customer_id}>
            <FormLabel htmlFor="customer_id">Customer</FormLabel>
            <Select
              id="customer_id"
              {...register("customer_id", {
                required: "Customer is required.",
              })}
              placeholder="Select Customer"
            >
              {customers?.data.map((customer: any) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </Select>
            <FormErrorMessage>
              {errors.customer_id?.message}
            </FormErrorMessage>
          </FormControl>
          <FormControl mt={4} isInvalid={!!errors.project_id}>
            <FormLabel htmlFor="project_id">Project</FormLabel>
            <Select
              id="project_id"
              {...register("project_id", {
                required: "Project is required.",
              })}
              placeholder="Select Project"
            >
              {projects?.data.map((project: any) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </Select>
            <FormErrorMessage>
              {errors.project_id?.message}
            </FormErrorMessage>
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

export default EditInternalInvoice;