"use client";

import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-yellow-400 text-black py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 text-center md:text-left">
          {/* Column 1 */}
          <div>
            <h3 className="text-xl font-bold mb-4">อื่นๆ</h3>
            <ul className="space-y-1 text-sm">
              <li>ธุรกิจ SME บริษัท/องค์กรใหญ่</li>
              <li>RICH MENU (ระบบสร้างเมนู)</li>
              <li>ZVENT (กิจกรรมบนออฟไลน์สกรีน)</li>
              <li>ZERVA (ระบบจองออนไลน์)</li>
              <li>ZOZ (ระบบไลฟ์สด)</li>
              <li>ZRMZ (ระบบสะสมแต้ม)</li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="text-xl font-bold mb-4">ติดต่อเรา</h3>
            <p className="text-sm">sales@zwiz.ai</p>
            <p className="text-sm">Tel. (+66)2-821-5535</p>
            <p className="text-sm">Message Us</p>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="text-xl font-bold mb-4">ช่องทางการติดต่อ</h3>
            <div className="flex justify-center md:justify-start gap-4 text-black">
              <a href="#" aria-label="Facebook">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" aria-label="Instagram">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" aria-label="Twitter">
                <Twitter className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Column 4 */}
          <div>
            <h3 className="text-xl font-bold mb-4">ที่อยู่ติดต่อ</h3>
            <p className="text-sm">
              S7 A 104, มหาวิทยาลัยแม่ฟ้าหลวง <br />
              333 หมู่ 1 ต.ท่าสุด อ.เมือง จ.เชียงราย 57100
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
