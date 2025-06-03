'use client'

import { JSX, useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { OrderStatusHistory } from '@/types'; // Define this type according to your needs
import { useLocation } from 'react-router-dom';
import { CircleDollarSign, Clock, Handshake, Hourglass, Package, PackageCheck, ShieldCheck, Truck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { IconTruckDelivery } from '@tabler/icons-react';

const OrderStatus = () => {
  const [statusHistory, setStatusHistory] = useState<OrderStatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { order_id } = location.state || {};

  const statusColors: { [key: string]: string } = {
    'Pending': 'bg-gray-400',
    'Paid': 'bg-yellow-400',
    'Payment confirmed': 'bg-green-400',
    'WAITING TO BE SHIPPED': 'bg-blue-300',
    'SHIPPED': 'bg-blue-500',
    'OUT FOR DELIVERY': 'bg-indigo-500',
    'DELIVERED': 'bg-purple-500',
    'COMPLETED': 'bg-emerald-600',
  };

  const statusIcons: { [key: string]: JSX.Element } = {
    'Pending': <Hourglass className="w-4 h-4 text-gray-500 mr-2" />,
    'Paid': <CircleDollarSign className="w-4 h-4 text-yellow-500 mr-2" />,
    'Payment confirmed': <ShieldCheck className="w-4 h-4 text-green-500 mr-2" />,
    'WAITING TO BE SHIPPED': <Package className="w-4 h-4 text-blue-300 mr-2" />,
    'SHIPPED': <Truck className="w-4 h-4 text-blue-500 mr-2" />,
    'OUT FOR DELIVERY': <IconTruckDelivery className="w-4 h-4 text-indigo-500 mr-2" />,
    'DELIVERED': <Handshake className="w-4 h-4 text-purple-500 mr-2" />,
    'COMPLETED': <PackageCheck className="w-4 h-4 text-emerald-600 mr-2" />,
  };
  

  const statusMap: { [key: string]: string } = {
    'Pending': 'Pending',
    'Paid': 'Paid',
    'Payment confirmed': 'Confirmed',
    'WAITING TO BE SHIPPED': 'To Ship',
    'SHIPPED': 'Shipped',
    'OUT FOR DELIVERY': 'Delivery',
    'DELIVERED': 'Arrived',
    'COMPLETED': 'Done',
  };
  

  useEffect(() => {
    const fetchStatusHistory = async () => {
      if (!order_id) return;

      const { data, error } = await supabase
        .from('order_status_history')
        .select('*, orders(invoice_no)')
        .eq('order_id', order_id)
        .order('updated_at', { ascending: true });

      if (error) {
        console.error('Failed to fetch status history:', error.message);
      }

      setLoading(false);
      setStatusHistory(data || []);
    };

    fetchStatusHistory();
  }, [order_id]);

  if (loading){
    return(
      <div className="fixed inset-0 z-50 flex items-center justify-center my-nav">
        <img
          src="/logo/ushop.svg"
          alt="logo"
          className="w-[250px] h-[70px] animate-pulse"
        />
      </div>      
    )
  }  

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-lg font-bold">Order Status History</h2>
      {statusHistory.length === 0 ? (
        <p className="text-center text-muted-foreground">No status updates found.</p>
      ) : (
        <ol className="relative border-l-2 border-gray-300 pl-4">
          {statusHistory.map((history, index) => {
            const status = history.status;
            const color = statusColors[status] || 'bg-gray-500';
            const label = statusMap[status] || status;
            
            return (
              <motion.li
                key={history.id}
                className="mb-10 ml-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >

                <span
                  className={`absolute w-4 h-4 ${color} rounded-full -left-[10px] border-2 border-white`}
                />
                <h3 className="text-md font-semibold text-gray-800 flex items-center">
                  {statusIcons[status]}
                  {label}
                </h3>

                <time className="block mb-1 text-sm text-gray-500">
                  <Clock className="inline w-4 h-4 mr-1" />
                  {formatDistanceToNow(new Date(history.updated_at), { addSuffix: true })}
                </time>
                <p className="text-sm text-muted-foreground">
                  Invoice: <span className="text-blue-600 font-medium">{history.orders?.invoice_no}</span>
                </p>
              </motion.li>
            );
          })}
        </ol>
      )}
    </div>
  );
};

export default OrderStatus;