// import { NextResponse } from 'next/server';
// import jwt from 'jsonwebtoken';
// import { useAuth } from "@/context/auth-context";

// const { user } = useAuth();

// export function middleware(req: any) {

//     try {
//         if (!user) {
//             console.log("No user data found for admin dashboard")
//             return NextResponse.redirect(new URL('/login', req.url));  // Redirect if token verification fails
//         }

//         // Check if the user has the 'admin' role
//         if (user.role !== 'admin') {
//             // If the role is not 'admin', redirect to a restricted access page or login
//             return NextResponse.redirect(new URL('/auth/login', req.url));
//         }
//     } catch (error) {
//         console.error('JWT verification failed:', error);
//         return NextResponse.redirect(new URL('/login', req.url));  // Redirect if token verification fails
//     }

//     // If everything is fine, allow the request to proceed
//     return NextResponse.next();
// }

// export const config = {
//     matcher: ['/admin/dashboard/**'],  // Protect only the /dashboard route and sub-routes
// };
