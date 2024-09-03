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
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Field, Form, Formik, FieldProps, FormikHelpers } from "formik";
import * as Yup from "yup";
import { ApiError, PartCreate, PartsService, ExternalInvoicesService, SuppliersService, ProjectsService } from "../../client";
import useCustomToast from "../../hooks/useCustomToast";

interface AddPartProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  prefillData?: Partial<PartCreate>;
  invoiceProcess?: boolean;
}

const AddPart: React.FC<AddPartProps> = ({ isOpen, onClose, onCancel, prefillData, invoiceProcess }) => {
  const queryClient = useQueryClient();
  const showToast = useCustomToast();
  const initialRef = useRef<HTMLInputElement>(null);

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
    mutationFn: (data: PartCreate) =>
      PartsService.createPart({ requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Part created successfully.", "success");
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

  const initialValues: PartCreate = {
    item_code: "",
    description: "",
    quantity: 1,
    unit_price: 0,
    external_invoice_id: 0,
    supplier_id: 0,
    project_id: 0,
    ...prefillData,
  };

  const validationSchema = Yup.object({
    item_code: Yup.string().required("Item code is required."),
    description: Yup.string(),
    quantity: Yup.number().required("Quantity is required.").min(1, "Quantity must be at least 1."),
    unit_price: Yup.number().required("Unit price is required.").min(0, "Unit price must be at least 0."),
    external_invoice_id: Yup.number().required("Please select a valid External Invoice ID."),
    supplier_id: Yup.number().required("Please select a valid Supplier."),
    project_id: Yup.number().required("Please select a valid Project."),
  });

  const onSubmit = (values: PartCreate, actions: FormikHelpers<PartCreate>) => {
    mutation.mutate(values);
    actions.setSubmitting(false);
  };

  const isPrefilled = (fieldName: keyof PartCreate) => {
    const value = prefillData && prefillData[fieldName];
    return value !== undefined && value !== null && value !== "";
  };

  const form = (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {(props) => (
        <Form>
          <ModalBody pb={6}>
            <Field name="item_code">
              {({ field, form }: FieldProps) => (
                <FormControl isRequired isInvalid={!!(form.errors.item_code && form.touched.item_code)}>
                  <FormLabel htmlFor="item_code">Item Code</FormLabel>
                  <Input
                    {...field}
                    id="item_code"
                    placeholder="Item Code"
                    type="text"
                    bg={isPrefilled("item_code") ? "yellow.500" : "transparent"}
                    ref={initialRef}
                  />
                  <FormErrorMessage>
                    {typeof form.errors.item_code === "string" ? form.errors.item_code : null}
                  </FormErrorMessage>
                </FormControl>
              )}
            </Field>
            <Field name="description">
              {({ field }: FieldProps) => (
                <FormControl mt={4}>
                  <FormLabel htmlFor="description">Description</FormLabel>
                  <Input
                    {...field}
                    id="description"
                    placeholder="Description"
                    type="text"
                    bg={isPrefilled("description") ? "yellow.500" : "transparent"}
                  />
                </FormControl>
              )}
            </Field>
            <Field name="quantity">
              {({ field, form }: FieldProps) => (
                <FormControl mt={4} isRequired isInvalid={!!(form.errors.quantity && form.touched.quantity)}>
                  <FormLabel htmlFor="quantity">Quantity</FormLabel>
                  <Input
                    {...field}
                    id="quantity"
                    placeholder="Quantity"
                    type="number"
                    bg={isPrefilled("quantity") ? "yellow.500" : "transparent"}
                  />
                  <FormErrorMessage>
                    {typeof form.errors.quantity === "string" ? form.errors.quantity : null}
                  </FormErrorMessage>
                </FormControl>
              )}
            </Field>
            <Field name="unit_price">
              {({ field, form }: FieldProps) => (
                <FormControl mt={4} isRequired isInvalid={!!(form.errors.unit_price && form.touched.unit_price)}>
                  <FormLabel htmlFor="unit_price">Unit Price</FormLabel>
                  <Input
                    {...field}
                    id="unit_price"
                    placeholder="Unit Price"
                    type="number"
                    step="0.01"
                    bg={isPrefilled("unit_price") ? "yellow.500" : "transparent"}
                  />
                  <FormErrorMessage>
                    {typeof form.errors.unit_price === "string" ? form.errors.unit_price : null}
                  </FormErrorMessage>
                </FormControl>
              )}
            </Field>
            <Field name="external_invoice_id">
              {({ field, form }: FieldProps) => (
                <FormControl mt={4} isRequired isInvalid={!!(form.errors.external_invoice_id && form.touched.external_invoice_id)}>
                  <FormLabel htmlFor="external_invoice_id">External Invoice</FormLabel>
                  <Select
                    {...field}
                    id="external_invoice_id"
                    placeholder="Select External Invoice"
                    bg={isPrefilled("external_invoice_id") ? "yellow.500" : "transparent"}
                    disabled={invoiceProcess}
                  >
                    {externalInvoices?.data.map((invoice: any) => (
                      <option key={invoice.id} value={invoice.id}>
                        {invoice.reference}
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>
                    {typeof form.errors.external_invoice_id === "string" ? form.errors.external_invoice_id : null}
                  </FormErrorMessage>
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
                    bg={isPrefilled("supplier_id") ? "yellow.500" : "transparent"}
                    disabled={invoiceProcess}
                  >
                    {suppliers?.data.map((supplier: any) => (
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
            <Field name="project_id">
              {({ field, form }: FieldProps) => (
                <FormControl mt={4} isInvalid={!!(form.errors.project_id && form.touched.project_id)}>
                  <FormLabel htmlFor="project_id">Project</FormLabel>
                  <Select
                    {...field}
                    id="project_id"
                    placeholder="Select Project"
                    bg={isPrefilled("project_id") ? "yellow.500" : "transparent"}
                    disabled={invoiceProcess} // Add this line
                  >
                    {projects?.data.map((project: any) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>
                    {typeof form.errors.project_id === "string" ? form.errors.project_id : null}
                  </FormErrorMessage>
                </FormControl>
              )}
            </Field>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button mt={4} variant="primary" type="submit" isLoading={props.isSubmitting}>
              Save
            </Button>
            <Button mt={4} onClick={onCancel}>Cancel</Button>
          </ModalFooter>
        </Form>
      )}
    </Formik>
  );

  if (invoiceProcess && prefillData) {
    return form;
  }

  return (
    <Modal isOpen={isOpen} onClose={onCancel} size={{ base: "sm", md: "md" }} isCentered initialFocusRef={initialRef}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Part</ModalHeader>
        <ModalCloseButton />
        {form}
      </ModalContent>
    </Modal>
  );
};

export default AddPart;