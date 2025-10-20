import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Coins, CreditCard, Smartphone, Wallet } from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';

const TOKEN_PACKAGES = [
  { amount: 100, price: 9.99, popular: false },
  { amount: 500, price: 39.99, popular: true },
  { amount: 1000, price: 69.99, popular: false },
  { amount: 2500, price: 149.99, popular: false },
];

const PAYMENT_METHODS = [
  { id: 'card', name: 'Credit Card', icon: CreditCard },
  { id: 'mobile', name: 'Mobile Payment', icon: Smartphone },
  { id: 'wallet', name: 'Digital Wallet', icon: Wallet },
];

export const TokenPurchaseDialog = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(TOKEN_PACKAGES[1]);
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS[0]);
  const [processing, setProcessing] = useState(false);
  const { purchaseTokens } = useTokens();

  const handlePurchase = async () => {
    setProcessing(true);
    const success = await purchaseTokens(selectedPackage.amount, selectedPayment.name);
    setProcessing(false);
    
    if (success) {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Coins className="h-6 w-6 text-primary" />
            Purchase Tokens
          </DialogTitle>
          <DialogDescription>
            Choose a token package and payment method (Demo Mode - No real payment)
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 py-4">
          {/* Token Packages */}
          <div>
            <h3 className="font-semibold mb-4">Select Package</h3>
            <div className="space-y-3">
              {TOKEN_PACKAGES.map((pkg) => (
                <Card
                  key={pkg.amount}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedPackage.amount === pkg.amount
                      ? 'border-primary ring-2 ring-primary'
                      : 'hover:border-primary/50'
                  } ${pkg.popular ? 'bg-primary/5' : ''}`}
                  onClick={() => setSelectedPackage(pkg)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <Coins className="h-5 w-5 text-primary" />
                        <span className="font-bold text-lg">{pkg.amount} Tokens</span>
                      </div>
                      {pkg.popular && (
                        <span className="text-xs text-primary font-medium">Most Popular</span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xl">${pkg.price}</div>
                      <div className="text-xs text-muted-foreground">
                        ${(pkg.price / pkg.amount).toFixed(3)}/token
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="font-semibold mb-4">Payment Method</h3>
            <div className="space-y-3 mb-6">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                return (
                  <Card
                    key={method.id}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedPayment.id === method.id
                        ? 'border-primary ring-2 ring-primary'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedPayment(method)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-primary" />
                      <span className="font-medium">{method.name}</span>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Summary */}
            <Card className="p-4 bg-muted">
              <h4 className="font-semibold mb-3">Order Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Tokens:</span>
                  <span className="font-medium">{selectedPackage.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment:</span>
                  <span className="font-medium">{selectedPayment.name}</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between text-base font-bold">
                  <span>Total:</span>
                  <span>${selectedPackage.price}</span>
                </div>
              </div>
            </Card>

            <Button
              className="w-full mt-4"
              size="lg"
              onClick={handlePurchase}
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Complete Purchase (Demo)'}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              This is a demo. No real payment will be processed.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
