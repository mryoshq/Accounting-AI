import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  useColorModeValue,
  VStack,
  HStack,
  useClipboard,
  Alert,
  AlertIcon,
  Tag,
  TagLabel,
  Center,
} from "@chakra-ui/react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { UsersService, ApiError } from "../../client"
import useCustomToast from "../../hooks/useCustomToast"

const BackupCodes: React.FC = () => {
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showCodes, setShowCodes] = useState(false);
  const { onCopy, hasCopied } = useClipboard(backupCodes.join(", "));
  const showToast = useCustomToast();
  const color = useColorModeValue("inherit", "ui.light");
  const containerContourColor = useColorModeValue("teal.500", "gray.500");

  const { data: hasBackupCodes, refetch: refetchHasBackupCodes } = useQuery({
    queryKey: ['hasBackupCodes'],
    queryFn: UsersService.hasBackupCodes
  });

  const generateCodesMutation = useMutation({
    mutationFn: UsersService.generateBackupCodes,
    onSuccess: (data) => {
      setBackupCodes(data);
      setShowCodes(true);
      refetchHasBackupCodes();
      showToast("Success", "Backup codes generated successfully", "success");
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail;
      showToast("Something went wrong.", `${errDetail}`, "error");
    },
  });

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setShowCodes(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleStoredSafely = () => {
    setShowCodes(false);
    showToast("Success", "Backup codes hidden", "success");
  };

  return (
    <Container maxW="full">
      <Flex justifyContent="space-between" alignItems="center" py={4}>
        <Heading size="sm">Backup Codes</Heading>
        <Button
          variant="primary"
          onClick={() => generateCodesMutation.mutate()}
          isLoading={generateCodesMutation.isPending}
        >
          Generate New Codes
        </Button>
      </Flex>
      <Box>
        {hasBackupCodes ? (
          <Alert status="info">
            <AlertIcon />
            You have already generated backup codes. Generating new codes will invalidate the old ones.
          </Alert>
        ) : (
          <Text color={color}>
            You haven't generated any backup codes yet. Generate them to ensure you can access your account if you lose your device.
          </Text>
        )}
      </Box>
      {backupCodes.length > 0 && showCodes && (
        <Center my={8}>
          <Box
            borderWidth={1}
            borderColor={containerContourColor}
            borderRadius={12}
            p={6}
          >
            <VStack align="center" spacing={4}>
              <Text fontWeight="bold">Your Backup Codes:</Text>
              <HStack wrap="wrap" justify="center" spacing={4}>
                {backupCodes.map((code, index) => (
                  <Tag key={index} size="lg" variant="solid" colorScheme="teal">
                    <TagLabel>{code}</TagLabel>
                  </Tag>
                ))}
              </HStack>
              <HStack spacing={4}>
                <Button onClick={onCopy}>
                  {hasCopied ? "Copied!" : "Copy Codes"}
                </Button>
                <Button onClick={handleStoredSafely} colorScheme="green">
                  I've Stored Them Safely
                </Button>
              </HStack>
              <Text color="red.500" fontWeight="bold">
                Store these codes safely. They will not be shown again!
              </Text>
            </VStack>
          </Box>
        </Center>
      )}
    </Container>
  )
}

export default BackupCodes;