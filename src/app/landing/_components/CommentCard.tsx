"use client";

import { Card, CardBody } from "@heroui/react";
import React from "react";
import { CheckCircle } from "lucide-react";

type CommentCardProps = {
    tag: string;
    title: string;
    score: string;
    quote: string;
    highlight: string;
};

export default function CommentCard({
    tag,
    title,
    score,
    quote,
    highlight,
}: CommentCardProps) {
    return (
        <Card className="bg-gray-900 text-white rounded-xl p-6 h-[300px] flex flex-col justify-between shadow-lg">
            <CardBody className="flex flex-col gap-4">
                {/* Tag */}
                <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full w-fit">
                    {tag}
                </span>

                {/* Title + Score */}
                <div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="text-yellow-400 font-bold">{score} ⭐</p>
                </div>

                {/* Quote */}
                <p className="text-sm text-gray-200 italic leading-relaxed">
                    “{quote}”
                </p>

                {/* Highlight */}
                <div className="flex items-center gap-2 mt-auto text-yellow-400 text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    <span>{highlight}</span>
                </div>
            </CardBody>
        </Card>
    );
}
