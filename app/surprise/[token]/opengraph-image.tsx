import { ImageResponse } from "next/og";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const alt = "Happy Birthday Surprise — BirthdayDrop";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const event = await db.event.findUnique({
    where: { surpriseToken: token },
    select: {
      personName: true,
      personPhotoUrl: true,
      birthDate: true,
    },
  });

  const personName = event?.personName || "Birthday Star";
  const birthDate = event?.birthDate || "";
  const photoUrl = event?.personPhotoUrl;

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
          background: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 35%, #9d174d 75%, #d97706 100%)",
          color: "white",
          padding: "50px 60px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Top bar pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "rgba(255, 255, 255, 0.18)",
            padding: "8px 24px",
            borderRadius: "999px",
            fontSize: "20px",
            fontWeight: 700,
            border: "1px solid rgba(255, 255, 255, 0.3)",
          }}
        >
          <span>🎉</span>
          <span>The Birthday Surprise Reveal</span>
        </div>

        {/* Center content */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: "40px",
            width: "100%",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "180px",
              height: "180px",
              borderRadius: "999px",
              border: "6px solid #fbbf24",
              background: "rgba(255, 255, 255, 0.15)",
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            }}
          >
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoUrl}
                alt={personName}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <span style={{ fontSize: "80px" }}>🎂</span>
            )}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: "680px",
            }}
          >
            <div
              style={{
                fontSize: "56px",
                fontWeight: 900,
                lineHeight: 1.15,
                textShadow: "0 4px 20px rgba(0,0,0,0.3)",
              }}
            >
              Happy Birthday, {personName}!
            </div>
            <div
              style={{
                fontSize: "24px",
                opacity: 0.92,
                marginTop: "14px",
                lineHeight: 1.35,
              }}
            >
              {birthDate
                ? `A special surprise reveal for ${birthDate} with all your birthday wishes!`
                : "A special surprise reveal with all your birthday wishes!"}
            </div>
          </div>
        </div>

        {/* Bottom footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            fontSize: "18px",
            opacity: 0.85,
            borderTop: "1px solid rgba(255, 255, 255, 0.2)",
            paddingTop: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700 }}>
            <span>⚡</span>
            <span>BirthdayDrop</span>
          </div>
          <div
            style={{
              background: "rgba(255, 255, 255, 0.22)",
              padding: "6px 18px",
              borderRadius: "999px",
              fontWeight: 800,
              fontSize: "16px",
            }}
          >
            Open to reveal the magic ✨
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}

