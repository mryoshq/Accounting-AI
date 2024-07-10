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
  type CustomerContactPublic,
  type CustomerContactUpdate,
  CustomersService,
} from "../../client";
import useCustomToast from "../../hooks/useCustomToast";
import { useEffect } from "react";

interface EditCustomerContactProps {
  customerContact: CustomerContactPublic;
  isOpen: boolean;
  onClose: () => void;
}

const EditCustomerContact = ({
  customerContact,
  isOpen,
  onClose,
}: EditCustomerContactProps) => {
  const queryClient = useQueryClient();
  const showToast = useCustomToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors, isDirty },
  } = useForm<CustomerContactUpdate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: customerContact,
  });

  useEffect(() => {
    if (customerContact) {
      reset(customerContact);
    }
  }, [customerContact, reset]);

  const mutation = useMutation({
    mutationFn: (data: CustomerContactUpdate) =>
      CustomersService.updateCustomerContact({
        contactId: customerContact.id,
        requestBody: data,
      }),
    onSuccess: () => {
      showToast("Success!", "Customer contact updated successfully.", "success");
      onClose();
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail;
      showToast("Something went wrong.", `${errDetail}`, "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["customercontacts"] });
    },
  });

  const onSubmit: SubmitHandler<CustomerContactUpdate> = async (data) => {
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
        <ModalHeader>Edit Customer Contact</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl isInvalid={!!errors.contact_name}>
            <FormLabel htmlFor="contact_name">Contact Name</FormLabel>
            <Input
              id="contact_name"
              {...register("contact_name", {
                required: "Contact name is required",
              })}
              type="text"
            />
            {errors.contact_name && (
              <FormErrorMessage>{errors.contact_name.message}</FormErrorMessage>
            )}
          </FormControl>
          <FormControl mt={4}>
            <FormLabel htmlFor="phone_number">Phone Number</FormLabel>
            <Input
              id="phone_number"
              {...register("phone_number")}
              placeholder="Phone Number"
              type="text"
            />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel htmlFor="email">Email</FormLabel>
            <Input
              id="email"
              {...register("email")}
              placeholder="Email"
              type="email"
            />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel htmlFor="address">Address</FormLabel>
            <Input
              id="address"
              {...register("address")}
              placeholder="Address"
              type="text"
            />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel htmlFor="bank_details">Bank Details</FormLabel>
            <Input
              id="bank_details"
              {...register("bank_details")}
              placeholder="Bank Details"
              type="text"
            />
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

export default EditCustomerContact;
