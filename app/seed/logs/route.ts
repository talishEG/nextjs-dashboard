import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

async function seedApiLogs() {
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    await sql`
        CREATE TABLE IF NOT EXISTS api_logs (
                                                id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            cnic VARCHAR(255) DEFAULT '0', -- nullable, defaults to '0'
            endpoint VARCHAR(255) NOT NULL,
            method VARCHAR(10) NOT NULL,
            request_headers JSONB,
            request_data JSONB,
            response_data JSONB,
            status_code INT NOT NULL,
            direction VARCHAR(50) NOT NULL, -- in/out etc.
            type VARCHAR(50) NOT NULL,      -- bank/other type
            is_success BOOLEAN DEFAULT false,
            client_name VARCHAR(255),
            ip_address VARCHAR(100),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            );
    `;

    // Dummy data for logs
    const dummyLogs = [
        {
            cnic: "35201-1234567-8",
            endpoint: "/api/a02/students",
            method: "GET",
            request_headers: { accept: "application/json" },
            request_data: null,
            response_data: { message: "Fetched students successfully" },
            status_code: 200,
            direction: "in",
            type: "bank",
            is_success: true,
            client_name: "Next.js Client",
            ip_address: "127.0.0.1",
        },
        {
            cnic: "0", // default case
            endpoint: "/api/a02/students/123",
            method: "GET",
            request_headers: { accept: "application/json" },
            request_data: null,
            response_data: { error: "Student not found" },
            status_code: 404,
            direction: "in",
            type: "bank",
            is_success: false,
            client_name: "Next.js Client",
            ip_address: "127.0.0.1",
        },
        {
            cnic: "12345-6789012-3",
            endpoint: "/api/a02/students",
            method: "POST",
            request_headers: { "content-type": "application/json" },
            request_data: { name: "John Doe", age: 22 },
            response_data: { message: "New student created" },
            status_code: 201,
            direction: "out",
            type: "bank",
            is_success: true,
            client_name: "Next.js Client",
            ip_address: "127.0.0.1",
        },
    ];

    const insertedLogs = await Promise.all(
        dummyLogs.map(
            (log) => sql`
                INSERT INTO api_logs (
                    cnic, endpoint, method, request_headers, request_data, response_data,
                    status_code, direction, type, is_success, client_name, ip_address
                )
                VALUES (
                           ${log.cnic}, ${log.endpoint}, ${log.method}, ${sql.json(log.request_headers)},
                           ${sql.json(log.request_data)}, ${sql.json(log.response_data)},
                           ${log.status_code}, ${log.direction}, ${log.type}, ${log.is_success},
                           ${log.client_name}, ${log.ip_address}
                       )
                    ON CONFLICT (id) DO NOTHING;
            `
        )
    );

    return insertedLogs;
}

export async function GET() {
    try {
        await sql.begin((sql) => [seedApiLogs()]);
        return Response.json({ message: "API logs seeded successfully" });
    } catch (error) {
        console.error(error);
        return Response.json({ error }, { status: 500 });
    }
}
