from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import StreamingResponse
import pandas as pd
from io import BytesIO
from app.models import ReportRequest, ReportResponse, ReportData
from app.api.deps import SessionDep, CurrentUser
from app.models import PaymentFromCustomer, PaymentToSupplier, ExternalInvoice, InternalInvoice, Project, Customer, Supplier
from sqlalchemy import func
from datetime import datetime

router = APIRouter()

@router.post("/report", response_model=ReportResponse)
async def generate_report(
    request: ReportRequest,
    session: SessionDep,
    current_user: CurrentUser
):
    try:
        # The start_date and end_date are already datetime.date objects, so no need to parse them
        start_date = request.start_date
        end_date = request.end_date

        # Fetch data from database
        payments_from_customers = session.query(PaymentFromCustomer).filter(
            PaymentFromCustomer.disbursement_date.between(start_date, end_date)
        ).all()
        payments_to_suppliers = session.query(PaymentToSupplier).filter(
            PaymentToSupplier.disbursement_date.between(start_date, end_date)
        ).all()
        external_invoices = session.query(ExternalInvoice).filter(
            ExternalInvoice.invoice_date.between(start_date, end_date)
        ).all()
        internal_invoices = session.query(InternalInvoice).filter(
            InternalInvoice.invoice_date.between(start_date, end_date)
        ).all()

        # Perform calculations
        total_income = sum(payment.amount for payment in payments_from_customers if payment.amount is not None)
        total_expenses = sum(payment.amount for payment in payments_to_suppliers if payment.amount is not None)
        net_profit = total_income - total_expenses
        total_receivables = sum(invoice.amount_ttc for invoice in internal_invoices if invoice.amount_ttc is not None)
        total_payables = sum(invoice.amount_ttc for invoice in external_invoices if invoice.amount_ttc is not None)

        # Project-wise breakdown
        projects = session.query(Project).all()
        project_data = []
        for project in projects:
            project_income = sum(payment.amount for payment in payments_from_customers if payment.project_id == project.id and payment.amount is not None)
            project_expenses = sum(payment.amount for payment in payments_to_suppliers if payment.project_id == project.id and payment.amount is not None)
            project_data.append({
                "project_name": project.name,
                "income": project_income,
                "expenses": project_expenses,
                "profit": project_income - project_expenses
            })

        # Top customers
        top_customers = session.query(
            Customer.name,
            func.sum(PaymentFromCustomer.amount).label('total_payment')
        ).join(PaymentFromCustomer).group_by(Customer.id).order_by(func.sum(PaymentFromCustomer.amount).desc()).limit(5).all()

        # Top suppliers
        top_suppliers = session.query(
            Supplier.name,
            func.sum(PaymentToSupplier.amount).label('total_payment')
        ).join(PaymentToSupplier).group_by(Supplier.id).order_by(func.sum(PaymentToSupplier.amount).desc()).limit(5).all()

        report_data = ReportData(
            total_income=total_income,
            total_expenses=total_expenses,
            net_profit=net_profit,
            total_receivables=total_receivables,
            total_payables=total_payables,
            project_data=project_data,
            top_customers=[{"name": c[0], "total_payment": c[1]} for c in top_customers],
            top_suppliers=[{"name": s[0], "total_payment": s[1]} for s in top_suppliers]
        )

        response = ReportResponse(
            data=report_data,
            start_date=start_date,
            end_date=end_date,
            report_type=request.report_type
        )

        if request.output_format == 'json':
            return response
        elif request.output_format in ['csv', 'xlsx']:
            # Create a dictionary of dataframes
            dfs = {
                'Summary': pd.DataFrame([{
                    'Total Income': total_income,
                    'Total Expenses': total_expenses,
                    'Net Profit': net_profit,
                    'Total Receivables': total_receivables,
                    'Total Payables': total_payables
                }]),
                'Project Data': pd.DataFrame(project_data),
                'Top Customers': pd.DataFrame(top_customers, columns=['Customer', 'Total Payment']),
                'Top Suppliers': pd.DataFrame(top_suppliers, columns=['Supplier', 'Total Payment'])
            }

            if request.output_format == 'csv':
                output = BytesIO()
                for sheet_name, df in dfs.items():
                    output.write(f"{sheet_name}\n".encode('utf-8'))
                    output.write(df.to_csv(index=False).encode('utf-8'))
                    output.write("\n\n".encode('utf-8'))
                output.seek(0)
                media_type = "text/csv"
                filename = f"report_{start_date}_to_{end_date}.csv"
            else:  # xlsx
                output = BytesIO()
                with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
                    for sheet_name, df in dfs.items():
                        df.to_excel(writer, sheet_name=sheet_name, index=False)
                output.seek(0)
                media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                filename = f"report_{start_date}_to_{end_date}.xlsx"

            headers = {
                "Content-Disposition": f"attachment; filename={filename}",
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
            return Response(content=output.getvalue(), media_type=media_type, headers=headers)
        else:
            raise HTTPException(status_code=400, detail="Invalid output format")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))