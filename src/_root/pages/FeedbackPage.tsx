import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import supabase from "@/lib/supabaseClient"
import { IconStarFilled } from '@tabler/icons-react'
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  useForm,
  Controller,
  SubmitHandler,
  FieldValues,
} from 'react-hook-form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from "@/components/ui/textarea"

interface OrderItem {
  order_item_id: number
  product_id: number
  qty: number
  products: {
    product_title: string
    product_img1: string
  }
}

interface FeedType {
  feedtype_id: number
  feedback_type: string
}

interface FormValues extends FieldValues {
  productFeedbacks: {
    order_item_id: number
    rating: number
    feedtype_id: number
    comment: string
  }[]
  orderRating: number
  orderFeedtype: number
  orderComment: string
}

const FeedbackPage: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { order_id } = location.state || {}

  const [items, setItems] = useState<OrderItem[]>([])
  const [feedTypes, setFeedTypes] = useState<FeedType[]>([])

  const {
    control,
    handleSubmit,
  } = useForm<FormValues>({
    defaultValues: { productFeedbacks: [], orderRating: 0, orderFeedtype: 0, orderComment: '' },
  })

  // Fetch order items
  useEffect(() => {
    if (!order_id) return
    supabase
      .from('order_items')
      .select('order_item_id, product_id, qty, products(product_title, product_img1)')
      .eq('order_id', order_id)
      .then(({ data }) => {
        if (data) {
          const mapped = data.map(item => ({
            order_item_id: item.order_item_id,
            product_id: item.product_id,
            qty: item.qty ?? 1,
            products: Array.isArray(item.products) ? item.products[0] : item.products,
          }))
          setItems(mapped)
        }
      })
  }, [order_id])

  // Fetch feed types
  useEffect(() => {
    supabase
      .from('feedtype')
      .select('feedtype_id, feedback_type')
      .then(({ data }) => data && setFeedTypes(data))
  }, [])

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    // validate:
    if (data.productFeedbacks.some(pf => pf.rating === 0 || !pf.feedtype_id)) {
      toast.error('Please select type and rate all products.')
      return
    }
    if (data.orderRating === 0 || !data.orderFeedtype) {
      toast.error('Please select order type and rating.')
      return
    }

    try {
      // prepare product feedback rows
      const feedbackRows = data.productFeedbacks.map(pf => ({
        order_id,
        order_item_id: pf.order_item_id,
        rating: pf.rating,
        feedtype_id: pf.feedtype_id,
        comment: pf.comment,
      }))
      // insert product feedback
      const { error: prodErr } = await supabase
        .from('feedbacks')
        .insert(feedbackRows)
      if (prodErr) throw prodErr

      // insert overall order feedback
      const { error: orderErr } = await supabase
        .from('feedbacks')
        .insert([
          {
            order_id,
            order_item_id: null,
            rating: data.orderRating,
            feedtype_id: data.orderFeedtype,
            comment: data.orderComment,
          },
        ])
      if (orderErr) throw orderErr

      // mark feedback complete
      await supabase
        .from('orders')
        .update({ feedback_complete: true })
        .eq('order_id', order_id)

      toast.success('Feedback submitted successfully!')
      navigate(-1)
    } catch (err) {
      console.error(err)
      toast.error('Failed to submit feedback.')
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Leave Feedback</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="space-y-6">
          <CardContent>
            <h3 className="text-xl font-medium">Product Feedback</h3>
            {items.map((item, idx) => (
              <div key={item.order_item_id} className="flex items-center space-x-4 mb-4">
                <img
                  src={`/products/${item.products.product_img1}`}
                  alt={item.products.product_title}
                  className="w-16 h-16 rounded"
                />
                <div className="flex-1 space-y-2">
                  <Label>{item.products.product_title}</Label>
                  <div className="flex space-x-2">
                    <Controller
                      name={`productFeedbacks.${idx}.feedtype_id`}
                      control={control}
                      defaultValue={0}
                      render={({ field }) => (
                        <Select onValueChange={val => field.onChange(Number(val))} value={field.value?.toString()}>
                          <SelectTrigger className="w-36">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {feedTypes.map(ft => (
                              <SelectItem key={ft.feedtype_id} value={ft.feedtype_id.toString()}>
                                {ft.feedback_type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <Controller
                      name={`productFeedbacks.${idx}.rating`}
                      control={control}
                      defaultValue={0}
                      render={({ field }) => (
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map(i => (
                            <IconStarFilled
                              key={i}
                              className={`cursor-pointer ${field.value >= i ? 'text-yellow-400' : 'text-gray-300'}`}
                              onClick={() => field.onChange(i)}
                            />
                          ))}
                        </div>
                      )}
                    />
                  </div>
                  <Controller
                    name={`productFeedbacks.${idx}.comment`}
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <Textarea
                        placeholder="Add a comment"
                        className="w-full mt-2"
                        {...field}
                      />
                    )}
                  />                  
                </div>
                {/* Hidden input for order_item_id */}
                <Controller
                  name={`productFeedbacks.${idx}.order_item_id`}
                  control={control}
                  defaultValue={item.order_item_id}
                  render={() => <></>}
                />
              </div>
            ))}
          </CardContent>

          <Separator />

          <CardContent>
            <h3 className="text-xl font-medium">Overall Order Feedback</h3>
            <div className="flex space-x-2 items-center">
              <Controller
                name="orderFeedtype"
                control={control}
                defaultValue={0}
                render={({ field }) => (
                  <Select onValueChange={val => field.onChange(Number(val))} value={field.value?.toString()}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {feedTypes.map(ft => (
                        <SelectItem key={ft.feedtype_id} value={ft.feedtype_id.toString()}>
                          {ft.feedback_type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <Controller
                name="orderRating"
                control={control}
                defaultValue={0}
                render={({ field }) => (
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <IconStarFilled
                        key={i}
                        className={`cursor-pointer ${field.value >= i ? 'text-yellow-400' : 'text-gray-300'}`}
                        onClick={() => field.onChange(i)}
                      />
                    ))}
                  </div>
                )}
              />
            </div>
            <div className="mt-3 space-y-2">
              <Controller
                name="orderComment"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Textarea
                    placeholder="Add an overall comment"
                    className="w-full"
                    {...field}
                  />
                )}
              />
            </div>
          </CardContent>

          <div className="p-4 text-right">
            <Button type="submit">Submit Feedback</Button>
          </div>
        </Card>
      </form>
    </div>
  )
}

export default FeedbackPage
