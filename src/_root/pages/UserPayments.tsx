import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { Payment } from '@/types';

export default function UserPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);


  useEffect(() => {
    const fetchPayment = async () => {
      const {data: {user}} = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: customer, error } = await supabase
        .from('customers')
        .select('customer_id')
        .eq('customer_email', user.email)
        .single();

      if (error || !customer) return;

      const { data } = await supabase
        .from('payments')
        .select('*, banks(bank_name)')
        .eq('customer_id', customer.customer_id);

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
           {payment.banks?.bank_name && (
            <p><strong>Bank:</strong> {payment.banks.bank_name}</p>
           )}
            <p><strong>Invoice:</strong> {payment.invoice_no}</p>
            <p><strong>Amount Paid:</strong> {payment.amount}</p>
            <p><strong>Payment Mode:</strong> {payment.payment_mode}</p>
            <p><strong>Payment Date:</strong> {payment.payment_date}</p>
          </div>
        ))
      )}
    </div>
  );
}
