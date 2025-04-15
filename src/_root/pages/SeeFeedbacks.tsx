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
                .select('*, customers(customer_name, customer_email, customer_image), products(product_img1, product_title), feedtype(feedback_type), orders(invoice_no), order_id, product_id, feedtype_id ')

                .order('created_at', { ascending: false});

            if (error) {
                console.error('Failed to fetch Feedbacks', error.message);
                return;
            }
            
            setFeedbacks(feedbackData || []);

        };

        fetchFeedbacks();
    }, []);
  return (
    <div className="container mx-auto space-y-2 px-4">
        <div>
            <h3 className="text-xl font-bold text-gray-700 mb-4 text-center">Feedbacks</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {feedbacks.map((item) => (
                    <Card key={item.feedback_id} className="bg-gray-800 p-4 rounded-lg shadow-md">
                        <CardHeader>
                        <div className="flex relative space-x-2 pb-2">
                            <Avatar className="h-8 w-8 rounded-full">
                                {item.customers?.customer_image ? (
                                    <AvatarImage
                                    src={`https://bggxudsqbvqiefwckren.supabase.co/storage/v1/object/public/media/${item.customers.customer_image}`}
                                    alt={item.customers?.customer_name} />
                                ):(
                                    <AvatarFallback className="rounded-full">NG</AvatarFallback>
                                )}
                            </Avatar>
                            <Label className="text-gray-500">{item.customers?.customer_name}</Label>
                            </div>                            
                            <CardTitle className="text-orange-400 text-center">
                                <Link to={`/products/${item.product_id}`} className="hover:underline">
                                    {item.products?.product_title}
                                </Link>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <img
                             src={`/products/${item.products?.product_img1}`} 
                             alt={item.products?.product_title}
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