import {getAuth} from "@clerk/nextjs/server";
import authSeller from "@/lib/authSeller";
import {NextResponse} from "next/server";
import prisma from "@/lib/prismadb";
import imagekit from "@/lib/imagekit";

export async function POST(req) {
    try {
        const {userId} = getAuth(req);
        const storeId = await authSeller(userId);
        if (!storeId) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        //gest data from the form
        const formData = await req.formData();
        const name = formData.get("name");
        const description = formData.get("description");
        const mrp = formData.get("mrp");
        const price = formData.get("price");
        const category = formData.get("category");
        const images = formData.getAll("images");

        if (!name || !description || !mrp || !price || !category || images.length === 0) {
            return NextResponse.json({error: "Missing required fields"}, {status: 400});
        }

        //upload images to imagekit
        const uploadedImages = await Promise.all(images.map(async (image) => {
            const buffer = Buffer.from(await image.arrayBuffer());
            const response = await imagekit.upload({
                file: buffer,
                fileName: image.name,
                folder: "products",
            });
            const url = imagekit.url({ 
                path: response.filePath,
                transformation: [
                    {quality: 'auto'},
                    {format: 'webp'}, 
                    {width: '512'},  
                ]
            });
            return url;
        }));
        await prisma.product.create({
            data: {
                storeId,    
                name,
                description,
                mrp,
                price,
                category,
                images: uploadedImages,
            }
        });

        return NextResponse.json({message: "Product created successfully"}, {status: 201}); 
    }catch (error) {
        console.error("Error in POST /api/store/product:", error);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }   
}


// get all products for a seller

export async function GET(req) {
    try {
        const {userId} = getAuth(req);
        const storeId = await authSeller(userId);
        if (!storeId) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }       
        const products = await prisma.product.findMany({
            where: {storeId}
        });
        return NextResponse.json({products}, {status: 200});
    }   catch (error) {
        console.error("Error in GET /api/store/product:", error);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }   
}
