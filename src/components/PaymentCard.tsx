"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Checkbox,
    CheckboxGroup,
    Chip,
    Divider,
    Form,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Progress,
    Radio,
    RadioGroup,
    Textarea,
    useDisclosure,
} from "@heroui/react"
import { Check, UploadCloud, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

type PaymentCardProps = {
    requiredment?: string
    onComplete?: (data: {
        // Step 1
        bizName: string
        bizType: string
        contactPerson: string
        contactEmail: string
        phone: string
        serviceHours: string
        channels: string[]
        // Step 2
        files: File[]
        // Step 3
        aiName: string
        aiTone: string
        aiWelcome: string
        aiGoodbye: string
        aiTopics: string
        aiLanguage: "th" | "en"
        // Step 4
        paymentMethod: string
        // legacy free text (if passed in)
        requirement: string
    }) => void

    open?: boolean
    onOpenChange?: (open: boolean) => void
    hideTrigger?: boolean
    planTitle?: string
    planPrice?: string
}

export default function PaymentCard({
    requiredment = "",
    onComplete,
    open,
    onOpenChange,
    hideTrigger = false,
    planTitle,
    planPrice,
}: PaymentCardProps) {
    // controlled/uncontrolled modal
    const disc = useDisclosure()
    const isControlled = typeof open === "boolean"
    const isOpen = isControlled ? open! : disc.isOpen
    const setOpen = (v: boolean) => (isControlled ? onOpenChange?.(v) : v ? disc.onOpen() : disc.onClose())
    const handleOpenChange = (v: boolean) => (isControlled ? onOpenChange?.(v) : disc.onOpenChange())
    const router = useRouter()
    // steps
    const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1)

    // Step 1: business info
    const [bizName, setBizName] = useState("")
    const [bizType, setBizType] = useState("")
    const [contactPerson, setContactPerson] = useState("")
    const [contactEmail, setContactEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [serviceHours, setServiceHours] = useState("")
    const [channels, setChannels] = useState<string[]>([])

    // Step 2: knowledge base upload
    const [files, setFiles] = useState<File[]>([])
    const [dragOver, setDragOver] = useState(false)
    const inputRef = useRef<HTMLInputElement | null>(null)

    // Step 3: AI customize
    const [aiName, setAiName] = useState("")
    const [aiTone, setAiTone] = useState("")
    const [aiWelcome, setAiWelcome] = useState("")
    const [aiGoodbye, setAiGoodbye] = useState("")
    const [aiTopics, setAiTopics] = useState("")
    const [aiLanguage, setAiLanguage] = useState<"th" | "en">("th")

    // Step 4: payment method (merged from old flow)
    const [paymentMethod, setPaymentMethod] = useState("")

    // legacy requirement text (if provided)
    const [requirement] = useState(requiredment)

    // stepper meta
    const steps = useMemo(
        () => [
            { number: 1, title: "ข้อมูลธุรกิจ" },
            { number: 2, title: "ตั้งค่าฐานความรู้" },
            { number: 3, title: "ปรับแต่ง AI" },
            { number: 4, title: "ชำระเงิน" },
            { number: 5, title: "เสร็จสิ้น" },
        ],
        []
    )

    // validations
    const canNext = useMemo(() => {
        if (step === 1) return !!(bizName.trim() && bizType.trim() && contactPerson.trim() && contactEmail.trim())
        if (step === 2) return files.length > 0
        if (step === 3) return !!(aiName.trim() && aiWelcome.trim())
        if (step === 4) return paymentMethod.length > 0
        return true
    }, [step, bizName, bizType, contactPerson, contactEmail, files.length, aiName, aiWelcome, paymentMethod])

    const next = () => setStep((s) => (s < 5 ? ((s + 1) as any) : s))
    const back = () => setStep((s) => (s > 1 ? ((s - 1) as any) : s))

    // file handlers
    const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fs = e.target.files ? Array.from(e.target.files) : []
        if (fs.length) setFiles((prev) => [...prev, ...fs])
        e.target.value = ""
    }
    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const fs = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : []
        if (fs.length) setFiles((prev) => [...prev, ...fs])
    }, [])
    const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx))

    // final submit
    const confirmAndSubmit = () => {
        onComplete?.({
            bizName,
            bizType,
            contactPerson,
            contactEmail,
            phone,
            serviceHours,
            channels,
            files,
            aiName,
            aiTone,
            aiWelcome,
            aiGoodbye,
            aiTopics,
            aiLanguage,
            paymentMethod,
            requirement,
        })

        // reset essentials
        setStep(1)
        setBizName("")
        setBizType("")
        setContactPerson("")
        setContactEmail("")
        setPhone("")
        setServiceHours("")
        setChannels([])
        setFiles([])
        setAiName("")
        setAiTone("")
        setAiWelcome("")
        setAiGoodbye("")
        setAiTopics("")
        setAiLanguage("th")
        setPaymentMethod("")
        setOpen(false)
        router.push("/key")
    }

    return (
        <>
            {!hideTrigger && (
                <Button size="lg" onPress={() => setOpen(true)}>
                    เปิดการชำระเงิน
                </Button>
            )}

            <Modal
                isOpen={isOpen}
                onOpenChange={handleOpenChange}
                size="2xl"
                scrollBehavior="outside"
                backdrop="opaque"
                placement="top-center"
            >
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <span className="text-lg font-semibold">ขั้นตอนการสมัครแพ็กเกจ</span>
                                <span className="text-sm text-default-500">กรอกข้อมูลตามขั้นตอน จากนั้นทำการชำระเงิน</span>

                                {(planTitle || planPrice) && (
                                    <div className="mt-2 text-sm text-default-500">
                                        {planTitle && <span className="font-medium">{planTitle}</span>}
                                        {planTitle && planPrice && " • "}
                                        {planPrice && <span>{planPrice}</span>}
                                    </div>
                                )}
                            </ModalHeader>

                            <ModalBody>
                                {/* Stepper (improved) */}
                                <div className="relative py-4 mb-2">
                                    {/* track */}
                                    <div className="absolute left-0 right-0 top-9 h-1 rounded bg-default-200" />

                                    {/* progress (fills under completed part) */}
                                    <div
                                        className="absolute left-0 top-9 h-1 rounded bg-warning-500 transition-all"
                                        style={{
                                            // fill up to *current* step index (0-based), never past 100%
                                            width: `${Math.min((Math.max(step, 1) - 1) / (steps.length - 1), 1) * 100}%`,
                                        }}
                                    />

                                    {/* evenly spaced steps */}
                                    <div className="flex items-start justify-between">
                                        {steps.map((s) => {
                                            const active = step === (s.number as any)
                                            const done = step > (s.number as any)

                                            return (
                                                <div key={s.number} className="flex flex-col items-center w-[20%]">
                                                    {/* Circle button */}
                                                    <Button
                                                        isIconOnly
                                                        radius="full"
                                                        size="sm"
                                                        variant={active ? "solid" : done ? "solid" : "solid"}
                                                        color={done || active ? "warning" : "default"}
                                                        className={[
                                                            "w-10 h-10 text-sm font-semibold",
                                                            active && "ring-2 ring-warning/30",
                                                        ].join(" ")}
                                                        onPress={() => setStep(s.number as any)}
                                                        aria-label={`ไปยังขั้นตอนที่ ${s.number}`}
                                                    >
                                                        {done ? <Check className="w-5 h-5" /> : s.number}
                                                    </Button>

                                                    {/* Label */}
                                                    <span
                                                        className={[
                                                            "mt-2 text-sm text-center truncate max-w-[8.5rem]",
                                                            active || done ? "text-foreground" : "text-default-500",
                                                        ].join(" ")}
                                                    >
                                                        {s.title}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <Divider className="my-2" />


                                {/* STEP CONTENT */}
                                <div className="min-h-[360px] py-2">
                                    {/* 1) Business Info */}
                                    {step === 1 && (
                                        <Card className="p-6">
                                            <Form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Input
                                                    label="ชื่อบริษัท/ร้านค้า"
                                                    placeholder=" "
                                                    variant="bordered"
                                                    radius="lg"
                                                    value={bizName}
                                                    onValueChange={setBizName}
                                                />
                                                <Input
                                                    label="ประเภทธุรกิจ"
                                                    placeholder=" "
                                                    variant="bordered"
                                                    radius="lg"
                                                    value={bizType}
                                                    onValueChange={setBizType}
                                                />
                                                <Input
                                                    label="ผู้ติดต่อหลัก"
                                                    placeholder=" "
                                                    variant="bordered"
                                                    radius="lg"
                                                    value={contactPerson}
                                                    onValueChange={setContactPerson}
                                                />
                                                <Input
                                                    type="email"
                                                    label="อีเมลติดต่อ"
                                                    placeholder=" "
                                                    variant="bordered"
                                                    radius="lg"
                                                    value={contactEmail}
                                                    onValueChange={setContactEmail}
                                                />
                                                <Input
                                                    label="เบอร์โทรศัพท์"
                                                    placeholder=" "
                                                    variant="bordered"
                                                    radius="lg"
                                                    value={phone}
                                                    onValueChange={setPhone}
                                                />
                                                <Input
                                                    label="เวลาทำการ/ช่วงบริการลูกค้า"
                                                    placeholder=" "
                                                    variant="bordered"
                                                    radius="lg"
                                                    value={serviceHours}
                                                    onValueChange={setServiceHours}
                                                />
                                            </Form>

                                            <Form className="mt-6">
                                                <div className="text-sm font-medium mb-2">ช่องทางการติดต่อที่ใช้อยู่</div>
                                                <CheckboxGroup
                                                    value={channels}
                                                    onChange={(vals) => setChannels(vals as string[])}
                                                    orientation="horizontal"
                                                    className="flex flex-wrap gap-3"
                                                >
                                                    {["Line", "Facebook", "Website", "Instagram", "โทรศัพท์", "อีเมล", "หน้าร้าน", "อื่นๆ"].map((c) => (
                                                        <Checkbox key={c} value={c}>
                                                            {c}
                                                        </Checkbox>
                                                    ))}
                                                </CheckboxGroup>
                                            </Form>
                                        </Card>
                                    )}

                                    {/* 2) Knowledge Base Upload */}
                                    {step === 2 && (
                                        <Card className="p-6">
                                            <div className="text-base font-semibold mb-4">ตั้งค่าฐานความรู้</div>

                                            <div
                                                onDragOver={(e) => {
                                                    e.preventDefault()
                                                    setDragOver(true)
                                                }}
                                                onDragLeave={() => setDragOver(false)}
                                                onDrop={onDrop}
                                                className={[
                                                    "rounded-large w-full min-h-[180px] flex items-center justify-center text-center",
                                                    "border-2 border-dashed",
                                                    dragOver ? "border-amber-500 bg-amber-50" : "border-amber-300 bg-amber-50/70",
                                                ].join(" ")}
                                            >
                                                <div className="p-6">
                                                    <UploadCloud className="mx-auto mb-3" />
                                                    <div className="font-semibold">อัปโหลดเอกสาร / FAQ</div>
                                                    <div className="text-sm text-default-500 mt-1">ลากและวางไฟล์ที่นี่ หรือ</div>
                                                    <Button className="mt-3" onPress={() => inputRef.current?.click()}>
                                                        เลือกไฟล์
                                                    </Button>
                                                    <div className="mt-2 text-xs text-default-500">รองรับ: PDF, CSV, DOCX, TXT</div>
                                                    <input
                                                        ref={inputRef}
                                                        type="file"
                                                        multiple
                                                        accept=".pdf,.csv,.doc,.docx,.txt"
                                                        className="hidden"
                                                        onChange={onFileInput}
                                                    />
                                                </div>
                                            </div>

                                            {files.length > 0 && (
                                                <div className="mt-4 space-y-2">
                                                    {files.map((f, i) => (
                                                        <div
                                                            key={`${f.name}-${i}`}
                                                            className="flex items-center justify-between rounded-large border border-default-200 px-3 py-2"
                                                        >
                                                            <div className="text-sm truncate">{f.name}</div>
                                                            <Button isIconOnly size="sm" variant="light" onPress={() => removeFile(i)}>
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </Card>
                                    )}

                                    {/* 3) AI Customize */}
                                    {step === 3 && (
                                        <Card className="p-6">
                                            <CardHeader className="px-0 pb-4">
                                                <span className="text-base font-semibold">ปรับแต่ง AI</span>
                                            </CardHeader>

                                            <CardBody className="px-0 flex flex-col gap-6">

                                                {/* Two-column inputs */}
                                                <Form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <Input
                                                        label="ชื่อ AI"
                                                        placeholder=" "
                                                        variant="bordered"
                                                        value={aiName}
                                                        onValueChange={setAiName}
                                                    />
                                                    <Input
                                                        label="น้ำเสียง (เช่น เป็นกันเอง/มืออาชีพ)"
                                                        placeholder=" "
                                                        variant="bordered"
                                                        value={aiTone}
                                                        onValueChange={setAiTone}
                                                    />
                                                </Form>

                                                {/* Welcome / Goodbye messages */}
                                                <Form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <Textarea
                                                        label="ข้อความต้อนรับ"
                                                        placeholder=" "
                                                        minRows={4}
                                                        variant="bordered"
                                                        value={aiWelcome}
                                                        onValueChange={setAiWelcome}
                                                    />
                                                    <Textarea
                                                        label="ข้อความบอกลา"
                                                        placeholder=" "
                                                        minRows={4}
                                                        variant="bordered"
                                                        value={aiGoodbye}
                                                        onValueChange={setAiGoodbye}
                                                    />
                                                </Form>

                                                {/* Topics */}
                                                <Form>
                                                    <Input
                                                        label="หัวข้อที่เน้นอยากให้ตอบ"
                                                        placeholder="ตัวอย่าง: ราคาสินค้า, วิธีจัดส่ง, นโยบายการคืนสินค้า"
                                                        variant="bordered"
                                                        value={aiTopics}
                                                        onValueChange={setAiTopics}
                                                    />
                                                </Form>

                                                {/* Language Selector */}
                                                <Form>
                                                    <span className="text-sm font-medium text-default-700 mb-2 block">ภาษาที่รองรับ</span>
                                                    <RadioGroup
                                                        orientation="horizontal"
                                                        value={aiLanguage}
                                                        onValueChange={(v) => setAiLanguage(v as "th" | "en")}
                                                        className="gap-3"
                                                    >
                                                        <Radio value="th" color="warning">
                                                            ภาษาไทย
                                                        </Radio>
                                                        <Radio value="en" color="warning">
                                                            ภาษาอังกฤษ
                                                        </Radio>
                                                    </RadioGroup>
                                                </Form>

                                            </CardBody>
                                        </Card>
                                    )}

                                    {/* 4) Payment Method (from old flow) */}
                                    {step === 4 && (
                                        <Card className="p-6">
                                            <div className="text-base font-semibold mb-4">เลือกช่องทางชำระเงิน</div>
                                            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="gap-4" orientation="vertical">
                                                <Card
                                                    isPressable
                                                    onPress={() => setPaymentMethod("credit-card")}
                                                    className={paymentMethod === "credit-card" ? "border-primary ring-2 ring-primary ring-offset-2" : "hover:border-primary/50"}
                                                >
                                                    <CardHeader className="flex items-center gap-4">
                                                        <Radio value="credit-card">Credit Card</Radio>
                                                    </CardHeader>
                                                    <CardBody>
                                                        <p className="text-sm text-default-500">Pay securely with your credit or debit card</p>
                                                    </CardBody>
                                                </Card>

                                                <Card
                                                    isPressable
                                                    onPress={() => setPaymentMethod("paypal")}
                                                    className={paymentMethod === "paypal" ? "border-primary ring-2 ring-primary ring-offset-2" : "hover:border-primary/50"}
                                                >
                                                    <CardHeader className="flex items-center gap-4">
                                                        <Radio value="paypal">PayPal</Radio>
                                                    </CardHeader>
                                                    <CardBody>
                                                        <p className="text-sm text-default-500">Fast and secure payment with PayPal</p>
                                                    </CardBody>
                                                </Card>

                                                <Card
                                                    isPressable
                                                    onPress={() => setPaymentMethod("bank-transfer")}
                                                    className={paymentMethod === "bank-transfer" ? "border-primary ring-2 ring-primary ring-offset-2" : "hover:border-primary/50"}
                                                >
                                                    <CardHeader className="flex items-center gap-4">
                                                        <Radio value="bank-transfer">Bank Transfer</Radio>
                                                    </CardHeader>
                                                    <CardBody>
                                                        <p className="text-sm text-default-500">Direct bank transfer (may take 2–3 business days)</p>
                                                    </CardBody>
                                                </Card>
                                            </RadioGroup>
                                        </Card>
                                    )}

                                    {/* 5) Summary & Pay */}
                                    {step === 5 && (
                                        <Card className="p-6">
                                            <CardHeader className="px-0 pb-4 flex-col items-center text-center">
                                                <div className="text-xl font-semibold">เสร็จสิ้น</div>
                                                <div className="mt-1 text-default-500">โปรดตรวจสอบข้อมูลและชำระค่าบริการ</div>
                                            </CardHeader>

                                            <CardBody className="px-0 space-y-6">
                                                {/* Business Summary */}
                                                <div>
                                                    <div className="font-semibold mb-2">สรุปข้อมูลธุรกิจ</div>
                                                    <Card shadow="none" className="border border-default-200">
                                                        <CardBody className="space-y-2 text-sm">
                                                            <div className="flex justify-between gap-3">
                                                                <span className="text-default-500">ชื่อกิจการ</span>
                                                                <span className="font-medium">{bizName || "-"}</span>
                                                            </div>
                                                            <Divider />
                                                            <div className="flex justify-between gap-3">
                                                                <span className="text-default-500">ประเภทธุรกิจ</span>
                                                                <span className="font-medium">{bizType || "-"}</span>
                                                            </div>
                                                            <Divider />
                                                            <div className="flex justify-between gap-3">
                                                                <span className="text-default-500">ผู้ติดต่อ</span>
                                                                <span className="font-medium">{contactPerson || "-"}</span>
                                                            </div>
                                                            <Divider />
                                                            <div className="flex justify-between gap-3">
                                                                <span className="text-default-500">อีเมล</span>
                                                                <span className="font-medium">{contactEmail || "-"}</span>
                                                            </div>
                                                            <Divider />
                                                            <div className="flex justify-between gap-3">
                                                                <span className="text-default-500">โทรศัพท์</span>
                                                                <span className="font-medium">{phone || "-"}</span>
                                                            </div>
                                                            <Divider />
                                                            <div className="flex justify-between gap-3">
                                                                <span className="text-default-500">เวลาทำการ</span>
                                                                <span className="font-medium">{serviceHours || "-"}</span>
                                                            </div>
                                                            <Divider />
                                                            <div className="flex justify-between gap-3">
                                                                <span className="text-default-500">ช่องทาง</span>
                                                                <span className="font-medium text-right">
                                                                    {channels.length ? channels.join(", ") : "-"}
                                                                </span>
                                                            </div>
                                                        </CardBody>
                                                    </Card>
                                                </div>

                                                {/* AI Summary */}
                                                <div>
                                                    <div className="font-semibold mb-2">สรุปการตั้งค่า AI</div>
                                                    <Card shadow="none" className="border border-default-200">
                                                        <CardBody className="space-y-2 text-sm">
                                                            <div className="flex justify-between gap-3">
                                                                <span className="text-default-500">ชื่อ AI</span>
                                                                <span className="font-medium">{aiName || "-"}</span>
                                                            </div>
                                                            <Divider />
                                                            <div className="flex justify-between gap-3">
                                                                <span className="text-default-500">น้ำเสียง</span>
                                                                <span className="font-medium">{aiTone || "-"}</span>
                                                            </div>
                                                            <Divider />
                                                            <div className="flex justify-between gap-3">
                                                                <span className="text-default-500">ภาษา</span>
                                                                <span className="font-medium">
                                                                    {aiLanguage === "th" ? "ภาษาไทย" : "ภาษาอังกฤษ"}
                                                                </span>
                                                            </div>
                                                            <Divider />
                                                            <div className="flex justify-between gap-3">
                                                                <span className="text-default-500">หัวข้อเน้นตอบ</span>
                                                                <span className="font-medium text-right">{aiTopics || "-"}</span>
                                                            </div>
                                                        </CardBody>
                                                    </Card>
                                                </div>

                                                {/* Payment Method */}
                                                <div>
                                                    <div className="font-semibold mb-2">วิธีชำระเงิน</div>
                                                    <Card shadow="none" className="border border-default-200">
                                                        <CardBody className="text-sm">
                                                            <span className="capitalize">
                                                                {paymentMethod ? paymentMethod.replace("-", " ") : "-"}
                                                            </span>
                                                        </CardBody>
                                                    </Card>
                                                </div>

                                                {/* Extra Requirement (optional) */}
                                                {requirement ? (
                                                    <div>
                                                        <div className="font-semibold mb-2">ข้อมูลเพิ่มเติม</div>
                                                        <Card shadow="none" className="border border-default-200">
                                                            <CardBody>
                                                                <p className="whitespace-pre-wrap text-sm">{requirement}</p>
                                                            </CardBody>
                                                        </Card>
                                                    </div>
                                                ) : null}
                                            </CardBody>
                                        </Card>
                                    )}
                                </div>
                            </ModalBody>

                            <ModalFooter className="items-center justify-between gap-3">
                                {/* Left: step indicator */}
                                <div className="flex items-center gap-3 min-w-0">
                                    <Progress
                                        aria-label="ขั้นตอนการสมัคร"
                                        value={(step / 5) * 100}
                                        className="w-36 sm:w-48"
                                        color="warning"
                                        size="sm"
                                        classNames={{
                                            track: "bg-default-200",
                                        }}
                                    />
                                    <Chip size="sm" variant="flat" color="warning">
                                        ขั้นตอนที่ {step} / 5
                                    </Chip>
                                </div>

                                {/* Right: actions */}
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="flat"
                                        onPress={back}
                                        isDisabled={step <= 1}
                                        size="md"
                                    >
                                        ย้อนกลับ
                                    </Button>

                                    {step < 5 ? (
                                        <Button
                                            color="primary"
                                            onPress={next}
                                            isDisabled={!canNext}
                                            size="md"
                                        >
                                            ถัดไป
                                        </Button>
                                    ) : (
                                        <Button
                                            color="primary"
                                            onPress={confirmAndSubmit}
                                            size="md"
                                        >
                                            ชำระเงิน
                                        </Button>
                                    )}
                                </div>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}
