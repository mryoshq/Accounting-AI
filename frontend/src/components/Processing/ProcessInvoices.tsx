import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  Box,
  Flex,
  Spinner,
  Center,
  Image,
} from "@chakra-ui/react";
import AddExternalInvoice from '../Externalinvoices/AddExternalinvoice';
import AddInternalInvoice from '../Internalinvoices/AddInternalinvoice';
import AddPart from '../Parts/AddPart';
import { type SupplierPublic, type CustomerPublic } from "../../client";

interface ProcessInvoicesProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFiles: File[];
  processedData: any[];
  isPending: boolean;
  invoiceType: 'external' | 'internal';
}

const ProcessInvoices: React.FC<ProcessInvoicesProps> = ({ isOpen, onClose, selectedFiles, processedData, isPending, invoiceType }) => {
  const [currentInvoiceIndex, setCurrentInvoiceIndex] = useState<number>(0);
  const [currentPartIndex, setCurrentPartIndex] = useState<number>(-1);
  const [isInvoiceLoading, setIsInvoiceLoading] = useState<boolean>(false);
  const [isPartLoading, setIsPartLoading] = useState<boolean>(false);
  const [isPartModalOpen, setIsPartModalOpen] = useState<boolean>(false);
  const [invoiceId, setInvoiceId] = useState<number | undefined>(undefined);
  const [matchedEntity, setMatchedEntity] = useState<SupplierPublic | CustomerPublic | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      console.log("Modal opened. Current Invoice Index:", currentInvoiceIndex);
      setIsInvoiceLoading(true);
      setTimeout(() => {
        setIsInvoiceLoading(false);
      }, 500);
    }
  }, [isOpen, currentInvoiceIndex]);

  const handleInvoiceSave = (id?: number, matched?: SupplierPublic | CustomerPublic) => {
    console.log("Invoice saved. Moving to next step...");
    setInvoiceId(id);
    setMatchedEntity(matched);
    if (invoiceType === 'external') {
      setIsPartLoading(true);
      setCurrentPartIndex(0);
      setIsPartModalOpen(true);
      setTimeout(() => {
        setIsPartLoading(false);
      }, 500);
    } else {
      moveToNextInvoice();
    }
  };

  const handlePartSave = () => {
    const currentInvoice = processedData[currentInvoiceIndex].invoice_data;
    if (currentPartIndex < currentInvoice.items.length - 1) {
      setIsPartLoading(true);
      setCurrentPartIndex(currentPartIndex + 1);
      setTimeout(() => {
        setIsPartLoading(false);
      }, 500);
    } else {
      moveToNextInvoice();
    }
  };

  const handleInvoiceCancel = () => {
    moveToNextInvoice();
  };

  const handlePartCancel = () => {
    const currentInvoice = processedData[currentInvoiceIndex].invoice_data;
    if (currentPartIndex < currentInvoice.items.length - 1) {
      setCurrentPartIndex(currentPartIndex + 1);
    } else {
      moveToNextInvoice();
    }
  };

  const moveToNextInvoice = () => {
    setIsInvoiceLoading(true);
    setIsPartModalOpen(false);
    setCurrentPartIndex(-1);
    if (currentInvoiceIndex < selectedFiles.length - 1) {
      setCurrentInvoiceIndex(currentInvoiceIndex + 1);
      setTimeout(() => {
        setIsInvoiceLoading(false);
      }, 500);
    } else {
      handleModalClose();
    }
  };

  const handleModalClose = () => {
    setCurrentInvoiceIndex(0);
    setCurrentPartIndex(-1);
    setIsInvoiceLoading(false);
    setIsPartLoading(false);
    setIsPartModalOpen(false);
    onClose();
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return "";
    const [year, month, day] = date.split("-");
    return `${year}-${month}-${day}`;
  };

  const currentInvoiceData = processedData[currentInvoiceIndex]?.invoice_data;
  const currentItemData = currentInvoiceData?.items?.[currentPartIndex];
  const documentImage = processedData[currentInvoiceIndex]?.document_image;

  const invoicePrefillData = currentInvoiceData ? {
    reference: currentInvoiceData.invoice_number,
    invoice_date: formatDate(currentInvoiceData.invoice_date),
    amount_ttc: currentInvoiceData.total_amount_ttc,
    amount_ht: currentInvoiceData.total_amount_ht,
    due_date: formatDate(currentInvoiceData.due_date),
    vat: currentInvoiceData.total_vat_amount,
    currency_type: currentInvoiceData.currency,
    supplier: currentInvoiceData.supplier,
    ice: currentInvoiceData.ice,
  } : {};

  const partPrefillData = currentItemData ? {
    item_code: currentItemData.code,
    description: currentItemData.description,
    quantity: currentItemData.quantity,
    unit_price: currentItemData.unit_price,
    //external_invoice_id: invoiceId,
    [invoiceType === 'external' ? 'external_invoice_id' : 'internal_invoice_id']: invoiceId,

  } : {};

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose} isCentered size={'full'}>
      <ModalOverlay />
      <ModalContent bg='tealAlpha.600' backdropFilter='blur(5px)'>
        <ModalHeader bg='whiteAlpha.300'>
          <Flex alignItems="center">
            <Text>Processed {invoiceType === 'external' ? 'External' : 'Internal'} Invoice Data</Text>
            <Box flex="1" textAlign="center">
              <Text fontSize="sm">
                Invoice {currentInvoiceIndex + 1} / {selectedFiles.length}
              </Text>
            </Box>
          </Flex>
        </ModalHeader>
        <ModalCloseButton onClick={handleModalClose} bg='whiteAlpha.100' _hover={{ bg: 'whiteAlpha.400', color: "red.300" }} />
        <ModalBody>
          <Box height="85vh">
            <Flex height="100%" justify="space-between">
              <Box width="50%" height="100%">
                {isPending ? (
                  <Center height="100%">
                    <Spinner size="xl" />
                  </Center>
                ) : (
                  documentImage && (
                    <Image
                      src={`data:image/jpeg;base64,${documentImage}`}
                      alt={`Document ${currentInvoiceIndex + 1}`}
                      objectFit="contain"
                      width="100%"
                      height="100%"
                    />
                  )
                )}
              </Box>
              <Box width="50%" height="100%" display="flex" alignItems="center" justifyContent="center">
                {isPending ? (
                  <Spinner size="xl" />
                ) : (
                  <Box overflow="auto" maxH="100%" width='70%' padding='2%' bg='whiteAlpha.500' borderRadius='8px'>
                    {isInvoiceLoading ? (
                      <Center height="100%">
                        <Spinner size="xl" />
                      </Center>
                    ) : currentPartIndex === -1 ? (
                      currentInvoiceData && (
                        invoiceType === 'external' ? (
                          <AddExternalInvoice
                            key={currentInvoiceIndex}
                            isOpen={isOpen}
                            onClose={handleInvoiceSave}
                            onCancel={handleInvoiceCancel} 
                            prefillData={invoicePrefillData}
                            invoiceProcess={true}
                          />
                        ) : (
                          <AddInternalInvoice
                            key={currentInvoiceIndex}
                            isOpen={isOpen}
                            onClose={handleInvoiceSave}
                            onCancel={handleInvoiceCancel} 
                            prefillData={invoicePrefillData}
                            invoiceProcess={true}
                          />
                        )
                      )
                    ) : (
                      currentItemData && invoiceType === 'external' && (
                        <Box textAlign="center">
                          <Text fontSize="sm">
                            Part {currentPartIndex + 1} / {currentInvoiceData.items.length}
                          </Text>
                          {isPartLoading ? (
                            <Center height="100%">
                              <Spinner size="xl" />
                            </Center>
                          ) : (
                            <AddPart
                              key={currentPartIndex}
                              isOpen={isPartModalOpen}
                              onClose={handlePartSave}
                              onCancel={handlePartCancel}
                              prefillData={{
                                ...partPrefillData,
                                supplier_id: (matchedEntity as SupplierPublic)?.id,
                              }}
                              invoiceProcess={true}
                            />
                          )}
                        </Box>
                      )
                    )}
                  </Box>
                )}
              </Box>
            </Flex>
          </Box>
        </ModalBody>
        <ModalFooter bg='whiteAlpha.300'>
          <Button variant="ghost" onClick={handleModalClose} bg='whiteAlpha.100' _hover={{ bg: 'whiteAlpha.400', color: "red.300" }} >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProcessInvoices;