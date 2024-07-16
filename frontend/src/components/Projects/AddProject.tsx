import React from "react";
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Checkbox,
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

import { type ApiError, type ProjectCreate, ProjectsService } from "../../client";
import useCustomToast from "../../hooks/useCustomToast";

interface AddProjectProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: any) => void;
}

const AddProject = ({ isOpen, onClose, onProjectCreated }: AddProjectProps) => {
  const initialRef = React.useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const showToast = useCustomToast();

  const mutation = useMutation({
    mutationFn: (data: ProjectCreate) =>
      ProjectsService.createProject({ requestBody: data }),
    onSuccess: (newProject) => {
      showToast("Success!", "Project created successfully.", "success");
      onProjectCreated(newProject);
      onClose();
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail;
      showToast("Something went wrong.", `${errDetail}`, "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const initialValues: ProjectCreate = {
    name: "",
    description: "",
    is_active: true,
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required."),
    description: Yup.string(),
    is_active: Yup.boolean(),
  });

  const onSubmit = (values: ProjectCreate, actions: FormikHelpers<ProjectCreate>) => {
    mutation.mutate(values);
    actions.setSubmitting(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: "sm", md: "md" }} isCentered initialFocusRef={initialRef}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Project</ModalHeader>
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
                      <Input {...field} id="name" placeholder="Name" type="text" ref={initialRef} />
                      <FormErrorMessage>
                        {typeof form.errors.name === 'string' ? form.errors.name : null}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Field name="description">
                  {({ field }: FieldProps) => (
                    <FormControl mt={4}>
                      <FormLabel htmlFor="description">Description</FormLabel>
                      <Input {...field} id="description" placeholder="Description" type="text" />
                    </FormControl>
                  )}
                </Field>
                <Field name="is_active">
                  {({ field }: FieldProps) => (
                    <FormControl mt={4}>
                      <Checkbox {...field} id="is_active" colorScheme="teal" isChecked={field.value}>
                        Is active?
                      </Checkbox>
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

export default AddProject;