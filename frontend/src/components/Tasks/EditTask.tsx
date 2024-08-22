import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Select,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, SubmitHandler } from "react-hook-form";
import { type ApiError, type TaskUpdate, type TaskPublic, TasksService } from "../../client";
import useCustomToast from "../../hooks/useCustomToast";

interface EditTaskProps {
  task: TaskPublic;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: () => void; // Add this line
}

const EditTask = ({ task, isOpen, onClose, onTaskUpdated }: EditTaskProps) => {
  const queryClient = useQueryClient();
  const showToast = useCustomToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors, isDirty },
  } = useForm<TaskUpdate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: task, // Use the task data as default values
  });

  const mutation = useMutation({
    mutationFn: (data: TaskUpdate) =>
      TasksService.updateTask({ taskId: task.id, requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Task updated successfully.", "success");
      onTaskUpdated(); // Call this function after successful update
      onClose();
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail;
      showToast("Something went wrong.", `${errDetail}`, "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const onSubmit: SubmitHandler<TaskUpdate> = async (data) => {
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
        <ModalHeader>Edit Task</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl isInvalid={!!errors.title}>
            <FormLabel htmlFor="title">Title</FormLabel>
            <Input
              id="title"
              {...register("title", {
                required: "Title is required",
              })}
              type="text"
            />
            {errors.title && <FormErrorMessage>{errors.title.message}</FormErrorMessage>}
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
          <FormControl mt={4} isInvalid={!!errors.status}>
            <FormLabel htmlFor="status">Status</FormLabel>
            <Select {...register("status", { required: "Status is required" })} id="status">
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </Select>
            {errors.status && <FormErrorMessage>{errors.status.message}</FormErrorMessage>}
          </FormControl>
          <FormControl mt={4}>
            <FormLabel htmlFor="due_date">Due Date</FormLabel>
            <Input {...register("due_date")} id="due_date" type="date" />
          </FormControl>
        </ModalBody>
        <ModalFooter gap={3}>
          <Button colorScheme="blue" type="submit" isLoading={isSubmitting} isDisabled={!isDirty}>
            Save
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditTask;




