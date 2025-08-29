import { NextResponse } from "next/server";
import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function POST(req: Request) {
    try {
        let body: any;
        try {
            body = await req.json();
        } catch (err) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid JSON",
                },
                { status: 400 }
            );
        }

        const {
            cnic = "0", // default value as string
            endpoint,
            method,
            requestHeaders = {},
            requestData = null,
            responseData = null,
            statusCode = 200,
            direction = "in",
            type = "bank",
            isSuccess = true,
            clientName = "nextjs-client",
            ipAddress = "127.0.0.1",
        } = body;

        if (!endpoint || !method) {
            return NextResponse.json(
                {
                    success: false,
                    message: "endpoint and method are required",
                },
                { status: 400 }
            );
        }

        const [inserted] = await sql`
      INSERT INTO api_logs (
        cnic, endpoint, method, request_headers, request_data, response_data,
        status_code, direction, type, is_success, client_name, ip_address
      )
      VALUES (
        ${cnic}, ${endpoint}, ${method?.toUpperCase()},
        ${sql.json(requestHeaders)}, ${sql.json(requestData)}, ${sql.json(responseData)},
        ${statusCode}, ${direction}, ${type}, ${isSuccess},
        ${clientName}, ${ipAddress}
      )
      RETURNING *;
    `;
        return NextResponse.json(
            {
                success: true,
                message: "API log saved successfully",
                data: inserted,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Failed to save API log:", error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
