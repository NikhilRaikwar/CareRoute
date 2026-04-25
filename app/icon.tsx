import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#E1F5EE",
          border: "3px solid #1D9E75",
          borderRadius: "14px",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            fontSize: 38,
            lineHeight: 1,
          }}
        >
          🩺
        </div>
      </div>
    ),
    size,
  );
}
