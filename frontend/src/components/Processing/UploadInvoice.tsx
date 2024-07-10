import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useToast,
  UseToastOptions,
  Text,
  Flex,
  IconButton,
  List,
  ListItem,
  Input,
  FormControl,
  FormLabel,
  Switch,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { useDisclosure } from "@chakra-ui/react";
import ProcessInvoices from './ProcessInvoices';
import SilentProcess from './SilentProcess';
import { useMutation } from "@tanstack/react-query";
import { ExternalInvoicesService, InternalInvoicesService, Body_external_invoices_process_external_invoices, InvoiceProcessingResponse } from "../../client";

interface UploadInvoiceProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceType: 'external' | 'internal';
}

const UploadInvoice: React.FC<UploadInvoiceProps> = ({ isOpen, onClose, invoiceType }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [silentMode, setSilentMode] = useState<boolean>(false);
  const toast = useToast();
  const { isOpen: isDataModalOpen, onOpen: onOpenDataModal, onClose: onCloseDataModal } = useDisclosure();

  const mutation = useMutation<InvoiceProcessingResponse, Error, FormData>({
    mutationFn: (formData: FormData) => {
      const requestData: Body_external_invoices_process_external_invoices = {
        files: Array.from(formData.getAll('files') as File[]),
      };
      console.log("Sending request data:", requestData);
      return invoiceType === 'external' 
        ? ExternalInvoicesService.processExternalInvoices({ formData: requestData })
        : InternalInvoicesService.processInternalInvoices({ formData: requestData });
    },
    onSuccess: (data) => {
      console.log("Received processed data:", data);
      setProcessedData(data.data);
      setIsPending(false);
      if (!silentMode) {
        const toastOptions: UseToastOptions = {
          title: "Success",
          description: `${invoiceType === 'external' ? 'External' : 'Internal'} invoices processed successfully.`,
          status: "success",
          duration: 5000,
          isClosable: true,
        };
        toast(toastOptions);
      }
    },
    onError: (error: Error) => {
      console.error(`Error processing ${invoiceType} invoices:`, error);
      setIsPending(false);
      if (!silentMode) {
        const toastOptions: UseToastOptions = {
          title: "Error",
          description: error.message || `An error occurred while processing ${invoiceType} invoices.`,
          status: "error",
          duration: 5000,
          isClosable: true,
        };
        toast(toastOptions);
      }
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(prevFiles => [...prevFiles, ...Array.from(files)]);
    }
  };

  const handleRemoveFile = (fileName: string) => {
    setSelectedFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
  };

  const handleSubmit = () => {
    if (selectedFiles.length > 0) {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });
      console.log("Form data ready to be submitted:", formData);
      setIsPending(true);
      onOpenDataModal();
      onClose();
      mutation.mutate(formData);
    } else {
      const toastOptions: UseToastOptions = {
        title: "No files selected",
        description: "Please select at least one file to upload.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      };
      toast(toastOptions);
    }
  };

  const clearSelectedFiles = () => {
    console.log("Clearing selected files.");
    setSelectedFiles([]);
  };

  const handleModalClose = () => {
    clearSelectedFiles();
    setIsPending(false);
    onClose();
    onCloseDataModal();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleModalClose} isCentered size={'lg'}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload {invoiceType === 'external' ? 'External' : 'Internal'} Invoice</ModalHeader>
          <ModalCloseButton onClick={handleModalClose} />
          <ModalBody>
            <Input
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button as="span" colorScheme="blue" width="100%">
                Upload Files
              </Button>
            </label>
            {selectedFiles.length > 0 && (
              <List spacing={2} mt={2}>
                {selectedFiles.map((file, index) => (
                  <ListItem key={index}>
                    <Flex alignItems="center" justifyContent="space-between">
                      <Text>{file.name}</Text>
                      <IconButton
                        aria-label="Remove file"
                        icon={<CloseIcon />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleRemoveFile(file.name)}
                      />
                    </Flex>
                  </ListItem>
                ))}
              </List>
            )}
            <FormControl display='flex' alignItems='center' mt={4}>
              <FormLabel htmlFor='silent-mode' mb='0'>
                Silent Mode
              </FormLabel>
              <Switch id='silent-mode' isChecked={silentMode} onChange={(e) => setSilentMode(e.target.checked)} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={handleModalClose}>
              Close
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              ml={3}
            >
              Upload
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {silentMode ? (
        <SilentProcess
          isOpen={isDataModalOpen}
          onClose={handleModalClose}
          processedData={processedData}
          setProcessedData={setProcessedData}
          isPending={isPending}
          invoiceType={invoiceType}
        />
      ) : (
        <ProcessInvoices
          isOpen={isDataModalOpen}
          onClose={handleModalClose}
          selectedFiles={selectedFiles}
          processedData={processedData}
          isPending={isPending}
          invoiceType={invoiceType}
        />
      )}
    </>
  );
};

export default UploadInvoice;