import { Suspense, useState, lazy } from "react";
import {
  Container,
  Flex,
  Heading,
  Skeleton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  IconButton,
  Tooltip,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ErrorBoundary } from "react-error-boundary";
import {
  PaymentstosupplierService,
  ExternalInvoicesService,
  ProjectsService,
  SuppliersService,
  type PaymentToSupplierPublic,
} from "../../client";
import ActionsMenu from "../../components/Common/ActionsMenu";
import Navbar from "../../components/Common/Navbar";
import { TriangleDownIcon, TriangleUpIcon, ArrowUpDownIcon } from '@chakra-ui/icons';

const LazyFilterDropdown = lazy(() => import('../../components/Common/FilterDropdown'));

export const Route = createFileRoute("/_layout/paymentsToSuppliers")({
  component: PaymentsToSuppliers,
});

type SortDirection = 'asc' | 'desc' | null;

interface PaymentsToSuppliersTableBodyProps {
  supplierFilter: string;
  projectFilter: string;
  externalInvoiceFilter: string;
  paymentStatusFilter: string;
  paymentModeFilter: string;
  amountSort: SortDirection;
  remainingSort: SortDirection;
  disbursementDateSort: SortDirection;
}

function PaymentsToSuppliersTableBody({
  supplierFilter,
  projectFilter,
  externalInvoiceFilter,
  paymentStatusFilter,
  paymentModeFilter,
  amountSort,
  remainingSort,
  disbursementDateSort,
}: PaymentsToSuppliersTableBodyProps) {
  const { data: paymentsToSuppliers } = useSuspenseQuery({
    queryKey: ["paymenttosuppliers"],
    queryFn: () => PaymentstosupplierService.readPaymentsToSuppliers(),
  });

  const { data: externalInvoices } = useSuspenseQuery({
    queryKey: ["externalinvoices"],
    queryFn: () => ExternalInvoicesService.readExternalInvoices(),
  });

  const { data: suppliers } = useSuspenseQuery({
    queryKey: ["suppliers"],
    queryFn: () => SuppliersService.readSuppliers(),
  });

  const { data: projects } = useSuspenseQuery({
    queryKey: ["projects"],
    queryFn: () => ProjectsService.readProjects(),
  });

  const getExternalInvoiceRef = (id: number) => externalInvoices.data.find((e: any) => e.id === id)?.reference || "Unknown";
  const getSupplierName = (id: number) => suppliers.data.find((s: any) => s.id === id)?.name || "Unknown";
  const getProjectName = (id: number) => projects.data.find((p: any) => p.id === id)?.name || "Unknown";

  let filteredPayments = paymentsToSuppliers.data.filter((payment: PaymentToSupplierPublic) => {
    const supplierMatch = supplierFilter ? getSupplierName(payment.supplier_id) === supplierFilter : true;
    const projectMatch = projectFilter ? getProjectName(payment.project_id) === projectFilter : true;
    const externalInvoiceMatch = externalInvoiceFilter ? getExternalInvoiceRef(payment.external_invoice_id) === externalInvoiceFilter : true;
    const paymentStatusMatch = paymentStatusFilter ? payment.payment_status === paymentStatusFilter : true;
    const paymentModeMatch = paymentModeFilter ? payment.payment_mode === paymentModeFilter : true;
    return supplierMatch && projectMatch && externalInvoiceMatch && paymentStatusMatch && paymentModeMatch;
  });

  if (amountSort) {
    filteredPayments.sort((a, b) => {
      const amountA = a.amount ?? 0;
      const amountB = b.amount ?? 0;
      return amountSort === 'asc' ? amountA - amountB : amountB - amountA;
    });
  } else if (remainingSort) {
    filteredPayments.sort((a, b) => {
      const remainingA = a.remaining ?? 0;
      const remainingB = b.remaining ?? 0;
      return remainingSort === 'asc' ? remainingA - remainingB : remainingB - remainingA;
    });
  } else if (disbursementDateSort) {
    filteredPayments.sort((a, b) => {
      const dateA = new Date(a.disbursement_date || '').getTime();
      const dateB = new Date(b.disbursement_date || '').getTime();
      return disbursementDateSort === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }

  return (
    <Tbody>
      {filteredPayments.map((payment: PaymentToSupplierPublic) => (
        <Tr key={payment.id}>
          <Td>{payment.payment_ref}</Td>
          <Td>{payment.payment_status}</Td>
          <Td>{payment.payment_mode}</Td>
          <Td>{payment.amount}</Td>
          <Td>{payment.remaining}</Td>
          <Td>{payment.disbursement_date}</Td>
          <Td>{payment.additional_fees}</Td>
          <Td>{getExternalInvoiceRef(payment.external_invoice_id)}</Td>
          <Td>{getSupplierName(payment.supplier_id)}</Td>
          <Td>{getProjectName(payment.project_id)}</Td>
          <Td>
            <ActionsMenu type={"PaymentToSupplier"} value={payment} />
          </Td>
        </Tr>
      ))}
    </Tbody>
  );
}

interface PaymentsToSuppliersTableProps {
  supplierFilter: string;
  projectFilter: string;
  externalInvoiceFilter: string;
  paymentStatusFilter: string;
  paymentModeFilter: string;
  onSupplierFilterSelect: (option: string) => void;
  onProjectFilterSelect: (option: string) => void;
  onExternalInvoiceFilterSelect: (option: string) => void;
  onPaymentStatusFilterSelect: (option: string) => void;
  onPaymentModeFilterSelect: (option: string) => void;
  amountSort: SortDirection;
  remainingSort: SortDirection;
  disbursementDateSort: SortDirection;
  onAmountSortToggle: () => void;
  onRemainingSortToggle: () => void;
  onDisbursementDateSortToggle: () => void;
}

function PaymentsToSuppliersTable({
  supplierFilter,
  projectFilter,
  externalInvoiceFilter,
  paymentStatusFilter,
  paymentModeFilter,
  onSupplierFilterSelect,
  onProjectFilterSelect,
  onExternalInvoiceFilterSelect,
  onPaymentStatusFilterSelect,
  onPaymentModeFilterSelect,
  amountSort,
  remainingSort,
  disbursementDateSort,
  onAmountSortToggle,
  onRemainingSortToggle,
  onDisbursementDateSortToggle,
}: PaymentsToSuppliersTableProps) {
  const fetchSupplierOptions = async () => {
    const suppliers = await SuppliersService.readSuppliers();
    return suppliers.data.map((supplier: any) => supplier.name);
  };

  const fetchProjectOptions = async () => {
    const projects = await ProjectsService.readProjects();
    return projects.data.map((project: any) => project.name);
  };

  const fetchExternalInvoiceOptions = async () => {
    const externalInvoices = await ExternalInvoicesService.readExternalInvoices();
    return externalInvoices.data.map((invoice: any) => invoice.reference);
  };

  const fetchPaymentStatusOptions = async () => {
    return ["Paid", "Pending", "Partial", "Failed", "Missing"];
  };

  const fetchPaymentModeOptions = async () => {
    return ["Cash", "Bank Transfer", "Check", "Credit"];
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
            <Th>Payment Ref</Th>
            <Th>
              Payment Status
              <Suspense fallback={<div>Loading...</div>}>
                <LazyFilterDropdown
                  fetchData={fetchPaymentStatusOptions}
                  selected={paymentStatusFilter}
                  onSelect={onPaymentStatusFilterSelect}
                />
              </Suspense>
            </Th>
            <Th>
              Payment Mode
              <Suspense fallback={<div>Loading...</div>}>
                <LazyFilterDropdown
                  fetchData={fetchPaymentModeOptions}
                  selected={paymentModeFilter}
                  onSelect={onPaymentModeFilterSelect}
                />
              </Suspense>
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
              <HStack>
                <span>Remaining</span>
                <SortButton
                  sort={remainingSort}
                  onClick={onRemainingSortToggle}
                  label="remaining"
                />
              </HStack>
            </Th>
            <Th>
              <HStack>
                <span>Disbursement Date</span>
                <SortButton
                  sort={disbursementDateSort}
                  onClick={onDisbursementDateSortToggle}
                  label="disbursement date"
                />
              </HStack>
            </Th>
            <Th>Additional Fees</Th>
            <Th>
              External Invoice
              <Suspense fallback={<div>Loading...</div>}>
                <LazyFilterDropdown
                  fetchData={fetchExternalInvoiceOptions}
                  selected={externalInvoiceFilter}
                  onSelect={onExternalInvoiceFilterSelect}
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
              Project
              <Suspense fallback={<div>Loading...</div>}>
                <LazyFilterDropdown
                  fetchData={fetchProjectOptions}
                  selected={projectFilter}
                  onSelect={onProjectFilterSelect}
                />
              </Suspense>
            </Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <ErrorBoundary
          fallbackRender={({ error }) => (
            <Tbody>
              <Tr>
                <Td colSpan={12}>Something went wrong: {error.message}</Td>
              </Tr>
            </Tbody>
          )}
        >
          <Suspense
            fallback={
              <Tbody>
                {new Array(5).fill(null).map((_, index) => (
                  <Tr key={index}>
                    {new Array(12).fill(null).map((_, index) => (
                      <Td key={index}>
                        <Flex>
                          <Skeleton height="20px" width="20px" />
                        </Flex>
                      </Td>
                    ))}
                  </Tr>
                ))}
              </Tbody>
            }
          >
            <PaymentsToSuppliersTableBody
              supplierFilter={supplierFilter}
              projectFilter={projectFilter}
              externalInvoiceFilter={externalInvoiceFilter}
              paymentStatusFilter={paymentStatusFilter}
              paymentModeFilter={paymentModeFilter}
              amountSort={amountSort}
              remainingSort={remainingSort}
              disbursementDateSort={disbursementDateSort}
            />
          </Suspense>
        </ErrorBoundary>
      </Table>
    </TableContainer>
  );
}

function PaymentsToSuppliers() {
  const [supplierFilter, setSupplierFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [externalInvoiceFilter, setExternalInvoiceFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [paymentModeFilter, setPaymentModeFilter] = useState("");
  const [amountSort, setAmountSort] = useState<SortDirection>(null);
  const [remainingSort, setRemainingSort] = useState<SortDirection>(null);
  const [disbursementDateSort, setDisbursementDateSort] = useState<SortDirection>(null);

  const handleSupplierFilterSelect = (option: string) => setSupplierFilter(option);
  const handleProjectFilterSelect = (option: string) => setProjectFilter(option);
  const handleExternalInvoiceFilterSelect = (option: string) => setExternalInvoiceFilter(option);
  const handlePaymentStatusFilterSelect = (option: string) => setPaymentStatusFilter(option);
  const handlePaymentModeFilterSelect = (option: string) => setPaymentModeFilter(option);

  const toggleSort = (setter: React.Dispatch<React.SetStateAction<SortDirection>>) => {
    setter(current => {
      if (current === 'asc') return 'desc';
      if (current === 'desc') return null;
      return 'asc';
    });
  };

  const handleAmountSortToggle = () => {
    toggleSort(setAmountSort);
    setRemainingSort(null);
    setDisbursementDateSort(null);
  };

  const handleRemainingSortToggle = () => {
    toggleSort(setRemainingSort);
    setAmountSort(null);
    setDisbursementDateSort(null);
  };

  const handleDisbursementDateSortToggle = () => {
    toggleSort(setDisbursementDateSort);
    setAmountSort(null);
    setRemainingSort(null);
  };

  return (
    <Container maxW="full">
      <Flex justifyContent="space-between" alignItems="center" mb={4} mt={7}>
        <Heading size="lg" mr={20}>Payments To Suppliers Management</Heading>
        <Navbar type="PaymentToSupplier" />
      </Flex>
      <PaymentsToSuppliersTable
        supplierFilter={supplierFilter}
        projectFilter={projectFilter}
        externalInvoiceFilter={externalInvoiceFilter}
        paymentStatusFilter={paymentStatusFilter}
        paymentModeFilter={paymentModeFilter}
        onSupplierFilterSelect={handleSupplierFilterSelect}
        onProjectFilterSelect={handleProjectFilterSelect}
        onExternalInvoiceFilterSelect={handleExternalInvoiceFilterSelect}
        onPaymentStatusFilterSelect={handlePaymentStatusFilterSelect}
        onPaymentModeFilterSelect={handlePaymentModeFilterSelect}
        amountSort={amountSort}
        remainingSort={remainingSort}
        disbursementDateSort={disbursementDateSort}
        onAmountSortToggle={handleAmountSortToggle}
        onRemainingSortToggle={handleRemainingSortToggle}
        onDisbursementDateSortToggle={handleDisbursementDateSortToggle}
      />
    </Container>
  );
}

export default PaymentsToSuppliers;