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
  Select,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Field, Form, Formik, FieldProps, FormikHelpers } from "formik";
import * as Yup from "yup";
import {
  type ApiError,
  type SupplierContactCreate,
  SuppliersService,
} from "../../client";
import useCustomToast from "../../hooks/useCustomToast";

interface AddSupplierContactProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddSupplierContact: React.FC<AddSupplierContactProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const showToast = useCustomToast();
  const initialRef = useRef<HTMLInputElement>(null);

  const { data: suppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => SuppliersService.readSuppliers(),
  });

  const mutation = useMutation({
    mutationFn: (data: SupplierContactCreate) =>
      SuppliersService.createSupplierContact({
        requestBody: data,
      }),
    onSuccess: () => {
      showToast("Success!", "Supplier contact created successfully.", "success");
      queryClient.invalidateQueries({ queryKey: ["suppliercontacts"] });
      onClose();
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail;
      showToast("Something went wrong.", `${errDetail}`, "error");
    },
  });

  const initialValues: SupplierContactCreate = {
    contact_name: "",
    phone_number: "",
    email: "",
    address: "",
    bank_details: "",
    supplier_id: 0,
  };

  const validationSchema = Yup.object({
    contact_name: Yup.string().required("Contact name is required."),
    phone_number: Yup.string(),
    email: Yup.string().email("Invalid email format"),
    address: Yup.string(),
    bank_details: Yup.string(),
    supplier_id: Yup.string().required("Supplier is required."),
  });

  const onSubmit = (values: SupplierContactCreate, actions: FormikHelpers<SupplierContactCreate>) => {
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
        <ModalHeader>Add Supplier Contact</ModalHeader>
        <ModalCloseButton />
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {(props) => (
            <Form>
              <ModalBody pb={6}>
                <Field name="contact_name">
                  {({ field, form }: FieldProps) => (
                    <FormControl isRequired >
                      <FormLabel htmlFor="contact_name">Contact Name</FormLabel>
                      <Input
                        {...field}
                        id="contact_name"
                        placeholder="Contact Name"
                        type="text"
                        ref={initialRef}
                      />
                      <FormErrorMessage>
                        {typeof form.errors.contact_name === "string" ? form.errors.contact_name : null}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Field name="phone_number">
                  {({ field }: FieldProps) => (
                    <FormControl mt={4}>
                      <FormLabel htmlFor="phone_number">Phone Number</FormLabel>
                      <Input
                        {...field}
                        id="phone_number"
                        placeholder="Phone Number"
                        type="text"
                      />
                    </FormControl>
                  )}
                </Field>
                <Field name="email">
                  {({ field, form }: FieldProps) => (
                    <FormControl mt={4} isInvalid={!!(form.errors.email && form.touched.email)}>
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <Input
                        {...field}
                        id="email"
                        placeholder="Email"
                        type="email"
                      />
                      <FormErrorMessage>
                        {typeof form.errors.email === "string" ? form.errors.email : null}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Field name="address">
                  {({ field }: FieldProps) => (
                    <FormControl mt={4}>
                      <FormLabel htmlFor="address">Address</FormLabel>
                      <Input
                        {...field}
                        id="address"
                        placeholder="Address"
                        type="text"
                      />
                    </FormControl>
                  )}
                </Field>
                <Field name="bank_details">
                  {({ field }: FieldProps) => (
                    <FormControl mt={4}>
                      <FormLabel htmlFor="bank_details">Bank Details</FormLabel>
                      <Input
                        {...field}
                        id="bank_details"
                        placeholder="Bank Details"
                        type="text"
                      />
                    </FormControl>
                  )}
                </Field>
                <Field name="supplier_id">
                  {({ field, form }: FieldProps) => (
                    <FormControl mt={4} isRequired isInvalid={!!(form.errors.supplier_id && form.touched.supplier_id)}>
                      <FormLabel htmlFor="supplier_id">Supplier</FormLabel>
                      <Select
                        {...field}
                        id="supplier_id"
                        placeholder="Select Supplier"
                      >
                        {suppliers?.data.map((supplier) => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </option>
                        ))}
                      </Select>
                      <FormErrorMessage>
                        {typeof form.errors.supplier_id === "string" ? form.errors.supplier_id : null}
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

export default AddSupplierContact;
