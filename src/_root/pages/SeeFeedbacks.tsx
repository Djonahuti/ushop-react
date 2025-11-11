import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { apiGet } from "@/lib/api";
import { Feedback } from "@/types"
import { AvatarImage } from "@radix-ui/react-avatar";
import { IconTruckDelivery } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const SeeFeedbacks = () => {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

    useEffect(() => {
        const fetchFeedbacks = async () => {
            const email = localStorage.getItem('auth_email');
            if (!email) return;

            try {
                const customers = await apiGet<any[]>(`/customers.php?email=${encodeURIComponent(email)}`);
                if (!customers || customers.length === 0) return;
                const customerData = customers[0];
            
                const feedbackData = await apiGet<any[]>(`/feedbacks.php?customer_id=${customerData.customer_id}`);
                if (!feedbackData) return;
                
                // Hydrate nested data
                const feedtypes = await apiGet<any[]>('/feedtype.php');
                const orderItems = await apiGet<any[]>('/order_items.php');
                const products = await apiGet<any[]>('/products.php');
                const orders = await apiGet<any[]>('/orders.php');
                const allCustomers = await apiGet<any[]>('/customers.php');
                
                const hydrated = feedbackData.map((item: any) => {
                    const feedtype = feedtypes?.find(ft => ft.feedtype_id === item.feedtype_id);
                    const order_item = orderItems?.find(oi => oi.order_item_id === item.order_item_id);
                    const product = order_item ? products?.find(p => p.product_id === order_item.product_id) : null;
                    const order = orders?.find(o => o.order_id === item.order_id);
                    const customer = order ? allCustomers?.find(c => c.customer_id === order.customer_id) : null;
            
                    return {
                        feedback_id: Number(item.feedback_id),
                        order_id: Number(item.order_id),
                        order_item_id: item.order_item_id !== undefined && item.order_item_id !== null ? Number(item.order_item_id) : null,
                        rating: Number(item.rating),
                        comment: String(item.comment),
                        created_at: String(item.created_at),
                        feedtype: feedtype,
                        feedtype_id: item.feedtype_id,
                        order_item: order_item ? { ...order_item, products: product } : null,
                        orders: order ? { ...order, customers: customer } : null,
                        customer_id: customer?.customer_id ?? null,
                    } as Feedback;
                }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

                setFeedbacks(hydrated);
            } catch (error) {
                console.error('Failed to fetch Feedbacks', error);
            }
        };

        fetchFeedbacks();
    }, []);
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
                                        src={`/${item.orders?.customers.customer_image}`}
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

export default SeeFeedbacks