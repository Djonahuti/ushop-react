import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { apiGet } from "@/lib/api";
import { Feedback } from "@/types"
import { AvatarImage } from "@radix-ui/react-avatar";
import { IconTruckDelivery } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const AllFeedbacks = () => {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

    useEffect(() => {
        const fetchFeedbacks = async () => {            
            const data = await apiGet<any[]>(`/feedbacks.php`)
            const results: Feedback[] = []
            for (const f of (data || [])) {
                const orders = await apiGet<any>(`/orders.php?order_id=${f.order_id}`)
                const customers = await apiGet<any[]>(`/customers.php`)
                const customer = customers.find(c => c.customer_id === orders?.customer_id)
                let order_item = null
                if (f.order_item_id) {
                  order_item = await apiGet<any>(`/order_items.php?order_id=${f.order_id}`)
                  order_item = Array.isArray(order_item) ? order_item.find((oi:any)=>oi.order_item_id===f.order_item_id) : order_item
                  if (order_item) {
                    const p = await apiGet<any>(`/product.php?product_id=${order_item.product_id}`)
                    order_item = { ...order_item, products: { product_id: p?.product_id, product_title: p?.product_title, product_img1: p?.product_img1 } }
                  }
                }
                const feedtype = await apiGet<any[]>(`/feedtype.php`)
                const ft = feedtype.find(x => x.feedtype_id === f.feedtype_id)
                results.push({
                    feedback_id: f.feedback_id,
                    order_id: f.order_id,
                    order_item_id: f.order_item_id,
                    rating: f.rating,
                    comment: f.comment,
                    created_at: f.created_at,
                    feedtype: ft ? { feedback_type: ft.feedback_type, feedtype_id: ft.feedtype_id } : undefined as any,
                    feedtype_id: ft?.feedtype_id,
                    order_item,
                    orders: orders ? { order_id: orders.order_id, customer_id: orders.customer_id, customers: { customer_id: customer?.customer_id, customer_name: customer?.customer_name, customer_image: customer?.customer_image } } : undefined as any,
                    customer_id: customer?.customer_id,
                } as Feedback)
            }
            setFeedbacks(results)
        }
        fetchFeedbacks()
    }, [])
  return (
    <div className="container mx-auto space-y-2 px-4">
        <div>
            <h3 className="text-xl font-bold text-gray-700 mb-4 text-center">Feedbacks</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {feedbacks.map((item) => (
                    <Card key={item.feedback_id} className="bg-gray-800 p-1 rounded-lg shadow-md">
                        <CardHeader>
                        <div className="flex justify-between items-center relative space-x-1 pb-2">
                            <p className="px-2 py-1">
                                <Avatar className="h-8 w-8 rounded-full">
                                    {item.orders?.customers?.customer_image ? (
                                        <AvatarImage
                                        src={`https://bggxudsqbvqiefwckren.supabase.co/storage/v1/object/public/media/${item.orders?.customers.customer_image}`}
                                        alt={item.orders?.customers?.customer_name} />
                                    ):(
                                        <AvatarFallback className="rounded-full">{item.orders?.customers?.customer_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    )}
                                </Avatar>                                
                            </p>
                            <p className="text-lg font-bold">
                                {item.orders?.customers?.customer_name ? (
                                    <Label className="text-gray-500">{item.orders?.customers?.customer_name}</Label>
                                ):(
                                    <Label className="text-gray-500">Anonymous</Label>
                                )}
                            </p>
                        </div>                            
                            <CardTitle className="text-orange-400 text-center">
                                {item.order_item_id ? (
                                <Link to={`/products/${item.order_item?.products?.product_id}`} className="hover:underline">
                                    {item.order_item?.products?.product_title}
                                </Link>
                                ):(
                                    <Label className="text-lg hover:underline">Order Review</Label>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {item.order_item_id ? (
                              <img
                               src={`/products/${item.order_item?.products?.product_img1}`} 
                               alt={item.order_item?.products?.product_title}
                               className="w-full h-32 object-contain rounded-md mb-2" 
                              />
                            ):(
                                <div className="text-center text-orange-400">
                                    <IconTruckDelivery size={40} />
                                </div>
                            )}
                            <div className="text-gray-300">
                                <p className="text-gray-500">{item.feedtype?.feedback_type}</p>
                                <small>{String(item.comment)}</small>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <p className="text-yellow-500 text-xl">
                            {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                            </p>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    </div>
  )
}

export default AllFeedbacks