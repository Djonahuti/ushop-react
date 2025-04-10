import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useParams } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import supabase from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  invoice_no: z.string().min(12),
  amount: z.string().min(1),
  ref_no: z.string().min(5),
  bank: z.string().nonempty('Select a bank'),
});

export default function ConfirmPay() {
  const [isPending, setIsPending] = useState(false);
  const { invoiceNo } = useParams();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invoice_no: invoiceNo || '',
      amount: '',
      ref_no: '',
      bank: '',
    },
  });

  const [banks, setBanks] = useState<{ bank_name: string }[]>([]);

  useEffect(() => {
    const loadBanks = async () => {
      const { data } = await supabase.from('banks').select('*');
      setBanks(data || []);
    };
    loadBanks();
  }, []);  

  const onSubmit = async (values: { invoice_no: string; amount: string; ref_no: string; bank: string }) => {
    setIsPending(true);
    const { invoice_no, amount, ref_no } = values;

    // Insert payment record
    await supabase.from('payments').insert({
      invoice_no: Number(invoice_no),
      amount: Number(amount),
      payment_mode: 'offline',
      ref_no: Number(ref_no),
      payment_date: new Date().toISOString(),
      code: null,
    });

    // Update order status to Paid
    await supabase.from('orders').update({ order_status: 'Paid' }).eq('invoice_no', invoice_no);
    await supabase.from('pending_orders').update({ order_status: 'Paid' }).eq('invoice_no', invoice_no);

    alert('Your payment confirmation has been submitted!');
    setIsPending(false);
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Confirm Offline Payment</h2>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>Invoice NO:<Input {...form.register('invoice_no')} placeholder="Invoice Number" disabled /></div>
        <div>Exact Amount:<Input {...form.register('amount')} placeholder="Amount Paid" type="number" /></div>
        <div>Transaction Reference NO:<Input {...form.register('ref_no')} placeholder="Bank Transaction Ref No." /></div>

        <Controller
          control={form.control}
          name="bank"
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Bank" />
              </SelectTrigger>
              <SelectContent>
              {banks.map((b) => (
                <SelectItem key={b.bank_name} value={b.bank_name}>
                  {b.bank_name}
                </SelectItem>
              ))}
              </SelectContent>
            </Select>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
          {isPending ? 'Submiting...' : 'Submit Confirmation'}
        </Button>
      </form>
    </div>
  );
}
