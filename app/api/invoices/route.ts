import postgres from "postgres";
import { NextResponse } from "next/server";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function GET() {
    try {
        const invoices = await sql`SELECT * FROM invoices`;
        return NextResponse.json({
            success: true,
            message: "Invoices fetched successfully",
            data: invoices,
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Database Error: Failed to Fetch Invoices.",
        });
    }
}

export async function POST(req: Request) {
    try {
        let body = {
            customerId: 'd6e15727-9fe1-4961-8c5b-ea44a9bd81aa',
            amount: 120,
            status: 'pending'
        };
        try {
            body = await req.json();
        } catch (err) {
            body = {
                customerId: 'd6e15727-9fe1-4961-8c5b-ea44a9bd81aa',
                amount: 120,
                status: 'pending'
            };
        }
        const customerId = body.customerId ?? 'd6e15727-9fe1-4961-8c5b-ea44a9bd81aa';
        const amount = body.amount ?? 120;
        const status = body.status ?? 'pending';
        const amountInCents = amount * 100;
        const date = new Date().toISOString().split('T')[0];

        const newInvoice =
            await sql`INSERT INTO invoices (customer_id, amount, status, "date")
                VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
                RETURNING *`;

        return NextResponse.json({
            success: true,
            message: "Invoice added successfully",
            data: newInvoice[0],
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : String(error),
        });
    }
}
