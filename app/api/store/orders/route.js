import { prisma } from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function POST(req){
try{
const {userId}= getAuth(req)
const storeId = await authSeller(userId)
if(!storeId){
    return NextResponse.json({error:'not authoeized'},{status:401})
}
const{orderId,status}=await req.json()

await prisma.order.update({
    where :{id:orderId,storeId},
    data:{status}
})
return NextResponse.json({message:"order status update"})
}catch(error){
    console.error(error);
    return NextResponse.json({error:error.code || error.message},{status:
    400})
}
}
//get all orders for a seller
export async function GET(req){
try{
const {userId}= getAuth(req)
const storeId = await authSeller(userId)
if(!storeId){
    return NextResponse.json({error:'not authoeized'},{status:401})
}
const orders = await prisma.order.findMany({
    where:{storeId},
    include:{user:true,address:true,orderItems:{include:{product:
    true}}},
    orderBy:{createdAt:'desc'}
})
return NextResponse.json({orders})
}catch(error){
    console.error(error);
    return NextResponse.json({error:error.code || error.message},{status:
    400})
}
}
