import { NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import authAdmin from "@/middlewares/authAdmin";
import {prisma} from "@/lib/prisma"

//toggle stoe isActive
export async function POST(request) {
try{
  const {userId} = getAuth(request)
  const isAdmin = await authAdmin(userId)   
    if(!isAdmin){
        return NextResponse.json({message: "Unauthorized"}, {status: 401})
    }
const {storeId} = await request.json()

if(!storeId){
    return NextResponse.json({message: "missing storeId"}, {status: 400})
}

//find store
const store= await prisma.store.findUnique({
    where:{id:storeId}
})

if(!store){
    return NextResponse.json({message: "store not found"}, {status: 404})
}   
await prisma.store.update({
    where:{id:storeId},
    data:{isActive:!store.isActive}
})
return NextResponse.json({message: "store isActive toggled successfully", isActive:!store.isActive  })


}catch(error) {
    console.error(error)
    return NextResponse.json({error:error.code || error.message},{message: "Internal Server Error"}, {status: 500}) 
}
}