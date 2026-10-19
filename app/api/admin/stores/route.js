import { NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import authAdmin from "@/middlewares/authAdmin";
import {prisma} from "@/lib/prisma"

// get all approve stores

export async function GET(request) {
try{
  const {userId} = getAuth(request)
  const isAdmin = await authAdmin(userId)   
    if(!isAdmin){
        return NextResponse.json({message: "Unauthorized"}, {status: 401})
    }
const stores = await prisma.store.findMany({
    where: {status: {in: ["approved"]}},
    include:{user:true}
})
return NextResponse.json({stores})


}catch(error) {
    console.error(error)
    return NextResponse.json({error:error.code || error.message},{message: "Internal Server Error"}, {status: 500}) 
}
}