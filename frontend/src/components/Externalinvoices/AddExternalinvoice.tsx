import { useEffect, useMemo, useState } from "react";
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Flex,
} from "@chakra-ui/react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { type SubmitHandler, useForm } from "react-hook-form";
import {
  type ApiError,
  type ExternalInvoiceCreate,
  ExternalInvoicesService,
  SuppliersService,
  ProjectsService,
  type SupplierPublic,
} from "../../client";
import useCustomToast from "../../hooks/useCustomToast";
import fuzzysort from 'fuzzysort';
import AddProject from '../Projects/AddProject';
import AddSupplier from "../Suppliers/AddSupplier";

interface AddExternalInvoiceProps {
  isOpen: boolean;
  onClose: (id?: number, matchedSupplier?: SupplierPublic) => void;
  onCancel: () => void;
  prefillData?: Partial<ExternalInvoiceCreate> & { 
    supplier?: string; 
    ice?: string;
    matchedSupplier?: SupplierPublic;
  };
  invoiceProcess?: boolean;
}

const AddExternalInvoice = ({ isOpen, onClose, onCancel, prefillData, invoiceProcess }: AddExternalInvoiceProps) => {
  const queryClient = useQueryClient();
  const showToast = useCustomToast();
  const [isSupplierPrefilled, setIsSupplierPrefilled] = useState(false);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const { data: suppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => SuppliersService.readSuppliers(),
  });
  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => ProjectsService.readProjects(),
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ExternalInvoiceCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      reference: "",
      invoice_date: "",
      due_date: "",
      amount_ttc: 0,
      amount_ht: 0,
      currency_type: "MAD",
      supplier_id: suppliers?.data[0]?.id || 0,
      project_id: 0,
      ...prefillData,
    },
  });

  const findBestMatchingSupplier = useMemo(() => {
    return (supplierName: string, ice: string) => {
      if (!suppliers) return null;
      
      console.log(`Searching for supplier: ${supplierName}, ICE: ${ice}`);
      
      if (ice === "00000") {
        console.log("ICE is 00000, matching only by name");
        const results = fuzzysort.go(supplierName, suppliers.data, {
          key: 'name',
          threshold: -10000,
        });
  
        if (results.length > 0 && results[0].score > -10000) {
          console.log("Best fuzzy match found:", results[0].obj);
          return results[0].obj;
        }
      } else {
        const exactMatch = suppliers.data.find(s => s.ice === ice);
        if (exactMatch) {
          console.log("Exact match found by ICE:", exactMatch);
          return exactMatch;
        }
  
        const results = fuzzysort.go(supplierName, suppliers.data, {
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
  
      console.log("No matching supplier found");
      return null;
    };
  }, [suppliers]);

  useEffect(() => {
    if (prefillData) {
      Object.entries(prefillData).forEach(([key, value]) => {
        if (value !== undefined && key !== 'matchedSupplier') {
          setValue(key as keyof ExternalInvoiceCreate, value as any);
        }
      });
  
      if (prefillData.supplier && prefillData.ice && suppliers) {
        const matchedSupplier = findBestMatchingSupplier(prefillData.supplier, prefillData.ice);
        if (matchedSupplier) {
          setValue('supplier_id', matchedSupplier.id);
          setIsSupplierPrefilled(true);
          prefillData.matchedSupplier = matchedSupplier;
        } else {
          setIsSupplierPrefilled(false);
        }
      }
    }
  }, [prefillData, setValue, suppliers, findBestMatchingSupplier]);

  const mutation = useMutation({
    mutationFn: (data: ExternalInvoiceCreate) =>
      ExternalInvoicesService.createExternalInvoice({ requestBody: data }),
    onSuccess: (data) => {
      const invoiceId = data.id;
      showToast("Success!", "External Invoice created successfully.", "success");
      reset();
      onClose(invoiceId, prefillData?.matchedSupplier);
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail;
      showToast("Something went wrong.", `${errDetail}`, "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["externalinvoices"] });
    },
  });

  const onSubmit: SubmitHandler<ExternalInvoiceCreate> = (data) => {
    if (data.amount_ttc < data.amount_ht) {
      setError("amount_ttc", {
        type: "manual",
        message: "Amount TTC should be greater than or equal to Amount HT.",
      });
      return;
    }
    if (new Date(data.invoice_date) > new Date(data.due_date)) {
      setError("invoice_date", {
        type: "manual",
        message: "Invoice Date should be the same as or before Due Date.",
      });
      return;
    }

    clearErrors(); 
    const transformedData = {
      ...data,
    };
    mutation.mutate(transformedData);
  };

  const isPrefilled = (fieldName: keyof ExternalInvoiceCreate) => {
    const value = prefillData && prefillData[fieldName];
    return value !== undefined && value !== null && value !== "";
  };

  const handleProjectCreated = (newProject: any) => {
    queryClient.setQueryData(["projects"], (old: any) => {
      const updatedData = [...(old?.data || []), newProject];
      return { ...old, data: updatedData };
    });
    setValue("project_id", newProject.id);
    setIsAddProjectModalOpen(false);
  };

  const handleSupplierCreated = (newSupplier: any) => {
    queryClient.setQueryData(["suppliers"], (old: any) => {
      const updatedData = [...(old?.data || []), newSupplier];
      return { ...old, data: updatedData };
    });
    setValue("supplier_id", newSupplier.id);
    setIsAddSupplierModalOpen(false);
  };

  const form = (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormControl isRequired>
        <FormLabel htmlFor="reference">Reference</FormLabel>
        <Input
          id="reference"
          {...register("reference", {
            required: "Reference is required.",
          })}
          placeholder="Reference"
          type="text"
          bg={isPrefilled("reference") ? "yellow.500" : "transparent"}
        />
        {errors.reference && (
          <FormErrorMessage>{errors.reference.message}</FormErrorMessage>
        )}
      </FormControl>
      <FormControl mt={4} isRequired isInvalid={!!errors.invoice_date}>
        <FormLabel htmlFor="invoice_date">Invoice Date</FormLabel>
        <Input
          id="invoice_date"
          {...register("invoice_date", {
            required: "Invoice Date is required.",
          })}
          placeholder="YYYY-MM-DD"
          type="date"
          bg={isPrefilled("invoice_date") ? "yellow.500" : "transparent"}
        />
        {errors.invoice_date && (
          <FormErrorMessage>{errors.invoice_date.message}</FormErrorMessage>
        )}
      </FormControl>
      <FormControl mt={4} isRequired isInvalid={!!errors.due_date}>
        <FormLabel htmlFor="due_date">Due Date</FormLabel>
        <Input
          id="due_date"
          {...register("due_date", {
            required: "Due Date is required.",
          })}
          placeholder="YYYY-MM-DD"
          type="date"
          bg={isPrefilled("due_date") ? "yellow.500" : "transparent"}
        />
        {errors.due_date && (
          <FormErrorMessage>{errors.due_date.message}</FormErrorMessage>
        )}
      </FormControl>
      <FormControl mt={4} isRequired isInvalid={!!errors.amount_ttc}>
        <FormLabel htmlFor="amount_ttc">Amount TTC</FormLabel>
        <Input
          id="amount_ttc"
          {...register("amount_ttc", {
            required: "Amount TTC is required.",
          })}
          placeholder="Amount TTC"
          type="number"
          step="0.01"
          bg={isPrefilled("amount_ttc") ? "yellow.500" : "transparent"}
        />
        {errors.amount_ttc && (
          <FormErrorMessage>{errors.amount_ttc.message}</FormErrorMessage>
        )}
      </FormControl>
      <FormControl mt={4} isRequired isInvalid={!!errors.amount_ht}>
        <FormLabel htmlFor="amount_ht">Amount HT</FormLabel>
        <Input
          id="amount_ht"
          {...register("amount_ht", {
            required: "Amount HT is required.",
          })}
          placeholder="Amount HT"
          type="number"
          step="0.01"
          bg={isPrefilled("amount_ht") ? "yellow.500" : "transparent"}
        />
        {errors.amount_ht && (
          <FormErrorMessage>{errors.amount_ht.message}</FormErrorMessage>
        )}
      </FormControl>
      
      <FormControl mt={4} isRequired isInvalid={!!errors.currency_type}>
        <FormLabel htmlFor="currency_type">Currency Type</FormLabel>
        <Select
          id="currency_type"
          {...register("currency_type", {
            required: "Currency Type is required.",
          })}
          placeholder="Select Currency Type"
          bg={isPrefilled("currency_type") ? "yellow.500" : "transparent"}
        >
          <option value="MAD">MAD</option>
          <option value="EUR">EUR</option>
        </Select>
        {errors.currency_type && (
          <FormErrorMessage>{errors.currency_type.message}</FormErrorMessage>
        )}
      </FormControl>

      <FormControl mt={4} isRequired isInvalid={!!errors.supplier_id}>
        <FormLabel htmlFor="supplier_id">Supplier</FormLabel>
        <Flex>
          <Select
            id="supplier_id"
            {...register("supplier_id", {
              required: "Supplier is required.",
            })}
            bg={isSupplierPrefilled ? "yellow.500" : "transparent"}
            flex="1"
            mr={2}
            value={watch("supplier_id")}  // Add this line
          >
            {suppliers?.data.map((supplier: SupplierPublic) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </Select>
          <Button onClick={() => setIsAddSupplierModalOpen(true)} variant='outline'>
            Add New
          </Button>
        </Flex>
        {errors.supplier_id && (
          <FormErrorMessage>{errors.supplier_id.message}</FormErrorMessage>
        )}
      </FormControl>
      
      <FormControl mt={4} isRequired isInvalid={!!errors.project_id}>
        <FormLabel htmlFor="project_id">Project</FormLabel>
        <Flex>
          <Select
            id="project_id"
            {...register("project_id", {
              required: "Project is required.",
            })}
            bg={isPrefilled("project_id") ? "yellow.500" : "transparent"}
            flex="1"
            mr={2}
            value={watch("project_id")}  // Add this line
          >
            {projects?.data.map((project: any) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
          <Button onClick={() => setIsAddProjectModalOpen(true)} variant='outline'>
            Add New
          </Button>
        </Flex>
        {errors.project_id && (
          <FormErrorMessage>{errors.project_id.message}</FormErrorMessage>
        )}
      </FormControl>
      <ModalFooter gap={3} justifyContent="center">
        <Button mt={4} variant="primary" type="submit" isLoading={isSubmitting}>
          Save
        </Button>
        <Button mt={4} onClick={onCancel} _hover={{ bg: 'whiteAlpha.400', color: "red.300" }}>Cancel</Button>
      </ModalFooter>
    </form>
  );

  if (invoiceProcess && prefillData) {
    return (
      <>
        {form}
        {isAddProjectModalOpen && (
          <AddProject
            isOpen={isAddProjectModalOpen}
            onClose={() => setIsAddProjectModalOpen(false)}
            onProjectCreated={handleProjectCreated}
          />
        )}
        {isAddSupplierModalOpen && (
            <AddSupplier
              isOpen={isAddSupplierModalOpen}
              onClose={() => setIsAddSupplierModalOpen(false)}
              onSupplierCreated={handleSupplierCreated}
            />
          )}
      </>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onCancel} size={{ base: "sm", md: "md" }} isCentered >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add External Invoice</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {form}
          {isAddProjectModalOpen && (
            <AddProject
              isOpen={isAddProjectModalOpen}
              onClose={() => setIsAddProjectModalOpen(false)}
              onProjectCreated={handleProjectCreated}
            />
          )}
          {isAddSupplierModalOpen && (
            <AddSupplier
              isOpen={isAddSupplierModalOpen}
              onClose={() => setIsAddSupplierModalOpen(false)}
              onSupplierCreated={handleSupplierCreated}
            />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};


export default AddExternalInvoice;