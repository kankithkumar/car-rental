/** @type {import('next').NextConfig} */
    const nextConfig = {
      reactStrictMode: true,
      // Add this to allow requests from your Cloud Workstation preview URL
      rewrites: async () => [
          {
              source: '/api/:path*',
              destination: 'http://localhost:3000/api/:path*', // Adjust the destination if your Next.js server is on a different port
          },
      ],
       output: 'standalone', // Might be helpful in containerized environments
    };

    module.exports = nextConfig;
