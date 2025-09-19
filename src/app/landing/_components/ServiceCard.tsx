"use client";

import { Card, CardHeader, CardBody, CardFooter } from "@heroui/react";
import React from "react";

type ServiceCardProps = {
    icon: React.ReactNode;
    title: string;
    description: string;
};

export default function ServiceCard({
    icon,
    title,
    description,
}: ServiceCardProps) {
    return (
        <Card className="border-yellow-200 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    {icon}
                </div>
                <p className="text-yellow-600 font-medium">{title}</p>
            </CardHeader>
            <CardBody>
                <CardFooter className="text-center text-gray-700">{description}</CardFooter>
            </CardBody>
        </Card>
    );
}
