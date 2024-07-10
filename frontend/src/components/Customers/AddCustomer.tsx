import React, { useRef } from 'react';
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
import { Field, Form, Formik, FieldProps, FormikHelpers } from "formik";
import * as Yup from "yup";

import { type ApiError, type CustomerCreate, CustomersService } from "../../client";
import useCustomToast from "../../hooks/useCustomToast";

interface AddCustomerProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated: (supplier: any) => void;
}

const AddCustomer: React.FC<AddCustomerProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const showToast = useCustomToast();
  const initialRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: (data: CustomerCreate) => CustomersService.createCustomer({ requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Customer created successfully.", "success");
      onClose();
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail;
      showToast("Something went wrong.", `${errDetail}`, "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  const initialValues: CustomerCreate = {
    name: "",
    ice: "",
    postal_code: "",
    rib: "",
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required."),
    ice: Yup.string().required("ICE is required."),
    postal_code: Yup.string().required("Postal Code is required."),
    rib: Yup.string().nullable(),
  });

  const onSubmit = (values: CustomerCreate, actions: FormikHelpers<CustomerCreate>) => {
    mutation.mutate(values);
    actions.setSubmitting(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: "sm", md: "md" }}
      isCentered
      initialFocusRef={initialRef}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Customer</ModalHeader>
        <ModalCloseButton />
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {(props) => (
            <Form>
              <ModalBody pb={6}>
                <Field name="name">
                  {({ field, form }: FieldProps) => (
                    <FormControl isRequired >
                      <FormLabel htmlFor="name">Name</FormLabel>
                      <Input
                        {...field}
                        id="name"
                        placeholder="Name"
                        type="text"
                        ref={initialRef}
                      />
                      <FormErrorMessage>
                        {typeof form.errors.name === "string" ? form.errors.name : null}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Field name="ice">
                  {({ field, form }: FieldProps) => (
                    <FormControl isRequired mt={4}>
                      <FormLabel htmlFor="ICE">ICE</FormLabel>
                      <Input
                        {...field}
                        id="ice"
                        placeholder="ICE"
                        type="text"
                      />
                      <FormErrorMessage>
                        {typeof form.errors.ICE === "string" ? form.errors.ICE : null}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                </Field>

                <Field name="postal_code">
                  {({ field, form }: FieldProps) => (
                    <FormControl isRequired mt={4}>
                      <FormLabel htmlFor="postal_code">Postal Code</FormLabel>
                      <Input
                        {...field}
                        id="postal_code"
                        placeholder="Postal Code"
                        type="text"
                      />
                      <FormErrorMessage>
                        {typeof form.errors.postal_code === "string" ? form.errors.postal_code : null}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                </Field>

                <Field name="rib">
                  {({ field, form }: FieldProps) => (
                    <FormControl mt={4}>
                      <FormLabel htmlFor="RIB">RIB</FormLabel>
                      <Input
                        {...field}
                        id="rib"
                        placeholder="RIB"
                        type="text"
                      />
                      <FormErrorMessage>
                        {typeof form.errors.RIB === "string" ? form.errors.RIB : null}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
              </ModalBody>
              <ModalFooter gap={3}>
                <Button variant="primary" type="submit" isLoading={props.isSubmitting}>
                  Save
                </Button>
                <Button onClick={onClose}>Cancel</Button>
              </ModalFooter>
            </Form>
          )}
        </Formik>
      </ModalContent>
    </Modal>
  );
};

export default AddCustomer;
