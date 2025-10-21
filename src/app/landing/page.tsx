"use client";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import {
  ArrowRight,
  MessageSquare,
  Target,
  Zap,
  BarChart3,
  Users,
} from "lucide-react";
import ServiceCard from "./_components/ServiceCard";
import PackageCard from "./_components/PackageCard";
import CommentCard from "./_components/CommentCard";
import Footer from "./_components/Footer";
import Link from "next/link";

export default function Landing() {
  const services = [
    {
      icon: <MessageSquare className="w-6 h-6 text-white" />,
      title: "ระบบบริการลูกค้าอัจฉริยะด้วย AI",
      describe: "การเชื่อมต่อแชตบอทหลายภาษา 24 ชั่วโมง ทุกวัน",
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-white" />,
      title: "ผู้ช่วยงานขายอัจฉริยะด้วย AI",
      describe: "การให้คะแนนลีด การขายต่อยอด และการแนะนำแบบส่วนบุคคล",
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-white" />,
      title: "บอทวิเคราะห์ข้อมูลด้วย",
      describe: "แดชบอร์ดเรียลไทม์ การวิเคราะห์ความรู้สึก และการคาดการณ์",
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-white" />,
      title: "ผู้ช่วยฐานความรู้อัจฉริยะด้วย AI",
      describe: "การเชื่อมต่อแชตบอทหลายภาษา 24 ชั่วโมง ทุกวัน",
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-white" />,
      title: "บริการบูรณาการและส่วนเสริม",
      describe: "การเชื่อมต่อแชตบอทหลายภาษา 24 ชั่วโมง ทุกวัน",
    },
  ];

  const packages = [
    {
      icon: <MessageSquare className="w-5 h-5 text-yellow-400" />,
      title: "ทดลอง",
      price: "Free",
      features: [
        "1 AI Agent channel (Web)",
        "500 ข้อความ/เดือน",
        "Basic analytics",
      ],
      note: "Email support",
      href: "/packages",
    },
    {
      icon: <Target className="w-5 h-5 text-yellow-400" />,
      title: "เริ่มต้น",
      price: "1,990 THB / เดือน",
      features: [
        "สูงสุด 3 ช่องทาง (LINE, FB, Web)",
        "5,000 ข้อความ/เดือน",
        "Dashboard analytics (รายงานพื้นฐาน)",
        "เชื่อมต่อระบบพื้นฐาน (CRM หรือ E-commerce 1 ระบบ)",
      ],
      note: "Email + Chat support",
      badge: "แนะนำ",
      href: "/packages",
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-yellow-400" />,
      title: "พรีเมี่ยม",
      price: "4,990 THB / เดือน",
      features: [
        "สูงสุด 5 ช่องทาง",
        "20,000 ข้อความ/เดือน",
        "Advanced analytics & forecasting",
        "เชื่อมต่อหลายระบบ (CRM + E-commerce)",
        "Custom knowledge base",
      ],
      note: "Priority support",
      href: "/packages",
    },
    {
      icon: <Users className="w-5 h-5 text-yellow-400" />,
      title: "เอนเตอร์ไพรส์",
      price: "15,000 THB / เดือน",
      features: [
        "ไม่จำกัดช่องทาง",
        "ปริมาณข้อความตามสัญญา",
        "SLA & Dedicated environment",
        "SSO/SCIM, RBAC, Audit logs",
        "ปรับแต่ง Workflow/Agent ขั้นสูง",
      ],
      note: "Dedicated support",
      href: "/packages",
    },
  ];

  const comments = [
    {
      tag: "E-commerce",
      title: "EiX2 Indian Tech Support",
      score: "10/10",
      quote:
        "ลดเวลาทำงานไปได้เยอะกว่า 40% เลยนะ 10 คะแนนเต็ม 10 คะแนนเต็ม 10 คะแนนเต็ม!!!",
      highlight: "Reduce work time by more than 40%.",
    },
    {
      tag: "Retail",
      title: "XYZ Group",
      score: "9/10",
      quote: "ช่วยให้ทีมขายปิดการขายได้เร็วขึ้นและลูกค้าพึงพอใจมากขึ้น",
      highlight: "Faster sales cycle.",
    },
  ];

  return (
    <div className="min-h-screen  bg-gradient-to-r from-amber-50 via-stone-50 to-amber-500">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 px-10 gap-8 sm:gap-10 lg:gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                ขับเคลื่อนธุรกิจด้วย
              </h1>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-yellow-500 leading-tight">
                เอเจนต์อัจฉริยะ!
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                ผู้นำการให้บริการ AI Agent-as-a-Service ในเอเชียตะวันออกเฉียงใต้
                ที่ช่วยให้องค์กรใช้ศักยภาพของ AI
                ในการสร้างคุณค่าและขับเคลื่อนธุรกิจสู่ความยั่งยืน
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link href="/chat">
                  <Button
                    size="lg"
                    className="bg-yellow-400 hover:bg-yellow-500 text-white w-full sm:w-auto px-6 sm:px-8 py-3 text-base sm:text-lg"
                  >
                    ทดลองใช้งานฟรี
                  </Button>
                </Link>
              </div>
              <p className="text-xs sm:text-sm text-gray-500">
                หรือ{" "}
                <span className="text-yellow-600 font-medium">
                  ทดลองใช้งานกับข้อมูลของคุณ
                </span>{" "}
                ฟรี!
              </p>
            </div>

            {/* Image Content */}
            <div className="relative order-first lg:order-last mt-8 lg:mt-0">
              <div className="relative  z-10">
                <img
                  src="https://media.tenor.com/lNU6yC7KEWAAAAAM/cat.gif"
                  alt="Zeus AI Mobile App"
                  className="mx-auto w-full rounded-xl max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl h-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="min-h-dvh flex items-center  bg-white" id="services">
        <div className="container mx-auto px-4 py-7">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">
            ศักยภาพ AI
          </h1>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
            ขับเคลื่อนธุรกิจด้วยเอเจนต์อัจฉริยะที่ทำงานได้ไม่มีหยุด
            เพื่อยกระดับการดำเนินงานของคุณ
          </h2>

          {/* Grid 3 cards */}
          <div className="grid md:grid-cols-3  gap-6 mb-8">
            {services.slice(0, 3).map((srv, idx) => (
              <ServiceCard
                key={idx}
                icon={srv.icon}
                title={srv.title}
                description={srv.describe}
              />
            ))}
          </div>

          {/* Additional Services */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {services.slice(3).map((srv, idx) => (
              <ServiceCard
                key={idx}
                icon={srv.icon}
                title={srv.title}
                description={srv.describe}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="min-h-dvh flex items-center bg-yellow-50" id="usage">
        <div className="container mx-auto px-4">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 py-4">
                ZEUS.AI
              </h2>
              <p className="text-xl text-gray-600">
                ช่วยให้ทุกคนสามารถเติบการขายของคุณ
              </p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">
                ง่ายขึ้น
              </p>
            </div>

            <div className="relative max-w-4xl mx-auto">
              {/* Workflow diagram */}
              <div className="grid md:grid-cols-4 gap-8 items-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 ">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Engage</h3>
                  <p className="text-sm text-gray-600">
                    ปฏิสัมพันธ์กับลูกค้า ให้ความรู้เกี่ยวกับสินค้า
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Attract</h3>
                  <p className="text-sm text-gray-600">
                    ดึงดูดลูกค้า ให้สนใจสินค้าของเรา
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Convert</h3>
                  <p className="text-sm text-gray-600">
                    เปลี่ยนลูกค้าให้เป็นคนซื้อ แปลงยอดขายให้เพิ่มขึ้น
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 ">
                    <Zap className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Retarget</h3>
                  <p className="text-sm text-gray-600 py-4">
                    หาลูกค้าเก่า กลับมาซื้อสินค้าใหม่
                  </p>
                </div>
              </div>

              {/* Connecting arrows */}
              <div className="hidden md:block absolute top-10 left-1/4 right-1/4">
                <div className="flex justify-between items-center h-1">
                  <ArrowRight className="text-yellow-400" />
                  <ArrowRight className="text-yellow-400" />
                  <ArrowRight className="text-yellow-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Package Grid */}
  {/* Package Grid */}
      <section className="container mx-auto px-4 py-10 sm:py-12 md:py-16" id="packages">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8 md:text-3xl md:mb-12">
          ราคาแพ็กเกจ
        </h2>

        {/* Responsive Grid for Packages */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((p, i) => (
            <PackageCard
              key={i}
              title={p.title}
              price={p.price}
              features={p.features}
              note={p.note}
              badge={p.badge}
              icon={p.icon}
              href={p.href}
            />
          ))}
        </div>

        <div className="mt-8 w-full max-w-6xl mx-auto">
          <Link href="/packages">
            <Button className="w-full bg-yellow-400 font-bold">ดูแพ็กเกจอื่นๆ</Button>
          </Link>
        </div>
      </section>

      {/* Comment Grid */}
      <section className="container mx-auto px-4 py-10 sm:py-12 md:py-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-4 md:text-3xl">
          คอมเมนท์จากผู้ใช้งานจริง
        </h2>
        <p className="text-md text-center text-gray-700 mb-8 md:text-xl md:mb-12">
          มาดูกันว่าองค์กรทั่วเอเชียตะวันออกเฉียงใต้กำลังพลิกโฉมธุรกิจด้วย
          Zeus.AI อย่างไร
        </p>

        {/* Responsive Grid for Comments */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {comments.map((c, i) => (
            <CommentCard
              key={i}
              tag={c.tag}
              title={c.title}
              score={c.score}
              quote={c.quote}
              highlight={c.highlight}
            />
          ))}
        </div>

        {/* Responsive Call-to-Action Card */}
        <div className="mt-12 w-full">
          <Card className="bg-gray-900 p-6 sm:p-8">
            <CardHeader className="flex-col items-center">
              <h2 className="text-xl font-bold text-center text-white mb-4 md:text-2xl">
                พร้อมยกระดับธุรกิจของคุณหรือยัง?
              </h2>
              <p className="text-lg font-normal text-center text-gray-300 mb-6 md:text-xl md:mb-8">
                ธุรกิจนับพันได้เลือกใช้ Zeus.AI
                เพื่อสร้างประสบการณ์ลูกค้าที่โดดเด่น
              </p>
            </CardHeader>
            <CardBody>
              <Link href="/chat" className="block w-full max-w-xs mx-auto">
                <Button className="w-full bg-yellow-400 font-bold">ทดลองใช้งานฟรี</Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <div id="contracts">
        <Footer />
      </div>
    </div>
  );
}
