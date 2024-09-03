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
  PaymentsfromcustomerService,
  type PaymentFromCustomerPublic,
  CustomersService,
  ProjectsService,
  InternalInvoicesService,
} from "../../client";
import ActionsMenu from "../../components/Common/ActionsMenu";
import Navbar from "../../components/Common/Navbar";
import { TriangleDownIcon, TriangleUpIcon, ArrowUpDownIcon } from '@chakra-ui/icons';

const LazyFilterDropdown = lazy(() => import("../../components/Common/FilterDropdown"));

export const Route = createFileRoute("/_layout/paymentsfromcustomers")({
  component: PaymentsFromCustomers,
});

type SortDirection = 'asc' | 'desc' | null;

interface PaymentsFromCustomersTableBodyProps {
  customerFilter: string;
  projectFilter: string;
  invoiceFilter: string;
  paymentStatusFilter: string;
  paymentModeFilter: string;
  amountSort: SortDirection;
  remainingSort: SortDirection;
  disbursementDateSort: SortDirection;
}

function PaymentsFromCustomersTableBody({
  customerFilter,
  projectFilter,
  invoiceFilter,
  paymentStatusFilter,
  paymentModeFilter,
  amountSort,
  remainingSort,
  disbursementDateSort,
}: PaymentsFromCustomersTableBodyProps) {
  const { data: paymentsFromCustomers } = useSuspenseQuery({
    queryKey: ["paymentfromcustomers"],
    queryFn: () => PaymentsfromcustomerService.readPaymentsFromCustomers(),
  });

  const { data: customers } = useSuspenseQuery({
    queryKey: ["customers"],
    queryFn: () => CustomersService.readCustomers(),
  });

  const { data: projects } = useSuspenseQuery({
    queryKey: ["projects"],
    queryFn: () => ProjectsService.readProjects(),
  });

  const { data: internalInvoices } = useSuspenseQuery({
    queryKey: ["internalinvoices"],
    queryFn: () => InternalInvoicesService.readInternalInvoices(),
  });

  const getCustomerName = (id: number) => customers.data.find((c: any) => c.id === id)?.name || "Unknown";
  const getProjectName = (id: number) => projects.data.find((p: any) => p.id === id)?.name || "Unknown";
  const getInternalInvoiceReference = (id: number) => internalInvoices.data.find((i: any) => i.id === id)?.reference || "Unknown";

  let filteredPayments = paymentsFromCustomers.data.filter((payment: any) => {
    const customerMatch = customerFilter ? getCustomerName(payment.customer_id) === customerFilter : true;
    const projectMatch = projectFilter ? getProjectName(payment.project_id) === projectFilter : true;
    const invoiceMatch = invoiceFilter ? getInternalInvoiceReference(payment.internal_invoice_id) === invoiceFilter : true;
    const paymentStatusMatch = paymentStatusFilter ? payment.payment_status === paymentStatusFilter : true;
    const paymentModeMatch = paymentModeFilter ? payment.payment_mode === paymentModeFilter : true;
    return customerMatch && projectMatch && invoiceMatch && paymentStatusMatch && paymentModeMatch;
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
      {filteredPayments.map((payment: PaymentFromCustomerPublic) => (
        <Tr key={payment.id}>
          <Td>{payment.payment_ref}</Td>
          <Td>{payment.payment_status}</Td>
          <Td>{payment.payment_mode}</Td>
          <Td>{payment.amount}</Td>
          <Td>{payment.remaining}</Td>
          <Td>{payment.disbursement_date}</Td>
          <Td>{payment.additional_fees}</Td>
          <Td>{getInternalInvoiceReference(payment.internal_invoice_id)}</Td>
          <Td>{getCustomerName(payment.customer_id)}</Td>
          <Td>{getProjectName(payment.project_id)}</Td>
          <Td>
            <ActionsMenu type={"PaymentFromCustomer"} value={payment} />
          </Td>
        </Tr>
      ))}
    </Tbody>
  );
}

interface PaymentsFromCustomersTableProps {
  customerFilter: string;
  projectFilter: string;
  invoiceFilter: string;
  paymentStatusFilter: string;
  paymentModeFilter: string;
  onCustomerFilterSelect: (option: string) => void;
  onProjectFilterSelect: (option: string) => void;
  onInvoiceFilterSelect: (option: string) => void;
  onPaymentStatusFilterSelect: (option: string) => void;
  onPaymentModeFilterSelect: (option: string) => void;
  amountSort: SortDirection;
  remainingSort: SortDirection;
  disbursementDateSort: SortDirection;
  onAmountSortToggle: () => void;
  onRemainingSortToggle: () => void;
  onDisbursementDateSortToggle: () => void;
}

function PaymentsFromCustomersTable({
  customerFilter,
  projectFilter,
  invoiceFilter,
  paymentStatusFilter,
  paymentModeFilter,
  onCustomerFilterSelect,
  onProjectFilterSelect,
  onInvoiceFilterSelect,
  onPaymentStatusFilterSelect,
  onPaymentModeFilterSelect,
  amountSort,
  remainingSort,
  disbursementDateSort,
  onAmountSortToggle,
  onRemainingSortToggle,
  onDisbursementDateSortToggle,
}: PaymentsFromCustomersTableProps) {
  const fetchCustomerOptions = async () => {
    const customers = await CustomersService.readCustomers();
    return customers.data.map((customer: any) => customer.name);
  };

  const fetchProjectOptions = async () => {
    const projects = await ProjectsService.readProjects();
    return projects.data.map((project: any) => project.name);
  };

  const fetchInvoiceOptions = async () => {
    const invoices = await InternalInvoicesService.readInternalInvoices();
    return invoices.data.map((invoice: any) => invoice.reference);
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
              Internal Invoice
              <Suspense fallback={<div>Loading...</div>}>
                <LazyFilterDropdown
                  fetchData={fetchInvoiceOptions}
                  selected={invoiceFilter}
                  onSelect={onInvoiceFilterSelect}
                />
              </Suspense>
            </Th>
            <Th>
              Customer
              <Suspense fallback={<div>Loading...</div>}>
                <LazyFilterDropdown
                  fetchData={fetchCustomerOptions}
                  selected={customerFilter}
                  onSelect={onCustomerFilterSelect}
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
            <PaymentsFromCustomersTableBody
              customerFilter={customerFilter}
              projectFilter={projectFilter}
              invoiceFilter={invoiceFilter}
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

function PaymentsFromCustomers() {
  const [customerFilter, setCustomerFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [invoiceFilter, setInvoiceFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [paymentModeFilter, setPaymentModeFilter] = useState("");
  const [amountSort, setAmountSort] = useState<SortDirection>(null);
  const [remainingSort, setRemainingSort] = useState<SortDirection>(null);
  const [disbursementDateSort, setDisbursementDateSort] = useState<SortDirection>(null);

  const handleCustomerFilterSelect = (option: string) => setCustomerFilter(option);
  const handleProjectFilterSelect = (option: string) => setProjectFilter(option);
  const handleInvoiceFilterSelect = (option: string) => setInvoiceFilter(option);
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
        <Heading size="lg" mr={20}>Payments From Customers Management</Heading>
        <Navbar type="PaymentFromCustomer" />
      </Flex>
      <PaymentsFromCustomersTable
        customerFilter={customerFilter}
        projectFilter={projectFilter}
        invoiceFilter={invoiceFilter}
        paymentStatusFilter={paymentStatusFilter}
        paymentModeFilter={paymentModeFilter}
        onCustomerFilterSelect={handleCustomerFilterSelect}
        onProjectFilterSelect={handleProjectFilterSelect}
        onInvoiceFilterSelect={handleInvoiceFilterSelect}
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

export default PaymentsFromCustomers;