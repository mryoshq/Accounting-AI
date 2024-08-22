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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, SubmitHandler } from "react-hook-form";
import { type ApiError, type TaskCreate, TasksService } from "../../client";
import useCustomToast from "../../hooks/useCustomToast";

interface AddTaskProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (task: any) => void;
  initialStatus?: string;
  initialMonth: Date;
}

const AddTask = ({ isOpen, onClose, onTaskCreated, initialStatus, initialMonth }: AddTaskProps) => {
  const queryClient = useQueryClient();
  const showToast = useCustomToast();

  const getInitialDueDate = () => {
    const date = new Date(initialMonth);
    date.setDate(date.getDate() + 1); // Set to tomorrow's date within the month
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<TaskCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      title: "",
      description: "",
      status: initialStatus || "To Do",
      due_date: getInitialDueDate(),
    },
  });

  const mutation = useMutation({
    mutationFn: (data: TaskCreate) =>
      TasksService.createTask({ requestBody: data }),
    onSuccess: (newTask) => {
      showToast("Success!", "Task created successfully.", "success");
      onTaskCreated(newTask);
      onClose();
      reset();
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail;
      showToast("Something went wrong.", `${errDetail}`, "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const onSubmit: SubmitHandler<TaskCreate> = async (data) => {
    mutation.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: "sm", md: "md" }} isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>Add Task</ModalHeader>
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
          <Button colorScheme="blue" type="submit" isLoading={isSubmitting}>
            Save
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddTask;