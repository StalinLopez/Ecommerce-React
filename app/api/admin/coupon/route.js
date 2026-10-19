import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import authAdmin from "@/middlewares/authAdmin";
import {prisma} from "@/lib/prisma"
import {inngest} from "./client.js"


export async function POST(request) {

    try{
    const {userId} = getAuth(request)
    const isAdmin = await authAdmin(userId)
    if(!isAdmin){
        return NextResponse.json({error:"not authorized"},{status:401})
    }
    const {newCoupon} = await request.json()
    newCoupon.code = newCoupon.code.toUpperCase()

    await prisma.coupon.create({data:newCoupon}).then(async(newCoupon)=>{
        // run inngest scheduler fucnction

        await inngest.send({
            name:"app/coupon.expired",
            data:{
                code:newCoupon.code,
                expires_at:newCoupon.expiresAt
            }
        })
    })

    return NextResponse.json({message:"coupon added"})
    }catch(error){
        console.error(error)
return NextResponse.json({error:error.code || error.message},{message: "Internal Server Error"}, {status: 500}) 

    }
    
}

//delete copupon /api/coupon
export async function DELETE (req){
        try{
    const {userId} = getAuth(req)
    const isAdmin = await authAdmin(userId)
    if(!isAdmin){
        return NextResponse.json({error:"not authorized"},{status:401})
    }
const {searchParams}=req.nextUrl;
const code = searchParams.get('code')
await prisma.coupon.delete({where:{code}})
return NextResponse.json({message:"coupon delete"})
    }catch(error){
        console.error(error)
return NextResponse.json({error:error.code || error.message},{message: "Internal Server Error"}, {status: 500}) 
    }
}

//get all coupon
export async function GET (req){
        try{
    const {userId} = getAuth(req)
    const isAdmin = await authAdmin(userId)
    if(!isAdmin){
        return NextResponse.json({error:"not authorized"},{status:401})
    }
    const coupons = await prisma.coupon.findMany({})
    return NextResponse.json({coupons})
    }catch(error){
        console.error(error)
return NextResponse.json({error:error.code || error.message},{message: "Internal Server Error"}, {status: 500}) 
    }
}