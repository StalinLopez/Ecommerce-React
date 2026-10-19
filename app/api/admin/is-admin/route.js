
import { NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import authAdmin from "@/middlewares/authAdmin";
// auth admin

export async function GET(request) {
    try {
const {userId} = getAuth(request)
const isAdmin = await authAdmin(userId)
console.log(isAdmin)
if(!isAdmin){
    return NextResponse.json({message: "Unauthorized"}, {status: 401})
}

return NextResponse.json({isAdmin})
    }catch(error) {
        console.error(error)
        return NextResponse.json({error:error.code || error.message},{message: "Internal Server Error"}, {status: 500}) 
    }
}