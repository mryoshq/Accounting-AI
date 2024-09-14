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
  Alert,
  AlertIcon,
  Center,
} from "@chakra-ui/react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import useCustomToast from "../../hooks/useCustomToast";
import { UserPublic, UsersService, ApiTokenResponse, Message, TDataCreateApiToken } from "../../client";

interface FormData {
  password: string;
  newToken?: string;
}

const TokenDisplay: React.FC<{ tokenData: ApiTokenResponse | null }> = ({ tokenData }) => {
  const bgColor = useColorModeValue("gray.100", "gray.700");
  const borderColor = useColorModeValue("gray.300", "gray.600");

  return (
    <Center>
      <Box 
        bg={bgColor} 
        borderWidth={1} 
        borderColor={borderColor} 
        borderRadius="md" 
        p={4} 
        minWidth="500px"
      >
        <Text textAlign={"left"} fontWeight="bold" mb={2}>Current Token:</Text>
        <Text textAlign={"center"}>
        <Tag size="lg" variant="outline" colorScheme={tokenData?.is_active ? "green" : "red"}>
          {tokenData ? tokenData.token_preview : "No token set"}
        </Tag>
          </Text>
        {tokenData && tokenData.created_at && (
          <Text textAlign={"right"} mt={2} fontSize="xs" color={"gray"}>
            Created: {new Date(tokenData.created_at).toLocaleString()}
          </Text>
        )}
      </Box>
    </Center>
  );
};

const EnvironmentVariables: React.FC = () => {
  const color = useColorModeValue("inherit", "ui.light");
  const showToast = useCustomToast();
  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);
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

  const { data: tokenData, refetch: refetchToken } = useQuery<ApiTokenResponse | null>({
    queryKey: ["apiToken"],
    queryFn: () => UsersService.getApiTokenPreview(),
    enabled: !!currentUser?.is_superuser,
    retry: false,
  });

  const createTokenMutation = useMutation<ApiTokenResponse, Error, TDataCreateApiToken>({
    mutationFn: (data) => UsersService.createApiToken(data),
    onSuccess: () => {
      showToast("Success!", "API Token created/updated.", "success");
      refetchToken();
    },
    onError: (error: Error) => {
      showToast("Error!", error.message || "Failed to create/update token.", "error");
    },
  });

  const deleteTokenMutation = useMutation<Message, Error, void>({
    mutationFn: () => UsersService.deleteApiToken(),
    onSuccess: () => {
      showToast("Success!", "API Token deleted.", "success");
      queryClient.setQueryData<ApiTokenResponse | null>(["apiToken"], null);
    },
    onError: (error: Error) => {
      showToast("Error!", error.message || "Failed to delete token.", "error");
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (isSubmitting) return;

    try {
      if (isCreatingOrUpdating) {
        if (!data.newToken) {
          showToast("Error!", "New token is required.", "error");
          return;
        }
        await createTokenMutation.mutateAsync({
          requestBody: { password: data.password, token: data.newToken }
        });
      } else {
        await deleteTokenMutation.mutateAsync();
      }
      reset();
    } catch (error) {
      // Error is handled in mutation callbacks
    }
  };

  if (!currentUser?.is_superuser) {
    return (
      <Container maxW="full">
        <Alert status="warning">
          <AlertIcon />
          Only superusers can manage API tokens.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="full" as="form" onSubmit={handleSubmit(onSubmit)}>
      <Flex justifyContent="space-between" alignItems="right" py={4}>
        <Heading size="sm">API Token Management</Heading>
        <Box>
          <Button
            variant="outline"
            colorScheme="purple"
            onClick={() => setIsCreatingOrUpdating(!isCreatingOrUpdating)}
            type="button"
            mx={2}
          >
            {isCreatingOrUpdating ? "Switch to Delete" : "Switch to Create/Update"}
          </Button>
          <Button
            variant="primary"
            type="submit"
            isLoading={isSubmitting || createTokenMutation.isPending || deleteTokenMutation.isPending}
          >
            {isCreatingOrUpdating ? (tokenData ? "Update" : "Create") : "Delete"} Token
          </Button>
        </Box>
      </Flex>
      
      <VStack spacing={8} align="stretch" mb={6}>
        <TokenDisplay tokenData={tokenData || null} />

        <Flex justifyContent="center">
          <Box w={{ base: "full", md: "50%" }} maxWidth="500px">
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
      </VStack>
    </Container>
  );
};

export default EnvironmentVariables;