'use client'
import { MessageSquare } from "lucide-react";
import PackageCard from "./_components/PackageCard";
import PaymentCard from "@/components/PaymentCard";
import { useState } from "react";

export default function PackagePage() {
    const [isPayOpen, setIsPayOpen] = useState(false)
    const [selected, setSelected] = useState<{ title: string; price: string } | null>(null)
    const openPayment = (p: { title: string; price: string }) => {
        setSelected({ title: p.title, price: p.price })
        setIsPayOpen(true)
    }

    const packages = [
        {
            icon: <MessageSquare className="w-5 h-5 text-amber-500" />,
            title: "AI Customer Care Package",
            subtitle: "เหมาะสำหรับ SME ที่ต้องการยกระดับงานบริการลูกค้า",
            price: "1,490 THB / month",
            features: [
                "AI แชตบอทหลายภาษา 24 ชั่วโมง ทุกวัน",
                "ระบบตอบคำถามอัตโนมัติจาก FAQs และฐานความรู้",
                "ส่งบทสนทนาให้ทีมงานต่อ พร้อมข้อมูลบริบทครบ",
            ],
            href: "#",
        },
        {
            icon: <MessageSquare className="w-5 h-5 text-amber-500" />,
            title: "AI Sales Booster Package",
            subtitle: "ออกแบบมาสำหรับร้านค้าออนไลน์และผู้ให้บริการ",
            price: "2,490 THB / month",
            features: [
                "AI ผู้ช่วยงานขาย พร้อม Lead Scoring และคำแนะนำการขายต่อยอด",
                "ระบบแนะนำสินค้าที่ปรับให้ตรงกับลูกค้าแต่ละคน",
                "อินทิเกรตกับโซเชียลมีเดียและแพลตฟอร์มอีคอมเมิร์ซ",
            ],
            href: "#",
        },
        {
            icon: <MessageSquare className="w-5 h-5 text-amber-500" />,
            title: "AI Insights Package",
            subtitle: "สำหรับธุรกิจที่ต้องการการตัดสินใจที่ชาญฉลาดยิ่งขึ้น",
            price: "3,490 THB / month",
            features: [
                "แดชบอร์ด AI พร้อมการวิเคราะห์ความรู้สึกของลูกค้า",
                "คาดการณ์เทรนด์และตรวจจับความผิดปกติแบบอัจฉริยะ",
                "สร้างรายงานรายเดือนอัตโนมัติ",
            ],
            href: "#",
        },
        {
            icon: <MessageSquare className="w-5 h-5 text-amber-500" />,
            title: "AI Knowledge Hub Package",
            subtitle: "สำหรับองค์กรที่มี FAQs เอกสาร หรือระบบ CRM จำนวนมาก",
            price: "2,990 THB / month",
            features: [
                "AI ผู้ช่วยฐานความรู้",
                "ค้นหาเอกสารและ FAQs พร้อมแสดงการอ้างอิง",
                "แชตบอทภายในสำหรับการค้นหาข้อมูลของพนักงาน",
            ],
            href: "#",
        },
        {
            icon: <MessageSquare className="w-5 h-5 text-amber-500" />,
            title: "AI Enterprise Suite",
            subtitle: "สำหรับบริษัทที่ต้องการความสามารถด้าน AI แบบครบวงจร",
            price: "15,000 THB / month",
            features: [
                "ครบทุกด้าน: การดูแลลูกค้า, การกระตุ้นยอดขาย, การวิเคราะห์เชิงลึก และคลังความรู้",
                "เชื่อมต่อได้ไม่จำกัดกับระบบต่าง ๆ (CRM, ERP, E-commerce)",
                "การสนับสนุนระดับ SLA, โซลูชัน White-label และผู้จัดการบัญชีดูแลเฉพาะ",
            ],
            href: "#",
        },
        {
            icon: <MessageSquare className="w-5 h-5 text-amber-500" />,
            title: "Customize Package",
            subtitle: "สำหรับธุรกิจที่ต้องการความยืดหยุ่น",
            price: "Custom",
            features: [
                "ปรับแต่งเฉพาะฟีเจอร์ AI ที่ธุรกิจคุณต้องการ",
                "กำหนดปริมาณข้อความได้ยืดหยุ่น ขยายเมื่อไรก็ได้",
                "เชื่อมต่อได้ตามต้องการ (CRM, ERP, E-commerce, โซเชียลมีเดีย ฯลฯ)",
                "รองรับการทำแบรนด์และ White-label Add-on",
            ],
            href: "#",
        },

    ];

    return (
        <div className="min-h-screen">

            {/* Package Grid */}
            <section className="container mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                    เลือกโซลูชัน AI ที่ใช่สำหรับธุรกิจของคุณ
                </h2>

                <div className="mt-5 grid md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                    {packages.map((p, i) => (
                        <PackageCard
                            key={i}
                            title={p.title}
                            price={p.price}
                            features={p.features}
                            icon={p.icon}
                            href={p.href}
                            onAction={() => openPayment(p)}
                        />
                    ))}
                </div>
            </section>
            <PaymentCard
                hideTrigger
                open={isPayOpen}
                onOpenChange={setIsPayOpen}
                requiredment={selected ? `Package: ${selected.title}\nPrice: ${selected.price}\n\nMy requirements:\n` : ""}
                planTitle={selected?.title}
                planPrice={selected?.price}
                onComplete={(data) => {
                    console.log("Payment data:", data)
                }}
            />
        </div>
    )
}