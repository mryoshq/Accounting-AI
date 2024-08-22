import {
  Box,
  Button,
  Container,
  Flex,
  Table,
  Tbody,
  Tr,
  Td,
  FormControl,
  FormErrorMessage,
  Input,
  Heading,
  useColorModeValue,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"

import {
  type ApiError,
  type UserPublic,
  type UserUpdateMe,
  UsersService,
} from "../../client"
import useAuth from "../../hooks/useAuth"
import useCustomToast from "../../hooks/useCustomToast"
import { emailPattern } from "../../utils"

const PicturePlaceholder = () => (
  <Box
    width="150px"
    height="200px"
    position="relative"
    border="2px solid"
    borderColor="gray.300"
    borderRadius="md"
    overflow="hidden"
  >
    <Box
      position="absolute"
      top="0"
      left="0"
      right="0"
      bottom="0"
      _before={{
        content: '""',
        position: "absolute",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        background: "linear-gradient(to bottom right, transparent calc(50% - 1px), red, transparent calc(50% + 1px))"
      }}
      _after={{
        content: '""',
        position: "absolute",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        background: "linear-gradient(to top right, transparent calc(50% - 1px), red, transparent calc(50% + 1px))"
      }}
    />
  </Box>
)

const UserInformation = () => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const [editMode, setEditMode] = useState(false)
  const { user: currentUser } = useAuth()
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { isSubmitting, errors, isDirty },
  } = useForm<UserPublic>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      full_name: currentUser?.full_name,
      email: currentUser?.email,
    },
  })

  const toggleEditMode = () => {
    setEditMode(!editMode)
  }

  const mutation = useMutation({
    mutationFn: (data: UserUpdateMe) =>
      UsersService.updateUserMe({ requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "User updated successfully.", "success")
      setEditMode(false)
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail
      showToast("Something went wrong.", `${errDetail}`, "error")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    },
  })

  const onSubmit: SubmitHandler<UserUpdateMe> = async (data) => {
    mutation.mutate(data)
  }

  const onCancel = () => {
    reset()
    setEditMode(false)
  }

  const borderColor = useColorModeValue("green", "white")

  return (
    <Container maxW="full" as="form" onSubmit={handleSubmit(onSubmit)}>
      <Flex justifyContent="space-between" alignItems="center" py={4}>
        <Heading size="sm">User Information</Heading>
        <Button
          variant="primary"
          onClick={editMode ? handleSubmit(onSubmit) : toggleEditMode}
          type="button"
          isLoading={isSubmitting}
          isDisabled={editMode && (!isDirty || !getValues("email"))}
        >
          {editMode ? "Save" : "Edit"}
        </Button>
      </Flex>
      <Flex justifyContent="center">
        <Box overflowX="auto" maxWidth="500px">
          <Table variant="simple" borderColor={borderColor}>
            <Tbody>
              <Tr>
                <Td colSpan={2} borderColor={borderColor}>
                  <Flex justifyContent="center" py={4}>
                    <PicturePlaceholder />
                  </Flex>
                </Td>
              </Tr>
              <Tr>
                <Td fontWeight="bold" borderColor={borderColor}>Full Name</Td>
                <Td borderColor={borderColor}>
                  {editMode ? (
                    <FormControl isInvalid={!!errors.full_name}>
                      <Input
                        {...register("full_name", { maxLength: 30 })}
                        placeholder="Enter full name"
                      />
                      {errors.full_name && (
                        <FormErrorMessage>{errors.full_name.message}</FormErrorMessage>
                      )}
                    </FormControl>
                  ) : (
                    currentUser?.full_name || "N/A"
                  )}
                </Td>
              </Tr>
              <Tr>
                <Td fontWeight="bold" borderColor={borderColor}>Email</Td>
                <Td borderColor={borderColor}>
                  {editMode ? (
                    <FormControl isInvalid={!!errors.email}>
                      <Input
                        {...register("email", {
                          required: "Email is required",
                          pattern: emailPattern,
                        })}
                        placeholder="Enter email"
                      />
                      {errors.email && (
                        <FormErrorMessage>{errors.email.message}</FormErrorMessage>
                      )}
                    </FormControl>
                  ) : (
                    currentUser?.email
                  )}
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>
      </Flex>
      {editMode && (
        <Flex justifyContent="center" mt={4}>
          <Button onClick={onCancel} isDisabled={isSubmitting}>
            Cancel
          </Button>
        </Flex>
      )}
    </Container>
  )
}

export default UserInformation