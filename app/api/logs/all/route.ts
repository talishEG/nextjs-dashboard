import { NextResponse } from "next/server";
import postgres from "postgres";
const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });
export async function GET() {
    try {
        const api_logs = await sql`SELECT * FROM api_logs`;
        return NextResponse.json({
            success: true,
            message: "API Logs fetched successfully",
            data: api_logs,
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Database Error: Failed to Fetch api logs.",
        });
    }
}