"use client";

// Math-curve loaders: dependency-free, self-contained (keyframes inline), and
// theme-aware via `currentColor`. Two parametric-motion variants:
//   • "spiro" — nested epicycles; the dot traces an epicycloid/spirograph.
//   • "orbit" — three dots on nested rings at different radii + speeds (harmonic).
// Sized by `size` (px); color inherits from the surrounding text color.

type Variant = "spiro" | "orbit";

/** Animated math-curve loading indicator (spirograph or harmonic-orbit). */
export function MathLoader({
  variant = "spiro",
  size = 40,
  label = "Loading",
}: {
  variant?: Variant;
  size?: number;
  label?: string;
}) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`mlx mlx-${variant}`}
      style={{ width: size, height: size }}
    >
      {variant === "spiro" ? (
        <span className="mlx-arm mlx-a1">
          <span className="mlx-arm mlx-a2">
            <span className="mlx-dot" />
          </span>
        </span>
      ) : (
        <>
          <span className="mlx-ring mlx-r1"><span className="mlx-dot" /></span>
          <span className="mlx-ring mlx-r2"><span className="mlx-dot" /></span>
          <span className="mlx-ring mlx-r3"><span className="mlx-dot" /></span>
        </>
      )}
      <style>{`
        .mlx{position:relative;display:inline-block;color:inherit;vertical-align:middle}
        .mlx-arm,.mlx-ring{position:absolute;inset:0;transform-origin:50% 50%}
        .mlx-dot{position:absolute;border-radius:9999px;background:currentColor}
        /* spiro: two nested arms rotating at different rates -> epicycloid trace */
        .mlx-a1{animation:mlx-spin 1.8s linear infinite}
        .mlx-a2{inset:22%;animation:mlx-spin .7s linear infinite reverse}
        .mlx-spiro .mlx-dot{top:-6%;left:50%;width:20%;height:20%;margin-left:-10%}
        /* orbit: three rings, staggered radii + speeds -> harmonic motion */
        .mlx-orbit .mlx-dot{top:0;left:50%;width:16%;height:16%;margin-left:-8%}
        .mlx-r1{animation:mlx-spin 1.4s linear infinite}
        .mlx-r2{inset:16%;animation:mlx-spin 1s linear infinite reverse}
        .mlx-r3{inset:32%;animation:mlx-spin .6s linear infinite}
        @keyframes mlx-spin{to{transform:rotate(360deg)}}
        @media (prefers-reduced-motion:reduce){
          .mlx-arm,.mlx-ring{animation-duration:6s!important}
        }
      `}</style>
    </span>
  );
}

export default MathLoader;
