
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.ts";
import imagekit from "@/config/imagekit.js";

export async function POST(req) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const formData = await req.formData();

        const name = formData.get("name");
        const username = formData.get("username");
        const description = formData.get("description");
        const email = formData.get("email");
        const contact = formData.get("contact");
        const address = formData.get("address");
        const image = formData.get("image");

        if (
            !name || !username || !description ||
            !email || !contact || !address ||
            !image || typeof image === "string" ||
            typeof description !== "string"
        ) {
            return NextResponse.json(
                { error: "Missing or invalid required fields" },
                { status: 400 }
            );
        }

        const store = await prisma.store.findFirst({
            where: { userId },
        });

        if (store) {
            return NextResponse.json(
                { status: store.status },
                { status: 200 }
            );
        }

        const normalizedUsername = username.toLowerCase();

        const isUsernameTaken = await prisma.store.findFirst({
            where: { username: normalizedUsername },
        });

        if (isUsernameTaken) {
            return NextResponse.json(
                { error: "Username is already taken" },
                { status: 400 }
            );
        }

        // Upload logo to ImageKit
        const buffer = Buffer.from(await image.arrayBuffer());

        const response = await imagekit.upload({
            file: buffer,
            fileName: image.name,
            folder: "logos",
        });

        const optimizedImage = imagekit.url({
            path: response.filePath,
            transformation: [
                { quality: "auto" },
                { format: "webp" },
                { width: "512" },
            ],
        });

        const newStore = await prisma.store.create({
            data: {
                userId,
                name,
                description,
                username: normalizedUsername,
                email,
                contact,
                address,
                logo: optimizedImage,
            },
        });

        // Link store to user
        await prisma.user.update({
            where: { id: userId },
            data: {
                store: {
                    connect: { id: newStore.id },
                },
            },
        });

        // IMPORTANT: return a response on success
        return NextResponse.json(
            {
                success: true,
                message: "Store created successfully",
                store: newStore,
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Error creating store:", error);

        return NextResponse.json(
            { error: "Failed to create store" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const store = await prisma.store.findFirst({
            where: { userId },
        });

        if (store) {
            return NextResponse.json(
                { status: store.status },
                { status: 200 }
            );
        }

        return NextResponse.json(
            { status: "not registered" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error fetching store:", error);

        return NextResponse.json(
            { error: "Failed to fetch store" },
            { status: 500 }
        );
    }
}
