import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import supabase from "@/lib/supabaseClient";
import { Feedback } from "@/types"
import { AvatarImage } from "@radix-ui/react-avatar";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const SeeFeedbacks = () => {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

    useEffect(() => {
        const fetchFeedbacks = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: customerData } = await supabase
                .from('customers')
                .select('customer_id')
                .eq('customer_email', user?.email)
                .single();

            if (!customerData) return;
            
            const {data: feedbackData, error} = await supabase
                .from('feedbacks')
                .select(`
                  feedback_id, order_id, order_item_id, rating, comment, created_at,
                  feedtype:feedtype(feedback_type),
                  order_item:order_items(order_item_id, products(product_id, product_title, product_img1))
                  order:orders(order_id, customer_id, customers(customer_id, customer_name, customer_image))
                `)

                .order('created_at', { ascending: false});

            if (error) {
                console.error('Failed to fetch Feedbacks', error.message);
                return;
            }
            console.log(feedbackData);
            setFeedbacks(feedbackData || []);

        };

        fetchFeedbacks();
    }, []);
  return (
    <div className="container mx-auto space-y-2 px-4">
        <div>
            <h3 className="text-xl font-bold text-gray-700 mb-4 text-center">Feedbacks</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {feedbacks.map((item) => (
                    <Card key={item.feedback_id} className="bg-gray-800 p-4 rounded-lg shadow-md">
                        <CardHeader>
                        <div className="flex justify-between items-center relative space-x-2 pb-2">
                            <p className="px-2 py-1">
                                <Avatar className="h-8 w-8 rounded-full">
                                    {item.orders?.customers?.customer_image ? (
                                        <AvatarImage
                                        src={`https://bggxudsqbvqiefwckren.supabase.co/storage/v1/object/public/media/${item.orders?.customers.customer_image}`}
                                        alt={item.orders?.customers?.customer_name} />
                                    ):(
                                        <AvatarFallback className="rounded-full">NG</AvatarFallback>
                                    )}
                                </Avatar>                                
                            </p>
                            <p className="text-lg font-bold">
                                <Label className="text-gray-500">{item.order_id ? item.orders?.customers?.customer_name: 'N/A'}</Label>
                            </p>
                        </div>                            
                            <CardTitle className="text-orange-400 text-center">
                                <Link to={`/products/${item.order_item_id ? item.order_item?.products?.product_id : 'none'}`} className="hover:underline">
                                    {item.order_item_id ? item.order_item?.products?.product_title : 'Order Review'}
                                </Link>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <img
                             src={`/products/${item.order_item_id ? item.order_item?.products?.product_img1 : null}`} 
                             alt={item.order_item?.products?.product_title}
                             className="w-full h-32 object-contain rounded-md mb-2" 
                            />
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