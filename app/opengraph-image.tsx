import { ImageResponse } from "next/og";
import { loadPublicPngDataUri } from "@/lib/og-photo";

export const runtime = "nodejs";
export const alt = "BirthdayDrop — Surprise the people you love";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  const logoSrc = await loadPublicPngDataUri("logo.png");

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #2e1065 0%, #6b21a8 40%, #be185d 82%, #f59e0b 100%)",
          color: "white",
          padding: "52px 64px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Top brand bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                background: "rgba(255, 255, 255, 0.95)",
                boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
              }}
            >
              {logoSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoSrc}
                  alt="BirthdayDrop"
                  width={40}
                  height={40}
                  style={{ objectFit: "contain" }}
                />
              ) : (
                <span style={{ fontSize: "30px" }}>🎂</span>
              )}
            </div>
            <span
              style={{
                fontSize: "32px",
                fontWeight: 900,
                letterSpacing: "-0.5px",
              }}
            >
              BirthdayDrop
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255, 255, 255, 0.18)",
              padding: "10px 22px",
              borderRadius: "999px",
              fontSize: "18px",
              fontWeight: 700,
              border: "1px solid rgba(255, 255, 255, 0.3)",
            }}
          >
            <span>✨ Free • No Accounts Needed</span>
          </div>
        </div>

        {/* Center hero copy */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            maxWidth: "960px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "64px",
              fontWeight: 900,
              lineHeight: 1.12,
              letterSpacing: "-1px",
              textShadow: "0 6px 24px rgba(0,0,0,0.3)",
            }}
          >
            Surprise the people you love 🎉
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "26px",
              opacity: 0.92,
              marginTop: "20px",
              lineHeight: 1.4,
              maxWidth: "820px",
            }}
          >
            Collect secret birthday wishes from family, friends &amp; teams,
            then reveal an interactive celebration on their big day.
          </div>
        </div>

        {/* Bottom feature pills */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid rgba(255, 255, 255, 0.22)",
            paddingTop: "22px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontSize: "18px",
              fontWeight: 700,
            }}
          >
            <div
              style={{
                display: "flex",
                background: "rgba(255, 255, 255, 0.16)",
                padding: "8px 18px",
                borderRadius: "999px",
              }}
            >
              💌 Secret Wish Links
            </div>
            <div
              style={{
                display: "flex",
                background: "rgba(255, 255, 255, 0.16)",
                padding: "8px 18px",
                borderRadius: "999px",
              }}
            >
              🎂 Blowable Cake
            </div>
            <div
              style={{
                display: "flex",
                background: "rgba(255, 255, 255, 0.16)",
                padding: "8px 18px",
                borderRadius: "999px",
              }}
            >
              🎵 Custom Music &amp; Party Mode
            </div>
          </div>

          <div
            style={{
              display: "flex",
              background: "rgba(255, 255, 255, 0.95)",
              color: "#6b21a8",
              padding: "10px 24px",
              borderRadius: "999px",
              fontWeight: 900,
              fontSize: "18px",
            }}
          >
            Create a Surprise →
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
