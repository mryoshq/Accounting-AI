import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Button,
  Flex
} from "@chakra-ui/react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

import {
  ExternalInvoicesService,
  SuppliersService,
  ProjectsService,
  PaymentstosupplierService,
  PaymentsfromcustomerService,
  PaymentToSupplierPublic,
  PaymentFromCustomerPublic
} from "../../client";
import type { UserPublic } from "../../client";

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
});

interface DashboardKPIProps {
  title: string;
  metric: string | number;
  trend?: string;
  isLoading: boolean;
}

const DashboardKPI: React.FC<DashboardKPIProps> = ({ title, metric, trend, isLoading }) => (
  <Stat>
    <StatLabel>{title}</StatLabel>
    {isLoading ? (
      <Spinner size="sm" />
    ) : (
      <>
        <StatNumber>{metric}</StatNumber>
        {trend && <StatHelpText>{trend}</StatHelpText>}
      </>
    )}
  </Stat>
);

const COLORS = ['#00C49F', '#8884D8', '#0088FE', '#FF8042', '#FFBB28'];

const PAYMENT_STATUSES = ['Paid', 'Pending', 'Partial', 'Failed', 'Missing'];

const RADIAN = Math.PI / 180;
interface CustomizedLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: CustomizedLabelProps) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

interface DashboardData {
  totalInvoices: number;
  totalAmount: number;
  activeSuppliers: number;
  invoiceProcessingData: Array<{ name: string; value: number }>;
  topSuppliers: Array<{ name: string; invoiceCount: number }>;
  projectFinancialData: Array<{ name: string; expenses: number; income: number }>;
  recentExpenses: PaymentToSupplierPublic[];
  recentIncomes: PaymentFromCustomerPublic[];
}

