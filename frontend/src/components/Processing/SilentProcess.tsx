import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Text,
  CloseButton,
  VStack,
  HStack,
  Progress,
  Center,
  useToast
} from "@chakra-ui/react";
import { 
  ExternalInvoicesService, 
  InternalInvoicesService, 
  PartsService, 
  SuppliersService, 
  CustomersService, 
  TDataCreateExternalInvoice, 
  TDataCreateInternalInvoice, 
  TDataCreatePart, 
  ApiError, 
  SupplierCreate, 
  CustomerCreate, 
  ExternalInvoicePublic, 
  InternalInvoicePublic, 
  ExternalInvoiceCreate, 
  InternalInvoiceCreate 
} from "../../client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import fuzzysort from 'fuzzysort';

interface SilentProcessProps {
  isOpen: boolean;
  onClose: () => void;
  processedData: any[];
  setProcessedData: (data: any[]) => void;
  isPending: boolean;
  invoiceType: 'external' | 'internal';
}

const SilentProcess: React.FC<SilentProcessProps> = ({ isOpen, onClose, processedData, setProcessedData, isPending, invoiceType }) => {
  const [currentInvoiceIndex, setCurrentInvoiceIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const currentIndexRef = useRef(0);
  const queryClient = useQueryClient();
  const toast = useToast();
  const autoCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: suppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => SuppliersService.readSuppliers(),
    enabled: invoiceType === 'external'
  });

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: () => CustomersService.readCustomers(),
    enabled: invoiceType === 'internal'
  });

  const findBestMatchingEntity = (entityName: string, ice: string) => {
    const entities = invoiceType === 'external' ? suppliers?.data : customers?.data;
    if (!entities) return null;
    
    console.log(`Searching for ${invoiceType === 'external' ? 'supplier' : 'customer'}: ${entityName}, ICE: ${ice}`);
    
    if (ice === "00000") {
      console.log("ICE is 00000, matching only by name");
      const results = fuzzysort.go(entityName, entities, {
        key: 'name',
        threshold: -10000,
      });

      if (results.length > 0 && results[0].score > -10000) {
        console.log("Best fuzzy match found:", results[0].obj);
        return results[0].obj;
      }
    } else {
      const exactMatch = entities.find(e => e.ice === ice);
      if (exactMatch) {
        console.log("Exact match found by ICE:", exactMatch);
        return exactMatch;
      }

      const results = fuzzysort.go(entityName, entities, {
        key: 'name',
        threshold: -10000,
      });

      if (results.length > 0) {
        const sortedResults = [...results].sort((a, b) => {
          const scoreDiff = b.score - a.score;
          if (scoreDiff !== 0) return scoreDiff;
          
          const aIceScore = fuzzysort.single(ice, a.obj.ice)?.score ?? -Infinity;
          const bIceScore = fuzzysort.single(ice, b.obj.ice)?.score ?? -Infinity;
          return bIceScore - aIceScore;
        });

        if (sortedResults[0].score > -10000) {
          console.log("Best fuzzy match found:", sortedResults[0].obj);
          return sortedResults[0].obj;
        }
      }
    }

    console.log(`No matching ${invoiceType === 'external' ? 'supplier' : 'customer'} found`);
    return null;
  };

  const createNewEntity = async (entityName: string, ice: string, postal_code: string) => {
    console.log(`Attempting to create new ${invoiceType === 'external' ? 'supplier' : 'customer'}: ${entityName}, ICE: ${ice}, Postal Code: ${postal_code}`);
    try {
      const newEntity = {
        name: entityName,
        ice: ice,
        postal_code: postal_code || "",
      };
      console.log(`${invoiceType === 'external' ? 'Supplier' : 'Customer'} payload:`, newEntity);
      const createdEntity = invoiceType === 'external' 
        ? await SuppliersService.createSupplier({ requestBody: newEntity as SupplierCreate })
        : await CustomersService.createCustomer({ requestBody: newEntity as CustomerCreate });
      console.log(`${invoiceType === 'external' ? 'Supplier' : 'Customer'} created successfully:`, createdEntity);
      return createdEntity;
    } catch (error) {
      console.error(`Error creating new ${invoiceType === 'external' ? 'supplier' : 'customer'}:`, error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        toast({
          title: `Error creating ${invoiceType === 'external' ? 'supplier' : 'customer'}`,
          description: `${error.message}. Check console for more details.`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } else if (typeof error === 'object' && error !== null) {
        console.error("Unexpected error object:", JSON.stringify(error, null, 2));
      }
      return null;
    }
  };

  const getOrCreateEntity = async (entityName: string, ice: string, postal_code: string) => {
    console.log(`Attempting to get or create ${invoiceType === 'external' ? 'supplier' : 'customer'}: ${entityName}, ICE: ${ice}, Postal Code: ${postal_code}`);
    
    const finalEntityName = entityName || "Unrecognized";
    const finalIce = ice || "00000";

    let entity = findBestMatchingEntity(finalEntityName, finalIce);

    if (!entity) {
      console.log(`No matching ${invoiceType === 'external' ? 'supplier' : 'customer'} found, creating new one`);
      entity = await createNewEntity(finalEntityName, finalIce, postal_code);
    } else {
      console.log(`Matching ${invoiceType === 'external' ? 'supplier' : 'customer'} found:`, entity);
    }

    return entity;
  };

  const prepareInvoicePayload = async (invoiceData: any): Promise<TDataCreateExternalInvoice | TDataCreateInternalInvoice> => {
    console.log("Preparing invoice payload for data:", invoiceData);
    const dueDate = invoiceData.invoice_date
      ? new Date(new Date(invoiceData.invoice_date).setDate(new Date(invoiceData.invoice_date).getDate() + 60))
      : new Date();
  
    const entity = await getOrCreateEntity(
      invoiceData[invoiceType === 'external' ? 'supplier' : 'customer'] || "",
      invoiceData.ice || "",
      invoiceData.postal_code || ""
    );
  
    if (!entity) {
      const errorMessage = `Failed to get or create ${invoiceType === 'external' ? 'supplier' : 'customer'}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  
    const basePayload = {
      reference: invoiceData.invoice_number || "N/A",
      invoice_date: invoiceData.invoice_date || new Date().toISOString().split('T')[0],
      amount_ttc: invoiceData.total_amount_ttc || 0,
      amount_ht: invoiceData.total_amount_ht || 0,
      due_date: dueDate.toISOString().split('T')[0],
      vat: invoiceData.total_vat_amount || 0,
      currency_type: invoiceData.currency || "MAD",
      project_id: 1, // Default project ID
    };

    let payload: ExternalInvoiceCreate | InternalInvoiceCreate;

    if (invoiceType === 'external') {
      payload = {
        ...basePayload,
        supplier_id: entity.id
      } as ExternalInvoiceCreate;
    } else {
      payload = {
        ...basePayload,
        customer_id: entity.id
      } as InternalInvoiceCreate;
    }

    console.log("Prepared invoice payload:", payload);
    return { 
      requestBody: payload 
    } as typeof invoiceType extends 'external' ? TDataCreateExternalInvoice : TDataCreateInternalInvoice;
  };

  const invoiceMutation = useMutation<ExternalInvoicePublic | InternalInvoicePublic, ApiError, TDataCreateExternalInvoice | TDataCreateInternalInvoice>({
    mutationFn: (invoicePayload) => {
      console.log("Sending invoice creation request with payload:", invoicePayload);
      return invoiceType === 'external'
        ? ExternalInvoicesService.createExternalInvoice(invoicePayload as TDataCreateExternalInvoice)
        : InternalInvoicesService.createInternalInvoice(invoicePayload as TDataCreateInternalInvoice);
    },
    onSuccess: (data) => {
      console.log("Invoice created successfully:", data);
      toast({
        title: 'Invoice Added',
        description: `${invoiceType === 'external' ? 'External' : 'Internal'} Invoice ${currentIndexRef.current + 1} with ref: ${data.reference} was created successfully.`,
        status: 'success',
        variant: 'top-accent',
        duration: 3000,
        isClosable: true,
        position: 'bottom-right',
      });
      if (invoiceType === 'external' && 'id' in data) {
        handlePartsCreation(data.id);
      } else {
        moveToNextInvoice();
      }
    },
    onError: (error: ApiError) => {
      const errDetail = (error.body as any)?.detail;
      console.error(`Error creating invoice:`, error);
      console.error(`Error detail:`, errDetail);
      toast({
        title: 'Error',
        description: `${errDetail}`,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'bottom-right',
      });
      moveToNextInvoice();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [invoiceType === 'external' ? "externalinvoices" : "internalinvoices"] });
    },
  });

  const processNextInvoice = async () => {
    if (currentIndexRef.current < processedData.length) {
      const invoiceData: any = processedData[currentIndexRef.current]?.invoice_data;
      if (invoiceData) {
        try {
          console.log(`Processing invoice ${currentIndexRef.current + 1}`);
          const invoicePayload = await prepareInvoicePayload(invoiceData);
          console.log(`Sending invoice payload for invoice ${currentIndexRef.current + 1}:`, invoicePayload);
          invoiceMutation.mutate(invoicePayload);
        } catch (error) {
          console.error(`Error preparing invoice payload:`, error);
          if (error instanceof Error) {
            toast({
              title: "Error preparing invoice",
              description: error.message,
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          }
          moveToNextInvoice();
        }
      } else {
        console.log(`No invoice data for index ${currentIndexRef.current}, moving to next`);
        moveToNextInvoice();
      }
    } else {
      console.log("All invoices processed");
      setIsLoading(false);
      startAutoCloseTimer();
    }
  };

  const moveToNextInvoice = () => {
    currentIndexRef.current++;
    setCurrentInvoiceIndex(currentIndexRef.current);
    if (currentIndexRef.current < processedData.length) {
      console.log(`Moving to next invoice: ${currentIndexRef.current + 1}`);
      setTimeout(processNextInvoice, 1000); // Short delay before processing next invoice
    } else {
      console.log("All invoices processed, setting loading to false");
      setIsLoading(false);
      startAutoCloseTimer();
    }
  };

  const startAutoCloseTimer = () => {
    console.log("Starting auto-close timer");
    autoCloseTimeoutRef.current = setTimeout(() => {
      console.log("Auto-close timer expired, closing modal");
      handleClose();
    }, 3000); // Close after 3 seconds
  };

  const handlePartsCreation = async (invoiceId: number) => {
    const invoiceData: any = processedData[currentIndexRef.current]?.invoice_data;
    if (invoiceData && invoiceData.items && invoiceData.items.length > 0) {
      for (let i = 0; i < invoiceData.items.length; i++) {
        const partPayload: TDataCreatePart = {
          requestBody: preparePartPayload(invoiceData.items[i], invoiceId)
        };
        console.log(`Sending part payload for part ${i + 1} of invoice ${currentIndexRef.current + 1}:`, partPayload);
        await partMutation.mutateAsync(partPayload);
      }
    }
    moveToNextInvoice();
  };

  const preparePartPayload = (itemData: any, invoiceId: number) => {
    return {
      item_code: itemData.code || "N/A",
      description: itemData.description || "No description",
      quantity: itemData.quantity || 1,
      unit_price: itemData.unit_price || 0,
      external_invoice_id: invoiceId,
    };
  };

  const partMutation = useMutation({
    mutationFn: (partPayload: TDataCreatePart) => PartsService.createPart(partPayload),
    onSuccess: (_, variables) => {
      console.log(`Part ${variables.requestBody.item_code} created successfully`);
      toast({
        title: 'Part Added',
        description: `Part ${variables.requestBody.item_code} for invoice ${currentIndexRef.current + 1} created successfully.`,
        status: 'success',
        variant: 'left-accent',
        duration: 3000,
        isClosable: true,
        position: 'bottom-right',
      });
    },
    onError: (error: ApiError, variables) => {
      const errDetail = (error.body as any)?.detail;
      console.error(`Error creating part:`, error);
      console.error(`Error detail:`, errDetail);
      toast({
        title: 'Error',
        description: `Error creating part ${variables.requestBody.item_code} for invoice ${currentIndexRef.current + 1}: ${errDetail}`,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'bottom-right',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["parts"] });
    },
  });

 

  const handleClose = () => {
    console.log("Closing silent process");
    if (autoCloseTimeoutRef.current) {
      clearTimeout(autoCloseTimeoutRef.current);
    }
    currentIndexRef.current = 0;
    setCurrentInvoiceIndex(0);
    setProcessedData([]);
    setIsLoading(true);
    onClose();
  };

  useEffect(() => {
    if (isOpen && processedData.length > 0 && !isPending) {
      console.log("Starting silent process");
      setIsLoading(true);
      currentIndexRef.current = 0;
      setCurrentInvoiceIndex(0);
      processNextInvoice();
    }
    
    return () => {
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
      }
    };
  }, [isOpen, processedData, isPending]);

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      bottom="20px"
      left="50%"
      transform="translateX(-50%)"
      width="400px"
      height="60px"
      bg="rgba(171, 217, 212, 0.7)"
      boxShadow="lg"
      borderRadius="md"
      p={4}
      zIndex={9999}
    >
      <VStack spacing={2} align="stretch" height="100%">
        <Center flex={1}>
          {isLoading ? (
            <Progress size='xs' isIndeterminate width="100%" />
          ) : (
            <HStack>
              <CloseButton
                size="sm"
                position="absolute"
                top="2px"
                right="2px"
                onClick={handleClose}
              />
              <Text color="white" fontWeight="bold">
                Processing Finished
              </Text>
            </HStack>
          )}
        </Center>
      </VStack>
    </Box>
  );
};

export default SilentProcess;