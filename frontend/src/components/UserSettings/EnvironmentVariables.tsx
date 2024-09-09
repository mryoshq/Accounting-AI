import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack,
  useColorModeValue,
  Tag,
} from "@chakra-ui/react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import useCustomToast from "../../hooks/useCustomToast";
import { UserPublic } from "../../client";

interface FormData {
  password: string;
  newToken?: string;
}

const EnvironmentVariables: React.FC = () => {
  const color = useColorModeValue("inherit", "ui.light");
  const showToast = useCustomToast();
  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);
  const [token, setToken] = useState<string | null>(null); // This should be fetched from the backend in a real scenario
  const [isCreatingOrUpdating, setIsCreatingOrUpdating] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    mode: "onBlur",
    criteriaMode: "all",
  });

  const validatePassword = async (password: string) => {
    // This is where you would verify the password with the backend
    // For now, we'll just simulate a password check
    return password === "password";
  };

  const createOrUpdateToken = (newToken: string) => {
    // This is a mock function. Replace with actual API call when backend is ready.
    setToken(newToken);
    showToast("Success!", "API Token created/updated.", "success");
  };

  const deleteToken = () => {
    // This is a mock function. Replace with actual API call when backend is ready.
    setToken(null);
    showToast("Success!", "API Token deleted.", "success");
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (isSubmitting) return;

    try {
      const isPasswordValid = await validatePassword(data.password);
      if (!isPasswordValid) {
        showToast("Error!", "Incorrect password.", "error");
        return;
      }

      if (isCreatingOrUpdating) {
        if (!data.newToken) {
          showToast("Error!", "New token is required.", "error");
          return;
        }
        createOrUpdateToken(data.newToken);
      } else {
        deleteToken();
      }
      reset();
    } catch (error) {
      showToast("Error!", "An error occurred.", "error");
    }
  };

  const formatToken = (token: string) => {
    return `${token.slice(0, 5)}${'*'.repeat(20)}${token.slice(-5)}`;
  };

  return (
    <Container maxW="full" as="form" onSubmit={handleSubmit(onSubmit)}>
      <Flex justifyContent="space-between" alignItems="center" py={4}>
        <Heading size="sm">API Token Management</Heading>
        
        <Button
              variant="outline"
              colorScheme="purple"
              onClick={() => setIsCreatingOrUpdating(!isCreatingOrUpdating)}
              type="button"
              
            >
              {isCreatingOrUpdating ? "Switch to Delete" : "Switch to Create/Update"}
        </Button>
        <Button
          variant="primary"
          type="submit"
          isLoading={isSubmitting}
        >
          {isCreatingOrUpdating ? (token ? "Update" : "Create") : "Delete"} Token
        </Button>
      </Flex>
      <Flex justifyContent="center">
        <Box w={{ base: "full", md: "50%" }} maxWidth="500px">
          <VStack align="stretch" spacing={4} mb={6}>
            <Text><strong>Current Token:</strong> </Text>
             <Tag>{token ? formatToken(token) : "No token set"}</Tag>
          </VStack>

          <FormControl isRequired isInvalid={!!errors.password}>
            <FormLabel color={color}>Password</FormLabel>
            <Input
              {...register("password", {
                required: "Password is required",
              })}
              type="password"
              placeholder="Enter your password"
            />
            {errors.password && (
              <FormErrorMessage>{errors.password.message}</FormErrorMessage>
            )}
          </FormControl>

          {isCreatingOrUpdating && (
            <FormControl mt={4} isInvalid={!!errors.newToken}>
              <FormLabel color={color}>New Token</FormLabel>
              <Input
                {...register("newToken", {
                  required: "New token is required when creating or updating",
                })}
                type="text"
                placeholder="Enter new token"
              />
              {errors.newToken && (
                <FormErrorMessage>{errors.newToken.message}</FormErrorMessage>
              )}
            </FormControl>
          )}

          
        </Box>
      </Flex>
    </Container>
  );
};

export default EnvironmentVariables;