function Dashboard() {
  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);
  const bgColor = useColorModeValue("white", "gray.800");

  const [selectedProjectIndex, setSelectedProjectIndex] = React.useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);

  const { data: invoices, error: invoicesError } = useQuery({
    queryKey: ['externalInvoices'],
    queryFn: () => ExternalInvoicesService.readExternalInvoices(),
  });

  const { data: suppliers, error: suppliersError } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => SuppliersService.readSuppliers(),
  });

  const { data: projects, error: projectsError } = useQuery({
    queryKey: ['projects'],
    queryFn: () => ProjectsService.readProjects(),
  });

  const { data: paymentsToSuppliers, error: paymentsToSuppliersError } = useQuery({
    queryKey: ['paymentsToSuppliers'],
    queryFn: () => PaymentstosupplierService.readPaymentsToSuppliers(),
  });

  const { data: paymentsFromCustomers, error: paymentsFromCustomersError } = useQuery({
    queryKey: ['paymentsFromCustomers'],
    queryFn: () => PaymentsfromcustomerService.readPaymentsFromCustomers(),
  });

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalInvoices: 0,
    totalAmount: 0,
    activeSuppliers: 0,
    invoiceProcessingData: [],
    topSuppliers: [],
    projectFinancialData: [],
    recentExpenses: [],
    recentIncomes: [],
  });

  useEffect(() => {
    if (invoices && suppliers && projects && paymentsToSuppliers && paymentsFromCustomers) {
      const totalInvoices = invoices.count || 0;
      const totalAmount = invoices.data.reduce((sum, invoice) => sum + invoice.amount_ttc, 0) || 0;
      const activeSuppliers = suppliers.count || 0;

      const invoiceProcessingData = PAYMENT_STATUSES.map(status => ({
        name: status,
        value: paymentsToSuppliers.data.filter(p => p.payment_status === status).length || 0,
      })).filter(item => item.value > 0);

      const topSuppliers = suppliers.data
        .map(supplier => ({
          name: supplier.name,
          invoiceCount: invoices.data.filter(invoice => invoice.supplier_id === supplier.id).length || 0,
        }))
        .sort((a, b) => b.invoiceCount - a.invoiceCount)
        .slice(0, 5);

      const projectFinancialData = projects.data.map(project => ({
        name: project.name,
        expenses: paymentsToSuppliers.data
          .filter(payment => payment.project_id === project.id)
          .reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0,
        income: paymentsFromCustomers.data
          .filter(payment => payment.project_id === project.id)
          .reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0,
      }));

      const recentExpenses = paymentsToSuppliers.data
        .sort((a, b) => new Date(b.disbursement_date).getTime() - new Date(a.disbursement_date).getTime())
        .slice(0, 5);

      const recentIncomes = paymentsFromCustomers.data
        .sort((a, b) => new Date(b.disbursement_date).getTime() - new Date(a.disbursement_date).getTime())
        .slice(0, 5);

      setDashboardData({
        totalInvoices,
        totalAmount,
        activeSuppliers,
        invoiceProcessingData,
        topSuppliers,
        projectFinancialData,
        recentExpenses,
        recentIncomes,
      });

      setDataLoaded(true);
    }
  }, [invoices, suppliers, projects, paymentsToSuppliers, paymentsFromCustomers]);

  const handlePreviousProject = () => {
    setSelectedProjectIndex((prev) => (prev > 0 ? prev - 1 : dashboardData.projectFinancialData.length - 1));
  };

  const handleNextProject = () => {
    setSelectedProjectIndex((prev) => (prev < dashboardData.projectFinancialData.length - 1 ? prev + 1 : 0));
  };

  if (invoicesError || suppliersError || projectsError || paymentsToSuppliersError || paymentsFromCustomersError) {
    return (
      <Alert status="error">
        <AlertIcon />
        An error occurred while fetching data. Please try again later.
      </Alert>
    );
  }

  return (
    <Container maxW="full" p={5}>
      <Box pt={5} pb={10}>
        <Text fontSize="3xl" fontWeight="bold">Dashboard</Text>
        <Text fontSize="xl" color={'GrayText'}>
          Welcome, {currentUser?.full_name || currentUser?.email}
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} p={7} spacing={6} mb={10} boxShadow='lg' rounded='md'>
        <DashboardKPI title="Invoices Processed" metric={dashboardData.totalInvoices} trend="+12% from last month" isLoading={!dataLoaded} />
        <DashboardKPI title="Total Amount Processed" metric={`MAD ${dashboardData.totalAmount.toLocaleString()}`} trend="+8% from last month" isLoading={!dataLoaded} />
        <DashboardKPI title="Active Suppliers" metric={dashboardData.activeSuppliers} trend="+3 from last month" isLoading={!dataLoaded} />
        <DashboardKPI title="Processing Accuracy" metric="98.5%" trend="+0.5% from last month" isLoading={false} />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={10}>
        <Box bg={bgColor} p={5} borderRadius="lg" boxShadow='outline' rounded='md'>
          <Text fontSize="xl" fontWeight="bold" mb={4}>Invoice Processing Status</Text>
          {!dataLoaded ? (
            <Spinner />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.invoiceProcessingData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1000}
                >
                  {dashboardData.invoiceProcessingData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Box>
        <Box bg={bgColor} p={5} borderRadius="lg" boxShadow='outline' rounded='md'>
          <Text fontSize="xl" fontWeight="bold" mb={4}>Top Suppliers by Invoice Count</Text>
          {!dataLoaded ? (
            <Spinner />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.topSuppliers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="invoiceCount" fill="#FF8042" animationBegin={0} animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Box>
      </SimpleGrid>

      <Box bg={bgColor} p={5} borderRadius="lg" boxShadow='lg' rounded='md' mb={10}>
        <Text fontSize="xl" fontWeight="bold" mb={4}>Project Financial Overview</Text>
        {!dataLoaded ? (
          <Spinner />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[dashboardData.projectFinancialData[selectedProjectIndex]]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="expenses" fill="#8884d8" animationBegin={0} animationDuration={1000} />
                <Bar dataKey="income" fill="#00C49F" animationBegin={0} animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
            <Flex justifyContent="center" alignItems="center" mt={4}>
              <Button onClick={handlePreviousProject} mr={2} bg={'transparent'}>
                <ChevronLeftIcon />
              </Button>
              <Text fontWeight="bold">{dashboardData.projectFinancialData[selectedProjectIndex]?.name}</Text>
              <Button onClick={handleNextProject} ml={2} bg={'transparent'}>
                <ChevronRightIcon />
              </Button>
            </Flex>
          </>
        )}
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={10}>
        <Box bg={bgColor} p={5} borderRadius="lg" boxShadow='lg' rounded='md'>
          <Text fontSize="xl" fontWeight="bold" mb={4}>Recent Expenses</Text>
          {!dataLoaded ? (
            <Spinner />
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {dashboardData.recentExpenses.map((expense) => (
                  <Tr key={expense.id}>
                    <Td>{expense.disbursement_date}</Td>
                    <Td>{`MAD ${expense.amount?.toLocaleString()}`}</Td>
                    <Td>{expense.payment_status}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Box>

        <Box bg={bgColor} p={5} borderRadius="lg" boxShadow='lg' rounded='md'>
          <Text fontSize="xl" fontWeight="bold" mb={4}>Recent Incomes</Text>
          {!dataLoaded ? (
            <Spinner />
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {dashboardData.recentIncomes.map((income) => (
                  <Tr key={income.id}>
                    <Td>{income.disbursement_date}</Td>
                    <Td>{`MAD ${income.amount?.toLocaleString()}`}</Td>
                    <Td>{income.payment_status}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Box>
        </SimpleGrid>
    </Container>
  );
}

export default Dashboard;