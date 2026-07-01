"use client";

export default function Crosshair() {
  return (
    <div className="aim-crosshair">
      <div className="aim-crosshair-dot" />
      <div className="aim-crosshair-line aim-crosshair-top" />
      <div className="aim-crosshair-line aim-crosshair-bottom" />
      <div className="aim-crosshair-line aim-crosshair-left" />
      <div className="aim-crosshair-line aim-crosshair-right" />
    </div>
  );
}
