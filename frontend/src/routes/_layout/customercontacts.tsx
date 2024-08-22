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
import { CustomersService, type CustomerContactPublic } from "../../client";
import ActionsMenu from "../../components/Common/ActionsMenu";
import Navbar from "../../components/Common/Navbar";

const LazyFilterDropdown = lazy(() => import('../../components/Common/FilterDropdown'));

export const Route = createFileRoute("/_layout/customercontacts")({
  component: CustomerContacts,
});

interface CustomerContactsTableBodyProps {
  customerFilter: string;
}

function CustomerContactsTableBody({ customerFilter }: CustomerContactsTableBodyProps) {
  const { data: customerContacts } = useSuspenseQuery({
    queryKey: ["customercontacts"],
    queryFn: () => CustomersService.readAllCustomerContacts(),
  });

  const { data: customers } = useSuspenseQuery({
    queryKey: ["customers"],
    queryFn: () => CustomersService.readCustomers(),
  });

  const customerMap = customers.data.reduce((acc: Record<number, string>, customer) => {
    acc[customer.id] = customer.name;
    return acc;
  }, {});

  const filteredContacts = customerContacts.data.filter((contact: CustomerContactPublic) => {
    const customerName = customerMap[contact.customer_id];
    return customerFilter ? customerName === customerFilter : true;
  });

  return (
    <Tbody>
      {filteredContacts.map((contact: CustomerContactPublic) => (
        <Tr key={contact.id}>
          <Td>{contact.contact_name}</Td>
          <Td>{contact.phone_number ?? "N/A"}</Td>
          <Td>{contact.email ?? "N/A"}</Td>
          <Td>{contact.address ?? "N/A"}</Td>
          <Td>{contact.bank_details ?? "N/A"}</Td>
          <Td>{customerMap[contact.customer_id]}</Td>
          <Td>
            <ActionsMenu type={"CustomerContact"} value={contact} />
          </Td>
        </Tr>
      ))}
    </Tbody>
  );
}

interface CustomerContactsTableProps {
  customerFilter: string;
  onCustomerFilterSelect: (option: string) => void;
}

function CustomerContactsTable({
  customerFilter,
  onCustomerFilterSelect,
}: CustomerContactsTableProps) {
  const fetchCustomerOptions = async () => {
    const customers = await CustomersService.readCustomers();
    return customers.data.map((customer: any) => customer.name);
  };

  return (
    <TableContainer>
      <Table size={{ base: "sm", md: "md" }}>
        <Thead>
          <Tr>
            <Th>Contact Name</Th>
            <Th>Phone Number</Th>
            <Th>Email</Th>
            <Th>Address</Th>
            <Th>Bank Details</Th>
            <Th>
              Customer Name
              <Suspense fallback={<div>Loading...</div>}>
                <LazyFilterDropdown
                  fetchData={fetchCustomerOptions}
                  selected={customerFilter}
                  onSelect={onCustomerFilterSelect}
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
                <Td colSpan={7}>Something went wrong: {error.message}</Td>
              </Tr>
            </Tbody>
          )}
        >
          <Suspense
            fallback={
              <Tbody>
                {new Array(5).fill(null).map((_, index) => (
                  <Tr key={index}>
                    {new Array(7).fill(null).map((_, index) => (
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
            <CustomerContactsTableBody customerFilter={customerFilter} />
          </Suspense>
        </ErrorBoundary>
      </Table>
    </TableContainer>
  );
}

function CustomerContacts() {
  const [customerFilter, setCustomerFilter] = useState("");

  const handleCustomerFilterSelect = (option: string) => setCustomerFilter(option);

  return (
    <Container maxW="full">
      <Flex justifyContent="space-between" alignItems="center" mb={4} >
          <Heading size="md">Customer Contacts Management</Heading>
          <Navbar type="CustomerContact" />
        </Flex>
      <CustomerContactsTable
        customerFilter={customerFilter}
        onCustomerFilterSelect={handleCustomerFilterSelect}
      />
    </Container>
  );
}

export default CustomerContacts;
