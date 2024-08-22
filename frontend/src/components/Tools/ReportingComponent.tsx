import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Select,
  Input,
  VStack,
  useToast,
  Center,
  Radio,
  RadioGroup,
  Stack,
} from '@chakra-ui/react';
import { TDataGenerateReport, ReportRequest } from '../../client';
import useAuth from '../../hooks/useAuth';

type GenerateReportResponse = Blob;

interface ReportingComponentProps {
  auth?: ReturnType<typeof useAuth>;
}

function ReportingComponent({ auth: propAuth }: ReportingComponentProps) {
  const hookAuth = useAuth();
  const auth = propAuth || hookAuth;

  const [outputFormat, setOutputFormat] = useState('csv');
  const [reportType, setReportType] = useState('quarterly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCustomDate, setIsCustomDate] = useState(false);
  const toast = useToast();

  useEffect(() => {
    updateDates();
  }, [reportType]);

  const updateDates = () => {
    const today = new Date();
    let start = new Date(today);
    let end = new Date(today);

    if (reportType === 'quarterly') {
      start.setMonth(today.getMonth() - 3);
    } else if (reportType === 'yearly') {
      start.setFullYear(today.getFullYear() - 1);
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const reportMutation = useMutation<GenerateReportResponse, Error, TDataGenerateReport>({
    mutationFn: async (data) => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('http://localhost/api/v1/reporting/report', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data.requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      return response.blob();
    },
    onSuccess: (data) => {
      console.log('Received Blob data:', data);

      const blobData = data as Blob;
      const fileReader = new FileReader();
      fileReader.onloadend = () => {
        console.log('FileReader result:', fileReader.result);
        const url = window.URL.createObjectURL(blobData);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report_${startDate}_to_${endDate}.${outputFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        console.log('File downloaded:', a.download);

        toast({
          title: "Report Generated",
          description: `${outputFormat.toUpperCase()} report downloaded successfully.`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      };
      fileReader.readAsText(blobData);
    },
    onError: (error) => {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: `There was an error generating the report: ${error.message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      if (error.message === 'User not authenticated') {
        auth.logout(); // Logout the user if not authenticated
      }
    },
  });

  const handleGenerateReport = () => {
    if (!auth.user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to generate a report.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const requestBody: ReportRequest = {
      start_date: startDate,
      end_date: endDate,
      report_type: reportType,
      output_format: outputFormat,
    };

    console.log('Generating report with request body:', requestBody);
    reportMutation.mutate({ requestBody });
  };

  return (
    <Center>
      <Box maxWidth="1000px" width="100%" py={5}>
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel>Output Format</FormLabel>
            <Select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)}>
              <option value="csv">CSV</option>
              <option value="xlsx">XLSX</option>
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Report Type</FormLabel>
            <RadioGroup onChange={setReportType} value={reportType}>
              <Stack direction="row">
                <Radio value="quarterly">Quarterly</Radio>
                <Radio value="yearly">Yearly</Radio>
                <Radio value="custom" onChange={() => setIsCustomDate(true)}>Custom</Radio>
              </Stack>
            </RadioGroup>
          </FormControl>
          <FormControl>
            <FormLabel>Start Date</FormLabel>
            <Input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              isDisabled={!isCustomDate}
            />
          </FormControl>
          <FormControl>
            <FormLabel>End Date</FormLabel>
            <Input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              isDisabled={!isCustomDate}
            />
          </FormControl>
          <Button onClick={handleGenerateReport} colorScheme="blue" isLoading={reportMutation.isPending} mt={5}>
            Generate Report
          </Button>
        </VStack>
      </Box>
    </Center>
  );
}

export default ReportingComponent;