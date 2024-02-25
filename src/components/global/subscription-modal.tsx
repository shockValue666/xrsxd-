import { useSubscriptionModal } from '@/lib/providers/subscription-modal-provider';
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';
import { Button } from '../ui/button';
import Loader from './Loader';
import { Price, ProductWithPrice } from '@/lib/supabase/supabase.types';
import { formatPrice, postData } from '@/lib/utils';
import { useToast } from '../ui/use-toast';
import { getStripe } from '@/lib/stripe/stripeClient';



interface SubscriptionModalProps{
  products:ProductWithPrice[];
}

const SubscriptionModal:React.FC<SubscriptionModalProps> = ({products}) => {
    const {open, setOpen} = useSubscriptionModal();
    const {subscription} = useSupabaseUser();
    const [isLoading,setIsLoading] = useState(false);
    const {user} = useSupabaseUser();
    const {toast} = useToast();

    const onClickContinue = async (price:Price) => {
      try {
        setIsLoading(true);
        if(!user) {
          toast({
            title: 'Error',
            description: 'You need to be logged in',
            variant:'destructive'
          })
          setIsLoading(false);
          return;
        }
        if(subscription){
          toast({
            title: 'Error',
            description: 'Already on a paid plan',
          })
          setIsLoading(false);
          return;
        }
        const {sessionId} = await postData({url:'/api/create-checkout-session',data:{price}}) 
        console.log("Getting checkout for Stripe")
        const stripe = await getStripe();
        stripe?.redirectToCheckout({sessionId});

      } catch (error) {
        toast({
          title: 'Oops something went wrong!',
          description: 'error while creating checkout session. Please try again later.',
          variant:'destructive'
        })
      } finally {
        setIsLoading(false);
      }
    }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        {subscription?.status === "active" ? 
        <DialogContent>
            Already on a paid plan  
        </DialogContent>     
         : 
         <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    Upgrade to a Pro Plan
                </DialogTitle>
            </DialogHeader>
            <DialogDescription>
              To access Pro features you need to have a paid plan.
            </DialogDescription>
            {products.length ? products.map(product=>(
              <div className='flex justify-between items-center' key={product.id}>
                {product.prices?.map(price=>(
                  <React.Fragment key={price.id}>
                    <b className='text-3xl text-foreground'>
                      {formatPrice(price)} / <small>{price.interval}</small>
                    </b>
                    <Button onClick={()=>onClickContinue(price)} disabled={isLoading}>
                        {isLoading ? <Loader/> : "Upgrade ✨"}
                    </Button>
                  </React.Fragment>
                ))}
              </div>
            )) : ""}
         </DialogContent>
         }
    </Dialog>   
  )
}

export default SubscriptionModal