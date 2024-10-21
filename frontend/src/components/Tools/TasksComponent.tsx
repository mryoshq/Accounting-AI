import React, { useState, useMemo } from 'react';
import {
  VStack, HStack, Text, Box, Flex, Card, CardHeader, CardBody,
  Badge, useColorModeValue, IconButton, Grid, GridItem,
  Tooltip, Popover, PopoverTrigger, PopoverContent, PopoverHeader,
  PopoverArrow, PopoverCloseButton, PopoverBody, PopoverFooter,
  ButtonGroup, Button, Spinner
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TasksService, TaskPublic, TasksPublic, TaskStatus } from '../../client';
import useCustomToast from "../../hooks/useCustomToast";
import AddTask from '../Tasks/AddTask';
import EditTask from '../Tasks/EditTask';

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'To Do': return 'red';
    case 'In Progress': return 'yellow';
    case 'Done': return 'green';
    default: return 'gray';
  }
};

const TaskCard = ({ task, onEdit, onDelete }: { task: TaskPublic; onEdit: (task: TaskPublic) => void; onDelete: (id: number) => void }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'white');
  const descriptionColor = useColorModeValue('gray.600', 'gray.300');

  // Ensure status is always a string
  const status: string = task.status || 'No Status';

  return (
    <Card bg={cardBg} shadow="md" borderRadius="lg" width="100%" height="120px">
      <CardHeader>
        <Flex justifyContent="space-between" alignItems="center">
          <Text fontWeight="bold" color={textColor} fontSize="sm">{task.title}</Text>
          <HStack>
            <Badge colorScheme={getStatusColor(status)}>{status}</Badge>
            <IconButton
              icon={<EditIcon />}
              aria-label="Edit task"
              size="xs"
              onClick={() => onEdit(task)}
            />
            <Popover>
              <PopoverTrigger>
                <IconButton icon={<DeleteIcon />} aria-label="Delete task" size="xs" />
              </PopoverTrigger>
              <PopoverContent>
                <PopoverHeader fontWeight='semibold'>Confirmation</PopoverHeader>
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverBody>Are you sure you want to delete this task?</PopoverBody>
                <PopoverFooter display='flex' justifyContent='flex-end'>
                  <ButtonGroup size='sm'>
                    <Button variant='outline'>Cancel</Button>
                    <Button colorScheme='red' onClick={() => onDelete(task.id)}>Delete</Button>
                  </ButtonGroup>
                </PopoverFooter>
              </PopoverContent>
            </Popover>
          </HStack>
        </Flex>
      </CardHeader>
      <CardBody>
        <Flex justifyContent="space-between" alignItems="flex-start">
          <Tooltip label={task.description || "No description available"}>
            <Text color={descriptionColor} fontSize="xs" pl={2} pr={5} flex={1} noOfLines={1}>
              {task.description || "No description available"}
            </Text>
          </Tooltip>
          <Text fontSize="xs" color="gray.500">Due: {task.due_date || 'No due date'}</Text>
        </Flex>
      </CardBody>
    </Card>
  );
};

const formatDate = (dateString: string) => {
  const today = new Date().toISOString().split('T')[0];
  if (dateString === today) {
    return <VStack spacing={0} align="center"><Text fontWeight="bold">Today</Text></VStack>;
  }

  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  const yearColor = useColorModeValue('gray.500', 'gray.400');

  return (
    <VStack spacing={0} align="center">
      <Text fontWeight="bold">{day}</Text>
      <Text>{month}</Text>
      <Text fontSize="sm" color={yearColor}>{year}</Text>
    </VStack>
  );
};

