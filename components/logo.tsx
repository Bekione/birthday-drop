import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  href?: string;
}

const sizes = {
  sm: { img: 24, text: "text-xl" },
  md: { img: 32, text: "text-2xl" },
  lg: { img: 44, text: "text-3xl" },
};

export function Logo({ size = "md", href = "/" }: LogoProps) {
  const { img, text } = sizes[size];

  const inner = (
    <span className="inline-flex items-center gap-2">
      <Image
        src="/logo.png"
        alt="BirthdayDrop logo"
        width={img}
        height={img}
        className="object-contain drop-shadow-sm"
        priority
      />
      <span
        className={`${text} font-adlam font-bold leading-none text-[#9e73da]`}
      >
        BirthdayDrop
      </span>
    </span>
  );

  if (!href) return <>{inner}</>;

  return (
    <a href={href} className="hover:opacity-80 transition-opacity">
      {inner}
    </a>
  );
}
