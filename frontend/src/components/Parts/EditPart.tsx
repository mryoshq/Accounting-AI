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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type SubmitHandler, useForm } from "react-hook-form";

import { type ApiError, type PartPublic, type PartUpdate, PartsService, ExternalInvoicesService, SuppliersService, ProjectsService } from "../../client";
import useCustomToast from "../../hooks/useCustomToast";

interface EditPartProps {
  part: PartPublic;
  isOpen: boolean;
  onClose: () => void;
}

const EditPart = ({ part, isOpen, onClose }: EditPartProps) => {
  const queryClient = useQueryClient();
  const showToast = useCustomToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors, isDirty },
  } = useForm<PartUpdate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: part,
  });

  const { data: externalInvoices } = useQuery({
    queryKey: ["externalinvoices"],
    queryFn: () => ExternalInvoicesService.readExternalInvoices(),
  });

  const { data: suppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => SuppliersService.readSuppliers(),
  });

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => ProjectsService.readProjects(),
  });

  const mutation = useMutation({
    mutationFn: (data: PartUpdate) =>
      PartsService.updatePart({ partId: part.id, requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Part updated successfully.", "success");
      onClose();
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail;
      showToast("Something went wrong.", `${errDetail}`, "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["parts"] });
    },
  });

  const onSubmit: SubmitHandler<PartUpdate> = async (data) => {
    mutation.mutate(data);
  };

  const onCancel = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: "sm", md: "md" }} isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>Edit Part</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl isInvalid={!!errors.item_code}>
            <FormLabel htmlFor="item_code">Item Code</FormLabel>
            <Input
              id="item_code"
              {...register("item_code", {
                required: "Item code is required",
              })}
              type="text"
            />
            {errors.item_code && (
              <FormErrorMessage>{errors.item_code.message}</FormErrorMessage>
            )}
          </FormControl>
          <FormControl mt={4}>
            <FormLabel htmlFor="description">Description</FormLabel>
            <Input
              id="description"
              {...register("description")}
              placeholder="Description"
              type="text"
            />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel htmlFor="quantity">Quantity</FormLabel>
            <Input
              id="quantity"
              {...register("quantity", {
                valueAsNumber: true,
                required: "Quantity is required",
                min: { value: 1, message: "Quantity must be at least 1" },
              })}
              placeholder="Quantity"
              type="number"
            />
            {errors.quantity && (
              <FormErrorMessage>{errors.quantity.message}</FormErrorMessage>
            )}
          </FormControl>
          <FormControl mt={4}>
            <FormLabel htmlFor="unit_price">Unit Price</FormLabel>
            <Input
              id="unit_price"
              {...register("unit_price", {
                valueAsNumber: true,
                required: "Unit price is required",
                min: { value: 0, message: "Unit price must be at least 0" },
              })}
              placeholder="Unit Price"
              type="number"
              step="0.01"
            />
            {errors.unit_price && (
              <FormErrorMessage>{errors.unit_price.message}</FormErrorMessage>
            )}
          </FormControl>
          <FormControl mt={4}>
            <FormLabel htmlFor="external_invoice_id">External Invoice</FormLabel>
            <Select
              id="external_invoice_id"
              {...register("external_invoice_id", {
                valueAsNumber: true,
                required: "External invoice is required",
              })}
              placeholder="Select External Invoice"
            >
              {externalInvoices?.data.map((invoice: any) => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.reference}
                </option>
              ))}
            </Select>
            {errors.external_invoice_id && (
              <FormErrorMessage>{errors.external_invoice_id.message}</FormErrorMessage>
            )}
          </FormControl>
          <FormControl mt={4}>
            <FormLabel htmlFor="supplier_id">Supplier</FormLabel>
            <Select
              id="supplier_id"
              {...register("supplier_id", {
                valueAsNumber: true,
                required: "Supplier is required",
              })}
              placeholder="Select Supplier"
            >
              {suppliers?.data.map((supplier: any) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </Select>
            {errors.supplier_id && (
              <FormErrorMessage>{errors.supplier_id.message}</FormErrorMessage>
            )}
          </FormControl>
          <FormControl mt={4}>
            <FormLabel htmlFor="project_id">Project</FormLabel>
            <Select
              id="project_id"
              {...register("project_id", {
                valueAsNumber: true,
                required: "Project is required",
              })}
              placeholder="Select Project"
            >
              {projects?.data.map((project: any) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </Select>
            {errors.project_id && (
              <FormErrorMessage>{errors.project_id.message}</FormErrorMessage>
            )}
          </FormControl>
        </ModalBody>
        <ModalFooter gap={3}>
          <Button variant="primary" type="submit" isLoading={isSubmitting} isDisabled={!isDirty}>
            Save
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditPart;