import { useState, lazy, Suspense } from "react";
import {
  Container,
  Heading,
  Skeleton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Button,
  Flex,
  useToast,
  IconButton,
  Tooltip,
  HStack,
  useColorModeValue,
  Tag
} from "@chakra-ui/react";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ErrorBoundary } from "react-error-boundary";
import { PartsService, type PartPublic, type PartUpdate, type PartCreate, ProjectsService, ExternalInvoicesService, SuppliersService } from "../../client";
import ActionsMenu from "../../components/Common/ActionsMenu";
import Navbar from "../../components/Common/Navbar";
import { TriangleDownIcon, TriangleUpIcon, ArrowUpDownIcon } from '@chakra-ui/icons';

const LazyFilterDropdown = lazy(() => import("../../components/Common/FilterDropdown"));
const LazySplitModal = lazy(() => import("../../components/Parts/SplitModal"));

export const Route = createFileRoute("/_layout/parts")({
  component: Parts,
});

type SortDirection = 'asc' | 'desc' | null;

interface PartsTableBodyProps {
  projectFilter: string;
  invoiceFilter: string;
  supplierFilter: string;
  onSplitPart: (part: PartPublic, moving: boolean) => void;
  onDeletePart: (partId: number) => void;
  quantitySort: SortDirection;
  unitPriceSort: SortDirection;
  amountSort: SortDirection;
}

function PartsTableBody({
  projectFilter,
  invoiceFilter,
  supplierFilter,
  onSplitPart,
  onDeletePart,
  quantitySort,
  unitPriceSort,
  amountSort,
}: PartsTableBodyProps) {
  const [hoveredPart, setHoveredPart] = useState<number | null>(null);

  const { data: parts } = useSuspenseQuery({
    queryKey: ["parts"],
    queryFn: () => PartsService.readParts(),
  });

  const { data: projects } = useSuspenseQuery({
    queryKey: ["projects"],
    queryFn: () => ProjectsService.readProjects(),
  });

  const { data: externalInvoices } = useSuspenseQuery({
    queryKey: ["externalinvoices"],
    queryFn: () => ExternalInvoicesService.readExternalInvoices(),
  });

  const { data: suppliers } = useSuspenseQuery({
    queryKey: ["suppliers"],
    queryFn: () => SuppliersService.readSuppliers(),
  });

  const getProjectName = (projectId: number | null) => {
    if (projectId === null) return "Unknown";
    return projects.data.find((project: any) => project.id === projectId)?.name || "Unknown";
  };

  const getExternalInvoiceReference = (invoiceId: number | null) => {
    if (invoiceId === null) return "Unknown";
    return externalInvoices.data.find((invoice: any) => invoice.id === invoiceId)?.reference || "Unknown";
  };

  const getSupplierName = (supplierId: number | null) => {
    if (supplierId === null) return "Unknown";
    return suppliers.data.find((supplier: any) => supplier.id === supplierId)?.name || "Unknown";
  };

  let filteredParts = parts.data.filter((part: PartPublic) => {
    const projectMatch = projectFilter ? getProjectName(part.project_id) === projectFilter : true;
    const invoiceMatch = invoiceFilter ? getExternalInvoiceReference(part.external_invoice_id) === invoiceFilter : true;
    const supplierMatch = supplierFilter ? getSupplierName(part.supplier_id) === supplierFilter : true;
    return projectMatch && invoiceMatch && supplierMatch;
  });

  if (quantitySort) {
    filteredParts.sort((a, b) => {
      const quantityA = a.quantity ?? 0;
      const quantityB = b.quantity ?? 0;
      return quantitySort === 'asc' ? quantityA - quantityB : quantityB - quantityA;
    });
  } else if (unitPriceSort) {
    filteredParts.sort((a, b) => {
      const priceA = a.unit_price ?? 0;
      const priceB = b.unit_price ?? 0;
      return unitPriceSort === 'asc' ? priceA - priceB : priceB - priceA;
    });
  } else if (amountSort) {
    filteredParts.sort((a, b) => {
      const amountA = a.amount ?? 0;
      const amountB = b.amount ?? 0;
      return amountSort === 'asc' ? amountA - amountB : amountB - amountA;
    });
  }

  return (
    <>
      {filteredParts.map((part: PartPublic) => (
        <Tr key={part.id}>
          <Td>{part.item_code}</Td>
          <Td>{part.description}</Td>
          <Td 
            position="relative" 
            onMouseEnter={() => setHoveredPart(part.id)}
            onMouseLeave={() => setHoveredPart(null)}
          >
            {part.quantity !== null && part.quantity !== undefined ? part.quantity : "N/A"}
            {hoveredPart === part.id && (
              <>
                {part.quantity !== null && part.quantity !== undefined && part.quantity > 1 && (
                  <Button
                    size="xs"
                    position="absolute"
                    top="50%"
                    right="0"
                    transform="translateY(-50%)"
                    onClick={() => onSplitPart(part, false)}
                  >
                    Split
                  </Button>
                )}
                {part.quantity === 1 && (
                  <Button
                    size="xs"
                    position="absolute"
                    top="50%"
                    right="0"
                    transform="translateY(-50%)"
                    onClick={() => onSplitPart(part, true)}
                  >
                    Move
                  </Button>
                )}
                {part.quantity === 0 && (
                  <Button
                    size="xs"
                    position="absolute"
                    top="50%"
                    right="0"
                    transform="translateY(-50%)"
                    onClick={() => onDeletePart(part.id)}
                    colorScheme="red"
                  >
                    Delete
                  </Button>
                )}
              </>
            )}
          </Td>
          <Td>{part.unit_price}</Td>
          <Td>{part.amount}</Td>
          <Td>{getProjectName(part.project_id)}</Td>
          <Td>{getExternalInvoiceReference(part.external_invoice_id)}</Td>
          <Td>{getSupplierName(part.supplier_id)}</Td>
          <Td>
            <ActionsMenu type={"Part"} value={part} />
          </Td>
        </Tr>
      ))}
    </>
  );
}

interface PartsTableProps {
  projectFilter: string;
  invoiceFilter: string;
  supplierFilter: string;
  onProjectFilterSelect: (option: string) => void;
  onInvoiceFilterSelect: (option: string) => void;
  onSupplierFilterSelect: (option: string) => void;
  onSplitPart: (part: PartPublic, moving: boolean) => void;
  onDeletePart: (partId: number) => void;
  quantitySort: SortDirection;
  unitPriceSort: SortDirection;
  amountSort: SortDirection;
  onQuantitySortToggle: () => void;
  onUnitPriceSortToggle: () => void;
  onAmountSortToggle: () => void;
}

function PartsTable({
  projectFilter,
  invoiceFilter,
  supplierFilter,
  onProjectFilterSelect,
  onInvoiceFilterSelect,
  onSupplierFilterSelect,
  onSplitPart,
  onDeletePart,
  quantitySort,
  unitPriceSort,
  amountSort,
  onQuantitySortToggle,
  onUnitPriceSortToggle,
  onAmountSortToggle,
}: PartsTableProps) {
  const fetchProjectOptions = async () => {
    const projects = await ProjectsService.readProjects();
    return projects.data.map((project: any) => project.name);
  };

  const fetchInvoiceOptions = async () => {
    const invoices = await ExternalInvoicesService.readExternalInvoices();
    return invoices.data.map((invoice: any) => invoice.reference);
  };

  const fetchSupplierOptions = async () => {
    const suppliers = await SuppliersService.readSuppliers();
    return suppliers.data.map((supplier: any) => supplier.name);
  };

  const bgColor = useColorModeValue("gray.100", "gray.700");
  const hoverBgColor = useColorModeValue("gray.200", "gray.600");
  const activeBgColor = useColorModeValue("gray.300", "gray.500");

  const SortButton = ({ sort, onClick, label }: { sort: SortDirection; onClick: () => void; label: string }) => (
    <Tooltip label={`Sort by ${label}`}>
      <IconButton
        aria-label={`Sort by ${label}`}
        icon={sort === 'asc' ? <TriangleUpIcon /> : sort === 'desc' ? <TriangleDownIcon /> : <ArrowUpDownIcon />}
        size="xs"
        onClick={onClick}
        ml={2}
        bg={bgColor}
        _hover={{ bg: hoverBgColor }}
        _active={{ bg: activeBgColor }}
      />
    </Tooltip>
  );

  return (
    <TableContainer>
      <Table size={{ base: "sm", md: "md" }}>
        <Thead>
          <Tr>
            <Th>Item Code</Th>
            <Th>Description</Th>
            <Th>
              <HStack>
                <span>Quantity</span>
                <SortButton
                  sort={quantitySort}
                  onClick={onQuantitySortToggle}
                  label="quantity"
                />
              </HStack>
            </Th>
            <Th>
              <HStack>
                <span>Unit Price</span>
                <SortButton
                  sort={unitPriceSort}
                  onClick={onUnitPriceSortToggle}
                  label="unit price"
                />
              </HStack>
            </Th>
            <Th>
              <HStack>
                <span>Amount</span>
                <SortButton
                  sort={amountSort}
                  onClick={onAmountSortToggle}
                  label="amount"
                />
              </HStack>
            </Th>
            <Th>
              Project
              <Suspense fallback={<div>Loading...</div>}>
                <LazyFilterDropdown
                  fetchData={fetchProjectOptions}
                  selected={projectFilter}
                  onSelect={onProjectFilterSelect}
                />
              </Suspense>
            </Th>
            <Th>
              External Invoice
              <Suspense fallback={<div>Loading...</div>}>
                <LazyFilterDropdown
                  fetchData={fetchInvoiceOptions}
                  selected={invoiceFilter}
                  onSelect={onInvoiceFilterSelect}
                />
              </Suspense>
            </Th>
            <Th>
              Supplier
              <Suspense fallback={<div>Loading...</div>}>
                <LazyFilterDropdown
                  fetchData={fetchSupplierOptions}
                  selected={supplierFilter}
                  onSelect={onSupplierFilterSelect}
                />
              </Suspense>
            </Th>
            <Th>
              <Tag size={"md"} key={"md"} variant='outline' colorScheme='teal'>
              Actions
              </Tag>
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          <ErrorBoundary
            fallbackRender={({ error }) => (
              <Tr>
                <Td colSpan={10}>Something went wrong: {error.message}</Td>
              </Tr>
            )}
          >
            <Suspense
              fallback={
                <>
                  {new Array(4).fill(null).map((_, index) => (
                    <Tr key={index}>
                      {new Array(10).fill(null).map((_, index) => (
                        <Td key={index}>
                          <Skeleton height="20px" width="20px" />
                        </Td>
                      ))}
                    </Tr>
                  ))}
                </>
              }
            >
              <PartsTableBody
                projectFilter={projectFilter}
                invoiceFilter={invoiceFilter}
                supplierFilter={supplierFilter}
                onSplitPart={onSplitPart}
                onDeletePart={onDeletePart}
                quantitySort={quantitySort}
                unitPriceSort={unitPriceSort}
                amountSort={amountSort}
              />
            </Suspense>
          </ErrorBoundary>
        </Tbody>
      </Table>
    </TableContainer>
  );
}

function Parts() {
  const [projectFilter, setProjectFilter] = useState("");
  const [invoiceFilter, setInvoiceFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [splitModalOpen, setSplitModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<PartPublic | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [quantitySort, setQuantitySort] = useState<SortDirection>(null);
  const [unitPriceSort, setUnitPriceSort] = useState<SortDirection>(null);
  const [amountSort, setAmountSort] = useState<SortDirection>(null);
  const queryClient = useQueryClient();
  const toast = useToast();

  const handleProjectFilterSelect = (option: string) => setProjectFilter(option);
  const handleInvoiceFilterSelect = (option: string) => setInvoiceFilter(option);
  const handleSupplierFilterSelect = (option: string) => setSupplierFilter(option);

  const toggleSort = (setter: React.Dispatch<React.SetStateAction<SortDirection>>) => {
    setter(current => {
      if (current === 'asc') return 'desc';
      if (current === 'desc') return null;
      return 'asc';
    });
  };

  const handleQuantitySortToggle = () => {
    toggleSort(setQuantitySort);
    setUnitPriceSort(null);
    setAmountSort(null);
  };

  const handleUnitPriceSortToggle = () => {
    toggleSort(setUnitPriceSort);
    setQuantitySort(null);
    setAmountSort(null);
  };

  const handleAmountSortToggle = () => {
    toggleSort(setAmountSort);
    setQuantitySort(null);
    setUnitPriceSort(null);
  };

  const updatePartMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: PartUpdate }) => 
      PartsService.updatePart({ partId: id, requestBody: updates }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["parts"] });
    },
  });

  const createPartMutation = useMutation({
    mutationFn: (newPart: PartCreate) => PartsService.createPart({ requestBody: newPart }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["parts"] });
    },
  });

  const deletePartMutation = useMutation({
    mutationFn: (partId: number) => PartsService.deletePart({ partId }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["parts"] });
    },
  });

  const handleSplitPart = (part: PartPublic, moving: boolean) => {
    setSelectedPart(part);
    setIsMoving(moving);
    setSplitModalOpen(true);
  };

  const handleDeletePart = async (partId: number) => {
    try {
      await deletePartMutation.mutateAsync(partId);
      toast({
        title: "Part deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-right"
      });
    } catch (error) {
      toast({
        title: "Failed to delete part",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-right"
      });
    }
  };

  const handleSplitConfirm = async (splitQuantity: number, newProjectId: number) => {
    if (!selectedPart || selectedPart.quantity === undefined) return;
  
    try {
      const remainingQuantity = selectedPart.quantity - splitQuantity;
  
      // Fetch all parts
      const allParts = await PartsService.readParts();
  
      // Filter parts for the new project
      const projectParts = allParts.data.filter(part => part.project_id === newProjectId);
  
      // Check if a similar part already exists in the new project
      const existingPart = projectParts.find(part => 
        part.item_code === selectedPart.item_code &&
        part.description === selectedPart.description &&
        part.unit_price === selectedPart.unit_price &&
        part.external_invoice_id === selectedPart.external_invoice_id &&
        part.supplier_id === selectedPart.supplier_id
      );
  
      if (existingPart) {
        // Update the existing part in the new project
        await updatePartMutation.mutateAsync({
          id: existingPart.id,
          updates: { quantity: (existingPart.quantity || 0) + splitQuantity }
        });
      } else {
        // Create a new part in the new project
        const newPart: PartCreate = {
          item_code: selectedPart.item_code,
          description: selectedPart.description || "",
          quantity: splitQuantity,
          unit_price: selectedPart.unit_price || 0,
          external_invoice_id: selectedPart.external_invoice_id || 0,
          project_id: newProjectId,
          supplier_id: selectedPart.supplier_id || 0,
        };
        await createPartMutation.mutateAsync(newPart);
      }
  
      // Update the original part
      if (remainingQuantity > 0) {
        await updatePartMutation.mutateAsync({
          id: selectedPart.id,
          updates: { quantity: remainingQuantity }
        });
      } else {
        // If the entire quantity was moved, delete the original part
        await deletePartMutation.mutateAsync(selectedPart.id);
      }
  
      toast({
        title: isMoving ? "Part moved successfully" : "Part split successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-right"
      });
    } catch (error) {
      toast({
        title: isMoving ? "Failed to move part" : "Failed to split part",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-right"
      });
    }
  
    setSplitModalOpen(false);
  };

  return (
    <Container maxW="full">
      <Flex justifyContent="space-between" alignItems="center" mb={4} mt={7}>
        <Heading size="lg" mr={20}>Parts Management</Heading>
        <Navbar type="Part" />
      </Flex>

      <PartsTable
        projectFilter={projectFilter}
        invoiceFilter={invoiceFilter}
        supplierFilter={supplierFilter}
        onProjectFilterSelect={handleProjectFilterSelect}
        onInvoiceFilterSelect={handleInvoiceFilterSelect}
        onSupplierFilterSelect={handleSupplierFilterSelect}
        onSplitPart={handleSplitPart}
        onDeletePart={handleDeletePart}
        quantitySort={quantitySort}
        unitPriceSort={unitPriceSort}
        amountSort={amountSort}
        onQuantitySortToggle={handleQuantitySortToggle}
        onUnitPriceSortToggle={handleUnitPriceSortToggle}
        onAmountSortToggle={handleAmountSortToggle}
      />

      <Suspense fallback={<div>Loading...</div>}>
        {selectedPart && (
          <LazySplitModal
            isOpen={splitModalOpen}
            onClose={() => setSplitModalOpen(false)}
            part={selectedPart}
            onConfirm={handleSplitConfirm}
            isMoving={isMoving}
          />
        )}
      </Suspense>
    </Container>
  );
}

export default Parts;