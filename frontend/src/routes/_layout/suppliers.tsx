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
import { SuppliersService, type SupplierPublic } from "../../client";
import ActionsMenu from "../../components/Common/ActionsMenu";
import Navbar from "../../components/Common/Navbar";

export const Route = createFileRoute("/_layout/suppliers")({
  component: Suppliers,
});

function SuppliersTableBody() {
  const { data: suppliers } = useSuspenseQuery({
    queryKey: ["suppliers"],
    queryFn: () => SuppliersService.readSuppliers(),
  });

  return (
    <Tbody>
      {suppliers.data.map((supplier: SupplierPublic) => (
        <Tr key={supplier.id}>
          <Td>{supplier.name}</Td>
          <Td>{supplier.ice}</Td>
          <Td>{supplier.postal_code}</Td>
          <Td>{supplier.rib}</Td>
          <Td>
            <ActionsMenu type={"Supplier"} value={supplier} />
          </Td>
        </Tr>
      ))}
    </Tbody>
  );
}

function SuppliersTable() {
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
            <SuppliersTableBody />
          </Suspense>
        </ErrorBoundary>
      </Table>
    </TableContainer>
  );
}

function Suppliers() {
  return (
    <Container maxW="full">
      
      <Flex justifyContent="space-between" alignItems="center" mb={4} mt={7}>
          <Heading size="lg">Suppliers Management</Heading>
          <Navbar type="Supplier" />
      </Flex>
      <SuppliersTable />
    </Container>
  );
}
