//It's not storing the order_id in the feedback database table. So I updated the code to this
// FeedbackPage.tsx

'use client'

import { useLocation, useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import supabase from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'

const schema = z.object({
  order_id: z.number(),
  customer_id: z.number(),
  product_id: z.number(),
  feedtype_id:z.coerce.number().optional(),
  rating: z.number().min(1, 'Please rate at least 1 star').max(5),
  comment: z.string().min(3, 'Please leave a meaningful comment'),
})

type FeedbackFormData = z.infer<typeof schema>

export default function FeedbackPage() {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { state } = useLocation()
  const navigate = useNavigate()
  const [feedtypes, setFeedtypes] = useState<{ feedback_type: string; feedtype_id: number }[]>([])

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    // Auto-fill from router state
    if (state?.customer_id && state?.product_id) {
      setValue('customer_id', state.customer_id)
      setValue('product_id', state.product_id)
      setValue('order_id', state.order_id);
    } else {
      toast.error('Missing order data')
      navigate('/my-orders')
    }
  }, [state, navigate, setValue])

  useEffect(() => {
    const fetchFeedtypes = async () => {
      const { data, error } = await supabase.from('feedtype').select('*')
      if (error) return toast.error('Failed to load feedback types')
      setFeedtypes(data || [])
    }
    fetchFeedtypes()
  }, [])

  const onSubmit = async (data: FeedbackFormData) => {
    const { error } = await supabase.from('feedbacks').insert({
      ...data,
    })

    if (error) {
      toast.error('Failed to submit feedback')
    } else {
      toast.success('Thanks for your feedback!')
      navigate('/my-orders')
    }
  }

  useEffect(() => {
    const checkFeedback = async () => {
      if (!state?.order_id || !state?.customer_id) return;
  
      const { data, error } = await supabase
        .from('feedbacks')
        .select('feedback_id')
        .eq('order_id', state.order_id)
        .eq('customer_id', state.customer_id);
  
      if (error) {
        console.error('Error checking feedback:', error.message);
      }
  
      if (data && data.length > 0) {
        setHasSubmitted(true);
      }
    };
  
    checkFeedback();
  }, [state]);



  return (
    <div className="max-w-xl mx-auto p-4">
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-bold">Leave Feedback</h2>
          {hasSubmitted ? (
            <p>You've submitted already</p>
          ): (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input type="hidden" {...register('customer_id')} />
            <Input type="hidden" {...register('product_id')} />
            <Input type="hidden" {...register('order_id')} />

            {/* Feedback Type */}
            <div>
              <Label>Feedback Type</Label>
              <Controller
                name="feedtype_id"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={(value) => field.onChange(Number(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select feedback type" />
                    </SelectTrigger>
                    <SelectContent>
                      {feedtypes.map(ft => (
                        <SelectItem key={ft.feedtype_id} value={String(ft.feedtype_id)}>
                          {ft.feedback_type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.feedtype_id && <p className="text-red-500 text-sm">{errors.feedtype_id.message}</p>}
            </div>

            {/* Star Rating */}
            <div>
              <Label>Rating</Label>
              <Controller
                name="rating"
                control={control}
                render={({ field }) => (
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => field.onChange(star)}
                        className={`text-2xl ${field.value >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                )}
              />
              {errors.rating && <p className="text-red-500 text-sm">{errors.rating.message}</p>}
            </div>

            {/* Comment */}
            <div>
              <Label>Comment</Label>
              <Textarea placeholder="Your feedback..." {...register('comment')} />
              {errors.comment && <p className="text-red-500 text-sm">{errors.comment.message}</p>}
            </div>

            <Button type="submit" className="w-full">Submit Feedback</Button>
          </form>    
          )}

        </CardContent>
      </Card>
    </div>
  )
}


