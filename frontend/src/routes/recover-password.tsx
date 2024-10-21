import {
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  Heading,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react"
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { type SubmitHandler, useForm } from "react-hook-form"
import { isLoggedIn } from "../hooks/useAuth"
import useCustomToast from "../hooks/useCustomToast"
import { emailPattern } from "../utils"

interface FormData {
  email: string
  backupCode: string
}

export const Route = createFileRoute("/recover-password")({
  component: RecoverPassword,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      })
    }
  },
})

function RecoverPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>()
  const showToast = useCustomToast()
  const navigate = useNavigate()

  const onSubmit: SubmitHandler<FormData> = async (formData) => {
    try {
      // Store the email and backup code in localStorage or state management
      localStorage.setItem('recoveryEmail', formData.email);
      localStorage.setItem('backupCode', formData.backupCode);
      
      // Navigate to reset password page
      navigate({ to: "/reset-password" });
    } catch (error) {
      showToast(
        "Error",
        "Invalid email or backup code. Please try again.",
        "error",
      )
    }
  }

  return (
    <Container
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      h="100vh"
      maxW="sm"
      alignItems="stretch"
      justifyContent="center"
      gap={4}
      centerContent
    >
      <Heading size="xl" color="ui.main" textAlign="center" mb={2}>
        Recover Password
      </Heading>
      <Text align="center">
        Enter your email and a backup code to reset your password.
      </Text>
      <VStack spacing={4}>
        <FormControl isInvalid={!!errors.email}>
          <Input
            id="email"
            {...register("email", {
              required: "Email is required",
              pattern: emailPattern,
            })}
            placeholder="Email"
            type="email"
          />
          {errors.email && (
            <FormErrorMessage>{errors.email.message}</FormErrorMessage>
          )}
        </FormControl>
        <FormControl isInvalid={!!errors.backupCode}>
          <Input
            id="backupCode"
            {...register("backupCode", {
              required: "Backup code is required",
            })}
            placeholder="Backup Code"
            type="text"
          />
          {errors.backupCode && (
            <FormErrorMessage>{errors.backupCode.message}</FormErrorMessage>
          )}
        </FormControl>
      </VStack>
      <Button variant="primary" type="submit" isLoading={isSubmitting}>
        Verify and Reset Password
      </Button>
    </Container>
  )
}

export default RecoverPassword;