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
import { ExternalInvoicesService, SuppliersService, ProjectsService } from "../../client";
import ActionsMenu from "../../components/Common/ActionsMenu";
import Navbar from "../../components/Common/Navbar";

const LazyFilterDropdown = lazy(() => import('../../components/Common/FilterDropdown'));

export const Route = createFileRoute("/_layout/externalinvoices")({
  component: ExternalInvoices,
});

interface ExternalInvoicesTableBodyProps {
  supplierFilter: string;
  projectFilter: string;
}

function ExternalInvoicesTableBody({ supplierFilter, projectFilter }: ExternalInvoicesTableBodyProps) {
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

  const getSupplierName = (id: number) => suppliers.data.find((s: any) => s.id === id)?.name || "Unknown";
  const getProjectName = (id: number) => projects.data.find((p: any) => p.id === id)?.name || "Unknown";

  const filteredInvoices = externalInvoices.data.filter((invoice: any) => {
    const supplierMatch = supplierFilter ? getSupplierName(invoice.supplier_id) === supplierFilter : true;
    const projectMatch = projectFilter ? getProjectName(invoice.project_id) === projectFilter : true;
    return supplierMatch && projectMatch;
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
          <Td>{getSupplierName(invoice.supplier_id)}</Td>
          <Td>{getProjectName(invoice.project_id)}</Td>
          <Td>
            <ActionsMenu type={"ExternalInvoice"} value={invoice} />
          </Td>
        </Tr>
      ))}
    </Tbody>
  );
}

interface ExternalInvoicesTableProps {
  supplierFilter: string;
  projectFilter: string;
  onSupplierFilterSelect: (option: string) => void;
  onProjectFilterSelect: (option: string) => void;
}

function ExternalInvoicesTable({
  supplierFilter,
  projectFilter,
  onSupplierFilterSelect,
  onProjectFilterSelect,
}: ExternalInvoicesTableProps) {
  const fetchSupplierOptions = async () => {
    const suppliers = await SuppliersService.readSuppliers();
    return suppliers.data.map((supplier: any) => supplier.name);
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
            <ExternalInvoicesTableBody supplierFilter={supplierFilter} projectFilter={projectFilter} />
          </Suspense>
        </ErrorBoundary>
      </Table>
    </TableContainer>
  );
}

function ExternalInvoices() {
  const [supplierFilter, setSupplierFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");

  const handleSupplierFilterSelect = (option: string) => setSupplierFilter(option);
  const handleProjectFilterSelect = (option: string) => setProjectFilter(option);

  return (
    <Container maxW="full">
      <Flex  alignItems="center" mb={4} mt={7}>
        <Heading size="lg" mr={20}>External Invoices Management</Heading>
        <Navbar type="ExternalInvoice" />
      </Flex>
      <ExternalInvoicesTable
        supplierFilter={supplierFilter}
        projectFilter={projectFilter}
        onSupplierFilterSelect={handleSupplierFilterSelect}
        onProjectFilterSelect={handleProjectFilterSelect}
      />
    </Container>
  );
}

export default ExternalInvoices;
