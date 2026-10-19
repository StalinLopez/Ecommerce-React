

// get dashboard data for seller
export async function GET(req) {
    try {
        const { userId } = getAuth(req);
        const storeId = await authSeller(userId);

        //get all orders for seller
        const orders = await prisma.order.findMany({where: {storeId }});
        //get all products for seller
        const products = await prisma.product.findMany({where: {storeId }});
        const ratings = await prisma.rating.findMany({
            where: {productId: {in: products.map(product => product.id)}},
            include: {user: true, product: true}
        })
const dashboardData = {
    ratings,
    totalOrders: orders.length,
    totalEarnings:Math.round(orders.reduce((acc, order) => acc + order.total, 0)),
    totalProducts: products.length,
};
return NextResponse.json(dashboardData, { status: 200 });

    }catch (error) {
        console.error("Error in GET /api/store/dashboard:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }   
}