import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  Card,
  CardHeader,
  CardBody,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ProjectsService, type ProjectPublic } from "../../client";
import ActionsMenu from "../../components/Common/ActionsMenu";
import Navbar from "../../components/Common/Navbar";

export const Route = createFileRoute("/_layout/projects")({
  component: Projects,
});

function ProjectCard({ project }: { project: ProjectPublic }) {
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'white');
  const descriptionColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Card bg={cardBg} shadow="md" borderRadius="lg" width="100%" height="150px">
      <CardHeader>
        <Flex justifyContent="space-between" alignItems="center">
          <Heading size="md" color={textColor}>{project.name}</Heading>
          <Badge colorScheme={project.is_active ? "green" : "brown"}>
            {project.is_active ? "Active" : "shelfed"}
          </Badge>
        </Flex>
      </CardHeader>
      <CardBody>
        <Flex justifyContent="space-between" alignItems="flex-start">
          <Text color={descriptionColor} pl={4} flex={1}>
            {project.description || "No description available"}
          </Text>
          <ActionsMenu type="Project" value={project} />
        </Flex>
      </CardBody>
    </Card>
  );
}


function ProjectsList() {
  const { data: projects } = useSuspenseQuery({
    queryKey: ["projects"],
    queryFn: () => ProjectsService.readProjects(),
  });

  return (
    <VStack spacing={4} width="100%" align="stretch">
      {projects.data.map((project: ProjectPublic) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </VStack>
  );
}

function Projects() {

  return (
    <Flex direction="column" height="100vh" width="100%" >
      <Box width="100%" p={4}>
        <Flex justifyContent="space-between" alignItems="center" mb={4} mt={3}>
          <Heading size="lg">Projects Management</Heading>
          <Navbar type="Project" />
        </Flex>
        
   
      </Box>

      <Box flex="1" overflow="auto" width="100%" px={4} pb={4}>
        <ErrorBoundary fallbackRender={({ error }) => (
          <Box p={4} bg="red.100" color="red.700" borderRadius="md">
            Something went wrong: {error.message}
          </Box>
        )}>
          <Suspense fallback={<VStack spacing={4} width="100%" align="stretch">
            {[...Array(3)].map((_, i) => (
              <Card key={i} height="200px" width="100%" bg="gray.100" />
            ))}
          </VStack>}>
            <ProjectsList />
          </Suspense>
        </ErrorBoundary>
      </Box>
    </Flex>
  );
}

export default Projects;