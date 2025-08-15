"use client";
import { useState } from "react";
import Image from "next/image";

export default function BadgeModal() {
    const [modal, setModal] = useState<{ open: boolean; content: string }>({ open: false, content: "" });

    return (
        <div
            className={`fixed z-[9999] select-none cursor-pointer transition-all duration-500 ${modal.open && modal.content === "badge" ? "left-1/2 bottom-1/2 translate-x-[-50%] translate-y-[50%] w-[400px] h-[400px]" : "left-8 bottom-8 w-[150px] h-[150px]"}`}
            style={{ pointerEvents: "auto" }}
            onClick={() => setModal(modal.open ? { open: false, content: "" } : { open: true, content: "badge" })}
            aria-label="Show badge large"
        >
            <Image
                src="/badge.png"
                alt="Badge"
                width={modal.open && modal.content === "badge" ? 400 : 150}
                height={modal.open && modal.content === "badge" ? 400 : 150}
                className="rounded-lg transition-all duration-500"
                style={{ boxShadow: "none" }}
                draggable={false}
            />
        </div>
    );
}
