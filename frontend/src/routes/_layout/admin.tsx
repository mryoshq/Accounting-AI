import {
  Badge,
  Box,
  Container,
  Flex,
  Heading,
  SkeletonText,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Avatar,
} from "@chakra-ui/react"
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import { Suspense } from "react"
import { type UserPublic, UsersService } from "../../client"
import ActionsMenu from "../../components/Common/ActionsMenu"
import Navbar from "../../components/Common/Navbar"

export const Route = createFileRoute("/_layout/admin")({
  component: Admin,
})

const MembersTableBody = () => {
  const queryClient = useQueryClient()
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"])

  const { data: users } = useSuspenseQuery({
    queryKey: ["users"],
    queryFn: () => UsersService.readUsers({}),
  })

  return (
    <Tbody>
      {users.data.map((user) => (
        <Tr key={user.id}>
          <Td>
            <Flex alignItems="center">
              <Avatar
                size="sm"
                name={user.full_name || user.email}
                src={user.profile_picture ? `data:image/jpeg;base64,${user.profile_picture}` : undefined}
                mr={2}
              />
              <Box>
                <Box color={!user.full_name ? "ui.dim" : "inherit"}>
                  {user.full_name || "N/A"}
                  {currentUser?.id === user.id && (
                    <Badge ml="1" colorScheme="teal">
                      You
                    </Badge>
                  )}
                </Box>
                <Box fontSize="sm" color="gray.500">
                  {user.email}
                </Box>
              </Box>
            </Flex>
          </Td>
          <Td>{user.is_superuser ? "Superuser" : "User"}</Td>
          <Td>
            <Flex gap={2}>
              <Box
                w="2"
                h="2"
                borderRadius="50%"
                bg={user.is_active ? "ui.success" : "ui.danger"}
                alignSelf="center"
              />
              {user.is_active ? "Active" : "Inactive"}
            </Flex>
          </Td>
          <Td>
            <Flex gap={2}>
              <Box
                w="2"
                h="2"
                borderRadius="50%"
                bg={user.api_token_enabled ? "ui.success" : "ui.danger"}
                alignSelf="center"
              />
              {user.api_token_enabled ? "Active" : "Inactive"}
            </Flex>
          </Td>
          <Td>
            <ActionsMenu
              type="User"
              value={user}
              disabled={currentUser?.id === user.id ? true : false}
            />
          </Td>
        </Tr>
      ))}
    </Tbody>
  )
}

const MembersBodySkeleton = () => {
  return (
    <Tbody>
      <Tr>
        {new Array(5).fill(null).map((_, index) => (
          <Td key={index}>
            <SkeletonText noOfLines={1} paddingBlock="16px" />
          </Td>
        ))}
      </Tr>
    </Tbody>
  )
}

function Admin() {
  return (
    <Container maxW="full">
      <Flex justifyContent="space-between" alignItems="center" mb={4} mt={7}>
        <Heading size="lg" mr={20}>User Management</Heading>
        <Navbar type="User" />
      </Flex>
      <TableContainer>
        <Table fontSize="md" size={{ base: "sm", md: "md" }}>
          <Thead>
            <Tr>
              <Th width="30%">User</Th>
              <Th width="15%">Role</Th>
              <Th width="15%">Status</Th>
              <Th width="20%">API Token Enabled</Th>
              <Th width="20%">Actions</Th>
            </Tr>
          </Thead>
          <Suspense fallback={<MembersBodySkeleton />}>
            <MembersTableBody />
          </Suspense>
        </Table>
      </TableContainer>
    </Container>
  )
}