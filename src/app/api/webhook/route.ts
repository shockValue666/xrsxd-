import { manageSubscriptionStatusChange, upsertPriceRecord, upsertProductRecord } from "@/lib/stripe/adminTasks";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import stripe from "stripe";
import Stripe from "stripe";

const relevantEvents = new Set([
    'product.created',
    'product.updated',
    'price.created',
    'price.updated',
    'checkout.session.completed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
  ]);

  export async function POST(request:NextRequest){
    const body = await request.text();
    const sig = headers().get('Stripe-Signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_LIVE ?? process.env.STRIPE_WEBHOOK_SECRET;
    let event:Stripe.Event;

    try {
        if(!sig || !webhookSecret) return;
        event = stripe.webhooks.constructEvent(body,sig,webhookSecret);
    } catch (error) {
        console.log('Error verifying webhook signature: ', error);
        return new NextResponse('Invalid signature', {status:400});
    }
    if(relevantEvents.has(event.type)){
        try {
            switch(event.type){
                case 'product.created':
                case 'product.updated':
                    await upsertProductRecord(event.data.object as Stripe.Product);
                    break;
                case 'price.created':
                case 'price.updated':
                    await upsertPriceRecord(event.data.object as Stripe.Price);
                case 'customer.subscription.created':
                case 'customer.subscription.updated':
                case 'customer.subscription.deleted':
                    const subscription = event.data.object as Stripe.Subscription;
                    await manageSubscriptionStatusChange(subscription.id,subscription.customer as string,event.type === "customer.subscription.created");
                    break;
                case 'checkout.session.completed':
                    const checkoutSession = event.data.object as Stripe.Checkout.Session;
                    if(checkoutSession.mode==="subscription"){
                        const subscriptionId = checkoutSession.subscription;
                        await manageSubscriptionStatusChange(subscriptionId as string,checkoutSession.customer as string,true);
                    }
                    break;
                default:
                    throw new Error('Unhandled event type');
            }
        } catch (error) {
            console.log('Error handling event: ', error);
            return new NextResponse('webhook handler failed', {status:400})
        }
    }
    return NextResponse.json({received:true},{status:200})
  }