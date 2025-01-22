import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";



const menuItems = [
  {
    title: "MENU",
    items: [
      { icon: "/images/home.png", label: "Dashboard", href: "/verifier/dashboard", visible: ["admin", "teacher", "student", "parent"] },
      { icon: "/images/student.png", label: "Users", href: "/verifier/Users", visible: ["admin", "teacher"] },
      { icon: "/images/parent.png", label: "Approve User", href: "/verifier/ApproveUsers", visible: ["admin", "teacher"] },
      { icon: "/images/subject.png", label: "Copyright", href: "/verifier/Copyrights", visible: ["admin", "teacher", "parent"] },
      { icon: "/images/lesson.png", label: "Reports", href: "/verifier/Reports", visible: ["admin", "teacher"] },
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


const Menu_Verifier = () => {
  const router = useRouter();

  return (
    <div className="mt-4 text-sm">
      {menuItems.map((section) => (
        <div className="flex flex-col gap-2" key={section.title}>
          <span className="hidden lg:block text-gray-400 font-light my-4">
            {section.title}
          </span>
          {section.items.map((item) => (
            <Link
              href={item.href}
              key={item.label}
              passHref
              className={`flex items-center justify-center lg:justify-start gap-4 py-2 md:px-2 rounded-md ${
                router.pathname === item.href
                  ? "bg-gray-700 text-white"
                  : "text-gray-500 hover:bg-lamaSkyLight"
              }`}
            >
              <Image src={item.icon} alt="" width={20} height={20} />
              <span className="hidden lg:block">{item.label}</span>
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Menu_Verifier;

