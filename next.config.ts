import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/lesson-content/**": ["./lesson-content/lesson-18/**/*"],
  },
};

export default nextConfig;
