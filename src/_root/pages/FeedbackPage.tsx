import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { apiGet, apiPost } from "@/lib/api"
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
    ;(async () => {
      const oi = await apiGet<any[]>(`/order_items.php?order_id=${order_id}`)
      if (!oi) return;
      const results: OrderItem[] = []
      for (const it of oi) {
        const p = await apiGet<any>(`/product.php?product_id=${it.product_id}`)
        results.push({
          order_item_id: it.order_item_id,
          product_id: it.product_id,
          qty: it.qty ?? 1,
          products: { product_title: p?.product_title, product_img1: p?.product_img1 },
        })
      }
      setItems(results)
    })()
  }, [order_id])

  // Fetch feed types
  useEffect(() => {
    ;(async () => {
      const data = await apiGet<FeedType[]>(`/feedtype.php`)
      setFeedTypes(data || [])
    })()
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
      await apiPost('/feedbacks.php', feedbackRows[0])
      for (let i = 1; i < feedbackRows.length; i++) {
        await apiPost('/feedbacks.php', feedbackRows[i])
      }

      // Update product ratings in products table
      for (const pf of data.productFeedbacks) {
        // Get the product_id from the corresponding order_item
        const orderItem = items.find(item => item.order_item_id === pf.order_item_id)
        if (!orderItem) continue
      
        const product_id = orderItem.product_id
        
        // Get all ratings for this product by looking up all order_item_ids related to it
        const relatedOrderItemIds = items
          .filter(item => item.product_id === product_id)
          .map(item => item.order_item_id)

        // Recalculate average rating for the product
        const all = await apiGet<any[]>(`/feedbacks.php?order_id=${order_id}`)
        const ratings = (all || []).filter(r => relatedOrderItemIds.includes(r.order_item_id)).map(r => ({ rating: r.rating }))
        if (!ratings.length) continue
      
        const avgRating = Math.round(
          ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length
        )
      
        // Update the product's rating
        await fetch(`${window.location.origin}/api/product_update_rating.php?product_id=${product_id}&rating=${avgRating}`, { method: 'POST' })
      }


      // insert overall order feedback
      await apiPost('/feedbacks.php', {
            order_id,
            order_item_id: null,
            rating: data.orderRating,
            feedtype_id: data.orderFeedtype,
            comment: data.orderComment,
      })

      // mark feedback complete
      await fetch(`${window.location.origin}/api/orders_update.php?order_id=${order_id}&feedback_complete=1`, { method: 'POST' })

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
