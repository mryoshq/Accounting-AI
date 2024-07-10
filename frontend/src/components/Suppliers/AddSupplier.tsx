import { useRef } from 'react';
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

import { type ApiError, type SupplierCreate, SuppliersService } from "../../client";
import useCustomToast from "../../hooks/useCustomToast";

interface AddSupplierProps {
  isOpen: boolean;
  onClose: () => void;
  onSupplierCreated: (supplier: any) => void;
}

const AddSupplier = ({ isOpen, onClose, onSupplierCreated }: AddSupplierProps) => {
  const queryClient = useQueryClient();
  const showToast = useCustomToast();
  const initialRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: (data: SupplierCreate) =>
      SuppliersService.createSupplier({ requestBody: data }),
    onSuccess: (newSupplier) => {
      showToast("Success!", "Supplier created successfully.", "success");
      onSupplierCreated(newSupplier);
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


  const initialValues: SupplierCreate = {
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

  const onSubmit = (values: SupplierCreate, actions: FormikHelpers<SupplierCreate>) => {
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
        <ModalHeader>Add Supplier</ModalHeader>
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

export default AddSupplier;
