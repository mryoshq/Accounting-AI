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
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type SubmitHandler, useForm } from "react-hook-form";

import {
  type ApiError,
  type SupplierPublic,
  type SupplierUpdate,
  SuppliersService,
} from "../../client";
import useCustomToast from "../../hooks/useCustomToast";

interface EditSupplierProps {
  supplier: SupplierPublic;
  isOpen: boolean;
  onClose: () => void;
}

const EditSupplier = ({ supplier, isOpen, onClose }: EditSupplierProps) => {
  const queryClient = useQueryClient();
  const showToast = useCustomToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors, isDirty },
  } = useForm<SupplierUpdate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: supplier,
  });

  const mutation = useMutation({
    mutationFn: (data: SupplierUpdate) =>
      SuppliersService.updateSupplier({ supplierId: supplier.id, requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Supplier updated successfully.", "success");
      onClose();
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail;
      showToast("Something went wrong.", `${errDetail}`, "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });

  const onSubmit: SubmitHandler<SupplierUpdate> = async (data) => {
    mutation.mutate(data);
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
        <ModalHeader>Edit Supplier</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl isInvalid={!!errors.name}>
            <FormLabel htmlFor="name">Name</FormLabel>
            <Input
              id="name"
              {...register("name")}
              type="text"
            />
            {errors.name && (
              <FormErrorMessage>{errors.name.message}</FormErrorMessage>
            )}
          </FormControl>

          <FormControl isInvalid={!!errors.ice} mt={4}>
            <FormLabel htmlFor="ICE">ICE</FormLabel>
            <Input
              id="ICE"
              {...register("ice")}
              type="text"
            />
            {errors.ice && (
              <FormErrorMessage>{errors.ice.message}</FormErrorMessage>
            )}
          </FormControl>

          <FormControl isInvalid={!!errors.postal_code} mt={4}>
            <FormLabel htmlFor="postal_code">Postal Code</FormLabel>
            <Input
              id="postal_code"
              {...register("postal_code")}
              type="text"
            />
            
          </FormControl>

          <FormControl isInvalid={!!errors.rib} mt={4}>
            <FormLabel htmlFor="RIB">RIB</FormLabel>
            <Input
              id="RIB"
              {...register("rib")}
              type="text"
            />
            {errors.rib && (
              <FormErrorMessage>{errors.rib.message}</FormErrorMessage>
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

export default EditSupplier;
