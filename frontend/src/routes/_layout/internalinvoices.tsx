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
import { InternalInvoicesService, CustomersService, ProjectsService } from "../../client";
import ActionsMenu from "../../components/Common/ActionsMenu";
import Navbar from "../../components/Common/Navbar";

const LazyFilterDropdown = lazy(() => import('../../components/Common/FilterDropdown'));

export const Route = createFileRoute("/_layout/internalinvoices")({
  component: InternalInvoices,
});

interface InternalInvoicesTableBodyProps {
  customerFilter: string;
  projectFilter: string;
}

function InternalInvoicesTableBody({ customerFilter, projectFilter }: InternalInvoicesTableBodyProps) {
  const { data: internalInvoices } = useSuspenseQuery({
    queryKey: ["internalinvoices"],
    queryFn: () => InternalInvoicesService.readInternalInvoices(),
  });

  const { data: customers } = useSuspenseQuery({
    queryKey: ["customers"],
    queryFn: () => CustomersService.readCustomers(),
  });

  const { data: projects } = useSuspenseQuery({
    queryKey: ["projects"],
    queryFn: () => ProjectsService.readProjects(),
  });

  const getCustomerName = (id: number) => customers.data.find((c: any) => c.id === id)?.name || "Unknown";
  const getProjectName = (id: number) => projects.data.find((p: any) => p.id === id)?.name || "Unknown";

  const filteredInvoices = internalInvoices.data.filter((invoice: any) => {
    const customerMatch = customerFilter ? getCustomerName(invoice.customer_id) === customerFilter : true;
    const projectMatch = projectFilter ? getProjectName(invoice.project_id) === projectFilter : true;
    return customerMatch && projectMatch;
  });

  return (
    <Tbody>
      {filteredInvoices.map((invoice: any) => (
        <Tr key={invoice.id}>
          <Td>{invoice.reference}</Td>
          <Td>{invoice.invoice_date}</Td>
          <Td>{invoice.due_date}</Td>
          <Td>{invoice.amount_ttc}</Td>
          <Td>{invoice.amount_ht}</Td>
          <Td>{invoice.vat}</Td>
          <Td>{invoice.currency_type}</Td>
          <Td>{getCustomerName(invoice.customer_id)}</Td>
          <Td>{getProjectName(invoice.project_id)}</Td>
          <Td>
            <ActionsMenu type={"InternalInvoice"} value={invoice} />
          </Td>
        </Tr>
      ))}
    </Tbody>
  );
}

interface InternalInvoicesTableProps {
  customerFilter: string;
  projectFilter: string;
  onCustomerFilterSelect: (option: string) => void;
  onProjectFilterSelect: (option: string) => void;
}

function InternalInvoicesTable({
  customerFilter,
  projectFilter,
  onCustomerFilterSelect,
  onProjectFilterSelect,
}: InternalInvoicesTableProps) {
  const fetchCustomerOptions = async () => {
    const customers = await CustomersService.readCustomers();
    return customers.data.map((customer: any) => customer.name);
  };

  const fetchProjectOptions = async () => {
    const projects = await ProjectsService.readProjects();
    return projects.data.map((project: any) => project.name);
  };

  return (
    <TableContainer>
      <Table size={{ base: "sm", md: "md" }}>
        <Thead>
          <Tr>
            <Th>Reference</Th>
            <Th>Invoice Date</Th>
            <Th>Due Date</Th>
            <Th>Amount TTC</Th>
            <Th>Amount HT</Th>
            <Th>VAT</Th>
            <Th>Currency Type</Th>
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
                <Td colSpan={11}>Something went wrong: {error.message}</Td>
              </Tr>
            </Tbody>
          )}
        >
          <Suspense
            fallback={
              <Tbody>
                {new Array(5).fill(null).map((_, index) => (
                  <Tr key={index}>
                    {new Array(11).fill(null).map((_, index) => (
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
            <InternalInvoicesTableBody customerFilter={customerFilter} projectFilter={projectFilter} />
          </Suspense>
        </ErrorBoundary>
      </Table>
    </TableContainer>
  );
}

function InternalInvoices() {
  const [customerFilter, setCustomerFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");

  const handleCustomerFilterSelect = (option: string) => setCustomerFilter(option);
  const handleProjectFilterSelect = (option: string) => setProjectFilter(option);

  return (
    <Container maxW="full">
      <Flex  alignItems="center" mb={4} mt={7}>
        <Heading size="lg" mr={20}>Internal Invoices Management</Heading>
        <Navbar type="InternalInvoice" />
      </Flex>
      <InternalInvoicesTable
        customerFilter={customerFilter}
        projectFilter={projectFilter}
        onCustomerFilterSelect={handleCustomerFilterSelect}
        onProjectFilterSelect={handleProjectFilterSelect}
      />
    </Container>
  );
}

export default InternalInvoices;