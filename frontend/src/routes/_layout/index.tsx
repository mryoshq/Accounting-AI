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
  Flex,
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
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import {
  ExternalInvoicesService,
  InternalInvoicesService,
  SuppliersService,
  CustomersService,
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

const getStatusColor = (status: string) => {
  const colorMap: { [key: string]: string } = {
    'Paid': '#00C49F',
    'Pending': '#8884D8',
    'Partial': '#0088FE',
    'Failed': '#FF8042',
    'Missing': '#FFBB28'
  };
  return colorMap[status] || '#999999'; // default color if status is not found
};

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

const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: CustomizedLabelProps) => {
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
  processingAccuracy: number;
  externalPaymentsData: Array<{ name: string; value: number }>;
  internalPaymentsData: Array<{ name: string; value: number }>;
  topSuppliers: Array<{ name: string; }>;
  topCustomers: Array<{ name: string; }>;
  projectFinancialData: Array<{ name: string; expenses: number; income: number }>;
  recentExpenses: PaymentToSupplierPublic[];
  recentIncomes: PaymentFromCustomerPublic[];
}

function Dashboard() {
  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);
  const bgColor = useColorModeValue("white", "gray.800");
  const headerbgColor = useColorModeValue("gray.100", "gray.700");

  const [selectedProjectIndex, setSelectedProjectIndex] = React.useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [projectReturns, setProjectReturns] = useState<Array<{ project: string, data: Array<{ invoice: string, return: number }> }>>([]);




  const { data: external_invoices, error: externalInvoicesError, isLoading: externalInvoicesLoading } = useQuery({
    queryKey: ['externalInvoices'],
    queryFn: () => ExternalInvoicesService.readExternalInvoices(),
    refetchInterval: 60000, // Refetch every 60 seconds
  });

  const { data: internal_invoices, error: internalInvoicesError } = useQuery({
    queryKey: ['internalInvoices'],
    queryFn: () => InternalInvoicesService.readInternalInvoices(),
    refetchInterval: 60000, // Refetch every 60 seconds
  });



  //data

  const { data: suppliers, error: suppliersError } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => SuppliersService.readSuppliers(),
  });

  const { data: customers, error: customersError } = useQuery({
    queryKey: ['customers'],
    queryFn: () => CustomersService.readCustomers(),
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
    processingAccuracy: 0,
    externalPaymentsData: [],
    internalPaymentsData: [],
    topSuppliers: [],
    topCustomers: [],
    projectFinancialData: [],
    recentExpenses: [],
    recentIncomes: [],
  });


  
  useEffect(() => {
    if (external_invoices && internal_invoices && suppliers && customers && projects && paymentsToSuppliers && paymentsFromCustomers) {
      const totalInvoices = (external_invoices.count || 0) + (internal_invoices.count || 0);
      const totalAmount = external_invoices.data.reduce((sum, invoice) => sum + (invoice.amount_ttc || 0), 0) +
                          internal_invoices.data.reduce((sum, invoice) => sum + (invoice.amount_ttc || 0), 0);
      const activeSuppliers = suppliers.count || 0;


      const totalPayments = (paymentsToSuppliers.count || 0) + (paymentsFromCustomers.count || 0);
      const successfulPayments = paymentsToSuppliers.data.filter(p => p.payment_status === 'Paid').length +
                               paymentsFromCustomers.data.filter(p => p.payment_status === 'Paid').length;
      const processingAccuracy = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;

    

      const externalPaymentsData = PAYMENT_STATUSES.map(status => ({
        name: status,
        value: paymentsToSuppliers.data.filter(p => p.payment_status === status).length || 0,
      })).filter(item => item.value > 0);

      const internalPaymentsData = PAYMENT_STATUSES.map(status => ({
        name: status,
        value: paymentsFromCustomers.data.filter(p => p.payment_status === status).length || 0,
      })).filter(item => item.value > 0);


      //top suppliers and customers
      const topSuppliers = suppliers.data
        .map(supplier => ({
          name: supplier.name,
          total: external_invoices.data
            .filter(invoice => invoice.supplier_id === supplier.id)
            .reduce((sum, invoice) => sum + (invoice.amount_ttc || 0), 0),
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      const topCustomers = customers.data
        .map(customer => ({
          name: customer.name,
          total: internal_invoices.data
            .filter(invoice => invoice.customer_id === customer.id)
            .reduce((sum, invoice) => sum + (invoice.amount_ttc || 0), 0),
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      //project financial data
      const projectFinancialData = projects.data.map(project => ({
        name: project.name,
        expenses: paymentsToSuppliers.data
          .filter(payment => payment.project_id === project.id)
          .reduce((sum, payment) => sum + (payment.amount || 0), 0),
        income: paymentsFromCustomers.data
          .filter(payment => payment.project_id === project.id)
          .reduce((sum, payment) => sum + (payment.amount || 0), 0),
      }));

      //recent expenses and incomes
      const recentExpenses = paymentsToSuppliers.data
        .sort((a, b) => new Date(b.disbursement_date).getTime() - new Date(a.disbursement_date).getTime())
        .slice(0, 5);

      const recentIncomes = paymentsFromCustomers.data
        .sort((a, b) => new Date(b.disbursement_date).getTime() - new Date(a.disbursement_date).getTime())
        .slice(0, 5);

      // Calculate project returns for the area chart
      const returns = projects.data.map(project => {
        const projectInvoices = [
          ...external_invoices.data.filter(inv => inv.project_id === project.id), // External invoices (expenses)
          ...internal_invoices.data.filter(inv => inv.project_id === project.id) // Internal invoices (income)
        ].sort((a, b) => new Date(a.invoice_date).getTime() - new Date(b.invoice_date).getTime());

        let cumulativeReturn = 0;
        const data = projectInvoices.map(invoice => {
          const amount = invoice.amount_ttc || 0;
          // Internal invoices are income, external invoices are expenses
          cumulativeReturn += 'customer_id' in invoice ? amount : -amount;
          return {
            invoice: invoice.reference || '',
            return: cumulativeReturn
          };
        });

        return { project: project.name, data };
      });

        

      setDashboardData({
        totalInvoices,
        totalAmount,
        activeSuppliers,
        processingAccuracy,
        externalPaymentsData,
        internalPaymentsData,
        topSuppliers,
        topCustomers,
        projectFinancialData, 
        recentExpenses,
        recentIncomes,
      });

      setProjectReturns(returns);
      setDataLoaded(true);
    }
  }, [external_invoices, internal_invoices, suppliers, projects, paymentsToSuppliers, paymentsFromCustomers]);

  const gradientOffset = () => {
    if (!projectReturns[selectedProjectIndex]) return 0;
    const data = projectReturns[selectedProjectIndex].data;
    const dataMax = Math.max(...data.map((i) => i.return));
    const dataMin = Math.min(...data.map((i) => i.return));

    if (dataMax <= 0) return 0;
    if (dataMin >= 0) return 1;

    return dataMax / (dataMax - dataMin);
  };

  const off = gradientOffset();

  const handlePreviousProject = () => {
    setSelectedProjectIndex((prev) => (prev > 0 ? prev - 1 : projectReturns.length - 1));
  };

  const handleNextProject = () => {
    setSelectedProjectIndex((prev) => (prev < projectReturns.length - 1 ? prev + 1 : 0));
  };

  if (externalInvoicesError || internalInvoicesError || suppliersError || customersError || projectsError || paymentsToSuppliersError || paymentsFromCustomersError) {
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

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} p={7} spacing={6} mb={10} boxShadow='lg' rounded='md' bg={headerbgColor}>
        <DashboardKPI 
          title="Invoices Processed" 
          metric={dashboardData.totalInvoices} 
          isLoading={externalInvoicesLoading} 
        />
        <DashboardKPI 
          title="Total Amount Processed" 
          metric={`MAD ${dashboardData.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} 
          trend={`${((dashboardData.totalAmount / (external_invoices?.data.reduce((sum, inv) => sum + (inv.amount_ttc || 0), 0) || 1) - 1) * 100).toFixed(1)}% from last month`} 
          isLoading={externalInvoicesLoading} 
        />
        <DashboardKPI 
          title="Active Suppliers" 
          metric={dashboardData.activeSuppliers} 
          isLoading={!dataLoaded} 
        />
        <DashboardKPI 
          title="Processing Accuracy" 
          metric={`${dashboardData.processingAccuracy.toFixed(1)}%`} 
          trend={`${(dashboardData.processingAccuracy - 98).toFixed(1)}% from last month`} 
          isLoading={!dataLoaded} 
        />
      </SimpleGrid>

  
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={10}>
        <Box bg={bgColor} p={5} borderRadius="lg" boxShadow='outline' rounded='md'>
          <Text fontSize="xl" fontWeight="bold" mb={4}>Top Customers by Total Income</Text>
          {!dataLoaded ? (
            <Spinner />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.topCustomers}>
                <Legend width={100} wrapperStyle={{ top: 10, right: 10,  lineHeight: '40px' }} />
                <XAxis dataKey="name" />
                <YAxis 
                  tickFormatter={(value) => `${(value / 1000).toFixed(1)}K`}
                />
                <Tooltip 
                  formatter={(value) => `MAD ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                />
                <Legend />
                <Bar 
                dataKey="total" 
                fill="#82ca9d" 
                name="total" 
                barSize={50}
                label={{ position: "insideTop", fill: "white" }}
                />
                
              </BarChart>
            </ResponsiveContainer>
          )}
        </Box>
        <Box bg={bgColor} p={5} borderRadius="lg" boxShadow='outline' rounded='md'>
          <Text fontSize="xl" fontWeight="bold" mb={4}>Incomes Status</Text>
          {!dataLoaded ? (
            <Spinner />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Legend width={100} wrapperStyle={{ top: 10, right: 10,  lineHeight: '40px' }} />
                <Pie
                  data={dashboardData.internalPaymentsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={PieLabel}
                  outerRadius={100}
                  dataKey="value"
                >
                  {dashboardData.internalPaymentsData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={getStatusColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Box>
      </SimpleGrid>



      <Box bg={bgColor} p={5} borderRadius="lg" boxShadow='lg' rounded='md' mb={10}>
        <Text fontSize="xl" fontWeight="bold" mb={4}>Project Financial Overview</Text>
        {!dataLoaded || projectReturns.length === 0 ? (
          <Spinner />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={projectReturns[selectedProjectIndex].data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="invoice" 
                  interval={0} 
                  angle={-45} 
                  textAnchor="end" 
                  height={80} 
                  tick={{fontSize: 10}}
                />
                <YAxis 
                  tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value)}
                />
                <Tooltip 
                  formatter={(value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MAD' }).format(Number(value))}
                  labelFormatter={(label) => `Invoice: ${label}`}
                />
                <defs>
                  <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset={off} stopColor="#00C49F" stopOpacity={1} />
                    <stop offset={off} stopColor="#FF8042" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="return" 
                  stroke="#000" 
                  fill="url(#splitColor)" 
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
            <Flex justifyContent="center" alignItems="center" mt={4}>
              <Button onClick={handlePreviousProject} mr={2} bg={'transparent'}>
                <ChevronLeftIcon />
              </Button>
              <Text fontWeight="bold">{projectReturns[selectedProjectIndex]?.project}</Text>
              <Button onClick={handleNextProject} ml={2} bg={'transparent'}>
                <ChevronRightIcon />
              </Button>
            </Flex>
          </>
        )}
      </Box>


     



      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={10}>
        <Box bg={bgColor} p={5} borderRadius="lg" boxShadow='outline' rounded='md'>
          <Text fontSize="xl" fontWeight="bold" mb={4}>Expenses Status</Text>
          {!dataLoaded ? (
            <Spinner />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Legend width={100} wrapperStyle={{ top: 10, right: 10,  lineHeight: '40px' }} />
                <Pie
                  data={dashboardData.externalPaymentsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={PieLabel}
                  outerRadius={100}
                  dataKey="value"
                >
                  {dashboardData.externalPaymentsData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={getStatusColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Box>
        <Box bg={bgColor} p={5} borderRadius="lg" boxShadow='outline' rounded='md'>
          <Text fontSize="xl" fontWeight="bold" mb={4}>Top Suppliers by Total Expenditure</Text>
          {!dataLoaded ? (
            <Spinner />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.topSuppliers}>
                <Legend width={100} wrapperStyle={{ top: 10, right: 10,  lineHeight: '40px' }} />
                <XAxis dataKey="name" />
                <YAxis 
                  tickFormatter={(value) => `${(value / 1000).toFixed(1)}K`}
                />
                <Tooltip 
                  formatter={(value) => `MAD ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                />
                <Legend />
                <Bar 
                dataKey="total" 
                fill="#FF8042" 
                name="total" 
                barSize={50} 
                label={{ position: "insideTop", fill: "white" }}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Box>
      </SimpleGrid>

    
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
                    <Td>
                    <Box as="span" px={2} py={1} borderRadius="md" bg={getStatusColor(expense.payment_status)}>
                      {expense.payment_status}
                    </Box>
                  </Td>

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
                    <Td>
                      <Box as="span" px={2} py={1} borderRadius="md" bg={getStatusColor(income.payment_status)}>
                        {income.payment_status}
                      </Box>
                    </Td>
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




