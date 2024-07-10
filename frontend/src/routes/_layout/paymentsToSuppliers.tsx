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

const LazyFilterDropdown = lazy(() => import('../../components/Common/FilterDropdown'));

export const Route = createFileRoute("/_layout/paymentsToSuppliers")({
  component: PaymentsToSuppliers,
});

interface PaymentsToSuppliersTableBodyProps {
  supplierFilter: string;
  projectFilter: string;
  externalInvoiceFilter: string;
  paymentStatusFilter: string;
  paymentModeFilter: string;
}

function PaymentsToSuppliersTableBody({
  supplierFilter,
  projectFilter,
  externalInvoiceFilter,
  paymentStatusFilter,
  paymentModeFilter,
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

  const filteredPayments = paymentsToSuppliers.data.filter((payment: PaymentToSupplierPublic) => {
    const supplierMatch = supplierFilter ? getSupplierName(payment.supplier_id) === supplierFilter : true;
    const projectMatch = projectFilter ? getProjectName(payment.project_id) === projectFilter : true;
    const externalInvoiceMatch = externalInvoiceFilter ? getExternalInvoiceRef(payment.external_invoice_id) === externalInvoiceFilter : true;
    const paymentStatusMatch = paymentStatusFilter ? payment.payment_status === paymentStatusFilter : true;
    const paymentModeMatch = paymentModeFilter ? payment.payment_mode === paymentModeFilter : true;
    return supplierMatch && projectMatch && externalInvoiceMatch && paymentStatusMatch && paymentModeMatch;
  });

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
            <Th>Amount</Th>
            <Th>Remaining</Th>
            <Th>Disbursement Date</Th>
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

  const handleSupplierFilterSelect = (option: string) => setSupplierFilter(option);
  const handleProjectFilterSelect = (option: string) => setProjectFilter(option);
  const handleExternalInvoiceFilterSelect = (option: string) => setExternalInvoiceFilter(option);
  const handlePaymentStatusFilterSelect = (option: string) => setPaymentStatusFilter(option);
  const handlePaymentModeFilterSelect = (option: string) => setPaymentModeFilter(option);

  return (
    <Container maxW="full">
      <Flex  alignItems="center" mb={4} mt={7}>
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
      />
    </Container>
  );
}

export default PaymentsToSuppliers;
