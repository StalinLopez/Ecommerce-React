import { getAuth } from "@clerk/nextjs/server";
import {prisma} from "@/lib/prisma"
import authSeller from "@/middlewares/authSeller";
import { NextResponse } from "next/server";


//auth seller
export async function GET(req   ) {
    try {   
        const {userId} = getAuth(req)
        const isSeller = await authSeller(userId);
        if (!isSeller) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }
       const storeInfo = await prisma.store.findUnique({
            where: {userId: userId},
        });
        return NextResponse.json({storeInfo}, {status: 200});   
    }catch (error) {
        console.error("Error in GET /api/store/seller:", error);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}