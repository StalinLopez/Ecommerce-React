import authSeller from "@/lib/authSeller";
import {getAuth} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

export async function POST(req) {
    try {
        const {userId} = getAuth(req);  
        const {productId} = await req.json();

        if (!productId) {
            return NextResponse.json({error: "Missing required fields"}, {status: 400});
        }

        const storeId = await authSeller(userId);
        if (!storeId) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }
        //chek if product exist
        const product = await prisma.product.findFirst({
            where: {id: productId, storeId: storeId}
        });
        if (!product) {
            return NextResponse.json({error: "Product not found"}, {status: 404});
        }
        await prisma.product.update({
            where: {id: productId, storeId: storeId},
            data: {inStock: !product.inStock}
        });

        return NextResponse.json({message: "Product stock status toggled successfully"}, {status: 200});
    }catch (error) {
        console.error("Error in POST /api/store/stock-toggle:", error);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}