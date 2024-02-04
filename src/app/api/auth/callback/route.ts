import {createRouteHandlerClient} from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// https://localhost:3000/api/auth/callback ? w/e redirects to dashboard
//check auth-actions actionSignUpUser();

export async function GET(req:NextRequest){
    const requestUrl = new URL(req.url);
    const code = requestUrl.searchParams.get('code');
    
    if(code){
        const supabase = createRouteHandlerClient({cookies});
        await supabase.auth.exchangeCodeForSession(code);
    }

    return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
}