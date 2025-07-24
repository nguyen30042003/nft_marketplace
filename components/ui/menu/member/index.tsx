import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";


    
const menuItems = [
  {
    title: "MENU",
    items: [
      { icon: "/images/icon/home (1).png", label: "Dashboard", href: "/member/dashboard", visible: ["admin", "teacher", "student", "parent"] },
      { icon: "/images/icon/paper.png", label: "Copyright", href: "/member/Copyrights", visible: ["admin", "teacher", "parent"] },
      { icon: "/images/icon/data-transfer.png", label: "Transfer Copyright", href: "/member/Transfer", visible: ["admin", "teacher", "parent"] },
      { icon: "/images/icon/bar-chart.png", label: "Reports", href: "/member/Reports", visible: ["admin", "teacher"] },
    ],
  },
  {
    title: "OTHER",
    items: [
      { icon: "/images/profile.png", label: "Profile", href: "/profile", visible: ["admin", "teacher", "student", "parent"] },
      { icon: "/images/setting.png", label: "Settings", href: "/settings", visible: ["admin", "teacher", "student", "parent"] },
      { icon: "/images/logout.png", label: "Logout", href: "/logout", visible: ["admin", "teacher", "student", "parent"] },
    ],
  },
];


const Menu_Member = () => {
  const router = useRouter();

  return (
    <div className="mt-8">
      {menuItems.map((section) => (
        <div className="flex flex-col gap-2" key={section.title}>
          <span className="hidden lg:block text-gray-400 font-bold text-base my-4">
            {section.title}
          </span>

          {section.items.map((item) => (
            <Link
              href={item.href}
              key={item.label}
              passHref
              className={`flex items-center justify-center lg:justify-start gap-4 py-2 md:px-2 rounded-md ${router.pathname === item.href
                  ? "bg-gray-700 text-white"
                  : "text-gray-500 hover:bg-lamaSkyLight"
                }`}
            >
              {/* Increase icon size here */}
              <Image src={item.icon} alt="" width={28} height={28} />

              {/* Make text visible, bold, and larger */}
              <span className="hidden lg:block font-bold text-base">{item.label}</span>
            </Link>

          ))}
        </div>
      ))}
    </div>
  );
};

export default Menu_Member;

