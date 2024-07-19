import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Box, Button, FormControl, FormLabel, Select, Input, VStack, useToast } from '@chakra-ui/react';
import { TDataGenerateReport, ReportRequest } from '../../client';

type GenerateReportResponse = Blob;

function ReportingComponent() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState('quarterly');
  const [outputFormat, setOutputFormat] = useState('csv');
  const toast = useToast();

  const reportMutation = useMutation<GenerateReportResponse, Error, TDataGenerateReport>({
    mutationFn: async (data) => {
      const response = await fetch('http://localhost/api/v1/reporting/report', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MjIwMDA0MzEsInN1YiI6IjEifQ.hmgu_pAyIwZJtu6Tshh-mtUUzJp60IFf-PJbjt7ld5A'
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
    },
  });

  const handleGenerateReport = () => {
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
    <Box>
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>Start Date</FormLabel>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>End Date</FormLabel>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>Report Type</FormLabel>
          <Select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Output Format</FormLabel>
          <Select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)}>
            <option value="csv">CSV</option>
            <option value="xlsx">XLSX</option>
          </Select>
        </FormControl>
        <Button onClick={handleGenerateReport} colorScheme="blue" isLoading={reportMutation.isPending}>
          Generate Report
        </Button>
      </VStack>
    </Box>
  );
}

export default ReportingComponent;
