import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/lesson-content/**": ["./lesson-content/lesson-02/**/*", "./lesson-content/lesson-03/**/*", "./lesson-content/lesson-04/**/*", "./lesson-content/lesson-10/**/*", "./lesson-content/lesson-11/**/*", "./lesson-content/lesson-18/**/*", "./lesson-content/lesson-19/**/*"],
  },
};

export default nextConfig;
