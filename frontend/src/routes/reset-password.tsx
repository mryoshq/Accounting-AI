import {
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Text,
} from "@chakra-ui/react"
import { useMutation } from "@tanstack/react-query"
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { type SubmitHandler, useForm } from "react-hook-form"
import { type ApiError, LoginService } from "../client"
import { isLoggedIn } from "../hooks/useAuth"
import useCustomToast from "../hooks/useCustomToast"
import { passwordRules } from "../utils"

interface ResetPasswordForm {
  newPassword: string;
  confirmPassword: string;
}

export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      })
    }
  },
})

function ResetPassword() {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    mode: "onBlur",
    criteriaMode: "all",
  })
  const showToast = useCustomToast()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: LoginService.resetPasswordWithBackupCode,
    onSuccess: () => {
      showToast("Success!", "Password updated.", "success")
      navigate({ to: "/login" })
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail
      showToast("Something went wrong.", `${errDetail}`, "error")
    },
  })

  const onSubmit: SubmitHandler<ResetPasswordForm> = async (data) => {
    const email = localStorage.getItem('recoveryEmail');
    const backupCode = localStorage.getItem('backupCode');

    if (!email || !backupCode) {
      showToast("Error", "Recovery information not found. Please start the process again.", "error")
      navigate({ to: "/recover-password" })
      return;
    }

    mutation.mutate({ 
      email, 
      backupCode, 
      newPassword: data.newPassword 
    })

    // Clear stored recovery info
    localStorage.removeItem('recoveryEmail');
    localStorage.removeItem('backupCode');
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
        Reset Password
      </Heading>
      <Text textAlign="center">
        Please enter your new password.
      </Text>
      <FormControl isInvalid={!!errors.newPassword}>
        <FormLabel htmlFor="newPassword">New Password</FormLabel>
        <Input
          id="newPassword"
          {...register("newPassword", passwordRules())}
          type="password"
        />
        {errors.newPassword && (
          <FormErrorMessage>{errors.newPassword.message}</FormErrorMessage>
        )}
      </FormControl>
      <FormControl isInvalid={!!errors.confirmPassword}>
        <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
        <Input
          id="confirmPassword"
          {...register("confirmPassword", {
            validate: (value) => value === getValues("newPassword") || "Passwords do not match"
          })}
          type="password"
        />
        {errors.confirmPassword && (
          <FormErrorMessage>{errors.confirmPassword.message}</FormErrorMessage>
        )}
      </FormControl>
      <Button variant="primary" type="submit" isLoading={mutation.isPending}>
        Reset Password
      </Button>
    </Container>
  )
}

export default ResetPassword;