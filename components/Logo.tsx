import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { SquareDashedMousePointer } from "lucide-react";



function Logo({ fontSize = "2xl", iconSize = 40 }: {
    fontSize?: string;
    iconSize?: number;
}) {
    return (<Link href="/" className= {cn("text-2xl font-extrabold flex items-center gap-2", 
        fontSize
    )}
    >
        <div className="rounded-xl bg-gradient-to-r from-blue-500 to-yellow-600 p-2">
            <SquareDashedMousePointer size={iconSize}
            className="stroke-green" />
        </div>
        <div>
            <span className="bg-gradient-to-r from-emrald-500 to-emrald-600 bg-clip-text">
                folio
            </span>
        
        <span className="text-stone-700 dark:text-stone-300">
            .ai
        </span>
        </div>
    </Link>
    );
}

export default Logo;