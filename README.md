# Accounting Project

An advanced accounting solution built with FastAPI and React, designed for modern businesses. Leveraging OpenAI for Automating Invoice Processing

## Key Features

### 1. Intuitive Dashboard
Get a quick overview of your financial status with our user-friendly dashboard.

![Dashboard](path/to/dashboard_feature.png)

- Real-time financial snapshot
- Customizable widgets
- Trend analysis and forecasting

### 2. Invoicing System
Create and manage invoices effortlessly.

![Invoicing](path/to/invoicing_feature.png)

- Automated invoice generation
- Multiple currency support
- Email integration for sending invoices

### 3. Expense Tracking
Keep your expenses in check with our comprehensive tracking system.

![Expense Tracking](path/to/expense_tracking.png)

- Receipt scanning and OCR
- Categorization of expenses
- Approval workflows for team expenses

### 4. Financial Reporting
Generate detailed financial reports with just a few clicks.

![Reporting](path/to/reporting_feature.png)

- Customizable report templates
- Export to multiple formats (PDF, Excel, CSV)
- Scheduled report generation

### 6. Multi-User Support
Collaborate with your team seamlessly.

![Multi-User](path/to/multi_user_feature.png)

- Role-based access control
- Activity logging
- Real-time collaboration on financial data


# Getting Started

### Prerequisites

- Docker
- Docker Compose
- Python 3.8+
- Node.js 14+

## Technology Stack

- **Backend**: FastAPI, PostgreSQL
- **Frontend**: React, Chakra UI
- **Deployment**: Docker, Traefik

  
### Development Setup

1. Clone the repository:
git clone https://github.com/mryoshq/accounting.git
cd accounting

2. Set up environment variables:
Copy `.env.example` to `.env` and adjust the variables as needed.

3. Start the development servers:
docker compose up -d

4. The services will be available at:
- Backend: http://localhost/api/
- Frontend: http://localhost
- API documentation: http://localhost/docs

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- [React - fastApi template](https://github.com/tiangolo/full-stack-fastapi-postgresql)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for more details.
