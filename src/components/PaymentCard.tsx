"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import {
    Button, Card, CardBody, CardHeader, Checkbox, CheckboxGroup, Chip,
    Divider, Form, Input, Modal, ModalBody, ModalContent, ModalFooter,
    ModalHeader, Progress, Radio, RadioGroup, Textarea, useDisclosure
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
        serviceHours: string          // ส่งออกเป็นเวลา HH:MM (24 ชม.)
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
    // Service start time only (HH:MM 24h)
    const [serviceStart, setServiceStart] = useState<string>("")
    const [channels, setChannels] = useState<string[]>([])

    // Step 2: knowledge base upload
    const [files, setFiles] = useState<File[]>([])
    const [dragOver, setDragOver] = useState(false)
    const [fileError, setFileError] = useState<string>("")
    const inputRef = useRef<HTMLInputElement | null>(null)

    // Step 3: AI customize
    const [aiName, setAiName] = useState("")
    const [aiTone, setAiTone] = useState("")
    const [aiWelcome, setAiWelcome] = useState("")
    const [aiGoodbye, setAiGoodbye] = useState("")
    const [aiTopics, setAiTopics] = useState("")
    const [aiLanguage, setAiLanguage] = useState<"th" | "en">("th")

    // Step 4: payment method
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

    // Credit-card states
    const [ccName, setCcName] = useState("");
    const [ccNumber, setCcNumber] = useState("");      // formatted "#### #### #### ####"
    const [ccExpiry, setCcExpiry] = useState("");      // formatted "MM/YY"
    const [ccCvc, setCcCvc] = useState("");            // 3-4 digits
    const [ccAgree, setCcAgree] = useState(false);

    // ===== Touched flags (validate หลังเริ่มกรอก/blur) =====
    const [t1, setT1] = useState({
        bizName: false,
        bizType: false,
        contactPerson: false,
        contactEmail: false,
        phone: false,
        serviceStart: false,
    })
    const [t3, setT3] = useState({
        aiName: false,
        aiTone: false,
        aiWelcome: false,
        aiGoodbye: false,
        aiTopics: false,
    })
    const [t4, setT4] = useState({
        ccNumber: false,
        ccExpiry: false,
        ccCvc: false,
    })

    // ===== Helpers: format & validate =====
    const onlyDigits = (s: string) => s.replace(/\D/g, "")
    const count = (s: string) => s.trim().length

    // Character limits
    const LIM = {
        bizName: { min: 1, max: 100 },
        bizType: { min: 1, max: 100 },
        contactPerson: { min: 1, max: 50 },
        contactEmail: { max: 320 },
        phone: { len: 10 }, // exactly 10 digits
        aiName: { min: 1, max: 50 },
        aiTone: { min: 0, max: 100 },
        aiWelcome: { min: 1, max: 255 },
        aiGoodbye: { min: 0, max: 255 },
        aiTopics: { min: 0, max: 255 },
    } as const

    // Email
    const emailValid = (v: string) => {
        if (!v) return false
        if (v.length > LIM.contactEmail.max) return false
        const re = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
        return re.test(v)
    }

    // Phone: exactly 10 digits
    const phoneValid = (v: string) => onlyDigits(v).length === LIM.phone.len

    // time (HH:MM 24h) — บราวเซอร์จะจัดรูปแบบให้ แต่เราตรวจซ้ำเพื่อความชัดเจน
    const isTime = (v: string) => {
        if (!/^\d{2}:\d{2}$/.test(v)) return false
        const [hh, mm] = v.split(":").map(Number)
        return hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59
    }

    // Credit card
    const luhnValid = (num: string) => {
        const digits = onlyDigits(num);
        if (digits.length < 12) return false;
        let sum = 0, dbl = false;
        for (let i = digits.length - 1; i >= 0; i--) {
            let d = parseInt(digits[i]);
            if (dbl) { d *= 2; if (d > 9) d -= 9; }
            sum += d; dbl = !dbl;
        }
        return sum % 10 === 0;
    };
    const formatCardNumber = (v: string) =>
        onlyDigits(v).slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    const formatExpiry = (v: string) => {
        const d = onlyDigits(v).slice(0, 4);
        if (d.length <= 2) return d;
        const mm = d.slice(0, 2);
        const yy = d.slice(2);
        return `${mm}/${yy}`;
    };
    const expiryValid = (v: string) => {
        const m = v.match(/^(\d{2})\/(\d{2})$/);
        if (!m) return false;
        const mm = parseInt(m[1], 10);
        const yy = parseInt(m[2], 10);
        if (mm < 1 || mm > 12) return false;
        const year = 2000 + yy;
        const now = new Date();
        const exp = new Date(year, mm); // สิ้นเดือนนั้น
        return exp > now;
    };
    const cvcValid = (v: string) => /^\d{3,4}$/.test(v);

    // UI helper
    const cardClass = (m: string) =>
        (paymentMethod === m
            ? "border-primary ring-2 ring-primary ring-offset-2"
            : "hover:border-primary/50") + " cursor-pointer";

    // ===== Error messages =====
    const bizNameErr = useMemo(() => {
        if (count(bizName) < LIM.bizName.min) return "กรุณากรอกชื่อกิจการ"
        if (count(bizName) > LIM.bizName.max) return `ต้องไม่เกิน ${LIM.bizName.max} ตัวอักษร`
        return ""
    }, [bizName])

    const bizTypeErr = useMemo(() => {
        if (count(bizType) < LIM.bizType.min) return "กรุณาระบุประเภทธุรกิจ"
        if (count(bizType) > LIM.bizType.max) return `ต้องไม่เกิน ${LIM.bizType.max} ตัวอักษร`
        return ""
    }, [bizType])

    const contactPersonErr = useMemo(() => {
        if (count(contactPerson) < LIM.contactPerson.min) return "กรุณาระบุผู้ติดต่อ"
        if (count(contactPerson) > LIM.contactPerson.max) return `ต้องไม่เกิน ${LIM.contactPerson.max} ตัวอักษร`
        return ""
    }, [contactPerson])

    const emailErr = useMemo(() => {
        if (!contactEmail.trim()) return "กรุณากรอกอีเมล"
        if (!emailValid(contactEmail)) return "รูปแบบอีเมลไม่ถูกต้อง หรือยาวเกินกำหนด (≤ 320 ตัวอักษร)"
        return ""
    }, [contactEmail])

    const phoneErr = useMemo(() => {
        if (!phone.trim()) return "กรุณากรอกเบอร์โทรศัพท์"
        if (!phoneValid(phone)) return "ต้องเป็นตัวเลข 10 หลัก"
        return ""
    }, [phone])

    const svcStartErr = useMemo(() => {
        if (!serviceStart) return "กรุณาระบุเวลาเริ่มให้บริการ"
        if (!isTime(serviceStart)) return "รูปแบบเวลาไม่ถูกต้อง (HH:MM, 24 ชม.)"
        return ""
    }, [serviceStart])

    const aiNameErr = useMemo(() => {
        if (count(aiName) < LIM.aiName.min) return "กรุณาตั้งชื่อ AI"
        if (count(aiName) > LIM.aiName.max) return `ต้องไม่เกิน ${LIM.aiName.max} ตัวอักษร`
        return ""
    }, [aiName])

    const aiToneErr = useMemo(() => {
        if (count(aiTone) > LIM.aiTone.max) return `ต้องไม่เกิน ${LIM.aiTone.max} ตัวอักษร`
        return ""
    }, [aiTone])

    const aiWelcomeErr = useMemo(() => {
        if (count(aiWelcome) < LIM.aiWelcome.min) return "กรุณากรอกข้อความต้อนรับ"
        if (count(aiWelcome) > LIM.aiWelcome.max) return `ต้องไม่เกิน ${LIM.aiWelcome.max} ตัวอักษร`
        return ""
    }, [aiWelcome])

    const aiGoodbyeErr = useMemo(() => {
        if (count(aiGoodbye) > LIM.aiGoodbye.max) return `ต้องไม่เกิน ${LIM.aiGoodbye.max} ตัวอักษร`
        return ""
    }, [aiGoodbye])

    const aiTopicsErr = useMemo(() => {
        if (count(aiTopics) > LIM.aiTopics.max) return `ต้องไม่เกิน ${LIM.aiTopics.max} ตัวอักษร`
        return ""
    }, [aiTopics])

    // ===== Step-level readiness =====
    const step1Valid =
        !bizNameErr &&
        !bizTypeErr &&
        !contactPersonErr &&
        !emailErr &&
        !phoneErr &&
        !svcStartErr

    const step2Valid = files.length > 0 && !fileError
    const step3Valid = !aiNameErr && !aiToneErr && !aiWelcomeErr && !aiGoodbyeErr && !aiTopicsErr && !!aiLanguage

    // ปุ่มถัดไป: ใช้ "guarded" เพื่อโชว์ error ทั้งสเต็ปเมื่อยังไม่ครบ
    const nextGuarded = () => {
        if (step === 1) {
            if (!step1Valid) {
                setT1({
                    bizName: true, bizType: true, contactPerson: true, contactEmail: true,
                    phone: true, serviceStart: true
                })
                return
            }
        } else if (step === 2) {
            if (!step2Valid) return
        } else if (step === 3) {
            if (!step3Valid) {
                setT3({ aiName: true, aiTone: true, aiWelcome: true, aiGoodbye: true, aiTopics: true })
                return
            }
        } else if (step === 4) {
            if (paymentMethod === "credit-card") {
                const ok = (
                    ccName.trim().length > 2 &&
                    luhnValid(ccNumber) &&
                    expiryValid(ccExpiry) &&
                    cvcValid(ccCvc) &&
                    ccAgree
                )
                if (!ok) {
                    setT4({ ccNumber: true, ccExpiry: true, ccCvc: true })
                    return
                }
            } else if (!paymentMethod) {
                return
            }
        }
        setStep((s) => (s < 5 ? ((s + 1) as any) : s))
    }

    const back = () => setStep((s) => (s > 1 ? ((s - 1) as any) : s))

    // ===== File handlers with validation =====
    const ACCEPTS = [".pdf", ".csv", ".doc", ".docx", ".txt"]
    const MAX_SIZE_MB = 15

    const validateFiles = (incoming: File[]) => {
        for (const f of incoming) {
            const ext = "." + (f.name.split(".").pop() || "").toLowerCase()
            const okType = ACCEPTS.includes(ext)
            const okSize = f.size <= MAX_SIZE_MB * 1024 * 1024
            if (!okType) return `ไฟล์ ${f.name} ไม่รองรับ (อนุญาต: ${ACCEPTS.join(", ")})`
            if (!okSize) return `ไฟล์ ${f.name} มีขนาดเกิน ${MAX_SIZE_MB} MB`
        }
        return ""
    }

    const addFiles = (fs: File[]) => {
        const err = validateFiles(fs)
        setFileError(err)
        if (!err && fs.length) setFiles((prev) => [...prev, ...fs])
    }

    const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fs = e.target.files ? Array.from(e.target.files) : []
        if (fs.length) addFiles(fs)
        e.target.value = ""
    }

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const fs = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : []
        if (fs.length) addFiles(fs)
    }, [])

    const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx))

    // final submit
    const confirmAndSubmit = () => {
        onComplete?.({
            bizName, bizType, contactPerson, contactEmail, phone,
            serviceHours: serviceStart || "",
            channels,
            files, aiName, aiTone, aiWelcome, aiGoodbye, aiTopics, aiLanguage,
            paymentMethod, requirement,
        })
        // reset essentials
        setStep(1)
        setBizName(""); setBizType(""); setContactPerson(""); setContactEmail("")
        setPhone(""); setServiceStart(""); setChannels([])
        setFiles([]); setFileError("")
        setAiName(""); setAiTone(""); setAiWelcome(""); setAiGoodbye(""); setAiTopics(""); setAiLanguage("th")
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
                                {/* Stepper */}
                                <div className="relative py-4 mb-2">
                                    <div className="absolute left-0 right-0 top-9 h-1 rounded bg-default-200" />
                                    <div
                                        className="absolute left-0 top-9 h-1 rounded bg-warning-500 transition-all"
                                        style={{ width: `${Math.min((Math.max(step, 1) - 1) / (steps.length - 1), 1) * 100}%` }}
                                    />
                                    <div className="flex items-start justify-between">
                                        {steps.map((s) => {
                                            const active = step === (s.number as any)
                                            const done = step > (s.number as any)
                                            return (
                                                <div key={s.number} className="flex flex-col items-center w-[20%]">
                                                    <Button
                                                        isIconOnly
                                                        radius="full"
                                                        size="sm"
                                                        variant="solid"
                                                        color={done || active ? "warning" : "default"}
                                                        className={["w-10 h-10 text-sm font-semibold", active && "ring-2 ring-warning/30"].join(" ")}
                                                        onPress={() => setStep(s.number as any)}
                                                        aria-label={`ไปยังขั้นตอนที่ ${s.number}`}
                                                    >
                                                        {done ? <Check className="w-5 h-5" /> : s.number}
                                                    </Button>
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
                                                    onValueChange={(v) => { if (!t1.bizName) setT1(s => ({ ...s, bizName: true })); setBizName(v) }}
                                                    onBlur={() => setT1(s => ({ ...s, bizName: true }))}
                                                    isInvalid={t1.bizName && !!bizNameErr}
                                                    errorMessage={t1.bizName ? bizNameErr : undefined}
                                                    description={`${count(bizName)}/${LIM.bizName.max}`}
                                                />
                                                <Input
                                                    label="ประเภทธุรกิจ"
                                                    placeholder=" "
                                                    variant="bordered"
                                                    radius="lg"
                                                    value={bizType}
                                                    onValueChange={(v) => { if (!t1.bizType) setT1(s => ({ ...s, bizType: true })); setBizType(v) }}
                                                    onBlur={() => setT1(s => ({ ...s, bizType: true }))}
                                                    isInvalid={t1.bizType && !!bizTypeErr}
                                                    errorMessage={t1.bizType ? bizTypeErr : undefined}
                                                    description={`${count(bizType)}/${LIM.bizType.max}`}
                                                />
                                                <Input
                                                    label="ผู้ติดต่อหลัก"
                                                    placeholder=" "
                                                    variant="bordered"
                                                    radius="lg"
                                                    value={contactPerson}
                                                    onValueChange={(v) => { if (!t1.contactPerson) setT1(s => ({ ...s, contactPerson: true })); setContactPerson(v) }}
                                                    onBlur={() => setT1(s => ({ ...s, contactPerson: true }))}
                                                    isInvalid={t1.contactPerson && !!contactPersonErr}
                                                    errorMessage={t1.contactPerson ? contactPersonErr : undefined}
                                                    description={`${count(contactPerson)}/${LIM.contactPerson.max}`}
                                                />
                                                <Input
                                                    type="email"
                                                    label="อีเมลติดต่อ"
                                                    placeholder=" "
                                                    variant="bordered"
                                                    radius="lg"
                                                    value={contactEmail}
                                                    onValueChange={(v) => { if (!t1.contactEmail) setT1(s => ({ ...s, contactEmail: true })); setContactEmail(v) }}
                                                    onBlur={() => setT1(s => ({ ...s, contactEmail: true }))}
                                                    isInvalid={t1.contactEmail && !!emailErr}
                                                    errorMessage={t1.contactEmail ? emailErr : undefined}
                                                    description={`≤ ${LIM.contactEmail.max} ตัวอักษร`}
                                                />
                                                {/* Phone: exactly 10 digits */}
                                                <Input
                                                    label="เบอร์โทรศัพท์"
                                                    placeholder="เช่น 0812345678"
                                                    variant="bordered"
                                                    radius="lg"
                                                    value={phone}
                                                    onValueChange={(v) => { if (!t1.phone) setT1(s => ({ ...s, phone: true })); setPhone(onlyDigits(v).slice(0, 10)) }}
                                                    onBlur={() => setT1(s => ({ ...s, phone: true }))}
                                                    isInvalid={t1.phone && !!phoneErr}
                                                    errorMessage={t1.phone ? (phone ? "ต้องเป็นตัวเลข 10 หลัก" : "กรุณากรอกเบอร์โทรศัพท์") : undefined}
                                                    description="ตัวเลขเท่านั้น 10 หลัก"
                                                />
                                                {/* Service start time only */}
                                                <Input
                                                    type="time"
                                                    label="เวลาเริ่มให้บริการ"
                                                    placeholder=" "
                                                    variant="bordered"
                                                    radius="lg"
                                                    value={serviceStart}
                                                    onValueChange={(v) => { if (!t1.serviceStart) setT1(s => ({ ...s, serviceStart: true })); setServiceStart(v) }}
                                                    onBlur={() => setT1(s => ({ ...s, serviceStart: true }))}
                                                    isInvalid={t1.serviceStart && !!svcStartErr}
                                                    errorMessage={t1.serviceStart ? svcStartErr : undefined}
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
                                                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
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
                                                    <div className="mt-2 text-xs text-default-500">
                                                        รองรับ: PDF, CSV, DOC/DOCX, TXT • สูงสุด 15MB ต่อไฟล์
                                                    </div>
                                                    <input
                                                        ref={inputRef}
                                                        type="file"
                                                        multiple
                                                        accept=".pdf,.csv,.doc,.docx,.txt"
                                                        className="hidden"
                                                        onChange={onFileInput}
                                                    />
                                                    {fileError && <div className="mt-2 text-danger text-sm">{fileError}</div>}
                                                </div>
                                            </div>

                                            {files.length > 0 && (
                                                <div className="mt-4 space-y-2">
                                                    {files.map((f, i) => (
                                                        <div key={`${f.name}-${i}`} className="flex items-center justify-between rounded-large border border-default-200 px-3 py-2">
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
                                                <Form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <Input
                                                        label="ชื่อ AI"
                                                        placeholder=" "
                                                        variant="bordered"
                                                        value={aiName}
                                                        onValueChange={(v) => { if (!t3.aiName) setT3(s => ({ ...s, aiName: true })); setAiName(v) }}
                                                        onBlur={() => setT3(s => ({ ...s, aiName: true }))}
                                                        isInvalid={t3.aiName && !!aiNameErr}
                                                        errorMessage={t3.aiName ? aiNameErr : undefined}
                                                        description={`${count(aiName)}/${LIM.aiName.max}`}
                                                    />
                                                    <Input
                                                        label="น้ำเสียง (เช่น เป็นกันเอง/มืออาชีพ)"
                                                        placeholder=" "
                                                        variant="bordered"
                                                        value={aiTone}
                                                        onValueChange={(v) => { if (!t3.aiTone) setT3(s => ({ ...s, aiTone: true })); setAiTone(v) }}
                                                        onBlur={() => setT3(s => ({ ...s, aiTone: true }))}
                                                        isInvalid={t3.aiTone && !!aiToneErr}
                                                        errorMessage={t3.aiTone ? aiToneErr : undefined}
                                                        description={`${count(aiTone)}/${LIM.aiTone.max}`}
                                                    />
                                                </Form>

                                                <Form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <Textarea
                                                        label="ข้อความต้อนรับ"
                                                        placeholder=" "
                                                        minRows={4}
                                                        variant="bordered"
                                                        value={aiWelcome}
                                                        onValueChange={(v) => { if (!t3.aiWelcome) setT3(s => ({ ...s, aiWelcome: true })); setAiWelcome(v) }}
                                                        onBlur={() => setT3(s => ({ ...s, aiWelcome: true }))}
                                                        isInvalid={t3.aiWelcome && !!aiWelcomeErr}
                                                        errorMessage={t3.aiWelcome ? aiWelcomeErr : undefined}
                                                        description={`${count(aiWelcome)}/${LIM.aiWelcome.max}`}
                                                    />
                                                    <Textarea
                                                        label="ข้อความบอกลา"
                                                        placeholder=" "
                                                        minRows={4}
                                                        variant="bordered"
                                                        value={aiGoodbye}
                                                        onValueChange={(v) => { if (!t3.aiGoodbye) setT3(s => ({ ...s, aiGoodbye: true })); setAiGoodbye(v) }}
                                                        onBlur={() => setT3(s => ({ ...s, aiGoodbye: true }))}
                                                        isInvalid={t3.aiGoodbye && !!aiGoodbyeErr}
                                                        errorMessage={t3.aiGoodbye ? aiGoodbyeErr : undefined}
                                                        description={`${count(aiGoodbye)}/${LIM.aiGoodbye.max}`}
                                                    />
                                                </Form>

                                                <Form>
                                                    <Input
                                                        label="หัวข้อที่เน้นอยากให้ตอบ"
                                                        placeholder="ตัวอย่าง: ราคาสินค้า, วิธีจัดส่ง, นโยบายการคืนสินค้า"
                                                        variant="bordered"
                                                        value={aiTopics}
                                                        onValueChange={(v) => { if (!t3.aiTopics) setT3(s => ({ ...s, aiTopics: true })); setAiTopics(v) }}
                                                        onBlur={() => setT3(s => ({ ...s, aiTopics: true }))}
                                                        isInvalid={t3.aiTopics && !!aiTopicsErr}
                                                        errorMessage={t3.aiTopics ? aiTopicsErr : undefined}
                                                        description={`${count(aiTopics)}/${LIM.aiTopics.max}`}
                                                    />
                                                </Form>

                                                <Form>
                                                    <span className="text-sm font-medium text-default-700 mb-2 block">ภาษาที่รองรับ</span>
                                                    <RadioGroup
                                                        orientation="horizontal"
                                                        value={aiLanguage}
                                                        onValueChange={(v) => setAiLanguage(v as "th" | "en")}
                                                        className="gap-3"
                                                    >
                                                        <Radio value="th" color="warning">ภาษาไทย</Radio>
                                                        <Radio value="en" color="warning">ภาษาอังกฤษ</Radio>
                                                    </RadioGroup>
                                                </Form>
                                            </CardBody>
                                        </Card>
                                    )}

                                    {/* 4) Payment Method */}
                                    {step === 4 && (
                                        <Card className="p-6">
                                            <div className="text-base font-semibold mb-4">เลือกช่องทางชำระเงิน</div>

                                            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="gap-4" orientation="vertical">
                                                {/* Credit Card */}
                                                <Card as="div" onClick={() => setPaymentMethod("credit-card")} className={cardClass("credit-card")}>
                                                    <CardHeader className="flex items-center gap-4">
                                                        <Radio value="credit-card">Credit Card</Radio>
                                                    </CardHeader>

                                                    <CardBody>
                                                        <p className="text-sm text-default-500 mb-4">Pay securely with your credit or debit card</p>

                                                        {paymentMethod === "credit-card" && (
                                                            <div className="rounded-large border border-default-200 p-4 bg-default-50">
                                                                <div className="text-sm font-medium mb-3">กรุณากรอกข้อมูลการชำระเงินของคุณ</div>

                                                                <div className="grid grid-cols-1 gap-3">
                                                                    <Input
                                                                        label="ชื่อ–นามสกุลบนบัตร (Name on card)"
                                                                        placeholder=" "
                                                                        variant="bordered"
                                                                        radius="lg"
                                                                        value={ccName}
                                                                        onValueChange={setCcName}
                                                                    />

                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                        <Input
                                                                            label="Card number"
                                                                            placeholder="1234 5678 9012 3456"
                                                                            variant="bordered"
                                                                            radius="lg"
                                                                            value={ccNumber}
                                                                            onValueChange={(v) => { if (!t4.ccNumber) setT4(s => ({ ...s, ccNumber: true })); setCcNumber(formatCardNumber(v)) }}
                                                                            onBlur={() => setT4(s => ({ ...s, ccNumber: true }))}
                                                                            maxLength={22}
                                                                            isInvalid={t4.ccNumber && !!ccNumber && !luhnValid(ccNumber)}
                                                                            errorMessage={t4.ccNumber && ccNumber && !luhnValid(ccNumber) ? "หมายเลขบัตรไม่ถูกต้อง" : undefined}
                                                                        />

                                                                        <div className="grid grid-cols-2 gap-3">
                                                                            <Input
                                                                                label="MM/YY"
                                                                                placeholder="MM/YY"
                                                                                variant="bordered"
                                                                                radius="lg"
                                                                                value={ccExpiry}
                                                                                onValueChange={(v) => { if (!t4.ccExpiry) setT4(s => ({ ...s, ccExpiry: true })); setCcExpiry(formatExpiry(v)) }}
                                                                                onBlur={() => setT4(s => ({ ...s, ccExpiry: true }))}
                                                                                maxLength={5}
                                                                                isInvalid={t4.ccExpiry && !!ccExpiry && !expiryValid(ccExpiry)}
                                                                                errorMessage={t4.ccExpiry && ccExpiry && !expiryValid(ccExpiry) ? "วันหมดอายุไม่ถูกต้อง" : undefined}
                                                                            />
                                                                            <Input
                                                                                label="CVC"
                                                                                placeholder="123"
                                                                                variant="bordered"
                                                                                radius="lg"
                                                                                value={ccCvc}
                                                                                onValueChange={(v) => { if (!t4.ccCvc) setT4(s => ({ ...s, ccCvc: true })); setCcCvc(onlyDigits(v).slice(0, 4)) }}
                                                                                onBlur={() => setT4(s => ({ ...s, ccCvc: true }))}
                                                                                maxLength={4}
                                                                                isInvalid={t4.ccCvc && !!ccCvc && !cvcValid(ccCvc)}
                                                                                errorMessage={t4.ccCvc && ccCvc && !cvcValid(ccCvc) ? "CVC ไม่ถูกต้อง" : undefined}
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <Checkbox isSelected={ccAgree} onValueChange={setCcAgree} className="mt-1">
                                                                        ฉันยอมรับ ข้อกำหนดและเงื่อนไข และนโยบายความเป็นส่วนตัว
                                                                    </Checkbox>

                                                                    {/* ปุ่มยืนยัน (ยังคงคุมด้วย nextGuarded) */}
                                                                    <div className="flex justify-end">
                                                                        <Button color="warning" onPress={nextGuarded}>
                                                                            ยืนยันการชำระเงิน
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </CardBody>
                                                </Card>

                                                {/* PayPal */}
                                                <Card as="div" onClick={() => setPaymentMethod("paypal")} className={cardClass("paypal")}>
                                                    <CardHeader className="flex items-center gap-4">
                                                        <Radio value="paypal">PayPal</Radio>
                                                    </CardHeader>
                                                    <CardBody>
                                                        <p className="text-sm text-default-500">Fast and secure payment with PayPal</p>
                                                    </CardBody>
                                                </Card>

                                                {/* Bank Transfer */}
                                                <Card as="div" onClick={() => setPaymentMethod("bank-transfer")} className={cardClass("bank-transfer")}>
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
                                            <CardHeader className="px-0 pb-4 flex-col items-center textcenter">
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
                                                                <span className="text-default-500">เวลาเริ่มให้บริการ</span>
                                                                <span className="font-medium text-right">
                                                                    {serviceStart || "-"}
                                                                </span>
                                                            </div>
                                                            <Divider />
                                                            <div className="flex justify-between gap-3">
                                                                <span className="text-default-500">ช่องทาง</span>
                                                                <span className="font-medium text-right">{channels.length ? channels.join(", ") : "-"}</span>
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
                                                                <span className="font-medium">{aiLanguage === "th" ? "ภาษาไทย" : "ภาษาอังกฤษ"}</span>
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
                                        classNames={{ track: "bg-default-200" }}
                                    />
                                    <Chip size="sm" variant="flat" color="warning">
                                        ขั้นตอนที่ {step} / 5
                                    </Chip>
                                </div>

                                {/* Right: actions */}
                                <div className="flex items-center gap-2">
                                    <Button variant="flat" onPress={back} isDisabled={step <= 1} size="md">
                                        ย้อนกลับ
                                    </Button>

                                    {step < 5 ? (
                                        <Button color="primary" onPress={nextGuarded} size="md">
                                            ถัดไป
                                        </Button>
                                    ) : (
                                        <Button color="primary" onPress={confirmAndSubmit} size="md">
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
