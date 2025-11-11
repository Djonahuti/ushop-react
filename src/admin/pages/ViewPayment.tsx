import { useEffect, useState } from 'react';
import { apiGet, apiDelete } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Payment } from '@/types';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

export default function ViewPayment() {
  const [payments, setPayments] = useState<Payment[]>([]);

  const deletePayment = async (paymentId: number) => {
    try {
      await apiDelete('/payments.php', { payment_id: paymentId });
        toast.success('Payment deleted successfully');
        setPayments(payments.filter(payment => payment.payment_id !== paymentId));
    } catch (err) {
      console.error('Error deleting payment:', err);
      toast.error('Failed to delete payment');
    }
};

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const paymentsData = await apiGet<Payment[]>('/payments.php');
        const banks = await apiGet<Array<{ bank_id: number; bank_name: string }>>('/banks.php');
        
        const hydrated = (paymentsData || []).map(p => ({
          ...p,
          banks: banks?.find(b => b.bank_id === p.bank_id),
        }));
        
        setPayments(hydrated);
      } catch (err) {
        console.error('Error fetching payments:', err);
      }
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
           {payment.banks?.bank_name && (
            <p><strong>Bank:</strong> {payment.banks.bank_name}</p>
           )}
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
