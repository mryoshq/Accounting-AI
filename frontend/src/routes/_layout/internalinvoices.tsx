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
  Tag,
  IconButton,
  Tooltip,
  HStack,
  Box,
  useColorModeValue,
} from "@chakra-ui/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ErrorBoundary } from "react-error-boundary";
import { InternalInvoicesService, CustomersService, ProjectsService } from "../../client";
import ActionsMenu from "../../components/Common/ActionsMenu";
import Navbar from "../../components/Common/Navbar";
import { TriangleDownIcon, TriangleUpIcon, ArrowUpDownIcon } from '@chakra-ui/icons';

const LazyFilterDropdown = lazy(() => import('../../components/Common/FilterDropdown'));

export const Route = createFileRoute("/_layout/internalinvoices")({
  component: InternalInvoices,
});

type SortDirection = 'asc' | 'desc' | null;

interface InternalInvoicesTableBodyProps {
  customerFilter: string;
  projectFilter: string;
  currencyFilter: string;
  invoiceDateSort: SortDirection;
  dueDateSort: SortDirection;
  amountTtcSort: SortDirection;
}

function InternalInvoicesTableBody({ 
  customerFilter, 
  projectFilter, 
  currencyFilter, 
  invoiceDateSort,
  dueDateSort,
  amountTtcSort 
}: InternalInvoicesTableBodyProps) {
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
    const currencyMatch = currencyFilter ? invoice.currency_type === currencyFilter : true; 
    return customerMatch && projectMatch && currencyMatch;
  });

  let sortedInvoices = [...filteredInvoices];
  if (invoiceDateSort) {
    sortedInvoices.sort((a, b) => {
      const comparison = new Date(a.invoice_date).getTime() - new Date(b.invoice_date).getTime();
      return invoiceDateSort === 'asc' ? comparison : -comparison;
    });
  } else if (dueDateSort) {
    sortedInvoices.sort((a, b) => {
      const comparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      return dueDateSort === 'asc' ? comparison : -comparison;
    });
  } else if (amountTtcSort) {
    sortedInvoices.sort((a, b) => {
      const comparison = a.amount_ttc - b.amount_ttc;
      return amountTtcSort === 'asc' ? comparison : -comparison;
    });
  }

  return (
    <Tbody>
      {sortedInvoices.map((invoice: any) => (
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
  currencyFilter: string;
  onCustomerFilterSelect: (option: string) => void;
  onProjectFilterSelect: (option: string) => void;
  onCurrencyFilterSelect: (option: string) => void;
  invoiceDateSort: SortDirection;
  dueDateSort: SortDirection;
  amountTtcSort: SortDirection;
  onInvoiceDateSortToggle: () => void;
  onDueDateSortToggle: () => void;
  onAmountTtcSortToggle: () => void;
}

function InternalInvoicesTable({
  customerFilter,
  projectFilter,
  currencyFilter,
  onCustomerFilterSelect,
  onProjectFilterSelect,
  onCurrencyFilterSelect,
  invoiceDateSort,
  dueDateSort,
  amountTtcSort,
  onInvoiceDateSortToggle,
  onDueDateSortToggle,
  onAmountTtcSortToggle,
}: InternalInvoicesTableProps) {
  const fetchCustomerOptions = async () => {
    const customers = await CustomersService.readCustomers();
    return customers.data.map((customer: any) => customer.name);
  };

  const fetchProjectOptions = async () => {
    const projects = await ProjectsService.readProjects();
    return projects.data.map((project: any) => project.name);
  };

  const fetchCurrencyOptions = async () => {
    const invoices = await InternalInvoicesService.readInternalInvoices();
    const uniqueCurrencies = [...new Set(invoices.data.map((invoice: any) => invoice.currency_type))];
    return uniqueCurrencies;
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

  const FilterDropdown = ({ label, fetchData, selected, onSelect }: { label: string; fetchData: () => Promise<string[]>; selected: string; onSelect: (option: string) => void }) => (
    <Tooltip label={`Filter by ${label}`}>
      <Box>
        <Suspense fallback={<div>Loading...</div>}>
          <LazyFilterDropdown
            fetchData={fetchData}
            selected={selected}
            onSelect={onSelect}
          />
        </Suspense>
      </Box>
    </Tooltip>
  );

  return (
    <TableContainer>
      <Table size={{ base: "sm", md: "md" }}>
        <Thead>
          <Tr>
            <Th>Reference</Th>
            <Th>
              <HStack>
                <span>Invoice Date</span>
                <SortButton 
                  sort={invoiceDateSort} 
                  onClick={onInvoiceDateSortToggle}
                  label="date"
                />
              </HStack>
            </Th>
            <Th>
              <HStack>
                <span>Due Date</span>
                <SortButton 
                  sort={dueDateSort} 
                  onClick={onDueDateSortToggle}
                  label="due date"
                />
              </HStack>
            </Th>
            <Th>
              <HStack>
                <span>Amount TTC</span>
                <SortButton 
                  sort={amountTtcSort} 
                  onClick={onAmountTtcSortToggle}
                  label="amount"
                />
              </HStack>
            </Th>
            <Th>Amount HT</Th>
            <Th>VAT</Th>
            <Th>
              <HStack>
                <span>Currency</span>
                <FilterDropdown
                  label="Currency"
                  fetchData={fetchCurrencyOptions}
                  selected={currencyFilter}
                  onSelect={onCurrencyFilterSelect}
                />
              </HStack>
            </Th>
            <Th>
              <HStack>
                <span>Customer</span>
                <FilterDropdown
                  label="Customer"
                  fetchData={fetchCustomerOptions}
                  selected={customerFilter}
                  onSelect={onCustomerFilterSelect}
                />
              </HStack>
            </Th>
            <Th>
              <HStack>
                <span>Project</span>
                <FilterDropdown
                  label="Project"
                  fetchData={fetchProjectOptions}
                  selected={projectFilter}
                  onSelect={onProjectFilterSelect}
                />
              </HStack>
            </Th>
            <Th>
              <Tag size={"md"} key={"md"} variant='outline' colorScheme='teal'>
              Actions
              </Tag>
            </Th>
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
            <InternalInvoicesTableBody 
              customerFilter={customerFilter} 
              projectFilter={projectFilter}
              currencyFilter={currencyFilter} // Add this line
              invoiceDateSort={invoiceDateSort}
              dueDateSort={dueDateSort}
              amountTtcSort={amountTtcSort}
            />
          </Suspense>
        </ErrorBoundary>
      </Table>
    </TableContainer>
  );
}

function InternalInvoices() {
  const [customerFilter, setCustomerFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [currencyFilter, setCurrencyFilter] = useState("");
  const [invoiceDateSort, setInvoiceDateSort] = useState<SortDirection>(null);
  const [dueDateSort, setDueDateSort] = useState<SortDirection>(null);
  const [amountTtcSort, setAmountTtcSort] = useState<SortDirection>(null);

  const handleCustomerFilterSelect = (option: string) => setCustomerFilter(option);
  const handleProjectFilterSelect = (option: string) => setProjectFilter(option);
  const handleCurrencyFilterSelect = (option: string) => setCurrencyFilter(option);

  const toggleSort = (setter: React.Dispatch<React.SetStateAction<SortDirection>>) => {
    setter(current => {
      if (current === 'asc') return 'desc';
      if (current === 'desc') return null;
      return 'asc';
    });
  };

  const toggleInvoiceDateSort = () => {
    toggleSort(setInvoiceDateSort);
    setDueDateSort(null);
    setAmountTtcSort(null);
  };

  const toggleDueDateSort = () => {
    toggleSort(setDueDateSort);
    setInvoiceDateSort(null);
    setAmountTtcSort(null);
  };

  const toggleAmountTtcSort = () => {
    toggleSort(setAmountTtcSort);
    setInvoiceDateSort(null);
    setDueDateSort(null);
  };

  return (
    <Container maxW="full">
      <Flex justifyContent="space-between" alignItems="center" mb={4} mt={7}>
        <Heading size="lg" mr={20}>Internal Invoices Management</Heading>
        <Navbar type="InternalInvoice" />
      </Flex>
      <InternalInvoicesTable
        customerFilter={customerFilter}
        projectFilter={projectFilter}
        currencyFilter={currencyFilter}
        onCustomerFilterSelect={handleCustomerFilterSelect}
        onProjectFilterSelect={handleProjectFilterSelect}
        onCurrencyFilterSelect={handleCurrencyFilterSelect}
        invoiceDateSort={invoiceDateSort}
        dueDateSort={dueDateSort}
        amountTtcSort={amountTtcSort}
        onInvoiceDateSortToggle={toggleInvoiceDateSort}
        onDueDateSortToggle={toggleDueDateSort}
        onAmountTtcSortToggle={toggleAmountTtcSort}
      />
    </Container>
  );
}

export default InternalInvoices;