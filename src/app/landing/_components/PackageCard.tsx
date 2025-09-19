"use client";

import { Card, CardBody, Button, Link } from "@heroui/react";
import React from "react";
import { Check } from "lucide-react";

type PackageCardProps = {
    title: string;
    price: string;
    features?: string[];
    ctaText?: string;
    href?: string;
    note?: string;
    badge?: string;
    icon?: React.ReactNode;
    className?: string;
};

export default function PackageCard({
    title,
    price,
    features = [],
    ctaText = "สมัครเลย",
    href = "#",
    note,
    badge,
    icon,
    className = "",
}: PackageCardProps) {
    return (
        <Card
            className={["h-[519px]", "bg-gray-900 text-white border border-yellow-500/30 shadow-lg", "relative overflow-hidden", className,].join(" ")}>
            <CardBody className="p-6 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold">{title}</h3>
                    {icon ? (
                        <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                            {icon}
                        </div>
                    ) : null}
                </div>

                {/* Divider */}
                <div className="h-1 bg-yellow-500 rounded mb-4" />

                {/* Price */}
                <div className="text-center mb-4">
                    <div className="text-2xl font-extrabold tracking-tight">{price}</div>
                </div>

                {/* Divider เหลือง (บาง) */}
                <div className="h-[2px] bg-yellow-500/70 rounded mb-4" />

                {/* Features */}
                <div className="space-y-2 text-sm text-gray-200 leading-6 flex-1">
                    {features.map((f, i) => (
                        <div key={i} className="flex items-start gap-2">
                            <Check className="w-4 h-4 mt-1 shrink-0 text-yellow-400" />
                            <span className="text-gray-200">{f}</span>
                        </div>
                    ))}

                    {note ? (
                        <div className="mt-3 text-gray-300">
                            <span className="font-semibold">Support:</span> {note}
                        </div>
                    ) : null}
                </div>

                {/* CTA */}
                <div className="mt-6">
                    <Button as={Link} href={href} className="w-full bg-yellow-400 text-gray-900 font-semibold hover:bg-yellow-500" radius="lg" size="lg" >
                        {ctaText}
                    </Button>
                    <Link href={href} className="block text-center mt-3 text-sm text-gray-300 hover:text-yellow-300">
                        รายละเอียดเพิ่มเติม
                    </Link>
                </div>
            </CardBody>
        </Card>
    );
}
