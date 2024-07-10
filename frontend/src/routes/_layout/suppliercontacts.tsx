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
import { Suspense, lazy, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { SuppliersService, type SupplierContactPublic } from "../../client";
import ActionsMenu from "../../components/Common/ActionsMenu";
import Navbar from "../../components/Common/Navbar";

const LazyFilterDropdown = lazy(() => import('../../components/Common/FilterDropdown'));

export const Route = createFileRoute("/_layout/suppliercontacts")({
  component: SupplierContacts,
});

interface SupplierContactsTableBodyProps {
  supplierFilter: string;
}

function SupplierContactsTableBody({ supplierFilter }: SupplierContactsTableBodyProps) {
  const { data: supplierContacts } = useSuspenseQuery({
    queryKey: ["suppliercontacts"],
    queryFn: () => SuppliersService.readAllSupplierContacts(),
  });

  const { data: suppliers } = useSuspenseQuery({
    queryKey: ["suppliers"],
    queryFn: () => SuppliersService.readSuppliers(),
  });

  const supplierMap = suppliers.data.reduce((acc: Record<number, string>, supplier) => {
    acc[supplier.id] = supplier.name;
    return acc;
  }, {});

  const filteredContacts = supplierContacts.data.filter((contact: SupplierContactPublic) => {
    const supplierName = supplierMap[contact.supplier_id];
    return supplierFilter ? supplierName === supplierFilter : true;
  });

  return (
    <Tbody>
      {filteredContacts.map((contact: SupplierContactPublic) => (
        <Tr key={contact.id}>
          <Td>{contact.contact_name}</Td>
          <Td>{contact.phone_number ?? "N/A"}</Td>
          <Td>{contact.email ?? "N/A"}</Td>
          <Td>{contact.address ?? "N/A"}</Td>
          <Td>{contact.bank_details ?? "N/A"}</Td>
          <Td>{supplierMap[contact.supplier_id]}</Td>
          <Td>
            <ActionsMenu type={"SupplierContact"} value={contact} />
          </Td>
        </Tr>
      ))}
    </Tbody>
  );
}

interface SupplierContactsTableProps {
  supplierFilter: string;
  onSupplierFilterSelect: (option: string) => void;
}

function SupplierContactsTable({
  supplierFilter,
  onSupplierFilterSelect,
}: SupplierContactsTableProps) {
  const fetchSupplierOptions = async () => {
    const suppliers = await SuppliersService.readSuppliers();
    return suppliers.data.map((supplier: any) => supplier.name);
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
              Supplier Name
              <Suspense fallback={<div>Loading...</div>}>
                <LazyFilterDropdown
                  fetchData={fetchSupplierOptions}
                  selected={supplierFilter}
                  onSelect={onSupplierFilterSelect}
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
            <SupplierContactsTableBody supplierFilter={supplierFilter} />
          </Suspense>
        </ErrorBoundary>
      </Table>
    </TableContainer>
  );
}

function SupplierContacts() {
  const [supplierFilter, setSupplierFilter] = useState("");

  const handleSupplierFilterSelect = (option: string) => setSupplierFilter(option);

  return (
    <Container maxW="full">
      <Flex justifyContent="space-between" alignItems="center" mb={4} mt={7}>
          <Heading size="lg">Supplier Contacts Management</Heading>
          <Navbar type="SupplierContact" />
      </Flex>
      <SupplierContactsTable
        supplierFilter={supplierFilter}
        onSupplierFilterSelect={handleSupplierFilterSelect}
      />
    </Container>
  );
}

export default SupplierContacts;
