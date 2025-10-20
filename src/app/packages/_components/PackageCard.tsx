"use client";

import { Card, CardBody, Button, Link } from "@heroui/react";
import React from "react";
import { Check } from "lucide-react";

type PackageCardProps = {
    title: string;
    price: string;
    subtitle?: string;
    features?: string[];
    ctaText?: string;
    href?: string;
    note?: string;
    badge?: string;
    icon?: React.ReactNode;
    className?: string;
    onAction?: () => void;
};

export default function PackageCard({
    title,
    price,
    subtitle,
    features = [],
    ctaText = "ใช้เลย",
    href = "#",
    note,
    badge,
    icon,
    className = "",
    onAction,
}: PackageCardProps) {
    const [priceMain, priceUnit] = price.includes("/")
        ? [price.split("/")[0].trim(), price.split("/")[1].trim()]
        : [price.trim(), ""];

    return (
        <Card
            className={[
                "bg-white text-gray-900 border border-gray-200 shadow-[0_10px_25px_rgba(0,0,0,0.06)]",
                "rounded-2xl overflow-hidden relative",
                className,
            ].join(" ")}
        >
            {/* Badge (top-right) */}
            {badge ? (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-black shadow">
                    {badge}
                </div>
            ) : null}

            <CardBody className="p-6 flex flex-col gap-4">
                {/* Header + optional icon */}
                <div className="flex items-start gap-3">
                    {icon ? (
                        <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                            {icon}
                        </div>
                    ) : null}
                    <div>
                        <h3 className="text-lg font-extrabold leading-snug">{title}</h3>
                        {subtitle ? <p className="text-sm text-gray-600">{subtitle}</p> : null}
                    </div>
                </div>

                {/* Price */}
                <div>
                    <div className="text-3xl font-black tracking-tight">
                        {priceMain}
                    </div>
                    {priceUnit ? <div className="text-sm text-gray-600">/ {priceUnit}</div> : null}
                </div>

                {/* Features */}
                <div className="mt-1 space-y-3">
                    {features.map((f, i) => (
                        <div key={i} className="flex items-start gap-2">
                            <span className="mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                            </span>
                            <span className="text-sm text-gray-800">{f}</span>
                        </div>
                    ))}

                    {note ? (
                        <div className="text-sm text-gray-700">
                            <span className="font-semibold">Support: </span>
                            {note}
                        </div>
                    ) : null}
                </div>

                {/* CTA */}
                <div className="mt-2">
                    {onAction ? (
                        <Button
                            radius="lg"
                            size="lg"
                            className="w-full font-semibold text-gray-900 bg-gradient-to-r from-amber-300 to-orange-400 shadow-md hover:brightness-105 active:brightness-95"
                            onPress={onAction}
                        >
                            {ctaText}
                        </Button>
                    ) : (
                        <Button
                            as={Link}
                            href={href}
                            radius="lg"
                            size="lg"
                            className="w-full font-semibold text-gray-900 bg-gradient-to-r from-amber-300 to-orange-400 shadow-md hover:brightness-105 active:brightness-95"
                        >
                            {ctaText}
                        </Button>
                    )}
                </div>
            </CardBody>
        </Card>
    );
}
