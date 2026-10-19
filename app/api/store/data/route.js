import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

//geth store info % store products

export async function GET(req) {
    try {
        //get store usernmame from query params
        const { searchParams } = new URL(req.url)
        const username = searchParams.get("username").toLowerCase();
        if (!username) {
            return NextResponse.json({error: "Missing username"}, {status: 400});
        }   

        // get store info and instock products
        const store = await prisma.store.findUnique({
            where: {username,isActive: true},
            include: {Product :{include:{rating:true}}}
        });
        if (!store) {
            return NextResponse.json({error: "Store not found"}, {status: 404});
        }
        return NextResponse.json({store}, {status: 200});
    }catch (error) {
        console.error("Error in GET /api/store/data:", error);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}