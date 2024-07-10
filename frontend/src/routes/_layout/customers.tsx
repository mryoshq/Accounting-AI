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
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { CustomersService, type CustomerPublic } from "../../client";
import ActionsMenu from "../../components/Common/ActionsMenu";
import Navbar from "../../components/Common/Navbar";

export const Route = createFileRoute("/_layout/customers")({
  component: Customers,
});

function CustomersTableBody() {
  const { data: customers } = useSuspenseQuery({
    queryKey: ["customers"],
    queryFn: () => CustomersService.readCustomers(),
  });

  return (
    <Tbody>
      {customers.data.map((customer: CustomerPublic) => (
        <Tr key={customer.id}>
          <Td>{customer.name}</Td>
          <Td>{customer.ice}</Td>
          <Td>{customer.postal_code}</Td>
          <Td>{customer.rib}</Td>
          <Td>
            <ActionsMenu type={"Customer"} value={customer} />
          </Td>
        </Tr>
      ))}
    </Tbody>
  );
}

function CustomersTable() {
  return (
    <TableContainer>
      <Table size={{ base: "sm", md: "md" }}>
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>ICE</Th>
            <Th>Postal Code</Th>
            <Th>RIB</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <ErrorBoundary
          fallbackRender={({ error }) => (
            <Tbody>
              <Tr>
                <Td colSpan={3}>Something went wrong: {error.message}</Td>
              </Tr>
            </Tbody>
          )}
        >
          <Suspense
            fallback={
              <Tbody>
                {new Array(5).fill(null).map((_, index) => (
                  <Tr key={index}>
                    {new Array(3).fill(null).map((_, index) => (
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
            <CustomersTableBody />
          </Suspense>
        </ErrorBoundary>
      </Table>
    </TableContainer>
  );
}

function Customers() {
  return (
    <Container maxW="full">
      
      <Flex justifyContent="space-between" alignItems="center" mb={4} mt={7}>
          <Heading size="lg">Customers Management</Heading>
          <Navbar type="Customer" />
      </Flex>
      <CustomersTable />
    </Container>
  );
}