const TaskRow = ({ date, tasks, onEdit, onDelete }: {
  date: string;
  tasks: { [status: string]: TaskPublic[] };
  onEdit: (task: TaskPublic) => void;
  onDelete: (id: number) => void;
}) => {
  const dateBg = useColorModeValue('gray.100', 'gray.700');

  return (
    <Grid templateColumns="120px 1fr 1fr 1fr" gap={4} alignItems="stretch">
      <GridItem>
        <Box 
          bg={dateBg}
          borderRadius="md"
          borderColor="white"
          borderWidth={2}
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={2}
          height="100%"
        >
          {formatDate(date)}
        </Box>
      </GridItem>
      {['To Do', 'In Progress', 'Done'].map((status) => (
        <GridItem key={status}>
          <VStack align="stretch" spacing={2} height="100%">
            {tasks[status]?.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </VStack>
        </GridItem>
      ))}
    </Grid>
  );
};

const TasksComponent: React.FC = () => {
  const queryClient = useQueryClient();
  const bgColor = useColorModeValue('gray.200', 'gray.500');
  const headerBgColor = useColorModeValue('gray.200', 'gray.700');
  const separatorColor = useColorModeValue('green.500', 'white');
  const showToast = useCustomToast();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskPublic | null>(null);
  const [addingTaskStatus, setAddingTaskStatus] = useState<TaskStatus | undefined>(undefined);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: tasksData, isLoading, error } = useQuery<TasksPublic>({
    queryKey: ['tasks', currentMonth],
    queryFn: async () => {
      const response = await TasksService.readTasks({ limit: 1000, skip: 0 });
      return response;
    },
  });

  const filteredTasks = useMemo(() => {
    if (!tasksData || !tasksData.data) return [];
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    return tasksData.data.filter((task: TaskPublic) => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return taskDate >= startOfMonth && taskDate <= endOfMonth;
    });
  }, [tasksData, currentMonth]);

  const deleteMutation = useMutation({
    mutationFn: (taskId: number) => TasksService.deleteTask({ taskId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showToast("Success!", "Task deleted successfully.", "success");
    },
    onError: (err: any) => {
      const errDetail = err.body?.detail || "An error occurred";
      showToast("Error", `Failed to delete task: ${errDetail}`, "error");
    },
  });

  const handleDeleteTask = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleEditTask = (task: TaskPublic) => {
    setEditingTask(task);
  };

  const handleAddTask = (status: TaskStatus) => {
    setAddingTaskStatus(status);
    setIsAddTaskOpen(true);
  };

  const { tasksByDate, sortedDates } = useMemo(() => {
    const grouped: { [key: string]: { [status: string]: TaskPublic[] } } = {};
    
    filteredTasks.forEach((task: TaskPublic) => {
      const date = task.due_date || 'No Date';
      if (!grouped[date]) {
        grouped[date] = { 'To Do': [], 'In Progress': [], 'Done': [] };
      }
      if (task.status) {
        grouped[date][task.status].push(task);
      }
    });

    const sortedDates = Object.keys(grouped).sort((a, b) => {
      if (a === 'No Date') return 1;
      if (b === 'No Date') return -1;
      return new Date(a).getTime() - new Date(b).getTime();
    });

    return { tasksByDate: grouped, sortedDates };
  }, [filteredTasks]);

  const getStatusBorderColor = (status: string): string => {
    switch (status) {
      case 'To Do': return 'red.500';
      case 'In Progress': return 'yellow.500';
      case 'Done': return 'green.500';
      default: return 'gray.500';
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <Box height="100%" display="flex" flexDirection="column" bg={bgColor}>
      <Box position="sticky" top={0} zIndex={1} bg={bgColor}>
        <Flex justifyContent="space-between" alignItems="center" mb={2} px={4} py={2}>
          <IconButton icon={<ChevronLeftIcon />} onClick={handlePrevMonth} aria-label="Previous month" />
          <Text fontWeight="bold">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
          <IconButton icon={<ChevronRightIcon />} onClick={handleNextMonth} aria-label="Next month" />
        </Flex>
        <Grid templateColumns="120px 1fr 1fr 1fr" gap={4} mb={2} px={4} py={2}>
          <GridItem>
            <Flex 
              bg={headerBgColor} 
              p={2} 
              borderRadius="md" 
              height="100%" 
              alignItems="center" 
              justifyContent="center"
              borderColor="white"
              borderWidth={2}
            >
              <Text fontWeight="bold" textAlign="center">Date</Text>
            </Flex>
          </GridItem>
          {(['To Do', 'In Progress', 'Done'] as TaskStatus[]).map((status) => (
            <GridItem key={status}>
              <Box 
                bg={headerBgColor} 
                p={2} 
                borderRadius="md" 
                height="100%"
                borderColor={getStatusBorderColor(status)}
                borderWidth={2}
              >
                <Flex justifyContent="space-between" alignItems="center">
                  <Text fontWeight="bold" flex={1} textAlign="center">{status}</Text>
                  <IconButton
                    icon={<AddIcon />}
                    aria-label={`Add ${status} task`}
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAddTask(status)}
                  />
                </Flex>
              </Box>
            </GridItem>
          ))}
        </Grid>
        <Box height="1px" bg={separatorColor} mx={4} mb={4} />
      </Box>
      <Box flex={1} overflowY="auto">
        {isLoading ? (
          <Flex justify="center" align="center" height="100%">
            <Spinner />
          </Flex>
        ) : error ? (
          <Text>Error loading tasks</Text>
        ) : (
          <VStack spacing={2} align="stretch" width="100%" px={4} pb={4}>
            {sortedDates.map((date, index) => (
              <React.Fragment key={date}>
                <TaskRow
                  date={date}
                  tasks={tasksByDate[date]}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
                {index < sortedDates.length - 1 && <Box height="1px" bg={separatorColor} />}
              </React.Fragment>
            ))}
          </VStack>
        )}
      </Box>

      {isAddTaskOpen && (
  <AddTask
    isOpen={isAddTaskOpen}
    onClose={() => {
      setIsAddTaskOpen(false);
      setAddingTaskStatus(undefined);
    }}
    onTaskCreated={() => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsAddTaskOpen(false);
      setAddingTaskStatus(undefined);
    }}
    initialStatus={addingTaskStatus}
    initialMonth={currentMonth}
  />
)}

      {editingTask && (
        <EditTask
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          task={editingTask}
          onTaskUpdated={() => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            setEditingTask(null);
          }}
        />
      )}
    </Box>
  );
};

export default TasksComponent;