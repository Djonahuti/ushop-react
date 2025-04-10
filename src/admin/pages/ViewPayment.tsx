import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Payment } from '@/types';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

export default function ViewPayment() {
  const [payments, setPayments] = useState<Payment[]>([]);

  const deletePayment = async (paymentId: number) => {
    const { error } = await supabase
        .from('payments')
        .delete()
        .eq('payment_id', paymentId);

    if (error) {
      console.error('Error deleting payment:', error.message);
        toast.error('Failed to delete payment');
    }
    else {
        toast.success('Payment deleted successfully');
        setPayments(payments.filter(payment => payment.payment_id !== paymentId));
    }
};

  useEffect(() => {
    const fetchPayment = async () => {
      const { data } = await supabase
        .from('payments')
        .select('*')

      setPayments(data || []);
    };

    fetchPayment();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Payments</h2>
      {payments.length === 0 ? (
        <p>No payments.</p>
      ) : (
        payments.map(payment => (
          <div key={payment.payment_id} className="border p-3 rounded mb-2">
            <p><strong>Reference NO:</strong> {payment.ref_no}</p>
            <p><strong>Code:</strong> {payment.code}</p>
            <p><strong>Invoice:</strong> {payment.invoice_no}</p>
            <p><strong>Amount Paid:</strong> {payment.amount}</p>
            <p><strong>Payment Mode:</strong> {payment.payment_mode}</p>
            <p><strong>Payment Date:</strong> {payment.payment_date}</p>
            <Button
             onClick={() => deletePayment(payment.payment_id)}
             className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition duration-200">
              <Trash2 />
            </Button>
          </div>
        ))
      )}
    </div>
  );
}
